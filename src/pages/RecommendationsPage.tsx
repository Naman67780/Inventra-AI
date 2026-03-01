import { useMemo } from 'react';
import PredictedStockTable from '@/components/PredictedStockTable';
import {
  getProductNames,
  getSalesTimeSeries,
  getProduct,
  getTotalSalesByProduct,
  getMonthlySalesByProduct,
} from '@/services/dataStore';
import { generateForecast } from '@/services/forecasting';
import { generateRecommendation, InventoryRecommendation } from '@/services/inventoryOptimizer';
import { AlertCircle, AlertTriangle, CheckCircle2, Package, Trophy } from 'lucide-react';

export default function RecommendationsPage() {
  const monthlyByProduct = useMemo(() => getMonthlySalesByProduct(), []);
  const { recommendations, totalSalesByProduct, mostSoldProduct } = useMemo(() => {
    const productNames = getProductNames();
    const salesByProduct = getTotalSalesByProduct();
    const totalSalesMap = new Map(salesByProduct.map(s => [s.product, s.totalSales]));
    const topSeller = salesByProduct[0]?.product;

    const recs = productNames
      .map(name => {
        const ts = getSalesTimeSeries(name);
        const values = ts.map(t => t.value);
        const forecast = generateForecast(ts, 14);
        const forecastedValues = forecast.filter(f => f.actual === undefined).map(f => f.forecast);
        const product = getProduct(name);

        return generateRecommendation(
          name,
          values,
          forecastedValues,
          product?.currentStock || 0,
          product?.leadTimeDays || 3
        );
      })
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, normal: 2, overstocked: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });

    return {
      recommendations: recs,
      totalSalesByProduct: totalSalesMap,
      mostSoldProduct: topSeller,
    };
  }, []);

  const critical = recommendations.filter(r => r.urgency === 'critical').length;
  const warning = recommendations.filter(r => r.urgency === 'warning').length;
  const normal = recommendations.filter(r => r.urgency === 'normal').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order suggestions based on your past months&apos; sales data — EOQ, safety stock, and demand forecasts
        </p>
      </div>

      {/* Top seller card */}
      {mostSoldProduct && (
        <div className="glass-card p-4 flex items-center gap-3 border-amber-500/20 border">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Most sold product</p>
            <p className="text-lg font-bold text-foreground">{mostSoldProduct}</p>
            <p className="text-xs text-muted-foreground">
              {totalSalesByProduct?.get(mostSoldProduct)?.toLocaleString()} units sold in recorded period
            </p>
          </div>
        </div>
      )}

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
            <p className="text-[11px] text-muted-foreground">Total Products</p>
          </div>
        </div>
      </div>

      {/* Predicted Sales Report */}
      <div className="glass-card p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Predicted Sales Report</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Based on recent data, here is the product performance and its forecasted demand.
        </p>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map(rec => (
            <div key={rec.productName} className="flex justify-between items-center bg-muted/20 p-3 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{rec.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Status:
                  <span className={`ml-1 ${rec.urgency === 'critical' ? 'text-destructive font-bold' : rec.urgency === 'warning' ? 'text-warning font-bold' : 'text-success'}`}>
                    {rec.urgency.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  Forecast: {rec.forecastedDemand.toLocaleString()} units
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended Order: <span className="font-bold">{rec.recommendedOrder.toLocaleString()}</span> units
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predicted stock — clear spreadsheet view */}
      <div className="pt-2">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Predicted Stock — Product · Past Months Sales · Future Stock Quantity
        </h2>
        <PredictedStockTable
          recommendations={recommendations}
          monthlyByProduct={monthlyByProduct}
          totalSalesByProduct={totalSalesByProduct}
          mostSoldProduct={mostSoldProduct}
        />
      </div>

      {/* Legend */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Optimization Formulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground text-sm mb-1">EOQ (Wilson Formula)</p>
            <p className="font-mono text-primary">√(2DS / H)</p>
            <p className="mt-1">D = annual demand, S = ordering cost, H = holding cost per unit</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Safety Stock</p>
            <p className="font-mono text-primary">Z × σ × √(LT)</p>
            <p className="mt-1">Z = service level z-score (95%), σ = demand std dev, LT = lead time</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Reorder Point</p>
            <p className="font-mono text-primary">(D̄ × LT) + SS</p>
            <p className="mt-1">D̄ = avg daily demand, LT = lead time days, SS = safety stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
