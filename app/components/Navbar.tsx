"use client";
import { useState, useEffect } from "react"
import { FaLinkedin, FaGithub, FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa"

function goToSection(id: string, tab?: "timeline" | "projects" | "skills") {
    if (tab) {
      window.location.hash = tab
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}


export default function Navbar() {

  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const handleNav = (id: string, tab?: "timeline" | "projects" | "skills") => {
    goToSection(id, tab)
    setMenuOpen(false)
  }


  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto">
      <div className="rounded-2xl sm:rounded-full bg-gray-200/90 dark:bg-gray-900/90 border border-gray-200/70 dark:border-gray-800/70 backdrop-blur-sm transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between py-3 px-4 sm:py-4 sm:px-6">
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {dark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>

            <div className="hidden sm:flex items-center gap-4 text-sm">
              <button onClick={() => handleNav("home")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Home</button>
              <button onClick={() => handleNav("timeline", "timeline")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Timeline</button>
              <button onClick={() => handleNav("timeline", "projects")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Projects</button>
              <button onClick={() => handleNav("timeline", "skills")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Skills</button>
              <button onClick={() => handleNav("contact")} className="text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Contact</button>
              
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <span className="hidden sm:inline text-gray-300 dark:text-gray-600 pl-2">|</span>

              <a target="_blank" rel="noreferrer" href="https://www.github.com/eshu3104" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaGithub size={16} />
              </a>
              <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/eshu-belgotra/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaLinkedin size={16} />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="sm:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={`sm:hidden border-t border-gray-200/70 dark:border-gray-800/70 ${menuOpen ? "block" : "hidden"}`}
        >
          <div className="flex flex-col gap-2 px-4 py-3 text-sm">
            <button onClick={() => handleNav("home")} className="text-left text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Home</button>
            <button onClick={() => handleNav("timeline", "timeline")} className="text-left text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Timeline</button>
            <button onClick={() => handleNav("timeline", "projects")} className="text-left text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Projects</button>
            <button onClick={() => handleNav("timeline", "skills")} className="text-left text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Skills</button>
            <button onClick={() => handleNav("contact")} className="text-left text-gray-600 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white">Contact</button>

            <div className="flex items-center gap-4 pt-2">
              <a target="_blank" rel="noreferrer" href="https://www.github.com/eshu3104" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaGithub size={16} />
                <span>GitHub</span>
              </a>
              <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/eshu-belgotra/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FaLinkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}