import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Browse from './pages/Browse'
import Profile from './pages/Profile'
import MyProfile from './pages/MyProfile'
import Requests from './pages/Requests'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={
          <ProtectedRoute><Browse /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/me" element={
          <ProtectedRoute><MyProfile /></ProtectedRoute>
        } />
        <Route path="/requests" element={
          <ProtectedRoute><Requests /></ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App