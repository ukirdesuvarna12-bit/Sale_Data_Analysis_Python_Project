import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, RotateCcw } from 'lucide-react';

interface EmptyDatasetStateProps {
  onFileUpload: (file: File) => void;
  onRestoreOriginal: () => void;
}

export const EmptyDatasetState: React.FC<EmptyDatasetStateProps> = ({
  onFileUpload,
  onRestoreOriginal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const requiredFields = [
    'Order_ID',
    'Order_Date',
    'Customer_Name',
    'Category',
    'Product',
    'Region',
    'Quantity',
    'Sales',
    'Profit',
  ];

  return (
    <div className="max-w-3xl mx-auto my-8">
      <div className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 sm:p-12 text-center transition-all shadow-xs">
        {/* Upload Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-500/10">
          <Upload className="w-8 h-8 stroke-[2]" />
        </div>

        {/* Clear Title & Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
          Upload Sales Data
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
          The dashboard is disconnected from sample data and requires your actual sales dataset.
          Upload your Excel (<code className="text-blue-700 font-mono">.xlsx</code>) or CSV file to dynamically calculate all KPIs and populate charts.
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileUpload(e.target.files[0]);
              e.target.value = '';
            }
          }}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/25 transition-all active:scale-98 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Select Excel / CSV File</span>
          </button>

          <button
            onClick={onRestoreOriginal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Load Default sales_data.xlsx</span>
          </button>
        </div>

        {/* Drag and Drop notice */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mt-6 py-4 px-6 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 max-w-md mx-auto"
        >
          <span>Or drag and drop your <span className="font-semibold text-slate-700">sales_data.xlsx</span> file directly into this box</span>
        </div>

        {/* Required Fields Schema Box */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Required Dataset Columns
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Dynamic schema validation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {requiredFields.map((field) => (
              <div
                key={field}
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-700 flex items-center justify-between"
              >
                <span>{field}</span>
                <span className="text-[9px] text-slate-400 font-sans font-medium">required</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
