"use client"
import { Send } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, Transition } from "framer-motion"

const TYPEWRITER_LINES = [
    "AI/Data + Full Stack + whatever's trending 🔥",
    "I build things that solve real problems",
    "Turning messy data into decisions that matter",
    "Open to Co-Ops — let's build something 🚀",
    "Based in Victoria, BC 🇨🇦",
    "Love travelling & video games 🎮",
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" } as Transition
})

function Typewriter() {
    const [lineIndex, setLineIndex] = useState(0)
    const [displayed, setDisplayed] = useState("")
    const [phase, setPhase] = useState<"typing" | "waiting" | "deleting">("typing")

    useEffect(() => {
        const current = TYPEWRITER_LINES[lineIndex]

        if (phase === "typing") {
            if (displayed.length < current.length) {
                const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 40)
                return () => clearTimeout(t)
            } else {
                const t = setTimeout(() => setPhase("waiting"), 1800)
                return () => clearTimeout(t)
            }
        }

        if (phase === "waiting") {
            const t = setTimeout(() => setPhase("deleting"), 400)
            return () => clearTimeout(t)
        }

        if (phase === "deleting") {
            if (displayed.length > 0) {
                const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 20)
                return () => clearTimeout(t)
            } else {
                setLineIndex((lineIndex + 1) % TYPEWRITER_LINES.length)
                setPhase("typing")
            }
        }
    }, [displayed, phase, lineIndex])

    return (
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 h-6 flex items-center gap-0.5">
            {displayed}
            <span className="inline-block w-0.5 h-4 bg-gray-400 dark:bg-gray-500 ml-0.5 animate-pulse" />
        </p>
    )
}

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
        <div className="min-h-screen flex flex-col items-center pt-16 sm:pt-24 lg:pt-32 gap-4 sm:gap-6" id="home">

            {/* 1. Name Heading */}
            <motion.h1
                className="text-2xl sm:text-3xl font-semibold tracking-tight"
                {...fadeUp(0)}
            >
                Hi! My name is Eshu
            </motion.h1>

            {/* 2. Typewriter */}
            <motion.div {...fadeUp(0.15)}>
                <Typewriter />
            </motion.div>

            {/* 3. Avatar */}
            <motion.div {...fadeUp(0.3)}>
                <Image
                    src="/images/avatar.jpg"
                    alt="Eshu"
                    width={144}
                    height={144}
                    className="rounded-full object-cover w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mt-2"
                />
            </motion.div>

            {/* 4. Say hi + chips */}
            <AnimatePresence>
                {messages.length === 0 && (
                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, delay: 0.45 }}
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Say hi to my digital twin 👾
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {[
                                { label: "What's his tech stack?", q: "What's his tech stack?" },
                                { label: "See hackathon projects", q: "Tell me about his hackathon projects" },
                                { label: "Is he open to co-ops?", q: "Is he open to co-ops?" },
                            ].map((chip, i) => (
                                <motion.button
                                    key={chip.label}
                                    onClick={() => handleSend(chip.q)}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.55 + i * 0.08 }}
                                    className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-colors font-medium cursor-pointer"
                                >
                                    {chip.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. Chat Area */}
            <AnimatePresence>
                {messages.length > 0 && (
                    <motion.div
                        className="flex flex-col gap-3 max-w-xl w-full px-4 max-h-96 overflow-y-auto"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${
                                    msg.role === 'user'
                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 self-end rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 self-start rounded-bl-sm'
                                }`}
                            >
                                {msg.role === 'assistant' && msg.content === '' ? 'Thinking...' : msg.content}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 6. Input Bar */}
            <motion.div
                className="flex items-center gap-3 max-w-xl w-full px-4"
                {...fadeUp(0.6)}
            >
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-gray-100 border border-gray-200 placeholder-gray-400 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 rounded-full px-4 py-3 sm:px-6 sm:py-3.5 text-sm outline-none disabled:cursor-not-allowed"
                    disabled={loading}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
                >
                    <Send size={16} className="translate-x-0.5" />
                </button>
            </motion.div>

            {/* Scroll hint */}
            <AnimatePresence>
                {messages.length === 0 && (
                    <motion.div
                        className="flex flex-col items-center gap-1 mt-2 animate-bounce pt-12 sm:pt-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-600">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}