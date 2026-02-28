import numpy as np

def calculate_safety_stock(max_daily_sales, max_lead_time, avg_daily_sales, avg_lead_time):
    """
    Standard Safety Stock formula = (Max Daily Sales * Max Lead Time) - (Avg Daily Sales * Avg Lead Time)
    """
    return max(0, (max_daily_sales * max_lead_time) - (avg_daily_sales * avg_lead_time))

def calculate_reorder_point(avg_daily_sales, avg_lead_time, safety_stock):
    """
    Reorder Point = (Avg Daily Sales * Lead Time) + Safety Stock
    """
    return (avg_daily_sales * avg_lead_time) + safety_stock

def get_restocking_recommendation(current_stock, avg_daily_sales, safety_stock, reorder_point):
    """
    Returns a status string and urgency level based on current stock vs. thresholds.
    """
    # Defensive checks
    if avg_daily_sales <= 0:
        return {
            "status": "Overstocked" if current_stock > 0 else "Out of Stock",
            "urgency": 1 if current_stock > 0 else 5,
            "days_remaining": 999 if current_stock > 0 else 0
        }
        
    days_remaining = current_stock / avg_daily_sales
    
    if current_stock <= 0:
        return {"status": "Critical", "urgency": 5, "days_remaining": 0}
    elif current_stock <= safety_stock:
        return {"status": "Critical", "urgency": 4, "days_remaining": round(days_remaining, 1)}
    elif current_stock <= reorder_point:
        return {"status": "Warning", "urgency": 3, "days_remaining": round(days_remaining, 1)}
    elif current_stock > reorder_point * 2:
        return {"status": "Overstocked", "urgency": 1, "days_remaining": round(days_remaining, 1)}
    else:
        return {"status": "Healthy", "urgency": 2, "days_remaining": round(days_remaining, 1)}
