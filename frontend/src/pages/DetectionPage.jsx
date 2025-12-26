import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectionAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  SparklesIcon,
  UserCircleIcon,
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const DetectionPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      content: 'Hello! I\'m your AI health assistant. You can ask me health questions or upload a CT scan image for disease detection.',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        content: response.data.data.response,
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
    switch (resultType) {
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Tumor':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Cyst':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Stone':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'MODERATE':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Health Assistant</h1>
            <p className="text-gray-600 mt-1">Ask questions or upload CT scans for analysis</p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard', { state: { refresh: true } })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-3xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                  : message.type === 'detection'
                  ? 'bg-white rounded-2xl border-2 border-blue-200'
                  : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm'
              } px-6 py-4 shadow-md`}
            >
              {message.type === 'user' && message.image && (
                <img
                  src={message.image}
                  alt="Uploaded scan"
                  className="w-full max-w-sm rounded-lg mb-3"
                />
              )}

              {message.type === 'detection' ? (
                <div className="space-y-4">
                  {/* Detection Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">CT Scan Analysis Results</h3>
                  </div>

                  {/* Image */}
                  <img
                    src={message.detection.imageUrl}
                    alt="CT Scan"
                    className="w-full max-w-md rounded-lg"
                  />

                  {/* Main Result */}
                  <div className={`border-2 rounded-xl p-4 ${getResultColor(message.detection.prediction)}`}>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1">Detection Result</p>
                      <p className="text-2xl font-bold mb-1">{message.detection.prediction}</p>
                      <p className="text-sm">
                        Confidence: {(message.detection.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Risk Level */}
                  {message.detection.riskLevel && (
                    <div className={`rounded-lg p-4 ${getRiskColor(message.detection.riskLevel)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Risk Level:</span>
                        <span className="text-lg font-bold">{message.detection.riskLevel}</span>
                      </div>
                      {message.detection.riskScore && (
                        <div className="mt-2 text-xs">
                          Risk Score: {message.detection.riskScore.toFixed(1)}/100
                        </div>
                      )}
                    </div>
                  )}

                  {/* Probabilities */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">All Probabilities</h4>
                    <div className="space-y-2">
                      {Object.entries(message.detection.probabilities || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-20">{key}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(value * 100).toFixed(1)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {(value * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  {message.detection.aiSuggestions && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        AI Recommendations
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {message.detection.aiSuggestions}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}

              <p className="text-xs mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {(isUploading || isSending) && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-6 py-4 shadow-md">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm">{isUploading ? 'Analyzing image...' : 'Thinking...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t">
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
            className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload CT Scan"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a health question or upload a CT scan..."
            disabled={isUploading || isSending}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isUploading || isSending}
            className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-3 text-center">
          💡 Tip: Upload a CT scan image or ask questions about your health
        </p>
      </div>
    </div>
  );
};

export default DetectionPage;
