import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'vegetable', 'salad', 'was', 'well', 'done'];
const N = WORDS.length;
const WTYPES: ('n' | 'a' | 'o')[] = ['n', 'a', 'a', 'n', 'o', 'o'];

const TAGS: string[][] = [
  ['N', 'N', 'N', 'N', 'N', 'N'],
  ['N', 'A', 'A', 'N', 'N', 'N'],
  ['N', 'A', 'A', 'N', 'N', 'N'],
  ['N', 'N', 'N', 'N', 'N', 'N'],
  ['N', 'N', 'N', 'N', 'O', 'O'],
  ['N', 'N', 'N', 'N', 'O', 'O'],
];

const tagBg = (t: string) =>
  t === 'A' ? `${COLORS.aspect}66` : t === 'O' ? `${COLORS.opinion}66` : '#1e293b';
const tagBorder = (t: string) =>
  t === 'A' ? COLORS.aspect : t === 'O' ? COLORS.opinion : '#334155';
const wCol = (t: 'n' | 'a' | 'o') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

export const Scene7Inference: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 14);
  const cellOp = (r: number, c: number) => ap(f, 14 + (r * N + c) * 2, 10);
  const bracketOp = ap(f, 14 + N * N * 2 + 8, 15);
  const formulaOp = (i: number) => ap(f, 110 + i * 18, 15);
  const tripletOp = ap(f, 185, 18);

  const CELL = 52;
  const LABEL = 76;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 80px', boxSizing: 'border-box', display: 'flex', gap: 56 }}>

      {/* Grid */}
      <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ opacity: titleOp, fontSize: 44, fontWeight: 800, color: COLORS.primaryLight, marginBottom: 16 }}>Adjacency Inference</div>
        <div style={{ opacity: titleOp, fontSize: 18, color: COLORS.textMuted, marginBottom: 20 }}>Grid tagging — "vegetable salad" + "well done"</div>

        <div style={{ position: 'relative' }}>
          {/* Header row */}
          <div style={{ display: 'flex', marginBottom: 4 }}>
            <div style={{ width: LABEL }} />
            {WORDS.map((w, c) => (
              <div key={c} style={{ width: CELL, height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 4px 4px' }}>
                <div style={{ transform: 'rotate(-35deg)', transformOrigin: 'bottom center', fontSize: 14, color: wCol(WTYPES[c]), fontWeight: WTYPES[c] !== 'n' ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {w}
                </div>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {WORDS.map((rowWord, r) => (
            <div key={r} style={{ display: 'flex', marginBottom: 2 }}>
              <div style={{ width: LABEL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, fontSize: 14, color: wCol(WTYPES[r]), fontWeight: WTYPES[r] !== 'n' ? 700 : 400 }}>
                {rowWord}
              </div>
              {WORDS.map((_, c) => {
                const tag = TAGS[r][c];
                const op = cellOp(r, c);
                return (
                  <div key={c} style={{
                    opacity: op, width: CELL, height: CELL, marginRight: 2,
                    background: tagBg(tag), border: `1.5px solid ${tagBorder(tag)}`,
                    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: tag !== 'N' ? 700 : 400, color: tag !== 'N' ? '#fff' : COLORS.textMuted,
                  }}>
                    {tag}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Span brackets */}
          {bracketOp > 0.1 && (
            <>
              {/* Aspect span: rows 1-2, cols 1-2 */}
              <div style={{
                position: 'absolute', opacity: bracketOp,
                left: LABEL + CELL + 2, top: 60 + CELL,
                width: CELL * 2, height: CELL * 2,
                border: `3px solid ${COLORS.aspect}`, borderRadius: 4, pointerEvents: 'none',
              }} />
              <div style={{ position: 'absolute', opacity: bracketOp, left: LABEL + CELL + 2, top: 60 + CELL * 3 + 2, fontSize: 14, color: COLORS.aspect, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ← span A: "vegetable salad"
              </div>

              {/* Opinion span: rows 4-5, cols 4-5 */}
              <div style={{
                position: 'absolute', opacity: bracketOp,
                left: LABEL + CELL * 4 + 8, top: 60 + CELL * 4,
                width: CELL * 2, height: CELL * 2,
                border: `3px solid ${COLORS.opinion}`, borderRadius: 4, pointerEvents: 'none',
              }} />
              <div style={{ position: 'absolute', opacity: bracketOp, left: LABEL + CELL * 4 + 8, top: 60 + CELL * 6 + 2, fontSize: 14, color: COLORS.opinion, fontWeight: 700, whiteSpace: 'nowrap' }}>
                ← span O: "well done"
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulas + result */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textMuted, marginBottom: 4 }}>Iterative Tag Prediction Formulas</div>

        {[
          { label: 'Tag probability', math: 'p^t_{ij} = \\gamma^t c^t_{ij} + (1 - \\gamma^t) \\tilde{c}^t_{ij}', color: COLORS.primaryLight },
          { label: 'Gate', math: '\\gamma^t = \\sigma(W_p [c^t_{ij} : \\tilde{c}^t_{ij}])', color: COLORS.neutral },
          { label: 'Adjacent distribution', math: '\\tilde{c}^t_{ij} = W_o [c^{t-1}_{i-1,j} : c^{t-1}_{i,j-1} : c^{t-1}_{i-1,j-1}]', color: COLORS.aspect },
          { label: 'Current distribution', math: 'c^t_{ij} = \\text{softmax}(W_c \\tilde{o}^t_{ij} + b_c)', color: COLORS.opinion },
        ].map((fo, i) => (
          <div key={i} style={{ opacity: formulaOp(i), transform: `translateX(${(1 - formulaOp(i)) * 24}px)`, background: COLORS.surface, borderRadius: 8, padding: '8px 14px', borderLeft: `4px solid ${fo.color}` }}>
            <div style={{ fontSize: 14, color: fo.color, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fo.label}</div>
            <InlineMath math={fo.math} />
          </div>
        ))}

        {/* Result triplet */}
        <div style={{ opacity: tripletOp, transform: `translateY(${(1 - tripletOp) * 20}px)`, background: `${COLORS.positive}18`, border: `2px solid ${COLORS.positive}88`, borderRadius: 14, padding: '18px 28px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.positive, marginBottom: 8 }}>✓ Extracted Triplet</div>
          <div style={{ fontSize: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: COLORS.textMuted }}>(</span>
            <span style={{ color: COLORS.aspect, fontWeight: 700 }}>vegetable salad</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: COLORS.opinion, fontWeight: 700 }}>well done</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: '#fff', background: COLORS.positive, padding: '2px 14px', borderRadius: 99, fontSize: 20, fontWeight: 700 }}>Pos</span>
            <span style={{ color: COLORS.textMuted }}>)</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
