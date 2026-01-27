import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './CharacterDesignPage.css'

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
      // TODO: Save character data to server
      navigate('/game')
    }
  }

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
              {characterName ? characterName[0].toUpperCase() : '?'}
            </div>
            <div className="preview-info">
              <p><strong>Name:</strong> {characterName || 'Unknown'}</p>
              <p><strong>Race:</strong> {selectedRace || 'Not selected'}</p>
              <p><strong>Class:</strong> {selectedClass || 'Not selected'}</p>
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
