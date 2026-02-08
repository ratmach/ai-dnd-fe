import { useState } from 'react'
import { Item, ItemStats } from '../types/items'
import './InventoryModal.css'

interface InventoryModalProps {
  onClose: () => void
  items: (Item | null)[]
  gold: number
  maxWeight: number
  onDropItem: (index: number) => void
  onUpdateItems: (items: (Item | null)[]) => void
  activePlayerName?: string
  onConsumeItem?: (itemId: string) => Promise<void>
}

function InventoryModal({
  onClose,
  items,
  gold,
  maxWeight,
  onDropItem,
  onUpdateItems,
  activePlayerName = 'Player',
  onConsumeItem
}: InventoryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number; transform?: string } | null>(null)

  const calculateTotalWeight = (): number => {
    return items.reduce((total, item) => {
      return total + (item?.weight || 0)
    }, 0)
  }

  const totalWeight = calculateTotalWeight()
  const weightPercentage = (totalWeight / maxWeight) * 100

  const handleDropItem = (index: number) => {
    if (items[index]) {
      onDropItem(index)
      setSelectedIndex(null)
    }
  }

  const handleItemClick = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(index)
    }
  }

  const renderItemTooltip = (item: Item, position: 'top' | 'bottom' = 'top', index: number) => {
    if (!item) return null

    const statsList: string[] = []
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (value) {
          const statName = key.charAt(0).toUpperCase() + key.slice(1)
          statsList.push(`${statName}: +${value}`)
        }
      })
    }

    const column = index % 8
    let arrowClass = 'tooltip-arrow-center'
    if (column === 0) {
      arrowClass = 'tooltip-arrow-left'
    } else if (column === 7) {
      arrowClass = 'tooltip-arrow-right'
    }

    return (
      <>
        <div className="tooltip-header">
          <span className={`item-name-rarity ${item.rarity}`}>{item.name}</span>
          <span className="item-type">{item.type}</span>
        </div>
        <div className="tooltip-description">{item.description}</div>
        {statsList.length > 0 && (
          <div className="tooltip-stats">
            {statsList.map((stat, idx) => (
              <div key={idx} className="tooltip-stat">{stat}</div>
            ))}
          </div>
        )}
        <div className="tooltip-footer">
          <span>Weight: {item.weight} kg</span>
          <span>Value: {item.value} gold</span>
        </div>
        {position === 'top' && <div className={`tooltip-arrow tooltip-arrow-top ${arrowClass}`} />}
        {position === 'bottom' && <div className={`tooltip-arrow tooltip-arrow-bottom ${arrowClass}`} />}
      </>
    )
  }

  return (
    <div className="modal-overlay inventory-modal-container" onClick={onClose}>
      <div className="modal-content inventory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Inventory & Stash</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="inventory-body">
          <div className="inventory-stats">
            <div className="weight-display">
              <span>Weight: {totalWeight.toFixed(1)} / {maxWeight} kg</span>
              <div className="weight-bar-container">
                <div
                  className={`weight-bar ${weightPercentage > 100 ? 'overweight' : weightPercentage > 80 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(weightPercentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="gold-display">
              <span className="gold-icon">💰</span>
              <span className="gold-amount">{gold.toLocaleString()} gold</span>
            </div>
          </div>

          <div className="inventory-grid">
            {Array.from({ length: 64 }, (_, index) => {
              const item = items[index] || null
              const isSelected = selectedIndex === index
              const isHovered = hoveredIndex === index

              // Determine if item is in first row (indices 0-7)
              const isFirstRow = index < 8
              const tooltipPosition = isFirstRow ? 'bottom' : 'top'

              return (
                <div
                  key={index}
                  className={`inventory-slot ${isSelected ? 'selected' : ''} ${item ? 'filled' : 'empty'}`}
                  onClick={() => handleItemClick(index)}
                  onMouseEnter={(e) => {
                    setHoveredIndex(index)
                    if (item) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const column = index % 8
                      const pos: { top?: number; bottom?: number; left?: number; right?: number; transform?: string } = {}
                      
                      if (isFirstRow) {
                        pos.top = rect.bottom + 8
                      } else {
                        pos.bottom = window.innerHeight - rect.top + 8
                      }
                      
                      if (column === 0) {
                        pos.left = rect.left
                        pos.transform = 'translateX(0)'
                      } else if (column === 7) {
                        pos.right = window.innerWidth - rect.right
                        pos.transform = 'translateX(0)'
                      } else {
                        pos.left = rect.left + rect.width / 2
                        pos.transform = 'translateX(-50%)'
                      }
                      
                      setTooltipPosition(pos)
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null)
                    setTooltipPosition(null)
                  }}
                >
                  {item ? (
                    <>
                      <div className="item-icon">{item.icon || '📦'}</div>
                      <div className="item-name">{item.name}</div>
                    </>
                  ) : (
                    <div className="empty-slot">+</div>
                  )}
                </div>
              )
            })}
          </div>
          
          {hoveredIndex !== null && items[hoveredIndex] && tooltipPosition && (
            <div 
              className="item-tooltip" 
              style={tooltipPosition}
            >
              {renderItemTooltip(items[hoveredIndex]!, tooltipPosition.bottom !== undefined ? 'bottom' : 'top', hoveredIndex)}
            </div>
          )}
                </div>
          </div>

          {selectedIndex !== null && items[selectedIndex] && (
            <div className="inventory-actions">
              <div className="action-buttons-row">
                {items[selectedIndex]?.type === 'consumable' && onConsumeItem && (
                  <button
                    className="use-button"
                    onClick={async () => {
                      if (items[selectedIndex]) {
                        await onConsumeItem(items[selectedIndex].id)
                        setSelectedIndex(null)
                      }
                    }}
                  >
                    Use Consumable
                  </button>
                )}
                <button
                  className="drop-button"
                  onClick={() => handleDropItem(selectedIndex)}
                >
                  Drop Item
                </button>
              </div>
              <div className="selected-item-info">
                Selected: {items[selectedIndex]?.name}
              </div>
            </div>
          )}
        </div>
  )
}

export default InventoryModal
