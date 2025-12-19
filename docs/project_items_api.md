# Project Items API

## Overview
The Project Items API allows you to manage individual items within projects. Each project item represents a specific component or material needed for a project with its dimensions, quantities, and workflow configuration.

## Authentication
All API endpoints require authentication using Sanctum tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer {your-api-token}
```

## Base URL
```
/api/project-items
```

## Endpoints

### List Project Items
**GET** `/api/project-items`

Retrieve a paginated list of all project items.

#### Headers
- `Authorization: Bearer {token}`

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 15)

#### Response
- `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "project_id": "1",
      "name": "Desk Panel",
      "dimensions": "1200x600x18",
      "thickness": "18mm",
      "qty_set": 1,
      "quantity": 10,
      "unit": "pcs",
      "is_bom_locked": false,
      "is_workflow_locked": false,
      "workflow": [],
      "created_at": "2024-12-18T10:00:00.000000Z",
      "updated_at": "2024-12-18T10:00:00.000000Z"
    }
  ],
  "links": {
    "first": "/api/project-items?page=1",
    "last": "/api/project-items?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [...],
    "path": "/api/project-items",
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

### Get Single Project Item
**GET** `/api/project-items/{id}`

Retrieve a specific project item by ID.

#### Path Parameters
- `id`: The ID of the project item

#### Response
- `200 OK`
```json
{
  "id": 1,
  "project_id": "1",
  "name": "Desk Panel",
  "dimensions": "1200x600x18",
  "thickness": "18mm",
  "qty_set": 1,
  "quantity": 10,
  "unit": "pcs",
  "is_bom_locked": false,
  "is_workflow_locked": false,
  "workflow": [
    {
      "step": "cutting",
      "status": "pending"
    },
    {
      "step": "assembly",
      "status": "pending"
    }
  ],
  "created_at": "2024-12-18T10:00:00.000000Z",
  "updated_at": "2024-12-18T10:00:00.000000Z"
}
```

### Create Project Item
**POST** `/api/project-items`

Create a new project item.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "project_id": "1",
  "name": "Desk Panel",
  "dimensions": "1200x600x18",
  "thickness": "18mm",
  "qty_set": 1,
  "quantity": 10,
  "unit": "pcs",
  "is_bom_locked": false,
  "is_workflow_locked": false,
  "workflow": []
}
```

#### Request Body Parameters
- `project_id` (required): The ID of the project this item belongs to (string)
- `name` (required): Name of the project item (string, max: 255)
- `dimensions` (required): Dimensions of the item (string, max: 255)
- `thickness` (required): Thickness of the item (string, max: 255)
- `qty_set` (required): Quantity per set (integer)
- `quantity` (required): Total quantity needed (integer)
- `unit` (required): Unit of measurement (string, max: 50)
- `is_bom_locked` (optional): Whether bill of materials is locked (boolean, default: false)
- `is_workflow_locked` (optional): Whether workflow is locked (boolean, default: false)
- `workflow` (optional): Workflow configuration (array)

#### Response
- `201 Created`
```json
{
  "id": 1,
  "project_id": "1",
  "name": "Desk Panel",
  "dimensions": "1200x600x18",
  "thickness": "18mm",
  "qty_set": 1,
  "quantity": 10,
  "unit": "pcs",
  "is_bom_locked": false,
  "is_workflow_locked": false,
  "workflow": [],
  "created_at": "2024-12-18T10:00:00.000000Z",
  "updated_at": "2024-12-18T10:00:00.000000Z"
}
```

### Update Project Item
**PUT** or **PATCH** `/api/project-items/{id}`

Update an existing project item.

#### Path Parameters
- `id`: The ID of the project item

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Updated Desk Panel",
  "dimensions": "1400x700x18",
  "thickness": "18mm",
  "qty_set": 1,
  "quantity": 15,
  "unit": "pcs",
  "is_bom_locked": true,
  "is_workflow_locked": true,
  "workflow": [
    {
      "step": "cutting",
      "status": "completed"
    }
  ]
}
```

#### Response
- `200 OK`
```json
{
  "id": 1,
  "project_id": "1",
  "name": "Updated Desk Panel",
  "dimensions": "1400x700x18",
  "thickness": "18mm",
  "qty_set": 1,
  "quantity": 15,
  "unit": "pcs",
  "is_bom_locked": true,
  "is_workflow_locked": true,
  "workflow": [
    {
      "step": "cutting",
      "status": "completed"
    }
  ],
  "created_at": "2024-12-18T10:00:00.000000Z",
  "updated_at": "2024-12-18T11:00:00.000000Z"
}
```

### Delete Project Item
**DELETE** `/api/project-items/{id}`

Delete a specific project item.

#### Path Parameters
- `id`: The ID of the project item

#### Headers
- `Authorization: Bearer {token}`

#### Response
- `200 OK`
```json
{
  "message": "Project Item deleted successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
  "message": "Project Item not found."
}
```

### 422 Validation Error
```json
{
  "message": "The project id field must be a string.",
  "errors": {
    "project_id": [
      "The project id field must be a string."
    ]
  }
}
```

## Data Types

- `id`: integer (auto-generated)
- `project_id`: string (foreign key reference to projects table)
- `name`: string (max 255 characters)
- `dimensions`: string (e.g., "1200x600x18")
- `thickness`: string (e.g., "18mm")
- `qty_set`: integer
- `quantity`: integer
- `unit`: string (e.g., "pcs", "sets", "sheets", etc.)
- `is_bom_locked`: boolean (default: false)
- `is_workflow_locked`: boolean (default: false)
- `workflow`: JSON array/object containing workflow steps
- `timestamps`: datetime (ISO 8601 format)