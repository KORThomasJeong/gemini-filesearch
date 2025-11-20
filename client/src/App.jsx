import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FileBrowser from './components/FileBrowser';
import ChatInterface from './components/ChatInterface';
import { ThemeProvider } from './context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function AppContent() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchFiles(selectedStore.name);
    } else {
      setFiles([]);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/stores`);
      const data = await res.json();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const fetchFiles = async (storeName) => {
    try {
      const res = await fetch(`${API_BASE}/stores/${encodeURIComponent(storeName)}/files`);
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleCreateStore = async (displayName) => {
    try {
      const res = await fetch(`${API_BASE}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      if (res.ok) {
        fetchStores();
      }
    } catch (error) {
      console.error('Failed to create store:', error);
    }
  };

  const handleDeleteStore = async (storeName) => {
    try {
      const res = await fetch(`${API_BASE}/stores/${encodeURIComponent(storeName)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedStore?.name === storeName) {
          setSelectedStore(null);
        }
        fetchStores();
      }
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  const handleUploadFile = async (file) => {
    if (!selectedStore) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/stores/${encodeURIComponent(selectedStore.name)}/files`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchFiles(selectedStore.name);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      if (res.ok && selectedStore) {
        fetchFiles(selectedStore.name);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!selectedStore) return "Please select a store first.";
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          storeNames: [selectedStore.name],
        }),
      });
      const data = await res.json();
      return data; // Returns { text, groundingMetadata }
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar
        stores={stores}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
        onCreateStore={handleCreateStore}
        onDeleteStore={handleDeleteStore}
        className="w-64"
      />

      <div className="flex-1 flex flex-col min-w-0">
        {selectedStore ? (
          <div className="flex-1 flex overflow-hidden relative">
            {isChatOpen ? (
              <ChatInterface
                onSendMessage={handleSearch}
                isSearching={isSearching}
                className="w-full"
                onClose={() => setIsChatOpen(false)}
              />
            ) : (
              <FileBrowser
                files={files}
                onUpload={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                isUploading={isUploading}
                onToggleChat={() => setIsChatOpen(true)}
                isChatOpen={isChatOpen}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>Select a store to view files and chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
