import React, { useState } from 'react';
import { Trash2, Plus, Folder, FolderOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ stores, selectedStore, onSelectStore, onCreateStore, onDeleteStore, className = "w-64" }) => {
    const [newStoreName, setNewStoreName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newStoreName.trim()) {
            onCreateStore(newStoreName);
            setNewStoreName('');
            setIsCreating(false);
        }
    };

    return (
        <div className={`${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col h-full border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-500">Gemini</span> File Search
                </h1>
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stores</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleSubmit} className="mb-2 px-2">
                        <input
                            type="text"
                            value={newStoreName}
                            onChange={(e) => setNewStoreName(e.target.value)}
                            placeholder="New Store Name"
                            className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded px-2 py-1 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none"
                            autoFocus
                            onBlur={() => !newStoreName && setIsCreating(false)}
                        />
                    </form>
                )}

                <div className="space-y-1">
                    {stores.map((store) => (
                        <div
                            key={store.name}
                            className={`group flex items-center justify-between px-2 py-2 rounded cursor-pointer transition-colors ${selectedStore?.name === store.name
                                    ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            onClick={() => onSelectStore(store)}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {selectedStore?.name === store.name ? <FolderOpen size={16} /> : <Folder size={16} />}
                                <span className="truncate text-sm">{store.displayName || 'Untitled'}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this store?')) {
                                        onDeleteStore(store.name);
                                    }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
