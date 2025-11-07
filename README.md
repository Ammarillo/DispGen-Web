# DispGen Web

A web-based tool for generating Source Engine displacement terrain from heightmap images. Convert grayscale heightmaps into VMF (Valve Map Format) files with real-time 3D preview and advanced material mask editing.

![DispGen Web](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🗺️ Heightmap to VMF Conversion
- Import any grayscale image as a heightmap
- Automatic resizing to match tile configuration
- Generate VMF files compatible with Source Engine (Half-Life 2, CS:GO, etc.)
- Configurable tile grid (X/Y dimensions)
- Adjustable tile size and maximum height
- Centered coordinate system (terrain center at 0,0,0)

### 🎨 Real-Time 3D Preview
- Interactive Three.js-powered 3D visualization
- Live preview updates as you adjust parameters
- Grid overlay showing tile boundaries
- Dynamic fog based on terrain size
- Smooth camera controls (pan, rotate, zoom)

### 🖌️ Material Mask Editor
- **Paint Mode**: Brush-based painting directly on the 3D terrain
- **Erase Mode**: Remove mask areas with precision
- **Slope-Based Mask Generation**: Automatically generate masks based on terrain slope angles
- **Noise Mask Generation**: Multiple noise types (Perlin, Simplex, Value, Cellular, Voronoi)
- **Mask Import**: Import mask images with rotation (0°, 90°, 180°, 270°) and blend modes (Add, Subtract, Override)
- **Undo/Redo System**: Full history support with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

### ⚙️ Advanced Options
- Displacement power level (2-4, controls vertex density)
- Custom material paths
- Auto-update preview toggle
- Dimension calculations with unit-to-meter conversion

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No installation required - runs entirely in the browser!

### Usage

1. **Open the Application**
   - Simply open `web/index.html` in your web browser
   - Or host it on a web server for better performance

2. **Load a Heightmap**
   - Click "Choose File" under Heightmap
   - Select a grayscale image (PNG, JPG, etc.)
   - Darker pixels = lower terrain, lighter pixels = higher terrain

3. **Configure Terrain Settings**
   - **Tiles X/Y**: Number of displacement tiles in each direction (1-256)
   - **Tile Size**: Size of each tile in Source units (default: 512)
   - **Max Height**: Maximum height in Source units (default: 2048)
   - **Disp Power**: Displacement subdivision level (2-4, higher = more vertices)

4. **Preview Your Terrain**
   - The 3D preview updates automatically (if auto-update is enabled)
   - Use mouse controls:
     - **Right-click + drag**: Rotate camera
     - **Middle-click + drag**: Pan camera
     - **Scroll wheel**: Zoom in/out

5. **Edit Material Masks (Optional)**
   - Switch to the "Material/Mask" tab
   - Use the brush tool to paint directly on the terrain
   - Generate masks based on slope or noise patterns
   - Import existing mask images with rotation and blending options

6. **Export VMF**
   - Click "Generate VMF" button
   - The VMF file will download automatically
   - Import into Hammer Editor or your Source Engine map

## Technical Details

### Technologies Used
- **Three.js**: 3D rendering and visualization
- **OrbitControls**: Camera manipulation
- **Tailwind CSS**: Styling framework
- **Vanilla JavaScript**: No build step required

### VMF Format
The generated VMF files use Source Engine's displacement system:
- Each tile becomes a `DispInfo` brush
- Vertex normals, distances, and alphas are calculated from heightmap data
- Material paths can be customized per export
- Displacement power determines vertex resolution (2^power + 1 vertices per side)

### Coordinate System
- Terrain is centered at origin (0, 0, 0)
- Coordinates extend 50% negative and 50% positive from center
- Each displacement tile has correct `startposition` to prevent rotation issues

## Keyboard Shortcuts

- **Ctrl+Z / Cmd+Z**: Undo mask edit
- **Ctrl+Shift+Z / Cmd+Shift+Z**: Redo mask edit
- **Ctrl+Y / Cmd+Y**: Redo mask edit (alternative)
- **Escape**: Close mask blend modal

## Tips & Best Practices

1. **Heightmap Preparation**
   - Use grayscale images (8-bit or 24-bit)
   - Ensure good contrast between high and low areas
   - Recommended resolution: Match your tile count (e.g., 32x32 tiles = 32x32 or 64x64 pixel image)

2. **Performance**
   - Lower displacement power = faster generation and smaller file size
   - Fewer tiles = faster preview updates
   - Disable auto-update for large terrains while adjusting settings

3. **Material Masks**
   - Use slope masks to automatically mark steep areas
   - Combine multiple masks using Add/Subtract modes
   - Import masks with rotation to match your terrain orientation

4. **VMF Export**
   - Test with small tile counts first
   - Higher displacement power creates smoother terrain but larger files
   - Custom material paths must exist in your game's materials folder

## Browser Compatibility

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Internet Explorer: Not supported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Source Engine mapping community
- Inspired by the original DispGen desktop application
- Uses Three.js for 3D visualization

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for the Source Engine mapping community**

