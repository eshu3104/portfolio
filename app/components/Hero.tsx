"use client"

export default function Hero() { 
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6" id="home">   
            {/* 1. Name Heading */}
            <h1 className="text-4xl font-bold">Hi! My name is Eshu</h1>
            
            {/* 2. Memoji Placeholder */}
            <div className="rounded-full bg-gray-200 w-32 h-32 " ></div>

            {/* 3. Chat UI Shell Container */}
            <div className="rounded-2xl max-w-xl w-full border border-gray-200 bg-gray-50 backdrop-blur-m p-6 shadow-sm flex flex-col gap-4 ">
                
                {/* Layer A: Response Display Area */}
                <div className="h-40 overflow-y-auto pr-2 flex flex-col justify-end">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm self-start shadow-sm">
                        Hi! I'm Eshu's AI assistant. Ask me about his experience at UVic/IIT, his hackathon projects, or his full-stack skills!
                    </div>
                </div>

                {/* Layer B: Suggestion Chips */}
                <div className="flex flex-wrap gap-2">
                    <button className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer shadow-sm">
                        What's his tech stack?
                    </button>
                    <button className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer shadow-sm">
                        See hackathon projects
                    </button>
                    <button className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full transition-colors font-medium cursor-pointer shadow-sm">
                        Is he open to co-ops?
                    </button>
                </div>

                {/* Layer C: Input Bar */}
                <div className="flex gap-2 w-full">
                    <input 
                        type="text" 
                        placeholder="Ask me anything..." 
                        disabled
                        className="flex-1 bg-white border border-gray-200 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none  disabled:cursor-not-allowed shadow-inner"
                    />
                    <button 
                        disabled
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
                    >
                        Send
                    </button>
                </div>

            </div>
        </div>
    );
}