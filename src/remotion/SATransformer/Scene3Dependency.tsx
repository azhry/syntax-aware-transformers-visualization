import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

// Simplified 6-word version for clarity
const WORDS = ['staff', 'was₁', 'courteous', 'but', 'food', 'was₂', 'terrible'];
const TYPES: string[] = ['a', 'n', 'o', 'c', 'a', 'n', 'o']; // aspect, noun/verb, opinion, conjunction
const N = WORDS.length;

// Edges: [src, tgt, label], 0-indexed into WORDS
const EDGES: [number, number, string][] = [
  [0, 1, 'nsubj'],    // staff → was₁
  [2, 1, 'acomp'],    // courteous → was₁
  [1, 5, 'conj'],     // was₁ → was₂  ← THE BRIDGE
  [3, 5, 'cc'],       // but → was₂   ← Why it's adjacent!
  [4, 5, 'nsubj'],    // food → was₂
  [6, 5, 'acomp'],    // terrible → was₂
];

const DEP_COLORS: Record<string, string> = {
  nsubj: '#60a5fa', acomp: '#34d399', conj: '#f97316',
};
const wCol = (t: string) => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

// Symmetric adjacency (self-loops included)
const ADJ = Array.from({ length: N }, (_, r) =>
  Array.from({ length: N }, (_, c) => {
    if (r === c) return 1;
    return EDGES.some(([s, t]) => (s === r && t === c) || (s === c && t === r)) ? 1 : 0;
  })
);

