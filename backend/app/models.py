import enum
from datetime import datetime, date, time
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class Role(str, enum.Enum):
    COMMISSIONER = 'COMMISSIONER'
    CANDIDATE = 'CANDIDATE'


class ElectionStatus(str, enum.Enum):
    DRAFT = 'DRAFT'
    REGISTRATION = 'REGISTRATION'
    READY = 'READY'
    LIVE = 'LIVE'
    CLOSED = 'CLOSED'
    RESULTS_PUBLISHED = 'RESULTS_PUBLISHED'


class CandidateStatus(str, enum.Enum):
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'


class VoterStatus(str, enum.Enum):
    ELIGIBLE = 'ELIGIBLE'
    VOTED = 'VOTED'
    INVALID = 'INVALID'


class ActivityType(str, enum.Enum):
    ELECTION = 'ELECTION'
    CANDIDATE = 'CANDIDATE'
    VOTER = 'VOTER'
    RESULT = 'RESULT'
    SYSTEM = 'SYSTEM'


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    student_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    hall_of_residence: Mapped[str | None] = mapped_column(String, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    level: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Election(Base):
    __tablename__ = 'elections'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[ElectionStatus] = mapped_column(Enum(ElectionStatus), default=ElectionStatus.DRAFT, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    positions = relationship('Position', back_populates='election', cascade='all, delete-orphan', order_by='Position.order')


class Position(Base):
    __tablename__ = 'positions'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    election = relationship('Election', back_populates='positions')


class CandidateApplication(Base):
    __tablename__ = 'candidate_applications'
    __table_args__ = (UniqueConstraint('election_id', 'student_id', name='uq_candidate_election_student'),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    position_id: Mapped[str] = mapped_column(ForeignKey('positions.id'), index=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    hall_of_residence: Mapped[str | None] = mapped_column(String, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    level: Mapped[str | None] = mapped_column(String, nullable=True)
    manifesto: Mapped[str] = mapped_column(Text, nullable=False)
    running_mate: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[CandidateStatus] = mapped_column(Enum(CandidateStatus), default=CandidateStatus.PENDING)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Voter(Base):
    __tablename__ = 'voters'
    __table_args__ = (UniqueConstraint('election_id', 'voter_id', name='uq_voter_election_voterid'),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    voter_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    hall: Mapped[str | None] = mapped_column(String, nullable=True)
    department: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[VoterStatus] = mapped_column(Enum(VoterStatus), default=VoterStatus.ELIGIBLE)
    has_voted: Mapped[bool] = mapped_column(Boolean, default=False)
    voted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    imported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class OTPChallenge(Base):
    __tablename__ = 'otp_challenges'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    voter_db_id: Mapped[str] = mapped_column(ForeignKey('voters.id'), index=True)
    otp_hash: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VotingSession(Base):
    __tablename__ = 'voting_sessions'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    token_hash: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    voter_db_id: Mapped[str] = mapped_column(ForeignKey('voters.id'), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Ballot(Base):
    __tablename__ = 'ballots'
    __table_args__ = (UniqueConstraint('election_id', 'voter_db_id', name='uq_ballot_election_voter'),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    voter_db_id: Mapped[str] = mapped_column(ForeignKey('voters.id'), index=True)
    receipt_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Vote(Base):
    __tablename__ = 'votes'
    __table_args__ = (UniqueConstraint('ballot_id', 'position_id', name='uq_vote_ballot_position'),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    ballot_id: Mapped[str] = mapped_column(ForeignKey('ballots.id'), index=True)
    election_id: Mapped[str] = mapped_column(ForeignKey('elections.id'), index=True)
    position_id: Mapped[str] = mapped_column(ForeignKey('positions.id'), index=True)
    candidate_id: Mapped[str] = mapped_column(ForeignKey('candidate_applications.id'), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actor_user_id: Mapped[str | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    election_id: Mapped[str | None] = mapped_column(ForeignKey('elections.id'), nullable=True)
