import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
}

async function getRecentProjects(): Promise<Project[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) {
    // Optionally log error
    return [];
  }
  return projects as Project[];
}

export default async function HomePage() {
  const projects = await getRecentProjects();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 bg-background">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-foreground">
          Unlock Your Inner Builder
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          Discover, remix, and share creative project ideas — powered by the community.
        </p>
        <Link
          href="/explore"
          className="inline-block px-8 py-3 bg-foreground text-background rounded-full font-semibold text-lg shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors"
        >
          Explore Projects
        </Link>
      </section>

      {/* Recent Projects Section */}
      <section className="w-full max-w-5xl mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No projects found.</div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.split(",").map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
