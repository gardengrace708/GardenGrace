'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Authentication failed');
      setLoading(false);
      return;
    }

    router.push(data.user?.user === 1 ? '/admin' : '/');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-obsidian via-stone-950 to-black pt-32 text-ivory">
      <section className="luxury-container flex justify-center py-16">
        <form onSubmit={submit} className="w-full max-w-lg rounded-[2rem] border border-wood/25 bg-surface/95 p-8 text-ivory shadow-2xl shadow-black/40 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">GardenGrace Account</p>
          <h1 className="mt-3 font-display text-6xl text-ivory">{isRegister ? 'Register' : 'Login'}</h1>
          <p className="mt-3 text-sm leading-6 text-ivory/65">{isRegister ? 'Create your customer account to track orders and save your details.' : 'Welcome back. Login to view your profile and order history.'}</p>
          <div className="mt-8 space-y-4">
            {isRegister && <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required placeholder="Full name" className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-wood focus:ring-2 focus:ring-wood/30" />}
            <input value={form.email} onChange={(event) => updateField('email', event.target.value)} required type="email" placeholder="Email address" className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-wood focus:ring-2 focus:ring-wood/30" />
            <input value={form.password} onChange={(event) => updateField('password', event.target.value)} required type="password" placeholder="Password" className="w-full rounded-2xl border border-ivory/10 bg-ivory px-4 py-3 text-obsidian placeholder:text-obsidian/45 outline-none transition focus:border-wood focus:ring-2 focus:ring-wood/30" />
            <button disabled={loading} className="w-full rounded-full bg-wood px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-ivory disabled:opacity-60">{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}</button>
            {message && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200">{message}</p>}
          </div>
          <p className="mt-6 text-center text-sm text-ivory/70">{isRegister ? 'Already have an account?' : 'New customer?'} <a className="font-bold text-wood underline underline-offset-4" href={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Register'}</a></p>
        </form>
      </section>
    </main>
  );
}
