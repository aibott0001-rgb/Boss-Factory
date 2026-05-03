// ... (Imports remain the same)

export default function Dashboard() {
  // ... (Your existing state/logic remains)

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER: High Contrast & Bold */}
        <div className="flex justify-between items-end border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-5xl font-black text-white mb-2">
              Command <span className="text-gradient">Center</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Welcome back, CEO. System is <span className="text-green-400 font-bold">Operational</span>.
            </p>
          </div>
          <button className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2">
            <Brain size={20} /> New Idea
          </button>
        </div>

        {/* STATS GRID: Clear Hover States */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Example Stat Card - Apply 'interactive-card' class */}
          <div className="interactive-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Brain size={24} />
              </div>
              <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded">+12%</span>
            </div>
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Total Ideas</h3>
            <p className="text-4xl font-black text-white">{stats.totalIdeas}</p>
          </div>

          {/* Repeat for other stats using 'interactive-card' class */}
          {/* ... */}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Wide) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Recent Neural Inputs
              </h2>
              <button className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">View All</button>
            </div>

            {/* List of Ideas - Use 'interactive-card' for each item */}
            <div className="space-y-4">
               {/* Example Item */}
               <div className="interactive-card p-5 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${score >= 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`} />
                    <div>
                      <p className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{idea.content}</p>
                      <p className="text-slate-500 text-sm">{new Date(idea.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold ${score >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                    Score: {score}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
             {/* Secret Manager Card - Clear Call to Action */}
             <div className="interactive-card p-6 rounded-2xl border-l-4 border-l-purple-500">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Lock size={20} className="text-purple-400"/> Secret Manager
                </h3>
                <p className="text-slate-400 text-sm mb-6">Rotate API keys and sync to Vercel instantly.</p>
                <button 
                  onClick={() => router.push('/admin/secrets')}
                  className="w-full py-3 bg-slate-800 hover:bg-purple-600 text-white font-bold rounded-lg transition-all duration-300 border border-slate-700 hover:border-purple-500"
                >
                  Manage Secrets
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
