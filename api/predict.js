import * as tf from '@tensorflow/tfjs';
// Hapus import berikut karena @tensorflow/tfjs-node tidak didukung di Vercel
// import { loadLayersModel } from '@tensorflow/tfjs-node';

export default async function handler(req, res) {
  try {
    const model = await tf.loadLayersModel('https://'+req.headers.host+'/model/model.json');
    const input = req.body.input;
    
    const inputTensor = tf.tensor(input).reshape([-1, 11]);
    const prediction = model.predict(inputTensor);
    const predictionData = await prediction.data(); // Get data before disposal
    
    inputTensor.dispose();
    prediction.dispose();
    
    res.status(200).json({ prediction: Array.from(predictionData) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}