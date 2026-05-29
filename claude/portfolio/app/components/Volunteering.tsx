"use client"
import { useState } from "react"
import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"
import { motion, AnimatePresence } from "framer-motion"
import type { Transition } from "framer-motion"

const resumeData = data as ResumeData
type Vol = ResumeData["volunteering"][0]

export default function Volunteering() {
  const [selected, setSelected] = useState<Vol | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumeData.volunteering.map((vol, i) => (
          <motion.div
            key={vol.id}
            onClick={() => setSelected(vol)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" } as Transition}
            whileHover={{ y: -3, transition: { duration: 0.2 } as Transition }}
            className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all"
          >
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{vol.role}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{vol.organization}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vol.date}</p>
          </motion.div>
        ))}
      </div>

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
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{selected.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selected.organization}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selected.date}{selected.location ? ` · ${selected.location}` : ""}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl">✕</button>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                {selected.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}