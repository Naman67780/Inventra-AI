import { InventoryRecommendation } from '@/services/inventoryOptimizer';
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowDown, Trophy } from 'lucide-react';

interface RecommendationTableProps {
  recommendations: InventoryRecommendation[];
  totalSalesByProduct?: Map<string, number>;
  mostSoldProduct?: string;
}

const urgencyConfig = {
  critical: { icon: AlertCircle, className: 'text-destructive bg-destructive/10', label: 'Critical' },
  warning: { icon: AlertTriangle, className: 'text-warning bg-warning/10', label: 'Low Stock' },
  normal: { icon: CheckCircle2, className: 'text-success bg-success/10', label: 'Normal' },
  overstocked: { icon: ArrowDown, className: 'text-primary bg-primary/10', label: 'Overstocked' },
};

export default function RecommendationTable({
  recommendations,
  totalSalesByProduct,
  mostSoldProduct,
}: RecommendationTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              {totalSalesByProduct && (
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past Sales</th>
              )}
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Daily</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Days Left</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety Stock</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reorder Pt</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">EOQ</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Qty</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(rec => {
              const config = urgencyConfig[rec.urgency];
              const Icon = config.icon;
              const pastSales = totalSalesByProduct?.get(rec.productName);
              const isTopSeller = mostSoldProduct === rec.productName;
              return (
                <tr key={rec.productName} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rec.productName}</span>
                      {isTopSeller && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          <Trophy className="w-3 h-3" />
                          Top Seller
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </td>
                  {totalSalesByProduct && (
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {pastSales != null ? pastSales.toLocaleString() : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-mono text-foreground">{rec.currentStock}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{rec.avgDailyDemand}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={rec.daysUntilStockout <= 7 ? 'text-destructive' : 'text-foreground'}>
                      {rec.daysUntilStockout > 100 ? '99+' : rec.daysUntilStockout}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{rec.safetyStock}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{rec.reorderPoint}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{rec.economicOrderQuantity}</td>
                  <td className="px-4 py-3 text-right">
                    {rec.recommendedOrder > 0 ? (
                      <span className="font-mono font-bold text-primary">{rec.recommendedOrder}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(rec.confidence * 100)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
