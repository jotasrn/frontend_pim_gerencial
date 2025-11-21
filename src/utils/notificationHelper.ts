// src/utils/notificationHelper.ts

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações desktop/mobile.');
        return;
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
    }
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body,
                    icon: '/pwa-192x192.png',
                    vibrate: [200, 100, 200],
                    tag: 'nova-entrega'
                } as NotificationOptions);
            });
        } else {
            new Notification(title, {
                body,
                icon: '/pwa-192x192.png',
            });
        }
    }
};