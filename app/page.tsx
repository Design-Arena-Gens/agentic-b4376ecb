'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'agent'
  content: string
}

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('Click the microphone to start')
  const [conversation, setConversation] = useState<Message[]>([])
  const [error, setError] = useState('')

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setStatus('Listening... Speak now')
          setError('')
        }

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript

          if (event.results[current].isFinal) {
            setTranscript(transcriptText)
            processVoiceInput(transcriptText)
          } else {
            setTranscript(transcriptText + '...')
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
          setStatus('Error occurred. Click to try again')
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      } else {
        setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      }
    }
  }, [])

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true)
    setStatus('Processing your request...')

    const userMessage: Message = { role: 'user', content: text }
    setConversation(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const agentMessage: Message = { role: 'agent', content: data.response }

      setConversation(prev => [...prev, agentMessage])

      await speakResponse(data.response)

      setStatus('Click the microphone to speak again')
      setTranscript('')
    } catch (err) {
      setError('Failed to process your request. Please try again.')
      setStatus('Error. Click to try again')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()

        window.speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  const toggleListening = () => {
    if (isProcessing) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setStatus('Stopped listening')
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
        setTranscript('')
      } else {
        setError('Speech recognition not available')
      }
    }
  }

  const clearConversation = () => {
    setConversation([])
    setTranscript('')
    setStatus('Click the microphone to start')
    setError('')
    window.speechSynthesis?.cancel()
  }

  return (
    <div className="container">
      <h1>🎙️ Voice Agent</h1>
      <p className="subtitle">Your AI-powered voice assistant</p>

      <button
        className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={toggleListening}
        disabled={isProcessing}
      >
        {isProcessing ? '⏳' : isListening ? '🎤' : '🎙️'}
      </button>

      <div className="status">
        {isProcessing && <span className="loading"></span>} {status}
      </div>

      {error && <div className="error">{error}</div>}

      {transcript && (
        <div className="transcript">
          {transcript}
        </div>
      )}

      {conversation.length > 0 && (
        <>
          <div className="conversation">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-label">
                  {msg.role === 'user' ? '👤 You' : '🤖 Agent'}
                </div>
                <div className="message-text">{msg.content}</div>
              </div>
            ))}
          </div>

          <div className="controls">
            <button className="btn btn-clear" onClick={clearConversation}>
              Clear Conversation
            </button>
          </div>
        </>
      )}
    </div>
  )
}
