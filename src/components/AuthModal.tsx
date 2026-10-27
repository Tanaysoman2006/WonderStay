import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { User } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onAuthenticate: (
    mode: 'login' | 'register',
    credentials: { name: string; email: string; password: string; role: 'guest' | 'host' }
  ) => Promise<User>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onAuthenticate
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    } else {
      setPassword('');
      setError('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onAuthenticate(mode, { name, email, password, role });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 id="auth-modal-title" className="text-base font-bold text-neutral-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {mode === 'register' && (
            <>
              <label className="block text-xs font-semibold text-neutral-700">
                Full name
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </label>
              <label className="block text-xs font-semibold text-neutral-700">
                Account type
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as 'guest' | 'host')}
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="guest">Guest</option>
                  <option value="host">Host</option>
                </select>
              </label>
            </>
          )}

          <label className="block text-xs font-semibold text-neutral-700">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
          <label className="block text-xs font-semibold text-neutral-700">
            Password
            <input
              required
              type="password"
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {mode === 'register' && (
              <span className="mt-1 block font-normal text-neutral-500">Use at least 8 characters.</span>
            )}
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-center text-xs text-neutral-600">
            {mode === 'login' ? 'New to WonderStay?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-neutral-900 underline underline-offset-2"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
};
