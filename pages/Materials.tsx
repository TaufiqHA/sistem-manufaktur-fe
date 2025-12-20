import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit3, Trash2, X, Search, ChevronLeft, ChevronRight, Package, Coins, AlertCircle } from 'lucide-react';
import { Material } from '../types';
import { apiClient, MaterialData } from '../lib/api';
import { ErrorPopup } from '../components/ErrorPopup';

const CATEGORIES = ['RAW', 'FINISHING', 'HARDWARE'];
const UNITS = ['PCS', 'BOX', 'LEMBAR', 'KG', 'METER', 'ROLL', 'SET', 'LITER'];

export const Materials: React.FC = () => {
  const { can } = useStore();
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adjustModal, setAdjustModal] = useState<{id: string | number, name: string} | null>(null);
  const [adjustValue, setAdjustValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  if (!can('view', 'MATERIALS')) return <div className="p-8 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  const generateSKU = (category: string = 'RAW') => {
    const categoryAbbreviations: { [key: string]: string } = {
      RAW: 'RAW',
      FINISHING: 'FIN',
      HARDWARE: 'HW',
    };

    const categoryAbbr = categoryAbbreviations[category] || 'GEN';
    const materialsWithCategory = materials.filter(m => m.category === category);
    const nextNumber = materialsWithCategory.length + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${categoryAbbr}-${paddedNumber}`;
  };

  const initialFormState: Partial<MaterialData> = {
    code: '', name: '', unit: 'PCS', current_stock: 0, safety_stock: 0, price_per_unit: 0, category: 'RAW'
  };
  const [formData, setFormData] = useState<Partial<MaterialData>>(initialFormState);

  useEffect(() => {
    fetchMaterials(1);
  }, []);

  const fetchMaterials = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMaterials(page, itemsPerPage, search || searchTerm);
      if (response.success && response.data?.data) {
        setMaterials(response.data.data);
        if (response.data.last_page) {
          setTotalPages(response.data.last_page);
        }
      } else {
        setError(response.message || 'Gagal memuat data material');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        code: formData.code!,
        name: formData.name!,
        unit: formData.unit!,
        current_stock: formData.current_stock!,
        safety_stock: formData.safety_stock!,
        price_per_unit: formData.price_per_unit!,
        category: formData.category! as any,
      };

      if (editingId) {
        await apiClient.updateMaterial(editingId, payload);
        await fetchMaterials(currentPage);
      } else {
        await apiClient.createMaterial(payload);
        setCurrentPage(1);
        await fetchMaterials(1);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (err) {
      setError('Gagal menyimpan material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Yakin ingin menghapus material ini?')) {
      setIsLoading(true);
      try {
        await apiClient.deleteMaterial(id);
        await fetchMaterials(currentPage);
      } catch (err) {
        setError('Gagal menghapus material');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustModal) {
      setIsLoading(true);
      try {
        const operation = adjustValue >= 0 ? 'add' : 'reduce';
        await apiClient.updateMaterialStock(adjustModal.id, Math.abs(adjustValue), operation);
        await fetchMaterials(currentPage);
        setAdjustModal(null);
        setAdjustValue(0);
      } catch (err) {
        setError('Gagal mengubah stok');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inventory Material</h1>
            <p className="text-slate-500 font-bold">Monitor ketersediaan stok bahan baku manufaktur</p>
         </div>
         <button onClick={() => { setEditingId(null); setFormData({ ...initialFormState, code: generateSKU('RAW') }); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">+ TAMBAH MATERIAL</button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari material berdasarkan SKU atau Nama..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); fetchMaterials(1, e.target.value); }} />
           </div>
        </div>

        <table className="w-full text-sm text-left">
           <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
              <tr>
                 <th className="px-8 py-5">Identitas Material (SKU)</th>
                 <th className="px-8 py-5">Kategori</th>
                 <th className="px-8 py-5 text-center">Stok Fisik</th>
                 <th className="px-8 py-5 text-center">Batas Minimum</th>
                 <th className="px-8 py-5 text-right">Harga Satuan</th>
                 <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 font-bold">
              {isLoading ? (
                 <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-500">Memuat data...</td></tr>
              ) : materials.length === 0 ? (
                 <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-500">Tidak ada data material</td></tr>
              ) : (
                 materials.map(mat => (
                    <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5">
                          <p className="text-[10px] text-blue-600 font-black mb-1">{mat.code}</p>
                          <p className="font-black text-slate-800 text-base">{mat.name}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${mat.category === 'RAW' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{mat.category}</span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className={`text-xl font-black ${mat.current_stock < mat.safety_stock ? 'text-red-600' : 'text-slate-800'}`}>{mat.current_stock.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400 ml-2 uppercase tracking-tighter">{mat.unit}</span>
                       </td>
                       <td className="px-8 py-5 text-center text-slate-500 font-bold">{mat.safety_stock} <span className="text-[9px] uppercase tracking-tighter">{mat.unit}</span></td>
                       <td className="px-8 py-5 text-right font-black text-slate-900">Rp {Number(mat.price_per_unit).toLocaleString()}</td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => setAdjustModal({id: mat.id!, name: mat.name})} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Adjustment Stock"><Package size={18}/></button>
                             <button onClick={() => { setEditingId(mat.id!); setFormData(mat); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18}/></button>
                             <button onClick={() => handleDelete(mat.id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                       </td>
                    </tr>
                 ))
              )}
           </tbody>
        </table>

        <div className="p-8 bg-slate-50 border-t flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
           <span>Halaman {currentPage} dari {totalPages || 1}</span>
           <div className="flex items-center gap-4">
              <button disabled={currentPage === 1} onClick={() => { const newPage = currentPage - 1; setCurrentPage(newPage); fetchMaterials(newPage); }} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronLeft size={20}/></button>
              <button disabled={currentPage >= totalPages} onClick={() => { const newPage = currentPage + 1; setCurrentPage(newPage); fetchMaterials(newPage); }} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronRight size={20}/></button>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-bottom-10">
              <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Material Master' : 'Tambah Material Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Kode Unik</label>
                       <input disabled className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-black uppercase outline-none cursor-not-allowed text-slate-600" value={formData.code} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Material</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.category} onChange={e => {
                         const newCategory = e.target.value;
                         const updatedFormData = { ...formData, category: newCategory as any };
                         if (!editingId) {
                           updatedFormData.code = generateSKU(newCategory);
                         }
                         setFormData(updatedFormData);
                       }}>
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Material Lengkap</label>
                       <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satuan / Unit</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                          {UNITS.map(u => (<option key={u} value={u}>{u}</option>))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Saat Ini</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Stock (Limit)</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.safety_stock} onChange={e => setFormData({...formData, safety_stock: Number(e.target.value)})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga Per Satuan</label>
                       <input type="number" step="0.01" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black outline-none" value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: Number(e.target.value)})} />
                    </div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-lg uppercase shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-50">{isLoading ? 'MENYIMPAN...' : 'SIMPAN MASTER MATERIAL'}</button>
                 {error && <p className="text-red-600 text-center font-bold">{error}</p>}
              </form>
           </div>
        </div>
      )}

      {adjustModal && (
         <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-10 shadow-2xl animate-in zoom-in-95 text-center">
               <div className="flex justify-center mb-4"><div className="bg-emerald-100 p-6 rounded-full text-emerald-600"><Package size={48}/></div></div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Adjustment Stock</h3>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">{adjustModal.name}</p>
               <form onSubmit={handleAdjust} className="space-y-8">
                  <div className="flex items-center justify-center gap-6">
                     <button type="button" onClick={() => setAdjustValue(v => v - 10)} className="w-16 h-16 bg-slate-100 rounded-2xl font-black text-xl hover:bg-slate-200">-10</button>
                     <input type="number" className="w-32 text-center text-5xl font-black outline-none bg-transparent" value={adjustValue} onChange={(e) => setAdjustValue(Number(e.target.value))} />
                     <button type="button" onClick={() => setAdjustValue(v => v + 10)} className="w-16 h-16 bg-slate-100 rounded-2xl font-black text-xl hover:bg-slate-200">+10</button>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3 text-amber-700 text-[10px] font-bold uppercase text-left">
                     <AlertCircle size={24}/> Perubahan ini akan langsung mempengaruhi stok gudang saat ini.
                  </div>
                  <div className="flex flex-col gap-3">
                     <button type="submit" disabled={isLoading} className="w-full py-6 bg-emerald-600 text-white rounded-[24px] font-black text-lg shadow-2xl hover:bg-emerald-700 transition-all disabled:opacity-50">{isLoading ? 'MEMPROSES...' : 'EKSEKUSI ADJUSTMENT'}</button>
                     <button type="button" onClick={() => setAdjustModal(null)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest py-2">Batalkan</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
    </div>
  );
};
