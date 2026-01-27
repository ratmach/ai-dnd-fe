# Adding Tileset Sprites

To add sprite images to your map:

1. **Create or download a tileset image** (e.g., `tileset.png`)
   - The image should contain all your terrain tiles in a grid
   - For isometric tiles, each tile should be 64x64 pixels (or match your tilewidth/tileheight)
   - Arrange tiles in rows and columns (e.g., 4 columns x 4 rows = 16 tiles)

2. **Place the tileset image** in the `public/maps/` directory
   - Example: `public/maps/tileset.png`

3. **Update the TMX file** to reference the image:
   ```xml
   <tileset firstgid="1" name="isometric_tiles" tilewidth="64" tileheight="64" tilecount="16" columns="4">
     <image source="tileset.png" width="256" height="256"/>
     ...
   </tileset>
   ```

4. **Tile layout in the image**:
   - Tile ID 0 = top-left (row 0, col 0)
   - Tile ID 1 = row 0, col 1
   - Tile ID 2 = row 0, col 2
   - etc.

The renderer will automatically:
- Load the tileset image
- Extract individual tile sprites based on tile IDs
- Display sprites instead of colored polygons when available
- Fall back to colored polygons if no sprite is available

## Example Tileset Structure

For a 4x4 grid (16 tiles):
```
[0] [1] [2] [3]
[4] [5] [6] [7]
[8] [9] [10][11]
[12][13][14][15]
```

Each tile in the image should be 64x64 pixels for isometric tiles.
