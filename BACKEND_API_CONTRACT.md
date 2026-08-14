# Backend API Contract

This contract is derived from the existing frontend source code under `frontend/src`. The backend should mount these routes under the frontend base URL:

```text
http://localhost:8000/api
```

The frontend Axios client is configured in `frontend/src/services/api.ts`. It sends JSON by default and attaches this header when a token exists:

```http
Authorization: Bearer <ug_auth_token>
```

The frontend currently falls back to mock data when any API call fails. Backend responses must therefore match these shapes to replace the mocks cleanly.

## Shared frontend types

Source: `frontend/src/types.ts`

### ElectionStatus

```ts
'DRAFT' | 'REGISTRATION' | 'READY' | 'LIVE' | 'CLOSED' | 'RESULTS_PUBLISHED'
```

### CandidateStatus

```ts
'PENDING' | 'APPROVED' | 'REJECTED'
```

### VoterStatus

```ts
'ELIGIBLE' | 'VOTED' | 'INVALID'
```

### Position

```ts
{
  id: string;
  name: string;
  description?: string;
  order: number;
}
```

### Election

```ts
{
  id: string;
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: ElectionStatus;
  positions: Position[];
  totalRegisteredVoters: number;
  totalVotesCast: number;
  createdAt: string;
  publishedAt?: string;
}
```

### Candidate

```ts
{
  id: string;
  electionId: string;
  positionId: string;
  positionName: string;
  fullName: string;
  email: string;
  studentId: string;
  hallOfResidence?: string;
  department?: string;
  level?: string;
  manifesto: string;
  runningMate?: string;
  avatarUrl?: string;
  status: CandidateStatus;
  appliedAt: string;
  reviewNotes?: string;
  votesCount?: number;
}
```

### Voter

```ts
{
  id: string;
  voterId: string;
  name: string;
  email: string;
  electionId: string;
  hall?: string;
  department?: string;
  status: VoterStatus;
  hasVoted: boolean;
  votedAt?: string;
  importedAt: string;
}
```

### Auth users

Commissioner:

```ts
{
  id: string;
  email: string;
  name: string;
  role: 'COMMISSIONER';
}
```

Candidate:

```ts
{
  id: string;
  email: string;
  name: string;
  studentId: string;
  role: 'CANDIDATE';
  fullName?: string;          // frontend pages use this even though types.ts omits it
  hallOfResidence?: string;   // frontend pages use this even though types.ts omits it
  department?: string;        // frontend pages use this even though types.ts omits it
  level?: string;             // frontend pages use this even though types.ts omits it
}
```

### ElectionResults

```ts
{
  electionId: string;
  electionName: string;
  status: ElectionStatus;
  isPublished: boolean;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  positions: PositionResult[];
  resultsByPosition: PositionResult[];
  publishedAt?: string;
}
```

---

# Endpoints

## 1. Commissioner login

- **Endpoint:** `/auth/commissioner/login`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public
- **Frontend service:** `frontend/src/services/authService.ts`
- **Frontend consumers:**
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/pages/commissioner/CommissionerLogin.tsx`

### Request body

```json
{
  "email": "commissioner@ug.edu.gh",
  "password": "ecpassword2026"
}
```

### Response body

```json
{
  "token": "jwt-access-token",
  "user": {
    "id": "comm-1",
    "email": "commissioner@ug.edu.gh",
    "name": "University Electoral Commissioner",
    "role": "COMMISSIONER"
  }
}
```

### Errors

```json
{ "detail": "Invalid email or password" }
```

Recommended statuses:

- `400` missing/invalid body
- `401` invalid credentials
- `403` user is not commissioner
- `500` server error

---

## 2. Candidate login

- **Endpoint:** `/auth/candidate/login`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public
- **Frontend service:** `frontend/src/services/authService.ts`
- **Frontend consumers:**
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/pages/candidate/CandidateLogin.tsx`

### Request body

