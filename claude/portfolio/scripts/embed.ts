import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import data from "../app/data/experiences.json" with { type: "json" }
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function chunkData(data: any): { content: string; metadata: object }[] {
  const chunks = []

  // Contact
  chunks.push({
    content: `Name: ${data.name}. Email: ${data.contact.email}. Location: ${data.contact.location}. LinkedIn: ${data.contact.linkedin}. GitHub: ${data.contact.github}. Website: ${data.contact.website}.`,
    metadata: { type: "contact" }
  })

  // Education
  for (const edu of data.education) {
    chunks.push({
      content: `Education: ${edu.degree} at ${edu.school} (${edu.date}). GPA: ${edu.gpa ?? "N/A"}. ${edu.coursework ? "Coursework: " + edu.coursework.join(", ") + "." : ""} ${edu.highlights ? "Highlights: " + edu.highlights.join(", ") + "." : ""}`,
      metadata: { type: "education", school: edu.school }
    })
  }

  // Experience
  for (const exp of data.experience) {
    chunks.push({
      content: `Work experience: ${exp.title} at ${exp.subtitle} (${exp.date}, ${exp.location}). Tags: ${exp.tags?.join(", ")}. ${exp.highlights?.join(" ")}`,
      metadata: { type: "experience", company: exp.subtitle }
    })
  }

  // Research
  for (const res of data.research) {
    chunks.push({
      content: `Research: ${res.title} at ${res.subtitle} (${res.date}). ${res.description}`,
      metadata: { type: "research", lab: res.subtitle }
    })
  }

  // Projects
  for (const project of data.projects) {
    chunks.push({
      content: `Project: ${project.title} (${project.type}). ${project.event ? "Event: " + project.event + "." : ""} ${project.award ? "Award: " + project.award + "." : ""} ${project.description ?? ""} Highlights: ${project.highlights?.join(" ")} Tags: ${project.tags?.join(", ")}.`,
      metadata: { type: "project", name: project.title }
    })
  }

  // Skills
  chunks.push({
    content: `Skills — Languages: ${data.skills.languages?.join(", ")}. Web & Frameworks: ${data.skills.webAndFrameworks?.join(", ")}. AI/ML: ${data.skills.aiml?.join(", ")}. Databases: ${data.skills.databases?.join(", ")}. Tools: ${data.skills.tools?.join(", ")}.`,
    metadata: { type: "skills" }
  })

  // Awards
  chunks.push({
    content: `Awards and recognition: ${data.awards.map((a: any) => `${a.name} (${a.issuer}, ${a.date})`).join(". ")}.`,
    metadata: { type: "awards" }
  })

  // Volunteering
  for (const vol of data.volunteering) {
    chunks.push({
      content: `Volunteering: ${vol.role} at ${vol.organization} (${vol.date}). ${vol.highlights?.join(" ")}`,
      metadata: { type: "volunteering", organization: vol.organization }
    })
  }

  return chunks
}

async function main() {
  const chunks = chunkData(data)
  console.log(`Embedding ${chunks.length} chunks...`)

  for (const chunk of chunks) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.content,
    })

    const embedding = response.data[0].embedding

    const { error } = await supabase.from("embeddings").insert({
      content: chunk.content,
      metadata: chunk.metadata,
      embedding,
    })

    if (error) {
      console.error("Supabase insert error:", error)
    } else {
      console.log(`✓ Embedded: ${chunk.content.slice(0, 60)}...`)
    }
  }

  console.log("Done!")
}

main()