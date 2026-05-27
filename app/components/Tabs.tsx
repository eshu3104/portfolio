"use client"
import { useEffect, useState } from "react"
import Timeline from "./Timeline";
import Projects from "./Projects";
import Skills from "./Skills";

const tabIds = ["timeline", "projects", "skills"] as const
type TabId = (typeof tabIds)[number]

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

    return (
        <section id="timeline" className="max-w-3xl mx-auto px-6 py-24">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-full w-fit mx-auto mb-8">

                <button onClick={() => {
                    window.location.hash = "timeline"
                    setActiveTab("timeline")
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "timeline" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Timeline</button>


                <button onClick={() => {
                    window.location.hash = "projects"
                    setActiveTab("projects")
                }}             
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "projects" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Projects</button>


                <button onClick={() => {
                    window.location.hash = "skills"
                    setActiveTab("skills")
                }}             
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "skills" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Skills</button>
            </div>

            {activeTab === "timeline" && <div><Timeline/></div>}
            {activeTab === "projects" && <div><Projects/></div>}
            {activeTab === "skills" && <div> <Skills/> </div>}



        </section>
    );
}