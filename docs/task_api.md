# Task API Documentation

This document describes all the API endpoints related to Task management in the manufacturing system.

## Table of Contents
- [Authentication](#authentication)
- [Get All Tasks](#get-all-tasks)
- [Get Single Task](#get-single-task)
- [Create Task](#create-task)
- [Update Task](#update-task)
- [Delete Task](#delete-task)
- [Update Task Status](#update-task-status)
- [Update Task Quantities](#update-task-quantities)
- [Start Task Downtime](#start-task-downtime)
- [End Task Downtime](#end-task-downtime)
- [Get Task Statistics](#get-task-statistics)

## Authentication

All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {token}
```

## Base URL
`/api/tasks`

---

## Get All Tasks

Retrieve a paginated list of all tasks with optional filtering.

### Endpoint
```
GET /api/tasks
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by task status (PENDING, IN_PROGRESS, PAUSED, COMPLETED, DOWNTIME) |
| project_id | integer | No | Filter by project ID |
| item_id | integer | No | Filter by item ID |
| machine_id | integer | No | Filter by machine ID |
| per_page | integer | No | Number of records per page (default: 15) |

### Response
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "project_id": 1,
        "project_name": "Sample Project A",
        "item_id": 1,
        "item_name": "Main Component",
        "step": "Cutting",
        "machine_id": 1,
        "target_qty": 100,
        "completed_qty": 75,
        "defect_qty": 2,
        "status": "IN_PROGRESS",
        "downtime_start": null,
        "total_downtime_minutes": 0,
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z",
        "project": {
          "id": 1,
          "code": "PROJ-001",
          "name": "Sample Project A",
          // ... project details
        },
        "project_item": {
          "id": 1,
          "name": "Main Component",
          // ... project item details
        },
        "machine": {
          "id": 1,
          "code": "MCH-001",
          "name": "Cutting Machine",
          // ... machine details
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/tasks?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/tasks?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "http://localhost:8000/api/tasks?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "http://localhost:8000/api/tasks",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

## Get Single Task

Retrieve a single task by ID.

### Endpoint
```
GET /api/tasks/{id}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "project_name": "Sample Project A",
    "item_id": 1,
    "item_name": "Main Component",
    "step": "Cutting",
    "machine_id": 1,
    "target_qty": 100,
    "completed_qty": 75,
    "defect_qty": 2,
    "status": "IN_PROGRESS",
    "downtime_start": null,
    "total_downtime_minutes": 0,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "project": {
      // ... project details
    },
    "project_item": {
      // ... project item details
    },
    "machine": {
      // ... machine details
    }
  }
}
```

---

## Create Task

Create a new task.

### Endpoint
```
POST /api/tasks
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | integer | Yes | Project ID |
| project_name | string | Yes | Project name |
| item_id | integer | Yes | Item ID |
| item_name | string | Yes | Item name |
| step | string | Yes | Process step |
| machine_id | integer | Yes | Machine ID |
| target_qty | integer | Yes | Target quantity |
| completed_qty | integer | No | Completed quantity (default: 0) |
| defect_qty | integer | No | Defective quantity (default: 0) |
| status | string | Yes | Task status (PENDING, IN_PROGRESS, PAUSED, COMPLETED, DOWNTIME) |
| downtime_start | datetime | No | Downtime start time |
| total_downtime_minutes | integer | No | Total downtime in minutes (default: 0) |

### Example Request
```json
{
  "project_id": 1,
  "project_name": "Sample Project A",
  "item_id": 1,
  "item_name": "Main Component",
  "step": "Cutting",
  "machine_id": 1,
  "target_qty": 100,
  "status": "PENDING"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    // ... task details
  }
}
```

---

## Update Task

Update an existing task.

### Endpoint
```
PUT /api/tasks/{id}
```

### Request Body
Same fields as create task, but all are optional.

### Example Request
```json
{
  "status": "IN_PROGRESS",
  "target_qty": 120
}
```

### Response
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    // ... updated task details
  }
}
```

---

## Delete Task

Delete a task.

### Endpoint
```
DELETE /api/tasks/{id}
```

### Response
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

## Update Task Status

Update only the status of a task.

### Endpoint
```
PATCH /api/tasks/{id}/status
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New task status (PENDING, IN_PROGRESS, PAUSED, COMPLETED, DOWNTIME) |

### Example Request
```json
{
  "status": "IN_PROGRESS"
}
```

### Response
```json
{
  "success": true,
  "message": "Task status updated successfully.",
  "data": {
    // ... updated task details
  }
}
```

---

## Update Task Quantities

Update completed and defect quantities for a task.

### Endpoint
```
PATCH /api/tasks/{id}/quantities
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| completed_qty | integer | Yes | New completed quantity |
| defect_qty | integer | Yes | New defect quantity |

### Example Request
```json
{
  "completed_qty": 50,
  "defect_qty": 2
}
```

### Response
```json
{
  "success": true,
  "message": "Task quantities updated successfully.",
  "data": {
    // ... updated task details
  }
}
```

> **Note**: If completed quantity reaches or exceeds target quantity, the task status will automatically update to 'COMPLETED'.

---

## Start Task Downtime

Start downtime for a task.

### Endpoint
```
POST /api/tasks/{id}/start-downtime
```

### Response
```json
{
  "success": true,
  "message": "Downtime started for the task.",
  "data": {
    // ... updated task details with status = DOWNTIME and downtime_start set
  }
}
```

---

## End Task Downtime

End downtime for a task and calculate total downtime.

### Endpoint
```
POST /api/tasks/{id}/end-downtime
```

### Response
```json
{
  "success": true,
  "message": "Downtime ended for the task.",
  "data": {
    // ... updated task details with status = IN_PROGRESS and total_downtime_minutes updated
  }
}
```

---

## Get Task Statistics

Retrieve statistics for all tasks.

### Endpoint
```
GET /api/tasks-statistics
```

### Response
```json
{
  "success": true,
  "data": {
    "total": 100,
    "pending": 10,
    "in_progress": 45,
    "paused": 5,
    "downtime": 8,
    "completed": 32
  }
}
```

## Status Values

Tasks can have the following status values:
- `PENDING` - Task is pending
- `IN_PROGRESS` - Task is in progress
- `PAUSED` - Task is paused
- `COMPLETED` - Task is completed
- `DOWNTIME` - Task is experiencing downtime

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": [
      "Error message for this field"
    ]
  }
}
```

### Common Error Responses

#### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Task not found."
}
```

#### 422 Validation Error
```json
{
  "message": "The project id field must be a number.",
  "errors": {
    "project_id": [
      "The project id field must be a number."
    ]
  }
}
```

## Access Control

All endpoints are protected with Sanctum authentication and require valid API tokens.