import React, { useState } from 'react';
import { Zap, Lock, User, Languages, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t.login.errorEmpty);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ok = await login(username.trim(), password.trim());
      if (!ok) {
        setError(language === 'fa' ? 'نام کاربری یا رمز عبور اشتباه است' : 'Invalid credentials. Please try again.');
      }
    } catch {
      setError(language === 'fa' ? 'خطا در برقراری ارتباط با سرور' : 'Connection error to Smite backend');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Language Switch Top Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition backdrop-blur-md"
        >
          <Languages className="h-4 w-4 text-cyan-400" />
          <span>{language === 'fa' ? 'English' : 'فارسی'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-xl shadow-blue-600/30 ring-1 ring-white/20 mb-3">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">SMITE</h1>
          <p className="text-xs text-slate-400 mt-1">{t.login.subtitle}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.login.username}
            </label>
            <div className="relative">
              <User className="absolute top-3 start-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 ps-10 pe-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.login.password}
            </label>
            <div className="relative">
              <Lock className="absolute top-3 start-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 ps-10 pe-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50"
          >
            <span>{loading ? '...' : t.login.submit}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Quick-Fill Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            {t.login.demoNote}{' '}
            <button
              onClick={handleFillDemo}
              className="text-blue-400 font-semibold hover:underline"
            >
              {t.login.demoHint}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
