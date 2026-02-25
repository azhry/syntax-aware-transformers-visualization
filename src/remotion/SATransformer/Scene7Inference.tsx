import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'vegetable', 'salad', 'was', 'well', 'done'];
const N = WORDS.length;
const WTYPES: ('n' | 'a' | 'o')[] = ['n', 'a', 'a', 'n', 'o', 'o'];

// Tag evolution stages: t=0 (RAW), t=1 (REFINED), t=2 (FINAL)
const TAGS_STAGES: string[][][] = [
  // t=0 (Initial Transformer prediction)
  [
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'A', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'A', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'O', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'O'],
  ],
  // t=1 (Adjacency Refined - merging spans)
  [
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'A', 'A', 'N', 'N', 'N'],
    ['N', 'A', 'A', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'O', 'O'],
    ['N', 'N', 'N', 'N', 'O', 'O'],
  ],
  // t=2 (Final corrected triplets)
  [
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'A', 'A', 'N', 'N', 'N'],
    ['N', 'A', 'A', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'N', 'N'],
    ['N', 'N', 'N', 'N', 'O', 'O'],
    ['N', 'N', 'N', 'N', 'O', 'O'],
  ]
];

const tagBg = (t: string) =>
  t === 'A' ? `${COLORS.aspect}66` : t === 'O' ? `${COLORS.opinion}66` : '#1e293b';
const tagBorder = (t: string) =>
  t === 'A' ? COLORS.aspect : t === 'O' ? COLORS.opinion : '#334155';
const wCol = (t: 'n' | 'a' | 'o') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

