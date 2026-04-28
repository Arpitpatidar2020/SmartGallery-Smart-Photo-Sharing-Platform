import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Loader from './components/shared/Loader'
import ProtectedRoute from './components/shared/ProtectedRoute'
import ScrollToTop from './components/shared/ScrollToTop'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'

// Public Pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import FeaturesPage from './pages/public/FeaturesPage'
import GroupImagesPage from './pages/public/GroupImagesPage'
import GroupDetailPage from './pages/public/GroupDetailPage'
import ContactPage from './pages/public/ContactPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage'
import AdminProfile from './pages/admin/ProfilePage'
import AdminAllGroups from './pages/admin/AllGroupsPage'
import AdminGroupManage from './pages/admin/GroupManagePage'
import AdminUsersManage from './pages/admin/UsersManagePage'

// User Pages
import UserProfile from './pages/user/ProfilePage'
import UserGroups from './pages/user/UserGroupsPage'
import GroupAccess from './pages/user/GroupAccessPage'
import UserMyImages from './pages/user/MyImagesPage'

function App() {
  const { loading } = useAuth()

  if (loading) return <Loader size="page" text="Loading SmartGallery..." />

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/groups" element={<GroupImagesPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="users" element={<AdminUsersManage />} />
        <Route path="groups" element={<AdminAllGroups />} />
        <Route path="groups/:id" element={<AdminGroupManage />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/groups" replace />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="groups" element={<UserGroups />} />
        <Route path="groups/:id" element={<GroupAccess />} />
        <Route path="my-images" element={<UserMyImages />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
