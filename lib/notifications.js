export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
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
}

export function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
}

export function showOrderNotification(orderNumber, total) {
  showNotification('🎉 Order Placed Successfully!', {
    body: `Order #${orderNumber} - Total: ${total}. Thank you for shopping with MAKHSOOS!`,
    tag: orderNumber,
    requireInteraction: true
  });
}

export function showAdminNotification(orderNumber, customerName, total) {
  showNotification('📦 New Order Received!', {
    body: `Order #${orderNumber} from ${customerName} - Total: ${total}`,
    tag: orderNumber,
    requireInteraction: true
  });
}
