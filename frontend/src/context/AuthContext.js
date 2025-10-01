//frontend/src/context/AuthContext.js
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem("zynk_token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("zynk_token")
        if (token) {
          const response = await axios.get("/api/auth/me")
          setUser(response.data.user)
        }
      } catch (error) {
        localStorage.removeItem("zynk_token")
        delete axios.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setError("")
      setLoading(true)

      const response = await axios.post("/api/auth/login", {
        email,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("zynk_token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      setError("")
      setLoading(true)

      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      })

      const { token, user } = response.data

      localStorage.setItem("zynk_token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("zynk_token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    setError("")
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
