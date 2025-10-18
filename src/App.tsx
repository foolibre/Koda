import { useState } from 'react';
import { Zap, LogOut, User, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { BuilderInterface } from './components/BuilderInterface';
import { ProjectHistory } from './components/ProjectHistory';

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-7xl font-black bg-gradient-to-r from-blue-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                KodArch
              </h1>
            </div>
            <p className="text-3xl text-gray-300 font-mono mb-3 font-bold">
              Where code builds code
            </p>
            <p className="text-gray-400 text-lg">
              Autonomous software builder by Foolibre Labs
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur border border-gray-800 rounded-3xl p-12 shadow-2xl mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Transform Ideas into Production Code
              </h2>
              <p className="text-gray-400 text-center mb-8 text-lg">
                Describe your vision in natural language. KodArch generates complete,
                production-ready applications with best practices, testing, and deployment guides.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-bold mb-2">Instant Scaffolding</h3>
                  <p className="text-sm text-gray-400">
                    Complete project structure with modern frameworks and tools
                  </p>
                </div>

                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-bold mb-2">Style Personalities</h3>
                  <p className="text-sm text-gray-400">
                    Choose from 5 build styles, each with unique architecture
                  </p>
                </div>

                <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="font-bold mb-2">Deploy Ready</h3>
                  <p className="text-sm text-gray-400">
                    Complete with documentation, security notes, and playbooks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Get Started - Free
                </span>
              </button>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {[
                { name: 'hyperforge', color: 'from-blue-500 to-cyan-500', desc: 'Speed meets scale' },
                { name: 'artisan', color: 'from-amber-500 to-orange-500', desc: 'Crafted with care' },
                { name: 'liminal', color: 'from-purple-500 to-pink-500', desc: 'Between worlds' },
                { name: 'daemon', color: 'from-slate-500 to-zinc-600', desc: 'Machines building' },
                { name: 'genesis', color: 'from-emerald-500 to-teal-500', desc: 'First principles' }
              ].map((style) => (
                <div
                  key={style.name}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.color} mx-auto mb-2`}></div>
                  <p className="font-mono text-sm font-bold">{style.name}</p>
                  <p className="text-xs text-gray-500">{style.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 text-sm text-gray-500 font-mono space-y-1">
            <p>Created with ⚙️ KodArch — Foolibre Labs</p>
            <p>KODARCH BUILD SYSTEM OPERATIONAL</p>
          </div>
        </div>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                    KodArch
                  </h1>
                  <p className="text-xs text-gray-500 font-mono">v0.1.0</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-80 border-r border-gray-800 bg-gray-900/50 backdrop-blur transition-transform z-30 overflow-y-auto`}
        >
          <div className="p-6">
            <ProjectHistory />
          </div>
        </aside>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Build Dashboard</h2>
            <p className="text-gray-400">
              Describe your project and let KodArch forge it into reality
            </p>
          </div>

          <BuilderInterface />

          <div className="mt-12 bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Describe</h4>
                <p className="text-sm text-gray-400">Write your project idea in natural language</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Choose Style</h4>
                <p className="text-sm text-gray-400">Select architecture personality</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Forge</h4>
                <p className="text-sm text-gray-400">Watch real-time as code is generated</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-2xl">4️⃣</span>
                </div>
                <h4 className="font-semibold mb-2">Deploy</h4>
                <p className="text-sm text-gray-400">Get complete deployment playbook</p>
              </div>
            </div>
          </div>

          <footer className="mt-12 text-center text-xs text-gray-500 font-mono space-y-1">
            <p>Created with ⚙️ KodArch — Foolibre Labs</p>
            <p>THE MACHINE NOW BUILDS ITSELF</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
