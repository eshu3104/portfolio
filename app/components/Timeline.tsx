"use client"
import { useState } from "react"
import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"
import { motion, AnimatePresence } from "framer-motion"
import type { Transition } from "framer-motion"

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

function ThumbnailCard({ exp, onClick, delay }: { exp: Experience; onClick: () => void; delay: number }) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" } as Transition}
      whileHover={{ y: -3, transition: { duration: 0.2 } as Transition }}
      className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all max-w-xs w-full"
    >
      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{exp.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300">{exp.subtitle}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exp.date}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {exp.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">{tag}</span>
        ))}
        {exp.tags.length > 3 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 px-1 py-1">+{exp.tags.length - 3}</span>
        )}
      </div>
    </motion.div>
  )
}

export default function Timeline() {
  const [selected, setSelected] = useState<Experience | null>(null)
  const [techOnly, setTechOnly] = useState(false)

  const sorted = [...resumeData.experience]
    .filter(exp => techOnly ? exp.technical : true)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))

  return (
    <>
      <div className="relative flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

        {sorted.map((exp, index) => {
          const isLeft = index % 2 === 0
          const delay = index * 0.07

          return (
            <div key={exp.id} className="relative w-full mb-5 sm:mb-6">

              {/* Mobile */}
              <div className={`flex sm:hidden ${isLeft ? "justify-start" : "justify-end"}`}>
                <ThumbnailCard exp={exp} onClick={() => setSelected(exp)} delay={delay} />
              </div>

              {/* Desktop */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-x-6">
                <div className={`flex justify-end ${!isLeft ? "invisible" : ""}`}>
                  {isLeft && <ThumbnailCard exp={exp} onClick={() => setSelected(exp)} delay={delay} />}
                </div>

                <motion.div
                  className="flex items-center justify-center z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: delay + 0.1, ease: "easeOut" } as Transition}
                >
                  <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow ${
                    exp.technical ? "bg-green-400" : "bg-gray-400 dark:bg-gray-500"
                  }`} />
                </motion.div>

                <div className={`flex justify-start ${isLeft ? "invisible" : ""}`}>
                  {!isLeft && <ThumbnailCard exp={exp} onClick={() => setSelected(exp)} delay={delay} />}
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 } as Transition}
            onClick={() => setSelected(null)}
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
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{selected.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selected.subtitle}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selected.date} · {selected.location}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl">✕</button>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selected.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              {selected.highlights && (
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                  {selected.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}