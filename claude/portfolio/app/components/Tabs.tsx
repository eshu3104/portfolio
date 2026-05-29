"use client"
import { useEffect, useState } from "react"
import Timeline from "./Timeline"
import Projects from "./Projects"
import Skills from "./Skills"
import Volunteering from "./Volunteering"
import Awards from "./Awards"
import Certifications from "./Certifications"
import Research from "./Research"

const tabIds = ["timeline", "projects", "skills", "volunteering", "research", "awards", "certifications"] as const
type TabId = (typeof tabIds)[number]

const tabs: { id: TabId; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "volunteering", label: "Volunteering" },
  { id: "research", label: "Research" },
  { id: "awards", label: "Awards" },
  { id: "certifications", label: "Certifications" },
]

export default function Tabs() {
  const [activeTab, setActiveTab] = useState<TabId>("timeline")

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "")
      if (tabIds.includes(hash as TabId)) {
        setActiveTab(hash as TabId)
      }
    }
    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  const handleTab = (id: TabId) => {
    window.location.hash = id
    setActiveTab(id)
  }

  return (
    <section id="timeline" className="max-w-3xl mx-auto px-6 py-24">
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-full sm:w-fit mx-auto mb-8">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleTab(id)}
            className={`px-3 py-1 text-xs sm:text-sm sm:px-4 sm:py-1.5 rounded-full font-medium transition-colors ${
              activeTab === id
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "timeline"       && <Timeline />}
      {activeTab === "projects"       && <Projects />}
      {activeTab === "skills"         && <Skills />}
      {activeTab === "volunteering"   && <Volunteering />}
      {activeTab === "research"       && <Research />}
      {activeTab === "awards"         && <Awards />}
      {activeTab === "certifications" && <Certifications />}
    </section>
  )
}