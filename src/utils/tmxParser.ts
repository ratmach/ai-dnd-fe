/**
 * TMX (Tiled Map Editor) utilities for isometric maps
 * Now using @excaliburjs/plugin-tiled for parsing
 */

import { ImageSource } from "excalibur"
import { TiledMapResource } from "@excaliburjs/plugin-tiled"

export interface TileProperties {
  [key: string]: {value: string, image: string | null}
}

export interface TilePassability {
  passable: boolean
}

export interface Tile {
  id: number
  properties: TileProperties
}

export interface Tileset {
  firstGid: number
  tileWidth: number
  tileHeight: number
  columns: number
  tiles: Tile[]
  images?: { [tileId: number]: ImageSource } // Map of tile ID to ImageSource
}

export interface Layer {
  id: number
  name: string
  width: number
  height: number
  tiles: number[][]
}

export interface MapData {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  orientation: string | null
  layers: Layer[]
  tilesets: Tileset[]
}

export const tileImages: { [key: string]: ImageSource } = {
  //grass: new ImageSource('/tiles/tile_033.png'), //TODO add random and a list here
  water: new ImageSource('/tiles/tile_086.png'),
  //stone: new ImageSource('/tiles/tile_063.png'),
  //dirt: new ImageSource('/tiles/tile_000.png'),
  sand: new ImageSource('/tiles/tile_015.png'),
  knight: new ImageSource('/characters/knight.png'),
  dwarf: new ImageSource('/characters/dwarf.png'),
  druid: new ImageSource('/characters/druid.png'),
  goblin: new ImageSource('/characters/goblin.png'),
  goblinB: new ImageSource('/characters/goblinB.png'),
  default: new ImageSource('/characters/goblin.png'),
  //forest: new ImageSource('/tiles/tile_031.png')
}

/**
 * Load TMX file using excalibur-tiled plugin
 * Returns a TiledMapResource that can be used to access map data
 */
export function createTMXResource(path: string): TiledMapResource {
  console.log('Creating TMX resource for:', path)
  
  const tiledMap = new TiledMapResource(path)
  
  // Set up custom path converter BEFORE loading
  tiledMap.convertPath = (originPath: string, relativePath: string) => {
    console.log('Converting path:', { originPath, relativePath })
    
    // If path is absolute, return as-is
    if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
      return relativePath
    }
    
    // Resolve relative to origin directory
    let originDir = originPath.substring(0, originPath.lastIndexOf('/'))
    if(!originDir.startsWith("maps") && !originDir.startsWith("/maps")){
      originDir = "maps/" + originDir
    }
    const resolved = `${originDir}/${relativePath}`
    console.log('  → Resolved to:', resolved)
    return resolved
  }
  
  return tiledMap
}

/**
 * @deprecated Use createTMXResource and let Excalibur's loader handle loading
 */
export async function loadTMXResource(path: string): Promise<TiledMapResource> {
  const tiledMap = createTMXResource(path)
  try {
    await tiledMap.load()
    console.log('✓ TMX loaded successfully')
    console.log('  Tilesets:', tiledMap.data?.tileSets?.length)
    console.log('  Layers:', tiledMap.data?.layers?.length)
    return tiledMap
  } catch (error) {
    console.error('✗ Failed to load TMX:', error)
    throw error
  }
}

/**
 * Convert TiledMapResource data to our MapData format
 * This maintains compatibility with existing code
 */
export function tiledResourceToMapData(tiledMap: TiledMapResource): MapData {
  const map = tiledMap.data
  
  if (!map) {
    throw new Error('TiledResource has no data')
  }

  const mapData: MapData = {
    width: map.width,
    height: map.height,
    tileWidth: map.tileWidth,
    tileHeight: map.tileHeight,
    orientation: map.orientation || null,
    layers: [],
    tilesets: []
  }

  // Parse tilesets
  if (map.tileSets) {
    map.tileSets.forEach((tileset: any) => {
      const tiles: Tile[] = []
      
      if (tileset.tiles) {
        tileset.tiles.forEach((tile: any) => {
          const properties: TileProperties = {}
          
          if (tile.properties) {
            tile.properties.forEach((prop: any) => {
              properties[prop.name] = {
                value: prop.value?.toString() || '',
                image: null
              }
            })
          }
          
          tiles[tile.id] = { id: tile.id, properties }
        })
      }

      mapData.tilesets.push({
        firstGid: tileset.firstgid,
        tileWidth: tileset.tilewidth,
        tileHeight: tileset.tileheight,
        columns: tileset.columns || 1,
        tiles
      })
    })
  }

  // Parse layers
  console.log('Parsing layers from TiledMap...')
  if (map.layers) {
    map.layers.forEach((layer: any, idx: number) => {
      console.log(`Layer ${idx}:`, {
        id: layer.id,
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        width: layer.width,
        height: layer.height
      })
      
      if (layer.type !== 'tilelayer') {
        console.log(`  → Skipping non-tile layer`)
        return
      }
      
      const layerData: Layer = {
        id: layer.id,
        name: layer.name,
        width: layer.width,
        height: layer.height,
        tiles: []
      }

      // Convert flat data array to 2D array
      if (layer.data) {
        let nonZeroCount = 0
        for (let y = 0; y < layerData.height; y++) {
          layerData.tiles[y] = []
          for (let x = 0; x < layerData.width; x++) {
            const index = y * layerData.width + x
            const tileId = layer.data[index] || 0
            layerData.tiles[y][x] = tileId
            if (tileId !== 0) nonZeroCount++
          }
        }
        console.log(`  → Parsed ${nonZeroCount} non-empty tiles`)
      }

      mapData.layers.push(layerData)
    })
  }
  
  console.log(`Total layers parsed: ${mapData.layers.length}`)

  return mapData
}

