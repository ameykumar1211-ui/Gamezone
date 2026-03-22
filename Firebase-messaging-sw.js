// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// Your exact Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBMB5yyQD_1MAA6dYxLgXy-tCgxTJaCa10",
    authDomain: "gaming-zone-23648.firebaseapp.com",
    projectId: "gaming-zone-23648",
    storageBucket: "gaming-zone-23648.firebasestorage.app",
    messagingSenderId: "1096819067201",
    appId: "1:1096819067201:web:57c08fd4072accce93f9c0",
    measurementId: "G-F0DQ4DVMRN"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
        vibrate: [500, 250, 500, 250, 500],
        requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click notification to open app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.matchAll({ type: 'window' }).then( windowClients => {
        if(windowClients.length > 0) return windowClients[0].focus();
        return clients.openWindow('/');
    }));
});
