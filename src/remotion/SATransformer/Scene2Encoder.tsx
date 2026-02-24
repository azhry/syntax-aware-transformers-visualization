import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'staff', 'was', 'very', 'courteous', 'but', 'the', 'food', 'was', 'terrible'];
const TYPES: ('n' | 'a' | 'o')[] = ['n', 'a', 'n', 'o', 'o', 'n', 'n', 'a', 'n', 'o'];
const N = WORDS.length;

// Embedding values (illustrative)
const EMB = [-0.22, 0.67, 0.11, -0.45, 0.33, 0.12, -0.55, 0.28];

function WordBox({ word, type, opacity, y }: { word: string; type: 'n' | 'a' | 'o'; opacity: number; y: number }) {
  const col = type === 'a' ? COLORS.aspect : type === 'o' ? COLORS.opinion : COLORS.text;
  return (
    <div style={{
      opacity, transform: `translateY(${y}px)`,
      padding: '12px 24px', border: `3px solid ${col}88`,
      background: `${col}18`, borderRadius: 12, fontSize: 28, color: col,
      fontWeight: 800, minWidth: 100, textAlign: 'center',
      boxShadow: type !== 'n' ? `0 0 15px ${col}44` : 'none',
    }}>{word}</div>
  );
}

export const Scene2Encoder: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 15);
  const tokenOp = (i: number) => ap(f, 6 + i * 2, 12);
  const embOp = ap(f, 35, 15);
  const fwdCellOp = (i: number) => ap(f, 50 + i * 3, 12);
  const bwdCellOp = (i: number) => ap(f, 85 + (N - 1 - i) * 3, 12);
  const hiddenOp = ap(f, 130, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '60px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, fontSize: 62, fontWeight: 900, color: COLORS.primaryLight, marginBottom: 20 }}>Context Encoder (BiLSTM)</div>

      {/* 1. Sentence Tokenization */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        {WORDS.map((w, i) => (
          <WordBox key={i} word={w} type={TYPES[i]} opacity={tokenOp(i)} y={(1 - tokenOp(i)) * 20} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 60, flex: 1 }}>
        {/* Left: Embedding Flow */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ opacity: embOp }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>Step 1: Word Embeddings (xᵢ)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              {EMB.map((v, i) => (
                <div key={i} style={{
                  flex: 1, background: v > 0 ? COLORS.positive : COLORS.negative,
                  height: `${Math.abs(v) * 100}%`, borderRadius: 4,
                  opacity: embOp, transform: `scaleY(${embOp})`, transformOrigin: 'bottom'
                }} />
              ))}
            </div>
            <div style={{ marginTop: 15, fontSize: 22 }}>
              <InlineMath style={{ fontSize: 32 }} math="x_i = \text{Lookup}(w_i) \in \mathbb{R}^{d_w}" />
            </div>
          </div>

          <div style={{ opacity: fwdCellOp(0) }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>Step 2: Bi-directional Processing</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Forward LSTM */}
              <div style={{ display: 'flex', gap: 10 }}>
                {Array.from({ length: N }).map((_, i) => (
                  <div key={i} style={{
                    width: 50, height: 50, borderRadius: 8, background: COLORS.primary,
                    opacity: fwdCellOp(i), transform: `scale(${fwdCellOp(i)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff'
                  }}>→</div>
                ))}
                <div style={{ fontSize: 22, color: COLORS.primary, alignSelf: 'center', marginLeft: 10 }}>Forward LSTM</div>
              </div>
              {/* Backward LSTM */}
              <div style={{ display: 'flex', gap: 10 }}>
                {Array.from({ length: N }).map((_, i) => (
                  <div key={i} style={{
                    width: 50, height: 50, borderRadius: 8, background: COLORS.aspect,
                    opacity: bwdCellOp(i), transform: `scale(${bwdCellOp(i)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff'
                  }}>←</div>
                ))}
                <div style={{ fontSize: 22, color: COLORS.aspect, alignSelf: 'center', marginLeft: 10 }}>Backward LSTM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hidden Representation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ opacity: hiddenOp, transform: `translateX(${(1 - hiddenOp) * 40}px)`, background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: 24, border: `2px solid ${COLORS.positive}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.positive, marginBottom: 20 }}>Final Hidden State (hᵢ)</div>
            <BlockMath math="h_i = [\vec{h}_i : \overleftarrow{h}_i]" />
            <div style={{ fontSize: 24, color: COLORS.text, marginTop: 30, lineHeight: 1.5 }}>
              Captures context from <strong>entire</strong> sentence for word <span style={{ color: COLORS.aspect, fontWeight: 800 }}>"staff"</span>.
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
