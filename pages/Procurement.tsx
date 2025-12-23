import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import {
  Plus, Search, ShoppingCart, FileText, Truck, Users, Trash2, ArrowRight, CheckCircle, Package, Clock, X, ChevronRight, Save, Coins, FileSpreadsheet
} from 'lucide-react';
import { Supplier, RFQ, PurchaseOrder, ReceivingGoods, ProcurementItem, Material } from '../types';

type TabType = 'SUPPLIERS' | 'RFQ' | 'PO' | 'RECEIVING';

export const Procurement: React.FC = () => {
  const { suppliers, rfqs: mockRfqs, pos, receivings, materials: storeMaterials, addSupplier, addRFQ, createPO, receiveGoods, can } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('RFQ');

  // API State - RFQ
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoadingRfqs, setIsLoadingRfqs] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);

  // API State - RFQ Items
  const [rfqItemsByRfq, setRfqItemsByRfq] = useState<Record<string | number, ProcurementItem[]>>({});
  const [isLoadingRfqItems, setIsLoadingRfqItems] = useState(false);
  const [rfqItemsError, setRfqItemsError] = useState<string | null>(null);

  // API State - Materials
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // Modals
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState<RFQ | null>(null);
  const [isBdModalOpen, setIsBdModalOpen] = useState<PurchaseOrder | null>(null);

  // RFQ State
  const [newRfq, setNewRfq] = useState({ description: '', items: [] as ProcurementItem[] });
  const [tempItem, setTempItem] = useState({ materialId: '', qty: 0 });
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);

  // PO State
  const [poData, setPoData] = useState({ supplierId: '', description: '', items: [] as ProcurementItem[] });

  // Receiving State
  const [bdData, setBdData] = useState({ description: '' });

  // Fetch RFQ Items for a specific RFQ
  const fetchRfqItems = async (rfqId: string | number) => {
    try {
      const response = await apiClient.getRFQItemsByRFQId(rfqId);
      if (response.success && response.data) {
        const itemsData = response.data.data || [];
        if (Array.isArray(itemsData)) {
          const convertedItems: ProcurementItem[] = itemsData.map(item => ({
            materialId: typeof item.material_id === 'string' ? item.material_id : item.material_id.toString(),
            name: item.name,
            qty: item.qty
          }));
          setRfqItemsByRfq(prev => ({
            ...prev,
            [rfqId]: convertedItems
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching RFQ items for RFQ ${rfqId}:`, error);
    }
  };

  // Fetch RFQs from API on component mount
  useEffect(() => {
    const fetchRfqs = async () => {
      setIsLoadingRfqs(true);
      setRfqError(null);
      try {
        const response = await apiClient.getRFQs();

        if (response.success && response.data) {
          // Handle the response data structure
          const rfqData = response.data.data || response.data;

          if (Array.isArray(rfqData)) {
            // Convert API RFQData to RFQ type
            const convertedRfqs: RFQ[] = rfqData.map(rfq => ({
              id: typeof rfq.id === 'string' ? rfq.id : rfq.id.toString(),
              code: rfq.code,
              date: rfq.date,
              description: rfq.description || '',
              status: rfq.status,
              items: [] // Will be populated from RFQ Items API
            }));
            setRfqs(convertedRfqs);

            // Fetch items for each RFQ
            convertedRfqs.forEach(rfq => {
              fetchRfqItems(rfq.id);
            });
          } else {
            // API returned data but not in expected format
            console.warn('API returned unexpected data structure:', response.data);
            setRfqs([]);
          }
        } else {
          setRfqError(response.message || 'Failed to fetch RFQs');
          setRfqs([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch RFQs';
        console.error('Error fetching RFQs:', errorMessage);
        setRfqError(errorMessage);
        setRfqs([]);
      } finally {
        setIsLoadingRfqs(false);
      }
    };

    fetchRfqs();
  }, []); // Empty dependency array - only fetch on mount

  // Fetch Materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoadingMaterials(true);
      setMaterialsError(null);
      try {
        const response = await apiClient.getMaterials(1, 100);
        if (response.success && response.data) {
          // Handle the response data structure
          const materialDataList = response.data.data?.data || response.data.data || [];

          if (Array.isArray(materialDataList)) {
            // Convert API MaterialData to Material type
            const convertedMaterials: Material[] = materialDataList.map(mat => ({
              id: typeof mat.id === 'string' ? mat.id : mat.id?.toString() || '',
              code: mat.code,
              name: mat.name,
              unit: mat.unit,
              currentStock: mat.current_stock,
              safetyStock: mat.safety_stock,
              pricePerUnit: mat.price_per_unit,
              category: mat.category
            }));
            setMaterials(convertedMaterials);
          } else {
            // API returned data but not in expected format
            console.warn('API returned unexpected materials structure:', response.data);
            setMaterials(storeMaterials);
          }
        } else {
          setMaterialsError(response.message || 'Failed to fetch materials');
          // Fallback to store materials if API fails
          setMaterials(storeMaterials);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch materials';
        console.error('Error fetching materials:', errorMessage);
        setMaterialsError(errorMessage);
        // Fallback to store materials
        setMaterials(storeMaterials);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [storeMaterials]);

  if (!can('view', 'PROCUREMENT')) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">Akses Ditolak.</div>;

  // Handlers
  const handleAddRfqItem = () => {
    const mat = materials.find(m => m.id === tempItem.materialId);
    if (mat && tempItem.qty > 0) {
      setNewRfq(prev => ({
        ...prev,
        items: [...prev.items, { materialId: mat.id, name: mat.name, qty: tempItem.qty }]
      }));
      setTempItem({ materialId: '', qty: 0 });
    }
  };

  const submitRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRfq.items.length === 0) return alert("Pilih item!");

    setIsSubmittingRfq(true);
    try {
      const rfqCode = `RFQ-${Math.floor(Math.random() * 9000) + 1000}`;
      const response = await apiClient.createRFQ({
        code: rfqCode,
        date: new Date().toISOString(),
        description: newRfq.description,
        status: 'DRAFT'
      });

      if (response.success && response.data) {
        // Handle the response data structure safely
        const rfqData = response.data.data || response.data;

        // Validate that we have the required fields
        if (!rfqData || !rfqData.id || !rfqData.code) {
          console.error('Invalid RFQ response data:', response.data);
          alert('Error: Response dari API tidak valid');
          return;
        }

        const rfqId = typeof rfqData.id === 'string' ? rfqData.id : rfqData.id.toString();

        // Create RFQ Items via API
        try {
          setIsLoadingRfqItems(true);
          const createdItems: ProcurementItem[] = [];

          for (const item of newRfq.items) {
            const itemResponse = await apiClient.createRFQItem({
              rfq_id: rfqId,
              material_id: item.materialId,
              name: item.name,
              qty: item.qty
            });

            if (itemResponse.success && itemResponse.data) {
              const itemData = itemResponse.data.data || itemResponse.data;
              createdItems.push({
                materialId: typeof itemData.material_id === 'string' ? itemData.material_id : itemData.material_id.toString(),
                name: itemData.name,
                qty: itemData.qty
              });
            } else {
              console.warn(`Failed to create item ${item.name}:`, itemResponse.message);
            }
          }

          // Store the created items in the local cache
          setRfqItemsByRfq(prev => ({
            ...prev,
            [rfqId]: createdItems
          }));

          // Create new RFQ object with items from the form
          const newRfqData: RFQ = {
            id: rfqId,
            code: rfqData.code,
            date: rfqData.date,
            description: rfqData.description || newRfq.description,
            items: createdItems.length > 0 ? createdItems : newRfq.items,
            status: rfqData.status || 'DRAFT'
          };

          // Update local state
          setRfqs(prev => [...prev, newRfqData]);

          // Also add to store for consistency
          addRFQ(newRfqData);

          setNewRfq({ description: '', items: [] });
          setIsRfqModalOpen(false);

          alert(`RFQ ${rfqCode} berhasil dibuat dengan ${createdItems.length} item!`);
        } catch (itemError) {
          const errorMessage = itemError instanceof Error ? itemError.message : 'Gagal membuat item RFQ';
          console.error('Error creating RFQ items:', errorMessage);
          alert(`RFQ dibuat namun ada error saat membuat item: ${errorMessage}`);
        } finally {
          setIsLoadingRfqItems(false);
        }
      } else {
        alert(response.message || 'Gagal membuat RFQ');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      console.error('Submit RFQ error:', errorMessage, error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const startCreatePO = (rfq: RFQ) => {
    setPoData({ supplierId: '', description: rfq.description, items: rfq.items.map(i => ({ ...i, price: 0 })) });
    setIsPoModalOpen(rfq);
    setActiveTab('PO');
  };

  const submitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poData.supplierId) return alert("Pilih Supplier!");
    const grandTotal = poData.items.reduce((acc, curr) => acc + ((curr.price || 0) * curr.qty), 0);
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
      rfqId: isPoModalOpen?.id,
      supplierId: poData.supplierId,
      date: new Date().toISOString(),
      description: poData.description,
      items: poData.items.map(i => ({ ...i, subtotal: (i.price || 0) * i.qty })),
      grandTotal,
      status: 'OPEN'
    };
    createPO(po);
    setIsPoModalOpen(null);
  };

  const startReceiving = (po: PurchaseOrder) => {
    setBdData({ description: po.description });
    setIsBdModalOpen(po);
  };

  const submitBD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBdModalOpen) return;
    const bd: ReceivingGoods = {
      id: `bd-${Date.now()}`,
      code: `BD-${Math.floor(Math.random() * 9000) + 1000}`,
      poId: isBdModalOpen.id,
      supplierId: isBdModalOpen.supplierId,
      date: new Date().toISOString(),
      description: bdData.description,
      items: isBdModalOpen.items
    };
    receiveGoods(bd);
    setIsBdModalOpen(null);
    setActiveTab('RECEIVING');
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Sistem Pengadaan</h1>
           <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Alur RFQ &rarr; PO &rarr; Barang Datang &rarr; Update Stok</p>
        </div>
        <div className="flex gap-4">
           {activeTab === 'RFQ' && (
             <button onClick={() => setIsRfqModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3"><Plus size={18}/> BUAT RFQ BARU</button>
           )}
        </div>
      </div>

      {/* TABS Navigation */}
      <div className="flex gap-8 border-b-2 border-slate-100 px-6">
        {(['RFQ', 'PO', 'RECEIVING', 'SUPPLIERS'] as const).map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`pb-6 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {tab === 'RECEIVING' ? 'Barang Datang' : tab}
           </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'RFQ' && (
        <div className="space-y-6">
          {rfqError && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[32px] p-6 flex items-start gap-4">
              <div className="text-amber-600 font-black text-xl">⚠️</div>
              <div className="flex-1">
                <p className="font-black text-amber-900 text-sm uppercase tracking-widest">API Integration Status - RFQ</p>
                <p className="text-amber-700 text-sm mt-1">{rfqError}</p>
              </div>
            </div>
          )}
          {rfqItemsError && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[32px] p-6 flex items-start gap-4">
              <div className="text-amber-600 font-black text-xl">⚠️</div>
              <div className="flex-1">
                <p className="font-black text-amber-900 text-sm uppercase tracking-widest">API Integration Status - RFQ Items</p>
                <p className="text-amber-700 text-sm mt-1">{rfqItemsError}</p>
              </div>
            </div>
          )}
          {isLoadingRfqs && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-[32px] p-6 text-center">
              <p className="font-black text-blue-600 uppercase tracking-widest">Memuat RFQ dari API...</p>
            </div>
          )}
          {isLoadingRfqItems && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-[32px] p-6 text-center">
              <p className="font-black text-blue-600 uppercase tracking-widest">Memuat RFQ Items dari API...</p>
            </div>
          )}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Kode / Tanggal</th>
                  <th className="px-8 py-5">Deskripsi</th>
                  <th className="px-8 py-5">Total Item</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold">
                 {rfqs.map(r => {
                   // Use items from the API cache first, then fall back to RFQ items, then store data
                   const apiItems = rfqItemsByRfq[r.id] || [];
                   const storeRfq = mockRfqs.find(m => m.id === r.id || m.code === r.code);
                   const displayItems = apiItems.length > 0 ? apiItems : (r.items && r.items.length > 0 ? r.items : (storeRfq?.items || []));

                   return (
                   <tr key={r.id} className="hover:bg-slate-50/50">
                     <td className="px-8 py-5">
                        <p className="text-blue-600 font-black">{r.code}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(r.date).toLocaleDateString()}</p>
                     </td>
                     <td className="px-8 py-5 text-slate-600">{r.description || '-'}</td>
                     <td className="px-8 py-5">{displayItems.length} Macam Material</td>
                     <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.status === 'PO_CREATED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{r.status}</span>
                     </td>
                     <td className="px-8 py-5 text-right">
                        {r.status === 'DRAFT' && (
                          <button onClick={() => startCreatePO({ ...r, items: displayItems })} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto">Buat PO <ChevronRight size={14}/></button>
                        )}
                     </td>
                   </tr>
                   );
                 })}
                 {rfqs.length === 0 && !isLoadingRfqs && <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest">Belum ada RFQ</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PO' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Kode / Tanggal</th>
                <th className="px-8 py-5">Supplier</th>
                <th className="px-8 py-5">Nilai Transaksi</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
               {pos.map(p => (
                 <tr key={p.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-emerald-600 font-black">{p.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(p.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-slate-800">{suppliers.find(s => s.id === p.supplierId)?.name}</td>
                   <td className="px-8 py-5 text-blue-600 font-black">Rp {p.grandTotal.toLocaleString()}</td>
                   <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'RECEIVED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      {p.status === 'OPEN' && (
                        <button onClick={() => startReceiving(p)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto">Penerimaan Barang <Truck size={14}/></button>
                      )}
                   </td>
                 </tr>
               ))}
               {pos.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest">Belum ada PO</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'RECEIVING' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Kode BD / Tanggal</th>
                <th className="px-8 py-5">Kode PO</th>
                <th className="px-8 py-5">Supplier</th>
                <th className="px-8 py-5">Item Diterima</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
               {receivings.map(bd => (
                 <tr key={bd.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5">
                      <p className="text-slate-900 font-black">{bd.code}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(bd.date).toLocaleDateString()}</p>
                   </td>
                   <td className="px-8 py-5 text-blue-600">{pos.find(p => p.id === bd.poId)?.code}</td>
                   <td className="px-8 py-5">{suppliers.find(s => s.id === bd.supplierId)?.name}</td>
                   <td className="px-8 py-5">
                      <p className="text-[10px] uppercase font-black text-slate-400">Total Macam: {bd.items.length}</p>
                      <p className="text-slate-800">{bd.items.reduce((acc, c) => acc + c.qty, 0)} Units</p>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1"><CheckCircle size={10}/> Stok Diupdate</div>
                   </td>
                 </tr>
               ))}
               {receivings.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest">Belum ada pengiriman barang datang</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'SUPPLIERS' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Nama Supplier</th>
                <th className="px-8 py-5">Kontak</th>
                <th className="px-8 py-5">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
               {suppliers.map(s => (
                 <tr key={s.id} className="hover:bg-slate-50/50">
                   <td className="px-8 py-5 text-slate-900">{s.name}</td>
                   <td className="px-8 py-5 text-slate-600">{s.contact}</td>
                   <td className="px-8 py-5 text-slate-400 italic text-[11px]">{s.address}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL RFQ */}
      {isRfqModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Buat RFQ Pengadaan</h2>
                 <button onClick={() => setIsRfqModalOpen(false)} className="p-4 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan / Tujuan RFQ</label>
                    <input className="w-full p-6 bg-slate-50 rounded-[28px] font-black text-lg outline-none" placeholder="e.g. Pengadaan Plat Besi Q1" value={newRfq.description} onChange={e => setNewRfq({...newRfq, description: e.target.value})} />
                 </div>

                 <div className="bg-blue-50/50 p-8 rounded-[40px] border-2 border-blue-100 border-dashed space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Tambah Item dari Master Material</h4>
                       {isLoadingMaterials && <span className="text-[9px] text-blue-600 font-bold animate-pulse">Mengambil data material...</span>}
                       {materialsError && <span className="text-[9px] text-amber-600 font-bold">⚠️ Error: {materialsError}</span>}
                    </div>
                    <div className="flex gap-6 items-center">
                       <select
                          disabled={isLoadingMaterials || materials.length === 0}
                          className="flex-1 p-5 bg-white rounded-2xl font-black outline-none border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          value={tempItem.materialId}
                          onChange={e => setTempItem({...tempItem, materialId: e.target.value})}
                       >
                          <option value="">{isLoadingMaterials ? 'Memuat material...' : 'Pilih Material...'}</option>
                          {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.currentStock} {m.unit} Tersedia)</option>)}
                       </select>
                       <input
                          type="number"
                          className="w-32 p-5 bg-white rounded-2xl font-black text-center border border-slate-200"
                          placeholder="Qty"
                          value={tempItem.qty}
                          onChange={e => setTempItem({...tempItem, qty: Number(e.target.value)})}
                       />
                       <button
                          onClick={handleAddRfqItem}
                          disabled={isLoadingMaterials}
                          className="bg-blue-600 text-white p-5 rounded-2xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          <Plus/>
                       </button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Item RFQ</h4>
                    <div className="divide-y border rounded-[32px] overflow-hidden">
                       {newRfq.items.map((it, idx) => (
                         <div key={idx} className="p-6 flex justify-between items-center bg-white hover:bg-slate-50">
                            <div>
                               <p className="font-black text-slate-800">{it.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Material ID: {it.materialId}</p>
                            </div>
                            <div className="flex items-center gap-10">
                               <p className="text-2xl font-black text-blue-600">{it.qty} <span className="text-[10px] text-slate-400">{materials.find(m => m.id === it.materialId)?.unit}</span></p>
                               <button onClick={() => setNewRfq(prev => ({...prev, items: prev.items.filter((_, i) => i !== idx)}))} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                            </div>
                         </div>
                       ))}
                       {newRfq.items.length === 0 && <div className="p-10 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest">Belum ada item ditambahkan</div>}
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t bg-slate-50 flex justify-end">
                  <button
                    onClick={submitRFQ}
                    disabled={isSubmittingRfq}
                    className={`px-12 py-6 rounded-[32px] font-black text-lg uppercase shadow-2xl tracking-widest flex items-center gap-4 transition-all ${isSubmittingRfq ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                  >
                    <Save/> {isSubmittingRfq ? 'Menyimpan...' : 'Simpan RFQ'}
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL PO */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-10 border-b bg-emerald-50/50 flex justify-between items-center">
                 <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Terbitkan PO dari {isPoModalOpen.code}</h2>
                 <button onClick={() => setIsPoModalOpen(null)} className="p-4 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Supplier Resmi</label>
                       <select className="w-full p-6 bg-slate-50 rounded-[28px] font-black text-lg outline-none border-2 border-slate-100" value={poData.supplierId} onChange={e => setPoData({...poData, supplierId: e.target.value})}>
                          <option value="">Cari Supplier...</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Pesanan</label>
                       <input className="w-full p-6 bg-slate-50 rounded-[28px] font-black text-lg outline-none border-2 border-slate-100" value={poData.description} onChange={e => setPoData({...poData, description: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rincian Item & Harga Satuan</h4>
                    <div className="border rounded-[40px] overflow-hidden bg-slate-50">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                             <tr>
                                <th className="px-8 py-4">Item Material</th>
                                <th className="px-8 py-4 text-center">Qty</th>
                                <th className="px-8 py-4 text-right">Harga Satuan (IDR)</th>
                                <th className="px-8 py-4 text-right">Subtotal</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-bold">
                             {poData.items.map((it, idx) => (
                               <tr key={idx}>
                                  <td className="px-8 py-5 text-slate-800">{it.name}</td>
                                  <td className="px-8 py-5 text-center">{it.qty}</td>
                                  <td className="px-8 py-5 text-right">
                                     <input 
                                        type="number" 
                                        className="w-40 p-3 bg-white border border-slate-300 rounded-xl text-right font-black"
                                        placeholder="0"
                                        value={it.price}
                                        onChange={e => setPoData(prev => ({
                                          ...prev,
                                          items: prev.items.map((x, i) => i === idx ? { ...x, price: Number(e.target.value) } : x)
                                        }))}
                                     />
                                  </td>
                                  <td className="px-8 py-5 text-right text-blue-600">Rp {((it.price || 0) * it.qty).toLocaleString()}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t bg-slate-50 flex justify-between items-center">
                  <div className="text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Nilai PO</p>
                     <p className="text-4xl font-black text-blue-600 tracking-tighter">Rp {poData.items.reduce((acc, curr) => acc + ((curr.price || 0) * curr.qty), 0).toLocaleString()}</p>
                  </div>
                  <button onClick={submitPO} className="bg-emerald-600 text-white px-12 py-6 rounded-[32px] font-black text-lg uppercase shadow-2xl tracking-widest flex items-center gap-4 hover:bg-slate-900 transition-all"><ShoppingCart/> Terbitkan Purchase Order</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL BARANG DATANG */}
      {isBdModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] w-full max-w-2xl p-10 space-y-10 shadow-2xl animate-in zoom-in-95 text-center">
               <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl"><Truck size={48}/></div>
               <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Konfirmasi Barang Datang</h3>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Menarik data dari: {isBdModalOpen.code}</p>
               
               <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 text-left space-y-6">
                   <div className="flex justify-between items-center border-b pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Pengirim</span>
                      <span className="font-black text-slate-900">{suppliers.find(s => s.id === isBdModalOpen.supplierId)?.name}</span>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Item yang Diterima (Sesuai PO)</p>
                      {isBdModalOpen.items.map((it, idx) => (
                         <div key={idx} className="flex justify-between font-black text-sm">
                            <span className="text-slate-600">{it.name}</span>
                            <span className="text-blue-600">{it.qty} {materials.find(m => m.id === it.materialId)?.unit}</span>
                         </div>
                      ))}
                   </div>
               </div>

               <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-6 text-emerald-700 text-xs font-bold uppercase text-left">
                  <div className="bg-white p-3 rounded-2xl shadow-sm"><Package size={24}/></div>
                  <span>Mengklik tombol konfirmasi akan secara otomatis menambah stok di Gudang Material.</span>
               </div>

               <div className="flex flex-col gap-4">
                  <button onClick={submitBD} className="w-full py-7 bg-blue-600 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all">KONFIRMASI PENERIMAAN BARANG</button>
                  <button onClick={() => setIsBdModalOpen(null)} className="text-slate-400 font-black uppercase text-[10px] tracking-widest py-2 hover:text-slate-600 transition-all">Tutup</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
