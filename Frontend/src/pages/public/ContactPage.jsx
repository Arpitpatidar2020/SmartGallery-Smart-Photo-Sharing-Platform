import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker, HiUser, HiChat, HiPaperAirplane } from 'react-icons/hi'
import { FaInstagram, FaLinkedin, FaFacebook, FaGithub, FaTelegram } from 'react-icons/fa'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      return toast.error('All fields are required')
    }
    setSending(true)
    try {
      const { data } = await api.post('/contact', form)
      toast.success(data.message)
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const contactInfo = [
    {
      icon: HiMail,
      label: 'Email Support',
      value: 'arpitpatidar851@gmail.com',
      link: 'mailto:arpitpatidar851@gmail.com',
      color: 'text-primary-400',
      bg: 'bg-primary-500/10'
    },
    {
      icon: HiPhone,
      label: 'Phone Number',
      value: '+91 74411 65431',
      link: 'tel:+917441165431',
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10'
    },
    {
      icon: HiLocationMarker,
      label: 'Office Location',
      value: 'Indore, Madhya Pradesh, India',
      link: '#',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ]

  const socials = [
    { icon: FaFacebook, link: 'https://www.facebook.com/arpit.patidar.7311?mibextid=ZbWKwL', label: 'Facebook' },
    { icon: FaGithub, link: 'https://github.com/Arpitpatidar2020', label: 'GitHub' },
    { icon: FaInstagram, link: 'https://www.instagram.com/arpit_patidar2020?igsh=MW8yaTl5Y210MDNlag==', label: 'Instagram' },
    { icon: FaLinkedin, link: 'https://www.linkedin.com/in/arpit-patidar-32205724b', label: 'LinkedIn' },
    { icon: FaTelegram, link: 'https://t.me/Arpitpatidar_2020', label: 'Telegram' },
  ]

  return (
    <div className="page-container">
      <section className="section-padding relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Let's Start a <span className="gradient-text">Conversation</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Have a question about face recognition or need help setting up your gallery?
              Our team is ready to help you capture every moment perfectly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Contact Info & Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="grid grid-cols-1 gap-6">
                {contactInfo.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.link}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="glass-card group p-6 flex items-start gap-5 hover:border-primary-500/30 active:scale-[0.98] transition-all"
                  >
                    <div className={`p-4 rounded-2xl ${item.bg}`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-dark-500 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-white font-semibold text-lg group-hover:text-primary-400 transition-colors uppercase tracking-tight break-all">{item.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social Media Section */}
              <div className="p-8 rounded-3xl bg-dark-900/40 border border-dark-800 backdrop-blur-sm">
                <h3 className="text-white font-bold mb-6 text-xl tracking-tight">Connect with Us</h3>
                <div className="flex flex-wrap gap-4">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.link}
                      className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 transition-all active:scale-95"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>


            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-7"
            >
              <form
                onSubmit={handleSubmit}
                className="glass-card p-8 md:p-10 border border-dark-800 shadow-2xl space-y-7"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">Full Name</label>
                    <div className="relative group">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field pl-12 h-14"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative group">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-field pl-12 h-14"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">Message Detail</label>
                  <div className="relative group">
                    <HiChat className="absolute left-4 top-5 w-5 h-5 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-field pl-12 min-h-[180px] pt-4 resize-none"
                      placeholder="Tell us how we can help you capture your event better..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg group"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Your Message
                      <HiPaperAirplane className="w-5 h-5 rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-dark-500 text-xs">
                  By submitting this form, you agree to our <a href="#" className="underline text-dark-400">Privacy Policy</a>.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
