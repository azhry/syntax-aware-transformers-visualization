import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

export const Scene8Training: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 10);
  const formulaOp = ap(f, 10, 12);
  const calculusOp = ap(f, 35, 15);
  const curveP = ap(f, 60, 20);

  // Simulated loss curve
  const CURVE_PTS = 50;
  const curveVisible = Math.round(curveP * CURVE_PTS);
  const pts = Array.from({ length: CURVE_PTS }, (_, i) => {
    const t = i / (CURVE_PTS - 1);
    const loss = 2.5 * Math.exp(-t * 3.5) + 0.18 + Math.sin(i * 1.2) * 0.04 * Math.exp(-t * 3);
    return { t, loss };
  });

  const SVG_W = 900, SVG_H = 320;
  const PAD = { l: 70, r: 40, t: 20, b: 60 };
  const iw = SVG_W - PAD.l - PAD.r;
  const ih = SVG_H - PAD.t - PAD.b;
  const maxLoss = 2.8;
  const toX = (t: number) => PAD.l + t * iw;
  const toY = (l: number) => PAD.t + (1 - l / maxLoss) * ih;

  const pathD = pts.slice(0, curveVisible + 1).map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t)},${toY(p.loss)}`).join(' ');

  const curPt = pts[Math.min(curveVisible, CURVE_PTS - 1)];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
      <div style={{ opacity: titleOp, fontSize: 52, fontWeight: 900, color: COLORS.primaryLight, alignSelf: 'flex-start' }}>Training Objective</div>

      {/* Formula */}
      <div style={{ opacity: formulaOp, background: COLORS.surface, borderRadius: 16, padding: '20px 48px', border: `1px solid ${COLORS.primary}44`, width: '100%', maxWidth: 1000 }}>
        <div style={{ fontSize: 16, color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>Joint Cross-Entropy Loss</div>
        <BlockMath math="\mathcal{L}(\theta) = -\sum_{\varphi \in \Phi} \sum_{i,j=1}^{n} Y^{(\varphi)}_{ij} \log\!\left(p^{(\varphi)}_{ij}\right)" />

        {calculusOp > 0 && (
          <div style={{ opacity: calculusOp, marginTop: 24, padding: '16px 24px', background: 'rgba(0,0,0,0.85)', borderRadius: 12, border: `2px solid ${COLORS.positive}44`, color: COLORS.positive }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: COLORS.positive, marginBottom: 8, textTransform: 'uppercase' }}>LITERAL EVALUATION (Single Word-Pair)</div>
            <div style={{ fontSize: 18 }}>
              <InlineMath math="-\left[ 1(Y_{ij}) \cdot \log(0.88) \right] - \left[ 0 \cdot \log(0.02) \right] \dots = 0.128" />
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, fontWeight: 700 }}>
              Correct prediction maximizes probability <InlineMath math="p_{ij}" /> where <InlineMath math="Y_{ij}=1" />
            </div>
          </div>
        )}
      </div>

      {/* Loss curve */}
      <div style={{ opacity: ap(f, 60, 10), marginTop: 20 }}>
        <div style={{ fontSize: 18, color: COLORS.textMuted, marginBottom: 12, fontWeight: 700 }}>Stochastic Gradient Descent Flow:</div>
        <svg width={SVG_W} height={SVG_H}>
          {/* Axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ih} stroke={COLORS.textMuted} strokeWidth={2} opacity={0.5} />
          <line x1={PAD.l} y1={PAD.t + ih} x2={PAD.l + iw} y2={PAD.t + ih} stroke={COLORS.textMuted} strokeWidth={2} opacity={0.5} />
          <text x={PAD.l - 40} y={PAD.t + ih / 2} textAnchor="middle" fill={COLORS.textMuted} fontSize={14} fontWeight={900} transform={`rotate(-90, ${PAD.l - 40}, ${PAD.t + ih / 2})`}>LOSS</text>
          <text x={PAD.l + iw / 2} y={PAD.t + ih + 40} textAnchor="middle" fill={COLORS.textMuted} fontSize={14} fontWeight={900}>TRAINING EPOCHS</text>

          {/* Grid */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].map(l => (
            <g key={l}>
              <line x1={PAD.l - 6} y1={toY(l)} x2={PAD.l + iw} y2={toY(l)} stroke={COLORS.textMuted} strokeWidth={0.5} opacity={0.2} strokeDasharray="6,4" />
              <text x={PAD.l - 12} y={toY(l)} textAnchor="end" dominantBaseline="middle" fill={COLORS.textMuted} fontSize={13} fontWeight={700}>{l}</text>
            </g>
          ))}

          {/* Glow */}
          <path d={pathD} fill="none" stroke={COLORS.primary} strokeWidth={10} opacity={0.1} />
          {/* Curve */}
          {curveP > 0 && <path d={pathD} fill="none" stroke={COLORS.primary} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />}

          {/* Current marker */}
          {curveP > 0.02 && (
            <g>
              <circle cx={toX(curPt.t)} cy={toY(curPt.loss)} r={10} fill={COLORS.positive} />
              <rect x={toX(curPt.t) + 16} y={toY(curPt.loss) - 20} width={120} height={40} rx={8} fill={COLORS.surface} stroke={`${COLORS.positive}88`} strokeWidth={2} />
              <text x={toX(curPt.t) + 76} y={toY(curPt.loss)} textAnchor="middle" dominantBaseline="middle" fill={COLORS.positive} fontSize={18} fontWeight="900">
                L = {curPt.loss.toFixed(3)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
