# User API Documentation

This document outlines the API endpoints for user management in the application.

## Authentication

All user endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Permissions

User endpoints are protected by role-based permissions:
- `view_users` - Required to view user listings and individual users
- `create_users` - Required to create new users
- `edit_users` - Required to update users
- `delete_users` - Required to delete users

Admin users have all permissions by default.

## Base URL

All API endpoints are prefixed with `/api/v1` (or follow your application's API versioning scheme).

## Endpoints

### 1. Get All Users

#### Request

- Method: `GET`
- Endpoint: `/api/v1/users`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`
- Query Parameters:
  - `per_page` (optional): Number of records per page (default: 10)
  - `search` (optional): Search term to filter by name or email

#### Response

```json
{
    "success": true,
    "data": {
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
        "links": {
            "first": "/api/v1/users?page=1",
            "last": "/api/v1/users?page=3",
            "prev": null,
            "next": "/api/v1/users?page=2"
        },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 3,
            "links": [...],
            "path": "/api/v1/users",
            "per_page": 10,
            "to": 10,
            "total": 25
        }
    }
}
```

---

### 2. Get Specific User

#### Request

- Method: `GET`
- Endpoint: `/api/v1/users/{id}`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`

#### Response

```json
{
    "success": true,
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

### 3. Create New User

#### Request

- Method: `POST`
- Endpoint: `/api/v1/users`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer {jwt_token}`
- Body:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "password_confirmation": "securePassword123",
    "role": "operator",
    "permissions": ["view_users", "edit_users"]
}
```

#### Response (Success)

```json
{
    "success": true,
    "message": "User created successfully.",
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

#### Response (Validation Error)

```json
{
    "message": "The name field is required. (and 1 more error)",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "email": [
            "The email has already been taken."
        ]
    }
}
```

#### Validation Rules
- `name`: required, string, max:255
- `email`: required, email, unique
- `password`: required, string, min:8, confirmed
- `role`: required, must be one of ['admin', 'operator', 'manager']
- `permissions`: array of strings (optional)

---

### 4. Update User

#### Request

- Method: `PUT` or `PATCH`
- Endpoint: `/api/v1/users/{id}`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer {jwt_token}`
- Body (any combination of these fields):
```json
{
    "name": "Updated Name",
    "email": "updated@example.com",
    "password": "newSecurePassword123",
    "password_confirmation": "newSecurePassword123",
    "role": "admin",
    "permissions": ["view_users", "create_users", "edit_users", "delete_users"]
}
```

#### Response

```json
{
    "success": true,
    "message": "User updated successfully.",
    "data": {
        "id": 1,
        "name": "Updated Name",
        "email": "updated@example.com",
        "email_verified_at": "2023-01-01T00:00:00.000000Z",
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

#### Update Validation Rules
- `name`: sometimes, string, max:255
- `email`: sometimes, email, unique (ignoring current user)
- `password`: sometimes, string, min:8, confirmed
- `role`: sometimes, must be one of ['admin', 'operator', 'manager']
- `permissions`: sometimes, array of strings

---

### 5. Delete User

#### Request

- Method: `DELETE`
- Endpoint: `/api/v1/users/{id}`
- Headers:
  - `Authorization: Bearer {jwt_token}`
  - `Accept: application/json`

#### Response

```json
{
    "success": true,
    "message": "User deleted successfully."
}
```

#### Response (Cannot Delete Own Account)

```json
{
    "success": false,
    "message": "Cannot delete your own account."
}
```

---

## Error Responses Format

Standard error response format:

```json
{
    "message": "Error message goes here",
    "errors": {
        "field_name": [
            "Error message for specific field"
        ]
    }
}
```

Or:

```json
{
    "success": false,
    "message": "Error message goes here"
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