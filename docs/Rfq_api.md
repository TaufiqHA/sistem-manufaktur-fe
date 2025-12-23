# RFQ API Documentation

## Overview
This document provides the API endpoints for managing Request for Quotations (RFQs) in the system.

## Base URL
```
http://your-api-domain.com/api
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token-here}
```

## Endpoints

### 1. List All RFQs
**GET** `/api/rfqs`

Retrieves a paginated list of all RFQs with optional filtering and searching.

#### Query Parameters
- `search` (optional): Search in code or description fields
- `status` (optional): Filter by status (DRAFT, PO_CREATED)
- `date` (optional): Filter by specific date (format: YYYY-MM-DD)
- `start_date` (optional): Start date for date range filter (format: YYYY-MM-DD)
- `end_date` (optional): End date for date range filter (format: YYYY-MM-DD)
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 15)

#### Response
```json
{
  "message": "RFQs retrieved successfully",
  "data": [
    {
      "id": 1,
      "code": "RFQ-TEST-001",
      "date": "2023-12-23T10:00:00.000000Z",
      "description": "Test RFQ description",
      "status": "DRAFT"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  }
}
```

### 2. Create New RFQ
**POST** `/api/rfqs`

Creates a new RFQ with the provided data.

#### Request Body
```json
{
  "code": "RFQ-TEST-001",
  "date": "2023-12-23 10:00:00",
  "description": "Test RFQ description",
  "status": "DRAFT"
}
```

#### Validation Rules
- `code`: required, string, max:50, unique
- `date`: required, valid date format
- `description`: optional, string
- `status`: required, must be one of ['DRAFT', 'PO_CREATED']

#### Response
```json
{
  "message": "RFQ created successfully",
  "data": {
    "id": 1,
    "code": "RFQ-TEST-001",
    "date": "2023-12-23T10:00:00.000000Z",
    "description": "Test RFQ description",
    "status": "DRAFT",
    "created_at": "2023-12-23T10:00:00.000000Z",
    "updated_at": "2023-12-23T10:00:00.000000Z"
  }
}
```

### 3. Get Single RFQ
**GET** `/api/rfqs/{id}`

Retrieves a specific RFQ by its ID.

#### Path Parameters
- `id`: The ID of the RFQ to retrieve

#### Response
```json
{
  "id": 1,
  "code": "RFQ-TEST-001",
  "date": "2023-12-23T10:00:00.000000Z",
  "description": "Test RFQ description",
  "status": "DRAFT",
  "created_at": "2023-12-23T10:00:00.000000Z",
  "updated_at": "2023-12-23T10:00:00.000000Z"
}
```

### 4. Update RFQ
**PUT/PATCH** `/api/rfqs/{id}`

Updates an existing RFQ with the provided data.

#### Path Parameters
- `id`: The ID of the RFQ to update

#### Request Body
```json
{
  "code": "RFQ-UPDATED-001",
  "date": "2023-12-24 10:00:00",
  "description": "Updated RFQ description",
  "status": "PO_CREATED"
}
```

#### Validation Rules
- `code`: optional, string, max:50, unique (excluding current record)
- `date`: optional, valid date format
- `description`: optional, nullable, string
- `status`: optional, must be one of ['DRAFT', 'PO_CREATED']

#### Response
```json
{
  "message": "RFQ updated successfully",
  "data": {
    "id": 1,
    "code": "RFQ-UPDATED-001",
    "date": "2023-12-24T10:00:00.000000Z",
    "description": "Updated RFQ description",
    "status": "PO_CREATED",
    "created_at": "2023-12-23T10:00:00.000000Z",
    "updated_at": "2023-12-24T10:00:00.000000Z"
  }
}
```

### 5. Delete RFQ
**DELETE** `/api/rfqs/{id}`

Deletes a specific RFQ by its ID.

#### Path Parameters
- `id`: The ID of the RFQ to delete

#### Response
```json
{
  "message": "RFQ deleted successfully"
}
```

## Status Values
- `DRAFT`: The RFQ is in draft status
- `PO_CREATED`: A purchase order has been created from this RFQ

## Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error
```json
{
  "message": "The code field is required. (and 2 more errors)",
  "errors": {
    "code": [
      "The code field is required."
    ],
    "date": [
      "The date field is required."
    ],
    "status": [
      "The status field is required."
    ]
  }
}
```