/**
 * @deprecated Use loadTMXResource and tiledResourceToMapData instead
 */
/**
 * Parse external TSX tileset file
 */
async function parseTSX(tsxPath: string): Promise<{ tiles: Tile[], images: { [tileId: number]: ImageSource } }> {
  const response = await fetch(tsxPath)
  if (!response.ok) {
    throw new Error(`Failed to load tileset file: ${tsxPath}`)
  }
  const xmlText = await response.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  const tiles: Tile[] = []
  const images: { [tileId: number]: ImageSource } = {}

  const tileElements = xmlDoc.querySelectorAll('tile')
  tileElements.forEach((tile) => {
    const id = parseInt(tile.getAttribute('id') || '0')
    const properties: TileProperties = {}
    
    // Parse properties
    const propertyElements = tile.querySelectorAll('property')
    propertyElements.forEach((prop) => {
      const name = prop.getAttribute('name')
      const value = prop.getAttribute('value')
      if (name && value) {
        properties[name] = { value: value, image: null }
      }
    })
    
    // Parse image
    const imageElement = tile.querySelector('image')
    if (imageElement) {
      const imagePath = imageElement.getAttribute('source')
      if (imagePath) {
        // Resolve relative path (../ means go up from tilesets/ to maps/)
        const resolvedPath = imagePath.replace('../', '/maps/')
        images[id] = new ImageSource(resolvedPath)
      }
    }
    
    tiles[id] = { id, properties }
  })

  return { tiles, images }
}

export async function parseTMX(xmlText: string): Promise<MapData> {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  const mapElement = xmlDoc.querySelector('map')
  if (!mapElement) {
    throw new Error('Invalid TMX file: no map element found')
  }

  const mapData: MapData = {
    width: parseInt(mapElement.getAttribute('width') || '0'),
    height: parseInt(mapElement.getAttribute('height') || '0'),
    tileWidth: parseInt(mapElement.getAttribute('tilewidth') || '0'),
    tileHeight: parseInt(mapElement.getAttribute('tileheight') || '0'),
    orientation: mapElement.getAttribute('orientation'),
    layers: [],
    tilesets: []
  }

  // Parse tilesets
  const tilesets = xmlDoc.querySelectorAll('tileset')
  for (const tileset of tilesets) {
    const firstGid = parseInt(tileset.getAttribute('firstgid') || '0')
    const source = tileset.getAttribute('source')

    let tiles: Tile[] = []
    let images: { [tileId: number]: ImageSource } = {}
    let tileWidth = parseInt(tileset.getAttribute('tilewidth') || '0')
    let tileHeight = parseInt(tileset.getAttribute('tileheight') || '0')
    let columns = parseInt(tileset.getAttribute('columns') || '1')

    if (source) {
      // External tileset - fetch and parse it
      const tsxPath = `/maps/${source}`
      console.log('Loading external tileset:', tsxPath)
      const tsxData = await parseTSX(tsxPath)
      tiles = tsxData.tiles
      images = tsxData.images
      console.log(`Loaded ${Object.keys(images).length} images from tileset`)
    } else {
      // Inline tileset
      const tileElements = tileset.querySelectorAll('tile')
      tileElements.forEach((tile) => {
        const id = parseInt(tile.getAttribute('id') || '0')
        const properties: TileProperties = {}
        const propertyElements = tile.querySelectorAll('property')
        propertyElements.forEach((prop) => {
          const name = prop.getAttribute('name')
          const value = prop.getAttribute('value')
          const image = prop.getAttribute('image')
          if (name && value) {
            properties[name] = {value: value, image: image || null}
          }
        })
        tiles[id] = { id, properties }
      })
    }

    mapData.tilesets.push({
      firstGid,
      tileWidth,
      tileHeight,
      columns,
      tiles,
      images
    })
  }

  // Parse layers
  const layers = xmlDoc.querySelectorAll('layer')
  layers.forEach((layer) => {
    const layerData: Layer = {
      id: parseInt(layer.getAttribute('id') || '0'),
      name: layer.getAttribute('name') || '',
      width: parseInt(layer.getAttribute('width') || '0'),
      height: parseInt(layer.getAttribute('height') || '0'),
      tiles: []
    }

    const dataElement = layer.querySelector('data')
    if (dataElement) {
      const encoding = dataElement.getAttribute('encoding')
      let tileData: number[] = []

      if (encoding === 'csv') {
        const csvText = dataElement.textContent?.trim() || ''
        tileData = csvText
          .split(/[,\s\n]+/)
          .filter((val) => val !== '')
          .map((val) => parseInt(val))
      }

      // Convert flat array to 2D array
      for (let y = 0; y < layerData.height; y++) {
        layerData.tiles[y] = []
        for (let x = 0; x < layerData.width; x++) {
          const index = y * layerData.width + x
          layerData.tiles[y][x] = tileData[index] || 0
        }
      }
    }

    mapData.layers.push(layerData)
  })

  return mapData
}

