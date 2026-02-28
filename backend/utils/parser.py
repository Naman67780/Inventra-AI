import pandas as pd
import numpy as np
from datetime import timedelta
from models.forecasting import generate_forecast
from models.inventory import calculate_safety_stock, calculate_reorder_point, get_restocking_recommendation

def process_inventory_data(df):
    """
    Transforms a raw DataFrame of sales into the structured data format 
    expected by the React dashboard frontend.
    Handles grouping per SKU, forecasting, and calculating metrics.
    """
    # Assuming columns: Date (or similar), SKU (or Product), Sales (or Qty), Category
    # In a production app, we would map columns robustly.
    # For now, we take intuitive guesses at column names based on typical datasets.
    
    col_map = {c.lower(): c for c in df.columns}
    
    date_col = next((col_map[c] for c in col_map if 'date' in c), None)
    sku_col = next((col_map[c] for c in col_map if 'sku' in c or 'item' in c or 'product' in c), None)
    sales_col = next((col_map[c] for c in col_map if 'sales' in c or 'qty' in c or 'quantity' in c or 'amount' in c), None)
    category_col = next((col_map[c] for c in col_map if 'category' in c or 'group' in c), None)
    
    if not (date_col and sku_col and sales_col):
        raise ValueError("Could not auto-detect 'Date', 'SKU', or 'Sales' columns in CSV.")
        
    df[date_col] = pd.to_datetime(df[date_col])
    
    # 1. Total Dashboard Metrics
    total_skus = df[sku_col].nunique()
    
    # Analyze daily total sales for the main chart
    daily_sales = df.groupby(date_col)[sales_col].sum().sort_index()
    # Fill missing dates with 0
    full_date_range = pd.date_range(start=daily_sales.index.min(), end=daily_sales.index.max(), freq='D')
    daily_sales = daily_sales.reindex(full_date_range, fill_value=0)
    
    # Downsample to weekly for a cleaner dashboard chart if the dataset is large
    weekly_sales = daily_sales.resample('W').sum()
    
    # Generate Forecast for total sales (next 4 weeks/periods)
    forecast_vals, lower_vals, upper_vals = generate_forecast(weekly_sales, periods=4)
    
    chart_data = []
    
    # Populate historical chart data
    for date, val in weekly_sales.items():
        chart_data.append({
            "date": date.strftime('%b %d'),
            "historical": int(val),
            "forecast": None,
            "lower": None,
            "upper": None
        })
        
    # Connection point (last historical data point)
    last_date = weekly_sales.index[-1]
    chart_data[-1]["forecast"] = int(weekly_sales.iloc[-1])
    chart_data[-1]["lower"] = int(weekly_sales.iloc[-1])
    chart_data[-1]["upper"] = int(weekly_sales.iloc[-1])
    
    # Populate forecast chart data
    for i in range(len(forecast_vals)):
        future_date = last_date + timedelta(weeks=i+1)
        chart_data.append({
            "date": future_date.strftime('%b %d'),
            "historical": None,
            "forecast": int(forecast_vals[i]),
            "lower": int(lower_vals[i]),
            "upper": int(upper_vals[i])
        })
        
    # 2. SKU-Level Analytics
    sku_data = []
    projected_stockouts = 0
    
    # Assuming some random mock current stock since historical CSVs often lack "Current Stock" 
    # unless it's an inventory snapshot file.
    # Group by SKU
    skus = df.groupby(sku_col)
    
    for sku, group in skus:
        sku_sales = group.groupby(date_col)[sales_col].sum().sort_index()
        total_sales_history = sku_sales.sum()
        
        # Calculate daily averages
        days_active = (group[date_col].max() - group[date_col].min()).days or 1
        avg_daily = total_sales_history / days_active
        max_daily = sku_sales.max() if not sku_sales.empty else 0
        
        # Assume constant lead time of 7 days for calculation
        avg_lead = 7
        max_lead = 10
        
        safety_stock = calculate_safety_stock(max_daily, max_lead, avg_daily, avg_lead)
        reorder_point = calculate_reorder_point(avg_daily, avg_lead, safety_stock)
        
        # Mocking current stock based roughly around reorder point + random noise
        # This gives a good distribution of statuses for the UI demonstration
        mock_current_stock = max(0, int(reorder_point * np.random.uniform(0.1, 2.5)))
        
        sku_fc, _, _ = generate_forecast(sku_sales.resample('W').sum(), periods=4) # 4 weeks (~1 month)
        monthly_forecast_sum = int(np.sum(sku_fc))
        
        rec = get_restocking_recommendation(mock_current_stock, avg_daily, safety_stock, reorder_point)
        

        if rec["status"] == "Critical":
            projected_stockouts += 1
            
        category_val = "Uncategorized"
        if category_col:
            category_val = group[category_col].iloc[0]
            
        sku_data.append({
            "id": str(sku),
            "name": str(sku), # Using ID as name if there's no separate name column
            "category": str(category_val),
            "stock": mock_current_stock,
            "forecast": monthly_forecast_sum,
            "status": rec["status"],
            "urgency": rec["urgency"]
        })
        
    # Sort SKU data by urgency
    sku_data = sorted(sku_data, key=lambda x: x["urgency"], reverse=True)
    
    return {
        "metrics": {
            "total_skus": total_skus,
            "projected_stockouts": projected_stockouts,
            "forecast_accuracy": 92.4 # Placeholder metric
        },
        "chart_data": chart_data,
        "sku_data": sku_data[:100] # Return top 100 for performance
    }
