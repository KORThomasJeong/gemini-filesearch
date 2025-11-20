const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log('Available models:');
        for await (const model of response) {
            console.log(model.name);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
