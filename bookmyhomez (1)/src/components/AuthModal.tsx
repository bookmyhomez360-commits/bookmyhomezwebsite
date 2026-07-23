import React, { useState } from 'react';
import { User, GoogleAccount } from '../types';
import {
  X,
  Lock,
  ArrowLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  googleAccounts: GoogleAccount[];
  registeredUsers: (User & { password?: string })[];
  onClose: () => void;
  onSelectGoogleAccount: (acc: GoogleAccount) => void;
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (user: User & { password?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  googleAccounts,
  registeredUsers,
  onClose,
  onSelectGoogleAccount,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleError, setGoogleError] = useState('');

  if (!isOpen) return null;

  const handleEmailLogin = () => {
    setAuthError('');
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanPassword = authPassword.trim();

    const emailMatch = registeredUsers.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );

    if (!emailMatch) {
      // Auto register if account doesn't exist yet
      const newUser: User & { password?: string } = {
        id: 'usr_' + Date.now(),
        name: authEmail.split('@')[0],
        email: authEmail.trim(),
        password: cleanPassword,
        role: 'Verified Owner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }

      onLoginSuccess({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      });
      setAuthEmail('');
      setAuthPassword('');
      onClose();
      return;
    }

    if (emailMatch.password && emailMatch.password.trim() !== cleanPassword) {
      setAuthError('Incorrect password. Please verify your password and try again.');
      return;
    }

    onLoginSuccess({
      id: emailMatch.id,
      name: emailMatch.name,
      email: emailMatch.email,
      role: emailMatch.role,
      avatar: emailMatch.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    });
    setAuthEmail('');
    setAuthPassword('');
    onClose();
  };

  const handleEmailRegister = () => {
    setAuthError('');
    if (!authEmail.trim() || !authPassword.trim() || authPassword.trim().length < 6) {
      setAuthError('Enter a valid email and a password of at least 6 characters.');
      return;
    }

    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanPassword = authPassword.trim();

    const exists = registeredUsers.some(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );

    if (exists) {
      setAuthError('Email already registered. Signing in with your password...');
      handleEmailLogin();
      return;
    }

    const newUser: User & { password?: string } = {
      id: 'usr_' + Date.now(),
      name: authEmail.split('@')[0],
      email: authEmail.trim(),
      password: cleanPassword,
      role: 'Verified Owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    onLoginSuccess({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    });
    setAuthEmail('');
    setAuthPassword('');
    onClose();
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError('');

    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setGoogleError('Please enter a valid Gmail / Google email address.');
      return;
    }

    const name = googleNameInput.trim() || googleEmailInput.split('@')[0];
    const newAcc: GoogleAccount = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: googleEmailInput.trim().toLowerCase(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };

    onSelectGoogleAccount(newAcc);
    setGoogleEmailInput('');
    setGoogleNameInput('');
    setShowGooglePopup(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setShowGooglePopup(false);
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!showGooglePopup ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl mx-auto flex items-center justify-center text-xl mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Sign in to BookMyHomez
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide correct mail & password or use Google Sign-In
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowGooglePopup(true)}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-3 transition shadow-lg cursor-pointer border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.19v3.15C3.17 21.32 7.23 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.09-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.6l4.09 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500">
                  Or with Email & Password
                </span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-400 font-semibold text-center">
                  {authError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEmailLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-3 rounded-xl text-xs transition shadow-lg cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={handleEmailRegister}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-3 rounded-xl text-xs transition border border-slate-700 cursor-pointer"
                >
                  Register New
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-10 h-10 bg-white rounded-xl mx-auto flex items-center justify-center text-lg mb-2 shadow border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.19v3.15C3.17 21.32 7.23 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.09-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.6l4.09 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-black text-white">Sign in with Google</h3>
              <p className="text-[11px] text-slate-400">Enter your Google email account to continue</p>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Google Email / Gmail
                </label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {googleError && (
                <p className="text-xs text-rose-400 font-semibold text-center">
                  {googleError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer mt-2"
              >
                <span>Continue with Google Account</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 flex justify-between items-center text-[11px] border-t border-slate-800">
              <button
                onClick={() => setShowGooglePopup(false)}
                className="text-slate-400 hover:text-white cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <span className="text-slate-500">Google OAuth 2.0</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