```json
{
  "email": "candidate@ug.edu.gh",
  "password": "candidate2026"
}
```

### Response body

```json
{
  "token": "jwt-access-token",
  "user": {
    "id": "cand-user-1",
    "email": "candidate@ug.edu.gh",
    "name": "Candidate Name",
    "fullName": "Candidate Name",
    "studentId": "10928374",
    "hallOfResidence": "Commonwealth Hall",
    "department": "Computer Science",
    "level": "Level 300",
    "role": "CANDIDATE"
  }
}
```

### Errors

- `400` missing/invalid body
- `401` invalid credentials
- `403` user is not candidate

---

## 3. Candidate registration

- **Endpoint:** `/auth/candidate/register`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public
- **Frontend service:** `frontend/src/services/authService.ts`
- **Frontend consumers:**
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/pages/candidate/CandidateRegister.tsx`

### Request body currently sent by form

`authService.ts` declares only four fields, but `CandidateRegister.tsx` sends additional profile fields. Backend should accept all fields below.

```json
{
  "fullName": "Kwame Mensah",
  "email": "kmensah@st.ug.edu.gh",
  "studentId": "10982341",
  "password": "secret123",
  "hallOfResidence": "Commonwealth Hall",
  "department": "Computer Science",
  "level": "Level 300"
}
```

### Response body

Same shape as candidate login:

```json
{
  "token": "jwt-access-token",
  "user": {
    "id": "cand-user-1",
    "email": "kmensah@st.ug.edu.gh",
    "name": "Kwame Mensah",
    "fullName": "Kwame Mensah",
    "studentId": "10982341",
    "hallOfResidence": "Commonwealth Hall",
    "department": "Computer Science",
    "level": "Level 300",
    "role": "CANDIDATE"
  }
}
```

### Errors

- `400` missing/invalid fields
- `409` email or student ID already registered
- `422` validation error

---

## 4. List elections

- **Endpoint:** `/elections`
- **Method:** `GET`
- **Authentication:** Recommended optional for public/candidate/voter selection; required for commissioner dashboard is acceptable only if frontend always has token there
- **Role:** Public/Candidate/Commissioner
- **Frontend service:** `frontend/src/services/electionService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/LandingPage.tsx`
  - `frontend/src/pages/voter/VoterIdEntry.tsx`
  - `frontend/src/pages/candidate/CandidateDashboard.tsx`
  - `frontend/src/pages/candidate/CandidateElections.tsx`
  - `frontend/src/pages/candidate/CandidateResults.tsx`
  - `frontend/src/pages/commissioner/CommissionerDashboard.tsx`
  - `frontend/src/pages/commissioner/CommissionerElections.tsx`

### Request body

None.

### Response body

```json
[
  {
    "id": "ug-src-2026",
    "name": "UG SRC General Elections 2026",
    "description": "Official election description",
    "startDate": "2026-08-14",
    "startTime": "07:00",
    "endDate": "2026-08-14",
    "endTime": "17:00",
    "status": "LIVE",
    "positions": [
      { "id": "pos-1", "name": "SRC President & Vice President", "order": 1 }
    ],
    "totalRegisteredVoters": 10000,
    "totalVotesCast": 7850,
    "createdAt": "2026-08-01T08:00:00Z",
    "publishedAt": null
  }
]
```

### Errors

- `500` server error

---

## 5. Get election by ID

- **Endpoint:** `/elections/{id}`
- **Method:** `GET`
- **Authentication:** Optional for public/candidate pages; commissioner pages use it while authenticated
- **Role:** Public/Candidate/Commissioner
- **Frontend service:** `frontend/src/services/electionService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/candidate/CandidateApply.tsx`
  - `frontend/src/pages/commissioner/CommissionerElectionDetails.tsx`
  - `frontend/src/pages/commissioner/CommissionerVoters.tsx`
  - `frontend/src/pages/commissioner/CommissionerCandidates.tsx`
  - `frontend/src/pages/commissioner/CommissionerResults.tsx`

### Request body

None.

### Response body

A single `Election` object.

### Errors

- `404` election not found

---

## 6. Create election

- **Endpoint:** `/elections`
- **Method:** `POST`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/electionService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerCreateElection.tsx`

