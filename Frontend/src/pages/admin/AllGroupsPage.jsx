import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiPencil, HiTrash, HiPhotograph, HiLockClosed, HiEye } from 'react-icons/hi'
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '../../services/groupService'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'
import { confirmToast } from '../../utils/toastUtils'

const AllGroupsPage = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [form, setForm] = useState({ name: '', isPublic: true, password: '' })
  const [thumbnail, setThumbnail] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchGroups() }, [])

  const fetchGroups = async () => {
    try {
      const { data } = await getAllGroups()
      setGroups(data)
    } catch { toast.error('Failed to load groups') }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({ name: '', isPublic: true, password: '' })
    setThumbnail(null)
    setEditGroup(null)
  }

  const openCreate = () => { resetForm(); setShowModal(true) }
  const openEdit = (group) => {
    setEditGroup(group)
    setForm({ name: group.name, isPublic: group.isPublic, password: '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Group name is required')
    if (!form.isPublic && !editGroup && !form.password) return toast.error('Password is required for protected groups')

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('isPublic', form.isPublic)
      if (!form.isPublic && form.password) fd.append('password', form.password)
      if (thumbnail) fd.append('image', thumbnail)

      if (editGroup) {
        await updateGroup(editGroup._id, fd)
        toast.success('Group updated!')
      } else {
        await createGroup(fd)
        toast.success('Group created!')
      }

      setShowModal(false)
      resetForm()
      fetchGroups()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id) => {
    confirmToast('Delete this group and all its images? This cannot be undone.', async () => {
      try {
        await deleteGroup(id)
        toast.success('Group deleted')
        setGroups(groups.filter((g) => g._id !== id))
      } catch { toast.error('Failed to delete group') }
    })
  }

  if (loading) return <Loader size="page" text="Loading groups..." />

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl max-[521px]:text-xl font-bold text-white">All Groups</h1>
          <p className="text-dark-400 mt-1 max-[521px]:text-xs">{groups.length} groups total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 max-[521px]:px-4 max-[521px]:py-2 max-[521px]:text-sm whitespace-nowrap">
          <HiPlus className="w-5 h-5 max-[521px]:w-4 max-[521px]:h-4" />
          Create Group
        </button>
      </motion.div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {groups.map((group, i) => (
            <motion.div
              key={group._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <Link to={`/admin/groups/${group._id}`}>
                <div className="relative h-44 overflow-hidden">
                  {group.thumbnail ? (
                    <img src={group.thumbnail} alt={group.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                      <HiPhotograph className="w-10 h-10 text-dark-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-dark-900/60 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                    {group.isPublic ? (
                      <><HiEye className="w-3.5 h-3.5 text-green-400" /> <span className="text-green-400">Public</span></>
                    ) : (
                      <><HiLockClosed className="w-3.5 h-3.5 text-amber-400" /> <span className="text-amber-400">Protected</span></>
                    )}
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <Link to={`/admin/groups/${group._id}`}>
                  <h3 className="text-lg font-semibold text-white mb-1 hover:text-primary-400 transition-colors">{group.name}</h3>
                </Link>
                <p className="text-dark-500 text-sm mb-4">{group.imageCount || 0} photos</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(group)} className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-1">
                    <HiPencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(group._id)} className="btn-danger !py-2 !px-4 text-xs flex items-center gap-1">
                    <HiTrash className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 max-[521px]:py-10">
          <HiPhotograph className="w-16 h-16 max-[521px]:w-12 max-[521px]:h-12 text-dark-700 mx-auto mb-4" />
          <p className="text-dark-500 text-lg mb-4">No groups yet. Create your first one!</p>
          <button onClick={openCreate} className="btn-primary">Create Group</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editGroup ? 'Edit Group' : 'Create Group'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-dark-300 mb-2 block font-medium">Group Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Wedding Photos 2024"
            />
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-2 block font-medium">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="input-field file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500/10 file:text-primary-400 file:font-medium file:text-sm file:cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-3 block font-medium">Access Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: true })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  form.isPublic
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : 'border-dark-700 text-dark-400 hover:border-dark-600'
                }`}
              >
                <HiEye className="w-4 h-4 inline mr-1" /> Public
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: false })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  !form.isPublic
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-dark-700 text-dark-400 hover:border-dark-600'
                }`}
              >
                <HiLockClosed className="w-4 h-4 inline mr-1" /> Protected
              </button>
            </div>
          </div>

          {!form.isPublic && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="text-sm text-dark-300 mb-2 block font-medium">Group Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder={editGroup ? 'Leave blank to keep current' : 'Set a password'}
              />
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editGroup ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AllGroupsPage
