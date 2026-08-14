import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { CandidateCard } from '../../components/common/CandidateCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { candidateService } from '../../services/candidateService';
import { electionService } from '../../services/electionService';
import { Candidate, Election } from '../../types';
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Award,
  User,
  GraduationCap,
  Building2,
  BookOpen,
} from 'lucide-react';

export const CommissionerCandidates: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review modal state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [elec, candList] = await Promise.all([
        electionService.getElectionById(id),
        candidateService.getCandidates(id),
      ]);
      setElection(elec);
      setCandidates(candList);
    } catch (err: any) {
      addToast(err.message || 'Failed to load candidates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async (cand: Candidate) => {
    setIsProcessing(true);
    try {
      await candidateService.reviewCandidate(cand.id, 'APPROVED');
      addToast(`Candidate "${cand.fullName}" has been approved for the ballot.`, 'success');
      setSelectedCandidate(null);
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to approve candidate', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (cand: Candidate) => {
    setCandidateToReject(cand);
    setRejectionNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!candidateToReject) return;
    setIsProcessing(true);
    try {
      await candidateService.reviewCandidate(candidateToReject.id, 'REJECTED', rejectionNotes);
      addToast(`Candidate "${candidateToReject.fullName}" application rejected.`, 'info');
      setRejectModalOpen(false);
      setCandidateToReject(null);
      setSelectedCandidate(null);
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <LoadingState message="Loading candidate applications..." />;

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentId.includes(searchQuery) ||
      c.positionName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = candidates.filter((c) => c.status === 'PENDING').length;
  const approvedCount = candidates.filter((c) => c.status === 'APPROVED').length;
  const rejectedCount = candidates.filter((c) => c.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Candidate Applications — ${election?.name || 'Election'}`}
        description="Vet student aspirants, inspect manifestos, and certify candidates for ballot placement."
        backTo={`/commissioner/elections/${id}`}
        backLabel="Back to Election"
      />

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search candidates by name, student ID, position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({candidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              statusFilter === 'REJECTED'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title="No candidate applications found"
          description="No candidate filings match your query or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => (
            <CandidateCard
              key={cand.id}
              candidate={cand}
              showActions={true}
              onApprove={handleApprove}
              onReject={handleOpenReject}
              onViewDetails={(c) => setSelectedCandidate(c)}
            />
          ))}
        </div>
      )}

      {/* Candidate Details Modal */}
      <Modal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title="Candidate Application Dossier"
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                {selectedCandidate.avatarUrl ? (
                  <img
                    src={selectedCandidate.avatarUrl}
                    alt={selectedCandidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCandidate.fullName}
                  </h3>
                  <StatusBadge status={selectedCandidate.status} />
                </div>
                <p className="text-sm font-bold text-amber-700 mt-0.5">
                  Portfolio: {selectedCandidate.positionName}
                </p>
                {selectedCandidate.runningMate && (
                  <p className="text-xs text-amber-900 mt-1">
                    <span className="font-semibold">Running Mate:</span>{' '}
                    {selectedCandidate.runningMate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block mb-1">Student ID</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedCandidate.studentId}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block mb-1">Hall of Residence</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.hallOfResidence || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block mb-1">Academic Level</span>
                <span className="font-semibold text-slate-900">
                  {selectedCandidate.level || 'Level 300'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Candidate Manifesto & Platform
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {selectedCandidate.manifesto || 'No manifesto provided.'}
              </div>
            </div>

            {selectedCandidate.reviewNotes && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Commission Notes:</span>{' '}
                {selectedCandidate.reviewNotes}
              </div>
            )}

            {selectedCandidate.status === 'PENDING' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => handleOpenReject(selectedCandidate)}
                  className="hover:border-red-300 hover:text-red-700"
                >
                  Reject Application
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(selectedCandidate)}
                  isLoading={isProcessing}
                >
                  Approve for Ballot
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal with Reason Input */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Candidate Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a specific reason for rejecting{' '}
            <strong className="text-slate-900">{candidateToReject?.fullName}</strong>'s application.
            This note will be recorded in the official election log.
          </p>

          <Textarea
            label="Rejection Reason / Electoral Disqualification Note"
            required
            rows={3}
            placeholder="e.g. Failure to meet academic standing requirement, missing running mate nomination form..."
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              isLoading={isProcessing}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
