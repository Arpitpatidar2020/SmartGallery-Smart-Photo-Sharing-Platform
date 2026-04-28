import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiDownload, HiHeart, HiCheck } from 'react-icons/hi'

const ImageCard = ({ image, onFavorite, onSelect, isSelected, isFavorited, showActions = true, isSelectionMode = false }) => {
  const [loaded, setLoaded] = useState(false)

  const handleDownload = async (e) => {
    e.stopPropagation()
    const response = await fetch(image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = image.originalFilename || 'image.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
      <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-xl overflow-hidden bg-dark-800 cursor-pointer mb-3 break-inside-avoid shadow-lg"
      onClick={() => onSelect && onSelect(image._id)}
    >
      {/* Shimmer loader */}
      {!loaded && (
        <div className="w-full h-64 shimmer-bg bg-dark-800 animate-pulse" />
      )}

      <img
        src={image.url}
        alt={image.originalFilename || 'Gallery image'}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=Error+Loading+Image'
          setLoaded(true)
        }}
        className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-110 ${
          loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
      />

      {/* Selection indicator (persistent in selection mode) */}
      {showActions && onSelect && (
        <div 
          className={`absolute top-3 left-3 z-20 transition-all duration-300 ${
            isSelected || isSelectionMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect(image._id); }}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/40 scale-110'
                : 'border-white/60 hover:border-primary-400 bg-black/20 backdrop-blur-sm hover:scale-105'
            }`}
          >
            {isSelected && <HiCheck className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      {/* Hover overlay (Actions like Download/Favorite) */}
      {showActions && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-dark-900/80 text-white hover:bg-primary-500 transition-colors backdrop-blur-sm"
              title="Download"
            >
              <HiDownload className="w-4 h-4" />
            </button>
            {onFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite(image._id) }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isFavorited
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-900/80 text-white hover:bg-red-500'
                  }`}
                title="Favorite"
              >
                <HiHeart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status badge for admin */}
      {image.status === 'draft' && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-medium">
          Draft
        </div>
      )}
    </motion.div>
  )
}

export default ImageCard
