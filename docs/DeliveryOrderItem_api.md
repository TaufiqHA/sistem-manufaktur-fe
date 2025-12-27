# Delivery Order Item API Documentation

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All API endpoints require authentication using Sanctum tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer {your-token}
```

## Available Endpoints

### 1. List Delivery Order Items
**GET** `/api/delivery-order-items`

#### Description
Retrieve a paginated list of all delivery order items.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 10)

#### Response
- **200 OK**: Successfully retrieved the list of delivery order items
```json
{
    "data": [
        {
            "id": 1,
            "delivery_order_id": 1,
            "warehouse_id": 1,
            "project_id": 1,
            "project_name": "Sample Project",
            "item_name": "Sample Item",
            "qty": 100,
            "unit": "pcs",
            "created_at": "2025-12-25T14:30:00.000000Z",
            "updated_at": "2025-12-25T14:30:00.000000Z",
            "delivery_order": {
                "id": 1,
                "code": "DO-2025-001",
                "date": "2025-12-25T00:00:00.000000Z",
                "customer": "ABC Company",
                "address": "123 Main St, City",
                "driver_name": "John Doe",
                "vehicle_plate": "B 1234 CD",
                "created_at": "2025-12-25T14:30:00.000000Z",
                "updated_at": "2025-12-25T14:30:00.000000Z"
            },
            "warehouse": {
                "id": 1,
                "project_id": 1,
                "item_name": "Sample Item",
                "total_produced": 500,
                "shipped_qty": 200,
                "available_stock": 300,
                "unit": "pcs",
                "created_at": "2025-12-25T14:30:00.000000Z",
                "updated_at": "2025-12-25T14:30:00.000000Z"
            },
            "project": {
                "id": 1,
                "code": "PROJ-001",
                "name": "Sample Project",
                "customer": "ABC Company",
                "start_date": "2025-01-01",
                "deadline": "2025-06-30",
                "status": "IN_PROGRESS",
                "progress": 50,
                "qty_per_unit": 1,
                "procurement_qty": 100,
                "total_qty": 100,
                "unit": "PCS",
                "is_locked": false,
                "created_at": "2025-12-25T14:30:00.000000Z",
                "updated_at": "2025-12-25T14:30:00.000000Z",
                "deleted_at": null
            }
        }
    ],
    "links": {
        "first": "https://your-api-domain.com/api/delivery-order-items?page=1",
        "last": "https://your-api-domain.com/api/delivery-order-items?page=1",
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
                "url": "https://your-api-domain.com/api/delivery-order-items?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "path": "https://your-api-domain.com/api/delivery-order-items",
        "per_page": 10,
        "to": 1,
        "total": 1
    }
}
```

### 2. Get Single Delivery Order Item
**GET** `/api/delivery-order-items/{id}`

#### Description
Retrieve a specific delivery order item by its ID.

#### Path Parameters
- `id`: The ID of the delivery order item to retrieve

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **200 OK**: Successfully retrieved the delivery order item
- **404 Not Found**: Delivery order item not found

```json
{
    "id": 1,
    "delivery_order_id": 1,
    "warehouse_id": 1,
    "project_id": 1,
    "project_name": "Sample Project",
    "item_name": "Sample Item",
    "qty": 100,
    "unit": "pcs",
    "created_at": "2025-12-25T14:30:00.000000Z",
    "updated_at": "2025-12-25T14:30:00.000000Z",
    "delivery_order": {
        // ... delivery order details
    },
    "warehouse": {
        // ... warehouse details
    },
    "project": {
        // ... project details
    }
}
```

### 3. Create Delivery Order Item
**POST** `/api/delivery-order-items`

#### Description
Create a new delivery order item.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
    "delivery_order_id": 1,
    "warehouse_id": 1,
    "project_id": 1,
    "project_name": "Sample Project",
    "item_name": "Sample Item",
    "qty": 100,
    "unit": "pcs"
}
```

#### Fields
- `delivery_order_id` (required): ID of the delivery order (must exist in delivery_orders table)
- `warehouse_id` (required): ID of the warehouse (must exist in finished_goods_warehouses table)
- `project_id` (required): ID of the project (must exist in projects table)
- `project_name` (required): Name of the project (string, max 255 characters)
- `item_name` (required): Name of the item (string, max 255 characters)
- `qty` (required): Quantity (integer, minimum 1)
- `unit` (required): Unit of measurement (string, max 50 characters)

