# Backend Implementation Plan

This plan is based on the existing React frontend, services, types, forms, and mock data. The backend should be created in `backend/` and should integrate with the frontend without redesigning it.

Required stack from project instructions:

- Python 3.12+
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Alembic
- JWT authentication
- Secure password hashing
- openpyxl
- SMTP email
- pytest

---

# 1. Database entities

## User

Stores commissioner and candidate login accounts.

Fields:

- `id` UUID/string primary key
- `email` unique, indexed
- `password_hash`
- `role`: `COMMISSIONER` or `CANDIDATE`
- `is_active`
- `created_at`
- `updated_at`

Candidate profile fields can either live directly on `User` for MVP simplicity or in a separate `CandidateProfile` table. Recommended MVP: keep candidate account profile fields on `User`.

Candidate-related user fields:

- `full_name`
- `student_id` unique nullable for commissioner
- `hall_of_residence`
- `department`
- `level`

Commissioner fields:

- `name`

Important rule: there is only one commissioner account.

---

## Election

Fields:

- `id` string/UUID primary key
- `name`
- `description`
- `start_date`
- `start_time`
- `end_date`
- `end_time`
- `status`: `DRAFT`, `REGISTRATION`, `READY`, `LIVE`, `CLOSED`, `RESULTS_PUBLISHED`
- `created_at`
- `updated_at`
- `published_at` nullable

Derived/frontend fields:

- `totalRegisteredVoters`: count of voter rows for election
- `totalVotesCast`: count of submitted ballots/voted voters for election

These can be calculated at query time or denormalized. For MVP, calculate from database to avoid inconsistent totals.

---

## Position

Fields:

- `id` string/UUID primary key
- `election_id` foreign key to `Election`
- `name`
- `description` nullable
- `order` integer
- `created_at`

Rules:

- Each election must have at least one position.
- Position order should be preserved from the frontend `positions: string[]` array.

---

## CandidateApplication

Represents a candidate's application to contest a position.

Fields:

- `id` string/UUID primary key
- `user_id` foreign key to candidate `User`, nullable only if preserving mock-style external candidate records
- `election_id` foreign key to `Election`
- `position_id` foreign key to `Position`
- `full_name`
- `email`
- `student_id`
- `hall_of_residence`
- `department`
- `level`
- `manifesto`
- `running_mate` nullable
- `avatar_url` nullable
- `status`: `PENDING`, `APPROVED`, `REJECTED`
- `review_notes` nullable
- `applied_at`
- `reviewed_at` nullable
- `reviewed_by_user_id` foreign key to commissioner `User`, nullable

Frontend response field mapping:

- `full_name` -> `fullName`
- `hall_of_residence` -> `hallOfResidence`
- `running_mate` -> `runningMate`
- `avatar_url` -> `avatarUrl`
- `review_notes` -> `reviewNotes`
- `applied_at` -> `appliedAt`
- `votesCount` should be derived from `Vote` rows.

Rules:

- Candidate can apply only during election `REGISTRATION`.
- Candidate can apply only to valid positions in that election.
- Prevent duplicate application by same candidate/student for same election.
- Only approved candidates appear on ballots.

---

## Voter

Represents a voter register row for one election.

Fields:

- `id` string/UUID primary key
- `election_id` foreign key to `Election`
- `voter_id` student/voter ID
- `name`
- `email`
- `hall` nullable
- `department` nullable
- `status`: `ELIGIBLE`, `VOTED`, `INVALID`
- `has_voted` boolean
- `voted_at` nullable
- `imported_at`

Constraints:

- Unique `(election_id, voter_id)`.

Rules:

- Only `ELIGIBLE` voters may request OTP and vote.
- `has_voted` becomes true after atomic vote submission.

---

## OTPChallenge

Stores voter OTPs securely.

Fields:

- `id` string/UUID primary key
- `election_id` foreign key to `Election`
- `voter_id` foreign key to `Voter`
- `otp_hash`
- `expires_at`
- `used_at` nullable
- `attempt_count`
- `created_at`

Rules:

- Store hash only, never plaintext OTP.
- Expire after configured period, e.g. 5 minutes.
- Limit verification attempts.
- Mark used after successful verification or after vote submission.

---

## VotingSession

Temporary token issued after OTP verification.

Fields:

- `id` string/UUID primary key
- `token_hash`
- `election_id` foreign key to `Election`
- `voter_id` foreign key to `Voter`
- `expires_at`
- `used_at` nullable
- `created_at`

Rules:

