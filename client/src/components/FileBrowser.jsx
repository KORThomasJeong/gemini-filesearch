import React, { useRef } from 'react';
import { FileText, Upload, Trash2, File, MessageSquare, Image, Code, FileSpreadsheet } from 'lucide-react';

const getFileIcon = (mimeType) => {
    if (!mimeType) return <File size={20} className="text-gray-500" />;
    if (mimeType.includes('image')) return <Image size={20} className="text-purple-500" />;
    if (mimeType.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel')) return <FileSpreadsheet size={20} className="text-green-500" />;
    if (mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('javascript')) return <Code size={20} className="text-blue-500" />;
    return <FileText size={20} className="text-blue-400" />;
};

const FileBrowser = ({ files, onUpload, onDeleteFile, isUploading, onToggleChat, isChatOpen }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div
            className={`flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 h-full min-w-0 transition-colors duration-300 ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Files</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onToggleChat}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isChatOpen
                            ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <MessageSquare size={16} />
                        {isChatOpen ? 'Hide Chat' : 'Chat'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                        ) : (
                            <Upload size={16} />
                        )}
                        Upload File
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm z-10 pointer-events-none">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
                            <Upload size={48} className="text-blue-500 mb-2" />
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">Drop file to upload</p>
                        </div>
                    </div>
                )}

                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-500">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>No files in this store yet.</p>
                        <p className="text-sm">Upload a file to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group relative shadow-sm dark:shadow-none"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        {getFileIcon(file.mimeType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.displayName || file.name}>
                                            {file.displayName || file.name.split('/').pop()}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {file.mimeType}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (confirm('Delete this file?')) {
                                            onDeleteFile(file.name);
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-900/80 text-red-500 dark:text-red-400 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileBrowser;
