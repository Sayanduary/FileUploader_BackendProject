const admin = require('firebase-admin');
const serviceAccount = require('../drive-506c6-firebase-adminsdk-fbsvc-92febcb0da.json');

// Initialize Firebase Admin SDK only if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'drive-506c6.firebasestorage.app',
    unique: true, // ✅ Correct format
  });
}

// Use Firebase Admin SDK to get Storage bucket
const bucket = admin.storage().bucket(); // ✅ No need for separate Storage initialization

module.exports = { bucket };
