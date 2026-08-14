import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { Plus, Trash2, Calendar, Clock, Award, ShieldCheck } from 'lucide-react';

export const CommissionerCreateElection: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-08-20');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('2026-08-20');
  const [endTime, setEndTime] = useState('17:00');
  const [positions, setPositions] = useState<string[]>([
    'SRC President & Vice President',
    'General Secretary',
    'Financial Secretary',
  ]);
  const [newPositionName, setNewPositionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddPosition = () => {
    if (!newPositionName.trim()) return;
    setPositions([...positions, newPositionName.trim()]);
    setNewPositionName('');
  };

  const handleRemovePosition = (index: number) => {
    if (positions.length <= 1) {
      addToast('An election must include at least one executive portfolio.', 'warning');
      return;
    }
    setPositions(positions.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Election title is required.';
    if (!description.trim()) errs.description = 'Election description is required.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (!endDate) errs.endDate = 'End date is required.';
    if (positions.length === 0) errs.positions = 'At least one position is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await electionService.createElection({
        name: name.trim(),
        description: description.trim(),
        startDate,
        startTime,
        endDate,
        endTime,
        positions,
      });

      addToast('New election created successfully in DRAFT mode.', 'success', 'Election Created');
      navigate(`/commissioner/elections/${created.id}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to create election.', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create New Election"
        description="Configure election parameters, voting schedules, and executive portfolios."
        backTo="/commissioner/elections"
        backLabel="Back to Elections"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card title="1. Election Details" subtitle="General identity and administrative description">
          <div className="space-y-4">
            <Input
              label="Election Title"
              required
              placeholder="e.g. UG SRC General Elections 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              helperText="Official recognized title published on ballot papers."
            />

            <Textarea
              label="Description & Scope"
              required
              rows={3}
              placeholder="Provide context regarding this election, student jurisdiction, and eligibility guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />
          </div>
        </Card>

        {/* Voting Window & Schedule */}
        <Card
          title="2. Voting Window Schedule"
          subtitle="Define when the digital ballot polls will open and close"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Voting Start Date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.startDate}
              />
            </div>
            <div>
              <Input
                label="Poll Opening Time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
              />
            </div>
            <div>
              <Input
                label="Voting End Date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.endDate}
              />
            </div>
            <div>
              <Input
                label="Poll Closing Time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
              />
            </div>
          </div>
        </Card>

        {/* Executive Positions */}
        <Card
          title="3. Contested Positions / Portfolios"
          subtitle="Positions that candidates will contest for and voters will cast ballots on"
        >
          <div className="space-y-4">
            {/* List of positions */}
            <div className="space-y-2">
              {positions.map((pos, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-900 border border-amber-400/40 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{pos}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add position input */}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="e.g. Women's Commissioner, Organizing Secretary"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPosition();
                  }
                }}
                leftIcon={<Award className="w-4 h-4" />}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPosition}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Position
              </Button>
            </div>
            {errors.positions && <p className="text-xs text-red-600 font-medium">{errors.positions}</p>}
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/commissioner/elections')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Create Election (Save Draft)
          </Button>
        </div>
      </form>
    </div>
  );
};