- Store token hash only.
- Expires after short duration, e.g. 30 minutes.
- One active token per voter/election is enough for MVP.
- Mark used after successful ballot cast.

---

## Ballot

Represents one submitted ballot receipt, without exposing selections back to the voter.

Fields:

- `id` string/UUID primary key
- `election_id` foreign key to `Election`
- `voter_id` foreign key to `Voter`
- `receipt_number` unique
- `submitted_at`

Constraints:

- Unique `(election_id, voter_id)` to enforce one vote per election.

Privacy note:

- The system must not expose a voter's selections after voting.
- For a university MVP, storing `BallotSelection` linked to `Ballot` is simpler for counting, but API must never return voter-linked selections. A stronger approach is to store anonymous vote rows without retaining voter linkage to candidate choices. For this MVP, use transaction protection and never expose selections.

---

## Vote

Represents a selected candidate for one position.

Fields:

- `id` string/UUID primary key
- `ballot_id` foreign key to `Ballot`
- `election_id` foreign key to `Election`
- `position_id` foreign key to `Position`
- `candidate_application_id` foreign key to `CandidateApplication`
- `created_at`

Constraints:

- Unique `(ballot_id, position_id)`.

Rules:

- Candidate must be approved.
- Candidate must belong to same election and position.

---

## ActivityLog

Fields:

- `id` string/UUID primary key
- `title`
- `description`
- `type`: `ELECTION`, `CANDIDATE`, `VOTER`, `RESULT`, `SYSTEM`
- `timestamp`
- `actor_user_id` nullable
- `election_id` nullable

Used by commissioner dashboard.

---

# 2. Relationships

```text
User 1 -> many CandidateApplication
User 1 -> many ActivityLog as actor

Election 1 -> many Position
Election 1 -> many CandidateApplication
Election 1 -> many Voter
Election 1 -> many OTPChallenge
Election 1 -> many VotingSession
Election 1 -> many Ballot
Election 1 -> many Vote
Election 1 -> many ActivityLog

Position many -> 1 Election
Position 1 -> many CandidateApplication
Position 1 -> many Vote

CandidateApplication many -> 1 User
CandidateApplication many -> 1 Election
CandidateApplication many -> 1 Position
CandidateApplication 1 -> many Vote

Voter many -> 1 Election
Voter 1 -> many OTPChallenge
Voter 1 -> many VotingSession
Voter 1 -> zero/one Ballot per election

Ballot many -> 1 Election
Ballot many -> 1 Voter
Ballot 1 -> many Vote
```

Key uniqueness constraints:

```text
User.email unique
User.student_id unique where not null
Voter(election_id, voter_id) unique
CandidateApplication(election_id, user_id) unique
CandidateApplication(election_id, student_id) unique
Ballot(election_id, voter_id) unique
Vote(ballot_id, position_id) unique
```

---

# 3. Authentication architecture

## Account JWTs

Used for commissioner and candidate portals.

Flow:

1. User submits email/password.
2. Backend verifies password hash.
3. Backend issues JWT access token.
4. Frontend stores token in `localStorage['ug_auth_token']`.
5. Axios sends `Authorization: Bearer <token>` on subsequent requests.

JWT claims:

```json
{
  "sub": "user-id",
  "role": "COMMISSIONER",
  "email": "commissioner@ug.edu.gh",
  "exp": 1234567890
}
```

or:

```json
{
  "sub": "candidate-user-id",
  "role": "CANDIDATE",
  "email": "candidate@ug.edu.gh",
  "studentId": "10982341",
  "exp": 1234567890
}
```

Recommended dependencies:

- `get_current_user`
- `require_commissioner`
- `require_candidate`

Password hashing:

- Use `passlib` with bcrypt or Argon2-compatible hashing.
- Never store plaintext passwords.

## Voter temporary token

Voters do not use normal accounts. They authenticate by:

1. Entering voter ID.
2. Receiving email OTP.
3. Verifying OTP.
4. Receiving temporary voting token.

The frontend passes this token in the ballot cast body:

```json
{
  "token": "temporary-voting-token"
}
```

Recommended implementation:

- Generate random high-entropy token.
- Store only SHA-256/HMAC hash in `VotingSession`.
- Return plaintext token once to frontend.
- Validate and retire token during vote submission.

---

# 4. Election lifecycle

Frontend status buttons imply this lifecycle:

```text
DRAFT -> REGISTRATION -> LIVE -> CLOSED -> RESULTS_PUBLISHED
```

The type also includes `READY`, but the current UI does not use it.

