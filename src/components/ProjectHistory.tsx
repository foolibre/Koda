import { useState, useEffect } from 'react';
import { History, Trash2, ExternalLink, Calendar, Zap } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ProjectHistory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;

    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No projects yet. Start building!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Project History</h2>
          <p className="text-sm text-gray-400">{projects.length} projects forged</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-950/50 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  {project.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : project.status === 'building'
                      ? 'bg-blue-500/20 text-blue-400'
                      : project.status === 'failed'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{project.prompt}</p>
              </div>
              <div className="flex gap-2">
                {project.artifact_url && (
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {project.style}
              </div>
              {project.dev_plan && (
                <div className="text-gray-600">
                  {project.dev_plan.stack}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
