import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient, UserData } from '../lib/api';
import { Plus, Trash2, Edit3, X, ChevronLeft, ChevronRight, Search, UserCheck, AlertCircle, Loader } from 'lucide-react';
import { PermissionMap, ModuleName } from '../types';

const INITIAL_PERMISSIONS: PermissionMap = {
  PROJECTS: { view: false, create: false, edit: false, delete: false },
  MATERIALS: { view: false, create: false, edit: false, delete: false },
  MACHINES: { view: false, create: false, edit: false, delete: false },
  USERS: { view: false, create: false, edit: false, delete: false },
  DASHBOARD: { view: true, create: false, edit: false, delete: false },
  REPORTS: { view: false, create: false, edit: false, delete: false },
};

const MODULES: ModuleName[] = ['DASHBOARD', 'PROJECTS', 'MATERIALS', 'MACHINES', 'USERS', 'REPORTS'];

const AVAILABLE_PERMISSIONS = [
  'view_users',
  'create_users',
  'edit_users',
  'delete_users',
  'view_products',
  'create_products',
  'edit_products',
  'delete_products',
  'view_orders',
  'create_orders',
  'edit_orders',
  'delete_orders',
  'view_reports',
  'manage_inventory',
  'manage_finances',
  'access_dashboard',
];

interface UserFormData {
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'MANAGER';
  password?: string;
  password_confirmation?: string;
  permissions: PermissionMap;
  permissionStrings?: string[];
}

interface FieldErrors {
  [key: string]: string[];
}

