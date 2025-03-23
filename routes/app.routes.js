const express = require('express');
const { upload, uploadToFirebase } = require('../config/multer.config.js'); // Import multer config
const router = express.Router();
const auth = require('../middlewares/auth.js')
router.get('/home', auth, (req, res) => {
  res.render('home');
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Firebase Storage
    const fileUrl = await uploadToFirebase(req.file);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl, // Return the file URL
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
