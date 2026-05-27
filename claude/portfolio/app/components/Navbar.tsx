"use client";

function goToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 rounded-full z-50 bg-gray-200 backdrop-blur-sm whitespace-nowrap">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-4 px-6">
        <span className="text-sm font-semibold tracking-tight text-gray-900 mr-8">
          eshu.earth
        </span>

        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => goToSection("home")} className="text-gray-600 transition-colors hover:text-gray-900">Home</button>
          <button onClick={() => goToSection("timeline")} className="text-gray-600 transition-colors hover:text-gray-900">Timeline</button>
          <button onClick={() => goToSection("projects")} className="text-gray-600 transition-colors hover:text-gray-900">Projects</button>
          <button onClick={() => goToSection("skills")} className="text-gray-600 transition-colors hover:text-gray-900">Skills</button>
          <button onClick={() => goToSection("contact")} className="text-gray-600 transition-colors hover:text-gray-900">Contact</button>
        </div>
      </div>
    </nav>
  );
}