import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SalesList() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, customersData] = await Promise.all([
          window.api.getSales(),
          window.api.getCustomers()
        ]);
        setSales(salesData || []);
        setCustomers(customersData || []);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      }
    };
    fetchData();
  }, []);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 text-lg font-semibold">Sales</h3>
        <Link
          to="/dashboard/sales/new"
          className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-150 text-sm font-medium"
        >
          New Sale
        </Link>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-slate-900 text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">ID</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Customer</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Total</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Date</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-100 transition-colors duration-150">
                <td className="p-3 text-sm">#{sale.id}</td>
                <td className="p-3 text-sm">{getCustomerName(sale.customer_id)}</td>
                <td className="p-3 text-sm">{sale.total_price.toFixed(2)} XAF</td>
                <td className="p-3 text-sm text-slate-600">
                  {new Date(sale.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-sm">
                  <Link 
                    to={`/dashboard/sales/${sale.id}`}
                    className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline mr-3"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/dashboard/sales/${sale.id}/items`}
                    className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                  >
                    Items
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesList;