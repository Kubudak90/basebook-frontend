import React, { useState } from 'react';
import { Search, Filter, Sparkles, TrendingUp, Layers, ArrowUpRight, Wallet } from 'lucide-react';
import { POOLS } from '../constants';
import { Pool } from '../types';

interface PoolListProps {
  onSelectPool: (pool: Pool) => void;
  onCreatePool: () => void;
}

const PoolList: React.FC<PoolListProps> = ({ onSelectPool, onCreatePool }) => {
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock logic: Assume user has position in the first pool (ETH-USDC)
  const hasPosition = (poolId: string) => poolId === 'ETH-USDC';

  const filteredPools = POOLS.filter(pool => {
    const matchesSearch = 
      pool.tokenX.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pool.tokenY.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = filter === 'all' || (filter === 'my' && hasPosition(pool.id));

    return matchesSearch && matchesTab;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      
      {/* Protocol Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers size={64} />
              </div>
              <div className="text-slate-400 text-xs uppercase font-bold mb-2 tracking-widest">Total Value Locked</div>
              <div className="text-3xl font-bold text-white tracking-tight">$6,240,105</div>
              <div className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+2.4%</span>
              </div>
          </div>
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={64} />
              </div>
              <div className="text-slate-400 text-xs uppercase font-bold mb-2 tracking-widest">24h Volume</div>
              <div className="text-3xl font-bold text-white tracking-tight">$1,850,200</div>
              <div className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+12%</span>
              </div>
          </div>
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
              <div className="text-slate-400 text-xs uppercase font-bold mb-4 tracking-widest">Actions</div>
              <button 
                onClick={onCreatePool}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-glow hover:shadow-glow-lg active:scale-[0.98]"
              >
                <Layers size={18} />
                Create New Pool
              </button>
          </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 w-full md:w-auto">
            <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
                All Pools
            </button>
            <button 
                onClick={() => setFilter('my')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === 'my' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/20 shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
                My Pools
                <span className="bg-amber-500 text-black text-[10px] px-1.5 rounded-full h-4 flex items-center justify-center">1</span>
            </button>
        </div>

        <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
                type="text" 
                placeholder="Search by token symbol or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-white/5 focus:border-blue-500/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-all"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
                <button className="text-slate-500 hover:text-white bg-white/5 p-1.5 rounded-lg transition-colors">
                    <Filter size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Modern Table List */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Pool / Pair</div>
              <div className="col-span-2 text-right">Liquidity</div>
              <div className="col-span-2 text-right">Volume (24h)</div>
              <div className="col-span-2 text-right">Fees (24h)</div>
              <div className="col-span-2 text-right">APR</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5">
              {filteredPools.map((pool) => (
                  <div 
                    key={pool.id}
                    onClick={() => onSelectPool(pool)}
                    className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-all cursor-pointer group"
                  >
                      {/* Pair Info */}
                      <div className="col-span-4 flex items-center gap-4">
                          <div className="flex -space-x-3 relative">
                                <img src={pool.tokenX.logo} className="w-10 h-10 rounded-full border-2 border-slate-900 z-10 shadow-lg group-hover:scale-110 transition-transform" />
                                <img src={pool.tokenY.logo} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-lg group-hover:scale-110 transition-transform delay-75" />
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{pool.tokenX.symbol}-{pool.tokenY.symbol}</span>
                                  <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">{pool.binStep / 100}%</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  {hasPosition(pool.id) && (
                                      <span className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 rounded-sm">
                                          <Wallet size={10} /> Position Active
                                      </span>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Liquidity */}
                      <div className="col-span-2 text-right">
                          <div className="font-mono text-white text-base">${(pool.tvl / 1000).toFixed(1)}k</div>
                      </div>

                      {/* Volume */}
                      <div className="col-span-2 text-right">
                          <div className="font-mono text-white text-base">${(pool.volume24h / 1000).toFixed(1)}k</div>
                          <div className="text-[10px] text-slate-500">Low Volatility</div>
                      </div>

                      {/* Fees */}
                      <div className="col-span-2 text-right">
                          <div className="font-mono text-white text-base">${((pool.volume24h * 0.002) / 1000).toFixed(2)}k</div>
                      </div>

                      {/* APR & Action */}
                      <div className="col-span-2 flex items-center justify-end gap-4">
                          <div className="text-right">
                              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 text-lg">{pool.apr}%</div>
                              <div className="text-[10px] text-emerald-500/70">Avg. APR</div>
                          </div>
                          <button className="bg-white/5 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-xl border border-white/10 hover:border-blue-500 transition-all group-hover:translate-x-1">
                                <ArrowUpRight size={20} />
                          </button>
                      </div>
                  </div>
              ))}
              
              {filteredPools.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                      <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                          <Search size={32} className="opacity-50" />
                      </div>
                      <p>No pools found matching your search.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PoolList;
