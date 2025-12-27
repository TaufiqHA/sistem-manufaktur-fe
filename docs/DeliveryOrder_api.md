# Delivery Order API Documentation

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

### 1. List Delivery Orders
**GET** `/api/delivery-orders`

#### Description
Retrieve a list of all delivery orders.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **200 OK**: Successfully retrieved the list of delivery orders
```json
[
  {
    "id": 1,
    "code": "DO-TEST-12345",
    "date": "2025-12-31T10:00:00.000000Z",
    "customer": "Test Customer",
    "address": "123 Test Street, Test City",
    "driver_name": "John Doe",
    "vehicle_plate": "ABC-1234",
    "status": "DRAFT",
    "note": "Pengiriman prioritas",
    "created_at": "2025-12-25T14:10:59.000000Z",
    "updated_at": "2025-12-25T14:10:59.000000Z"
  }
]
```

### 2. Get Single Delivery Order
**GET** `/api/delivery-orders/{id}`

#### Description
Retrieve a specific delivery order by its ID.

#### Path Parameters
- `id`: The ID of the delivery order to retrieve

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **200 OK**: Successfully retrieved the delivery order
- **404 Not Found**: Delivery order not found

```json
{
  "id": 1,
  "code": "DO-TEST-12345",
  "date": "2025-12-31T10:00:00.000000Z",
  "customer": "Test Customer",
  "address": "123 Test Street, Test City",
  "driver_name": "John Doe",
  "vehicle_plate": "ABC-1234",
  "status": "DRAFT",
  "note": "Pengiriman prioritas",
  "created_at": "2025-12-25T14:10:59.000000Z",
  "updated_at": "2025-12-25T14:10:59.000000Z"
}
```

### 3. Create Delivery Order
**POST** `/api/delivery-orders`

#### Description
Create a new delivery order.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
  "code": "DO-NEW-67890",
  "date": "2025-12-31 15:30:00",
  "customer": "New Customer",
  "address": "456 New Street, New City",
  "driver_name": "Jane Smith",
  "vehicle_plate": "XYZ-9876",
  "status": "DRAFT",
  "note": "Pengiriman normal"
}
```

#### Fields
- `code` (required): Unique code for the delivery order (string, unique in delivery_orders table)
- `date` (required): Date and time of the delivery (date format)
- `customer` (required): Name of the customer (string)
- `address` (required): Delivery address (string)
- `driver_name` (required): Name of the delivery driver (string)
- `vehicle_plate` (required): Vehicle license plate number (string)
- `status` (optional): Status of the delivery order (string, defaults to 'DRAFT', options: 'DRAFT', 'VALIDATED', 'SENT', 'CANCELLED')
- `note` (optional): Notes or remarks for the delivery order (text, max 255 characters)

#### Response
- **201 Created**: Successfully created the delivery order
- **422 Unprocessable Entity**: Validation errors occurred

```json
{
  "id": 2,
  "code": "DO-NEW-67890",
  "date": "2025-12-31T15:30:00.000000Z",
  "customer": "New Customer",
  "address": "456 New Street, New City",
  "driver_name": "Jane Smith",
  "vehicle_plate": "XYZ-9876",
  "status": "DRAFT",
  "note": "Pengiriman normal",
  "created_at": "2025-12-25T14:10:59.000000Z",
  "updated_at": "2025-12-25T14:10:59.000000Z"
}
```

### 4. Update Delivery Order
**PUT** `/api/delivery-orders/{id}`

#### Description
Update an existing delivery order with all fields.

#### Path Parameters
- `id`: The ID of the delivery order to update

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
  "code": "DO-UPDATED-54321",
  "date": "2025-12-31 16:00:00",
  "customer": "Updated Customer",
  "address": "789 Updated Street, Updated City",
  "driver_name": "John Updated",
  "vehicle_plate": "DEF-5555",
  "status": "VALIDATED",
  "note": "Catatan pembaruan pengiriman"
}
```

