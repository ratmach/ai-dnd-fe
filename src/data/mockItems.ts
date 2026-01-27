import { Item } from '../types/items'

export const mockItems: Item[] = [
  {
    id: 'sword-1',
    name: 'Iron Sword',
    description: 'A sturdy iron blade, reliable in combat.',
    weight: 3.5,
    icon: '⚔️',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 8 },
    value: 50
  },
  {
    id: 'shield-1',
    name: 'Wooden Shield',
    description: 'A basic shield made from oak wood.',
    weight: 2.0,
    icon: '🛡️',
    type: 'armor',
    rarity: 'common',
    stats: { defense: 5 },
    value: 30
  },
  {
    id: 'potion-1',
    name: 'Health Potion',
    description: 'Restores 50 health points when consumed.',
    weight: 0.5,
    icon: '🧪',
    type: 'consumable',
    rarity: 'common',
    stats: { health: 50 },
    value: 25
  },
  {
    id: 'armor-1',
    name: 'Leather Armor',
    description: 'Lightweight leather protection.',
    weight: 4.0,
    icon: '🦺',
    type: 'armor',
    rarity: 'common',
    stats: { defense: 6 },
    value: 75
  },
  {
    id: 'staff-1',
    name: 'Oak Staff',
    description: 'A staff carved from ancient oak, enhances magical abilities.',
    weight: 2.5,
    icon: '🍢',
    type: 'weapon',
    rarity: 'uncommon',
    stats: { attack: 5, intelligence: 3 },
    value: 120
  },
  {
    id: 'gem-1',
    name: 'Ruby Gem',
    description: 'A precious red gemstone, valuable for crafting.',
    weight: 0.1,
    icon: '💎',
    type: 'material',
    rarity: 'rare',
    value: 200
  },
  {
    id: 'boots-1',
    name: 'Swift Boots',
    description: 'Boots that increase movement speed.',
    weight: 1.5,
    icon: '👢',
    type: 'armor',
    rarity: 'uncommon',
    stats: { dexterity: 4 },
    value: 150
  },
  {
    id: 'scroll-1',
    name: 'Scroll of Fireball',
    description: 'A magical scroll containing a fireball spell.',
    weight: 0.2,
    icon: '📜',
    type: 'consumable',
    rarity: 'rare',
    stats: { intelligence: 2 },
    value: 100
  },
  {
    id: 'ring-1',
    name: 'Ring of Strength',
    description: 'A magical ring that enhances physical strength.',
    weight: 0.1,
    icon: '💍',
    type: 'misc',
    rarity: 'epic',
    stats: { strength: 5 },
    value: 500
  },
  {
    id: 'helmet-1',
    name: 'Steel Helmet',
    description: 'A protective helmet made of hardened steel.',
    weight: 3.0,
    icon: '⛑️',
    type: 'armor',
    rarity: 'uncommon',
    stats: { defense: 8 },
    value: 200
  },
  {
    id: 'bow-1',
    name: 'Elven Longbow',
    description: 'An elegant bow crafted by elven artisans.',
    weight: 2.0,
    icon: '🏹',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 12, dexterity: 3 },
    value: 350
  },
  {
    id: 'potion-2',
    name: 'Mana Potion',
    description: 'Restores 30 mana points when consumed.',
    weight: 0.5,
    icon: '🔮',
    type: 'consumable',
    rarity: 'common',
    stats: { mana: 30 },
    value: 20
  },
  {
    id: 'key-1',
    name: 'Ancient Key',
    description: 'A mysterious key that might unlock something important.',
    weight: 0.3,
    icon: '🗝️',
    type: 'quest',
    rarity: 'rare',
    value: 0
  },
  {
    id: 'ore-1',
    name: 'Iron Ore',
    description: 'Raw iron ore, can be smelted into ingots.',
    weight: 2.5,
    icon: '⛏️',
    type: 'material',
    rarity: 'common',
    value: 15
  },
  {
    id: 'book-1',
    name: 'Spellbook',
    description: 'A tome containing ancient magical knowledge.',
    weight: 1.5,
    icon: '📖',
    type: 'misc',
    rarity: 'epic',
    stats: { intelligence: 8 },
    value: 800
  },
  {
    id: 'amulet-1',
    name: 'Amulet of Protection',
    description: 'Provides magical protection against harm.',
    weight: 0.5,
    icon: '🔱',
    type: 'misc',
    rarity: 'legendary',
    stats: { defense: 15, health: 20 },
    value: 1500
  }
]
