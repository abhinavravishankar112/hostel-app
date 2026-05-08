import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { token } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!token) return

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
