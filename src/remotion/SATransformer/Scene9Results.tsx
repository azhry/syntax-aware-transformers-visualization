import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
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
  const titleOp = ap(f, 0, 12);
  const wordOp = (i: number) => ap(f, 8 + i * 1.5, 10);
  const t1Op = ap(f, 30, 15);
  const t2Op = ap(f, 50, 15);
  const tagOp = ap(f, 65, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 120px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
      <div style={{ opacity: titleOp, fontSize: 52, fontWeight: 800, color: COLORS.primaryLight, alignSelf: 'center', textAlign: 'center' }}>
        Extracted Sentiment Triplets
      </div>

      {/* Sentence */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'flex-end' }}>
        {WORDS.map((wd, i) => {
          const op = wordOp(i);
          const col = wCol(wd.t);
          const hasBadge = wd.t !== 'n';
          return (
            <div key={i} style={{ opacity: op, transform: `translateY(${(1 - op) * 16}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {hasBadge && (
                <div style={{ fontSize: 12, padding: '2px 8px', background: `${col}33`, border: `1px solid ${col}`, color: col, borderRadius: 99, marginBottom: 4, fontWeight: 700 }}>
                  {wd.t === 'a' ? 'A' : 'O'}
                </div>
              )}
              <span style={{ fontSize: 44, fontWeight: wd.t !== 'n' ? 700 : 400, color: col }}>
                {wd.w}
              </span>
            </div>
          );
        })}
      </div>

      {/* Triplet cards */}
      <div style={{ display: 'flex', gap: 36, width: '100%', justifyContent: 'center' }}>
        {TRIPLETS.map((t, i) => {
          const tOp = i === 0 ? t1Op : t2Op;
          return (
            <div key={i} style={{ opacity: tOp, transform: `translateY(${(1 - tOp) * 20}px)`, flex: 1, maxWidth: 560, background: COLORS.surface, border: `2px solid ${t.c}`, borderRadius: 20, padding: '24px 36px', boxShadow: `0 0 40px ${t.c}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 20, color: COLORS.textMuted }}>Triplet {i + 1}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', padding: '4px 18px', background: t.c, borderRadius: 99 }}>{t.s}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 26, alignItems: 'center' }}>
                <span style={{ color: COLORS.textMuted }}>(</span>
                <span style={{ color: COLORS.aspect, fontWeight: 700 }}>{t.a}</span>
                <span style={{ color: COLORS.textMuted }}>,</span>
                <span style={{ color: COLORS.opinion, fontWeight: 700 }}>{t.o}</span>
                <span style={{ color: COLORS.textMuted }}>,</span>
                <span style={{ color: t.c, fontWeight: 700 }}>{t.s}</span>
                <span style={{ color: COLORS.textMuted }}>)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final badge */}
      <div style={{ opacity: tagOp, transform: `scale(${0.8 + tagOp * 0.2})`, background: `linear-gradient(135deg, ${COLORS.primary}44, #a78bfa44)`, border: `2px solid ${COLORS.primaryLight}88`, borderRadius: 16, padding: '16px 48px', fontSize: 26, fontWeight: 700, color: COLORS.primaryLight, textAlign: 'center' }}>
        ✓ SA-Transformer: Syntax-Aware · Span-Level · End-to-End ASTE
      </div>
    </AbsoluteFill>
  );
};
