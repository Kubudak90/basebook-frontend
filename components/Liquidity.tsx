import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Info, Layers, ChevronDown, Settings2, Wallet, X, ArrowUpRight, ArrowDownLeft, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { TOKENS, POOLS, calculatePriceFromBin } from '../constants';
import { LiquidityChart } from './LiquidityChart';
import { Bin, LiquidityShape, Pool, UserBinPosition } from '../types';

interface LiquidityProps {
  initialPool?: Pool;
  onBack?: () => void;
}

const Liquidity: React.FC<LiquidityProps> = ({ initialPool, onBack }) => {
  const [selectedPool, setSelectedPool] = useState<Pool>(initialPool || POOLS[0]);
  const [isPoolSelectorOpen, setIsPoolSelectorOpen] = useState(false);
  
  // TABS: 'add' or 'positions'
  const [activeTab, setActiveTab] = useState<'add' | 'positions'>('add');

  // Add Mode State
  const [shape, setShape] = useState<LiquidityShape>(LiquidityShape.SPOT);
  const [amountX, setAmountX] = useState<string>('');
  const [amountY, setAmountY] = useState<string>('');
  const [rangeRadius, setRangeRadius] = useState<number>(15);
  
  // Manage Bin State
  const [managingBin, setManagingBin] = useState<UserBinPosition | null>(null);
  const [manageAction, setManageAction] = useState<'add' | 'remove'>('remove');
  const [managePercent, setManagePercent] = useState<number>(50);
  const [manageAddAmountX, setManageAddAmountX] = useState('');
  const [manageAddAmountY, setManageAddAmountY] = useState('');
  
  // Exit Modal State
  const [isExitSelectionOpen, setIsExitSelectionOpen] = useState(false);

  // Chart State
  const [bins, setBins] = useState<Bin[]>([]);
  const [userBins, setUserBins] = useState<UserBinPosition[]>([]);
  
  // Simulation constants
  const CURRENT_PRICE = 2450.00; 
  const ACTIVE_BIN_ID = selectedPool.activeBinId;

  // Generate User Positions Mock
  useEffect(() => {
    // Simulate user having positions in 3 specific bins
    const mockUserBins: UserBinPosition[] = [
      {
        binId: ACTIVE_BIN_ID, // Active Bin
        amountX: 0.5421,
        amountY: 1240.50,
        priceMin: CURRENT_PRICE,
        priceMax: CURRENT_PRICE * (1 + selectedPool.binStep/10000),
        isCurrent: true
      },
      {
        binId: ACTIVE_BIN_ID - 5, // Below Price (Full Y/Quote)
        amountX: 0,
        amountY: 2500.00,
        priceMin: CURRENT_PRICE * Math.pow(1 + selectedPool.binStep/10000, -5),
        priceMax: CURRENT_PRICE * Math.pow(1 + selectedPool.binStep/10000, -4),
        isCurrent: false
      },
      {
        binId: ACTIVE_BIN_ID + 8, // Above Price (Full X/Base)
        amountX: 1.2500,
        amountY: 0,
        priceMin: CURRENT_PRICE * Math.pow(1 + selectedPool.binStep/10000, 8),
        priceMax: CURRENT_PRICE * Math.pow(1 + selectedPool.binStep/10000, 9),
        isCurrent: false
      }
    ];
    setUserBins(mockUserBins);
  }, [selectedPool, ACTIVE_BIN_ID, CURRENT_PRICE]);

  // Reset management inputs when bin changes
  useEffect(() => {
    if (managingBin) {
      setManageAddAmountX('');
      setManageAddAmountY('');
      setManagePercent(50);
      setManageAction('remove');
    }
  }, [managingBin]);

  // Handle Exit Liquidity Button Click
  const handleExitLiquidityClick = () => {
      if (userBins.length === 0) return;
      if (userBins.length === 1) {
          setManagingBin(userBins[0]);
          setManageAction('remove');
      } else {
          setIsExitSelectionOpen(true);
      }
  };

  // Aggregate User Data
  const totalValueUSD = userBins.reduce((acc, bin) => {
    return acc + (bin.amountX * CURRENT_PRICE) + bin.amountY;
  }, 0);

  const totalAmountX = userBins.reduce((acc, bin) => acc + bin.amountX, 0);
  const totalAmountY = userBins.reduce((acc, bin) => acc + bin.amountY, 0);

  const generateBins = useCallback(() => {
    const newBins: Bin[] = [];
    const totalBins = 60; 
    const startId = ACTIVE_BIN_ID - (totalBins / 2);

    for (let i = 0; i < totalBins; i++) {
      const id = startId + i;
      const price = calculatePriceFromBin(id, ACTIVE_BIN_ID, CURRENT_PRICE, selectedPool.binStep);
      const isCurrent = id === Math.floor(ACTIVE_BIN_ID);
      
      let liquidityX = 0;
      let liquidityY = 0;
      const distFromActive = Math.abs(id - ACTIVE_BIN_ID);
      
      let amount = 0;
      if (distFromActive <= rangeRadius) {
        // Shapes logic
        if (shape === LiquidityShape.SPOT) amount = distFromActive < 2 ? 100 : 0;
        else if (shape === LiquidityShape.CURVE) amount = Math.max(0, 100 - (distFromActive * (100/rangeRadius))); 
        else if (shape === LiquidityShape.BID_ASK) amount = 60;
        else if (shape === LiquidityShape.WIDE) amount = 30;
      }

      if (id > ACTIVE_BIN_ID) {
        liquidityX = amount;
      } else if (id < ACTIVE_BIN_ID) {
        liquidityY = amount; 
      } else {
        liquidityX = amount / 2;
        liquidityY = amount / 2;
      }

      const noise = Math.random() * 10;
      newBins.push({
        id,
        price,
        liquidityX: liquidityX + noise, 
        liquidityY: liquidityY + noise,
        isCurrent
      });
    }
    setBins(newBins);
  }, [shape, rangeRadius, ACTIVE_BIN_ID, selectedPool.binStep, CURRENT_PRICE]);

  useEffect(() => {
    generateBins();
  }, [generateBins]);

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Exit Selection Modal */}
      {isExitSelectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="glass-card w-full max-w-md rounded-3xl p-6 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Exit Liquidity</h3>
                        <p className="text-xs text-slate-400 mt-1">Select a position to withdraw from</p>
                    </div>
                    <button onClick={() => setIsExitSelectionOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                    {userBins.map(bin => {
                        const totalVal = (bin.amountX * CURRENT_PRICE) + bin.amountY;
                        return (
                        <button 
                            key={bin.binId}
                            onClick={() => {
                                setManagingBin(bin);
                                setManageAction('remove');
                                setIsExitSelectionOpen(false);
                            }}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between transition-all hover:border-blue-500/30 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 p-2.5 rounded-lg text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                    <Layers size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        Bin #{bin.binId}
                                        {bin.isCurrent && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Active</span>}
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{bin.priceMin.toFixed(2)} - {bin.priceMax.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white">${totalVal.toFixed(2)}</div>
                                <div className="text-[10px] font-bold text-slate-500 group-hover:text-blue-400 transition-colors uppercase tracking-wider">Select</div>
                            </div>
                        </button>
                    )})}
                </div>
             </div>
             <div className="absolute inset-0" onClick={() => setIsExitSelectionOpen(false)} />
        </div>
      )}

      {/* Managing Bin Modal */}
      {managingBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="glass-card w-full max-w-md rounded-3xl p-6 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Manage Bin #{managingBin.binId}</h3>
                        <p className="text-xs text-slate-400 mt-1">Range: {managingBin.priceMin.toFixed(2)} - {managingBin.priceMax.toFixed(2)}</p>
                    </div>
                    <button onClick={() => setManagingBin(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="bg-black/20 p-1 rounded-xl flex mb-6 border border-white/5">
                    <button onClick={() => setManageAction('add')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${manageAction === 'add' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Add Liquidity</button>
                    <button onClick={() => setManageAction('remove')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${manageAction === 'remove' ? 'bg-red-500/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Remove Liquidity</button>
                </div>

                {manageAction === 'remove' ? (
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between text-sm mb-2 text-slate-400">
                                <span>Assets in Bin</span>
                            </div>
                            <div className="flex items-center justify-between font-mono text-lg text-white">
                                <span>{managingBin.amountX.toFixed(4)} {selectedPool.tokenX.symbol}</span>
                                <span>{managingBin.amountY.toFixed(2)} {selectedPool.tokenY.symbol}</span>
                            </div>
                        </div>

                         <div>
                            <div className="flex justify-between text-sm mb-2 text-slate-300">
                                <span>Withdraw Amount</span>
                                <span className="text-red-400 font-bold">{managePercent}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={managePercent}
                                onChange={(e) => setManagePercent(parseInt(e.target.value))}
                                className="w-full"
                            />
                             <div className="flex justify-between text-xs text-slate-500 mt-2 px-1 font-bold uppercase tracking-wider">
                                <span onClick={() => setManagePercent(0)} className="cursor-pointer hover:text-white transition-colors">0%</span>
                                <span onClick={() => setManagePercent(25)} className="cursor-pointer hover:text-white transition-colors">25%</span>
                                <span onClick={() => setManagePercent(50)} className="cursor-pointer hover:text-white transition-colors">50%</span>
                                <span onClick={() => setManagePercent(75)} className="cursor-pointer hover:text-white transition-colors">75%</span>
                                <span onClick={() => setManagePercent(100)} className="cursor-pointer hover:text-white transition-colors">100%</span>
                             </div>
                        </div>

                        <button className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-all">
                            Confirm Withdraw
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                         <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 flex gap-3">
                           <Info size={20} className="text-blue-400 shrink-0"/>
                           <p className="text-xs text-blue-200 leading-relaxed">
                               {managingBin.binId === selectedPool.activeBinId ? 
                                  "This is the active bin. You can provide both tokens to facilitate trades in both directions." : 
                                  (managingBin.binId > selectedPool.activeBinId ? 
                                    `Bin is above current price. Deposit ${selectedPool.tokenX.symbol} (Base) to sell as price rises.` : 
                                    `Bin is below current price. Deposit ${selectedPool.tokenY.symbol} (Quote) to buy as price drops.`)
                               }
                           </p>
                        </div>
                        
                        {/* Token X Input - Show if Bin >= Active */}
                        {(managingBin.binId >= selectedPool.activeBinId) && (
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                <div className="flex justify-between mb-2 text-xs text-slate-400 font-medium">
                                    <span>Deposit {selectedPool.tokenX.symbol}</span>
                                    <span className="text-blue-400">Bal: 4.20</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <input 
                                        type="number" 
                                        value={manageAddAmountX} 
                                        onChange={e => setManageAddAmountX(e.target.value)}
                                        className="bg-transparent w-full text-2xl font-bold text-white outline-none placeholder-slate-700"
                                        placeholder="0.0"
                                    />
                                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                        <img src={selectedPool.tokenX.logo} className="w-5 h-5 rounded-full" />
                                        <span className="font-bold text-slate-200">{selectedPool.tokenX.symbol}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Token Y Input - Show if Bin <= Active */}
                         {(managingBin.binId <= selectedPool.activeBinId) && (
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                <div className="flex justify-between mb-2 text-xs text-slate-400 font-medium">
                                    <span>Deposit {selectedPool.tokenY.symbol}</span>
                                    <span className="text-blue-400">Bal: 5400.00</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <input 
                                        type="number" 
                                        value={manageAddAmountY} 
                                        onChange={e => setManageAddAmountY(e.target.value)}
                                        className="bg-transparent w-full text-2xl font-bold text-white outline-none placeholder-slate-700"
                                        placeholder="0.0"
                                    />
                                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                        <img src={selectedPool.tokenY.logo} className="w-5 h-5 rounded-full" />
                                        <span className="font-bold text-slate-200">{selectedPool.tokenY.symbol}</span>
                                    </div>
                                </div>
                            </div>
                         )}

                         <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-glow hover:shadow-glow-lg active:scale-[0.98] transition-all">
                            Add Liquidity to Bin
                        </button>
                    </div>
                )}
             </div>
             <div className="absolute inset-0" onClick={() => setManagingBin(null)} />
        </div>
      )}

      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
            <ChevronDown size={20} className="rotate-90" />
          </div>
          <span className="font-bold">Back to Pools</span>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration / List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pool Header */}
          <div className="glass-card p-6 rounded-3xl relative z-20">
            <div className="flex justify-between items-start mb-6">
                <div className="relative">
                    <button 
                        onClick={() => setIsPoolSelectorOpen(!isPoolSelectorOpen)}
                        className="flex items-center gap-4 hover:bg-white/5 p-2 -ml-2 rounded-2xl transition-all"
                    >
                        <div className="flex -space-x-3">
                            <img src={selectedPool.tokenX.logo} alt={selectedPool.tokenX.symbol} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-lg z-10" />
                            <img src={selectedPool.tokenY.logo} alt={selectedPool.tokenY.symbol} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-lg" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {selectedPool.tokenX.symbol} / {selectedPool.tokenY.symbol}
                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isPoolSelectorOpen ? 'rotate-180' : ''}`} />
                            </h2>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">V2.2</span>
                                <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">Bin Step: {selectedPool.binStep / 100}%</span>
                            </div>
                        </div>
                    </button>
                    
                    {isPoolSelectorOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-2 max-h-64 overflow-y-auto">
                                {POOLS.map(pool => (
                                    <button
                                        key={pool.id}
                                        onClick={() => {
                                            setSelectedPool(pool);
                                            setIsPoolSelectorOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedPool.id === pool.id ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                                    >
                                         <div className="flex -space-x-2">
                                            <img src={pool.tokenX.logo} alt={pool.tokenX.symbol} className="w-6 h-6 rounded-full border border-slate-700 z-10" />
                                            <img src={pool.tokenY.logo} alt={pool.tokenY.symbol} className="w-6 h-6 rounded-full border border-slate-700" />
                                        </div>
                                        <div className="text-sm font-bold">{pool.tokenX.symbol}/{pool.tokenY.symbol}</div>
                                        <div className="text-xs ml-auto bg-black/40 px-2 py-1 rounded text-slate-500">{pool.binStep/100}%</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-between items-center text-sm bg-black/20 p-3 rounded-xl border border-white/5">
              <div className="text-slate-400 flex items-center gap-2">Market Price</div>
              <div className="text-white font-mono font-bold tracking-wide">{CURRENT_PRICE.toLocaleString()} {selectedPool.tokenY.symbol}</div>
            </div>
          </div>

          {/* MAIN TABS */}
          <div className="bg-black/20 p-1 rounded-2xl border border-white/5 flex relative">
            <button 
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Add Liquidity
            </button>
            <button 
              onClick={() => setActiveTab('positions')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${activeTab === 'positions' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              My Positions
            </button>
          </div>

          {/* TAB CONTENT: ADD LIQUIDITY */}
          {activeTab === 'add' && (
            <div className="glass-card p-6 rounded-3xl animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deposit Amounts</h3>
                <Settings2 size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors"/>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors group hover:bg-black/30">
                  <div className="flex justify-between mb-2 text-xs text-slate-400 font-medium">
                    <span>Amount</span>
                    <span className="text-blue-400">Bal: 4.20</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <input 
                      type="number" 
                      placeholder="0.0" 
                      className="bg-transparent w-full text-2xl font-bold text-white outline-none placeholder-slate-700"
                      value={amountX}
                      onChange={(e) => setAmountX(e.target.value)}
                    />
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <img src={selectedPool.tokenX.logo} alt={selectedPool.tokenX.symbol} className="w-5 h-5 rounded-full" />
                        <span className="font-bold text-slate-200">{selectedPool.tokenX.symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                     <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700 text-slate-400"><Plus size={14}/></div>
                </div>

                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors group hover:bg-black/30">
                  <div className="flex justify-between mb-2 text-xs text-slate-400 font-medium">
                    <span>Amount</span>
                    <span className="text-blue-400">Bal: 5400.00</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <input 
                      type="number" 
                      placeholder="0.0" 
                      className="bg-transparent w-full text-2xl font-bold text-white outline-none placeholder-slate-700"
                      value={amountY}
                      onChange={(e) => setAmountY(e.target.value)}
                    />
                     <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <img src={selectedPool.tokenY.logo} alt={selectedPool.tokenY.symbol} className="w-5 h-5 rounded-full" />
                        <span className="font-bold text-slate-200">{selectedPool.tokenY.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-glow hover:shadow-glow-lg active:scale-[0.98] transition-all">
                Add Liquidity
              </button>
            </div>
          )}

          {/* TAB CONTENT: MY POSITIONS */}
          {activeTab === 'positions' && (
             <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-4">
                
                {/* Dashboard Overview Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Total Value Card */}
                    <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                         <div className="flex items-center gap-2 mb-2 text-amber-200">
                            <TrendingUp size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Your Liquidity</span>
                         </div>
                         <div className="text-2xl font-bold text-white mb-4">${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                         
                         <div className="space-y-2">
                             <div className="flex justify-between text-xs">
                                 <span className="text-slate-400">{selectedPool.tokenX.symbol}</span>
                                 <span className="text-white font-mono">{totalAmountX.toFixed(4)}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-slate-400">{selectedPool.tokenY.symbol}</span>
                                 <span className="text-white font-mono">{totalAmountY.toFixed(2)}</span>
                             </div>
                         </div>
                    </div>

                    {/* Fees Card */}
                    <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                         <div className="flex items-center gap-2 mb-2 text-emerald-300">
                            <DollarSign size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Unclaimed Fees</span>
                         </div>
                         <div className="text-2xl font-bold text-emerald-400 mb-4">$12.40</div>
                         <button className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg transition-colors border border-emerald-500/30">
                            Claim Rewards
                         </button>
                    </div>
                </div>

                {/* Granular Bin List */}
                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Layers size={18} className="text-amber-400"/> 
                            Active Bins ({userBins.length})
                        </h3>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {userBins.map((bin) => {
                            let status = "Active";
                            let statusColor = "text-emerald-400";
                            let statusBg = "bg-emerald-500/10";
                            
                            if (bin.binId < ACTIVE_BIN_ID) {
                                status = "Out of Range";
                                statusColor = "text-slate-400";
                                statusBg = "bg-slate-500/10";
                            } else if (bin.binId > ACTIVE_BIN_ID) {
                                status = "Out of Range";
                                statusColor = "text-slate-400";
                                statusBg = "bg-slate-500/10";
                            }
                            
                            // Calculate Composition Percentage
                            const totalVal = (bin.amountX * CURRENT_PRICE) + bin.amountY;
                            const pctX = totalVal > 0 ? ((bin.amountX * CURRENT_PRICE) / totalVal) * 100 : 0;
                            const pctY = totalVal > 0 ? (bin.amountY / totalVal) * 100 : 0;

                            return (
                                <div key={bin.binId} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                                    {/* Row 1: Header */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-white bg-black/30 px-2 py-1 rounded border border-white/5">Bin {bin.binId}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusBg} ${statusColor} border border-white/5`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {bin.priceMin.toFixed(2)} - {bin.priceMax.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Row 2: Visual Bar */}
                                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4 border border-white/5">
                                        {/* Token X Part */}
                                        <div className="bg-emerald-500 h-full transition-all duration-500 relative group" style={{ width: `${pctX}%` }}>
                                             {pctX > 10 && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-black/60">{Math.round(pctX)}%</span>}
                                        </div>
                                        {/* Token Y Part */}
                                        <div className="bg-rose-500 h-full transition-all duration-500 relative group" style={{ width: `${pctY}%` }}>
                                             {pctY > 10 && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/90">{Math.round(pctY)}%</span>}
                                        </div>
                                    </div>

                                    {/* Row 3: Asset Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {/* Token X */}
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img src={selectedPool.tokenX.logo} className="w-6 h-6 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{selectedPool.tokenX.symbol}</span>
                                                    <span className="text-sm font-bold text-white font-mono">{bin.amountX.toFixed(4)}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">${(bin.amountX * CURRENT_PRICE).toFixed(2)}</span>
                                        </div>
                                        
                                        {/* Token Y */}
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img src={selectedPool.tokenY.logo} className="w-6 h-6 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{selectedPool.tokenY.symbol}</span>
                                                    <span className="text-sm font-bold text-white font-mono">{bin.amountY.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-mono">${bin.amountY.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Row 4: Footer */}
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                        <div className="text-xs text-slate-500 font-medium">
                                            Total Bin Value: <span className="text-slate-300 font-bold ml-1">${totalVal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setManagingBin(bin);
                                                    setManageAction('remove');
                                                }}
                                                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors shadow-lg"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={() => setActiveTab('add')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                        >
                            Add Liquidity
                        </button>
                        <button 
                            onClick={handleExitLiquidityClick}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl border border-white/5 transition-colors"
                        >
                            Exit Liquidity
                        </button>
                </div>
             </div>
          )}

        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 rounded-3xl h-full flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Liquidity Structure
                </h3>
                
                {activeTab === 'add' && (
                    <div className="flex gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                        <button className="px-2 py-1 text-xs text-blue-400 font-bold bg-blue-500/10 rounded border border-blue-500/20">Visual</button>
                        <button className="px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">Table</button>
                    </div>
                )}
            </div>

            {/* Shape Selector - Only Visible in ADD Mode */}
            {activeTab === 'add' && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {Object.values(LiquidityShape).map((s) => (
                  <button 
                    key={s}
                    onClick={() => setShape(s)}
                    className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                      shape === s 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-glow' 
                        : 'bg-black/20 border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            
            {/* Context Message for Positions Mode */}
            {activeTab === 'positions' && (
                <div className="mb-4 text-sm text-amber-200 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3 items-start">
                    <Info size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p>Your positions are highlighted in <span className="font-bold text-amber-400">Gold</span>. Bins within the blue range are currently active and earning fees.</p>
                </div>
            )}

            {/* The Liquidity Book Chart */}
            <div className="flex-grow w-full relative bg-black/40 rounded-2xl border border-white/5 p-4 shadow-inner">
              <LiquidityChart 
                bins={bins}
                userBins={activeTab === 'positions' ? userBins : []}
                activeBinId={ACTIVE_BIN_ID}
                tokenXSymbol={selectedPool.tokenX.symbol}
                tokenYSymbol={selectedPool.tokenY.symbol}
                currentPrice={CURRENT_PRICE}
                binStep={selectedPool.binStep}
              />
            </div>

            {/* Range Controls */}
            {activeTab === 'add' && (
              <div className="mt-8 px-2">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-300 font-bold">Concentration Radius</span>
                  <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{rangeRadius} bins</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={rangeRadius}
                  onChange={(e) => setRangeRadius(parseInt(e.target.value))}
                  className="w-full" // Using custom slider CSS from index.html
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-3 uppercase font-bold tracking-widest">
                  <span>Focused</span>
                  <span>Wide</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Liquidity;