
import firebaseAdmin from './src/config/firebaseAdmin.js';

console.log('--- Firebase Admin Check ---');
    if (firebaseAdmin) {
    console.log('✅ Firebase Admin is initialized.');
    try {
        console.log('   App Name:', firebaseAdmin.name);
        console.log('   Project ID:', firebaseAdmin.options.credential.projectId);
    } catch (e) {
        console.error('   ❌ Error accessing app details:', e.message);
    }
} else {
    console.error('❌ Firebase Admin is NOT initialized.');
    console.log('   Checking Environment Variables:');
    console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing');
    console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Missing');
}
console.log('----------------------------');
