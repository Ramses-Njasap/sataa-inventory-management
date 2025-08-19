import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Products from './pages/products/Products';
import Checkout from './pages/products/Checkout';
import Dashboard from './pages/dashboard/Dashboard';
import Welcome from './pages/dashboard/Welcome';
import {default as AdminProducts} from './pages/dashboard/products/Products';

import ProductDetail from './pages/dashboard/products/ProductDetail';
import ProductCreate from './pages/dashboard/products/ProductCreate';
import ProductCategories from './pages/dashboard/products/ProductCategory';
import ProductCategoryDetail from './pages/dashboard/products/ProductCategoryDetail';
import ProductCategoryCreate from './pages/dashboard/products/ProductCategoryCreate';
import CustomerList from './pages/dashboard/customers/CustomerList';
import CustomerCreate from './pages/dashboard/customers/CustomerCreate';
import CustomerUpdate from './pages/dashboard/customers/CustomerUpdate';
import SalesList from './pages/dashboard/sales/SalesList';
import SaleCreate from './pages/dashboard/sales/SaleCreate';
import SalesUpdate from './pages/dashboard/sales/SalesUpdate';
import SaleItemList from './pages/dashboard/sales/SaleItemList';
import SaleItemCreate from './pages/dashboard/sales/SaleItemCreate';
import SaleItemUpdate from './pages/dashboard/sales/SaleItemUpdate';
import AccountList from './pages/dashboard/accounts/AccountList';
import AccountCreate from './pages/dashboard/accounts/AccountCreate';
import AccountDetail from './pages/dashboard/accounts/AccountDetail';
import AccountUpdate from './pages/dashboard/accounts/AccountUpdate';


export default function App() {
  console.log('App component rendered');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route path="sales/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Welcome />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/new" element={<ProductCreate />} />
          <Route path="product-categories" element={<ProductCategories />} />
          <Route path="product-categories/:id" element={<ProductCategoryDetail />} />
          <Route path="product-categories/new" element={<ProductCategoryCreate />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerCreate />} />
          <Route path="customers/:id" element={<CustomerUpdate />} />

          <Route path="sales" element={<SalesList />} />
          <Route path="sales/new" element={<SaleCreate />} />
          <Route path="sales/:id" element={<SalesUpdate />} />

          <Route path="sales/sales-items" element={<SaleItemList />} />
          <Route path="sales/:saleId/items" element={<SaleItemList />} />
          <Route path="sales/:saleId/items/new" element={<SaleItemCreate />} />
          <Route path="sales/:saleId/items/:itemId" element={<SaleItemUpdate />} />

          <Route path="accounts" element={<AccountList />} />
          <Route path="accounts/new" element={<AccountCreate />} />
          <Route path="accounts/:id" element={<AccountDetail />} />
          <Route path="accounts/:id/edit" element={<AccountUpdate />} />
          {/* Add other routes here */}
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}