"use client"
import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"
import { motion } from "framer-motion"
import type { Transition } from "framer-motion"

const resumeData = data as ResumeData

export default function Awards() {
  return (
    <div className="flex flex-col gap-3">
      {resumeData.awards.map((award, i) => (
        <motion.div
          key={award.id}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" } as Transition}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{award.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{award.issuer}</p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 sm:whitespace-nowrap sm:shrink-0">{award.date}</span>
        </motion.div>
      ))}
    </div>
  )
}