import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"

const resumeData = data as ResumeData

export default function Awards() {
  return (
    <div className="flex flex-col gap-3">
      {resumeData.awards.map((award) => (
        <div
          key={award.id}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{award.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{award.issuer}</p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 sm:whitespace-nowrap sm:shrink-0">{award.date}</span>
        </div>
      ))}
    </div>
  )
}