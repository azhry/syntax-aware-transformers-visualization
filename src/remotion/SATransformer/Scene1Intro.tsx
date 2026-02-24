import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS: { w: string; t: 'n' | 'a' | 'o' }[] = [
  { w: 'The', t: 'n' }, { w: 'staff', t: 'a' }, { w: 'was', t: 'n' },
  { w: 'very', t: 'o' }, { w: 'courteous', t: 'o' }, { w: 'but', t: 'n' },
  { w: 'the', t: 'n' }, { w: 'food', t: 'a' }, { w: 'was', t: 'n' }, { w: 'terrible.', t: 'o' },
];

export const Scene1Intro: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 12);
  const subtitleOp = ap(f, 8, 12);
  const taskOp = ap(f, 16, 10);
  const sentOp = ap(f, 24, 10);
  const tripletOp = ap(f, 32, 10);

  const wColor = (t: 'n' | 'a' | 'o') =>
    t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 120px', gap: 28 }}>

      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${(1 - titleOp) * 40}px)`, textAlign: 'center' }}>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: '-2px', background: `linear-gradient(135deg, ${COLORS.primaryLight}, #a78bfa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
          SA-Transformer
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ opacity: subtitleOp, transform: `translateY(${(1 - subtitleOp) * 20}px)`, fontSize: 28, color: COLORS.textMuted, textAlign: 'center', maxWidth: 900 }}>
        Encoding Syntactic Information for Aspect-Based Sentiment Triplet Extraction
      </div>

      {/* Task formulation */}
      <div style={{ opacity: taskOp, transform: `translateY(${(1 - taskOp) * 20}px)`, background: COLORS.surface, border: `1px solid ${COLORS.primary}44`, borderRadius: 12, padding: '16px 36px', textAlign: 'center' }}>
        <div style={{ color: COLORS.textMuted, fontSize: 16, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Task</div>
        <div style={{ fontSize: 22 }}>
          Given: <InlineMath math="X = \{x_1, x_2, \ldots, x_n\}" /> → Extract: <InlineMath math="\{(a, o, s)\}_{\varphi=1}^{\Omega}" />
        </div>
      </div>

      {/* Sentence */}
      <div style={{ opacity: sentOp, transform: `translateY(${(1 - sentOp) * 20}px)`, textAlign: 'center' }}>
        <div style={{ color: COLORS.textMuted, fontSize: 16, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Example sentence</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'flex-end' }}>
          {WORDS.map((wd, i) => {
            const wp = ap(f, 24 + i * 1.2, 8);
            const col = wColor(wd.t);
            return (
              <div key={i} style={{ opacity: wp, transform: `translateY(${(1 - wp) * 12}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {wd.t !== 'n' && (
                  <div style={{ fontSize: 12, padding: '2px 8px', backgroundColor: `${col}33`, border: `1px solid ${col}`, color: col, borderRadius: 99, marginBottom: 4, fontWeight: 700, letterSpacing: '0.05em' }}>
                    {wd.t === 'a' ? 'A' : 'O'}
                  </div>
                )}
                <span style={{ fontSize: 40, fontWeight: wd.t !== 'n' ? 700 : 400, color: col }}>
                  {wd.w}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Triplets */}
      <div style={{ opacity: tripletOp, transform: `translateY(${(1 - tripletOp) * 20}px)`, display: 'flex', gap: 32 }}>
        {[
          { a: 'staff', o: 'very courteous', s: 'Pos', c: COLORS.positive },
          { a: 'food', o: 'terrible', s: 'Neg', c: COLORS.negative },
        ].map((t, i) => (
          <div key={i} style={{ padding: '16px 32px', background: COLORS.surface, border: `2px solid ${t.c}88`, borderRadius: 16, boxShadow: `0 0 32px ${t.c}22`, display: 'flex', alignItems: 'center', gap: 12, fontSize: 26 }}>
            <span style={{ color: COLORS.textMuted }}>(</span>
            <span style={{ color: COLORS.aspect, fontWeight: 700 }}>{t.a}</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: COLORS.opinion, fontWeight: 700 }}>{t.o}</span>
            <span style={{ color: COLORS.textMuted }}>,</span>
            <span style={{ color: '#fff', fontWeight: 700, padding: '2px 14px', background: t.c, borderRadius: 99, fontSize: 20 }}>{t.s}</span>
            <span style={{ color: COLORS.textMuted }}>)</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
