# Receiving Items API Documentation

Dokumentasi API untuk manajemen item-item penerimaan barang (receiving items).

## Daftar Isi

1. [List Receiving Items](#list-receiving-items)
2. [Create Receiving Item](#create-receiving-item)
3. [Get Single Receiving Item](#get-single-receiving-item)
4. [Update Receiving Item](#update-receiving-item)
5. [Delete Receiving Item](#delete-receiving-item)
6. [Get Receiving Items by Receiving](#get-receiving-items-by-receiving)

## List Receiving Items

Endpoint untuk mendapatkan daftar item-item penerimaan barang dengan pagination.

### Request
```http
GET /api/receiving-items
```

### Query Parameters
- `per_page` (optional): Jumlah item per halaman (default: 10)

### Response
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "receiving_id": 1,
        "material_id": 1,
        "name": "Nama Item",
        "qty": 10,
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z",
        "receiving": {
          // Informasi penerimaan barang
        },
        "material": {
          // Informasi material
        }
      }
    ],
    "first_page_url": "http://localhost/api/receiving-items?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost/api/receiving-items?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "http://localhost/api/receiving-items",
    "per_page": 10,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

## Create Receiving Item

Endpoint untuk membuat item penerimaan barang baru.

### Request
```http
POST /api/receiving-items
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Body Parameters
- `receiving_id` (optional): ID dari penerimaan barang (harus exist di tabel receiving_goods)
- `material_id` (optional): ID dari material (harus exist di tabel materials)
- `name` (required): Nama item penerimaan barang (string, max 255 karakter)
- `qty` (required): Jumlah item (integer, min 1)

### Response Success
```json
{
  "success": true,
  "message": "Receiving Item created successfully.",
  "data": {
    "id": 1,
    "receiving_id": 1,
    "material_id": 1,
    "name": "Nama Item",
    "qty": 10,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "receiving": {
      // Informasi penerimaan barang
    },
    "material": {
      // Informasi material
    }
  }
}
```

### Response Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "name": [
      "The name field is required."
    ],
    "qty": [
      "The qty field is required.",
      "The qty must be an integer."
    ]
  }
}
```

## Get Single Receiving Item

Endpoint untuk mendapatkan informasi satu item penerimaan barang berdasarkan ID.

### Request
```http
GET /api/receiving-items/{id}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "receiving_id": 1,
    "material_id": 1,
    "name": "Nama Item",
    "qty": 10,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "receiving": {
      // Informasi penerimaan barang
    },
    "material": {
      // Informasi material
    }
  }
}
```

## Update Receiving Item

Endpoint untuk memperbarui informasi item penerimaan barang berdasarkan ID.

### Request
```http
PUT /api/receiving-items/{id}
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Body Parameters
- `receiving_id` (optional): ID dari penerimaan barang (harus exist di tabel receiving_goods)
- `material_id` (optional): ID dari material (harus exist di tabel materials)
- `name` (required): Nama item penerimaan barang (string, max 255 karakter)
- `qty` (required): Jumlah item (integer, min 1)

### Response Success
```json
{
  "success": true,
  "message": "Receiving Item updated successfully.",
  "data": {
    "id": 1,
    "receiving_id": 1,
    "material_id": 1,
    "name": "Nama Item Terbaru",
    "qty": 20,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "receiving": {
      // Informasi penerimaan barang
    },
    "material": {
      // Informasi material
    }
  }
}
```

### Response Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "name": [
      "The name field is required."
    ],
    "qty": [
      "The qty field is required.",
      "The qty must be an integer."
    ]
  }
}
```

## Delete Receiving Item

Endpoint untuk menghapus item penerimaan barang berdasarkan ID.

### Request
```http
DELETE /api/receiving-items/{id}
```

### Headers
```
Authorization: Bearer {token}
```

### Response
```json
{
  "success": true,
  "message": "Receiving Item deleted successfully."
}
```

## Get Receiving Items by Receiving

Endpoint untuk mendapatkan daftar item penerimaan barang berdasarkan ID penerimaan barang.

### Request
```http
GET /api/receiving-goods/{receiving_id}/items
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "receiving_id": 1,
      "material_id": 1,
      "name": "Nama Item",
      "qty": 10,
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "material": {
        // Informasi material
      }
    }
  ]
}
```