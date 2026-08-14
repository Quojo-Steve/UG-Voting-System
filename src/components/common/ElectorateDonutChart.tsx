import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldCheck, Users, Vote } from 'lucide-react';

export interface ElectorateDonutChartProps {
  totalRegistered: number;
  totalVotesCast: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ElectorateDonutChart: React.FC<ElectorateDonutChartProps> = ({
  totalRegistered,
  totalVotesCast,
  title = 'Electorate Participation Share',
  subtitle = 'Voted vs. Remaining Registered Ballots',
  className = '',
}) => {
  const pendingVoters = Math.max(totalRegistered - totalVotesCast, 0);
  const turnoutPct =
    totalRegistered > 0 ? ((totalVotesCast / totalRegistered) * 100).toFixed(1) : '0.0';

  const chartData = [
    { name: 'Verified Ballots Cast', value: totalVotesCast, color: '#F59E0B' }, // UG Gold
    { name: 'Pending / Uncast', value: pendingVoters, color: '#E2E8F0' }, // Slate 200
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct =
        totalRegistered > 0 ? ((data.value / totalRegistered) * 100).toFixed(1) : '0.0';
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[180px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="font-bold text-slate-100">{data.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Total:</span>
            <span className="font-mono font-bold text-white">{data.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Share:</span>
            <span className="font-mono font-bold text-amber-400">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="pb-3 border-b border-slate-100 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
          Telemetry Summary
        </span>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative h-56 sm:h-60 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={92}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-electorate-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {turnoutPct}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Turnout Rate
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="font-semibold text-amber-950">Ballots Cast</span>
          </div>
          <span className="font-mono font-bold text-amber-950">
            {totalVotesCast.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
            <span className="text-slate-700">Remaining Uncast</span>
          </div>
          <span className="font-mono text-slate-600">
            {pendingVoters.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
