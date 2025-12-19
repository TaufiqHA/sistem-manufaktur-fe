# User API Documentation

This document outlines the API endpoints for user management in the application.

## Authentication

Most user endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Base URL

All API endpoints are prefixed with `/api/v1` (or follow your application's API versioning scheme).

## Endpoints

### 1. Get Authenticated User Information

#### Request

- Method: `GET`
- Endpoint: `/api/v1/user`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`

#### Response

```json
{
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "email_verified_at": "2023-01-01T00:00:00.000000Z",
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

---

### 2. Register New User

#### Request

- Method: `POST`
- Endpoint: `/api/v1/register`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "password_confirmation": "securePassword123"
}
```

#### Response (Success)

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "token": "jwt_token_here"
    }
}
```

#### Response (Validation Error)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": [
            "The email has already been taken."
        ],
        "password": [
            "The password confirmation does not match."
        ]
    }
}
```

---

### 3. Login User

#### Request

- Method: `POST`
- Endpoint: `/api/v1/login`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body:
```json
{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

#### Response (Success)

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        },
        "token": "jwt_token_here"
    }
}
```

#### Response (Authentication Error)

```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

---

### 4. Logout User

#### Request

- Method: `POST`
- Endpoint: `/api/v1/logout`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`

#### Response

```json
{
    "success": true,
    "message": "Logout successful"
}
```

---

### 5. Update User Profile

#### Request

- Method: `PUT` or `PATCH`
- Endpoint: `/api/v1/user`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body (optional fields):
```json
{
    "name": "Updated Name",
    "email": "updated-email@example.com"
}
```

#### Response

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": 1,
        "name": "Updated Name",
        "email": "updated-email@example.com",
        "email_verified_at": "2023-01-01T00:00:00.000000Z",
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

---

### 6. Change Password

#### Request

- Method: `PUT` or `PATCH`
- Endpoint: `/api/v1/user/change-password`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body:
```json
{
    "current_password": "currentPassword123",
    "new_password": "newSecurePassword123",
    "new_password_confirmation": "newSecurePassword123"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

---

### 7. Forgot Password

#### Request

- Method: `POST`
- Endpoint: `/api/v1/forgot-password`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body:
```json
{
    "email": "john@example.com"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password reset link sent to your email"
}
```

---

### 8. Reset Password

#### Request

- Method: `POST`
- Endpoint: `/api/v1/reset-password`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body:
```json
{
    "token": "reset_token_from_email",
    "email": "john@example.com",
    "password": "newSecurePassword123",
    "password_confirmation": "newSecurePassword123"
}
```

#### Response

```json
{
    "success": true,
    "message": "Password reset successfully"
}
```

---

### 9. Get All Users (Admin only)

#### Request

- Method: `GET`
- Endpoint: `/api/v1/users`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`

#### Response

```json
{
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "email_verified_at": "2023-01-01T00:00:00.000000Z",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "updated_at": "2023-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "email_verified_at": "2023-01-01T00:00:00.000000Z",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "updated_at": "2023-01-01T00:00:00.000000Z"
        }
    ],
    "pagination": {
        "total": 10,
        "per_page": 15,
        "current_page": 1,
        "last_page": 1,
        "first_page_url": "/api/v1/users?page=1",
        "last_page_url": "/api/v1/users?page=1",
        "next_page_url": null,
        "prev_page_url": null
    }
}
```

---

## Error Responses Format

Standard error response format:

```json
{
    "success": false,
    "message": "Error message goes here",
    "errors": {
        "field_name": [
            "Error message for specific field"
        ]
    }
}
```

## Common Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource does not exist
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error