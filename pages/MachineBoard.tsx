import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient, TaskData } from '../lib/api';
import { Play, Pause, Plus, Clock, Activity, AlertTriangle, CheckCircle2, ListFilter, History } from 'lucide-react';
import { Task, Shift } from '../types';

export const MachineBoard: React.FC = () => {
  const { machines, tasks, currentUser, logs, setTaskStatus, reportProduction, startDowntime, endDowntime } = useStore();

  const [apiMachines, setApiMachines] = useState<any[]>([]);
  const [apiTasks, setApiTasks] = useState<TaskData[]>([]);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<Shift>('SHIFT_1');
  const [operatorShift, setOperatorShift] = useState<Shift | null>(null);
  const [reportModal, setReportModal] = useState<TaskData | null>(null);
  const [qtyGood, setQtyGood] = useState<number>(0);
  const [qtyDefect, setQtyDefect] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const isOperator = currentUser?.role === 'OPERATOR';

  // Fetch machines from API on component mount
  useEffect(() => {
    const fetchMachines = async () => {
      setMachinesLoading(true);
      try {
        const response = await apiClient.getMachines();
        if (response.success && response.data) {
          const machineList = Array.isArray(response.data) ? response.data : (response.data.data || []);

          // Filter based on user role
          let filteredMachines = machineList;
          let detectedShift: Shift | null = null;

          if (currentUser && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
            // Filter machines where current user is listed in personnel
            filteredMachines = machineList.filter((m: any) =>
              m.personnel?.some((p: any) => p.name === currentUser.name)
            );

            // For operators, detect their assigned shift from the first machine
            if (isOperator && filteredMachines.length > 0) {
              const operatorPersonnel = filteredMachines[0].personnel?.find((p: any) => p.name === currentUser.name);
              if (operatorPersonnel?.shift) {
                detectedShift = operatorPersonnel.shift as Shift;
                setOperatorShift(detectedShift);
                setSelectedShift(detectedShift);
              }
            }
          }

          setApiMachines(filteredMachines);

          // Set first machine as default
          if (filteredMachines.length > 0 && !selectedMachineId) {
            setSelectedMachineId(filteredMachines[0].id || '');
          }
        }
      } catch (err) {
        setError('Gagal memuat daftar stasiun kerja');
        console.error('Error fetching machines:', err);
      } finally {
        setMachinesLoading(false);
      }
    };

    fetchMachines();
  }, [currentUser, isOperator]);

  // Keep operator shift in sync with selected shift
  useEffect(() => {
    if (isOperator && operatorShift) {
      setSelectedShift(operatorShift);
    }
  }, [operatorShift, isOperator]);

  // Fetch tasks and logs from API
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMachineId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Fetch tasks for this machine
        const tasksResponse = await apiClient.getTasks(1, 100, { machine_id: selectedMachineId });
        if (tasksResponse.success && tasksResponse.data) {
          const taskList = Array.isArray(tasksResponse.data) ? tasksResponse.data : (tasksResponse.data.data || []);
          setApiTasks(taskList);
        }

        // Fetch production logs for this machine with shift filter
        const logsResponse = await apiClient.getProductionLogsByMachine(selectedMachineId, 1, 50, { shift: selectedShift });
        if (logsResponse.success && logsResponse.data) {
          const logList = logsResponse.data.data || (Array.isArray(logsResponse.data) ? logsResponse.data : []);
          setApiLogs(logList);
        }
      } catch (err) {
        setError('Gagal memuat data');
        console.error('Error fetching machine data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMachineId, selectedShift]);

  const machine = machines.find(m => m.id === selectedMachineId);
  const machineTasks = apiTasks.filter(t => t.status !== 'COMPLETED' && t.shift === selectedShift);
  const activeTask = machineTasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'DOWNTIME');
  const pendingTasks = machineTasks.filter(t => t.status !== 'IN_PROGRESS' && t.status !== 'DOWNTIME');

  const shiftSummary = useMemo(() => {
    return apiLogs.filter(l =>
        l.shift === selectedShift &&
        new Date(l.logged_at).toDateString() === new Date().toDateString()
      ).reduce((acc, curr) => ({ good: acc.good + curr.good_qty, defect: acc.defect + curr.defect_qty }), { good: 0, defect: 0 });
  }, [apiLogs, selectedShift]);

  const recentLogs = useMemo(() => {
    return apiLogs.slice(0, 10);
  }, [apiLogs]);

  const handleTaskStatusChange = async (taskId: string | number, newStatus: string) => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateTaskStatus(taskId, newStatus);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));
        setTaskStatus(taskId.toString(), newStatus);
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

  const handleStartDowntime = async (taskId: string | number) => {
    setIsSaving(true);
    try {
      const response = await apiClient.startTaskDowntime(taskId);
      if (response.success && response.data) {
        setApiTasks(apiTasks.map(t => t.id === taskId ? response.data : t));
        startDowntime(taskId.toString());
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
        endDowntime(taskId.toString());
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

  const submitReport = async () => {
    if (!reportModal) return;
    setIsSaving(true);
    try {
      // Create production log via API
      const logPayload = {
        task_id: reportModal.id!,
        machine_id: selectedMachineId,
        item_id: reportModal.item_id,
        project_id: reportModal.project_id,
        step: reportModal.step,
        shift: selectedShift,
        good_qty: qtyGood,
        defect_qty: qtyDefect,
        operator: currentUser?.name || 'Unknown',
        logged_at: new Date().toISOString(),
        type: 'OUTPUT'
      };

      const logResponse = await apiClient.createProductionLog(logPayload);
      if (logResponse.success && logResponse.data) {
        setApiLogs([logResponse.data, ...apiLogs]);

        // Update task quantities via API
        const newCompletedQty = (reportModal.completed_qty || 0) + qtyGood;
        const newDefectQty = (reportModal.defect_qty || 0) + qtyDefect;

        const updateResponse = await apiClient.updateTaskQuantities(reportModal.id!, newCompletedQty, newDefectQty);
        if (updateResponse.success && updateResponse.data) {
          setApiTasks(apiTasks.map(t => t.id === reportModal.id ? updateResponse.data : t));

          // Update Zustand store to sync workflow progress across pages
          reportProduction(reportModal.id, qtyGood, qtyDefect, selectedShift, currentUser?.name || 'Unknown');

          // Refetch all tasks for the selected machine to ensure workflow progress is updated
          // This ensures that if user navigates to ProjectDetail, the progress bars are accurate
          try {
            const refreshResponse = await apiClient.getTasks(1, 100, { machine_id: selectedMachineId });
            if (refreshResponse.success && refreshResponse.data) {
              const refreshedTasks = Array.isArray(refreshResponse.data) ? refreshResponse.data : (refreshResponse.data.data || []);
              setApiTasks(refreshedTasks);
            }
          } catch (refreshErr) {
            console.error('Error refreshing tasks:', refreshErr);
          }
        }

        setReportModal(null);
        setQtyGood(0);
        setQtyDefect(0);
      } else {
        setError(logResponse.message || 'Gagal menyimpan hasil produksi');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan hasil produksi');
      console.error('Error submitting report:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (machinesLoading) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 animate-pulse"><Activity size={48}/></div>
              <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Memuat Stasiun Kerja</h2>
              <p className="text-slate-400 font-bold max-w-sm mx-auto mt-4">Sedang mengambil data mesin dari sistem...</p>
          </div>
      );
  }

  if (apiMachines.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6"><AlertTriangle size={48}/></div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mesin Belum Dialokasikan</h2>
              <p className="text-slate-400 font-bold max-w-sm mx-auto mt-4">Username Anda tidak terdaftar pada PIC/Operator mesin manapun. Hubungi Admin untuk alokasi stasiun kerja.</p>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* ERROR DISPLAY */}
      {error && (
          <div className="bg-red-50 border border-red-200 rounded-[24px] p-6">
              <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
      )}

      {/* SELECTION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2">
                <label className="text-[10px] text-slate-400 font-black uppercase block mb-3 tracking-widest flex items-center gap-2"><ListFilter size={12}/> Pilih Stasiun Kerja</label>
                <select
                    value={selectedMachineId}
                    onChange={(e) => { setSelectedMachineId(e.target.value); setError(null); }}
                    disabled={machinesLoading}
                    className="w-full font-black text-3xl bg-slate-50 border-none p-6 rounded-[28px] outline-none shadow-inner focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
                >
                    {apiMachines.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
            </div>
            {!isOperator && (
              <div className="w-full md:w-1/2 flex gap-4">
                  <div className="flex-1">
                      <label className="text-[10px] text-slate-400 font-black uppercase block mb-3 tracking-widest flex items-center gap-2"><Clock size={12}/> Shift Produksi</label>
                      <select
                          value={selectedShift}
                          onChange={(e) => setSelectedShift(e.target.value as Shift)}
                          className="w-full font-black text-lg bg-slate-50 border-none p-6 rounded-[28px] outline-none shadow-inner focus:ring-4 focus:ring-blue-100 transition-all"
                      >
                          <option value="SHIFT_1">SHIFT 1 (PAGI)</option>
                          <option value="SHIFT_2">SHIFT 2 (SORE)</option>
                          <option value="SHIFT_3">SHIFT 3 (MALAM)</option>
                      </select>
                  </div>
              </div>
            )}
            {isOperator && (
              <div className="w-full md:w-1/2 flex gap-4">
                  <div className="flex-1 bg-blue-50 p-6 rounded-[28px] border border-blue-200 flex items-center gap-4 justify-between">
                      <div>
                          <p className="text-[10px] text-blue-600 font-black uppercase block tracking-widest flex items-center gap-2"><Clock size={12}/> Shift Anda</p>
                          <p className="text-xl font-black text-blue-700 mt-2">{operatorShift === 'SHIFT_1' ? 'SHIFT 1 (PAGI)' : operatorShift === 'SHIFT_2' ? 'SHIFT 2 (SORE)' : 'SHIFT 3 (MALAM)'}</p>
                      </div>
                  </div>
              </div>
            )}
        </div>
        <div className="lg:col-span-4 bg-slate-900 text-white p-10 rounded-[48px] flex flex-col justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12"><Activity size={100}/></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">LIVE OUTPUT MONITOR</p>
            <div className="flex justify-between items-end relative">
                <div>
                   <p className="text-6xl font-black text-white leading-none tracking-tighter">{shiftSummary.good}</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-3 tracking-widest uppercase">GOOD PROD</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-red-500 leading-none tracking-tighter">{shiftSummary.defect}</p>
                   <p className="text-[10px] font-bold text-slate-500 mt-3 tracking-widest uppercase">DEFECTS</p>
                </div>
            </div>
        </div>
      </div>

      {/* ACTIVE TASK PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="bg-white rounded-[56px] p-32 text-center border-8 border-dashed border-slate-100 flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 animate-pulse"><Activity size={56}/></div>
                <h2 className="text-3xl font-black text-slate-300 uppercase tracking-[0.3em]">Memuat Data Mesin</h2>
                <p className="text-slate-400 font-bold max-w-sm mx-auto">Sedang mengambil data tugas dan log aktivitas...</p>
            </div>
          ) : activeTask ? (
            <div className={`bg-white rounded-[56px] border-8 shadow-2xl overflow-hidden transition-all duration-500 ${activeTask.status === 'DOWNTIME' ? 'border-amber-400' : 'border-blue-600'}`}>
                <div className={`${activeTask.status === 'DOWNTIME' ? 'bg-amber-500' : 'bg-blue-600'} text-white px-12 py-8 flex justify-between items-center`}>
                    <div className="flex items-center gap-6">
                        <div className={`w-4 h-4 bg-white rounded-full ${activeTask.status === 'IN_PROGRESS' ? 'animate-ping' : ''}`} />
                        <span className="font-black tracking-[0.3em] text-xl uppercase">{activeTask.status === 'DOWNTIME' ? 'DOWNTIME / PERBAIKAN' : activeTask.step}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/30">{activeTask.project_name}</div>
                </div>

                <div className="p-12 space-y-12">
                    <div className="text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">ITEM SEDANG DIPROSES</p>
                        <h2 className="text-7xl font-black text-slate-900 leading-tight tracking-tighter">{activeTask.item_name}</h2>
                        <div className="flex justify-center items-center gap-10 mt-8 font-black text-lg">
                            <div className="bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 text-slate-400">Target: <span className="text-slate-800">{activeTask.target_qty}</span></div>
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <div className="bg-blue-50 px-8 py-3 rounded-2xl border border-blue-100 text-blue-500">Selesai: <span className="text-blue-700 font-black">{activeTask.completed_qty}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {activeTask.status === 'DOWNTIME' ? (
                            <button onClick={() => handleEndDowntime(activeTask.id)} disabled={isSaving} className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white p-12 rounded-[40px] font-black text-3xl flex items-center justify-center gap-6 shadow-2xl shadow-emerald-200 transition-all hover:scale-[1.02] disabled:opacity-50">
                                <CheckCircle2 size={56} /> SELESAIKAN DOWNTIME
                            </button>
                        ) : (
                          <>
                            <button onClick={() => setReportModal(activeTask)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white p-14 rounded-[40px] font-black text-3xl flex flex-col items-center gap-6 shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] disabled:opacity-50">
                                <Plus size={64} /> INPUT HASIL
                            </button>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => handleStartDowntime(activeTask.id)} disabled={isSaving} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white p-8 rounded-[40px] font-black text-xl flex items-center justify-center gap-4 shadow-xl shadow-amber-100 transition-all hover:scale-[1.02] disabled:opacity-50">
                                    <AlertTriangle size={32} /> DOWNTIME
                                </button>
                                <button onClick={() => handleTaskStatusChange(activeTask.id, 'PAUSED')} disabled={isSaving} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 p-8 rounded-[40px] font-black text-xl flex items-center justify-center gap-4 transition-all disabled:opacity-50">
                                    <Pause size={32} /> ISTIRAHAT
                                </button>
                            </div>
                          </>
                        )}
                    </div>
                    {activeTask.total_downtime_minutes > 0 && (
                        <div className="text-center bg-red-50 p-4 rounded-3xl border border-red-100 text-red-500 font-black text-xs uppercase tracking-widest">
                           Total Terhenti Hari Ini: {activeTask.total_downtime_minutes} Menit
                        </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="bg-white rounded-[56px] p-32 text-center border-8 border-dashed border-slate-100 flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4"><Clock size={56}/></div>
                <h2 className="text-3xl font-black text-slate-300 uppercase tracking-[0.3em]">STANDBY / MENUNGGU TUGAS</h2>
                <p className="text-slate-400 font-bold max-w-sm mx-auto">Silakan pilih item pekerjaan dari daftar antrian kerja di samping atau bawah untuk memulai proses produksi.</p>
            </div>
          )}
        </div>

        {/* LOG ACTIVITY (SIDE) */}
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-8 h-full min-h-[600px] flex flex-col">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.4em] flex items-center gap-4 border-b pb-6">
                <History size={16} className="text-blue-500"/> LOG AKTIVITAS MESIN
            </h3>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
               {recentLogs.map(log => (
                   <div key={log.id} className="relative pl-8 pb-6 border-l-2 border-slate-100 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 mb-1">{new Date(log.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         <p className="text-sm font-black text-slate-800 leading-tight">Output: <span className="text-blue-600">{log.good_qty} Good</span>, <span className="text-red-500">{log.defect_qty} Defect</span></p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase truncate">{log.item_name}</p>
                      </div>
                   </div>
               ))}
               {recentLogs.length === 0 && (
                   <div className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Belum ada aktivitas hari ini</div>
               )}
            </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="space-y-6">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.4em] flex items-center gap-6 px-4">
              <div className="w-12 h-1.5 bg-blue-600 rounded-full" /> ANTRIAN KERJA STASIUN ({pendingTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingTasks.map(t => (
                  <div key={t.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-xl uppercase tracking-widest">{t.step}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {t.target_qty}</span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-800 leading-none truncate pr-4">{t.item_name}</h4>
                      </div>
                      <button
                        disabled={!!activeTask || isSaving}
                        onClick={() => handleTaskStatusChange(t.id, 'IN_PROGRESS')}
                        className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center disabled:opacity-20 shadow-inner"
                      ><Play fill="currentColor" size={24}/></button>
                  </div>
              ))}
          </div>
      </div>

      {/* INPUT REPORT MODAL */}
      {reportModal && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4 backdrop-blur-xl">
              <div className="bg-white rounded-[64px] w-full max-w-lg p-14 space-y-12 shadow-2xl animate-in zoom-in-95">
                  <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl"><Plus size={40}/></div>
                      <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Konfirmasi Output</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Tahap: {reportModal.step} &bull; {reportModal.item_name}</p>
                  </div>

                  <div className="space-y-12">
                      <div className="text-center">
                          <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] block mb-6">HASIL JADI (GOOD QTY)</label>
                          <div className="flex items-center justify-center gap-8">
                              <button onClick={() => setQtyGood(Math.max(0, qtyGood - 10))} className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 font-black text-2xl hover:bg-slate-200 transition-all">-10</button>
                              <input type="number" className="w-32 text-center text-7xl font-black outline-none border-none bg-transparent" value={qtyGood} onChange={(e) => setQtyGood(parseInt(e.target.value) || 0)} />
                              <button onClick={() => setQtyGood(qtyGood + 10)} className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 font-black text-2xl hover:bg-slate-200 transition-all">+10</button>
                          </div>
                      </div>
                      <div className="text-center bg-red-50/50 p-8 rounded-[32px] border border-red-50">
                          <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] block mb-6">BARANG CACAT (DEFECT QTY)</label>
                          <div className="flex items-center justify-center gap-6">
                              <button onClick={() => setQtyDefect(Math.max(0, qtyDefect - 1))} className="w-14 h-14 rounded-2xl bg-white border border-red-100 font-black text-lg shadow-sm">-1</button>
                              <input type="number" className="w-20 text-center text-4xl font-black text-red-500 outline-none bg-transparent" value={qtyDefect} onChange={(e) => setQtyDefect(parseInt(e.target.value) || 0)} />
                              <button onClick={() => setQtyDefect(qtyDefect + 1)} className="w-14 h-14 rounded-2xl bg-white border border-red-100 font-black text-lg shadow-sm">+1</button>
                          </div>
                      </div>
                  </div>

                  {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-700">{error}</p>
                      </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <button onClick={submitReport} disabled={isSaving} className="w-full py-7 bg-blue-600 text-white rounded-[28px] font-black text-2xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{isSaving ? 'MENYIMPAN...' : 'SIMPAN HASIL PRODUKSI'}</button>
                    <button onClick={() => setReportModal(null)} disabled={isSaving} className="w-full py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-slate-600 disabled:opacity-50">{isSaving ? 'Tunggu...' : 'Batalkan & Kembali'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
