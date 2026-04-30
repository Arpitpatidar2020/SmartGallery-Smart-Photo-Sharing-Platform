import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getGroup } from '../../services/groupService'
import { getGroupImages, toggleFavorite, getFavorites } from '../../services/imageService'
import ImageCard from '../../components/shared/ImageCard'
import Pagination from '../../components/shared/Pagination'
import SearchBar from '../../components/shared/SearchBar'
import Loader from '../../components/shared/Loader'
import toast from 'react-hot-toast'
import ImageViewer from '../../components/shared/ImageViewer'
import { HiLockClosed } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const GroupDetailPage = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All Photos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isForbidden, setIsForbidden] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

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

  const fetchFavIds = async () => {
    try {
      const { data } = await getFavorites({ limit: 9999 })
      setFavorites(new Set(data.images.map((img) => img._id)))
    } catch {}
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
      toast.error('Please login to favorite images')
    }
  }

  useEffect(() => {
    if (group) fetchImages()
  }, [group, activeTab, page, search])

  const fetchGroup = async () => {
    try {
      const { data } = await getGroup(id)
      setGroup(data)
    } catch (err) {
      if (err.response?.status === 403) {
        setIsForbidden(true)
      } else {
        toast.error('Failed to load group')
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
      };
      if (activeTab !== 'All Photos') {
        params.folder = activeTab;
      }
      const { data } = await getGroupImages(id, params)
      setImages(data.images)
      setTotalPages(data.pagination.pages)
      setIsForbidden(false)
    } catch (err) {
      if (err.response?.status === 403) {
        setIsForbidden(true)
      } else {
        toast.error('Failed to load images')
      }
    } finally {
      setLoading(false)
    }
  }

  const tabs = group?.folders?.map((f) => f.name) || ['All Photos', 'Highlights', 'Favorites']

  if (isForbidden) {
    return (
      <div className="page-container flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <HiLockClosed className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Private Collection</h2>
          <p className="text-dark-400 mb-8 leading-relaxed">
            This group is password protected. To view these images, you need to have the 
            group password and be logged in to your account.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary !px-8">Sign Up</Link>
            <Link to="/login" className="btn-secondary !px-8">Login</Link>
          </div>
          
          <Link to="/groups" className="inline-block mt-8 text-dark-500 hover:text-white transition-colors text-sm">
            ← Back to All Groups
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {group?.name || 'Loading...'}
            </h1>
            <p className="text-dark-400">
              {images.length} photos in this collection
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1) }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800 border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mb-8">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
          </div>

          {/* Images Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader text="Loading images..." />
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
                {images.map((image) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    showActions={true}
                    onClickImage={openViewer}
                    onFavorite={handleFavorite}
                    isFavorited={favorites.has(image._id)}
                  />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-dark-500 text-lg">No images found in this folder.</p>
            </div>
          )}
        </div>
      </section>

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

export default GroupDetailPage
