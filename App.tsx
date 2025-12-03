import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Swap from './components/Swap';
import Liquidity from './components/Liquidity';
import PoolList from './components/PoolList';
import CreatePool from './components/CreatePool';
import { POOLS } from './constants';
import { Pool } from './types';

type PoolView = 'list' | 'create' | 'manage';

function App() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');
  const [poolView, setPoolView] = useState<PoolView>('list');
  const [selectedPool, setSelectedPool] = useState<Pool | undefined>(undefined);

  const handlePoolSelect = (pool: Pool) => {
    setSelectedPool(pool);
    setPoolView('manage');
  };

  const handleBackToPools = () => {
    setPoolView('list');
    setSelectedPool(undefined);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-base-500/30 overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setPoolView('list'); }} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        
        {/* Background Decorative Blobs */}
        <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {activeTab === 'swap' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">Swap Anytime</h1>
            <p className="text-slate-400 mb-8 text-center max-w-md">Instantly trade tokens with low fees and zero price impact using Liquidity Book.</p>
            <Swap />
          </div>
        )}

        {activeTab === 'pool' && (
          <>
            {/* POOL LIST VIEW */}
            {poolView === 'list' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Liquidity Pools</h1>
                    <p className="text-slate-400 mt-2 text-lg">Earn fees by providing liquidity to active bins.</p>
                </div>
                
                <PoolList 
                    onSelectPool={handlePoolSelect} 
                    onCreatePool={() => setPoolView('create')} 
                />
              </div>
            )}

            {/* CREATE POOL VIEW */}
            {poolView === 'create' && (
              <CreatePool onBack={handleBackToPools} />
            )}

            {/* MANAGE POOL VIEW */}
            {poolView === 'manage' && (
              <Liquidity 
                initialPool={selectedPool} 
                onBack={handleBackToPools} 
              />
            )}
          </>
        )}
      </main>

      <footer className="py-12 text-center text-slate-600 text-sm">
        <p className="flex justify-center items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            BaseBook DEX v2.2 • Running on Base
        </p>
      </footer>
    </div>
  );
}

export default App;
