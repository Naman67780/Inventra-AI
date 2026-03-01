import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { parseCSV, generateSampleCSV } from '@/services/csvParser';
import { addSalesRecords, replaceSalesRecords, resetData } from '@/services/dataStore';
import { toast } from 'sonner';

export default function CSVUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [preview, setPreview] = useState<{ date: string; product: string; quantity: number }[]>([]);
  const [replaceMode, setReplaceMode] = useState(true);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error('No valid data found in CSV');
          return;
        }
        const mapped = rows.map(r => ({
          date: r.date,
          product: r.product,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
          source: 'csv' as const,
        }));
        const records = replaceMode
          ? replaceSalesRecords(mapped)
          : addSalesRecords(mapped);
        setUploadedCount(records.length);
        setPreview(rows.slice(0, 10));
        toast.success(
          replaceMode
            ? `Replaced with ${records.length} records. Predictions now use your data.`
            : `Added ${records.length} records to existing data`
        );
        if (replaceMode && records.length > 0) {
          navigate('/predictions');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }, [replaceMode, navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sales_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CSV Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">Bulk import sales data from spreadsheets</p>
      </div>

      {/* Drop zone */}
      <div
        className={`glass-card p-12 text-center border-2 border-dashed transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) processFile(file);
          };
          input.click();
        }}
      >
        <Upload className="w-10 h-10 text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium">Drop your CSV file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2">
          Required: date, quantity. Optional: product/item/sku, price. Supports MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD.
        </p>
      </div>

      {/* Replace vs Add toggle */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="replace-mode" className="text-sm font-medium text-foreground">
            Use only CSV data for predictions
          </Label>
          <p className="text-xs text-muted-foreground">
            When on: replaces all data with CSV (recommended for accurate predictions). When off: adds to existing.
          </p>
        </div>
        <Switch
          id="replace-mode"
          checked={replaceMode}
          onCheckedChange={setReplaceMode}
        />
      </div>

      {/* Sample download & Reset Data */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleDownloadSample}>
            <Download className="w-4 h-4 mr-2" />
            Download Sample CSV
          </Button>
          {uploadedCount > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              {uploadedCount} records imported
            </span>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
              resetData();
              setUploadedCount(0);
              setPreview([]);
              toast.success('All data has been reset.');
            }
          }}
        >
          Reset All Data
        </Button>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Import Preview (first 10 rows)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground">Date</th>
                  <th className="text-left px-3 py-2 text-xs text-muted-foreground">Product</th>
                  <th className="text-right px-3 py-2 text-xs text-muted-foreground">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-3 py-2 font-mono text-foreground">{row.date}</td>
                    <td className="px-3 py-2 text-foreground">{row.product}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
