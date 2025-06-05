# API Model Deployment with Vercel

Panduan untuk mendeploy model TensorFlow.js sebagai API di Vercel.

## Prasyarat

- Node.js & npm
- Akun Vercel (https://vercel.com/)
- Folder `model` berisi `model.json` dan file `.bin` hasil konversi TensorFlow.js

> **Penting:**  
> Pastikan file `package.json` memiliki bagian berikut agar Vercel menggunakan Node.js versi 22:  
> ```json
>   "engines": {
>     "node": "22.x"
>   }
> ```
> Jika tidak, build akan gagal.

## Langkah Deploy

1. **Clone repository ini**  
   ```bash
   git clone <repo-anda>
   cd API-VERCEL
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Pastikan struktur folder seperti berikut:**  
   ```
   API-VERCEL/
   ├── api/
   │   └── predict.js
   ├── model/
   │   ├── model.json
   │   └── group1-shard1of1.bin
   ├── package.json
   └── README.md
   ```

4. **Deploy ke Vercel**  
   - Login ke Vercel:
     ```bash
     npx vercel login
     ```
   - Deploy:
     ```bash
     npx vercel --prod
     ```

## Cara Menggunakan API

- Endpoint: `POST https://<your-vercel-domain>/api/predict`
- Body (JSON):
  ```json
  {
    "input": [angka1, angka2, ..., angka11]
  }
  ```
- Response:
  ```json
  {
    "prediction": [[hasil_prediksi]]
  }
  ```

## Catatan

- Pastikan input berupa array dengan 11 angka.
- Model hanya diload sekali saat API pertama dipanggil (caching).
- Untuk update model, cukup ganti file di folder `model` lalu redeploy.

---
