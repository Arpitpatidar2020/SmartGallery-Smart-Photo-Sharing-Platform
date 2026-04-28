import { motion } from 'framer-motion'

const Loader = ({ size = 'default', text = '' }) => {
  const sizes = {
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    large: 'w-16 h-16',
    page: 'w-12 h-12',
  }

  if (size === 'page') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <div className={`${sizes[size]} rounded-full border-2 border-dark-700`} />
          <div className={`${sizes[size]} rounded-full border-2 border-transparent border-t-primary-500 absolute inset-0`} />
        </motion.div>
        {text && (
          <p className="mt-4 text-dark-400 text-sm animate-pulse">{text}</p>
        )}
      </div>
    )
  }

  return (
    <motion.div
      className="relative inline-flex"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className={`${sizes[size]} rounded-full border-2 border-dark-700`} />
      <div className={`${sizes[size]} rounded-full border-2 border-transparent border-t-primary-500 absolute inset-0`} />
    </motion.div>
  )
}

export default Loader
