# Project API Documentation

## Overview
The Project API allows you to manage manufacturing projects in the system. All endpoints require authentication using Sanctum tokens.

## Authentication
All API requests must include a valid Sanctum token in the Authorization header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### List all projects
```
GET /api/projects
```

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "code": "PROJ-ABC12",
            "name": "Sample Manufacturing Project",
            "customer": "ABC Corp",
            "start_date": "2024-01-15",
            "deadline": "2024-06-30",
            "status": "IN_PROGRESS",
            "progress": 45,
            "qty_per_unit": 100,
            "procurement_qty": 1000,
            "total_qty": 10000,
            "unit": "PCS",
            "is_locked": false,
            "created_at": "2024-01-10T08:30:00.000000Z",
            "updated_at": "2024-02-15T14:20:00.000000Z"
        }
    ]
}
```

### Get a specific project
```
GET /api/projects/{id}
```

**Response:**
```json
{
    "data": {
        "id": 1,
        "code": "PROJ-ABC12",
        "name": "Sample Manufacturing Project",
        "customer": "ABC Corp",
        "start_date": "2024-01-15",
        "deadline": "2024-06-30",
        "status": "IN_PROGRESS",
        "progress": 45,
        "qty_per_unit": 100,
        "procurement_qty": 1000,
        "total_qty": 10000,
        "unit": "PCS",
        "is_locked": false,
        "created_at": "2024-01-10T08:30:00.000000Z",
        "updated_at": "2024-02-15T14:20:00.000000Z"
    }
}
```

### Create a new project
```
POST /api/projects
```

**Request Body:**
```json
{
    "code": "PROJ-NEW01",
    "name": "New Manufacturing Project",
    "customer": "New Customer Inc",
    "start_date": "2024-03-01",
    "deadline": "2024-09-30",
    "status": "PLANNED",
    "progress": 0,
    "qty_per_unit": 200,
    "procurement_qty": 4000,
    "total_qty": 20000,
    "unit": "SET",
    "is_locked": false
}
```

**Response (201 Created):**
```json
{
    "message": "Project created successfully.",
    "data": {
        "id": 2,
        "code": "PROJ-NEW01",
        "name": "New Manufacturing Project",
        "customer": "New Customer Inc",
        "start_date": "2024-03-01",
        "deadline": "2024-09-30",
        "status": "PLANNED",
        "progress": 0,
        "qty_per_unit": 200,
        "procurement_qty": 4000,
        "total_qty": 20000,
        "unit": "SET",
        "is_locked": false,
        "created_at": "2024-02-20T10:15:00.000000Z",
        "updated_at": "2024-02-20T10:15:00.000000Z"
    }
}
```

### Update a project
```
PUT /api/projects/{id}
```

**Request Body:**
```json
{
    "code": "PROJ-UPDATED",
    "name": "Updated Project Name",
    "customer": "Updated Customer",
    "start_date": "2024-03-01",
    "deadline": "2024-10-15",
    "status": "IN_PROGRESS",
    "progress": 25,
    "qty_per_unit": 250,
    "procurement_qty": 5000,
    "total_qty": 25000,
    "unit": "KIT",
    "is_locked": true
}
```

**Response:**
```json
{
    "message": "Project updated successfully.",
    "data": {
        "id": 2,
        "code": "PROJ-UPDATED",
        "name": "Updated Project Name",
        "customer": "Updated Customer",
        "start_date": "2024-03-01",
        "deadline": "2024-10-15",
        "status": "IN_PROGRESS",
        "progress": 25,
        "qty_per_unit": 250,
        "procurement_qty": 5000,
        "total_qty": 25000,
        "unit": "KIT",
        "is_locked": true,
        "created_at": "2024-02-20T10:15:00.000000Z",
        "updated_at": "2024-02-20T11:30:00.000000Z"
    }
}
```

### Delete a project
```
DELETE /api/projects/{id}
```

**Response:**
```json
{
    "message": "Project deleted successfully."
}
```

## Validation Rules

### Required Fields
- `code`: Unique project code (max 255 characters)
- `name`: Project name (max 255 characters)
- `customer`: Customer name (max 255 characters)
- `start_date`: Project start date (format: YYYY-MM-DD)
- `deadline`: Project deadline (format: YYYY-MM-DD, must be after start date)
- `status`: Project status (PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)
- `progress`: Progress percentage (0-100)
- `qty_per_unit`: Quantity per unit (min 0)
- `procurement_qty`: Procurement quantity (min 0)
- `total_qty`: Total quantity (min 0)
- `unit`: Unit of measurement (max 50 characters)

### Optional Fields
- `is_locked`: Boolean value (default: false)

### Status Values
- `PLANNED` - Project is in planning phase
- `IN_PROGRESS` - Project is currently being executed
- `COMPLETED` - Project is finished
- `ON_HOLD` - Project is temporarily paused
- `CANCELLED` - Project has been cancelled

## Common Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 422 Validation Error
```json
{
    "message": "The code field is required. (and 1 more error)",
    "errors": {
        "code": [
            "The code field is required."
        ],
        "name": [
            "The name field is required."
        ]
    }
}
```

### 404 Not Found
```json
{
    "message": "Project not found."
}
```

## Error Handling
- Validation errors return a 422 status with detailed error messages
- Authentication errors return a 401 status
- Resource not found errors return a 404 status