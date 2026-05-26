"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'


export default function Skills() {
    const resumeData = data as ResumeData

    const categories = [
        { label: "Languages", items: resumeData.skills.languages },
        { label: "Web & Frameworks", items: resumeData.skills.webAndFrameworks },
        { label: "AI / ML", items: resumeData.skills.aiml },
        { label: "Databases", items: resumeData.skills.databases },
        { label: "Tools", items: resumeData.skills.tools },
    ]

return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.label}>
          <p className="text-sm font-medium text-gray-500 mb-2">{category.label}</p>
            <div className="flex flex-wrap gap-2 mt-1">
            {category.items.map((skill) => (
              <span key={skill} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}