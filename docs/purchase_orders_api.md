# Purchase Orders API Documentation

## Base URL
`/api/purchase-orders`

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the `Authorization` header as a Bearer token.

## Endpoints

### List Purchase Orders
**GET** `/api/purchase-orders`

#### Description
Retrieve a paginated list of purchase orders with optional filtering by per_page parameter.

#### Headers
- `Authorization: Bearer {token}`

#### Query Parameters
- `per_page` (optional): Number of records per page (default: 10)

#### Response
- `200 OK`

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "code": "PO-12345",
        "rfq_id": 1,
        "supplier_id": 1,
        "date": "2023-12-24T00:00:00.000000Z",
        "description": "Sample purchase order",
        "grand_total": "1500.00",
        "status": "OPEN",
        "created_at": "2023-12-24T10:00:00.000000Z",
        "updated_at": "2023-12-24T10:00:00.000000Z",
        "rfq": {
          "id": 1,
          "code": "RFQ-001",
          "title": "Sample RFQ",
          "status": "OPEN",
          "created_at": "2023-12-24T09:00:00.000000Z",
          "updated_at": "2023-12-24T09:00:00.000000Z"
        },
        "supplier": {
          "id": 1,
          "name": "Supplier Name",
          "contact": "contact@supplier.com",
          "phone": "+1234567890",
          "address": "Supplier Address",
          "created_at": "2023-12-24T08:00:00.000000Z",
          "updated_at": "2023-12-24T08:00:00.000000Z"
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/purchase-orders?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/purchase-orders?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://localhost:8000/api/purchase-orders?page=1",
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
    "path": "http://localhost:8000/api/purchase-orders",
    "per_page": 10,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### Create Purchase Order
**POST** `/api/purchase-orders`

#### Description
Create a new purchase order with the provided data.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "code": "PO-NEW-001",
  "rfq_id": 1,
  "supplier_id": 1,
  "date": "2023-12-24T00:00:00.000000Z",
  "description": "New purchase order description",
  "grand_total": 2500.00,
  "status": "OPEN"
}
```

#### Fields
- `code` (string, required): Unique purchase order code (max 50 chars)
- `rfq_id` (integer, optional): ID of the related RFQ
- `supplier_id` (integer, optional): ID of the supplier
- `date` (string, required): Date of the purchase order (ISO 8601 format)
- `description` (string, optional): Description of the purchase order
- `grand_total` (number, required): Total amount (positive number)
- `status` (string, required): Status of the purchase order ("OPEN" or "RECEIVED")

#### Response
- `201 Created`

```json
{
  "success": true,
  "message": "Purchase Order created successfully.",
  "data": {
    "id": 2,
    "code": "PO-NEW-001",
    "rfq_id": 1,
    "supplier_id": 1,
    "date": "2023-12-24T00:00:00.000000Z",
    "description": "New purchase order description",
    "grand_total": "2500.00",
    "status": "OPEN",
    "created_at": "2023-12-24T10:30:00.000000Z",
    "updated_at": "2023-12-24T10:30:00.000000Z"
  }
}
```

#### Validation Errors
- `422 Unprocessable Entity`

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "code": [
      "The code field is required."
    ],
    "grand_total": [
      "The grand total must be a number."
    ]
  }
}
```

---

### Get Purchase Order
**GET** `/api/purchase-orders/{id}`

#### Description
Retrieve a specific purchase order by its ID.

#### Headers
- `Authorization: Bearer {token}`

#### Path Parameters
- `id` (integer): ID of the purchase order

#### Response
- `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "PO-12345",
    "rfq_id": 1,
    "supplier_id": 1,
    "date": "2023-12-24T00:00:00.000000Z",
    "description": "Sample purchase order",
    "grand_total": "1500.00",
    "status": "OPEN",
    "created_at": "2023-12-24T10:00:00.000000Z",
    "updated_at": "2023-12-24T10:00:00.000000Z",
    "rfq": {
      "id": 1,
      "code": "RFQ-001",
      "title": "Sample RFQ",
      "status": "OPEN",
      "created_at": "2023-12-24T09:00:00.000000Z",
      "updated_at": "2023-12-24T09:00:00.000000Z"
    },
    "supplier": {
      "id": 1,
      "name": "Supplier Name",
      "contact": "contact@supplier.com",
      "phone": "+1234567890",
      "address": "Supplier Address",
      "created_at": "2023-12-24T08:00:00.000000Z",
      "updated_at": "2023-12-24T08:00:00.000000Z"
    }
  }
}
```

---

### Update Purchase Order
**PUT** `/api/purchase-orders/{id}` or **PATCH** `/api/purchase-orders/{id}`

#### Description
Update an existing purchase order with the provided data.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Path Parameters
- `id` (integer): ID of the purchase order

#### Request Body
```json
{
  "code": "PO-UPDATED-001",
  "rfq_id": 2,
  "supplier_id": 2,
  "date": "2023-12-25T00:00:00.000000Z",
  "description": "Updated purchase order description",
  "grand_total": 3000.00,
  "status": "RECEIVED"
}
```

#### Response
- `200 OK`

```json
{
  "success": true,
  "message": "Purchase Order updated successfully.",
  "data": {
    "id": 1,
    "code": "PO-UPDATED-001",
    "rfq_id": 2,
    "supplier_id": 2,
    "date": "2023-12-25T00:00:00.000000Z",
    "description": "Updated purchase order description",
    "grand_total": "3000.00",
    "status": "RECEIVED",
    "created_at": "2023-12-24T10:00:00.000000Z",
    "updated_at": "2023-12-24T11:00:00.000000Z"
  }
}
```

#### Validation Errors
- `422 Unprocessable Entity`

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "code": [
      "The code has already been taken."
    ],
    "status": [
      "The selected status is invalid."
    ]
  }
}
```

---

### Delete Purchase Order
**DELETE** `/api/purchase-orders/{id}`

#### Description
Delete a specific purchase order by its ID.

#### Headers
- `Authorization: Bearer {token}`

#### Path Parameters
- `id` (integer): ID of the purchase order

#### Response
- `200 OK`

```json
{
  "success": true,
  "message": "Purchase Order deleted successfully."
}
```

---

## Data Models

### Purchase Order
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the purchase order |
| code | string | Unique code for the purchase order |
| rfq_id | integer | ID of the related RFQ (nullable) |
| supplier_id | integer | ID of the supplier (nullable) |
| date | datetime | Date of the purchase order |
| description | text | Description of the purchase order (nullable) |
| grand_total | decimal | Total amount of the purchase order |
| status | enum | Status of the purchase order (OPEN or RECEIVED) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

## Status Values
- `OPEN`: Purchase order is open
- `RECEIVED`: Purchase order has been received