export const Scene3Dependency: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 12);
  const nodeOp = (i: number) => ap(f, 8 + i * 5, 12);
  const edgeOp = (i: number) => ap(f, 38 + i * 12, 14);
  const matrixP = ap(f, 115, 15);
  const cellOp = (r: number, c: number) => ap(f, 132 + (r * N + c) * 2.5, 10);
  const formulaOp = ap(f, 200, 12);

  // Tree layout: was nodes centered, others arranged around
  // Use a proper hierarchical layout
  //   was₁ (1) at top-center-left, was₂ (4) at top-center-right
  //   staff(0) below-left of was₁, courteous(2) below-right of was₁
  //   food(3) below-left of was₂, terrible(5) below-right of was₂
  const WAS1 = { x: 220, y: 80 };
  const WAS2 = { x: 650, y: 80 };
  const POSITIONS: { x: number, y: number }[] = [
    { x: 80, y: 500 },  // staff
    WAS1,               // was₁
    { x: 300, y: 500 }, // courteous
    { x: 435, y: 400 }, // but
    { x: 570, y: 500 }, // food
    WAS2,               // was₂
    { x: 790, y: 500 }, // terrible
  ];

  const SVG_W = 740, SVG_H = 600;

  // CELL size for matrix — scaled to fit right panel
  const CELL = 90;
  const LABEL_W = 60;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '36px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Title */}
      <div style={{ opacity: titleOp, fontSize: 44, fontWeight: 800, color: COLORS.primaryLight, marginBottom: 12 }}>Dependency Structure</div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0, justifyContent: 'center', alignItems: 'center', width: '100%' }}>

        {/* ── Left: Dependency Tree ── */}
        <div style={{ flex: '0 0 760px', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: COLORS.textMuted, fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dependency Parse Tree</div>

          <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
            {/* Edges */}
            {EDGES.map(([s, t, lbl], i) => {
              const op = edgeOp(i);
              if (op < 0.01) return null;
              const p1 = POSITIONS[s], p2 = POSITIONS[t];
              const mx = (p1.x + p2.x) / 2;
              const my = ((p1.y + p2.y) / 2) - 30;
              const col = DEP_COLORS[lbl] ?? '#888';
              const isConj = lbl === 'conj';
              const pathLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) * 1.8;
              return (
                <g key={i} opacity={op}>
                  <path
                    d={`M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`}
                    fill="none" stroke={col} strokeWidth={isConj ? 4 : 2.5} strokeLinecap="round"
                    strokeDasharray={`${op * pathLen} ${pathLen}`}
                  />
                  {op > 0.5 && (
                    <text x={mx} y={my - 8} textAnchor="middle" fill={col}
                      fontSize={24} fontWeight="bold"
                      style={{ paintOrder: 'stroke', stroke: '#020617', strokeWidth: 5 }}>
                      {lbl}
                    </text>
                  )}
                  {/* Arrow tip */}
                  {op > 0.8 && (() => {
                    const dx = p2.x - mx, dy = p2.y - my;
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    return (
                      <polygon
                        points={`${p2.x},${p2.y} ${p2.x - 10},${p2.y - 5} ${p2.x - 10},${p2.y + 5}`}
                        fill={col}
                        transform={`rotate(${angle - 90}, ${p2.x}, ${p2.y})`}
                      />
                    );
                  })()}
                </g>
              );
            })}

            {/* Nodes */}
            {WORDS.map((word, i) => {
              const op = nodeOp(i);
              const col = wCol(TYPES[i]);
              const pos = POSITIONS[i];
              const isWas = word.startsWith('was');
              return (
                <g key={i} opacity={op} transform={`translate(${pos.x}, ${pos.y})`}>
                  <ellipse cx={0} cy={0} rx={72} ry={72}
                    fill={`${col}22`} stroke={col} strokeWidth={isWas ? 3 : 2}
                    style={{ filter: isWas ? `drop-shadow(0 0 8px ${col})` : undefined }} />
                  <text textAnchor="middle" dominantBaseline="middle" fill={col}
                    fontSize={26} fontWeight={"bold"}>{word}</text>
                  <text textAnchor="middle" y={32} fill={col} fontSize={20} opacity={0.7}>
                    {TYPES[i] === 'a' ? 'aspect' : TYPES[i] === 'o' ? 'opinion' : ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Formulas */}
          <div style={{ opacity: formulaOp, display: 'flex', gap: 20, marginTop: 4 }}>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.primary}44`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Adjacency Matrix</div>
              <InlineMath math="A = \{a_{ij}\} \in \{0,1\}^{n \times n}" />
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.aspect}44`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Relationship Matrix</div>
              <InlineMath math="R = \{r_{ij}\} \in \mathbb{R}^{n \times n}" />
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.aspect}66`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Dependency Tuple</div>
              <InlineMath math="(x_i, x_j, r_{ij})" />
            </div>
          </div>
        </div>

        {/* ── Right: Adjacency Matrix ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center', alignItems: 'center', overflow: 'visible', paddingLeft: 100 }}>
          <div style={{ opacity: matrixP, fontSize: 32, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 10 }}>
            Adjacency Matrix A <span style={{ fontSize: 24, color: COLORS.textMuted, fontWeight: 400 }}>(6×6 key words)</span>
          </div>
          <div style={{ opacity: matrixP, overflow: 'visible' }}>
            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `${LABEL_W}px ${WORDS.map(() => `${CELL}px`).join(' ')}`, gap: 2 }}>
              {/* Col headers */}
              <div />
              {WORDS.map((w, c) => (
                <div key={c} style={{
                  fontSize: 24, color: wCol(TYPES[c]),
                  textAlign: 'center', height: 70, display: 'flex',
                  alignItems: 'flex-end', justifyContent: 'center', marginBottom: 18, paddingBottom: 12,
                  transform: 'rotate(-30deg)', transformOrigin: 'bottom center',
                  fontWeight: 700,
                  marginLeft: 90,
                }}>
                  {w}
                </div>
              ))}
              {/* Data rows */}
              {WORDS.map((word, r) => (
                <React.Fragment key={r}>
                  <div style={{ fontSize: 24, color: wCol(TYPES[r]), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12, fontWeight: 700, overflow: 'visible' }}>
                    {word}
                  </div>
                  {WORDS.map((_, c) => {
                    const val = ADJ[r][c];
                    const op = cellOp(r, c);
                    const isConj = (r === 1 && c === 4) || (r === 4 && c === 1);
                    const bg = val === 1 ? (isConj ? `${COLORS.aspect}88` : r === c ? '#2d3748' : `${COLORS.primary}55`) : '#1e293b';
                    return (
                      <div key={c} style={{
                        opacity: op,
                        width: CELL, height: CELL - 8,
                        background: bg,
                        border: `1.5px solid ${val === 1 ? (isConj ? COLORS.aspect : COLORS.primary) : '#334155'}`,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: val === 1 ? 700 : 400,
                        color: val === 1 ? '#fff' : COLORS.textMuted,
                        boxShadow: isConj && val === 1 ? `0 0 12px ${COLORS.aspect}66` : 'none',
                      }}>
                        {val}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: 10, padding: '8px 14px', background: `${COLORS.aspect}18`, border: `1px solid ${COLORS.aspect}44`, borderRadius: 8, fontSize: 24, color: COLORS.aspect, display: 'inline-block' }}>
              ■ Orange = <strong>conj</strong> (was₁ ↔ was₂) & Purple = <strong>cc</strong> (but ↔ was₂)
            </div>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
