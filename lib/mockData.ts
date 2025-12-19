
import { Project, Material, ProjectItem, Machine, Task, User, UnitMaster, ProductionLog, PermissionMap, ProcessStep } from '../types';

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

// Fix: Added missing 'isMaintenance' property to satisfy Machine interface
export const MOCK_MACHINES: Machine[] = [
  { id: 'mac1', code: 'CUT-01', name: 'Laser Cutting 01', type: 'POTONG', capacityPerHour: 50, status: 'IDLE', personnel: [{ id: 'p1', name: 'Budi', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p2', name: 'Joko', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac2', code: 'PLG-01', name: 'Punching Machine', type: 'PLONG', capacityPerHour: 80, status: 'IDLE', personnel: [{ id: 'p3', name: 'Agus', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p4', name: 'Dedi', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac3', code: 'PRS-01', name: 'Bending Press 01', type: 'PRESS', capacityPerHour: 30, status: 'IDLE', personnel: [{ id: 'p5', name: 'Rudi', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p6', name: 'Asep', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac4', code: 'WLD-01', name: 'Welding Station', type: 'LAS', capacityPerHour: 10, status: 'IDLE', personnel: [{ id: 'p7', name: 'Siti', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p8', name: 'Rina', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac5', code: 'WT-01', name: 'Water Treatment Line', type: 'WT', capacityPerHour: 100, status: 'IDLE', personnel: [{ id: 'p9', name: 'Amin', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p10', name: 'Anto', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac6', code: 'PWD-01', name: 'Powder Coating Line', type: 'POWDER', capacityPerHour: 100, status: 'IDLE', personnel: [{ id: 'p11', name: 'Iwan', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p12', name: 'Edi', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
  { id: 'mac7', code: 'QC-01', name: 'QC Table', type: 'QC', capacityPerHour: 200, status: 'IDLE', personnel: [{ id: 'p13', name: 'Lia', role: 'PIC', shift: 'SHIFT_1' }, { id: 'p14', name: 'Tari', role: 'OPERATOR', shift: 'SHIFT_1' }], isMaintenance: false },
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', code: 'PRJ-001', name: 'Gondola SuperMart', customer: 'SuperMart', startDate: '2024-01-01', deadline: '2024-02-01', status: 'IN_PROGRESS', progress: 10, qtyPerUnit: 1, procurementQty: 100, totalQty: 100, unit: 'Set', isLocked: true
  }
];

// Fix: Added missing 'realized' property to BomItem objects to satisfy type definition
export const MOCK_ITEMS: ProjectItem[] = [
  {
    id: 'i1', projectId: 'p1', name: 'Tiang Gondola 2m', dimensions: '2000x50x50', thickness: '2mm', qtySet: 1, quantity: 100, unit: 'Pcs', isBomLocked: true, isWorkflowLocked: true,
    workflow: [], // Added empty workflow to satisfy type definition
    bom: [
      { id: 'b1', itemId: 'i1', materialId: 'm1', quantityPerUnit: 0.1, totalRequired: 10, allocated: 0, realized: 0 },
      { id: 'b2', itemId: 'i1', materialId: 'm3', quantityPerUnit: 0.5, totalRequired: 50, allocated: 0, realized: 0 },
    ]
  }
];

export const MOCK_TASKS: Task[] = [];
export const MOCK_LOGS: ProductionLog[] = [];

const FULL_ACCESS = { view: true, create: true, edit: true, delete: true };
// Added REPORTS to ADMIN_PERMISSIONS to satisfy exhaustive Record mapping in PermissionMap
export const ADMIN_PERMISSIONS: PermissionMap = { PROJECTS: FULL_ACCESS, MATERIALS: FULL_ACCESS, MACHINES: FULL_ACCESS, USERS: FULL_ACCESS, DASHBOARD: FULL_ACCESS, REPORTS: FULL_ACCESS };

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', username: 'admin', role: 'ADMIN', permissions: ADMIN_PERMISSIONS },
];
