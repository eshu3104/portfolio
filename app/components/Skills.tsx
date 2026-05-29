"use client"
import data from '../data/experiences.json' 
import { ResumeData } from '../lib/types'
import { motion } from "framer-motion"
import type { Transition } from "framer-motion"

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
            {categories.map((category, i) => (
                <motion.div
                    key={category.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" } as Transition}
                >
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{category.label}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {category.items.map((skill, j) => (
                            <motion.span
                                key={skill}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.25, delay: i * 0.08 + j * 0.03, ease: "easeOut" } as Transition}
                                className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                            >
                                {skill}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}