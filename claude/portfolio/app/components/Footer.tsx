"use client"
import { useState } from "react"


export default function Footer () {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")


    function handleSubmit(name: string, email: string, message: string) {
        console.log(name, email, message)
        return email
    }


    return (
        <footer className="mt-16 border-t pt-10 pb-16 px-4 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10">

        {/* Left: Contact form */}
        <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Get in touch</h2>
        {
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mb-3"
            />

        }
        {
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mb-3"
            />

        }
        {
            <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 mb-3"
            />
        }
        { 
            <button
             onClick={() => handleSubmit(name, email, message)}
                className="bg-black text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
                Send
            </button>
        }
        </div>

        {/* Right: Resume download */}
        <div className="flex flex-col items-start gap-3">
        <h2 className="text-lg font-semibold">Resume</h2>
        <a href="/resume.pdf" download="Eshu_Resume.pdf"
            className="bg-black text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
            Download PDF
        </a>
        </div>

  </div>
</footer>
    )
}