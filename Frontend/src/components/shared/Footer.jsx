import { Link } from 'react-router-dom'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold gradient-text">SmartGallery</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              AI-powered photo sharing platform with face recognition for photographers and event organizers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Features', 'Groups', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {['Face Recognition', 'One-Shot Upload', 'Group Management', 'Favorites', 'Secure Access'].map(
                (item) => (
                  <li key={item}>
                    <span className="text-dark-400 text-sm">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiMail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                arpitpatidar851@gmail.com
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiPhone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                +91 74411 65431
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <HiLocationMarker className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} SmartGallery. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-dark-500 text-sm hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-dark-500 text-sm hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
