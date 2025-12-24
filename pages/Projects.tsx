import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import {
  Plus, Search, Eye, Lock, Unlock, X, ChevronLeft, ChevronRight, Calculator, Edit3, Trash2, AlertCircle
} from 'lucide-react';
import { Project } from '../types';
import { ErrorPopup } from '../components/ErrorPopup';

const UNITS_LIST = ['PCS', 'SET', 'UNIT', 'BOX', 'KG', 'LEMBAR', 'ROLL', 'METER'];

export const Projects: React.FC = () => {
  const { can } = useStore();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: '', customer: '', qtyPerUnit: 1, procurementQty: 1, unit: 'PCS', deadline: ''
  });

  const calculatedTotal = useMemo(() => formData.qtyPerUnit * formData.procurementQty, [formData]);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getProjects();
      // Handle backend response structure: { data: [...] }
      const projectsData = response.data?.data || response.data;

      if (projectsData && Array.isArray(projectsData)) {
        // Transform API response to internal Project format
        const transformedProjects = projectsData.map(p => ({
          id: p.id?.toString() || `prj-${Math.random()}`,
          code: p.code,
          name: p.name,
          customer: p.customer,
          startDate: p.start_date,
          deadline: p.deadline,
          status: p.status as any,
          progress: p.progress,
          qtyPerUnit: p.qty_per_unit,
          procurementQty: p.procurement_qty,
          totalQty: p.total_qty,
          unit: p.unit,
          isLocked: p.is_locked,
        }));
        setProjects(transformedProjects);
      } else {
        setError(response.message || 'Gagal memuat data proyek');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data proyek');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const projectData = {
        code: editingId ? projects.find(p => p.id === editingId)?.code || '' : `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        name: formData.name,
        customer: formData.customer,
        start_date: editingId ? projects.find(p => p.id === editingId)?.startDate || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: formData.deadline,
        status: editingId ? projects.find(p => p.id === editingId)?.status || 'PLANNED' : 'PLANNED',
        progress: editingId ? projects.find(p => p.id === editingId)?.progress || 0 : 0,
        qty_per_unit: formData.qtyPerUnit,
        procurement_qty: formData.procurementQty,
        total_qty: calculatedTotal,
        unit: formData.unit,
        is_locked: editingId ? projects.find(p => p.id === editingId)?.isLocked || false : false,
      };

      if (editingId) {
        // Update existing project
        const project = projects.find(p => p.id === editingId);
        if (project) {
          const response = await apiClient.updateProject(project.id, projectData);
          if (response.success) {
            await fetchProjects();
          } else {
            setError(response.message || 'Gagal mengupdate proyek');
          }
        }
      } else {
        // Create new project
        const response = await apiClient.createProject(projectData);
        if (response.success) {
          await fetchProjects();
        } else {
          setError(response.message || 'Gagal membuat proyek baru');
        }
      }
      setIsModalOpen(false);
      setFormData({ name: '', customer: '', qtyPerUnit: 1, procurementQty: 1, unit: 'PCS', deadline: '' });
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data proyek');
      console.error('Error submitting form:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      customer: p.customer,
      qtyPerUnit: p.qtyPerUnit,
      procurementQty: p.procurementQty,
      unit: p.unit,
      deadline: p.deadline
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      return;
    }

    try {
      const response = await apiClient.deleteProject(projectId);
      if (response.success) {
        await fetchProjects();
      } else {
        setError(response.message || 'Gagal menghapus proyek');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus proyek');
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700"><X size={18} /></button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Manajemen Project</h1>
          <p className="text-slate-500 text-sm font-bold">Monitor alur kerja & target produksi gondola</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ name: '', customer: '', qtyPerUnit: 1, procurementQty: 1, unit: 'PCS', deadline: '' }); setIsModalOpen(true); }} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl font-black text-sm flex items-center gap-3 disabled:cursor-not-allowed">
          <Plus size={20} /> TAMBAH PROJECT
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama project atau kode..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold disabled:bg-slate-100"
              disabled={loading}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-500 font-bold">Memuat data proyek...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                  <tr>
                    <th className="px-4 lg:px-8 py-5">Kode / Nama</th>
                    <th className="px-4 lg:px-8 py-5">Customer</th>
                    <th className="px-4 lg:px-8 py-5 text-center">Pengadaan</th>
                    <th className="px-4 lg:px-8 py-5 text-center">Qty/Unit</th>
                    <th className="px-4 lg:px-8 py-5 text-center">Total Target</th>
                    <th className="px-4 lg:px-8 py-5">Deadline</th>
                    <th className="px-4 lg:px-8 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {paginatedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 lg:px-8 py-12 text-center text-slate-500">
                        Tidak ada data proyek
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 lg:px-8 py-5">
                          <p className="text-[10px] text-blue-600 font-black mb-1">{p.code}</p>
                          <p className="font-black text-slate-800 text-base">{p.name}</p>
                        </td>
                        <td className="px-4 lg:px-8 py-5 text-slate-500">{p.customer}</td>
                        <td className="px-4 lg:px-8 py-5 text-center font-black text-slate-700">{p.procurementQty}</td>
                        <td className="px-4 lg:px-8 py-5 text-center font-black text-slate-700">{p.qtyPerUnit} {p.unit}</td>
                        <td className="px-4 lg:px-8 py-5 text-center font-black text-blue-700 text-lg">{p.totalQty} {p.unit}</td>
                        <td className="px-4 lg:px-8 py-5 text-slate-600">{new Date(p.deadline).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 lg:px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => navigate(`/projects/${p.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Details"><Eye size={20}/></button>
                            {!p.isLocked ? (
                              <>
                                <button onClick={() => openEdit(p)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Edit"><Edit3 size={20}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 size={20}/></button>
                              </>
                            ) : (
                              <div className="p-3 text-emerald-500" title="Project Locked"><Lock size={20}/></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedProjects.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Tidak ada data proyek
                </div>
              ) : (
                paginatedProjects.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-blue-600 font-black">{p.code}</p>
                        <p className="font-black text-slate-800 text-sm line-clamp-2">{p.name}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => navigate(`/projects/${p.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details"><Eye size={16}/></button>
                        {!p.isLocked ? (
                          <>
                            <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit"><Edit3 size={16}/></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16}/></button>
                          </>
                        ) : (
                          <div className="p-2 text-emerald-500" title="Project Locked"><Lock size={16}/></div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-black">Customer</span>
                        <span className="text-slate-700 font-black">{p.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-black">Pengadaan</span>
                        <span className="text-slate-700 font-black">{p.procurementQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-black">Qty/Unit</span>
                        <span className="text-slate-700 font-black">{p.qtyPerUnit} {p.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-black">Total Target</span>
                        <span className="text-blue-700 font-black">{p.totalQty} {p.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-black">Deadline</span>
                        <span className="text-slate-600 font-black">{new Date(p.deadline).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest">
              <span>Halaman {currentPage} dari {totalPages || 1}</span>
              <div className="flex items-center gap-3">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 hover:bg-white border rounded-xl disabled:opacity-30 shadow-sm transition-all"><ChevronLeft size={18}/></button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 hover:bg-white border rounded-xl disabled:opacity-30 shadow-sm transition-all"><ChevronRight size={18}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Project Master' : 'Tambah Project Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2.5 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Nama Project Manufaktur</label>
                  <input required disabled={isSaving} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Nama Customer</label>
                  <input required disabled={isSaving} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Satuan Luaran</label>
                  <select disabled={isSaving} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    {UNITS_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Estimasi Deadline</label>
                  <input type="date" required disabled={isSaving} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
                <div className="col-span-2 bg-blue-50 p-8 rounded-[32px] border border-blue-100 flex items-center justify-between shadow-inner">
                  <div className="flex gap-8">
                    <div className="w-32">
                      <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Qty Order</label>
                      <input type="number" min="1" disabled={isSaving} className="w-full p-3.5 rounded-xl font-black text-center shadow-lg border-none disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.procurementQty} onChange={e => setFormData({...formData, procurementQty: Number(e.target.value)})} />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Qty / Unit</label>
                      <input type="number" min="1" disabled={isSaving} className="w-full p-3.5 rounded-xl font-black text-center shadow-lg border-none disabled:bg-slate-100 disabled:cursor-not-allowed" value={formData.qtyPerUnit} onChange={e => setFormData({...formData, qtyPerUnit: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-blue-400 uppercase mb-1 flex items-center justify-end gap-2"><Calculator size={14}/> Total Target Project</p>
                    <p className="text-4xl font-black text-blue-800">{calculatedTotal} <span className="text-lg text-blue-400 uppercase">{formData.unit}</span></p>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-[24px] font-black shadow-2xl transition-all uppercase tracking-widest text-lg disabled:cursor-not-allowed">
                {isSaving ? 'Menyimpan...' : (editingId ? 'Update Data Project' : 'Simpan Master Project')}
              </button>
            </form>
          </div>
        </div>
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
    </div>
  );
};
