"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  if (!open) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Logged in successfully!");
      setTimeout(onClose, 1000);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter your email to reset password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent!");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Sign In</h2>
        {error && <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-center text-sm">{error}</div>}
        {success && <div className="mb-4 p-2 rounded bg-green-100 text-green-700 text-center text-sm">{success}</div>}
        {!showForgot ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block mb-1 font-medium text-foreground text-sm">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block mb-1 font-medium text-foreground text-sm">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 rounded-full bg-foreground text-background font-semibold text-base shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-foreground hover:underline text-sm"
              >
                Create account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <div>
              <label htmlFor="forgot-email" className="block mb-1 font-medium text-foreground text-sm">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 rounded-full bg-foreground text-background font-semibold text-base shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="text-foreground hover:underline text-sm mt-2"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 