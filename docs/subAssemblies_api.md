# SubAssemblies API Documentation

## Overview
The SubAssemblies API provides endpoints for managing sub assemblies in the manufacturing system. Sub assemblies are components that make up a larger product and have their own material requirements and production processes.

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Base URL
```
/api/sub-assemblies
```

## Endpoints

### 1. Get All Sub Assemblies
**GET** `/api/sub-assemblies`

#### Description
Retrieve a paginated list of all sub assemblies.

#### Headers
- `Authorization: Bearer {token}`

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 10)

#### Response
- `200 OK`: Successfully retrieved sub assemblies
```json
{
  "data": [
    {
      "id": 1,
      "item_id": "ITEM001",
      "name": "Test Sub Assembly",
      "qty_per_parent": 2,
      "material_id": 1,
      "processes": {
        "process_1": "cutting",
        "process_2": "drilling"
      },
      "total_needed": 100,
      "completed_qty": 0,
      "total_produced": 0,
      "consumed_qty": 0,
      "step_stats": {
        "step_1": {
          "completed": false,
          "progress": 0
        }
      },
      "is_locked": false,
      "created_at": "2025-12-29T03:57:47.000000Z",
      "updated_at": "2025-12-29T03:57:47.000000Z",
      "material": {
        // Material object details
      }
    }
  ],
  "links": {
    "first": "http://localhost/api/sub-assemblies?page=1",
    "last": "http://localhost/api/sub-assemblies?page=1",
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
        "url": "http://localhost/api/sub-assemblies?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "active": false
      }
    ],
    "path": "http://localhost/api/sub-assemblies",
    "per_page": 10,
    "to": 1,
    "total": 1
  }
}
```

### 2. Get Single Sub Assembly
**GET** `/api/sub-assemblies/{id}`

#### Description
Retrieve a specific sub assembly by ID.

#### Path Parameters
- `id`: The ID of the sub assembly to retrieve

#### Headers
- `Authorization: Bearer {token}`

#### Response
- `200 OK`: Successfully retrieved sub assembly
- `404 Not Found`: Sub assembly not found

```json
{
  "id": 1,
  "item_id": "ITEM001",
  "name": "Test Sub Assembly",
  "qty_per_parent": 2,
  "material_id": 1,
  "processes": {
    "process_1": "cutting",
    "process_2": "drilling"
  },
  "total_needed": 100,
  "completed_qty": 0,
  "total_produced": 0,
  "consumed_qty": 0,
  "step_stats": {
    "step_1": {
      "completed": false,
      "progress": 0
    }
  },
  "is_locked": false,
  "created_at": "2025-12-29T03:57:47.000000Z",
  "updated_at": "2025-12-29T03:57:47.000000Z",
  "material": {
    // Material object details
  }
}
```

### 3. Create Sub Assembly
**POST** `/api/sub-assemblies`

