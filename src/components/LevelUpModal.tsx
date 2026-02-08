import { useState } from 'react'
import './LevelUpModal.css'

interface LevelUpPath {
  id: string
  name: string
  theme: string
  vibe: string
  keyMechanic: {
    name: string
    description: string
  }
  playstyle: string
}

interface LevelUpModalProps {
  onClose: () => void
  onConfirm: (pathId: string) => void
  currentLevel: number
}

const DEVELOPMENT_PATHS: LevelUpPath[] = [
  {
    id: 'evoker',
    name: 'Evoker',
    theme: 'Raw elemental destruction and battlefield mastery.',
    vibe: '"I didn\'t ask how big the room was, I said: I cast Fireball."',
    keyMechanic: {
      name: 'Sculpt Spells',
      description: 'In D&D, an Evoker can literally "shape" their explosions. In your game code, this means you can flag friendly units to take zero damage from the Evoker\'s Area of Effect (AoE) spells.'
    },
    playstyle: 'Perfect for players who want to deal the highest possible damage and control large groups of enemies without worrying about "friendly fire."'
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    theme: 'Mastery over the forces of life, death, and undeath.',
    vibe: '"Why settle for one action per turn when I can have an army do it for me?"',
    keyMechanic: {
      name: 'Grim Harvest',
      description: 'When a Necromancer kills an enemy with a spell, they regain HP. At higher levels, their "Animate Dead" spell creates extra skeletons that have more health and deal more damage.'
    },
    playstyle: 'A more "tactical/management" style. It\'s great for players who like summoning mechanics and outlasting enemies through attrition and life-steal.'
  }
]

function LevelUpModal({ onClose, onConfirm, currentLevel }: LevelUpModalProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedPath) {
      onConfirm(selectedPath)
      onClose()
    }
  }

  return (
    <div className="level-up-modal-overlay" onClick={onClose}>
      <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-up-header">
          <h2>🎉 Level Up! 🎉</h2>
          <p className="level-up-subtitle">Choose Your Development Path - Level {currentLevel}</p>
          <button className="level-up-close" onClick={onClose}>×</button>
        </div>

        <div className="level-up-content">
          <div className="path-selection-grid">
            {DEVELOPMENT_PATHS.map((path) => (
              <div
                key={path.id}
                className={`path-card ${selectedPath === path.id ? 'selected' : ''}`}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="path-card-header">
                  <h3>{path.name}</h3>
                  {selectedPath === path.id && (
                    <span className="selected-badge">✓ Selected</span>
                  )}
                </div>

                <div className="path-theme">
                  <strong>Theme:</strong> {path.theme}
                </div>

                <div className="path-vibe">
                  <strong>The Vibe:</strong> <em>{path.vibe}</em>
                </div>

                <div className="path-mechanic">
                  <strong>Key Mechanic ({path.keyMechanic.name}):</strong>
                  <p>{path.keyMechanic.description}</p>
                </div>

                <div className="path-playstyle">
                  <strong>Playstyle:</strong> {path.playstyle}
                </div>
              </div>
            ))}
          </div>

          <div className="level-up-actions">
            <button
              className="confirm-button"
              onClick={handleConfirm}
              disabled={!selectedPath}
            >
              Confirm Selection
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LevelUpModal
