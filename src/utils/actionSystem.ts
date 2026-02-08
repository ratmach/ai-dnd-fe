/**
 * Action system for handling game actions with delayed promises
 */

export type ActionType = 'move' | 'attack' | 'consume' | 'custom'

export interface ActionParameters {
  move?: { x: number; y: number }
  attack?: { x: number; y: number }
  consume?: { itemId: string }
  custom?: { custom_action: string }
}

export interface Action {
  type: ActionType
  parameters: ActionParameters
}

/**
 * Executes an action with a delayed promise and logs to console
 * @param activePlayer The active player identifier
 * @param action The action type
 * @param parameters The action parameters
 * @param delayMs Delay in milliseconds before resolving (default: 500)
 * @returns Promise that resolves after the delay
 */
export async function executeAction(
  activePlayer: string,
  action: ActionType,
  parameters: ActionParameters,
  delayMs: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    // Log the action
    console.log('active_player', action, parameters)
    
    // Resolve after delay
    setTimeout(() => {
      resolve()
    }, delayMs)
  })
}

/**
 * Helper to find an adjacent tile to a target position
 * Returns the first available adjacent tile (north, east, south, west)
 */
export function findAdjacentTile(targetX: number, targetY: number, mapWidth: number, mapHeight: number): { x: number; y: number } | null {
  const directions = [
    { x: 0, y: -1 }, // North
    { x: 1, y: 0 },  // East
    { x: 0, y: 1 },  // South
    { x: -1, y: 0 }  // West
  ]
  
  for (const dir of directions) {
    const newX = targetX + dir.x
    const newY = targetY + dir.y
    
    // Check if within map bounds
    if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
      return { x: newX, y: newY }
    }
  }
  
  return null
}
