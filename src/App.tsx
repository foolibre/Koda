import { useState } from 'react';
import { Zap, Code, Package, FileText, ChevronRight } from 'lucide-react';

interface BuildLog {
  phase: string;
  message: string;
  timestamp: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [artifactReady, setArtifactReady] = useState(false);

  const styles = [
    { name: 'hyperforge', desc: 'Speed meets scale', color: 'from-blue-600 to-purple-600' },
    { name: 'artisan', desc: 'Crafted with care', color: 'from-amber-600 to-orange-600' },
    { name: 'liminal', desc: 'Between worlds', color: 'from-purple-600 to-pink-600' },
    { name: 'daemon', desc: 'Machines building machines', color: 'from-gray-700 to-gray-900' },
    { name: 'genesis', desc: 'From first principles', color: 'from-emerald-600 to-teal-600' }
  ];

  const examplePrompts = [
    'Create an AI-powered drone delivery system with real-time tracking',
    'Build a real-time collaborative code editor with syntax highlighting',
    'Design a smart home automation dashboard with device management',
    'Develop a cryptocurrency portfolio tracker with live price updates'
  ];

  const handleBuild = async () => {
    if (!prompt.trim()) return;

    setBuilding(true);
    setBuildLogs([]);
    setArtifactReady(false);

    const logs: BuildLog[] = [
      { phase: 'init', message: 'KodArch build initiated', timestamp: new Date().toISOString() },
      { phase: 'parse', message: 'Parsing prompt and extracting requirements', timestamp: new Date().toISOString() },
      { phase: 'architect', message: 'Generating project structure', timestamp: new Date().toISOString() },
      { phase: 'scaffold', message: 'Creating files and configurations', timestamp: new Date().toISOString() },
      { phase: 'install', message: 'Installing dependencies', timestamp: new Date().toISOString() },
      { phase: 'build', message: 'Building project', timestamp: new Date().toISOString() },
      { phase: 'test', message: 'Running tests', timestamp: new Date().toISOString() },
      { phase: 'artifactize', message: 'Creating deployment artifact', timestamp: new Date().toISOString() },
      { phase: 'complete', message: 'Build successful! Artifact ready.', timestamp: new Date().toISOString() }
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setBuildLogs(prev => [...prev, logs[i]]);
    }

    setBuilding(false);
    setArtifactReady(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-blue-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              KodArch
            </h1>
          </div>
          <p className="text-2xl text-gray-300 font-mono mb-2">Where code builds code</p>
          <p className="text-gray-400">Autonomous software builder by Foolibre Labs</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Describe Your Project
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create an AI-powered app that..."
                className="w-full h-40 bg-gray-950/80 border border-gray-700 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              />

              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 font-mono">EXAMPLE PROMPTS:</p>
                {examplePrompts.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="block w-full text-left text-xs text-gray-400 hover:text-blue-400 font-mono transition-colors"
                  >
                    → {ex}
                  </button>
                ))}
              </div>

              <button
                onClick={handleBuild}
                disabled={building || !prompt.trim()}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {building ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Building...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Forge Project
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Build Styles</h3>
              <div className="space-y-2">
                {styles.map((style) => (
                  <div key={style.name} className="flex items-center gap-3 p-3 bg-gray-950/50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.color}`}></div>
                    <div>
                      <p className="font-mono text-sm font-semibold">{style.name}</p>
                      <p className="text-xs text-gray-400">{style.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-400" />
                Build Logs
              </h2>
              <div className="bg-gray-950/80 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs space-y-2">
                {buildLogs.length === 0 ? (
                  <p className="text-gray-500">Waiting to start build...</p>
                ) : (
                  buildLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-blue-400">[{log.phase}]</span>{' '}
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {artifactReady && (
              <div className="bg-gradient-to-r from-blue-900/50 to-pink-900/50 backdrop-blur border border-blue-500/50 rounded-lg p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Artifact Ready!</h3>
                </div>
                <p className="text-gray-300 mb-4 font-mono text-sm">
                  Your project has been forged and packaged.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>📦 Full source code</p>
                  <p>📄 Build summary & logs</p>
                  <p>🚀 Deployment playbook</p>
                  <p>🔒 Security notes</p>
                  <p>📋 Complete manifest</p>
                </div>
                <div className="mt-6 p-4 bg-gray-950/50 rounded-lg">
                  <p className="text-xs text-gray-400 font-mono mb-2">ARTIFACT PATH:</p>
                  <p className="text-xs text-blue-400 font-mono break-all">
                    ./artifacts/project-v0.1.0.zip
                  </p>
                </div>
                <p className="mt-4 text-xs text-center text-gray-500 font-mono">
                  No auto-deploys — you're the captain now.
                </p>
              </div>
            )}

            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">What You Get</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                  <p>Complete source code with best practices</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2"></div>
                  <p>Deployment playbook for multiple platforms</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                  <p>Security audit and sanitized configs</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2"></div>
                  <p>Build logs and dependency reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 font-mono space-y-1">
          <p>Created with ⚙️ KodArch — Foolibre Labs</p>
          <p>KODARCH BUILD SYSTEM OPERATIONAL</p>
          <p>THE MACHINE NOW BUILDS ITSELF</p>
        </div>
      </div>
    </div>
  );
}

export default App;
