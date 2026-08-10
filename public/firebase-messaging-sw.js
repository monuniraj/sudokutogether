// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker.
firebase.initializeApp({
  apiKey: "AIzaSyB0Jdg1RBxsEUTyoWFnEdRm-XcjoA6gFDc",
  authDomain: "sudoku-together-mode.firebaseapp.com",
  projectId: "sudoku-together-mode",
  storageBucket: "sudoku-together-mode.firebasestorage.app",
  messagingSenderId: "116330285995",
  appId: "1:116330285995:web:3640f3df0d5dc1f73ce0ee",
  measurementId: "G-NKRBL6CL4M"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Sudoku Invite';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new game invitation!',
    icon: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle tap on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  const gameId = data?.gameId;
  const password = data?.password || '';
  const senderName = data?.senderName || 'Player';
  
  let targetUrl = '/';
  if (gameId) {
    targetUrl = `/?challenge=${gameId}&pw=${password}&sender=${encodeURIComponent(senderName)}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and redirect
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.postMessage({ type: 'navigate_invite', gameId, password, senderName });
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