## DRAFT

- Election created by commissioner.
- Positions exist.
- Candidate registration not open.
- Voting not open.

Allowed action:

- Commissioner opens registration: `DRAFT -> REGISTRATION`.

## REGISTRATION

- Candidates may submit applications.
- Commissioner may review applications.
- Voters can be imported.
- Voting not open.

Allowed action:

- Commissioner launches voting: `REGISTRATION -> LIVE`.

Recommended checks before going live:

- At least one registered voter.
- At least one approved candidate.
- Preferably each position has at least one approved candidate.

## LIVE

- Voters may request OTP and vote.
- Ballots return only approved candidates.
- Candidate applications should be blocked.
- Candidate review changes should be restricted or blocked.

Allowed action:

- Commissioner closes voting: `LIVE -> CLOSED`.

Backend must also enforce actual start/end date and time, not only status.

## CLOSED

- Voting is closed.
- Commissioner can view results.
- Candidates should not see unpublished results unless frontend requires otherwise. Safer behavior: candidate gets `403` until published.

Allowed action:

- Commissioner publishes: `CLOSED -> RESULTS_PUBLISHED`.

## RESULTS_PUBLISHED

- Results are public/candidate-visible.
- No more voting or candidate changes.
- `published_at` is set.

---

# 5. Candidate workflow

1. Candidate registers account:

   ```text
   POST /auth/candidate/register
   ```

2. Candidate logs in:

   ```text
   POST /auth/candidate/login
   ```

3. Candidate views available elections:

   ```text
   GET /elections
   ```

4. Candidate opens election application form:

   ```text
   GET /elections/{id}
   ```

5. Candidate submits nomination:

   ```text
   POST /elections/{id}/candidates/apply
   ```

6. Backend creates `CandidateApplication` with:

   ```text
   status = PENDING
   applied_at = now
   ```

7. Commissioner reviews candidates:

   ```text
   GET /elections/{id}/candidates
   PATCH /candidates/{id}/review
   ```

8. Candidate dashboard reads current profile/application:

   ```text
   GET /candidates/me
   ```

9. Approved candidates appear on the ballot.

10. Candidates view results after publication:

   ```text
   GET /elections/{id}/results
   ```

Important validation:

- Only candidates can apply.
- Application is allowed only during `REGISTRATION`.
- Candidate cannot apply twice to the same election.
- Position must belong to the selected election.
- Review is commissioner-only.

---

# 6. Voter OTP workflow

1. Voter selects election and enters student/voter ID.

   Frontend page:

   ```text
   frontend/src/pages/voter/VoterIdEntry.tsx
   ```

2. Frontend calls:

   ```text
   POST /voter/request-otp
   ```

3. Backend validates:

   - Election exists.
   - Election status is `LIVE`.
   - Current time is inside election start/end window.
   - Voter exists in that election register.
   - Voter status is `ELIGIBLE`.
   - Voter has not voted.
   - Rate limit is not exceeded.

4. Backend generates a 6-digit OTP.

5. Backend stores only the hashed OTP in `OTPChallenge`.

6. Backend sends plaintext OTP by SMTP to voter email.

7. Backend responds with masked email, election ID/name, voter name.

8. Voter enters OTP.

   Frontend page:

   ```text
   frontend/src/pages/voter/VoterOTP.tsx
   ```

9. Frontend calls:

   ```text
   POST /voter/verify-otp
   ```

10. Backend validates:

   - OTP exists.
   - OTP not expired.
   - OTP not already used.
   - OTP hash matches.
   - Attempt count not exceeded.
   - Election is still live.
   - Voter has not voted.

11. Backend creates `VotingSession` and returns temporary voting token.

12. Frontend stores voter session in `sessionStorage` through AuthContext.

Important:

- Do not return `debugOtp` in production.
- Do not store plaintext OTP.
- Do not allow OTP verification after vote was cast.

---

# 7. Voting workflow

1. Verified voter opens ballot page:

   ```text
   GET /elections/{electionId}/ballot
   ```

2. Backend returns:

   - Election
   - Positions
   - Approved candidates only

3. Frontend requires one selected candidate per position before review.

4. Voter reviews selections.

5. Frontend submits:

   ```text
   POST /elections/{electionId}/ballot/cast
   ```

   Body:

   ```json
   {
     "electionId": "ug-src-2026",
     "voterId": "10982341",
     "token": "temporary-voting-token",
     "votes": [
       { "positionId": "pos-1", "candidateId": "cand-1" }
     ]
   }
   ```

