import * as tf from '@tensorflow/tfjs';

let model;
let isModelLoading = false;

async function loadModel() {
  if (model) return model;
  if (isModelLoading) {
    // Jika model sedang loading, tunggu sampai selesai
    return new Promise((resolve) => {
      const checkModel = () => {
        if (model) resolve(model);
        else setTimeout(checkModel, 100);
      };
      checkModel();
    });
  }

  try {
    isModelLoading = true;
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const modelUrl = `${baseUrl}/model/model.json`;
    console.log(`🚀 Loading model from: ${modelUrl}`);
    
    model = await tf.loadLayersModel(modelUrl);
    console.log("✅ Model loaded successfully!");
    return model;
  } catch (error) {
    console.error("❌ Model loading failed:", error);
    throw error;
  } finally {
    isModelLoading = false;
  }
}

export default async function handler(req, res) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length !== 11) {
      return res.status(400).json({ error: 'Input must be an array of 11 numbers' });
    }

    const model = await loadModel();
    const inputTensor = tf.tensor2d([data], [1, 11]);
    const outputTensor = model.predict(inputTensor);
    const prediction = (await outputTensor.data())[0];

    // Cleanup tensors
    tf.dispose([inputTensor, outputTensor]);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ 
      prediction: prediction,
      message: "Prediction successful" 
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack 
    });
  }
}