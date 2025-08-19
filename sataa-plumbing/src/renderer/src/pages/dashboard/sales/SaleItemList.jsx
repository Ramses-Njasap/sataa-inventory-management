import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function SaleItemList() {
  const { saleId } = useParams();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [sale, setSale] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, productsData, salesData] = await Promise.all([
          window.api.getSaleItems(saleId),
          window.api.getProducts(),
          window.api.getSales()
        ]);
        
        setItems(itemsData || []);
        setProducts(productsData || []);
        setSale(salesData.find(s => s.id === Number(saleId)) || null);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      }
    };
    fetchData();
  }, [saleId]);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  if (!sale) return <div className="text-slate-900 p-6">Loading...</div>;

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-slate-900 text-lg font-semibold">Sale #{sale.id} Items</h3>
          <p className="text-slate-600 text-sm">
            {new Date(sale.created_at).toLocaleString()}
          </p>
        </div>
        <Link
          to={`/dashboard/sales/${saleId}/items/new`}
          className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium"
        >
          Add Item
        </Link>
      </div>
      
      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
      
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-slate-900 text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Product</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Quantity</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Unit Price</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Total</th>
              <th className="p-3 text-sm font-semibold border-b border-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-100 transition-colors duration-150">
                <td className="p-3 text-sm">{getProductName(item.product_id)}</td>
                <td className="p-3 text-sm">{item.quantity}</td>
                <td className="p-3 text-sm">{item.price_per_unit.toFixed(2)} XAF</td>
                <td className="p-3 text-sm">{item.total_price.toFixed(2)} XAF</td>
                <td className="p-3 text-sm">
                  <Link 
                    to={`/dashboard/sales/${saleId}/items/${item.id}`}
                    className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                  >
                    Edit
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

export default SaleItemList;