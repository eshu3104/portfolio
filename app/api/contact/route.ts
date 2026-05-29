import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
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