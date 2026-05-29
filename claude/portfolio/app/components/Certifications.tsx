import data from "../data/experiences.json"
import { ResumeData } from "../lib/types"

const resumeData = data as ResumeData

export default function Certifications() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {resumeData.certifications.map((cert, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-5 py-4"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cert.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{cert.issuer}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Issued {cert.issued}{cert.expires ? ` · Expires ${cert.expires}` : ""}
          </p>
        </div>
      ))}
    </div>
  )
}