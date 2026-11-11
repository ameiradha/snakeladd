import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../services/firebaseService';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck, X, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowDomainHelp(false);

    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const msg = err.message || String(err);
      setErrorMessage(msg);

      if (
        msg.includes('popup') ||
        msg.includes('closed') ||
        msg.includes('unauthorized') ||
        msg.includes('domain') ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/unauthorized-domain'
      ) {
        setShowDomainHelp(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Sila masukkan emel dan katalaluan.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Katalaluan mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let friendlyMsg = err.message || 'Gagal log masuk dengan emel.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        friendlyMsg = 'Emel atau katalaluan tidak sah. Sila semak semula.';
      } else if (err?.code === 'auth/email-already-in-use') {
        friendlyMsg = 'Emel ini telah berdaftar. Sila tukar ke tab Log Masuk.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        friendlyMsg = 'Penyedia Emel/Katalaluan belum diaktifkan di Firebase Console. Sila aktifkan di Firebase Console > Authentication > Sign-in method.';
      }
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">
              {mode === 'login' ? 'Log Masuk Akaun Guru' : 'Daftar Akaun Baruan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Quick Google Sign In */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 rounded-2xl font-bold text-sm shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Log Masuk Guna Akaun Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">
              atau Guna Emel
            </span>
          </div>

          {/* Error Message & Domain Guide */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
              <div className="flex items-start gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {showDomainHelp && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <ExternalLink className="w-4 h-4 text-amber-700" />
                <span>Panduan Kebenaran Domain Firebase:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800">
                Popup Google tertutup kerana pelayar menghalang tetingkap pop-up atau domain aplikasi belum didaftarkan di Firebase Console.
              </p>
              <div className="bg-white p-2 rounded-xl border border-amber-200 font-mono text-[10px] break-all text-slate-800 font-bold select-all">
                {currentHost}
              </div>
              <p className="text-[10px] text-amber-800">
                Sila tambah domain di atas ke <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>, atau gunakan <strong>Log Masuk Emel &amp; Katalaluan</strong> di bawah.
              </p>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alamat Emel (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Katalaluan (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{mode === 'login' ? 'Log Masuk Emel' : 'Daftar Akaun Baru'}</span>
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center pt-2 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500 font-medium">
                Belum ada akaun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-amber-600 font-extrabold hover:underline cursor-pointer"
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Sudah ada akaun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-amber-600 font-extrabold hover:underline cursor-pointer"
                >
                  Log masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
