const tf = require('@tensorflow/tfjs-node');
let model;

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Parse body if not already parsed (Vercel Node API: req.body bisa undefined)
  let body = req.body;
  if (!body) {
    try {
      body = JSON.parse(req.rawBody || '{}');
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }

  try {
    const input = body.input;
    if (!Array.isArray(input) || input.length !== 11 || input.some(x => typeof x !== 'number' || isNaN(x))) {
      res.status(400).json({ error: 'Input harus array dengan 11 angka.' });
      return;
    }

    if (!model) {
      model = await tf.loadLayersModel('file://tfjs_model/model.json');
    }
    const inputTensor = tf.tensor([input]);
    const prediction = model.predict(inputTensor);
    const result = await prediction.data(); // async, lebih baik untuk serverless
    res.status(200).json({ prediction: result[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};
