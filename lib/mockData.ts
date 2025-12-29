import { Project, Material, ProjectItem, Machine, Task, User, UnitMaster, ProductionLog, PermissionMap, ProcessStep, Supplier, RFQ, PurchaseOrder, ReceivingGoods } from '../types';

export const MOCK_UNITS: UnitMaster[] = [
  { id: 'u1', name: 'Unit' },
  { id: 'u2', name: 'Set' },
  { id: 'u3', name: 'Pcs' },
  { id: 'u6', name: 'Lembar' },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', code: 'ST-SHEET-2MM', name: 'Steel Sheet 2mm', unit: 'Lembar', currentStock: 450, safetyStock: 100, pricePerUnit: 50, category: 'RAW' },
  { id: 'm3', code: 'PWD-COAT-WHT', name: 'Powder Coat White', unit: 'KG', currentStock: 200, safetyStock: 50, pricePerUnit: 30, category: 'FINISHING' },
  { id: 'm4', code: 'SCREW-M6', name: 'M6 Screw Set', unit: 'Box', currentStock: 500, safetyStock: 200, pricePerUnit: 5, category: 'HARDWARE' },
];

export const MOCK_MACHINES: Machine[] = [
  { id: 'mac1', code: 'CUT-01', name: 'Laser Cutting 01', type: 'POTONG', capacityPerHour: 50, status: 'IDLE', personnel: [{ id: 'p1', name: 'Budi', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p2', name: 'Joko', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac2', code: 'PLG-01', name: 'Punching Machine', type: 'PLONG', capacityPerHour: 80, status: 'IDLE', personnel: [{ id: 'p3', name: 'Agus', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p4', name: 'Dedi', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac3', code: 'PRS-01', name: 'Bending Press 01', type: 'PRESS', capacityPerHour: 30, status: 'IDLE', personnel: [{ id: 'p5', name: 'Rudi', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p6', name: 'Asep', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac4', code: 'LAS-01', name: 'Welding Station Laspen', type: 'LASPEN', capacityPerHour: 10, status: 'IDLE', personnel: [{ id: 'p7', name: 'Siti', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p8', name: 'Rina', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac4b', code: 'MIG-01', name: 'MIG Welding Station', type: 'LAS_MIG', capacityPerHour: 15, status: 'IDLE', personnel: [{ id: 'p7b', name: 'Siti', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p8b', name: 'Rina', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac5', code: 'PHOS-01', name: 'Phosphating Line', type: 'PHOSPHATING', capacityPerHour: 100, status: 'IDLE', personnel: [{ id: 'p9', name: 'Amin', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p10', name: 'Anto', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac6', code: 'PWD-01', name: 'Powder Coating Line', type: 'POWDER', capacityPerHour: 100, status: 'IDLE', personnel: [{ id: 'p11', name: 'Iwan', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p12', name: 'Edi', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac7', code: 'PACK-01', name: 'Packing QC Station', type: 'PACKING', capacityPerHour: 200, status: 'IDLE', personnel: [{ id: 'p13', name: 'Lia', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p14', name: 'Tari', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1', code: 'PRJ-001', name: 'Gondola SuperMart', customer: 'SuperMart', startDate: '2024-01-01', deadline: '2024-02-01', status: 'IN_PROGRESS', progress: 10, qtyPerUnit: 1, procurementQty: 100, totalQty: 100, unit: 'Set', isLocked: true
  },
  {
    id: '2', code: 'PRJ-002', name: 'Shelving Unit Carrefour', customer: 'Carrefour', startDate: '2024-01-15', deadline: '2024-03-15', status: 'PLANNED', progress: 0, qtyPerUnit: 1, procurementQty: 150, totalQty: 150, unit: 'Set', isLocked: false
  },
  {
    id: '3', code: 'PRJ-003', name: 'Metal Racks Indomart', customer: 'Indomart', startDate: '2024-02-01', deadline: '2024-04-01', status: 'PLANNED', progress: 0, qtyPerUnit: 2, procurementQty: 200, totalQty: 200, unit: 'Set', isLocked: false
  },
  {
    id: '4', code: 'PRJ-004', name: 'Custom Display Alfamart', customer: 'Alfamart', startDate: '2024-02-10', deadline: '2024-05-10', status: 'COMPLETED', progress: 100, qtyPerUnit: 1, procurementQty: 75, totalQty: 75, unit: 'Set', isLocked: true
  },
  {
    id: '5', code: 'PRJ-005', name: 'Heavy Duty Storage Rack', customer: 'PT. Logistik Indonesia', startDate: '2024-03-01', deadline: '2024-06-01', status: 'ON_HOLD', progress: 35, qtyPerUnit: 3, procurementQty: 120, totalQty: 120, unit: 'Set', isLocked: true
  }
];

// Fix: Added missing 'realized' property to BomItem objects to satisfy type definition
export const MOCK_ITEMS: ProjectItem[] = [
  {
    id: '1', projectId: '1', name: 'Tiang Gondola 2m', dimensions: '2000x50x50', thickness: '2mm', qtySet: 1, quantity: 100, unit: 'Pcs', isBomLocked: true, isWorkflowLocked: true,
    workflow: [], // Added empty workflow to satisfy type definition
    warehouseQty: 50, // New: Quantity in warehouse
    shippedQty: 20,   // New: Quantity shipped
    bom: [
      { id: '1', itemId: '1', materialId: 'm1', quantityPerUnit: 0.1, totalRequired: 10, allocated: 0, realized: 0 },
      { id: '2', itemId: '1', materialId: 'm3', quantityPerUnit: 0.5, totalRequired: 50, allocated: 0, realized: 0 },
    ]
  },
  {
    id: '2', projectId: '2', name: 'Shelving Frame 3m', dimensions: '3000x80x40', thickness: '3mm', qtySet: 1, quantity: 150, unit: 'Pcs', isBomLocked: false, isWorkflowLocked: false,
    workflow: [],
    warehouseQty: 0,
    shippedQty: 0,
    bom: [
      { id: '3', itemId: '2', materialId: 'm1', quantityPerUnit: 0.15, totalRequired: 22.5, allocated: 0, realized: 0 },
      { id: '4', itemId: '2', materialId: 'm4', quantityPerUnit: 2, totalRequired: 300, allocated: 0, realized: 0 },
    ]
  },
  {
    id: '3', projectId: '3', name: 'Heavy Duty Beam', dimensions: '2500x100x50', thickness: '4mm', qtySet: 2, quantity: 400, unit: 'Pcs', isBomLocked: false, isWorkflowLocked: false,
    workflow: [],
    warehouseQty: 0,
    shippedQty: 0,
    bom: [
      { id: '5', itemId: '3', materialId: 'm1', quantityPerUnit: 0.2, totalRequired: 80, allocated: 0, realized: 0 },
    ]
  },
  {
    id: '4', projectId: '4', name: 'Display Case Frame', dimensions: '1500x60x30', thickness: '2mm', qtySet: 1, quantity: 75, unit: 'Pcs', isBomLocked: true, isWorkflowLocked: true,
    workflow: [],
    warehouseQty: 75,
    shippedQty: 75,
    bom: [
      { id: '6', itemId: '4', materialId: 'm1', quantityPerUnit: 0.08, totalRequired: 6, allocated: 6, realized: 6 },
      { id: '7', itemId: '4', materialId: 'm3', quantityPerUnit: 0.3, totalRequired: 22.5, allocated: 22.5, realized: 22.5 },
    ]
  },
  {
    id: '5', projectId: '5', name: 'Storage Rack Base', dimensions: '2000x150x100', thickness: '5mm', qtySet: 3, quantity: 360, unit: 'Pcs', isBomLocked: true, isWorkflowLocked: true,
    workflow: [],
    warehouseQty: 126,
    shippedQty: 0,
    bom: [
      { id: '8', itemId: '5', materialId: 'm1', quantityPerUnit: 0.25, totalRequired: 90, allocated: 31.5, realized: 31.5 },
      { id: '9', itemId: '5', materialId: 'm4', quantityPerUnit: 4, totalRequired: 1440, allocated: 504, realized: 504 },
    ]
  }
];

export const MOCK_TASKS: Task[] = [];
export const MOCK_LOGS: ProductionLog[] = [];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'PT Bahagia Steel', contact: '021-123456', address: 'Jl. Industri No. 10, Jakarta' },
  { id: 's2', name: 'CV Maju Jaya', contact: '024-987654', address: 'Jl. Pergudangan No. 25, Semarang' },
  { id: 's3', name: 'UD Bersama Sejahtera', contact: '031-555888', address: 'Jl. Industri No. 45, Surabaya' },
];

export const MOCK_RFQS: RFQ[] = [];

export const MOCK_POS: PurchaseOrder[] = [];

export const MOCK_RECEIVINGS: ReceivingGoods[] = [];

const FULL_ACCESS = { view: true, create: true, edit: true, delete: true };
const NO_ACCESS = { view: false, create: false, edit: false, delete: false };
// Added REPORTS and WAREHOUSE to ADMIN_PERMISSIONS to satisfy exhaustive Record mapping in PermissionMap
export const ADMIN_PERMISSIONS: PermissionMap = { PROJECTS: FULL_ACCESS, MATERIALS: FULL_ACCESS, MACHINES: FULL_ACCESS, USERS: FULL_ACCESS, DASHBOARD: FULL_ACCESS, REPORTS: FULL_ACCESS, PROCUREMENT: FULL_ACCESS, WAREHOUSE: FULL_ACCESS };

const OPERATOR_PERMISSIONS: PermissionMap = { PROJECTS: { view: true, create: false, edit: false, delete: false }, MATERIALS: { view: true, create: false, edit: false, delete: false }, MACHINES: { view: true, create: false, edit: false, delete: false }, USERS: NO_ACCESS, DASHBOARD: { view: true, create: false, edit: false, delete: false }, REPORTS: { view: true, create: false, edit: false, delete: false }, PROCUREMENT: NO_ACCESS, WAREHOUSE: NO_ACCESS };

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', username: 'admin', role: 'ADMIN', permissions: ADMIN_PERMISSIONS },
  { id: 'u2', name: 'Budi', username: 'budi', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u3', name: 'Joko', username: 'joko', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u4', name: 'Agus', username: 'agus', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u5', name: 'Dedi', username: 'dedi', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u6', name: 'Rudi', username: 'rudi', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u7', name: 'Asep', username: 'asep', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u8', name: 'Siti', username: 'siti', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u9', name: 'Rina', username: 'rina', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u10', name: 'Amin', username: 'amin', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u11', name: 'Anto', username: 'anto', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u12', name: 'Iwan', username: 'iwan', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u13', name: 'Edi', username: 'edi', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u14', name: 'Lia', username: 'lia', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
  { id: 'u15', name: 'Tari', username: 'tari', role: 'OPERATOR', permissions: OPERATOR_PERMISSIONS },
];
