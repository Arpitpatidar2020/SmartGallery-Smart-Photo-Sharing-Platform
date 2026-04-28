import { motion } from 'framer-motion'
import { HiHeart, HiLightningBolt, HiUserGroup } from 'react-icons/hi'

const AboutPage = () => {
  return (
    <div className="page-container">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              About <span className="gradient-text">SmartGallery</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              We believe every photo tells a story. SmartGallery is built to help photographers and event organizers deliver those stories faster, smarter, and more beautifully than ever before.
            </p>
          </motion.div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: HiHeart,
                title: 'Our Mission',
                desc: 'To transform how the world shares and discovers event photography through AI-powered innovation.',
                color: 'from-red-500/20 to-pink-500/20',
                iconColor: 'text-red-400',
              },
              {
                icon: HiLightningBolt,
                title: 'Our Vision',
                desc: 'A world where finding yourself in event photos is instant, effortless, and delightful.',
                color: 'from-amber-500/20 to-orange-500/20',
                iconColor: 'text-amber-400',
              },
              {
                icon: HiUserGroup,
                title: 'Who We Serve',
                desc: 'Wedding photographers, corporate event organizers, festival teams, and anyone managing large photo collections.',
                color: 'from-primary-500/20 to-cyan-500/20',
                iconColor: 'text-primary-400',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-dark-400 max-w-xl mx-auto">Three simple steps to get your photos organized and delivered.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Upload Photos', desc: 'Admin uploads event photos in bulk. Original quality preserved.' },
              { step: '02', title: 'AI Processes Faces', desc: 'Our AI scans every photo and maps face descriptors automatically.' },
              { step: '03', title: 'Users Find Themselves', desc: 'Users upload a selfie and instantly find all their photos.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-black text-dark-800 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
