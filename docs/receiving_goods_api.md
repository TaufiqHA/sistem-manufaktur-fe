# Receiving Goods API Documentation

## Overview
The Receiving Goods API allows you to manage receiving goods records in the system. This includes creating, reading, updating, and deleting receiving goods entries that are associated with purchase orders and suppliers.

## Base URL
```
/api/receiving-goods
```

## Authentication
All API endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-api-token}
```

## Endpoints

### List Receiving Goods
Retrieve a paginated list of receiving goods.

**GET** `/api/receiving-goods`

#### Query Parameters
- `per_page` (optional): Number of items per page (default: 10)

#### Response
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "code": "RG-001",
                "po_id": 1,
                "supplier_id": 1,
                "date": "2023-12-24T00:00:00.000000Z",
                "description": "Test receiving goods",
                "created_at": "2023-12-24T00:00:00.000000Z",
                "updated_at": "2023-12-24T00:00:00.000000Z",
                "purchase_order": {
                    "id": 1,
                    "code": "PO-001",
                    "rfq_id": 1,
                    "supplier_id": 1,
                    "date": "2023-12-24T00:00:00.000000Z",
                    "description": "Test purchase order",
                    "grand_total": "1000.00",
                    "status": "OPEN",
                    "created_at": "2023-12-24T00:00:00.000000Z",
                    "updated_at": "2023-12-24T00:00:00.000000Z"
                },
                "supplier": {
                    "id": 1,
                    "name": "Test Supplier",
                    "contact": "123-456-7890",
                    "address": "123 Test Street",
                    "created_at": "2023-12-24T00:00:00.000000Z",
                    "updated_at": "2023-12-24T00:00:00.000000Z"
                }
            }
        ],
        "first_page_url": "http://localhost/api/receiving-goods?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost/api/receiving-goods?page=1",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "http://localhost/api/receiving-goods?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "next_page_url": null,
        "path": "http://localhost/api/receiving-goods",
        "per_page": 10,
        "prev_page_url": null,
        "to": 1,
        "total": 1
    }
}
```

### Create Receiving Good
Create a new receiving good entry.

**POST** `/api/receiving-goods`

#### Request Body
```json
{
    "code": "RG-001",
    "po_id": 1,
    "supplier_id": 1,
    "date": "2023-12-24T10:00:00Z",
    "description": "Test receiving goods"
}
```

#### Validation Rules
- `code`: required, string, max:50, unique:receiving_goods
- `po_id`: optional, must exist in purchase_orders table
- `supplier_id`: optional, must exist in suppliers table
- `date`: required, must be a valid date
- `description`: optional, string

#### Response
```json
{
    "success": true,
    "message": "Receiving Good created successfully.",
    "data": {
        "id": 1,
        "code": "RG-001",
        "po_id": 1,
        "supplier_id": 1,
        "date": "2023-12-24T00:00:00.000000Z",
        "description": "Test receiving goods",
        "created_at": "2023-12-24T00:00:00.000000Z",
        "updated_at": "2023-12-24T00:00:00.000000Z",
        "purchase_order": {
            "id": 1,
            "code": "PO-001",
            "rfq_id": 1,
            "supplier_id": 1,
            "date": "2023-12-24T00:00:00.000000Z",
            "description": "Test purchase order",
            "grand_total": "1000.00",
            "status": "OPEN",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        },
        "supplier": {
            "id": 1,
            "name": "Test Supplier",
            "contact": "123-456-7890",
            "address": "123 Test Street",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        }
    }
}
```

### Get Single Receiving Good
Retrieve a specific receiving good by ID.

**GET** `/api/receiving-goods/{id}`

#### Response
```json
{
    "success": true,
    "data": {
        "id": 1,
        "code": "RG-001",
        "po_id": 1,
        "supplier_id": 1,
        "date": "2023-12-24T00:00:00.000000Z",
        "description": "Test receiving goods",
        "created_at": "2023-12-24T00:00:00.000000Z",
        "updated_at": "2023-12-24T00:00:00.000000Z",
        "purchase_order": {
            "id": 1,
            "code": "PO-001",
            "rfq_id": 1,
            "supplier_id": 1,
            "date": "2023-12-24T00:00:00.000000Z",
            "description": "Test purchase order",
            "grand_total": "1000.00",
            "status": "OPEN",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        },
        "supplier": {
            "id": 1,
            "name": "Test Supplier",
            "contact": "123-456-7890",
            "address": "123 Test Street",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        }
    }
}
```

### Update Receiving Good
Update an existing receiving good entry.

**PUT** `/api/receiving-goods/{id}` or **PATCH** `/api/receiving-goods/{id}`

#### Request Body
```json
{
    "code": "RG-002",
    "po_id": 1,
    "supplier_id": 1,
    "date": "2023-12-24T15:00:00Z",
    "description": "Updated receiving goods"
}
```

#### Response
```json
{
    "success": true,
    "message": "Receiving Good updated successfully.",
    "data": {
        "id": 1,
        "code": "RG-002",
        "po_id": 1,
        "supplier_id": 1,
        "date": "2023-12-24T00:00:00.000000Z",
        "description": "Updated receiving goods",
        "created_at": "2023-12-24T00:00:00.000000Z",
        "updated_at": "2023-12-24T15:00:00.000000Z",
        "purchase_order": {
            "id": 1,
            "code": "PO-001",
            "rfq_id": 1,
            "supplier_id": 1,
            "date": "2023-12-24T00:00:00.000000Z",
            "description": "Test purchase order",
            "grand_total": "1000.00",
            "status": "OPEN",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        },
        "supplier": {
            "id": 1,
            "name": "Test Supplier",
            "contact": "123-456-7890",
            "address": "123 Test Street",
            "created_at": "2023-12-24T00:00:00.000000Z",
            "updated_at": "2023-12-24T00:00:00.000000Z"
        }
    }
}
```

### Delete Receiving Good
Delete a receiving good entry.

**DELETE** `/api/receiving-goods/{id}`

#### Response
```json
{
    "success": true,
    "message": "Receiving Good deleted successfully."
}
```

## Error Responses

### Validation Error
When request data fails validation:
```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "code": [
            "The code field is required."
        ],
        "date": [
            "The date field is required."
        ]
    }
}
```

### Not Found Error
When the requested resource does not exist (404):
```json
{
    "message": "The requested resource was not found."
}
```

## Relationships
- **Purchase Order**: Each receiving good can be associated with a purchase order
- **Supplier**: Each receiving good can be associated with a supplier