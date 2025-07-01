"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  if (!open) return null;

  function validatePassword(pw: string) {
    return pw.length >= 8;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Check your email to confirm.");
      setTimeout(onClose, 1500);
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
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Sign Up</h2>
        {error && <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-center text-sm">{error}</div>}
        {success && <div className="mb-4 p-2 rounded bg-green-100 text-green-700 text-center text-sm">{success}</div>}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="signup-name" className="block mb-1 font-medium text-foreground text-sm">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              required
              autoFocus
            />
            <span className="text-xs text-gray-500">Full name is required to sign up.</span>
          </div>
          <div>
            <label htmlFor="signup-email" className="block mb-1 font-medium text-foreground text-sm">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block mb-1 font-medium text-foreground text-sm">Password <span className="text-red-500">*</span></label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              required
            />
            <span className="text-xs text-gray-500">At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              id="tos"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="accent-foreground w-4 h-4"
              required
            />
            <label htmlFor="tos" className="text-xs text-gray-700 dark:text-gray-300">
              I agree to the <a href="/terms" target="_blank" className="underline hover:text-blue-600">Terms of Service</a> and <a href="/privacy" target="_blank" className="underline hover:text-blue-600">Privacy Policy</a> <span className="text-red-500">*</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-full bg-foreground text-background font-semibold text-base shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-foreground hover:underline text-sm"
            >
              Already have an account?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 