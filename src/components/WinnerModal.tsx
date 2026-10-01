import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, UserMinus, Copy, Check, X } from 'lucide-react';
import { RouletteItem } from '../types';

interface WinnerModalProps {
  winner: RouletteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveAndSpinAgain: (item: RouletteItem) => void;
  presetTitle: string;
  totalWeight: number;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  isOpen,
  onClose,
  onSpinAgain,
  onRemoveAndSpinAgain,
  presetTitle,
  totalWeight,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && winner) {
      // Fire double celebratory confetti cannons!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 250);
      } catch {}
    }
  }, [isOpen, winner]);

  if (!isOpen || !winner) return null;

  const probability = totalWeight > 0 ? (((winner.weight || 1) / totalWeight) * 100).toFixed(1) : '0';

  const handleCopy = () => {
    const text = `🎉 [${presetTitle}] 룰렛 결과: "${winner.label}" 당첨!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Trophy Icon */}
        <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Trophy className="w-9 h-9 animate-bounce" />
        </div>

        {/* Header */}
        <p className="text-xs font-semibold tracking-wider text-amber-400 uppercase mb-1">
          {presetTitle} 추첨 결과
        </p>
        <h2 className="text-2xl font-black text-white mb-6">
          행운의 당첨!
        </h2>

        {/* Winner Highlight Card */}
        <div
          className="p-6 rounded-xl border border-white/10 mb-6 shadow-lg transition-all"
          style={{
            backgroundColor: `${winner.color}22`,
            borderColor: winner.color,
          }}
        >
          {winner.emoji && (
            <div className="text-5xl mb-3 drop-shadow-md">
              {winner.emoji}
            </div>
          )}
          <div className="text-3xl font-extrabold text-white tracking-tight break-keep drop-shadow-sm">
            {winner.label}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-300">
            당첨 확률: <span className="text-amber-300 font-bold">{probability}%</span> (가중치 {winner.weight})
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <button
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            다시 돌리기
          </button>

          <button
            onClick={() => {
              onClose();
              onRemoveAndSpinAgain(winner);
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/50 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all active:scale-95"
            title="당첨된 항목을 목록에서 비활성화하고 바로 다음 턴을 돌립니다"
          >
            <UserMinus className="w-4 h-4" />
            항목 제외 후 재스핀
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">결과가 클립보드에 복사되었습니다!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>결과 텍스트 복사하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
