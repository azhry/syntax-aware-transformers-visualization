import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { useViewportRect } from 'remotion-bits';
import 'katex/dist/katex.min.css';

export const FormulaDisplay: React.FC<{
  formula: string;
  block?: boolean;
  style?: React.CSSProperties;
}> = ({ formula, block = true, style }) => {
  const { vmin } = useViewportRect();
  const MathComponent = block ? BlockMath : InlineMath;

  return (
    <div style={{ fontSize: vmin * 3, ...style }}>
      <MathComponent math={formula} />
    </div>
  );
};
