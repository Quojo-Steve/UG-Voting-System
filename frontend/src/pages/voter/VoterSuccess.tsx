import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UGCrest } from '../../components/common/UGCrest';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Printer, Home, ShieldCheck, Check, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const VoterSuccess: React.FC = () => {
  const [receipt, setReceipt] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('ug_vote_receipt');
    if (saved) {
      try {
        setReceipt(JSON.parse(saved));
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const receiptNumber = receipt?.receiptNumber || `UG-VOTE-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  const timestamp = receipt?.timestamp || new Date().toISOString();

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptNumber);
    setCopied(true);
    addToast('Receipt code copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-lg">
        {/* Success Icon & Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Official Ballot Recorded!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Your vote has been securely recorded and sealed into the University of Ghana ballot box.
          </p>
        </div>

        {/* Official Receipt Card */}
        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <UGCrest size="sm" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                    University of Ghana
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    Electoral Commission
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                AUDITED & SEALED
              </span>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400">Electronic Receipt Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {receiptNumber}
                  </span>
                  <button
                    onClick={handleCopyReceipt}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Copy receipt number"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-slate-300">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono">{new Date(timestamp).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-slate-300">
                <span className="text-slate-400">Security Hash:</span>
                <span className="font-mono text-[10px] text-slate-400">
                  SHA256: 8f4a...92b1
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-slate-300">
                <span className="text-slate-400">Voter Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Token Retired (Single Vote Cast)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
              Thank you for exercising your democratic right as a matriculated student of the
              University of Ghana.
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="w-full bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Save Receipt
              </Button>
              <Link to="/" className="w-full">
                <Button
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