### Request body

```json
{
  "name": "UG SRC General Elections 2026",
  "description": "Official election description",
  "startDate": "2026-08-20",
  "startTime": "08:00",
  "endDate": "2026-08-20",
  "endTime": "17:00",
  "positions": [
    "SRC President & Vice President",
    "General Secretary",
    "Financial Secretary"
  ]
}
```

### Response body

Created `Election` object with generated `id`, generated `positions`, `status: "DRAFT"`, `totalRegisteredVoters: 0`, `totalVotesCast: 0`, and `createdAt`.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `400` invalid schedule or no positions
- `422` validation error

---

## 7. Update election status

- **Endpoint:** `/elections/{id}/status`
- **Method:** `PATCH`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/electionService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerElectionDetails.tsx`
  - `frontend/src/pages/commissioner/CommissionerResults.tsx`

### Request body

```json
{
  "status": "REGISTRATION"
}
```

Possible values:

```text
DRAFT, REGISTRATION, READY, LIVE, CLOSED, RESULTS_PUBLISHED
```

### Response body

Updated `Election` object.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` election not found
- `409` invalid lifecycle transition
- `400` cannot publish before closed, cannot launch without voters/candidates, etc.

---

## 8. Activity logs

- **Endpoint:** `/activity-logs`
- **Method:** `GET`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/electionService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerDashboard.tsx`

### Request body

None.

### Response body

```json
[
  {
    "id": "act-1",
    "title": "Election Created",
    "description": "UG SRC election created",
    "timestamp": "2026-08-05T10:00:00Z",
    "type": "ELECTION"
  }
]
```

`type` values:

```text
ELECTION, CANDIDATE, VOTER, RESULT, SYSTEM
```

### Errors

- `401` missing/invalid token
- `403` not commissioner

---

## 9. List all candidates

- **Endpoint:** `/candidates`
- **Method:** `GET`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerDashboard.tsx`

### Request body

None.

### Response body

Array of `Candidate` objects.

### Errors

- `401` missing/invalid token
- `403` not commissioner

---

## 10. List candidates for election

- **Endpoint:** `/elections/{electionId}/candidates`
- **Method:** `GET`
- **Authentication:** Optional for ballot/display; required for commissioner review pages is acceptable
- **Role:** Public/Candidate/Commissioner
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerElectionDetails.tsx`
  - `frontend/src/pages/commissioner/CommissionerCandidates.tsx`

### Request body

None.

### Response body

Array of `Candidate` objects.

### Errors

- `404` election not found

---

## 11. Get candidate profile / applications

- **Endpoint:** `/candidates/me`
- **Method:** `GET`
- **Authentication:** Required for real backend
- **Role:** `CANDIDATE`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/candidate/CandidateDashboard.tsx`

### Query parameters

The service has two usages:

```text
GET /candidates/me
GET /candidates/me?email=<email>
```

For a secure backend, ignore the email query when JWT is present and use the authenticated candidate. It can be accepted only for backwards compatibility.

### Request body

None.

### Response body

The frontend method `getMyCandidateProfile()` expects either:

```json
{
  "id": "cand-1",
  "electionId": "ug-src-2026",
  "positionId": "pos-1",
  "positionName": "SRC President & Vice President",
  "fullName": "Kwame Mensah",
  "email": "kmensah@st.ug.edu.gh",
  "studentId": "10982341",
  "manifesto": "...",
  "status": "PENDING",
  "appliedAt": "2026-08-03T11:20:00Z"
}
```

or:

```json
null
```

The separate `getCandidatesByEmail(email)` call expects an array of `Candidate` objects from the same endpoint with `email` query. If implemented, preserve this behavior.

### Errors

