importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBLzPKzbiNYitUz7sv9Ftqm0oF20rA32Zk",
    projectId: "asrar-bc059",
    messagingSenderId: "199810893447", // Votre Sender ID Firebase
    appId: "1:199810893447:android:044629472e10f9eb68da22"
});

const messaging = firebase.messaging();

// Gère l'affichage quand l'app est fermée
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png' // Ajoutez votre logo ici
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
