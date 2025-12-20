import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient, ProjectData, ProjectItemData, MaterialData, BomItemData, TaskData, TasksListResponse } from '../lib/api';
import { ErrorPopup } from '../components/ErrorPopup';
import {
  Plus, Trash2, Lock, Unlock, X, Box, CheckCircle, CheckCircle2, Calendar, Clock, Layers, TrendingUp, ArrowRight, Settings2, Info, LayoutList, RefreshCcw, Save, Search, Hammer, ChevronRight, Activity, AlertTriangle
} from 'lucide-react';
import { ALL_STEPS, ItemStepConfig, ProcessStep, Task } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UNITS_LIST = ['PCS', 'SET', 'UNIT', 'BOX', 'KG', 'LEMBAR', 'ROLL', 'METER'];

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    tasks: storeTasks, machines, materials,
    validateWorkflow, unlockWorkflow
  } = useStore();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [projectItems, setProjectItems] = useState<ProjectItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bomItemsByItemId, setBomItemsByItemId] = useState<Record<string | number, BomItemData[]>>({});

  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TASKS'>('ITEMS');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', dimensions: '', thickness: '', qtySet: 1, unit: 'PCS' });
  const [isBomModalOpen, setIsBomModalOpen] = useState<string | null>(null);
  const [newBom, setNewBom] = useState({ materialId: '', qty: 1.0 });
  const [bomMaterials, setBomMaterials] = useState<MaterialData[]>([]);
  const [bomMaterialsLoading, setBomMaterialsLoading] = useState(false);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<string | null>(null);
  const [workflowConfig, setWorkflowConfig] = useState<ItemStepConfig[]>([]);
  const [viewStepDetail, setViewStepDetail] = useState<{itemId: string | number, step: ProcessStep} | null>(null);
  const [selectedMachineByStep, setSelectedMachineByStep] = useState<Record<string, string>>({});
  const [isMachineModalOpen, setIsMachineModalOpen] = useState<ProcessStep | null>(null);

  const [apiTasks, setApiTasks] = useState<TaskData[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    item_id: '',
    step: 'POTONG' as ProcessStep,
    machine_id: '',
    target_qty: 0,
    completed_qty: 0,
    defect_qty: 0,
    status: 'PENDING' as const
  });
  const [apiMachines, setApiMachines] = useState<any[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [apiTaskStatistics, setApiTaskStatistics] = useState<{total: number; pending: number; in_progress: number; paused: number; downtime: number; completed: number} | null>(null);

  useEffect(() => {
    const fetchProjectAndItems = async () => {
      if (!id) {
        setError('Project ID tidak ditemukan');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch project details
        const projectResponse = await apiClient.getProject(id);
        if (!projectResponse.success || !projectResponse.data) {
          setError(projectResponse.message || 'Gagal memuat data project');
          setIsLoading(false);
          return;
        }

        setProject(projectResponse.data as ProjectData);

        // Fetch items for this specific project
        const itemsResponse = await apiClient.getProjectItemsByProjectId(id);
        if (itemsResponse.success && itemsResponse.data) {
          const items = Array.isArray(itemsResponse.data) ? itemsResponse.data : (itemsResponse.data.data || []);
          // Transform workflow data from API (snake_case) to camelCase
          const transformedItems = items.map(item => ({
            ...item,
            workflow: (item.workflow || []).map((w: any) => ({
              step: w.step,
              sequence: w.sequence,
              machineIds: (w.machineIds || w.machine_ids || []).map((id: any) => String(id))
            }))
          }));
          setProjectItems(transformedItems);

          // Fetch BOM items for each project item
          const bomData: Record<string | number, BomItemData[]> = {};
          for (const item of items) {
            if (item.id) {
              const bomResponse = await apiClient.getBomItemsByProjectItem(item.id);
              if (bomResponse.success && bomResponse.data) {
                bomData[item.id] = Array.isArray(bomResponse.data) ? bomResponse.data : (bomResponse.data.data || []);
              }
            }
          }
          setBomItemsByItemId(bomData);
        } else {
          setError(itemsResponse.message || 'Gagal memuat daftar item');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data');
        console.error('Error fetching project data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndItems();
  }, [id]);

  const fetchBomMaterials = async () => {
    setBomMaterialsLoading(true);
    try {
      const response = await apiClient.getMaterials(1, 100);
      if (response.success && response.data?.data) {
        setBomMaterials(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setBomMaterialsLoading(false);
    }
  };

  useEffect(() => {
    if (isBomModalOpen) {
      fetchBomMaterials();
    }
  }, [isBomModalOpen]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;
      setTasksLoading(true);
      setTasksError(null);
      try {
        const response = await apiClient.getTasks(1, 100, { project_id: id });
        console.log('Tasks API Response:', response);
        if (response.success && response.data) {
          let taskList = [];
          // Handle different response formats
          if (Array.isArray(response.data)) {
            taskList = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            taskList = response.data.data;
          } else if (Array.isArray(response.data)) {
            taskList = response.data;
          }
          console.log('Parsed Task List:', taskList);
          setApiTasks(taskList);
        } else {
          setTasksError(response.message || 'Gagal memuat data tugas');
          console.error('API Error Response:', response);
        }
      } catch (err) {
        setTasksError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat tugas');
        console.error('Error fetching tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  useEffect(() => {
    const fetchMachines = async () => {
      if (!isTaskModalOpen && !isConfigModalOpen && !isMachineModalOpen) return;
      setMachinesLoading(true);
      try {
        const response = await apiClient.getMachines();
        if (response.success && response.data) {
          const machineList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          // Ensure all machine IDs are strings for consistent comparison
          const normalizedMachines = machineList.map(m => ({
            ...m,
            id: String(m.id)
          }));
          setApiMachines(normalizedMachines);
        }
      } catch (err) {
        console.error('Error fetching machines:', err);
      } finally {
        setMachinesLoading(false);
      }
    };

    fetchMachines();
  }, [isTaskModalOpen, isConfigModalOpen, isMachineModalOpen]);

  useEffect(() => {
    // Calculate task statistics for current project only
    const stats = {
      total: apiTasks.length,
      pending: apiTasks.filter(t => t.status === 'PENDING').length,
      in_progress: apiTasks.filter(t => t.status === 'IN_PROGRESS').length,
      paused: apiTasks.filter(t => t.status === 'PAUSED').length,
      completed: apiTasks.filter(t => t.status === 'COMPLETED').length,
      downtime: apiTasks.filter(t => t.status === 'DOWNTIME').length
    };
    setApiTaskStatistics(stats);
  }, [apiTasks]);

  // Merge store tasks with API tasks for real-time progress updates
  const mergedTasks = useMemo(() => {
    const storeTaskMap = new Map(storeTasks.map(t => [t.id, t]));
    const apiTaskMap = new Map(apiTasks.map(t => [t.id, t]));

    // Prioritize store tasks (they're updated in real-time when production is reported)
    const allTaskIds = new Set([...storeTaskMap.keys(), ...apiTaskMap.keys()]);
    return Array.from(allTaskIds).map(id => storeTaskMap.get(id) || apiTaskMap.get(id)).filter(Boolean) as (Task | TaskData)[];
  }, [storeTasks, apiTasks]);

  const projectTasks = mergedTasks.filter(t => (t.projectId || t.project_id) === id);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const item = projectItems.find(i => i.id?.toString() === newTask.item_id);
      if (!item) {
        setError('Item tidak ditemukan');
        return;
      }

      const taskPayload = {
        project_id: id!,
        project_name: project?.name || '',
        item_id: newTask.item_id,
        item_name: item.name,
        step: newTask.step,
        machine_id: newTask.machine_id,
        target_qty: newTask.target_qty,
        completed_qty: newTask.completed_qty,
        defect_qty: newTask.defect_qty,
        status: newTask.status
      };

      const response = await apiClient.createTask(taskPayload);
      if (response.success && response.data) {
        setApiTasks([...apiTasks, response.data]);
        setIsTaskModalOpen(false);
        setNewTask({
          item_id: '',
          step: 'POTONG',
          machine_id: '',
          target_qty: 0,
          completed_qty: 0,
          defect_qty: 0,
          status: 'PENDING'
        });
      } else {
        setError(response.message || 'Gagal menambah tugas');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menambah tugas');
      console.error('Error adding task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string | number, newStatus: string) => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateTaskStatus(taskId, newStatus);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));
      } else {
        setError(response.message || 'Gagal mengubah status tugas');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah status tugas');
      console.error('Error updating task status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTaskQuantities = async (taskId: string | number, completedQty: number, defectQty: number) => {
    setIsSaving(true);
    try {
      // Get the current task to find which item and step it belongs to
      const currentTask = apiTasks.find(t => t.id === taskId);
      if (!currentTask) {
        setError('Tugas tidak ditemukan');
        setIsSaving(false);
        return;
      }

      const response = await apiClient.updateTaskQuantities(taskId, completedQty, defectQty);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));

        // If this is the PACKING (final/finishing) step, automatically reduce material stock and update realisasi
        if (currentTask.step === 'PACKING' && completedQty > (currentTask.completed_qty || 0)) {
          const completedQuantityDifference = completedQty - (currentTask.completed_qty || 0);
          console.log('Reducing stock for item:', currentTask.item_id, 'Quantity difference:', completedQuantityDifference);

          // Get the BOM items for this product item - fetch fresh if not in cache
          let bomItems = bomItemsByItemId[currentTask.item_id] || [];

          // If BOM items not cached, fetch them
          if (bomItems.length === 0) {
            try {
              const bomResponse = await apiClient.getBomItemsByProjectItem(currentTask.item_id);
              if (bomResponse.success && bomResponse.data) {
                bomItems = Array.isArray(bomResponse.data) ? bomResponse.data : (bomResponse.data.data || []);
                console.log('Fetched BOM items for item', currentTask.item_id, ':', bomItems);
              }
            } catch (err) {
              console.error('Error fetching BOM items:', err);
            }
          }
          console.log('BOM Items for item', currentTask.item_id, ':', bomItems);

          if (bomItems.length === 0) {
            console.warn('No BOM items found for item:', currentTask.item_id);
          }

          // Reduce stock for each material based on the quantity completed
          for (const bomItem of bomItems) {
            if (bomItem.material_id && bomItem.id) {
              const quantityToReduce = completedQuantityDifference * (bomItem.quantity_per_unit || 0);
              console.log('Reducing material:', bomItem.material_id, 'by quantity:', quantityToReduce);

              try {
                const stockResponse = await apiClient.updateMaterialStock(
                  bomItem.material_id,
                  quantityToReduce,
                  'reduce'
                );
                console.log('Stock update response:', stockResponse);

                if (stockResponse.success) {
                  // Also update BOM item's realized quantity
                  const newRealized = (bomItem.realized || 0) + quantityToReduce;
                  const bomUpdateResponse = await apiClient.updateBomItem(bomItem.id, {
                    realized: newRealized
                  });
                  console.log('BOM item realized update response:', bomUpdateResponse);
                } else {
                  console.error(`Failed to reduce stock for material ${bomItem.material_id}:`, stockResponse.message);
                }
              } catch (err) {
                console.error(`Error reducing stock for material ${bomItem.material_id}:`, err);
                // Don't fail the whole operation if one material stock update fails
              }
            }
          }
        }
      } else {
        setError(response.message || 'Gagal mengubah kuantitas tugas');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah kuantitas tugas');
      console.error('Error updating task quantities:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
      setIsSaving(true);
      try {
        const response = await apiClient.deleteTask(taskId);
        if (response.success) {
          setApiTasks(apiTasks.filter(t => t.id !== taskId));
        } else {
          setError(response.message || 'Gagal menghapus tugas');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat menghapus tugas');
        console.error('Error deleting task:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleStartDowntime = async (taskId: string | number) => {
    setIsSaving(true);
    try {
      const response = await apiClient.startTaskDowntime(taskId);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));
      } else {
        setError(response.message || 'Gagal memulai downtime');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memulai downtime');
      console.error('Error starting downtime:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndDowntime = async (taskId: string | number) => {
    setIsSaving(true);
    try {
      const response = await apiClient.endTaskDowntime(taskId);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));
      } else {
        setError(response.message || 'Gagal menyelesaikan downtime');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyelesaikan downtime');
      console.error('Error ending downtime:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter tasks for current project - uses merged tasks for real-time progress updates
  const projectFilteredTasks = useMemo(() => {
    return mergedTasks.filter(t => {
      const taskProjectId = (t as any).projectId || (t as any).project_id;
      return taskProjectId?.toString() === id?.toString();
    });
  }, [mergedTasks, id]);

  const taskStatistics = apiTaskStatistics || {
    total: projectFilteredTasks.length,
    pending: projectFilteredTasks.filter(t => t.status === 'PENDING').length,
    in_progress: projectFilteredTasks.filter(t => t.status === 'IN_PROGRESS').length,
    paused: projectFilteredTasks.filter(t => t.status === 'PAUSED').length,
    completed: projectFilteredTasks.filter(t => t.status === 'COMPLETED').length,
    downtime: projectFilteredTasks.filter(t => t.status === 'DOWNTIME').length
  };

  const daysLeft = useMemo(() => {
    if (!project) return 0;
    const deadline = typeof project.deadline === 'string' ? new Date(project.deadline) : new Date();
    const diff = deadline.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [project]);

  // Auto-complete items when all workflow steps are finished
  useEffect(() => {
    const checkAndCompleteItems = async () => {
      for (const item of projectItems) {
        if (!item.workflow || item.workflow.length === 0) continue;

        // Check if all workflow steps are completed
        const allStepsComplete = item.workflow.every(workflowStep => {
          const stepTasks = mergedTasks.filter(
            t => (t.itemId || t.item_id) === item.id && t.step === workflowStep.step
          );
          return stepTasks.length > 0 && stepTasks.every(t => t.status === 'COMPLETED');
        });

        if (allStepsComplete && !item.is_workflow_completed) {
          // Mark item as workflow completed
          try {
            const response = await apiClient.updateProjectItem(item.id!, {
              is_workflow_completed: true
            });
            if (response.success && response.data) {
              setProjectItems(projectItems.map(i => i.id === item.id ? response.data : i));
            }
          } catch (err) {
            console.error('Error marking item as workflow completed:', err);
          }
        }
      }
    };

    if (projectItems.length > 0 && mergedTasks.length > 0) {
      checkAndCompleteItems();
    }
  }, [mergedTasks, projectItems]);

  const sCurveData = useMemo(() => [
    { day: 'Sen', actual: 20, plan: 15 },
    { day: 'Sel', actual: 45, plan: 35 },
    { day: 'Rab', actual: 50, plan: 55 },
    { day: 'Kam', actual: 65, plan: 75 },
    { day: 'Jum', actual: 80, plan: 90 },
  ], []);

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-500">Memuat data project...</div>;
  if (error || !project) return <div className="p-10 text-center font-bold text-red-500">{error || 'Project tidak ditemukan'}</div>;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        project_id: project?.id!,
        name: newItem.name,
        dimensions: newItem.dimensions,
        thickness: newItem.thickness,
        qty_set: newItem.qtySet,
        quantity: (project?.total_qty ?? 0) * newItem.qtySet,
        unit: newItem.unit,
        is_bom_locked: false,
        is_workflow_locked: false,
        workflow: [],
        bom: []
      };

      const response = await apiClient.createProjectItem(payload);
      if (response.success && response.data) {
        setProjectItems([...projectItems, response.data]);
        setIsItemModalOpen(false);
        setNewItem({ name: '', dimensions: '', thickness: '', qtySet: 1, unit: 'PCS' });
      } else {
        setError(response.message || 'Gagal menambah item');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menambah item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string | number) => {
    if (confirm('Yakin ingin menghapus item ini?')) {
      setIsSaving(true);
      try {
        const response = await apiClient.deleteProjectItem(itemId);
        if (response.success) {
          setProjectItems(projectItems.filter(i => i.id !== itemId));
        } else {
          setError(response.message || 'Gagal menghapus item');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat menghapus item');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const startWorkflowConfig = (item: any) => {
    // Initialize workflow with existing config, or empty if no config yet
    let initialWorkflow: ItemStepConfig[] = [];
    if (item.workflow?.length > 0) {
      initialWorkflow = item.workflow.map((w: any) => ({
        step: w.step,
        sequence: w.sequence,
        machineIds: (w.machineIds || w.machine_ids || []).map((id: any) => String(id))
      }));
    }
    setWorkflowConfig(initialWorkflow);
    setSelectedMachineByStep({});
    setIsConfigModalOpen(item.id);
  };

  const handleSaveWorkflow = async () => {
    if (!isConfigModalOpen) return;

    // Filter out unselected steps (those without any machine)
    const selectedWorkflow = workflowConfig.filter(s => s.machineIds && s.machineIds.length > 0);

    if (selectedWorkflow.length === 0) {
      setError('Pilih minimal satu tahapan dengan mesin yang ditugaskan');
      return;
    }

    setIsSaving(true);
    try {
      // Get the current item to check previous workflow
      const item = projectItems.find(i => i.id === isConfigModalOpen);
      const previousWorkflow = item?.workflow || [];

      // Call API to update the project item with workflow configuration
      const response = await apiClient.updateProjectItem(isConfigModalOpen, {
        is_workflow_locked: true,
        workflow: selectedWorkflow
      });

      if (response.success && response.data) {
        // Update local state
        setProjectItems(projectItems.map(i => i.id === isConfigModalOpen ? response.data : i));

        // Create tasks from the workflow
        validateWorkflow(isConfigModalOpen.toString(), selectedWorkflow);

        // Auto-create tasks via API only for NEW workflow steps (not previously configured)
        if (item && project) {
          // Calculate days until deadline
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const deadline = new Date(project.deadline);
          deadline.setHours(0, 0, 0, 0);
          const daysUntilDeadline = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

          // Only create tasks for steps that are NEW (not in previous workflow)
          const newSteps = selectedWorkflow.filter(step => !previousWorkflow.some(prev => prev.step === step.step));

          for (const workflowStep of newSteps) {
            // Process each machine in the machineIds array
            for (const machineId of workflowStep.machineIds) {
              try {
                // Get machine details to determine shifts
                const machineResponse = await apiClient.getMachine(machineId);
                let shiftsOnMachine: string[] = ['SHIFT_1', 'SHIFT_2', 'SHIFT_3']; // Default to 3 shifts

                if (machineResponse.success && machineResponse.data) {
                  const machine = machineResponse.data;
                  // Extract unique shifts from machine personnel
                  const uniqueShifts = new Set<string>();
                  if (Array.isArray(machine.personnel)) {
                    machine.personnel.forEach((p: any) => {
                      if (p.shift) {
                        uniqueShifts.add(p.shift);
                      }
                    });
                  }
                  // If shifts found in personnel, use them; otherwise use default
                  if (uniqueShifts.size > 0) {
                    shiftsOnMachine = Array.from(uniqueShifts).sort();
                  }
                }

                // Calculate adjusted target quantity per shift per day
                const totalDivisor = shiftsOnMachine.length * daysUntilDeadline;
                const adjustedTargetQty = Math.ceil(item.quantity / totalDivisor);

                // Create tasks for each day from today until deadline
                for (let dayOffset = 0; dayOffset < daysUntilDeadline; dayOffset++) {
                  const taskDate = new Date(today);
                  taskDate.setDate(taskDate.getDate() + dayOffset);
                  const isAccessible = dayOffset === 0; // Only today's tasks are accessible

                  // Create one task for each shift on the machine for this specific day
                  for (const shift of shiftsOnMachine) {
                    const taskPayload = {
                      project_id: project.id!,
                      project_name: project.name,
                      item_id: item.id!,
                      item_name: item.name,
                      step: workflowStep.step,
                      machine_id: machineId,
                      target_qty: adjustedTargetQty,
                      completed_qty: 0,
                      defect_qty: 0,
                      shift: shift,
                      scheduled_date: taskDate.toISOString().split('T')[0],
                      is_accessible: isAccessible,
                      status: isAccessible ? 'PENDING' : 'LOCKED'
                    };

                    const taskResponse = await apiClient.createTask(taskPayload);
                    if (taskResponse.success && taskResponse.data) {
                      setApiTasks(prev => [...prev, taskResponse.data]);
                    }
                  }
                }
              } catch (taskErr) {
                console.error('Error creating task for step:', taskErr);
              }
            }
          }
        }

        setIsConfigModalOpen(null);
        setSelectedMachineByStep({});
        setError(null);
      } else {
        setError(response.message || 'Gagal menyimpan alur produksi');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan alur produksi');
      console.error('Error saving workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER STATS */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{project.name}</h1>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-xl font-black text-[10px] tracking-widest">{project.code}</span>
          </div>
          <p className="text-slate-400 font-bold text-sm flex items-center gap-2 uppercase tracking-widest"><Info size={14}/> Cust: {project.customer}</p>
          <div className="flex gap-10 pt-4">
            <div className="bg-slate-50 px-6 py-3 rounded-[24px] border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Project</p>
                <p className="font-black text-slate-700 text-xl">{project.total_qty} {project.unit}</p>
            </div>
            <div className="bg-emerald-50 px-6 py-3 rounded-[24px] border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Produk Selesai (PACKING)</p>
                <p className="font-black text-emerald-600 text-xl">
                  {projectTasks.filter(t => t.step === 'PACKING').reduce((acc, t) => acc + (t.completedQty || t.completed_qty || 0), 0)} {project.unit}
                </p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-72 bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all duration-700"><TrendingUp size={80}/></div>
           <div className="flex justify-between items-end mb-4 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sisa {daysLeft} Hari</span>
              <span className="text-3xl font-black">{project?.progress ?? 0}%</span>
           </div>
           <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
              <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${project?.progress ?? 0}%`}} />
           </div>
           <div className="h-10 w-full opacity-50">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={sCurveData}>
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-10 border-b-2 border-slate-100 px-6">
        <button onClick={() => setActiveTab('ITEMS')} className={`pb-6 text-sm font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'ITEMS' ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5' : 'text-slate-400 hover:text-slate-600'}`}>
          <Layers size={18}/> Item Pekerjaan & BOM
        </button>
        <button onClick={() => setActiveTab('TASKS')} className={`pb-6 text-sm font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'TASKS' ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5' : 'text-slate-400 hover:text-slate-600'}`}>
          <LayoutList size={18}/> Tugas Produksi <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px] ml-1">{projectFilteredTasks.length}</span>
        </button>
      </div>

      {activeTab === 'ITEMS' && (
        <div className="space-y-12 pb-20">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Daftar Item Produksi</h2>
             <button onClick={() => setIsItemModalOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
               <Plus size={20}/> TAMBAH ITEM
             </button>
          </div>

          {projectItems.map((item, idx) => {
            const completedQtyAtQC = mergedTasks.filter(t => (t.itemId || t.item_id) === item.id && t.step === 'PACKING').reduce((acc, t) => acc + (t.completedQty || t.completed_qty || 0), 0);
            const itemTotalSteps = ALL_STEPS.length;
            const itemOverallProgress = item.quantity > 0 ? Math.round((mergedTasks.filter(t => (t.itemId || t.item_id) === item.id && t.status === 'COMPLETED').length / (item.workflow.length || 1)) * 100) : 0;

            return (
              <div key={item.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-500">
                <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-10 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <div className="flex gap-8 items-center flex-1">
                    <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-[24px] flex items-center justify-center font-black text-slate-400 text-2xl shadow-sm">{idx + 1}</div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{item.name}</h3>
                        {item.is_workflow_completed ? (
                          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl" title="Workflow Completed"><CheckCircle2 size={18} /></div>
                        ) : item.is_workflow_locked ? (
                          <button onClick={() => unlockWorkflow(item.id!.toString())} className="bg-emerald-100 text-emerald-600 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" title="Unlock for Edit"><Lock size={18} /></button>
                        ) : (
                          <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Unlock size={18} /></div>
                        )}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Box size={14}/> {item.dimensions}</span>
                        <span className="flex items-center gap-1">Tebal: {item.thickness}</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black">{item.unit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <div className="text-center bg-blue-600 px-8 py-3 rounded-2xl shadow-xl shadow-blue-100">
                      <p className="text-[10px] font-black text-blue-200 uppercase mb-1">Target</p>
                      <p className="text-2xl font-black text-white">{item.quantity || (project?.total_qty ?? 0)}</p>
                    </div>
                    <div className="text-center bg-emerald-500 px-8 py-3 rounded-2xl shadow-xl shadow-emerald-100">
                      <p className="text-[10px] font-black text-emerald-100 uppercase mb-1">Sudah Jadi</p>
                      <p className="text-2xl font-black text-white">{completedQtyAtQC}</p>
                    </div>
                    <div className="flex gap-3 ml-4">
                      {!item.is_bom_locked ? (
                        <button onClick={() => setIsBomModalOpen(item.id!.toString())} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2"><Hammer size={16}/> Kelola BOM</button>
                      ) : (
                        <button onClick={() => startWorkflowConfig(item)} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${item.is_workflow_locked ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}><Settings2 size={16}/> {item.is_workflow_locked ? 'Edit Alur' : 'Set Alur Mesin'}</button>
                      )}
                      <button onClick={() => handleDeleteItem(item.id!)} disabled={isSaving} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"><Trash2 size={20}/></button>
                    </div>
                  </div>
                </div>

                {/* MATERIAL BOM SECTION */}
                <div className="px-10 py-8 border-b border-slate-50">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                            <Box size={14} className="text-blue-500"/> Manajemen Material BOM
                        </h4>
                        <div className="flex gap-3">
                          {!item.is_bom_locked && <button onClick={() => setIsBomModalOpen(item.id!.toString())} className="text-[10px] font-black text-blue-600 uppercase">+ Input Material</button>}
                          {(bomItemsByItemId[item.id!] || []).length > 0 && !item.is_bom_locked && <button onClick={async () => {
                            setIsSaving(true);
                            try {
                              const updateResponse = await apiClient.updateProjectItem(item.id!, { is_bom_locked: true });
                              if (updateResponse.success && updateResponse.data) {
                                setProjectItems(projectItems.map(i => i.id === item.id ? { ...i, is_bom_locked: true } : i));
                              } else {
                                setError(updateResponse.message || 'Gagal mengunci BOM');
                              }
                            } catch (err) {
                              setError('Terjadi kesalahan saat mengunci BOM');
                              console.error('Error locking BOM:', err);
                            } finally {
                              setIsSaving(false);
                            }
                          }} disabled={isSaving} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all">Kunci BOM</button>}
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                             <tr>
                              <th className="px-6 py-4">Bahan Baku</th>
                              <th className="px-6 py-4 text-center">Satuan / Unit</th>
                              <th className="px-6 py-4 text-center">Total Kebutuhan</th>
                              <th className="px-6 py-4 text-center text-emerald-600">Realisasi</th>
                              {!item.isBomLocked && <th className="px-6 py-4 text-right">Aksi</th>}
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                             {(bomItemsByItemId[item.id!] || []).length > 0 ? (
                               (bomItemsByItemId[item.id!] || []).map(b => (
                                 <tr key={b.id} className="hover:bg-slate-50/50">
                                   <td className="px-6 py-4">
                                      <p className="text-slate-900 font-black">{b.material?.name}</p>
                                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{b.material?.code}</p>
                                   </td>
                                   <td className="px-6 py-4 text-center">{b.quantity_per_unit} <span className="text-[9px] text-slate-400">{b.material?.unit}</span></td>
                                   <td className="px-6 py-4 text-center font-black text-slate-900 text-base">{b.total_required} <span className="text-[9px] text-slate-400">{b.material?.unit}</span></td>
                                   <td className="px-6 py-4 text-center font-black text-emerald-600 text-base">{b.realized} <span className="text-[9px] text-emerald-400">{b.material?.unit}</span></td>
                                   {!item.is_bom_locked && <td className="px-6 py-4 text-right"><button onClick={async () => {
                                     setIsSaving(true);
                                     try {
                                       const deleteResponse = await apiClient.deleteBomItem(b.id!);
                                       if (deleteResponse.success) {
                                         setBomItemsByItemId(prev => ({
                                           ...prev,
                                           [item.id!]: (prev[item.id!] || []).filter(bom => bom.id !== b.id)
                                         }));
                                       } else {
                                         setError(deleteResponse.message || 'Gagal menghapus BOM item');
                                       }
                                     } catch (err) {
                                       setError('Terjadi kesalahan saat menghapus BOM item');
                                       console.error('Error deleting BOM item:', err);
                                     } finally {
                                       setIsSaving(false);
                                     }
                                   }} className="text-red-400 p-2 hover:text-red-600 disabled:opacity-50" disabled={isSaving}><Trash2 size={16}/></button></td>}
                                 </tr>
                               ))
                             ) : (
                               <tr><td colSpan={5} className="py-10 text-center text-slate-300 italic font-bold">Input BOM terlebih dahulu untuk mengunci data material.</td></tr>
                             )}
                           </tbody>
                        </table>
                    </div>
                </div>

                {/* INTERACTIVE FLOW SECTION */}
                <div className="p-10 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-8">
                       <div className="flex items-center gap-3">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                             <Activity size={14} className="text-blue-500"/> Alur Proses Manufaktur (Klik Tiap Step Untuk Detail)
                         </h4>
                         {item.is_workflow_completed && (
                           <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">✓ SELESAI</span>
                         )}
                       </div>
                       {!item.isWorkflowLocked && item.isBomLocked && (
                           <button onClick={() => startWorkflowConfig(item)} className="bg-white text-slate-900 border border-slate-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all">Konfigurasi Alur</button>
                       )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative">
                      {ALL_STEPS.map((step, sIdx) => {
                        const stepTasks = mergedTasks.filter(t => (t.itemId || t.item_id) === item.id && t.step === step);
                        const good = stepTasks.reduce((acc, t) => acc + (t.completedQty || t.completed_qty || 0), 0);
                        const progress = item.quantity > 0 ? (good / item.quantity) * 100 : 0;
                        const isConfigured = item.workflow.some(w => w.step === step);
                        
                        return (
                          <div 
                            key={step} 
                            onClick={() => isConfigured && setViewStepDetail({itemId: item.id, step})}
                            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${isConfigured ? 'opacity-100 hover:-translate-y-2' : 'opacity-20 pointer-events-none'}`}
                          >
                             <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-xl mb-3 border-4 shadow-xl transition-all ${
                               good >= item.quantity && item.quantity > 0 ? 'bg-emerald-500 border-emerald-300 text-white' : 
                               isConfigured ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-300 border-slate-200 text-slate-400'
                             }`}>
                               {sIdx + 1}
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 text-center h-8 mb-2">{step}</span>
                             <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2 border border-white">
                                <div className={`h-full transition-all duration-1000 ${good >= item.quantity ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${progress}%`}} />
                             </div>
                             <div className="flex flex-col items-center">
                                <p className="text-[10px] font-black text-slate-900">{Math.round(progress)}%</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{good} / {item.quantity}</p>
                             </div>
                             {sIdx < 6 && <ChevronRight size={16} className="absolute -right-3 top-8 text-slate-200 hidden lg:block" />}
                          </div>
                        )
                      })}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'TASKS' && (
        <div className="space-y-12 pb-20">
          {/* TASK STATISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Tugas</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{taskStatistics.total}</p>
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
                <LayoutList size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{taskStatistics.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                <Clock size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sedang Berjalan</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{taskStatistics.in_progress}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Activity size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Terjeda</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{taskStatistics.paused}</p>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-start justify-between hover:border-red-300 transition-all">
              <div>
                <p className="text-sm font-medium text-slate-500">Downtime</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{taskStatistics.downtime}</p>
                <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest">⏸️ Maintenance</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Selesai</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{taskStatistics.completed}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Daftar Tugas Produksi</h2>
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
              <Plus size={20}/> TAMBAH TUGAS
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {tasksError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{tasksError}</p>
            </div>
          )}

          {/* LOADING STATE */}
          {tasksLoading && (
            <div className="text-center py-8">
              <p className="text-slate-500">Memuat data tugas...</p>
            </div>
          )}

          {/* TASKS TABLE */}
          {!tasksLoading && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Item Pekerjaan</th>
                    <th className="px-8 py-5">Proses Tahapan</th>
                    <th className="px-8 py-5">Mesin Pelaksana</th>
                    <th className="px-8 py-5 text-center">Shift</th>
                    <th className="px-8 py-5 text-center">Target</th>
                    <th className="px-8 py-5 text-center">Aktual Selesai</th>
                    <th className="px-8 py-5 text-center">Reject</th>
                    <th className="px-8 py-5 text-center">Status Kerja</th>
                    <th className="px-8 py-5 text-center text-red-500">Downtime (min)</th>
                    <th className="px-8 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {projectFilteredTasks.length > 0 ? (
                    projectFilteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/50">
                        <td className="px-8 py-5">
                          <p className="text-slate-800 font-black">{task.item_name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">ID: {task.id}</p>
                        </td>
                        <td className="px-8 py-5"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">{task.step}</span></td>
                        <td className="px-8 py-5 text-slate-600 font-bold">{task.machine?.name || 'N/A'}</td>
                        <td className="px-8 py-5 text-center"><span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">{task.shift || '-'}</span></td>
                        <td className="px-8 py-5 text-center font-black text-slate-800">{task.target_qty}</td>
                        <td className="px-8 py-5 text-center font-black text-blue-600">{task.completed_qty}</td>
                        <td className="px-8 py-5 text-center font-black text-red-600">{task.defect_qty}</td>
                        <td className="px-8 py-5">
                          <div className="space-y-2">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id!, e.target.value)}
                              disabled={isSaving}
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer disabled:opacity-50 w-full ${
                                task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                task.status === 'PAUSED' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                'bg-red-100 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="PAUSED">PAUSED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="DOWNTIME">DOWNTIME</option>
                            </select>
                            {task.total_downtime_minutes > 0 && (
                              <p className="text-[9px] font-bold text-slate-500">📊 {task.total_downtime_minutes} min</p>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {task.total_downtime_minutes > 0 ? (
                              <>
                                <p className="text-base font-black text-red-600">{task.total_downtime_minutes}</p>
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">min</span>
                              </>
                            ) : (
                              <p className="text-slate-300 text-sm">—</p>
                            )}
                            {task.downtime_start && (
                              <p className="text-[8px] font-bold text-orange-500 uppercase">⏱️ Aktif</p>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex gap-2 justify-end flex-wrap">
                            {task.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleStartDowntime(task.id!)}
                                disabled={isSaving}
                                className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 disabled:opacity-50 transition-all"
                                title="Mulai downtime"
                              >
                                Downtime
                              </button>
                            )}
                            {task.status === 'DOWNTIME' && (
                              <button
                                onClick={() => handleEndDowntime(task.id!)}
                                disabled={isSaving}
                                className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 disabled:opacity-50 transition-all"
                                title="Selesaikan downtime"
                              >
                                Resume
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const newCompleted = prompt(`Update kuantitas selesai (saat ini: ${task.completed_qty})`, task.completed_qty.toString());
                                const newDefect = prompt(`Update kuantitas reject (saat ini: ${task.defect_qty})`, task.defect_qty.toString());
                                if (newCompleted !== null && newDefect !== null) {
                                  handleUpdateTaskQuantities(task.id!, Number(newCompleted), Number(newDefect));
                                }
                              }}
                              disabled={isSaving}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 font-black text-xs"
                              title="Ubah kuantitas"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id!)}
                              disabled={isSaving}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2"
                              title="Hapus tugas"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={10} className="py-20 text-center text-slate-300 italic font-bold text-lg">Belum ada tugas. Klik TAMBAH TUGAS untuk membuat tugas baru.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STEP DETAIL VIEW (WHEN CLICKING FLOW 1-7) */}
      {viewStepDetail && (
         <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
            <div className="bg-white rounded-[48px] w-full max-w-4xl p-12 space-y-10 shadow-2xl animate-in fade-in zoom-in-95">
               <div className="flex justify-between items-center border-b pb-8">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Monitoring Tahap {viewStepDetail.step}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{projectItems.find(i => i.id === viewStepDetail.itemId)?.name}</p>
                  </div>
                  <button onClick={() => setViewStepDetail(null)} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mergedTasks.filter(t => (t.itemId || t.item_id) === viewStepDetail.itemId && t.step === viewStepDetail.step).map(t => {
                    const m = machines.find(mac => mac.id === (t.machineId || t.machine_id));
                    const completedQty = t.completedQty || t.completed_qty || 0;
                    const targetQty = t.targetQty || t.target_qty || 1;
                    const progress = Math.round((completedQty / targetQty) * 100);
                    return (
                      <div key={t.id} className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 space-y-6">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Mesin Pelaksana</p>
                               <h3 className="text-2xl font-black text-slate-800">{m?.name}</h3>
                            </div>
                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{t.status}</span>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between font-black text-slate-500 text-xs">
                               <span className="tracking-widest">REAL-TIME PROGRESS</span>
                               <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-white h-5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                               <div className={`h-full rounded-full transition-all duration-1000 ${t.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{width: `${progress}%`}} />
                            </div>
                            <div className="flex justify-between pt-4 bg-white/50 p-4 rounded-2xl">
                               <div className="text-center flex-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</p><p className="text-xl font-black text-slate-800">{targetQty}</p></div>
                               <div className="text-center flex-1 border-l"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktual</p><p className="text-xl font-black text-blue-600">{completedQty}</p></div>
                               <div className="text-center flex-1 border-l"><p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Reject</p><p className="text-xl font-black text-red-500">{t.defectQty || t.defect_qty || 0}</p></div>
                            </div>
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
         </div>
      )}

      {/* CONFIG MODAL */}
      {isConfigModalOpen && (
         <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-[48px] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
               <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Konfigurasi Alur Produksi & Mesin</h2>
                  <button onClick={() => {
                    setIsConfigModalOpen(null);
                    setSelectedMachineByStep({});
                  }} className="p-4 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-white">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">ℹ️ Alur Proses Manufaktur</p>
                    <p className="text-sm font-black text-slate-700 mt-2">Pilih tahapan yang diperlukan dan tentukan mesin untuk setiap tahapan. Hanya tahapan yang dipilih yang akan menjadi wajib.</p>
                  </div>

                  {ALL_STEPS.map((step, sIdx) => {
                    const isSelected = workflowConfig.some(w => w.step === step);
                    const s = workflowConfig.find(w => w.step === step) || { step: step as ProcessStep, sequence: sIdx + 1, machineIds: [] };
                    const stepTasks = projectFilteredTasks.filter(t => t.step === s.step);
                    const stepTotal = stepTasks.reduce((acc, t) => acc + (t.target_qty || t.targetQty || 0), 0);
                    const stepCompleted = stepTasks.reduce((acc, t) => acc + (t.completed_qty || t.completedQty || 0), 0);
                    const stepProgress = stepTotal > 0 ? Math.round((stepCompleted / stepTotal) * 100) : 0;
                    const assignedMachines = apiMachines.filter(m => s.machineIds && s.machineIds.some(id => String(id) === String(m.id)));

                    return (
                      <div key={s.step} className={`p-8 rounded-[32px] border-2 space-y-6 transition-all ${isSelected ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-6 flex-1">
                             <label className="flex items-center gap-4 cursor-pointer flex-1">
                               <input
                                 type="checkbox"
                                 checked={isSelected}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     setWorkflowConfig(prev => [...prev, { step: s.step, sequence: sIdx + 1, machineIds: [] }]);
                                   } else {
                                     setWorkflowConfig(prev => prev.filter(f => f.step !== s.step));
                                   }
                                 }}
                                 className="w-5 h-5 rounded-lg cursor-pointer accent-blue-600"
                               />
                               <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl flex-shrink-0">
                                 {sIdx + 1}
                               </div>
                               <div>
                                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{s.step}</h3>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tahapan Produksi {sIdx + 1} dari {ALL_STEPS.length}</p>
                               </div>
                             </label>
                           </div>
                        </div>

                        {isSelected && (
                          <div className="space-y-4">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pilih Mesin Pelaksana (Dapat Dipilih Lebih Dari 1)</label>
                                <button
                                  type="button"
                                  onClick={() => setIsMachineModalOpen(s.step)}
                                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-black text-sm shadow-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                                >
                                  <Hammer size={20} />
                                  Pilih Mesin untuk {s.step}
                                </button>
                             </div>
                             {assignedMachines.length > 0 && (
                               <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">✓ Mesin Terpilih ({assignedMachines.length})</p>
                                 <div className="space-y-2">
                                   {assignedMachines.map(m => (
                                     <div key={m.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100">
                                       <div className="flex-1">
                                         <p className="text-sm font-black text-emerald-700">{m.name}</p>
                                         <p className="text-[9px] text-emerald-600">{m.status}</p>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                          </div>
                        )}

                      </div>
                    )
                  })}
               </div>

               <div className="p-10 border-t bg-slate-50 space-y-8">
                  <div className="flex justify-end items-center">
                    <button onClick={handleSaveWorkflow} disabled={isSaving || workflowConfig.filter(s => s.machineIds && s.machineIds.length > 0).length === 0} title={workflowConfig.filter(s => s.machineIds && s.machineIds.length > 0).length === 0 ? 'Pilih minimal satu tahapan dengan mesin' : ''} className="bg-blue-600 text-white px-16 py-6 rounded-[32px] font-black text-lg shadow-2xl uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Save size={24}/> {isSaving ? 'MENYIMPAN...' : 'VALIDASI & SIMPAN ALUR'}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* MACHINE SELECTION MODAL */}
      {isMachineModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[48px] w-full max-w-2xl p-10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Pilih Mesin</h2>
                <p className="text-sm text-slate-500 mt-2">Tahap: <span className="font-black text-blue-600">{isMachineModalOpen}</span></p>
              </div>
              <button
                onClick={() => setIsMachineModalOpen(null)}
                className="p-4 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {machinesLoading ? (
                <div className="text-center py-12 text-slate-500">Memuat mesin...</div>
              ) : apiMachines.filter(m => m.type === isMachineModalOpen).length === 0 ? (
                <div className="text-center py-12 text-slate-500">Tidak ada mesin untuk tahap ini</div>
              ) : (
                apiMachines
                  .filter(m => m.type === isMachineModalOpen)
                  .map(m => {
                    const stepConfig = workflowConfig.find(w => w.step === isMachineModalOpen);
                    const isChecked = stepConfig?.machineIds?.some(id => String(id) === String(m.id)) || false;
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkflowConfig(prev => prev.map(f => f.step === isMachineModalOpen ? {...f, machineIds: [...(f.machineIds || []), String(m.id)]} : f));
                            } else {
                              setWorkflowConfig(prev => prev.map(f => f.step === isMachineModalOpen ? {...f, machineIds: (f.machineIds || []).filter(id => String(id) !== String(m.id))} : f));
                            }
                          }}
                          className="w-5 h-5 rounded cursor-pointer accent-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-lg">{m.name}</p>
                          <p className="text-sm text-slate-500">{m.status}</p>
                        </div>
                        {isChecked && (
                          <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">
                            ✓ Terpilih
                          </div>
                        )}
                      </label>
                    );
                  })
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                onClick={() => setIsMachineModalOpen(null)}
                className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOM MODAL */}
      {isBomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Setup Material BOM</h2><button onClick={() => setIsBomModalOpen(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X/></button></div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const item = projectItems.find(i => i.id?.toString() === isBomModalOpen);
                  if (!item) {
                    setError('Item tidak ditemukan');
                    return;
                  }

                  const qtyPerUnit = parseFloat(newBom.qty.toString());
                  const totalRequired = (item.quantity || 0) * qtyPerUnit;

                  const bomPayload = {
                    item_id: isBomModalOpen!,
                    material_id: newBom.materialId,
                    quantity_per_unit: Math.round(qtyPerUnit * 100) / 100,
                    total_required: Math.round(totalRequired * 100) / 100,
                    allocated: 0,
                    realized: 0
                  };

                  const response = await apiClient.createBomItem(bomPayload);
                  if (response.success && response.data) {
                    const bomItemData = response.data;
                    const selectedMaterial = bomMaterials.find(m => m.id?.toString() === newBom.materialId);

                    if (selectedMaterial && !bomItemData.material) {
                      bomItemData.material = selectedMaterial;
                    }

                    setBomItemsByItemId(prev => ({
                      ...prev,
                      [isBomModalOpen!]: [...(prev[isBomModalOpen!] || []), bomItemData]
                    }));
                    setNewBom({ materialId: '', qty: 1.0 });
                    setIsBomModalOpen(null);
                  } else {
                    setError(response.message || 'Gagal menambah BOM item');
                  }
                } catch (err) {
                  setError('Terjadi kesalahan saat menambah BOM item');
                  console.error('Error adding BOM item:', err);
                } finally {
                  setIsSaving(false);
                }
              }} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Baku</label>
                   <select required disabled={bomMaterialsLoading} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500 disabled:opacity-50" value={newBom.materialId} onChange={e => setNewBom({...newBom, materialId: e.target.value})}>
                      <option value="">{bomMaterialsLoading ? 'Memuat material...' : 'Cari Material...'}</option>
                      {bomMaterials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty per Satu Unit (Pcs/Set)</label>
                   <input required type="number" step="any" min="0" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" placeholder="1.5" value={newBom.qty} onChange={e => setNewBom({...newBom, qty: parseFloat(e.target.value) || 0})} />
                 </div>
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-sm">TAMBAH KE DAFTAR BOM</button>
              </form>
           </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tambah Item Pekerjaan</h2>
                <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X/></button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Item Pekerjaan</label>
                   <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" placeholder="e.g. Tiang Bracket" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ukuran</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" placeholder="200x50" value={newItem.dimensions} onChange={e => setNewItem({...newItem, dimensions: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tebal</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" placeholder="2mm" value={newItem.thickness} onChange={e => setNewItem({...newItem, thickness: e.target.value})} /></div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Satuan Produksi</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
                      {UNITS_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                 </div>
                 <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100 flex items-center justify-between">
                    <div><label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Qty Set</label><input type="number" min="1" className="w-20 p-3 rounded-xl font-black text-center shadow-lg border-none" value={newItem.qtySet} onChange={e => setNewItem({...newItem, qtySet: Number(e.target.value)})} /></div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Item</p>
                       <p className="text-3xl font-black text-blue-700">{(project?.total_qty ?? 0) * (newItem.qtySet || 1)}</p>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-sm">SIMPAN ITEM KE PROJECT</button>
              </form>
           </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tambah Tugas Produksi</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X/></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Item Pekerjaan</label>
                <select
                  required
                  value={newTask.item_id}
                  onChange={(e) => setNewTask({...newTask, item_id: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                >
                  <option value="">Pilih Item...</option>
                  {projectItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Proses Tahapan</label>
                <select
                  value={newTask.step}
                  onChange={(e) => setNewTask({...newTask, step: e.target.value as ProcessStep})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                >
                  <option value="POTONG">POTONG</option>
                  <option value="PLONG">PLONG</option>
                  <option value="PRESS">PRESS</option>
                  <option value="LAS">LAS</option>
                  <option value="WT">WT</option>
                  <option value="POWDER">POWDER</option>
                  <option value="PACKING">PACKING</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mesin Pelaksana</label>
                <select
                  required
                  disabled={machinesLoading}
                  value={newTask.machine_id}
                  onChange={(e) => setNewTask({...newTask, machine_id: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">{machinesLoading ? 'Memuat mesin...' : 'Pilih Mesin...'}</option>
                  {apiMachines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Kuantitas</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={newTask.target_qty}
                  onChange={(e) => setNewTask({...newTask, target_qty: Number(e.target.value)})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Qty Selesai</label>
                  <input
                    type="number"
                    min="0"
                    value={newTask.completed_qty}
                    onChange={(e) => setNewTask({...newTask, completed_qty: Number(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Qty Reject</label>
                  <input
                    type="number"
                    min="0"
                    value={newTask.defect_qty}
                    onChange={(e) => setNewTask({...newTask, defect_qty: Number(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Awal</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value as any})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DOWNTIME">DOWNTIME</option>
                </select>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-sm hover:bg-blue-700 disabled:opacity-50 transition-all">SIMPAN TUGAS PRODUKSI</button>
            </form>
          </div>
        </div>
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
    </div>
  );
};
