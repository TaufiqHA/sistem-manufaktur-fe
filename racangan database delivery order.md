# Database Design for Delivery Order System

## Draft & Validation Tab Database Schema

```dbdiagram
Table delivery_orders {
  id integer [pk, increment]
  order_number varchar [not null, unique]
  customer_id integer [not null]
  order_date date [not null]
  delivery_date date
  status varchar [default: 'draft'] // draft, validated, sent, archived
  notes text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  created_by integer
  validated_by integer
  sent_by integer
}

Table delivery_order_items {
  id integer [pk, increment]
  delivery_order_id integer [not null]
  product_id integer [not null]
  quantity integer [not null, default: 1]
  unit_price decimal
  total_price decimal
  notes text
}

Table customers {
  id integer [pk, increment]
  name varchar [not null]
  address text
  phone varchar
  email varchar
  tax_id varchar
}

Table products {
  id integer [pk, increment]
  name varchar [not null]
  code varchar [unique]
  description text
  unit varchar
  price decimal
}

Table users {
  id integer [pk, increment]
  username varchar [not null, unique]
  email varchar [not null, unique]
  full_name varchar
  role varchar [not null] // admin, staff, manager
}

Ref: delivery_orders.customer_id > customers.id
Ref: delivery_order_items.delivery_order_id > delivery_orders.id
Ref: delivery_order_items.product_id > products.id
Ref: delivery_orders.created_by > users.id
Ref: delivery_orders.validated_by > users.id
Ref: delivery_orders.sent_by > users.id
```

## Sent Archive Tab Database Schema

The same tables will be used, but with different status values to indicate archived/sent orders. The status field in the delivery_orders table will track the lifecycle:

- `draft`: Initial state for new orders
- `validated`: After validation process
- `sent`: When order is sent to customer
- `archived`: When order is moved to archive

## Additional Considerations

- Indexes should be created on frequently queried fields like `order_number`, `status`, `customer_id`, and `order_date`
- Soft deletes could be implemented using a `deleted_at` timestamp field if needed
- Audit trail table could be added to track changes to delivery orders over time