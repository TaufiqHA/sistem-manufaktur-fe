import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Database, Download, Plus, Trash2, HardDrive, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient, BackupData } from '../lib/api';

export const Settings: React.FC = () => {
  const { downloadDatabase } = useStore();
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getBackups();
      if (response.success && response.data) {
        setBackups(response.data.data || []);
      } else {
        setError(response.message || 'Failed to fetch backups');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.getBackupStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch backup stats:', err);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      const response = await apiClient.createBackup('full');
      if (response.success) {
        fetchBackups();
        fetchStats();
      } else {
        setError(response.message || 'Failed to create backup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (id: number) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;

    try {
      setDeleting(id);
      setError(null);
      const response = await apiClient.deleteBackup(id);
      if (response.success) {
        fetchBackups();
        fetchStats();
      } else {
        setError(response.message || 'Failed to delete backup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadBackup = async (id: number, filename: string) => {
    try {
      setDownloading(id);
      setError(null);
      await apiClient.downloadBackup(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download backup');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} />;
      case 'processing': return <Clock size={16} className="animate-spin" />;
      case 'pending': return <Clock size={16} />;
      case 'failed': return <AlertCircle size={16} />;
      default: return <HardDrive size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">System configuration and data management</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Backup Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Total Backups</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_backups}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Total Size</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total_size_formatted}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.status_counts?.completed || 0}</p>
          </div>
        </div>
      )}

      {/* Database Backups Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} className="text-blue-500" /> Database Backups
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and restore database backups</p>
        </div>

        <div className="p-6 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700">Create New Backup</span>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Plus size={16} /> {creating ? 'Creating...' : 'New Backup'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No backups found. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="bg-white p-4 rounded-lg border border-slate-200 flex items-start justify-between hover:border-slate-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getStatusColor(backup.status)}`}>
                        {getStatusIcon(backup.status)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{backup.filename}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(backup.created_at).toLocaleDateString()} {new Date(backup.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-600 ml-11">
                      <span className={`px-2 py-1 rounded ${getStatusColor(backup.status)}`}>{backup.status}</span>
                      <span>{backup.type}</span>
                      <span>{formatFileSize(backup.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                      disabled={downloading === backup.id}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Download backup"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      disabled={deleting === backup.id}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete backup"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Local JSON Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} className="text-green-500" /> Local Export
          </h2>
          <p className="text-sm text-slate-500 mt-1">Export raw data for external analysis</p>
        </div>

        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-700">Export Raw JSON</p>
              <p className="text-xs text-slate-500">Download all projects, items, tasks, and logs.</p>
            </div>
            <button
              onClick={downloadDatabase}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download size={16} /> Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
