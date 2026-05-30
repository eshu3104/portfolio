"use client"
import { Send } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, Transition } from "framer-motion"
import TalkingHead from "./TalkingHead"

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

// ─── RMS amplitude from a WebAudio time-domain buffer ────────────────────────
function getRMSAmplitude(data: Uint8Array<ArrayBuffer>): number {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
    }
    return Math.min(Math.sqrt(sum / data.length), 1.0)
}

// ─── Decode raw PCM (Int16, 24kHz mono) into a Web Audio AudioBuffer ─────────
function decodePCM(ctx: AudioContext, arrayBuffer: ArrayBuffer): AudioBuffer {
    const pcm = new Int16Array(arrayBuffer)
    const audioBuffer = ctx.createBuffer(1, pcm.length, 24000)
    const channel = audioBuffer.getChannelData(0)
    for (let i = 0; i < pcm.length; i++) {
        channel[i] = pcm[i] / 32768
    }
    return audioBuffer
}

export default function Hero() {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
    const [amplitude, setAmplitude] = useState(0)

    // WebAudio refs
    const audioCtxRef  = useRef<AudioContext | null>(null)
    const analyserRef  = useRef<AnalyserNode | null>(null)
    const rafRef       = useRef<number | null>(null)
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

    // Audio playback queue
    const audioQueueRef = useRef<AudioBuffer[]>([])
    const isPlayingRef  = useRef(false)

    // TTS fetch queue — ensures chunks are fetched and played in order
    const fetchQueueRef  = useRef<string[]>([])
    const isFetchingRef  = useRef(false)

    // ── Ensure AudioContext exists (must be created after a user gesture) ──
    const ensureAudioCtx = useCallback(() => {
        if (audioCtxRef.current) return
        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.connect(ctx.destination)
        audioCtxRef.current = ctx
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    }, [])

    // ── Read amplitude every animation frame while audio is playing ───────
    const startAmplitudeLoop = useCallback(() => {
        const loop = () => {
            const analyser = analyserRef.current
            const data = dataArrayRef.current
            if (analyser && data) {
                analyser.getByteTimeDomainData(data)
                setAmplitude(getRMSAmplitude(data))
            }
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
    }, [])

    const stopAmplitudeLoop = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        setAmplitude(0)
    }, [])

    // ── Play next buffer in the audio queue ───────────────────────────────
    const playNextInQueue = useCallback(() => {
        const ctx = audioCtxRef.current
        const analyser = analyserRef.current
        if (!ctx || !analyser || audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            stopAmplitudeLoop()
            return
        }

        isPlayingRef.current = true
        const audioBuffer = audioQueueRef.current.shift()!
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(analyser)
        startAmplitudeLoop()
        source.onended = () => playNextInQueue()
        source.start()
    }, [startAmplitudeLoop, stopAmplitudeLoop])

    // ── Drain fetch queue sequentially — one request in-flight at a time ──
    const drainFetchQueue = useCallback(async () => {
        if (isFetchingRef.current) return
        const ctx = audioCtxRef.current
        const analyser = analyserRef.current
        if (!ctx || !analyser) return

        while (fetchQueueRef.current.length > 0) {
            isFetchingRef.current = true
            const text = fetchQueueRef.current.shift()!

            try {
                await ctx.resume()
                const res = await fetch("/api/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                })

                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer()
                    const audioBuffer = decodePCM(ctx, arrayBuffer)
                    audioQueueRef.current.push(audioBuffer)
                    if (!isPlayingRef.current) playNextInQueue()
                }
            } catch (err) {
                console.error("TTS error:", err)
            }

            isFetchingRef.current = false
        }
    }, [playNextInQueue])

    // ── Enqueue text for TTS — never fetches in parallel ─────────────────
    const playTTS = useCallback((text: string) => {
        fetchQueueRef.current.push(text)
        drainFetchQueue()
    }, [drainFetchQueue])

    // ── Stop all audio immediately and flush queues ───────────────────────────
