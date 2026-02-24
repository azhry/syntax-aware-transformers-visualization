export type WordNode = {
  id: string;
  word: string;
  type: 'word' | 'aspect' | 'opinion';
  polarity?: 'Pos' | 'Neg' | 'Neu';
};

export type DependencyEdge = {
  sourceId: string;
  targetId: string;
  type: string;
};

export const COLORS = {
  background: '#020617',
  surface: '#0f172a',
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#eab308',
  aspect: '#f97316', // orange
  opinion: '#3b82f6', // blue
  text: '#f8fafc',
  textMuted: '#94a3b8',
};
