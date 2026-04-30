import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiX, HiChevronLeft, HiChevronRight, HiDownload, 
  HiHeart, HiShare, HiTrash, HiZoomIn, HiZoomOut, HiPlay, HiPause
} from 'react-icons/hi'

const ImageViewer = ({ 
  images = [], 
  currentIndex = 0, 
  isOpen = false, 
  onClose, 
  onNext, 
  onPrev,
  onFavorite,
  onDelete,
  isFavorited = false
}) => {
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const image = images[currentIndex]

  // Slideshow Logic
  useEffect(() => {
    let interval;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        if (currentIndex < images.length - 1) {
          onNext()
        } else {
          setIsPlaying(false) // Auto pause at end
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isOpen, onNext, currentIndex, images.length])

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1)
  }, [currentIndex])

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return
    if (e.key === 'ArrowRight') onNext()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'Escape') onClose()
    if (e.key === ' ') {
      e.preventDefault()
      setIsPlaying(prev => !prev)
    }
  }, [isOpen, onNext, onPrev, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen || !image) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = image.originalFilename || `image-${currentIndex}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this photo',
        url: image.url
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(image.url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm select-none"
      >
        {/* Top Bar (Responsive) */}
        <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 z-20 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white transition-colors rounded-full"
            >
              <HiChevronLeft className="w-8 h-8" />
            </button>
            <span className="text-white font-medium text-lg">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Top Actions (Mobile only) */}
          <div className="flex items-center gap-1 sm:hidden">
            <button onClick={handleDownload} className="p-2 text-white/70 hover:text-white"><HiDownload className="w-6 h-6" /></button>
            <button onClick={handleShare} className="p-2 text-white/70 hover:text-white"><HiShare className="w-6 h-6" /></button>
            {onFavorite && (
              <button onClick={() => onFavorite(image._id)} className={`p-2 ${isFavorited ? 'text-red-500' : 'text-white/70'}`}>
                <HiHeart className="w-6 h-6" />
              </button>
            )}
            {onDelete && <button onClick={() => onDelete(image._id)} className="p-2 text-white/70"><HiTrash className="w-6 h-6" /></button>}
          </div>
        </div>

        {/* Navigation Buttons (Floating) */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:scale-110 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] disabled:opacity-0"
          disabled={currentIndex === 0}
        >
          <HiChevronLeft className="w-12 h-12" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:scale-110 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] disabled:opacity-0 sm:hidden"
          disabled={currentIndex === images.length - 1}
        >
          <HiChevronRight className="w-12 h-12" />
        </button>

        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden sm:flex absolute right-0 inset-y-0 w-20 flex-col items-center py-8 z-30 bg-black/20">
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 transition-colors ${isPlaying ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}
              title={isPlaying ? 'Pause Slideshow' : 'Start Slideshow'}
            >
              {isPlaying ? <HiPause className="w-7 h-7" /> : <HiPlay className="w-7 h-7" />}
            </button>
            <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-2 text-white hover:text-primary-400"><HiZoomIn className="w-7 h-7" /></button>
            <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="p-2 text-white hover:text-primary-400"><HiZoomOut className="w-7 h-7" /></button>
          </div>
          <div className="flex-1 flex items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }} 
              className="p-2 text-white hover:scale-110 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] disabled:opacity-0" 
              disabled={currentIndex === images.length - 1}
            >
              <HiChevronRight className="w-12 h-12" />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            <button onClick={handleDownload} className="p-2 text-white hover:text-primary-400"><HiDownload className="w-7 h-7" /></button>
            <button onClick={handleShare} className="p-2 text-white hover:text-primary-400"><HiShare className="w-7 h-7" /></button>
            {onFavorite && (
              <button onClick={() => onFavorite(image._id)} className={`p-2 ${isFavorited ? 'text-red-500' : 'text-white hover:text-red-500'}`}>
                <HiHeart className="w-7 h-7" />
              </button>
            )}
            {onDelete && <button onClick={() => onDelete(image._id)} className="p-2 text-white hover:text-red-500"><HiTrash className="w-7 h-7" /></button>}
          </div>
        </div>

        {/* Bottom Right Controls (Mobile only) */}
        <div className="flex sm:hidden flex-col gap-4 absolute bottom-10 right-4 z-20">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 ${isPlaying ? 'text-primary-400' : 'text-white/70'}`}
          >
            {isPlaying ? <HiPause className="w-8 h-8" /> : <HiPlay className="w-8 h-8" />}
          </button>
          <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-2 text-white/70"><HiZoomIn className="w-8 h-8" /></button>
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="p-2 text-white/70"><HiZoomOut className="w-8 h-8" /></button>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full flex items-center justify-center p-2 sm:pr-20 overflow-hidden" onClick={onClose}>
          <motion.img
            key={image._id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: zoom, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            src={image.url}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            style={{ cursor: zoom > 1 ? 'move' : 'default' }}
            onClick={(e) => e.stopPropagation()}
            drag={zoom > 1}
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          />
        </div>

        {/* Filename hint at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:text-sm font-light">
          {image.originalFilename || 'Untitled Image'}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImageViewer
