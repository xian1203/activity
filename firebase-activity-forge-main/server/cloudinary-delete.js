const express = require('express');
const { v2 as cloudinary } = require('cloudinary');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dz4uwpgoi',
  api_key: '158285269785293',
  api_secret: 'mhX_u-fp8tgIYgu4S-eEVc_XaDY',
});

// Cloudinary delete endpoint
app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({ 
      success: true, 
      result: result.result 
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cloudinary delete server is running' });
});

app.listen(PORT, () => {
  console.log(`Cloudinary delete server running on port ${PORT}`);
});

module.exports = app;
