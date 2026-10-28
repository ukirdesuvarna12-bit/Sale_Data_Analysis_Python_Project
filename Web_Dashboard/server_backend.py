#!/usr/bin/env python3
"""
Python Backend Server listening on http://127.0.0.1:5000
Serving endpoint: http://127.0.0.1:5000/api/dashboard
Reads sales_data.xlsx and calculates all dashboard KPIs and aggregations dynamically.
Supports query parameters:
  startDate, endDate, category, region, product, customer
"""

import http.server
import socketserver
import json
import zipfile
import xml.etree.ElementTree as ET
import os
import urllib.parse
from collections import defaultdict

PORT = 5000
HOST = '0.0.0.0'
DATA_FILE = os.path.join(os.path.dirname(__file__), 'sales_data.xlsx')

def load_sales_data_from_xlsx():
    """Parses sales_data.xlsx using Python's standard library."""
    if not os.path.exists(DATA_FILE):
        return []

    try:
        with zipfile.ZipFile(DATA_FILE, 'r') as z:
            # 1. Read shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                ss_xml = z.read('xl/sharedStrings.xml')
                ss_root = ET.fromstring(ss_xml)
                for si in ss_root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    texts = [t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
                    shared_strings.append(''.join(texts))

            # 2. Read sheet1
            sheet_xml = z.read('xl/worksheets/sheet1.xml')
            sheet_root = ET.fromstring(sheet_xml)
            sheet_data = sheet_root.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')

            rows = []
            for row in sheet_data.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                cells = {}
                for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    r = c.get('r')
                    t = c.get('t')
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else None
                    col = ''.join([ch for ch in r if ch.isalpha()])
                    if t == 's' and val is not None:
                        val = shared_strings[int(val)]
                    cells[col] = val
                rows.append(cells)

        if not rows or len(rows) < 2:
            return []

        header = rows[0]
        col_to_name = {col: (val or '').strip() for col, val in header.items()}
        records = []
        for r in rows[1:]:
            rec = {}
            for col, val in r.items():
                name = col_to_name.get(col, col)
                rec[name] = val
            records.append(rec)

        return records
    except Exception as e:
        print(f"Error reading xlsx: {e}")
        return []

def calculate_dashboard_payload(params=None):
    if params is None:
        params = {}

    start_date = params.get('startDate', [''])[0]
    end_date = params.get('endDate', [''])[0]
    category = params.get('category', ['All'])[0]
    region = params.get('region', ['All'])[0]
    product = params.get('product', ['All'])[0]
    customer = params.get('customer', ['All'])[0]

    raw_records = load_sales_data_from_xlsx()
    if not raw_records:
        return {
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
            'top_customers': [],
            'records': []
        }

    # Normalize records & date
    normalized_records = []
    for r in raw_records:
        date_raw = str(r.get('Order_Date', ''))
        if date_raw.isdigit():
            import datetime
            dt = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=int(date_raw))
            formatted_date = dt.strftime('%Y-%m-%d')
        else:
            formatted_date = date_raw[:10] or '2025-01-01'

        normalized_records.append({
            'Order_ID': str(r.get('Order_ID', '')),
            'Order_Date': formatted_date,
            'Customer_Name': str(r.get('Customer_Name', 'Other')),
            'Category': str(r.get('Category', 'Other')),
            'Product': str(r.get('Product', 'Other')),
            'Region': str(r.get('Region', 'Other')),
            'Quantity': int(float(r.get('Quantity', 0) or 1)),
            'Sales': round(float(r.get('Sales', 0) or 0), 2),
            'Profit': round(float(r.get('Profit', 0) or 0), 2),
        })

    # Apply filters dynamically
    filtered_records = []
    for r in normalized_records:
        if start_date and r['Order_Date'] < start_date:
            continue
        if end_date and r['Order_Date'] > end_date:
            continue
        if category != 'All' and r['Category'] != category:
            continue
        if region != 'All' and r['Region'] != region:
            continue
        if product != 'All' and r['Product'] != product:
            continue
        if customer != 'All' and r['Customer_Name'] != customer:
            continue
        filtered_records.append(r)

    total_sales = 0.0
    total_profit = 0.0
    total_quantity = 0
    total_orders = len(filtered_records)

    monthly_map = defaultdict(float)
    cat_sales_map = defaultdict(float)
    cat_profit_map = defaultdict(float)
    reg_sales_map = defaultdict(float)
    prod_sales_map = defaultdict(float)
    cust_sales_map = defaultdict(float)

    for r in filtered_records:
        sales = r['Sales']
        profit = r['Profit']
        quantity = r['Quantity']
        month_key = r['Order_Date'][:7] or '2025-01'
        cat = r['Category']
        reg = r['Region']
        prod = r['Product']
        cust = r['Customer_Name']

        total_sales += sales
        total_profit += profit
        total_quantity += quantity

        monthly_map[month_key] += sales
        cat_sales_map[cat] += sales
        cat_profit_map[cat] += profit
        reg_sales_map[reg] += sales
        prod_sales_map[prod] += sales
        cust_sales_map[cust] += sales

    average_order_value = total_sales / total_orders if total_orders > 0 else 0
    profit_margin = (total_profit / total_sales) * 100 if total_sales > 0 else 0

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

    return {
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
        'top_customers': top_customers,
        'records': filtered_records
    }

class DashboardApiHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path.startswith('/api/dashboard') or parsed_url.path == '/':
            query_params = urllib.parse.parse_qs(parsed_url.query)
            payload = calculate_dashboard_payload(query_params)
            body = json.dumps(payload).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    print(f"Starting Python Backend on http://127.0.0.1:{PORT}/api/dashboard ...")
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), DashboardApiHandler) as httpd:
        print("Server running with dynamic filter support.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
