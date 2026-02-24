import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

// Path: great(0) → courteous(1) → was₁(2) → was₂(3) → food(4) — 4 hops
const PATH_WORDS = ['great', 'courteous', 'was₁', 'was₂', 'food'];
const PATH_TYPES: ('o' | 'n' | 'a')[] = ['o', 'o', 'n', 'n', 'a'];
const PATH_LABELS = ['acomp', 'acomp', 'conj', 'nsubj'];

const wCol = (t: 'o' | 'n' | 'a') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

export const Scene6Distance: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 10);
  // Animate hops one by one
  const hopOp = (h: number) => ap(f, 8 + h * 10, 10);
  const distOp = ap(f, 8 + 4 * 10 + 5, 12);
  const formulaOp = ap(f, 52, 12);

  const N = PATH_WORDS.length;
  const NODE_SPACING = 220;
  const SVG_W = 1100, SVG_H = 280;
  const NODE_Y = 160;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ opacity: titleOp, fontSize: 48, fontWeight: 800, color: COLORS.primaryLight }}>Syntactic Relative Distance</div>
      <div style={{ opacity: titleOp, fontSize: 22, color: COLORS.textMuted }}>How far are two words in the dependency tree?  Example: dist(<span style={{ color: COLORS.opinion }}>great</span>, <span style={{ color: COLORS.aspect }}>food</span>) = 4</div>

      {/* Path SVG */}
      <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
        {/* Edges / arrows */}
        {PATH_LABELS.map((lbl, h) => {
          const op = hopOp(h);
          if (op < 0.01) return null;
          const x1 = 80 + h * NODE_SPACING;
          const x2 = 80 + (h + 1) * NODE_SPACING;
          const mx = (x1 + x2) / 2;
          const cy = NODE_Y - 70;
          const len = NODE_SPACING * 1.4;
          return (
            <g key={h} opacity={op}>
              <path d={`M${x1 + 40},${NODE_Y} Q${mx},${cy} ${x2 - 40},${NODE_Y}`}
                fill="none" stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={`${op * len} ${len}`} />
              {op > 0.6 && (
                <>
                  {/* Arrowhead */}
                  <polygon points={`${x2 - 40},${NODE_Y} ${x2 - 55},${NODE_Y - 8} ${x2 - 55},${NODE_Y + 8}`} fill={COLORS.primary} opacity={0.9} />
                  <text x={mx} y={cy - 12} textAnchor="middle" fill={COLORS.primary} fontSize={16} fontWeight="bold"
                    style={{ paintOrder: 'stroke', stroke: COLORS.background, strokeWidth: 5 }}>
                    {lbl}
                  </text>
                  {/* Hop counter bubble */}
                  <circle cx={mx} cy={cy - 40} r={18} fill={COLORS.primary} />
                  <text x={mx} y={cy - 40} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={15} fontWeight="bold">
                    {h + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {PATH_WORDS.map((word, i) => {
          const op = ap(f, 4 + i * 2, 8);
          const x = 80 + i * NODE_SPACING;
          const col = wCol(PATH_TYPES[i]);
          const isEnd = i === 0 || i === N - 1;
          return (
            <g key={i} opacity={op}>
              <rect x={x - 48} y={NODE_Y - 26} width={96} height={52} rx={10}
                fill={`${col}22`} stroke={col} strokeWidth={isEnd ? 3 : 1.5} />
              <text x={x} y={NODE_Y} textAnchor="middle" dominantBaseline="middle"
                fill={col} fontSize={20} fontWeight={isEnd ? 'bold' : '600'}>
                {word}
              </text>
            </g>
          );
        })}

        {/* Distance label */}
        {distOp > 0.1 && (
          <g opacity={distOp}>
            <line x1={80} y1={NODE_Y + 50} x2={80 + 4 * NODE_SPACING} y2={NODE_Y + 50}
              stroke={COLORS.positive} strokeWidth={2} strokeDasharray="8,4" />
            <line x1={80} y1={NODE_Y + 40} x2={80} y2={NODE_Y + 60} stroke={COLORS.positive} strokeWidth={2} />
            <line x1={80 + 4 * NODE_SPACING} y1={NODE_Y + 40} x2={80 + 4 * NODE_SPACING} y2={NODE_Y + 60} stroke={COLORS.positive} strokeWidth={2} />
            <text x={80 + 2 * NODE_SPACING} y={NODE_Y + 80} textAnchor="middle" fill={COLORS.positive} fontSize={26} fontWeight="bold">
              dist = {Math.round(distOp * 4)} hops
            </text>
          </g>
        )}
      </svg>

      {/* Formula */}
      <div style={{ opacity: formulaOp, display: 'flex', gap: 32, marginTop: 8 }}>
        <div style={{ flex: 1, background: COLORS.surface, borderRadius: 12, padding: '18px 28px', border: `1px solid ${COLORS.primaryLight}44` }}>
          <div style={{ fontSize: 16, color: COLORS.textMuted, marginBottom: 8 }}>Word Pair Representation  (combines SA-Transformer output + syntactic distance)</div>
          <BlockMath math="o_{ij} = [S^{(L)}_i : S^{(L)}_j : f^d(i, j)]" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', fontSize: 20 }}>
          {[
            { t: 'S^{(L)}_i', d: 'SA-Transformer output for word i', c: COLORS.opinion },
            { t: 'S^{(L)}_j', d: 'SA-Transformer output for word j', c: COLORS.aspect },
            { t: 'f^d(i,j)', d: 'Syntactic distance embedding (dist=4)', c: COLORS.positive },
          ].map((item, i) => (
            <div key={i} style={{ opacity: ap(f, 54 + i * 5, 8), display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: item.c, width: 72 }}><InlineMath math={item.t} /></span>
              <span style={{ color: COLORS.textMuted, fontSize: 17 }}>— {item.d}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
