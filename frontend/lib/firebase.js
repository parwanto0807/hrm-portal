import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { api } from '@/lib/api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

// Messaging setup
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('Push notifications not supported in this browser');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey || vapidKey === 'YOUR_PUBLIC_VAPID_KEY') {
        console.warn('⚠️ Push notification skipped: VAPID Key (NEXT_PUBLIC_FIREBASE_VAPID_KEY) is not set in .env');
        return;
      }

      const token = await getToken(messaging, { 
        vapidKey: vapidKey
      });
      
      if (token) {
        console.log('✅ FCM Token generated successfully');
        
        // Prevent 401 loop: Only send to backend if we have an access token
        const accessToken = localStorage.getItem('hrm_access_token');
        if (accessToken) {
            // Send token to backend using our api helper
            await api.post('/users/fcm-token', { fcmToken: token });
        } else {
            console.log('⚠️ User not authenticated, skipping FCM token sync');
        }
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const onMessageListener = (callback) => {
  if (typeof window !== 'undefined') {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      if (callback) callback(payload);
    });
  }
  return () => {};
};