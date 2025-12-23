import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { TrendingUp, PieChart, Loader } from 'lucide-react';

interface Machine {
  id?: number | string;
  code: string;
  name: string;
  type: string;
  capacity_per_hour: number;
  status: string;
  personnel?: any[];
  is_maintenance: boolean;
}

interface Project {
  id?: number | string;
  code: string;
  name: string;
  customer: string;
  start_date: string;
  deadline: string;
  status: string;
  progress: number;
  qty_per_unit: number;
  procurement_qty: number;
  total_qty: number;
  unit: string;
  is_locked: boolean;
}

interface ProductionLog {
  id?: number | string;
  task_id?: number | string;
  machine_id?: number | string;
  item_id?: number | string;
  project_id?: number | string;
  step: string;
  shift: string;
  good_qty: number;
  defect_qty: number;
  operator: string;
  logged_at: string;
  type: string;
}

export const Reports: React.FC = () => {
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [logsRes, machinesRes, projectsRes] = await Promise.all([
          apiClient.getProductionLogs(1, 1000),
          apiClient.getMachines(),
          apiClient.getProjects()
        ]);

        if (logsRes.success && logsRes.data) {
          const logsList = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.data || []);
          setLogs(logsList);
        }

        if (machinesRes.success && machinesRes.data) {
          const machinesList = Array.isArray(machinesRes.data) ? machinesRes.data : (machinesRes.data.data || []);
          setMachines(machinesList);
        }

        if (projectsRes.success && projectsRes.data) {
          const projectsList = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || []);
          setProjects(projectsList);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesProject = selectedProjectId === 'ALL' || log.project_id === selectedProjectId;

      const d = new Date(log.logged_at);
      const now = new Date();
      let matchesTime = true;
      if (filterType === 'DAILY') matchesTime = d.toDateString() === now.toDateString();
      if (filterType === 'WEEKLY') {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          matchesTime = d >= lastWeek;
      }
      if (filterType === 'MONTHLY') matchesTime = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

      const machine = machines.find(m => m.id === log.machine_id);
      const matchesSearch = !searchTerm ||
        log.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operator.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProject && matchesTime && matchesSearch;
    });
  }, [logs, selectedProjectId, filterType, searchTerm, machines]);

  const summary = useMemo(() => {
    const good = filteredLogs.reduce((acc, curr) => acc + curr.good_qty, 0);
    const defect = filteredLogs.reduce((acc, curr) => acc + curr.defect_qty, 0);
    const efficiency = (good + defect) > 0 ? (good / (good + defect)) * 100 : 100;
    return { good, defect, efficiency };
  }, [filteredLogs]);

  const chartData = useMemo(() => {
      const data: Record<string, {name: string, good: number, defect: number}> = {};
      filteredLogs.forEach(log => {
          const machine = machines.find(m => m.id === log.machine_id)?.name || 'Unknown';
          if (!data[machine]) data[machine] = { name: machine, good: 0, defect: 0 };
          data[machine].good += log.good_qty;
          data[machine].defect += log.defect_qty;
      });
      return Object.values(data);
  }, [filteredLogs, machines]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-6">
          <Loader size={48} className="text-blue-600 animate-spin mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest text-slate-500">Memuat Data Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Production Summary</h1>
        <p className="text-slate-600 text-sm mt-1">Total items produced and defects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp size={20}/>
            </div>
            <span className="text-sm font-semibold text-slate-600">Good Items</span>
          </div>
          <p className="text-5xl font-bold text-slate-900">{summary.good}</p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <PieChart size={20}/>
            </div>
            <span className="text-sm font-semibold text-slate-600">Defective Items</span>
          </div>
          <p className="text-5xl font-bold text-red-500">{summary.defect}</p>
        </div>
      </div>
    </div>
  );
};
