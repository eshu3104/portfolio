import { createClient } from "@supabase/supabase-js"
import { OpenAI } from "openai"
import { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI( {apiKey: process.env.OPENAI_API_KEY!} )
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
})

export async function POST(req: NextRequest) {
    const { question } = await req.json()

    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
    return new Response("Too many requests. Please slow down!", { 
  status: 429,
  headers: { 'Content-Type': 'text/plain; charset=utf-8' }
})
    }

    const result = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
})

    const queryEmbedding = result.data[0].embedding

    const { data: chunks } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 5,
    })

     if (!chunks || chunks.length === 0) {
  return new Response("I don't have information about that.", {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' }
})
}

    const context = chunks?.map((c: any) => c.content).join('\n\n') ?? ''

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
            { role: 'system', content: `You are an assistant on Eshu's portfolio website. You ONLY answer questions about Eshu — his experience, projects, skills, and education. If asked anything unrelated (math, general knowledge, etc.), politely say you can only discuss Eshu. Always use the context below.\n\nContext:\n${context} If the context doesn't contain the answer, say "I don't have that information about Eshu" — never make anything up. Limit your answer to 5 sentences and ask for follow-up questions at the end of your statement.` },
            { role: 'user', content: question },
        ],
    })


    const encoder = new TextEncoder()
    let fullResponse = ''
    const readable = new ReadableStream({
    async start(controller) {
        for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
        fullResponse += text
        }
        controller.close()
        await supabase.from('logs').insert({
            ip,
            question,
            response: fullResponse
            })
    },
    })

    return new Response(readable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })

    
}

