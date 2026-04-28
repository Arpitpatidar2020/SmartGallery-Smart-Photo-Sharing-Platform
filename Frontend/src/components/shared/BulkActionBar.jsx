import { motion, AnimatePresence } from 'framer-motion'
import { HiDownload, HiHeart, HiCheck, HiXCircle, HiTrash } from 'react-icons/hi'

const BulkActionBar = ({ 
  selectedCount, 
  onSelectAll, 
  onDownload, 
  onFavorite, 
  onDelete, 
  onClear 
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
  initial={{ y: 80, x: '-50%', opacity: 0 }}
  animate={{ y: 0, x: '-50%', opacity: 1 }}
  exit={{ y: 80, x: '-50%', opacity: 0 }}
  className="fixed bottom-6 left-1/2 z-50 w-[95%] max-w-lg"
>
  <div className="glass-card !bg-dark-950/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex items-center overflow-hidden">
    {/* Left: Selection Info & Clear */}
    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 h-full">
      <span className="text-sm font-bold text-white whitespace-nowrap">
        {selectedCount} <span className="hidden sm:inline">Selected</span>
      </span>
      <button 
        onClick={onClear} 
        className="text-red-500 hover:text-red-400 transition-colors"
        title="Clear Selection"
      >
        <HiXCircle className="w-5 h-5" />
      </button>
    </div>

    {/* Right: Actions with Dividers */}
    <div className="flex-1 flex items-center justify-around">
      {onSelectAll && (
        <>
          <div className="w-px h-10 bg-white/10" />
          <button 
            onClick={onSelectAll} 
            className="flex-1 flex flex-col items-center justify-center py-2 text-dark-300 hover:text-primary-400 hover:bg-white/5 transition-all"
            title="Select All"
          >
            <HiCheck className="w-5 h-5" />
            <span className="text-[10px] hidden sm:block mt-0.5 font-medium uppercase tracking-tighter">All</span>
          </button>
        </>
      )}

      {onDownload && (
        <>
          <div className="w-px h-10 bg-white/10" />
          <button 
            onClick={onDownload} 
            className="flex-1 flex flex-col items-center justify-center py-2 text-dark-300 hover:text-primary-400 hover:bg-white/5 transition-all"
            title="Download"
          >
            <HiDownload className="w-5 h-5" />
            <span className="text-[10px] hidden sm:block mt-0.5 font-medium uppercase tracking-tighter">Save</span>
          </button>
        </>
      )}

      {onFavorite && (
        <>
          <div className="w-px h-10 bg-white/10" />
          <button 
            onClick={onFavorite} 
            className="flex-1 flex flex-col items-center justify-center py-2 text-dark-300 hover:text-pink-500 hover:bg-white/5 transition-all"
            title="Favorite"
          >
            <HiHeart className="w-5 h-5" />
            <span className="text-[10px] hidden sm:block mt-0.5 font-medium uppercase tracking-tighter">Heart</span>
          </button>
        </>
      )}

      {onDelete && (
        <>
          <div className="w-px h-10 bg-white/10" />
          <button 
            onClick={onDelete} 
            className="flex-1 flex flex-col items-center justify-center py-2 text-dark-300 hover:text-red-500 hover:bg-white/5 transition-all"
            title="Delete"
          >
            <HiTrash className="w-5 h-5" />
            <span className="text-[10px] hidden sm:block mt-0.5 font-medium uppercase tracking-tighter">Trash</span>
          </button>
        </>
      )}
    </div>
  </div>
</motion.div>
      )}
    </AnimatePresence>
  )
}

export default BulkActionBar
