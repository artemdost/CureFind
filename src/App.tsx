import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ClinicPage from './pages/ClinicPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterClinicPage from './pages/auth/RegisterClinicPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import ClinicNewPage from './pages/dashboard/ClinicNewPage';
import ClinicProfilePage from './pages/dashboard/ClinicProfilePage';
import DoctorsPage from './pages/dashboard/DoctorsPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import PostsPage from './pages/dashboard/PostsPage';
import PromotionsPage from './pages/dashboard/PromotionsPage';
import ReviewsPage from './pages/dashboard/ReviewsPage';
import CallsPage from './pages/dashboard/CallsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import AdminClinicsPage from './pages/dashboard/admin/AdminClinicsPage';
import AdminReviewsPage from './pages/dashboard/admin/AdminReviewsPage';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/clinic/:id" element={<ClinicPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/clinic" element={<RegisterClinicPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHomePage />} />
              <Route path="clinic/new" element={<ClinicNewPage />} />
              <Route path="clinic" element={<ClinicProfilePage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="calls" element={<CallsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />

              <Route
                path="admin/clinics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminClinicsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reviews"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReviewsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
