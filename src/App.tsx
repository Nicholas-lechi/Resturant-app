import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ScrollToTop } from '@/components/site/ScrollToTop';
import { SiteLayout } from '@/layouts/SiteLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/dashboard/ProtectedRoute';
import { HomePage } from '@/pages/site/HomePage';
import { MenuPage } from '@/pages/site/MenuPage';
import { ProductPage } from '@/pages/site/ProductPage';
import { CartPage } from '@/pages/site/CartPage';
import { CheckoutPage } from '@/pages/site/CheckoutPage';
import { OrderPage } from '@/pages/site/OrderPage';
import { NotFoundPage } from '@/pages/site/NotFoundPage';
import { LoginPage } from '@/pages/dashboard/LoginPage';
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { OrdersPage } from '@/pages/dashboard/OrdersPage';
import { ProductsPage } from '@/pages/dashboard/ProductsPage';
import { PaymentsPage } from '@/pages/dashboard/PaymentsPage';
import { CustomersPage } from '@/pages/dashboard/CustomersPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';

/**
 * Keeps every open tab in sync. Open the website in one tab and the dashboard in another:
 * an order placed on the website pops up in the dashboard instantly, and status changes
 * in the dashboard show up on the customer's order page.
 */
function useCrossTabSync() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mk-restaurant') useRestaurantStore.persist.rehydrate();
      if (e.key === 'mk-cart') useCartStore.persist.rehydrate();
      if (e.key === 'mk-auth') useAuthStore.persist.rehydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
}

export default function App() {
  useCrossTabSync();

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="menu/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/:id" element={<OrderPage />} />
          <Route path="track" element={<OrderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="dashboard/login" element={<LoginPage />} />
        <Route path="dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
