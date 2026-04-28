import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCollection, HiPlus, HiLockClosed, HiPhotograph } from 'react-icons/hi'
import { getUserGroups, joinGroup } from '../../services/groupService'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'

const UserGroupsPage = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [password, setPassword] = useState('')
  const [joining, setJoining] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const { data } = await getUserGroups()
      setGroups(data)
    } catch (err) {
      toast.error('Failed to load your groups')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (e) => {
    e.preventDefault()
    if (!password.trim()) return toast.error('Please enter a password')
    
    setJoining(true)
    try {
      const { data } = await joinGroup(password)
      toast.success(data.message)
      setShowAddModal(false)
      setPassword('')
      fetchGroups() // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid password or group not found')
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <Loader size="page" text="Loading your collections..." />

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl max-[521px]:text-xl font-bold text-white flex items-center gap-3">
            <HiCollection className="w-7 h-7 max-[521px]:w-6 max-[521px]:h-6 text-primary-400" />
            My Groups
          </h1>
          <p className="text-dark-400 mt-1 max-[521px]:text-xs">Collections you have joined via password</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 max-[521px]:px-4 max-[521px]:py-2 max-[521px]:text-sm whitespace-nowrap"
        >
          <HiPlus className="w-5 h-5 max-[521px]:w-4 max-[521px]:h-4" />
          Add Group
        </button>
      </motion.div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, i) => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/user/groups/${group._id}`)}
              className="glass-card overflow-hidden cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                {group.thumbnail ? (
                  <img
                    src={group.thumbnail}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                    <HiPhotograph className="w-12 h-12 text-dark-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-primary-500/20 backdrop-blur-sm">
                  <HiLockClosed className="w-4 h-4 text-primary-400" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                  {group.name}
                </h3>
                <p className="text-dark-500 text-sm">{group.imageCount || 0} photos</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 max-[521px]:py-10 glass-card"
        >
          <HiLockClosed className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <p className="text-dark-500 text-lg mb-6">You haven't joined any private groups yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            Join Your First Group
          </button>
        </motion.div>
      )}

      {/* Add Group Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setPassword('') }}
        title="Join Private Group"
        size="sm"
      >
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <p className="text-dark-400 text-sm">
            Enter the unique password shared with you to add the group to your dashboard.
          </p>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Group Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="input-field"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); setPassword('') }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={joining}
              className="btn-primary flex-1"
            >
              {joining ? 'Joining...' : 'Add Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UserGroupsPage
