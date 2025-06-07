# Hosting Model ML di Vercel & Konsumsi API

Panduan ini menjelaskan cara menghosting model Machine Learning (ML) TensorFlow.js di Vercel, membuat endpoint API, dan menambahkan frontend sederhana untuk pengecekan model.

---

## 1. Struktur Project

```
.
├── api/
│   └── predict.js       # Endpoint API ML (WAJIB)
├── public/
│   └── index.html       # (opsional, frontend statis)
├── tfjs_model/
│   ├── model.json
│   └── group1-shard1of1.bin
├── vercel.json
└── README.md
```

---

## 2. Deploy Model ML sebagai API di Vercel

1. **Siapkan file API**  
   Buat `api/predict.js` yang memuat dan menjalankan model ML (lihat contoh di bawah).
2. **Pastikan folder `tfjs_model`** (berisi `model.json` dan `.bin`) sudah ada di repo.
3. **Push ke GitHub** lalu import ke Vercel ([https://vercel.com/import](https://vercel.com/import)).
4. **Setelah deploy**, endpoint API bisa diakses di:  
   `https://your-vercel-app.vercel.app/api/predict`

---

## Setelah Deploy: Akses UI

Setelah proses deploy selesai, **akses root URL** aplikasi Vercel kamu, misal:

```
https://api-vercel-silk.vercel.app/
```

Jika konfigurasi sudah benar dan file `public/index.html` ada, maka halaman UI akan tampil.

---

## Troubleshooting (Jika Masih 404)

- Pastikan file `public/index.html` sudah ada dan ter-push ke repo.
- Pastikan struktur folder sesuai contoh di README.
- Pastikan `vercel.json` sudah seperti berikut:
  ```json
  {
    "version": 2,
    "builds": [
      { "src": "api/**/*.js", "use": "@vercel/node" }
    ],
    "routes": [
      { "src": "/api/(.*)", "dest": "/api/$1.js" },
      { "handle": "filesystem" },
      { "src": "/(.*)", "dest": "/public/index.html" }
    ]
  }
  ```
- Cek di dashboard Vercel pada tab "Files", pastikan file `public/index.html` muncul.
- Jika `/index.html` bisa diakses tapi `/` tidak, kemungkinan ada masalah pada routing.

---

## Cara Mengetes API

### 1. Menggunakan `curl` (Terminal/Command Prompt)

```sh
curl -X POST https://your-vercel-app.vercel.app/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"input\": [1,2,3,4,5,6,7,8,9,10,11]}"
```

### 2. Menggunakan Postman

- Pilih metode **POST**
- URL: `https://your-vercel-app.vercel.app/api/predict`
- Body: pilih **raw** dan **JSON**, lalu isi:
  ```json
  {
    "input": [1,2,3,4,5,6,7,8,9,10,11]
  }
  ```
- Klik **Send**.

### 3. Dari Frontend HTML

Buka file `public/index.html` di browser setelah deploy, masukkan 11 angka, klik **Cek Model**.

---

## 3. Contoh API Handler (`api/predict.js`)

```js
const tf = require('@tensorflow/tfjs-node');
let model;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  let body = req.body;
  if (!body) {
    try { body = JSON.parse(req.rawBody || '{}'); }
    catch { res.status(400).json({ error: 'Invalid JSON' }); return; }
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

---

## 4. Konsumsi API dari Website Lain

Contoh menggunakan `fetch` di JavaScript:

```js
fetch('https://your-vercel-app.vercel.app/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: [/* 11 angka */] })
})
  .then(res => res.json())
  .then(data => console.log('Prediction:', data));
```

---

## 5. Frontend Sederhana untuk Cek Model

Bisa menggunakan Next.js (`pages/index.js`) atau HTML statis (`public/index.html`).  
Contoh HTML (`public/index.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Cek Model ML</title>
</head>
<body>
  <h1>Cek Model ML di Vercel</h1>
  <input id="input" placeholder="1,2,3,4,5,6,7,8,9,10,11" />
  <button id="cek">Cek Model</button>
  <div id="result"></div>
  <script>
    document.getElementById('cek').onclick = async function() {
      const arr = document.getElementById('input').value.split(',').map(s => Number(s.trim()));
      if (arr.length !== 11 || arr.some(isNaN)) {
        alert('Input harus 11 angka, pisahkan dengan koma.');
        return;
      }
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: arr })
      });
      const data = await res.json();
      document.getElementById('result').innerText = 'Hasil Prediksi: ' + data.prediction;
    };
  </script>
</body>
</html>
```

---

## 6. Konfigurasi Vercel (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/.*", "dest": "/api/predict.js" },
    { "src": "/(.*)", "dest": "/public/$1" },
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/public/index.html" }
  ]
}
```

---

## 7. FAQ & Tips

- **Model harus format TensorFlow.js** (`model.json` + `.bin`), bukan `.h5`.
- **Tidak perlu build command/output directory** jika hanya API.
- **FastAPI (Python) tidak didukung** di Vercel.
- Untuk model besar, pertimbangkan platform lain (Railway, Render, dsb).
- **Cek log error** di dashboard Vercel jika API gagal.

---

## 8. Referensi

- [@tensorflow/tfjs-node](https://www.npmjs.com/package/@tensorflow/tfjs-node)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [TensorFlow.js Converter](https://www.tensorflow.org/js/tutorials/conversion/import_keras)

---