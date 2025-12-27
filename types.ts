export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";
export type Shift = "SHIFT_1" | "SHIFT_2" | "SHIFT_3";

export interface Project {
  id: string;
  code: string;
  name: string;
  customer: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  qtyPerUnit: number;
  procurementQty: number;
  totalQty: number;
  unit: string;
  isLocked: boolean;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  pricePerUnit: number;
  category: "RAW" | "FINISHING" | "HARDWARE";
}

export type ProcessStep =
  | "POTONG"
  | "PLONG"
  | "PRESS"
  | "LASPEN"
  | "LASMIG"
  | "PHOSPHATING"
  | "CAT"
  | "PACKING";
export const ALL_STEPS: ProcessStep[] = [
  "POTONG",
  "PLONG",
  "PRESS",
  "LASPEN",
  "LASMIG",
  "PHOSPHATING",
  "CAT",
  "PACKING",
];

export interface ItemStepConfig {
  step: ProcessStep;
  sequence: number;
  machineIds: string[];
}

export interface BomItem {
  id: string;
  itemId: string;
  materialId: string;
  quantityPerUnit: number;
  totalRequired: number;
  allocated: number;
  realized: number; // New: Actual consumed material
}

export interface ProjectItem {
  id: string;
  projectId: string;
  name: string;
  dimensions: string;
  thickness: string;
  qtySet: number;
  quantity: number;
  unit: string; // New: Added unit per item
  isBomLocked: boolean;
  isWorkflowLocked: boolean;
  bom: BomItem[];
  workflow: ItemStepConfig[];
  warehouseQty?: number; // New: Quantity in warehouse
  shippedQty?: number;   // New: Quantity shipped
}

export type MachineStatus =
  | "IDLE"
  | "RUNNING"
  | "MAINTENANCE"
  | "OFFLINE"
  | "DOWNTIME";

export interface MachinePersonnel {
  id: string;
  name: string;
  role: "PIC" | "OPERATOR";
  shift: Shift;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: ProcessStep;
  capacityPerHour: number;
  status: MachineStatus;
  personnel: MachinePersonnel[];
  isMaintenance: boolean; // New: Maintenance flag
}

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "DOWNTIME";

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  itemId: string;
  itemName: string;
  step: ProcessStep;
  machineId: string;
  targetQty: number;
  completedQty: number;
  defectQty: number;
  status: TaskStatus;
  downtimeStart?: string; // New: tracking downtime duration
  totalDowntimeMinutes: number;
}

export interface ProductionLog {
  id: string;
  taskId: string;
  machineId: string;
  itemId: string;
  projectId: string;
  step: ProcessStep;
  shift: Shift;
  goodQty: number;
  defectQty: number;
  operator: string;
  timestamp: string;
  type: "OUTPUT" | "DOWNTIME_START" | "DOWNTIME_END";
}

export type ModuleName =
  | "PROJECTS"
  | "MATERIALS"
  | "MACHINES"
  | "USERS"
  | "REPORTS"
  | "DASHBOARD"
  | "PROCUREMENT"
  | "WAREHOUSE"
  | "DELIVERY_ORDERS";
export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}
export type PermissionMap = Record<ModuleName, ModulePermission>;

export interface User {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "OPERATOR" | "MANAGER";
  permissions: PermissionMap;
}

export interface UnitMaster {
  id: string;
  name: string;
}

// PROCUREMENT TYPES
export interface SupplierData {
  id?: number | string;
  name: string;
  contact?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SuppliersListResponse {
  data: SupplierData[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
  };
}

export interface SupplierResponse {
  data: SupplierData;
}

export interface SupplierCreateRequest {
  name: string;
  contact?: string;
  address?: string;
}

export interface SupplierUpdateRequest {
  name?: string;
  contact?: string;
  address?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface ProcurementItem {
  materialId: string;
  name: string;
  qty: number;
  price?: number;
  subtotal?: number;
}

export interface RFQ {
  id: string;
  code: string;
  date: string;
  description: string;
  items: ProcurementItem[];
  status: 'DRAFT' | 'PO_CREATED';
}

export interface PurchaseOrder {
  id: string;
  code: string;
  rfqId?: string;
  supplierId: string;
  date: string;
  description: string;
  items: ProcurementItem[];
  grandTotal: number;
  status: 'OPEN' | 'RECEIVED';
}

export interface DeliveryOrderItem {
  projectId: string;
  projectName: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
}

export interface DeliveryOrder {
  id: string;
  code: string;
  date: string;
  customer: string;
  address: string;
  driverName: string;
  vehiclePlate: string;
  items: DeliveryOrderItem[];
  status: 'DRAFT' | 'VALIDATED' | 'SENT' | 'CANCELLED';
  note?: string;
}

export interface ReceivingGoods {
  id: string;
  code: string;
  poId: string;
  supplierId: string;
  date: string;
  description: string;
  items: ProcurementItem[];
}
