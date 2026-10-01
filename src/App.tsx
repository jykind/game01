import React, { useState, useEffect, useCallback } from 'react';
import { Play, Sparkles, SlidersHorizontal, CheckSquare, Zap, Clock, ShieldAlert } from 'lucide-react';
import { RouletteItem, SpinHistoryItem, RoulettePreset } from './types';
import { PRESETS } from './data/presets';
import { RouletteWheel } from './components/RouletteWheel';
import { ItemManager } from './components/ItemManager';
import { WinnerModal } from './components/WinnerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Header } from './components/Header';
import { playClickSound } from './utils/audio';

export default function App() {
  const [currentPresetId, setCurrentPresetId] = useState<string>('food');
  const [items, setItems] = useState<RouletteItem[]>(() => {
    const defaultPreset = PRESETS[0];
    return defaultPreset.items.map((it, idx) => ({
      ...it,
      id: `init-${idx}`,
      enabled: true,
    }));
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);

  // Settings
  const [durationSeconds, setDurationSeconds] = useState<number>(4);
  const [autoRemoveWinner, setAutoRemoveWinner] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // History & Storage
  const [history, setHistory] = useState<SpinHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('roulette_spin_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyOpen, setHistoryOpen] = useState(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roulette_spin_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Current Preset metadata
  const currentPreset = PRESETS.find(p => p.id === currentPresetId) || PRESETS[0];
  const activeItems = items.filter(it => it.enabled);
  const totalWeight = activeItems.reduce((sum, item) => sum + (item.weight || 1), 0);

  // Change preset
  const handleSelectPreset = (presetId: string) => {
    playClickSound(soundEnabled);
    setCurrentPresetId(presetId);
    const targetPreset = PRESETS.find(p => p.id === presetId);
    if (targetPreset) {
      setItems(
        targetPreset.items.map((it, idx) => ({
          ...it,
          id: `${presetId}-${Date.now()}-${idx}`,
          enabled: true,
        }))
      );
    }
  };

  // Reset current preset to original items
  const handleResetPreset = () => {
    playClickSound(soundEnabled);
    const target = PRESETS.find(p => p.id === currentPresetId) || PRESETS[0];
    setItems(
      target.items.map((it, idx) => ({
        ...it,
        id: `${target.id}-${Date.now()}-${idx}`,
        enabled: true,
      }))
    );
  };

  // Trigger Spin
  const startSpin = useCallback(() => {
    if (isSpinning || activeItems.length < 2) return;
    setIsSpinning(true);
    setWinnerModalOpen(false);
  }, [isSpinning, activeItems.length]);

  // Handle Spin Finished
  const handleSpinEnd = useCallback(
    (winningItem: RouletteItem) => {
      setIsSpinning(false);
      setWinner(winningItem);
      setWinnerModalOpen(true);

      // Record in History
      const newHistoryItem: SpinHistoryItem = {
        id: `spin-${Date.now()}`,
        timestamp: Date.now(),
        result: winningItem.label,
        emoji: winningItem.emoji,
        color: winningItem.color,
        presetTitle: currentPreset.title,
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));

      // Auto remove winner if survival elimination mode is on
      if (autoRemoveWinner) {
        setItems(prev =>
          prev.map(it => (it.id === winningItem.id ? { ...it, enabled: false } : it))
        );
      }
    },
    [autoRemoveWinner, currentPreset.title]
  );

  // Remove winner and immediately spin again
  const handleRemoveAndSpinAgain = (itemToRemove: RouletteItem) => {
    const updated = items.map(it => (it.id === itemToRemove.id ? { ...it, enabled: false } : it));
    setItems(updated);
    const remainingActive = updated.filter(it => it.enabled);
    if (remainingActive.length >= 2) {
      setTimeout(() => {
        setIsSpinning(true);
      }, 300);
    }
  };

  // Keyboard shortcut: Spacebar triggers spin when not inside input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
          e.preventDefault();
          startSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, startSpin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Preset Mobile Sub-navigation & Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
              <span>{currentPreset.category} 모드</span>
              <span aria-hidden="true">·</span>
              <span>스마트 룰렛</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentPreset.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {currentPreset.description}
            </p>
          </div>

          {/* Quick preset selector buttons for mobile */}
          <div className="flex md:hidden overflow-x-auto gap-1.5 pb-2 custom-scrollbar">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  currentPresetId === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Wheel Arena (Left) vs Item Customizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* Left Column: Interactive Roulette Arena */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Canvas Wheel Component */}
            <div className="w-full max-w-[440px] flex items-center justify-center my-2 relative z-10">
              <RouletteWheel
                items={items}
                isSpinning={isSpinning}
                onSpinStart={startSpin}
                onSpinEnd={handleSpinEnd}
                durationSeconds={durationSeconds}
                soundEnabled={soundEnabled}
              />
            </div>

            {/* Spin Status or Shortcut prompt */}
            <div className="text-center my-3 z-10">
              {activeItems.length < 2 ? (
                <p className="text-sm font-semibold text-rose-400">
                  ⚠️ 룰렛을 돌리려면 최소 2개 이상의 항목을 활성화해주세요.
                </p>
              ) : isSpinning ? (
                <p className="text-sm font-bold text-amber-400 animate-pulse">
                  🌀 운명의 결과가 정해지는 중입니다...
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  룰렛 중앙의 <span className="text-amber-400 font-bold">START</span> 또는 스페이스바(Space)를 눌러보세요!
                </p>
              )}
            </div>

            {/* Giant Main Spin Action Button */}
            <div className="w-full max-w-sm mt-2 z-10 flex flex-col gap-3">
              <button
                onClick={startSpin}
                disabled={isSpinning || activeItems.length < 2}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className={`w-5 h-5 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? '추첨 진행 중...' : '돌려돌려 돌림판!'}</span>
              </button>

              {/* Spin Tuning Controls (Speed & Elimination Mode) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {/* Spin Duration Selector */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    시간
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { sec: 2, label: '2초' },
                      { sec: 4, label: '4초' },
                      { sec: 7, label: '7초' },
                    ].map(opt => (
                      <button
                        key={opt.sec}
                        disabled={isSpinning}
                        onClick={() => {
                          playClickSound(soundEnabled);
                          setDurationSeconds(opt.sec);
                        }}
                        className={`px-2 py-0.5 rounded font-bold transition-colors ${
                          durationSeconds === opt.sec
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Remove Winner Toggle */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => {
                    playClickSound(soundEnabled);
                    setAutoRemoveWinner(!autoRemoveWinner);
                  }}
                  className={`flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                    autoRemoveWinner
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="당첨된 항목을 다음 턴부터 자동 제외(서바이벌/순차 추첨 모드)"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    당첨자 제외
                  </span>
                  <span className={`font-bold ${autoRemoveWinner ? 'text-rose-400' : 'text-slate-500'}`}>
                    {autoRemoveWinner ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Item Management & Customization Panel */}
          <div className="lg:col-span-5 h-full">
            <ItemManager
              items={items}
              onUpdateItems={setItems}
              onResetPreset={handleResetPreset}
              presetTitle={currentPreset.title}
            />
          </div>
        </div>
      </main>

      {/* Winner Celebration Modal */}
      <WinnerModal
        winner={winner}
        isOpen={winnerModalOpen}
        onClose={() => setWinnerModalOpen(false)}
        onSpinAgain={startSpin}
        onRemoveAndSpinAgain={handleRemoveAndSpinAgain}
        presetTitle={currentPreset.title}
        totalWeight={totalWeight}
      />

      {/* History & Statistics Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
