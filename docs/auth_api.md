# Authentication API Documentation

This document provides comprehensive documentation for the authentication endpoints in the manufacturing application.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Endpoints](#authentication-endpoints)
    - [Register](#register)
    - [Login](#login)
    - [Logout](#logout)
    - [Profile](#profile)
    - [Refresh Token](#refresh-token)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)

## Overview

The authentication system uses Laravel Sanctum for API token-based authentication. All protected endpoints require a valid Bearer token in the Authorization header.

### Base URL
```
https://your-domain.com/api/
```

### Authentication Header
```
Authorization: Bearer {token}
```

## Authentication Endpoints

### Register

Create a new user account.

#### Endpoint
```
POST /api/register
```

#### Headers
```
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | User's email address (must be unique) |
| password | string | Yes | User's password (minimum 8 characters) |
| password_confirmation | string | Yes | Password confirmation |
| role | string | Yes | User role (admin, operator, manager) |
| permissions | array | No | Array of permissions for the user |

#### Example Request
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "operator",
    "permissions": ["view_projects", "edit_materials"]
}
```

#### Example Response
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "operator",
            "permissions": ["view_projects", "edit_materials"],
            "email_verified_at": null,
            "created_at": "2023-01-01T10:00:00.000000Z",
            "updated_at": "2023-01-01T10:00:00.000000Z"
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

### Login

Authenticate a user and retrieve an access token.

#### Endpoint
```
POST /api/login
```

#### Headers
```
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password (minimum 8 characters) |

#### Example Request
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Example Response
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "operator",
            "permissions": ["view_projects", "edit_materials"],
            "email_verified_at": null,
            "created_at": "2023-01-01T10:00:00.000000Z",
            "updated_at": "2023-01-01T10:00:00.000000Z"
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

### Logout

Revoke the current user's token and log them out.

#### Endpoint
```
POST /api/logout
```

#### Headers
```
Authorization: Bearer {token}
```

#### Example Request
```json
// No request body needed
```

#### Example Response
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Profile

Retrieve the authenticated user's profile information.

#### Endpoint
```
GET /api/user
```

#### Headers
```
Authorization: Bearer {token}
```

#### Example Request
```json
// No request body needed
```

#### Example Response
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "operator",
        "permissions": ["view_projects", "edit_materials"],
        "email_verified_at": null,
        "created_at": "2023-01-01T10:00:00.000000Z",
        "updated_at": "2023-01-01T10:00:00.000000Z"
    }
}
```

### Refresh Token

Generate a new token and revoke the current one.

#### Endpoint
```
POST /api/refresh
```

#### Headers
```
Authorization: Bearer {token}
```

#### Example Request
```json
// No request body needed
```

#### Example Response
```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "token": "2|xyz789uvw012...",
        "token_type": "Bearer"
    }
}
```

## Response Format

All API responses follow a consistent format:

```json
{
    "success": true|false,
    "message": "Optional message describing the result",
    "data": {
        // Response data (optional, depending on the endpoint)
    }
}
```

### Success Response Format
- `success`: Boolean indicating if the request was successful
- `message`: Optional string with a descriptive message
- `data`: Object containing the response data (structure varies by endpoint)

## Error Handling

### Validation Errors

When a request contains invalid data, the API returns a 422 status code:

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": [
            "The email field is required."
        ],
        "password": [
            "The password field must be at least 8 characters."
        ]
    }
}
```

### Authentication Errors

When authentication fails, the API returns a 401 status code:

```json
{
    "success": false,
    "message": "The provided credentials are incorrect."
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Request successful |
| 201 | Resource created successfully |
| 401 | Unauthorized - Invalid or missing authentication |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Server error |

## User Roles and Permissions

The system supports three user roles:

### Roles
- `admin`: Full access to all features
- `operator`: General user with limited permissions
- `manager`: Middle management with more permissions than operators

### Permissions
Users can have specific permissions assigned to them, which control their access to different features in the system.