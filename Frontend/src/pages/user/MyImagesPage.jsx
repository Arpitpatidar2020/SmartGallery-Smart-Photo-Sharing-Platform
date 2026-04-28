import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiSparkles, HiPhotograph, HiRefresh, HiCheck } from 'react-icons/hi'
import * as faceapi from 'face-api.js'
import { useAuth } from '../../context/AuthContext'
import { getMyImages, toggleFavorite, getFavorites } from '../../services/imageService'
import { storeFaceDescriptor } from '../../services/userService'
import ImageCard from '../../components/shared/ImageCard'
import Pagination from '../../components/shared/Pagination'
import BulkActionBar from '../../components/shared/BulkActionBar'
import Loader from '../../components/shared/Loader'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

const MyImagesPage = () => {
  const { user, updateUser } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const hasFace = user?.faceDescriptor?.length === 128

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    if (hasFace) fetchMyImages()
  }, [hasFace, page])

  const fetchFavIds = async () => {
    try {
      const { data } = await getFavorites({ limit: 9999 })
      setFavorites(new Set(data.images.map((img) => img._id)))
    } catch { }
  }

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ])
      setModelsLoaded(true)
    } catch (err) {
      console.error('Failed to load face-api models:', err)
      toast.error('Failed to load face recognition models')
    }
  }

  const fetchMyImages = async () => {
    setLoading(true)
    try {
      const { data } = await getMyImages({ page, limit: 30 })
      setImages(data.images)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      if (err.response?.status !== 400) toast.error('Failed to load images')
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
      saveAs(content, 'my_matched_photos.zip')
      toast.dismiss()
      toast.success('Download started!')
    } catch {
      toast.dismiss()
      toast.error('Download failed')
    }
  }

  const handleBulkFavorite = async () => {
    for (const id of selected) {
      if (!favorites.has(id)) await toggleFavorite(id)
    }
    fetchFavIds()
    toast.success('Added to favorites!')
    setSelected([])
  }

  const processProfileFace = async () => {
    if (!user?.profileImage) {
      return toast.error('Please upload a profile photo first (from Profile page)')
    }
    if (!modelsLoaded) {
      return toast.error('Face recognition models are still loading...')
    }

    setProcessing(true)
    try {
      // Load the profile image
      const img = await faceapi.fetchImage(user.profileImage)
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection || detection.detection.score < 0.7) {
        toast.error('No clear face detected in your profile photo. Please use a clearer photo.')
        setProcessing(false)
        return
      }

      const descriptor = Array.from(detection.descriptor)

      // Store descriptor on server
      await storeFaceDescriptor(descriptor)
      updateUser({ faceDescriptor: descriptor })
      toast.success('Face registered! Fetching your images...')
      fetchMyImages()
    } catch (err) {
      console.error('Face processing error:', err)
      toast.error('Failed to process face. Try a different photo.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HiSparkles className="w-8 h-8 text-primary-400" />
          My Images
        </h1>
        <p className="text-dark-400 mt-1">Photos where your face was detected using AI</p>
      </motion.div>

      {!hasFace ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-lg mx-auto p-8 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
            <HiSparkles className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Set Up Face Recognition</h2>
          <p className="text-dark-400 text-sm mb-6 leading-relaxed">
            We'll scan your profile photo to create a face signature, then match it against all uploaded images to find photos of you.
          </p>
          {!user?.profileImage && (
            <p className="text-amber-400 text-sm mb-4">
              ⚠️ Please upload a profile photo first from the Profile page.
            </p>
          )}
          <button
            onClick={processProfileFace}
            disabled={processing || !modelsLoaded}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {processing ? (
              <>
                <Loader size="small" />
                Processing Face...
              </>
            ) : !modelsLoaded ? (
              <>
                <Loader size="small" />
                Loading Models...
              </>
            ) : (
              <>
                <HiSparkles className="w-5 h-5" />
                Scan My Face
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={processProfileFace} disabled={processing}
              className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2">
              <HiRefresh className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              Re-scan Face
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader text="Finding your photos..." /></div>
          ) : images.length > 0 ? (
            <>
              <p className="text-dark-400 text-sm mb-4">Found {images.length} photos with your face</p>
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
                  />
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="text-center py-20 bg-dark-900/50 rounded-3xl border border-dark-800">
              <HiPhotograph className="w-16 h-16 text-dark-700 mx-auto mb-4" />
              <p className="text-dark-500 text-lg">No matching photos found yet.</p>
              <p className="text-dark-600 text-sm mt-2">Join a group first, then your face will be matched against that group's images.</p>
              <button
                onClick={() => window.location.href = '/user/groups'}
                className="btn-primary mt-4 !py-2 !px-6 text-sm"
              >
                Browse Groups
              </button>
            </div>
          )}
        </>
      )}

      <BulkActionBar
        selectedCount={selected.length}
        onSelectAll={handleSelectAll}
        onDownload={handleBulkDownload}
        onFavorite={handleBulkFavorite}
        onClear={() => setSelected([])}
      />
    </div>
  )
}

export default MyImagesPage
