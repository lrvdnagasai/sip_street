import pytest
from app.core.security import hash_password, verify_password, validate_password_length


def test_password_hashing_and_verification():
    raw_password = "SecurePassword123!"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_password_length_validation():
    with pytest.raises(ValueError, match="between 8 and 100 characters"):
        validate_password_length("short")

    with pytest.raises(ValueError, match="between 8 and 100 characters"):
        validate_password_length("a" * 101)

    # Valid password lengths
    validate_password_length("12345678")
    validate_password_length("a" * 100)


def test_verify_password_edge_cases():
    assert verify_password("", "somehash") is False
    assert verify_password("somepassword", "") is False
    assert verify_password("password", "invalid_hash_format") is False
