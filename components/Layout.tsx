import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, FolderKanban, Factory, MonitorPlay, Settings, Users, PackageSearch, Menu, X, Wrench, LogOut, BarChart3
} from 'lucide-react';
import { ModuleName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', module: 'DASHBOARD' as ModuleName },
  { label: 'Projects', icon: FolderKanban, path: '/projects', module: 'PROJECTS' as ModuleName },
  { label: 'Master Mesin', icon: Wrench, path: '/machines', module: 'MACHINES' as ModuleName },
  { label: 'Materials', icon: PackageSearch, path: '/materials', module: 'MATERIALS' as ModuleName },
  { label: 'Operator Board', icon: Factory, path: '/machine-board', module: 'MACHINES' as ModuleName },
  { label: 'Analytics', icon: BarChart3, path: '/reports', module: 'REPORTS' as ModuleName },
  { label: 'TV Display', icon: MonitorPlay, path: '/tv-display', module: 'DASHBOARD' as ModuleName },
  { label: 'Users', icon: Users, path: '/users', module: 'USERS' as ModuleName },
  { label: 'Settings', icon: Settings, path: '/settings', module: 'USERS' as ModuleName },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, can } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (location.pathname === '/login') return <>{children}</>;
  if (location.pathname === '/tv-display') return <div className="min-h-screen bg-slate-900 text-white">{children}</div>;

  const handleLogout = () => { logout(); navigate('/login'); };

  // Filter navigation based on user role
  let filteredNav = NAV_ITEMS.filter(item => can('view', item.module));
  if (currentUser?.role === 'OPERATOR') {
    // Operators only see Operator Board
    filteredNav = filteredNav.filter(item => item.path === '/machine-board');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar - FIXED */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter text-blue-400">MANUFACTUR</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredNav.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}>
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />{item.label}
                </Link>
              );
            })}
        </nav>
        <div className="p-6 mt-auto border-t border-slate-800">
           <div className="flex items-center gap-4 mb-6 px-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-xl shadow-lg">{currentUser?.name?.charAt(0)}</div>
                <div className="text-sm">
                    <p className="text-white font-black">{currentUser?.name}</p>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{currentUser?.role}</p>
                </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white py-4 rounded-2xl text-xs font-black transition-all duration-300"><LogOut size={18} /> LOGOUT</button>
        </div>
      </aside>

      {/* Main Content - PADDED FOR FIXED SIDEBAR */}
      <main className="flex-1 flex flex-col lg:pl-64 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:hidden shrink-0">
          <h1 className="text-xl font-black text-blue-600">MANUFACTUR</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600"><Menu size={24} /></button>
        </header>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
