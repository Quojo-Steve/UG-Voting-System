import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { PositionResult } from '../../types';
import { Trophy, BarChart3, PieChart as PieIcon, List, User } from 'lucide-react';

export interface ResultChartProps {
  positionResult: PositionResult;
  showWinnerBadge?: boolean;
  className?: string;
  defaultView?: 'bars' | 'pie' | 'cards';
}

const CANDIDATE_COLORS = [
  '#F59E0B', // Amber 500 (UG Gold)
  '#1E293B', // Slate 800 (UG Navy)
  '#10B981', // Emerald 500
  '#3B82F6', // Blue 500
  '#8B5CF6', // Purple 500
  '#EC4899', // Pink 500
  '#14B8A6', // Teal 500
  '#F97316', // Orange 500
];

export const ResultChart: React.FC<ResultChartProps> = ({
  positionResult,
  showWinnerBadge = true,
  className = '',
  defaultView = 'bars',
}) => {
  const [activeTab, setActiveTab] = useState<'bars' | 'pie' | 'cards'>(defaultView);

  // Prepare chart dataset
  const chartData = positionResult.candidates.map((cand, idx) => ({
    name: cand.candidateName,
    shortName: cand.candidateName.split(' ')[0] + ' ' + (cand.candidateName.split(' ')[1]?.[0] ? cand.candidateName.split(' ')[1][0] + '.' : ''),
    votes: cand.votes,
    percentage: cand.percentage,
    rank: cand.rank,
    runningMate: cand.runningMate,
    color: CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length],
  }));

  // Custom Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
          <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-800">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-slate-100 truncate">{data.name}</span>
          </div>
          {data.runningMate && (
            <p className="text-[11px] text-amber-300 mb-1">Mate: {data.runningMate}</p>
          )}
          <div className="flex justify-between items-center text-slate-300">
            <span>Votes Count:</span>
            <span className="font-mono font-bold text-white text-sm">
              {data.votes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300 mt-0.5">
            <span>Vote Share:</span>
            <span className="font-mono font-bold text-amber-400">{data.percentage}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 mt-0.5">
            <span>Rank Position:</span>
            <span className="font-bold text-slate-200">#{data.rank}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Position Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Executive Portfolio Return
          </span>
          <h3 className="text-base font-bold text-slate-900">{positionResult.positionName}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Total Ballots:{' '}
            <span className="font-bold text-slate-900">
              {positionResult.totalVotes.toLocaleString()}
            </span>
          </div>

          {/* Tab Switcher Buttons */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('bars')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'bars'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bar Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pie')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'pie'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vote Share Donut View"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vote Share</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Detailed Card List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ranked List</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: RECHARTS HORIZONTAL / VERTICAL BAR CHART */}
      {activeTab === 'bars' && (
        <div className="space-y-4">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dataMax: number) => Math.max(dataMax * 1.15, 100)]}
                  tickFormatter={(val) => `${val.toLocaleString()} votes`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  dataKey="shortName"
                  type="category"
                  width={110}
                  tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Mini Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800">{item.name}</span>
                <span className="text-slate-500 font-mono">({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: RECHARTS PIE / DONUT CHART */}
      {activeTab === 'pie' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="votes"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomBarTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Electoral Share Breakdown
            </h4>
            <div className="divide-y divide-slate-100">
              {chartData.map((item) => (
                <div key={item.name} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="font-mono text-slate-600">
                      {item.votes.toLocaleString()} votes
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md font-mono font-bold text-white text-[11px]"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RANKED CARDS WITH PROGRESS BARS */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {positionResult.candidates.map((cand, index) => {
            const isLeader = index === 0 && cand.votes > 0;
            return (
              <div
                key={cand.candidateId}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isLeader
                    ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        cand.rank === 1
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : cand.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{cand.rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {cand.candidateName}
                        </span>
                        {showWinnerBadge && isLeader && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 border border-amber-400">
                            <Trophy className="w-3 h-3 text-amber-600" /> Leading / Elected
                          </span>
                        )}
                      </div>
                      {cand.runningMate && (
                        <p className="text-xs text-amber-800 truncate">
                          Running Mate: {cand.runningMate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-slate-900 block">
                      {cand.votes.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">votes</span>
                    </span>
                    <span className="text-xs font-bold text-amber-700">{cand.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLeader ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(cand.percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {positionResult.candidates.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-6">
          No candidate votes recorded for this position.
        </p>
      )}
    </div>
  );
};
