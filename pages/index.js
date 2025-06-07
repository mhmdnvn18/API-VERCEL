import { useState, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    const arr = input.split(',').map(s => Number(s.trim()));
    if (arr.length !== 11 || arr.some(isNaN)) {
      setError('Input harus 11 angka, pisahkan dengan koma.');
      setLoading(false);
      inputRef.current && inputRef.current.focus();
      return;
    }
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: arr }) // input berupa array angka
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setResult(data.prediction);
        // Bersihkan input jika ingin UX lebih baik
        // setInput('');
      }
    } catch (e) {
      setError('Terjadi error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Cek Fungsi Model ML</h2>
      <p>Masukkan input (pisahkan dengan koma, contoh: 1,2,3,4,5,6,7,8,9,10,11):</p>
      <input
        ref={inputRef}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
        value={input}
        onChange={e => {
          // Validasi hanya angka, koma, dan spasi
          const val = e.target.value.replace(/[^0-9,\s]/g, '');
          setInput(val);
          setResult(null);
          setError('');
        }}
        placeholder="1,2,3,4,5,6,7,8,9,10,11"
      />
      <button onClick={handlePredict} disabled={loading || !input}>
        {loading ? 'Memproses...' : 'Cek Model'}
      </button>
      {loading && (
        <div style={{ marginTop: 8 }}>Loading...</div>
      )}
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      )}
      {result !== null && (
        <div style={{ marginTop: 16 }}>
          <b>Hasil Prediksi:</b> {String(result)}
        </div>
      )}
    </div>
  );
}
