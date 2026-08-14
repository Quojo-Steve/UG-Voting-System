import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UGCrest } from '../../components/common/UGCrest';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  BookOpen,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';

export const CandidateRegister: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hallOfResidence, setHallOfResidence] = useState('Commonwealth Hall');
  const [department, setDepartment] = useState('Computer Science');
  const [level, setLevel] = useState('Level 300');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerCandidate } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !studentId || !email || !password) {
      setError('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCandidate({
        fullName,
        studentId,
        email,
        password,
        hallOfResidence,
        department,
        level,
      });

      addToast('Candidate account registered successfully!', 'success');
      navigate('/candidate/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const halls = [
    { label: 'Commonwealth Hall', value: 'Commonwealth Hall' },
    { label: 'Volta Hall', value: 'Volta Hall' },
    { label: 'Legon Hall', value: 'Legon Hall' },
    { label: 'Akuafo Hall', value: 'Akuafo Hall' },
    { label: 'Mensah Sarbah Hall', value: 'Mensah Sarbah Hall' },
    { label: 'Jean Nelson Aka Hall', value: 'Jean Nelson Aka Hall' },
    { label: 'Alexander Kwapong Hall', value: 'Alexander Kwapong Hall' },
    { label: 'Hilla Limann Hall', value: 'Hilla Limann Hall' },
    { label: 'Elizabeth Frances Sey Hall', value: 'Elizabeth Frances Sey Hall' },
    { label: 'Pentagon Hostels', value: 'Pentagon Hostels' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-lg">
        <Link
          to="/candidate/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Sign-In</span>
        </Link>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UGCrest size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Register Candidate Account
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create an aspirant profile to file nomination papers for open student offices
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            <Input
              label="Full Name (as registered with UG Academic Affairs)"
              required
              placeholder="e.g. Kwame Mensah"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student ID Number"
                required
                placeholder="10982341"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />

              <Select
                label="Academic Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                options={[
                  { label: 'Level 100', value: 'Level 100' },
                  { label: 'Level 200', value: 'Level 200' },
                  { label: 'Level 300', value: 'Level 300' },
                  { label: 'Level 400', value: 'Level 400' },
                  { label: 'Postgraduate', value: 'Postgraduate' },
                ]}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Hall of Residence / Affiliation"
                value={hallOfResidence}
                onChange={(e) => setHallOfResidence(e.target.value)}
                options={halls}
                className="bg-slate-800 border-slate-700 text-white"
              />

              <Input
                label="Department / Course"
                required
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                leftIcon={<BookOpen className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Input
              label="Student Email Address"
              type="email"
              required
              placeholder="kmensah@st.ug.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />

            <Input
              label="Account Password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Create Candidate Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/candidate/login" className="text-amber-400 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
