export interface HourlyVotingData {
  hour: string;
  timeLabel: string;
  hourlyVotes: number;
  cumulativeVotes: number;
  turnoutPercentage: number;
  projectedTarget: number;
}

export interface HallTurnoutData {
  hallId: string;
  hallName: string;
  category: 'Traditional' | 'Diaspora' | 'UGEL';
  registeredVoters: number;
  votesCast: number;
  turnoutPercentage: number;
}

export interface FacultyTurnoutData {
  facultyName: string;
  registeredVoters: number;
  votesCast: number;
  turnoutPercentage: number;
}

/**
 * Generates realistic hourly voting timeline curve based on total votes cast in an election
 */
export function generateHourlyVotingTrends(
  totalVotesCast: number,
  totalRegistered: number,
  startTime: string = '08:00',
  endTime: string = '17:00'
): HourlyVotingData[] {
  // Distribution curve across hours of voting day (UG typical pattern)
  // Peaks around 10am-11am (morning break) and 2pm-4pm (afternoon lectures ending)
  const hourWeights = [
    { hour: '08:00', weight: 0.05, label: '8:00 AM (Polls Open)' },
    { hour: '09:00', weight: 0.09, label: '9:00 AM' },
    { hour: '10:00', weight: 0.15, label: '10:00 AM (Morning Surge)' },
    { hour: '11:00', weight: 0.14, label: '11:00 AM' },
    { hour: '12:00', weight: 0.10, label: '12:00 PM (Lunch Interval)' },
    { hour: '13:00', weight: 0.09, label: '1:00 PM' },
    { hour: '14:00', weight: 0.13, label: '2:00 PM (Afternoon Surge)' },
    { hour: '15:00', weight: 0.12, label: '3:00 PM' },
    { hour: '16:00', weight: 0.09, label: '4:00 PM (Closing Rush)' },
    { hour: '17:00', weight: 0.04, label: '5:00 PM (Polls Close)' },
  ];

  let cumulative = 0;
  return hourWeights.map((slot) => {
    const hourly = Math.round(totalVotesCast * slot.weight);
    cumulative += hourly;
    const boundedCumulative = Math.min(cumulative, totalVotesCast);
    const turnout = totalRegistered > 0 ? Number(((boundedCumulative / totalRegistered) * 100).toFixed(1)) : 0;
    const projected = Math.round(totalRegistered * (cumulative / totalVotesCast) * 0.75);

    return {
      hour: slot.hour,
      timeLabel: slot.label,
      hourlyVotes: hourly,
      cumulativeVotes: boundedCumulative,
      turnoutPercentage: turnout,
      projectedTarget: projected,
    };
  });
}

/**
 * Generates official University of Ghana hall-by-hall turnout data proportionally
 */
export function generateHallTurnoutData(totalVotesCast: number, totalRegistered: number): HallTurnoutData[] {
  const halls = [
    { hallId: 'commonwealth', hallName: 'Commonwealth Hall', category: 'Traditional' as const, share: 0.12, turnoutBoost: 1.15 },
    { hallId: 'volta', hallName: 'Volta Hall', category: 'Traditional' as const, share: 0.10, turnoutBoost: 1.08 },
    { hallId: 'legon', hallName: 'Legon Hall', category: 'Traditional' as const, share: 0.13, turnoutBoost: 1.05 },
    { hallId: 'akuafo', hallName: 'Akuafo Hall', category: 'Traditional' as const, share: 0.11, turnoutBoost: 0.98 },
    { hallId: 'sarbah', hallName: 'Mensah Sarbah Hall', category: 'Traditional' as const, share: 0.14, turnoutBoost: 1.10 },
    { hallId: 'jean_nelson', hallName: 'Jean Nelson Aka Hall', category: 'Diaspora' as const, share: 0.09, turnoutBoost: 0.92 },
    { hallId: 'sey', hallName: 'Elizabeth Frances Sey Hall', category: 'Diaspora' as const, share: 0.09, turnoutBoost: 0.95 },
    { hallId: 'limann', hallName: 'Hilla Limann Hall', category: 'Diaspora' as const, share: 0.08, turnoutBoost: 0.88 },
    { hallId: 'kwapong', hallName: 'Alexander Kwapong Hall', category: 'Diaspora' as const, share: 0.08, turnoutBoost: 0.90 },
    { hallId: 'jubilee', hallName: 'Jubilee & International', category: 'UGEL' as const, share: 0.06, turnoutBoost: 0.82 },
  ];

  return halls.map((h) => {
    const reg = Math.round(totalRegistered * h.share);
    const expectedTurnoutRate = totalRegistered > 0 ? (totalVotesCast / totalRegistered) * h.turnoutBoost : 0;
    const actualTurnoutRate = Math.min(Math.max(expectedTurnoutRate, 0.25), 0.96);
    const cast = Math.round(reg * actualTurnoutRate);
    const turnoutPct = reg > 0 ? Number(((cast / reg) * 100).toFixed(1)) : 0;

    return {
      hallId: h.hallId,
      hallName: h.hallName,
      category: h.category,
      registeredVoters: reg,
      votesCast: cast,
      turnoutPercentage: turnoutPct,
    };
  });
}
