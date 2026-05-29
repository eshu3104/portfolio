"use client";
import { useState, useEffect } from "react"
import { FaLinkedin, FaGithub, FaLink, FaMoon, FaSun} from "react-icons/fa"

function goToSection(id: string, tab?: "timeline" | "projects" | "skills") {
    if (tab) {
      window.location.hash = tab
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}


export default function Navbar() {

  const [dark, setDark] = useState(false)

useEffect(() => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    document.documentElement.classList.add('dark')
    setDark(true)
  }
}, [])

function toggleDark() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  setDark(isDark)
}


  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 rounded-full z-50 bg-gray-200 backdrop-blur-sm whitespace-nowrap">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4 px-6">
        

        <div className="flex items-center gap-4 text-sm">
          <button onClick={toggleDark} className="text-gray-600 hover:text-gray-900 transition-colors">
  {dark ? <FaSun size={16} /> : <FaMoon size={16} />}
</button>
          <span className="text-gray-300">|</span>

          <button onClick={() => goToSection("home")} className="text-gray-600 transition-colors hover:text-gray-900">Home</button>
          <button onClick={() => goToSection("timeline", "timeline")} className="text-gray-600 transition-colors hover:text-gray-900">Timeline</button>
          <button onClick={() => goToSection("timeline", "projects")} className="text-gray-600 transition-colors hover:text-gray-900">Projects</button>
          <button onClick={() => goToSection("timeline", "skills")} className="text-gray-600 transition-colors hover:text-gray-900">Skills</button>
          <button onClick={() => goToSection("contact")} className="text-gray-600 transition-colors hover:text-gray-900">Contact</button>
          <span className="text-gray-300">|</span>
          <a target="_blank" href="https://www.github.com/eshu3104"> <FaGithub size={16} /></a>
          <a target="_blank" href="https://www.linkedin.com/in/eshu-belgotra/"> <FaLinkedin size={16} /></a>
        </div>
      </div>
    </nav>
  );
}