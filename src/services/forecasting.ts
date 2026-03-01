// Real Exponential Smoothing (Holt-Winters) & Moving Average implementations

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ForecastResult {
  date: string;
  actual?: number;
  forecast: number;
  lower: number;
  upper: number;
}

/**
 * Simple Moving Average
 */
export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1));
    } else {
      const slice = data.slice(i - window + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / window);
    }
  }
  return result;
}

/**
 * Weighted Moving Average — recent values weighted more
 */
export function weightedMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const w = Math.min(i + 1, window);
    const slice = data.slice(Math.max(0, i - w + 1), i + 1);
    let totalWeight = 0;
    let weightedSum = 0;
    slice.forEach((val, idx) => {
      const weight = idx + 1;
      weightedSum += val * weight;
      totalWeight += weight;
    });
    result.push(weightedSum / totalWeight);
  }
  return result;
}

/**
 * Double Exponential Smoothing (Holt's method)
 * Real implementation with level and trend components
 */
export function doubleExponentialSmoothing(
  data: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  forecastPeriods: number = 7
): { fitted: number[]; forecast: number[] } {
  if (data.length < 2) {
    return {
      fitted: [...data],
      forecast: Array(forecastPeriods).fill(data[0] || 0),
    };
  }

  // Initialize
  let level = data[0];
  let trend = data[1] - data[0];
  const fitted: number[] = [level];

  // Fit
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fitted.push(level + trend);
  }

  // Forecast
  const forecast: number[] = [];
  for (let i = 1; i <= forecastPeriods; i++) {
    forecast.push(Math.max(0, level + i * trend));
  }

  return { fitted, forecast };
}

/**
 * Triple Exponential Smoothing (Holt-Winters with additive seasonality)
 */
export function holtWinters(
  data: number[],
  seasonLength: number = 7,
  alpha: number = 0.2,
  beta: number = 0.1,
  gamma: number = 0.3,
  forecastPeriods: number = 14
): { fitted: number[]; forecast: number[] } {
  if (data.length < seasonLength * 2) {
    return doubleExponentialSmoothing(data, alpha, beta, forecastPeriods);
  }

  // Initialize seasonal indices
  const seasons: number[] = [];
  const nSeasons = Math.floor(data.length / seasonLength);
  for (let i = 0; i < seasonLength; i++) {
    let sum = 0;
    for (let j = 0; j < nSeasons; j++) {
      sum += data[j * seasonLength + i];
    }
    seasons.push(sum / nSeasons);
  }
  const seasonAvg = seasons.reduce((a, b) => a + b, 0) / seasonLength;
  const seasonalIndices = seasons.map(s => s - seasonAvg);

  // Initialize level and trend
  let level = data[0];
  let trend = (data[seasonLength] - data[0]) / seasonLength;
  const seasonal = [...seasonalIndices];
  const fitted: number[] = [];

  // Fit
  for (let i = 0; i < data.length; i++) {
    const si = i % seasonLength;
    if (i === 0) {
      fitted.push(level + trend + seasonal[si]);
      continue;
    }
    const prevLevel = level;
    level = alpha * (data[i] - seasonal[si]) + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[si] = gamma * (data[i] - level) + (1 - gamma) * seasonal[si];
    fitted.push(level + trend + seasonal[si]);
  }

  // Forecast
  const forecast: number[] = [];
  for (let i = 1; i <= forecastPeriods; i++) {
    const si = (data.length + i - 1) % seasonLength;
    forecast.push(Math.max(0, level + i * trend + seasonal[si]));
  }

  return { fitted, forecast };
}

/**
 * Detect trend direction and strength
 */
export function detectTrend(data: number[]): { direction: 'up' | 'down' | 'stable'; strength: number; slope: number } {
  if (data.length < 2) return { direction: 'stable', strength: 0, slope: 0 };

  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i] - yMean);
    den += (i - xMean) ** 2;
  }

  const slope = den === 0 ? 0 : num / den;
  const strength = Math.min(1, Math.abs(slope) / (yMean || 1));

  return {
    direction: slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable',
    strength,
    slope,
  };
}

/**
 * Detect seasonality using autocorrelation
 */
export function detectSeasonality(data: number[]): { seasonal: boolean; period: number } {
  if (data.length < 14) return { seasonal: false, period: 7 };

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const maxLag = Math.min(Math.floor(data.length / 2), 30);
  let bestLag = 7;
  let bestCorr = -1;

  for (let lag = 3; lag <= maxLag; lag++) {
    let num = 0;
    let den1 = 0;
    let den2 = 0;
    for (let i = 0; i < data.length - lag; i++) {
      const d1 = data[i] - mean;
      const d2 = data[i + lag] - mean;
      num += d1 * d2;
      den1 += d1 * d1;
      den2 += d2 * d2;
    }
    const corr = den1 * den2 === 0 ? 0 : num / Math.sqrt(den1 * den2);
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  return { seasonal: bestCorr > 0.3, period: bestLag };
}

/**
 * Full forecasting pipeline: auto-selects best method
 */
export function generateForecast(
  salesData: TimeSeriesPoint[],
  forecastDays: number = 14
): ForecastResult[] {
  const values = salesData.map(d => d.value);
  if (values.length === 0) return [];

  const seasonality = detectSeasonality(values);
  const trend = detectTrend(values);

  let fitted: number[];
  let forecast: number[];

  if (seasonality.seasonal && values.length >= seasonality.period * 2) {
    const result = holtWinters(values, seasonality.period, 0.2, 0.1, 0.3, forecastDays);
    fitted = result.fitted;
    forecast = result.forecast;
  } else if (values.length >= 4) {
    const result = doubleExponentialSmoothing(values, 0.3, 0.1, forecastDays);
    fitted = result.fitted;
    forecast = result.forecast;
  } else {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    fitted = values.map(() => avg);
    forecast = Array(forecastDays).fill(avg);
  }

  // Calculate residual std dev for confidence intervals
  const residuals = values.map((v, i) => v - (fitted[i] || v));
  const stdDev = Math.sqrt(residuals.reduce((a, r) => a + r * r, 0) / Math.max(1, residuals.length));

  const results: ForecastResult[] = [];

  // Historical fitted values
  for (let i = 0; i < salesData.length; i++) {
    results.push({
      date: salesData[i].date,
      actual: salesData[i].value,
      forecast: Math.max(0, fitted[i] || salesData[i].value),
      lower: Math.max(0, (fitted[i] || salesData[i].value) - 1.96 * stdDev),
      upper: (fitted[i] || salesData[i].value) + 1.96 * stdDev,
    });
  }

  // Future forecasts
  const lastDate = new Date(salesData[salesData.length - 1].date);
  for (let i = 0; i < forecast.length; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    const widening = 1 + i * 0.1; // confidence interval widens over time
    results.push({
      date: date.toISOString().split('T')[0],
      forecast: Math.max(0, forecast[i]),
      lower: Math.max(0, forecast[i] - 1.96 * stdDev * widening),
      upper: forecast[i] + 1.96 * stdDev * widening,
    });
  }

  return results;
}
