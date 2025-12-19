import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import { Plus, Edit3, Trash2, Wrench, X, Users as UsersIcon, ChevronLeft, ChevronRight, Search, Settings2, AlertTriangle, CheckCircle2, User as UserIcon, AlertCircle, Loader } from 'lucide-react';
import { Machine, ALL_STEPS, Shift } from '../types';

interface FormMachine {
  id?: number;
  code: string;
  name: string;
  type: 'POTONG' | 'PLONG' | 'PRESS' | 'LAS' | 'WT' | 'POWDER' | 'QC';
  capacity_per_hour: number;
  status: 'IDLE' | 'RUNNING' | 'MAINTENANCE' | 'OFFLINE' | 'DOWNTIME';
  personnel: Array<{
    id?: string | number;
    name: string;
    position?: string;
    role?: string;
    shift?: string;
  }>;
  is_maintenance: boolean;
}

export const Machines: React.FC = () => {
  const { can } = useStore();
  const [machines, setMachines] = useState<FormMachine[]>([]);
  const [employees, setEmployees] = useState<Array<{ id?: number; name: string; email?: string; role?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<FormMachine>({
    code: '',
    name: '',
    type: 'POTONG',
    capacity_per_hour: 0,
    status: 'IDLE',
    personnel: [],
    is_maintenance: false,
  });

  if (!can('view', 'MACHINES')) return <div className="p-8 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await apiClient.getUsers(1, 100);
      if (response.success && response.data?.data) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchMachines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMachines();
      const machinesData = response.data?.data || response.data;

      if (Array.isArray(machinesData)) {
        // Ensure personnel is always an array
        const normalizedMachines = machinesData.map(m => ({
          ...m,
          personnel: Array.isArray(m.personnel) ? m.personnel : [],
        }));
        setMachines(normalizedMachines);
      } else {
        setError(response.message || 'Gagal memuat data mesin');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data mesin');
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        const response = await apiClient.updateMachine(editingId, formData);
        if (response.data) {
          await fetchMachines();
        } else {
          setError(response.message || 'Gagal mengupdate mesin');
        }
      } else {
        const response = await apiClient.createMachine(formData);
        if (response.data) {
          await fetchMachines();
        } else {
          setError(response.message || 'Gagal membuat mesin baru');
        }
      }
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        type: 'POTONG',
        capacity_per_hour: 0,
        status: 'IDLE',
        personnel: [],
        is_maintenance: false,
      });
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data mesin');
      console.error('Error submitting form:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (m: FormMachine) => {
    setEditingId(m.id || null);
    setFormData({
      ...m,
      personnel: Array.isArray(m.personnel) ? m.personnel : [],
    });
    fetchEmployees();
    setIsModalOpen(true);
  };

  const handleDelete = async (machineId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mesin ini?')) {
      return;
    }

    try {
      const response = await apiClient.deleteMachine(machineId);
      if (response.data) {
        await fetchMachines();
      } else {
        setError(response.message || 'Gagal menghapus mesin');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus mesin');
      console.error('Error deleting machine:', err);
    }
  };

  const handleToggleMaintenance = async (machineId: number) => {
    try {
      const response = await apiClient.toggleMachineMaintenance(machineId);
      if (response.data) {
        await fetchMachines();
      } else {
        setError(response.message || 'Gagal mengubah status maintenance');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengubah status maintenance');
      console.error('Error toggling maintenance:', err);
    }
  };

  const filteredMachines = machines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const paginatedMachines = filteredMachines.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Master Data Mesin</h1>
          <p className="text-slate-500 font-bold">Monitor aset mesin dan alokasi shift produksi</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              code: '',
              name: '',
              type: 'POTONG',
              capacity_per_hour: 0,
              status: 'IDLE',
              personnel: [],
              is_maintenance: false,
            });
            fetchEmployees();
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          + TAMBAH MESIN
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-black text-red-900">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari mesin berdasarkan nama atau kode..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-blue-600" size={32} />
              <p className="text-slate-500 font-bold">Memuat data mesin...</p>
            </div>
          </div>
        ) : machines.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 font-bold">Belum ada data mesin</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Kode / Nama Mesin</th>
                  <th className="px-8 py-5">Tipe Tahapan</th>
                  <th className="px-8 py-5 text-center">Kapasitas (Hr)</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">PIC / Operator</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {paginatedMachines.length > 0 ? (
                  paginatedMachines.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-[10px] text-blue-600 font-black mb-1">{m.code}</p>
                        <p className="font-black text-slate-800 text-base">{m.name}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          {m.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center font-black">
                        {m.capacity_per_hour} <span className="text-[9px] text-slate-400 font-normal">PCS</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              m.status === 'RUNNING'
                                ? 'bg-emerald-500 animate-pulse'
                                : m.status === 'MAINTENANCE'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{m.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-2">
                          <div className="flex -space-x-2">
                            {Array.isArray(m.personnel) && m.personnel.slice(0, 3).map((p, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-black"
                                title={`${p.name}`}
                              >
                                {p.name?.charAt(0) || '?'}
                              </div>
                            ))}
                            {Array.isArray(m.personnel) && m.personnel.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-black">
                                +{m.personnel.length - 3}
                              </div>
                            )}
                            {(!Array.isArray(m.personnel) || m.personnel.length === 0) && <span className="text-[10px] text-slate-300 uppercase italic">Unassigned</span>}
                          </div>
                          {Array.isArray(m.personnel) && m.personnel.length > 0 && (
                            <div className="text-[9px] text-slate-600 font-bold">
                              {m.personnel.slice(0, 2).map(p => p.name).join(', ')}
                              {m.personnel.length > 2 && ` +${m.personnel.length - 2}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleToggleMaintenance(m.id!)}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                            title="Toggle Maintenance"
                          >
                            <Wrench size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Settings2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(m.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-slate-400 font-bold">
                      Tidak ada mesin ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="p-8 bg-slate-50 border-t flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Halaman {currentPage} dari {totalPages || 1}</span>
              <div className="flex items-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">
                {editingId ? 'Edit Konfigurasi Mesin' : 'Tambah Mesin Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 p-2.5 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Kode Unit / Mesin
                  </label>
                  <input
                    required
                    className="w-full p-4 bg-slate-50 rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. LAS-001"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Nama Identitas Mesin
                  </label>
                  <input
                    required
                    className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Welding Machine A"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tipe Tahapan
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none"
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'POTONG' | 'PLONG' | 'PRESS' | 'LAS' | 'WT' | 'POWDER' | 'QC',
                      })
                    }
                  >
                    {ALL_STEPS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Kapasitas Maksimal (Pcs/Jam)
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none"
                    placeholder="0"
                    value={formData.capacity_per_hour}
                    onChange={e => setFormData({ ...formData, capacity_per_hour: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                    Daftar Alokasi Personel (Operator)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(p => ({
                        ...p,
                        personnel: [
                          ...(Array.isArray(p.personnel) ? p.personnel : []),
                          { id: `p-${Date.now()}`, name: '', role: 'OPERATOR', shift: 'SHIFT_1' },
                        ],
                      }))
                    }
                    className="text-[10px] font-black bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    + TAMBAH OPERATOR
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {Array.isArray(formData.personnel) && formData.personnel.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-3xl border border-white shadow-inner">
                      <div className="col-span-5 space-y-1">
                        {p.name && (
                          <div className="text-xs font-black text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                            {p.name}
                          </div>
                        )}
                        <select
                          className="w-full p-3 bg-white rounded-xl text-xs font-black outline-none border border-slate-200"
                          value={p.name || ''}
                          onChange={e =>
                            setFormData(s => ({
                              ...s,
                              personnel: (Array.isArray(s.personnel) ? s.personnel : []).map((x, i) =>
                                i === idx ? { ...x, name: e.target.value } : x
                              ),
                            }))
                          }
                          disabled={employeesLoading}
                        >
                          <option value="">{employeesLoading ? 'Memuat...' : 'Pilih Karyawan...'}</option>
                          {employees.map(u => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <select
                        className="col-span-3 p-3 bg-white rounded-xl text-xs font-black outline-none"
                        value={p.shift || 'SHIFT_1'}
                        onChange={e =>
                          setFormData(s => ({
                            ...s,
                            personnel: (Array.isArray(s.personnel) ? s.personnel : []).map((x, i) => (i === idx ? { ...x, shift: e.target.value } : x)),
                          }))
                        }
                      >
                        <option value="SHIFT_1">Shift 1</option>
                        <option value="SHIFT_2">Shift 2</option>
                        <option value="SHIFT_3">Shift 3</option>
                      </select>
                      <select
                        className="col-span-3 p-3 bg-white rounded-xl text-xs font-black outline-none"
                        value={p.role || 'OPERATOR'}
                        onChange={e =>
                          setFormData(s => ({
                            ...s,
                            personnel: (Array.isArray(s.personnel) ? s.personnel : []).map((x, i) => (i === idx ? { ...x, role: e.target.value } : x)),
                          }))
                        }
                      >
                        <option value="OPERATOR">OPERATOR</option>
                        <option value="PIC">PIC</option>
                      </select>
                      <button
                        type="button"
                        className="col-span-1 text-red-400 hover:text-red-600 transition-colors"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            personnel: Array.isArray(prev.personnel) ? prev.personnel.filter((_, i) => i !== idx) : [],
                          }))
                        }
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {(!Array.isArray(formData.personnel) || formData.personnel.length === 0) && (
                    <div className="text-center py-10 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-300 font-bold text-xs uppercase tracking-widest italic">
                      Belum ada operator dialokasikan
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl hover:bg-blue-700 transition-all text-lg uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && <Loader size={20} className="animate-spin" />}
                SIMPAN MASTER DATA MESIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
