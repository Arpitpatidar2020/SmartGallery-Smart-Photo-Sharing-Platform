import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight, HiPhotograph, HiUserGroup, HiSparkles, HiShieldCheck, HiCloudUpload, HiLightningBolt } from 'react-icons/hi'

const features = [
  { icon: HiSparkles, title: 'AI Face Recognition', desc: 'Auto-detect faces in photos and match them to users instantly.' },
  { icon: HiCloudUpload, title: 'One-Shot Upload', desc: 'Upload entire folders at once with zero compromise on quality.' },
  { icon: HiUserGroup, title: 'Group Management', desc: 'Organize events into groups — public or password-protected.' },
  { icon: HiShieldCheck, title: 'Secure Access', desc: 'JWT authentication, encrypted passwords, role-based control.' },
  { icon: HiPhotograph, title: 'Original Quality', desc: 'Images stored at full resolution via Cloudinary — no resizing.' },
  { icon: HiLightningBolt, title: 'Blazing Fast', desc: 'Optimized delivery with CDN-powered image transformations.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const HomePage = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6"
            >
              <HiSparkles className="w-4 h-4" />
              AI-Powered Photo Platform
            </motion.div>

            <motion.h1
              {...fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
            >
              Your Photos,{' '}
              <span className="gradient-text">Smarter</span>
              <br />
              Than Ever
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-dark-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Upload, organize, and share event photos effortlessly. Our AI finds you in every photo — no more scrolling through thousands of images.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/groups" className="btn-primary text-base flex items-center gap-2 !px-8 !py-4">
                Browse Gallery
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/signup" className="btn-secondary text-base !px-8 !py-4">
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Manage Photos</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Purpose-built for photographers, event organizers, and anyone who needs smart photo management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '99.9%', label: 'Face Accuracy' },
                { value: '50MB', label: 'Max Upload Size' },
                { value: '100+', label: 'Batch Upload' },
                { value: '∞', label: 'Original Quality' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-dark-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
              Join SmartGallery and experience the future of event photography management.
            </p>
            <Link to="/signup" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2">
              Create Your Account
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
