import { create } from 'zustand';
import { 
  Project, Material, ProjectItem, Machine, Task, User, UnitMaster, ProductionLog,
  TaskStatus, ModuleName, ItemStepConfig, Shift, MachinePersonnel, ProcessStep
} from '../types';
import { 
  MOCK_PROJECTS, MOCK_MATERIALS, MOCK_ITEMS, MOCK_MACHINES, MOCK_TASKS, MOCK_USERS, MOCK_UNITS, MOCK_LOGS 
} from '../lib/mockData';

interface AppState {
  currentUser: User | null;
  projects: Project[];
  materials: Material[];
  items: ProjectItem[];
  machines: Machine[];
  tasks: Task[];
  users: User[];
  units: UnitMaster[];
  logs: ProductionLog[];

  can: (action: 'view' | 'create' | 'edit' | 'delete', module: ModuleName) => boolean;
  login: (username: string) => boolean;
  loginWithToken: (user: User) => void;
  logout: () => void;

  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  validateProject: (id: string) => void;
  
  addProjectItem: (item: ProjectItem) => void;
  updateProjectItem: (item: ProjectItem) => void;
  deleteProjectItem: (id: string) => void;
  
  lockBom: (itemId: string) => void;
  validateWorkflow: (itemId: string, workflow: ItemStepConfig[]) => void;
  unlockWorkflow: (itemId: string) => void;
  
  addBomItem: (itemId: string, materialId: string, qtyPerUnit: number) => void;
  deleteBomItem: (itemId: string, bomId: string) => void;
  
  adjustStock: (matId: string, amount: number) => void;
  toggleMaintenance: (macId: string) => void;
  
  reportProduction: (taskId: string, goodQty: number, defectQty: number, shift: Shift, operator: string) => void;
  startDowntime: (taskId: string) => void;
  endDowntime: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  addMachine: (m: Machine) => void;
  updateMachine: (um: Machine) => void;
  deleteMachine: (id: string) => boolean;
  addMaterial: (m: Material) => void;
  updateMaterial: (um: Material) => void;
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  downloadDatabase: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  projects: MOCK_PROJECTS,
  materials: MOCK_MATERIALS,
  items: MOCK_ITEMS,
  machines: MOCK_MACHINES,
  tasks: MOCK_TASKS,
  users: MOCK_USERS,
  units: MOCK_UNITS,
  logs: MOCK_LOGS,

  can: (action, module) => {
    const user = get().currentUser;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions?.[module]?.[action] || false;
  },

  login: (username) => {
    const user = get().users.find(u => u.username === username);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  loginWithToken: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    set({ currentUser: user });
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    set({ currentUser: null });
  },

