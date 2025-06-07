import * as tf from '@tensorflow/tfjs';
// Hapus import berikut karena @tensorflow/tfjs-node tidak didukung di Vercel
// import { loadLayersModel } from '@tensorflow/tfjs-node';

export default async function handler(req, res) {
  try {
    // Gunakan path relatif tanpa 'file://' agar bisa diakses di Vercel
    const model = await tf.loadLayersModel('model/model.json');
    // Proses input dan prediksi
    const input = req.body.input;
    const prediction = model.predict(tf.tensor(input));
    res.status(200).json({ prediction: Array.from(prediction.dataSync()) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}