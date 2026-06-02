// scripts/sync-resume.ts
//
// Usage:
//   npx tsx scripts/sync-resume.ts
//
// Required env vars (put in .env.local for local runs, GitHub Secrets for CI):
//   ANTHROPIC_API_KEY
//   OPENAI_API_KEY
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   ← must be service role, not anon key

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// ── clients ───────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase  = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role bypasses RLS
);

// ── types ─────────────────────────────────────────────────────────────────────

interface Chunk {
  id:       number;
  content:  string;
  metadata: Record<string, unknown>;
}

interface Row extends Chunk {
  embedding: number[];
}

// ── step 1: read the latex ────────────────────────────────────────────────────

function readLatex(texPath: string): string {
  if (!fs.existsSync(texPath)) {
    console.error(`\n❌ File not found: ${texPath}\n`);
    process.exit(1);
  }
  return fs.readFileSync(texPath, "utf-8");
}

// ── step 2: ask claude to parse it into your existing json shape ──────────────

async function parseWithClaude(latexSource: string): Promise<object> {
  console.log("   Sending to Claude...");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8096,
    messages: [{
      role: "user",
      content: `
You are parsing a LaTeX resume into structured JSON.

Return a single JSON object with these top-level keys:
  name, contact, education, experience, research, projects, skills,
  volunteering, awards, certifications, languages

Each key should match this schema exactly:

contact:        { email, phone, location, linkedin, github, website }
education[]:    { id, school, degree, date, location, gpa?, notes?, coursework?, highlights? }
experience[]:   { id, technical, title, subtitle, date, location, type, tags[], highlights[] }
research[]:     { id, title, subtitle, date, location, supervisor?, description }
projects[]:     { id, title, event?, award?, date, url?, type, tags[], team[]?, description, highlights[]? }
skills:         { languages[], webAndFrameworks[], aiml[], databases[], tools[] }
volunteering[]: { id, role, organization, date, location?, highlights[] }
awards[]:       { id, name, issuer, date }
certifications[]: { name, issuer, issued, expires? }
languages[]:    { language, proficiency }

Rules:
- id fields: kebab-case slugs, e.g. "exp-rbc", "proj-foodbridge"
- technical field on experience: true if the role is technical, false otherwise
- Return ONLY valid JSON. No markdown fences, no explanation, no extra text.

LATEX SOURCE:
${latexSource}
      `.trim()
    }]
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ── step 3: build embeddable chunks ───────────────────────────────────────────

function buildChunks(data: any): Chunk[] {
  const chunks: Chunk[] = [];
  let id = 1;

  const push = (content: string, metadata: Record<string, unknown>) => {
    chunks.push({ id: id++, content, metadata });
  };

  // contact
  push(
    `Name: ${data.name}. ` +
    `Email: ${data.contact.email}. ` +
    `Location: ${data.contact.location}. ` +
    `LinkedIn: ${data.contact.linkedin}. ` +
    `GitHub: ${data.contact.github}. ` +
    `Website: ${data.contact.website}.`,
    { type: "contact" }
  );

  // education
  for (const edu of data.education ?? []) {
    push(
      `Education: ${edu.degree} at ${edu.school} (${edu.date}). ` +
      (edu.gpa        ? `GPA: ${edu.gpa}. `                         : "") +
      (edu.coursework ? `Coursework: ${edu.coursework.join(", ")}.` : "") +
      (edu.highlights ? ` ${edu.highlights.join(" ")}`              : ""),
      { type: "education", school: edu.school, id: edu.id }
    );
  }

  // work experience
  for (const exp of data.experience ?? []) {
    push(
      `Work experience: ${exp.title} at ${exp.subtitle} (${exp.date}, ${exp.location}). ` +
      `Tags: ${exp.tags?.join(", ")}. ` +
      exp.highlights?.join(" "),
      { type: "experience", company: exp.subtitle, title: exp.title, id: exp.id, technical: exp.technical }
    );
  }

  // research
  for (const res of data.research ?? []) {
    push(
      `Research: ${res.title} at ${res.subtitle} (${res.date}). ${res.description}` +
      (res.supervisor ? ` Supervisor: ${res.supervisor}.` : ""),
      { type: "research", lab: res.subtitle, id: res.id }
    );
  }

  // projects
  for (const proj of data.projects ?? []) {
    push(
      `Project: ${proj.title}` +
      (proj.event ? ` — ${proj.event}` : "") +
      (proj.award ? ` (${proj.award})` : "") +
      ` (${proj.date}). ` +
      `${proj.description} ` +
      `Tags: ${proj.tags?.join(", ")}. ` +
      (proj.highlights ? proj.highlights.join(" ") : ""),
      { type: "project", id: proj.id, award: proj.award ?? null, url: proj.url ?? null }
    );
  }

  // skills
  const s = data.skills ?? {};
  push(
    `Skills — Languages: ${s.languages?.join(", ")}. ` +
    `Web & Frameworks: ${s.webAndFrameworks?.join(", ")}. ` +
    `AI/ML: ${s.aiml?.join(", ")}. ` +
    `Databases: ${s.databases?.join(", ")}. ` +
    `Tools: ${s.tools?.join(", ")}.`,
    { type: "skills" }
  );

  // volunteering
  for (const vol of data.volunteering ?? []) {
    push(
      `Volunteering: ${vol.role} at ${vol.organization} (${vol.date}). ` +
      vol.highlights?.join(" "),
      { type: "volunteering", id: vol.id }
    );
  }

  // awards
  const awardText = (data.awards ?? [])
    .map((a: any) => `${a.name} (${a.issuer}, ${a.date})`)
    .join("; ");
  push(`Awards: ${awardText}.`, { type: "awards" });

  // certifications
  const certText = (data.certifications ?? [])
    .map((c: any) => `${c.name} — ${c.issuer} (${c.issued})`)
    .join("; ");
  push(`Certifications: ${certText}.`, { type: "certifications" });

  return chunks;
}

// ── step 4: embed all chunks ──────────────────────────────────────────────────

async function embedChunks(chunks: Chunk[]): Promise<Row[]> {
  const rows: Row[] = [];
  const batchSize = 10;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const { data } = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch.map(c => c.content),
    });

    for (let j = 0; j < batch.length; j++) {
      rows.push({ ...batch[j], embedding: data[j].embedding });
    }

    process.stdout.write(`   ${Math.min(i + batchSize, chunks.length)}/${chunks.length} embedded\r`);
  }

  console.log();
  return rows;
}

// ── step 5: replace all rows in supabase ─────────────────────────────────────

async function replaceAllRows(rows: Row[]) {
  const { error: deleteError } = await supabase
    .from("embeddings")        
    .delete()
    .gte("id", 0);

  if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);

  const { error: insertError } = await supabase
    .from("embeddings")        
    .insert(rows);

  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n📄  Reading resume.tex...");
  const latexSource = readLatex("./app/data/resume.tex");
  console.log(`    ${latexSource.length} characters`);

  console.log("\n🤖  Parsing with Claude...");
  const parsed = await parseWithClaude(latexSource);

  const outPath = "./app/data/experiences.json";
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
  console.log(`    Wrote ${outPath}`);

  console.log("\n🧩  Building chunks...");
  const chunks = buildChunks(parsed);
  console.log(`    ${chunks.length} chunks`);

  console.log("\n🔢  Embedding...");
  const rows = await embedChunks(chunks);

  console.log("\n⬆️   Upserting to Supabase...");
  await replaceAllRows(rows);
  console.log(`    ${rows.length} rows written`);

  console.log("\n✅  Done.\n");
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});