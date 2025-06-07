import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.split(',').map(Number) }) // input berupa array angka
      });
      const data = await res.json();
      setResult(data.prediction);
    } catch (e) {
      setResult('Terjadi error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Cek Fungsi Model ML</h2>
      <p>Masukkan input (pisahkan dengan koma, contoh: 1,2,3,4,5,6,7,8,9,10,11):</p>
      <input
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="1,2,3,4,5,6,7,8,9,10,11"
      />
      <button onClick={handlePredict} disabled={loading || !input}>
        {loading ? 'Memproses...' : 'Cek Model'}
      </button>
      {result !== null && (
        <div style={{ marginTop: 16 }}>
          <b>Hasil Prediksi:</b> {String(result)}
        </div>
      )}
    </div>
  );
}
