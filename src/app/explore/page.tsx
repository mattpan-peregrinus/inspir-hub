"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from '@/lib/supabaseClient';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
  vote_count: number;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setProjects([]);
        setAllTags([]);
        setLoading(false);
        return;
      }
      setProjects(data as Project[]);
      // Extract unique tags
      const tagSet = new Set<string>();
      (data as Project[]).forEach((project) => {
        project.tags.split(',').forEach((tag) => {
          const clean = tag.trim();
          if (clean) tagSet.add(clean);
        });
      });
      setAllTags(Array.from(tagSet).sort((a, b) => a.localeCompare(b)));
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // Filter projects by selected tags (OR logic)
  let filteredProjects = selectedTags.length === 0
    ? projects
    : projects.filter((project) =>
        project.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .some((tag) => selectedTags.map((t) => t.toLowerCase()).includes(tag))
      );

  // Further filter by search query (title or description, case-insensitive)
  if (debouncedSearch.trim() !== "") {
    const q = debouncedSearch.trim().toLowerCase();
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  // Voting logic
  const handleVote = async (projectId: string, delta: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, vote_count: (p.vote_count || 0) + delta } : p
      )
    );
    await supabase
      .from('projects')
      .update({ vote_count: (projects.find(p => p.id === projectId)?.vote_count || 0) + delta })
      .eq('id', projectId);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Projects</h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects by title or description..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground text-base shadow-sm"
        />
      </div>

      {/* Tag Filter UI */}
      <div className="mb-8 flex flex-wrap gap-3 items-center">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-4 py-2 rounded-full border font-mono text-sm transition-colors
              ${selectedTags.includes(tag)
                ? "bg-foreground text-background border-foreground"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"}
            `}
          >
            #{tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-2 px-4 py-2 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm border border-gray-400 dark:border-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow hover:ring-2 hover:ring-foreground/30 focus:outline-none">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/project/${project.id}`} className="text-xl font-semibold text-foreground hover:underline">
                  {project.title}
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(project.id, 1)}
                    className="px-2 py-1 rounded-full bg-gray-100 hover:bg-green-100 text-green-700 border border-gray-300 hover:border-green-400 transition-colors"
                    title="Upvote"
                  >
                    ▲
                  </button>
                  <span className="font-mono text-base w-8 text-center">{project.vote_count || 0}</span>
                  <button
                    onClick={() => handleVote(project.id, -1)}
                    className="px-2 py-1 rounded-full bg-gray-100 hover:bg-red-100 text-red-700 border border-gray-300 hover:border-red-400 transition-colors"
                    title="Downvote"
                  >
                    ▼
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
              <Link href={`/project/${project.id}`} className="mt-4 inline-block text-blue-600 hover:underline font-medium text-sm">View Details</Link>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No projects found for selected tags or search.</div>
          )}
        </div>
      )}
    </main>
  );
} 