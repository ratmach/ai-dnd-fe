/**
 * Simple TMX (Tiled Map Editor) parser for isometric maps
 */

import { ImageSource } from "excalibur"

export interface TileProperties {
  [key: string]: {value: string, image: string | null}
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
  //forest: new ImageSource('/tiles/tile_031.png')
}

export function parseTMX(xmlText: string): MapData {
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
  tilesets.forEach((tileset) => {
    const firstGid = parseInt(tileset.getAttribute('firstgid') || '0')
    const tileWidth = parseInt(tileset.getAttribute('tilewidth') || '0')
    const tileHeight = parseInt(tileset.getAttribute('tileheight') || '0')
    const columns = parseInt(tileset.getAttribute('columns') || '1')

    const tiles: Tile[] = []
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

    mapData.tilesets.push({
      firstGid,
      tileWidth,
      tileHeight,
      columns,
      tiles
    })
  })

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

  const tile = tileset?.tiles[localTileId]
  const terrain = tile?.properties?.terrain

  return tileImages[terrain?.value || 'grass'] || null
}