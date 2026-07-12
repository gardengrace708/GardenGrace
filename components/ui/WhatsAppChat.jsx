'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '923280362181';

export default function WhatsAppChat() {
  const handleClick = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your products.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-green-600 hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} />
      <span className="hidden">Chat on WhatsApp</span>
    </button>
  );
}
