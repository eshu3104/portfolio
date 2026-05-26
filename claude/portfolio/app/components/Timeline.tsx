"use client"
import { useState } from "react"
import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"

const resumeData = data as ResumeData
type Experience = ResumeData["experience"][0]

function parseDate(dateStr: string): number {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  }
  const part = dateStr.includes("–") ? dateStr.split("–")[1].trim() : dateStr.trim()
  const [month, year] = part.split(" ")
  return new Date(parseInt(year), months[month]).getTime()
}

function ThumbnailCard({ exp, onClick }: { exp: Experience; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all max-w-xs w-full"
    >
      <p className="font-semibold text-sm">{exp.title}</p>
      <p className="text-xs text-gray-500">{exp.subtitle}</p>
      <p className="text-xs text-gray-400 mt-1">{exp.date}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {exp.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
        ))}
        {exp.tags.length > 3 && (
          <span className="text-xs text-gray-400 px-1 py-1">+{exp.tags.length - 3}</span>
        )}
      </div>
    </div>
  )
}

export default function Timeline() {
  const [selected, setSelected] = useState<Experience | null>(null)
  const sorted = [...resumeData.experience].sort((a, b) => parseDate(b.date) - parseDate(a.date))

  return (
    <>
      <div className="relative flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-px bg-gray-200" />

        {sorted.map((exp, index) => {
          const isLeft = index % 2 === 0
          return (
            <div key={index} className="relative w-full grid grid-cols-[1fr_auto_1fr] gap-x-6 mb-6">

              <div className={`flex justify-end ${!isLeft ? "invisible" : ""}`}>
                {isLeft && <ThumbnailCard exp={exp} onClick={() => setSelected(exp)} />}
              </div>

              <div className="flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" />
              </div>

              <div className={`flex justify-start ${isLeft ? "invisible" : ""}`}>
                {!isLeft && <ThumbnailCard exp={exp} onClick={() => setSelected(exp)} />}
              </div>

            </div>
          )
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-lg">{selected.title}</p>
                <p className="text-sm text-gray-500">{selected.subtitle}</p>
                <p className="text-xs text-gray-400 mt-1">{selected.date} · {selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {selected.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            {selected.highlights && (
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                {selected.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}