- `401` missing/invalid token
- `403` not candidate

---

## 12. Apply as candidate

- **Endpoint:** `/elections/{electionId}/candidates/apply`
- **Method:** `POST`
- **Authentication:** Required
- **Role:** `CANDIDATE`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/candidate/CandidateApply.tsx`

### Request body

```json
{
  "electionId": "ug-src-2026",
  "positionId": "pos-1",
  "positionName": "SRC President & Vice President",
  "fullName": "Kwame Mensah",
  "email": "kmensah@st.ug.edu.gh",
  "studentId": "10982341",
  "hallOfResidence": "Commonwealth Hall",
  "department": "Computer Science",
  "level": "Level 300",
  "manifesto": "Campaign manifesto at least 20 characters",
  "runningMate": "Optional Running Mate",
  "avatarUrl": "https://optional-image-url"
}
```

### Response body

Created `Candidate` object with:

```json
{
  "status": "PENDING",
  "appliedAt": "2026-08-06T17:45:00Z"
}
```

plus all candidate fields.

### Errors

- `401` missing/invalid token
- `403` not candidate
- `404` election or position not found
- `409` duplicate application or registration not open
- `400` invalid manifesto/position/candidate data

---

## 13. Approve candidate

- **Endpoint:** `/candidates/{id}/approve`
- **Method:** `PATCH`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:** currently available in service, main page uses `/review`; may be used by future UI

### Request body

None.

### Response body

Updated `Candidate` object with `status: "APPROVED"`.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` candidate not found
- `409` election no longer accepts review changes

---

## 14. Reject candidate

- **Endpoint:** `/candidates/{id}/reject`
- **Method:** `PATCH`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:** currently available in service, main page uses `/review`; may be used by future UI

### Request body

```json
{
  "reason": "Incomplete academic prerequisite clearance."
}
```

### Response body

Updated `Candidate` object with `status: "REJECTED"` and `reviewNotes`.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` candidate not found
- `400` rejection reason required if backend enforces it

---

## 15. Review candidate

- **Endpoint:** `/candidates/{id}/review`
- **Method:** `PATCH`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/candidateService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerCandidates.tsx`

### Request body

```json
{
  "status": "APPROVED",
  "reason": "Optional review note"
}
```

or:

```json
{
  "status": "REJECTED",
  "reason": "Incomplete clearance"
}
```

### Response body

Updated `Candidate` object.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` candidate not found
- `400` invalid status
- `409` invalid election state for candidate review

---

## 16. List all voters

- **Endpoint:** `/voters`
- **Method:** `GET`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:** available in service; not directly seen in page except via election-filtered helper

### Request body

None.

### Response body

Array of `Voter` objects.

### Errors

- `401` missing/invalid token
- `403` not commissioner

---

## 17. List voters for election

- **Endpoint:** `/elections/{electionId}/voters`
- **Method:** `GET`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerVoters.tsx`

### Request body

None.

### Response body

Array of `Voter` objects.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` election not found

---

## 18. Import voters as JSON

- **Endpoint:** `/elections/{electionId}/voters/import`
- **Method:** `POST`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerVoters.tsx`

### Request body

The current frontend does not upload the actual selected file to the backend. It creates sample parsed voter records client-side and sends JSON:

```json
{
  "voters": [
    {
      "voterId": "10982341",
      "name": "Kwame Mensah",
      "email": "kmensah@st.ug.edu.gh",
      "hall": "Commonwealth Hall",
      "department": "Computer Science"
    }
  ]
}
```

### Response body

```json
{
  "count": 8,
  "importedCount": 8,
  "message": "Successfully imported 8 student voters to register."
}
```

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` election not found
- `400` invalid voter rows
- `409` duplicate voter IDs; backend may skip duplicates and return imported count

### Note for Excel

Project requirements include `openpyxl`. The backend should later expose a multipart Excel upload endpoint, but the existing frontend currently consumes only the JSON import endpoint above.

---

## 19. Request voter OTP

- **Endpoint:** `/voter/request-otp`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public voter
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/voter/VoterIdEntry.tsx`
  - `frontend/src/pages/voter/VoterOTP.tsx` for resend

