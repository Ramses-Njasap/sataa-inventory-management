import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';


function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const authStatus = await window.api.getAuthStatus();
        const role = await window.api.getUserRole();
        setIsAuthenticated(authStatus);
        setIsAdmin(role === 'admin');
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await window.api.getCustomers();
        setCustomers(data || []);
        setFilteredCustomers(data || []);
      } catch (err) {
        setError('Failed to load customers: ' + err.message);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.contact_info && customer.contact_info.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const viewCustomerSales = async (customerId) => {
    try {
      setIsLoadingSales(true);
      const sales = await window.api.getSalesByCustomer(customerId);
      setCustomerSales(sales || []);
      setSelectedCustomer(customers.find(c => c.id === customerId));
      setIsViewModalOpen(true);
    } catch (err) {
      setError('Failed to load customer sales: ' + err.message);
    } finally {
      setIsLoadingSales(false);
    }
  };

  const handlePrintReceipt = (sale) => {
    setSelectedSale(sale);
    setIsReceiptModalOpen(true);
  };

  const generateReceipt = async (format) => {
    const receiptElement = document.getElementById('receipt-template');
    
    try {
      if (format === 'png') {
        const canvas = await html2canvas(receiptElement);
        canvas.toBlob(blob => {
          saveAs(blob, `receipt-${selectedSale.id}.png`);
        });
      } else if (format === 'pdf') {
        const canvas = await html2canvas(receiptElement);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${selectedSale.id}.pdf`);
      }
    } catch (err) {
      setError('Failed to generate receipt: ' + err.message);
    }
  };
 
  const printReceipt = async () => {
    const receiptElement = document.getElementById('receipt-template');
    const canvas = await html2canvas(receiptElement);
    const dataUrl = canvas.toDataURL('image/png');
    
    await window.api.printReceipt(selectedSale.id, dataUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-900">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-900">User not authenticated...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-slate-900 text-lg font-semibold">Customers</h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-200 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {isAdmin && (
            <Link
              to="/dashboard/customers/new"
              className="px-4 py-2 bg-teal-500 text-slate-50 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <p className="text-rose-400">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-slate-900 text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-sm font-medium">Name</th>
              <th className="p-3 text-sm font-medium">Contact</th>
              <th className="p-3 text-sm font-medium">Address</th>
              <th className="p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-300 hover:bg-slate-200 transition-colors duration-150">
                  <td className="p-3">{customer.name}</td>
                  <td className="p-3 text-slate-600">{customer.contact_info || '-'}</td>
                  <td className="p-3 text-slate-600">{customer.address || '-'}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => viewCustomerSales(customer.id)}
                        className="text-indigo-600 hover:text-indigo-500 transition-colors duration-200 flex items-center text-sm font-medium"
                        disabled={isLoadingSales}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Sales
                      </button>
                      {isAdmin && (
                        <Link 
                          to={`/dashboard/customers/${customer.id}`}
                          className="text-teal-500 hover:text-teal-600 transition-colors duration-200 flex items-center text-sm font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-600">
                  No customers found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sales View Modal */}
      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-300 sticky top-0 bg-slate-50 z-10">
              <div>
                <h3 className="text-slate-900 text-lg sm:text-xl font-semibold">
                  {selectedCustomer.name}'s Purchase History
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  {customerSales.length} sale{customerSales.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-200 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              {isLoadingSales ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : customerSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h4 className="text-slate-900 text-lg font-medium mb-2">No Sales Found</h4>
                  <p className="text-slate-600 max-w-md">
                    This customer hasn't made any purchases yet. All their future sales will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerSales.map((sale) => (
                    <div key={sale.id} className="border border-slate-300 rounded-md overflow-hidden">
                      <div className="bg-slate-100 p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <h4 className="text-slate-900 font-medium">
                            Sale #{sale.id}
                          </h4>
                          <p className="text-slate-600 text-sm mt-1">
                            {new Date(sale.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                            <p className="text-teal-600 font-medium">
                              {sale.total_price.toFixed(2)} XAF
                            </p>
                          </div>
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="text-indigo-600 hover:text-indigo-500 transition-colors duration-200 flex items-center text-sm font-medium bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Receipt
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50">
                        <h5 className="text-slate-600 text-sm font-medium mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Purchased Items
                        </h5>
                        <div className="space-y-3">
                          {sale.items?.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-100 rounded-md gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-900 truncate">{item.product_name}</p>
                                <div className="flex items-center mt-1 text-sm">
                                  <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded mr-2">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-slate-600">
                                    {item.price_per_unit.toFixed(2)} XAF each
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-900 font-medium">
                                  {item.total_price.toFixed(2)} XAF
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-300 sticky bottom-0 bg-slate-50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full px-4 py-2.5 bg-slate-500 hover:bg-slate-600 text-slate-50 rounded-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedSale && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-300 w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-300 sticky top-0 bg-slate-50 z-10">
              <h3 className="text-slate-900 text-lg sm:text-xl font-semibold">
                Receipt for Sale #{selectedSale.id}
              </h3>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-full hover:bg-slate-200 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Receipt Preview */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <div id="receipt-template" className="bg-white p-6 rounded-md shadow-sm max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Sales Receipt</h2>
                  <p className="text-slate-600">#{selectedSale.id}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Date:</span>
                    <span className="text-slate-900">
                      {new Date(selectedSale.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Customer:</span>
                    <span className="text-slate-900">{selectedCustomer.name}</span>
                  </div>
                  {selectedCustomer.contact_info && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Contact:</span>
                      <span className="text-slate-900">{selectedCustomer.contact_info}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-b border-slate-200 py-4 my-4">
                  <div className="flex justify-between font-semibold text-slate-900 mb-2">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  
                  {selectedSale.items?.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <div>
                        <p className="text-slate-900">{item.product_name}</p>
                        <p className="text-sm text-slate-600">
                          {item.quantity} × {item.price_per_unit.toFixed(2)} XAF
                        </p>
                      </div>
                      <p className="text-slate-900">{item.total_price.toFixed(2)} XAF</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between font-bold text-lg text-slate-900 mt-4">
                  <span>Total:</span>
                  <span>{selectedSale.total_price.toFixed(2)} XAF</span>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
                  <p>Thank you for your business!</p>
                  <p className="mt-1">Please come again</p>
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="p-4 border-t border-slate-300 sticky bottom-0 bg-slate-50 grid grid-cols-3 gap-3">
              <button
                onClick={() => generateReceipt('pdf')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-50 rounded-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={() => generateReceipt('png')}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-50 rounded-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                PNG
              </button>
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-50 rounded-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;