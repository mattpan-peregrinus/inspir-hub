"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdated: (profile: any) => void;
}

export default function EditProfileModal({ open, onClose, profile, onProfileUpdated }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [github, setGithub] = useState(profile.github || "");
  const [twitter, setTwitter] = useState(profile.twitter || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error, data } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        website,
        github,
        twitter,
      })
      .eq("id", profile.id)
      .select()
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onProfileUpdated(data);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Edit Profile</h2>
        {error && <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-center text-sm">{error}</div>}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-foreground text-sm">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-foreground text-sm">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              rows={3}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-foreground text-sm">Website</label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-foreground text-sm">GitHub</label>
            <input
              type="text"
              value={github}
              onChange={e => setGithub(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              placeholder="github-username"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-foreground text-sm">Twitter</label>
            <input
              type="text"
              value={twitter}
              onChange={e => setTwitter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              placeholder="twitter-handle"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-full bg-foreground text-background font-semibold text-base shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
} 