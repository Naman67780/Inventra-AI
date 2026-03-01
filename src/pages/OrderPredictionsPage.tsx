import { useMemo, useState } from 'react';
import {
  getProductNames,
  getSalesTimeSeries,
  getProduct,
  getMonthlySalesByProduct,
  getTotalSalesByProduct,
} from '@/services/dataStore';
import { generateForecast, detectTrend } from '@/services/forecasting';
import {
  generateRecommendation,
  InventoryRecommendation,
} from '@/services/inventoryOptimizer';
import PredictedStockTable from '@/components/PredictedStockTable';
import ProductSalesTrendsChart from '@/components/ProductSalesTrendsChart';
import ForecastChart from '@/components/ForecastChart';
import { AlertCircle, AlertTriangle, CheckCircle2, Package, TrendingUp } from 'lucide-react';

/** Transform monthly data into chart-ready format */
function monthlyToChartData(
  monthlyByProduct: Map<string, { month: string; product: string; quantity: number }[]>,
  products: string[]
): { month: string; [key: string]: string | number }[] {
  const monthSet = new Set<string>();
  monthlyByProduct.forEach(arr => arr.forEach(p => monthSet.add(p.month)));
  const months = Array.from(monthSet).sort();

  return months.map(month => {
    const row: { month: string; [key: string]: string | number } = { month };
    for (const p of products) {
      const arr = monthlyByProduct.get(p) || [];
      const point = arr.find(x => x.month === month);
      row[p] = point ? point.quantity : 0;
    }
    return row;
  });
}

export default function OrderPredictionsPage() {
  const productNames = useMemo(() => getProductNames(), []);
  const [selectedProduct, setSelectedProduct] = useState(productNames[0] || '');
  const forecastDays = 14;

  const { recommendations, totalSalesByProduct, mostSoldProduct } = useMemo(() => {
    const salesByProduct = getTotalSalesByProduct();
    const totalSalesMap = new Map(salesByProduct.map(s => [s.product, s.totalSales]));
    const topSeller = salesByProduct[0]?.product;

    const recs = productNames.map(name => {
      const ts = getSalesTimeSeries(name);
      const values = ts.map(t => t.value);
      const forecast = generateForecast(ts, forecastDays);
      const forecastedValues = forecast
        .filter(f => f.actual === undefined)
        .map(f => f.forecast);
      const product = getProduct(name);

      return generateRecommendation(
        name,
        values,
        forecastedValues,
        product?.currentStock || 0,
        product?.leadTimeDays || 3
      );
    }).sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, normal: 2, overstocked: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return {
      recommendations: recs,
      totalSalesByProduct: totalSalesMap,
      mostSoldProduct: topSeller,
    };
  }, [productNames]);

  const monthlyByProduct = useMemo(() => getMonthlySalesByProduct(), []);
  const chartData = useMemo(
    () => monthlyToChartData(monthlyByProduct, productNames),
    [monthlyByProduct, productNames]
  );

  const timeSeries = useMemo(
    () => getSalesTimeSeries(selectedProduct),
    [selectedProduct]
  );
  const forecast = useMemo(
    () => generateForecast(timeSeries, forecastDays),
    [timeSeries, forecastDays]
  );
  const trend = useMemo(
    () => detectTrend(timeSeries.map(t => t.value)),
    [timeSeries]
  );

  const critical = recommendations.filter(r => r.urgency === 'critical').length;
  const warning = recommendations.filter(r => r.urgency === 'warning').length;
  const normal = recommendations.filter(r => r.urgency === 'normal').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order Predictions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predicted order quantities from your sales data. Upload CSV for accurate predictions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">{critical}</p>
            <p className="text-[11px] text-muted-foreground">Critical</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">{warning}</p>
            <p className="text-[11px] text-muted-foreground">Low Stock</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">{normal}</p>
            <p className="text-[11px] text-muted-foreground">Normal</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-mono">{recommendations.length}</p>
            <p className="text-[11px] text-muted-foreground">Products</p>
          </div>
        </div>
      </div>

      {/* Product sales trends graph */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Product Sales Trends (Monthly)</h2>
        </div>
        <ProductSalesTrendsChart
          data={chartData}
          products={productNames}
          title=""
        />
      </div>

      {/* Predicted stock — clear spreadsheet view */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Predicted Stock — Product · Past Months Sales · Order for Future
        </h2>
        <PredictedStockTable
          recommendations={recommendations}
          monthlyByProduct={monthlyByProduct}
          totalSalesByProduct={totalSalesByProduct}
          mostSoldProduct={mostSoldProduct}
        />
      </div>

      {/* Per-product forecast chart */}
      {productNames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Demand Forecast by Product</h2>
          <div className="glass-card p-4 flex flex-wrap items-center gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Select Product</label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm"
              >
                {productNames.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className="text-sm font-bold text-foreground capitalize flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    trend.direction === 'up'
                      ? 'stat-up'
                      : trend.direction === 'down'
                      ? 'stat-down'
                      : 'text-muted-foreground'
                  }`}
                />
                {trend.direction} ({(trend.strength * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
          <ForecastChart
            data={forecast}
            title={`${selectedProduct} — ${forecastDays}-Day Forecast`}
          />
        </div>
      )}
    </div>
  );
}
