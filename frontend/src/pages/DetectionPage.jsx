import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectionAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  SparklesIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';

const DetectionPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      // Load both chat messages and detection history in parallel
      const [chatResponse, detectionResponse] = await Promise.all([
        chatAPI.getHistory().catch(() => ({ data: { data: { messages: [] } } })),
        detectionAPI.getHistory().catch(() => ({ data: { data: { detections: [] } } })),
      ]);
      
      const chatMessages = chatResponse.data.data?.messages || chatResponse.data.messages || [];
      const detections = detectionResponse.data.data?.detections || detectionResponse.data.detections || [];
      
      // Convert chat history to detection page format
      const formattedChatMessages = chatMessages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.message || msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      
      // Convert detection history to detection page format
      const formattedDetections = detections.flatMap(detection => {
        const messages = [];
        
        // Add user message with image preview
        messages.push({
          id: `user-detection-${detection.id}`,
          type: 'user',
          content: 'Uploaded CT scan image for analysis',
          image: detection.imageUrl,
          timestamp: new Date(detection.createdAt),
        });
        
        // Add detection result message
        messages.push({
          id: `detection-result-${detection.id}`,
          type: 'detection',
          detection: {
            id: detection.id,
            prediction: detection.prediction,
            confidence: detection.confidence,
            probabilities: detection.probabilities,
            riskLevel: detection.riskLevel,
            riskScore: detection.riskScore,
            aiSuggestions: detection.aiSuggestions,
            imageUrl: detection.imageUrl,
          },
          timestamp: new Date(detection.createdAt),
        });
        
        return messages;
      });
      
      // Merge and sort all messages by timestamp
      const allMessages = [...formattedChatMessages, ...formattedDetections].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      
      // Add welcome message if no history
      if (allMessages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            type: 'ai',
            content: 'Hello! I\'m your AI health assistant. You can ask me health questions or upload a CT scan image for disease detection.',
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(allMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Set welcome message on error
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: 'Hello! I\'m your AI health assistant. You can ask me health questions or upload a CT scan image for disease detection.',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await chatAPI.sendMessage(inputMessage);
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.data.data.aiMessage.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Add user message with image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const userMessage = {
        id: `user-img-${Date.now()}`,
        type: 'user',
        content: 'Uploaded CT scan image for analysis',
        image: reader.result,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      const response = await detectionAPI.uploadScan(file);
      console.log('Detection response:', response.data);

      const detectionData = response.data.data.detection;

      // Create detection result message
      const resultMessage = {
        id: `detection-${Date.now()}`,
        type: 'detection',
        detection: {
          id: detectionData.id,
          prediction: detectionData.prediction,
          confidence: detectionData.confidence,
          probabilities: detectionData.probabilities,
          riskLevel: detectionData.riskLevel,
          riskScore: detectionData.riskScore,
          aiSuggestions: detectionData.aiSuggestions,
          imageUrl: detectionData.imageUrl,
        },
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, resultMessage]);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Detection error:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze image');
    } finally {
      setIsUploading(false);
    }
  };

  const getResultColor = (resultType) => {
    const configs = {
      Normal: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        text: 'text-green-800',
        border: 'border-green-300',
        badge: 'bg-green-500',
        ring: 'ring-green-300',
      },
      Tumor: {
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        text: 'text-red-800',
        border: 'border-red-300',
        badge: 'bg-red-500',
        ring: 'ring-red-300',
      },
      Cyst: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
        ring: 'ring-yellow-300',
      },
      Stone: {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        text: 'text-orange-800',
        border: 'border-orange-300',
        badge: 'bg-orange-500',
        ring: 'ring-orange-300',
      },
    };
    return configs[resultType] || {
      bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
      text: 'text-gray-800',
      border: 'border-gray-300',
      badge: 'bg-gray-500',
      ring: 'ring-gray-300',
    };
  };

  const getRiskColor = (risk) => {
    const configs = {
      CRITICAL: {
        text: 'text-red-700',
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-300',
        icon: 'bg-red-500',
        pulse: 'animate-pulse',
      },
      HIGH: {
        text: 'text-orange-700',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-300',
        icon: 'bg-orange-500',
        pulse: '',
      },
      MODERATE: {
        text: 'text-yellow-700',
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-300',
        icon: 'bg-yellow-500',
        pulse: '',
      },
      LOW: {
        text: 'text-green-700',
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-300',
        icon: 'bg-green-500',
        pulse: '',
      },
    };
    return configs[risk] || configs.LOW;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 rounded-2xl shadow-xl p-6 m-4 mb-0">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/dashboard', { state: { refresh: true } })}
              className="group p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <SparklesIconSolid className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  AI Health Assistant
                </h1>
              </div>
              <p className="text-blue-100 mt-1 ml-12">
                Ask questions or upload CT scans for instant analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 font-medium">Loading chat history...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-purple-200">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-3xl transition-all duration-300 hover:shadow-xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-lg'
                  : message.type === 'detection'
                  ? 'bg-white rounded-2xl border-2 border-purple-200 shadow-lg'
                  : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm shadow-md'
              } px-6 py-4`}
            >
              {message.type === 'user' && message.image && (
                <img
                  src={message.image}
                  alt="Uploaded scan"
                  className="w-full max-w-sm rounded-xl mb-3 ring-2 ring-white shadow-lg"
                />
              )}

              {message.type === 'detection' ? (
                <div className="space-y-4">
                  {/* Detection Header */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                      <ComputerDesktopIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">CT Scan Analysis Results</h3>
                  </div>

                  {/* Image */}
                  <div className="relative group">
                    <img
                      src={message.detection.imageUrl}
                      alt="CT Scan"
                      className="w-full max-w-md rounded-xl shadow-xl ring-2 ring-gray-200 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Main Result */}
                  <div className={`border-2 rounded-xl p-6 shadow-lg ${getResultColor(message.detection.prediction).bg} ${getResultColor(message.detection.prediction).border} ring-2 ${getResultColor(message.detection.prediction).ring} ring-opacity-30`}>
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheckIcon className={`w-6 h-6 ${getResultColor(message.detection.prediction).text}`} />
                        <p className="text-sm font-semibold text-gray-600">Detection Result</p>
                      </div>
                      <p className={`text-3xl font-bold ${getResultColor(message.detection.prediction).text}`}>
                        {message.detection.prediction}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 max-w-xs bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full ${getResultColor(message.detection.prediction).badge} transition-all duration-1000 ease-out rounded-full`}
                            style={{ width: `${message.detection.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${getResultColor(message.detection.prediction).text}`}>
                          {(message.detection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Level */}
                  {message.detection.riskLevel && (
                    <div className={`rounded-xl p-5 shadow-md border-2 ${getRiskColor(message.detection.riskLevel).bg} ${getRiskColor(message.detection.riskLevel).border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 ${getRiskColor(message.detection.riskLevel).icon} rounded-lg shadow-md ${getRiskColor(message.detection.riskLevel).pulse}`}>
                            <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className={`text-sm font-semibold ${getRiskColor(message.detection.riskLevel).text}`}>Risk Assessment</span>
                        </div>
                        <span className={`text-xl font-bold ${getRiskColor(message.detection.riskLevel).text}`}>
                          {message.detection.riskLevel}
                        </span>
                      </div>
                      {message.detection.riskScore && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden shadow-inner">
                            <div 
                              className={`h-full ${getRiskColor(message.detection.riskLevel).icon} transition-all duration-1000 ease-out`}
                              style={{ width: `${message.detection.riskScore}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold ${getRiskColor(message.detection.riskLevel).text}`}>
                            {message.detection.riskScore.toFixed(1)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Probabilities */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-bold text-gray-900">Detailed Probabilities</h4>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(message.detection.probabilities || {}).map(([key, value]) => (
                        <div key={key} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{key}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {(value * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out transform group-hover:scale-x-105"
                              style={{ width: `${(value * 100).toFixed(1)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  {message.detection.aiSuggestions && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-200 to-transparent rounded-full -mr-24 -mt-24 opacity-30"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200 to-transparent rounded-full -ml-16 -mb-16 opacity-20"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                            <SparklesIconSolid className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900">AI Health Recommendations</h4>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-purple-200">
                          <div className="prose prose-sm max-w-none 
                            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-4 first:prose-headings:mt-0
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
                            prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-ul:space-y-2 prose-ul:my-3
                            prose-ol:space-y-2 prose-ol:my-3
                            marker:text-purple-600">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-lg flex items-center gap-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base flex items-center gap-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm flex items-center gap-2" {...props} />,
                                ul: ({node, ...props}) => <ul className="space-y-2 my-3" {...props} />,
                                ol: ({node, ...props}) => <ol className="space-y-2 my-3" {...props} />,
                                li: ({node, ...props}) => (
                                  <li className="flex items-start gap-2 bg-gradient-to-r from-purple-50 to-transparent p-2 rounded-lg hover:from-purple-100 transition-colors duration-200" {...props}>
                                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></span>
                                    <span className="flex-1">{props.children}</span>
                                  </li>
                                ),
                                p: ({node, ...props}) => <p className="leading-relaxed mb-3" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-purple-900" {...props} />,
                              }}
                            >
                              {message.detection.aiSuggestions}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}

              <p className="text-xs mt-3 opacity-60 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {(isUploading || isSending) && (
          <div className="flex justify-start animate-fadeIn">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-purple-200 animate-pulse">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {isUploading ? 'Analyzing your CT scan...' : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t-2 border-gray-100 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending}
            className="group relative flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            title="Upload CT Scan"
          >
            <PhotoIcon className="w-6 h-6 transition-transform group-hover:rotate-12" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a health question or upload a CT scan..."
              disabled={isUploading || isSending}
              className="w-full px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isUploading || isSending}
            className="group flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <PaperAirplaneIcon className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full">
            <SparklesIcon className="w-3 h-3 text-purple-600" />
            <span className="font-medium">AI-Powered Analysis</span>
          </div>
          <span className="text-gray-400">•</span>
          <span>Upload CT scans or ask health questions</span>
        </div>
      </div>
    </div>
  );
};

export default DetectionPage;
