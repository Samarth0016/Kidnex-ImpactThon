import { useState, useRef, useEffect } from 'react';
import { reportSimplifierAPI } from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportSimplifier = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('reportAiModel') || 'gemini';
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'
  const fileInputRef = useRef(null);

  const AI_MODELS = [
    { id: 'gemini', name: 'Gemini 2.5 Flash', icon: '✨', description: 'Google AI' },
    { id: 'ollama', name: 'Ollama (Local)', icon: '🦙', description: 'Local Model' },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('reportAiModel', selectedModel);
  }, [selectedModel]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await reportSimplifierAPI.getHistory();
      setHistory(response.data.data?.reports || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload an image (JPEG, PNG, WebP) or PDF file');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setResult(null);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await reportSimplifierAPI.upload(file, selectedModel);
      setResult(response.data.data);
      toast.success('Report simplified successfully!');
      loadHistory(); // Refresh history
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to process report');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportSimplifierAPI.delete(id);
      toast.success('Report deleted');
      setHistory(history.filter((r) => r.id !== id));
      if (viewingReport?.id === id) {
        setViewingReport(null);
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleViewReport = async (id) => {
    try {
      const response = await reportSimplifierAPI.getById(id);
      setViewingReport(response.data.data);
    } catch (error) {
      toast.error('Failed to load report');
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg">
            <DocumentMagnifyingGlassIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Report Simplifier</h1>
            <p className="text-gray-600">
              Upload your medical report (image or PDF) and get an easy-to-understand explanation
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-lg border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <CloudArrowUpIcon className="h-5 w-5" />
            Upload Report
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            History ({history.length})
          </span>
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CloudArrowUpIcon className="h-6 w-6 text-emerald-500" />
                Upload Your Report
              </h2>

              {/* AI Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  <span>{AI_MODELS.find((m) => m.id === selectedModel)?.icon}</span>
                  <span className="font-medium text-sm">
                    {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                    {AI_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all ${
                          selectedModel === model.id ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <span className="text-xl">{model.icon}</span>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </div>
                        {selectedModel === model.id && (
                          <SparklesIconSolid className="h-5 w-5 text-emerald-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                file
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CloudArrowUpIcon className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Drag & drop your report here
                    </p>
                    <p className="text-gray-500 mt-1">or click to browse</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">JPEG</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">PNG</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full">PDF</span>
                  </div>
                  <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center">
                      <DocumentTextIcon className="h-10 w-10 text-red-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 mx-auto"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Remove file
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!file || isProcessing}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                !file || isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                </>
              ) : (
                <>
                  <SparklesIcon className="h-6 w-6" />
                  Simplify Report
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <SparklesIcon className="h-6 w-6 text-emerald-500" />
              Simplified Explanation
            </h2>

            {!result && !isProcessing && (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                <DocumentMagnifyingGlassIcon className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">No report analyzed yet</p>
                <p className="text-sm">Upload a medical report to get started</p>
              </div>
            )}

            {isProcessing && (
              <div className="h-96 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 font-medium">Analyzing your report...</p>
                <p className="text-sm text-gray-400">This may take a few moments</p>
              </div>
            )}

            {result && !isProcessing && (
              <div className="prose prose-sm max-w-none overflow-y-auto max-h-[600px] pr-2">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-md font-semibold text-gray-800 mt-4 mb-2">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 text-gray-700">{children}</ol>
                    ),
                    p: ({ children }) => <p className="text-gray-700 mb-3">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-50 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {result.simplifiedExplanation}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <ClockIcon className="h-6 w-6 text-emerald-500" />
              Previous Reports
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="font-medium">No reports yet</p>
                <p className="text-sm">Upload your first medical report</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {history.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      viewingReport?.id === report.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleViewReport(report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt="Report"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-red-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {report.originalFileName}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 mt-1 inline-block">
                            {report.aiModel === 'gemini' ? '✨ Gemini' : '🦙 Ollama'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(report.id);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(report.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Report View */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-emerald-500" />
              Report Details
            </h2>

            {!viewingReport ? (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                <EyeIcon className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Select a report to view</p>
                <p className="text-sm">Click on any report from the list</p>
              </div>
            ) : (
              <div className="space-y-4">
                {viewingReport.imageUrl && (
                  <img
                    src={viewingReport.imageUrl}
                    alt="Report"
                    className="w-full max-h-48 object-contain rounded-xl bg-gray-100"
                  />
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{viewingReport.originalFileName}</span>
                  <span>{formatDate(viewingReport.createdAt)}</span>
                </div>
                <div className="prose prose-sm max-w-none overflow-y-auto max-h-[400px] pr-2 border-t pt-4">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-md font-semibold text-gray-800 mt-4 mb-2">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">{children}</ol>
                      ),
                      p: ({ children }) => <p className="text-gray-700 mb-3">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-50 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {viewingReport.simplifiedExplanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSimplifier;