6. Backend performs all validation again. Never trust frontend validation.

Required validation:

- Temporary voting token exists, matches hash, not expired, not used.
- Token belongs to same voter and election.
- Voter exists in election register.
- Voter is eligible.
- Voter has not voted.
- Election is `LIVE`.
- Current time is inside election window.
- Ballot has exactly one vote for each position.
- Every position belongs to the election.
- Every candidate exists, is approved, belongs to election, and belongs to selected position.
- No duplicate position IDs.

7. Backend writes vote in one database transaction:

   - Create `Ballot` with receipt number.
   - Create `Vote` rows.
   - Mark `Voter.has_voted = true`.
   - Set `Voter.status = VOTED`.
   - Set `Voter.voted_at = now`.
   - Mark `VotingSession.used_at = now`.
   - Mark active OTPs used/expired if desired.
   - Add activity log if desired.

8. Backend returns receipt:

   ```json
   {
     "success": true,
     "receiptNumber": "UG-VOTE-...",
     "timestamp": "2026-08-14T09:12:00Z"
   }
   ```

Privacy/security:

- Do not expose voter selections after vote submission.
- Do not allow vote modification.
- Enforce unique ballot per voter/election at the database level.
- Use transaction rollback if any write fails.

---

# 8. Results workflow

## Commissioner results

Commissioner can view results for an election:

```text
GET /elections/{id}/results
```

Backend calculates:

- total registered voters
- total votes cast
- turnout percentage
- votes per candidate
- percentage per candidate within each position
- rank per candidate
- winner per position

Response must contain both:

```text
positions
resultsByPosition
```

because the frontend uses both shapes in different places.

## Publishing results

The current commissioner UI publishes by:

```text
PATCH /elections/{id}/status
{ "status": "RESULTS_PUBLISHED" }
```

There is also an unused service endpoint:

```text
POST /elections/{id}/publish-results
```

Recommended: implement both for compatibility, with shared internal service logic.

Publishing rules:

- Only commissioner.
- Election should be `CLOSED` before publication.
- Set election status to `RESULTS_PUBLISHED`.
- Set `published_at`.
- Add activity log.

## Candidate/public result access

Candidate pages call:

```text
GET /elections
GET /elections/{id}/results
```

Recommended security:

- Commissioner can view unpublished and published results.
- Candidate can view only if election status is `RESULTS_PUBLISHED`.
- If unpublished, return `403` or a response with hidden results. Since the current candidate page catches errors quietly, `403` is acceptable.

---

# 9. Backend folder structure

Recommended structure:

```text
backend/
  alembic.ini
  pyproject.toml or requirements.txt
  README.md
  .env.example

  alembic/
    env.py
    script.py.mako
    versions/

  app/
    __init__.py
    main.py
    config.py
    database.py
    security.py
    deps.py

    models/
      __init__.py
      user.py
      election.py
      position.py
      candidate.py
      voter.py
      otp.py
      ballot.py
      activity.py

    schemas/
      __init__.py
      auth.py
      election.py
      candidate.py
      voter.py
      ballot.py
      results.py
      activity.py
      common.py

    routers/
      __init__.py
      auth.py
      elections.py
      candidates.py
      voters.py
      voting.py
      results.py
      activity_logs.py

    services/
      __init__.py
      auth_service.py
      election_service.py
      candidate_service.py
      voter_import_service.py
      otp_service.py
      email_service.py
      voting_service.py
      results_service.py
      activity_service.py

    utils/
      __init__.py
      ids.py
      datetime.py
      masking.py
      excel.py

  tests/
    conftest.py
    test_auth.py
    test_elections.py
    test_candidates.py
    test_voters.py
    test_otp.py
    test_voting.py
    test_results.py
```

For a small MVP, routers can directly use services and SQLAlchemy sessions. Avoid overengineering.

---

# 10. Implementation order

## Phase 1: Backend foundation

1. Create `backend/` project.
2. Add FastAPI app with `/api` prefix.
3. Configure CORS for frontend dev server:

   ```text
   http://localhost:3000
   ```

4. Configure SQLite database.
5. Add SQLAlchemy base/session.
6. Add Alembic.
7. Add settings from environment variables.
8. Add health endpoint, e.g. `/api/health`.

## Phase 2: Models and migrations

1. Implement SQLAlchemy models:

   - User
   - Election
   - Position
   - CandidateApplication
   - Voter
   - OTPChallenge
   - VotingSession
   - Ballot
   - Vote
   - ActivityLog

