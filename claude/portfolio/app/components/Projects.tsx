"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'
import { useState } from "react"
import { FiExternalLink } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import type { Transition } from "framer-motion"

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

      {/* Filter tabs */}
      <motion.div
        className="flex gap-2 mb-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" } as Transition}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f)
              setSelectedProject(null)
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              activeFilter === f
                ? "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Project cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project, i) => (
          <motion.button
            key={project.id}
            type="button"
            onClick={() => setSelectedProject(project)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" } as Transition}
            whileHover={{ y: -3, transition: { duration: 0.2 } as Transition }}
            className="relative text-left border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all"
          >
            {project.url && (
              <FiExternalLink size={14} className="absolute top-4 right-4 text-gray-400 dark:text-gray-500" />
            )}
            <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 pr-5">{project.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{project.type.charAt(0).toUpperCase() + project.type.slice(1)}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{project.date}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{project.event}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            {project.award && (
              <p className="text-amber-600 text-xs font-medium mt-1">🏆 {project.award}</p>
            )}
          </motion.button>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 } as Transition}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" } as Transition}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{selectedProject.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.type.charAt(0).toUpperCase() + selectedProject.type.slice(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedProject.date} · {selectedProject.event}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                  type="button"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProject.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.description}</p>

              {selectedProject.award && (
                <p className="text-amber-600 text-xs font-medium mt-2">🏆 {selectedProject.award}</p>
              )}

              {selectedProject.url && (
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-gray-900 dark:border-gray-100 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
                >
                  View project
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}