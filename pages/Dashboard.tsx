import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { projects, machines, tasks, materials } = useStore();

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const lowStock = materials.filter(m => m.currentStock < m.safetyStock).length;
  const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  const machineStatusData = machines.map(m => ({
    name: m.name.replace('Laser Cutter', 'Laser').replace('Bending Press', 'Bend'), // Shorten for chart
    status: m.status,
    val: 1
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return '#22c55e';
      case 'IDLE': return '#94a3b8';
      case 'MAINTENANCE': return '#eab308';
      default: return '#ef4444';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Projects</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{activeProjects}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Tasks</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{activeTasks}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{completedTasks}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{lowStock}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Machine Status Overview</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                    {machineStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 text-xs text-slate-500 justify-center">
             <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Running</span>
             <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Idle</span>
             <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Maintenance</span>
          </div>
        </div>

        {/* Recent Activity Feed (Mock) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="flex gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{task.status === 'COMPLETED' ? 'Completed task' : 'Started task'} on {task.machineId}</p>
                  <p className="text-xs text-slate-500">{task.itemName} - {task.completedQty}/{task.targetQty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
