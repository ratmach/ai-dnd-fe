import { useEffect, useRef, useState } from 'react'
import * as ex from 'excalibur'
import { parseTMX, getTileColor, getTileImage, tileImages } from '../utils/tmxParser'
import { Enemy, Player } from '../pages/GamePage'
import './IsometricMap.css'

interface IsometricMapProps {
  players?: Player[]
  enemies?: Enemy[]
}

function IsometricMap({ players = [], enemies = [] }: IsometricMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ex.Engine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let engine: ex.Engine | null = null

    const loadMap = async () => {
      try {
        // Load TMX file
        const response = await fetch('/maps/world.tmx')
        if (!response.ok) {
          throw new Error('Failed to load map file')
        }
        const xmlText = await response.text()
        const mapData = parseTMX(xmlText)

        // Create Excalibur engine
        engine = new ex.Engine({
          width: 1200,
          height: 800,
          canvasElement: canvasRef.current!,
          backgroundColor: ex.Color.fromHex('#1a1a2e'),
          pointerScope: ex.PointerScope.Canvas
        })
        const loader = new ex.Loader()
        loader.addResources(Object.values(tileImages))

        // Camera panning state
        let isPanning = false
        let panStartScreenPos: ex.Vector | null = null
        let panStartCameraPos: ex.Vector | null = null
        let hasMoved = false
        const DRAG_THRESHOLD = 5 // Minimum pixels to move before starting pan

        // Set initial cursor style
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab'
        }

        const tileWidth = mapData.tileWidth
        const tileHeight = mapData.tileHeight

        // Helper function to convert isometric coordinates to screen coordinates
        const isoToScreen = (isoX: number, isoY: number): ex.Vector => {
          const screenX = (isoX - isoY) * (tileWidth / 2)
          const screenY = (isoX + isoY) * (tileHeight / 2)
          return new ex.Vector(screenX, screenY)
        }
        const enemyOnTile = (x: number, y: number): boolean => {
          return enemies.some((enemy) => enemy.x === x && enemy.y === y)
        }

        // Store tiles and track hovered tile
        const tiles: ex.Actor[] = []
        let highlightActor: ex.Actor | null = null
        let pathLine: ex.Actor | null = null
        let pathText: ex.Actor | null = null

        // Create highlight overlay actor (initially hidden)
        // Use same diamond shape as tiles
        const highlightPoints = [
          new ex.Vector(0, -tileHeight / 2), // Top
          new ex.Vector(tileWidth / 2, 0), // Right
          new ex.Vector(0, tileHeight / 2), // Bottom
          new ex.Vector(-tileWidth / 2, 0) // Left
        ]

        highlightActor = new ex.Actor({
          pos: new ex.Vector(0, 0),
          z: 100 // Well above tiles to prevent flickering
        })
        const highlightPolygon = new ex.Polygon({
          points: highlightPoints,
          color: ex.Color.fromRGB(255, 255, 255, 0.3),
          strokeColor: ex.Color.fromHex('#6495ed'),
          lineWidth: 2
        })
        highlightActor.graphics.add("default", highlightPolygon)
        highlightActor.graphics.opacity = 0 // Hidden initially
        engine.add(highlightActor)


        // Create path line actor (dotted line from player to hovered tile)
        pathLine = new ex.Actor({
          pos: new ex.Vector(0, 0),
          z: 5 // Above tiles but below highlight
        })
        pathLine.graphics.opacity = 0 // Hidden initially
        engine.add(pathLine)

        // Function to update the path line (dotted line)
        const updatePathLine = (fromPos: ex.Vector, toPos: ex.Vector) => {
          if (!pathLine) return

          // Remove old pathLine from engine and create a new one
          engine?.remove(pathLine)

          const distance = fromPos.distance(toPos)
          if (distance < 1) {
            pathLine = null
            return
          }

          // Calculate path length in tiles (isometric distance)
          // Convert screen distance to isometric tile distance
          // In isometric projection, diagonal movement covers more tiles
          const dx = Math.abs(toPos.x - fromPos.x)
          const dy = Math.abs(toPos.y - fromPos.y)
          // Approximate tile count: use the larger of the two isometric dimensions
          const isoDistance = Math.max(dx / (tileWidth / 2), dy / (tileHeight / 2))
          const pathLengthInTiles = Math.max(1, Math.round(isoDistance))

          // Create new pathLine actor
          pathLine = new ex.Actor({
            pos: fromPos,
            z: 5 // Above tiles but below highlight
          })

          const direction = toPos.sub(fromPos).normalize()
          const dashLength = 8
          const gapLength = 4
          const totalSegment = dashLength + gapLength
          const dashCount = Math.floor(distance / totalSegment)

          // Create dotted line segments
          for (let i = 0; i < dashCount; i++) {
            const segmentStart = i * totalSegment
            const segmentEnd = Math.min(segmentStart + dashLength, distance)

            if (segmentStart >= distance) break

            const startOffset = direction.scale(segmentStart)
            const endOffset = direction.scale(segmentEnd)

            const line = new ex.Line({
              start: startOffset,
              end: endOffset,
              color: ex.Color.fromHex('#6495ed'),
              thickness: 2
            })
            pathLine.graphics.add(line)
          }

          // Add text label at the midpoint of the path
          const midpoint = fromPos.add(direction.scale(distance / 2))

          // Remove old text actor if it exists
          if (pathText) {
            engine?.remove(pathText)
          }

          // Create text actor at midpoint
          pathText = new ex.Actor({
            pos: midpoint.add(new ex.Vector(0, -15)), // Offset above the line
            z: 6 // Above path line
          })

          const textLabel = new ex.Text({
            text: `${pathLengthInTiles} AP`,
            font: new ex.Font({
              size: 14,
              family: 'Arial',
              color: ex.Color.fromHex('#F44336'),
              textAlign: ex.TextAlign.Center
            }),
          })
          pathText.graphics.add(textLabel)
          engine?.add(pathText)

          engine?.add(pathLine)
        }

        // Render all layers
        mapData.layers.forEach((layer) => {
          for (let y = 0; y < layer.height; y++) {
            for (let x = 0; x < layer.width; x++) {
              const tileId = layer.tiles[y][x]
              if (tileId === 0) continue // Skip empty tiles

              const screenPos = isoToScreen(x, y)
              const tileColor = getTileColor(tileId, mapData.tilesets)
              const tileImage = getTileImage(tileId, mapData.tilesets)

              if (!tileColor && !tileImage) continue

              // Create isometric diamond shape points (relative to center)
              const diamondPoints = [
                new ex.Vector(0, -tileHeight / 2), // Top
                new ex.Vector(tileWidth / 2, 0), // Right
                new ex.Vector(0, tileHeight / 2), // Bottom
                new ex.Vector(-tileWidth / 2, 0) // Left
              ]

              const tile = new ex.Actor({
                pos: new ex.Vector(
                  screenPos.x + (engine?.drawWidth || 0) / 2,
                  screenPos.y + 150
                )
              })

              // Create polygon collider that matches the diamond shape
              const collider = ex.Shape.Polygon(diamondPoints)
              tile.collider.set(collider)
              const sprite = tileImage ? new ex.Sprite({
                image: tileImage,
                width: tileWidth / 2,
                height: tileHeight * 2,
                origin: new ex.Vector(-1, -1),
              }) : undefined
              // Create visual diamond shape
              const diamond = new ex.Polygon({
                points: diamondPoints,
                color: tileImage ? ex.Color.fromHex('#000000') : ex.Color.fromHex(tileColor || '#000000'),
                strokeColor: ex.Color.fromRGBString('rgba(0, 0, 0, 0.3)'),
                lineWidth: 1
              })
              if (sprite != null) {
                sprite.origin = new ex.Vector(-1, -1)
                tile.graphics.add(sprite)
              } else {
                tile.graphics.add(diamond)
              }

              // Enable pointer events
              tile.body.collisionType = ex.CollisionType.Passive

              tile.on('pointerdown', () => {
                // Prevent panning when clicking on tiles
                isPanning = false
                panStartScreenPos = null
                panStartCameraPos = null
              })

              tile.on('pointerenter', () => {
                if (highlightActor) {
                  highlightActor.pos = tile.pos
                  if (enemyOnTile(x, y)) {
                    highlightActor.graphics.getGraphic("default")!.tint = ex.Color.fromRGB(220, 38, 38, 0.4)
                    if (canvasRef.current) {
                      canvasRef.current.style.cursor = "pointer"
                    }
                  } else {
                    highlightActor.graphics.getGraphic("default")!.tint = ex.Color.fromRGB(255, 255, 255, 0.3)
                    if (canvasRef.current) {
                      canvasRef.current.style.cursor = 'default'
                    }
                  }
                  highlightActor.graphics.opacity = 1
                  if(canvasRef.current){
                    console.log(canvasRef.current)
                  }
                }
                // Update path line from first player to tile center
                if (players && players.length > 0 && players[0].x !== undefined && players[0].y !== undefined) {
                  const firstPlayerPos = isoToScreen(players[0].x, players[0].y)
                  const playerCenter = new ex.Vector(
                    firstPlayerPos.x + (engine?.drawWidth || 0) / 2,
                    firstPlayerPos.y + 150 - 15
                  )
                  const tileCenter = tile.pos
                  updatePathLine(playerCenter, tileCenter)
                }
              })

              tiles.push(tile)
              engine?.add(tile)
            }
          }
        })

        // Add players
        if (players && Array.isArray(players)) {
          players.forEach((player) => {
            // Skip players without position
            if (player.x === undefined || player.y === undefined) return

            const playerPos = isoToScreen(player.x, player.y)
            const playerScreenPos = new ex.Vector(
              playerPos.x + (engine?.drawWidth || 0) / 2,
              playerPos.y + 150 - 15
            )

            // Create isometric circle under player
            const circleRadius = 64 / Math.PI
            const circleSegments = 32
            const circlePoints: ex.Vector[] = []

            for (let i = 0; i < circleSegments; i++) {
              const angle = (i / circleSegments) * Math.PI * 2
              // Isometric circle: radiusX = circleRadius, radiusY = circleRadius / 2
              const x = Math.cos(angle) * circleRadius
              const y = Math.sin(angle) * (circleRadius / 2)
              circlePoints.push(new ex.Vector(x, y))
            }

            const playerCircle = new ex.Polygon({
              points: circlePoints,
              color: ex.Color.fromRGB(100, 149, 237, 0.3), // Semi-transparent blue
              strokeColor: ex.Color.fromHex('#6495ed'),
              lineWidth: 2
            })

            const circleActor = new ex.Actor({
              pos: new ex.Vector(
                playerScreenPos.x,
                playerScreenPos.y + 16,
              ),
              z: 5 // Below player but above tiles
            })
            circleActor.graphics.add(playerCircle)
            engine?.add(circleActor)

            // Create player actor
            const playerActor = new ex.Actor({
              pos: playerScreenPos,
              width: 20,
              height: 10,
              z: 15 // Above enemies but below highlight
            })

            // Get player sprite from tileImages using character property, or default to knight
            const characterKey = player.character || 'knight'
            const playerImage = tileImages[characterKey]
            if (playerImage) {
              const playerSprite = new ex.Sprite({
                image: playerImage,
                width: 500,
                height: 500,
                origin: new ex.Vector(0, 0),
                scale: new ex.Vector(0.1, 0.1),
              })
              playerActor.graphics.add(playerSprite)
            } else {
              // Fallback to a colored ellipse if sprite not found
              const playerRadius = 10
              const segments = 32
              const ellipsePoints: ex.Vector[] = []

              for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                const x = Math.cos(angle) * playerRadius
                const y = Math.sin(angle) * (playerRadius / 2)
                ellipsePoints.push(new ex.Vector(x, y))
              }

              const playerEllipse = new ex.Polygon({
                points: ellipsePoints,
                color: ex.Color.fromHex('#6495ed'), // Blue color for players
                strokeColor: ex.Color.fromHex('#4169e1'),
                lineWidth: 2
              })
              playerActor.graphics.add(playerEllipse)
            }

            engine?.add(playerActor)
          })
        }

        // Add enemies
        if (enemies && Array.isArray(enemies)) {
          enemies.forEach((enemy) => {
            const enemyPos = isoToScreen(enemy.x, enemy.y)
            const enemyActor = new ex.Actor({
              pos: new ex.Vector(
                enemyPos.x + (engine?.drawWidth || 0) / 2,
                enemyPos.y + 150 - 15
              ),
              width: 20,
              height: 10,
              z: 10 // Above tiles but below player
            })

            // Enable pointer events for enemies
            enemyActor.body.collisionType = ex.CollisionType.Passive

            enemyActor.on('pointerdown', () => {
              // Prevent panning when clicking on enemies
              isPanning = false
              panStartScreenPos = null
              panStartCameraPos = null
            })

            // Create polygon collider for enemy (similar to tiles)
            const enemyColliderPoints = [
              new ex.Vector(0, -tileHeight / 2), // Top
              new ex.Vector(tileWidth / 2, 0), // Right
              new ex.Vector(0, tileHeight / 2), // Bottom
              new ex.Vector(-tileWidth / 2, 0) // Left
            ]
            const enemyCollider = ex.Shape.Polygon(enemyColliderPoints)
            enemyActor.collider.set(enemyCollider)

            // Get enemy sprite from tileImages using character property
            const enemyImage = tileImages[enemy.character]
            if (enemyImage) {
              const enemySprite = new ex.Sprite({
                image: enemyImage,
                width: 500,
                height: 500,
                origin: new ex.Vector(0, 0),
                scale: new ex.Vector(0.1, 0.1),
              })
              enemyActor.graphics.add(enemySprite)
            } else {
              // Fallback to a colored ellipse if sprite not found
              const enemyRadius = 10
              const segments = 32
              const ellipsePoints: ex.Vector[] = []

              for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                const x = Math.cos(angle) * enemyRadius
                const y = Math.sin(angle) * (enemyRadius / 2)
                ellipsePoints.push(new ex.Vector(x, y))
              }

              const enemyEllipse = new ex.Polygon({
                points: ellipsePoints,
                color: ex.Color.fromHex('#dc2626'), // Red color for enemies
                strokeColor: ex.Color.fromHex('#991b1b'),
                lineWidth: 2
              })
              enemyActor.graphics.add(enemyEllipse)
            }

            // Add health indicator above enemy
            const healthText = new ex.Text({
              text: `${enemy.hp}/${enemy.maxHp}`,
              font: new ex.Font({
                size: 12,
                family: 'Arial',
                color: ex.Color.fromHex('#ffffff'),
                textAlign: ex.TextAlign.Center
              }),
            })
            
            const healthActor = new ex.Actor({
              pos: new ex.Vector(
                enemyPos.x + (engine?.drawWidth || 0) / 2 + 20,
                enemyPos.y + 150 - 32 // Position above enemy
              ),
              z: 20 // Above enemy sprite
            })
            healthActor.graphics.add(healthText)
            engine?.add(healthActor)

            engine?.add(enemyActor)
          })
        }

        // Start the engine
        engine.start(loader).then(() => {
          engineRef.current = engine
          
          // Enable click and drag panning after engine starts
          engine.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
            isPanning = false
            hasMoved = false
            panStartScreenPos = evt.screenPos.clone()
            panStartCameraPos = engine.currentScene.camera.pos.clone()
          })

          engine.input.pointers.primary.on('move', (evt: ex.PointerEvent) => {
            if (panStartScreenPos && panStartCameraPos) {
              const delta = evt.screenPos.sub(panStartScreenPos)
              const distance = Math.abs(delta.x) + Math.abs(delta.y)
              
              // Start panning if moved beyond threshold
              if (distance > DRAG_THRESHOLD && !isPanning) {
                isPanning = true
                hasMoved = true
                // Update canvas cursor to indicate panning
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'grabbing'
                }
              }
              
              // Pan the camera
              if (isPanning) {
                engine.currentScene.camera.pos = panStartCameraPos.sub(delta)
              }
            }
          })

          engine.input.pointers.primary.on('up', () => {
            // Reset cursor
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
          
          setLoading(false)
        })
      } catch (err) {
        console.error('Error loading map:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
        throw err
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.stop()
      }
    }
  }, [players, enemies])

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
    </div>
  )
}

export default IsometricMap
