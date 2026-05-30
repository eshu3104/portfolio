import { OpenAI } from "openai"
import { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
})

const VOICE = "onyx" // alloy | echo | fable | onyx | nova | shimmer

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous"
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response("Too many requests. Please slow down!", {
      status: 429,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const { text } = await req.json()

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Response("Missing text", { status: 400 })
  }

  // Truncate to 4096 chars (OpenAI TTS limit)
  const input = text.slice(0, 4096)

  const ttsResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice: VOICE,
    input,
    response_format: "pcm",  // raw Int16 @ 24kHz mono — no container overhead
  })

  const audioStream = ttsResponse.body as ReadableStream

  return new Response(audioStream, {
    headers: {
      "Content-Type": "audio/pcm",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store",
    },
  })
}