#### Description
Create a new sub assembly.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "item_id": "ITEM001",
  "name": "Test Sub Assembly",
  "qty_per_parent": 2,
  "material_id": 1,
  "processes": {
    "process_1": "cutting",
    "process_2": "drilling"
  },
  "total_needed": 100,
  "completed_qty": 0,
  "total_produced": 0,
  "consumed_qty": 0,
  "step_stats": {
    "step_1": {
      "completed": false,
      "progress": 0
    }
  },
  "is_locked": false
}
```

#### Request Body Parameters
- `item_id` (string, required): Unique identifier for the sub assembly item
- `name` (string, required): Name of the sub assembly
- `qty_per_parent` (integer, required): Quantity needed per parent assembly
- `material_id` (integer, required): ID of the associated material
- `processes` (json, required): JSON object containing the manufacturing processes
- `total_needed` (integer, required): Total quantity needed
- `completed_qty` (integer, optional): Quantity completed (default: 0)
- `total_produced` (integer, optional): Total quantity produced (default: 0)
- `consumed_qty` (integer, optional): Quantity consumed (default: 0)
- `step_stats` (json, optional): JSON object containing step-by-step production statistics
- `is_locked` (boolean, optional): Whether the sub assembly is locked (default: false)

#### Response
- `201 Created`: Successfully created sub assembly
- `422 Unprocessable Entity`: Validation error

```json
{
  "id": 1,
  "item_id": "ITEM001",
  "name": "Test Sub Assembly",
  "qty_per_parent": 2,
  "material_id": 1,
  "processes": {
    "process_1": "cutting",
    "process_2": "drilling"
  },
  "total_needed": 100,
  "completed_qty": 0,
  "total_produced": 0,
  "consumed_qty": 0,
  "step_stats": {
    "step_1": {
      "completed": false,
      "progress": 0
    }
  },
  "is_locked": false,
  "created_at": "2025-12-29T03:57:47.000000Z",
  "updated_at": "2025-12-29T03:57:47.000000Z",
  "material": {
    // Material object details
  }
}
```

### 4. Update Sub Assembly
**PUT/PATCH** `/api/sub-assemblies/{id}`

#### Description
Update an existing sub assembly.

#### Path Parameters
- `id`: The ID of the sub assembly to update

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
Same as create endpoint, but all fields are optional.

#### Response
- `200 OK`: Successfully updated sub assembly
- `404 Not Found`: Sub assembly not found
- `422 Unprocessable Entity`: Validation error

```json
{
  "id": 1,
  "item_id": "ITEM001",
  "name": "Updated Sub Assembly Name",
  "qty_per_parent": 5,
  "material_id": 1,
  "processes": {
    "process_1": "cutting",
    "process_2": "drilling"
  },
  "total_needed": 100,
  "completed_qty": 0,
  "total_produced": 0,
  "consumed_qty": 0,
  "step_stats": {
    "step_1": {
      "completed": false,
      "progress": 0
    }
  },
  "is_locked": false,
  "created_at": "2025-12-29T03:57:47.000000Z",
  "updated_at": "2025-12-29T04:00:00.000000Z",
  "material": {
    // Material object details
  }
}
```

### 5. Delete Sub Assembly
**DELETE** `/api/sub-assemblies/{id}`

#### Description
Delete a sub assembly.

#### Path Parameters
- `id`: The ID of the sub assembly to delete

#### Headers
- `Authorization: Bearer {token}`

#### Response
- `204 No Content`: Successfully deleted sub assembly
- `404 Not Found`: Sub assembly not found

## Error Responses

### Validation Error (422)
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": [
      "The name field is required."
    ],
    "qty_per_parent": [
      "The qty_per_parent field must be an integer."
    ]
  }
}
```

### Unauthorized Error (401)
```json
{
  "message": "Unauthenticated."
}
```

### Not Found Error (404)
```json
{
  "message": "The requested resource was not found."
}
```

## Data Model

### SubAssembly Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the sub assembly |
| item_id | string | Unique identifier for the sub assembly item |
| name | string | Name of the sub assembly |
| qty_per_parent | integer | Quantity needed per parent assembly |
| material_id | integer | ID of the associated material |
| processes | json | JSON object containing the manufacturing processes |
| total_needed | integer | Total quantity needed |
| completed_qty | integer | Quantity completed |
| total_produced | integer | Total quantity produced |
| consumed_qty | integer | Quantity consumed |
| step_stats | json | JSON object containing step-by-step production statistics |
| is_locked | boolean | Whether the sub assembly is locked |
| created_at | datetime | Timestamp when the record was created |
| updated_at | datetime | Timestamp when the record was last updated |
| material | object | Associated material object |

## Notes
- All endpoints require authentication
- The `material_id` field must reference an existing material in the system
- The `processes` and `step_stats` fields are stored as JSON objects
- The `is_locked` field prevents further modifications to the sub assembly
- Pagination is used for list endpoints with a default of 10 items per page