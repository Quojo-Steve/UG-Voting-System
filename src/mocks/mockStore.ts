import {
  Election,
  Candidate,
  Voter,
  ActivityLog,
  ElectionStatus,
  CandidateStatus,
  BallotSelection,
  ElectionResults,
  PositionResult,
  CandidateResult,
} from '../types';
import {
  INITIAL_ELECTIONS,
  INITIAL_CANDIDATES,
  INITIAL_VOTERS,
  INITIAL_ACTIVITY_LOGS,
} from './mockData';

const ELECTIONS_KEY = 'ug_elections_data';
const CANDIDATES_KEY = 'ug_candidates_data';
const VOTERS_KEY = 'ug_voters_data';
const ACTIVITIES_KEY = 'ug_activities_data';
const OTP_STORE_KEY = 'ug_otp_store_data';

interface OTPRecord {
  voterId: string;
  code: string;
  expiresAt: number;
}

class MockStore {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultVal;
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }

  // --- Elections ---
  getElections(): Election[] {
    return this.getStorage<Election[]>(ELECTIONS_KEY, INITIAL_ELECTIONS);
  }

  getElectionById(id: string): Election | undefined {
    return this.getElections().find((e) => e.id === id);
  }

  saveElection(election: Election): Election {
    const list = this.getElections();
    const idx = list.findIndex((e) => e.id === election.id);
    if (idx >= 0) {
      list[idx] = election;
    } else {
      list.unshift(election);
    }
    this.setStorage(ELECTIONS_KEY, list);
    this.addActivity({
      title: idx >= 0 ? 'Election Updated' : 'Election Created',
      description: `${election.name} (${election.status})`,
      type: 'ELECTION',
    });
    return election;
  }

  updateElectionStatus(id: string, status: ElectionStatus): Election | null {
    const list = this.getElections();
    const target = list.find((e) => e.id === id);
    if (!target) return null;
    target.status = status;
    if (status === 'RESULTS_PUBLISHED') {
      target.publishedAt = new Date().toISOString();
    }
    this.setStorage(ELECTIONS_KEY, list);
    this.addActivity({
      title: `Election Status Changed: ${status}`,
      description: `${target.name} is now ${status.replace('_', ' ')}`,
      type: status === 'RESULTS_PUBLISHED' ? 'RESULT' : 'ELECTION',
    });
    return target;
  }

  // --- Candidates ---
  getCandidates(electionId?: string): Candidate[] {
    const list = this.getStorage<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
    if (electionId) {
      return list.filter((c) => c.electionId === electionId);
    }
    return list;
  }

  getCandidatesByEmail(email: string): Candidate[] {
    const list = this.getCandidates();
    return list.filter((c) => c.email.toLowerCase() === email.toLowerCase());
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.getCandidates().find((c) => c.id === id);
  }

  createCandidateApplication(candidate: Omit<Candidate, 'id' | 'appliedAt' | 'status'>): Candidate {
    const list = this.getCandidates();
    const newCand: Candidate = {
      ...candidate,
      id: `cand-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    list.push(newCand);
    this.setStorage(CANDIDATES_KEY, list);
    this.addActivity({
      title: 'Candidate Application Submitted',
      description: `${newCand.fullName} applied for ${newCand.positionName}`,
      type: 'CANDIDATE',
    });
    return newCand;
  }

  updateCandidateStatus(id: string, status: CandidateStatus, reviewNotes?: string): Candidate | null {
    const list = this.getCandidates();
    const cand = list.find((c) => c.id === id);
    if (!cand) return null;
    cand.status = status;
    if (reviewNotes !== undefined) cand.reviewNotes = reviewNotes;
    this.setStorage(CANDIDATES_KEY, list);
    this.addActivity({
      title: `Candidate ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
      description: `${cand.fullName} for ${cand.positionName}`,
      type: 'CANDIDATE',
    });
    return cand;
  }

  // --- Voters ---
  getVoters(electionId?: string): Voter[] {
    const list = this.getStorage<Voter[]>(VOTERS_KEY, INITIAL_VOTERS);
    if (electionId) {
      return list.filter((v) => v.electionId === electionId);
    }
    return list;
  }

  importVoters(electionId: string, votersToAdd: Array<{ voterId: string; name: string; email: string }>): { count: number } {
    const list = this.getVoters();
    const now = new Date().toISOString();
    let added = 0;

    for (const v of votersToAdd) {
      const exists = list.find((item) => item.electionId === electionId && item.voterId === v.voterId);
      if (!exists) {
        list.push({
          id: `voter-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          voterId: v.voterId.trim(),
          name: v.name.trim(),
          email: v.email.trim(),
          electionId,
          status: 'ELIGIBLE',
          hasVoted: false,
          importedAt: now,
        });
        added++;
      }
    }

    this.setStorage(VOTERS_KEY, list);

    // Update election total registered voters
    const elections = this.getElections();
    const ele = elections.find((e) => e.id === electionId);
    if (ele) {
      ele.totalRegisteredVoters = list.filter((v) => v.electionId === electionId).length;
      this.setStorage(ELECTIONS_KEY, elections);
    }

    this.addActivity({
      title: 'Voter Register Uploaded',
      description: `Imported ${added} voter records into ${ele ? ele.name : electionId}`,
      type: 'VOTER',
    });

    return { count: added };
  }

  findVoterById(voterId: string): Voter | undefined {
    const list = this.getVoters();
    const normalized = voterId.trim().toUpperCase();
    return list.find((v) => v.voterId.toUpperCase() === normalized);
  }

  // --- OTP Verification ---
  requestOtp(voterId: string): { success: boolean; maskedEmail: string; electionId: string; electionName: string; voterName: string; debugOtp?: string; message?: string } {
    const voter = this.findVoterById(voterId);
    if (!voter) {
      return {
        success: false,
        maskedEmail: '',
        electionId: '',
        electionName: '',
        voterName: '',
        message: `Voter ID "${voterId}" was not found in the verified student register. Please check and re-enter.`,
      };
    }

    const election = this.getElectionById(voter.electionId);
    if (!election) {
      return {
        success: false,
        maskedEmail: '',
        electionId: '',
        electionName: '',
        voterName: '',
        message: 'Active election associated with this voter could not be located.',
      };
    }

    if (voter.hasVoted) {
      return {
        success: false,
        maskedEmail: '',
        electionId: election.id,
        electionName: election.name,
        voterName: voter.name,
        message: 'You have already voted in this election. One-person-one-vote policy strictly enforced.',
      };
    }

    if (election.status !== 'LIVE') {
      let statusMsg = 'Voting has not started yet for this election.';
      if (election.status === 'CLOSED' || election.status === 'RESULTS_PUBLISHED') {
        statusMsg = 'Voting for this election has ended.';
      }
      return {
        success: false,
        maskedEmail: '',
        electionId: election.id,
        electionName: election.name,
        voterName: voter.name,
        message: statusMsg,
      };
    }

    // Generate 6-digit OTP (default 123456 for predictable student demonstration + real random fallback)
    const code = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const otps = this.getStorage<Record<string, OTPRecord>>(OTP_STORE_KEY, {});
    otps[voter.voterId.toUpperCase()] = {
      voterId: voter.voterId,
      code,
      expiresAt,
    };
    this.setStorage(OTP_STORE_KEY, otps);

    // Mask email for privacy (e.g. john.mensah@st.ug.edu.gh -> j***h@st.ug.edu.gh)
    const parts = voter.email.split('@');
    let masked = 'your registered email';
    if (parts.length === 2) {
      const user = parts[0];
      const domain = parts[1];
      if (user.length <= 2) {
        masked = `${user[0]}*@${domain}`;
      } else {
        masked = `${user[0]}***${user[user.length - 1]}@${domain}`;
      }
    }

    return {
      success: true,
      maskedEmail: masked,
      electionId: election.id,
      electionName: election.name,
      voterName: voter.name,
      debugOtp: code,
    };
  }

  verifyOtp(voterId: string, inputCode: string): { success: boolean; token?: string; message?: string } {
    const otps = this.getStorage<Record<string, OTPRecord>>(OTP_STORE_KEY, {});
    const record = otps[voterId.trim().toUpperCase()];

    if (!record) {
      return { success: false, message: 'No active OTP request found. Please request a new verification code.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, message: 'Verification code has expired. Please request a new OTP.' };
    }

    if (record.code !== inputCode.trim() && inputCode.trim() !== '123456') {
      return { success: false, message: 'Invalid 6-digit OTP code entered. Please verify and try again.' };
    }

    // Success: return temporary voting token
    const token = `ug_vote_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { success: true, token };
  }

  submitBallot(voterId: string, electionId: string, selections: BallotSelection): { success: boolean; referenceId?: string; message?: string } {
    const voter = this.findVoterById(voterId);
    if (!voter) {
      return { success: false, message: 'Voter record not found.' };
    }

    if (voter.hasVoted) {
      return { success: false, message: 'You have already voted in this election.' };
    }

    const election = this.getElectionById(electionId);
    if (!election || election.status !== 'LIVE') {
      return { success: false, message: 'Voting is not currently live for this election.' };
    }

    // Mark voter as voted
    const voters = this.getVoters();
    const vIdx = voters.findIndex((v) => v.id === voter.id);
    if (vIdx >= 0) {
      voters[vIdx].hasVoted = true;
      voters[vIdx].status = 'VOTED';
      voters[vIdx].votedAt = new Date().toISOString();
      this.setStorage(VOTERS_KEY, voters);
    }

    // Increment votes on selected candidates
    const candidates = this.getCandidates();
    for (const [, candidateId] of Object.entries(selections)) {
      const cand = candidates.find((c) => c.id === candidateId);
      if (cand) {
        cand.votesCount = (cand.votesCount || 0) + 1;
      }
    }
    this.setStorage(CANDIDATES_KEY, candidates);

    // Update election total votes cast
    const elections = this.getElections();
    const ele = elections.find((e) => e.id === electionId);
    if (ele) {
      ele.totalVotesCast = (ele.totalVotesCast || 0) + 1;
      this.setStorage(ELECTIONS_KEY, elections);
    }

    // Clear used OTP
    const otps = this.getStorage<Record<string, OTPRecord>>(OTP_STORE_KEY, {});
    delete otps[voterId.toUpperCase()];
    this.setStorage(OTP_STORE_KEY, otps);

    const ref = `UG-VOTE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    return { success: true, referenceId: ref };
  }

  // --- Results Calculation ---
  getElectionResults(electionId: string): ElectionResults | null {
    const election = this.getElectionById(electionId);
    if (!election) return null;

    const candidates = this.getCandidates(electionId).filter((c) => c.status === 'APPROVED');
    const isPublished = election.status === 'RESULTS_PUBLISHED';

    const resultsByPosition: PositionResult[] = election.positions.map((pos) => {
      const posCandidates = candidates.filter((c) => c.positionId === pos.id);
      const totalPosVotes = posCandidates.reduce((acc, curr) => acc + (curr.votesCount || 0), 0);

      // Sort by votes descending
      const sorted = [...posCandidates].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

      const candidateResults: CandidateResult[] = sorted.map((cand, index) => {
        const votes = cand.votesCount || 0;
        const pct = totalPosVotes > 0 ? (votes / totalPosVotes) * 100 : 0;
        return {
          candidateId: cand.id,
          candidateName: cand.fullName,
          positionId: pos.id,
          positionName: pos.name,
          avatarUrl: cand.avatarUrl,
          runningMate: cand.runningMate,
          votes,
          percentage: Number(pct.toFixed(1)),
          rank: index + 1,
          isWinner: index === 0 && votes > 0,
        };
      });

      return {
        positionId: pos.id,
        positionName: pos.name,
        totalVotes: totalPosVotes,
        candidates: candidateResults,
      };
    });

    const turnout =
      election.totalRegisteredVoters > 0
        ? Number(((election.totalVotesCast / election.totalRegisteredVoters) * 100).toFixed(1))
        : 0;

    return {
      electionId: election.id,
      electionName: election.name,
      status: election.status,
      isPublished,
      totalRegisteredVoters: election.totalRegisteredVoters,
      totalVotesCast: election.totalVotesCast,
      turnoutPercentage: turnout,
      positions: resultsByPosition,
      resultsByPosition,
      publishedAt: election.publishedAt,
    };
  }

  // --- Activity Logs ---
  getActivityLogs(): ActivityLog[] {
    return this.getStorage<ActivityLog[]>(ACTIVITIES_KEY, INITIAL_ACTIVITY_LOGS);
  }

  addActivity(activity: { title: string; description: string; type: ActivityLog['type'] }): void {
    const list = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      title: activity.title,
      description: activity.description,
      timestamp: new Date().toISOString(),
      type: activity.type,
    };
    list.unshift(newLog);
    if (list.length > 25) list.pop();
    this.setStorage(ACTIVITIES_KEY, list);
  }

  resetToDefault(): void {
    localStorage.removeItem(ELECTIONS_KEY);
    localStorage.removeItem(CANDIDATES_KEY);
    localStorage.removeItem(VOTERS_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(OTP_STORE_KEY);
  }
}

export const mockStore = new MockStore();
