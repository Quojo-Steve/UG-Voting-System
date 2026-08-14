import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { HallTurnoutData } from '../../utils/chartData';
import { Building2, ArrowUpDown, Filter } from 'lucide-react';

export interface HallTurnoutChartProps {
  data: HallTurnoutData[];
  className?: string;
}

export const HallTurnoutChart: React.FC<HallTurnoutChartProps> = ({
  data,
  className = '',
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'Traditional' | 'Diaspora' | 'UGEL'>('ALL');
  const [sortBy, setSortBy] = useState<'turnout' | 'votes' | 'name'>('turnout');

  // Filter
  const filtered = data.filter((item) => {
    if (filterCategory === 'ALL') return true;
    return item.category === filterCategory;
  });

  // Sort
  const sortedData = [...filtered].sort((a, b) => {
    if (sortBy === 'turnout') return b.turnoutPercentage - a.turnoutPercentage;
    if (sortBy === 'votes') return b.votesCast - a.votesCast;
    return a.hallName.localeCompare(b.hallName);
  });

  const getBarColor = (turnout: number) => {
    if (turnout >= 70) return '#10B981'; // Emerald
    if (turnout >= 55) return '#F59E0B'; // Amber
    if (turnout >= 40) return '#3B82F6'; // Blue
    return '#64748B'; // Slate
  };

  const CustomHallTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as HallTurnoutData;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[220px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 pb-1.5 mb-1.5 border-b border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{item.hallName}</span>
          </div>

          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 inline-block mb-2">
            {item.category} Hall of Residence
          </span>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span>Ballots Cast:</span>
              <span className="font-mono font-bold text-white">
                {item.votesCast.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Registered Voters:</span>
              <span className="font-mono text-slate-400">
                {item.registeredVoters.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="font-semibold text-amber-400">Turnout Rate:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {item.turnoutPercentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Residential Electorate Breakdown
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Turnout Rate by University Hall
          </h3>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            {(['ALL', 'Traditional', 'Diaspora'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Halls' : cat}
              </button>
            ))}
          </div>

          {/* Sort Switcher */}
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'turnout' ? 'votes' : 'turnout')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            title="Toggle sort criterion"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort by: {sortBy === 'turnout' ? 'Turnout %' : 'Votes Cast'}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              dataKey="hallName"
              type="category"
              width={140}
              tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
              tickFormatter={(name) => name.replace(' Hall', '').replace(' & International', '')}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip content={<CustomHallTooltip />} />
            <Bar
              dataKey={sortBy === 'turnout' ? 'turnoutPercentage' : 'votesCast'}
              radius={[0, 6, 6, 0]}
              barSize={18}
            >
              {sortedData.map((entry) => (
                <Cell key={`cell-hall-${entry.hallId}`} fill={getBarColor(entry.turnoutPercentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color key indicator */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">High Turnout (&ge;70%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600">Moderate (55%–69%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600">Standard (&lt;55%)</span>
        </div>
      </div>
    </div>
  );
};
