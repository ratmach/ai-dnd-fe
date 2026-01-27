export interface Item {
  id: string
  name: string
  description: string
  weight: number
  icon?: string // Path to icon image, or emoji/character
  type: ItemType
  rarity: ItemRarity
  stats?: ItemStats
  value: number // Gold value
}

export type ItemType = 
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'material'
  | 'quest'
  | 'misc'

export type ItemRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'

export interface ItemStats {
  attack?: number
  defense?: number
  health?: number
  mana?: number
  strength?: number
  dexterity?: number
  intelligence?: number
}

export interface InventoryState {
  items: (Item | null)[]
  gold: number
  maxWeight: number
}
