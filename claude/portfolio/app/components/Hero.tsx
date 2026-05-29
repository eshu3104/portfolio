"use client"
import { Send } from "lucide-react"
import { useState } from "react"
import Image from "next/image"


export default function Hero() {

    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<{role: string, content: string}[]>([])

async function handleSend(overrideQuestion?: string) {        
        const question = overrideQuestion ?? input
        setMessages(prev => [
            ...prev,
            { role: 'user', content: question },
            { role: 'assistant', content: '' }
        ])
        setLoading(true)
        setInput('')

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question })
        })

        const contentType = res.headers.get('content-type') ?? ''

        if (!res.ok) {
        const errorText = await res.text()
        setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: errorText }
            return updated
        })
        setLoading(false)
        return
}

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value, { stream: true })
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + text
                }
                return updated
            })
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center pt-32 gap-6" id="home">

            {/* 1. Name Heading */}
            <h1 className="text-3xl font-semibold tracking-tight">Hi! My name is Eshu</h1>

            {/* 2. Avatar */}
            <Image
                src="/images/avatar.jpg"
                alt="Eshu"
                width={144}
                height={144}
                className="rounded-full object-cover w-36 h-36 mt-8"
            />

            {/* 3. Large name below avatar */}
            <h2 className="text-5xl font-bold tracking-tight">Eshu</h2>

            {/* 4. Suggestion Chips */}
            {messages.length === 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                <button
                    onClick={() => handleSend("What's his tech stack?")}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    What's his tech stack?
                </button>
                <button
                    onClick={() => handleSend("Tell me about his hackathon projects")}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    See hackathon projects
                </button>
                <button
                    onClick={() => handleSend("Is he open to co-ops?")}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    Is he open to co-ops?
                </button>
            </div>
            )}

            {/* 5. Chat Area */}
            {messages.length > 0 && (
                <div className="flex flex-col gap-3 max-w-xl w-full px-4 max-h-96 overflow-y-auto">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${
                                    msg.role === 'user'
                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 self-end rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 self-start rounded-bl-sm'
                                }`}
                        >
                            {msg.role === 'assistant' && msg.content === '' ? 'Thinking...' : msg.content}
                        </div>
                    ))}
                    
                </div>
            )}

            {/* 6. Input Bar */}
            <div className="flex items-center gap-3 max-w-xl w-full px-4">
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-gray-100 border border-gray-200 placeholder-gray-400 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 rounded-full px-6 py-3.5 text-sm outline-none disabled:cursor-not-allowed"
                    disabled={loading}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
                >
                    <Send size={16} className="translate-x-0.5" />
                </button>
            </div>

        </div>
    )
}