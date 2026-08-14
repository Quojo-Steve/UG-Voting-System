import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ElectionCard } from '../../components/common/ElectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { electionService } from '../../services/electionService';
import { Election } from '../../types';

export const CandidateElections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionService
      .getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error('Failed to load elections', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading student elections..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Elections"
        description="Select an election to file your nomination papers or view portfolio requirements."
        backTo="/candidate/dashboard"
        backLabel="Back to Dashboard"
      />

      {elections.length === 0 ? (
        <EmptyState
          title="No elections available"
          description="There are currently no active or upcoming elections scheduled."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((elec) => (
            <ElectionCard
              key={elec.id}
              election={elec}
              portal="candidate"
            />
          ))}
        </div>
      )}
    </div>
  );
};
