import React, { useState, useEffect } from 'react';
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
  const [projects, setProjects] = useState<any[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectItemData[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
  }, []);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorItems, setErrorItems] = useState<string | null>(null);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);
  const [errorMachines, setErrorMachines] = useState<string | null>(null);
  const [errorMaterials, setErrorMaterials] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setErrorProjects(null);
        const response = await apiClient.getProjects();
        if (response.success && response.data) {
          const projectList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setProjects(projectList);
        } else {
          setErrorProjects(response.message || 'Failed to fetch projects');
          setProjects([]);
        }
      } catch (error) {
        setErrorProjects('Failed to fetch projects');
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectItems = async () => {
      try {
        setLoadingItems(true);
        setErrorItems(null);
        const response = await apiClient.getProjectItems(1, 15);
        if (response.success && response.data) {
          const itemsList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setProjectItems(itemsList);
        } else {
          setErrorItems(response.message || 'Failed to fetch project items');
          setProjectItems([]);
        }
      } catch (error) {
        setErrorItems('Failed to fetch project items');
        setProjectItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchProjectItems();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        setErrorTasks(null);
        const response = await apiClient.getTasks(1, 100);
        if (response.success && response.data) {
          const taskList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setTasks(taskList);
        } else {
          setErrorTasks(response.message || 'Failed to fetch tasks');
          setTasks([]);
        }
      } catch (error) {
        setErrorTasks('Failed to fetch tasks');
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoadingMachines(true);
        setErrorMachines(null);
        const response = await apiClient.getMachines();
        if (response.success && response.data) {
          const machinesList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setMachines(machinesList);
        } else {
          setErrorMachines(response.message || 'Failed to fetch machines');
          setMachines([]);
        }
      } catch (error) {
        setErrorMachines('Failed to fetch machines');
        setMachines([]);
      } finally {
        setLoadingMachines(false);
      }
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoadingMaterials(true);
        setErrorMaterials(null);
        const response = await apiClient.getMaterials(1, 100);
        if (response.success && response.data) {
          const materialsList = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setMaterials(materialsList);
        } else {
          setErrorMaterials(response.message || 'Failed to fetch materials');
          setMaterials([]);
        }
      } catch (error) {
        setErrorMaterials('Failed to fetch materials');
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const plannedProjects = projects.filter(p => p.status === 'PLANNED').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length;
  const cancelledProjects = projects.filter(p => p.status === 'CANCELLED').length;

  const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  const machineStatusData = machines.map(m => ({
    name: m.name.replace('Laser Cutter', 'Laser').replace('Bending Press', 'Bend'),
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
            <p className="text-3xl font-bold text-slate-900 mt-2">{loadingProjects ? '-' : activeProjects}</p>
            {errorProjects && <p className="text-xs text-red-500 mt-2">{errorProjects}</p>}
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Planned Projects</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{loadingProjects ? '-' : plannedProjects}</p>
            {errorProjects && <p className="text-xs text-red-500 mt-2">{errorProjects}</p>}
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{loadingTasks ? '-' : completedTasks}</p>
            {errorTasks && <p className="text-xs text-red-500 mt-2">{errorTasks}</p>}
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Project Items</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{loadingItems ? '-' : projectItems.length}</p>
            {errorItems && <p className="text-xs text-red-500 mt-2">{errorItems}</p>}
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
          {errorMachines && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">{errorMachines}</p>
            </div>
          )}
          {loadingMachines ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">Loading machines...</p>
            </div>
          ) : machines.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No machines found</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {errorTasks && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">{errorTasks}</p>
            </div>
          )}
          {loadingTasks ? (
            <div className="text-center py-4">
              <p className="text-slate-500">Loading...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{task.status === 'COMPLETED' ? 'Completed task' : 'Started task'} on {task.machine?.name || task.machine_id}</p>
                    <p className="text-xs text-slate-500">{task.item_name} - {task.completed_qty || 0}/{task.target_qty || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Items Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Project Items</h2>
          {loadingItems && <span className="text-xs text-slate-500">Loading...</span>}
        </div>

        {errorItems && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{errorItems}</p>
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
