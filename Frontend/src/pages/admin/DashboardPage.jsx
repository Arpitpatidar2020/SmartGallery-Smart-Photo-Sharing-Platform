import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiCollection, HiPhotograph, HiPencilAlt, HiUserGroup } from 'react-icons/hi'
import { getStats } from '../../services/userService'
import Loader from '../../components/shared/Loader'

const statCards = [
  { key: 'totalGroups', label: 'Total Groups', icon: HiCollection, gradient: 'from-primary-500 to-primary-600' },
  { key: 'publishedImages', label: 'Published Images', icon: HiPhotograph, gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'draftImages', label: 'Draft Images', icon: HiPencilAlt, gradient: 'from-amber-500 to-orange-500' },
  { key: 'activeAdmins', label: 'Active Admins', icon: HiUserGroup, gradient: 'from-cyan-500 to-blue-500' },
]

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader size="page" text="Loading dashboard..." />

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back! Here&apos;s your gallery overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.[card.key] ?? 0}
            </div>
            <div className="text-dark-400 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-dark-400 text-sm">
          <li>• Go to <strong className="text-dark-200">All Groups</strong> to create a new event gallery</li>
          <li>• Use <strong className="text-dark-200">One-Shot Upload</strong> to upload entire folders at once</li>
          <li>• Toggle images between <strong className="text-dark-200">Published</strong> and <strong className="text-dark-200">Draft</strong> to control visibility</li>
          <li>• Users can find themselves in photos using <strong className="text-dark-200">Face Recognition</strong></li>
        </ul>
      </motion.div>
    </div>
  )
}

export default DashboardPage
