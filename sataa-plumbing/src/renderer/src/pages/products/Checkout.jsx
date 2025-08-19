import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';


function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [saleData, setSaleData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  // Load initial data
  useEffect(() => {
    if (location.state?.saleData) {
      setSaleData({
        ...location.state.saleData,
        id: null,
        created_at: new Date().toISOString()
      });
    } else {
      navigate('/products');
    }

    const fetchAdditionalData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          window.api.getCustomers(),
          window.api.getProducts()
        ]);
        setCustomers(customerData || []);
        setProducts(productData || []);
      } catch (err) {
        setError('Failed to load additional data: ' + err.message);
      }
    };
    fetchAdditionalData();
  }, [location, navigate]);

  // const generateReceipt = async (format) => {
  //   const receiptElement = receiptRef.current;
    
  //   try {
  //     if (format === 'png') {
  //       const canvas = await html2canvas(receiptElement);
  //       canvas.toBlob(blob => {
  //         saveAs(blob, `receipt-${saleData.id || 'draft'}.png`);
  //       });
  //     } else if (format === 'pdf') {
  //       const canvas = await html2canvas(receiptElement);
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF({
  //         orientation: 'portrait',
  //         unit: 'mm'
  //       });
        
  //       const imgProps = pdf.getImageProperties(imgData);
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
  //       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //       pdf.save(`receipt-${saleData.id || 'draft'}.pdf`);
  //     }
  //   } catch (err) {
  //     console.error('Failed to generate receipt:', err);
  //     setError('Failed to generate receipt: ' + err.message);
  //   }
  // };

  const generateReceipt = async (format) => {
  const receiptElement = receiptRef.current;

  try {
    // temporarily show it if hidden
    const prevDisplay = receiptElement.style.display;
    receiptElement.style.display = 'block';

    const canvas = await html2canvas(receiptElement);
    const imgData = canvas.toDataURL('image/png');

    if (format === 'pdf') {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${saleData.id || 'draft'}.pdf`);
    }

    if (format === 'png') {
      canvas.toBlob(blob => {
        saveAs(blob, `receipt-${saleData.id || 'draft'}.png`);
      });
    }

    // restore display
    receiptElement.style.display = prevDisplay;
  } catch (err) {
    console.error('Failed to generate receipt:', err);
    setError('Failed to generate receipt: ' + err.message);
  }
};

  const printReceipt = async () => {
    try {
      const receiptElement = receiptRef.current;
      const canvas = await html2canvas(receiptElement);
      const dataUrl = canvas.toDataURL('image/png');
      await window.api.printReceipt(saleData.id, dataUrl);
    } catch (err) {
      console.error('Printing failed:', err);
      setError('Failed to print receipt: ' + err.message);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      let result;
      if (saleData.id) {
        result = await window.api.updateSaleAndItems(saleData);
      } else {
        result = await window.api.finalizeSale(saleData);
      }
      
      const completeSale = await window.api.getSaleWithItems(result.id);
      setSaleData(completeSale);
      
      setTimeout(() => {
        if (receiptRef.current) {
          printReceipt();
        } else {
          console.error('Receipt content not available for printing');
          setError('Failed to generate receipt for printing');
        }
      }, 100);
    } catch (err) {
      setError('Failed to finalize sale: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (saleData.id) {
      window.api.getSaleWithItems(saleData.id)
        .then(data => setSaleData(data))
        .catch(err => setError('Failed to reload sale data: ' + err.message));
    } else {
      setSaleData({
        ...location.state.saleData,
        id: null,
        created_at: new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  const updateCustomer = (customerId) => {
    setSaleData(prev => ({
      ...prev,
      customer_id: customerId,
      customer_name: customers.find(c => c.id === customerId)?.name || ''
    }));
  };

  const updateItemQuantity = (index, quantity) => {
    const newItems = [...saleData.items];
    newItems[index] = {
      ...newItems[index],
      quantity: Math.max(1, quantity),
      total_price: quantity * newItems[index].price_per_unit
    };

    setSaleData(prev => ({
      ...prev,
      items: newItems,
      total_price: newItems.reduce((sum, item) => sum + item.total_price, 0)
    }));
  };

  const removeItem = (index) => {
    const newItems = [...saleData.items];
    newItems.splice(index, 1);

    setSaleData(prev => ({
      ...prev,
      items: newItems,
      total_price: newItems.reduce((sum, item) => sum + item.total_price, 0)
    }));
  };

  const addProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const available = product.quantity_bought - product.quantity_sold;
    if (available <= 0) {
      setError('This product is out of stock');
      return;
    }

    const existingIndex = saleData.items.findIndex(item => item.product_id === productId);
    if (existingIndex >= 0) {
      updateItemQuantity(existingIndex, saleData.items[existingIndex].quantity + 1);
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        price_per_unit: product.price_per_unit_sold,
        quantity: 1,
        total_price: product.price_per_unit_sold
      };

      setSaleData(prev => ({
        ...prev,
        items: [...prev.items, newItem],
        total_price: prev.total_price + newItem.total_price
      }));
    }
  };

  if (!saleData) {
    return <div className="p-6 text-center">Loading sale data...</div>;
  }

  return (
    <div className="bg-zinc-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-800">
            {saleData.id ? `Sale #${saleData.id}` : 'New Sale'} - Checkout
          </h2>
          <div className="flex space-x-3 no-print">
            <button
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100"
            >
              Back to Sales
            </button>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Sale
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </>
            )}
            <button
              onClick={handleFinalize}
              disabled={loading || saleData.items.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Finalize & Print'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sale Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">Sale Details</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Customer</label>
                    <select
                      value={saleData.customer_id}
                      onChange={(e) => updateCustomer(parseInt(e.target.value))}
                      className="w-full p-2 border border-zinc-300 rounded-lg"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Add Product</label>
                    <select
                      onChange={(e) => {
                        addProduct(parseInt(e.target.value));
                        e.target.value = '';
                      }}
                      className="w-full p-2 border border-zinc-300 rounded-lg"
                    >
                      <option value="">Select Product</option>
                      {products
                        .filter(p => (p.quantity_bought - p.quantity_sold) > 0)
                        .map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.price_per_unit_sold.toFixed(2)} XAF)
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><span className="font-medium">Customer:</span> {saleData.customer_name || 'No customer selected'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(saleData.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> {saleData.id ? 'Finalized' : 'Pending'}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">Items</h3>
              
              {saleData.items.length === 0 ? (
                <p className="text-zinc-500">No items in this sale</p>
              ) : (
                <div className="space-y-4">
                  {saleData.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-start border-b border-zinc-100 pb-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-zinc-500">{item.price_per_unit.toFixed(2)} XAF each</p>
                      </div>
                      
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-20 p-1 border border-zinc-300 rounded text-center mr-4"
                          />
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <p className="font-medium">
                          {item.quantity} × {item.price_per_unit.toFixed(2)} XAF = {item.total_price.toFixed(2)} XAF
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-zinc-200 text-right">
                    <p className="text-xl font-bold">
                      Total: {saleData.total_price.toFixed(2)} XAF
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">Receipt Preview</h3>
              
              {/* Hidden content for printing */}
              <div>
                <div ref={receiptRef} className="bg-white p-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">SATAA'S PLUMBING</h2>
                    <p className="text-sm text-zinc-500">Sosoliso, Buea, Cameroon</p>
                    <p className="text-sm text-zinc-500">Tel: (+237) 677-467-057</p>
                  </div>
                  
                  <div className="border-t border-b border-zinc-200 py-2 my-2">
                    <p className="font-medium">SALE #{saleData.id || 'DRAFT'}</p>
                    <p className="text-sm">{new Date(saleData.created_at).toLocaleString()}</p>
                  </div>
                  
                  {saleData.customer_name && (
                    <div className="mb-2">
                      <p className="text-sm">
                        <span className="font-medium">Customer:</span> {saleData.customer_name}
                      </p>
                    </div>
                  )}
                  
                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left pb-1">Item</th>
                        <th className="text-right pb-1">Price</th>
                        <th className="text-right pb-1">Qty</th>
                        <th className="text-right pb-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleData.items.map((item, index) => (
                        <tr key={index} className="border-b border-zinc-100">
                          <td className="py-1">{item.product_name}</td>
                          <td className="text-right py-1">{item.price_per_unit.toFixed(2)} XAF</td>
                          <td className="text-right py-1">{item.quantity}</td>
                          <td className="text-right py-1">{item.total_price.toFixed(2)} XAF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="border-t border-zinc-200 pt-2 text-right">
                    <p className="font-bold">TOTAL: {saleData.total_price.toFixed(2)} XAF</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs text-zinc-500">
                    <p>Thank you for your purchase!</p>
                    <p>Please keep this receipt for your records</p>
                  </div>
                </div>
              </div>

              {/* Visible preview
              <div className="bg-white p-4 border border-zinc-200">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">SATAA'S PLUMBING</h2>
                  <p className="text-sm text-zinc-500">Sosoliso, Buea, Cameroon</p>
                  <p className="text-sm text-zinc-500">Tel: (+237) 677-467-057</p>
                </div>
                
                <div className="border-t border-b border-zinc-200 py-2 my-2">
                  <p className="font-medium">SALE #{saleData.id || 'DRAFT'}</p>
                  <p className="text-sm">{new Date(saleData.created_at).toLocaleString()}</p>
                </div>
                
                {saleData.customer_name && (
                  <div className="mb-2">
                    <p className="text-sm">
                      <span className="font-medium">Customer:</span> {saleData.customer_name}
                    </p>
                  </div>
                )}
                
                <table className="w-full mb-4">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left pb-1">Item</th>
                      <th className="text-right pb-1">Price</th>
                      <th className="text-right pb-1">Qty</th>
                      <th className="text-right pb-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleData.items.map((item, index) => (
                      <tr key={index} className="border-b border-zinc-100">
                        <td className="py-1">{item.product_name}</td>
                        <td className="text-right py-1">{item.price_per_unit.toFixed(2)} XAF</td>
                        <td className="text-right py-1">{item.quantity}</td>
                        <td className="text-right py-1">{item.total_price.toFixed(2)} XAF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="border-t border-zinc-200 pt-2 text-right">
                  <p className="font-bold">TOTAL: {saleData.total_price.toFixed(2)} XAF</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs text-zinc-500">
                  <p>Thank you for your purchase!</p>
                  <p>Please keep this receipt for your records</p>
                </div>
              </div> */}
              
              <div className="mt-4 no-print grid grid-cols-2 gap-3">
                <button
                  onClick={() => generateReceipt('pdf')}
                  className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Save PDF
                </button>
                <button
                  onClick={printReceipt}
                  className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;