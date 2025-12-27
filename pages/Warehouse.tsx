import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import {
  ShieldCheck, Search, Package, CheckCircle, Edit3, X, Save, Warehouse as WhIcon, History, Clock, TrendingUp
} from 'lucide-react';

export const Warehouse: React.FC = () => {
  const { items, projects, tasks, logs, validateToWarehouse } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string, name: string, qty: number } | null>(null);
  const [historyItem, setHistoryItem] = useState<string | null>(null);
  const [shippingItem, setShippingItem] = useState<{ id: string | number, name: string, availableStock: number, shippedQty: number, qtyToShip: number } | null>(null);
  const [finishedGoodsWarehouses, setFinishedGoodsWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch finished goods warehouses from API
  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getFinishedGoodsWarehouses();
        if (response.success && response.data) {
          const warehouseList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setFinishedGoodsWarehouses(warehouseList);
          console.log('Finished goods warehouses loaded:', warehouseList);
        } else {
          setError(response.message || 'Gagal memuat data gudang');
        }
      } catch (err) {
        console.error('Error fetching warehouses:', err);
        setError('Terjadi kesalahan saat memuat data gudang');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWarehouses, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process finished goods warehouses data from API
  const processedWarehouseItems = useMemo(() => {
    return finishedGoodsWarehouses.map(warehouse => {
      const projectName = warehouse.project?.name || 'Unknown Project';

      return {
        id: warehouse.id?.toString() || '',
        name: warehouse.item_name,
        projectId: warehouse.project_id,
        projectName: projectName,
        totalProduced: warehouse.total_produced || 0,
        shippedQty: warehouse.shipped_qty || 0,
        availableStock: warehouse.available_stock || 0,
        unit: warehouse.unit || 'pcs',
        status: warehouse.status || 'not validate',
        createdAt: warehouse.created_at,
        updatedAt: warehouse.updated_at
      };
    });
  }, [finishedGoodsWarehouses]);

  // Still support local items for backward compatibility with validation section
  const processedItems = useMemo(() => {
    return items.map(item => {
      const qcTasks = tasks.filter(t => t.itemId === item.id && t.step === 'QC');
      const totalPassedQC = qcTasks.reduce((acc, t) => acc + t.completedQty, 0);
      const pendingValidation = Math.max(0, totalPassedQC - (item.warehouseQty || 0));
      const availableStock = (item.warehouseQty || 0) - (item.shippedQty || 0);
      const project = projects.find(p => p.id === item.projectId);

      return {
        ...item,
        totalPassedQC,
        pendingValidation,
        availableStock,
        projectName: project?.name || 'Unknown Project'
      };
    });
  }, [items, tasks, projects]);

  // Get the history item details to avoid repeated find() calls
  const historyItemDetails = useMemo(() => {
    return processedWarehouseItems.find(i => i.id === historyItem) || processedItems.find(i => i.id === historyItem);
  }, [processedWarehouseItems, processedItems, historyItem]);

  const validationList = [
    ...processedItems.filter(p => p.pendingValidation > 0),
    ...processedWarehouseItems.filter(p => p.status === 'not validate')
  ];
  const warehouseList = processedWarehouseItems.filter(p => p.status === 'validated' && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const itemHistory = useMemo(() => {
    if (!historyItem) return [];
    return logs.filter(l => l.itemId === historyItem && (l.type === 'OUTPUT' && l.step === 'QC' || l.type === 'WAREHOUSE_ENTRY'));
  }, [logs, historyItem]);

  const handleValidate = async (id: string, qty: number) => {
    setIsSaving(true);
    try {
      // Check if it's an API item (has status field) or local item
      const warehouseItem = finishedGoodsWarehouses.find(item => item.id?.toString() === id);

      if (warehouseItem) {
        // Update API warehouse item status to "validated"
        const response = await apiClient.updateFinishedGoodsWarehouse(id, {
          project_id: warehouseItem.project_id,
          item_name: warehouseItem.item_name,
          total_produced: warehouseItem.total_produced,
          shipped_qty: warehouseItem.shipped_qty,
          available_stock: warehouseItem.available_stock,
          unit: warehouseItem.unit,
          status: 'validated'
        });

        if (response.success) {
          // Refresh warehouse data
          const warehouseResponse = await apiClient.getFinishedGoodsWarehouses();
          if (warehouseResponse.success && warehouseResponse.data) {
            const warehouseList = Array.isArray(warehouseResponse.data) ? warehouseResponse.data : (warehouseResponse.data.data || []);
            setFinishedGoodsWarehouses(warehouseList);
          }
        } else {
          setError(response.message || 'Gagal mengupdate status validasi');
        }
      } else {
        // For local items, use store validation
        validateToWarehouse(id, qty);
      }

      setEditingItem(null);
    } catch (err) {
      console.error('Error validating item:', err);
      setError('Terjadi kesalahan saat memvalidasi item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShipment = async () => {
    if (!shippingItem || shippingItem.qtyToShip <= 0) return;

    setIsSaving(true);
    try {
      const newShippedQty = shippingItem.shippedQty + shippingItem.qtyToShip;
      const newAvailableStock = shippingItem.availableStock - shippingItem.qtyToShip;

      const response = await apiClient.updateFinishedGoodsWarehouse(shippingItem.id, {
        shipped_qty: newShippedQty,
        available_stock: newAvailableStock
      });

      if (response.success) {
        // Refresh warehouse data
        const warehouseResponse = await apiClient.getFinishedGoodsWarehouses();
        if (warehouseResponse.success && warehouseResponse.data) {
          const warehouseList = Array.isArray(warehouseResponse.data) ? warehouseResponse.data : (warehouseResponse.data.data || []);
          setFinishedGoodsWarehouses(warehouseList);
        }
        setShippingItem(null);
      } else {
        setError(response.message || 'Gagal mengupdate pengiriman');
      }
    } catch (err) {
      console.error('Error updating shipment:', err);
      setError('Terjadi kesalahan saat mengupdate pengiriman');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Gudang Jadi</h1>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Validasi Hasil Produksi QC &rarr; Stok Gudang</p>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[24px] p-6">
          <p className="text-sm text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-6">
          <p className="text-sm text-blue-700 font-bold">Memuat data gudang jadi...</p>
        </div>
      )}

      {/* VALIDATION SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><ShieldCheck size={20}/></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Menunggu Validasi Masuk</h2>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Item Pekerjaan</th>
                  <th className="px-8 py-5">Project</th>
                  <th className="px-8 py-5 text-center">Total QC</th>
                  <th className="px-8 py-5 text-center">Tunggu Validasi</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {validationList.map(item => {
                  const isApiItem = 'status' in item && item.status !== undefined;
                  const qtyToValidate = isApiItem ? item.availableStock : item.pendingValidation;
                  const totalQty = isApiItem ? item.totalProduced : item.totalPassedQC;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5 uppercase">{item.name}</td>
                      <td className="px-8 py-5 text-blue-600 text-[10px] uppercase">{item.projectName}</td>
                      <td className="px-8 py-5 text-center text-slate-400">{totalQty}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-emerald-600 font-black text-lg">+{qtyToValidate}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => setEditingItem({ id: item.id, name: item.name, qty: qtyToValidate })}
                          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto"
                        >
                          VALIDASI MANUAL <Edit3 size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {validationList.length === 0 && (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada barang baru dari QC.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STOCK SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><WhIcon size={20}/></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Posisi Stok Gudang Jadi</h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Cari stok..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Asal Project</th>
                  <th className="px-8 py-5 text-center">Total di Gudang</th>
                  <th className="px-8 py-5 text-center">Sedia Kirim</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {warehouseList.map(it => (
                  <tr key={it.id} className="hover:bg-slate-50/50 group">
                    <td className="px-8 py-5 uppercase">{it.name}</td>
                    <td className="px-8 py-5 text-blue-600 text-[10px] uppercase">{it.projectName}</td>
                    <td className="px-8 py-5 text-center text-slate-400">{it.totalProduced}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 font-black text-lg">
                        {it.availableStock} {it.unit}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right flex gap-3 items-center justify-end">
                       {it.availableStock > 0 && (
                         <button onClick={() => setShippingItem({ id: it.id, name: it.name, availableStock: it.availableStock, shippedQty: it.shippedQty, qtyToShip: 0 })} className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-all border border-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase"><Package size={16}/> KIRIM</button>
                       )}
                       <button onClick={() => setHistoryItem(it.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase"><History size={16}/> RIWAYAT</button>
                    </td>
                  </tr>
                ))}
                {warehouseList.length === 0 && !isLoading && (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada barang di gudang jadi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {historyItem && (
        <div className="fixed inset-0 bg-slate-900/90 z-[500] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase">Riwayat Stok Barang Jadi</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{historyItemDetails?.name}</p>
                 </div>
                 <button onClick={() => setHistoryItem(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 {itemHistory.length > 0 ? itemHistory.map(log => (
                    <div key={log.id} className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 flex justify-between items-center">
                       <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${log.type === 'WAREHOUSE_ENTRY' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                             {log.type === 'WAREHOUSE_ENTRY' ? <WhIcon size={24}/> : <ShieldCheck size={24}/>}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                             <h4 className="font-black text-slate-800 uppercase">{log.type === 'WAREHOUSE_ENTRY' ? 'MASUK GUDANG (ACC)' : 'LOLOS QC'}</h4>
                             <p className="text-[9px] font-black text-blue-500 uppercase mt-1">Operator: {log.operator}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-2xl font-black ${log.type === 'WAREHOUSE_ENTRY' ? 'text-emerald-600' : 'text-blue-600'}`}>
                             +{log.goodQty}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PCS</p>
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Belum ada riwayat tercatat.</div>
                 )}
              </div>
              <div className="p-8 border-t bg-slate-50">
                 <button onClick={() => setHistoryItem(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest">Tutup Riwayat</button>
              </div>
           </div>
        </div>
      )}

      {/* EDIT QTY MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="bg-amber-100 p-5 rounded-full text-amber-600 inline-block mb-6"><WhIcon size={40}/></div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Validasi Qty Masuk</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest mb-8">{editingItem.name}</p>
            <div className="space-y-6">
              <input type="number" disabled={isSaving} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-4xl font-black text-center outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" value={editingItem.qty} onChange={e => setEditingItem({...editingItem, qty: Number(e.target.value)})} />
              <div className="flex flex-col gap-3">
                <button onClick={() => handleValidate(editingItem.id, editingItem.qty)} disabled={isSaving} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={18}/> {isSaving ? 'MENYIMPAN...' : 'SIMPAN KE GUDANG'}</button>
                <button onClick={() => setEditingItem(null)} disabled={isSaving} className="text-slate-400 font-black text-[10px] uppercase tracking-widest py-2 disabled:opacity-50">Batalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIPMENT MODAL */}
      {shippingItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="bg-emerald-100 p-5 rounded-full text-emerald-600 inline-block mb-6"><Package size={40}/></div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Pencatatan Pengiriman</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest mb-8">{shippingItem.name}</p>
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Tersedia</p>
                <p className="text-3xl font-black text-slate-900">{shippingItem.availableStock}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Qty Dikirim</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setShippingItem({...shippingItem, qtyToShip: Math.max(0, shippingItem.qtyToShip - 1)})} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 font-black text-lg hover:bg-slate-200 transition-all">-</button>
                  <input type="number" className="w-24 text-center text-5xl font-black outline-none border-none bg-transparent" value={shippingItem.qtyToShip} onChange={(e) => setShippingItem({...shippingItem, qtyToShip: Math.min(shippingItem.availableStock, Math.max(0, Number(e.target.value)))})} />
                  <button onClick={() => setShippingItem({...shippingItem, qtyToShip: Math.min(shippingItem.availableStock, shippingItem.qtyToShip + 1)})} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 font-black text-lg hover:bg-slate-200 transition-all">+</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleShipment} disabled={isSaving || shippingItem.qtyToShip <= 0} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"><Package size={18}/> {isSaving ? 'MENYIMPAN...' : 'CATAT PENGIRIMAN'}</button>
                <button onClick={() => setShippingItem(null)} disabled={isSaving} className="text-slate-400 font-black text-[10px] uppercase tracking-widest py-2 disabled:opacity-50">Batalkan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
