import React from 'react';
import { Volume2, VolumeX, History, Sparkles } from 'lucide-react';
import { PRESETS } from '../data/presets';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="text-lg font-black tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span>행운의 룰렛</span>
      </a>

      {/* Zone 2: 4-6 clean text navigation links / preset selectors */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {PRESETS.map(preset => {
          const isActive = currentPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                isActive ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'text-slate-400'
              }`}
            >
              {preset.title}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          title={soundEnabled ? '음소거' : '효과음 켜기'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          title="추첨 기록 및 통계"
        >
          <History className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">기록</span>
          {historyCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[10px] font-bold rounded-full">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
