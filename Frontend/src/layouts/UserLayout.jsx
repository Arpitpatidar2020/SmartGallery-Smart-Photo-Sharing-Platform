import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import { HiMenu } from 'react-icons/hi'

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Universal Top Bar */}
      <div className="flex items-center justify-between p-4 bg-dark-900 border-b border-dark-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h2 className="font-bold text-white text-sm">SmartGallery</h2>
            </div>
          )}
        </div>
        {/* Mobile-only toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
        >
          <HiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        role="user" 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default UserLayout
