import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiClient, ProjectItemData } from '../lib/api';

export const Dashboard: React.FC = () => {
  const { projects, machines, tasks, materials } = useStore();
  const [projectItems, setProjectItems] = useState<ProjectItemData[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectItems = async () => {
      try {
        setLoadingItems(true);
        setItemsError(null);
        const response = await apiClient.getProjectItems(1, 15);
        if (response.success && response.data) {
          setProjectItems(response.data.data || []);
        } else {
          setItemsError(response.message || 'Failed to fetch project items');
        }
      } catch (error) {
        setItemsError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchProjectItems();
  }, []);

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
            <p className="text-sm font-medium text-slate-500">Project Items</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{loadingItems ? '-' : projectItems.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Package size={24} />
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

      {/* Project Items Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Project Items</h2>
          {loadingItems && <span className="text-xs text-slate-500">Loading...</span>}
        </div>

        {itemsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{itemsError}</p>
          </div>
        )}

        {loadingItems ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading project items...</p>
          </div>
        ) : projectItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No project items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Dimensions</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Thickness</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Unit</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Project ID</th>
                </tr>
              </thead>
              <tbody>
                {projectItems.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.dimensions}</td>
                    <td className="py-3 px-4 text-slate-600">{item.thickness}</td>
                    <td className="py-3 px-4 text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-slate-600">{item.unit}</td>
                    <td className="py-3 px-4 text-slate-600">{item.project_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
