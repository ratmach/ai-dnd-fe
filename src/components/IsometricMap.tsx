import { useEffect, useRef, useState } from 'react'
import * as ex from 'excalibur'
import { TiledMapResource } from '@excaliburjs/plugin-tiled'
import { tileImages } from '../utils/tmxParser'
import './IsometricMap.css'

interface IsometricMapProps {
  players?: any[]
  enemies?: any[]
}

// Mock spell data
const mockSpells = [
  { id: 1, name: 'Fireball', level: 3, icon: '🔥', cooldown: 0, maxCooldown: 0 },
  { id: 2, name: 'Ice Bolt', level: 2, icon: '❄️', cooldown: 2, maxCooldown: 3 },
  { id: 3, name: 'Lightning', level: 4, icon: '⚡', cooldown: 0, maxCooldown: 0 },
  { id: 4, name: 'Heal', level: 1, icon: '💚', cooldown: 1, maxCooldown: 2 },
  { id: 5, name: 'Shield', level: 2, icon: '🛡️', cooldown: 0, maxCooldown: 0 },
]

function IsometricMap({ }: IsometricMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ex.Engine | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spellSlotsMinimized, setSpellSlotsMinimized] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    let engine: ex.Engine | null = null
    let wheelHandler: ((evt: WheelEvent) => void) | null = null
    const canvas = canvasRef.current

    const loadMap = async () => {
      try {
        // Create Excalibur engine
        engine = new ex.Engine({
          width: window.innerWidth,
          height: window.innerHeight,
          canvasElement: canvasRef.current!,
          backgroundColor: ex.Color.fromHex('#1a1a2e'),
          pointerScope: ex.PointerScope.Canvas
        })

        // Load Tiled map using plugin
        const tiledMap = new TiledMapResource('/maps/tavern1.tmx', {
          startingLayerZIndex: 0
        })
        
        // Set up path converter to resolve relative tileset paths
        // This must be set BEFORE adding to loader
        tiledMap.convertPath = (originPath: string, relativePath: string) => {
          
          // If path is absolute, return as-is
          if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
            return relativePath
          }
          
          // Resolve relative to origin directory
          // originPath will be like "/maps/tilesets/tavern_tileset.tsx"
          // relativePath will be like "../assets/tavern floor.png"
          const originDir = originPath.substring(0, originPath.lastIndexOf('/'))
          // originDir = "/maps/tilesets"
          
          // Split relative path and resolve ../ 
          const parts = relativePath.split('/')
          const dirParts = originDir.split('/').filter(p => p)
          
          for (const part of parts) {
            if (part === '..') {
              dirParts.pop() // Go up one directory
            } else if (part !== '.') {
              dirParts.push(part)
            }
          }
          
          let resolved = '/' + dirParts.join('/')
          if (resolved.startsWith("/assets")) {
            resolved = "/maps" + resolved
          }
          return resolved
        }
        
        // Add resources to loader
        const loader = new ex.Loader()
        loader.addResource(tiledMap)
        loader.addResources(Object.values(tileImages))
        
        // Start engine and load resources
        await engine.start(loader)
        
        // Add the Tiled map to the scene
        tiledMap.addTiledMapToScene(engine.currentScene)
        
        // Light sources (in tile coordinates)
        const lightSources = [
          { x: 2, y: 5, radius: 2 },
        ]
        
        // Get the isometric map layers
        const isoLayers = tiledMap.getIsometricMapLayers()
        
        console.log('Isometric layers:', isoLayers.length)
        if (isoLayers.length > 0) {
          console.log('Layer dimensions:', isoLayers[0].columns, 'x', isoLayers[0].rows)
        }
        
        // Convert tile coords to isometric world coords
        const tileWidth = 128
        const tileHeight = 64
        const convertToIso = (tileX: number, tileY: number) => {
          const worldX = (tileX - tileY) * (tileWidth / 2)
          const worldY = (tileX + tileY) * (tileHeight / 2)
          return ex.vec(worldX, worldY)
        }
        
        // Function to calculate light intensity at a tile position
        const getLightIntensity = (tileX: number, tileY: number): number => {
          let maxIntensity = 0 // Complete darkness by default
          
          for (const light of lightSources) {
            const dx = tileX - light.x
            const dy = tileY - light.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance <= light.radius) {
              // Full brightness at center, falloff to edge
              const intensity = 1.0 - (distance / light.radius)
              maxIntensity = Math.max(maxIntensity, intensity)
            }
          }
          
          return maxIntensity
        }
        
        // Create individual black square overlay for each tile with specific opacity
        let lightTilesCount = 0
        let topLayer = isoLayers[isoLayers.length - 1]
        console.log(topLayer)
        for (let y = 0; y < topLayer.rows; y++) {
          for (let x = 0; x < topLayer.columns; x++) {
            const tile = topLayer.getTile(x, y)
            if (tile) {
              const intensity = getLightIntensity(x, y)
              const darkness = 1.0 - intensity // Inverse: 1 = dark, 0 = bright
              
              if (intensity > 0.5) {
                lightTilesCount++
                console.log(`Bright tile at (${x}, ${y}) with intensity ${intensity.toFixed(2)}`)
              }
              
              // Skip if fully lit (no need for overlay)
              //if (darkness < 0.01) continue
              
              const tilePos =[
                new ex.Vector(0, -tileHeight / 2), // Top
                new ex.Vector(tileWidth / 2, 0), // Right
                new ex.Vector(0, tileHeight / 2), // Bottom
                new ex.Vector(-tileWidth / 2, 0) // Left
              ]

              const lightPolygon = new ex.Polygon({
                points: tilePos,
                color: ex.Color.fromRGB(0, 0, 0, darkness * 0.85),
              })
              
              
              tile.addGraphic(lightPolygon)
            }else{
              console.log(`No tile at (${x}, ${y})`)
            }
          }
        }
        
        console.log(`Total bright tiles (>0.5 intensity): ${lightTilesCount}`)
        
        engineRef.current = engine

        // Camera panning state
        let isPanning = false
        let panStartScreenPos: ex.Vector | null = null
        let panStartCameraPos: ex.Vector | null = null
        let hasMoved = false
        const DRAG_THRESHOLD = 5

        // Set initial cursor style
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab'
        }

        const currentEngine = engine
        
        // Enable click and drag panning
          currentEngine.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
            isPanning = false
            hasMoved = false
            panStartScreenPos = evt.screenPos.clone()
            panStartCameraPos = currentEngine.currentScene.camera.pos.clone()
          })

          currentEngine.input.pointers.primary.on('move', (evt: ex.PointerEvent) => {
            if (panStartScreenPos && panStartCameraPos) {
              const delta = evt.screenPos.sub(panStartScreenPos)
              const distance = Math.abs(delta.x) + Math.abs(delta.y)
              
              if (distance > DRAG_THRESHOLD && !isPanning) {
                isPanning = true
                hasMoved = true
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'grabbing'
                }
              }
              
              if (isPanning) {
                currentEngine.currentScene.camera.pos = panStartCameraPos.sub(delta)
              }
            }
          })

        currentEngine.input.pointers.primary.on('up', () => {
            if (canvasRef.current && !hasMoved) {
              canvasRef.current.style.cursor = 'default'
            } else if (canvasRef.current) {
              canvasRef.current.style.cursor = 'grab'
            }
            isPanning = false
            panStartScreenPos = null
            panStartCameraPos = null
            hasMoved = false
          })
          
        // Add mouse wheel zoom functionality
        wheelHandler = (evt: WheelEvent) => {
          evt.preventDefault()
          
          const zoomSpeed = 0.0003
          const minZoom = 0.5
          const maxZoom = 3.0
          
          const currentZoom = currentEngine.currentScene.camera.zoom
          const zoomDelta = -evt.deltaY * zoomSpeed
          let newZoom = currentZoom + zoomDelta
          
          newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
          currentEngine.currentScene.camera.zoom = newZoom
        }
        
        if (canvas) {
          canvas.addEventListener('wheel', wheelHandler, { passive: false })
        }
        
        // Handle window resize
        const handleResize = () => {
          if (currentEngine && currentEngine.canvas) {
            const newWidth = window.innerWidth
            const newHeight = window.innerHeight
            currentEngine.canvas.width = newWidth
            currentEngine.canvas.height = newHeight
            currentEngine.screen.resolution = { width: newWidth, height: newHeight }
          }
        }
        
        window.addEventListener('resize', handleResize)
        ;(currentEngine as any)._resizeHandler = handleResize
      } catch (err) {
        console.error('Error loading map:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (engineRef.current) {
        const resizeHandler = (engineRef.current as any)._resizeHandler
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler)
        }
        engineRef.current.stop()
      }
      if (canvas && wheelHandler) {
        canvas.removeEventListener('wheel', wheelHandler)
      }
    }
  }, [])

  if (error) {
    return (
      <div className="isometric-map-container">
        <div className="map-error">Error loading map: {error}</div>
      </div>
    )
  }

  return (
    <div className="isometric-map-container">
      <canvas ref={canvasRef} className="isometric-canvas" />
      <div className={`spell-slots-wrapper ${spellSlotsMinimized ? 'minimized' : ''}`}>
        <div className="spell-slots-header">
          <span className="spell-slots-title">Spell Slots</span>
          <button 
            className="toggle-spell-slots"
            onClick={() => setSpellSlotsMinimized(!spellSlotsMinimized)}
            title={spellSlotsMinimized ? 'Maximize' : 'Minimize'}
          >
            {spellSlotsMinimized ? '▲' : '▼'}
          </button>
        </div>
        {!spellSlotsMinimized && (
          <div className="spell-slots-container">
            {Array.from({ length: 22 }).map((_, index) => {
              const spell = mockSpells[index]
              const isEmpty = !spell
              const isOnCooldown = spell && spell.cooldown > 0
              
              return (
                <div
                  key={index}
                  className={`spell-slot ${isEmpty ? 'empty' : ''} ${isOnCooldown ? 'on-cooldown' : ''}`}
                  title={spell ? `${spell.name} (Level ${spell.level})` : 'Empty Slot'}
                >
                  {!isEmpty && (
                    <>
                      <div className="spell-level">Level {spell.level}</div>
                      <div className="spell-icon">{spell.icon}</div>
                      <div className="spell-name">{spell.name}</div>
                      {isOnCooldown && (
                        <div className="cooldown-overlay">
                          <span className="cooldown-text">{spell.cooldown}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default IsometricMap
