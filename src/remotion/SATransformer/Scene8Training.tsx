import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

export const Scene8Training: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 10);
  const formulaOp = ap(f, 10, 12);
  const curveP = ap(f, 24, 20);

  // Simulated loss curve
  const CURVE_PTS = 50;
  const curveVisible = Math.round(curveP * CURVE_PTS);
  const pts = Array.from({ length: CURVE_PTS }, (_, i) => {
    const t = i / (CURVE_PTS - 1);
    const loss = 2.5 * Math.exp(-t * 3.5) + 0.18 + Math.sin(i * 1.2) * 0.04 * Math.exp(-t * 3);
    return { t, loss };
  });

  const SVG_W = 900, SVG_H = 360;
  const PAD = { l: 70, r: 40, t: 20, b: 60 };
  const iw = SVG_W - PAD.l - PAD.r;
  const ih = SVG_H - PAD.t - PAD.b;
  const maxLoss = 2.8;
  const toX = (t: number) => PAD.l + t * iw;
  const toY = (l: number) => PAD.t + (1 - l / maxLoss) * ih;

  const pathD = pts.slice(0, curveVisible + 1).map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t)},${toY(p.loss)}`).join(' ');

  const curPt = pts[Math.min(curveVisible, CURVE_PTS - 1)];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 120px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center' }}>
      <div style={{ opacity: titleOp, fontSize: 52, fontWeight: 800, color: COLORS.primaryLight, alignSelf: 'flex-start' }}>Training Objective</div>

      {/* Formula */}
      <div style={{ opacity: formulaOp, background: COLORS.surface, borderRadius: 14, padding: '20px 48px', border: `1px solid ${COLORS.primary}44`, width: '100%', maxWidth: 900 }}>
        <div style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 8 }}>Cross-Entropy Loss over all samples, word pairs, and tag types:</div>
        <BlockMath math="\mathcal{L}(\theta) = \sum_{\varphi} \sum_{i=1}^{n} \sum_{j=1}^{n} Y^{(\varphi)}_{ij} \log\!\left(p^{(\varphi), \top}_{ij} \mid \theta\right)" />
        <div style={{ display: 'flex', gap: 32, marginTop: 8, fontSize: 18 }}>
          {[
            { t: 'Y^{(\\varphi)}_{ij}', d: '= gold label', c: COLORS.positive },
            { t: 'p^{(\\varphi),\\top}_{ij}', d: '= model prediction', c: COLORS.primary },
            { t: '\\varphi', d: '= tag type (A, O, Pos, Neg, Neu)', c: COLORS.aspect },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: 17, color: item.c }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loss curve */}
      <div style={{ opacity: ap(f, 24, 10) }}>
        <div style={{ fontSize: 18, color: COLORS.textMuted, marginBottom: 8 }}>Training loss over epochs (simulated):</div>
        <svg width={SVG_W} height={SVG_H}>
          {/* Axes */}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ih} stroke={COLORS.textMuted} strokeWidth={2} opacity={0.5} />
          <line x1={PAD.l} y1={PAD.t + ih} x2={PAD.l + iw} y2={PAD.t + ih} stroke={COLORS.textMuted} strokeWidth={2} opacity={0.5} />
          <text x={PAD.l - 8} y={PAD.t + ih / 2} textAnchor="middle" fill={COLORS.textMuted} fontSize={14} transform={`rotate(-90, ${PAD.l - 8}, ${PAD.t + ih / 2})`}>Loss</text>
          <text x={PAD.l + iw / 2} y={PAD.t + ih + 40} textAnchor="middle" fill={COLORS.textMuted} fontSize={14}>Epoch →</text>

          {/* Grid */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].map(l => (
            <g key={l}>
              <line x1={PAD.l - 6} y1={toY(l)} x2={PAD.l + iw} y2={toY(l)} stroke={COLORS.textMuted} strokeWidth={0.5} opacity={0.2} strokeDasharray="6,4" />
              <text x={PAD.l - 10} y={toY(l)} textAnchor="end" dominantBaseline="middle" fill={COLORS.textMuted} fontSize={13}>{l}</text>
            </g>
          ))}

          {/* Glow */}
          <path d={pathD} fill="none" stroke={COLORS.primary} strokeWidth={8} opacity={0.07} />
          {/* Curve */}
          {curveP > 0 && <path d={pathD} fill="none" stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" opacity={0.9} />}

          {/* Current marker */}
          {curveP > 0.02 && (
            <g>
              <circle cx={toX(curPt.t)} cy={toY(curPt.loss)} r={8} fill={COLORS.positive} />
              <rect x={toX(curPt.t) + 12} y={toY(curPt.loss) - 18} width={110} height={36} rx={6} fill={COLORS.surface} stroke={`${COLORS.positive}88`} strokeWidth={1} />
              <text x={toX(curPt.t) + 67} y={toY(curPt.loss)} textAnchor="middle" dominantBaseline="middle" fill={COLORS.positive} fontSize={16} fontWeight="bold">
                L = {curPt.loss.toFixed(3)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
