import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiUsers, HiSearch, HiCheckCircle, HiXCircle, HiMail, HiBadgeCheck } from 'react-icons/hi'
import { getAllUsers } from '../../services/userService'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'

const UsersManagePage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  const adminUsers = filteredUsers.filter(u => u.role === 'admin')
  const regularUsers = filteredUsers.filter(u => u.role !== 'admin')

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  const UserTable = ({ data, title, icon: Icon, colorClass }) => (
    <div className="space-y-4 mb-10">
      <div className="flex items-center gap-2 px-1">
        <div className={`w-1.5 h-6 rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`} />
        <h2 className={`text-lg font-bold uppercase tracking-wider ${colorClass} flex items-center gap-2`}>
          {Icon && <Icon className="w-5 h-5" />}
          {title} 
          <span className="text-dark-500 text-sm font-medium ml-1">({data.length})</span>
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-dark-800 glass-card">
        <table className="w-full text-left border-collapse">
          <thead className="bg-dark-900/50 text-dark-400 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Face ID</th>
              <th className="px-6 py-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/50">
            {data.map((user) => (
              <motion.tr 
                key={user._id} 
                variants={item}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500 transition-all shadow-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 ring-2 ring-dark-700">
                          <span className="font-bold">{user.name?.[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-dark-950 ${user.role === 'admin' ? 'bg-purple-500' : 'bg-primary-500'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{user.name}</p>
                      <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-dark-300">
                    <HiMail className="w-4 h-4 text-dark-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    {user.isFaceRegistered ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                        <HiCheckCircle className="w-3.5 h-3.5" /> Synced
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-800 text-dark-500 text-[10px] font-bold uppercase tracking-wider border border-dark-700">
                        <HiXCircle className="w-3.5 h-3.5" /> Not Setup
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-dark-400 text-xs font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((user) => (
          <motion.div
            key={user._id}
            variants={item}
            className="glass-card p-5 space-y-4 border border-dark-800/50"
          >
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/30 shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-dark-800 flex items-center justify-center text-primary-400 text-xl font-bold border border-dark-700">
                  {user.name?.[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-white truncate">{user.name}</h3>
                <p className="text-sm text-dark-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dark-800/50">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-dark-500 font-extrabold">Face ID</p>
                <div className={`text-xs font-bold ${user.isFaceRegistered ? 'text-green-400' : 'text-dark-500'}`}>
                  {user.isFaceRegistered ? 'Synced' : 'Not Setup'}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-wider text-dark-500 font-extrabold">Joined</p>
                <p className="text-white text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader text="Fetching user data..." />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HiUsers className="text-primary-400" /> User Management
          </h1>
          <p className="text-dark-400 mt-1">Manage and view all registered gallery users</p>
        </motion.div>
        <div className="relative w-full md:w-80">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 h-11"
          />
        </div>
      </div>

      {/* Analytics Mini Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Face IDs Setup', value: users.filter(u => u.isFaceRegistered).length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'New This Week', value: users.filter(u => (new Date() - new Date(u.createdAt)) < (7 * 24 * 60 * 60 * 1000)).length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-4 rounded-2xl glass-card border-none ${stat.bg}`}>
            <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sections View */}
      <AnimatePresence mode="wait">
        {filteredUsers.length > 0 ? (
          <motion.div key="sections" variants={container} initial="hidden" animate="show">
            {adminUsers.length > 0 && (
              <UserTable 
                data={adminUsers} 
                title="Administrators" 
                icon={HiBadgeCheck} 
                colorClass="text-purple-400"
              />
            )}
            
            {regularUsers.length > 0 && (
              <UserTable 
                data={regularUsers} 
                title="Registered Members" 
                icon={HiUsers} 
                colorClass="text-primary-400"
              />
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-dark-900 rounded-full flex items-center justify-center mb-6 border border-dark-800">
              <HiSearch className="w-10 h-10 text-dark-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-dark-500">Try adjusting your search query</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UsersManagePage
