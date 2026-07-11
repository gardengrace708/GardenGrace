'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/notifications';

export default function NotificationPermission() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already been asked
    const hasAsked = localStorage.getItem('notification_permission_asked');
    const permission = Notification.permission;

    if (!hasAsked && permission === 'default') {
      // Show after a delay
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleEnable() {
    setLoading(true);
    const granted = await requestNotificationPermission();
    localStorage.setItem('notification_permission_asked', 'true');
    setLoading(false);
    setShow(false);

    if (granted) {
      // Save admin notification preference
      const isAdmin = localStorage.getItem('is_admin') === 'true';
      if (isAdmin) {
        localStorage.setItem('admin_notifications', 'true');
      }
    }
  }

  function handleDismiss() {
    localStorage.setItem('notification_permission_asked', 'true');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-surface border border-gold/30 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-ivory/60 hover:text-ivory transition"
        >
          <X size={20} />
        </button>
        <div className="pr-8">
          <h3 className="font-display text-xl text-gold mb-2">Enable Notifications</h3>
          <p className="text-sm text-ivory/80 mb-4">
            Get notified about your order status and updates. We&apos;ll also send you important updates about your orders.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 rounded-full bg-gold px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-ivory disabled:opacity-60"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-full border border-gold/40 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-gold transition hover:bg-gold/10"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
