import { InventoryRecommendation } from '@/services/inventoryOptimizer';
import { Trophy } from 'lucide-react';

interface MonthlyData {
  month: string;
  product: string;
  quantity: number;
}

interface PredictedStockTableProps {
  recommendations: InventoryRecommendation[];
  monthlyByProduct: Map<string, MonthlyData[]>;
  totalSalesByProduct: Map<string, number>;
  mostSoldProduct?: string;
}

function formatMonth(monthStr: string): string {
  const [y, m] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m || '1', 10) - 1]} ${y}`;
}

export default function PredictedStockTable({
  recommendations,
  monthlyByProduct,
  totalSalesByProduct,
  mostSoldProduct,
}: PredictedStockTableProps) {
  const allMonths = (() => {
    const set = new Set<string>();
    monthlyByProduct.forEach(arr => arr.forEach(p => set.add(p.month)));
    return Array.from(set).sort();
  })();
  const recentMonths = allMonths.slice(-6);

  return (
    <div className="glass-card overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-bold text-foreground uppercase tracking-wider min-w-[160px] sticky left-0 bg-muted/30 z-10 border-r border-border">
                Product Name
              </th>
              {recentMonths.map(month => (
                <th
                  key={month}
                  className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[80px]"
                >
                  {formatMonth(month)}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-bold text-foreground uppercase tracking-wider min-w-[100px] bg-primary/5">
                Total Past Sales
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold text-primary uppercase tracking-wider min-w-[120px] bg-primary/10">
                Future Stock Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(rec => {
              const monthlyData = monthlyByProduct.get(rec.productName) || [];
              const totalPast = totalSalesByProduct.get(rec.productName) ?? 0;
              const isTopSeller = mostSoldProduct === rec.productName;

              return (
                <tr
                  key={rec.productName}
                  className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground sticky left-0 bg-background z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <span>{rec.productName}</span>
                      {isTopSeller && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                          <Trophy className="w-3 h-3" />
                          Top Seller
                        </span>
                      )}
                    </div>
                  </td>
                  {recentMonths.map(month => {
                    const data = monthlyData.find(m => m.month === month);
                    const qty = data?.quantity ?? 0;
                    return (
                      <td
                        key={month}
                        className="px-3 py-3 text-right font-mono text-muted-foreground"
                      >
                        {qty > 0 ? qty.toLocaleString() : '—'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-mono font-semibold text-foreground bg-primary/5">
                    {totalPast.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right bg-primary/10">
                    <span className={`font-mono font-bold text-base ${rec.recommendedOrder > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {rec.recommendedOrder.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        Based on past months&apos; sales. Future Stock Quantity = how much to order (0 = stock sufficient).
      </div>
    </div>
  );
}
