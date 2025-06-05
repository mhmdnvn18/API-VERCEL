import * as tf from '@tensorflow/tfjs-node';
import path from 'path';

let model = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Load model once (caching)
  if (!model) {
    const modelPath = 'file://' + path.join(process.cwd(), 'model', 'model.json');
    model = await tf.loadLayersModel(modelPath);
  }

  const { input } = req.body;
  if (!input || !Array.isArray(input) || input.length !== 11) {
    res.status(400).json({ error: 'Input must be an array of 11 numbers' });
    return;
  }

  // Preprocess input
  const inputTensor = tf.tensor([input]);
  const prediction = model.predict(inputTensor);
  const output = prediction.arraySync();

  res.status(200).json({ prediction: output });
}
