import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const resend = new Resend(process.env.RESEND_API_KEY!)

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

    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    try {
        await resend.emails.send({
            from: "contact@eshu.earth",
            to: "eshupriyebelgotra@gmail.com",
            subject: `New message from ${name} — eshu.earth`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Resend error:", err)
        return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
    }
}