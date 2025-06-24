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
}

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
  const filteredProjects = selectedTags.length === 0
    ? projects
    : projects.filter((project) =>
        project.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .some((tag) => selectedTags.map((t) => t.toLowerCase()).includes(tag))
      );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => setSelectedTags([]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Projects</h1>

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
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:ring-2 hover:ring-foreground/30 focus:outline-none"
            >
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
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
            </Link>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No projects found for selected tags.</div>
          )}
        </div>
      )}
    </main>
  );
} 