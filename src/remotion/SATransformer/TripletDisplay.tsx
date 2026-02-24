import React from 'react';
import { useViewportRect } from 'remotion-bits';
import { COLORS } from './types';

export const TripletDisplay: React.FC<{
  triplets: { aspect: string; opinion: string; sentiment: 'Pos' | 'Neg' | 'Neu' }[];
  style?: React.CSSProperties;
}> = ({ triplets, style }) => {
  const { vmin } = useViewportRect();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: vmin * 2, ...style }}>
      {triplets.map((t, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: vmin * 2,
          padding: vmin * 2,
          backgroundColor: COLORS.surface,
          borderRadius: vmin * 1,
          border: `1px solid ${COLORS.textMuted}33`
        }}>
          <span style={{ fontSize: vmin * 3, fontWeight: 'bold' }}>(</span>
          <span style={{ color: COLORS.aspect, fontSize: vmin * 2.5, fontWeight: 'bold' }}>{t.aspect}</span>
          <span style={{ color: COLORS.textMuted }}>,</span>
          <span style={{ color: COLORS.opinion, fontSize: vmin * 2.5, fontWeight: 'bold' }}>{t.opinion}</span>
          <span style={{ color: COLORS.textMuted }}>,</span>
          <span style={{
            color: t.sentiment === 'Pos' ? COLORS.positive : t.sentiment === 'Neg' ? COLORS.negative : COLORS.neutral,
            fontSize: vmin * 2.5,
            fontWeight: 'bold'
          }}>{t.sentiment}</span>
          <span style={{ fontSize: vmin * 3, fontWeight: 'bold' }}>)</span>
        </div>
      ))}
    </div>
  );
};
