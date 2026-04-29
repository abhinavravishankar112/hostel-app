import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />
        <Route path="/browse" element={<div>Browse</div>} />
        <Route path="/profile/:id" element={<div>Profile</div>} />
        <Route path="/me" element={<div>My Profile</div>} />
        <Route path="/requests" element={<div>Requests</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App