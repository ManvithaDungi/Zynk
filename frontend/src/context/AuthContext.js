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

  // Configure axios to send credentials with all requests
  useEffect(() => {
    axios.defaults.withCredentials = true
  }, [])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true
        })
        setUser(response.data.user)
      } catch (error) {
        // User not authenticated
        setUser(null)
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
      }, {
        withCredentials: true
      })

      const { user } = response.data
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

  const register = async (username, email, password) => {
    try {
      setError("")
      setLoading(true)

      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      })

      // Registration successful, now login
      const loginResponse = await axios.post("/api/auth/login", {
        email,
        password,
      }, {
        withCredentials: true
      })

      const { user } = loginResponse.data
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

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setError("")
    }
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
