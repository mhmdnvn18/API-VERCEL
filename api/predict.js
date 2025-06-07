import * as tf from '@tensorflow/tfjs';
// Hapus import berikut karena @tensorflow/tfjs-node tidak didukung di Vercel
// import { loadLayersModel } from '@tensorflow/tfjs-node';

export default async function handler(req, res) {
  try {
    // Gunakan path relatif tanpa 'file://' agar bisa diakses di Vercel
    const model = await tf.loadLayersModel('https://'+req.headers.host+'/model/model.json');
    // Proses input dan prediksi
    const input = req.body.input;
    
    // Pastikan input berbentuk [jumlah_sample, 11]
    const inputTensor = tf.tensor(input).reshape([-1, 11]);
    const prediction = model.predict(inputTensor);
    const predictionData = await prediction.data(); // ambil data sebelum dispose
    
    // Bersihkan tensor setelah digunakan
    inputTensor.dispose();
    prediction.dispose();
    res.status(200).json({ prediction: Array.from(predictionData) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}