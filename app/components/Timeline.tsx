"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'

const resumeData = data as ResumeData

export default function Timeline() {
  return (
    <div className="flex flex-col gap-6">
      {resumeData.experience.map((exp) => (
        <div key={exp.id} className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg">{exp.title}</h3>
            <p className="text-gray-500 text-sm">{exp.subtitle}</p>
            <p className="text-gray-400 text-sm">{exp.date}</p>
            <p className="text-gray-400 text-xs">{exp.location}</p>
            <div className="flex flex-wrap gap-2 mt-3">
                {exp.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tag}
             </span>
                ))}
            </div>
            <ul className="mt-3 flex flex-col gap-1">
                {exp.highlights.map((highlight, i) => (<li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300">- </span>
                {highlight}
                 </li>
                 ))}
            </ul>
        </div>

        

      ))}
    </div>
  )
}
     

