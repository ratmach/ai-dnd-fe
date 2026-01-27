import { useState } from 'react'
import PlayerList from '../components/PlayerList'
import CharacterStatsModal from '../components/CharacterStatsModal'
import IsometricMap from '../components/IsometricMap'
import './GamePage.css'

export interface Player {
  id: number
  name: string
  icon: string
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  level: number
  online: boolean
}

function GamePage() {
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 1,
      name: 'Player One',
      icon: 'P1',
      hp: 85,
      maxHp: 100,
      mana: 60,
      maxMana: 100,
      level: 5,
      online: true
    },
    {
      id: 2,
      name: 'Player Two',
      icon: 'P2',
      hp: 45,
      maxHp: 100,
      mana: 90,
      maxMana: 100,
      level: 3,
      online: true
    },
    {
      id: 3,
      name: 'Player Three',
      icon: 'P3',
      hp: 100,
      maxHp: 100,
      mana: 30,
      maxMana: 100,
      level: 7,
      online: false
    }
  ])

  return (
    <div className="game-page">
      <PlayerList players={players} />
      <div className="game-content">
        <div className="game-header">
          <h2>DnD Game</h2>
          <button
            className="stats-button"
            onClick={() => setShowStatsModal(true)}
          >
            Character Stats
          </button>
        </div>
        <IsometricMap />
      </div>
      {showStatsModal && (
        <CharacterStatsModal onClose={() => setShowStatsModal(false)} />
      )}
    </div>
  )
}

export default GamePage
