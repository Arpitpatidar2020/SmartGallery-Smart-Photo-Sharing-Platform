import { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('sg_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (tokenValue, userData) => {
    localStorage.setItem('sg_token', tokenValue)
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('sg_token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
