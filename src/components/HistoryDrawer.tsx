import React from 'react';
import { History, Trash2, Award, Clock, X } from 'lucide-react';
import { SpinHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpinHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  // Compute item win counts for frequency leaderboard
  const frequencyMap = history.reduce<Record<string, { count: number; color: string; emoji?: string }>>(
    (acc, cur) => {
      if (!acc[cur.result]) {
        acc[cur.result] = { count: 0, color: cur.color, emoji: cur.emoji };
      }
      acc[cur.result].count += 1;
      return acc;
    },
    {}
  );

  const leaderboard = Object.entries(frequencyMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">추첨 기록 및 통계</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar pr-1">
          {/* Top Leaderboard */}
          {leaderboard.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
                <Award className="w-4 h-4" />
                최다 당첨 랭킹
              </div>
              <div className="space-y-1.5">
                {leaderboard.map(([name, data], idx) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 font-bold text-xs text-amber-400/80">#{idx + 1}</span>
                      {data.emoji && <span>{data.emoji}</span>}
                      <span className="font-medium text-slate-200 truncate">{name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                      {data.count}회 당첨
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronological History Log */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                최근 당첨 내역 ({history.length}건)
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors normal-case"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  기록 비우기
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                아직 진행된 룰렛 추첨 기록이 없습니다.
                <br />
                지금 바로 룰렛을 돌려보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100 truncate">
                          {item.emoji && <span>{item.emoji}</span>}
                          <span>{item.result}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.presetTitle}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
