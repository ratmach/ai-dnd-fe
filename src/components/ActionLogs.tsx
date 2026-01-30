import './ActionLogs.css'

export interface ActionLogEntry {
  id: number
  timestamp: Date
  type: 'player' | 'dm' | 'roll' | 'system'
  author: string
  message: string
}

interface ActionLogsProps {
  logs: ActionLogEntry[]
}

function ActionLogs({ logs }: ActionLogsProps) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="action-logs">
      <div className="action-logs-header">
        <h3>Action Logs</h3>
      </div>
      <div className="action-logs-content">
        {logs.length === 0 ? (
          <div className="action-logs-empty">No actions yet</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`action-log-entry action-log-${log.type}`}>
              <div className="action-log-header">
                <span className="action-log-author">{log.author}:</span>
                <span className="action-log-time">{formatTimestamp(log.timestamp)}</span>
              </div>
              <div className="action-log-message">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ActionLogs
