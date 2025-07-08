"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setShowLogin(false);
    setShowSignup(false);
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
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-full border border-foreground text-foreground bg-transparent px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Sign In
            </button>
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
              {/* My Profile link */}
              <Link
                href={`/profile/${user.id}`}
                className="text-foreground hover:text-blue-600 hover:underline font-medium transition-colors px-2 py-1 rounded"
              >
                My Profile
              </Link>
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
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    </>
  );
} 