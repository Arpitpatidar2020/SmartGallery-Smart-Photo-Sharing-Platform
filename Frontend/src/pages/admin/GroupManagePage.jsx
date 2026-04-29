import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiUpload, HiTrash, HiArrowLeft, HiPlus, HiEye, HiEyeOff,
  HiPhotograph, HiCheck, HiFolderAdd, HiSparkles
} from 'react-icons/hi'
import * as faceapi from 'face-api.js'
import { getGroup, addFolder, updateFolder, deleteFolder } from '../../services/groupService'
import { HiPencil } from 'react-icons/hi'
import { getGroupImages, uploadImage, uploadBulk, updateImage, deleteImage, deleteBulkImages } from '../../services/imageService'
import ImageCard from '../../components/shared/ImageCard'
import Pagination from '../../components/shared/Pagination'
import SearchBar from '../../components/shared/SearchBar'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'
import { confirmToast } from '../../utils/toastUtils'

import { uploadToCloudinary } from '../../services/cloudinaryService'

const GroupManagePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('All Photos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFolder, setUploadFolder] = useState('All Photos')
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const [editingFolder, setEditingFolder] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanTotal, setScanTotal] = useState(0)

  useEffect(() => { fetchGroup() }, [id])
  useEffect(() => { if (group) fetchImages() }, [group, activeTab, page, search])

  const fetchGroup = async () => {
    try {
      const { data } = await getGroup(id)
      setGroup(data)
    } catch { toast.error('Group not found'); navigate('/admin/groups') }
  }

  const fetchImages = async () => {
    setLoading(true)
    try {
      const params = { page, search }
      if (activeTab !== 'All Photos') {
        params.folder = activeTab
      }
      const { data } = await getGroupImages(id, params)
      setImages(data.images)
      setTotalPages(data.pagination.pages)
    } catch { toast.error('Failed to load images') }
    finally { setLoading(false) }
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    // Limit each file to 10MB (Cloudinary free tier limit is much higher, but we keep it reasonable)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        e.target.value = ''
        return toast.error(`File "${file.name}" is too large (>10MB)`)
      }
    }

    setUploading(true)
    const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`)

    try {
      if (files.length === 1) {
        // Single Upload
        const result = await uploadToCloudinary(files[0], `smartgallery/groups/${id}`)
        
        await uploadImage({
          groupId: id,
          folder: uploadFolder,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          size: result.bytes,
          originalFilename: files[0].name
        })
        toast.success('Image uploaded!', { id: loadingToast })
      } else {
        // Bulk Upload
        const uploadedData = []
        for (let i = 0; i < files.length; i++) {
          toast.loading(`Uploading to Cloudinary (${i + 1}/${files.length})...`, { id: loadingToast })
          const result = await uploadToCloudinary(files[i], `smartgallery/groups/${id}`)
          uploadedData.push({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
            originalFilename: files[i].name,
            folder: uploadFolder
          })
        }

        toast.loading('Saving metadata to database...', { id: loadingToast })
        const { data } = await uploadBulk({
          groupId: id,
          images: uploadedData
        })
        toast.success(data.message, { id: loadingToast })
      }
      setShowUpload(false)
      fetchImages()
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: loadingToast })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleSelect = (imageId) => {
    setSelected((prev) =>
      prev.includes(imageId) ? prev.filter((i) => i !== imageId) : [...prev, imageId]
    )
  }

  const toggleStatus = async (image) => {
    const newStatus = image.status === 'published' ? 'draft' : 'published'
    try {
      await updateImage(image._id, { status: newStatus })
      setImages((prev) =>
        prev.map((img) => (img._id === image._id ? { ...img, status: newStatus } : img))
      )
      toast.success(`Image ${newStatus}`)
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteSelected = () => {
    if (!selected.length) return
    confirmToast(`Delete ${selected.length} images?`, async () => {
      try {
        await deleteBulkImages(selected)
        toast.success(`${selected.length} images deleted`)
        setSelected([])
        fetchImages()
      } catch { toast.error('Delete failed') }
    })
  }

  const handleDeleteImage = (imgId) => {
    confirmToast('Delete this image?', async () => {
      try {
        await deleteImage(imgId)
        toast.success('Image deleted')
        fetchImages()
      } catch { toast.error('Delete failed') }
    })
  }

  const handleAddFolder = async () => {
    if (!newFolder.trim()) return toast.error('Folder name is required')
    try {
      const { data } = await addFolder(id, newFolder)
      setGroup(data)
      setNewFolder('')
      setShowAddFolder(false)
      toast.success('Folder added!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add folder') }
  }

  const handleUpdateFolder = async () => {
    if (!newFolderName.trim()) return toast.error('Name is required')
    try {
      const { data } = await updateFolder(id, editingFolder._id, newFolderName)
      setGroup(data)
      if (activeTab === editingFolder.name) setActiveTab(newFolderName)
      setEditingFolder(null)
      setNewFolderName('')
      toast.success('Folder renamed!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
  }

  const handleDeleteFolder = (folder) => {
    if (folder.isDefault) return toast.error('Cannot delete default folder')
    confirmToast(`Delete folder "${folder.name}"? Photos will move to All Photos.`, async () => {
      try {
        const { data } = await deleteFolder(id, folder._id)
        setGroup(data)
        if (activeTab === folder.name) setActiveTab('All Photos')
        toast.success('Folder deleted!')
      } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    })
  }

  const handleAISync = async () => {
    if (images.length === 0) return toast.error('No images to process')

    setScanning(true)
    setScanProgress(0)
    setScanTotal(images.length)

    try {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ])

      let count = 0
      for (const img of images) {
        if (img.faceDescriptors && img.faceDescriptors.length > 0) {
          count++
          setScanProgress(count)
          continue
        }

        try {
          const imageElement = await faceapi.fetchImage(img.url)
          const detections = await faceapi
            .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors()

          // Filter for high confidence detections to avoid false positives in backgrounds
          const highConfidenceDetections = detections.filter((d) => d.detection.score > 0.6)

          if (highConfidenceDetections.length > 0) {
            const descriptors = highConfidenceDetections.map((d) => Array.from(d.descriptor))
            await updateImage(img._id, { faceDescriptors: descriptors })
          } else {
            // Mark as processed but empty (no reliable faces found)
            await updateImage(img._id, { faceDescriptors: [[]] })
          }
        } catch (err) {
          console.error(`Failed to process image ${img._id}:`, err)
        }

        count++
        setScanProgress(count)
      }
      toast.success('AI synchronization complete!')
      fetchImages()
    } catch (err) {
      console.error('AI Sync Error:', err)
      toast.error('AI processing failed. Check console for details.')
    } finally {
      setScanning(false)
    }
  }

  const tabs = group?.folders?.map((f) => f.name) || []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/groups')} className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {group?.name || 'Loading Group...'}
            </h1>
            <div className="flex items-center gap-3 text-sm text-dark-500">
              <span className="flex items-center gap-1">
                <HiPhotograph className="w-4 h-4" /> {images.length} Photos
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddFolder(true)}
            className="flex-1 sm:flex-none btn-secondary flex items-center justify-center gap-2 text-sm !py-2.5 min-w-[110px]"
          >
            <HiFolderAdd className="w-4 h-4" />
            <span className="whitespace-nowrap">New Folder</span>
          </button>
          <button
            onClick={handleAISync}
            disabled={scanning}
            className="flex-1 sm:flex-none btn-secondary flex items-center justify-center gap-2 text-sm !py-2.5 hover:text-primary-400 group min-w-[100px]"
          >
            <HiSparkles className={`w-4 h-4 ${scanning ? 'animate-pulse text-primary-400' : ''}`} />
            <span className="whitespace-nowrap">{scanning ? 'Processing...' : 'AI Sync'}</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm !py-2.5"
          >
            <HiUpload className="w-4 h-4" />
            <span className="whitespace-nowrap">Upload Images</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {group?.folders?.map((folder) => (
          <div key={folder._id} className="relative group/tab">
            <button key={folder.name} onClick={() => { setActiveTab(folder.name); setPage(1); setSelected([]) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === folder.name ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-800 border border-transparent'
                }`}
            >
              {folder.name}
            </button>
            {!folder.isDefault && (
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover/tab:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name) }}
                  className="p-1 rounded-md bg-dark-900 border border-dark-700 text-dark-400 hover:text-primary-400 shadow-xl"
                >
                  <HiPencil className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder) }}
                  className="p-1 rounded-md bg-dark-900 border border-dark-700 text-dark-400 hover:text-red-400 shadow-xl"
                >
                  <HiTrash className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => setShowAddFolder(true)} className="p-2 rounded-xl text-dark-500 hover:text-primary-400 hover:bg-dark-800 transition-colors" title="Add Folder">
          <HiFolderAdd className="w-5 h-5" />
        </button>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="w-full sm:max-w-sm">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-dark-900/50 p-2 sm:p-0 rounded-xl sm:bg-transparent">
            <span className="text-sm text-dark-400 font-medium">{selected.length} selected</span>
            <div className="flex items-center gap-2">
              <button onClick={handleDeleteSelected} className="btn-danger !py-1.5 !px-3 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                <HiTrash className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={() => setSelected([])} className="text-xs text-dark-500 hover:text-white transition-colors px-2">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader text="Loading..." /></div>
      ) : images.length > 0 ? (
        <>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {images.map((image) => (
              <div key={image._id} className="relative group">
                <ImageCard
                  image={image}
                  isSelected={selected.includes(image._id)}
                  onSelect={toggleSelect}
                  isSelectionMode={selected.length > 0}
                />
                {/* Admin actions overlay */}
                <div className="absolute bottom-6 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => toggleStatus(image)}
                    className={`p-1.5 rounded-lg backdrop-blur-sm text-xs ${image.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}
                    title={image.status === 'published' ? 'Set to Draft' : 'Publish'}
                  >
                    {image.status === 'published' ? <HiEye className="w-3.5 h-3.5" /> : <HiEyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image._id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 backdrop-blur-sm"
                    title="Delete"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-20">
          <HiPhotograph className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <p className="text-dark-500 text-lg mb-4">No images in this folder yet.</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary">Upload Images</button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Images">
        <div className="space-y-5">
          <div>
            <label className="text-sm text-dark-300 mb-2 block font-medium">Select Folder</label>
            <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}
              className="input-field"
            >
              {tabs.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-2 block font-medium">Choose Images</label>
            <p className="text-dark-500 text-xs mb-2">Select one or multiple images (Max: 10MB each)</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="input-field file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500/10 file:text-primary-400 file:font-medium file:text-sm file:cursor-pointer"
            />
          </div>
          {uploading && (
            <div className="flex items-center gap-3">
              <Loader size="small" />
              <span className="text-dark-400 text-sm">Uploading images...</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Folder Modal */}
      <Modal isOpen={showAddFolder} onClose={() => { setShowAddFolder(false); setNewFolder('') }} title="Add Folder" size="sm">
        <div className="space-y-4">
          <input
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            className="input-field"
            placeholder="Folder name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
          />
          <div className="flex gap-3">
            <button onClick={() => { setShowAddFolder(false); setNewFolder('') }} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddFolder} className="btn-primary flex-1">Add Folder</button>
          </div>
        </div>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal isOpen={!!editingFolder} onClose={() => setEditingFolder(null)} title="Rename Folder" size="sm">
        <div className="space-y-4">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="input-field"
            placeholder="New folder name"
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateFolder()}
          />
          <div className="flex gap-3">
            <button onClick={() => setEditingFolder(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleUpdateFolder} className="btn-primary flex-1">Rename</button>
          </div>
        </div>
      </Modal>

      {/* AI Processing Modal */}
      <Modal
        isOpen={scanning}
        onClose={() => { }}
        title="AI Face Recognition"
        size="sm"
        showClose={false}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <HiSparkles className="w-8 h-8 text-primary-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Analyzing Photos</h3>
          <p className="text-dark-400 text-sm mb-6">
            Detecting faces and creating signatures...
          </p>

          <div className="w-full bg-dark-800 rounded-full h-2 mb-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(scanProgress / scanTotal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-dark-500">
            Processed {scanProgress} of {scanTotal} images
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default GroupManagePage
