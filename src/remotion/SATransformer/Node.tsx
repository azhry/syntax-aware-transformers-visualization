import React from 'react';
import { useViewportRect } from 'remotion-bits';
import { COLORS } from './types';

export const Node: React.FC<{
  label: string;
  type?: 'word' | 'aspect' | 'opinion';
  polarity?: 'Pos' | 'Neg' | 'Neu';
  active?: boolean;
  style?: React.CSSProperties;
}> = ({ label, type = 'word', polarity, active = true, style }) => {
  const { vmin } = useViewportRect();

  let bgColor = COLORS.surface;
  let borderColor = COLORS.surface;

  if (type === 'aspect') {
    borderColor = COLORS.aspect;
    bgColor = active ? `${COLORS.aspect}33` : COLORS.surface;
  } else if (type === 'opinion') {
    borderColor = COLORS.opinion;
    bgColor = active ? `${COLORS.opinion}33` : COLORS.surface;
  }

  return (
    <div style={{
      padding: `${vmin * 1.5}px ${vmin * 3}px`,
      borderRadius: vmin * 1,
      backgroundColor: bgColor,
      border: `2px solid ${borderColor}`,
      color: COLORS.text,
      fontSize: vmin * 2.5,
      fontWeight: 'bold',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: active ? 1 : 0.5,
      boxShadow: active && type !== 'word' ? `0 0 ${vmin * 2}px ${borderColor}88` : 'none',
      ...style
    }}>
      {label}
      {polarity && (
        <span style={{
          fontSize: vmin * 1.5,
          marginTop: vmin * 0.5,
          padding: `${vmin * 0.2}px ${vmin * 1}px`,
          borderRadius: vmin * 0.5,
          backgroundColor: polarity === 'Pos' ? COLORS.positive : polarity === 'Neg' ? COLORS.negative : COLORS.neutral,
          color: '#fff',
        }}>
          {polarity}
        </span>
      )}
    </div>
  );
};
