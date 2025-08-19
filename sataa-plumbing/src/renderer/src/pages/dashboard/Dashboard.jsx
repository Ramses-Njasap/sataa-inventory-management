import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', isSidebarOpen); // Debug log
    setIsSidebarOpen((prev) => {
      console.log('New sidebar state:', !prev); // Debug log
      return !prev;
    });
  };

  const closeSidebar = () => {
    console.log('Closing sidebar'); // Debug log
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      console.log('Initiating logout'); // Debug log
      await window.api.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-slate-100 text-slate-900 w-64 transform transition-transform duration-300 ease-in-out z-50 shadow-md border-r border-slate-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Dashboard</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard/accounts"
                className="block p-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-slate-200 hover:text-indigo-500 transition-all duration-200"
                onClick={closeSidebar}
              >
                Accounts
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/customers"
                className="block p-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-slate-200 hover:text-indigo-500 transition-all duration-200"
                onClick={closeSidebar}
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/product-categories"
                className="block p-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-slate-200 hover:text-indigo-500 transition-all duration-200"
                onClick={closeSidebar}
              >
                Product Categories
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/products"
                className="block p-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-slate-200 hover:text-indigo-500 transition-all duration-200"
                onClick={closeSidebar}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/sales"
                className="block p-2 rounded-md text-sm font-medium text-indigo-600 hover:bg-slate-200 hover:text-indigo-500 transition-all duration-200"
                onClick={closeSidebar}
              >
                Sales
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full p-2 rounded-md text-sm font-medium text-left text-rose-400 hover:bg-slate-200 hover:text-rose-500 transition-all duration-200"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with Hamburger Toggle */}
        <header className="bg-slate-100 p-4 flex items-center border-b border-slate-300 shadow-sm">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex flex-col justify-center items-center mr-4"
            aria-label="Toggle sidebar"
          >
            <span
              className={`w-6 h-0.5 bg-slate-900 mb-1.5 transition-all duration-300 ${
                isSidebarOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-slate-900 mb-1.5 transition-all duration-300 ${
                isSidebarOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-slate-900 transition-all duration-300 ${
                isSidebarOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            ></span>
          </button>
          <Link to='/dashboard' className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline">
            <h1 className="text-slate-900 text-xl font-semibold">Dashboard</h1>
          </Link>
        </header>

        {/* Content Outlet */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;