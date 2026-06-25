"use client"
import { Send, Download, Mail } from "lucide-react"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, Transition } from "framer-motion"
import TalkingHead from "./TalkingHead"

const TYPEWRITER_LINES = [
    "AI/Data + Full Stack + whatever's trending ",
    "I build things that solve real problems",
    "Turning messy data into decisions that matter",
    "Open to Co-Ops, let's build something ",
    "Based in Victoria, BC",
    "Love travelling & video games ",
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" } as Transition
})

function goToSection(id: string, tab?: "timeline" | "projects" | "skills") {
    if (tab) window.location.hash = tab
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

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
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 h-7 flex items-center gap-0.5">
            {displayed}
            <span className="inline-block w-0.5 h-5 bg-gray-400 dark:bg-gray-500 ml-0.5 animate-pulse" />
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

    // Chat scroll container
    const chatRef = useRef<HTMLDivElement | null>(null)

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

        stopAudio()
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

    // ── Keep chat scrolled to the latest message ──────────────────────────
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [messages])

    // ── Cleanup on unmount ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopAmplitudeLoop()
            audioCtxRef.current?.close()
        }
    }, [stopAmplitudeLoop])

    return (
        <div className="relative min-h-screen flex items-center justify-center pt-28 sm:pt-32 lg:pt-24 pb-16 overflow-hidden" id="home">

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

            {/* Content — two columns: info left, avatar + chat right */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)] gap-10 lg:gap-14 items-center">

                {/* ─── LEFT: the important info ─────────────────────────── */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 sm:gap-6">

                    <motion.p
                        className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-gray-400 dark:text-gray-500"
                        {...fadeUp(0)}
                    >
                        AI / Data · Full Stack · Victoria, BC
                    </motion.p>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
                        {...fadeUp(0.1)}
                    >
                        Hi, my name is{" "}
                        <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                            Eshu
                        </span>
                    </motion.h1>

                    <motion.div {...fadeUp(0.2)}>
                        <Typewriter />
                    </motion.div>

                    <motion.p
                        className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-md"
                        {...fadeUp(0.3)}
                    >
                        Computer Science student turning messy data into decisions that
                        matter — across AI/ML and full-stack. Open to co-op and internship
                        roles for 2026.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
                        {...fadeUp(0.4)}
                    >
                        <button
                            onClick={() => goToSection("timeline", "projects")}
                            className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium px-5 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            See my work
                            <span className="translate-y-px">→</span>
                        </button>
                        <a
                            href="/Eshupriye_Belgotra_Resume.pdf"
                            download="Eshupriye_Belgotra_Resume.pdf"
                            className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium px-5 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download size={15} />
                            Résumé
                        </a>
                    </motion.div>

                    {/* Social links */}
                    <motion.div
                        className="flex items-center gap-5 text-gray-400 dark:text-gray-500"
                        {...fadeUp(0.5)}
                    >
                        <a target="_blank" rel="noreferrer" href="https://www.github.com/eshu3104" aria-label="GitHub" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                            <FaGithub size={20} />
                        </a>
                        <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/eshu-belgotra/" aria-label="LinkedIn" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                            <FaLinkedin size={20} />
                        </a>
                        <button onClick={() => goToSection("contact")} aria-label="Email" className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                            <Mail size={20} />
                        </button>
                    </motion.div>
                </div>

                {/* ─── RIGHT: avatar + chatbox ──────────────────────────── */}
                <motion.div
                    className="flex flex-col items-center gap-3 w-full"
                    {...fadeUp(0.25)}
                >
                    {/* Avatar */}
                    <TalkingHead
                        amplitude={amplitude}
                        className="w-52 h-60 sm:w-56 sm:h-64"
                    />

                    <p className="text-sm text-gray-500 dark:text-gray-400 italic -mt-2">
                        Meet my digital twin
                    </p>

                    {/* Chatbox card */}
                    <div className="w-full rounded-3xl border border-gray-200/80 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">

                        {/* Conversation / starter chips */}
                        <div ref={chatRef} className="flex flex-col gap-3 px-4 pt-4 max-h-72 min-h-[112px] overflow-y-auto">
                            <AnimatePresence initial={false}>
                                {messages.length === 0 ? (
                                    <motion.div
                                        key="chips"
                                        className="flex flex-wrap gap-2 justify-center py-2"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {[
                                            { label: "What's his tech stack?", q: "What's his tech stack?" },
                                            { label: "See hackathon projects", q: "Tell me about his hackathon projects" },
                                            { label: "Is he open to co-ops?", q: "Is he open to co-ops?" },
                                        ].map((chip) => (
                                            <button
                                                key={chip.label}
                                                onClick={() => handleSend(chip.q)}
                                                className="text-xs sm:text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600 px-4 py-2 rounded-full transition-colors font-medium cursor-pointer shadow-sm"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    messages.map((msg, i) => (
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
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input bar */}
                        <div className="flex items-center gap-2 p-3">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                                className="flex-1 bg-gray-100 border border-gray-200 placeholder-gray-400 text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 rounded-full px-4 py-3 text-sm outline-none disabled:cursor-not-allowed"
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
                            >
                                <Send size={16} className="translate-x-0.5" />
                            </button>
                        </div>
                    </div>

                    {/* Privacy notice */}
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        Chats may be logged for security.{" "}
                        <a href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </motion.div>

            </div>
        </div>
    )
}
