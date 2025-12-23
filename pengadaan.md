```dbdiagram
Table "suppliers" {
  "id" varchar(50) [pk, not null]
  "name" varchar(255) [not null]
  "contact" varchar(100)
  "address" text
  "createdAt" timestamp [default: `CURRENT_TIMESTAMP`]
  "updatedAt" timestamp [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`]
}

Table "rfqs" {
  "id" varchar(50) [pk, not null]
  "code" varchar(50) [unique, not null]
  "date" timestamp [not null]
  "description" text
  "status" enum('DRAFT', 'PO_CREATED') [default: `'DRAFT'`]
  "createdAt" timestamp [default: `CURRENT_TIMESTAMP`]
  "updatedAt" timestamp [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`]
}

Table "rfq_items" {
  "id" int [pk, increment]
  "rfq_id" varchar(50) [not null]
  "material_id" varchar(50)
  "name" varchar(255) [not null]
  "qty" int [not null]
}

Table "purchase_orders" {
  "id" varchar(50) [pk, not null]
  "code" varchar(50) [unique, not null]
  "rfq_id" varchar(50)
  "supplier_id" varchar(50) [not null]
  "date" timestamp [not null]
  "description" text
  "grand_total" decimal(15,2) [default: `0`]
  "status" enum('OPEN', 'RECEIVED') [default: `'OPEN'`]
  "createdAt" timestamp [default: `CURRENT_TIMESTAMP`]
  "updatedAt" timestamp [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`]
}

Table "po_items" {
  "id" int [pk, increment]
  "po_id" varchar(50) [not null]
  "material_id" varchar(50)
  "name" varchar(255) [not null]
  "qty" int [not null]
  "price" decimal(10,2) [default: `0`]
  "subtotal" decimal(15,2) [default: `0`]
}

Table "receiving_goods" {
  "id" varchar(50) [pk, not null]
  "code" varchar(50) [unique, not null]
  "po_id" varchar(50)
  "supplier_id" varchar(50) [not null]
  "date" timestamp [not null]
  "description" text
  "createdAt" timestamp [default: `CURRENT_TIMESTAMP`]
  "updatedAt" timestamp [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`]
}

Table "receiving_items" {
  "id" int [pk, increment]
  "receiving_id" varchar(50) [not null]
  "material_id" varchar(50)
  "name" varchar(255) [not null]
  "qty" int [not null]
}

Table "materials" {
  "id" varchar(50) [pk, not null]
  "name" varchar(255) [not null]
  "unit" varchar(50) [not null]
  "price" decimal(10,2) [default: `0`]
  "createdAt" timestamp [default: `CURRENT_TIMESTAMP`]
  "updatedAt" timestamp [default: `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`]
}

Ref: "rfq_items"."material_id" < "materials"."id" [delete: set null]
Ref: "rfq_items"."rfq_id" < "rfqs"."id" [delete: cascade]
Ref: "purchase_orders"."supplier_id" < "suppliers"."id" [delete: set null]
Ref: "purchase_orders"."rfq_id" < "rfqs"."id" [delete: set null]
Ref: "po_items"."po_id" < "purchase_orders"."id" [delete: cascade]
Ref: "po_items"."material_id" < "materials"."id" [delete: set null]
Ref: "receiving_goods"."po_id" < "purchase_orders"."id" [delete: set null]
Ref: "receiving_goods"."supplier_id" < "suppliers"."id" [delete: set null]
Ref: "receiving_items"."receiving_id" < "receiving_goods"."id" [delete: cascade]
Ref: "receiving_items"."material_id" < "materials"."id" [delete: set null]

// Indexes
// Indexes for rfqs table
// CREATE INDEX idx_rfqs_status ON rfqs(status);
// CREATE INDEX idx_rfqs_date ON rfqs(date);

// Indexes for purchase_orders table
// CREATE INDEX idx_pos_status ON purchase_orders(status);
// CREATE INDEX idx_pos_date ON purchase_orders(date);
// CREATE INDEX idx_pos_supplier ON purchase_orders(supplier_id);

// Indexes for receiving_goods table
// CREATE INDEX idx_receiving_date ON receiving_goods(date);
// CREATE INDEX idx_receiving_supplier ON receiving_goods(supplier_id);
```