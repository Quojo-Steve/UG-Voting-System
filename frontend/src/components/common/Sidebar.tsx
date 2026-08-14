import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  Users,
  Award,
  BarChart3,
  LogOut,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  currentElectionId?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentElectionId, className = '' }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/commissioner/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/commissioner/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: 'All Elections',
      to: '/commissioner/elections',
      icon: <Vote className="w-4 h-4" />,
      exact: true,
    },
  ];

  const electionSubItems = currentElectionId
    ? [
        {
          label: 'Overview',
          to: `/commissioner/elections/${currentElectionId}`,
          icon: <Vote className="w-4 h-4" />,
        },
        {
          label: 'Voter Register',
          to: `/commissioner/elections/${currentElectionId}/voters`,
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: 'Candidates',
          to: `/commissioner/elections/${currentElectionId}/candidates`,
          icon: <Award className="w-4 h-4" />,
        },
        {
          label: 'Results & Publishing',
          to: `/commissioner/elections/${currentElectionId}/results`,
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ]
    : [];

  return (
    <aside
      className={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 ${className}`}
    >
      <div>
        {/* Header badge */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">
              Commissioner Portal
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Electoral Commission UG</p>
          </div>
        </div>

        {/* Create quick action */}
        <div className="p-3">
          <NavLink
            to="/commissioner/elections/create"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Election</span>
          </NavLink>
        </div>

        {/* Nav list */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Active Election Scope */}
          {electionSubItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active Election Scope
              </div>
              <div className="space-y-1">
                {electionSubItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400 pl-2.5'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Commissioner'}</p>
            <p className="text-[10px] text-amber-400 font-mono">Verified EC Lead</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            title="Logout from Commissioner Portal"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
