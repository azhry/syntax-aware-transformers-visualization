import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'staff', 'was', 'very', 'courteous', 'but', 'the', 'food', 'was', 'terrible'];
const WTYPES: ('n' | 'a' | 'o')[] = ['n', 'a', 'n', 'o', 'o', 'n', 'n', 'a', 'n', 'o'];

const TAGS_STAGES: string[][][] = [
  // t=0 (RAW)
  Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => {
      if (r === c) { if (r === 1 || r === 7) return 'A'; if (r === 4 || r === 9) return 'O'; }
      if (r === 1 && c === 4) return '+';
      if (r === 7 && c === 9) return '-';
      return 'N';
    })
  ),
  // t=1 (REFINED)
  Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => {
      if (r === c) { if (r === 1 || r === 7) return 'A'; if (r === 3 || r === 4 || r === 9) return 'O'; }
      if (r === 1 && (c === 3 || c === 4)) return '+';
      if (r === 7 && c === 9) return '-';
      return 'N';
    })
  ),
  // t=2 (FINAL)
  Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => {
      if (r === c) { if (r === 1 || r === 7) return 'A'; if (r === 3 || r === 4 || r === 9) return 'O'; }
      if (r === 1 && (c === 3 || c === 4)) return '+';
      if (r === 7 && c === 9) return '-';
      return 'N';
    })
  )
];

