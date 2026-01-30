import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const { isAuthenticated, hasProfile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('aiModel') || 'gemini';
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const AI_MODELS = [
    { id: 'gemini', name: 'Gemini', icon: '✨', color: 'blue' },
    { id: 'ollama', name: 'Ollama (Local)', icon: '🦙', color: 'orange' },
    { id: 'nvidia', name: 'BioMistral', icon: '🧬', color: 'green' },
  ];

  // Only show chatbot on protected /app routes when authenticated
  const shouldShowChatbot = isAuthenticated && hasProfile && location.pathname.startsWith('/app');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await chatAPI.getHistory();
      // API returns { success: true, data: { messages: [...], pagination: {...} } }
      const chatMessages = response.data.data?.messages || response.data.messages || [];

      // Map 'message' field to 'content' for compatibility
      const formattedMessages = chatMessages.map(msg => ({
        ...msg,
        content: msg.message || msg.content,
      }));

      // Add welcome message if no history
      if (formattedMessages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content:
              "👋 Hello! I'm your AI health assistant. I can help you understand your test results, answer health questions, and provide personalized health recommendations based on your medical history. How can I assist you today?",
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Set welcome message on error
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "👋 Hello! I'm your AI health assistant. How can I help you today?",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(inputMessage, selectedModel);
      // API returns { success: true, data: { userMessage, aiMessage: { id, message, createdAt } } }
      const aiData = response.data.data?.aiMessage || response.data.aiMessage || {};
      const aiMessage = {
        id: aiData.id || Date.now().toString(),
        role: 'assistant',
        content: aiData.message || 'Sorry, I could not process your request.',
        createdAt: aiData.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      // Remove the user message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;

    try {
      await chatAPI.clearHistory();
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "👋 Hello! I'm your AI health assistant. How can I help you today?",
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const suggestedQuestions = [
    'What do my recent test results mean?',
    'What lifestyle changes should I make?',
    'When should I see a doctor?',
    'How can I improve my health score?',
  ];
  // Don't render if not on app routes or not authenticated
  if (!shouldShowChatbot) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen(true);
          }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
          aria-label="Open chat"
          type="button"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Health Assistant</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Model Selector */}
            <div className="relative mt-3">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <span>{AI_MODELS.find(m => m.id === selectedModel)?.icon}</span>
                  <span>{AI_MODELS.find(m => m.id === selectedModel)?.name} AI</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        localStorage.setItem('aiModel', model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-gray-900 hover:bg-gray-50 transition-colors text-sm ${selectedModel === model.id ? 'bg-purple-50' : ''
                        }`}
                    >
                      <span>{model.icon}</span>
                      <span>{model.name} AI</span>
                      {selectedModel === model.id && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                      <p
                        className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && !loadingHistory && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-600 mb-2">Suggested questions:</p>
              <div className="space-y-1">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="w-full text-left text-xs text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>

            {messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                className="w-full mt-2 text-xs text-red-600 hover:text-red-700"
              >
                Clear chat history
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
