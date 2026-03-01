// Real inventory optimization: EOQ, Safety Stock, Reorder Point

export interface InventoryRecommendation {
  productName: string;
  currentStock: number;
  avgDailyDemand: number;
  forecastedDemand: number;
  safetyStock: number;
  reorderPoint: number;
  economicOrderQuantity: number;
  recommendedOrder: number;
  daysUntilStockout: number;
  urgency: 'critical' | 'warning' | 'normal' | 'overstocked';
  confidence: number;
}

/**
 * Economic Order Quantity (EOQ) — Wilson formula
 */
export function calculateEOQ(
  annualDemand: number,
  orderingCost: number = 50,
  holdingCostPerUnit: number = 2
): number {
  if (annualDemand <= 0 || orderingCost <= 0 || holdingCostPerUnit <= 0) return 0;
  return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit));
}

/**
 * Safety Stock using service level approach
 * Z-score for 95% service level ≈ 1.645
 */
export function calculateSafetyStock(
  dailyDemandStdDev: number,
  leadTimeDays: number = 3,
  serviceLevel: number = 0.95
): number {
  const zScores: Record<number, number> = {
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  };
  const z = zScores[serviceLevel] || 1.645;
  return Math.ceil(z * dailyDemandStdDev * Math.sqrt(leadTimeDays));
}

/**
 * Reorder Point = (Average Daily Demand × Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  avgDailyDemand: number,
  leadTimeDays: number = 3,
  safetyStock: number
): number {
  return Math.ceil(avgDailyDemand * leadTimeDays + safetyStock);
}

/**
 * Standard deviation of an array
 */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiffs = values.map(v => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

/**
 * Generate full inventory recommendation for a product
 */
export function generateRecommendation(
  productName: string,
  historicalDailySales: number[],
  forecastedDailySales: number[],
  currentStock: number,
  leadTimeDays: number = 3,
  orderingCost: number = 50,
  holdingCost: number = 2,
  serviceLevel: number = 0.95
): InventoryRecommendation {
  const avgDailyDemand = historicalDailySales.length > 0
    ? historicalDailySales.reduce((a, b) => a + b, 0) / historicalDailySales.length
    : 0;

  const demandStdDev = stdDev(historicalDailySales);
  const forecastedDemand = forecastedDailySales.reduce((a, b) => a + b, 0);
  const annualDemand = avgDailyDemand * 365;

  const safetyStock = calculateSafetyStock(demandStdDev, leadTimeDays, serviceLevel);
  const reorderPoint = calculateReorderPoint(avgDailyDemand, leadTimeDays, safetyStock);
  const eoq = calculateEOQ(annualDemand, orderingCost, holdingCost);

  const daysUntilStockout = avgDailyDemand > 0
    ? Math.floor(currentStock / avgDailyDemand)
    : currentStock > 0 ? 999 : 0;

  // How much to order — always show a recommendation based on past months' sales
  // Order = forecasted demand + safety stock - current stock (never negative)
  const orderNeeded = Math.ceil(forecastedDemand + safetyStock - currentStock);
  let recommendedOrder = Math.max(0, orderNeeded);

  // Urgency
  let urgency: InventoryRecommendation['urgency'] = 'normal';
  if (daysUntilStockout <= 2) urgency = 'critical';
  else if (daysUntilStockout <= 7) urgency = 'warning';
  else if (currentStock > avgDailyDemand * 60) urgency = 'overstocked';

  // Confidence based on data quantity
  const confidence = Math.min(0.95, 0.5 + historicalDailySales.length * 0.015);

  return {
    productName,
    currentStock,
    avgDailyDemand: Math.round(avgDailyDemand * 10) / 10,
    forecastedDemand: Math.round(forecastedDemand),
    safetyStock,
    reorderPoint,
    economicOrderQuantity: eoq,
    recommendedOrder,
    daysUntilStockout,
    urgency,
    confidence: Math.round(confidence * 100) / 100,
  };
}
