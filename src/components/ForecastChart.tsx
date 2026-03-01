import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ForecastResult } from '@/services/forecasting';

interface ForecastChartProps {
  data: ForecastResult[];
  title?: string;
}

export default function ForecastChart({ data, title }: ForecastChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-80">
        <p className="text-muted-foreground text-sm">No data available for forecasting</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
            tickFormatter={v => v.slice(5)}
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
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#gradCI)"
            name="Upper Bound"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="transparent"
            name="Lower Bound"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="hsl(217, 91%, 60%)"
            fill="url(#gradActual)"
            strokeWidth={2}
            name="Actual"
            dot={false}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="hsl(160, 84%, 39%)"
            fill="url(#gradForecast)"
            strokeWidth={2}
            strokeDasharray="6 3"
            name="Forecast"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
