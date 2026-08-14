import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { FileUpload } from '../../components/common/FileUpload';
import { DataTable, Column } from '../../components/common/DataTable';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { voterService } from '../../services/voterService';
import { electionService } from '../../services/electionService';
import { Voter, Election } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  Vote,
  Upload,
  AlertCircle,
} from 'lucide-react';

export const CommissionerVoters: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVoted, setFilterVoted] = useState<string>('ALL');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [elec, voterList] = await Promise.all([
        electionService.getElectionById(id),
        voterService.getVotersByElection(id),
      ]);
      setElection(elec);
      setVoters(voterList);
    } catch (err: any) {
      addToast(err.message || 'Failed to load voter registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFileUpload = async () => {
    if (!id || !selectedFile) return;
    setIsUploading(true);
    try {
      const result = await voterService.uploadVoterRegister(id, selectedFile);
      addToast(
        result.message || `Successfully imported ${result.importedCount} voters.`,
        'success',
        'Voter Register Imported'
      );
      setSelectedFile(null);
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to import voter register.', 'error', 'Import Failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,VoterID,Name,Email,Hall,Department\n' +
      '10982341,Kwame Mensah,kmensah@st.ug.edu.gh,Commonwealth Hall,Computer Science\n' +
      '10982342,Ama Serwaa,aserwaa@st.ug.edu.gh,Volta Hall,Political Science\n' +
      '10982343,Kofi Osei,kosei@st.ug.edu.gh,Legon Hall,Business Administration\n' +
      '10982344,Akosua Darko,adarko@st.ug.edu.gh,Akuafo Hall,Law';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UG_Voter_Register_Template_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded official voter register CSV sample template.', 'info');
  };

  if (loading) return <LoadingState message="Loading voter registry..." />;

  const filteredVoters = voters.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterVoted === 'ALL' ||
      (filterVoted === 'VOTED' && v.hasVoted) ||
      (filterVoted === 'NOT_VOTED' && !v.hasVoted);

    return matchesSearch && matchesFilter;
  });

  const votedCount = voters.filter((v) => v.hasVoted).length;
  const notVotedCount = voters.length - votedCount;
  const turnoutPercent = voters.length > 0 ? ((votedCount / voters.length) * 100).toFixed(1) : '0.0';

  const columns: Column<Voter>[] = [
    {
      header: 'Voter ID (Student ID)',
      accessorKey: 'voterId',
      cell: (row) => <span className="font-mono font-bold text-slate-900">{row.voterId}</span>,
    },
    {
      header: 'Student Name',
      accessorKey: 'name',
      cell: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
    },
    {
      header: 'UG Email',
      accessorKey: 'email',
      cell: (row) => <span className="text-slate-600 font-mono text-xs">{row.email}</span>,
    },
    {
      header: 'Hall / Dept',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.hall || '—'} {row.department ? `• ${row.department}` : ''}
        </span>
      ),
    },
    {
      header: 'Ballot Status',
      cell: (row) =>
        row.hasVoted ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Voted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Not Voted
          </span>
        ),
    },
    {
      header: 'Voted Time',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.votedAt ? new Date(row.votedAt).toLocaleTimeString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Voter Register — ${election?.name || 'Election'}`}
        description="Upload and audit official matriculated voter rolls. Secure one-person-one-vote enforcement."
        backTo={`/commissioner/elections/${id}`}
        backLabel="Back to Election"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download CSV Template
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Registered Voters"
          value={voters.length.toLocaleString()}
          subValue="In current register"
          icon={<Users className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          label="Ballots Cast"
          value={votedCount.toLocaleString()}
          subValue={`${turnoutPercent}% voter participation`}
          icon={<Vote className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Pending Votes"
          value={notVotedCount.toLocaleString()}
          subValue="Awaiting ballot submission"
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Upload Voter Register Card */}
      <Card
        title="Upload Verified Voter Register"
        subtitle="Accepts Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)"
      >
        <div className="space-y-4">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={(f) => setSelectedFile(f)}
            onClearFile={() => setSelectedFile(null)}
            title="Drag and drop official student register file here"
            description="Columns required: VoterID, Name, Email (and optional Hall, Department)"
          />

          {selectedFile && (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFileUpload}
                isLoading={isUploading}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Process & Import Register
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Filter and Table Card */}
      <Card
        title={`Registered Voters (${filteredVoters.length})`}
        subtitle="Live voter roster and voting status"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by Student ID, Name or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterVoted('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterVoted === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({voters.length})
              </button>
              <button
                onClick={() => setFilterVoted('VOTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterVoted === 'VOTED'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Voted ({votedCount})
              </button>
              <button
                onClick={() => setFilterVoted('NOT_VOTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterVoted === 'NOT_VOTED'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Not Voted ({notVotedCount})
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredVoters}
            keyExtractor={(v) => v.id}
            emptyMessage="No voters found matching your search or register."
          />
        </div>
      </Card>
    </div>
  );
};
