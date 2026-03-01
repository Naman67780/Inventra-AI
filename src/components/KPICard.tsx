import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  delay?: number;
}

export default function KPICard({ title, value, change, icon, delay = 0 }: KPICardProps) {
  const delayClass = delay === 1 ? 'animate-fade-in-up-delay-1'
    : delay === 2 ? 'animate-fade-in-up-delay-2'
    : delay === 3 ? 'animate-fade-in-up-delay-3'
    : delay === 4 ? 'animate-fade-in-up-delay-4'
    : 'animate-fade-in-up';

  return (
    <div className={`glass-card p-5 ${delayClass}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {change > 0 ? (
            <TrendingUp className="w-3 h-3 stat-up" />
          ) : change < 0 ? (
            <TrendingDown className="w-3 h-3 stat-down" />
          ) : (
            <Minus className="w-3 h-3 text-muted-foreground" />
          )}
          <span className={`text-xs font-medium ${change > 0 ? 'stat-up' : change < 0 ? 'stat-down' : 'text-muted-foreground'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last period
          </span>
        </div>
      )}
    </div>
  );
}