const stopAudio = useCallback(() => {
    fetchQueueRef.current = []
    audioQueueRef.current = []
    isFetchingRef.current = false
    isPlayingRef.current = false
    stopAmplitudeLoop()
}, [stopAmplitudeLoop])

    // ── Main send handler ─────────────────────────────────────────────────
    async function handleSend(overrideQuestion?: string) {
        const question = overrideQuestion ?? input
        if (!question.trim()) return
        
        stopAudio()          // ← add this line
        ensureAudioCtx()

        setMessages(prev => [
            ...prev,
            { role: "user", content: question },
            { role: "assistant", content: "" },
        ])
        setLoading(true)
        setInput("")

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
        })

        if (!res.ok) {
            const errorText = await res.text()
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: errorText }
                return updated
            })
            setLoading(false)
            return
        }

        // Stream chat response — fire TTS per sentence or every ~10 words
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let ttsBuffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                if (ttsBuffer.trim()) playTTS(ttsBuffer.trim())
                break
            }

            const text = decoder.decode(value, { stream: true })
            ttsBuffer += text

            const sentenceEnd = ttsBuffer.search(/[.!?]\s/)
            const wordCount = ttsBuffer.trim().split(/\s+/).length

            if (sentenceEnd !== -1 || wordCount >= 10) {
                const cutAt = sentenceEnd !== -1
                    ? sentenceEnd + 1
                    : ttsBuffer.lastIndexOf(" ")
                const chunk = ttsBuffer.slice(0, cutAt).trim()
                ttsBuffer = ttsBuffer.slice(cutAt).trimStart()
                if (chunk) playTTS(chunk)
            }

            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + text,
                }
                return updated
            })
        }

        setLoading(false)
    }

    // ── Cleanup on unmount ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopAmplitudeLoop()
            audioCtxRef.current?.close()
        }
    }, [stopAmplitudeLoop])

    return (
        <div className="relative min-h-screen flex flex-col items-center pt-16 sm:pt-24 lg:pt-32 gap-4 sm:gap-6 overflow-hidden" id="home">

            {/* Noise texture overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }}
            />

            {/* Radial gradient blob */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-300 h-200 z-0"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
                }}
            />

            {/* Bottom fade to soften glow edge */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 sm:h-40 z-0 bg-linear-to-b from-transparent via-white/70 to-white dark:via-gray-950/70 dark:to-gray-950" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 w-full">

                {/* 1. Name Heading */}
                <motion.h1
                    className="text-4xl sm:text-5xl font-bold tracking-tight text-center"
                    {...fadeUp(0)}
                >
                    Hi! My name is{" "}
                    <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Eshu
                    </span>
                </motion.h1>

                {/* 2. Typewriter */}
                <motion.div {...fadeUp(0.15)}>
                    <Typewriter />
                </motion.div>

                {/* 3. Avatar */}
                <motion.div {...fadeUp(0.3)} className="-mt-5 sm:-mt-7">
                    <TalkingHead
                        amplitude={amplitude}
                        className="w-56 h-64 sm:w-64 sm:h-72"
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
                                        className="text-xs sm:text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-colors font-medium cursor-pointer shadow-sm"
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
                                        msg.role === "user"
                                            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 self-end rounded-br-sm"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 self-start rounded-bl-sm"
                                    }`}
                                >
                                    {msg.role === "assistant" && msg.content === "" ? "Thinking..." : msg.content}
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
                        onKeyDown={e => e.key === "Enter" && handleSend()}
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

                {/* Privacy notice */}
                <motion.p
                    className="text-xs text-center text-gray-400 dark:text-gray-500 -mt-2"
                    {...fadeUp(0.7)}
                >
                    Chats may be logged for security.{" "}
                    <a href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        Privacy Policy
                    </a>
                </motion.p>

                {/* Scroll hint */}
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            className="flex flex-col items-center gap-1 mt-0 animate-bounce pt-4 sm:pt-6"
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
        </div>
    )
}