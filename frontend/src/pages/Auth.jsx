import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { BRAND } from "@/lib/config";

const field =
  "w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500";

export default function Auth({ mode = "login" }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-28">
      <div className="hero-gradient absolute inset-0 opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-8 backdrop-blur-xl"
        data-testid="auth-card"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-3">
          <img src={BRAND.logo} alt="BookMyHomez" className="h-12 w-12 rounded-xl bg-white object-contain p-0.5" />
        </Link>
        <h1 className="text-center font-display text-3xl font-semibold text-white">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isLogin ? "Log in to manage your listings & leads" : "List and manage your properties for free"}
        </p>

        <button
          onClick={googleLogin}
          data-testid="google-login-btn"
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white py-3 font-medium text-slate-800 transition-transform duration-200 hover:bg-slate-100 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-white/10" /> OR <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input data-testid="auth-name" className={field} placeholder="Full name" value={form.name} onChange={set("name")} required />
            </div>
          )}
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input data-testid="auth-email" type="email" className={field} placeholder="Email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input data-testid="auth-password" type="password" className={field} placeholder="Password" value={form.password} onChange={set("password")} required minLength={6} />
          </div>
          <button
            type="submit"
            data-testid="auth-submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 font-semibold text-white transition-transform duration-200 hover:bg-indigo-500 active:scale-95 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {isLogin ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "New to BookMyHomez? " : "Already have an account? "}
          <Link
            data-testid="auth-toggle"
            to={isLogin ? "/register" : "/login"}
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            {isLogin ? "Create account" : "Log in"}
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
