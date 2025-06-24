"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim()) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the magic link!");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setShowSignIn(false);
    setEmail("");
  }

  // Get display name or fallback
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || null;

  return (
    <>
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-950 shadow-sm mb-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">InspirHub</Link>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-foreground hover:text-blue-600 hover:underline font-medium transition-colors px-2 py-1 rounded"
          >
            Explore
          </Link>
          <Link
            href="/submit"
            className="text-foreground hover:text-blue-600 hover:underline font-medium transition-colors px-2 py-1 rounded"
          >
            Submit Project
          </Link>
          {/* Auth UI */}
          {!loading && !user && (
            <>
              {showSignIn ? (
                <div
                  className="absolute right-6 top-16 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-4 min-w-[260px] flex flex-col gap-3 animate-fade-in transition-all duration-200"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
                >
                  <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground text-sm"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded-full border border-foreground text-foreground bg-transparent px-4 py-1.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                      >
                        Send Magic Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSignIn(false)}
                        className="rounded-full border border-gray-300 text-gray-500 bg-transparent px-4 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  {message && <div className="text-blue-700 text-xs text-center mt-1">{message}</div>}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignIn(true)}
                  className="rounded-full border border-foreground text-foreground bg-transparent px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  Sign In
                </button>
              )}
            </>
          )}
          {!loading && user && (
            <div className="flex items-center gap-3">
              {displayName ? (
                <span className="text-sm text-foreground font-mono">Hi, {displayName}</span>
              ) : (
                <span className="inline-block w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-full border border-gray-300 text-gray-500 bg-transparent px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
      {message && !showSignIn && (
        <div className="w-full flex justify-center mb-2">
          <div className="px-4 py-2 rounded bg-blue-100 text-blue-800 text-sm font-medium shadow">
            {message}
          </div>
        </div>
      )}
    </>
  );
} 