
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Plus, Trash2, Lock, Unlock, X, Box, CheckCircle, Calendar, Clock, Layers, TrendingUp, ArrowRight, Settings2, Info, LayoutList, RefreshCcw, Save, Search, Hammer, ChevronRight, Activity
} from 'lucide-react';
import { ALL_STEPS, ItemStepConfig, ProcessStep } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UNITS_LIST = ['PCS', 'SET', 'UNIT', 'BOX', 'KG', 'LEMBAR', 'ROLL', 'METER'];

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    projects, items, tasks, machines, materials,
    addProjectItem, deleteProjectItem, addBomItem, deleteBomItem, lockBom, validateWorkflow, unlockWorkflow 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TASKS'>('ITEMS');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', dimensions: '', thickness: '', qtySet: 1, unit: 'PCS' });
  const [isBomModalOpen, setIsBomModalOpen] = useState<string | null>(null);
  const [newBom, setNewBom] = useState({ materialId: '', qty: 1 });
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<string | null>(null);
  const [workflowConfig, setWorkflowConfig] = useState<ItemStepConfig[]>([]);
  const [viewStepDetail, setViewStepDetail] = useState<{itemId: string, step: ProcessStep} | null>(null);

  const project = projects.find(p => p.id === id);
  const projectItems = items.filter(i => i.projectId === id);
  const projectTasks = tasks.filter(t => t.projectId === id);

  const daysLeft = useMemo(() => {
    if (!project) return 0;
    const diff = new Date(project.deadline).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [project]);

  const sCurveData = useMemo(() => [
    { day: 'Sen', actual: 20, plan: 15 },
    { day: 'Sel', actual: 45, plan: 35 },
    { day: 'Rab', actual: 50, plan: 55 },
    { day: 'Kam', actual: 65, plan: 75 },
    { day: 'Jum', actual: 80, plan: 90 },
  ], []);

  if (!project) return <div className="p-10 text-center font-bold text-slate-400">Project Not Found</div>;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addProjectItem({
      ...newItem,
      id: `item-${Date.now()}`,
      projectId: project.id,
      quantity: project.totalQty * newItem.qtySet, 
      isBomLocked: false,
      isWorkflowLocked: false,
      bom: [],
      workflow: []
    } as any);
    setIsItemModalOpen(false);
  };

  const startWorkflowConfig = (item: any) => {
    setWorkflowConfig(item.workflow.length > 0 ? item.workflow : ALL_STEPS.map((s, idx) => ({ step: s, sequence: idx + 1, allocations: [] })));
    setIsConfigModalOpen(item.id);
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
                <p className="font-black text-slate-700 text-xl">{project.totalQty} {project.unit}</p>
            </div>
            <div className="bg-emerald-50 px-6 py-3 rounded-[24px] border border-emerald-100">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Produk Selesai (QC)</p>
                <p className="font-black text-emerald-600 text-xl">
                  {projectTasks.filter(t => t.step === 'QC').reduce((acc, t) => acc + t.completedQty, 0)} {project.unit}
                </p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-72 bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all duration-700"><TrendingUp size={80}/></div>
           <div className="flex justify-between items-end mb-4 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sisa {daysLeft} Hari</span>
              <span className="text-3xl font-black">{project.progress}%</span>
           </div>
           <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
              <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${project.progress}%`}} />
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
          <LayoutList size={18}/> Tugas Produksi <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px] ml-1">{projectTasks.length}</span>
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
            const completedQtyAtQC = tasks.filter(t => t.itemId === item.id && t.step === 'QC').reduce((acc, t) => acc + t.completedQty, 0);
            const itemTotalSteps = ALL_STEPS.length;
            const itemOverallProgress = item.quantity > 0 ? Math.round((tasks.filter(t => t.itemId === item.id && t.status === 'COMPLETED').length / (item.workflow.length || 1)) * 100) : 0;

            return (
              <div key={item.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-500">
                <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-10 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <div className="flex gap-8 items-center flex-1">
                    <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-[24px] flex items-center justify-center font-black text-slate-400 text-2xl shadow-sm">{idx + 1}</div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{item.name}</h3>
                        {item.isWorkflowLocked ? (
                          <button onClick={() => unlockWorkflow(item.id)} className="bg-emerald-100 text-emerald-600 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" title="Unlock for Edit"><Lock size={18} /></button>
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
                      <p className="text-2xl font-black text-white">{item.quantity}</p>
                    </div>
                    <div className="text-center bg-emerald-500 px-8 py-3 rounded-2xl shadow-xl shadow-emerald-100">
                      <p className="text-[10px] font-black text-emerald-100 uppercase mb-1">Sudah Jadi</p>
                      <p className="text-2xl font-black text-white">{completedQtyAtQC}</p>
                    </div>
                    <div className="flex gap-3 ml-4">
                      {!item.isBomLocked ? (
                        <button onClick={() => setIsBomModalOpen(item.id)} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2"><Hammer size={16}/> Kelola BOM</button>
                      ) : !item.isWorkflowLocked ? (
                        <button onClick={() => startWorkflowConfig(item)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Settings2 size={16}/> Set Alur Mesin</button>
                      ) : (
                        <div className="bg-emerald-100 text-emerald-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><CheckCircle size={16}/> Item Valid</div>
                      )}
                      <button onClick={() => deleteProjectItem(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                    </div>
                  </div>
                </div>

                {/* MATERIAL BOM SECTION */}
                <div className="px-10 py-8 border-b border-slate-50">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                            <Box size={14} className="text-blue-500"/> Manajemen Material BOM
                        </h4>
                        {!item.isBomLocked && <button onClick={() => setIsBomModalOpen(item.id)} className="text-[10px] font-black text-blue-600 uppercase">+ Input Material</button>}
                        {item.bom.length > 0 && !item.isBomLocked && <button onClick={() => lockBom(item.id)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Kunci BOM</button>}
                    </div>
                    <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                        <table className="w-full text-xs text-left">
                           <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                             <tr>
                               <th className="px-6 py-4">Bahan Baku</th>
                               <th className="px-6 py-4 text-center">Satuan / Unit</th>
                               <th className="px-6 py-4 text-center">Total Kebutuhan</th>
                               <th className="px-6 py-4 text-center text-emerald-600">Realisasi (POTONG)</th>
                               {!item.isBomLocked && <th className="px-6 py-4 text-right">Aksi</th>}
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                             {item.bom.map(b => {
                               const m = materials.find(mat => mat.id === b.materialId);
                               return (
                                 <tr key={b.id} className="hover:bg-slate-50/50">
                                   <td className="px-6 py-4">
                                      <p className="text-slate-900 font-black">{m?.name}</p>
                                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{m?.code}</p>
                                   </td>
                                   <td className="px-6 py-4 text-center">{b.quantityPerUnit} <span className="text-[9px] text-slate-400">{m?.unit}</span></td>
                                   <td className="px-6 py-4 text-center font-black text-slate-900 text-base">{b.totalRequired} <span className="text-[9px] text-slate-400">{m?.unit}</span></td>
                                   <td className="px-6 py-4 text-center font-black text-emerald-600 text-base">{b.realized} <span className="text-[9px] text-emerald-400">{m?.unit}</span></td>
                                   {!item.isBomLocked && <td className="px-6 py-4 text-right"><button onClick={() => deleteBomItem(item.id, b.id)} className="text-red-400 p-2"><Trash2 size={16}/></button></td>}
                                 </tr>
                               );
                             })}
                             {item.bom.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-300 italic font-bold">Input BOM terlebih dahulu untuk mengunci data material.</td></tr>}
                           </tbody>
                        </table>
                    </div>
                </div>

                {/* INTERACTIVE FLOW SECTION */}
                <div className="p-10 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                           <Activity size={14} className="text-blue-500"/> Alur Proses Manufaktur (Klik Tiap Step Untuk Detail)
                       </h4>
                       {!item.isWorkflowLocked && item.isBomLocked && (
                           <button onClick={() => startWorkflowConfig(item)} className="bg-white text-slate-900 border border-slate-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all">Konfigurasi Alur</button>
                       )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative">
                      {ALL_STEPS.map((step, sIdx) => {
                        const stepTasks = tasks.filter(t => t.itemId === item.id && t.step === step);
                        const good = stepTasks.reduce((acc, t) => acc + t.completedQty, 0);
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
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                 <tr>
                    <th className="px-8 py-5">Item Pekerjaan</th>
                    <th className="px-8 py-5">Proses Tahapan</th>
                    <th className="px-8 py-5">Mesin Pelaksana</th>
                    <th className="px-8 py-5 text-center">Target</th>
                    <th className="px-8 py-5 text-center">Aktual Selesai</th>
                    <th className="px-8 py-5 text-center">Status Kerja</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                 {projectTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                       <td className="px-8 py-5">
                          <p className="text-slate-800 font-black">{task.itemName}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">Batch: {task.id.split('-').pop()}</p>
                       </td>
                       <td className="px-8 py-5"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">{task.step}</span></td>
                       <td className="px-8 py-5 text-slate-600 font-bold">{machines.find(m => m.id === task.machineId)?.name}</td>
                       <td className="px-8 py-5 text-center font-black text-slate-800">{task.targetQty}</td>
                       <td className="px-8 py-5 text-center font-black text-blue-600">{task.completedQty}</td>
                       <td className="px-8 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{task.status}</span>
                       </td>
                    </tr>
                 ))}
                 {projectTasks.length === 0 && (
                    <tr><td colSpan={6} className="py-20 text-center text-slate-300 italic font-bold text-lg">Gunakan tab Item Pekerjaan untuk mengatur alur mesin & memulai tugas produksi.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
      )}

      {/* STEP DETAIL VIEW (WHEN CLICKING FLOW 1-7) */}
      {viewStepDetail && (
         <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
            <div className="bg-white rounded-[48px] w-full max-w-4xl p-12 space-y-10 shadow-2xl animate-in fade-in zoom-in-95">
               <div className="flex justify-between items-center border-b pb-8">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Monitoring Tahap {viewStepDetail.step}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{items.find(i => i.id === viewStepDetail.itemId)?.name}</p>
                  </div>
                  <button onClick={() => setViewStepDetail(null)} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tasks.filter(t => t.itemId === viewStepDetail.itemId && t.step === viewStepDetail.step).map(t => {
                    const m = machines.find(mac => mac.id === t.machineId);
                    const progress = Math.round((t.completedQty / t.targetQty) * 100);
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
                               <div className="text-center flex-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</p><p className="text-xl font-black text-slate-800">{t.targetQty}</p></div>
                               <div className="text-center flex-1 border-l"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktual</p><p className="text-xl font-black text-blue-600">{t.completedQty}</p></div>
                               <div className="text-center flex-1 border-l"><p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Reject</p><p className="text-xl font-black text-red-500">{t.defectQty}</p></div>
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
                  <button onClick={() => setIsConfigModalOpen(null)} className="p-4 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-white">
                  {workflowConfig.map(s => {
                    const isSelected = s.allocations.length > 0;
                    return (
                      <div key={s.step} className={`p-10 rounded-[40px] border-4 transition-all duration-300 ${isSelected ? 'border-blue-100 bg-blue-50/10' : 'border-slate-50 opacity-30 hover:opacity-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-6">
                             <input type="checkbox" checked={isSelected} onChange={() => setWorkflowConfig(prev => prev.map(f => f.step === s.step ? {...f, allocations: f.allocations.length > 0 ? [] : [{id: `a-${Date.now()}`, machineId: '', targetQty: items.find(i => i.id === isConfigModalOpen)?.quantity || 0}]} : f))} className="w-8 h-8 rounded-xl text-blue-600 focus:ring-blue-500" />
                             <span className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{s.step}</span>
                           </div>
                           {isSelected && <button onClick={() => setWorkflowConfig(prev => prev.map(f => f.step === s.step ? {...f, allocations: [...f.allocations, {id: `a-${Date.now()}`, machineId: '', targetQty: 0}]} : f))} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ Tambah Mesin Alokasi</button>}
                        </div>
                        {isSelected && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {s.allocations.map(a => (
                               <div key={a.id} className="bg-white p-8 rounded-[32px] border-2 border-slate-100 flex gap-6 items-center shadow-sm">
                                  <div className="flex-1 space-y-2">
                                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pilih Mesin Operasional</label>
                                     <select className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-100" value={a.machineId} onChange={e => setWorkflowConfig(prev => prev.map(f => f.step === s.step ? {...f, allocations: f.allocations.map(x => x.id === a.id ? {...x, machineId: e.target.value} : x)} : f))}>
                                        <option value="">Cari Mesin...</option>
                                        {machines.filter(m => m.type === s.step).map(m => <option key={m.id} value={m.id}>{m.name} ({m.status})</option>)}
                                     </select>
                                  </div>
                                  <div className="w-32 space-y-2">
                                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Qty</label>
                                     <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-center" value={a.targetQty} onChange={e => setWorkflowConfig(prev => prev.map(f => f.step === s.step ? {...f, allocations: f.allocations.map(x => x.id === a.id ? {...x, targetQty: Number(e.target.value)} : x)} : f))} />
                                  </div>
                                  {s.allocations.length > 1 && <button onClick={() => setWorkflowConfig(prev => prev.map(f => f.step === s.step ? {...f, allocations: f.allocations.filter(x => x.id !== a.id)} : f))} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2/></button>}
                               </div>
                             ))}
                           </div>
                        )}
                      </div>
                    )
                  })}
               </div>
               <div className="p-10 border-t bg-slate-50 flex justify-end gap-10 items-center">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Alokasi Step 1</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">{workflowConfig.find(w => w.step === 'POTONG')?.allocations.reduce((acc, c) => acc + c.targetQty, 0) || 0} PCS</p>
                  </div>
                  <button onClick={() => { validateWorkflow(isConfigModalOpen!, workflowConfig.filter(s => s.allocations.length > 0)); setIsConfigModalOpen(null); }} className="bg-blue-600 text-white px-16 py-6 rounded-[32px] font-black text-lg shadow-2xl uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all"><Save size={24}/> VALIDASI & SIMPAN ALUR</button>
               </div>
            </div>
         </div>
      )}

      {/* BOM MODAL */}
      {isBomModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Setup Material BOM</h2><button onClick={() => setIsBomModalOpen(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X/></button></div>
              <form onSubmit={(e) => {
                e.preventDefault();
                addBomItem(isBomModalOpen!, newBom.materialId, newBom.qty);
                setNewBom({ materialId: '', qty: 1 });
              }} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Baku</label>
                   <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" value={newBom.materialId} onChange={e => setNewBom({...newBom, materialId: e.target.value})}>
                      <option value="">Cari Material...</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty per Satu Unit (Pcs/Set)</label>
                   <input required type="number" step="0.0001" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" placeholder="0.0000" value={newBom.qty} onChange={e => setNewBom({...newBom, qty: Number(e.target.value)})} />
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
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tambah Item Pekerjaan</h2>
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
                       <p className="text-3xl font-black text-blue-700">{project.totalQty * (newItem.qtySet || 1)}</p>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl uppercase tracking-widest text-sm">SIMPAN ITEM KE PROJECT</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