#### Fields
- `code` (conditionally required): Unique code for the delivery order; only validated if provided (string, must be unique in delivery_orders table, excluding current record)
- `date` (conditionally required): Date and time of the delivery; only validated if provided (date format)
- `customer` (conditionally required): Name of the customer; only validated if provided (string)
- `address` (conditionally required): Delivery address; only validated if provided (string)
- `driver_name` (conditionally required): Name of the delivery driver; only validated if provided (string)
- `vehicle_plate` (conditionally required): Vehicle license plate number; only validated if provided (string)
- `status` (optional): Status of the delivery order (string, options: 'DRAFT', 'VALIDATED', 'SENT', 'CANCELLED')
- `note` (optional): Notes or remarks for the delivery order (text, max 255 characters)

#### Response
- **200 OK**: Successfully updated the delivery order
- **404 Not Found**: Delivery order not found
- **422 Unprocessable Entity**: Validation errors occurred

```json
{
  "id": 1,
  "code": "DO-UPDATED-54321",
  "date": "2025-12-31T16:00:00.000000Z",
  "customer": "Updated Customer",
  "address": "789 Updated Street, Updated City",
  "driver_name": "John Updated",
  "vehicle_plate": "DEF-5555",
  "status": "VALIDATED",
  "note": "Catatan pembaruan pengiriman",
  "created_at": "2025-12-25T14:10:59.000000Z",
  "updated_at": "2025-12-25T14:11:00.000000Z"
}
```

### 5. Partially Update Delivery Order
**PATCH** `/api/delivery-orders/{id}`

#### Description
Partially update an existing delivery order.

#### Path Parameters
- `id`: The ID of the delivery order to update

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body (example - only updating the driver name)
```json
{
  "driver_name": "New Driver Name"
}
```

#### Request Body (example - updating status and note)
```json
{
  "status": "VALIDATED",
  "note": "Siap untuk dikirim"
}
```

#### Fields
- `code` (optional): Unique code for the delivery order; only validated if provided (string, must be unique in delivery_orders table, excluding current record)
- `date` (optional): Date and time of the delivery; only validated if provided (date format)
- `customer` (optional): Name of the customer; only validated if provided (string)
- `address` (optional): Delivery address; only validated if provided (string)
- `driver_name` (optional): Name of the delivery driver; only validated if provided (string)
- `vehicle_plate` (optional): Vehicle license plate number; only validated if provided (string)
- `status` (optional): Status of the delivery order (string, options: 'DRAFT', 'VALIDATED', 'SENT', 'CANCELLED')
- `note` (optional): Notes or remarks for the delivery order (text, max 255 characters)

#### Response
- **200 OK**: Successfully updated the delivery order
- **404 Not Found**: Delivery order not found
- **422 Unprocessable Entity**: Validation errors occurred

```json
{
  "id": 1,
  "code": "DO-EXISTING-12345",
  "date": "2025-12-31T10:00:00.000000Z",
  "customer": "Existing Customer",
  "address": "123 Existing Street, Existing City",
  "driver_name": "New Driver Name",
  "vehicle_plate": "ABC-1234",
  "status": "VALIDATED",
  "note": "Siap untuk dikirim",
  "created_at": "2025-12-25T14:10:59.000000Z",
  "updated_at": "2025-12-25T14:12:00.000000Z"
}
```

### 6. Delete Delivery Order
**DELETE** `/api/delivery-orders/{id}`

#### Description
Delete a specific delivery order.

#### Path Parameters
- `id`: The ID of the delivery order to delete

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **204 No Content**: Successfully deleted the delivery order
- **404 Not Found**: Delivery order not found

## Error Responses

### 422 Validation Error
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "code": [
            "The code field is required.",
            "The code has already been taken."
        ],
        "date": [
            "The date field is required.",
            "The date is not a valid date."
        ],
        "customer": [
            "The customer field is required."
        ],
        "address": [
            "The address field is required."
        ],
        "driver_name": [
            "The driver name field is required."
        ],
        "vehicle_plate": [
            "The vehicle plate field is required."
        ],
        "status": [
            "The status field must be one of: DRAFT, VALIDATED, SENT, CANCELLED."
        ],
        "note": [
            "The note field must not exceed 255 characters."
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
