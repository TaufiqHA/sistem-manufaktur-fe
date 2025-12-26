# Finished Goods Warehouse API Documentation

This document provides the API endpoints for managing finished goods warehouses in the manufacturing system.

## Base URL
```
/api/finished-goods-warehouses
```

## Authentication
All API endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### List Finished Goods Warehouses
**GET** `/api/finished-goods-warehouses`

Retrieve a paginated list of finished goods warehouses.

#### Response
- **Status Code:** 200 OK
- **Content-Type:** application/json

```json
{
    "current_page": 1,
    "data": [
        {
            "id": 1,
            "project_id": 1,
            "item_name": "Product A",
            "total_produced": 1000,
            "shipped_qty": 200,
            "available_stock": 800,
            "unit": "pcs",
            "created_at": "2025-12-25T10:30:00.000000Z",
            "updated_at": "2025-12-25T10:30:00.000000Z",
            "project": {
                "id": 1,
                "code": "PROJ-001",
                "name": "Project Alpha",
                "customer": "ABC Company",
                "start_date": "2025-01-01",
                "deadline": "2025-12-31",
                "status": "IN_PROGRESS",
                "progress": 75,
                "qty_per_unit": 100,
                "procurement_qty": 10000,
                "total_qty": 10000,
                "unit": "METER",
                "is_locked": false,
                "created_at": "2025-01-01T00:00:00.000000Z",
                "updated_at": "2025-12-25T10:30:00.000000Z",
                "deleted_at": null
            }
        }
    ],
    "first_page_url": "http://localhost:8000/api/finished-goods-warehouses?page=1",
    "from": 1,
    "last_page": 5,
    "last_page_url": "http://localhost:8000/api/finished-goods-warehouses?page=5",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "page": null,
            "active": false
        },
        {
            "url": "http://localhost:8000/api/finished-goods-warehouses?page=1",
            "label": "1",
            "page": 1,
            "active": true
        }
    ],
    "next_page_url": "http://localhost:8000/api/finished-goods-warehouses?page=2",
    "path": "http://localhost:8000/api/finished-goods-warehouses",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 50
}
```

### Get Specific Finished Goods Warehouse
**GET** `/api/finished-goods-warehouses/{id}`

Retrieve details of a specific finished goods warehouse.

#### Parameters
- **id** (integer, required): The ID of the finished goods warehouse to retrieve.

#### Response
- **Status Code:** 200 OK
- **Content-Type:** application/json

```json
{
    "id": 1,
    "project_id": 1,
    "item_name": "Product A",
    "total_produced": 1000,
    "shipped_qty": 200,
    "available_stock": 800,
    "unit": "pcs",
    "created_at": "2025-12-25T10:30:00.000000Z",
    "updated_at": "2025-12-25T10:30:00.000000Z",
    "project": {
        "id": 1,
        "code": "PROJ-001",
        "name": "Project Alpha",
        "customer": "ABC Company",
        "start_date": "2025-01-01",
        "deadline": "2025-12-31",
        "status": "IN_PROGRESS",
        "progress": 75,
        "qty_per_unit": 100,
        "procurement_qty": 10000,
        "total_qty": 10000,
        "unit": "METER",
        "is_locked": false,
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-12-25T10:30:00.000000Z",
        "deleted_at": null
    }
}
```

### Create New Finished Goods Warehouse
**POST** `/api/finished-goods-warehouses`

Create a new finished goods warehouse record.

#### Request Body
- **Content-Type:** application/json

```json
{
    "project_id": 1,
    "item_name": "New Product",
    "total_produced": 500,
    "shipped_qty": 0,
    "available_stock": 500,
    "unit": "pcs"
}
```

#### Parameters
- **project_id** (integer, required): ID of the associated project.
- **item_name** (string, required): Name of the finished goods item.
- **total_produced** (integer, required): Total quantity produced.
- **shipped_qty** (integer, required): Quantity shipped.
- **available_stock** (integer, required): Available stock quantity.
- **unit** (string, required): Unit of measurement (e.g., pcs, kg, meter).

#### Response
- **Status Code:** 201 Created
- **Content-Type:** application/json

```json
{
    "id": 2,
    "project_id": 1,
    "item_name": "New Product",
    "total_produced": 500,
    "shipped_qty": 0,
    "available_stock": 500,
    "unit": "pcs",
    "created_at": "2025-12-25T10:30:00.000000Z",
    "updated_at": "2025-12-25T10:30:00.000000Z"
}
```

#### Error Response
- **Status Code:** 422 Unprocessable Entity
- **Content-Type:** application/json

```json
{
    "message": "Available stock cannot exceed total produced quantity"
}
```

### Update Finished Goods Warehouse
**PUT** `/api/finished-goods-warehouses/{id}` or **PATCH** `/api/finished-goods-warehouses/{id}`

Update an existing finished goods warehouse record.

#### Parameters
- **id** (integer, required): The ID of the finished goods warehouse to update.
- **project_id** (integer, required): ID of the associated project.
- **item_name** (string, required): Name of the finished goods item.
- **total_produced** (integer, required): Total quantity produced.
- **shipped_qty** (integer, required): Quantity shipped.
- **available_stock** (integer, required): Available stock quantity.
- **unit** (string, required): Unit of measurement (e.g., pcs, kg, meter).

#### Request Body
```json
{
    "project_id": 1,
    "item_name": "Updated Product",
    "total_produced": 600,
    "shipped_qty": 100,
    "available_stock": 500,
    "unit": "pcs"
}
```

#### Response
- **Status Code:** 200 OK
- **Content-Type:** application/json

```json
{
    "id": 2,
    "project_id": 1,
    "item_name": "Updated Product",
    "total_produced": 600,
    "shipped_qty": 100,
    "available_stock": 500,
    "unit": "pcs",
    "created_at": "2025-12-25T10:30:00.000000Z",
    "updated_at": "2025-12-25T10:35:00.000000Z"
}
```

#### Error Response
- **Status Code:** 422 Unprocessable Entity
- **Content-Type:** application/json

```json
{
    "message": "Available stock cannot exceed total produced quantity"
}
```

### Delete Finished Goods Warehouse
**DELETE** `/api/finished-goods-warehouses/{id}`

Delete a finished goods warehouse record.

#### Parameters
- **id** (integer, required): The ID of the finished goods warehouse to delete.

#### Response
- **Status Code:** 200 OK
- **Content-Type:** application/json

```json
{
    "message": "Finished Goods Warehouse deleted successfully."
}
```

## Validation Rules

### Create/Update Validation
- `project_id`: Required, must exist in projects table
- `item_name`: Required, string, max 255 characters
- `total_produced`: Required, integer, minimum 0
- `shipped_qty`: Required, integer, minimum 0
- `available_stock`: Required, integer, minimum 0
- `unit`: Required, string, max 50 characters

### Business Logic Validation
- `available_stock` must not exceed `total_produced`
- All quantity fields must be non-negative integers

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 401: Unauthorized
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error