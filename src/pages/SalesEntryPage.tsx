import { useState } from 'react';
import { PenLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addSalesRecord, getProductNames, getRecentRecords } from '@/services/dataStore';
import { toast } from 'sonner';

export default function SalesEntryPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const productNames = getProductNames();
  const recentRecords = getRecentRecords(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !quantity) {
      toast.error('Product and quantity are required');
      return;
    }
    addSalesRecord({
      date,
      product: product.trim(),
      quantity: parseInt(quantity, 10),
      unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
      source: 'manual',
    });
    toast.success(`Added ${quantity} units of ${product}`);
    setProduct('');
    setQuantity('');
    setUnitPrice('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manual Sales Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">Record individual sales transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry form */}
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-5">
            <PenLine className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">New Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="mt-1 bg-secondary border-border"
              />
            </div>

            <div>
              <Label htmlFor="product" className="text-xs text-muted-foreground">Product Name</Label>
              <Input
                id="product"
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="e.g., Widget A"
                list="product-suggestions"
                className="mt-1 bg-secondary border-border"
              />
              <datalist id="product-suggestions">
                {productNames.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qty" className="text-xs text-muted-foreground">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0"
                  className="mt-1 bg-secondary border-border font-mono"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-xs text-muted-foreground">Unit Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 bg-secondary border-border font-mono"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Sales Record
            </Button>
          </form>
        </div>

        {/* Recent entries */}
        <div className="glass-card p-6 animate-fade-in-up-delay-1">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Entries</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {recentRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.product}</p>
                  <p className="text-[11px] text-muted-foreground">{r.date} · {r.source}</p>
                </div>
                <span className="font-mono text-sm text-foreground">{r.quantity} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
