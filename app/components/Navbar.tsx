"use client";
import { useState, useEffect } from "react"
import { FaLinkedin, FaGithub, FaMoon, FaSun } from "react-icons/fa"

function goToSection(id: string, tab?: "timeline" | "projects" | "skills") {
    if (tab) {
      window.location.hash = tab
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}


export default function Navbar() {

  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const isDark = stored === "dark"
    document.documentElement.classList.toggle("dark", isDark)
    setDark(isDark)
    if (!stored) {
      localStorage.setItem("theme", "light")
    }
  }, [])

  function toggleDark() {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }


  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 rounded-full z-50 bg-gray-200/90 dark:bg-gray-900/90 border border-gray-200/70 dark:border-gray-800/70 backdrop-blur-sm whitespace-nowrap transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4 px-6">
        

        <div className="flex items-center gap-4 text-sm">
          <button onClick={toggleDark} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
  {dark ? <FaSun size={16} /> : <FaMoon size={16} />}
</button>
          <span className="text-gray-300 dark:text-gray-600">|</span>

          <button onClick={() => goToSection("home")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Home</button>
          <button onClick={() => goToSection("timeline", "timeline")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Timeline</button>
          <button onClick={() => goToSection("timeline", "projects")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Projects</button>
          <button onClick={() => goToSection("timeline", "skills")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Skills</button>
          <button onClick={() => goToSection("contact")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Contact</button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a target="_blank" href="https://www.github.com/eshu3104" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"> <FaGithub size={16} /></a>
          <a target="_blank" href="https://www.linkedin.com/in/eshu-belgotra/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"> <FaLinkedin size={16} /></a>
        </div>
      </div>
    </nav>
  );
}