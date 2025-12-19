
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit3, Trash2, Wrench, X, Users as UsersIcon, ChevronLeft, ChevronRight, Search, Settings2, AlertTriangle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Machine, ALL_STEPS, Shift } from '../types';

export const Machines: React.FC = () => {
  const { machines, addMachine, updateMachine, deleteMachine, toggleMaintenance, can, users } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Partial<Machine>>({
    code: '', name: '', type: 'POTONG', capacityPerHour: 0, status: 'IDLE', personnel: []
  });

  if (!can('view', 'MACHINES')) return <div className="p-8 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  const filteredMachines = machines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const paginatedMachines = filteredMachines.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenEdit = (m: Machine) => { setEditingId(m.id); setFormData(m); setIsModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { updateMachine({ ...formData, id: editingId } as Machine); } 
    else { addMachine({ ...formData, id: `mac-${Date.now()}`, status: 'IDLE', personnel: formData.personnel || [], isMaintenance: false } as Machine); }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Master Data Mesin</h1>
           <p className="text-slate-500 font-bold">Monitor aset mesin dan alokasi shift produksi</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({code:'', name:'', type:'POTONG', capacityPerHour:0, personnel:[]}); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">+ TAMBAH MESIN</button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari mesin berdasarkan nama atau kode..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
           </div>
        </div>

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
              {paginatedMachines.map(m => (
                 <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                       <p className="text-[10px] text-blue-600 font-black mb-1">{m.code}</p>
                       <p className="font-black text-slate-800 text-base">{m.name}</p>
                    </td>
                    <td className="px-8 py-5"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">{m.type}</span></td>
                    <td className="px-8 py-5 text-center font-black">{m.capacityPerHour} <span className="text-[9px] text-slate-400 font-normal">PCS</span></td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${m.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : m.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{m.status}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex -space-x-2">
                          {m.personnel.slice(0, 3).map(p => (
                             <div key={p.id} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-black" title={`${p.name} - ${p.shift}`}>
                                {p.name.charAt(0)}
                             </div>
                          ))}
                          {m.personnel.length > 3 && <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-black">+{m.personnel.length - 3}</div>}
                          {m.personnel.length === 0 && <span className="text-[10px] text-slate-300 uppercase italic">Unassigned</span>}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => toggleMaintenance(m.id)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Toggle Maintenance"><Wrench size={18}/></button>
                          <button onClick={() => handleOpenEdit(m)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Settings2 size={18}/></button>
                          <button onClick={() => deleteMachine(m.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                       </div>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>

        <div className="p-8 bg-slate-50 border-t flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
           <span>Halaman {currentPage} dari {totalPages || 1}</span>
           <div className="flex items-center gap-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronLeft size={20}/></button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronRight size={20}/></button>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                 <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Konfigurasi Mesin' : 'Tambah Mesin Baru'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2.5 rounded-full transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kode Unit / Mesin</label>
                       <input required className="w-full p-4 bg-slate-50 rounded-2xl font-black uppercase outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. LAS-001" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Identitas Mesin</label>
                       <input required className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-100" placeholder="e.g. Welding Machine A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Tahapan</label>
                       <select className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                          {ALL_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas Maksimal (Pcs/Jam)</label>
                       <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none" placeholder="0" value={formData.capacityPerHour} onChange={e => setFormData({...formData, capacityPerHour: Number(e.target.value)})} />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Daftar Alokasi Personel (Operator)</h4>
                       <button type="button" onClick={() => setFormData(p => ({...p, personnel: [...(p.personnel || []), {id: `p-${Date.now()}`, name: '', role: 'OPERATOR', shift: 'SHIFT_1'}]}))} className="text-[10px] font-black bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all">+ TAMBAH OPERATOR</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {(formData.personnel || []).map(p => (
                          <div key={p.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-3xl border border-white shadow-inner">
                             <select className="col-span-5 p-3 bg-white rounded-xl text-xs font-black outline-none" value={p.name} onChange={e => setFormData(s => ({...s, personnel: (s.personnel || []).map(x => x.id === p.id ? {...x, name: e.target.value} : x)}))}>
                                <option value="">Pilih Karyawan...</option>
                                {users.map(u => <option key={u.id} value={u.name}>{u.name} (@{u.username})</option>)}
                             </select>
                             <select className="col-span-3 p-3 bg-white rounded-xl text-xs font-black outline-none" value={p.shift} onChange={e => setFormData(s => ({...s, personnel: (s.personnel || []).map(x => x.id === p.id ? {...x, shift: e.target.value as Shift} : x)}))}>
                                <option value="SHIFT_1">Shift 1</option>
                                <option value="SHIFT_2">Shift 2</option>
                                <option value="SHIFT_3">Shift 3</option>
                             </select>
                             <select className="col-span-3 p-3 bg-white rounded-xl text-xs font-black outline-none" value={p.role} onChange={e => setFormData(s => ({...s, personnel: (s.personnel || []).map(x => x.id === p.id ? {...x, role: e.target.value as any} : x)}))}>
                                <option value="OPERATOR">OPERATOR</option>
                                <option value="PIC">PIC</option>
                             </select>
                             <button type="button" className="col-span-1 text-red-400 hover:text-red-600 transition-colors" onClick={() => setFormData(prev => ({...prev, personnel: prev.personnel?.filter(x => x.id !== p.id)}))}><Trash2 size={20}/></button>
                          </div>
                       ))}
                       {(!formData.personnel || formData.personnel.length === 0) && <div className="text-center py-10 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-300 font-bold text-xs uppercase tracking-widest italic">Belum ada operator dialokasikan</div>}
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl hover:bg-blue-700 transition-all text-lg uppercase tracking-widest">SIMPAN MASTER DATA MESIN</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
