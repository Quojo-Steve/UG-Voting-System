# University of Ghana Election System

## Project

This is a University of Ghana student election management and voting system.

The project has three interfaces:

1. Commissioner
2. Candidate
3. Electorate/Voter

The existing frontend is located in:

frontend/

The backend should be created in:

backend/

## Important

The frontend was already created using Gemini.

DO NOT rebuild or redesign the frontend.

Inspect the existing frontend before implementing the backend.

The existing frontend is the primary source of truth for:

- API calls
- request payloads
- response structures
- authentication expectations
- page functionality
- data structures

The backend must integrate with the existing frontend.

## Backend

Use:

- Python 3.12+
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Alembic
- JWT authentication
- secure password hashing
- openpyxl
- SMTP email
- pytest

Do not introduce PostgreSQL, MongoDB, Redis, Celery, Kafka, microservices, or unnecessary infrastructure.

SQLite must remain the database for this MVP.

## Election

There is ONE commissioner.

Commissioner capabilities:

- create elections
- set election start/end times
- create positions
- upload voter register Excel file
- review candidates
- approve/reject candidates
- view election statistics
- view results
- publish results

Candidates:

- register
- login
- apply for election positions
- provide manifesto
- see application status
- see results after publication

Voters:

- enter voter ID
- receive email OTP
- verify OTP
- access ballot
- vote once
- review vote
- submit vote
- cannot modify vote after submission

## Voting Security

The backend must enforce:

- voter eligibility
- OTP verification
- OTP expiration
- election timing
- candidate approval
- one vote per voter per election
- valid ballot selections
- atomic vote submission

Never trust frontend validation.

Use database transactions when recording votes.

Do not store plaintext passwords.

Do not store plaintext OTPs.

Do not expose a voter's selections after voting.

## Development

Work incrementally.

Before implementing the backend:

1. Inspect the frontend.
2. Identify all API calls.
3. Identify request/response formats.
4. Identify authentication assumptions.
5. Produce an API contract.
6. Then implement the backend.

Run the frontend and backend tests during development.

Do not simply generate code without testing it.

Keep the implementation understandable enough to explain during a university software engineering presentation.