import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ElectionCard } from '../../components/common/ElectionCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { electionService } from '../../services/electionService';
import { Election, ElectionStatus } from '../../types';
import { PlusCircle, Search, Filter } from 'lucide-react';

export const CommissionerElections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    electionService
      .getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error('Failed to load elections', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredElections = elections.filter((elec) => {
    const matchesSearch =
      elec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      elec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || elec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingState message="Loading election registry..." />;
  }

  const statuses: { label: string; value: string }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Live', value: 'LIVE' },
    { label: 'Registration Open', value: 'REGISTRATION' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Results Published', value: 'RESULTS_PUBLISHED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Elections"
        description="Comprehensive list of university elections, voting windows, and administrative controls."
        actions={
          <Link to="/commissioner/elections/create">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Create New Election
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search elections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elections Grid */}
      {filteredElections.length === 0 ? (
        <EmptyState
          title="No elections matched your criteria"
          description="Try modifying your search keywords or status filter, or create a new election."
          actionText="Create New Election"
          onAction={() => (window.location.href = '/commissioner/elections/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((elec) => (
            <ElectionCard
              key={elec.id}
              election={elec}
              portal="commissioner"
            />
          ))}
        </div>
      )}
    </div>
  );
};