export const Users: React.FC = () => {
  const { currentUser, can } = useStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', role: 'OPERATOR', password: '', password_confirmation: '', permissions: INITIAL_PERMISSIONS
  });

  const parseBackendPermissions = (permissionsData: any): string[] => {
    if (!permissionsData) return [];

    if (typeof permissionsData === 'string') {
      try {
        return JSON.parse(permissionsData);
      } catch (e) {
        console.error('Failed to parse permissions string:', e);
        return [];
      }
    }

    if (Array.isArray(permissionsData)) {
      return permissionsData;
    }

    return [];
  };

  // Fetch users on mount and when search changes
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getUsers(currentPage, itemsPerPage, searchTerm);
        if (response.success && response.data) {
          setUsers(response.data.data.filter((user: UserData | null | undefined): user is UserData => user != null));
        } else {
          setError(response.message || 'Gagal memuat data pengguna');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data pengguna');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm]);

  if (!can('view', 'USERS')) return <div className="p-12 text-center text-slate-500 font-bold">Akses Ditolak.</div>;

  const mergePermissions = (userPerms?: PermissionMap): PermissionMap => {
    return { ...INITIAL_PERMISSIONS, ...userPerms };
  };

  const handleOpenEdit = async (u: UserData) => {
    setEditingId(u.id || null);
    setFieldErrors({});
    setError(null);
    try {
      // Fetch full user details with permissions from API
      const response = await apiClient.getUser(u.id || 0);
      if (response.success && response.data) {
        const userData = response.data;
        const permissionStrings = parseBackendPermissions(userData.permissions);
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password: '',
          password_confirmation: '',
          permissions: mergePermissions(userData.permissions),
          permissionStrings
        });
      } else {
        // Fallback to local user data if API fails
        const permissionStrings = parseBackendPermissions(u.permissions);
        setFormData({
          name: u.name,
          email: u.email,
          role: u.role,
          password: '',
          password_confirmation: '',
          permissions: mergePermissions(u.permissions),
          permissionStrings
        });
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      // Fallback to local user data
      const permissionStrings = parseBackendPermissions(u.permissions);
      setFormData({
        name: u.name,
        email: u.email,
        role: u.role,
        password: '',
        password_confirmation: '',
        permissions: mergePermissions(u.permissions),
        permissionStrings
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      if (editingId) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          permissions: formData.permissionStrings || []
        };
        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }
        const response = await apiClient.updateUser(editingId, updateData);
        if (response.success && response.data) {
          setUsers(users.map(u => u.id === editingId ? response.data.data : u));
          setIsModalOpen(false);
          setFormData({ name: '', email: '', role: 'OPERATOR', password: '', password_confirmation: '', permissions: INITIAL_PERMISSIONS, permissionStrings: [] });
        } else {
          if ((response as any).errors && typeof (response as any).errors === 'object') {
            setFieldErrors((response as any).errors);
          }
          setError(response.message || 'Gagal memperbarui pengguna');
        }
      } else {
        const response = await apiClient.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          permissions: formData.permissionStrings || []
        });
        if (response.success && response.data) {
          setUsers([response.data.data, ...users]);
          setIsModalOpen(false);
          setFormData({ name: '', email: '', role: 'OPERATOR', password: '', password_confirmation: '', permissions: INITIAL_PERMISSIONS, permissionStrings: [] });
        } else {
          if ((response as any).errors && typeof (response as any).errors === 'object') {
            setFieldErrors((response as any).errors);
          }
          setError(response.message || 'Gagal membuat pengguna');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan pengguna');
      console.error('Error submitting form:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await apiClient.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setError(response.message || 'Gagal menghapus pengguna');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus pengguna');
      console.error('Error deleting user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manajemen User</h1>
          <p className="text-slate-500 font-bold">Kelola karyawan dan hak akses sistem MES</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', email: '', role: 'OPERATOR', password: '', password_confirmation: '', permissions: INITIAL_PERMISSIONS, permissionStrings: [] });
            setFieldErrors({});
            setError(null);
            setIsModalOpen(true);
          }}
          disabled={isSaving}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50"
        >
          + TAMBAH USER
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[24px] p-6 flex gap-4 items-start">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50 flex gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-slate-100"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              disabled={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <Loader className="text-slate-400 animate-spin" size={32} />
            <p className="text-slate-500 font-bold">Memuat data pengguna...</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Nama</th>
                  <th className="px-8 py-5">Email</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {users.length > 0 ? (
                  users.map(user => {
                    if (!user || !user.name || !user.email) return null;
                    return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 shadow-sm">{user.name.charAt(0)}</div>
                        <p className="font-black text-slate-800 text-base">{user.name}</p>
                      </td>
                      <td className="px-8 py-5 text-blue-600 font-black tracking-widest text-xs">{user.email}</td>
                      <td className="px-8 py-5"><span className="bg-slate-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase text-slate-600 tracking-widest border border-slate-200">{user.role}</span></td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            disabled={isSaving}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                          >
                            <Edit3 size={18}/>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id || 0)}
                            disabled={isSaving || user.id === currentUser?.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-bold">Tidak ada data pengguna</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="p-8 bg-slate-50 border-t flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Halaman {currentPage}</span>
              <div className="flex items-center gap-4">
                <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronLeft size={20}/></button>
                <button disabled={users.length < itemsPerPage || isLoading} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border rounded-2xl hover:shadow-lg disabled:opacity-20 transition-all"><ChevronRight size={20}/></button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editingId ? 'Edit Pengguna' : 'Daftar Pengguna Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="p-2.5 hover:bg-slate-200 rounded-full transition-all disabled:opacity-50"><X size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 space-y-8">
              <form id="userForm" onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input
                    required
                    disabled={isSaving}
                    className={`w-full p-4 bg-slate-50 border ${fieldErrors.name ? 'border-red-300' : 'border-slate-200'} rounded-2xl font-black outline-none focus:ring-4 ${fieldErrors.name ? 'focus:ring-red-100' : 'focus:ring-blue-100'} disabled:bg-slate-100 disabled:text-slate-400`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 font-black">{fieldErrors.name[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input
                    required
                    type="email"
                    disabled={isSaving}
                    className={`w-full p-4 bg-slate-50 border ${fieldErrors.email ? 'border-red-300' : 'border-slate-200'} rounded-2xl font-black outline-none focus:ring-4 ${fieldErrors.email ? 'focus:ring-red-100' : 'focus:ring-blue-100'} disabled:bg-slate-100 disabled:text-slate-400`}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 font-black">{fieldErrors.email[0]}</p>
                  )}
                </div>
                {!editingId && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                      <input
                        required
                        type="password"
                        disabled={isSaving}
                        className={`w-full p-4 bg-slate-50 border ${fieldErrors.password ? 'border-red-300' : 'border-slate-200'} rounded-2xl font-black outline-none focus:ring-4 ${fieldErrors.password ? 'focus:ring-red-100' : 'focus:ring-blue-100'} disabled:bg-slate-100 disabled:text-slate-400`}
                        value={formData.password || ''}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                      {fieldErrors.password && (
                        <p className="text-xs text-red-600 font-black">{fieldErrors.password[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konfirmasi Password</label>
                      <input
                        required
                        type="password"
                        disabled={isSaving}
                        className={`w-full p-4 bg-slate-50 border ${fieldErrors.password_confirmation ? 'border-red-300' : 'border-slate-200'} rounded-2xl font-black outline-none focus:ring-4 ${fieldErrors.password_confirmation ? 'focus:ring-red-100' : 'focus:ring-blue-100'} disabled:bg-slate-100 disabled:text-slate-400`}
                        value={formData.password_confirmation || ''}
                        onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                      />
                      {fieldErrors.password_confirmation && (
                        <p className="text-xs text-red-600 font-black">{fieldErrors.password_confirmation[0]}</p>
                      )}
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                  <select
                    disabled={isSaving}
                    className={`w-full p-4 bg-slate-50 border ${fieldErrors.role ? 'border-red-300' : 'border-slate-200'} rounded-2xl font-black outline-none focus:ring-4 ${fieldErrors.role ? 'focus:ring-red-100' : 'focus:ring-blue-100'} disabled:bg-slate-100 disabled:text-slate-400`}
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as 'ADMIN' | 'OPERATOR' | 'MANAGER'})}
                  >
                    <option value="operator">operator</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                  </select>
                  {fieldErrors.role && (
                    <p className="text-xs text-red-600 font-black">{fieldErrors.role[0]}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izin Akses</label>
                  <div className="space-y-3 bg-white border border-slate-200 rounded-2xl p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {AVAILABLE_PERMISSIONS.map(permission => (
                        <label key={permission} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            disabled={isSaving}
                            checked={formData.permissionStrings?.includes(permission) ?? false}
                            onChange={e => {
                              const newPermissions = e.target.checked
                                ? [...(formData.permissionStrings || []), permission]
                                : (formData.permissionStrings || []).filter(p => p !== permission);
                              setFormData({
                                ...formData,
                                permissionStrings: newPermissions
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                          />
                          <span className="text-sm font-bold text-slate-600 capitalize">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {fieldErrors.permissions && (
                    <p className="text-xs text-red-600 font-black">{fieldErrors.permissions[0]}</p>
                  )}
                </div>
              </form>
            </div>
            <div className="p-10 border-t bg-slate-50 flex justify-end gap-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-8 font-black uppercase text-xs tracking-widest text-slate-400 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                form="userForm"
                disabled={isSaving}
                className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl uppercase tracking-widest text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck size={20}/> {isSaving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Daftarkan User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
