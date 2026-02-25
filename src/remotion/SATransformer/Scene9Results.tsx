import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS: { w: string; t: 'n' | 'a' | 'o' }[] = [
  { w: 'The', t: 'n' }, { w: 'staff', t: 'a' }, { w: 'was', t: 'n' }, { w: 'very', t: 'o' }, { w: 'courteous', t: 'o' },
  { w: 'but', t: 'n' }, { w: 'the', t: 'n' }, { w: 'food', t: 'a' }, { w: 'was', t: 'n' }, { w: 'terrible.', t: 'o' },
];
const TRIPLETS = [
  { a: 'staff', o: 'very courteous', s: 'Pos', c: COLORS.positive, a_idx: [1], o_idx: [3, 4] },
  { a: 'food', o: 'terrible', s: 'Neg', c: COLORS.negative, a_idx: [7], o_idx: [9] },
];

const wCol = (t: 'n' | 'a' | 'o') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

export const Scene9Results: React.FC = () => {
  const f = useCurrentFrame();
  const titleOp = ap(f, 0, 15);
  const wordOp = (i: number) => ap(f, 10 + i * 2, 10);
  const t1Op = ap(f, 40, 20);
  const t2Op = ap(f, 65, 20);
  const tagOp = ap(f, 90, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '60px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 60, alignItems: 'center' }}>

      <div style={{ opacity: titleOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 64, fontWeight: 950, color: COLORS.primaryLight, letterSpacing: '-0.02em' }}>
          Extracted Sentiment Triplets
        </div>
        <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Final Unified Model Output
        </div>
      </div>

      {/* Sentence Decoration */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, justifyContent: 'center', alignItems: 'center', maxWidth: 1200, padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }}>
        {WORDS.map((wd, i) => {
          const op = wordOp(i);
          const col = wCol(wd.t);
          const isSpecial = wd.t !== 'n';

          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateY(${(1 - op) * 20}px) scale(${0.9 + op * 0.1})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transition: 'all 0.4s ease'
            }}>
              {isSpecial && (
                <div style={{
                  fontSize: 10, padding: '4px 10px', background: col, color: '#000', borderRadius: 4, marginBottom: 8, fontWeight: 950,
                  boxShadow: `0 0 15px ${col}66`
                }}>
                  {wd.t === 'a' ? 'ASPECT' : 'OPINION'}
                </div>
              )}
              <span style={{
                fontSize: 48, fontWeight: isSpecial ? 900 : 400, color: isSpecial ? col : '#fff',
                textShadow: isSpecial ? `0 0 20px ${col}44` : 'none',
                fontFamily: isSpecial ? 'Inter' : 'Georgia'
              }}>
                {wd.w}
              </span>
            </div>
          );
        })}
      </div>

      {/* Triplet cards */}
      <div style={{ display: 'flex', gap: 40, width: '100%', justifyContent: 'center' }}>
        {TRIPLETS.map((t, i) => {
          const tOp = i === 0 ? t1Op : t2Op;
          return (
            <div key={i} style={{
              opacity: tOp,
              transform: `translateX(${(i === 0 ? -1 : 1) * (1 - tOp) * 40}px) scale(${0.95 + tOp * 0.05})`,
              flex: 1, maxWidth: 600, background: 'rgba(15, 23, 42, 0.8)',
              border: `3.5px solid ${t.c}`, borderRadius: 24, padding: '32px 48px',
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${t.c}33`,
              display: 'flex', flexDirection: 'column', gap: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Triplet {i + 1} Result</div>
                <div style={{
                  fontSize: 20, fontWeight: 950, color: '#fff', padding: '6px 20px', background: t.c, borderRadius: 12,
                  boxShadow: `0 0 20px ${t.c}66`
                }}>
                  {t.s.toUpperCase()}
                </div>
              </div>

              <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', width: '100%' }} />

              <div style={{ display: 'flex', gap: 12, fontSize: 32, alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: COLORS.textMuted, opacity: 0.5 }}>⟨</span>
                <span style={{ color: COLORS.aspect, fontWeight: 950 }}>{t.a}</span>
                <span style={{ color: COLORS.textMuted, opacity: 0.3 }}>|</span>
                <span style={{ color: COLORS.opinion, fontWeight: 950 }}>{t.o}</span>
                <span style={{ color: COLORS.textMuted, opacity: 0.3 }}>|</span>
                <span style={{ color: t.c, fontWeight: 950 }}>{t.s}</span>
                <span style={{ color: COLORS.textMuted, opacity: 0.5 }}>⟩</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final badge */}
      <div style={{
        opacity: tagOp,
        transform: `translateY(${(1 - tagOp) * 30}px)`,
        background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.aspect}22)`,
        border: `2px solid ${COLORS.primaryLight}44`,
        borderRadius: 24, padding: '24px 64px',
        fontSize: 24, fontWeight: 900, color: COLORS.primaryLight, textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{ color: COLORS.positive }}> ✓ </div>
        <div>SA-Transformer: Syntax-Aware · Span-Level · End-to-End ASTE</div>
      </div>
    </AbsoluteFill>
  );
};
