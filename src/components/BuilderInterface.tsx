import { useState, useEffect } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { supabase, Project, BuildLog } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function BuilderInterface() {
  const [prompt, setPrompt] = useState('');
  const [building, setBuilding] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('hyperforge');
  const { session } = useAuth();

  const styles = [
    {
      name: 'hyperforge',
      desc: 'Speed meets scale',
      color: 'from-blue-500 to-cyan-500',
      stack: 'Next.js + Node + Postgres'
    },
    {
      name: 'artisan',
      desc: 'Crafted with care',
      color: 'from-amber-500 to-orange-500',
      stack: 'SvelteKit + FastAPI'
    },
    {
      name: 'liminal',
      desc: 'Between worlds',
      color: 'from-purple-500 to-pink-500',
      stack: 'Vite + Deno'
    },
    {
      name: 'daemon',
      desc: 'Machines building machines',
      color: 'from-slate-500 to-zinc-600',
      stack: 'Python CLI + LangChain'
    },
    {
      name: 'genesis',
      desc: 'From first principles',
      color: 'from-emerald-500 to-teal-500',
      stack: 'Rust + WASM'
    }
  ];

  const examplePrompts = [
    'Create an AI-powered drone delivery system with real-time tracking and fleet management',
    'Build a collaborative code editor with syntax highlighting and live collaboration',
    'Design a smart home automation dashboard with device management and scheduling',
    'Develop a cryptocurrency portfolio tracker with live prices and AI predictions'
  ];

  useEffect(() => {
    if (!currentProject) return;

    const channel = supabase
      .channel('build-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'build_logs',
          filter: `project_id=eq.${currentProject.id}`
        },
        (payload) => {
          setBuildLogs(prev => [...prev, payload.new as BuildLog]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject]);

  const handleBuild = async () => {
    if (!prompt.trim() || !session) return;

    setBuilding(true);
    setBuildLogs([]);
    setCurrentProject(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/build-project`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            style: selectedStyle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Build failed');
      }

      const data = await response.json();

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', data.project.id)
        .single();

      if (project) {
        setCurrentProject(project);

        const { data: logs } = await supabase
          .from('build_logs')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: true });

        if (logs) {
          setBuildLogs(logs);
        }
      }
    } catch (error: any) {
      console.error('Build error:', error);
      setBuildLogs([{
        id: 'error',
        project_id: '',
        phase: 'error',
        message: error.message || 'Build failed',
        status: 'error',
        details: {},
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Describe Your Vision</h2>
            <p className="text-sm text-gray-400">Natural language to production-ready code</p>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Create an AI-powered application that..."
          className="w-full h-32 bg-gray-950/80 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none mb-4"
        />

        <div className="mb-6">
          <p className="text-xs font-mono text-gray-500 mb-3">QUICK START EXAMPLES:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                className="text-left text-xs text-gray-400 hover:text-blue-400 bg-gray-950/50 hover:bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg p-3 transition-all"
              >
                <span className="text-blue-400 mr-2">→</span>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-300 mb-3">Build Style</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {styles.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style.name)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.name
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.color} mb-2`}></div>
                <p className="font-mono text-sm font-bold text-white mb-1">{style.name}</p>
                <p className="text-xs text-gray-400 mb-2">{style.desc}</p>
                <p className="text-xs text-gray-500 font-mono">{style.stack}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleBuild}
          disabled={building || !prompt.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
        >
          {building ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Forging Project...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Forge Project</span>
            </>
          )}
        </button>
      </div>

      {(buildLogs.length > 0 || currentProject) && (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Build Progress</h2>
                {currentProject && (
                  <p className="text-sm text-gray-400 font-mono">{currentProject.name}</p>
                )}
              </div>
            </div>
            {currentProject?.status === 'completed' && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Completed</span>
              </div>
            )}
          </div>

          <div className="bg-gray-950/80 rounded-xl p-4 max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
            {buildLogs.map((log, i) => (
              <div
                key={log.id || i}
                className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800"
              >
                <div className="mt-0.5">
                  {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {log.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                  {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-semibold">[{log.phase}]</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{log.message}</p>
                </div>
              </div>
            ))}
            {building && buildLogs.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            )}
          </div>

          {currentProject?.status === 'completed' && currentProject.dev_plan && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">STACK</p>
                <p className="text-sm font-semibold text-white">{currentProject.dev_plan.stack}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">FEATURES</p>
                <p className="text-sm font-semibold text-white">
                  {currentProject.dev_plan.features.slice(0, 2).join(', ')}
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">DATABASE</p>
                <p className="text-sm font-semibold text-white">
                  {currentProject.dev_plan.database.enabled ? currentProject.dev_plan.database.type : 'None'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
