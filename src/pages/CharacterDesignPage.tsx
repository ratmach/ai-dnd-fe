import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './CharacterDesignPage.css'

/**
 * Maps character class and race combinations to tile image keys
 * Rules:
 * - Any Paladin → 'knight'
 * - Any Mage → 'druid'
 * - Any Dwarf → 'dwarf'
 * - Any other combination → 'default'
 */
function getCharacterTileImage(characterClass: string, race: string): string {
  // Check race first (Dwarf takes priority)
  if (race === 'Dwarf') {
    return 'dwarf'
  }
  
  // Then check class
  if (characterClass === 'Paladin') {
    return 'knight'
  }
  
  if (characterClass === 'Mage') {
    return 'druid'
  }
  
  // Default for any other combination
  return 'default'
}

function CharacterDesignPage() {
  const [characterName, setCharacterName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedRace, setSelectedRace] = useState('')
  const navigate = useNavigate()

  const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin']
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling']

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (characterName && selectedClass && selectedRace) {
      // Get the tile image key based on class and race
      const characterTile = getCharacterTileImage(selectedClass, selectedRace)
      
      // Store character data in localStorage to pass to game page
      const characterData = {
        name: characterName,
        class: selectedClass,
        race: selectedRace,
        character: characterTile
      }
      localStorage.setItem('characterData', JSON.stringify(characterData))
      
      // TODO: Save character data to server
      navigate('/game')
    }
  }
  
  // Calculate preview tile image
  const previewTileImage = selectedClass && selectedRace 
    ? getCharacterTileImage(selectedClass, selectedRace)
    : null

  return (
    <div className="character-design-page">
      <div className="character-design-container">
        <h1 className="design-title">Create Your Character</h1>
        <form onSubmit={handleSubmit} className="character-form">
          <div className="form-group">
            <label htmlFor="characterName">Character Name</label>
            <input
              id="characterName"
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Enter character name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="race">Race</label>
            <select
              id="race"
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              required
            >
              <option value="">Select a race</option>
              {races.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="class">Class</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="character-preview">
            <div className="preview-icon">
              {previewTileImage ? (
                <img 
                  src={`/characters/${previewTileImage}.png`} 
                  alt={previewTileImage}
                  className="character-preview-image"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.textContent = characterName ? characterName[0].toUpperCase() : '?'
                    }
                  }}
                />
              ) : (
                characterName ? characterName[0].toUpperCase() : '?'
              )}
            </div>
            <div className="preview-info">
              <p><strong>Name:</strong> {characterName || 'Unknown'}</p>
              <p><strong>Race:</strong> {selectedRace || 'Not selected'}</p>
              <p><strong>Class:</strong> {selectedClass || 'Not selected'}</p>
              {previewTileImage && (
                <p><strong>Character:</strong> {previewTileImage}</p>
              )}
            </div>
          </div>

          <button type="submit" className="create-button">
            Create Character & Enter Game
          </button>
        </form>
      </div>
    </div>
  )
}

export default CharacterDesignPage
