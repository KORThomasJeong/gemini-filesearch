import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, RefreshCw, FileText, Copy, Check } from 'lucide-react';

const ChatInterface = ({ onSendMessage, isSearching, className = "w-full", onClose }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isSearching]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || isSearching) return;

        const userMessage = { role: 'user', content: query };
        setHistory(prev => [...prev, userMessage]);
        setQuery('');

        try {
            const response = await onSendMessage(query);
            setHistory(prev => [...prev, {
                role: 'model',
                content: response.text,
                groundingMetadata: response.groundingMetadata
            }]);
        } catch (error) {
            setHistory(prev => [...prev, { role: 'error', content: 'Failed to get response. Please try again.' }]);
        }
    };

    const handleSourceClick = (text, title) => {
        setModalData({ text, title });
    };

    const closeModal = () => {
        setModalData(null);
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    // Simple markdown renderer (can be improved or replaced with a library)
    const renderMarkdown = (text) => {
        if (!text) return { __html: '' };

        // Basic formatting
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-sm">$1</code>')
            .replace(/\n/g, '<br />');

        return { __html: html };
    };

    return (
        <div className={`${className} bg-white dark:bg-gray-900 flex flex-col h-full relative`}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Gemini File Search
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setHistory([])}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="New Chat"
                    >
                        <RefreshCw size={20} />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Sparkles size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    How can I help with your files?
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    Ask questions, summarize content, or find specific information from your uploaded documents.
                                </p>
                            </div>
                        </div>
                    )}

                    {history.map((msg, idx) => (
                        <div key={idx} className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user'
                                    ? 'bg-gray-200 dark:bg-gray-700'
                                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                    }`}>
                                    {msg.role === 'user'
                                        ? <User size={16} className="text-gray-600 dark:text-gray-300" />
                                        : <Sparkles size={16} className="text-white" />
                                    }
                                </div>

                                {/* Message Content */}
                                <div className={`flex-1 space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`relative prose dark:prose-invert max-w-none text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 inline-block text-left'
                                        : 'bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-5 py-3 text-gray-900 dark:text-gray-100'
                                        }`}>
                                        <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />

                                        {/* Copy Button for Model Messages */}
                                        {msg.role === 'model' && (
                                            <button
                                                onClick={() => handleCopy(msg.content, idx)}
                                                className="absolute -bottom-8 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 dark:bg-gray-800 rounded-full shadow-sm"
                                                title="Copy response"
                                            >
                                                {copiedIndex === idx ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        )}
                                    </div>

                                    {/* Sources */}
                                    {msg.role === 'model' && msg.groundingMetadata?.groundingChunks?.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Sources:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.groundingMetadata.groundingChunks.map((chunk, chunkIdx) => (
                                                    chunk.retrievedContext?.text && (
                                                        <button
                                                            key={chunkIdx}
                                                            onClick={() => handleSourceClick(chunk.retrievedContext.text, chunk.retrievedContext?.title || "Unknown File")}
                                                            className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs px-3 py-1 rounded-full transition-colors border border-blue-100 dark:border-blue-800"
                                                        >
                                                            Source {chunkIdx + 1}
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {msg.role === 'error' && (
                                        <p className="text-red-500 text-sm">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isSearching && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="flex items-center gap-1 h-8">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pb-8">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-md pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything about your files..."
                            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full pl-6 pr-14 py-4 shadow-lg border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            disabled={isSearching}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isSearching}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                        Gemini can make mistakes. Please review the generated responses.
                    </p>
                </div>
            </div>

            {/* Source Modal */}
            {modalData && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText size={20} className="text-blue-500" />
                                {modalData.title}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {modalData.text}
                            </p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
