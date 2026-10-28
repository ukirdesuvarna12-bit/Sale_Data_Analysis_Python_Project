"""
Flask Backend for Sales Analytics Dashboard
Run locally with:
    pip install flask flask-cors pandas openpyxl
    python backend_app.py
Server will run at: http://127.0.0.1:5000
API Endpoint: http://127.0.0.1:5000/api/dashboard
"""

import os
import datetime
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) for dashboard frontend
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'sales_data.xlsx')

def load_sales_data():
    """Loads sales data from sales_data.xlsx or fallback structure."""
    if not os.path.exists(DATA_FILE):
        return []
    
    try:
        import pandas as pd
        df = pd.read_excel(DATA_FILE)
        # Format Order_Date to YYYY-MM
        if 'Order_Date' in df.columns:
            df['Order_Date'] = pd.to_datetime(df['Order_Date']).dt.strftime('%Y-%m-%d')
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading Excel with pandas: {e}")
        return []

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    records = load_sales_data()
    
    if not records:
        return jsonify({
            'kpis': {
                'total_sales': 0,
                'total_profit': 0,
                'total_orders': 0,
                'total_quantity': 0,
                'average_order_value': 0,
                'profit_margin': 0
            },
            'monthly_sales': [],
            'category_sales': [],
            'category_profit': [],
            'region_sales': [],
            'top_products': [],
            'top_customers': []
        })

    # Calculations
    total_sales = sum(float(r.get('Sales', 0)) for r in records)
    total_profit = sum(float(r.get('Profit', 0)) for r in records)
    total_orders = len(records)
    total_quantity = sum(int(r.get('Quantity', 0)) for r in records)
    average_order_value = total_sales / total_orders if total_orders > 0 else 0
    profit_margin = (total_profit / total_sales) * 100 if total_sales > 0 else 0

    # Monthly Sales aggregation
    monthly_map = {}
    cat_sales_map = {}
    cat_profit_map = {}
    reg_sales_map = {}
    prod_sales_map = {}
    cust_sales_map = {}

    for r in records:
        date_str = str(r.get('Order_Date', ''))[:7]  # YYYY-MM
        sales = float(r.get('Sales', 0))
        profit = float(r.get('Profit', 0))
        cat = str(r.get('Category', 'Other'))
        reg = str(r.get('Region', 'Other'))
        prod = str(r.get('Product', 'Other'))
        cust = str(r.get('Customer_Name', 'Other'))

        monthly_map[date_str] = monthly_map.get(date_str, 0) + sales
        cat_sales_map[cat] = cat_sales_map.get(cat, 0) + sales
        cat_profit_map[cat] = cat_profit_map.get(cat, 0) + profit
        reg_sales_map[reg] = reg_sales_map.get(reg, 0) + sales
        prod_sales_map[prod] = prod_sales_map.get(prod, 0) + sales
        cust_sales_map[cust] = cust_sales_map.get(cust, 0) + sales

    monthly_sales = [
        {'Order_Date': k, 'Sales': round(v, 2)}
        for k, v in sorted(monthly_map.items())
    ]

    category_sales = [
        {'Category': k, 'Sales': round(v, 2)}
        for k, v in sorted(cat_sales_map.items(), key=lambda x: -x[1])
    ]

    category_profit = [
        {'Category': k, 'Profit': round(v, 2)}
        for k, v in sorted(cat_profit_map.items(), key=lambda x: -x[1])
    ]

    region_sales = [
        {'Region': k, 'Sales': round(v, 2)}
        for k, v in sorted(reg_sales_map.items(), key=lambda x: -x[1])
    ]

    top_products = [
        {'Product': k, 'Sales': round(v, 2)}
        for k, v in sorted(prod_sales_map.items(), key=lambda x: -x[1])[:5]
    ]

    top_customers = [
        {'Customer_Name': k, 'Sales': round(v, 2)}
        for k, v in sorted(cust_sales_map.items(), key=lambda x: -x[1])[:5]
    ]

    return jsonify({
        'kpis': {
            'total_sales': round(total_sales, 2),
            'total_profit': round(total_profit, 2),
            'total_orders': total_orders,
            'total_quantity': total_quantity,
            'average_order_value': round(average_order_value, 2),
            'profit_margin': round(profit_margin, 2)
        },
        'monthly_sales': monthly_sales,
        'category_sales': category_sales,
        'category_profit': category_profit,
        'region_sales': region_sales,
        'top_products': top_products,
        'top_customers': top_customers
    })

if __name__ == '__main__':
    print("Starting Flask Backend at http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=True)
