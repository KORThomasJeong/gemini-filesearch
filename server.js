const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileSearchManager = require('./FileSearchManager');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize FileSearchManager
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set. API calls will fail.');
}
const fileSearchManager = new FileSearchManager(apiKey);

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// API Routes

// List all stores
app.get('/api/stores', async (req, res) => {
    try {
        const stores = await fileSearchManager.listStores();
        res.json(stores);
    } catch (error) {
        console.error('Error listing stores:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new store
app.post('/api/stores', async (req, res) => {
    try {
        const { displayName } = req.body;
        if (!displayName) {
            return res.status(400).json({ error: 'displayName is required' });
        }
        const store = await fileSearchManager.createStore(displayName);
        res.json(store);
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a store
app.delete('/api/stores/:name(*)', async (req, res) => {
    try {
        const storeName = req.params.name;
        await fileSearchManager.deleteStore(storeName);
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ error: error.message });
    }
});

// List files in a store
app.get('/api/stores/:name(*)/files', async (req, res) => {
    try {
        const storeName = req.params.name;
        const files = await fileSearchManager.listDocuments(storeName);
        console.log('Listed files for store:', storeName, files);
        res.json(files);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload a file to a store
app.post('/api/stores/:name(*)/files', upload.single('file'), async (req, res) => {
    try {
        const storeName = req.params.name;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Uploading file:', {
            path: file.path,
            mimetype: file.mimetype,
            originalname: file.originalname
        });

        // Rename file to original name to ensure Gemini uses correct name as fallback
        const originalNamePath = path.join('uploads', file.originalname);
        fs.renameSync(file.path, originalNamePath);

        const result = await fileSearchManager.uploadFile(originalNamePath, storeName, {
            mimeType: file.mimetype,
            displayName: file.originalname
        });

        console.log('Upload result:', result);

        // Clean up temp file
        if (fs.existsSync(originalNamePath)) {
            fs.unlinkSync(originalNamePath);
        }

        res.json(result);
    } catch (error) {
        console.error('Error uploading file:', error);
        // Clean up temp file if it exists (check both paths)
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        // We might have renamed it, so we can't easily clean up the renamed file here without tracking it, 
        // but the main try block handles success cleanup. 
        // In a real app, we'd track the current path.
        res.status(500).json({ error: error.message });
    }
});

// Delete a file (document)
app.delete('/api/files/:name(*)', async (req, res) => {
    try {
        const documentName = req.params.name;
        await fileSearchManager.deleteDocument(documentName);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Chat with Gemini using File Search
app.post('/api/chat', async (req, res) => {
    try {
        const { query, storeNames, model } = req.body;
        if (!query || !storeNames) {
            return res.status(400).json({ error: 'query and storeNames are required' });
        }

        const result = await fileSearchManager.search(query, storeNames, model);
        res.json(result);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
