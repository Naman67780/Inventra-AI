// Robust CSV parser for accurate sales data processing

export interface ParsedSalesRow {
  date: string;
  product: string;
  quantity: number;
  unitPrice?: number;
}

/** Parse a single CSV row handling quoted fields with commas */
function parseCSVRow(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += char;
    } else if (char === delimiter) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/** Detect delimiter from first line */
function detectDelimiter(firstLine: string): string {
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  return ',';
}

/** Normalize various date formats to YYYY-MM-DD */
export function normalizeDate(dateStr: string): string | null {
  const s = dateStr.trim();
  if (!s) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }

  // MM/DD/YYYY or M/D/YYYY
  const usMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    const parsed = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const euMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (euMatch) {
    const [, d, m, y] = euMatch;
    const parsed = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  }

  // YYYY/MM/DD
  const isoMatch = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const parsed = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  }

  // Try Date constructor as fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

/** Flexible column index finder */
function findColumnIndex(headers: string[], ...patterns: string[]): number {
  const lower = headers.map(h => h.toLowerCase().replace(/[_\s-]/g, ''));
  for (const p of patterns) {
    const idx = lower.findIndex(h => h.includes(p.replace(/[_\s-]/g, '')));
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseCSV(csvText: string): ParsedSalesRow[] {
  const lines = csvText
    .trim()
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCSVRow(lines[0], delimiter);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());

  const dateIdx = findColumnIndex(headers, 'date', 'datum', 'salesdate', 'orderdate', 'transactiondate');
  const productIdx = findColumnIndex(
    headers,
    'product',
    'item',
    'name',
    'productname',
    'itemname',
    'sku',
    'description',
    'productname',
    'product_name',
    'item_name'
  );
  const qtyIdx = findColumnIndex(
    headers,
    'quantity',
    'qty',
    'units',
    'sold',
    'amount',
    'count',
    'quantitysold',
    'units_sold'
  );
  const priceIdx = findColumnIndex(
    headers,
    'price',
    'unitprice',
    'unit_price',
    'amount',
    'revenue'
  );

  if (dateIdx === -1 || qtyIdx === -1) {
    throw new Error(
      'CSV must contain at least "date" and "quantity" columns. Detected: ' + headers.join(', ')
    );
  }

  const aggregated = new Map<string, { date: string; product: string; quantity: number; unitPrice?: number }>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVRow(lines[i], delimiter);
    if (cols.length < Math.max(dateIdx, qtyIdx) + 1) continue;

    const rawQty = cols[qtyIdx]?.replace(/[,"\s]/g, '') || '0';
    const qty = parseFloat(rawQty);
    if (isNaN(qty) || qty < 0) continue;

    const normalizedDate = normalizeDate(cols[dateIdx] || '');
    if (!normalizedDate) continue;

    const product = (productIdx >= 0 ? cols[productIdx]?.replace(/^"|"$/g, '').trim() : null) || 'Unknown Product';
    const unitPrice =
      priceIdx >= 0
        ? parseFloat(String(cols[priceIdx] || '').replace(/[,$\s]/g, '')) || undefined
        : undefined;

    const key = `${normalizedDate}-${product}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.quantity += qty;
    } else {
      aggregated.set(key, {
        date: normalizedDate,
        product: product || 'Unknown Product',
        quantity: Math.round(qty * 100) / 100,
        unitPrice: unitPrice !== undefined ? Math.round(unitPrice * 100) / 100 : undefined,
      });
    }
  }

  return Array.from(aggregated.values())
    .map(r => ({ ...r, quantity: Math.round(r.quantity * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function generateSampleCSV(): string {
  const products = ['Widget A', 'Widget B', 'Gadget X'];
  const lines = ['date,product,quantity,unit_price'];
  const today = new Date();

  for (let d = 90; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    for (const product of products) {
      const base = product === 'Widget A' ? 25 : product === 'Widget B' ? 15 : 8;
      const seasonal = Math.sin((d / 7) * Math.PI) * 5;
      const noise = (Math.random() - 0.5) * 8;
      const trend = product === 'Gadget X' ? d * -0.05 : 0;
      const qty = Math.max(0, Math.round(base + seasonal + noise + trend));
      const price = product === 'Widget A' ? 12.99 : product === 'Widget B' ? 24.5 : 8.75;
      lines.push(`${dateStr},${product},${qty},${price}`);
    }
  }

  return lines.join('\n');
}
