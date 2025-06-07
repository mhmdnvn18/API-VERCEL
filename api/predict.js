import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';

let model;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadModel() {
  if (!model) {
    const modelPath = 'file://' + path.join(__dirname, '..', 'model', 'model.json');
    model = await tf.loadLayersModel(modelPath);
    console.log("✅ Model loaded!");
  }
  return model;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const input = req.body.data;

    if (!Array.isArray(input) || input.length !== 11) {
      return res.status(400).json({ error: 'Input must be an array of 11 numbers.' });
    }

    const model = await loadModel();
    const inputTensor = tf.tensor2d([input], [1, 11]);
    const outputTensor = model.predict(inputTensor);
    const prediction = await outputTensor.data();

    res.status(200).json({ prediction: prediction[0] });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
