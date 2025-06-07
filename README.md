# Hosting Model ML di Vercel & Konsumsi API dari Website Lain

Panduan ini menjelaskan cara menghosting model Machine Learning (ML) berbasis TensorFlow.js di Vercel, membuat endpoint API, serta menambahkan frontend sederhana untuk pengecekan model.

---

## 1. Struktur Project

```
.
├── api/
│   └── predict.js   # <--- WAJIB ADA untuk endpoint API ML di Vercel
├── pages/
│   └── index.js         # (opsional, untuk frontend Next.js)
├── tfjs_model/
│   ├── model.json
│   └── group1-shard1of1.bin
├── vercel.json
└── README.md
```

---

## 2. Langkah-langkah

### Langkah 1: Siapkan Model ML sebagai API
- Buat file API (misal: `api/predict.js`) di folder proyek Vercel Anda.
- Pastikan model ML dapat di-load dan menerima input melalui HTTP request (POST/GET).
- **Pastikan folder `tfjs_model` (berisi `model.json` dan `.bin`) sudah di-push ke GitHub.**

### Langkah 2: Deploy ke Vercel via GitHub
- Push seluruh kode (termasuk folder `tfjs_model`) ke repository GitHub Anda.
- Hubungkan repo ke Vercel melalui dashboard Vercel ([https://vercel.com/import](https://vercel.com/import)).
- Deploy dan dapatkan URL endpoint API, misal: `https://your-vercel-app.vercel.app/api/predict`.

### Langkah 3: Contoh API Handler di Vercel (`api/predict.js`)
```js
// ...c:\.Github_mhmdnvn18@gmail.com\API-VERCEL\api\predict.js...
const tf = require('@tensorflow/tfjs-node');
let model;

module.exports = async (req, res) => {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  // Parsing body & validasi input
  let body = req.body;
  if (!body) {
    try {
      body = JSON.parse(req.rawBody || '{}');
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }
  const input = body.input;
  if (!Array.isArray(input) || input.length !== 11) {
    res.status(400).json({ error: 'Input harus array dengan 11 angka.' });
    return;
  }
  if (!model) {
    model = await tf.loadLayersModel('file://tfjs_model/model.json');
  }
  const inputTensor = tf.tensor([input]);
  const prediction = model.predict(inputTensor);
  const result = prediction.dataSync();
  res.status(200).json({ prediction: result[0] });
};
```

### Langkah 4: Konsumsi API dari Website Lain
Contoh menggunakan fetch di JavaScript:
```js
fetch('https://your-vercel-app.vercel.app/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: [/* data_input */] })
})
  .then(res => res.json())
  .then(data => {
    console.log('Prediction:', data);
  });
```

---

## 3. Menambahkan Frontend untuk Cek Fungsi Model

- **Bisa!** Anda dapat menambahkan frontend (misal: folder `pages` untuk Next.js atau folder `public` untuk static HTML) di dalam project yang sama.
- Frontend ini bisa memanggil endpoint API (`/api/predict`) secara langsung tanpa CORS.

Contoh sederhana (Next.js, `pages/index.js`):
```js
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.split(',').map(Number) })
    });
    const data = await res.json();
    setResult(data.prediction);
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handlePredict}>Cek Model</button>
      {result !== null && <div>Hasil Prediksi: {result}</div>}
    </div>
  );
}
```
- Anda juga bisa menggunakan HTML/JS biasa di folder `public` dan memanggil API dengan `fetch` seperti contoh sebelumnya.

---

## 4. Konfigurasi Vercel

- Untuk project API Node.js (tanpa frontend), **tidak perlu mengatur Framework Preset, Build Command, atau Output Directory**.
- Root Directory cukup diisi `./` (default).
- Install Command otomatis (`npm install`), kecuali Anda ingin custom.
- Build Command **tidak perlu diisi** jika hanya menggunakan API (tidak ada proses build).
- Output Directory **tidak perlu diisi**.
- Variabel environment (`.env`) bisa diatur jika diperlukan.
- Pastikan file API (`api/predict.js`), folder `tfjs_model`, dan file `vercel.json` sudah ada di repo.

---

## 5. Catatan

- Pastikan model ML Anda ringan agar sesuai dengan batasan serverless Vercel.
- Untuk model besar, pertimbangkan menggunakan cloud function atau layanan lain.
- **File model yang digunakan tergantung framework:**
  - `.h5` biasanya untuk Keras/TensorFlow (Python).
  - `.json` dan `.bin` biasanya untuk model TensorFlow.js (JavaScript, di browser/server).
- Jika ingin menjalankan model di server (Node.js di Vercel), gunakan format yang didukung oleh library yang Anda pakai (misal: TensorFlow.js untuk `.json`+`.bin`, atau ONNX untuk model ONNX).

---

## 6. Saran Penggunaan File Model

- Jika ingin menjalankan model di Vercel menggunakan Node.js (JavaScript), **gunakan file `model.json` dan `group1-shard1of1.bin`** (format TensorFlow.js).
- **Letakkan file model di folder `tfjs_model`** di dalam proyek Anda.
- File `.h5` hanya bisa digunakan di lingkungan Python, bukan di Vercel serverless function berbasis Node.js.
- Jadi, untuk API di Vercel: **pakai `model.json` dan `.bin`** dengan library [@tensorflow/tfjs-node](https://www.npmjs.com/package/@tensorflow/tfjs-node) atau [@tensorflow/tfjs](https://www.npmjs.com/package/@tensorflow/tfjs).
- Saat load model di API, gunakan path relatif:  
  ```js
  const tf = require('@tensorflow/tfjs-node');
  const model = await tf.loadLayersModel('file://tfjs_model/model.json');
  ```

---

## 7. Framework yang Digunakan

- Model dengan file `model.json` dan `.bin` adalah hasil konversi dari Keras/TensorFlow ke **TensorFlow.js**.
- Untuk menjalankan di Vercel (Node.js), gunakan framework **TensorFlow.js** (bukan Keras/TensorFlow Python).
- **Bukan Hapi**: Anda tidak perlu menggunakan framework Hapi. Cukup gunakan handler API standar (misal: `export default function handler(req, res) { ... }`) di Vercel, lalu load model dengan TensorFlow.js.

---

## 8. FAQ

### Apakah setelah deploy di Vercel, API bisa langsung digunakan?
**Ya,** jika semua file sudah di-push ke GitHub (termasuk folder `tfjs_model` dan file konfigurasi seperti `vercel.json`), serta kode API handler sudah benar, maka setelah deploy di Vercel, endpoint API (misal: `https://your-vercel-app.vercel.app/api/predict`) bisa langsung diakses/digunakan dari website lain.

### Apakah Bisa Menggunakan FastAPI?
- **Tidak bisa di Vercel:** Vercel hanya mendukung serverless API berbasis Node.js (JavaScript/TypeScript), bukan Python.
- Jika ingin menggunakan **FastAPI (Python)**, Anda harus deploy di platform lain seperti [Railway](https://railway.app/), [Render](https://render.com/), [Heroku](https://heroku.com/), atau VPS yang mendukung Python.
- Untuk Vercel, gunakan handler API Node.js dan TensorFlow.js seperti contoh di atas.

---