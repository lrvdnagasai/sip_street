import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import SkeletonLoader from '../components/common/SkeletonLoader';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const BillingPage = lazy(() => import('../pages/BillingPage'));
const ReceiptsPage = lazy(() => import('../pages/ReceiptsPage'));
const ExpensesPage = lazy(() => import('../pages/ExpensesPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const BackupPage = lazy(() => import('../pages/BackupPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('../pages/ServerErrorPage'));
const OfflinePage = lazy(() => import('../pages/OfflinePage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

const PageFallback = () => (
  <div className="p-6">
    <SkeletonLoader type="table" count={6} />
  </div>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Shell Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="backup" element={<BackupPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="forbidden" element={<ForbiddenPage />} />
            <Route path="server-error" element={<ServerErrorPage />} />
            <Route path="offline" element={<OfflinePage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
