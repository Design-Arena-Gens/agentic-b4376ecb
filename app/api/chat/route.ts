import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Simple AI response logic (can be replaced with actual AI API)
    const response = generateResponse(message.toLowerCase())

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateResponse(message: string): string {
  // Simple response logic - can be enhanced with OpenAI/Anthropic API
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! I'm your voice agent. How can I help you today?"
  }

  if (message.includes('how are you')) {
    return "I'm functioning perfectly! Thanks for asking. What can I do for you?"
  }

  if (message.includes('weather')) {
    return "I don't have access to real-time weather data, but I can help you with many other tasks!"
  }

  if (message.includes('time')) {
    const now = new Date()
    return `The current time is ${now.toLocaleTimeString()}.`
  }

  if (message.includes('date')) {
    const now = new Date()
    return `Today's date is ${now.toLocaleDateString()}.`
  }

  if (message.includes('joke')) {
    const jokes = [
      "Why did the programmer quit his job? Because he didn't get arrays!",
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
    ]
    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  if (message.includes('thank')) {
    return "You're welcome! Let me know if there's anything else I can help with."
  }

  if (message.includes('bye') || message.includes('goodbye')) {
    return "Goodbye! It was nice talking with you. Come back anytime!"
  }

  if (message.includes('help')) {
    return "I can help you with various tasks! Try asking me about the time, date, for a joke, or just have a conversation with me."
  }

  if (message.includes('name')) {
    return "I'm Voice Agent, your AI-powered voice assistant!"
  }

  // Default response
  return `I heard you say: "${message}". I'm a voice agent that can help you with various tasks. Try asking me about the time, for a joke, or just chat with me!`
}
