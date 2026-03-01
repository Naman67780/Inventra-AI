// In-memory data store (replace with Lovable Cloud / Supabase for persistence)

import { TimeSeriesPoint } from './forecasting';

export interface SalesRecord {
  id: string;
  date: string;
  product: string;
  quantity: number;
  unitPrice?: number;
  source: 'manual' | 'csv' | 'ocr';
  createdAt: string;
}

export interface Product {
  name: string;
  currentStock: number;
  leadTimeDays: number;
}

let salesRecords: SalesRecord[] = [];
let products: Product[] = [];

// Generate demo data
function generateDemoData() {
  const productList: Product[] = [
    { name: 'Gadget X', currentStock: 8, leadTimeDays: 2 },
    { name: 'Component Y', currentStock: 280, leadTimeDays: 4 },
    { name: 'Part Z', currentStock: 55, leadTimeDays: 3 },
  ];

  const records: SalesRecord[] = [];
  const today = new Date();

  for (let d = 90; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    for (const product of productList) {
      const bases: Record<string, number> = {
        'Gadget X': 10,
        'Component Y': 5,
        'Part Z': 12,
      };
      const base = bases[product.name] || 10;
      const weekendDip = (dayOfWeek === 0 || dayOfWeek === 6) ? -3 : 0;
      const seasonal = Math.sin((d / 7) * Math.PI) * 4;
      const trend = product.name === 'Gadget X' ? (90 - d) * 0.08 : 0;
      const noise = (Math.random() - 0.5) * 6;
      const qty = Math.max(1, Math.round(base + weekendDip + seasonal + trend + noise));

      const prices: Record<string, number> = {
        'Gadget X': 8.75,
        'Component Y': 45.00,
        'Part Z': 15.25,
      };

      records.push({
        id: `demo-${d}-${product.name}`,
        date: dateStr,
        product: product.name,
        quantity: qty,
        unitPrice: prices[product.name],
        source: 'manual',
        createdAt: new Date(date).toISOString(),
      });
    }
  }

  salesRecords = records;
  products = productList;
}

generateDemoData();

export function resetData(): void {
  salesRecords = [];
  products = [];
}

export function getSalesRecords(): SalesRecord[] {
  return [...salesRecords];
}

export function addSalesRecord(record: Omit<SalesRecord, 'id' | 'createdAt'>): SalesRecord {
  const newRecord: SalesRecord = {
    ...record,
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  salesRecords.push(newRecord);
  return newRecord;
}

export function addSalesRecords(records: Omit<SalesRecord, 'id' | 'createdAt'>[]): SalesRecord[] {
  return records.map(r => addSalesRecord(r));
}

/** Replace all sales data (e.g. when loading from CSV for accurate predictions) */
export function replaceSalesRecords(records: Omit<SalesRecord, 'id' | 'createdAt'>[]): SalesRecord[] {
  const existingProducts = new Map(products.map(p => [p.name, p]));
  salesRecords = records.map((r, i) => ({
    ...r,
    id: `rec-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }));
  const productNames = Array.from(new Set(records.map(r => r.product))).sort();
  products = productNames.map(name => {
    const existing = existingProducts.get(name);
    return {
      name,
      currentStock: existing?.currentStock ?? 0,
      leadTimeDays: existing?.leadTimeDays ?? 3,
    };
  });
  return [...salesRecords];
}

/** Get monthly aggregated sales by product for trend analysis */
export function getMonthlySalesByProduct(): Map<string, { month: string; product: string; quantity: number }[]> {
  const byProduct = new Map<string, { month: string; product: string; quantity: number }[]>();
  for (const r of salesRecords) {
    const month = r.date.slice(0, 7);
    const key = r.product;
    if (!byProduct.has(key)) byProduct.set(key, []);
    const arr = byProduct.get(key)!;
    const existing = arr.find(x => x.month === month);
    if (existing) existing.quantity += r.quantity;
    else arr.push({ month, product: r.product, quantity: r.quantity });
  }
  for (const arr of byProduct.values()) {
    arr.sort((a, b) => a.month.localeCompare(b.month));
  }
  return byProduct;
}

export function getProducts(): Product[] {
  return [...products];
}

export function getProductNames(): string[] {
  const names = new Set(salesRecords.map(r => r.product));
  return Array.from(names).sort();
}

export function getSalesTimeSeries(productName: string): TimeSeriesPoint[] {
  const filtered = salesRecords
    .filter(r => r.product === productName)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate by date
  const byDate = new Map<string, number>();
  for (const r of filtered) {
    byDate.set(r.date, (byDate.get(r.date) || 0) + r.quantity);
  }

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

export function getProduct(name: string): Product | undefined {
  return products.find(p => p.name === name);
}

export function updateProductStock(name: string, stock: number) {
  const p = products.find(p => p.name === name);
  if (p) p.currentStock = stock;
  else products.push({ name, currentStock: stock, leadTimeDays: 3 });
}

export function getTotalRevenue(): number {
  return salesRecords.reduce((sum, r) => sum + r.quantity * (r.unitPrice || 0), 0);
}

export function getTotalUnitsSold(): number {
  return salesRecords.reduce((sum, r) => sum + r.quantity, 0);
}

export function getRecentRecords(limit: number = 20): SalesRecord[] {
  return [...salesRecords].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

/** Get total sales per product (all-time from given data), sorted by quantity desc */
export function getTotalSalesByProduct(): { product: string; totalSales: number }[] {
  const byProduct = new Map<string, number>();
  for (const r of salesRecords) {
    byProduct.set(r.product, (byProduct.get(r.product) || 0) + r.quantity);
  }
  return Array.from(byProduct.entries())
    .map(([product, totalSales]) => ({ product, totalSales }))
    .sort((a, b) => b.totalSales - a.totalSales);
}
