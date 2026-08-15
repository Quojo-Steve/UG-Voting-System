# Documentation Compliance Matrix

Source documents inspected: project codebase and `CSCD 602 Advanced Software Engineering Project Exams.pdf`.

| Lecturer Requirement | Required? | Evidence in Project | Status | Report Section |
|---|---:|---|---|---|
| Realistic software problem | Yes | UG student election management and voting system described in `AGENTS.md`; implemented routes and UI for elections, candidates and voters | Fully Implemented | Problem Statement |
| Identify stakeholders/users | Yes | Three implemented interfaces in `frontend/src/App.tsx`: Commissioner, Candidate, Voter | Fully Implemented | Stakeholders |
| Requirements analysis | Yes | Existing `BACKEND_API_CONTRACT.md`, `BACKEND_PLAN.md`, implemented API services in `frontend/src/services/` | Partially Implemented | Requirements Analysis |
| Software Requirements Specification | Yes | Not present as a standalone submitted document before this task | Not Implemented | SRS |
| Functional requirements | Yes | Features implemented across `backend/app/main.py` and frontend pages | Fully Implemented | Requirements/SRS |
| Non-functional requirements | Yes | Security validation, JWT, password hashing, CORS, SQLite config; no formal NFR document existed | Partially Implemented | Requirements/SRS |
| Requirements prioritisation | Yes | No explicit MoSCoW/prioritisation document found | Not Implemented | Requirements Prioritisation |
| Software effort estimation | Yes | No effort estimation document found in source | Not Implemented | Effort Estimation |
| System analysis | Yes | Use cases/workflows visible in UI and API; no formal analysis document found | Partially Implemented | System Analysis |
| System design artefacts | Yes | Database models in `backend/app/models.py`, frontend routing in `App.tsx`, API routes in `main.py`; no diagram files found | Partially Implemented | System Design/Diagrams |
| Functional application | Yes | FastAPI backend, React frontend, SQLite database, tests | Fully Implemented | Implementation |
| Frontend | Where applicable | React 19 + Vite app in `frontend/`; routes in `frontend/src/App.tsx` | Fully Implemented | Implementation |
| Backend | Where applicable | FastAPI application in `backend/app/main.py` | Fully Implemented | Implementation |
| Database | Where applicable | SQLite via SQLAlchemy in `backend/app/database.py`; models in `models.py` | Fully Implemented | Database Design |
| Authentication | Where applicable | Commissioner/candidate login endpoints; JWT in `backend/app/security.py`; frontend `AuthContext` | Fully Implemented | Authentication |
| Authorisation | Where applicable | `require_commissioner`, `require_candidate` dependencies in `main.py` | Fully Implemented | Authorization |
| API integration | Where applicable | Axios services in `frontend/src/services/`; REST endpoints in backend | Fully Implemented | API Design |
| Input validation | Where applicable | Pydantic schemas in `backend/app/schemas.py`; frontend form validation | Partially Implemented | Validation |
| Error handling | Where applicable | FastAPI `HTTPException`; frontend toast/error states | Partially Implemented | Error Handling |
| Security controls | Where applicable | Password hashing, JWT, OTP hashing, voting token hashing, one-vote constraints | Partially Implemented | Security Controls |
| Responsive interface | Where applicable | Tailwind classes and responsive layouts in frontend components | Partially Implemented | UI Design |
| Technical debt identification | Yes | No formal technical debt plan found before this task | Not Implemented | Technical Debt |
| Testing evidence | Yes | `backend/tests/test_flow.py`; pytest executed successfully during inspection | Partially Implemented | Testing |
| Functional testing | Yes | End-to-end backend flow test in `backend/tests/test_flow.py` | Fully Implemented | Testing |
| Unit testing | Where applicable | No isolated unit tests found | Not Implemented | Testing |
| Integration testing | Where applicable | TestClient flow exercises integrated API/database behavior | Fully Implemented | Testing |
| System testing | Yes | Manual API workflow performed during integration; no persistent report existed | Partially Implemented | Testing |
| UAT | Yes | No UAT evidence found | Not Implemented | Testing |
| Security testing | Where appropriate | Security rules tested indirectly for second-vote prevention; no dedicated security test suite | Partially Implemented | Testing |
| Deployment | Yes | Local run configs exist; no Docker/cloud deployment files or live URL found | Not Implemented | Deployment |
| Live application URL | Yes | No live URL found | Not Implemented | Deployment |
| Admin URL | If applicable | Commissioner route `/commissioner/login`; no live admin URL | Partially Implemented | Deployment Links |
| Test credentials | Yes | Default local commissioner in `backend/README.md`; candidate/voter test data generated during tests only | Partially Implemented | Deployment Links |
| Source-code repository | Yes | Git repository present locally; remote URL not inspected/available in docs | Partially Implemented | Deployment Links |
| Consolidated documentation | Yes | Created in `docs/PROJECT_DOCUMENTATION.md` by this task | Fully Implemented | Entire Report |
| User manual | Yes | Created in `docs/USER_MANUAL.md` based on actual UI routes | Fully Implemented | User Manual |
| Maintenance strategy | Yes | Created in `PROJECT_DOCUMENTATION.md` | Fully Implemented | Maintenance |
| Future evolution | Yes | Created in `PROJECT_DOCUMENTATION.md` | Fully Implemented | Future Evolution |
| Limitations | Yes | Created in `PROJECT_DOCUMENTATION.md`; includes deployment/testing/security gaps | Fully Implemented | Limitations |
| References | Yes | Created in `PROJECT_DOCUMENTATION.md` | Fully Implemented | References |
| Final ZIP structure | Yes | Source documents created; PDF conversion not performed | Partially Implemented | Submission Package |
