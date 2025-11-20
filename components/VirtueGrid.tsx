
import React, { useState } from 'react';
import { Virtue } from '../types';
import { Info, Check, Edit2, Trash2, Save, X, Plus } from 'lucide-react';

interface Props {
  virtues: Virtue[];
  onToggle: (id: string, dayIndex: number) => void;
  onUpdate: (virtue: Virtue) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const VirtueGrid: React.FC<Props> = ({ virtues, onToggle, onUpdate, onDelete, onAdd }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{name: string, description: string}>({ name: '', description: '' });

  const startEdit = (virtue: Virtue) => {
    setEditingId(virtue.id);
    setEditForm({ name: virtue.name, description: virtue.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const saveEdit = (virtue: Virtue) => {
    if (editForm.name.trim()) {
      onUpdate({ ...virtue, name: editForm.name, description: editForm.description });
      setEditingId(null);
    }
  };

  return (
    <div className="bg-void-light border border-gray-600 rounded-xl p-6 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gold font-mono uppercase tracking-widest">Franklin's Virtues</h2>
          <p className="text-sm text-gray-300 mt-1">Daily adherence tracking. Consistency builds character.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 rounded hover:bg-gold/20 transition-all text-xs font-bold font-mono"
          >
            <Plus size={14} /> Add Virtue
          </button>
          <div className="text-xs text-gray-400 flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-600">
            <Info size={14} className="text-gold" />
            <span className="hidden md:inline">Click squares to toggle</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-xs font-bold font-mono text-gold uppercase tracking-widest w-1/3">Virtue</th>
              {days.map((d, i) => (
                <th key={i} className="p-3 text-center text-sm font-bold font-mono text-gray-300">{d}</th>
              ))}
              <th className="p-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {virtues.map((virtue) => (
              <tr key={virtue.id} className="border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  {editingId === virtue.id ? (
                    <div className="space-y-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-black border border-gold/50 rounded px-2 py-1 text-white font-bold focus:outline-none"
                        placeholder="Virtue Name"
                      />
                      <input 
                        type="text" 
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full bg-black border border-gray-600 rounded px-2 py-1 text-gray-300 text-xs focus:outline-none"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-base text-white mb-1 group-hover:text-gold transition-colors">{virtue.name}</div>
                      <div className="text-xs text-gray-400 italic" title={virtue.description}>
                        {virtue.description}
                      </div>
                    </>
                  )}
                </td>
                
                {virtue.adherence.map((completed, dIdx) => (
                  <td key={dIdx} className="p-2 text-center">
                    <button
                      onClick={() => !editingId && onToggle(virtue.id, dIdx)}
                      disabled={!!editingId}
                      className={`w-8 h-8 rounded transition-all duration-200 flex items-center justify-center border mx-auto ${
                        completed 
                          ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)] scale-105' 
                          : 'bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {completed && <Check size={16} className="text-black stroke-[3]" />}
                    </button>
                  </td>
                ))}

                <td className="p-2 text-center">
                  {editingId === virtue.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => saveEdit(virtue)} className="text-green-400 hover:text-green-300 bg-green-900/20 p-1.5 rounded"><Save size={16} /></button>
                      <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-200 bg-gray-800 p-1.5 rounded"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(virtue)} className="text-gray-400 hover:text-gold"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(virtue.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {virtues.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg mt-4">
          <p className="text-gray-400 mb-2">No virtues defined yet.</p>
          <button onClick={onAdd} className="text-sm text-gold font-bold hover:underline">Define your first virtue</button>
        </div>
      )}
    </div>
  );
};

export default VirtueGrid;
