import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { siteConfig } from '@/config/site';
import { images } from '@/data/images';
import { Logo } from '@/components/ui/Logo';
import { SmartImage } from '@/components/ui/SmartImage';

export function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
    else setError('Incorrect email or password. Use the demo login below.');
  };

  const useDemo = () => {
    setEmail(siteConfig.demoAdmin.email);
    setPassword(siteConfig.demoAdmin.password);
    setError('');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <SmartImage src={images.heroSpread} alt="Monica's Kitchen" wrapperClassName="absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <h2 className="text-5xl leading-tight font-bold text-white">
              Run your kitchen <br />
              <span className="text-brand-400 italic">from one place.</span>
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Track orders in real time, update your menu in seconds and see exactly how your business is doing.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-cream-50 px-6 py-10 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-auto w-full max-w-sm py-12"
        >
          <h1 className="text-4xl font-bold">Welcome back 👋</h1>
          <p className="mt-2 text-ink-600">Sign in to manage Monica's Kitchen.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" />
                <input className="input pl-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </label>
            <label className="block">
              <span className="label">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500" />
                <input className="input px-11" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-ink-500" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            <button className="btn-primary w-full py-3.5" disabled={loading}>
              {loading ? <Loader2 className="size-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-800">
              <KeyRound className="size-4" /> Demo access
            </p>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex gap-2"><dt className="text-ink-500">Email:</dt><dd className="font-mono text-ink-900">{siteConfig.demoAdmin.email}</dd></div>
              <div className="flex gap-2"><dt className="text-ink-500">Password:</dt><dd className="font-mono text-ink-900">{siteConfig.demoAdmin.password}</dd></div>
            </dl>
            <button type="button" onClick={useDemo} className="btn-dark mt-4 w-full py-2.5">
              Fill demo login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
