import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCw,
  Terminal,
  Server,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

interface ApiStatusPanelProps {
  apiUrl: string;
  error: string;
  onRetry: () => void;
  onUpdateApiUrl: (url: string) => void;
  isRetrying: boolean;
}

export const ApiStatusPanel: React.FC<ApiStatusPanelProps> = ({
  apiUrl,
  error,
  onRetry,
  onUpdateApiUrl,
  isRetrying,
}) => {
  const [customUrl, setCustomUrl] = useState(apiUrl);
  const [showFlaskCode, setShowFlaskCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onUpdateApiUrl(customUrl.trim());
    }
  };

  const flaskCodeSnippet = `from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Critical for browser frontend requests!

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    df = pd.read_excel('sales_data.xlsx')
    
    total_sales = float(df['Sales'].sum())
    total_profit = float(df['Profit'].sum())
    total_orders = len(df)
    total_quantity = int(df['Quantity'].sum())
    aov = total_sales / total_orders if total_orders > 0 else 0
    margin = (total_profit / total_sales) * 100 if total_sales > 0 else 0

    return jsonify({
        'kpis': {
            'total_sales': round(total_sales, 2),
            'total_profit': round(total_profit, 2),
            'total_orders': total_orders,
            'total_quantity': total_quantity,
            'average_order_value': round(aov, 2),
            'profit_margin': round(margin, 2)
        },
        'monthly_sales': [
            {'Order_Date': str(k)[:7], 'Sales': round(float(v), 2)}
            for k, v in df.groupby(df['Order_Date'].astype(str).str[:7])['Sales'].sum().items()
        ],
        'category_sales': [
            {'Category': str(k), 'Sales': round(float(v), 2)}
            for k, v in df.groupby('Category')['Sales'].sum().items()
        ],
        'category_profit': [
            {'Category': str(k), 'Profit': round(float(v), 2)}
            for k, v in df.groupby('Category')['Profit'].sum().items()
        ],
        'region_sales': [
            {'Region': str(k), 'Sales': round(float(v), 2)}
            for k, v in df.groupby('Region')['Sales'].sum().items()
        ],
        'top_products': [
            {'Product': str(k), 'Sales': round(float(v), 2)}
            for k, v in df.groupby('Product')['Sales'].sum().nlargest(5).items()
        ],
        'top_customers': [
            {'Customer_Name': str(k), 'Sales': round(float(v), 2)}
            for k, v in df.groupby('Customer_Name')['Sales'].sum().nlargest(5).items()
        ]
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(flaskCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto my-8">
      <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                Python Flask Backend Disconnected
              </h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                HTTP 5000
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              The dashboard is configured to fetch all KPIs and chart datasets from your Python Flask API, but the endpoint could not be reached.
            </p>

            {/* Error Detail Pill */}
            <div className="mt-3 p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg text-xs font-mono text-rose-900 break-all flex items-center justify-between gap-3">
              <span>{error}</span>
            </div>

            {/* Endpoint Config Form */}
            <form onSubmit={handleUrlSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Server className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="http://127.0.0.1:5000/api/dashboard"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isRetrying}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Connecting...' : 'Reconnect API'}</span>
              </button>
            </form>

            {/* Quick Diagnostic Steps */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Troubleshooting Checklist
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  Verify your Python Flask server is running at{' '}
                  <code className="text-blue-700 font-mono font-semibold">{apiUrl}</code>
                </li>
                <li>
                  Ensure <code className="font-mono text-slate-700">flask-cors</code> is installed and enabled:{' '}
                  <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">from flask_cors import CORS; CORS(app)</code>
                </li>
                <li>
                  If running in a cloud/HTTPS browser, mixed-content security may require running Flask locally or testing via proxy.
                </li>
              </ul>
            </div>

            {/* Toggle Flask Starter Code */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFlaskCode(!showFlaskCode)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>{showFlaskCode ? 'Hide Flask Backend Code' : 'View Flask Backend Reference Code (app.py)'}</span>
                {showFlaskCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFlaskCode && (
                <div className="mt-3 relative">
                  <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-3.5 py-1.5 rounded-t-lg text-[11px] font-mono">
                    <span>app.py (Flask API Server)</span>
                    <button
                      onClick={handleCopyCode}
                      className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="bg-[#0f172a] text-slate-200 p-4 rounded-b-lg text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                    {flaskCodeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
