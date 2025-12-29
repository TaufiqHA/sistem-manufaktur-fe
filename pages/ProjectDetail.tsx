import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus, Trash2, X, Box, Layers, Settings2, Component, ArrowRight, Info, Lock, Save, Trash, AlertCircle, TrendingUp, CheckCircle2, ChevronLeft, Target, Clock, Hammer, Calendar, ClipboardList
} from 'lucide-react';
import { RAW_STEPS, ASSEMBLY_STEPS, ALL_STEPS, ProcessStep, ItemStepConfig, Project, ProjectItem } from '../types';
import { apiClient } from '../lib/api';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines, materials, tasks, logs, addProjectItem, deleteProjectItem, validateWorkflow, addSubAssembly, deleteSubAssembly, lockSubAssembly } = useStore();

  // Ensure these are always available as fallback
  const steps = RAW_STEPS || ALL_STEPS || [];
  const assemblySteps = ASSEMBLY_STEPS || ALL_STEPS || [];

  // API data state
  const [project, setProject] = useState<Project | null>(null);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [apiMachines, setApiMachines] = useState<any[]>([]);
  const [apiMaterials, setApiMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState<string | null>(null);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState<string | null>(null);
  const [logDetailSa, setLogDetailSa] = useState<{id: string, name: string} | null>(null);
  const [saProductionLogs, setSaProductionLogs] = useState<any[]>([]);

  const [newItem, setNewItem] = useState({ name: '', dimensions: '', thickness: '', qtySet: 1, qtyPerProduct: 1, unit: 'PCS', flowType: 'NEW' as 'OLD' | 'NEW' });
  const [newSub, setNewSub] = useState({ name: '', qtyPerParent: 1, materialId: '', processes: [] as ProcessStep[] });
  const [workflowConfig, setWorkflowConfig] = useState<ItemStepConfig[]>([]);

  // Fetch project data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Project ID tidak valid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch project detail
        const projectRes = await apiClient.getProject(id);
        if (!projectRes.success || !projectRes.data) {
          setError('Project tidak ditemukan');
          setProject(null);
          setProjectItems([]);
          setLoading(false);
          return;
        }

        const projectData = projectRes.data as any;
        // Transform API response to Project type
        const transformedProject: Project = {
          id: String(projectData.id),
          code: projectData.code,
          name: projectData.name,
          customer: projectData.customer,
          startDate: projectData.start_date,
          deadline: projectData.deadline,
          status: projectData.status,
          progress: projectData.progress,
          qtyPerUnit: projectData.qty_per_unit,
          procurementQty: projectData.procurement_qty,
          totalQty: projectData.total_qty,
          unit: projectData.unit,
          isLocked: projectData.is_locked,
        };
        setProject(transformedProject);

        // Fetch tasks and production logs for this project
        const tasksRes = await apiClient.getTasks(1, 1000, { project_id: id });
        const logsRes = await apiClient.getProductionLogsByProject(id, 1, 1000, { type: 'OUTPUT' });

        const projectTasksMap: Record<string, any[]> = {};
        let tasksList: any[] = [];
        if (tasksRes.success && tasksRes.data) {
          tasksList = (tasksRes.data as any).data || [];
          tasksList.forEach((task: any) => {
            const itemId = String(task.item_id);
            if (!projectTasksMap[itemId]) {
              projectTasksMap[itemId] = [];
            }
            projectTasksMap[itemId].push(task);
          });
        }
        setProjectTasks(tasksList);

        // Process production logs for sub-assembly stepStats
        const productionLogsBySubAssembly: Record<string, Record<string, { produced: number; available: number }>> = {};
        if (logsRes.success && logsRes.data) {
          const logsList = (logsRes.data as any).data || [];
          logsList.forEach((log: any) => {
            const saKey = String(log.item_id); // Assuming item_id refers to sub-assembly
            const step = log.step;

            if (!productionLogsBySubAssembly[saKey]) {
              productionLogsBySubAssembly[saKey] = {};
            }

            if (!productionLogsBySubAssembly[saKey][step]) {
              productionLogsBySubAssembly[saKey][step] = { produced: 0, available: 0 };
            }

            productionLogsBySubAssembly[saKey][step].produced += log.good_qty || 0;
          });
        }

        // Fetch project items
        const itemsRes = await apiClient.getProjectItemsByProjectId(id);
        if (itemsRes.success && itemsRes.data) {
          const transformedItems: ProjectItem[] = (itemsRes.data as any).map((item: any) => {
            // Initialize assemblyStats based on fetched tasks
            const assemblyStats: Record<any, { produced: number; available: number }> = {};
            const itemTasks = projectTasksMap[String(item.id)] || [];

            assemblySteps.forEach(step => {
              const taskForStep = itemTasks.find((t: any) => t.step === step);
              assemblyStats[step] = {
                produced: taskForStep?.completed_qty || 0,
                available: (taskForStep?.target_qty - taskForStep?.completed_qty) || 0
              };
            });

            return {
              id: String(item.id),
              projectId: String(item.project_id),
              name: item.name,
              dimensions: item.dimensions,
              thickness: item.thickness,
              qtySet: item.qty_set,
              quantity: item.quantity,
              unit: item.unit,
              isBomLocked: item.is_bom_locked || false,
              isWorkflowLocked: item.is_workflow_locked || false,
              bom: [],
              workflow: item.workflow || [],
              warehouseQty: 0,
              shippedQty: 0,
              flowType: 'NEW' as const,
              subAssemblies: [],
              assemblyStats,
            } as ProjectItem;
          });
          setProjectItems(transformedItems);

          // Fetch sub-assemblies for all items
          for (const item of transformedItems) {
            try {
              const subAsRes = await apiClient.getSubAssembliesByProjectItem(item.id);
              if (subAsRes.success && subAsRes.data) {
                const subAssemblies = (subAsRes.data as any).map((sa: any) => {
                  // Merge API stepStats with production log data
                  const apiStepStats = sa.step_stats || {};
                  const logStepStats = productionLogsBySubAssembly[String(sa.id)] || {};

                  // Combine both sources: production logs take precedence
                  const mergedStepStats: Record<string, { produced: number; available: number }> = {};
                  const allSteps = new Set([...Object.keys(apiStepStats), ...Object.keys(logStepStats)]);

                  allSteps.forEach(step => {
                    mergedStepStats[step] = logStepStats[step] || apiStepStats[step] || { produced: 0, available: 0 };
                  });

                  return {
                    id: String(sa.id),
                    itemId: String(sa.item_id),
                    name: sa.name,
                    qtyPerParent: sa.qty_per_parent,
                    materialId: String(sa.material_id),
                    processes: Array.isArray(sa.processes) ? sa.processes : Object.values(sa.processes),
                    totalNeeded: sa.total_needed,
                    completedQty: sa.completed_qty,
                    totalProduced: sa.total_produced,
                    consumedQty: sa.consumed_qty,
                    stepStats: mergedStepStats,
                    isLocked: sa.is_locked,
                  };
                });

                setProjectItems(prev => prev.map(i => i.id === item.id ? {...i, subAssemblies} : i));
              }
            } catch (err) {
              console.error(`Error fetching sub-assemblies for item ${item.id}:`, err);
            }
          }
        }
        // Fetch machines from API
        try {
          const machinesRes = await apiClient.getMachines();
          if (machinesRes.success && machinesRes.data) {
            // API returns { data: MachineData[] }
            const machinesData = Array.isArray(machinesRes.data) ? machinesRes.data : (machinesRes.data as any).data || [];
            console.log('Fetched machines from API:', machinesData);
            setApiMachines(machinesData);
          } else {
            console.warn('Failed to fetch machines:', machinesRes.message);
            setApiMachines([]);
          }
        } catch (err) {
          console.error('Error fetching machines:', err);
          setApiMachines([]);
        }

        // Fetch materials from API
        try {
          const materialsRes = await apiClient.getMaterials();
          if (materialsRes.success && materialsRes.data) {
            // API returns { data: MaterialData[] }
            const materialsData = Array.isArray(materialsRes.data) ? materialsRes.data : (materialsRes.data as any).data || [];
            console.log('Fetched materials from API:', materialsData);
            setApiMaterials(materialsData);
          } else {
            console.warn('Failed to fetch materials:', materialsRes.message);
            setApiMaterials([]);
          }
        } catch (err) {
          console.error('Error fetching materials:', err);
          setApiMaterials([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const stats = useMemo(() => {
    const totalTarget = project?.totalQty || 0;
    const completed = projectTasks.filter(t => t.step === 'PACKING').reduce((acc, t) => acc + t.completed_qty, 0);
    const progress = totalTarget > 0 ? (completed / totalTarget) * 100 : 0;
    return { totalTarget, completed, progress };
  }, [id, projectTasks, project]);

  // Show loading state
  if (loading) {
    return <div className="p-10 text-center font-bold text-slate-400 font-sans">Memuat data project...</div>;
  }

  // Show error state
  if (error || !project) {
    return <div className="p-10 text-center font-bold text-slate-400 font-sans">Project Tidak Ditemukan</div>;
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name || !newItem.dimensions || !newItem.thickness) {
      alert('Lengkapi semua field: Nama Item, Dimensi, dan Ketebalan');
      return;
    }

    if (newItem.qtySet < 1) {
      alert('Qty/Set harus minimal 1');
      return;
    }

    try {
      if (!project) {
        alert('Project tidak ditemukan');
        return;
      }

      const quantity = project.totalQty * newItem.qtySet;
      const totalRequiredQty = newItem.qtyPerProduct * quantity;

      const res = await apiClient.createProjectItem({
        project_id: project.id,
        name: newItem.name,
        dimensions: newItem.dimensions,
        thickness: newItem.thickness,
        qty_set: newItem.qtySet,
        qty_per_product: newItem.qtyPerProduct,
        total_required_qty: totalRequiredQty,
        quantity: quantity,
        unit: newItem.unit || 'PCS',
        is_bom_locked: false,
        is_workflow_locked: false,
        workflow: [],
        bom: [],
      });

      if (res.success && res.data) {
        // Initialize assemblyStats for all steps
        const assemblyStats: Record<any, { produced: number; available: number }> = {};
        assemblySteps.forEach(step => {
          assemblyStats[step] = { produced: 0, available: 0 };
        });

        const newProjectItem: ProjectItem = {
          id: String(res.data.id),
          projectId: String(res.data.project_id),
          name: res.data.name,
          dimensions: res.data.dimensions,
          thickness: res.data.thickness,
          qtySet: res.data.qty_set,
          quantity: res.data.quantity,
          unit: res.data.unit,
          isBomLocked: res.data.is_bom_locked || false,
          isWorkflowLocked: res.data.is_workflow_locked || false,
          bom: [],
          workflow: res.data.workflow || [],
          warehouseQty: 0,
          shippedQty: 0,
          flowType: newItem.flowType,
          subAssemblies: [],
          assemblyStats,
        };

        setProjectItems(prev => [...prev, newProjectItem]);
        setNewItem({ name: '', dimensions: '', thickness: '', qtySet: 1, qtyPerProduct: 1, unit: 'PCS', flowType: 'NEW' });
        setIsItemModalOpen(false);
      } else {
        alert(`Gagal menambahkan item: ${res.message || 'Kesalahan server'}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
    }
  };

  const handleAddSub = async (itemId: string) => {
    if (!newSub.name || !newSub.materialId || newSub.processes.length === 0) {
       alert("Lengkapi Nama, Material, dan Tahapan Proses!");
       return;
    }

    try {
      const item = projectItems.find(i => i.id === itemId);
      const totalNeeded = (item?.quantity || 0) * newSub.qtyPerParent;

      // Transform processes array to match API format if needed
      const processesObj: Record<string, string> = {};
      newSub.processes.forEach((process, index) => {
        processesObj[`process_${index + 1}`] = process;
      });

      const res = await apiClient.createSubAssembly({
        item_id: itemId,
        name: newSub.name,
        qty_per_parent: newSub.qtyPerParent,
        material_id: newSub.materialId,
        processes: JSON.stringify(newSub.processes),
        total_needed: totalNeeded,
        completed_qty: 0,
        total_produced: 0,
        consumed_qty: 0,
        step_stats: JSON.stringify({}),
        is_locked: false,
      });

      if (res.success && res.data) {
        // Add to local state
        const newSubAssembly = {
          id: String(res.data.id),
          itemId: String(res.data.item_id),
          name: res.data.name,
          qtyPerParent: res.data.qty_per_parent,
          materialId: String(res.data.material_id),
          processes: Array.isArray(res.data.processes) ? res.data.processes : Object.values(res.data.processes),
          totalNeeded: res.data.total_needed,
          completedQty: res.data.completed_qty,
          totalProduced: res.data.total_produced,
          consumedQty: res.data.consumed_qty,
          stepStats: res.data.step_stats || {},
          isLocked: res.data.is_locked,
        };

        setProjectItems(prev => prev.map(i =>
          i.id === itemId
            ? {...i, subAssemblies: [...(i.subAssemblies || []), newSubAssembly]}
            : i
        ));
        setNewSub({ name: '', qtyPerParent: 1, materialId: '', processes: [] });
      } else {
        alert(`Gagal menambahkan komponen: ${res.message || 'Kesalahan server'}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
    }
  };

  const startFlowConfig = (item: any) => {
    // Create default workflow from standard assembly steps
    const initialFlow: ItemStepConfig[] = ASSEMBLY_STEPS.map((step, idx) => ({
      step, sequence: idx + 1, allocations: [{ id: `alloc-${idx}`, machineId: '', targetQty: item.quantity }]
    }));

    // Use existing workflow from API if available, otherwise use default
    if (item.workflow && Array.isArray(item.workflow) && item.workflow.length > 0) {
      setWorkflowConfig([...item.workflow]);
    } else {
      setWorkflowConfig(initialFlow);
    }

    setIsFlowModalOpen(item.id);
  };

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-slate-900 rounded-[56px] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
          <div className="space-y-6">
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
               <ChevronLeft size={16}/> Kembali Ke Daftar
            </button>
            <div className="flex items-center gap-4">
               <span className="bg-blue-600 text-white px-4 py-1 rounded-xl font-black text-xs tracking-widest">{project.code}</span>
               <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight">{project.name}</h1>
            </div>
            <div className="flex flex-wrap gap-8 text-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400"><Target size={20}/></div>
                  <div><p className="text-[8px] font-black text-slate-500 uppercase">Pelanggan</p><p className="text-sm font-black">{project.customer}</p></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400"><Calendar size={20}/></div>
                  <div><p className="text-[8px] font-black text-slate-500 uppercase">Deadline</p><p className="text-sm font-black">{new Date(project.deadline).toLocaleDateString('id-ID')}</p></div>
               </div>
            </div>
          </div>
          <div className="w-full xl:w-96 bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
             <div className="flex justify-between items-end mb-4">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Progress Global Proyek</p>
                <p className="text-3xl font-black text-white">{Math.round(stats.progress)}%</p>
             </div>
             <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden mb-6">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${stats.progress}%`}} />
             </div>
             <div className="grid grid-cols-2 gap-4 text-center">
                <div><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Target</p><p className="text-lg font-black text-white">{stats.totalTarget} <span className="text-[10px]">{project.unit}</span></p></div>
                <div className="border-l border-white/10"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Aktual</p><p className="text-lg font-black text-emerald-400">{stats.completed} <span className="text-[10px]">{project.unit}</span></p></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4"><Layers className="text-blue-600"/> Item Kerja & Alur Produksi</h2>
         <button onClick={() => setIsItemModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black text-xs flex items-center gap-3 shadow-2xl hover:bg-blue-700 transition-all"><Plus size={20}/> TAMBAH ITEM</button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {projectItems.map((item, idx) => {
          const itemTasks = projectTasks.filter(t => t.item_id === String(item.id));
          const packingTask = itemTasks.find(t => t.step === 'PACKING');
          const finishedQty = packingTask?.completed_qty || 0;
          const globalItemPerc = item.quantity > 0 ? Math.round((finishedQty / item.quantity) * 100) : 0;

          return (
            <div key={item.id} className="bg-white rounded-[56px] border border-slate-100 shadow-xl overflow-hidden flex flex-col group transition-all">
              <div className="p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex gap-8 items-center flex-1">
                  <div className="w-20 h-20 bg-white border border-slate-200 rounded-[32px] flex items-center justify-center font-black text-slate-900 text-2xl shadow-sm">{globalItemPerc}%</div>
                  <div>
                      <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-6 mt-2">
                        <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest"><Box size={14} className="text-blue-500"/> {item.dimensions} | {item.thickness}</span>
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${item.flowType === 'NEW' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>ALUR {item.flowType === 'NEW' ? 'RAKITAN' : 'LANGSUNG'}</span>
                        <div className="flex items-center gap-4">
                           <span className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-widest"><Target size={14} className="text-blue-600"/> {item.quantity} Target</span>
                           <span className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest"><CheckCircle2 size={14}/> {finishedQty} Sudah Jadi</span>
                        </div>
                      </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                  {item.flowType === 'NEW' && (
                    <button onClick={async () => {
                      setNewSub({ name: '', qtyPerParent: 1, materialId: '', processes: [] });
                      try {
                        const subAsRes = await apiClient.getSubAssembliesByProjectItem(item.id);
                        if (subAsRes.success && subAsRes.data) {
                          const subAssemblies = (subAsRes.data as any).map((sa: any) => {
                            const mergedStepStats: Record<string, { produced: number; available: number }> = {};
                            const apiStepStats = sa.step_stats || {};
                            const allSteps = new Set(Object.keys(apiStepStats));
                            allSteps.forEach(step => {
                              mergedStepStats[step] = apiStepStats[step] || { produced: 0, available: 0 };
                            });
                            return {
                              id: String(sa.id),
                              itemId: String(sa.item_id),
                              name: sa.name,
                              qtyPerParent: sa.qty_per_parent,
                              materialId: String(sa.material_id),
                              processes: Array.isArray(sa.processes) ? sa.processes : Object.values(sa.processes),
                              totalNeeded: sa.total_needed,
                              completedQty: sa.completed_qty,
                              totalProduced: sa.total_produced,
                              consumedQty: sa.consumed_qty,
                              stepStats: mergedStepStats,
                              isLocked: sa.is_locked,
                            };
                          });
                          setProjectItems(prev => prev.map(i => i.id === item.id ? {...i, subAssemblies} : i));
                        }
                      } catch (err) {
                        console.error(`Error fetching sub-assemblies for item ${item.id}:`, err);
                      }
                      setIsSubModalOpen(item.id);
                    }} className="flex-1 bg-amber-500 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                      <Component size={20}/> MASTER RAKITAN
                    </button>
                  )}
                  <button onClick={() => startFlowConfig(item)} className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"><Settings2 size={20}/> FLOW ASSEMBLY</button>
                  <button onClick={() => deleteProjectItem(item.id)} className="p-5 text-slate-300 hover:text-red-500 rounded-3xl transition-all"><Trash2 size={24}/></button>
                </div>
              </div>

              {/* 1. MONITORING RAKITAN */}
              {item.flowType === 'NEW' && (
                <div className="p-10 pt-0 space-y-8">
                   <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-3"><Component size={14}/> MONITORING RAKITAN (BAHAN MENTAH)</h4>
                   <div className="border rounded-[40px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left text-xs min-w-[1000px]">
                       <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                         <tr>
                           <th className="px-8 py-5">Komponen</th>
                           <th className="px-8 py-5 text-center">Qty/Unit</th>
                           <th className="px-8 py-5 text-center">Total Perlu</th>
                           {steps.map(s => <th key={s} className="px-8 py-5 text-center">{s} <br/><span className="text-[8px] opacity-60">(Hasil / Sedia)</span></th>)}
                           <th className="px-8 py-5 text-center bg-emerald-50/50">Stok Jadi <br/><span className="text-[8px] opacity-60">(Siap Las)</span></th>
                           <th className="px-8 py-5 text-right">Aksi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y font-bold">
                         {(item.subAssemblies || []).map(sa => (
                           <tr key={sa.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6 uppercase font-black text-slate-900">{sa.name}</td>
                             <td className="px-8 py-6 text-center text-slate-400">{sa.qtyPerParent}</td>
                             <td className="px-8 py-6 text-center text-slate-900 font-black">{sa.totalNeeded}</td>
                             {steps.map((s) => {
                               const isIncluded = sa.processes.includes(s);
                               const stats = (sa.stepStats && sa.stepStats[s]) || { produced: 0, available: 0 };
                               const perc = sa.totalNeeded > 0 ? Math.round((stats.produced / sa.totalNeeded) * 100) : 0;
                               return (
                                 <td key={s} className="px-8 py-6 text-center">
                                   {isIncluded ? (
                                     <div className="flex flex-col items-center">
                                       <span className={`px-3 py-1 rounded-xl font-black text-[11px] bg-slate-100 text-slate-800 shadow-sm`}>{stats.produced} <span className="text-[8px] opacity-40 ml-1">{perc}%</span></span>
                                       <span className={`text-[10px] font-black mt-1 ${stats.available > 0 ? 'text-blue-600' : 'text-slate-300'}`}>Sedia: {stats.available}</span>
                                     </div>
                                   ) : '-'}
                                 </td>
                               );
                             })}
                             <td className="px-8 py-6 text-center text-emerald-600 font-black text-lg bg-emerald-50/20">{sa.completedQty}</td>
                             <td className="px-8 py-6 text-right">
                                <button onClick={async () => {
                                  try {
                                    const logsRes = await apiClient.getProductionLogs(1, 1000, { item_id: sa.id });
                                    if (logsRes.success && logsRes.data) {
                                      const logsList = (logsRes.data as any).data || [];
                                      setSaProductionLogs(logsList);
                                    }
                                    setLogDetailSa({id: sa.id, name: sa.name});
                                  } catch (err) {
                                    console.error('Error fetching logs:', err);
                                    setLogDetailSa({id: sa.id, name: sa.name});
                                  }
                                }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                                   <ClipboardList size={18}/>
                                </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}

              {/* 2. MONITORING ASSEMBLY */}
              <div className="px-10 pb-10 space-y-8">
                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3"><Hammer size={14}/> MONITORING ALUR ASSEMBLY (BARANG JADI)</h4>
                 <div className="border rounded-[40px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                   <table className="w-full text-left text-xs min-w-[800px]">
                     <thead className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest">
                       <tr>
                         <th className="px-8 py-5">Nama Item</th>
                         <th className="px-8 py-5 text-center">Total Target</th>
                         {assemblySteps.map(s => <th key={s} className="px-8 py-5 text-center">{s} <br/><span className="text-[8px] opacity-60">(Hasil / Sedia)</span></th>)}
                         <th className="px-8 py-5 text-right">Log</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y font-bold">
                        <tr className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-6 uppercase font-black text-slate-900">{item.name}</td>
                           <td className="px-8 py-6 text-center text-slate-900">{item.quantity}</td>
                           {assemblySteps.map(s => {
                              const stats = item.assemblyStats?.[s] || { produced: 0, available: 0 };
                              const perc = item.quantity > 0 ? Math.round((stats.produced / item.quantity) * 100) : 0;
                              return (
                                <td key={s} className="px-8 py-6 text-center">
                                   <div className="flex flex-col items-center">
                                      <span className="px-3 py-1 rounded-xl font-black text-[11px] bg-blue-50 text-blue-600 shadow-sm">{stats.produced} <span className="text-[8px] opacity-40 ml-1">{perc}%</span></span>
                                      <span className={`text-[10px] font-black mt-1 ${stats.available > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>Sedia: {stats.available}</span>
                                   </div>
                                </td>
                              );
                           })}
                           <td className="px-8 py-6 text-right">
                              <button onClick={async () => {
                                try {
                                  const logsRes = await apiClient.getProductionLogs(1, 1000, { item_id: item.id });
                                  if (logsRes.success && logsRes.data) {
                                    const logsList = (logsRes.data as any).data || [];
                                    setSaProductionLogs(logsList);
                                  }
                                  setLogDetailSa({id: item.id, name: item.name});
                                } catch (err) {
                                  console.error('Error fetching logs:', err);
                                  setLogDetailSa({id: item.id, name: item.name});
                                }
                              }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                                 <ClipboardList size={18}/>
                              </button>
                           </td>
                        </tr>
                     </tbody>
                   </table>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assemblySteps
                       .filter(step => {
                          const task = itemTasks.find(t => t.step === step);
                          const workflowStep = item.workflow?.find(config => config.step === step);
                          const hasMachines = workflowStep?.machineIds && workflowStep.machineIds.length > 0;
                          return task || hasMachines;
                       })
                       .map(step => {
                          const task = itemTasks.find(t => t.step === step);
                          const completedQty = task?.completed_qty || 0;
                          const targetQty = task?.target_qty || item.quantity;
                          const perc = targetQty > 0 ? Math.round((completedQty / targetQty) * 100) : 0;
                          return (
                             <div key={step} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step}</span>
                                   <span className={`text-xs font-black ${perc === 100 ? 'text-emerald-500' : 'text-blue-600'}`}>{perc}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full transition-all duration-700 ${perc === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${perc}%`}} />
                                </div>
                                <div className="flex justify-between items-end">
                                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Input</p><p className="text-xl font-black text-slate-900">{completedQty}</p></div>
                                   <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Target</p><p className="text-sm font-black text-slate-500">{targetQty}</p></div>
                                </div>
                             </div>
                          );
                       })}
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL LOG RIWAYAT */}
      {logDetailSa && (
        <div className="fixed inset-0 bg-slate-950/90 z-[600] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
              <div className="p-12 border-b bg-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase">Riwayat Input: {logDetailSa.name}</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase mt-2">Log PIC & Waktu Pengerjaan</p>
                 </div>
                 <button onClick={() => setLogDetailSa(null)} className="p-4 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
              </div>
              <div className="p-12 overflow-y-auto custom-scrollbar space-y-4">
                 {logs.filter(l => l.itemId === logDetailSa.id).length > 0 ? (
                   logs.filter(l => l.itemId === logDetailSa.id).map(log => (
                     <div key={log.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex justify-between items-center">
                        <div className="flex gap-6 items-center">
                           <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100"><Clock size={28}/></div>
                           <div>
                              <p className="text-slate-800 font-black text-sm uppercase">PROSES: {log.step}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">PIC: {log.operator} | {new Date(log.timestamp).toLocaleString('id-ID')}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-emerald-600 leading-none">+{log.goodQty}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Dihasilkan</p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center text-slate-300 font-black italic uppercase">Belum ada riwayat.</div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL MASTER RAKITAN */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-[500] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
              <div className="p-12 border-b flex justify-between items-center bg-slate-50">
                 <div><h2 className="text-3xl font-black text-slate-900 uppercase">Konfigurasi Rakitan</h2><p className="text-[10px] font-black text-blue-600 uppercase mt-2">Daftar Komponen & Alur Bahan Mentah</p></div>
                 <button onClick={() => {
                   setIsSubModalOpen(null);
                   setNewSub({ name: '', qtyPerParent: 1, materialId: '', processes: [] });
                 }} className="p-4 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
              </div>
              <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-100 p-10 rounded-[48px] border-2 border-white shadow-inner">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">NAMA KOMPONEN</label>
                       <input className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-100" placeholder="e.g. TIANG UTAMA" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">MATERIAL</label>
                       <select className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black outline-none" value={newSub.materialId} onChange={e => setNewSub({...newSub, materialId: e.target.value})}>
                          <option value="">Pilih...</option>
                          {apiMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">QTY / UNIT JADI</label>
                       <input type="number" className="w-full p-5 bg-white border border-slate-200 rounded-[28px] font-black outline-none text-center" value={newSub.qtyPerParent} onChange={e => setNewSub({...newSub, qtyPerParent: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-4 md:col-span-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-4">ALUR PROSES RAKITAN</label>
                       <div className="flex flex-wrap gap-4 p-6 bg-white rounded-[32px] border border-slate-200">
                          {steps.map((s, idx) => {
                            const isAdded = newSub.processes.includes(s);
                            return (
                              <button key={s} onClick={() => setNewSub(p => ({...p, processes: isAdded ? p.processes.filter(x => x !== s) : [...p.processes, s]}))} className={`px-8 py-4 rounded-[20px] border-2 font-black text-xs uppercase transition-all flex items-center gap-3 ${isAdded ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}>
                                <span className="opacity-50">{idx + 1}.</span> {s}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                    <button onClick={() => handleAddSub(isSubModalOpen!)} className="md:col-span-4 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4"><Save size={20}/> TAMBAHKAN KE RAKITAN</button>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Hammer size={14}/> KOMPONEN TERDAFTAR</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {projectItems.find(i => i.id === isSubModalOpen)?.subAssemblies?.map(sa => (
                         <div key={sa.id} className="bg-white border-2 border-slate-50 p-8 rounded-[40px] flex justify-between items-center shadow-sm hover:border-blue-200 transition-all">
                            <div className="space-y-2">
                               <p className="font-black text-slate-900 uppercase text-lg">{sa.name}</p>
                               <div className="flex items-center gap-4">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 bg-slate-50 rounded-lg">{sa.qtyPerParent} PCS / UNIT</span>
                                  <div className="flex gap-1">{sa.processes.map((p, i) => (<span key={i} className="text-[8px] font-black text-blue-600 uppercase border border-blue-100 px-2 py-0.5 rounded-lg">{p}</span>))}</div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               {!sa.isLocked ? (<button onClick={async () => {
                                 try {
                                   const res = await apiClient.updateSubAssembly(sa.id, { is_locked: true });
                                   if (res.success) {
                                     setProjectItems(prev => prev.map(i =>
                                       i.id === isSubModalOpen
                                         ? {...i, subAssemblies: i.subAssemblies?.map(s => s.id === sa.id ? {...s, isLocked: true} : s)}
                                         : i
                                     ));
                                   } else {
                                     alert(`Gagal mengunci: ${res.message || 'Kesalahan server'}`);
                                   }
                                 } catch (err) {
                                   alert(`Error: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
                                 }
                               }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><Lock size={20}/></button>) : (<div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg"><Lock size={20}/></div>)}
                               <button onClick={async () => {
                                 if (!confirm('Apakah Anda yakin ingin menghapus komponen ini?')) return;
                                 try {
                                   const res = await apiClient.deleteSubAssembly(sa.id);
                                   if (res.success) {
                                     setProjectItems(prev => prev.map(i =>
                                       i.id === isSubModalOpen
                                         ? {...i, subAssemblies: i.subAssemblies?.filter(s => s.id !== sa.id)}
                                         : i
                                     ));
                                   } else {
                                     alert(`Gagal menghapus: ${res.message || 'Kesalahan server'}`);
                                   }
                                 } catch (err) {
                                   alert(`Error: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
                                 }
                               }} className="p-4 bg-red-50 text-red-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash size={20}/></button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL FLOW ASSEMBLY */}
      {isFlowModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-[500] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
              <div className="p-12 border-b flex justify-between items-center bg-slate-50">
                 <div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Setting Flow Assembly</h2><p className="text-[10px] font-black text-blue-600 uppercase mt-2">Alokasi Mesin & Station Kerja Utama</p></div>
                 <button onClick={() => setIsFlowModalOpen(null)} className="p-4 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
              </div>
              <div className="p-12 overflow-y-auto space-y-6 custom-scrollbar">
                 {workflowConfig.map((config, idx) => (
                   <div key={idx} className="bg-white border-2 border-slate-50 p-8 rounded-[40px] flex flex-col sm:flex-row items-center justify-between gap-8 group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-8"><div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-xl shadow-xl group-hover:bg-blue-600 transition-all">{idx + 1}</div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROSES UTAMA</p><p className="text-2xl font-black text-slate-900">{config.step}</p></div></div>
                      <div className="w-full sm:w-80">
                         <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] font-black outline-none transition-all appearance-none" value={config.allocations?.[0]?.machineId || ''} onChange={(e) => {
                            const newFlow = [...workflowConfig];
                            if (!newFlow[idx].allocations) newFlow[idx].allocations = [];
                            if (!newFlow[idx].allocations[0]) newFlow[idx].allocations[0] = { id: `alloc-${idx}`, machineId: '', targetQty: 0 };
                            newFlow[idx].allocations[0].machineId = e.target.value;
                            setWorkflowConfig(newFlow);
                         }}>
                            <option value="">Pilih Mesin / Station...</option>
                            {apiMachines.length > 0 ? (
                              apiMachines.filter(m => m.type === config.step).map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                              ))
                            ) : (
                              <option value="" disabled>Memuat mesin...</option>
                            )}
                         </select>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-12 border-t flex justify-end">
                 <button onClick={async () => {
                   // Convert allocations to machineIds format for API
                   const transformedWorkflow = workflowConfig.map(step => ({
                     ...step,
                     machineIds: step.allocations?.map(a => a.machineId).filter(Boolean) || []
                   }));

                   // Update item workflow via API
                   if (isFlowModalOpen) {
                     try {
                       const itemId = isFlowModalOpen;
                       const updateRes = await apiClient.updateProjectItem(itemId, { workflow: transformedWorkflow });

                       if (updateRes.success) {
                         // Also validate with Zustand for task creation
                         validateWorkflow(itemId, transformedWorkflow);

                         // Create tasks via API
                         const selectedItem = projectItems.find(i => i.id === itemId);
                         if (selectedItem && project) {
                           for (const step of transformedWorkflow) {
                             for (const machineId of step.machineIds) {
                               const machineData = apiMachines.find(m => String(m.id) === String(machineId));
                               if (machineData) {
                                 await apiClient.createTask({
                                   project_id: project.id,
                                   project_name: project.name,
                                   item_id: itemId,
                                   item_name: selectedItem.name,
                                   step: step.step,
                                   machine_id: machineId,
                                   target_qty: selectedItem.quantity,
                                   completed_qty: 0,
                                   defect_qty: 0,
                                   status: 'PENDING'
                                 });
                               }
                             }
                           }
                         }

                         setIsFlowModalOpen(null);
                         alert('Workflow berhasil diterbitkan dan tugas telah dibuat');
                       } else {
                         alert('Gagal menyimpan workflow: ' + updateRes.message);
                       }
                     } catch (err) {
                       console.error('Error publishing workflow:', err);
                       alert('Error: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan'));
                     }
                   }
                 }} className="px-16 py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:bg-emerald-600 transition-all active:scale-95"><Save size={24}/> TERBITKAN SEMUA TUGAS</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL INPUT ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[56px] w-full max-w-xl shadow-2xl animate-in zoom-in-95">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50">
                 <h2 className="text-2xl font-black text-slate-900 uppercase">Input Item Baru</h2>
                 <button onClick={() => setIsItemModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={handleAddItem} className="p-12 space-y-8">
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gunakan Alur</label><div className="flex bg-slate-100 p-2 rounded-[24px]"><button type="button" onClick={() => setNewItem({...newItem, flowType: 'OLD'})} className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${newItem.flowType === 'OLD' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>DIRECT (LAMA)</button><button type="button" onClick={() => setNewItem({...newItem, flowType: 'NEW'})} className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${newItem.flowType === 'NEW' ? 'bg-white text-amber-600 shadow-xl' : 'text-slate-400'}`}>RAKITAN (BARU)</button></div></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Item Jadi</label><input required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black uppercase outline-none" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="TIANG GONDOLA DOUBLE" /></div>
                 <div className="grid grid-cols-3 gap-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Dimensi</label><input required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black outline-none" value={newItem.dimensions} onChange={e => setNewItem({...newItem, dimensions: e.target.value})} placeholder="2000x50x50" /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Ketebalan</label><input required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black outline-none" value={newItem.thickness} onChange={e => setNewItem({...newItem, thickness: e.target.value})} placeholder="5mm" /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Qty / Set</label><input type="number" required className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[28px] font-black outline-none" value={newItem.qtySet} onChange={e => setNewItem({...newItem, qtySet: Number(e.target.value)})} /></div></div>
                 <button type="submit" className="w-full py-7 bg-blue-600 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">SIMPAN ITEM KERJA</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
