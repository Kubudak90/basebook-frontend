import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Bin, UserBinPosition } from '../types';

interface LiquidityChartProps {
  bins: Bin[];
  userBins?: UserBinPosition[];
  activeBinId: number;
  tokenXSymbol: string;
  tokenYSymbol: string;
  currentPrice: number;
  binStep: number;
}

export const LiquidityChart: React.FC<LiquidityChartProps> = ({ 
  bins, 
  userBins = [],
  activeBinId, 
  tokenXSymbol, 
  tokenYSymbol, 
  currentPrice,
  binStep
}) => {
  
  const chartData = useMemo(() => {
    return bins.map(bin => {
        // Calculate the upper bound of the price range for this bin
        const nextPrice = bin.price * (1 + binStep / 10000);
        
        // Find if user has liquidity in this bin
        const userPosition = userBins.find(ub => ub.binId === bin.id);
        const userLiquidity = userPosition ? (userPosition.amountX * bin.price + userPosition.amountY) : 0; // Simplified total value approx

        return {
            ...bin,
            liquidityTotal: bin.liquidityX + bin.liquidityY,
            userLiquidity: userLiquidity > 0 ? (bin.liquidityX + bin.liquidityY) * 0.4 : 0, // Visual mock: User owns 40% of bin if active
            displayPrice: bin.price.toFixed(2), // Simplified for X-Axis label
            priceStart: bin.price,
            priceEnd: nextPrice
        }
    });
  }, [bins, binStep, userBins]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasUserLiq = data.userLiquidity > 0;

      return (
        <div className="glass-panel p-3 rounded-xl shadow-2xl text-xs min-w-[200px] z-50 border border-white/10">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
             <span className="font-bold text-slate-200">Bin {data.id}</span>
             {data.isCurrent && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">Active</span>}
          </div>
          
          <div className="mb-3">
             <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Price Range ({tokenYSymbol})</div>
             <div className="font-mono text-white text-sm font-bold">
                {data.priceStart.toFixed(4)} <span className="text-slate-600 mx-1">-</span> {data.priceEnd.toFixed(4)}
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                    {tokenXSymbol}
                </span>
                <span className="text-white font-mono">{data.liquidityX.toFixed(4)}</span>
             </div>
             <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
                    {tokenYSymbol}
                </span>
                <span className="text-white font-mono">{data.liquidityY.toFixed(4)}</span>
             </div>
             
             {hasUserLiq && (
                <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                             My Position
                        </span>
                        <span className="text-amber-200 font-mono font-bold text-sm">Active</span>
                    </div>
                </div>
             )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <div className="flex justify-between items-center mb-4 text-xs font-medium">
        <span className="text-slate-400 uppercase tracking-wider">Liquidity Depth</span>
        <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Current: {currentPrice.toFixed(4)}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barGap={-100}> {/* Negative gap to overlap bars */}
          <XAxis 
            dataKey="displayPrice" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis hide />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <ReferenceLine x={chartData.find(b => b.id === activeBinId)?.displayPrice} stroke="#60a5fa" strokeDasharray="3 3" />
          
          {/* Market Liquidity (Background) */}
          <Bar dataKey="liquidityTotal" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.id === activeBinId ? '#3b82f6' : (entry.id < activeBinId ? '#f43f5e' : '#10b981')} 
                fillOpacity={entry.id === activeBinId ? 1 : 0.3}
                style={entry.id === activeBinId ? { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' } : {}}
              />
            ))}
          </Bar>

          {/* User Liquidity (Foreground/Overlay) */}
          <Bar dataKey="userLiquidity" radius={[4, 4, 0, 0]}>
             {chartData.map((entry, index) => (
              <Cell 
                key={`user-cell-${index}`} 
                fill="#fbbf24" // Amber/Gold for User
                fillOpacity={1}
                stroke="#fff"
                strokeWidth={entry.userLiquidity > 0 ? 1 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full opacity-50"></div>Bids</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>Active</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full opacity-50"></div>Asks</div>
        <div className="flex items-center gap-2 ml-4"><div className="w-2 h-2 bg-amber-400 rounded-full border border-white"></div>My Bins</div>
      </div>
    </div>
  );
};