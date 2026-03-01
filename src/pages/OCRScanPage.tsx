import { ScanLine, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OCRScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">OCR Sales Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Extract sales data from handwritten registers using image recognition
        </p>
      </div>

      <div className="glass-card p-12 text-center border-2 border-dashed border-border">
        <ScanLine className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-slow" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Scan Sales Register</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Upload a photo of your handwritten sales register. Our OCR engine will extract product names,
          quantities, and dates automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.click();
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.click();
            }}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">How OCR Scanning Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Capture', desc: 'Take a photo or upload an image of your handwritten sales register' },
            { step: '2', title: 'Extract', desc: 'AI-powered OCR identifies product names, quantities, dates and prices' },
            { step: '3', title: 'Verify & Save', desc: 'Review extracted data, make corrections, and save to your database' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning">
            <strong>Note:</strong> OCR processing requires a backend service (Lovable Cloud Edge Function with Tesseract).
            Enable Lovable Cloud to activate this feature.
          </p>
        </div>
      </div>
    </div>
  );
}