### Request body

```json
{
  "voterId": "10982341",
  "electionId": "ug-src-2026"
}
```

### Response body

```json
{
  "success": true,
  "maskedEmail": "k***h@st.ug.edu.gh",
  "electionId": "ug-src-2026",
  "electionName": "UG SRC General Elections 2026",
  "voterName": "Kwame Mensah",
  "message": "Verification OTP sent to k***h@st.ug.edu.gh"
}
```

The mock also returns `debugOtp`; production should not return it.

### Errors

The frontend catches thrown errors and displays `err.message`. Recommended JSON:

```json
{ "detail": "Voter ID was not found in the verified student register." }
```

Recommended statuses:

- `404` voter not found for election
- `409` voter already voted
- `403` voter invalid/ineligible
- `409` election is not live
- `429` too many OTP requests

---

## 20. Verify voter OTP

- **Endpoint:** `/voter/verify-otp`
- **Method:** `POST`
- **Authentication:** Not required, but validates OTP
- **Role:** Public voter
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/voter/VoterOTP.tsx`

### Request body

```json
{
  "voterId": "10982341",
  "code": "123456",
  "electionId": "ug-src-2026"
}
```

### Response body expected by `voterService.verifyOTP()`

```json
{
  "voterId": "10982341",
  "name": "Kwame Mensah",
  "voterName": "Kwame Mensah",
  "maskedEmail": "k***h@st.ug.edu.gh",
  "electionId": "ug-src-2026",
  "electionName": "UG SRC General Elections 2026",
  "verifiedOtpToken": "temporary-voting-token",
  "token": "temporary-voting-token",
  "expiresAt": "2026-08-14T09:30:00Z",
  "hasVoted": false
}
```

`types.ts` names the field `verifiedOtpToken`, but `VoterReview.tsx` uses `voterSession.token`; backend should return both until the frontend is cleaned up.

### Errors

- `400` no OTP requested
- `401` invalid OTP
- `410` OTP expired
- `409` voter already voted
- `409` election not live

---

## 21. Get ballot

- **Endpoint:** `/elections/{electionId}/ballot`
- **Method:** `GET`
- **Authentication:** Recommended required via temporary voter token; current frontend only sends JWT from localStorage, not voter token on this request
- **Role:** Verified voter
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/voter/VoterBallot.tsx`
  - `frontend/src/pages/voter/VoterReview.tsx`

### Request body

None.

### Response body

```json
{
  "election": {
    "id": "ug-src-2026",
    "name": "UG SRC General Elections 2026",
    "description": "...",
    "startDate": "2026-08-14",
    "startTime": "07:00",
    "endDate": "2026-08-14",
    "endTime": "17:00",
    "status": "LIVE",
    "positions": [
      { "id": "pos-1", "name": "SRC President & Vice President", "order": 1 }
    ],
    "totalRegisteredVoters": 10000,
    "totalVotesCast": 7850,
    "createdAt": "2026-08-01T08:00:00Z"
  },
  "positions": [
    { "id": "pos-1", "name": "SRC President & Vice President", "order": 1 }
  ],
  "candidates": [
    {
      "id": "cand-1",
      "electionId": "ug-src-2026",
      "positionId": "pos-1",
      "positionName": "SRC President & Vice President",
      "fullName": "Kwame Mensah",
      "email": "kwame@st.ug.edu.gh",
      "studentId": "10928374",
      "manifesto": "...",
      "status": "APPROVED",
      "appliedAt": "2026-08-03T11:20:00Z"
    }
  ]
}
```

Only approved candidates should be returned.

### Errors

- `401` missing/invalid/expired voter token if enforced
- `404` election not found
- `409` election not live

---

## 22. Cast ballot

