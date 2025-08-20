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
import UserHistory from './pages/dashboard/history/UserHistory';
import UserHistoryDetails from './pages/dashboard/history/UserHistoryDetail';


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
          <Route path="products" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
                <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="products/:id" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <ProductDetail />
            </ProtectedRoute>
          } />
          <Route path="products/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <ProductCreate />
            </ProtectedRoute>
          } />
          <Route path="product-categories" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <ProductCategories />
            </ProtectedRoute>
          } />
          <Route path="product-categories/:id" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <ProductCategoryDetail />
            </ProtectedRoute>
          } />
          <Route path="product-categories/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <ProductCategoryCreate />
            </ProtectedRoute>
          } />
          <Route path="customers" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <CustomerList />
            </ProtectedRoute>
          } />
          <Route path="customers/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <CustomerCreate />
            </ProtectedRoute>
          } />
          <Route path="customers/:id" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <CustomerUpdate />
            </ProtectedRoute>
          } />

          <Route path="sales" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <SalesList />
            </ProtectedRoute>
          } />
          <Route path="sales/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <SaleCreate />
            </ProtectedRoute>
          } />
          <Route path="sales/:id" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <SalesUpdate />
            </ProtectedRoute>
          } />

          <Route path="sales/sales-items" element={
            <ProtectedRoute requiredRole={['admin']}>
              <SaleItemList />
            </ProtectedRoute>
          } />
          <Route path="sales/:saleId/items" element={
            <ProtectedRoute requiredRole={['admin']}>
              <SaleItemList />
            </ProtectedRoute>
          } />
          <Route path="sales/:saleId/items/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <SaleItemCreate />
            </ProtectedRoute>
          } />
          <Route path="sales/:saleId/items/:itemId" element={
            <ProtectedRoute requiredRole={['admin']}>
              <SaleItemUpdate />
            </ProtectedRoute>
          } />

          <Route path="accounts" element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <AccountList />
            </ProtectedRoute>
          } />
          <Route path="accounts/new" element={
            <ProtectedRoute requiredRole={['admin']}>
              <AccountCreate />
            </ProtectedRoute>
          } />
          <Route path="accounts/:id" element={
            <ProtectedRoute requiredRole={['admin']}>
              <AccountDetail />
            </ProtectedRoute>
          }/>
          <Route path="accounts/:id/edit" element={
            <ProtectedRoute requiredRole={['admin']}>
              <AccountUpdate />
            </ProtectedRoute>
          }/>
          <Route path="history" element={
            <ProtectedRoute requiredRole={['admin']}>
              <UserHistory />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="/dashboard/history/:id" element={
          <ProtectedRoute requiredRole={['admin']}>
            <UserHistoryDetails />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}