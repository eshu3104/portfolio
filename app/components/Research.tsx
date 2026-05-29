"use client"
import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"

const resumeData = data as ResumeData

export default function Research() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {resumeData.research.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all"
        >
          <div className="space-y-1">
            <p className="font-semibold text-base text-gray-900 dark:text-gray-100">{item.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.subtitle}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.date} - {item.location}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
