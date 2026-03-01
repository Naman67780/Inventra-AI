import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export interface MonthlySalesPoint {
  month: string;
  product: string;
  quantity: number;
}

interface ProductSalesTrendsChartProps {
  data: { month: string;[product: string]: string | number }[];
  products: string[];
  title?: string;
}

/** Format month for display (e.g. "2024-01" -> "Jan 2024") */
function formatMonth(monthStr: string): string {
  const [y, m] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m || '1', 10) - 1]} ${y}`;
}

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 67%, 55%)',
  'hsl(0, 72%, 51%)',
  'hsl(180, 70%, 45%)',
];

export default function ProductSalesTrendsChart({ data, products, title }: ProductSalesTrendsChartProps) {
  if (!data.length || !products.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-80">
        <p className="text-muted-foreground text-sm">Upload CSV data to see product sales trends</p>
      </div>
    );
  }

  const chartData = data.map(row => ({
    ...row,
    monthLabel: formatMonth(row.month),
  }));

  return (
    <div className="glass-card p-6">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelFormatter={(v) => v}
            formatter={(value: number) => [value ?? 0, 'Units']}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {products.slice(0, 6).map((product, i) => (
            <Line
              key={product}
              type="monotone"
              dataKey={product}
              name={product}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
