import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HourlyVotingData } from '../../utils/chartData';
import { Clock, TrendingUp, Activity, Zap } from 'lucide-react';

export interface VotingTrendChartProps {
  data: HourlyVotingData[];
  totalVotesCast: number;
  totalRegistered: number;
  className?: string;
}

export const VotingTrendChart: React.FC<VotingTrendChartProps> = ({
  data,
  totalVotesCast,
  totalRegistered,
  className = '',
}) => {
  const [chartMode, setChartMode] = useState<'cumulative' | 'velocity'>('cumulative');

  // Custom Tooltip
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as HourlyVotingData;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 pb-2 mb-2 border-b border-slate-800">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.timeLabel}</span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span>Cumulative Ballots:</span>
              <span className="font-mono font-bold text-white text-sm">
                {item.cumulativeVotes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hourly Voting Flow:</span>
              <span className="font-mono font-bold text-amber-400">
                +{item.hourlyVotes.toLocaleString()} votes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Turnout at Hour:</span>
              <span className="font-mono font-bold text-emerald-400">{item.turnoutPercentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const peakHour = [...data].sort((a, b) => b.hourlyVotes - a.hourlyVotes)[0];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Temporal Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              POLLING DAY FLOW
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Voting Throughput & Cumulative Velocity
          </h3>
        </div>

        {/* Mode Toggle */}
        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'cumulative'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Cumulative Turnout</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('velocity')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'velocity'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-600" />
            <span>Hourly Flow (Velocity)</span>
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'cumulative' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="turnoutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${val.toLocaleString()}`}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeVotes"
                stroke="#D97706"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#turnoutGradient)"
                name="Cumulative Votes"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `+${val.toLocaleString()}`}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Bar
                dataKey="hourlyVotes"
                fill="#0284C7"
                radius={[6, 6, 0, 0]}
                name="Hourly Votes Cast"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Peak Voting Surge:</span>
          <span className="font-bold text-slate-900">
            {peakHour ? `${peakHour.timeLabel} (+${peakHour.hourlyVotes.toLocaleString()} votes)` : 'N/A'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Current Velocity Rate:</span>
          <span className="font-bold text-slate-900">
            ~{Math.round(totalVotesCast / (data.length || 1)).toLocaleString()} ballots / hr
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
          <span className="text-amber-800 font-semibold block">Total Turnout Recorded:</span>
          <span className="font-bold text-amber-950">
            {totalRegistered > 0
              ? `${((totalVotesCast / totalRegistered) * 100).toFixed(1)}% of eligible roll`
              : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
