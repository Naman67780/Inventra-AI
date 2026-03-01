import { useMemo } from 'react';
import {
  DollarSign, ShoppingCart, Package, TrendingUp, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import KPICard from '@/components/KPICard';
import ForecastChart from '@/components/ForecastChart';
import {
  getSalesRecords, getProductNames, getSalesTimeSeries,
  getTotalRevenue, getTotalUnitsSold, getRecentRecords,
} from '@/services/dataStore';
import { generateForecast } from '@/services/forecasting';

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 72%, 51%)',
];

export default function DashboardPage() {
  const productNames = useMemo(() => getProductNames(), []);
  const totalRevenue = useMemo(() => getTotalRevenue(), []);
  const totalUnits = useMemo(() => getTotalUnitsSold(), []);
  const recentRecords = useMemo(() => getRecentRecords(10), []);

  // Product breakdown for pie chart
  const productBreakdown = useMemo(() => {
    const records = getSalesRecords();
    const byProduct = new Map<string, number>();
    for (const r of records) {
      byProduct.set(r.product, (byProduct.get(r.product) || 0) + r.quantity);
    }
    return Array.from(byProduct.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  // Weekly sales trend
  const weeklyTrend = useMemo(() => {
    const records = getSalesRecords();
    const byWeek = new Map<string, number>();
    for (const r of records) {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      byWeek.set(key, (byWeek.get(key) || 0) + r.quantity);
    }
    return Array.from(byWeek.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, units]) => ({ week: week.slice(5), units }));
  }, []);

  // Top product forecast
  const topProductForecast = useMemo(() => {
    if (productNames.length === 0) return [];
    const ts = getSalesTimeSeries(productNames[0]);
    return generateForecast(ts, 14);
  }, [productNames]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered inventory intelligence overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          change={8.2}
          icon={<DollarSign className="w-4 h-4" />}
          delay={1}
        />
        <KPICard
          title="Units Sold"
          value={totalUnits.toLocaleString()}
          change={5.4}
          icon={<ShoppingCart className="w-4 h-4" />}
          delay={2}
        />
        <KPICard
          title="Products Tracked"
          value={productNames.length}
          icon={<Package className="w-4 h-4" />}
          delay={3}
        />
        <KPICard
          title="Forecast Accuracy"
          value="87%"
          change={2.1}
          icon={<TrendingUp className="w-4 h-4" />}
          delay={4}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ForecastChart
            data={topProductForecast}
            title={`${productNames[0] || 'Product'} — Demand Forecast`}
          />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sales by Product</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={productBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {productBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {productBreakdown.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly trend */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="units" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent activity */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Sales Activity</h3>
        <div className="space-y-2">
          {recentRecords.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-foreground font-medium">{r.product}</span>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-foreground">{r.quantity} units</span>
                {r.unitPrice && (
                  <span className="text-xs font-mono text-muted-foreground">
                    ${(r.quantity * r.unitPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
