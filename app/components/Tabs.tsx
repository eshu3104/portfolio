"use client"
import {useState} from "react"
import Timeline from "./Timeline";
import Projects from "./Projects";
import Skills from "./Skills";


export default function Tabs() {
    const [activeTab, setActiveTab] = useState("timeline")

    return (
        <section id="timeline" className="max-w-3xl mx-auto px-6 py-24">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-full w-fit mx-auto mb-8">

                <button onClick={() => setActiveTab("timeline")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "timeline" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Timeline</button>


                <button onClick={() => setActiveTab("projects")}             
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "projects" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Projects</button>


                <button onClick={() => setActiveTab("skills")}             
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "skills" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"}`}>Skills</button>
            </div>

            {activeTab === "timeline" && <div><Timeline/></div>}
            {activeTab === "projects" && <div><Projects/></div>}
            {activeTab === "skills" && <div> <Skills/> </div>}



        </section>
    );
}