/**
 * Get tile color based on tile ID and terrain type
 */
/**
 * Gets the passability property for a tile
 * Defaults to true if not specified
 */
export function getTilePassable(tileId: number, tilesets: Tileset[]): boolean {
  if (tileId === 0) return true // Empty tiles are passable

  // Find which tileset this tile belongs to
  let tileset: Tileset | null = null
  let localTileId = tileId

  for (let i = tilesets.length - 1; i >= 0; i--) {
    if (tileId >= tilesets[i].firstGid) {
      tileset = tilesets[i]
      localTileId = tileId - tilesets[i].firstGid
      break
    }
  }

  if (!tileset) return true // Default to passable

  const tile = tileset.tiles[localTileId]
  if (!tile) return true // Default to passable

  const passableProp = tile.properties.passable
  if (passableProp) {
    // Check if value is "false" or "0"
    const value = passableProp.value.toLowerCase()
    return value !== 'false' && value !== '0'
  }

  return true // Default to passable
}

export function getTileColor(tileId: number, tilesets: Tileset[]): string | null {
  if (tileId === 0) return null // Empty tile

  // Find which tileset this tile belongs to
  let tileset: Tileset | null = null
  let localTileId = tileId

  for (let i = tilesets.length - 1; i >= 0; i--) {
    if (tileId >= tilesets[i].firstGid) {
      tileset = tilesets[i]
      localTileId = tileId - tilesets[i].firstGid
      break
    }
  }

  if (!tileset || !tileset.tiles[localTileId]) {
    // Default colors based on tile ID
    const colors: { [key: number]: string } = {
      0: '#4a7c59', // grass
      1: '#2d4a5e', // water
      2: '#6b7280', // stone
      3: '#8b6f47', // dirt
      4: '#d4a574', // sand
      5: '#2d5016' // forest
    }
    return colors[localTileId] || '#4a7c59'
  }

  const tile = tileset.tiles[localTileId]
  const terrain = tile.properties?.terrain

  // Color mapping based on terrain type
  const terrainColors: { [key: string]: string } = {
    grass: '#4a7c59',
    water: '#2d4a5e',
    stone: '#6b7280',
    dirt: '#8b6f47',
    sand: '#d4a574',
    forest: '#2d5016'
  }

  return terrainColors[terrain.value] || '#4a7c59'
}

export function getTileImage(tileId: number, tilesets: Tileset[]): ImageSource | null {
  if (tileId === 0) return null // Empty tile

  // Find which tileset this tile belongs to
  let tileset: Tileset | null = null
  let localTileId = tileId

  for (let i = tilesets.length - 1; i >= 0; i--) {
    if (tileId >= tilesets[i].firstGid) {
      tileset = tilesets[i]
      localTileId = tileId - tilesets[i].firstGid
      break
    }
  }

  if (!tileset) return null

  // First try to get image from tileset's images map (from external .tsx file)
  if (tileset.images && tileset.images[localTileId]) {
    return tileset.images[localTileId]
  }

  // Fallback to old method using terrain property
  const tile = tileset?.tiles[localTileId]
  const terrain = tile?.properties?.terrain

  return tileImages[terrain?.value || 'grass'] || null
}