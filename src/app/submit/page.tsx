"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setLoading(true);
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const creator_id = user?.id || null;
    // Prepare tags as comma-separated string
    const tagsString = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(",");
    // Insert into Supabase
    const { error: insertError } = await supabase.from("projects").insert([
      { title, description, tags: tagsString, creator_id },
    ]);
    setLoading(false);
    if (insertError) {
      setError(insertError.message || "Failed to submit project.");
      return;
    }
    // Show toast
    if (typeof window !== "undefined") {
      // Simple toast
      const toast = document.createElement("div");
      toast.textContent = "Project submitted successfully!";
      toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 2500);
    }
    // Redirect
    router.push("/explore");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <section className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Submit a New Project</h1>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="title" className="block mb-2 font-medium text-foreground">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-foreground">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block mb-2 font-medium text-foreground">
              Tags <span className="text-gray-500 text-sm">(comma separated, optional)</span>
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
              placeholder="e.g. web, ai, design"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-foreground text-background rounded-full font-semibold text-lg shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      </section>
    </main>
  );
} 