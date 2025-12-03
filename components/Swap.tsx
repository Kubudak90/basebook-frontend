import React, { useState, useEffect } from 'react';
import { ArrowDown, Settings, X, ChevronDown, Search, AlertCircle, Fuel, RefreshCcw } from 'lucide-react';
import { TOKENS, POOLS } from '../constants';
import { Token } from '../types';

const Swap: React.FC = () => {
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS.ETH);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS.USDC);
  const [amountIn, setAmountIn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [deadline, setDeadline] = useState('20');

  // Token Selector State
  const [selectingToken, setSelectingToken] = useState<'in' | 'out' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Prices State (Initialized with fallbacks to prevent empty UI)
  const [prices, setPrices] = useState<Record<string, number>>({
    ETH: 2450.50,
    USDC: 1.00,
    BRETT: 0.085,
    DEGEN: 0.012
  });
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Mock Balance Constant
  const MOCK_BALANCE = 4.20;

  // Real-time Price Fetching
  useEffect(() => {
    const COINGECKO_IDS: Record<string, string> = {
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'BRETT': 'based-brett',
        'DEGEN': 'degen-base'
    };

    const fetchPrices = async () => {
        setIsPriceLoading(true);
        try {
            const ids = Object.values(COINGECKO_IDS).join(',');
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
            
            if (!response.ok) throw new Error('Price fetch failed');
            
            const data = await response.json();
            
            const newPrices: Record<string, number> = {};
            // Map API response back to our Symbols
            Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
                if (data[id] && data[id].usd) {
                    newPrices[symbol] = data[id].usd;
                } else {
                    // Keep existing fallback if specific token fails
                    newPrices[symbol] = prices[symbol]; 
                }
            });
            
            setPrices(prev => ({ ...prev, ...newPrices }));
        } catch (error) {
            console.warn("Using fallback prices due to API error:", error);
            // We silently fail and keep existing prices to not disrupt user flow
        } finally {
            setIsPriceLoading(false);
        }
    };

    // Fetch immediately
    fetchPrices();

    // Poll every 60 seconds (conservative to avoid public API rate limits)
    const interval = setInterval(fetchPrices, 60000); 
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  const priceIn = prices[tokenIn.symbol] || 0;
  const priceOut = prices[tokenOut.symbol] || 0;
  const exchangeRate = priceOut > 0 ? priceIn / priceOut : 0;
  
  const amountOut = amountIn && exchangeRate ? (parseFloat(amountIn) * exchangeRate).toFixed(6) : '';

  const handleSwap = () => {
    setError(null);

    // Validation
    if (!amountIn || parseFloat(amountIn) <= 0) {
        setError("Please enter a valid amount.");
        return;
    }

    if (parseFloat(amountIn) > MOCK_BALANCE) {
        setError(`Insufficient ${tokenIn.symbol} balance.`);
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate random network/execution error (15% chance)
      if (Math.random() < 0.15) {
        setIsLoading(false);
        setError("Transaction failed: Network execution error. Please try again.");
        return;
      }

      setIsLoading(false);
      alert(`Swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol} on Base Network!\nSlippage: ${slippage}%\nDeadline: ${deadline} min`);
      setAmountIn('');
    }, 1500);
  };

  const handlePercentage = (percent: number) => {
      const val = MOCK_BALANCE * (percent / 100);
      setAmountIn(val.toFixed(6).replace(/\.?0+$/, ''));
      setError(null);
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn('');
    setError(null);
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const handleSelectToken = (token: Token) => {
    if (selectingToken === 'in') {
      setTokenIn(token);
    } else if (selectingToken === 'out') {
      setTokenOut(token);
    }
    setSelectingToken(null);
    setSearchQuery('');
    setError(null);
  };

  const filteredTokens = Object.values(TOKENS).filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      
      {/* Token Selector Modal */}
      {selectingToken && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-surface-900/90 backdrop-blur-xl w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white text-lg">Select Token</h3>
                    <button onClick={() => setSelectingToken(null)} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-4 pb-2">
                    <div className="relative bg-black/40 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all flex items-center px-4 py-3 gap-3">
                            <Search size={20} className="text-slate-400"/>
                            <input 
                            type="text" 
                            placeholder="Search name, symbol or address" 
                            className="bg-transparent outline-none text-white placeholder-slate-500 w-full text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                    {filteredTokens.map(token => {
                        const isSelected = (selectingToken === 'in' && tokenIn.symbol === token.symbol) || 
                                         (selectingToken === 'out' && tokenOut.symbol === token.symbol);
                        const isOther = (selectingToken === 'in' && tokenOut.symbol === token.symbol) ||
                                        (selectingToken === 'out' && tokenIn.symbol === token.symbol);
                        
                        const isDisabled = isOther;

                        return (
                        <button 
                            key={token.symbol}
                            onClick={() => handleSelectToken(token)}
                            disabled={isDisabled}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${
                                isSelected 
                                ? 'bg-blue-600/20 border border-blue-500/50' 
                                : isDisabled
                                    ? 'opacity-30 cursor-not-allowed' 
                                    : 'hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <img src={token.logo} alt={token.name} className="w-10 h-10 rounded-full shadow-lg" />
                            <div className="text-left">
                                <div className={`font-bold text-lg ${isSelected ? 'text-blue-400' : 'text-white'}`}>{token.symbol}</div>
                                <div className="text-xs text-slate-400">{token.name}</div>
                            </div>
                            {isSelected && (
                                <div className="ml-auto text-blue-400 text-xs font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded">Current</div>
                            )}
                        </button>
                    )})}
                </div>
            </div>
            <div className="absolute inset-0" onClick={() => setSelectingToken(null)} />
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Transaction Settings</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slippage Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
                <span>Max Slippage</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['0.1', '0.5', '1.0'].map((val) => (
                    <button
                        key={val}
                        onClick={() => setSlippage(val)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                            slippage === val 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/30' 
                            : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                    >
                        {val}%
                    </button>
                ))}
                <div className={`flex items-center bg-black/20 rounded-xl px-3 border transition-all ${!['0.1', '0.5', '1.0'].includes(slippage) ? 'border-blue-400 text-white' : 'border-white/5 text-slate-400 focus-within:border-blue-500/50'}`}>
                    <input
                        type="number"
                        placeholder="Custom"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="bg-transparent w-full text-right font-bold text-sm outline-none placeholder-slate-600 py-3"
                    />
                    <span className="ml-1 text-xs font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Deadline Section */}
            <div>
               <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
                <span>Transaction Deadline</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 focus-within:border-blue-500/50 transition-all p-3 flex items-center justify-between">
                    <input 
                        type="number"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none w-full text-lg"
                    />
                    <span className="text-slate-500 text-sm font-medium">min</span>
                  </div>
              </div>
            </div>

          </div>
          <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
        </div>
      )}

      {/* MAIN SWAP CARD */}
      <div className="w-full max-w-[480px] glass-card rounded-3xl p-2 shadow-2xl shadow-black/50 relative overflow-hidden group">
        
        {/* Glow effect inside card */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/30 transition-colors duration-1000"></div>

        <div className="px-4 py-3 flex justify-between items-center mb-1 relative z-10">
          <h2 className="text-lg font-bold text-white tracking-wide">Swap</h2>
          <div className="flex gap-2">
            {/* Price Refresh Indicator */}
            {isPriceLoading && (
                <div className="p-2 rounded-xl text-blue-400 animate-spin">
                    <RefreshCcw size={16} />
                </div>
            )}
            <button 
              onClick={toggleSettings}
              className={`p-2 rounded-xl transition-all duration-300 ${isSettingsOpen ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-black/30 rounded-[20px] p-5 mb-1 border border-white/5 hover:border-white/10 transition-colors relative z-10">
          <div className="flex justify-between items-center mb-4">
             <input 
              type="number" 
              placeholder="0" 
              value={amountIn}
              onChange={(e) => { setAmountIn(e.target.value); setError(null); }}
              className="bg-transparent text-4xl font-semibold text-white outline-none w-full placeholder-slate-700"
            />
            <button 
                onClick={() => setSelectingToken('in')}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 py-1.5 pl-2 pr-3 rounded-full min-w-max transition-colors border border-white/5 shadow-lg"
            >
                <img src={tokenIn.logo} alt={tokenIn.symbol} className="w-7 h-7 rounded-full" />
                <span className="font-bold text-lg text-white">{tokenIn.symbol}</span>
                <ChevronDown size={16} className="text-slate-400"/>
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-slate-500 text-sm font-medium">
               ${priceIn && amountIn ? (priceIn * parseFloat(amountIn)).toFixed(2) : '0.00'}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Bal: {MOCK_BALANCE.toFixed(4)}</span>
                <button 
                    onClick={() => handlePercentage(100)}
                    className="text-blue-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    Max
                </button>
            </div>
          </div>
        </div>

        {/* SWITCHER */}
        <div className="relative h-2 flex justify-center items-center z-20 my-1">
          <button 
            onClick={switchTokens}
            className="absolute bg-slate-900 border-4 border-[#0f1422] rounded-xl p-2.5 text-slate-400 hover:text-white hover:bg-blue-600 transition-all duration-300 shadow-xl active:scale-90 active:rotate-180"
          >
            <ArrowDown size={20} strokeWidth={3} />
          </button>
        </div>

        {/* OUTPUT SECTION */}
        <div className="bg-black/30 rounded-[20px] p-5 mt-1 border border-white/5 hover:border-white/10 transition-colors relative z-10">
          <div className="flex justify-between items-center mb-4">
            <input 
              type="text" 
              placeholder="0" 
              value={amountOut}
              readOnly
              className="bg-transparent text-4xl font-semibold text-white outline-none w-full placeholder-slate-700 cursor-default"
            />
            <button 
                onClick={() => setSelectingToken('out')}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 py-1.5 pl-2 pr-3 rounded-full min-w-max transition-colors border border-white/5 shadow-lg"
            >
                <img src={tokenOut.logo} alt={tokenOut.symbol} className="w-7 h-7 rounded-full" />
                <span className="font-bold text-lg text-white">{tokenOut.symbol}</span>
                <ChevronDown size={16} className="text-slate-400"/>
            </button>
          </div>
          <div className="flex justify-between items-center">
             <div className="text-slate-500 text-sm font-medium">
               ${priceOut && amountOut ? (priceOut * parseFloat(amountOut)).toFixed(2) : '0.00'}
            </div>
            <span className="text-slate-500 text-xs">Bal: 1,250.00</span>
          </div>
        </div>

        {/* Info Accordion - Collapsible but open if amount exists */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${amountIn && parseFloat(amountIn) > 0 ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/5 rounded-xl p-4 text-xs space-y-2 border border-white/5 mx-2">
            <div className="flex justify-between text-slate-400">
              <span>Rate</span>
              <span className="text-slate-200 font-mono">1 {tokenIn.symbol} = {exchangeRate.toLocaleString(undefined, { maximumSignificantDigits: 6 })} {tokenOut.symbol}</span>
            </div>
             <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1"><Fuel size={12}/> Network Cost</span>
              <span className="text-slate-200">$0.05</span>
            </div>
             <div className="flex justify-between text-slate-400">
              <span>Price Impact</span>
              <span className="text-emerald-400">~0.01%</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mt-3 mx-2 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Action Button */}
        <div className="mt-3 p-2">
            <button 
            disabled={!amountIn || isLoading}
            onClick={handleSwap}
            className={`w-full py-4 rounded-2xl font-bold text-xl transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden group
                ${!amountIn || isLoading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-glow hover:shadow-glow-lg border border-blue-400/20 active:scale-[0.98]'
                }`}
            >
            {/* Button Shine Effect */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            {isLoading ? (
                <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Swapping...</span>
                </>
            ) : (!amountIn ? 'Enter Amount' : 'Swap Tokens')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Swap;