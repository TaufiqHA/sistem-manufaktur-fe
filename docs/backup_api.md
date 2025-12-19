# Backup API Documentation

## Overview

The Backup API allows users to manage database backups for the manufacturing application. All endpoints require authentication via Sanctum tokens.

## Authentication

All endpoints require a valid Sanctum API token in the Authorization header:

```
Authorization: Bearer <token>
Accept: application/json
```

## Base URL

`/api/backups`

---

## Endpoints

### List All Backups

Get a list of all database backups.

**GET** `/api/backups`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`

#### Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "filename": "backup_2025_01_01.sql",
            "path": "backups/2025/01/",
            "disk": "local",
            "size": 1024000,
            "status": "completed",
            "type": "full",
            "details": {
                "tables": ["users", "products"],
                "excluded_tables": [],
                "compression": "gzip",
                "encrypted": true
            },
            "completed_at": "2025-01-01T10:00:00.000000Z",
            "created_by": "admin",
            "created_at": "2025-01-01T10:00:00.000000Z",
            "updated_at": "2025-01-01T10:00:00.000000Z"
        }
    ]
}
```

---

### Create a New Backup

Initiate creation of a new database backup.

**POST** `/api/backups`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`
-   `Content-Type: application/json`

#### Request Body

```json
{
    "type": "full"
}
```

#### Parameters

| Parameter | Type   | Required | Description                                                          |
| --------- | ------ | -------- | -------------------------------------------------------------------- |
| type      | string | No       | Type of backup: `full`, `incremental`, `selective` (default: `full`) |

#### Response

**Status Code:** `201 Created`

```json
{
    "success": true,
    "message": "Backup creation initiated",
    "data": {
        "id": 1,
        "filename": "backup_2025_01_01_100000.sql",
        "path": "backups/2025/01/",
        "disk": "local",
        "size": null,
        "status": "pending",
        "type": "full",
        "details": null,
        "completed_at": null,
        "created_by": "admin",
        "created_at": "2025-01-01T10:00:00.000000Z",
        "updated_at": "2025-01-01T10:00:00.000000Z"
    }
}
```

#### Validation Errors

**Status Code:** `422 Unprocessable Entity`

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "type": [
            "The type field must be one of the values: full, incremental, selective."
        ]
    }
}
```

---

### Get Specific Backup

Retrieve details of a specific backup.

**GET** `/api/backups/{id}`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`

#### Parameters

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | int  | Yes      | Backup ID   |

#### Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "filename": "backup_2025_01_01.sql",
        "path": "backups/2025/01/",
        "disk": "local",
        "size": 1024000,
        "status": "completed",
        "type": "full",
        "details": {
            "tables": ["users", "products"],
            "excluded_tables": [],
            "compression": "gzip",
            "encrypted": true
        },
        "completed_at": "2025-01-01T10:00:00.000000Z",
        "created_by": "admin",
        "created_at": "2025-01-01T10:00:00.000000Z",
        "updated_at": "2025-01-01T10:00:00.000000Z"
    }
}
```

#### Not Found

**Status Code:** `404 Not Found`

```json
{
    "success": false,
    "message": "Backup not found"
}
```

---

### Update Backup

Update a specific backup record (typically used to update status after backup process).

**PUT** `/api/backups/{id}` or **PATCH** `/api/backups/{id}`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`
-   `Content-Type: application/json`

#### Parameters

| Parameter    | Type   | Required | Description                                    |
| ------------ | ------ | -------- | ---------------------------------------------- |
| id           | int    | Yes      | Backup ID                                      |
| status       | string | No       | `pending`, `processing`, `completed`, `failed` |
| size         | int    | No       | Size of backup file in bytes                   |
| completed_at | date   | No       | Completion timestamp                           |

#### Request Body (Example)

```json
{
    "status": "completed",
    "size": 1024000,
    "completed_at": "2025-01-01T10:00:00.000000Z"
}
```

#### Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "message": "Backup updated successfully",
    "data": {
        "id": 1,
        "filename": "backup_2025_01_01.sql",
        "path": "backups/2025/01/",
        "disk": "local",
        "size": 1024000,
        "status": "completed",
        "type": "full",
        "details": {
            "tables": ["users", "products"],
            "excluded_tables": [],
            "compression": "gzip",
            "encrypted": true
        },
        "completed_at": "2025-01-01T10:00:00.000000Z",
        "created_by": "admin",
        "created_at": "2025-01-01T10:00:00.000000Z",
        "updated_at": "2025-01-01T10:00:00.000000Z"
    }
}
```

---

### Delete Backup

Delete a specific backup record and the actual backup file.

**DELETE** `/api/backups/{id}`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`

#### Parameters

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | int  | Yes      | Backup ID   |

#### Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "message": "Backup deleted successfully"
}
```

---

### Download Backup File

Download a specific backup file.

**GET** `/api/backups/{id}/download`

#### Headers

-   `Authorization: Bearer <token>`

#### Parameters

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | int  | Yes      | Backup ID   |

#### Response

Binary file download with the backup file.

---

### Get Backup Statistics

Get statistics about all backups in the system.

**GET** `/api/backups/stats`

#### Headers

-   `Authorization: Bearer <token>`
-   `Accept: application/json`

#### Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "data": {
        "total_backups": 5,
        "total_size_bytes": 5120000,
        "total_size_formatted": "4.88 MB",
        "latest_backup": {
            "id": 5,
            "filename": "backup_2025_01_01.sql",
            "path": "backups/2025/01/",
            "disk": "local",
            "size": 1024000,
            "status": "completed",
            "type": "full",
            "details": {
                "tables": ["users", "products"],
                "excluded_tables": [],
                "compression": "gzip",
                "encrypted": true
            },
            "completed_at": "2025-01-01T10:00:00.000000Z",
            "created_by": "admin",
            "created_at": "2025-01-01T10:00:00.000000Z",
            "updated_at": "2025-01-01T10:00:00.000000Z"
        },
        "status_counts": {
            "completed": 3,
            "processing": 1,
            "failed": 1
        }
    }
}
```

---

## Database Backup Status Values

-   `pending`: Backup creation has been requested but not yet started
-   `processing`: Backup is currently being created
-   `completed`: Backup was successfully created
-   `failed`: Backup creation failed

## Database Backup Type Values

-   `full`: Complete database backup
-   `incremental`: Backup only changes since last backup
-   `selective`: Backup only specific tables

## Error Responses

All error responses follow this structure:

```json
{
    "success": false,
    "message": "Error message description",
    "data": {} // Optional
}
```

## Notes

-   All backup files are stored according to the path and filename in the database
-   The system supports different storage disks (local, S3, FTP, etc.)
-   Authentication is required for all backup operations
-   When a backup is deleted, the physical file is also removed from storage
