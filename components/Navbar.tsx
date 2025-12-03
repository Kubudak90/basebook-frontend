import React from 'react';
import { Wallet, Menu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'swap' | 'pool';
  setActiveTab: (tab: 'swap' | 'pool') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sticky top-4 z-50 px-4">
      <nav className="glass-panel mx-auto max-w-5xl rounded-2xl shadow-2xl border-white/10">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-8">
              {/* Custom Logo */}
              <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 relative">
                  {/* Custom Liquidity Book Logo SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                    {/* Stacked Bins Design */}
                    <rect x="20" y="20" width="60" height="60" rx="12" fill="url(#logoGradient)" opacity="0.2" />
                    <rect x="30" y="35" width="40" height="8" rx="4" fill="#60a5fa" />
                    <rect x="30" y="46" width="40" height="8" rx="4" fill="#818cf8" />
                    <rect x="30" y="57" width="40" height="8" rx="4" fill="#a5b4fc" />
                    <path d="M 20 20 L 30 10 L 90 10 L 80 20 Z" fill="rgba(255,255,255,0.2)" />
                    <path d="M 80 20 L 90 10 L 90 70 L 80 80 Z" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight hidden sm:block group-hover:text-blue-200 transition-colors">BaseBook</span>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab('swap')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      activeTab === 'swap' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Swap
                  </button>
                  <button
                    onClick={() => setActiveTab('pool')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      activeTab === 'pool' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Pools
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Network Indicator */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span className="text-sm font-bold text-slate-300">Base</span>
              </div>

              {/* Connect Wallet */}
              <button className="bg-white text-slate-900 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-glow hover:shadow-glow-lg active:scale-95">
                <Wallet size={18} />
                <span className="hidden sm:inline">Connect</span>
              </button>
              
              <button className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg">
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;