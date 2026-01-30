import { useState } from 'react'
import './ActionBox.css'

interface ActionBoxProps {
  onAction: (action: string, type: 'button' | 'text') => void
}

function ActionBox({ onAction }: ActionBoxProps) {
  const [textInput, setTextInput] = useState('')

  const handleButtonAction = (action: string) => {
    onAction(action, 'button')
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) {
      onAction(textInput.trim(), 'text')
      setTextInput('')
    }
  }

  return (
    <div className="action-box">
      <div className="action-buttons">
        <button
          className="action-button"
          onClick={() => handleButtonAction('Action 1')}
        >
          Action 1
        </button>
        <button
          className="action-button"
          onClick={() => handleButtonAction('Action 2')}
        >
          Action 2
        </button>
        <button
          className="action-button"
          onClick={() => handleButtonAction('Action 3')}
        >
          Action 3
        </button>
      </div>
      <form onSubmit={handleTextSubmit} className="action-text-form">
        <input
          type="text"
          className="action-text-input"
          placeholder="Enter custom action..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button type="submit" className="action-submit-button">
          Submit
        </button>
      </form>
    </div>
  )
}

export default ActionBox
