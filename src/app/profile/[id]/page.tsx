"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import EditProfileModal from "./EditProfileModal";
import Link from "next/link";

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      else setProfile(data);
      setLoading(false);
    }
    async function fetchProjectsAndComments() {
      if (!id) return;
      // Fetch projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, title, created_at")
        .eq("creator_id", id)
        .order("created_at", { ascending: false });
      setProjects(projectsData || []);
      // Fetch comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, content, created_at, project_id")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      setComments(commentsData || []);
    }
    if (id) {
      fetchProfile();
      fetchProjectsAndComments();
    }
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return <div className="p-8">Profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-white mb-4">
        {profile.full_name ? profile.full_name.split(" ").map(n => n[0]).join("") : "U"}
      </div>
      <h1 className="text-3xl font-bold mb-2">{profile.full_name || "Unnamed User"}</h1>
      <div className="text-gray-500 mb-4">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</div>
      {profile.bio && <div className="mb-4">{profile.bio}</div>}
      <div className="flex gap-4 mb-4">
        {profile.website && <a href={profile.website} target="_blank" rel="noopener" className="underline">Website</a>}
        {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener" className="underline">GitHub</a>}
        {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener" className="underline">Twitter</a>}
      </div>
      {user?.id === id && (
        <button className="px-4 py-2 rounded bg-foreground text-background font-semibold" onClick={() => setEditOpen(true)}>
          Edit Profile
        </button>
      )}
      {editOpen && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          onProfileUpdated={setProfile}
        />
      )}
      {/* Projects Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-3">Projects</h2>
        {projects.length === 0 ? (
          <div className="text-gray-500">No projects yet.</div>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/project/${project.id}`} className="text-blue-600 hover:underline font-medium">
                  {project.title}
                </Link>
                <span className="text-xs text-gray-400 ml-2">{new Date(project.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Comments Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-3">Comments</h2>
        {comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                <div className="text-sm text-gray-500 mb-1">
                  <Link href={`/project/${comment.project_id}`} className="text-blue-600 hover:underline">
                    On project
                  </Link>
                  <span className="ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div className="text-foreground text-base">{comment.content}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 