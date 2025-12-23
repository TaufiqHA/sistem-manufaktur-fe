# PO Item API Documentation

## Overview
The PO Item API allows you to manage purchase order items in the system. PO Items represent individual items within a purchase order, including details like material, quantity, price, and subtotal.

## Base URL
`/api/po-items`

## Authentication
All API endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-api-token}
```

## Endpoints

### 1. Get All PO Items
**GET** `/api/po-items`

#### Query Parameters
- `per_page` (optional): Number of items per page (default: 10)
- `page` (optional): Page number for pagination
- `search` (optional): Search term to filter by item name, purchase order code, or material name/code
- `po_id` (optional): Filter by purchase order ID
- `material_id` (optional): Filter by material ID
- `min_qty` (optional): Filter by minimum quantity
- `max_qty` (optional): Filter by maximum quantity
- `min_price` (optional): Filter by minimum price
- `max_price` (optional): Filter by maximum price

#### Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "po_id": 1,
        "material_id": 1,
        "name": "Sample Material",
        "qty": 10,
        "price": "100.00",
        "subtotal": "1000.00",
        "created_at": "2025-12-23T16:41:57.000000Z",
        "updated_at": "2025-12-23T16:41:57.000000Z",
        "purchase_order": {
          "id": 1,
          "code": "PO-001",
          "date": "2025-12-23T00:00:00.000000Z",
          "description": "Sample Purchase Order",
          "status": "OPEN"
        },
        "material": {
          "id": 1,
          "code": "MAT-001",
          "name": "Sample Material",
          "unit": "pcs",
          "current_stock": 100,
          "safety_stock": 20,
          "price_per_unit": "50.00",
          "category": "RAW"
        }
      }
    ],
    "links": {
      "first": "/api/po-items?page=1",
      "last": "/api/po-items?page=1",
      "prev": null,
      "next": null
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 1,
      "links": [
        {
          "url": null,
          "label": "&laquo; Previous",
          "active": false
        },
        {
          "url": "/api/po-items?page=1",
          "label": "1",
          "active": true
        }
      ],
      "path": "/api/po-items",
      "per_page": 10,
      "to": 1,
      "total": 1
    }
  }
}
```

### 2. Get Single PO Item
**GET** `/api/po-items/{id}`

#### Path Parameters
- `id`: The ID of the PO item to retrieve

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "po_id": 1,
    "material_id": 1,
    "name": "Sample Material",
    "qty": 10,
    "price": "100.00",
    "subtotal": "1000.00",
    "created_at": "2025-12-23T16:41:57.000000Z",
    "updated_at": "2025-12-23T16:41:57.000000Z",
    "purchase_order": {
      "id": 1,
      "code": "PO-001",
      "date": "2025-12-23T00:00:00.000000Z",
      "description": "Sample Purchase Order",
      "status": "OPEN"
    },
    "material": {
      "id": 1,
      "code": "MAT-001",
      "name": "Sample Material",
      "unit": "pcs",
      "current_stock": 100,
      "safety_stock": 20,
      "price_per_unit": "50.00",
      "category": "RAW"
    }
  }
}
```

### 3. Create PO Item
**POST** `/api/po-items`

#### Request Body
```json
{
  "po_id": 1,
  "material_id": 1,
  "name": "New PO Item",
  "qty": 5,
  "price": 150.00,
  "subtotal": 750.00
}
```

#### Fields
- `po_id` (required): ID of the purchase order
- `material_id` (required): ID of the material
- `name` (required): Name of the PO item
- `qty` (required): Quantity of the item (integer, minimum 1)
- `price` (required): Price per unit (numeric, minimum 0)
- `subtotal` (required): Total price (numeric, minimum 0)

#### Response
```json
{
  "success": true,
  "message": "PO Item created successfully.",
  "data": {
    "id": 2,
    "po_id": 1,
    "material_id": 1,
    "name": "New PO Item",
    "qty": 5,
    "price": "150.00",
    "subtotal": "750.00",
    "created_at": "2025-12-24T10:30:00.000000Z",
    "updated_at": "2025-12-24T10:30:00.000000Z"
  }
}
```

### 4. Update PO Item
**PUT** or **PATCH** `/api/po-items/{id}`

#### Path Parameters
- `id`: The ID of the PO item to update

#### Request Body
```json
{
  "po_id": 1,
  "material_id": 1,
  "name": "Updated PO Item",
  "qty": 10,
  "price": 200.00,
  "subtotal": 2000.00
}
```

#### Response
```json
{
  "success": true,
  "message": "PO Item updated successfully.",
  "data": {
    "id": 2,
    "po_id": 1,
    "material_id": 1,
    "name": "Updated PO Item",
    "qty": 10,
    "price": "200.00",
    "subtotal": "2000.00",
    "created_at": "2025-12-24T10:30:00.000000Z",
    "updated_at": "2025-12-24T11:00:00.000000Z"
  }
}
```

### 5. Delete PO Item
**DELETE** `/api/po-items/{id}`

#### Path Parameters
- `id`: The ID of the PO item to delete

#### Response
```json
{
  "success": true,
  "message": "PO Item deleted successfully."
}
```

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "po_id": [
      "The po id field is required.",
      "The selected po id is invalid."
    ],
    "material_id": [
      "The material id field is required.",
      "The selected material id is invalid."
    ],
    "qty": [
      "The qty field is required.",
      "The qty field must be an integer.",
      "The qty field must be at least 1."
    ]
  }
}
```

### Not Found (404)
```json
{
  "message": "The requested resource was not found."
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

## Relationships
- **purchase_order**: The purchase order this item belongs to
- **material**: The material information for this item

## Search & Filter Capabilities

### Search
Use the `search` query parameter to search across multiple fields:
- PO Item name
- Purchase Order code
- Material name and code

### Filters
- `po_id`: Filter by specific purchase order
- `material_id`: Filter by specific material
- `min_qty`/`max_qty`: Filter by quantity range
- `min_price`/`max_price`: Filter by price range

## Example Usage

### Get PO Items with Filters
```
GET /api/po-items?search=sample&min_qty=5&max_qty=20
```

### Get PO Items for Specific Purchase Order
```
GET /api/po-items?po_id=1
```

### Get PO Items for Specific Material
```
GET /api/po-items?material_id=1
```