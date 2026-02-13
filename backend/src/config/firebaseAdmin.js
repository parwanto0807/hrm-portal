import admin from 'firebase-admin';
import config from './env.js';
import fs from 'fs';
import path from 'path';

let firebaseAdmin = null;

try {
    const serviceAccountPath = path.resolve('serviceAccount.json');
    
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

    } else if (process.env.FIREBASE_PROJECT_ID) {
        // Fallback to environment variables if available
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });

    } else {
        console.warn('⚠️ Firebase Admin NOT initialized: serviceAccount.json or environment variables missing');
    }
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
}

export default firebaseAdmin;
