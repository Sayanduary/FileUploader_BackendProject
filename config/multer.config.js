const multer = require('multer');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('../drive-506c6-firebase-adminsdk-fbsvc-92febcb0da.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'drive-506c6.firebasestorage.app', // ✅ Ensure correct bucket name
  });
}

// Initialize Google Cloud Storage
const storage = new Storage({
  credentials: serviceAccount,
});
const bucket = storage.bucket('drive-506c6.firebasestorage.app'); // ✅ Correct bucket reference

// Multer setup for memory storage
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory before uploading
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Function to upload file to Firebase Storage
const uploadToFirebase = async (file) => {
  if (!file) throw new Error('No file provided');

  const uniqueFileName = `${Date.now()}-${file.originalname}`;
  const blob = bucket.file(uniqueFileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', async () => {
      // Generate a signed URL (valid for 1 year)
      const [url] = await blob.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      });
      resolve(url);
    });

    blobStream.on('error', (err) => reject(err));
    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToFirebase };
