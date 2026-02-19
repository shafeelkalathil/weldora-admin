import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Database } from 'lucide-react';
import ToastContainer from './components/Toast';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Staff = lazy(() => import('./pages/Staff'));
const StaffForm = lazy(() => import('./pages/StaffForm'));
const StaffDetails = lazy(() => import('./pages/StaffDetails'));
const Products = lazy(() => import('./pages/Products'));
const ProductForm = lazy(() => import('./pages/ProductForm'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderForm = lazy(() => import('./pages/OrderForm'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails'));
const Assets = lazy(() => import('./pages/Assets'));
const AssetForm = lazy(() => import('./pages/AssetForm'));
const AssetDetails = lazy(() => import('./pages/AssetDetails'));
const Materials = lazy(() => import('./pages/Materials'));
const MaterialForm = lazy(() => import('./pages/MaterialForm'));
const MaterialDetails = lazy(() => import('./pages/MaterialDetails'));
const Accounts = lazy(() => import('./pages/Accounts'));
const AccountForm = lazy(() => import('./pages/AccountForm'));
const AccountDetails = lazy(() => import('./pages/AccountDetails'));
const Enquiries = lazy(() => import('./pages/Enquiries'));
const EnquiryForm = lazy(() => import('./pages/EnquiryForm'));
const EnquiryDetails = lazy(() => import('./pages/EnquiryDetails'));
const Companies = lazy(() => import('./pages/Companies'));
const CompanyForm = lazy(() => import('./pages/CompanyForm'));
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'));

const Placeholder = ({ title }: { title: string }) => (
    <div className="animate-fade-in glass card" style={{ padding: '60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{title} Feature  Coming Soon ......</h2>
    </div>
);

const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <div className="animate-pulse">Loading...</div>
    </div>
);

function App() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="app-container">
            {!isLoginPage && <Sidebar />}
            <main className={isLoginPage ? '' : 'main-content'} style={isLoginPage ? { width: '100%', flex: 1 } : {}}>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes - Accessible by both Manager and Staff */}
                        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                        <Route path="/customers/view/:id" element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />

                        <Route path="/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
                        <Route path="/enquiries/add" element={<ProtectedRoute><EnquiryForm /></ProtectedRoute>} />
                        <Route path="/enquiries/view/:id" element={<ProtectedRoute><EnquiryDetails /></ProtectedRoute>} />
                        <Route path="/enquiries/edit/:id" element={<ProtectedRoute><EnquiryForm /></ProtectedRoute>} />

                        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                        <Route path="/products/add" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                        <Route path="/products/view/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                        <Route path="/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/orders/add" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
                        <Route path="/orders/view/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                        <Route path="/orders/edit/:id" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />

                        {/* Manager/Admin Only Routes */}
                        <Route path="/staff" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Staff /></ProtectedRoute>} />
                        <Route path="/staff/add" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><StaffForm /></ProtectedRoute>} />
                        <Route path="/staff/view/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><StaffDetails /></ProtectedRoute>} />
                        <Route path="/staff/edit/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><StaffForm /></ProtectedRoute>} />


                        <Route path="/companies" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Companies /></ProtectedRoute>} />
                        <Route path="/companies/add" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><CompanyForm /></ProtectedRoute>} />
                        <Route path="/companies/view/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><CompanyDetails /></ProtectedRoute>} />
                        <Route path="/companies/edit/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><CompanyForm /></ProtectedRoute>} />

                        <Route path="/assets" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Assets /></ProtectedRoute>} />
                        <Route path="/assets/add" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AssetForm /></ProtectedRoute>} />
                        <Route path="/assets/view/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AssetDetails /></ProtectedRoute>} />
                        <Route path="/assets/edit/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AssetForm /></ProtectedRoute>} />

                        <Route path="/materials" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Materials /></ProtectedRoute>} />
                        <Route path="/materials/add" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><MaterialForm /></ProtectedRoute>} />
                        <Route path="/materials/view/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><MaterialDetails /></ProtectedRoute>} />
                        <Route path="/materials/edit/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><MaterialForm /></ProtectedRoute>} />

                        <Route path="/accounts" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Accounts /></ProtectedRoute>} />
                        <Route path="/accounts/add" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AccountForm /></ProtectedRoute>} />
                        <Route path="/accounts/view/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AccountDetails /></ProtectedRoute>} />
                        <Route path="/accounts/edit/:id" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><AccountForm /></ProtectedRoute>} />

                        <Route path="/attendance" element={<ProtectedRoute requiredRoles={['Manager', 'Admin']}><Placeholder title="Attendance" /></ProtectedRoute>} />
                    </Routes>
                </Suspense>
            </main>
            <ToastContainer />
        </div>
    );
}

export default App;
