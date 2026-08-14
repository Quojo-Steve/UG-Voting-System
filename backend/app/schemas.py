from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CandidateRegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    studentId: str
    password: str
    hallOfResidence: str | None = None
    department: str | None = None
    level: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: Literal['COMMISSIONER', 'CANDIDATE']
    studentId: str | None = None
    fullName: str | None = None
    hallOfResidence: str | None = None
    department: str | None = None
    level: str | None = None


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class PositionResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    order: int


class ElectionCreate(BaseModel):
    name: str
    description: str
    startDate: str
    startTime: str
    endDate: str
    endTime: str
    positions: list[str] = Field(min_length=1)


class StatusUpdate(BaseModel):
    status: str


class ElectionResponse(BaseModel):
    id: str
    name: str
    description: str
    startDate: str
    startTime: str
    endDate: str
    endTime: str
    status: str
    positions: list[PositionResponse]
    totalRegisteredVoters: int
    totalVotesCast: int
    createdAt: str
    publishedAt: str | None = None


class CandidateApply(BaseModel):
    electionId: str
    positionId: str
    positionName: str | None = None
    fullName: str
    email: EmailStr
    studentId: str
    hallOfResidence: str | None = None
    department: str | None = None
    level: str | None = None
    manifesto: str = Field(min_length=20)
    runningMate: str | None = None
    avatarUrl: str | None = None


class CandidateReview(BaseModel):
    status: str
    reason: str | None = None


class RejectRequest(BaseModel):
    reason: str | None = None


class CandidateResponse(BaseModel):
    id: str
    electionId: str
    positionId: str
    positionName: str
    fullName: str
    email: str
    studentId: str
    hallOfResidence: str | None = None
    department: str | None = None
    level: str | None = None
    manifesto: str
    runningMate: str | None = None
    avatarUrl: str | None = None
    status: str
    appliedAt: str
    reviewNotes: str | None = None
    votesCount: int | None = 0


class VoterImportItem(BaseModel):
    voterId: str
    name: str
    email: EmailStr
    hall: str | None = None
    department: str | None = None


class VoterImportRequest(BaseModel):
    voters: list[VoterImportItem]


class ImportResponse(BaseModel):
    count: int
    importedCount: int
    message: str | None = None


class VoterResponse(BaseModel):
    id: str
    voterId: str
    name: str
    email: str
    electionId: str
    hall: str | None = None
    department: str | None = None
    status: str
    hasVoted: bool
    votedAt: str | None = None
    importedAt: str


class RequestOtp(BaseModel):
    voterId: str
    electionId: str | None = None


class RequestOtpResponse(BaseModel):
    success: bool
    maskedEmail: str
    electionId: str
    electionName: str
    voterName: str
    message: str | None = None


class VerifyOtp(BaseModel):
    voterId: str
    code: str
    electionId: str


class VoterSessionResponse(BaseModel):
    voterId: str
    name: str
    voterName: str
    maskedEmail: str
    electionId: str
    electionName: str
    verifiedOtpToken: str
    token: str
    expiresAt: str
    hasVoted: bool


class BallotResponse(BaseModel):
    election: ElectionResponse
    positions: list[PositionResponse]
    candidates: list[CandidateResponse]


class VoteItem(BaseModel):
    positionId: str
    candidateId: str


class CastBallotRequest(BaseModel):
    electionId: str
    voterId: str
    token: str | None = None
    votes: list[VoteItem]


class CastBallotResponse(BaseModel):
    success: bool
    receiptNumber: str
    timestamp: str


class CandidateResult(BaseModel):
    candidateId: str
    candidateName: str
    positionId: str
    positionName: str
    avatarUrl: str | None = None
    runningMate: str | None = None
    votes: int
    percentage: float
    rank: int
    isWinner: bool


class PositionResult(BaseModel):
    positionId: str
    positionName: str
    totalVotes: int
    candidates: list[CandidateResult]


class ElectionResults(BaseModel):
    electionId: str
    electionName: str
    status: str
    isPublished: bool
    totalRegisteredVoters: int
    totalVotesCast: int
    turnoutPercentage: float
    positions: list[PositionResult]
    resultsByPosition: list[PositionResult]
    publishedAt: str | None = None


class ActivityResponse(BaseModel):
    id: str
    title: str
    description: str
    timestamp: str
    type: str