  addProject: (p) => set((s) => ({ projects: [p, ...s.projects] })),
  updateProject: (up) => set((s) => ({ projects: s.projects.map(p => p.id === up.id ? up : p) })),
  deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),
  validateProject: (id) => set((s) => ({
    projects: s.projects.map(p => p.id === id ? { ...p, isLocked: true, status: 'IN_PROGRESS' } : p)
  })),

  addProjectItem: (item) => set((s) => ({ items: [...s.items, item] })),
  updateProjectItem: (item) => set((s) => ({ items: s.items.map(i => i.id === item.id ? item : i) })),
  deleteProjectItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),

  lockBom: (itemId) => set((s) => ({
    items: s.items.map(i => i.id === itemId ? { ...i, isBomLocked: true } : i)
  })),

  adjustStock: (matId, amount) => set(s => ({
    materials: s.materials.map(m => m.id === matId ? { ...m, currentStock: m.currentStock + amount } : m)
  })),

  toggleMaintenance: (macId) => set(s => ({
    machines: s.machines.map(m => m.id === macId ? { ...m, isMaintenance: !m.isMaintenance, status: !m.isMaintenance ? 'MAINTENANCE' : 'IDLE' } : m)
  })),

  validateWorkflow: (itemId, workflow) => set((state) => {
    const item = state.items.find(i => i.id === itemId);
    const project = state.projects.find(p => p.id === item?.projectId);
    if (!item || !project) return state;

    const newTasks: Task[] = [];
    workflow.forEach(step => {
      if (step.machineIds && step.machineIds.length > 0) {
        step.machineIds.forEach(machineId => {
          newTasks.push({
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectId: project.id,
            projectName: project.name,
            itemId: item.id,
            itemName: item.name,
            step: step.step,
            machineId: machineId,
            targetQty: item.quantity,
            completedQty: 0,
            defectQty: 0,
            status: 'PENDING',
            totalDowntimeMinutes: 0
          });
        });
      }
    });

    return {
      items: state.items.map(i => i.id === itemId ? { ...i, isWorkflowLocked: true, workflow } : i),
      tasks: [...state.tasks.filter(t => t.itemId !== itemId), ...newTasks]
    };
  }),

  unlockWorkflow: (itemId) => set((state) => ({
    items: state.items.map(i => i.id === itemId ? { ...i, isWorkflowLocked: false } : i),
    tasks: state.tasks.filter(t => t.itemId !== itemId)
  })),

  addBomItem: (itemId, matId, qty) => set((state) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return state;
    const newBom = { id: `bom-${Date.now()}`, itemId, materialId: matId, quantityPerUnit: qty, totalRequired: item.quantity * qty, allocated: 0, realized: 0 };
    return { items: state.items.map(i => i.id === itemId ? { ...i, bom: [...(i.bom || []), newBom] } : i) };
  }),

  deleteBomItem: (itemId, bomId) => set((s) => ({
    items: s.items.map(i => i.id === itemId ? { ...i, bom: i.bom.filter(b => b.id !== bomId) } : i)
  })),

  startDowntime: (taskId) => set(state => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;
    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'DOWNTIME', downtimeStart: new Date().toISOString() } : t),
      machines: state.machines.map(m => m.id === task.machineId ? { ...m, status: 'DOWNTIME' } : m)
    };
  }),

  endDowntime: (taskId) => set(state => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.downtimeStart) return state;
    const minutes = Math.floor((new Date().getTime() - new Date(task.downtimeStart).getTime()) / 60000);
    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS', totalDowntimeMinutes: t.totalDowntimeMinutes + minutes, downtimeStart: undefined } : t),
      machines: state.machines.map(m => m.id === task.machineId ? { ...m, status: 'RUNNING' } : m)
    };
  }),

  reportProduction: (taskId, goodQty, defectQty, shift, operator) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    const item = state.items.find(i => i.id === task.itemId);
    if (!item) return state;

    const totalProcessed = goodQty + defectQty;
    const updatedMaterials = [...state.materials];
    
    const updatedItems = state.items.map(it => {
        if (it.id !== item.id) return it;
        
        // REVISI: Material deduction and realization ONLY at the first step (POTONG)
        const isFirstStep = task.step === 'POTONG';
        
        const updatedBom = it.bom.map(bom => {
            const material = updatedMaterials.find(m => m.id === bom.materialId);
            if (!material) return bom;
            
            if (isFirstStep) {
                // Deduct from stock at first step
                const amountToDeduct = totalProcessed * bom.quantityPerUnit;
                material.currentStock -= amountToDeduct;
                
                // Mark as "Realized" (material has entered the floor)
                return { 
                  ...bom, 
                  realized: bom.realized + (totalProcessed * bom.quantityPerUnit),
                  allocated: bom.allocated + (goodQty * bom.quantityPerUnit)
                };
            }
            
            return bom;
        });
        return { ...it, bom: updatedBom };
    });

    const newTasks = state.tasks.map(t => 
        t.id === taskId ? { 
            ...t, 
            completedQty: t.completedQty + goodQty,
            defectQty: t.defectQty + defectQty,
            status: (t.completedQty + goodQty) >= t.targetQty ? 'COMPLETED' : t.status
        } : t
    );

    const newLog: ProductionLog = {
      id: `log-${Date.now()}`,
      taskId, machineId: task.machineId, itemId: task.itemId, projectId: task.projectId,
      step: task.step, shift, goodQty, defectQty, operator, timestamp: new Date().toISOString(),
      type: 'OUTPUT'
    };

    return { materials: updatedMaterials, items: updatedItems, tasks: newTasks, logs: [newLog, ...state.logs] };
  }),

  setTaskStatus: (taskId, status) => set((state) => {
    const tasks = state.tasks.map(t => t.id === taskId ? { ...t, status } : t);
    const task = tasks.find(t => t.id === taskId);
    const machines = state.machines.map(m => {
        if (m.id === task?.machineId) return { ...m, status: status === 'IN_PROGRESS' ? 'RUNNING' : 'IDLE' };
        return m;
    });
    return { tasks, machines };
  }),

  addMachine: (m) => set((s) => ({ machines: [...s.machines, m] })),
  updateMachine: (um) => set((s) => ({ machines: s.machines.map(m => m.id === um.id ? um : m) })),
  deleteMachine: (id) => {
    const hasTasks = get().tasks.some(t => t.machineId === id);
    if (hasTasks) return false;
    set((s) => ({ machines: s.machines.filter(m => m.id !== id) }));
    return true;
  },
  addMaterial: (m) => set((s) => ({ materials: [...s.materials, m] })),
  updateMaterial: (um) => set((s) => ({ materials: s.materials.map(m => m.id === um.id ? um : m) })),
  addUser: (u) => set(s => ({ users: [...s.users, u] })),
  updateUser: (u) => set(s => ({ users: s.users.map(x => x.id === u.id ? u : x) })),
  deleteUser: (id) => set(s => ({ users: s.users.filter(x => x.id !== id) })),
  downloadDatabase: () => {
    const state = get();
    const data = {
      projects: state.projects,
      materials: state.materials,
      items: state.items,
      machines: state.machines,
      tasks: state.tasks,
      users: state.users,
      logs: state.logs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-db-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