- **Endpoint:** `/elections/{electionId}/ballot/cast`
- **Method:** `POST`
- **Authentication:** Required via temporary voting token in body; JWT not required
- **Role:** Verified voter
- **Frontend service:** `frontend/src/services/voterService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/voter/VoterReview.tsx`

### Request body

```json
{
  "electionId": "ug-src-2026",
  "voterId": "10982341",
  "token": "temporary-voting-token",
  "votes": [
    { "positionId": "pos-1", "candidateId": "cand-1" },
    { "positionId": "pos-2", "candidateId": "cand-4" }
  ]
}
```

### Response body

```json
{
  "success": true,
  "receiptNumber": "UG-VOTE-LKJ123-ABCD",
  "timestamp": "2026-08-14T09:12:00Z"
}
```

### Errors

- `401` missing/invalid/expired temporary voting token
- `404` voter/election/candidate/position not found
- `403` voter not eligible
- `409` voter already voted
- `409` election not live or outside time window
- `400` incomplete ballot
- `400` candidate not approved
- `400` candidate does not belong to selected position/election
- `500` transaction failure

Vote submission must be atomic.

---

## 23. Get election results

- **Endpoint:** `/elections/{electionId}/results`
- **Method:** `GET`
- **Authentication:** Required for commissioner; candidate/public access should only be allowed if results are published
- **Role:** `COMMISSIONER` or `CANDIDATE` for published results
- **Frontend services:**
  - `frontend/src/services/electionService.ts`
  - `frontend/src/services/resultService.ts`
- **Frontend consumers:**
  - `frontend/src/pages/commissioner/CommissionerResults.tsx`
  - `frontend/src/pages/candidate/CandidateResults.tsx`

### Request body

None.

### Response body

```json
{
  "electionId": "ug-src-2026",
  "electionName": "UG SRC General Elections 2026",
  "status": "RESULTS_PUBLISHED",
  "isPublished": true,
  "totalRegisteredVoters": 10000,
  "totalVotesCast": 7850,
  "turnoutPercentage": 78.5,
  "positions": [
    {
      "positionId": "pos-1",
      "positionName": "SRC President & Vice President",
      "totalVotes": 7850,
      "candidates": [
        {
          "candidateId": "cand-1",
          "candidateName": "Kwame Mensah",
          "positionId": "pos-1",
          "positionName": "SRC President & Vice President",
          "avatarUrl": null,
          "runningMate": null,
          "votes": 3820,
          "percentage": 48.7,
          "rank": 1,
          "isWinner": true
        }
      ]
    }
  ],
  "resultsByPosition": [
    {
      "positionId": "pos-1",
      "positionName": "SRC President & Vice President",
      "totalVotes": 7850,
      "candidates": []
    }
  ],
  "publishedAt": "2026-08-14T18:00:00Z"
}
```

The frontend expects both `positions` and `resultsByPosition`.

### Errors

- `401` missing/invalid token where required
- `403` results not published for non-commissioner
- `404` election not found

---

## 24. Publish results

- **Endpoint:** `/elections/{electionId}/publish-results`
- **Method:** `POST`
- **Authentication:** Required
- **Role:** `COMMISSIONER`
- **Frontend service:** `frontend/src/services/resultService.ts`
- **Frontend consumers:** no current page imports `resultService`; `CommissionerResults.tsx` currently publishes by `PATCH /elections/{id}/status`

### Request body

None.

### Response body

`ElectionResults` object with `isPublished: true`.

### Errors

- `401` missing/invalid token
- `403` not commissioner
- `404` election not found
- `409` election is not closed

---

## 25. Candidate results summary

- **Endpoint:** `/candidates/me/results`
- **Method:** `GET`
- **Authentication:** Required
- **Role:** `CANDIDATE`
- **Frontend service:** `frontend/src/services/resultService.ts`
- **Frontend consumers:** no current page imports `resultService`; kept for compatibility

### Query parameters

