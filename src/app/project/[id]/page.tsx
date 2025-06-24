import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  creator_id: string | null;
  created_at: string;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <section className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{project.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.split(',').map((tag: string, idx: number) => (
            <span
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <span><span className="font-medium">Creator ID:</span> {project.creator_id ?? 'N/A'}</span>
          <span><span className="font-medium">Created At:</span> {new Date(project.created_at).toLocaleString()}</span>
        </div>
      </section>
    </main>
  );
} 