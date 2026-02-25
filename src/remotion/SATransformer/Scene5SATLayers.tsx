import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const L = 4; // li=0: S⁰=h (BiLSTM), li=1: L1, li=2: L2, li=3: L3 (Last)

export const Scene5SATLayers: React.FC = () => {
  const f = useCurrentFrame();

  // ── TIMING (Duration 270 frames) ──
  const titleOp = ap(f, 0, 15);
  const layerOp = (l: number) => ap(f, 10 + l * 10, 10);
  const edgeInjectOp = ap(f, 60, 18);

  // Sequential Passes: 
  // BiLSTM: 40-85, L1: 85-130, L2: 130-175, L3: 175-220
  const startCalc = 40;
  const win = 45;
  const activeLayerIdx = f < startCalc ? -1
    : f < startCalc + win ? 0
      : f < startCalc + 2 * win ? 1
        : f < startCalc + 3 * win ? 2
          : f < startCalc + 4 * win ? 3
            : 4;

  const relF = (f - startCalc) % win;
  const stepIdx = Math.floor(relF / 7.5);

  const formulaOp = (i: number) => ap(f, 85 + i * 4, 10);
  const outputOp = ap(f, 230, 20);

  // VECTORS: li=-1 is Word Embeddings, 0 is BiLSTM Output, 1..3 are Layers
  const getFullVector = (li: number) => {
    switch (li) {
      case -1: return [0.55, 0.12, -0.10, 0.88]; // Word Embeddings (GloVe)
      case 0: return [0.82, -0.45, 1.12, -0.05]; // BiLSTM S0
      case 1: return [0.88, -0.38, 1.15, 0.02];  // Layer 1 S1
      case 2: return [0.91, -0.35, 1.18, 0.05];  // Layer 2 S2
      case 3: return [0.94, -0.32, 1.21, 0.08];  // Layer 3 S3 (Final)
      default: return [0.00, 0.00, 0.00, 0.00];
    }
  };

  const formulas = [
    { label: 'Formula 11: Query', math: 'Q^g_i = W^Q S^{(l-1)}_i', color: COLORS.primary },
    { label: 'Formula 12: Key (with E)', math: 'K^g_i = W^K S^{(l-1)} + \\beta W_{e,K} e_i', color: COLORS.aspect },
    { label: 'Formula 13: Value (with E)', math: 'V^g_i = W^V S^{(l-1)} + \\beta W_{e,V} e_i', color: COLORS.aspect },
    { label: 'Formula 10: SA-Attention', math: 'D^g_i = \\text{softmax}\\left(A_i \\dots\\right) V^g_i', color: '#a78bfa' },
    { label: 'Formula 9: Multi-Head Agg', math: '\\tilde{S}^{(l)} = [D_1, \\dots, D^g] W^s', color: COLORS.primaryLight },
    { label: 'Formula 8: Layer Norm', math: 'S^{(l)} = \\text{LayerNorm}(\\tilde{S}^{(l)} + S^{(l-1)})', color: COLORS.positive },
  ];

  const getCalcVal = (li: number, si: number) => {
    if (li < 1) return 'BiLSTM Hidden State Mapping...';
    const s_in = getFullVector(li - 1)[0];
    const s_out = getFullVector(li)[0];
    const bE = 0.35 - li * 0.02;
    const steps = [
      `W^Q \\cdot ${s_in.toFixed(2)} = ${(0.52 * s_in).toFixed(2)}`,
      `W^K \\cdot ${s_in.toFixed(2)} + \\beta \\cdot ${bE.toFixed(2)} = ${(0.61 * s_in + 0.76 * bE).toFixed(2)}`,
      `W^V \\cdot ${s_in.toFixed(2)} + \\beta \\cdot ${bE.toFixed(2)} = ${(0.58 * s_in + 0.76 * bE).toFixed(2)}`,
      `score \\cdot V = 0.22`,
      `concat(heads) = 0.18`,
      `LN(0.18 + ${s_in.toFixed(2)}) = ${s_out.toFixed(2)}`,
    ];
    return steps[si] || '';
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '50px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* ── Grand Scale Header ── */}
      <div style={{ opacity: titleOp, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.primaryLight }}>SA-Transformer Architecture</div>
        <div style={{ fontSize: 18, color: COLORS.positive, background: `${COLORS.positive}15`, padding: '8px 24px', borderRadius: 99, border: `2px solid ${COLORS.positive}44`, fontWeight: 800 }}>
          {activeLayerIdx === -1 ? 'INITIALIZING STACK' : activeLayerIdx === 0 ? 'ENCODING CONTEXT' : activeLayerIdx <= 3 ? `COMPUTING LAYER ${activeLayerIdx} / 3` : 'CONTEXT READY'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 100, flex: 1, minHeight: 0 }}>

        {/* Left Column: Stack */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Final S(3) Output Indicator */}
          <div style={{ opacity: outputOp, background: `${COLORS.positive}15`, border: `4px solid ${COLORS.positive}`, borderRadius: 16, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.positive }}>S⁽³⁾</div>
            <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 900 }}>SYNTAX-AWARE OUTPUT</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 25, position: 'relative' }}>
            {Array.from({ length: L }).map((_, li) => {
              const op = layerOp(li);
              const layerCol = li === 0 ? COLORS.positive : li === 3 ? COLORS.primaryLight : COLORS.primary;
              const isProcessing = li === activeLayerIdx;
              const hasComputed = li < activeLayerIdx;
              const isBase = li === 0;

              const currentIn = getFullVector(li - 1);
              const currentOut = getFullVector(li);

              return (
                <div key={li} style={{
                  opacity: op, transform: `translateX(${op * 12}px)`, position: 'relative',
                  marginTop: isProcessing ? 60 : 0, marginBottom: isProcessing ? 60 : 0,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  {/* DATA BUBBLES: TOP AND BOTTOM (SHOWN FOR ALL LAYERS INCLUDING BASE AND LAST) */}
                  {isProcessing && (
                    <>
                      {/* OUTPUT VECTOR BUBBLE */}
                      <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 15, zIndex: 10 }}>
                        <div style={{ background: COLORS.positive, borderRadius: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, border: '2.5px solid #fff', boxShadow: '0 8px 32px rgba(0,255,100,0.4)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#000' }}>{isBase ? 'CONTEXT $S^0$' : `OUTPUT $S^${li}$`}:</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {currentOut.map((v, i) => <div key={i} style={{ background: '#000', color: COLORS.positive, fontSize: 15, padding: '3px 10px', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900 }}>{v.toFixed(2)}</div>)}
                          </div>
                        </div>
                      </div>
                      {/* INPUT VECTOR BUBBLE */}
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 15, zIndex: 10 }}>
                        <div style={{ background: COLORS.surface, borderRadius: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, border: `3px solid ${layerCol}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: layerCol }}>{isBase ? 'GLOVE EMB' : `INPUT $S^${li - 1}$`}:</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {currentIn.map((v, i) => <div key={i} style={{ background: '#000', color: '#fff', fontSize: 15, padding: '3px 10px', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900 }}>{v.toFixed(2)}</div>)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{
                    background: isProcessing ? `${layerCol}35` : hasComputed ? `${layerCol}10` : `${layerCol}15`,
                    border: isProcessing ? `6px solid ${layerCol}` : hasComputed ? `2px solid ${layerCol}66` : `3.5px solid ${layerCol}`,
                    borderRadius: 20, padding: '28px 40px',
                    boxShadow: isProcessing ? `0 0 80px ${layerCol}44` : 'none',
                    transform: isProcessing ? `scale(1.06)` : 'scale(1)',
                    transition: 'all 0.4s ease',
                    display: 'flex', alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 950, color: isProcessing ? '#fff' : layerCol }}>
                      {isBase ? 'S⁰ = h (BiLSTM Context)' : `SA-Transformer Layer ${li}`}
                    </div>
                    {isProcessing && <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 950, background: layerCol, color: '#000', padding: '6px 16px', borderRadius: 99, letterSpacing: '0.1em' }}>COMPUTING</div>}
                    {hasComputed && <div style={{ marginLeft: 'auto', color: COLORS.positive, fontWeight: 950, fontSize: 22 }}>✓ DONE</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* E Matrix injection point */}
          <div style={{ opacity: edgeInjectOp, background: `${COLORS.aspect}10`, border: `3.5px solid ${COLORS.aspect}66`, borderRadius: 16, padding: '28px 40px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.aspect }}>E</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.aspect }}>Syntactic Adjacency Edge Matrix</div>
                <div style={{ fontSize: 16, color: COLORS.textMuted }}>Universal knowledge source for all Attention Layers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculus Header / Details */}
        <div style={{ flex: 1.25, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ opacity: formulaOp(0), fontSize: 32, fontWeight: 900, color: COLORS.textMuted, marginBottom: 15 }}>
            THE CALCULUS <span style={{ color: COLORS.positive }}>— {activeLayerIdx <= 0 ? 'ENCODER BASE' : `LAYER ${activeLayerIdx} DETAIL`}</span>
          </div>

          {formulas.map((fo, i) => {
            const op = formulaOp(i);
            const isLayerActive = activeLayerIdx > 0 && activeLayerIdx <= 3;
            const isCurrentStep = isLayerActive && stepIdx === i;

            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${(1 - op) * 32}px)`,
                background: isCurrentStep ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.5)',
                borderRadius: 16, padding: '18px 32px',
                borderLeft: `12px solid ${fo.color}`,
                minHeight: isCurrentStep ? 130 : 90,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isCurrentStep ? `0 15px 45px rgba(0,0,0,0.5)` : 'none'
              }}>
                <div style={{ fontSize: 13, color: fo.color, fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{fo.label}</div>
                <div style={{ fontSize: 25, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>

                {isCurrentStep && (
                  <div style={{ marginTop: 15, padding: '14px 24px', background: 'rgba(0,0,0,0.8)', borderRadius: 10, border: `1.5px solid ${fo.color}66`, fontFamily: 'JetBrains Mono, monospace', color: COLORS.positive, fontSize: 19, fontWeight: 800 }}>
                    <span style={{ opacity: 0.6 }}>EVALUATION:</span> {getCalcVal(activeLayerIdx, i)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Final Output State Preview */}
          <div style={{ opacity: outputOp, marginTop: 'auto', background: `${COLORS.positive}15`, border: `3px solid ${COLORS.positive}66`, borderRadius: 18, padding: '24px' }}>
            <div style={{ fontSize: 16, color: COLORS.positive, fontWeight: 800, marginBottom: 15, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Current Latent State S⁽{activeLayerIdx < 0 ? 0 : activeLayerIdx}⁾</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {getFullVector(activeLayerIdx < 0 ? 0 : activeLayerIdx).map((v, idx) => (
                <div key={idx} style={{ flex: 1, background: '#000', padding: '20px', borderRadius: 14, textAlign: 'center', color: COLORS.positive, fontWeight: 950, fontSize: 24, border: '2px solid rgba(255,255,255,0.2)' }}>
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
