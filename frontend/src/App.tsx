import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Category from './pages/Category'
import MomentPage from './pages/Moment'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/moment/:id" element={<MomentPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
