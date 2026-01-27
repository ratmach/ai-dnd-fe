import { useState } from 'react'
import PlayerList from '../components/PlayerList'
import CharacterStatsModal from '../components/CharacterStatsModal'
import InventoryModal from '../components/InventoryModal'
import IsometricMap from '../components/IsometricMap'
import { Item } from '../types/items'
import { mockItems } from '../data/mockItems'
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
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [gold, setGold] = useState(1250)
  const [maxWeight] = useState(50) // Max carry weight in kg
  const [inventoryItems, setInventoryItems] = useState<(Item | null)[]>(() => {
    // Initialize with some mock items
    const initialItems: (Item | null)[] = new Array(64).fill(null)
    // Add some items to inventory
    const itemsToAdd = [
      mockItems[0], // Iron Sword
      mockItems[1], // Wooden Shield
      mockItems[2], // Health Potion
      mockItems[3], // Leather Armor
      mockItems[4], // Oak Staff
      mockItems[5], // Ruby Gem
      mockItems[6], // Swift Boots
      mockItems[7], // Scroll of Fireball
      mockItems[8], // Ring of Strength
      mockItems[9], // Steel Helmet
      mockItems[10], // Elven Longbow
      mockItems[11], // Mana Potion
    ]
    itemsToAdd.forEach((item, index) => {
      if (item && index < initialItems.length) {
        initialItems[index] = item
      }
    })
    return initialItems
  })
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

  const handleDropItem = (index: number) => {
    const newItems = [...inventoryItems]
    newItems[index] = null
    setInventoryItems(newItems)
  }

  const handleUpdateItems = (items: (Item | null)[]) => {
    setInventoryItems(items)
  }

  return (
    <div className="game-page">
      <PlayerList players={players} />
      <div className="game-content">
        <div className="game-header">
          <h2>DnD Game</h2>
          <div className="header-buttons">
            <button
              className="stats-button"
              onClick={() => setShowStatsModal(true)}
            >
              Character Stats
            </button>
            <button
              className="inventory-button"
              onClick={() => setShowInventoryModal(true)}
            >
              Inventory
            </button>
          </div>
        </div>
        <IsometricMap />
      </div>
      {showStatsModal && (
        <CharacterStatsModal onClose={() => setShowStatsModal(false)} />
      )}
      {showInventoryModal && (
        <InventoryModal
          onClose={() => setShowInventoryModal(false)}
          items={inventoryItems}
          gold={gold}
          maxWeight={maxWeight}
          onDropItem={handleDropItem}
          onUpdateItems={handleUpdateItems}
        />
      )}
    </div>
  )
}

export default GamePage
