import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Calculations for counters
  const charCount = text.length
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length
  
  // Validation flags
  const minCharLimit = 20
  const isInputValid = charCount >= minCharLimit
  const shouldShowWarning = charCount > 0 && charCount < minCharLimit

  // Asynchronous handler to submit text to Python backend
  const handleSummarize = async (e) => {
    e.preventDefault()
    if (!isInputValid) return

    setIsLoading(true)
    setError('')
    setSummary('')

    try {
      // Connect to the Flask server
      const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
        text: text
      })

      if (response.data && response.data.summary) {
        setSummary(response.data.summary)
      } else {
        setError('Received an unexpected response format from the server.')
      }
    } catch (err) {
      console.error('API Connection Error:', err)
      const message = err.response?.data?.error || err.message || 'Failed to communicate with the summarizer backend.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Copies generated summary to system clipboard
  const handleCopy = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  // Resets the workspace state
  const handleClear = () => {
    setText('')
    setSummary('')
    setError('')
    setIsCopied(false)
  }

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="title">AI Text Summarizer</h1>
        <p className="subtitle">Transform long articles into clear, concise summaries in seconds using Groq API</p>
      </header>

      {/* Main Core layout */}
      <main className="card">
        <form onSubmit={handleSummarize} className="input-section">
          <div className="input-header-row">
            <label htmlFor="source-text" className="label">
              Source Text
            </label>
            {text && (
              <button 
                type="button" 
                onClick={handleClear} 
                className="btn-clear"
                disabled={isLoading}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="textarea-wrapper">
            <textarea
              id="source-text"
              className="input-textarea"
              placeholder="Paste your long text here (articles, notes, reports...)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {shouldShowWarning && (
            <div className="validation-warning">
              Please enter at least {minCharLimit} characters (currently {charCount}/{minCharLimit}).
            </div>
          )}

          {error && (
            <div className="error-container">
              <span className="error-text">{error}</span>
              <button type="button" className="error-close-btn" onClick={() => setError('')}>&times;</button>
            </div>
          )}

          <div className="action-row">
            <div className="counters-container">
              <span className="counter-item"><strong>{wordCount}</strong> words</span>
              <span className="counter-divider">|</span>
              <span className="counter-item"><strong>{charCount}</strong> characters</span>
            </div>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !isInputValid}
            >
              {isLoading ? 'Summarizing...' : 'Summarize Text'}
            </button>
          </div>
        </form>

        {/* Summary Output section */}
        <div className="summary-section">
          <div className="summary-title-row">
            <h2 className="summary-heading">Summary Result</h2>
            {summary && (
              <button 
                type="button" 
                onClick={handleCopy} 
                className={`btn-copy ${isCopied ? 'copied' : ''}`}
              >
                {isCopied ? '✓ Copied!' : 'Copy Summary'}
              </button>
            )}
          </div>

          {summary ? (
            <div className="summary-content">
              {summary}
            </div>
          ) : isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Processing summary via Groq Cloud...</span>
            </div>
          ) : (
            <div className="summary-placeholder">
              Your generated summary will appear here...
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
