from fastapi import status

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@placepilot.ai",
            "password": "securepassword123",
            "full_name": "New Student"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@placepilot.ai"
    assert "id" in data
    assert "hashed_password" not in data

def test_login_user(client):
    # Register user first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "testlogin@placepilot.ai",
            "password": "loginpassword123",
            "full_name": "Test Login"
        }
    )
    
    # Login via OAuth2 token form
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "testlogin@placepilot.ai",
            "password": "loginpassword123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    # Login via JSON endpoint
    json_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testlogin@placepilot.ai",
            "password": "loginpassword123"
        }
    )
    assert json_response.status_code == status.HTTP_200_OK
    assert "access_token" in json_response.json()

def test_login_failed_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@placepilot.ai",
            "password": "loginpassword123"
        }
    )
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "wrongpass@placepilot.ai",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_read_me_authenticated(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@placepilot.ai",
            "password": "securepassword123",
            "full_name": "Me Student"
        }
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "me@placepilot.ai",
            "password": "securepassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == "me@placepilot.ai"

def test_user_password_is_bcrypt_hashed(client, db):
    email = "hashedcheck@placepilot.ai"
    password = "secretpassword123"
    
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Hash Check"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    
    # Query database directly
    from app.models.user import User
    user = db.query(User).filter(User.email == email).first()
    assert user is not None
    assert user.hashed_password != password
    assert user.hashed_password.startswith("$2b$")
