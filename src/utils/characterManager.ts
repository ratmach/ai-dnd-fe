import * as ex from 'excalibur'

export interface Character {
  id: string
  name: string
  type: 'player' | 'enemy' | 'npc'
  sprite: string
  position: { x: number; y: number }
  actor?: ex.Actor
}

export class CharacterManager {
  private characters: Map<string, Character> = new Map()
  private characterSprites: Map<string, ex.ImageSource> = new Map()

  constructor() {
    // Initialize character sprites
    this.characterSprites.set('knight', new ex.ImageSource('/characters/processed/knight.png'))
    this.characterSprites.set('ranger', new ex.ImageSource('/characters/processed/ranger.png'))
    this.characterSprites.set('druid', new ex.ImageSource('/characters/processed/druid.png'))
    this.characterSprites.set('dwarf', new ex.ImageSource('/characters/processed/dwarf.png'))
  }

  async loadResources(loader: ex.Loader) {
    for (const [_, sprite] of this.characterSprites) {
      loader.addResource(sprite)
    }
  }

  addCharacter(character: Character): void {
    this.characters.set(character.id, character)
  }

  removeCharacter(id: string): void {
    const character = this.characters.get(id)
    if (character?.actor) {
      character.actor.kill()
    }
    this.characters.delete(id)
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.get(id)
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values())
  }

  createActorForCharacter(
    character: Character, 
    scene: ex.Scene,
    tileToWorldConverter?: (tileX: number, tileY: number) => ex.Vector,
    isometricConfig?: { rows: number; columns: number; tileWidth: number; tileHeight: number }
  ): ex.Actor {
    const spriteImage = this.characterSprites.get(character.sprite)
    
    if (!spriteImage) {
      throw new Error(`Sprite not found: ${character.sprite}`)
    }

    // Convert tile coordinates to world coordinates if converter provided
    let worldPos = ex.vec(character.position.x, character.position.y)
    if (tileToWorldConverter) {
      worldPos = tileToWorldConverter(character.position.x, character.position.y)
    }

    // Create actor
    const actor = new ex.Actor({
      name: character.name,
      pos: worldPos,
      width: 64,
      height: 64,
      anchor: ex.vec(0.5, 1), // Bottom-center anchor for isometric
    })

    // Add IsometricEntityComponent if isometric config provided
    if (isometricConfig) {
      const isoComponent = new ex.IsometricEntityComponent({
        rows: isometricConfig.rows,
        columns: isometricConfig.columns,
        tileWidth: isometricConfig.tileWidth,
        tileHeight: isometricConfig.tileHeight
      })
      // Set elevation to be above the map (map layers start at 0)
      isoComponent.elevation = 10
      actor.addComponent(isoComponent)
    } else {
      // Fallback z-index for non-isometric
      actor.z = 100
    }

    // Add sprite
    const sprite = spriteImage.toSprite()
    actor.graphics.use(sprite)

    // Store actor reference
    character.actor = actor

    // Add to scene
    scene.add(actor)

    return actor
  }

  updateCharacterPosition(
    id: string, 
    tileX: number, 
    tileY: number,
    tileToWorldConverter?: (tileX: number, tileY: number) => ex.Vector
  ): void {
    const character = this.characters.get(id)
    if (character) {
      character.position = { x: tileX, y: tileY }
      if (character.actor) {
        // Convert tile coordinates to world coordinates if converter provided
        const worldPos = tileToWorldConverter 
          ? tileToWorldConverter(tileX, tileY)
          : ex.vec(tileX, tileY)
        character.actor.pos = worldPos
      }
    }
  }

  // Mock data generation
  static generateMockCharacters(): Character[] {
    return [
      {
        id: 'player1',
        name: 'Knight',
        type: 'player',
        sprite: 'knight',
        position: { x: 8, y: 8 } // Tile coordinates
      },
      {
        id: 'player2',
        name: 'Ranger',
        type: 'player',
        sprite: 'ranger',
        position: { x: 7, y: 9 } // Tile coordinates
      },
      {
        id: 'enemy1',
        name: 'Goblin Druid',
        type: 'enemy',
        sprite: 'druid',
        position: { x: 12, y: 12 } // Tile coordinates
      },
      {
        id: 'npc1',
        name: 'Dwarf Merchant',
        type: 'npc',
        sprite: 'dwarf',
        position: { x: 10, y: 10 } // Tile coordinates
      }
    ]
  }
}
