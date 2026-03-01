import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PenLine,
  Upload,
  ScanLine,
  TrendingUp,
  Package,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predictions', icon: Sparkles, label: 'Order Predictions' },
  { to: '/sales-entry', icon: PenLine, label: 'Sales Entry' },
  { to: '/upload', icon: Upload, label: 'CSV Upload' },
  { to: '/scan', icon: ScanLine, label: 'OCR Scan' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecasting' },
  { to: '/recommendations', icon: Package, label: 'Recommendations' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">StockCast AI</h1>
            <p className="text-[11px] text-muted-foreground">Demand Forecasting</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-sidebar-accent text-primary glow-border'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="glass-card p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Powered by real</p>
            <p className="text-xs font-semibold text-primary">Exponential Smoothing</p>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-border">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
