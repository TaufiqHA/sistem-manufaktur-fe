# Machine API Documentation

This document describes the API endpoints for managing machines in the manufacturing system.

## Base URL
```
http://your-api-domain/api/
```

## Authentication
All machine-related endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token-here}
```

## Endpoints

### 1. Get All Machines
**GET** `/machines`

#### Description
Retrieve a list of all machines in the system.

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MCH-PRESS-001",
      "name": "Press Machine A",
      "type": "PRESS",
      "capacity_per_hour": 150,
      "status": "RUNNING",
      "personnel": [
        {
          "id": "1",
          "name": "Ahmad Kurnia",
          "position": "Machine Operator"
        }
      ],
      "is_maintenance": false,
      "created_at": "2024-12-18T10:30:00.000000Z",
      "updated_at": "2024-12-18T10:30:00.000000Z"
    }
  ]
}
```

---

### 2. Get Single Machine
**GET** `/machines/{id}`

#### Path Parameters
- `id` (integer, required): The ID of the machine to retrieve

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "MCH-PRESS-001",
    "name": "Press Machine A",
    "type": "PRESS",
    "capacity_per_hour": 150,
    "status": "RUNNING",
    "personnel": [
      {
        "id": "1",
        "name": "Ahmad Kurnia",
        "position": "Machine Operator"
      }
    ],
    "is_maintenance": false,
    "created_at": "2024-12-18T10:30:00.000000Z",
    "updated_at": "2024-12-18T10:30:00.000000Z"
  }
}
```

---

### 3. Create Machine
**POST** `/machines`

#### Description
Create a new machine in the system.

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`
- `Content-Type: application/json`

#### Request Body
```json
{
  "code": "MCH-NEW-001",
  "name": "New Machine",
  "type": "LAS",
  "capacity_per_hour": 100,
  "status": "IDLE",
  "personnel": [
    {
      "id": "1",
      "name": "John Doe",
      "position": "Operator"
    }
  ],
  "is_maintenance": false
}
```

#### Request Body Parameters
- `code` (string, required): Unique identifier for the machine (must be unique)
- `name` (string, required): Name of the machine
- `type` (string, required): Type of machine. Allowed values: "POTONG", "PLONG", "PRESS", "LAS", "WT", "POWDER", "QC"
- `capacity_per_hour` (integer, required): Production capacity per hour (minimum: 0)
- `status` (string, required): Current status. Allowed values: "IDLE", "RUNNING", "MAINTENANCE", "OFFLINE", "DOWNTIME"
- `personnel` (array, required): Array of personnel assigned to the machine
- `is_maintenance` (boolean, optional): Whether the machine is in maintenance mode (defaults to false)

#### Response
```json
{
  "success": true,
  "message": "Machine created successfully",
  "data": {
    "id": 2,
    "code": "MCH-NEW-001",
    "name": "New Machine",
    "type": "LAS",
    "capacity_per_hour": 100,
    "status": "IDLE",
    "personnel": [
      {
        "id": "1",
        "name": "John Doe",
        "position": "Operator"
      }
    ],
    "is_maintenance": false,
    "created_at": "2024-12-18T10:30:00.000000Z",
    "updated_at": "2024-12-18T10:30:00.000000Z"
  }
}
```

---

### 4. Update Machine
**PUT/PATCH** `/machines/{id}`

#### Description
Update an existing machine in the system.

