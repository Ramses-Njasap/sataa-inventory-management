import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Welcome() {
  const [timeRange, setTimeRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data based on time range
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Calculate date ranges
        const now = new Date();
        let startDate, endDate = now.toISOString().split('T')[0];
        
        switch(timeRange) {
          case 'today':
            startDate = endDate;
            break;
          case '3days':
            startDate = new Date(now.setDate(now.getDate() - 2)).toISOString().split('T')[0];
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 6)).toISOString().split('T')[0];
            break;
          case '2weeks':
            startDate = new Date(now.setDate(now.getDate() - 13)).toISOString().split('T')[0];
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
            break;
          default:
            startDate = endDate;
        }

        // Fetch all data in parallel
        const [statsData, salesData, productsData] = await Promise.all([
          window.api.getSalesStats(startDate, endDate),
          window.api.getRecentSales(startDate, endDate, 5),
          window.api.getTopProducts(startDate, endDate, 5)
        ]);

        setStats(statsData);
        setRecentSales(salesData);
        setTopProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Chart data for sales trend
  const salesTrendChart = {
    labels: stats?.salesTrend?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Number of Sales',
        data: stats?.salesTrend?.map(item => item.count) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Revenue ($)',
        data: stats?.salesTrend?.map(item => item.revenue) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        type: 'line',
        yAxisID: 'y1',
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Trend',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Sales',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue (XAF)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Top products chart
  const topProductsChart = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topProducts.map(product => product.total_quantity),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      }
    ]
  };

  if (loading) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
        <h2 className="text-slate-900 text-lg font-semibold mb-4">Loading Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
        <h2 className="text-slate-900 text-lg font-semibold mb-4">Error Loading Dashboard</h2>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md">
          <p className="text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-slate-900 text-lg font-semibold">Dashboard Overview</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200"
          >
            <option value="today">Today</option>
            <option value="3days">Last 3 Days</option>
            <option value="week">Last Week</option>
            <option value="2weeks">Last 2 Weeks</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Sales</h3>
          <p className="text-slate-900 text-2xl font-bold">{stats?.total_sales || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-slate-900 text-2xl font-bold">{(stats?.total_revenue || 0).toFixed(2)} XAF</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Profit</h3>
          <p className="text-slate-900 text-2xl font-bold">{(stats?.total_profit || 0).toFixed(2)} XAF</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
          <Bar data={salesTrendChart} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
          <Bar 
            data={topProductsChart} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Top Selling Products',
                },
              },
            }} 
          />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200 mb-6">
        <h3 className="text-slate-900 text-sm font-semibold mb-4">Recent Sales</h3>
        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-slate-900 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 text-sm font-medium">ID</th>
                  <th className="p-3 text-sm font-medium">Customer</th>
                  <th className="p-3 text-sm font-medium">Amount</th>
                  <th className="p-3 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} className="border-t border-slate-300 hover:bg-slate-100 transition-colors duration-150">
                    <td className="p-3">#{sale.id}</td>
                    <td className="p-3">{sale.customer_name || 'No Customer'}</td>
                    <td className="p-3">{sale.total_price.toFixed(2)} XAF</td>
                    <td className="p-3">{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600">No recent sales found</p>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white p-4 rounded-lg shadow-xs border border-slate-200">
        <h3 className="text-slate-900 text-sm font-semibold mb-4">Top Products</h3>
        {topProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topProducts.map(product => (
              <div key={product.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow duration-200">
                {/* {product.image_path ? (
                  <img 
                    src={product.image_path} 
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )} */}
                <h4 className="text-slate-900 font-medium truncate">{product.name}</h4>
                <p className="text-slate-500 text-sm">Sold: {product.total_quantity}</p>
                <p className="text-slate-500 text-sm">Revenue: {product.total_revenue.toFixed(2)} XAF</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No top products found</p>
        )}
      </div>
    </div>
  );
}

export default Welcome;