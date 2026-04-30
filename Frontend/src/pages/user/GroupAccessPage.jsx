import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiPhotograph,
  HiArrowLeft,
  HiCollection
} from 'react-icons/hi'
import { getGroup } from '../../services/groupService'
import { getGroupImages, toggleFavorite, getFavorites } from '../../services/imageService'
import ImageCard from '../../components/shared/ImageCard'
import Pagination from '../../components/shared/Pagination'
import SearchBar from '../../components/shared/SearchBar'
import BulkActionBar from '../../components/shared/BulkActionBar'
import Loader from '../../components/shared/Loader'
import ImageViewer from '../../components/shared/ImageViewer'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

const GroupAccessPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [activeTab, setActiveTab] = useState('All Photos')

  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const openViewer = (image) => {
    const index = images.findIndex(img => img._id === image._id)
    setViewerIndex(index)
    setViewerOpen(true)
  }

  useEffect(() => {
    fetchGroup()
    fetchFavIds()
  }, [id])

  useEffect(() => {
    if (group) fetchImages()
  }, [group, page, search, activeTab])

  const fetchFavIds = async () => {
    try {
      const { data } = await getFavorites({ limit: 9999 })
      setFavorites(new Set(data.images.map((img) => img._id)))
    } catch {}
  }

  const fetchGroup = async () => {
    try {
      const { data } = await getGroup(id)
      setGroup(data)
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('You do not have access to this group.')
        navigate('/user/groups')
      } else {
        toast.error('Failed to load group details')
      }
    }
  }

  const fetchImages = async () => {
    setLoading(true)
    try {
      const params = {
        status: 'published',
        page,
        search,
        limit: 30
      }
      if (activeTab === 'Favorites') {
        params.favorited = true
      } else if (activeTab !== 'All Photos') {
        params.folder = activeTab
      }

      const { data } = await getGroupImages(id, params)
      setImages(data.images)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access denied. Joining group might be required.')
        navigate('/user/groups')
      } else {
        toast.error('Failed to load images')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async (imgId) => {
    try {
      const { data } = await toggleFavorite(imgId)
      setFavorites((prev) => {
        const next = new Set(prev)
        data.isFavorited ? next.add(imgId) : next.delete(imgId)
        return next
      })
      toast.success(data.message)
    } catch {
      toast.error('Failed to update favorite')
    }
  }

  const toggleSelect = (imgId) => {
    setSelected((prev) =>
      prev.includes(imgId) ? prev.filter((i) => i !== imgId) : [...prev, imgId]
    )
  }

  const handleSelectAll = () => {
    const allIds = images.map((img) => img._id)
    setSelected(allIds)
  }

  const handleBulkDownload = async () => {
    if (!selected.length) return
    const loadingToast = toast.loading('Preparing archive...')
    try {
      const zip = new JSZip()
      const selectedImages = images.filter((img) => selected.includes(img._id))

      for (const img of selectedImages) {
        const response = await fetch(img.url)
        const blob = await response.blob()
        zip.file(img.originalFilename || `image_${img._id}.jpg`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${group?.name || 'SmartGallery'}_photos.zip`)
      toast.success('Download started!', { id: loadingToast })
    } catch {
      toast.error('Download failed', { id: loadingToast })
    }
  }

  const handleBulkFavorite = async () => {
    for (const imgId of selected) {
      if (!favorites.has(imgId)) {
        await toggleFavorite(imgId)
      }
    }
    fetchFavIds()
    toast.success('Added to favorites!')
    setSelected([])
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/user/groups')}
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <HiCollection className="w-6 h-6 text-primary-400" />
              {group?.name || '...'}
            </h1>
            <p className="text-dark-500 text-sm">Authorized private access</p>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="max-w-md w-full">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
        {images.length > 0 && (
          <div className="text-dark-400 text-sm">
            Showing {images.length} photos in this group
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {group?.folders?.map((folder) => (
          <button
            key={folder.name}
            onClick={() => { setActiveTab(folder.name); setPage(1); setSelected([]) }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeTab === folder.name
                ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                : 'text-dark-400 border-transparent hover:text-white hover:bg-dark-800'
            }`}
          >
            {folder.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <section>
        <div className="min-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader text="Fetching gallery..." />
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                {images.map((image) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    onFavorite={handleFavorite}
                    onSelect={toggleSelect}
                    isSelected={selected.includes(image._id)}
                    isFavorited={favorites.has(image._id)}
                    isSelectionMode={selected.length > 0}
                    onClickImage={openViewer}
                  />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="text-center py-20 bg-dark-900/50 rounded-3xl border border-dark-800">
              <HiPhotograph className="w-16 h-16 text-dark-800 mx-auto mb-4" />
              <p className="text-dark-500 text-lg">No matching photos found in this group.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selected.length}
        onSelectAll={handleSelectAll}
        onDownload={handleBulkDownload}
        onFavorite={handleBulkFavorite}
        onClear={() => setSelected([])}
      />

      {/* Full Screen Image Viewer */}
      <ImageViewer
        isOpen={viewerOpen}
        images={images}
        currentIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
        onNext={() => setViewerIndex(prev => Math.min(images.length - 1, prev + 1))}
        onPrev={() => setViewerIndex(prev => Math.max(0, prev - 1))}
        onFavorite={handleFavorite}
        isFavorited={images[viewerIndex] ? favorites.has(images[viewerIndex]._id) : false}
      />
    </div>
  )
}

export default GroupAccessPage
