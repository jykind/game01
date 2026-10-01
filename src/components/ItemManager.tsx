import React, { useState } from 'react';
import { Plus, Trash2, Shuffle, Equal, FileText, Check, AlertCircle } from 'lucide-react';
import { RouletteItem } from '../types';
import { VIBRANT_PALETTE } from '../data/presets';

interface ItemManagerProps {
  items: RouletteItem[];
  onUpdateItems: (items: RouletteItem[]) => void;
  onResetPreset: () => void;
  presetTitle: string;
}

export const ItemManager: React.FC<ItemManagerProps> = ({
  items,
  onUpdateItems,
  onResetPreset,
  presetTitle,
}) => {
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const activeCount = items.filter(it => it.enabled).length;

  const handleToggle = (id: string) => {
    onUpdateItems(
      items.map(item => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    onUpdateItems(
      items.map(item => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleWeightChange = (id: string, weight: number) => {
    const validWeight = Math.max(1, Math.min(10, weight));
    onUpdateItems(
      items.map(item => (item.id === id ? { ...item, weight: validWeight } : item))
    );
  };

  const handleColorChange = (id: string, newColor: string) => {
    onUpdateItems(
      items.map(item => (item.id === id ? { ...item, color: newColor } : item))
    );
  };

  const handleDelete = (id: string) => {
    if (items.length <= 2) {
      alert('룰렛을 돌리기 위해서는 최소 2개의 항목이 필요합니다.');
      return;
    }
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    const nextColor = VIBRANT_PALETTE[items.length % VIBRANT_PALETTE.length];
    const newItem: RouletteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: trimmed,
      color: nextColor,
      weight: 1,
      enabled: true,
    };

    onUpdateItems([...items, newItem]);
    setNewItemText('');
  };

  const handleShuffle = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    onUpdateItems(shuffled);
  };

  const handleEqualize = () => {
    onUpdateItems(items.map(it => ({ ...it, weight: 1 })));
  };

  const handleBulkSubmit = () => {
    if (!bulkText.trim()) return;

    // Split by newlines or commas
    const lines = bulkText
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length === 0) return;

    const newItems: RouletteItem[] = lines.map((label, index) => {
      const color = VIBRANT_PALETTE[(items.length + index) % VIBRANT_PALETTE.length];
      return {
        id: `bulk-${Date.now()}-${index}`,
        label,
        color,
        weight: 1,
        enabled: true,
      };
    });

    onUpdateItems([...items, ...newItems]);
    setBulkText('');
    setBulkModalOpen(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Top Header & Quick Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
            항목 설정
            <span className="text-xs font-normal text-slate-400">
              ({activeCount}/{items.length}개 활성화)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            이름, 가중치(확률), 색상을 자유롭게 변경하세요
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShuffle}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="순서 섞기"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleEqualize}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="모든 항목 가중치 1로 통일"
          >
            <Equal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBulkModalOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="일괄 텍스트 추가"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
          placeholder="새 항목 이름 입력..."
          className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </form>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px] custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            등록된 항목이 없습니다. 항목을 추가해주세요!
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                item.enabled
                  ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-950/20 border-slate-900 opacity-50'
              }`}
            >
              {/* Enable / Disable Checkbox */}
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={() => handleToggle(item.id)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer accent-amber-500"
                title={item.enabled ? '항목 비활성화' : '항목 활성화'}
              />

              {/* Color swatch picker */}
              <div className="relative group/color shrink-0">
                <input
                  type="color"
                  value={item.color}
                  onChange={e => handleColorChange(item.id, e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
                  title="슬라이스 색상 변경"
                />
              </div>

              {/* Label Input */}
              <input
                type="text"
                value={item.label}
                onChange={e => handleLabelChange(item.id, e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-sm text-slate-200 border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none px-1 py-0.5 font-medium"
              />

              {/* Weight / Probability multiplier */}
              <div className="flex items-center gap-1 shrink-0" title="가중치 (높을수록 룰렛 칸이 넓어집니다)">
                <span className="text-[11px] text-slate-500">배율:</span>
                <select
                  value={item.weight}
                  onChange={e => handleWeightChange(item.id, Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-md text-xs text-amber-400 font-bold px-1.5 py-1 focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={5}>5x</option>
                  <option value={10}>10x</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-md transition-colors shrink-0"
                title="항목 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer info & Preset reset */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onResetPreset}
          className="hover:text-amber-400 underline underline-offset-2 transition-colors"
        >
          '{presetTitle}' 기본 목록으로 복원
        </button>
        <span className="text-slate-500">
          최소 2개 활성화 필요
        </span>
      </div>

      {/* Bulk Add Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">
              항목 일괄 추가
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              여러 항목을 줄바꿈(Enter) 또는 쉼표(,)로 구분하여 한 번에 등록하세요.
            </p>

            <textarea
              rows={6}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="예시:&#10;짜장면&#10;짬뽕&#10;탕수육&#10;볶음밥"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={!bulkText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-xl transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                추가 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
