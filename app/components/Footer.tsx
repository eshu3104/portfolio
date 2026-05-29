"use client"
import { useState } from "react"
import { Send, Mail, Download } from "lucide-react"

export default function Footer() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

    async function handleSubmit() {
        if (!name || !email || !message) return

        setStatus("loading")

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            })

            if (!res.ok) throw new Error("Failed")

            setStatus("success")
            setName("")
            setEmail("")
            setMessage("")
        } catch {
            setStatus("error")
        }
    }

    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 px-4" id="contact">
            <div className="max-w-4xl mx-auto pt-16 pb-12">

                <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">Get In Touch</h2>

                <div className="flex flex-col md:flex-row gap-10">

                    {/* Left: Contact form */}
                    <div className="flex-1 flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={status === "loading"}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === "loading"}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Message</label>
                            <textarea
                                placeholder="Your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                disabled={status === "loading"}
                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 resize-none disabled:opacity-50"
                            />
                        </div>

                        {/* Status messages */}
                        {status === "success" && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Message sent! I'll get back to you soon.
                            </p>
                        )}
                        {status === "error" && (
                            <p className="text-sm text-red-500 dark:text-red-400">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={status === "loading" || !name || !email || !message}
                            className="w-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={15} />
                            {status === "loading" ? "Sending..." : "Send Message"}
                        </button>
                    </div>

                    {/* Right: Contact info + Resume */}
                    <div className="flex flex-col gap-5 md:w-64 md:pt-1">

                        <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                            <Mail size={16} className="shrink-0" />
                            eshubelgotra@uvic.ca
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            I'm always interested in hearing about new opportunities and collaborations. Feel free to reach out if you'd like to connect!
                        </p>
                        
                        <a
                        
                            href="/Eshupriye_Belgotra_Resume.pdf"
                            download="Eshupriye_Belgotra_Resume.pdf"
                            className="w-full border border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 text-sm py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-colors"
                        >
                            <Download size={15} />
                            Download Resume
                        </a>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-200 dark:border-gray-800">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
                    © 2026 Eshu. All rights reserved.
                </p>
            </div>
        </footer>
    )
}