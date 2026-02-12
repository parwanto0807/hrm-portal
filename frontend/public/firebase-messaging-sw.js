importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAl_-3PCnBqIwNVCerInTqVXVXOC8lUlZk",
  authDomain: "axon-hrm.firebaseapp.com",
  projectId: "axon-hrm",
  storageBucket: "axon-hrm.firebasestorage.app",
  messagingSenderId: "215533099525",
  appId: "1:215533099525:web:e9c91e7eaa74bdbfcd5a6c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Make sure you have an icon or use a generic one
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
