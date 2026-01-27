# DnD Game - Multiplayer RPG

A multiplayer Dungeons & Dragons game built with React and Excalibur.js for visualization. Most game state and logic is handled server-side.

## Features

- **Login Page**: User authentication interface
- **Character Design Page**: Create and customize your character
- **Game Page**: 
  - Isometric world map
  - Player list sidebar with character info, HP/mana bars, level, and online status
  - Character stats modal

## Tech Stack

- React 18
- React Router DOM
- Excalibur.js (2D game engine)
- Vite (build tool)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx
│   ├── CharacterDesignPage.jsx
│   └── GamePage.jsx
├── components/
│   ├── PlayerList.jsx
│   ├── CharacterStatsModal.jsx
│   └── IsometricMap.jsx
├── App.jsx
└── main.jsx
```

## Notes

- This is primarily a visualization client
- Game state management and heavy logic should be implemented server-side
- The current implementation includes mock data for demonstration purposes
