import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={
          <ProtectedRoute><div>Browse</div></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><div>Profile</div></ProtectedRoute>
        } />
        <Route path="/me" element={
          <ProtectedRoute><div>My Profile</div></ProtectedRoute>
        } />
        <Route path="/requests" element={
          <ProtectedRoute><div>Requests</div></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App