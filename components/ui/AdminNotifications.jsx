'use client';

import { useState, useEffect } from 'react';
import { showAdminNotification } from '@/lib/notifications';
import { formatPrice } from '@/lib/utils';

export default function AdminNotifications() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsAdmin(data.user?.user === 1);
        
        // Check if admin notifications are enabled
        const notificationsEnabled = localStorage.getItem('admin_notifications') === 'true';
        setEnabled(notificationsEnabled);
        
        // Get last check time
        const savedLastCheck = localStorage.getItem('admin_last_check');
        setLastCheck(savedLastCheck ? new Date(savedLastCheck) : new Date());
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin || !enabled) return;

    // Poll for new orders every 30 seconds
    const interval = setInterval(async () => {
      try {
        const since = lastCheck ? lastCheck.toISOString() : new Date(Date.now() - 60000).toISOString();
        const res = await fetch(`/api/admin/new-orders?since=${since}`);
        const data = await res.json();

        if (data.orders && data.orders.length > 0) {
          // Show notification for each new order
          data.orders.forEach(order => {
            showAdminNotification(
              order.id,
              order.shippingAddress?.name || 'Customer',
              formatPrice(order.total)
            );
          });

          // Update last check time
          const newLastCheck = new Date();
          setLastCheck(newLastCheck);
          localStorage.setItem('admin_last_check', newLastCheck.toISOString());
        }
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, enabled, lastCheck]);

  // Toggle admin notifications
  const toggleNotifications = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('admin_notifications', newState.toString());
  };

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={toggleNotifications}
        className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] transition ${
          enabled
            ? 'bg-wood text-obsidian'
            : 'bg-surface border border-wood/40 text-wood'
        }`}
        title={enabled ? 'Disable admin notifications' : 'Enable admin notifications'}
      >
        {enabled ? '🔔 Admin On' : '🔕 Admin Off'}
      </button>
    </div>
  );
}
