"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import OpenAI from "openai" // ✅ Correct import
import { Send, X, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { processOpenAIResponse } from "@/utils/processAIResponse"

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // ✅ Correct way in Vite
  dangerouslyAllowBrowser: true, // ⚠️ Only use this if calling OpenAI from frontend (not recommended)
})

interface AiResMessage {
  sender: string
  text: string
  timestamp: Date
  processedContent?: ReturnType<typeof processOpenAIResponse> // ✅ Ensure this function exists
}


export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AiResMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messagesEndRef]) // Updated dependency

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text:  "💡 Welcome to Crevozone AI Assistant! 🚀\n" +
          "I'm here to help you with all things! You can ask me about:\n\n" +
          "🔹 Coding & Development (Web, Mobile, MERN, etc.)\n" +
          "🔹 AI/ML & Blockchain 🧠💰\n" +
          "🔹 Tech Competitions & Hackathons 🏆\n" +
          "🔹 Latest Trends in Technology 🔍\n" +
          "🔹 Team Building & Networking at Crevozone 🤝\n\n" + " " +
          "Feel free to ask anything! How can I assist you today? 😊",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!input.trim()) return
  
    const newMessages = [
      ...messages.filter((msg) => msg.text !== "💡 Welcome to Crevozone AI Assistant! 🚀\n" +
          "I'm here to help you with all things! You can ask me about:\n\n" +
          "🔹 Coding & Development (Web, Mobile, MERN, etc.)\n" +
          "🔹 AI/ML & Blockchain 🧠💰\n" +
          "🔹 Tech Competitions & Hackathons 🏆\n" +
          "🔹 Latest Trends in Technology 🔍\n" +
          "🔹 Team Building & Networking at Crevozone 🤝\n\n" + " " +
          "Feel free to ask anything! How can I assist you today? 😊"),
      { sender: "user", text: input, timestamp: new Date() },
    ]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)
  
   try {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a technical assistant. Only respond to questions related to technology, programming, AI, cybersecurity, and software development. If a question is unrelated, politely decline." },
      { role: "user", content: input }
    ],
  })

  const botResponse = response.choices?.[0]?.message?.content || "Sorry, I couldn't understand that."

  setIsTyping(false)

  const processedContent = processOpenAIResponse(botResponse)
  setMessages([
    ...newMessages,
    { sender: "bot", text: botResponse, timestamp: new Date(), processedContent },
  ])
} catch (error) {
  setIsTyping(false)
  console.error("Error fetching response:", error)
}

      
  } // ✅ Add this closing bracket to properly end handleSend
  
  const formatTimestamp = (date: Date) => {
    return format(date, "h:mm a")
  }
  

  const renderProcessedContent = (content: ReturnType<typeof processOpenAIResponse>) => {
    return (
      <div className="space-y-2">
        {content.map((section, index) => (
          <div key={index}>
            {section.heading && <h3 className="font-bold text-lg mt-2">{section.heading}</h3>}
            {section.content.map((paragraph, pIndex) => (
              <p key={pIndex} className="mt-1">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[300px] sm:w-[400px] h-[calc(100vh-15rem)] sm:h-[38rem] bg-white shadow-2xl rounded-2xl mb-4 flex flex-col overflow-hidden fixed bottom-20 right-0 sm:right-5 left-[60px] sm:left-auto"
          >
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Assistant</h2>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[100%] ${
                      msg.sender === "user"
                        ? "bg-gray-100 text-gray-600 rounded-br-none"
                        : "bg-transparent text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.processedContent ? renderProcessedContent(msg.processedContent) : msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{formatTimestamp(msg.timestamp)}</span>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <span className="typing-animation">Typing</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
              <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-3 bg-transparent outline-none"
                  placeholder="Type your message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  )
}

