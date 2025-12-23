# Supplier API Documentation

## Base URL
`/api/suppliers`

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### 1. Get All Suppliers
**GET** `/api/suppliers`

Retrieve a list of all suppliers with optional search and filter capabilities.

#### Query Parameters
- `search` (optional): Search across name, contact, and address fields
- `name` (optional): Filter by supplier name
- `contact` (optional): Filter by contact information

#### Response
- **200 OK**: Successfully retrieved suppliers
```json
[
  {
    "id": 1,
    "name": "ABC Supplier",
    "contact": "081234567890",
    "address": "Jl. Test No. 123, Jakarta",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

#### Example Requests
```bash
# Get all suppliers
curl -X GET "http://localhost:8000/api/suppliers" \
  -H "Authorization: Bearer {your_token}"

# Search suppliers
curl -X GET "http://localhost:8000/api/suppliers?search=ABC" \
  -H "Authorization: Bearer {your_token}"

# Filter by name
curl -X GET "http://localhost:8000/api/suppliers?name=ABC" \
  -H "Authorization: Bearer {your_token}"

# Filter by contact
curl -X GET "http://localhost:8000/api/suppliers?contact=081234567890" \
  -H "Authorization: Bearer {your_token}"
```

### 2. Create Supplier
**POST** `/api/suppliers`

Create a new supplier.

#### Request Body
```json
{
  "name": "string (required, max 255 characters)",
  "contact": "string (optional, max 100 characters)",
  "address": "string (optional)"
}
```

#### Response
- **201 Created**: Supplier created successfully
```json
{
  "id": 1,
  "name": "New Supplier",
  "contact": "081234567890",
  "address": "Jl. New Supplier No. 456, Jakarta",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```
- **422 Unprocessable Entity**: Validation errors
```json
{
  "errors": {
    "name": [
      "The name field is required."
    ]
  }
}
```

#### Example Request
```bash
curl -X POST "http://localhost:8000/api/suppliers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "New Supplier",
    "contact": "081234567890",
    "address": "Jl. New Supplier No. 456, Jakarta"
  }'
```

### 3. Get Single Supplier
**GET** `/api/suppliers/{id}`

Retrieve a specific supplier by ID.

#### Response
- **200 OK**: Successfully retrieved supplier
```json
{
  "id": 1,
  "name": "ABC Supplier",
  "contact": "081234567890",
  "address": "Jl. Test No. 123, Jakarta",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```
- **404 Not Found**: Supplier does not exist

#### Example Request
```bash
curl -X GET "http://localhost:8000/api/suppliers/1" \
  -H "Authorization: Bearer {your_token}"
```

### 4. Update Supplier
**PUT** or **PATCH** `/api/suppliers/{id}`

Update an existing supplier.

#### Request Body
```json
{
  "name": "string (required, max 255 characters)",
  "contact": "string (optional, max 100 characters)",
  "address": "string (optional)"
}
```

#### Response
- **200 OK**: Supplier updated successfully
```json
{
  "id": 1,
  "name": "Updated Supplier",
  "contact": "081234567890",
  "address": "Jl. Updated Supplier No. 789, Bandung",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-02T00:00:00.000000Z"
}
```
- **422 Unprocessable Entity**: Validation errors
```json
{
  "errors": {
    "name": [
      "The name field is required."
    ]
  }
}
```
- **404 Not Found**: Supplier does not exist

#### Example Request
```bash
curl -X PUT "http://localhost:8000/api/suppliers/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "name": "Updated Supplier",
    "contact": "081234567890",
    "address": "Jl. Updated Supplier No. 789, Bandung"
  }'
```

### 5. Delete Supplier
**DELETE** `/api/suppliers/{id}`

Delete an existing supplier.

#### Response
- **204 No Content**: Supplier deleted successfully
- **404 Not Found**: Supplier does not exist

#### Example Request
```bash
curl -X DELETE "http://localhost:8000/api/suppliers/1" \
  -H "Authorization: Bearer {your_token}"
```

## Error Responses

### 401 Unauthorized
Returned when authentication is required but not provided or invalid.

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
Returned when the requested resource does not exist.

```json
{
  "message": "The requested resource was not found."
}
```

### 422 Unprocessable Entity
Returned when validation fails.

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "The error message for the field."
    ]
  }
}
```

## Model Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | No | Unique identifier for the supplier |
| name | string | Yes | Name of the supplier (max 255 characters) |
| contact | string | No | Contact information (max 100 characters) |
| address | text | No | Address of the supplier |
| created_at | datetime | No | Timestamp when the supplier was created |
| updated_at | datetime | No | Timestamp when the supplier was last updated |