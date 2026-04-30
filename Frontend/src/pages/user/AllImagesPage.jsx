import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HiPhotograph, HiHeart } from 'react-icons/hi'
import { getAllPublished, toggleFavorite, getFavorites } from '../../services/imageService'
import { useAuth } from '../../context/AuthContext'
import ImageCard from '../../components/shared/ImageCard'
import Pagination from '../../components/shared/Pagination'
import SearchBar from '../../components/shared/SearchBar'
import BulkActionBar from '../../components/shared/BulkActionBar'
import Loader from '../../components/shared/Loader'
import ImageViewer from '../../components/shared/ImageViewer'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

const AllImagesPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'favorites'
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [favorites, setFavorites] = useState(new Set())

  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const openViewer = (image) => {
    const index = images.findIndex(img => img._id === image._id)
    setViewerIndex(index)
    setViewerOpen(true)
  }

  useEffect(() => { fetchImages() }, [activeTab, page, search])
  useEffect(() => { fetchFavIds() }, [])

  const fetchFavIds = async () => {
    try {
      const { data } = await getFavorites({ limit: 9999 })
      setFavorites(new Set(data.images.map((img) => img._id)))
    } catch { }
  }

  const fetchImages = async () => {
    setLoading(true)
    try {
      if (activeTab === 'favorites') {
        const { data } = await getFavorites({ page, limit: 30 })
        setImages(data.images)
        setTotalPages(data.pagination.pages)
      } else {
        const { data } = await getAllPublished({ page, limit: 30, search })
        setImages(data.images)
        setTotalPages(data.pagination.pages)
      }
    } catch { toast.error('Failed to load images') }
    finally { setLoading(false) }
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
      if (activeTab === 'favorites') fetchImages()
    } catch { toast.error('Failed to update favorite') }
  }

  const toggleSelect = (imgId) => {
    setSelected((prev) => prev.includes(imgId) ? prev.filter((i) => i !== imgId) : [...prev, imgId])
  }

  const handleSelectAll = () => {
    const allIds = images.map((img) => img._id)
    setSelected(allIds)
  }

  const handleBulkDownload = async () => {
    if (!selected.length) return
    toast.loading('Preparing download...')
    try {
      const zip = new JSZip()
      const selectedImages = images.filter((img) => selected.includes(img._id))

      for (const img of selectedImages) {
        const response = await fetch(img.url)
        const blob = await response.blob()
        zip.file(img.originalFilename || `image_${img._id}.jpg`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'smartgallery_images.zip')
      toast.dismiss()
      toast.success('Download started!')
    } catch {
      toast.dismiss()
      toast.error('Download failed')
    }
  }

  const handleBulkFavorite = async () => {
    for (const id of selected) {
      if (!favorites.has(id)) {
        await toggleFavorite(id)
      }
    }
    fetchFavIds()
    toast.success('Added to favorites!')
    setSelected([])
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">All Images</h1>
        <p className="text-dark-400 mt-1">Browse and manage your photo collection</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => { setActiveTab('all'); setPage(1); setSelected([]) }}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-800 border border-transparent'
            }`}
        >
          <HiPhotograph className="w-4 h-4" /> All Photos
        </button>
        <button onClick={() => { setActiveTab('favorites'); setPage(1); setSelected([]) }}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-800 border border-transparent'
            }`}
        >
          <HiHeart className="w-4 h-4" /> Favorites
        </button>
      </div>

      {/* Search */}
      {activeTab === 'all' && (
        <div className="max-w-sm mb-6">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        </div>
      )}

      {/* Images */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader text="Loading images..." /></div>
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
        <div className="text-center py-20">
          <HiPhotograph className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <p className="text-dark-500 text-lg">
            {activeTab === 'favorites' ? 'No favorites yet. Heart some images!' : 'No images available.'}
          </p>
        </div>
      )}

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

export default AllImagesPage