#### Response
- **201 Created**: Successfully created the delivery order item
- **422 Unprocessable Entity**: Validation errors occurred

```json
{
    "id": 1,
    "delivery_order_id": 1,
    "warehouse_id": 1,
    "project_id": 1,
    "project_name": "Sample Project",
    "item_name": "Sample Item",
    "qty": 100,
    "unit": "pcs",
    "created_at": "2025-12-25T14:30:00.000000Z",
    "updated_at": "2025-12-25T14:30:00.000000Z",
    "delivery_order": {
        // ... delivery order details
    },
    "warehouse": {
        // ... warehouse details
    },
    "project": {
        // ... project details
    }
}
```

### 4. Update Delivery Order Item
**PUT** or **PATCH** `/api/delivery-order-items/{id}`

#### Description
Update an existing delivery order item.

#### Path Parameters
- `id`: The ID of the delivery order item to update

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
    "delivery_order_id": 1,
    "warehouse_id": 1,
    "project_id": 1,
    "project_name": "Updated Project",
    "item_name": "Updated Item",
    "qty": 150,
    "unit": "boxes"
}
```

#### Fields
- `delivery_order_id` (conditionally required): ID of the delivery order; only validated if provided (must exist in delivery_orders table)
- `warehouse_id` (conditionally required): ID of the warehouse; only validated if provided (must exist in finished_goods_warehouses table)
- `project_id` (conditionally required): ID of the project; only validated if provided (must exist in projects table)
- `project_name` (conditionally required): Name of the project; only validated if provided (string, max 255 characters)
- `item_name` (conditionally required): Name of the item; only validated if provided (string, max 255 characters)
- `qty` (conditionally required): Quantity; only validated if provided (integer, minimum 1)
- `unit` (conditionally required): Unit of measurement; only validated if provided (string, max 50 characters)

#### Response
- **200 OK**: Successfully updated the delivery order item
- **404 Not Found**: Delivery order item not found
- **422 Unprocessable Entity**: Validation errors occurred

```json
{
    "id": 1,
    "delivery_order_id": 1,
    "warehouse_id": 1,
    "project_id": 1,
    "project_name": "Updated Project",
    "item_name": "Updated Item",
    "qty": 150,
    "unit": "boxes",
    "created_at": "2025-12-25T14:30:00.000000Z",
    "updated_at": "2025-12-25T15:00:00.000000Z",
    "delivery_order": {
        // ... delivery order details
    },
    "warehouse": {
        // ... warehouse details
    },
    "project": {
        // ... project details
    }
}
```

### 5. Delete Delivery Order Item
**DELETE** `/api/delivery-order-items/{id}`

#### Description
Delete a delivery order item.

#### Path Parameters
- `id`: The ID of the delivery order item to delete

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **204 No Content**: Successfully deleted the delivery order item
- **404 Not Found**: Delivery order item not found

## Error Responses

### 422 Validation Error
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "delivery_order_id": [
            "The delivery order id field is required.",
            "The selected delivery order id is invalid."
        ],
        "warehouse_id": [
            "The warehouse id field is required.",
            "The selected warehouse id is invalid."
        ],
        "project_id": [
            "The project id field is required.",
            "The selected project id is invalid."
        ],
        "project_name": [
            "The project name field is required.",
            "The project name field must not exceed 255 characters."
        ],
        "item_name": [
            "The item name field is required.",
            "The item name field must not exceed 255 characters."
        ],
        "qty": [
            "The qty field is required.",
            "The qty field must be an integer.",
            "The qty field must be at least 1."
        ],
        "unit": [
            "The unit field is required.",
            "The unit field must not exceed 50 characters."
        ]
    }
}
```

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
    "message": "The requested resource was not found."
}
```

## Relationships

The Delivery Order Item model has the following relationships:
- **Belongs to** Delivery Order (via `delivery_order_id`)
- **Belongs to** Finished Goods Warehouse (via `warehouse_id`)
- **Belongs to** Project (via `project_id`)