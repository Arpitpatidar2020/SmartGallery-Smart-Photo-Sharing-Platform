import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiPhotograph, HiLockClosed, HiEye } from 'react-icons/hi'
import { getAllGroups, verifyGroupPassword } from '../../services/groupService'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'

const GroupImagesPage = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const { data } = await getAllGroups()
      setGroups(data)
    } catch (err) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupClick = (group) => {
    if (group.isPublic) {
      navigate(`/groups/${group._id}`)
    } else {
      setSelectedGroup(group)
    }
  }

  const handleVerifyPassword = async () => {
    if (!password.trim()) return toast.error('Enter the group password')
    setVerifying(true)
    try {
      await verifyGroupPassword(selectedGroup._id, password)
      toast.success('Access granted!')
      setSelectedGroup(null)
      setPassword('')
      if (user) {
        navigate(`/groups/${selectedGroup._id}`)
      } else {
        navigate('/login', { state: { redirectTo: `/groups/${selectedGroup._id}` } })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect password')
    } finally {
      setVerifying(false)
    }
  }

  const publicGroups = groups.filter((g) => g.isPublic)
  const protectedGroups = groups.filter((g) => !g.isPublic)

  if (loading) return <Loader size="page" text="Loading groups..." />

  return (
    <div className="page-container">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Group <span className="gradient-text">Images</span>
            </h1>
            <p className="text-dark-400 text-lg">Browse event galleries. Public and password-protected collections.</p>
          </motion.div>

          {/* Public Groups */}
          {publicGroups.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-dark-200 mb-6 flex items-center gap-2">
                <HiEye className="w-5 h-5 text-green-400" />
                Public Groups
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {publicGroups.map((group, i) => (
                  <GroupCard key={group._id} group={group} index={i} onClick={() => handleGroupClick(group)} />
                ))}
              </div>
            </>
          )}

          {/* Protected Groups */}
          {protectedGroups.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-dark-200 mb-6 flex items-center gap-2">
                <HiLockClosed className="w-5 h-5 text-amber-400" />
                Password Protected Groups
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {protectedGroups.map((group, i) => (
                  <GroupCard key={group._id} group={group} index={i} onClick={() => handleGroupClick(group)} />
                ))}
              </div>
            </>
          )}

          {groups.length === 0 && (
            <div className="text-center py-20">
              <HiPhotograph className="w-16 h-16 text-dark-700 mx-auto mb-4" />
              <p className="text-dark-500 text-lg">No groups available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Modal for Private Groups */}
      <Modal
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title="🔒 Private Collection"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <HiLockClosed className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{selectedGroup?.name}</h3>
          <p className="text-dark-400 text-sm mb-6 leading-relaxed">
            This collection is password protected. If you have the group password, please 
            <span className="text-primary-400 font-semibold"> Sign Up</span> or 
            <span className="text-primary-400 font-semibold"> Login</span>. 
            After logging in, you can use your password to add this group to your personal dashboard and unlock all images.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link 
              to="/signup" 
              className="btn-primary w-full py-3"
              onClick={() => setSelectedGroup(null)}
            >
              Sign Up to Join
            </Link>
            <Link 
              to="/login" 
              className="text-dark-400 hover:text-white text-sm font-medium transition-colors"
              onClick={() => setSelectedGroup(null)}
            >
              Already have an account? Login
            </Link>
            <button 
              onClick={() => setSelectedGroup(null)} 
              className="mt-2 text-dark-500 hover:text-dark-300 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const GroupCard = ({ group, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
      {!group.isPublic && (
        <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-amber-500/20 backdrop-blur-sm">
          <HiLockClosed className="w-4 h-4 text-amber-400" />
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="text-lg font-semibold text-white mb-1">{group.name}</h3>
      <p className="text-dark-500 text-sm">{group.imageCount || 0} photos</p>
    </div>
  </motion.div>
)

export default GroupImagesPage
