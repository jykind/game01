export interface RouletteItem {
  id: string;
  label: string;
  color: string;
  weight: number; // 1 to 10 relative weight
  emoji?: string;
  enabled: boolean;
}

export interface RoulettePreset {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  items: Omit<RouletteItem, 'id' | 'enabled'>[];
}

export interface SpinHistoryItem {
  id: string;
  timestamp: number;
  result: string;
  emoji?: string;
  color: string;
  presetTitle: string;
}

export interface SpinSettings {
  duration: number; // in seconds (2, 4, 7)
  autoRemoveWinner: boolean;
  soundEnabled: boolean;
}
