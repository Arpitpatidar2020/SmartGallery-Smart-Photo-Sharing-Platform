import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiCamera, HiUser, HiMail, HiLockClosed, HiTrash, HiEye, HiEyeOff } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, uploadProfileImage, deleteProfileImage } from '../../services/userService'
import toast from 'react-hot-toast'
import { confirmToast } from '../../utils/toastUtils'

const ProfilePage = ({ isAdmin = true }) => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image')
    if (file.size > 4.5 * 1024 * 1024) {
      e.target.value = '' // Reset input
      return toast.error('Image must be under 4.5MB (Vercel limit)')
    }

    const loadingToast = toast.loading('Uploading image...')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await uploadProfileImage(formData)
      // Add timestamp to force image refresh in browser (prevents stale/broken state)
      const freshUrl = `${data.profileImage}${data.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`
      updateUser({ profileImage: freshUrl })
      toast.success('Profile image updated!', { id: loadingToast })
    } catch (err) {
      toast.error('Failed to upload image', { id: loadingToast })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    confirmToast('Are you sure you want to remove your profile image?', async () => {
      const loadingToast = toast.loading('Removing image...')
      setUploading(true)
      try {
        await deleteProfileImage()
        updateUser({ profileImage: '' })
        toast.success('Profile image removed', { id: loadingToast })
      } catch (err) {
        toast.error('Failed to remove image', { id: loadingToast })
      } finally {
        setUploading(false)
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return toast.error('Name and email are required')

    const loadingToast = toast.loading('Updating profile...')
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      const { data } = await updateProfile(payload)
      updateUser(data)
      setForm({ ...form, password: '' })
      toast.success('Profile updated!', { id: loadingToast })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-dark-400 mt-1">Manage your account settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card max-w-2xl p-8"
      >
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-dark-800 shadow-2xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-5xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Spinning loader over image only during upload */}
            {uploading && (
              <div className="absolute inset-0 bg-dark-950/60 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Action Buttons Below Image */}
          <div className="flex items-center gap-3">
            <label className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2 cursor-pointer hover:text-primary-400 transition-all">
              <HiCamera className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Change Photo (Max: 4.5MB)'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            
            {user?.profileImage && !uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-danger !py-2 !px-4 text-sm flex items-center gap-2 hover:bg-red-500/20"
              >
                <HiTrash className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-300 mb-2 font-medium">
              <HiUser className="w-4 h-4" /> Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-300 mb-2 font-medium">
              <HiMail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-300 mb-2 font-medium">
              <HiLockClosed className="w-4 h-4" /> New Password (optional)
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-10"
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                title={showPw ? "Hide Password" : "Show Password"}
              >
                {showPw ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary !py-3">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ProfilePage
