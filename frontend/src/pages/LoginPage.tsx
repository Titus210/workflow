import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, {
        replace: true
      });
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-md p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent rounded flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">IP</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Workflow Tracker
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com" />
          

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" />
          

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border-color text-accent focus:ring-accent bg-card-bg" />
              
              <span className="text-sm text-text-secondary">Remember Me</span>
            </label>
            <button
              type="button"
              className="text-sm text-accent hover:underline">
              
              Forgot Password?
            </button>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            Sign in with a seeded backend user account
          </p>
          <p className="text-xs text-text-secondary mt-2">
            admin@example.com / adminpass123
          </p>
        </div>
      </Card>
    </div>);

}
