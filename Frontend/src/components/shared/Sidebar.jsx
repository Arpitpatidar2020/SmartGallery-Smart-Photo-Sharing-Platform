import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  HiViewGrid, HiUser, HiPhotograph, HiGlobe, HiLogout,
  HiCollection, HiSparkles, HiX, HiChevronLeft, HiChevronRight, 
  HiUsers
} from 'react-icons/hi'

const Sidebar = ({ role, isOpen, onClose, onToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: HiViewGrid },
    { name: 'Profile', path: '/admin/profile', icon: HiUser },
    { name: 'Users', path: '/admin/users', icon: HiUsers },
    { name: 'All Groups', path: '/admin/groups', icon: HiCollection },
    { name: 'Public Website', path: '/', icon: HiGlobe, external: true },
  ]

  const userLinks = [
    { name: 'Profile', path: '/user/profile', icon: HiUser },
    { name: 'All Groups', path: '/user/groups', icon: HiCollection },
    { name: 'My Images', path: '/user/my-images', icon: HiSparkles },
    { name: 'Public Website', path: '/', icon: HiGlobe, external: true },
  ]

  const links = role === 'admin' ? adminLinks : userLinks

  const handleLogout = () => {
    if (window.innerWidth < 1024) onClose?.()
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      className={`fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-dark-800 flex flex-col z-50 transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Desktop Toggle Button (Chevron) */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-dark-800 border border-dark-700 border-l-0 rounded-r-xl items-center justify-center text-dark-400 hover:text-white hover:bg-primary-500 transition-all duration-300 shadow-xl group"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? (
          <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        ) : (
          <HiChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        )}
      </button>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute right-4 top-6 text-dark-400 hover:text-white"
      >
        <HiX className="w-6 h-6" />
      </button>
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h2 className="font-bold text-white">SmartGallery</h2>
            <p className="text-xs text-dark-500 capitalize">{role} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin' || link.path === '/user'}
            target={link.external ? '_blank' : undefined}
            onClick={() => {
              if (!link.external && window.innerWidth < 1024) {
                onClose?.()
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive && !link.external
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-dark-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-400 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-200 truncate">{user?.name}</p>
            <p className="text-xs text-dark-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <HiLogout className="w-5 h-5" />
          Logout
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
