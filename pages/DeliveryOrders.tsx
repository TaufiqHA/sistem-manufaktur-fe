import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import {
  Plus, Truck, Search, X, CheckCircle, Package, Calendar, MapPin, User, Trash2, Save, ArrowRight, FolderKanban, Box, AlertCircle, Info, ChevronLeft, ChevronRight, Eye, ShieldCheck, Edit3
} from 'lucide-react';
import { DeliveryOrder, DeliveryOrderItem, Project } from '../types';

type TabType = 'DRAFT' | 'HISTORY';

export const DeliveryOrders: React.FC = () => {
  const { items, projects, deliveryOrders, tasks, createDeliveryOrder, updateDeliveryOrder, validateDeliveryOrder, deleteDeliveryOrder, can } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('DRAFT');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSJ, setSelectedSJ] = useState<DeliveryOrder | null>(null);
  const [editingSJ, setEditingSJ] = useState<DeliveryOrder | null>(null);

  const [sjData, setSjData] = useState({
    customer: '', address: '', driverName: '', vehiclePlate: '', note: '', items: [] as Array<DeliveryOrderItem & { warehouseId?: string | number }>
  });

  // API state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiDeliveryOrders, setApiDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState<string | null>(null);
  const [warehouseData, setWarehouseData] = useState<any[]>([]);
  const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(false);
  const [apiProjects, setApiProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch delivery orders from API on component mount
  useEffect(() => {
    fetchDeliveryOrders();
    fetchWarehouseData();
    fetchProjects();
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both delivery orders and items in parallel
      const [ordersResponse, itemsResponse] = await Promise.all([
        apiClient.getDeliveryOrders(),
        apiClient.getDeliveryOrderItems()
      ]);

      if (ordersResponse.success && ordersResponse.data) {
        // Map API response to local format
        let orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data.data || [];

        // Extract items from response
        let items: any[] = [];
        if (itemsResponse.success && itemsResponse.data) {
          items = Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data.data || [];
        }

        // Transform API data to match DeliveryOrder type
        orders = orders.map(order => {
          // Find all items for this delivery order
          const orderItems = items.filter(item => item.delivery_order_id === order.id);

          // Transform items to DeliveryOrderItem format
          const transformedItems = orderItems.map(item => ({
            projectId: item.project_id?.toString() || '',
            projectName: item.project_name || '',
            itemId: item.id?.toString() || '',
            itemName: item.item_name || '',
            qty: item.qty || 0,
            unit: item.unit || 'pcs',
            warehouseId: item.warehouse_id
          }));

          // Normalize status to uppercase
          const normalizedStatus = order.status ? order.status.toUpperCase() : 'DRAFT';

          return {
            id: order.id?.toString() || '',
            code: order.code || '',
            date: order.date || new Date().toISOString(),
            customer: order.customer || '',
            address: order.address || '',
            driverName: order.driver_name || '',
            vehiclePlate: order.vehicle_plate || '',
            items: transformedItems,
            status: normalizedStatus,
            note: order.note || '',
            created_at: order.created_at,
            updated_at: order.updated_at
          };
        });

        setApiDeliveryOrders(orders);

        // Log breakdown by status
        const draftCount = orders.filter(o => o.status === 'DRAFT').length;
        const validatedCount = orders.filter(o => o.status === 'VALIDATED').length;
        console.log('✓ Delivery orders loaded from API:', {
          total: orders.length,
          drafts: draftCount,
          validated: validatedCount,
          orders: orders
        });
      } else {
        // Fall back to store data if API fails
        console.warn('No delivery orders from API, using local store');
        setApiDeliveryOrders(deliveryOrders);
      }
    } catch (err) {
      console.error('Failed to fetch delivery orders:', err);
      // Fallback to store data on error
      setApiDeliveryOrders(deliveryOrders);
      setError('Gagal memuat data surat jalan. Menggunakan data lokal.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouseData = async () => {
    try {
      setIsLoadingWarehouse(true);
      const response = await apiClient.getFinishedGoodsWarehouses();
      if (response.success && response.data) {
        const warehouseList = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setWarehouseData(warehouseList);
        console.log('Finished Goods Warehouse data loaded:', warehouseList);
      }
    } catch (err) {
      console.error('Failed to fetch warehouse data:', err);
      setError('Gagal memuat data gudang jadi. Menggunakan data lokal.');
    } finally {
      setIsLoadingWarehouse(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await apiClient.getProjects();
      if (response.success && response.data) {
        const projectsList = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setApiProjects(projectsList);
        console.log('Projects data loaded from API:', projectsList);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      // Don't show error for projects, just use local data
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const processedItems = useMemo(() => {
    return items.map(item => {
      const project = projects.find(p => p.id === item.projectId);
      // Check warehouse API data first, then fall back to local data
      const warehouseItem = warehouseData.find(
        w => w.project_id === Number(item.projectId) &&
             w.item_name?.toLowerCase() === item.name?.toLowerCase()
      );

      const availableStock = warehouseItem
        ? warehouseItem.available_stock || 0
        : (item.warehouseQty || 0) - (item.shippedQty || 0);

      return {
        ...item,
        availableStock,
        projectName: project?.name || 'N/A',
        warehouseId: warehouseItem?.id,
        totalProduced: warehouseItem?.total_produced
      };
    });
  }, [items, projects, warehouseData]);

  // Use API data if available, fallback to store data
  const allDeliveryOrders = apiDeliveryOrders.length > 0 ? apiDeliveryOrders : deliveryOrders;
  const drafts = allDeliveryOrders.filter(o => o.status?.toUpperCase() === 'DRAFT');
  const history = allDeliveryOrders.filter(o => o.status?.toUpperCase() === 'VALIDATED');

  console.log('Status filtering:', {
    allOrdersCount: allDeliveryOrders.length,
    draftsCount: drafts.length,
    historyCount: history.length,
    statusBreakdown: allDeliveryOrders.map(o => ({ id: o.id, code: o.code, status: o.status }))
  });

  const filteredHistory = history.filter(sj => 
    sj.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sj.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper function to get warehouse stock by item
  const getWarehouseStock = (itemName: string, projectId: string | number) => {
    const warehouseItem = warehouseData.find(
      w => w.project_id === Number(projectId) &&
           w.item_name?.toLowerCase() === itemName?.toLowerCase()
    );
    return warehouseItem ? warehouseItem.available_stock || 0 : 0;
  };

  // Helper function to get project list (API first, fallback to store)
  // Only shows projects that have items with available stock in warehouse
  const getAvailableProjects = () => {
    if (apiProjects.length > 0) {
      return apiProjects
        .filter(p => {
          // Check if project has active status
          const isActiveProject = p.status === 'IN_PROGRESS' ||
            p.status === 'in_progress' ||
            p.status === 'PLANNED' ||
            p.status === 'planned';

          if (!isActiveProject) return false;

          // Check if project has items with available stock in warehouse
          const hasWarehouseItems = warehouseData.some(
            w => w.project_id === Number(p.id) && w.available_stock > 0
          );

          return hasWarehouseItems;
        })
        .map(p => ({
          id: p.id?.toString() || '',
          code: p.code || '',
          name: p.name || '',
          customer: p.customer || '',
          status: p.status,
          qtyPerUnit: p.qty_per_unit || p.qtyPerUnit || 0,
          totalQty: p.total_qty || p.totalQty || 0,
          unit: p.unit || ''
        }));
    }
    return projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNED');
  };

  // Helper function to get available warehouse items
  const getAvailableWarehouseItems = () => {
    return warehouseData
      .filter(item => item.available_stock > 0 && item.status === 'validated')
      .map(item => ({
        warehouseId: item.id,
        itemName: item.item_name,
        projectId: item.project_id,
        projectName: item.project?.name || 'Unknown Project',
        totalProduced: item.total_produced,
        availableStock: item.available_stock,
        unit: item.unit,
        shippedQty: item.shipped_qty || 0
      }));
  };

  // Business Logic: Check if all items in SJ are ready in Warehouse
  const isSjReadyToShip = (sjItems: DeliveryOrderItem[]) => {
    if (sjItems.length === 0) return false;
    return sjItems.every(si => {
      const warehouseStock = getWarehouseStock(si.itemName, si.projectId);
      const localStock = processedItems.find(f => f.id === si.itemId)?.availableStock || 0;
      const availableStock = warehouseStock > 0 ? warehouseStock : localStock;
      return availableStock >= si.qty;
    });
  };

  const addProjectToSJ = (project: Project) => {
    // First try to get items from warehouse API
    const warehouseProjectItems = warehouseData.filter(
      w => w.project_id === Number(project.id)
    );

    let newSjItems: Array<DeliveryOrderItem & { warehouseId?: string | number }> = [];

    if (warehouseProjectItems.length > 0) {
      // Use warehouse API items
      newSjItems = warehouseProjectItems
        .filter(w => w.available_stock > 0)
        .map((item, idx) => ({
          projectId: project.id?.toString() || '',
          projectName: project.name,
          itemId: `warehouse-${item.id}-${idx}`,
          itemName: item.item_name,
          qty: item.available_stock,
          unit: item.unit,
          warehouseId: item.id
        }));
    } else {
      // Fall back to local store items
      const projectItems = items.filter(i => i.projectId === project.id);
      newSjItems = projectItems.map(item => ({
        projectId: project.id,
        projectName: project.name,
        itemId: item.id,
        itemName: item.name,
        qty: (project.qtyPerUnit || 1) * (item.qtySet || 1),
        unit: item.unit,
        warehouseId: 1
      }));
    }

    setSjData(prev => {
      const existingItemNames = prev.items.map(i => i.itemName.toLowerCase());
      const uniqueNewItems = newSjItems.filter(ni => !existingItemNames.includes(ni.itemName.toLowerCase()));
      return {
        ...prev,
        items: [...prev.items, ...uniqueNewItems],
        customer: prev.customer || project.customer
      };
    });
  };

  const handleSubmitSJ = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        code: editingSJ ? editingSJ.code : `SJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toISOString(),
        customer: sjData.customer,
        address: sjData.address,
        driver_name: sjData.driverName,
        vehicle_plate: sjData.vehiclePlate,
        note: sjData.note || null
      };

      let response;
      if (editingSJ) {
        // Update existing delivery order
        response = await apiClient.updateDeliveryOrder(editingSJ.id, payload);
      } else {
        // Create new delivery order
        response = await apiClient.createDeliveryOrder(payload);
      }

      if (response.success) {
        // Create delivery order items
        if (sjData.items.length > 0) {
          const sjId = editingSJ?.id || response.data?.id;
          for (const item of sjData.items) {
            await apiClient.createDeliveryOrderItem({
              delivery_order_id: sjId,
              warehouse_id: item.warehouseId || 1,
              project_id: item.projectId,
              project_name: item.projectName,
              item_name: item.itemName,
              qty: item.qty,
              unit: item.unit
            });
          }
        }

        // Update local state
        const newSJ: DeliveryOrder = {
          ...sjData,
          id: editingSJ ? editingSJ.id : response.data?.id || `sj-${Date.now()}`,
          code: payload.code,
          date: payload.date,
          status: 'DRAFT'
        };

        if (editingSJ) {
          updateDeliveryOrder(newSJ);
        } else {
          createDeliveryOrder(newSJ);
        }

        // Refresh list
        await fetchDeliveryOrders();

        setIsModalOpen(false);
        setEditingSJ(null);
        setSjData({ customer: '', address: '', driverName: '', vehiclePlate: '', note: '', items: [] });
      } else {
        setError(response.message || 'Gagal menyimpan surat jalan');
      }
    } catch (err) {
      console.error('Error saving delivery order:', err);
      setError('Gagal menyimpan surat jalan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditSJ = (sj: DeliveryOrder) => {
    setEditingSJ(sj);
    setSjData({
      customer: sj.customer,
      address: sj.address,
      driverName: sj.driverName,
      vehiclePlate: sj.vehiclePlate,
      note: sj.note || '',
      items: sj.items
    });
    setIsModalOpen(true);
  };

  const handleDeleteSJ = async (id: string) => {
    try {
      setError(null);
      const response = await apiClient.deleteDeliveryOrder(id);
      if (response.success) {
        deleteDeliveryOrder(id);
        await fetchDeliveryOrders();
      } else {
        setError(response.message || 'Gagal menghapus surat jalan');
      }
    } catch (err) {
      console.error('Error deleting delivery order:', err);
      setError('Gagal menghapus surat jalan. Silakan coba lagi.');
    }
  };

  const handleValidateSJ = async (id: string) => {
    try {
      setError(null);
      setSuccess(null);
      setIsValidating(id);
      console.log('Validating delivery order with ID:', id);

      const response = await apiClient.patchDeliveryOrder(id, { status: 'validated' });
      console.log('Validation response:', response);
      console.log('Response data:', response.data);

      if (response.success) {
        console.log('API call successful, updating local state and refreshing data...');

        // Update local store
        validateDeliveryOrder(id);

        // Force refresh delivery orders from API
        await fetchDeliveryOrders();

        // Auto-switch to HISTORY tab to show the validated SJ
        setActiveTab('HISTORY');
        setCurrentPage(1);

        // Show success message
        setSuccess('Surat jalan berhasil divalidasi dan diterbitkan! ✓');
        setIsValidating(null);
        console.log('✓ Delivery order validated and moved to archive');

        // Auto-hide success message after 4 seconds
        setTimeout(() => setSuccess(null), 4000);
      } else {
        const errorMsg = response.message || 'Gagal memvalidasi surat jalan. API mungkin menolak request.';
        setError(errorMsg);
        setIsValidating(null);
        console.error('✗ Validation failed:', {
          message: errorMsg,
          response: response,
          data: response.data
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memvalidasi surat jalan. Silakan coba lagi.';
      console.error('✗ Error validating delivery order:', err);
      setError(errorMsg);
      setIsValidating(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-1" />
          <div>
            <p className="font-bold text-red-800 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={20} /></button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-1" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={20} /></button>
        </div>
      )}

      {(isLoading || isLoadingWarehouse || isLoadingProjects) && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin shrink-0 mt-0.5" />
          <p className="font-bold text-blue-800 text-sm">
            {isLoading
              ? 'Memuat data surat jalan...'
              : isLoadingWarehouse && isLoadingProjects
                ? 'Memuat data gudang jadi dan project...'
                : isLoadingWarehouse
                  ? 'Memuat data gudang jadi...'
                  : 'Memuat data project...'}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Surat Jalan</h1>
           <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Penerbitan & Monitoring Dokumen Pengiriman</p>
        </div>
        <button onClick={() => { setEditingSJ(null); setSjData({customer:'', address:'', driverName:'', vehiclePlate:'', note:'', items:[]}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
          <Plus size={20}/> BUAT DRAFT SJ
        </button>
      </div>

      <div className="flex gap-8 border-b-2 border-slate-100 px-6 overflow-x-auto custom-scrollbar whitespace-nowrap">
        <button onClick={() => setActiveTab('DRAFT')} className={`pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'DRAFT' ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]' : 'text-slate-400'}`}>Draft & Validasi</button>
        <button onClick={() => setActiveTab('HISTORY')} className={`pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'HISTORY' ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]' : 'text-slate-400'}`}>Arsip Terkirim</button>
      </div>

      {activeTab === 'DRAFT' && (
        <div className="grid grid-cols-1 gap-6">
           {isLoading ? (
             <div className="py-20 text-center text-slate-400 font-bold text-sm">Memuat data surat jalan...</div>
           ) : drafts.length === 0 ? (
             <div className="py-20 text-center text-slate-300 font-black italic uppercase text-xs">Tidak ada draft surat jalan.</div>
           ) : (
             drafts.map(sj => {
               const ready = isSjReadyToShip(sj.items);
               return (
                 <div key={sj.id} className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm flex flex-col xl:flex-row gap-10 items-start xl:items-center">
                    <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sj.code}</span>
                          <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">DRAFT</span>
                       </div>
                       <h3 className="text-2xl font-black uppercase text-slate-900">{sj.customer}</h3>
                       <p className="text-xs text-slate-500 font-bold flex gap-2"><MapPin size={16} className="text-blue-500 shrink-0"/> {sj.address}</p>
                    </div>
                    <div className="flex gap-10 items-center">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">TOTAL MUATAN</p>
                         <p className="text-2xl font-black text-slate-900">{sj.items.reduce((acc, c) => acc + c.qty, 0)} <span className="text-xs">PCS</span></p>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={() => openEditSJ(sj)} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-100"><Edit3 size={20}/></button>
                         <button onClick={() => handleDeleteSJ(sj.id)} className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-100"><Trash2 size={20}/></button>
                         <button
                          onClick={() => handleValidateSJ(sj.id)} disabled={!ready || isValidating === sj.id}
                          className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all ${ready && isValidating !== sj.id ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}
                         >
                           {isValidating === sj.id ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                               MEMPROSES...
                             </>
                           ) : ready ? (
                             <><CheckCircle size={18}/> VALIDASI & TERBITKAN</>
                           ) : (
                             <><AlertCircle size={18}/> STOK BELUM SIAP</>
                           )}
                         </button>
                      </div>
                    </div>
                 </div>
               )
             })
           )}
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
           <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Cari Kode SJ atau Customer..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none text-sm shadow-sm" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-sm text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
                     <tr>
                        <th className="px-8 py-5">Nomor SJ</th>
                        <th className="px-8 py-5">Tanggal</th>
                        <th className="px-8 py-5">Customer / Penerima</th>
                        <th className="px-8 py-5 text-center">Muatan</th>
                        <th className="px-8 py-5 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                     {paginatedHistory.map(sj => (
                       <tr key={sj.id} className="hover:bg-slate-50/50 group">
                          <td className="px-8 py-5 text-emerald-600 font-black">{sj.code}</td>
                          <td className="px-8 py-5 text-slate-400 text-xs font-mono">{new Date(sj.date).toLocaleDateString()}</td>
                          <td className="px-8 py-5 uppercase text-slate-800">{sj.customer}</td>
                          <td className="px-8 py-5 text-center"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px]">{sj.items.length} Items</span></td>
                          <td className="px-8 py-5 text-right">
                             <button onClick={() => setSelectedSJ(sj)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Eye size={20}/></button>
                          </td>
                       </tr>
                     ))}
                     {history.length === 0 && (
                       <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase italic text-xs">Belum ada riwayat pengiriman divalidasi.</td></tr>
                     )}
                  </tbody>
               </table>
             </div>
             
             {totalPages > 1 && (
               <div className="p-6 border-t bg-slate-50 flex justify-between items-center overflow-x-auto">
                  <p className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Hal {currentPage} / {totalPages}</p>
                  <div className="flex gap-2">
                     <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-white border rounded-xl disabled:opacity-30"><ChevronLeft size={18}/></button>
                     <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-white border rounded-xl disabled:opacity-30"><ChevronRight size={18}/></button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE/EDIT SJ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[48px] w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">{editingSJ ? 'Edit Draft Surat Jalan' : 'Input Surat Jalan Baru'}</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Dokumen Pengiriman Barang Jadi</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={28}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b">
                   <div className="p-8 bg-slate-50 border-r flex flex-col">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FolderKanban size={14}/> 1. Tarik Data Project</h4>
                      {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-20">
                          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {getAvailableProjects().map(p => {
                             const isAdded = sjData.items.some(i => i.projectId === p.id);
                             return (
                               <button
                                 key={p.id} disabled={isAdded} onClick={() => addProjectToSJ(p as any)}
                                 className={`text-left p-5 rounded-[24px] border-2 transition-all flex flex-col gap-1 ${isAdded ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white border-white hover:border-blue-500 shadow-sm'}`}
                               >
                                  <p className="text-[8px] font-black text-blue-600 uppercase">{p.code}</p>
                                  <h5 className="font-black text-slate-900 uppercase text-xs truncate">{p.name}</h5>
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 text-[8px] font-bold text-slate-400 uppercase">
                                     <span>{p.qtyPerUnit} Qty/Unit</span>
                                     <span className="text-slate-900 font-black">{p.totalQty} {p.unit}</span>
                                  </div>
                               </button>
                             );
                           })}
                           {getAvailableProjects().length === 0 && (
                             <div className="col-span-2 py-8 text-center text-slate-400 text-xs font-bold">
                               Tidak ada project aktif
                             </div>
                           )}
                        </div>
                      )}
                   </div>

                   <div className="p-8 bg-white">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Truck size={14}/> 2. Detail Pengiriman</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                           <input placeholder="Nama Penerima / Customer" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.customer} onChange={e => setSjData({...sjData, customer: e.target.value})} />
                         </div>
                         <div className="md:col-span-2">
                           <textarea placeholder="Alamat Lengkap Tujuan" rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.address} onChange={e => setSjData({...sjData, address: e.target.value})} />
                         </div>
                         <input placeholder="Nama Sopir" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.driverName} onChange={e => setSjData({...sjData, driverName: e.target.value})} />
                         <input placeholder="No. Plat Kendaraan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.vehiclePlate} onChange={e => setSjData({...sjData, vehiclePlate: e.target.value})} />
                         <div className="md:col-span-2">
                           <textarea placeholder="Catatan / Remarks (opsional)" rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-[10px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={sjData.note} onChange={e => setSjData({...sjData, note: e.target.value})} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Box size={14}/> 3. Daftar Muatan Barang</h4>
                   {isLoadingWarehouse ? (
                     <div className="flex items-center justify-center py-20">
                       <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                     </div>
                   ) : (
                     <div className="border border-slate-200 rounded-[32px] overflow-hidden bg-white shadow-sm overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-xs min-w-[800px]">
                           <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b">
                              <tr>
                                 <th className="px-8 py-5">Item Pekerjaan</th>
                                 <th className="px-8 py-5">Asal Project</th>
                                 <th className="px-8 py-5 text-center">Total Diproduksi</th>
                                 <th className="px-8 py-5 text-center">Qty SJ</th>
                                 <th className="px-8 py-5 text-center">Ready di WH</th>
                                 <th className="px-8 py-5 text-right">Aksi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 font-bold">
                              {sjData.items.length > 0 ? (
                                sjData.items.map((item, idx) => {
                                   const warehouseItem = warehouseData.find(
                                     w => w.project_id === Number(item.projectId) &&
                                          w.item_name?.toLowerCase() === item.itemName?.toLowerCase()
                                   );
                                   const availableStock = warehouseItem?.available_stock || 0;
                                   const isStockShort = availableStock < item.qty;

                                   return (
                                     <tr key={idx} className={`hover:bg-slate-50/50 ${isStockShort ? 'bg-red-50/30' : ''}`}>
                                       <td className="px-8 py-5 uppercase text-slate-900">{item.itemName}</td>
                                       <td className="px-8 py-5 text-blue-600 uppercase text-[10px]">{item.projectName}</td>
                                       <td className="px-8 py-5 text-center text-slate-400 font-black">{warehouseItem?.total_produced || 0} {item.unit}</td>
                                       <td className="px-8 py-5 text-center">
                                          <input
                                            type="number"
                                            className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-black"
                                            value={item.qty}
                                            onChange={e => {
                                              const newItems = [...sjData.items];
                                              newItems[idx].qty = Number(e.target.value);
                                              setSjData({ ...sjData, items: newItems });
                                            }}
                                          />
                                       </td>
                                       <td className="px-8 py-5 text-center">
                                          <span className={`${isStockShort ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'} px-3 py-1.5 rounded-xl border border-current/20 font-black`}>
                                            {availableStock} {item.unit}
                                          </span>
                                       </td>
                                       <td className="px-8 py-5 text-right">
                                          <button onClick={() => {
                                            const ni = sjData.items.filter((_, i) => i !== idx);
                                            setSjData({...sjData, items: ni});
                                          }} className="p-3 text-slate-300 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={18}/></button>
                                       </td>
                                     </tr>
                                   );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold text-xs">
                                    Pilih project terlebih dahulu untuk menambahkan item ke muatan
                                  </td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                   )}
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                 <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Data</p>
                    <p className="text-xl font-black text-slate-900 leading-none">Menyimpan sebagai DRAFT</p>
                 </div>
                 <button
                  onClick={handleSubmitSJ} disabled={sjData.items.length === 0 || !sjData.customer || isSaving}
                  className="w-full sm:w-auto bg-slate-900 text-white px-12 py-5 rounded-[28px] font-black uppercase shadow-2xl tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
                 >
                   {isSaving ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                       MENYIMPAN...
                     </>
                   ) : (
                     <>
                       <Save size={20}/> SIMPAN DRAFT SURAT JALAN
                     </>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: VIEW SJ DETAIL */}
      {selectedSJ && (
        <div className="fixed inset-0 bg-slate-900/90 z-[400] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[40px] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{selectedSJ.code}</h2>
                    <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mt-2">DOKUMEN PENGIRIMAN RESMI</p>
                 </div>
                 <button onClick={() => setSelectedSJ(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={28}/></button>
              </div>
              <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informasi Penerima</h4>
                       <div>
                          <p className="font-black text-xl uppercase">{selectedSJ.customer}</p>
                          <p className="text-sm text-slate-500 mt-2 font-bold">{selectedSJ.address}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Detail Transportasi</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-[9px] text-slate-400 font-black uppercase">No. Plat</p>
                             <p className="font-black text-slate-800 text-sm">{selectedSJ.vehiclePlate}</p>
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-400 font-black uppercase">Nama Sopir</p>
                             <p className="font-black text-slate-800 text-sm">{selectedSJ.driverName}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 {selectedSJ.note && (
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Catatan</h4>
                      <p className="text-sm text-slate-600 font-bold">{selectedSJ.note}</p>
                   </div>
                 )}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Daftar Barang</h4>
                    <div className="bg-slate-50 rounded-[32px] overflow-hidden border overflow-x-auto">
                       <table className="w-full text-left text-sm min-w-[500px]">
                          <thead className="bg-slate-100 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                             <tr><th className="px-6 py-4">Item Pekerjaan</th><th className="px-6 py-4">Asal Project</th><th className="px-6 py-4 text-right">Quantity</th></tr>
                          </thead>
                          <tbody className="divide-y font-bold">
                             {selectedSJ.items.map((it, i) => (
                               <tr key={i}>
                                  <td className="px-6 py-4 uppercase">{it.itemName}</td>
                                  <td className="px-6 py-4 text-blue-600 text-[10px] uppercase">{it.projectName}</td>
                                  <td className="px-6 py-4 text-right font-black text-lg">{it.qty} {it.unit}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
                 <button className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-sm tracking-widest shadow-xl">CETAK DOKUMEN SJ</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
