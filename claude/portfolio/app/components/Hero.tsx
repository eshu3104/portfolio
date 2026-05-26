"use client"
import { Send } from "lucide-react"

export default function Hero() {
    return (
        <div className="min-h-screen flex flex-col items-center pt-32 gap-6" id="home">

            {/* 1. Name Heading — stays at top */}
            <h1 className="text-4xl font-bold">Hi! My name is Eshu</h1>

            {/* 2. Avatar */}
            <div className="rounded-full bg-gray-200 w-36 h-36 mt-8" />

            {/* 3. Large name below avatar */}
            <h2 className="text-6xl font-bold tracking-tight">Eshu</h2>

            {/* 4. Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    What's his tech stack?
                </button>
                <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    See hackathon projects
                </button>
                <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full transition-colors font-medium cursor-pointer">
                    Is he open to co-ops?
                </button>
            </div>

            {/* 5. Input Bar */}
            <div className="flex items-center gap-3 max-w-xl w-full px-4">
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    disabled
                    className="flex-1 bg-gray-100 border-none placeholder-gray-400 rounded-full px-6 py-3.5 text-sm outline-none disabled:cursor-not-allowed"
                />
                <button
                    disabled
                    className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
                >
                    <Send size={16} className="translate-x-0.5" />
                </button>
            </div>

        </div>
    )
}