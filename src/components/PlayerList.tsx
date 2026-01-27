import { Player } from '../pages/GamePage'
import './PlayerList.css'

interface PlayerListProps {
  players: Player[]
}

function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="player-list">
      <h3 className="player-list-title">Players</h3>
      <div className="players-container">
        {players.map((player) => (
          <div key={player.id} className="player-card">
            <div className="player-header">
              <div className="player-icon">{player.icon}</div>
              <div className="player-info">
                <div className="player-name-row">
                  <span className="player-name">{player.name}</span>
                  <div
                    className={`status-indicator ${player.online ? 'online' : 'offline'}`}
                    title={player.online ? 'Online' : 'Offline'}
                  />
                </div>
                <div className="player-level">Level {player.level}</div>
              </div>
            </div>
            <div className="player-stats">
              <div className="stat-bar">
                <div className="stat-label">
                  <span>HP</span>
                  <span className="stat-value">
                    {player.hp} / {player.maxHp}
                  </span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar hp-bar"
                    style={{
                      width: `${(player.hp / player.maxHp) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="stat-bar">
                <div className="stat-label">
                  <span>Mana</span>
                  <span className="stat-value">
                    {player.mana} / {player.maxMana}
                  </span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar mana-bar"
                    style={{
                      width: `${(player.mana / player.maxMana) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlayerList
