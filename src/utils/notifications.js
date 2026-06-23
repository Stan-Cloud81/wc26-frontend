import api from './api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const subscribeToPushNotifications = async (userId) => {
  try {
    console.log('[Notifications] Starting subscription for user:', userId);
    console.log('[Notifications] User agent:', navigator.userAgent);
    console.log('[Notifications] Browser:', {
      vendor: navigator.vendor,
      platform: navigator.platform,
      language: navigator.language
    });
    
    if (!('serviceWorker' in navigator)) {
      console.error('[Notifications] Service workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.error('[Notifications] Push messaging not supported');
      return false;
    }
    
    console.log('[Notifications] Checking push manager permissions...');
    try {
      const permissionState = await navigator.permissions.query({ name: 'notifications' });
      console.log('[Notifications] Permission state:', permissionState.state);
    } catch (e) {
      console.log('[Notifications] Could not query permission state:', e);
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('[Notifications] Permission denied');
      return false;
    }
    console.log('[Notifications] Permission granted');

    console.log('[Notifications] Waiting for service worker...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Notifications] Service worker ready');

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[Notifications] Found existing subscription, saving to backend...');
      const saveResponse = await api.post('/notifications/subscribe', {
        userId,
        subscription: JSON.stringify(existingSubscription)
      });
      console.log('[Notifications] Save response:', saveResponse.data);
      return true;
    }

    console.log('[Notifications] Fetching VAPID public key...');
    const response = await api.get('/notifications/vapid-public-key');
    const vapidPublicKey = response.data.publicKey;
    console.log('[Notifications] Got VAPID key:', vapidPublicKey);
    console.log('[Notifications] VAPID key length:', vapidPublicKey.length);
    
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    console.log('[Notifications] Converted VAPID key length:', convertedVapidKey.length);

    console.log('[Notifications] Creating new subscription...');
    console.log('[Notifications] This may take a while, please wait...');
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    
    console.log('[Notifications] Subscription created:', subscription);
    console.log('[Notifications] Subscription endpoint:', subscription.endpoint);
    console.log('[Notifications] Subscription keys:', subscription.getKey ? 'present' : 'missing');

    console.log('[Notifications] Saving subscription to backend...');
    const saveResponse = await api.post('/notifications/subscribe', {
      userId,
      subscription: JSON.stringify(subscription)
    });
    console.log('[Notifications] Save response:', saveResponse.data);

    console.log('[Notifications] Push notification subscription successful!');
    return true;
  } catch (error) {
    console.error('[Notifications] Failed to subscribe:', error);
    console.error('[Notifications] Error details:', error.message, error.stack);
    return false;
  }
};

export const unsubscribeFromPushNotifications = async (userId) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await api.post('/notifications/unsubscribe', { userId });
      console.log('Push notification unsubscription successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
};