```text
email=<candidateEmail>
```

A secure backend should use the JWT candidate identity and ignore client-supplied email for authorization.

### Response body

```json
{
  "publishedResults": [
    {
      "electionId": "ug-law-society-2026",
      "electionName": "Law Students’ Union Executive Elections",
      "status": "RESULTS_PUBLISHED",
      "isPublished": true,
      "totalRegisteredVoters": 1200,
      "totalVotesCast": 1080,
      "turnoutPercentage": 90,
      "positions": [],
      "resultsByPosition": [],
      "publishedAt": "2026-08-10T16:30:00Z"
    }
  ],
  "unpublishedElections": [
    {
      "electionId": "ug-src-2026",
      "electionName": "UG SRC General Elections 2026"
    }
  ]
}
```

### Errors

- `401` missing/invalid token
- `403` not candidate

---

# Legacy/unused voting endpoints

`frontend/src/services/votingService.ts` defines these endpoints, but no current page imports `votingService`. They may be leftovers from an earlier API design. Implementing them is optional unless future frontend code uses them.

## Legacy request OTP

- **Endpoint:** `/voting/request-otp`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public voter
- **Frontend service:** `frontend/src/services/votingService.ts`
- **Frontend consumers:** none currently

Request:

```json
{ "voterId": "10982341" }
```

Response:

```json
{
  "success": true,
  "maskedEmail": "k***h@st.ug.edu.gh",
  "electionId": "ug-src-2026",
  "electionName": "UG SRC General Elections 2026",
  "voterName": "Kwame Mensah"
}
```

## Legacy verify OTP

- **Endpoint:** `/voting/verify-otp`
- **Method:** `POST`
- **Authentication:** Not required
- **Role:** Public voter
- **Frontend service:** `frontend/src/services/votingService.ts`
- **Frontend consumers:** none currently

Request:

```json
{ "voterId": "10982341", "otp": "123456" }
```

Response:

```json
{ "success": true, "token": "temporary-voting-token" }
```

## Legacy get ballot data

- **Endpoint:** `/voting/ballot/{electionId}`
- **Method:** `GET`
- **Authentication:** Not currently attached
- **Role:** Verified voter intended
- **Frontend service:** `frontend/src/services/votingService.ts`
- **Frontend consumers:** none currently

Response is only an `Election` object.

## Legacy submit vote

- **Endpoint:** `/voting/submit`
- **Method:** `POST`
- **Authentication:** temporary voting token intended
- **Role:** Verified voter
- **Frontend service:** `frontend/src/services/votingService.ts`
- **Frontend consumers:** none currently

Request:

```json
{
  "voterId": "10982341",
  "electionId": "ug-src-2026",
  "selections": {
    "pos-1": "cand-1"
  }
}
```

Response:

```json
{
  "success": true,
  "referenceId": "UG-VOTE-..."
}
```

---

# Frontend compatibility notes

1. `CandidateRegister.tsx` sends `hallOfResidence`, `department`, and `level`, but `AuthContext.registerCandidate` and `authService.registerCandidate` are typed with only `fullName`, `email`, `studentId`, and `password`. Backend should still accept the extra fields.
2. Candidate pages use `user.fullName`, `user.hallOfResidence`, `user.department`, and `user.level`, but `CandidateUser` in `types.ts` omits those fields. Backend should return both `name` and `fullName`.
3. Voter pages reference `startVoterSession`, `endVoterSession`, `checkVoterSession`, `voterSession.voterName`, and `voterSession.token`, while `AuthContext.tsx`/`types.ts` currently define `setVoterSession`, `clearVoterSession`, `name`, and `verifiedOtpToken`. Backend should return both `name`/`voterName` and `verifiedOtpToken`/`token` to reduce integration friction.
4. The production backend must not return `debugOtp` even though mock mode does.
5. The current file upload UI does not send multipart files; it sends mock parsed JSON voters. Excel upload support will require a frontend service update later.
