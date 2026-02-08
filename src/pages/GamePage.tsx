import { useState } from 'react'
import PlayerList from '../components/PlayerList'
import CharacterStatsModal from '../components/CharacterStatsModal'
import InventoryModal from '../components/InventoryModal'
import LevelUpModal from '../components/LevelUpModal'
import IsometricMap from '../components/IsometricMap'
import ActionBox from '../components/ActionBox'
import ActionLogs, { ActionLogEntry } from '../components/ActionLogs'
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
  character?: string // Maps to tileImages key (e.g., 'knight', 'dwarf', 'druid')
  x?: number // Isometric map x coordinate
  y?: number // Isometric map y coordinate
}

export interface Enemy {
  id: number
  name: string
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  character: string // Maps to tileImages key (e.g., 'goblin', 'goblinB')
  x: number // Isometric map x coordinate
  y: number // Isometric map y coordinate
}

function GamePage() {
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [gold, setGold] = useState(1250)
  const [maxWeight] = useState(50) // Max carry weight in kg
  const [currentAP, setCurrentAP] = useState(10)
  const [maxAP] = useState(10)
  const [actionLogs, setActionLogs] = useState<ActionLogEntry[]>([
    {
      id: 1,
      timestamp: new Date(),
      type: 'system',
      author: 'System',
      message: 'Game started'
    }
  ])
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
  
  // Get character data from localStorage if available
  const getCharacterData = (): Player | null => {
    const stored = localStorage.getItem('characterData')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        return {
          id: Date.now(), // Use timestamp as ID
          name: data.name,
          icon: data.name.substring(0, 2).toUpperCase(),
          hp: 100,
          maxHp: 100,
          mana: 100,
          maxMana: 100,
          level: 1,
          online: true,
          character: data.character || 'default',
          x: 10,
          y: 10
        }
      } catch (e) {
        console.error('Failed to parse character data:', e)
      }
    }
    return null
  }
  
  const [players, setPlayers] = useState<Player[]>(() => {
    const characterData = getCharacterData()
    const basePlayers: Player[] = [
      {
        id: 1,
        name: 'Player One',
        icon: 'P1',
        hp: 85,
        maxHp: 100,
        mana: 60,
        maxMana: 100,
        level: 5,
        online: true,
        character: 'knight',
        x: 10,
        y: 10
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
        online: true,
        character: 'dwarf',
        x: 12,
        y: 10
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
        online: false,
        character: 'druid',
        x: 10,
        y: 12
      }
    ]
    
    // If character data exists, replace the first player with the created character
    if (characterData) {
      return [characterData, ...basePlayers.slice(1)]
    }
    
    return basePlayers
  })
  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 1,
      name: 'Goblin',
      hp: 30,
      maxHp: 30,
      mana: 10,
      maxMana: 10,
      character: 'goblin',
      x: 15,
      y: 12
    },
    {
      id: 2,
      name: 'Goblin B',
      hp: 35,
      maxHp: 35,
      mana: 15,
      maxMana: 15,
      character: 'goblinB',
      x: 18,
      y: 15
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

  const handleAction = (action: string, type: 'button' | 'text') => {
    const currentPlayer = players.find(p => p.online) || players[0]
    const newLog: ActionLogEntry = {
      id: actionLogs.length + 1,
      timestamp: new Date(),
      type: 'player',
      author: currentPlayer.name,
      message: action
    }
    setActionLogs([newLog, ...actionLogs]) // Newest first
  }
  
  // Get active player
  const getActivePlayer = () => {
    return players.find(p => p.online) || players[0]
  }
  
  // Handle custom action
  const handleCustomAction = async (customAction: string) => {
    const activePlayer = getActivePlayer()
    if (!activePlayer) return
    
    const { executeAction } = await import('../utils/actionSystem')
    const params = { custom: { custom_action: customAction } }
    await executeAction(activePlayer.name, 'custom', params)
  }
  
  // Handle consume item
  const handleConsumeItem = async (itemId: string) => {
    const activePlayer = getActivePlayer()
    if (!activePlayer) return
    
    const { executeAction } = await import('../utils/actionSystem')
    const params = { consume: { itemId } }
    await executeAction(activePlayer.name, 'consume', params)
  }
  
  // Handle action completion (for map actions)
  const handleActionComplete = () => {
    // Could update UI or trigger refresh here
  }
  
  // Handle level-up path selection
  const handleLevelUpConfirm = (pathId: string) => {
    const activePlayer = getActivePlayer()
    if (activePlayer) {
      const newLog: ActionLogEntry = {
        id: actionLogs.length + 1,
        timestamp: new Date(),
        type: 'system',
        author: 'System',
        message: `${activePlayer.name} chose the ${pathId === 'evoker' ? 'Evoker' : 'Necromancer'} path!`
      }
      setActionLogs([newLog, ...actionLogs])
    }
    console.log('Selected development path:', pathId)
  }

  return (
    <div className="game-page">
      <PlayerList players={players} />
      <div className="game-content">
        <div className="game-header">
          <h2>DnD Game</h2>
          <div className="header-right">
            <div className="ap-counter">
              AP: {currentAP}/{maxAP}
            </div>
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
              <button
                className="levelup-button"
                onClick={() => setShowLevelUpModal(true)}
              >
                Level Up
              </button>
            </div>
          </div>
        </div>
        <div className="game-main-content">
          <IsometricMap 
            players={players} 
            enemies={enemies}
            activePlayerId={getActivePlayer()?.id}
            onActionComplete={handleActionComplete}
          />
        </div>
        <div className="game-sidebar-overlay">
          <ActionBox 
            onAction={handleAction}
            onCustomAction={handleCustomAction}
            activePlayerName={getActivePlayer()?.name}
          />
          <ActionLogs logs={actionLogs} />
        </div>
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
          activePlayerName={getActivePlayer()?.name}
          onConsumeItem={handleConsumeItem}
        />
      )}
      {showLevelUpModal && (
        <LevelUpModal
          onClose={() => setShowLevelUpModal(false)}
          onConfirm={handleLevelUpConfirm}
          currentLevel={getActivePlayer()?.level || 1}
        />
      )}
    </div>
  )
}

export default GamePage
