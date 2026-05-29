"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'
import { useState } from "react"
import { FiExternalLink } from "react-icons/fi"

const resumeData = data as ResumeData

export default function Projects() {

  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedProject, setSelectedProject] = useState<ResumeData["projects"][0] | null>(null)

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
            onClick={() => {
              setActiveFilter(f)
              setSelectedProject(null)
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              activeFilter === f
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((projects) => (
          <button
            key={projects.id}
            type="button"
            onClick={() => setSelectedProject(projects)}
            className="relative text-left border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            {projects.url && (
              <FiExternalLink size={14} className="absolute top-4 right-4 text-gray-400" />
            )}
            <h3 className="font-semibold text-base text-gray-900 pr-5">{projects.title}</h3>
            <p className="text-gray-600 text-sm">{projects.type.charAt(0).toUpperCase() + projects.type.slice(1)}</p>
            <p className="text-gray-500 text-xs">{projects.date}</p>
            <p className="text-gray-500 text-xs">{projects.event}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {projects.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            {projects.award && (
              <p className="text-amber-600 text-xs font-medium mt-1">🏆 {projects.award}</p>
            )}
          </button>
        ))}
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-base text-gray-900">{selectedProject.title}</p>
                <p className="text-sm text-gray-600">{selectedProject.type.charAt(0).toUpperCase() + selectedProject.type.slice(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProject.date} · {selectedProject.event}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                type="button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProject.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-600">{selectedProject.description}</p>

            {selectedProject.award && (
              <p className="text-amber-600 text-xs font-medium mt-2">🏆 {selectedProject.award}</p>
            )}

            {selectedProject.url && (
              <a
                href={selectedProject.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-full border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                View project
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}