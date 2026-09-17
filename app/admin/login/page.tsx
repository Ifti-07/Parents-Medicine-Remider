'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('ব্যবহারকারীর নাম এবং পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('সংযোগ সমস্যা। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin লগইন</h1>
          <p className="text-base text-slate-500 mt-1">পরিচালনা প্যানেলে প্রবেশ করুন</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-base font-semibold text-slate-700 mb-2">
              ব্যবহারকারীর নাম
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-semibold text-slate-700 mb-2">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-required="true"
                className="pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              role="alert"
              aria-live="polite"
            >
              <p className="text-base text-red-700 font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                লগইন হচ্ছে...
              </span>
            ) : (
              'লগইন করুন'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          পিছনে যেতে{' '}
          <a href="/" className="text-blue-600 underline font-medium">
            হোমে যান
          </a>
        </p>
      </div>
    </div>
  );
}
