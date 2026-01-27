import './CharacterStatsModal.css'

interface CharacterStatsModalProps {
  onClose: () => void
}

function CharacterStatsModal({ onClose }: CharacterStatsModalProps) {
  // Mock character stats - in real app, this would come from server
  const stats = {
    name: 'My Character',
    level: 5,
    class: 'Warrior',
    race: 'Human',
    hp: 85,
    maxHp: 100,
    mana: 60,
    maxMana: 100,
    strength: 16,
    dexterity: 12,
    constitution: 14,
    intelligence: 10,
    wisdom: 13,
    charisma: 11,
    experience: 2500,
    nextLevelExp: 5000
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Character Stats</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="character-basic-info">
            <div className="character-icon-large">{stats.name[0]}</div>
            <div>
              <h3>{stats.name}</h3>
              <p>
                Level {stats.level} {stats.class} | {stats.race}
              </p>
            </div>
          </div>

          <div className="stats-section">
            <h4>Vitals</h4>
            <div className="vital-bar">
              <div className="vital-label">
                <span>Health Points</span>
                <span>
                  {stats.hp} / {stats.maxHp}
                </span>
              </div>
              <div className="bar-container-large">
                <div
                  className="bar hp-bar"
                  style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="vital-bar">
              <div className="vital-label">
                <span>Mana Points</span>
                <span>
                  {stats.mana} / {stats.maxMana}
                </span>
              </div>
              <div className="bar-container-large">
                <div
                  className="bar mana-bar"
                  style={{ width: `${(stats.mana / stats.maxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h4>Attributes</h4>
            <div className="attributes-grid">
              <div className="attribute-item">
                <span className="attribute-name">Strength</span>
                <span className="attribute-value">{stats.strength}</span>
              </div>
              <div className="attribute-item">
                <span className="attribute-name">Dexterity</span>
                <span className="attribute-value">{stats.dexterity}</span>
              </div>
              <div className="attribute-item">
                <span className="attribute-name">Constitution</span>
                <span className="attribute-value">{stats.constitution}</span>
              </div>
              <div className="attribute-item">
                <span className="attribute-name">Intelligence</span>
                <span className="attribute-value">{stats.intelligence}</span>
              </div>
              <div className="attribute-item">
                <span className="attribute-name">Wisdom</span>
                <span className="attribute-value">{stats.wisdom}</span>
              </div>
              <div className="attribute-item">
                <span className="attribute-name">Charisma</span>
                <span className="attribute-value">{stats.charisma}</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h4>Experience</h4>
            <div className="exp-bar">
              <div className="exp-label">
                <span>
                  {stats.experience} / {stats.nextLevelExp} XP
                </span>
              </div>
              <div className="bar-container-large">
                <div
                  className="bar exp-bar-fill"
                  style={{
                    width: `${(stats.experience / stats.nextLevelExp) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterStatsModal
