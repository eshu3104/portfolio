import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const resend = new Resend(process.env.RESEND_API_KEY!)

// Length caps — generous for a human, tight enough to reject abusive payloads.
const MAX_NAME = 100
const MAX_EMAIL = 254 // RFC 5321 max
const MAX_MESSAGE = 5000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Stricter than chat/tts — a human sends a message or two, not dozens.
// Distinct prefix so contact has its own budget, separate from other routes.
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "3600 s"),
    prefix: "ratelimit:contact",
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"
    const { success } = await ratelimit.limit(ip)

    if (!success) {
        return NextResponse.json(
            { error: "Too many messages. Please try again later." },
            { status: 429 },
        )
    }

    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const { name, email, message } = (body ?? {}) as Record<string, unknown>

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanMessage = message.trim()

    if (!cleanName || !cleanEmail || !cleanMessage) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (cleanName.length > MAX_NAME || cleanEmail.length > MAX_EMAIL || cleanMessage.length > MAX_MESSAGE) {
        return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 })
    }

    if (!EMAIL_RE.test(cleanEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    try {
        await resend.emails.send({
            from: "contact@eshu.earth",
            to: "eshupriyebelgotra@gmail.com",
            // Strip newlines from name so it can't smuggle extra headers into the subject.
            subject: `New message from ${cleanName.replace(/[\r\n]+/g, " ")} — eshu.earth`,
            replyTo: cleanEmail,
            text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Resend error:", err)
        return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
    }
}