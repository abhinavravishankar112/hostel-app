import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/Navbar'

export default function Chat() {
  const { userId } = useParams()
  const { token, user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, messagesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${userId}`, { headers }),
        ])
        setOtherUser(userRes.data)
        setMessages(messagesRes.data)
      } catch (err) {
        setError('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, headers])

  useEffect(() => {
    if (!socket) return

    const handleReceive = (message) => {
      // Check if message is for this conversation
      if (
        message.from === userId ||
        message.to === userId ||
        message.from?._id === userId ||
        message.to?._id === userId
      ) {
        setMessages(prev => [...prev, message])
      }
    }

    const handleSent = (message) => {
      // Avoid duplicating the message if it was already added optimistically, 
      // but for simplicity we will just rely on the server acknowledgment here.
      setMessages(prev => [...prev, message])
    }

    socket.on('receive_message', handleReceive)
    socket.on('message_sent', handleSent)

    return () => {
      socket.off('receive_message', handleReceive)
      socket.off('message_sent', handleSent)
    }
  }, [socket, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !socket) return
    socket.emit('send_message', { to: userId, content: input.trim() })
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

  if (loading) return (
    <>
      <Navbar />
      <div className="page" style={{ color: 'var(--text-muted)' }}>Loading chat...</div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="page" style={{ color: 'var(--danger)' }}>{error}</div>
    </>
  )

  return (
    <>
      <Navbar />
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 40px',
        height: 'calc(100vh - 57px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat header */}
        <div style={{
          padding: '24px 0',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'color 0.2s',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            &larr; Back
          </button>

          <div style={{
            width: '40px',
            height: '40px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderRadius: '50%'
          }}>
            {otherUser?.profile?.profilePic ? (
              <img
                src={otherUser.profile.profilePic}
                alt={otherUser.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '16px',
                color: 'var(--text-muted)'
              }}>
                {otherUser?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h3
              onClick={() => navigate(`/profile/${userId}`)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'color 0.2s',
                margin: 0
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
            >
              {otherUser?.name}
            </h3>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0
            }}>
              {otherUser?.profile?.course || otherUser?.hostel}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
              marginTop: '40px'
            }}>
              No messages yet. Say hello!
            </div>
          )}

          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '16px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              {msgs.map((message, i) => {
                const isMe = message.from === user.id || message.from?._id === user.id

                return (
                  <div
                    key={message._id || i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      maxWidth: '65%',
                      padding: '12px 16px',
                      background: isMe ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: isMe ? '#000000' : 'var(--text)',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {message.content}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      {formatTime(message.createdAt || new Date())}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '20px 0',
          display: 'flex',
          gap: '12px',
          flexShrink: 0
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{ 
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '14px'
            }}
          />
          <button
            className="btn-primary"
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ borderRadius: '24px', padding: '0 24px' }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