#### Path Parameters
- `id` (integer, required): The ID of the machine to update

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`
- `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Updated Machine Name",
  "status": "RUNNING",
  "capacity_per_hour": 120,
  "personnel": [
    {
      "id": "1",
      "name": "Jane Smith",
      "position": "Senior Operator"
    }
  ]
}
```

#### Request Body Parameters
- `code` (string, optional): Unique identifier for the machine (must be unique)
- `name` (string, optional): Name of the machine
- `type` (string, optional): Type of machine. Allowed values: "POTONG", "PLONG", "PRESS", "LAS", "WT", "POWDER", "QC"
- `capacity_per_hour` (integer, optional): Production capacity per hour (minimum: 0)
- `status` (string, optional): Current status. Allowed values: "IDLE", "RUNNING", "MAINTENANCE", "OFFLINE", "DOWNTIME"
- `personnel` (array, optional): Array of personnel assigned to the machine
- `is_maintenance` (boolean, optional): Whether the machine is in maintenance mode

#### Response
```json
{
  "success": true,
  "message": "Machine updated successfully",
  "data": {
    "id": 1,
    "code": "MCH-PRESS-001",
    "name": "Updated Machine Name",
    "type": "PRESS",
    "capacity_per_hour": 120,
    "status": "RUNNING",
    "personnel": [
      {
        "id": "1",
        "name": "Jane Smith",
        "position": "Senior Operator"
      }
    ],
    "is_maintenance": false,
    "created_at": "2024-12-18T10:30:00.000000Z",
    "updated_at": "2024-12-18T11:45:00.000000Z"
  }
}
```

---

### 5. Delete Machine
**DELETE** `/machines/{id}`

#### Description
Delete an existing machine from the system.

#### Path Parameters
- `id` (integer, required): The ID of the machine to delete

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "message": "Machine deleted successfully"
}
```

---

### 6. Toggle Machine Maintenance Status
**PATCH** `/machines/{id}/toggle-maintenance`

#### Description
Toggle the maintenance status of a machine. When toggled on, the status will change to "MAINTENANCE". When toggled off, the status will change to "IDLE".

#### Path Parameters
- `id` (integer, required): The ID of the machine

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "message": "Maintenance status updated successfully",
  "data": {
    "id": 1,
    "code": "MCH-PRESS-001",
    "name": "Press Machine A",
    "type": "PRESS",
    "capacity_per_hour": 150,
    "status": "MAINTENANCE",
    "personnel": [
      {
        "id": "1",
        "name": "Ahmad Kurnia",
        "position": "Machine Operator"
      }
    ],
    "is_maintenance": true,
    "created_at": "2024-12-18T10:30:00.000000Z",
    "updated_at": "2024-12-18T12:00:00.000000Z"
  }
}
```

---

### 7. Get Machines by Type
**GET** `/machines/type/{type}`

#### Description
Get a list of machines filtered by their type.

#### Path Parameters
- `type` (string, required): The type of machine. Allowed values: "POTONG", "PLONG", "PRESS", "LAS", "WT", "POWDER", "QC"

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MCH-PRESS-001",
      "name": "Press Machine A",
      "type": "PRESS",
      "capacity_per_hour": 150,
      "status": "RUNNING",
      "personnel": [...],
      "is_maintenance": false,
      "created_at": "2024-12-18T10:30:00.000000Z",
      "updated_at": "2024-12-18T10:30:00.000000Z"
    }
  ]
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Invalid machine type"
}
```

---

### 8. Get Machines by Status
**GET** `/machines/status/{status}`

#### Description
Get a list of machines filtered by their status.

#### Path Parameters
- `status` (string, required): The status of machine. Allowed values: "IDLE", "RUNNING", "MAINTENANCE", "OFFLINE", "DOWNTIME"

#### Headers
- `Authorization: Bearer {token}`
- `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "code": "MCH-LAS-001",
      "name": "Laser Cutting Machine",
      "type": "LAS",
      "capacity_per_hour": 80,
      "status": "IDLE",
      "personnel": [...],
      "is_maintenance": false,
      "created_at": "2024-12-18T10:30:00.000000Z",
      "updated_at": "2024-12-18T10:30:00.000000Z"
    }
  ]
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Invalid machine status"
}
```

## Machine Types
The system supports the following machine types:
- `POTONG`: Cutting machines
- `PLONG`: Bending machines
- `PRESS`: Pressing machines
- `LAS`: Laser cutting machines
- `WT`: Welding table machines
- `POWDER`: Powder coating machines
- `QC`: Quality control stations

## Machine Statuses
The system recognizes the following statuses:
- `IDLE`: Machine is not currently operating
- `RUNNING`: Machine is currently in operation
- `MAINTENANCE`: Machine is undergoing maintenance
- `OFFLINE`: Machine is shut down
- `DOWNTIME`: Machine is experiencing downtime issues

## Error Responses
All error responses follow this format:
```json
{
  "message": "Error message description",
  "errors": {
    "field_name": [
      "Validation error message"
    ]
  }
}
```