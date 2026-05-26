"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'
import { useState } from "react"



const resumeData = data as ResumeData


export default function Projects() {

  const [activeFilter, setActiveFilter] = useState("All")

  const filters = ["All", "Hackathon", "Academic", "Personal"]

  const filtered = resumeData.projects.filter((p) =>
    activeFilter === "All" ? true : p.type.toLowerCase() === activeFilter.toLowerCase()
  )

  return (

    <div className="flex flex-col gap-6">

    <div className="flex gap-2 mb-6">
  {filters.map((f) => (
    <button
      key={f}
      onClick={() => setActiveFilter(f)}
      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
        activeFilter === f
          ? "bg-black text-white border-black"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
      }`}
    >
      {f}
    </button>
  ))}
</div>

      {filtered.map((projects) => (
        <div key={projects.id} className="border border-gray-200 rounded-xl p-6">
    {projects.url ? (
        <a href={projects.url} target="_blank" className="font-semibold text-lg hover:underline"> {projects.title}</a>
        ) : (<h3 className="font-semibold text-lg">{projects.title}</h3>)}
            <p className="text-gray-500 text-sm">{projects.type.charAt(0).toUpperCase() + projects.type.slice(1)}</p>
            <p className="text-gray-400 text-sm">{projects.date}</p>
            <p className="text-gray-400 text-xs">{projects.event}</p>
            <div className="flex flex-wrap gap-2 mt-3">
                {projects.tags.map((tags) => (
                    <span key={tags} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tags}
             </span>
                ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">{projects.description}</p>
            {projects.award && (
  <p className="text-amber-600 text-xs font-medium mt-1">🏆 {projects.award}</p>
)}
        </div>

        

      ))}
    </div>
  )
}
     

