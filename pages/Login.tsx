import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../lib/api';
import { ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loginUser = useStore(state => state.loginWithToken);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        // Store token
        apiClient.setToken(response.data.token);

        // Normalize role to uppercase
        const roleMap: Record<string, 'ADMIN' | 'OPERATOR' | 'MANAGER'> = {
          'admin': 'ADMIN',
          'operator': 'OPERATOR',
          'manager': 'MANAGER',
          'ADMIN': 'ADMIN',
          'OPERATOR': 'OPERATOR',
          'MANAGER': 'MANAGER',
        };

        const normalizedRole = roleMap[response.data.user.role] || 'OPERATOR';

        // Create default permissions - ADMIN gets all access
        const defaultPermissions = {
          PROJECTS: { view: true, create: true, edit: true, delete: true },
          MATERIALS: { view: true, create: true, edit: true, delete: true },
          MACHINES: { view: true, create: true, edit: true, delete: true },
          USERS: { view: true, create: true, edit: true, delete: true },
          REPORTS: { view: true, create: true, edit: true, delete: true },
          DASHBOARD: { view: true, create: true, edit: true, delete: true },
        };

        const operatorPermissions = {
          PROJECTS: { view: true, create: false, edit: false, delete: false },
          MATERIALS: { view: true, create: false, edit: false, delete: false },
          MACHINES: { view: true, create: false, edit: false, delete: false },
          USERS: { view: false, create: false, edit: false, delete: false },
          REPORTS: { view: true, create: false, edit: false, delete: false },
          DASHBOARD: { view: true, create: false, edit: false, delete: false },
        };

        const permissions = normalizedRole === 'ADMIN' ? defaultPermissions : operatorPermissions;

        // Store user in zustand and localStorage
        const user = {
          id: response.data.user.id.toString(),
          username: response.data.user.email,
          email: response.data.user.email,
          name: response.data.user.name,
          role: normalizedRole,
          permissions,
        };

        loginUser(user);
        navigate('/');
      } else {
        setError(response.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 bg-blue-600 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">MANUFAKTUR SYSTEM</h1>
            <p className="text-blue-200 text-sm mt-1">Gondola Production Control</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="user@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="••••••"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all disabled:cursor-not-allowed"
            >
                {loading ? 'Memproses...' : 'MASUK SISTEM'}
            </button>

            <div className="text-center text-xs text-slate-400">
                <p>Default Accounts:</p>
                <p>Gunakan email dari backend Anda</p>
                <p>dengan password sesuai yang terdaftar</p>
            </div>
        </form>
      </div>
    </div>
  );
};