export const Scene7Inference: React.FC = () => {
  const f = useCurrentFrame();

  const stage = f < 50 ? 0 : f < 220 ? 1 : 2;
  const relF = f - 50;

  // Dynamic Focus Logic for Stage 1
  // Sequence: (1,4) Pos -> (7,9) Neg
  const focusData = relF < 85 ? { r: 1, c: 4, label: '+', color: COLORS.positive } : { r: 7, c: 9, label: '-', color: COLORS.negative };
  const targetR = focusData.r;
  const targetC = focusData.c;

  const stepOffset = relF < 85 ? relF : relF - 85;
  const activeStep = Math.floor(stepOffset / 20);

  const titleOp = ap(f, 0, 15);
  const gridOp = ap(f, 10, 20);
  const mathOp = ap(f, 40, 15);
  const finalTriOp = ap(f, 225, 20);

  const CELL = 54;
  const MARGIN = 3;
  const LABEL = 110;

  const wCol = (t: 'n' | 'a' | 'o') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;
  const tagBg = (t: string) => t === 'A' ? `${COLORS.aspect}66` : t === 'O' ? `${COLORS.opinion}66` : t === '+' ? `${COLORS.positive}66` : t === '-' ? `${COLORS.negative}66` : '#1e293b';
  const tagCol = (t: string) => t === 'A' ? COLORS.aspect : t === 'O' ? COLORS.opinion : t === '+' ? COLORS.positive : t === '-' ? COLORS.negative : '#334155';

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '40px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 30 }}>
      {/* Header */}
      <div style={{ opacity: titleOp, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 950, color: COLORS.primaryLight }}>Refinement & Inference</div>
          <div style={{ fontSize: 16, background: `${COLORS.aspect}22`, color: COLORS.aspect, padding: '6px 16px', borderRadius: 99, border: `2px solid ${COLORS.aspect}44`, fontWeight: 900 }}>
            {stage === 0 ? 'STAGE 0: RAW OUTPUT' : stage === 1 ? 'STAGE 1: ITERATIVE REFINEMENT' : 'STAGE 2: FINAL TRIPLETS'}
          </div>
        </div>
        <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 800 }}>ITERATION T = {stage}</div>
      </div>

      <div style={{ display: 'flex', gap: 50, flex: 1, minHeight: 0 }}>
        {/* Left: Corrected Matrix Alignment */}
        <div style={{ flex: 1.3, opacity: gridOp, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative' }}>
            {/* Header row aligned with column centers */}
            <div style={{ display: 'flex', height: 80, marginBottom: 4 }}>
              <div style={{ width: LABEL }} />
              {WORDS.map((w, i) => (
                <div key={i} style={{ width: CELL + MARGIN, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{
                    transform: 'rotate(-45deg) translateX(12px)',
                    transformOrigin: 'bottom center',
                    fontSize: 13,
                    color: wCol(WTYPES[i]),
                    fontWeight: 900,
                    whiteSpace: 'nowrap'
                  }}>
                    {w}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {WORDS.map((rowW, r) => (
              <div key={r} style={{ display: 'flex', marginBottom: MARGIN }}>
                <div style={{ width: LABEL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20, fontSize: 13, color: wCol(WTYPES[r]), fontWeight: 900 }}>{rowW}</div>
                {WORDS.map((_, c) => {
                  const tag = TAGS_STAGES[stage][r][c];
                  const isTarget = r === targetR && c === targetC;
                  const isNeighbor = stage === 1 && isTarget && ((r === targetR - 1 && c === targetC) || (r === targetR && c === targetC - 1) || (r === targetR - 1 && c === targetC - 1));

                  const currentHighlight = isTarget ? focusData.color : (isNeighbor ? COLORS.primary : 'transparent');
                  const active = stage === 1 && (isTarget || isNeighbor);

                  return (
                    <div key={c} style={{
                      width: CELL, height: CELL, marginRight: MARGIN, borderRadius: 8,
                      background: active ? `${currentHighlight}33` : tagBg(tag),
                      border: active ? `3px solid ${currentHighlight}` : `1.5px solid ${tagCol(tag)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff',
                      boxShadow: active ? `0 0 20px ${currentHighlight}66` : 'none',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                      {tag !== 'N' ? tag : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 30, background: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
            {[{ l: 'A', d: 'Aspect', c: COLORS.aspect }, { l: 'O', d: 'Opinion', c: COLORS.opinion }, { l: '+', d: 'Positive', c: COLORS.positive }, { l: '-', d: 'Negative', c: COLORS.negative }].map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, background: item.c, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 12, fontWeight: 900 }}>{item.l}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 700 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Literal Math & Inference Reasoning */}
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Dynamic Math Panel */}
          <div style={{ opacity: mathOp, background: COLORS.surface, borderRadius: 24, padding: '30px', border: `1px solid ${focusData.color}44`, display: 'flex', flexDirection: 'column', gap: 15, transition: 'border 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.textMuted }}>CALCULATION TRACE <span style={{ color: focusData.color }}>— Cell ({targetR}, {targetC})</span></div>
              <div style={{ fontSize: 12, color: focusData.color, fontWeight: 900, background: `${focusData.color}22`, padding: '4px 12px', borderRadius: 8 }}>{targetR === 1 ? 'Positive' : 'Negative'} Inference</div>
            </div>

            {/* Source Data origin */}
            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 900, marginBottom: 12, textAlign: 'center' }}>INPUT VECTORS (LITERAL)</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 4, background: wCol(WTYPES[targetR]), marginBottom: 6, borderRadius: 2 }} />
                  <div style={{ fontSize: 10, color: '#fff' }}>[{WORDS[targetR]}]</div>
                  <div style={{ fontSize: 8, color: COLORS.textMuted }}>Semantic</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 4, background: wCol(WTYPES[targetC]), marginBottom: 6, borderRadius: 2 }} />
                  <div style={{ fontSize: 10, color: '#fff' }}>[{WORDS[targetC]}]</div>
                  <div style={{ fontSize: 8, color: COLORS.textMuted }}>Semantic</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 4, background: focusData.color, marginBottom: 6, borderRadius: 2 }} />
                  <div style={{ fontSize: 10, color: '#fff' }}>[dist={targetR === 1 ? 4 : 1}]</div>
                  <div style={{ fontSize: 8, color: COLORS.textMuted }}>Structural</div>
                </div>
              </div>
            </div>

            {/* Steps */}
            {[
              { t: "1. Logit Computation (z)", m: `z = W [S_i : S_j : f_{dist}] + b`, d: "Merging features into raw scores." },
              { t: "2. Base Distribution (c)", m: `c = \\text{Softmax}(z) = ${targetR === 1 ? '[0.82, 0.08, 0.10]' : '[0.12, 0.78, 0.10]'}`, d: "Converting z scores into a 100% distribution." },
              { t: "3. Adjacency Influence (c~)", m: `\\tilde{c} = \\text{Agg}(N_{neighbors}) = ${targetR === 1 ? '[0.95, 0.02, 0.03]' : '[0.02, 0.94, 0.04]'}`, d: "Consensus from surrounding matrix cells." },
              { t: "4. Adaptive Refinement (P)", m: `P = \\gamma c + (1-\\gamma) \\tilde{c}`, d: "Merging base (c) and neighbor (c~) predictions." },
              { t: "5. Final Classification", m: `\\text{argmax}(P) \\implies [${focusData.label}]`, d: `Final result: ${targetR === 1 ? 'Positive' : 'Negative'}` }
            ].map((step, i) => {
              const op = ap(stepOffset, i * 18, 15);
              const activeStep = Math.floor(stepOffset / 18);
              const isActive = activeStep === i;
              return (
                <div key={i} style={{
                  opacity: op, padding: '8px 15px', borderRadius: 12, borderLeft: `4px solid ${isActive ? focusData.color : COLORS.primary}`,
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transform: isActive ? 'translateX(5px)' : 'translateX(0)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.textMuted, marginBottom: 4 }}>{step.t}</div>
                  <div style={{ fontSize: 13, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}><InlineMath math={step.m} /></div>
                </div>
              );
            })}
          </div>

          {/* Triplet Extraction Panel - Compact & Filled */}
          <div style={{
            opacity: finalTriOp,
            background: 'rgba(16, 185, 129, 0.05)',
            border: `1.5px solid ${COLORS.positive}44`,
            borderRadius: 20,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 320
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 950, color: COLORS.positive }}>FINAL TRIPLET EXTRACTION</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800 }}>✓ DECISION SYNCED</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { h: "(staff, very courteous, Pos)", d: "A: staff | O: courteous | Tag: [1,4]", c: COLORS.positive },
                { h: "(food, terrible, Neg)", d: "A: food | O: terrible | Tag: [7,9]", c: COLORS.negative }
              ].map((tri, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, borderLeft: `4px solid ${tri.c}` }}>
                  <div style={{ fontSize: 15, color: '#fff', fontWeight: 900 }}>{i + 1}. {tri.h}</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>{tri.d}</div>
                </div>
              ))}
            </div>

            {/* Dynamic Sentence Decoration Preview */}
            <div style={{ marginTop: 12, padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 900, marginBottom: 10, textAlign: 'center', textTransform: 'uppercase' }}>Decorated Sentence Preview</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {WORDS.map((w, i) => {
                  const isA = i === 1 || i === 7;
                  const isO = i === 3 || i === 4 || i === 9;
                  const color = isA ? COLORS.aspect : isO ? COLORS.opinion : COLORS.text;
                  return (
                    <span key={i} style={{
                      fontSize: 12,
                      color: color,
                      fontWeight: (isA || isO) ? 900 : 400,
                      borderBottom: (isA || isO) ? `2.5px solid ${color}66` : 'none',
                      padding: '0 2px'
                    }}>
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
