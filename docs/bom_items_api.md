# BOM Items API Documentation

## Overview
The BOM (Bill of Materials) Items API allows you to manage the components that make up each project item. Each BOM item connects a project item with a specific material and specifies quantities needed.

## Authentication
All endpoints require authentication. Include your API token in the Authorization header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### List BOM Items
**GET** `/api/bom-items`

Retrieve a paginated list of all BOM items.

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "item_id": "1",
      "material_id": "2",
      "quantity_per_unit": 5,
      "total_required": 50,
      "allocated": 30,
      "realized": 20,
      "created_at": "2024-12-18T18:33:14.000000Z",
      "updated_at": "2024-12-18T18:33:14.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost/api/bom-items?page=1",
    "last": "http://localhost/api/bom-items?page=1",
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
        "url": "http://localhost/api/bom-items?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "active": false
      }
    ],
    "path": "http://localhost/api/bom-items",
    "per_page": 10,
    "to": 3,
    "total": 3
  }
}
```

### Get Single BOM Item
**GET** `/api/bom-items/{bom_item}`

Retrieve a specific BOM item by ID.

#### Response
```json
{
  "id": 1,
  "item_id": "1",
  "material_id": "2",
  "quantity_per_unit": 5,
  "total_required": 50,
  "allocated": 30,
  "realized": 20,
  "created_at": "2024-12-18T18:33:14.000000Z",
  "updated_at": "2024-12-18T18:33:14.000000Z"
}
```

### Create BOM Item
**POST** `/api/bom-items`

Create a new BOM item.

#### Request Body
```json
{
  "item_id": 1,
  "material_id": 2,
  "quantity_per_unit": 5,
  "total_required": 50,
  "allocated": 30,
  "realized": 20
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item_id | integer | Yes | ID of the project item |
| material_id | integer | Yes | ID of the material |
| quantity_per_unit | integer | Yes | Quantity of material required per unit |
| total_required | integer | Yes | Total quantity of material required |
| allocated | integer | Yes | Quantity allocated for production |
| realized | integer | Yes | Quantity that has been realized/used |

#### Response
Status: `201 Created`
```json
{
  "id": 3,
  "item_id": 1,
  "material_id": 2,
  "quantity_per_unit": 5,
  "total_required": 50,
  "allocated": 30,
  "realized": 20,
  "created_at": "2024-12-18T18:33:14.000000Z",
  "updated_at": "2024-12-18T18:33:14.000000Z"
}
```

#### Error Response
Status: `422 Unprocessable Entity`
```json
{
  "message": "The item id field is required. (and 1 more error)",
  "errors": {
    "item_id": [
      "The item id field is required."
    ],
    "material_id": [
      "The material id field is required."
    ],
    "quantity_per_unit": [
      "The quantity per unit must be an integer.",
      "The quantity per unit must be at least 1."
    ],
    "total_required": [
      "The total required must be an integer.",
      "The total required must be at least 1."
    ],
    "allocated": [
      "The allocated must be an integer.",
      "The allocated must be at least 0."
    ],
    "realized": [
      "The realized must be an integer.",
      "The realized must be at least 0."
    ]
  }
}
```

### Update BOM Item
**PUT/PATCH** `/api/bom-items/{bom_item}`

Update an existing BOM item.

#### Request Body (partial update allowed)
```json
{
  "quantity_per_unit": 6,
  "total_required": 60,
  "allocated": 40
}
```

#### Response
Status: `200 OK`
```json
{
  "id": 1,
  "item_id": 1,
  "material_id": 2,
  "quantity_per_unit": 6,
  "total_required": 60,
  "allocated": 40,
  "realized": 20,
  "created_at": "2024-12-18T18:33:14.000000Z",
  "updated_at": "2024-12-18T19:45:22.000000Z"
}
```

### Delete BOM Item
**DELETE** `/api/bom-items/{bom_item}`

Delete an existing BOM item.

#### Response
Status: `204 No Content`

### Get BOM Items by Project Item
**GET** `/api/bom-items-by-project-item/{projectItemId}`

Retrieve all BOM items associated with a specific project item ID.

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "item_id": "1",
      "material_id": "2",
      "quantity_per_unit": 5,
      "total_required": 50,
      "allocated": 30,
      "realized": 20,
      "created_at": "2024-12-18T18:33:14.000000Z",
      "updated_at": "2024-12-18T18:33:14.000000Z"
    },
    {
      "id": 2,
      "item_id": "1",
      "material_id": "5",
      "quantity_per_unit": 2,
      "total_required": 20,
      "allocated": 10,
      "realized": 10,
      "created_at": "2024-12-18T18:35:10.000000Z",
      "updated_at": "2024-12-18T18:35:10.000000Z"
    }
  ]
}
```

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the BOM item |
| item_id | integer | Foreign key reference to a project item |
| material_id | integer | Foreign key reference to a material |
| quantity_per_unit | integer | How many units of the material are needed per unit of the project item |
| total_required | integer | Total quantity of the material required |
| allocated | integer | Quantity of the material allocated for production |
| realized | integer | Quantity of the material that has been realized/used |
| created_at | datetime | Timestamp when the record was created |
| updated_at | datetime | Timestamp when the record was last updated |

## Relationships

- **item**: References a ProjectItem (with `item_id`)
- **material**: References a Material (with `material_id`)