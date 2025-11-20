import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FileBrowser from './components/FileBrowser';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import { ThemeProvider } from './context/ThemeContext';
import { LogOut, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('login'); // login, register, app, admin

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then(userData => {
          setUser(userData);
          setView('app');
        })
        .catch(() => {
          handleLogout();
        });
    } else {
      setView('login');
    }
  }, [token]);

  useEffect(() => {
    if (user && view === 'app') {
      fetchStores();
    }
  }, [user, view]);

  useEffect(() => {
    if (selectedStore) {
      fetchFiles(selectedStore.name);
    } else {
      setFiles([]);
    }
  }, [selectedStore]);

  const handleLogin = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    setView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('login');
    setSelectedStore(null);
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/stores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const fetchFiles = async (storeName) => {
    try {
      const res = await fetch(`${API_BASE}/stores/${encodeURIComponent(storeName)}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
        headers: getAuthHeaders(),
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
        headers: { 'Authorization': `Bearer ${token}` }
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
        headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
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
        headers: { 'Authorization': `Bearer ${token}` }
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query,
          storeNames: [selectedStore.name],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      return data; // Returns { text, groundingMetadata }
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />;
  }

  if (view === 'register') {
    return <Register onNavigateToLogin={() => setView('login')} />;
  }

  if (view === 'admin') {
    return <Admin token={token} onBack={() => setView('app')} />;
  }

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
        {/* Top Bar for User Actions */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-end items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Logged in as <span className="font-semibold text-gray-900 dark:text-white">{user?.username}</span>
          </span>
          {user?.role === 'admin' && (
            <button
              onClick={() => setView('admin')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              <Shield size={16} />
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

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
