import { useEffect, useRef, useState } from 'react'
import * as ex from 'excalibur'
import { parseTMX, getTileColor, getTileImage, tileImages } from '../utils/tmxParser'
import './IsometricMap.css'

function IsometricMap() {
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
        
        // Enable pointer events
        engine.input.pointers.primary.on('move', () => {
          // Pointer move is handled by tile events
        })

        const tileWidth = mapData.tileWidth
        const tileHeight = mapData.tileHeight

        // Helper function to convert isometric coordinates to screen coordinates
        const isoToScreen = (isoX: number, isoY: number): ex.Vector => {
          const screenX = (isoX - isoY) * (tileWidth / 2)
          const screenY = (isoX + isoY) * (tileHeight / 2)
          return new ex.Vector(screenX, screenY)
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
        highlightActor.graphics.add(highlightPolygon)
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

              if (!tileColor && ! tileImage) continue

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
                width: tileWidth/2,
                height: tileHeight*2,
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
                sprite.origin =new ex.Vector(-1, -1)
                tile.graphics.add(sprite)
              }else{
                tile.graphics.add(diamond)
              }

              // Enable pointer events
              tile.body.collisionType = ex.CollisionType.Passive
              
              
              tile.on('pointerenter', () => {
                if (highlightActor) {
                  highlightActor.pos = tile.pos
                  highlightActor.graphics.opacity = 1
                }
                // Update path line from player to tile center
                const tileCenter = tile.pos
                const playerCenter = player.pos
                updatePathLine(playerCenter, tileCenter)
              })

              tiles.push(tile)
              engine?.add(tile)
            }
          }
        })

        // Add a simple player marker
        const playerPos = isoToScreen(10, 10)
        const player = new ex.Actor({
          pos: new ex.Vector(
            playerPos.x + engine.drawWidth / 2,
            playerPos.y + 150 - 15
          ),
          width: 20,
          height: 10
        })

        // Create isometric circle (ellipse) for player marker using polygon approximation
        // In isometric projection, a circle appears as an ellipse with 2:1 width:height ratio
        const playerRadius = 10
        const segments = 32 // Number of segments for smooth circle
        const ellipsePoints: ex.Vector[] = []
        
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          // Ellipse: radiusX = playerRadius, radiusY = playerRadius / 2 for isometric
          const x = Math.cos(angle) * playerRadius
          const y = Math.sin(angle) * (playerRadius / 2)
          ellipsePoints.push(new ex.Vector(x, y))
        }
        
        const playerEllipse = new ex.Polygon({
          points: ellipsePoints,
          color: ex.Color.fromHex('#6495ed'),
          strokeColor: ex.Color.fromHex('#4169e1'),
          lineWidth: 2
        })
        const playerSprite = new ex.Sprite({
          image: tileImages.character,
          width: 500,
          height: 500,
          origin: new ex.Vector(-1, -1),
          scale: new ex.Vector(0.2, 0.2),
        })
        player.graphics.add(playerSprite)

        engine.add(player)

        // Start the engine
        engine.start(loader).then(() => {
          engineRef.current = engine
          setLoading(false)
        })
      } catch (err) {
        console.error('Error loading map:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.stop()
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
    </div>
  )
}

export default IsometricMap
