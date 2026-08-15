from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app, get_db
from app.database import Base
from app.models import User, Role
from app.security import hash_password

engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def setup_module():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.add(User(id='comm-test', email='commissioner@ug.edu.gh', password_hash=hash_password('ecpassword2026'), role=Role.COMMISSIONER, name='Test Commissioner'))
    db.commit(); db.close()
    app.dependency_overrides[get_db] = override_get_db


def test_complete_backend_flow():
    client = TestClient(app)

    r = client.post('/api/auth/commissioner/login', json={'email': 'commissioner@ug.edu.gh', 'password': 'ecpassword2026'})
    assert r.status_code == 200, r.text
    comm_token = r.json()['token']
    comm_headers = {'Authorization': f'Bearer {comm_token}'}

    r = client.post('/api/elections', headers=comm_headers, json={
        'name': 'Test Election', 'description': 'A test election',
        'startDate': '2026-08-20', 'startTime': '08:00', 'endDate': '2026-08-20', 'endTime': '17:00',
        'positions': ['President', 'Secretary']
    })
    assert r.status_code == 200, r.text
    election = r.json(); eid = election['id']; pos1, pos2 = election['positions'][0]['id'], election['positions'][1]['id']

    assert client.patch(f'/api/elections/{eid}/status', headers=comm_headers, json={'status': 'REGISTRATION'}).status_code == 200

    r = client.post('/api/elections/%s/voters/import' % eid, headers=comm_headers, json={'voters': [
        {'voterId': '10982341', 'name': 'Voter One', 'email': 'voter1@st.ug.edu.gh'},
    ]})
    assert r.status_code == 200, r.text

    r = client.post('/api/auth/candidate/register', json={'fullName': 'Cand One', 'email': 'cand1@st.ug.edu.gh', 'studentId': '20000001', 'password': 'secret123', 'hallOfResidence': 'Legon Hall', 'department': 'CS', 'level': 'Level 300'})
    assert r.status_code == 200, r.text
    cand_token = r.json()['token']; cand_headers = {'Authorization': f'Bearer {cand_token}'}

    r = client.post(f'/api/elections/{eid}/candidates/apply', headers=cand_headers, json={'electionId': eid, 'positionId': pos1, 'positionName': 'President', 'fullName': 'Cand One', 'email': 'cand1@st.ug.edu.gh', 'studentId': '20000001', 'manifesto': 'This is a sufficiently detailed manifesto.'})
    assert r.status_code == 200, r.text
    cand1 = r.json()['id']

    r = client.patch(f'/api/candidates/{cand1}/review', headers=comm_headers, json={'status': 'APPROVED'})
    assert r.status_code == 200, r.text

    # Add candidate for second position so ballot can be complete.
    r = client.post('/api/auth/candidate/register', json={'fullName': 'Cand Two', 'email': 'cand2@st.ug.edu.gh', 'studentId': '20000002', 'password': 'secret123'})
    cand2_headers = {'Authorization': f"Bearer {r.json()['token']}"}
    r = client.post(f'/api/elections/{eid}/candidates/apply', headers=cand2_headers, json={'electionId': eid, 'positionId': pos2, 'positionName': 'Secretary', 'fullName': 'Cand Two', 'email': 'cand2@st.ug.edu.gh', 'studentId': '20000002', 'manifesto': 'This is another sufficiently detailed manifesto.'})
    cand2 = r.json()['id']
    assert client.patch(f'/api/candidates/{cand2}/review', headers=comm_headers, json={'status': 'APPROVED'}).status_code == 200

    r = client.patch(f'/api/elections/{eid}/status', headers=comm_headers, json={'status': 'LIVE'})
    assert r.status_code == 200, r.text

    r = client.post('/api/voter/request-otp', json={'voterId': '10982341', 'electionId': eid})
    assert r.status_code == 200, r.text

    # OTP is random; fetch from DB by replacing stored hash with known hash for deterministic test.
    from app.models import OTPChallenge
    from app.security import hash_secret
    db = TestingSessionLocal(); otp = db.query(OTPChallenge).first(); otp.otp_hash = hash_secret('123456'); db.commit(); db.close()

    r = client.post('/api/voter/verify-otp', json={'voterId': '10982341', 'electionId': eid, 'code': '123456'})
    assert r.status_code == 200, r.text
    vote_token = r.json()['token']

    r = client.get(f'/api/elections/{eid}/ballot')
    assert r.status_code == 200, r.text
    assert len(r.json()['candidates']) == 2

    r = client.post(f'/api/elections/{eid}/ballot/cast', json={'electionId': eid, 'voterId': '10982341', 'token': vote_token, 'votes': [{'positionId': pos1, 'candidateId': cand1}, {'positionId': pos2, 'candidateId': cand2}]})
    assert r.status_code == 200, r.text
    assert r.json()['success'] is True

    r = client.post(f'/api/elections/{eid}/ballot/cast', json={'electionId': eid, 'voterId': '10982341', 'token': vote_token, 'votes': [{'positionId': pos1, 'candidateId': cand1}, {'positionId': pos2, 'candidateId': cand2}]})
    assert r.status_code in (401, 409)

    r = client.get(f'/api/elections/{eid}/results', headers=comm_headers)
    assert r.status_code == 200, r.text
    assert r.json()['totalVotesCast'] == 1
