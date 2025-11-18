// frontend-app/src/components/TargetManager.tsx
// (FILE MỚI HOÀN TOÀN - Giai Đoạn 4.2)

import React, { useState, useEffect, useCallback } from 'react';
import { Target, TargetType } from '../types';
import * as api from '../services/apiService'; // Import tất cả API
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

// --- Form Thêm Mới ---
const AddTargetForm: React.FC<{ onTargetAdded: () => void }> = ({ onTargetAdded }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TargetType>(TargetType.GNews);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;
    
    setIsLoading(true);
    try {
      await api.createTarget({
        target_name: name,
        target_type: type,
        target_value: value,
      });
      // Reset form
      setName('');
      setValue('');
      setType(TargetType.GNews);
      onTargetAdded(); // Gọi callback để tải lại danh sách
    } catch (err) {
      alert('Failed to create target: ' + (err as Error).message);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white">Add New Target</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="target_name" className="block text-sm font-medium text-gray-300 mb-1">Target Name</label>
            <input
              id="target_name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'GNews - Vinfast'"
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200" required
            />
          </div>
          <div>
            <label htmlFor="target_type" className="block text-sm font-medium text-gray-300 mb-1">Target Type</label>
            <select
              id="target_type" value={type} onChange={(e) => setType(e.target.value as TargetType)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200"
            >
              {Object.values(TargetType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="target_value" className="block text-sm font-medium text-gray-300 mb-1">Value (Keyword or URL)</label>
          <input
            id="target_value" type="text" value={value} onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., 'Vinfast' or 'https://vnexpress.net'"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200" required
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
          disabled={!name.trim() || !value.trim() || isLoading}
        >
          {isLoading ? <SpinnerIcon /> : <PlusIcon className="h-5 w-5 mr-2" />}
          Add Target
        </button>
      </form>
    </div>
  );
};

// --- Bảng Hiển thị Danh sách ---
const TargetList: React.FC<{
  targets: Target[];
  onToggle: (id: string, newStatus: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ targets, onToggle, onDelete }) => {
  if (targets.length === 0) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400">No targets found. Add one using the form.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {targets.map((target) => (
            <tr key={target.id} className="hover:bg-gray-800">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={target.is_active}
                  onChange={(e) => onToggle(target.id, e.target.checked)}
                  className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
              </td>
              <td className="px-6 py-4 text-sm text-white">{target.target_name}</td>
              <td className="px-6 py-4 text-sm text-gray-300">{target.target_type}</td>
              <td className="px-6 py-4 text-sm text-gray-300 font-mono">{target.target_value}</td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(target.id)} className="text-gray-500 hover:text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Component Cha (Container) ---
const TargetManager: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getTargets();
      setTargets(data);
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  const handleTargetAdded = () => {
    loadTargets(); // Tải lại danh sách sau khi thêm
  };

  const handleToggle = useCallback(async (id: string, newStatus: boolean) => {
    try {
      await api.toggleTargetStatus(id, newStatus);
      // Cập nhật UI ngay lập tức
      setTargets(currentTargets =>
        currentTargets.map(t => (t.id === id ? { ...t, is_active: newStatus } : t))
      );
    } catch (err) {
      alert('Failed to update status: ' + (err as Error).message);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      try {
        await api.deleteTarget(id);
        loadTargets(); // Tải lại danh sách
      } catch (err) {
        alert('Failed to delete target: ' + (err as Error).message);
      }
    }
  }, [loadTargets]);

  if (error) {
    return <div className="text-red-400">Error loading targets: {error}</div>;
  }

  if (isLoading && targets.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AddTargetForm onTargetAdded={handleTargetAdded} />
      <TargetList targets={targets} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
};

export default TargetManager;