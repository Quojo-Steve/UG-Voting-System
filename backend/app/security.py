import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from .config import get_settings

pwd_context = CryptContext(schemes=['pbkdf2_sha256'], deprecated='auto')
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, role: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {'sub': subject, 'role': role, 'email': email, 'exp': expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def generate_id(prefix: str) -> str:
    return f'{prefix}-{secrets.token_urlsafe(12)}'


def generate_otp() -> str:
    return f'{secrets.randbelow(1000000):06d}'


def hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def generate_receipt() -> str:
    return f'UG-VOTE-{secrets.token_hex(4).upper()}-{secrets.token_hex(2).upper()}'
