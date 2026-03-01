import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import ForecastChart from '@/components/ForecastChart';
import { getProductNames, getSalesTimeSeries } from '@/services/dataStore';
import { generateForecast, detectTrend, detectSeasonality } from '@/services/forecasting';

export default function ForecastPage() {
  const productNames = getProductNames();
  const [selectedProduct, setSelectedProduct] = useState(productNames[0] || '');
  const [forecastDays, setForecastDays] = useState(14);

  const timeSeries = useMemo(() => getSalesTimeSeries(selectedProduct), [selectedProduct]);
  const forecast = useMemo(() => generateForecast(timeSeries, forecastDays), [timeSeries, forecastDays]);
  const trend = useMemo(() => detectTrend(timeSeries.map(t => t.value)), [timeSeries]);
  const seasonality = useMemo(() => detectSeasonality(timeSeries.map(t => t.value)), [timeSeries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Demand Forecasting</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered sales predictions using exponential smoothing</p>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Product</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm"
          >
            {productNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Forecast Period</label>
          <select
            value={forecastDays}
            onChange={e => setForecastDays(Number(e.target.value))}
            className="bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Analysis cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Trend Direction</p>
          <p className="text-lg font-bold text-foreground capitalize flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${trend.direction === 'up' ? 'stat-up' : trend.direction === 'down' ? 'stat-down' : 'text-muted-foreground'}`} />
            {trend.direction}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Strength: {(trend.strength * 100).toFixed(0)}%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Seasonality</p>
          <p className="text-lg font-bold text-foreground">
            {seasonality.seasonal ? `Detected (${seasonality.period}d cycle)` : 'Not detected'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Auto-applied in forecast model</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Model Used</p>
          <p className="text-lg font-bold text-primary">
            {seasonality.seasonal && timeSeries.length >= seasonality.period * 2
              ? 'Holt-Winters'
              : timeSeries.length >= 4
              ? 'Double Exp. Smoothing'
              : 'Simple Average'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Auto-selected by engine</p>
        </div>
      </div>

      {/* Forecast chart */}
      <ForecastChart data={forecast} title={`${selectedProduct} — ${forecastDays}-Day Forecast`} />

      {/* Methodology */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Forecasting Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Holt-Winters</p>
            <p>Triple exponential smoothing with additive seasonality. Used when seasonal patterns are detected with sufficient data (2+ full cycles).</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Double Exp. Smoothing</p>
            <p>Holt's method capturing level and trend components. Fallback when no seasonality detected but enough data points exist.</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Confidence Intervals</p>
            <p>95% prediction intervals computed from residual standard deviation, widening over forecast horizon to reflect increasing uncertainty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
