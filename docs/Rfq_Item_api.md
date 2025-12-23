# RFQ Item API Documentation

## Overview
The RFQ Item API provides endpoints to manage items within a Request for Quotation (RFQ). Each RFQ item represents a specific material or component required for the RFQ, including quantity and other details.

## Base URL
```
http://your-api-domain.com/api
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## Available Endpoints

### 1. List RFQ Items
Get a paginated list of all RFQ items.

- **Method**: `GET`
- **Endpoint**: `/rfq-items`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "rfq_id": 1,
      "material_id": 1,
      "name": "Steel Plate",
      "qty": 10,
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "rfq": {
        "id": 1,
        "code": "RFQ-001",
        "date": "2023-01-01T00:00:00.000000Z",
        "description": "Sample RFQ",
        "status": "pending"
      },
      "material": {
        "id": 1,
        "code": "MAT-001",
        "name": "Steel Plate",
        "unit": "piece",
        "current_stock": 100,
        "safety_stock": 20,
        "price_per_unit": 10.50,
        "category": "metal"
      }
    }
  ],
  "links": {
    "first": "http://your-api-domain.com/api/rfq-items?page=1",
    "last": "http://your-api-domain.com/api/rfq-items?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [...],
    "path": "http://your-api-domain.com/api/rfq-items",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### 2. Get Specific RFQ Item
Retrieve details of a specific RFQ item.

- **Method**: `GET`
- **Endpoint**: `/rfq-items/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Parameters**:
  - `id` (integer, required): The ID of the RFQ item

#### Response
```json
{
  "data": {
    "id": 1,
    "rfq_id": 1,
    "material_id": 1,
    "name": "Steel Plate",
    "qty": 10,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "rfq": {
      "id": 1,
      "code": "RFQ-001",
      "date": "2023-01-01T00:00:00.000000Z",
      "description": "Sample RFQ",
      "status": "pending"
    },
    "material": {
      "id": 1,
      "code": "MAT-001",
      "name": "Steel Plate",
      "unit": "piece",
      "current_stock": 100,
      "safety_stock": 20,
      "price_per_unit": 10.50,
      "category": "metal"
    }
  }
}
```

### 3. Create RFQ Item
Create a new RFQ item.

- **Method**: `POST`
- **Endpoint**: `/rfq-items`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body
```json
{
  "rfq_id": 1,
  "material_id": 1,
  "name": "Steel Plate",
  "qty": 10
}
```

#### Parameters
- `rfq_id` (integer, required): ID of the associated RFQ
- `material_id` (integer, required): ID of the associated material
- `name` (string, required, max: 255): Name of the RFQ item
- `qty` (integer, required, min: 1): Quantity required

#### Response
```json
{
  "message": "RFQ item created successfully",
  "data": {
    "id": 1,
    "rfq_id": 1,
    "material_id": 1,
    "name": "Steel Plate",
    "qty": 10,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "rfq": {
      "id": 1,
      "code": "RFQ-001",
      "date": "2023-01-01T00:00:00.000000Z",
      "description": "Sample RFQ",
      "status": "pending"
    },
    "material": {
      "id": 1,
      "code": "MAT-001",
      "name": "Steel Plate",
      "unit": "piece",
      "current_stock": 100,
      "safety_stock": 20,
      "price_per_unit": 10.50,
      "category": "metal"
    }
  }
}
```

### 4. Update RFQ Item
Update an existing RFQ item.

- **Method**: `PUT` or `PATCH`
- **Endpoint**: `/rfq-items/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`
- **Parameters**:
  - `id` (integer, required): The ID of the RFQ item

#### Request Body
```json
{
  "rfq_id": 1,
  "material_id": 2,
  "name": "Updated Steel Plate",
  "qty": 15
}
```

#### Parameters
- `rfq_id` (integer, optional): ID of the associated RFQ
- `material_id` (integer, optional): ID of the associated material
- `name` (string, optional, max: 255): Name of the RFQ item
- `qty` (integer, optional, min: 1): Quantity required

#### Response
```json
{
  "message": "RFQ item updated successfully",
  "data": {
    "id": 1,
    "rfq_id": 1,
    "material_id": 2,
    "name": "Updated Steel Plate",
    "qty": 15,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-02T00:00:00.000000Z",
    "rfq": {
      "id": 1,
      "code": "RFQ-001",
      "date": "2023-01-01T00:00:00.000000Z",
      "description": "Sample RFQ",
      "status": "pending"
    },
    "material": {
      "id": 2,
      "code": "MAT-002",
      "name": "Aluminum Sheet",
      "unit": "piece",
      "current_stock": 50,
      "safety_stock": 10,
      "price_per_unit": 8.75,
      "category": "metal"
    }
  }
}
```

### 5. Delete RFQ Item
Delete a specific RFQ item.

- **Method**: `DELETE`
- **Endpoint**: `/rfq-items/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Parameters**:
  - `id` (integer, required): The ID of the RFQ item

#### Response
```
Status: 204 No Content
```

### 6. Get RFQ Items by RFQ ID
Get all RFQ items for a specific RFQ.

- **Method**: `GET`
- **Endpoint**: `/rfq-items-by-rfq/{rfqId}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
- **Parameters**:
  - `rfqId` (integer, required): The ID of the RFQ

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "rfq_id": 1,
      "material_id": 1,
      "name": "Steel Plate",
      "qty": 10,
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "rfq": {
        "id": 1,
        "code": "RFQ-001",
        "date": "2023-01-01T00:00:00.000000Z",
        "description": "Sample RFQ",
        "status": "pending"
      },
      "material": {
        "id": 1,
        "code": "MAT-001",
        "name": "Steel Plate",
        "unit": "piece",
        "current_stock": 100,
        "safety_stock": 20,
        "price_per_unit": 10.50,
        "category": "metal"
      }
    },
    {
      "id": 2,
      "rfq_id": 1,
      "material_id": 2,
      "name": "Aluminum Sheet",
      "qty": 5,
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "rfq": {
        "id": 1,
        "code": "RFQ-001",
        "date": "2023-01-01T00:00:00.000000Z",
        "description": "Sample RFQ",
        "status": "pending"
      },
      "material": {
        "id": 2,
        "code": "MAT-002",
        "name": "Aluminum Sheet",
        "unit": "piece",
        "current_stock": 50,
        "safety_stock": 10,
        "price_per_unit": 8.75,
        "category": "metal"
      }
    }
  ]
}
```

## Error Responses

### Validation Error
```
Status: 422 Unprocessable Entity
{
  "error": "Validation failed",
  "messages": {
    "field_name": [
      "The field_name field is required.",
      "The field_name must be an integer."
    ]
  }
}
```

### Not Found Error
```
Status: 404 Not Found
{
  "message": "Record not found"
}
```

### Unauthorized Error
```
Status: 401 Unauthorized
{
  "message": "Unauthenticated."
}
```

## Notes
- All endpoints require a valid authentication token
- The `rfq_id` and `material_id` must exist in their respective tables
- The `qty` field must be a positive integer
- The `name` field has a maximum length of 255 characters
- Relationships to RFQ and Material are automatically loaded with each request