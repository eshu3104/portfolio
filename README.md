# Portfolio — Eshu Belgotra

My personal portfolio, built around an interactive **3D AI avatar** ("digital twin") that answers questions about my background in real time — speaking the answers aloud with synced lip movement.

🌐 **Live:** [eshu.earth](https://eshu.earth)

---

## What makes it interesting

This isn't a static portfolio. Ask the avatar a question and it:

1. Embeds your question and runs a **vector similarity search** over my résumé (RAG).
2. Streams a grounded answer back token-by-token from an LLM.
3. Converts each sentence to speech as it arrives and plays it through a **WebAudio queue**.
4. Drives the 3D model's **lip-sync** from the real-time audio amplitude, plus idle blinking, breathing, and eye-tracking that follows your cursor.

Alongside the avatar, the résumé content (experience, projects, skills, awards, etc.) is rendered as animated, filterable tabs — all sourced from a single JSON file that's **generated automatically from my LaTeX résumé**.

## Features

- 🤖 **RAG-powered chat** — answers grounded in my résumé via semantic search; no hallucinated details.
- 🗣️ **Real-time text-to-speech** with amplitude-driven lip-sync on a `.vrm` avatar.
- 🎭 **3D avatar** — blinking, idle sway, and cursor/touch eye-tracking (three.js + VRM).
- 📄 **Automated résumé pipeline** — LaTeX → structured JSON + vector embeddings, one command.
- 🌓 **Dark mode**, responsive layout, and Framer Motion animations throughout.
- 📨 **Contact form** with rate limiting and email delivery.
- 🔒 **Rate limiting** on all AI/email endpoints (Upstash Redis).

## Tech stack

| Area | Tools |
|------|-------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| 3D / Avatar | three.js, @react-three/fiber, @react-three/drei, @pixiv/three-vrm |
| AI / RAG | OpenAI (embeddings + `gpt-4o-mini` chat + `tts-1` speech), Supabase pgvector |
| Résumé sync | Anthropic Claude (LaTeX → JSON parsing) |
| Infra | Supabase (Postgres + vector search), Upstash Redis (rate limiting), Resend (email) |
| Deploy | Vercel |

## Architecture

```
                       ┌─────────────────────────────────────────────┐
   Browser             │                   Next.js                    │
 ┌─────────┐           │  ┌──────────────┐                            │
 │  Chat   │──question─┼─▶│ /api/chat    │─embed─▶ OpenAI             │
 │  input  │           │  │              │─search▶ Supabase pgvector  │
 │         │◀──stream──┼──│              │◀─chat── gpt-4o-mini        │
 └────┬────┘           │  └──────────────┘                            │
      │ sentence        │  ┌──────────────┐                            │
      └────────────────┼─▶│ /api/tts     │─speech▶ OpenAI tts-1       │
                       │  └──────┬───────┘                            │
 ┌─────────┐           │         │ PCM audio                          │
 │ 3D VRM  │◀─amplitude┼─ WebAudio queue ◀──────┘                     │
 │ avatar  │  lip-sync │                                              │
 └─────────┘           └─────────────────────────────────────────────┘
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` in the project root:

```bash
# AI
OPENAI_API_KEY=            # embeddings, chat, and text-to-speech
ANTHROPIC_API_KEY=         # résumé sync only (LaTeX → JSON)

# Supabase (vector search + chat logs)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY= # service role — bypasses RLS, server-side only

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (contact form email)
RESEND_API_KEY=
```

> Supabase needs the `pgvector` extension, an `embeddings` table, a `logs` table, and a `match_embeddings` RPC for similarity search.

## Updating résumé content

Content for both the visible site **and** the avatar's knowledge comes from one place: `app/data/resume.tex`.

```bash
npx tsx scripts/sync-resume.ts
```

This single command:

1. Reads `app/data/resume.tex`.
2. Uses Claude to parse it into structured JSON.
3. Writes `app/data/experiences.json` (rendered by the site's tabs).
4. Chunks + embeds the content and upserts it into Supabase (powers the avatar's answers).

It also runs in CI via the **Sync Resume to RAG** GitHub Action (`workflow_dispatch`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/sync-resume.ts` | Regenerate résumé JSON + embeddings from LaTeX |

## Project structure

```
app/
├── api/
│   ├── chat/      # RAG chat — embed, search, stream
│   ├── tts/       # OpenAI text-to-speech (PCM stream)
│   └── contact/   # Resend email + rate limiting
├── components/    # Hero, TalkingHead (3D avatar), Tabs, Timeline, Projects, …
├── data/          # resume.tex (source) + experiences.json (generated)
└── lib/           # shared types
scripts/           # sync-resume.ts, embed.ts
public/            # avatar.vrm, resume PDF, assets
```

---

© 2026 Eshu Belgotra
