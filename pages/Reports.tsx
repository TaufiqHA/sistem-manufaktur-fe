
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
    TrendingUp, ArrowUpRight, BarChart3, PieChart, Activity, Layers, Filter, History, Search, ArrowDownRight, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Reports: React.FC = () => {
  const { logs, machines, projects, items } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesProject = selectedProjectId === 'ALL' || log.projectId === selectedProjectId;
      
      const d = new Date(log.timestamp);
      const now = new Date();
      let matchesTime = true;
      if (filterType === 'DAILY') matchesTime = d.toDateString() === now.toDateString();
      if (filterType === 'WEEKLY') {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          matchesTime = d >= lastWeek;
      }
      if (filterType === 'MONTHLY') matchesTime = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      
      const item = items.find(i => i.id === log.itemId);
      const machine = machines.find(m => m.id === log.machineId);
      const matchesSearch = !searchTerm || 
        item?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operator.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProject && matchesTime && matchesSearch;
    });
  }, [logs, selectedProjectId, filterType, searchTerm, items, machines]);

  const summary = useMemo(() => {
    const good = filteredLogs.reduce((acc, curr) => acc + curr.goodQty, 0);
    const defect = filteredLogs.reduce((acc, curr) => acc + curr.defectQty, 0);
    const efficiency = (good + defect) > 0 ? (good / (good + defect)) * 100 : 100;
    return { good, defect, efficiency };
  }, [filteredLogs]);

  const chartData = useMemo(() => {
      const data: Record<string, {name: string, good: number, defect: number}> = {};
      filteredLogs.forEach(log => {
          const machine = machines.find(m => m.id === log.machineId)?.name || 'Unknown';
          if (!data[machine]) data[machine] = { name: machine, good: 0, defect: 0 };
          data[machine].good += log.goodQty;
          data[machine].defect += log.defectQty;
      });
      return Object.values(data);
  }, [filteredLogs, machines]);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Production Analytics</h1>
            <p className="text-slate-500 font-bold mt-2">Analisa performa produksi berdasarkan project dan stasiun kerja.</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
            <div className="bg-white p-2 rounded-2xl border flex items-center gap-3 shadow-sm">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-400"><Layers size={20}/></div>
                <select className="bg-transparent border-none outline-none font-black text-sm pr-10 uppercase tracking-widest cursor-pointer" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                   <option value="ALL">SEMUA PROJECT</option>
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="bg-white p-1 rounded-2xl border flex items-center shadow-sm">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterType === type ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-sm space-y-4 hover:border-blue-100 transition-all group">
              <div className="flex justify-between items-center text-slate-300 group-hover:text-blue-500 transition-colors"><span className="text-[10px] font-black uppercase tracking-[0.3em]">GOOD QUANTITY</span><TrendingUp size={24}/></div>
              <p className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums">{summary.good}</p>
              <div className="text-emerald-500 text-xs font-black flex items-center gap-2 uppercase tracking-widest"><ArrowUpRight size={14}/> Performa Stabil</div>
          </div>
          <div className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-sm space-y-4 hover:border-red-100 transition-all group">
              <div className="flex justify-between items-center text-slate-300 group-hover:text-red-500 transition-colors"><span className="text-[10px] font-black uppercase tracking-[0.3em]">REJECTED ITEMS</span><PieChart size={24}/></div>
              <p className="text-6xl font-black text-red-500 tracking-tighter tabular-nums">{summary.defect}</p>
              <div className="text-red-400 text-xs font-black uppercase tracking-widest"><ArrowDownRight size={14}/> Quality Control Required</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700"><Activity size={100} className="text-blue-500"/></div>
              <div className="flex justify-between items-center text-slate-500"><span className="text-[10px] font-black uppercase tracking-[0.3em]">EFFICIENCY RATE</span><BarChart3 size={24}/></div>
              <p className="text-6xl font-black text-white tracking-tighter tabular-nums">{summary.efficiency.toFixed(1)}<span className="text-2xl text-blue-500">%</span></p>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-6 border border-slate-700 shadow-inner">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{width: `${summary.efficiency}%`}} />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 mb-12 uppercase tracking-[0.4em] flex items-center gap-4"><div className="w-12 h-2 bg-blue-600 rounded-full"/> Performa Berdasarkan Mesin</h3>
              <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={12}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                          <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'}} />
                          <Bar dataKey="good" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                          <Bar dataKey="defect" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4"><div className="w-12 h-2 bg-emerald-500 rounded-full"/> Riwayat Pekerjaan</h3>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" placeholder="Cari Log..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
                 {filteredLogs.map(log => {
                    const machine = machines.find(m => m.id === log.machineId);
                    const item = items.find(i => i.id === log.itemId);
                    return (
                       <div key={log.id} className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                          <div className="flex gap-5 items-center">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><Clock size={24}/></div>
                             <div>
                                <p className="text-slate-800 font-black text-sm uppercase">{item?.name || 'Unknown Item'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{machine?.name} &bull; OP: {log.operator}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-emerald-600">+{log.goodQty} Good</p>
                             <p className="text-[10px] font-bold text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          </div>
                       </div>
                    )
                 })}
                 {filteredLogs.length === 0 && <div className="text-center py-20 text-slate-300 italic font-bold">Tidak ada data log yang sesuai.</div>}
              </div>
          </div>
      </div>
    </div>
  );
};