2. Create first Alembic migration.
3. Add seed script for one commissioner.
4. Optionally seed mock-like demo data for frontend testing.

## Phase 3: Schemas and response mappers

1. Create Pydantic request/response schemas matching frontend camelCase.
2. Ensure backend returns camelCase fields:

   - `startDate`
   - `startTime`
   - `endDate`
   - `endTime`
   - `totalRegisteredVoters`
   - `totalVotesCast`
   - `fullName`
   - `studentId`
   - `hallOfResidence`
   - `votesCount`
   - etc.

3. Add common error handling.

## Phase 4: Auth

1. Password hashing.
2. JWT issue/verify.
3. `POST /auth/commissioner/login`.
4. `POST /auth/candidate/register`.
5. `POST /auth/candidate/login`.
6. Role dependencies.
7. Tests for login/register/protected routes.

## Phase 5: Elections and positions

1. `GET /elections`.
2. `GET /elections/{id}`.
3. `POST /elections` commissioner-only.
4. `PATCH /elections/{id}/status` commissioner-only.
5. Activity logging for creation/status transitions.
6. Tests for lifecycle and validation.

## Phase 6: Candidates

1. `GET /candidates` commissioner-only.
2. `GET /elections/{id}/candidates`.
3. `GET /candidates/me` candidate-only.
4. `POST /elections/{id}/candidates/apply` candidate-only.
5. `PATCH /candidates/{id}/review` commissioner-only.
6. Compatibility endpoints:

   - `PATCH /candidates/{id}/approve`
   - `PATCH /candidates/{id}/reject`

7. Tests for duplicate application, registration window, review permissions.

## Phase 7: Voter register

1. `GET /voters` commissioner-only.
2. `GET /elections/{id}/voters` commissioner-only.
3. `POST /elections/{id}/voters/import` JSON import.
4. Duplicate handling.
5. Update total registered counts by query/mapping.
6. Add openpyxl parser service for future Excel upload.
7. Tests for import and listing.

## Phase 8: OTP and SMTP

1. Email masking utility.
2. OTP generation.
3. OTP hashing.
4. SMTP email service.
5. `POST /voter/request-otp`.
6. `POST /voter/verify-otp`.
7. Temporary voting session token generation.
8. Tests for:

   - invalid voter
   - non-live election
   - already voted
   - expired OTP
   - invalid OTP
   - successful verification

## Phase 9: Ballot and voting

1. `GET /elections/{id}/ballot`.
2. `POST /elections/{id}/ballot/cast`.
3. Atomic vote transaction.
4. Receipt generation.
5. One vote per voter/election enforcement.
6. Candidate/position validation.
7. Tests for all security rules.

## Phase 10: Results and activity logs

1. `GET /elections/{id}/results`.
2. Results calculation service.
3. Commissioner unpublished access.
4. Candidate published-only access.
5. `POST /elections/{id}/publish-results` compatibility endpoint.
6. `GET /activity-logs`.
7. Tests for tallies, publication, visibility.

## Phase 11: Frontend integration testing

1. Start backend on port `8000`.
2. Start frontend on port `3000`.
3. Confirm mock fallback is not being used by checking backend logs.
4. Test commissioner login.
5. Create election.
6. Import voters.
7. Register candidate.
8. Apply for position.
9. Approve candidate.
10. Open/live election.
11. Request voter OTP.
12. Verify OTP.
13. Cast ballot.
14. Confirm voter cannot vote again.
15. Close election.
16. Publish results.
17. Confirm candidate can view published results.

---

# 11. Important frontend integration observations

These are not backend implementation tasks yet, but they affect compatibility.

1. The frontend uses `withMockFallback`, so backend errors may silently load mocks. During integration, temporarily logging requests or disabling fallback may help debugging.
2. `CandidateRegister.tsx` sends extra fields not declared in `authService.ts` types. Backend should accept them.
3. Candidate pages use user fields omitted from `types.ts`, including `fullName`, `hallOfResidence`, `department`, and `level`. Backend auth responses should include these fields.
4. Voter pages reference some AuthContext names/fields that differ from `types.ts`: `token` vs `verifiedOtpToken`, `voterName` vs `name`. Backend responses should include aliases for compatibility.
5. The current voter register upload service does not send the real file. It sends JSON sample voters. Real Excel upload support will need a later frontend adjustment.
6. `resultService.ts` and `votingService.ts` contain endpoints not currently consumed by pages. Implement core endpoints first, then optional compatibility endpoints.
