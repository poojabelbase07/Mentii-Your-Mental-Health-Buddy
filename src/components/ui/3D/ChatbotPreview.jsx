import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send, X } from "lucide-react";
import { generateChatResponse } from "../../../../src/utils/generateChatResponse";

const ChatbotPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! I'm Mentii, your friendly mental health companion. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await generateChatResponse(inputValue);
      const botMessage = {
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      const errorMessage = {
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed z-50 bottom-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-mentii-500 hover:bg-mentii-600"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-40 bottom-20 right-6 w-80 md:w-96 rounded-2xl shadow-xl transition-all duration-300 transform ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="glass-card overflow-hidden h-96 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-mentii-500 to-lavender-500 p-3 text-white flex items-center justify-between">
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-2">😊</span>
              <div>
                <h3 className="font-medium">Mentii Chatbot</h3>
                <p className="text-xs opacity-80">Your mental health companion</p>
              </div>
            </div>
            <Link
              to="/chat"
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
            >
              Full Chat
            </Link>
          </div>

          {/* Chat Messages */}
          <div
            id="chat-messages"
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-white/50 backdrop-blur-sm"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? "bg-mentii-500 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-gray-200 bg-white/80 backdrop-blur-sm flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mentii-500 text-sm"
            />
            <button
              type="submit"
              className="ml-2 bg-mentii-500 text-white p-2 rounded-full hover:bg-mentii-600 transition-colors"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatbotPreview;
