import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

def generate_mock_sales_data(filepath='sales_data.csv', num_skus=50, days=180):
    start_date = datetime.now() - timedelta(days=days)
    dates = [start_date + timedelta(days=i) for i in range(days)]
    
    categories = ['Electronics', 'Home & Garden', 'Apparel', 'Sports & Outdoors']
    
    skus = []
    for i in range(num_skus):
        cat = random.choice(categories)
        sku_name = f"{cat[:3].upper()}-SKU-{1000+i}"
        
        # Base daily sales amount varies by sku
        base_sales = random.randint(1, 40)
        
        # Trend
        trend = np.linspace(1, random.uniform(0.5, 2.0), days)
        
        # Seasonality (weekly)
        seasonality = np.sin(np.linspace(0, days * 2 * np.pi / 7, days)) * random.uniform(0.1, 0.5) * base_sales
        
        for j, d in enumerate(dates):
            # Noise
            noise = random.randint(-int(base_sales*0.2), int(base_sales*0.2))
            
            sales_val = max(0, int(base_sales * trend[j] + seasonality[j] + noise))
            
            # 10% chance of zero sales to make it realistic
            if random.random() < 0.1:
                sales_val = 0
                
            skus.append({
                'Date': d.strftime('%Y-%m-%d'),
                'SKU': sku_name,
                'Category': cat,
                'Sales': sales_val
            })
            
    df = pd.DataFrame(skus)
    df.to_csv(filepath, index=False)
    print(f"Generated {len(df)} rows of data across {num_skus} SKUs in {filepath}")

if __name__ == '__main__':
    generate_mock_sales_data()
