# Material API Documentation

## Overview
The Material API provides endpoints for managing materials within the inventory system. It includes functionality for creating, reading, updating, deleting materials, as well as managing stock levels and filtering materials.

## Base URL
```
/api/
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Common Headers
- `Content-Type: application/json`
- `Accept: application/json`

## Material Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | No | Unique identifier (auto-generated) |
| code | string | Yes | Unique material code |
| name | string | Yes | Material name |
| unit | string | Yes | Unit of measurement (e.g., kg, pcs, liter) |
| current_stock | integer | Yes | Current stock quantity |
| safety_stock | integer | Yes | Minimum stock level for alerts |
| price_per_unit | decimal | Yes | Cost per unit |
| category | string | Yes | Material category (RAW, FINISHING, HARDWARE) |
| created_at | datetime | No | Creation timestamp |
| updated_at | datetime | No | Update timestamp |
| deleted_at | datetime | No | Deletion timestamp (for soft deletes) |

## Endpoints

### List Materials
Get a paginated list of all materials.

- **Method**: `GET`
- **Endpoint**: `/materials`
- **Parameters**:
  - `search` (optional): Search by code, name, or category
  - `category` (optional): Filter by category (RAW, FINISHING, HARDWARE)
  - `low_stock` (optional): Filter by low stock status ('true' or 'false')
  - `page` (optional): Page number for pagination (default: 1)
  - `per_page` (optional): Number of items per page (default: 10)

#### Example Request
```bash
curl -X GET \
  "http://localhost:8000/api/materials" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "code": "MAT-TEST-001",
        "name": "Test Material",
        "unit": "kg",
        "current_stock": 100,
        "safety_stock": 10,
        "price_per_unit": "25.50",
        "category": "RAW",
        "created_at": "2025-12-18T17:50:17.000000Z",
        "updated_at": "2025-12-18T17:50:17.000000Z",
        "deleted_at": null
      }
    ],
    "links": {
      "first": "http://localhost:8000/api/materials?page=1",
      "last": "http://localhost:8000/api/materials?page=1",
      "prev": null,
      "next": null
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 1,
      "path": "http://localhost:8000/api/materials",
      "per_page": 10,
      "to": 1,
      "total": 1
    }
  }
}
```

### Create Material
Create a new material entry.

- **Method**: `POST`
- **Endpoint**: `/materials`
- **Payload**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Unique material code |
| name | string | Yes | Material name |
| unit | string | Yes | Unit of measurement |
| current_stock | integer | Yes | Current stock quantity |
| safety_stock | integer | Yes | Minimum stock level for alerts |
| price_per_unit | number | Yes | Cost per unit |
| category | string | Yes | Material category |

#### Example Request
```bash
curl -X POST \
  "http://localhost:8000/api/materials" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "code": "MAT-NEW-001",
    "name": "New Material",
    "unit": "pcs",
    "current_stock": 50,
    "safety_stock": 5,
    "price_per_unit": 25.99,
    "category": "FINISHING"
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "id": 2,
    "code": "MAT-NEW-001",
    "name": "New Material",
    "unit": "pcs",
    "current_stock": 50,
    "safety_stock": 5,
    "price_per_unit": "25.99",
    "category": "FINISHING",
    "created_at": "2025-12-18T17:50:17.000000Z",
    "updated_at": "2025-12-18T17:50:17.000000Z",
    "deleted_at": null
  }
}
```

### Get Material
Retrieve details of a specific material by ID.

- **Method**: `GET`
- **Endpoint**: `/materials/{id}`

#### Example Request
```bash
curl -X GET \
  "http://localhost:8000/api/materials/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "MAT-TEST-001",
    "name": "Test Material",
    "unit": "kg",
    "current_stock": 100,
    "safety_stock": 10,
    "price_per_unit": "25.50",
    "category": "RAW",
    "created_at": "2025-12-18T17:50:17.000000Z",
    "updated_at": "2025-12-18T17:50:17.000000Z",
    "deleted_at": null
  }
}
```

### Update Material
Update details of an existing material.

- **Method**: `PUT`
- **Endpoint**: `/materials/{id}`
- **Payload**: Same as create with required fields

#### Example Request
```bash
curl -X PUT \
  "http://localhost:8000/api/materials/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "code": "MAT-UPDATED-001",
    "name": "Updated Material Name",
    "unit": "pcs",
    "current_stock": 200,
    "safety_stock": 20,
    "price_per_unit": 30.75,
    "category": "HARDWARE"
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "id": 1,
    "code": "MAT-UPDATED-001",
    "name": "Updated Material Name",
    "unit": "pcs",
    "current_stock": 200,
    "safety_stock": 20,
    "price_per_unit": "30.75",
    "category": "HARDWARE",
    "created_at": "2025-12-18T17:50:17.000000Z",
    "updated_at": "2025-12-18T17:51:22.000000Z",
    "deleted_at": null
  }
}
```

### Delete Material
Delete a material (soft delete).

- **Method**: `DELETE`
- **Endpoint**: `/materials/{id}`

#### Example Request
```bash
curl -X DELETE \
  "http://localhost:8000/api/materials/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

#### Example Response
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

### Update Material Stock
Update material stock by adding or reducing quantity.

- **Method**: `PATCH`
- **Endpoint**: `/materials/{id}/stock`
- **Payload**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| stock_change | integer | Yes | Amount to add or reduce |
| operation | string | Yes | 'add' to increase or 'reduce' to decrease |

#### Example Request - Add Stock
```bash
curl -X PATCH \
  "http://localhost:8000/api/materials/1/stock" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "stock_change": 25,
    "operation": "add"
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": 1,
    "current_stock": 125
  }
}
```

#### Example Request - Reduce Stock
```bash
curl -X PATCH \
  "http://localhost:8000/api/materials/1/stock" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "stock_change": 20,
    "operation": "reduce"
  }'
```

### Get Low Stock Materials
Get all materials where current stock is below safety stock.

- **Method**: `GET`
- **Endpoint**: `/materials-low-stock`

#### Example Request
```bash
curl -X GET \
  "http://localhost:8000/api/materials-low-stock" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

#### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MAT-LOW-001",
      "name": "Low Stock Material",
      "unit": "pcs",
      "current_stock": 5,
      "safety_stock": 10,
      "price_per_unit": "15.50",
      "category": "RAW",
      "created_at": "2025-12-18T17:50:17.000000Z",
      "updated_at": "2025-12-18T17:50:17.000000Z",
      "deleted_at": null
    }
  ]
}
```

## Error Responses

### Validation Error (422)
When request data fails validation:
```json
{
  "message": "The code field is required.",
  "errors": {
    "code": [
      "The code field is required."
    ]
  }
}
```

### Not Found (404)
When requested resource doesn't exist:
```json
{
  "message": "Material not found."
}
```

### Not Enough Stock (400)
When trying to reduce stock below zero:
```json
{
  "success": false,
  "message": "Not enough stock to reduce"
}
```

### Unauthorized (401)
When authentication fails:
```json
{
  "message": "Unauthenticated."
}
```

## Categories
Valid categories for materials:
- `RAW`: Raw materials
- `FINISHING`: Finishing materials
- `HARDWARE`: Hardware components