export const Scene7Inference: React.FC = () => {
  const f = useCurrentFrame();

  // ── TIMING (Duration 210 frames) ──
  const titleOp = ap(f, 0, 15);

  // Stages: Stage 0 (intro + t=0), Stage 1 (t=1 math), Stage 2 (t=2 result)
  const stage = f < 40 ? 0 : f < 130 ? 1 : 2;
  const relF = stage === 1 ? f - 40 : stage === 2 ? f - 130 : f;

  const cellOp = (r: number, c: number) => ap(f, 10 + (r * N + c) * 1, 8);
  const formulaOp = (i: number) => ap(f, 20 + i * 15, 15);
  const calculusOp = ap(f, 50, 20);
  const tripletOp = ap(f, 180, 20);

  const CELL = 52;
  const LABEL = 110;

  // Selected cell for calculus: (1,2) - "vegetable" x "salad"
  const targetR = 1, targetC = 2;

  const getEvaluationMath = (step: number) => {
    // Stage 1 math for p^1_{1,2}
    const c_12 = [0.22, 0.45, 0.08, 0.15, 0.10]; // Tag distribution {A, O, P, N, Neu}
    const c_tilde = [0.65, 0.10, 0.05, 0.05, 0.15]; // Influence from {1,1}, {1,2}, {2,2}
    const gate_w = 0.42;
    const gamma = 0.38;

    const bmax = (val: string) => `\\begin{bmatrix} ${val} \\end{bmatrix}`;
    const v5 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join('\\\\ '));
    const h5 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join(',\\, '));

    const steps = [
      `c^t_{1,2} = \\text{softmax}(W_c \\tilde{o}^t_{1,2} + b_c) = ${v5(c_12)}`,
      `\\tilde{c}^t_{1,2} = W_o ${bmax('c^{t-1}_{1,1} \\\\ c^{t-1}_{0,2} \\\\ c^{t-1}_{0,1}')} = ${v5(c_tilde)}`,
      `\\gamma^t = \\sigma(${gate_w}(W_p) \\cdot ${bmax('c^t_{ij} \\\\ \\tilde{c}^t_{ij}')} ) = ${gamma}`,
      `p^t_{1,2} = ${gamma}(\\gamma^t) \\cdot c^t_{1,2} + (1-${gamma}) \\cdot \\tilde{c}^t_{1,2} = ${v5(c_12.map((val, i) => gamma * val + (1 - gamma) * c_tilde[i]))}`
    ];
    return steps[step] || '';
  };

  const formulas = [
    { label: 'Tag Probability (Iteration t)', math: 'p^t_{ij} = \\gamma^t c^t_{ij} + (1 - \\gamma^t) \\tilde{c}^t_{ij}', color: COLORS.primaryLight },
    { label: 'Adjacency Influence', math: '\\tilde{c}^t_{ij} = W_o [c^{t-1}_{i-1,j} : c^{t-1}_{i,j-1} : c^{t-1}_{i-1,j-1}]', color: COLORS.aspect },
    { label: 'Adaptive Gate', math: '\\gamma^t = \\sigma(W_p [c^t_{ij} : \\tilde{c}^t_{ij}])', color: COLORS.opinion },
    { label: 'Base Distribution', math: 'c^t_{ij} = \\text{softmax}(W_c \\tilde{o}^t_{ij} + b_c)', color: COLORS.textMuted },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', gap: 60 }}>

      {/* Left Column: Grid */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ opacity: titleOp, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.primaryLight }}>Adjacency Inference</div>
          <div style={{ fontSize: 16, background: `${COLORS.aspect}22`, color: COLORS.aspect, padding: '6px 16px', borderRadius: 99, border: `2px solid ${COLORS.aspect}44`, fontWeight: 800 }}>
            {stage === 0 ? 'INITIAL (t=0)' : stage === 1 ? 'PROCESSING (t=1)' : 'FINALIZED (t=2)'}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Header row */}
          <div style={{ display: 'flex', marginBottom: 6 }}>
            <div style={{ width: LABEL }} />
            {WORDS.map((w, c) => (
              <div key={c} style={{ width: CELL, height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 4px 10px' }}>
                <div style={{ transform: 'rotate(-30deg)', transformOrigin: 'bottom center', fontSize: 13, color: wCol(WTYPES[c]), fontWeight: 900, whiteSpace: 'nowrap', opacity: cellOp(0, c) }}>
                  {w}
                </div>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {WORDS.map((rowWord, r) => (
            <div key={r} style={{ display: 'flex', marginBottom: 2 }}>
              <div style={{ width: LABEL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15, fontSize: 13, color: wCol(WTYPES[r]), fontWeight: 900, opacity: cellOp(r, 0) }}>
                {rowWord}
              </div>
              {WORDS.map((_, c) => {
                const tag = TAGS_STAGES[stage][r][c];
                const op = cellOp(r, c);
                const isTarget = r === targetR && c === targetC;
                const isNeighbor = stage === 1 && ((r === targetR - 1 && c === targetC) || (r === targetR && c === targetC - 1) || (r === targetR - 1 && c === targetC - 1));

                return (
                  <div key={c} style={{
                    opacity: op, width: CELL, height: CELL, marginRight: 2,
                    background: isTarget && stage === 1 ? `${COLORS.aspect}22` : tagBg(tag),
                    border: isTarget && stage === 1 ? `3.5px solid ${COLORS.aspect}` : `1.5px solid ${tagBorder(tag)}`,
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 900, color: tag !== 'N' ? '#fff' : COLORS.textMuted,
                    boxShadow: isTarget && stage === 1 ? `0 0 25px ${COLORS.aspect}` : (isNeighbor ? `0 0 15px ${COLORS.aspect}66` : 'none'),
                    transform: isTarget && stage === 1 ? 'scale(1.1)' : (isNeighbor ? 'scale(1.05)' : 'scale(1)'),
                    transition: 'all 0.4s ease'
                  }}>
                    {tag}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { l: 'A', d: 'Aspect', c: COLORS.aspect },
              { l: 'O', d: 'Opinion', c: COLORS.opinion },
              { l: 'Pos/Neg', d: 'Sentiment', c: COLORS.positive },
              { l: 'N', d: 'None', c: COLORS.textMuted },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: `${item.c}33`, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: item.c, fontWeight: 900 }}>{item.l[0]}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Mathematical Calculus */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 15, opacity: calculusOp }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted, marginBottom: 10 }}>
          REFINEMENT MATH <span style={{ color: COLORS.aspect }}>— Cell (1,2)</span>
        </div>

        {formulas.map((fo, i) => {
          const isActive = stage === 1 && Math.floor(relF / 25) === 3 - i;

          return (
            <div key={i} style={{
              opacity: formulaOp(i), transform: `translateX(${(1 - formulaOp(i)) * 24}px)`,
              background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.4)',
              borderRadius: 14, padding: '12px 24px',
              borderLeft: `10px solid ${fo.color}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive ? `0 0 30px ${fo.color}22` : 'none'
            }}>
              <div style={{ fontSize: 10, color: fo.color, fontWeight: 900, marginBottom: 5, textTransform: 'uppercase' }}>{fo.label}</div>
              <div style={{ fontSize: 16, color: '#fff' }}>
                <InlineMath math={fo.math} />
              </div>

              {stage === 1 && (3 - i) === Math.floor(relF / 25) && (
                <div style={{ marginTop: 10, padding: '10px 16px', background: 'rgba(0,0,0,0.85)', borderRadius: 10, border: `1.5px solid ${fo.color}44`, color: COLORS.positive, fontSize: 12, fontWeight: 800 }}>
                  <InlineMath math={getEvaluationMath(3 - i)} />
                </div>
              )}
            </div>
          );
        })}

        {/* Final Triplet Result */}
        <div style={{ opacity: tripletOp, marginTop: 'auto', transform: `translateY(${(1 - tripletOp) * 20}px)`, background: `${COLORS.positive}15`, border: `4px solid ${COLORS.positive}66`, borderRadius: 18, padding: '24px' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: COLORS.positive, marginBottom: 12, textTransform: 'uppercase' }}>✓ Extracting Final Triplet</div>
          <div style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: COLORS.textMuted }}>(</span>
            <span style={{ color: COLORS.aspect, fontWeight: 950 }}>vegetable salad</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: COLORS.opinion, fontWeight: 950 }}>well done</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: '#fff', background: COLORS.positive, padding: '2px 14px', borderRadius: 99, fontSize: 16, fontWeight: 800 }}>Pos</span>
            <span style={{ color: COLORS.textMuted }}>)</span>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
