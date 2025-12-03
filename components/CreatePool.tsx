import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Layers } from 'lucide-react';
import { TOKENS, POOLS } from '../constants';
import { Token } from '../types';

interface CreatePoolProps {
  onBack: () => void;
}

const FEE_TIERS = [
  { value: 1, label: '0.01%', description: 'Best for very stable pairs' },
  { value: 10, label: '0.1%', description: 'Best for stable pairs' },
  { value: 20, label: '0.2%', description: 'Best for most pairs' },
  { value: 100, label: '1.0%', description: 'Best for exotic pairs' },
];

const CreatePool: React.FC<CreatePoolProps> = ({ onBack }) => {
  const [tokenA, setTokenA] = useState<Token>(TOKENS.ETH);
  const [tokenB, setTokenB] = useState<Token>(TOKENS.USDC);
  const [selectedFee, setSelectedFee] = useState(20); // 0.2%
  const [startPrice, setStartPrice] = useState('');

  const handleCreate = () => {
    alert(`Pool Created!\nPair: ${tokenA.symbol}/${tokenB.symbol}\nFee: ${selectedFee / 100}%\nStart Price: ${startPrice}`);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
      >
        <ArrowLeft size={18} />
        <span className="font-bold text-sm">Back to Pools</span>
      </button>

      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        {/* Background deco */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Layers size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white">Create New Pool</h2>
        </div>
        <p className="text-slate-400 mb-8 ml-16">Initialize a new Liquidity Book for a token pair.</p>

        {/* 1. Select Pair */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
            Select Pair
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <label className="block text-xs text-slate-500 mb-2 font-bold uppercase">Token A</label>
              <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors border border-white/5">
                <div className="flex items-center gap-3">
                  <img src={tokenA.logo} alt={tokenA.symbol} className="w-8 h-8 rounded-full shadow-md" />
                  <span className="font-bold text-white text-lg">{tokenA.symbol}</span>
                </div>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <label className="block text-xs text-slate-500 mb-2 font-bold uppercase">Token B</label>
              <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors border border-white/5">
                <div className="flex items-center gap-3">
                  <img src={tokenB.logo} alt={tokenB.symbol} className="w-8 h-8 rounded-full shadow-md" />
                  <span className="font-bold text-white text-lg">{tokenB.symbol}</span>
                </div>
                <ChevronDown size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Fee Tier */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
            Select Fee Tier
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEE_TIERS.map((tier) => (
              <button
                key={tier.value}
                onClick={() => setSelectedFee(tier.value)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                  selectedFee === tier.value 
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-glow' 
                    : 'bg-black/20 border-white/5 hover:bg-white/5 text-slate-400'
                }`}
              >
                {selectedFee === tier.value && (
                  <div className="absolute top-4 right-4 text-blue-400 bg-blue-500/20 p-1 rounded-full">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
                <div className={`font-bold text-xl mb-1 ${selectedFee === tier.value ? 'text-white' : 'text-slate-300'}`}>
                  {tier.label}
                </div>
                <div className="text-xs text-slate-400 mb-2">{tier.description}</div>
                <div className={`text-[10px] font-mono uppercase tracking-wide ${selectedFee === tier.value ? 'text-blue-300' : 'text-slate-600'}`}>Bin Step: {tier.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Start Price */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
            Set Initial Price
          </h3>
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
            <div className="flex justify-between mb-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Starting Price</span>
              <span>1 {tokenA.symbol} = ? {tokenB.symbol}</span>
            </div>
            <input 
              type="number" 
              placeholder="0.00"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className="bg-transparent w-full text-4xl font-bold text-white outline-none placeholder-slate-700"
            />
            <p className="text-xs text-slate-500 mt-4 bg-white/5 p-2 rounded-lg inline-block">
              Active Bin ID will be initialized at approx <span className="text-slate-300 font-mono">8388608</span>
            </p>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={!startPrice}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all duration-200 shadow-xl ${
            startPrice 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20 active:scale-[0.98]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          Create Pool
        </button>

      </div>
    </div>
  );
};

export default CreatePool;