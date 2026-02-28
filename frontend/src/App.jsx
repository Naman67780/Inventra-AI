import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  UploadCloud,
  Settings,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Calendar,
  Loader
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import './App.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [chartData, setChartData] = useState([]);
  const [skuData, setSkuData] = useState([]);
  const [metrics, setMetrics] = useState({ total_skus: 0, projected_stockouts: 0, forecast_accuracy: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:8000/api/dashboard');
      const json = await response.json();
      if (json.data) {
        setChartData(json.data.chart_data);
        setSkuData(json.data.sku_data);
        setMetrics(json.data.metrics);
      } else {
        // Fallback or "no data" state
        setChartData([]);
        setSkuData([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setErrorMsg('Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (response.ok) {
        // Refresh dashboard data
        await fetchDashboardData();
        setActiveTab('dashboard');
      } else {
        setErrorMsg(json.error || 'Upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMsg('Failed to connect to backend server during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Package className="text-primary" size={28} />
          Inventra AI
        </div>

        <nav className="nav-links">
          <a
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            Analytics
          </a>
          <a
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={20} />
            Upload Data
          </a>
          <a
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-search">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search SKUs, categories, or trends..." />
          </div>

          <div className="header-actions">
            <button className="icon-btn relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">RK</div>
              <span className="text-sm font-medium">Ritesh Kumar</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content animate-fade-in">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h1 className="text-2xl font-bold">Inventory Overview</h1>
                  <p className="text-muted">AI-powered demand forecasting and restocking recommendations.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-600 shadow-sm">
                    <Calendar size={16} />
                    <span>Last 30 Days</span>
                  </div>
                  <button className="btn btn-outline" onClick={fetchDashboardData}>
                    Refresh Data
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveTab('upload')}>
                    <UploadCloud size={16} />
                    Upload CSV
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
                  <p>{errorMsg}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                  <Loader className="animate-spin text-primary" size={48} />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">No Data Available</h3>
                  <p className="text-gray-500 mb-4">Please upload your inventory CSV to populate the dashboard.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('upload')}>Upload Data Now</button>
                </div>
              ) : (
                <>
                  {/* Metrics Grid */}
                  <div className="metrics-grid">
                    <div className="card metric-card">
                      <div className="metric-header">
                        Total SKUs
                        <Package size={18} />
                      </div>
                      <div className="metric-value">{metrics.total_skus.toLocaleString()}</div>
                      <div className="metric-trend text-muted">
                        <span className="trend-up"><TrendingUp size={14} /> +12%</span>
                        &nbsp;vs last month
                      </div>
                    </div>

                    <div className="card metric-card">
                      <div className="metric-header">
                        Projected Stockouts
                        <AlertTriangle size={18} className="text-danger" />
                      </div>
                      <div className="metric-value">{metrics.projected_stockouts}</div>
                      <div className="metric-trend text-muted">
                        {metrics.projected_stockouts > 0 ? (
                          <><span className="trend-down"><TrendingDown size={14} /> Critical</span>&nbsp;attention needed</>
                        ) : (
                          <><span className="trend-up">Healthy</span></>
                        )}
                      </div>
                    </div>

                    <div className="card metric-card">
                      <div className="metric-header">
                        Forecast Accuracy
                        <BarChart3 size={18} className="text-primary" />
                      </div>
                      <div className="metric-value">{metrics.forecast_accuracy}%</div>
                      <div className="metric-trend text-muted">
                        <span className="trend-up"><TrendingUp size={14} /> +2.1%</span>
                        &nbsp;improvement
                      </div>
                    </div>
                  </div>

                  {/* Charts Section Placeholder */}
                  <div className="charts-grid mt-4">
                    <div className="card chart-card">
                      <div className="chart-header">
                        <h3 className="font-semibold text-lg">Demand Forecast (Next 30 Days)</h3>
                        <select className="btn btn-outline text-sm py-1 px-2">
                          <option>All Categories</option>
                        </select>
                      </div>
                      <div className="flex-1 w-full h-full min-h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6b7280', fontSize: 12 }}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#6b7280', fontSize: 12 }}
                              dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />

                            {/* Confidence Interval Area */}
                            <Area
                              type="monotone"
                              dataKey="upper"
                              stroke="none"
                              fill="url(#colorConfidence)"
                              name="Confidence upper"
                              legendType="none"
                            />
                            <Area
                              type="monotone"
                              dataKey="lower"
                              stroke="none"
                              fill="#ffffff"
                              name="Confidence lower"
                              legendType="none"
                            />

                            {/* Lines */}
                            <Line
                              type="monotone"
                              dataKey="historical"
                              stroke="#1e40af"
                              strokeWidth={3}
                              dot={{ r: 4, fill: '#1e40af', strokeWidth: 0 }}
                              activeDot={{ r: 6 }}
                              name="Historical Sales"
                            />
                            <Line
                              type="monotone"
                              dataKey="forecast"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                              activeDot={{ r: 6 }}
                              name="AI Forecast"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card chart-card">
                      <div className="chart-header">
                        <h3 className="font-semibold text-lg">Restocking Alerts</h3>
                      </div>
                      <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                        {skuData.filter(sku => sku.status === 'Critical' || sku.status === 'Warning').slice(0, 10).map((sku) => (
                          <div key={sku.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-red-50/30">
                            <div className="flex gap-3 items-center">
                              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle size={16} />
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{sku.name}</div>
                                <div className="text-xs text-muted">Stock: {sku.stock} left</div>
                              </div>
                            </div>
                            <button className="text-xs font-semibold text-primary hover:underline">Reorder</button>
                          </div>
                        ))}
                        {skuData.filter(sku => sku.status === 'Critical' || sku.status === 'Warning').length === 0 && (
                          <div className="text-center text-muted p-4">No critical restocking alerts.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SKU-Level Analytics */}
                  <div className="card mt-4 p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-semibold text-lg">SKU-Level Analytics</h3>
                      <button className="text-sm font-medium text-primary hover:underline">View All Inventory</button>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                            <th className="px-6 py-3 border-b border-gray-100">SKU / Product</th>
                            <th className="px-6 py-3 border-b border-gray-100">Category</th>
                            <th className="px-6 py-3 border-b border-gray-100 text-right">Current Stock</th>
                            <th className="px-6 py-3 border-b border-gray-100 text-right">30-Day Forecast</th>
                            <th className="px-6 py-3 border-b border-gray-100 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {skuData.map((sku) => (
                            <tr key={sku.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-3">
                                <div className="font-medium text-gray-900">{sku.name}</div>
                                <div className="text-xs text-gray-500">{sku.id}</div>
                              </td>
                              <td className="px-6 py-3 text-gray-600">{sku.category}</td>
                              <td className="px-6 py-3 text-right font-medium">{sku.stock}</td>
                              <td className="px-6 py-3 text-right font-medium text-primary">{sku.forecast}</td>
                              <td className="px-6 py-3 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sku.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                  sku.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    sku.status === 'Overstocked' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                      'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                  {sku.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full">
              <h2 className="text-2xl font-bold mb-2">Upload Sales Data</h2>
              <p className="text-muted text-center mb-8">Upload your historical sales data (CSV) to generate AI-powered demand forecasts and restocking recommendations.</p>

              {errorMsg && (
                <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
                  <p>{errorMsg}</p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />

              <div
                className={`w-full card border-dashed border-2 p-12 flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors cursor-pointer bg-blue-50/20 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader className="animate-spin text-primary mb-4" size={48} />
                    <h3 className="text-xl font-semibold">Processing Data with AI...</h3>
                    <p className="text-muted">Analyzing historical trends and forecasting demand</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-4">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-semibold">Drag & drop your CSV file here</h3>
                    <p className="text-muted">or click to browse from your computer</p>
                    <button className="btn btn-primary mt-4">Browse Files</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
