import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CharacterDesignPage from './pages/CharacterDesignPage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/character-design" element={<CharacterDesignPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
