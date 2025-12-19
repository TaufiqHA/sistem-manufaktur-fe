# Production Logs API

Documentation for the Production Logs API endpoints.

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [List Production Logs](#list-production-logs)
  - [Create Production Log](#create-production-log)
  - [Get Production Log](#get-production-log)
  - [Update Production Log](#update-production-log)
  - [Delete Production Log](#delete-production-log)
  - [Get Production Logs by Project](#get-production-logs-by-project)
  - [Get Production Logs by Machine](#get-production-logs-by-machine)
  - [Get Production Summary](#get-production-summary)

## Authentication

All endpoints except the documentation itself require authentication via Sanctum tokens.
Include the Authorization header in your requests:

```
Authorization: Bearer {your-token-here}
```

## Endpoints

### List Production Logs

Get a paginated list of all production logs with optional filtering.

- **URL**: `/api/production-logs`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | integer | Filter by project ID |
| `machine_id` | integer | Filter by machine ID |
| `from_date` | string (Y-m-d) | Filter logs from this date (requires `to_date`) |
| `to_date` | string (Y-m-d) | Filter logs to this date (requires `from_date`) |
| `date` | string (Y-m-d) | Filter logs for a specific date |
| `shift` | string | Filter by shift (SHIFT_1, SHIFT_2, SHIFT_3) |
| `task_id` | integer | Filter by task ID |
| `type` | string | Filter by log type (OUTPUT, DOWNTIME_START, DOWNTIME_END) |
| `per_page` | integer | Number of records per page (default: 15) |

#### Example Request

```
GET /api/production-logs?project_id=1&shift=SHIFT_1 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "task_id": 5,
        "machine_id": 2,
        "item_id": 3,
        "project_id": 4,
        "step": "Assembly",
        "shift": "SHIFT_1",
        "good_qty": 150,
        "defect_qty": 5,
        "operator": "John Doe",
        "logged_at": "2023-12-01T08:00:00.000000Z",
        "type": "OUTPUT",
        "created_at": "2023-12-01T08:00:00.000000Z",
        "updated_at": "2023-12-01T08:00:00.000000Z",
        "task": {
          "id": 5,
          "project_id": 1,
          "project_name": "Project A",
          "item_id": 2,
          "item_name": "Product X",
          "step": "Assembly",
          "machine_id": 3,
          "target_qty": 200,
          "completed_qty": 150,
          "defect_qty": 5,
          "status": "IN_PROGRESS",
          "downtime_start": null,
          "total_downtime_minutes": 0,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "machine": {
          "id": 2,
          "code": "MCH-001",
          "name": "Assembly Machine 1",
          "type": "ASSEMBLY",
          "capacity_per_hour": 50,
          "status": "OPERATIONAL",
          "personnel": [],
          "is_maintenance": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "item": {
          "id": 3,
          "project_id": 4,
          "name": "Product Y",
          "dimensions": "100x50x20",
          "thickness": "18mm",
          "qty_set": 1,
          "quantity": 100,
          "unit": "pcs",
          "is_bom_locked": false,
          "is_workflow_locked": false,
          "workflow": [],
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "project": {
          "id": 4,
          "code": "PROJ-004",
          "name": "Project Z",
          "customer": "Customer A",
          "start_date": "2023-12-01",
          "deadline": "2023-12-31",
          "status": "IN_PROGRESS",
          "progress": 75,
          "qty_per_unit": 100,
          "procurement_qty": 100,
          "total_qty": 1000,
          "unit": "pcs",
          "is_locked": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z",
          "deleted_at": null
        }
      }
    ],
    "first_page_url": "http://your-domain.com/api/production-logs?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://your-domain.com/api/production-logs?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://your-domain.com/api/production-logs?page=1",
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
    "path": "http://your-domain.com/api/production-logs",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### Create Production Log

Create a new production log entry.

- **URL**: `/api/production-logs`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | integer | Yes | ID of the task |
| `machine_id` | integer | Yes | ID of the machine |
| `item_id` | integer | Yes | ID of the project item |
| `project_id` | integer | Yes | ID of the project |
| `step` | string | Yes | Production step name |
| `shift` | string | Yes | Shift name (SHIFT_1, SHIFT_2, SHIFT_3) |
| `good_qty` | integer | Yes | Quantity of good products |
| `defect_qty` | integer | Yes | Quantity of defective products |
| `operator` | string | Yes | Name of the operator |
| `logged_at` | string (datetime) | Yes | Timestamp of the log entry |
| `type` | string | Yes | Type of log (OUTPUT, DOWNTIME_START, DOWNTIME_END) |

#### Example Request

```
POST /api/production-logs HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
Content-Type: application/json

{
  "task_id": 5,
  "machine_id": 2,
  "item_id": 3,
  "project_id": 4,
  "step": "Assembly",
  "shift": "SHIFT_1",
  "good_qty": 150,
  "defect_qty": 5,
  "operator": "John Doe",
  "logged_at": "2023-12-01T08:00:00",
  "type": "OUTPUT"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Production log created successfully",
  "data": {
    "id": 1,
    "task_id": 5,
    "machine_id": 2,
    "item_id": 3,
    "project_id": 4,
    "step": "Assembly",
    "shift": "SHIFT_1",
    "good_qty": 150,
    "defect_qty": 5,
    "operator": "John Doe",
    "logged_at": "2023-12-01T08:00:00.000000Z",
    "type": "OUTPUT",
    "created_at": "2023-12-01T08:00:00.000000Z",
    "updated_at": "2023-12-01T08:00:00.000000Z",
    "task": {
      "id": 5,
      "project_id": 1,
      "project_name": "Project A",
      "item_id": 2,
      "item_name": "Product X",
      "step": "Assembly",
      "machine_id": 3,
      "target_qty": 200,
      "completed_qty": 150,
      "defect_qty": 5,
      "status": "IN_PROGRESS",
      "downtime_start": null,
      "total_downtime_minutes": 0,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "machine": {
      "id": 2,
      "code": "MCH-001",
      "name": "Assembly Machine 1",
      "type": "ASSEMBLY",
      "capacity_per_hour": 50,
      "status": "OPERATIONAL",
      "personnel": [],
      "is_maintenance": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "item": {
      "id": 3,
      "project_id": 4,
      "name": "Product Y",
      "dimensions": "100x50x20",
      "thickness": "18mm",
      "qty_set": 1,
      "quantity": 100,
      "unit": "pcs",
      "is_bom_locked": false,
      "is_workflow_locked": false,
      "workflow": [],
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "project": {
      "id": 4,
      "code": "PROJ-004",
      "name": "Project Z",
      "customer": "Customer A",
      "start_date": "2023-12-01",
      "deadline": "2023-12-31",
      "status": "IN_PROGRESS",
      "progress": 75,
      "qty_per_unit": 100,
      "procurement_qty": 100,
      "total_qty": 1000,
      "unit": "pcs",
      "is_locked": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z",
      "deleted_at": null
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "task_id": [
      "The task id field is required."
    ],
    "machine_id": [
      "The machine id field must be an integer."
    ]
  }
}
```

---

### Get Production Log

Get details of a specific production log.

- **URL**: `/api/production-logs/{id}`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Example Request

```
GET /api/production-logs/1 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_id": 5,
    "machine_id": 2,
    "item_id": 3,
    "project_id": 4,
    "step": "Assembly",
    "shift": "SHIFT_1",
    "good_qty": 150,
    "defect_qty": 5,
    "operator": "John Doe",
    "logged_at": "2023-12-01T08:00:00.000000Z",
    "type": "OUTPUT",
    "created_at": "2023-12-01T08:00:00.000000Z",
    "updated_at": "2023-12-01T08:00:00.000000Z",
    "task": {
      "id": 5,
      "project_id": 1,
      "project_name": "Project A",
      "item_id": 2,
      "item_name": "Product X",
      "step": "Assembly",
      "machine_id": 3,
      "target_qty": 200,
      "completed_qty": 150,
      "defect_qty": 5,
      "status": "IN_PROGRESS",
      "downtime_start": null,
      "total_downtime_minutes": 0,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "machine": {
      "id": 2,
      "code": "MCH-001",
      "name": "Assembly Machine 1",
      "type": "ASSEMBLY",
      "capacity_per_hour": 50,
      "status": "OPERATIONAL",
      "personnel": [],
      "is_maintenance": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "item": {
      "id": 3,
      "project_id": 4,
      "name": "Product Y",
      "dimensions": "100x50x20",
      "thickness": "18mm",
      "qty_set": 1,
      "quantity": 100,
      "unit": "pcs",
      "is_bom_locked": false,
      "is_workflow_locked": false,
      "workflow": [],
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "project": {
      "id": 4,
      "code": "PROJ-004",
      "name": "Project Z",
      "customer": "Customer A",
      "start_date": "2023-12-01",
      "deadline": "2023-12-31",
      "status": "IN_PROGRESS",
      "progress": 75,
      "qty_per_unit": 100,
      "procurement_qty": 100,
      "total_qty": 1000,
      "unit": "pcs",
      "is_locked": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z",
      "deleted_at": null
    }
  }
}
```

---

### Update Production Log

Update an existing production log.

- **URL**: `/api/production-logs/{id}`
- **Method**: `PUT` or `PATCH`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body (All fields optional)

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | integer | ID of the task |
| `machine_id` | integer | ID of the machine |
| `item_id` | integer | ID of the project item |
| `project_id` | integer | ID of the project |
| `step` | string | Production step name |
| `shift` | string | Shift name (SHIFT_1, SHIFT_2, SHIFT_3) |
| `good_qty` | integer | Quantity of good products |
| `defect_qty` | integer | Quantity of defective products |
| `operator` | string | Name of the operator |
| `logged_at` | string (datetime) | Timestamp of the log entry |
| `type` | string | Type of log (OUTPUT, DOWNTIME_START, DOWNTIME_END) |

#### Example Request

```
PUT /api/production-logs/1 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
Content-Type: application/json

{
  "good_qty": 160,
  "defect_qty": 3,
  "operator": "Jane Smith"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Production log updated successfully",
  "data": {
    "id": 1,
    "task_id": 5,
    "machine_id": 2,
    "item_id": 3,
    "project_id": 4,
    "step": "Assembly",
    "shift": "SHIFT_1",
    "good_qty": 160,
    "defect_qty": 3,
    "operator": "Jane Smith",
    "logged_at": "2023-12-01T08:00:00.000000Z",
    "type": "OUTPUT",
    "created_at": "2023-12-01T08:00:00.000000Z",
    "updated_at": "2023-12-01T09:00:00.000000Z",
    "task": {
      "id": 5,
      "project_id": 1,
      "project_name": "Project A",
      "item_id": 2,
      "item_name": "Product X",
      "step": "Assembly",
      "machine_id": 3,
      "target_qty": 200,
      "completed_qty": 150,
      "defect_qty": 5,
      "status": "IN_PROGRESS",
      "downtime_start": null,
      "total_downtime_minutes": 0,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "machine": {
      "id": 2,
      "code": "MCH-001",
      "name": "Assembly Machine 1",
      "type": "ASSEMBLY",
      "capacity_per_hour": 50,
      "status": "OPERATIONAL",
      "personnel": [],
      "is_maintenance": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "item": {
      "id": 3,
      "project_id": 4,
      "name": "Product Y",
      "dimensions": "100x50x20",
      "thickness": "18mm",
      "qty_set": 1,
      "quantity": 100,
      "unit": "pcs",
      "is_bom_locked": false,
      "is_workflow_locked": false,
      "workflow": [],
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z"
    },
    "project": {
      "id": 4,
      "code": "PROJ-004",
      "name": "Project Z",
      "customer": "Customer A",
      "start_date": "2023-12-01",
      "deadline": "2023-12-31",
      "status": "IN_PROGRESS",
      "progress": 75,
      "qty_per_unit": 100,
      "procurement_qty": 100,
      "total_qty": 1000,
      "unit": "pcs",
      "is_locked": false,
      "created_at": "2023-12-01T08:00:00.000000Z",
      "updated_at": "2023-12-01T08:00:00.000000Z",
      "deleted_at": null
    }
  }
}
```

---

### Delete Production Log

Delete a production log.

- **URL**: `/api/production-logs/{id}`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Example Request

```
DELETE /api/production-logs/1 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "message": "Production log deleted successfully"
}
```

---

### Get Production Logs by Project

Get production logs for a specific project.

- **URL**: `/api/production-logs/project/{projectId}`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by log type (OUTPUT, DOWNTIME_START, DOWNTIME_END) |
| `shift` | string | Filter by shift (SHIFT_1, SHIFT_2, SHIFT_3) |
| `per_page` | integer | Number of records per page (default: 15) |

#### Example Request

```
GET /api/production-logs/project/4 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "task_id": 5,
        "machine_id": 2,
        "item_id": 3,
        "project_id": 4,
        "step": "Assembly",
        "shift": "SHIFT_1",
        "good_qty": 150,
        "defect_qty": 5,
        "operator": "John Doe",
        "logged_at": "2023-12-01T08:00:00.000000Z",
        "type": "OUTPUT",
        "created_at": "2023-12-01T08:00:00.000000Z",
        "updated_at": "2023-12-01T08:00:00.000000Z",
        "task": {
          "id": 5,
          "project_id": 1,
          "project_name": "Project A",
          "item_id": 2,
          "item_name": "Product X",
          "step": "Assembly",
          "machine_id": 3,
          "target_qty": 200,
          "completed_qty": 150,
          "defect_qty": 5,
          "status": "IN_PROGRESS",
          "downtime_start": null,
          "total_downtime_minutes": 0,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "machine": {
          "id": 2,
          "code": "MCH-001",
          "name": "Assembly Machine 1",
          "type": "ASSEMBLY",
          "capacity_per_hour": 50,
          "status": "OPERATIONAL",
          "personnel": [],
          "is_maintenance": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "item": {
          "id": 3,
          "project_id": 4,
          "name": "Product Y",
          "dimensions": "100x50x20",
          "thickness": "18mm",
          "qty_set": 1,
          "quantity": 100,
          "unit": "pcs",
          "is_bom_locked": false,
          "is_workflow_locked": false,
          "workflow": [],
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "project": {
          "id": 4,
          "code": "PROJ-004",
          "name": "Project Z",
          "customer": "Customer A",
          "start_date": "2023-12-01",
          "deadline": "2023-12-31",
          "status": "IN_PROGRESS",
          "progress": 75,
          "qty_per_unit": 100,
          "procurement_qty": 100,
          "total_qty": 1000,
          "unit": "pcs",
          "is_locked": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z",
          "deleted_at": null
        }
      }
    ],
    "first_page_url": "http://your-domain.com/api/production-logs/project/4?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://your-domain.com/api/production-logs/project/4?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://your-domain.com/api/production-logs/project/4?page=1",
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
    "path": "http://your-domain.com/api/production-logs/project/4",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### Get Production Logs by Machine

Get production logs for a specific machine.

- **URL**: `/api/production-logs/machine/{machineId}`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by log type (OUTPUT, DOWNTIME_START, DOWNTIME_END) |
| `shift` | string | Filter by shift (SHIFT_1, SHIFT_2, SHIFT_3) |
| `per_page` | integer | Number of records per page (default: 15) |

#### Example Request

```
GET /api/production-logs/machine/2 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "task_id": 5,
        "machine_id": 2,
        "item_id": 3,
        "project_id": 4,
        "step": "Assembly",
        "shift": "SHIFT_1",
        "good_qty": 150,
        "defect_qty": 5,
        "operator": "John Doe",
        "logged_at": "2023-12-01T08:00:00.000000Z",
        "type": "OUTPUT",
        "created_at": "2023-12-01T08:00:00.000000Z",
        "updated_at": "2023-12-01T08:00:00.000000Z",
        "task": {
          "id": 5,
          "project_id": 1,
          "project_name": "Project A",
          "item_id": 2,
          "item_name": "Product X",
          "step": "Assembly",
          "machine_id": 3,
          "target_qty": 200,
          "completed_qty": 150,
          "defect_qty": 5,
          "status": "IN_PROGRESS",
          "downtime_start": null,
          "total_downtime_minutes": 0,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "machine": {
          "id": 2,
          "code": "MCH-001",
          "name": "Assembly Machine 1",
          "type": "ASSEMBLY",
          "capacity_per_hour": 50,
          "status": "OPERATIONAL",
          "personnel": [],
          "is_maintenance": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "item": {
          "id": 3,
          "project_id": 4,
          "name": "Product Y",
          "dimensions": "100x50x20",
          "thickness": "18mm",
          "qty_set": 1,
          "quantity": 100,
          "unit": "pcs",
          "is_bom_locked": false,
          "is_workflow_locked": false,
          "workflow": [],
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z"
        },
        "project": {
          "id": 4,
          "code": "PROJ-004",
          "name": "Project Z",
          "customer": "Customer A",
          "start_date": "2023-12-01",
          "deadline": "2023-12-31",
          "status": "IN_PROGRESS",
          "progress": 75,
          "qty_per_unit": 100,
          "procurement_qty": 100,
          "total_qty": 1000,
          "unit": "pcs",
          "is_locked": false,
          "created_at": "2023-12-01T08:00:00.000000Z",
          "updated_at": "2023-12-01T08:00:00.000000Z",
          "deleted_at": null
        }
      }
    ],
    "first_page_url": "http://your-domain.com/api/production-logs/machine/2?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://your-domain.com/api/production-logs/machine/2?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://your-domain.com/api/production-logs/machine/2?page=1",
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
    "path": "http://your-domain.com/api/production-logs/machine/2",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### Get Production Summary

Get statistical summary of production data.

- **URL**: `/api/production-summary`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Query Parameters (Optional)

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | integer | Filter summary by project ID |
| `machine_id` | integer | Filter summary by machine ID |
| `from_date` | string (Y-m-d) | Filter from this date (requires `to_date`) |
| `to_date` | string (Y-m-d) | Filter to this date (requires `from_date`) |

#### Example Request

```
GET /api/production-summary?project_id=4 HTTP/1.1
Host: your-domain.com
Authorization: Bearer your-token-here
Accept: application/json
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "total_good_qty": 1500,
    "total_defect_qty": 75,
    "total_logs": 10,
    "avg_good_qty": 150,
    "avg_defect_qty": 7.5
  }
}
```

---

## Log Types

| Type | Description |
|------|-------------|
| `OUTPUT` | Normal production output log |
| `DOWNTIME_START` | Log when machine enters downtime |
| `DOWNTIME_END` | Log when machine exits downtime |

## Shift Values

| Shift | Description |
|-------|-------------|
| `SHIFT_1` | First shift (typically 06:00-14:00) |
| `SHIFT_2` | Second shift (typically 14:00-22:00) |
| `SHIFT_3` | Third shift (typically 22:00-06:00) |