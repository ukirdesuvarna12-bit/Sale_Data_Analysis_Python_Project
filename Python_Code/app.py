from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Project main folder
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "Dataset" / "sales_data.xlsx"

print("Project folder:", BASE_DIR)
print("Excel file:", DATA_FILE)
print("Excel exists:", DATA_FILE.exists())

# Load dataset
df = pd.read_excel(DATA_FILE)

# Convert date
df["Order_Date"] = pd.to_datetime(df["Order_Date"])

print("Minimum Order Date:", df["Order_Date"].min())
print("Maximum Order Date:", df["Order_Date"].max())


@app.route("/")
def home():
    return "Sales Analytics API is running successfully!"


@app.route("/api/dashboard")
def dashboard():

    # -------------------------
    # KPI CALCULATIONS
    # -------------------------

    total_sales = df["Sales"].sum()

    total_profit = df["Profit"].sum()

    total_orders = df["Order_ID"].nunique()

    total_quantity = df["Quantity"].sum()

    average_order_value = (
        total_sales / total_orders
        if total_orders > 0 else 0
    )

    profit_margin = (
        (total_profit / total_sales) * 100
        if total_sales > 0 else 0
    )

    # -------------------------
    # MONTHLY SALES
    # -------------------------

    monthly_sales = (
        df.groupby(df["Order_Date"].dt.to_period("M"))["Sales"]
        .sum()
        .reset_index()
    )

    monthly_sales["Order_Date"] = (
        monthly_sales["Order_Date"].astype(str)
    )

    # -------------------------
    # CATEGORY SALES
    # -------------------------

    category_sales = (
        df.groupby("Category")["Sales"]
        .sum()
        .reset_index()
    )

    # -------------------------
    # CATEGORY PROFIT
    # -------------------------

    category_profit = (
        df.groupby("Category")["Profit"]
        .sum()
        .reset_index()
    )

    # -------------------------
    # REGION SALES
    # -------------------------

    region_sales = (
        df.groupby("Region")["Sales"]
        .sum()
        .reset_index()
    )

    # -------------------------
    # TOP 5 PRODUCTS
    # -------------------------

    top_products = (
        df.groupby("Product")["Sales"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
    )

    # -------------------------
    # TOP 5 CUSTOMERS
    # -------------------------

    top_customers = (
        df.groupby("Customer_Name")["Sales"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
    )

    # -------------------------
    # SEND DATA TO DASHBOARD
    # -------------------------

    return jsonify({

        "kpis": {
            "total_sales": round(float(total_sales), 2),
            "total_profit": round(float(total_profit), 2),
            "total_orders": int(total_orders),
            "total_quantity": int(total_quantity),
            "average_order_value": round(float(average_order_value), 2),
            "profit_margin": round(float(profit_margin), 2)
        },

        "monthly_sales":
            monthly_sales.to_dict(orient="records"),

        "category_sales":
            category_sales.to_dict(orient="records"),

        "category_profit":
            category_profit.to_dict(orient="records"),

        "region_sales":
            region_sales.to_dict(orient="records"),

        "top_products":
            top_products.to_dict(orient="records"),

        "top_customers":
            top_customers.to_dict(orient="records")
    })


if __name__ == "__main__":
    app.run(debug=True)