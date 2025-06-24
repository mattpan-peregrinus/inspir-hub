"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  creator_id: string | null;
  created_at: string;
  vote_count: number;
}

interface Comment {
  id: string;
  project_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

interface CommentVote {
  id: string;
  comment_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id ? (typeof params.id === 'string' ? params.id : params.id[0]) : undefined;
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<CommentVote[]>([]);
  const [commentText, setCommentText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProjectVote, setLastProjectVote] = useState<null | 'up' | 'down'>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      setProject(projectData);
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      setComments(commentsData || []);
      const { data: votesData } = await supabase
        .from('comment_votes')
        .select('*')
        .in('comment_id', (commentsData || []).map((c: Comment) => c.id));
      setVotes(votesData || []);
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  async function refreshCommentsAndVotes() {
    if (!id) return;
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });
    setComments(commentsData || []);
    const { data: votesData } = await supabase
      .from('comment_votes')
      .select('*')
      .in('comment_id', (commentsData || []).map((c: Comment) => c.id));
    setVotes(votesData || []);
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!commentText.trim()) return;
    if (!id) {
      setError("Invalid project.");
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase.from('comments').insert([
      { project_id: id, user_id: userId, content: commentText.trim() }
    ]);
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message || "Failed to submit comment.");
      return;
    }
    setCommentText("");
    refreshCommentsAndVotes();
  }

  async function handleVote(commentId: string, voteType: 'up' | 'down') {
    if (!userId) return;
    const existing = votes.find(v => v.comment_id === commentId && v.user_id === userId);
    if (existing) {
      if (existing.vote_type === voteType) return;
      await supabase.from('comment_votes').update({ vote_type: voteType }).eq('id', existing.id);
    } else {
      await supabase.from('comment_votes').insert([
        { comment_id: commentId, user_id: userId, vote_type: voteType }
      ]);
    }
    refreshCommentsAndVotes();
  }

  function getVoteCount(commentId: string) {
    const ups = votes.filter(v => v.comment_id === commentId && v.vote_type === 'up').length;
    const downs = votes.filter(v => v.comment_id === commentId && v.vote_type === 'down').length;
    return ups - downs;
  }

  // Project upvote/downvote logic
  const handleProjectVote = async (delta: number, type: 'up' | 'down') => {
    if (!project || !id) return;
    setProject((prev) => prev ? { ...prev, vote_count: (prev.vote_count || 0) + delta } : prev);
    setLastProjectVote(type);
    await supabase
      .from('projects')
      .update({ vote_count: (project.vote_count || 0) + delta })
      .eq('id', id);
  };

  if (!id) {
    return <div className="text-center py-12 text-red-500">Invalid project ID.</div>;
  }
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }
  if (!project) {
    return <div className="text-center py-12 text-red-500">Project not found.</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <section className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleProjectVote(1, 'up')}
                className={`text-2xl font-bold px-2 py-1 rounded cursor-pointer border border-transparent transition-colors
                  ${lastProjectVote === 'up' ? 'text-green-400 opacity-60' : 'text-green-700 hover:bg-green-100 hover:border-green-400'}`}
                title="Upvote"
                disabled={lastProjectVote === 'up'}
              >
                ▲
              </button>
              <span className="font-mono text-2xl font-extrabold w-12 text-center select-none">{project.vote_count || 0}</span>
              <button
                onClick={() => handleProjectVote(-1, 'down')}
                className={`text-2xl font-bold px-2 py-1 rounded cursor-pointer border border-transparent transition-colors
                  ${lastProjectVote === 'down' ? 'text-red-400 opacity-60' : 'text-red-700 hover:bg-red-100 hover:border-red-400'}`}
                title="Downvote"
                disabled={lastProjectVote === 'down'}
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.split(',').map((tag: string, idx: number) => (
            <span
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <span><span className="font-medium">Creator ID:</span> {project.creator_id ?? 'N/A'}</span>
          <span><span className="font-medium">Created At:</span> {new Date(project.created_at).toLocaleString()}</span>
        </div>
      </section>

      {/* Comment Section */}
      <section className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Comments</h2>
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4 mb-8">
          <textarea
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-foreground bg-gray-50 dark:bg-gray-800 text-foreground"
            rows={3}
            placeholder="Write a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="self-end px-6 py-2 rounded-full bg-foreground text-background font-semibold shadow hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Comment"}
          </button>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </form>
        <div className="flex flex-col gap-6">
          {comments.length === 0 && <div className="text-gray-500 text-center">No comments yet.</div>}
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded p-4 shadow flex flex-col gap-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-200 font-mono">{comment.user_id ?? 'Anonymous'}</span>
                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <div className="text-foreground text-base mb-2">{comment.content}</div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVote(comment.id, 'up')}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${votes.find(v => v.comment_id === comment.id && v.user_id === userId && v.vote_type === 'up') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400'}`}
                  disabled={!userId}
                >
                  ▲
                </button>
                <span className="font-mono text-base">{getVoteCount(comment.id)}</span>
                <button
                  onClick={() => handleVote(comment.id, 'down')}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${votes.find(v => v.comment_id === comment.id && v.user_id === userId && v.vote_type === 'down') ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'}`}
                  disabled={!userId}
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
} 