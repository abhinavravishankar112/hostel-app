import { useState } from 'react'
import axios from 'axios'

export default function ImageUpload({ currentPic, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      )

      onUpload(res.data.secure_url)
    } catch {
      setError('Upload failed, try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Current picture preview */}
      <div style={{
        width: '80px',
        height: '80px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {currentPic ? (
          <img
            src={currentPic}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            No photo
          </span>
        )}
      </div>

      {/* Upload button */}
      <div>
        <label style={{
          display: 'inline-block',
          padding: '10px 24px',
          border: '1px solid var(--border)',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          cursor: uploading ? 'not-allowed' : 'pointer',
          color: uploading ? 'var(--text-muted)' : 'var(--text)',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = 'var(--text)')}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {error && <p className="error-msg" style={{ marginTop: '8px' }}>{error}</p>}
      </div>
    </div>
  )
}