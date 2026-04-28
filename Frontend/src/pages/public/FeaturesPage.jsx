import { motion } from 'framer-motion'
import {
  HiSparkles, HiCloudUpload, HiLockClosed, HiPhotograph,
  HiHeart, HiSearch, HiDownload, HiUserGroup, HiShieldCheck,
  HiLightningBolt, HiDeviceMobile, HiMail
} from 'react-icons/hi'

const allFeatures = [
  { icon: HiSparkles, title: 'Face Recognition', desc: 'AI matches your face across thousands of event photos in seconds.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: HiCloudUpload, title: 'One-Shot Upload', desc: 'Upload an entire folder of images at once — no limits on quantity.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: HiLockClosed, title: 'Password Protected Groups', desc: 'Secure your event galleries with passwords. Control who sees what.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: HiPhotograph, title: 'Original Resolution', desc: 'Photos are stored at full resolution — no compression, no quality loss.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: HiHeart, title: 'Favorites Collection', desc: 'Mark your favorite photos and access them instantly from any device.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: HiSearch, title: 'Smart Search', desc: 'Search and filter images by name, group, and more.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: HiDownload, title: 'Bulk Download', desc: 'Select multiple photos and download them all at once as a ZIP.', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { icon: HiUserGroup, title: 'Group Management', desc: 'Create, edit, and organize photo groups with custom folders.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: HiShieldCheck, title: 'Secure Authentication', desc: 'JWT tokens, bcrypt hashing, and OTP-based password recovery.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: HiLightningBolt, title: 'CDN-Powered Delivery', desc: 'Images served via Cloudinary CDN for instant loading worldwide.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: HiDeviceMobile, title: 'Fully Responsive', desc: 'Works perfectly on desktop, tablet, and mobile devices.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: HiMail, title: 'Email Notifications', desc: 'OTP-powered password reset delivered to your inbox instantly.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
]

const FeaturesPage = () => {
  return (
    <div className="page-container">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h1>
            <p className="text-dark-400 text-lg">
              Everything you need to upload, organize, share, and discover event photos — powered by AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default FeaturesPage
