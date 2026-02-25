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

  // ── TIMING (Duration 600 frames) ──
  const titleOp = ap(f, 0, 15);
  const layerOp = (l: number) => ap(f, 15 + l * 15, 20);
  const START = 30;
  const BILSTM_DUR = 60;
  const LAYER_DUR = 140;

  const lidx = f < START ? -1
    : f < START + BILSTM_DUR ? 0
      : f < START + BILSTM_DUR + LAYER_DUR ? 1
        : f < START + BILSTM_DUR + 2 * LAYER_DUR ? 2
          : f < START + BILSTM_DUR + 3 * LAYER_DUR ? 3
            : 4;

  const layerStartFrame = lidx === -1 ? 0
    : lidx === 0 ? START
      : START + BILSTM_DUR + (lidx - 1) * LAYER_DUR;

  const relF = f - layerStartFrame;

  const stepIdx = lidx >= 1 ? Math.floor(interpolate(relF, [10, LAYER_DUR - 10], [0, 6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })) : -1;

  const formulaOp = (i: number) => ap(f, 90 + i * 12, 20);
  const outputOp = ap(f, 510, 30);

  const getFullVector = (li: number) => {
    switch (li) {
      case -1: return [0.32, 0.48, 1.42, -0.15];
      case 0: return [0.75, 0.42, 1.35, 0.15];
      case 1: return [0.82, 0.58, 1.28, 0.65];
      case 2: return [0.88, 0.72, 1.22, 0.95];
      case 3: return [0.94, 0.88, 1.18, 1.25];
      default: return li > 3 ? [0.94, 0.88, 1.18, 1.25] : [0.00, 0.00, 0.00, 0.00];
    }
  };

  const formulas = [
    { label: 'Formula 11: Query Projection', math: 'Q^g_i = W_Q S^{(l-1)}_i', color: COLORS.primary },
    { label: 'Formula 12: Key with Edge', math: 'K^g_i = W_K S^{(l-1)} + \\beta W_{e,k} e_i', color: COLORS.aspect },
    { label: 'Formula 13: Value with Edge', math: 'V^g_i = W_V S^{(l-1)} + \\beta W_{e,v} e_i', color: COLORS.aspect },
    { label: 'Formula 10: Word Representation with Edge', math: 'D^g_i = \\text{softmax}(A_i \\cdot Q^g_i(K^g_i)^T / \\sqrt{d^s}) V^g_i', color: '#a78bfa' },
    { label: 'Formula 9: SA-Transformer Output', math: '\\tilde{S}^{(l)} = \\text{SA-Transformer}(S^{(l-1)}, E) = [D_1, D_2, D_3, D_4]W^s', color: COLORS.primaryLight },
    { label: 'Formula 8: Layer Normalization', math: 'S^{(l)} = \\text{LayerNorm}(\\tilde{S}^{(l)} + S^{(l-1)})', color: COLORS.positive },
  ];

  const getCalcValMath = (li: number, si: number) => {
    const vec_in = getFullVector(li - 1);
    const vec_out = getFullVector(li);
    const ei = 0.40;
    const beta = 0.50;

    const bmax = (val: string) => `\\begin{bmatrix} ${val} \\end{bmatrix}`;
    const h4 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join(',\\, '));

    // Numeric weights
    const wq = 0.52;
    const wk = 0.61;
    const wv = 0.58;
    const ws = 0.48;

    // Derived results
    const q_vec = vec_in.map(v => v * wq);
    const k_edge = beta * 0.76 * ei;
    const k_vec = vec_in.map(v => v * wk + k_edge);
    const v_edge = beta * 0.84 * ei;
    const v_vec = vec_in.map(v => v * wv + v_edge);

    const alpha = 0.85; // Scalar attention
    const d_head = [0.15, 0.22, -0.05, 0.40];
    const s_tilde = vec_out.map((v, i) => v - vec_in[i]);

    const steps = [
      `${wq} \\cdot ${h4(vec_in)} = ${h4(q_vec)}`,
      `${wk} \\cdot ${h4(vec_in)} + ${h4(Array(4).fill(k_edge))} = ${h4(k_vec)}`,
      `${wv} \\cdot ${h4(vec_in)} + ${h4(Array(4).fill(v_edge))} = ${h4(v_vec)}`,
      `${alpha} \\cdot ${h4(v_vec)} = ${h4(d_head)}`,
      `${h4(d_head)} \\cdot ${ws} = ${h4(s_tilde)}`,
      `\\text{LayerNorm}(${h4(s_tilde)} + ${h4(vec_in)}) = ${h4(vec_out)}`,
    ];
    return steps[si] || '';
  };

  const VectorCell = ({ val, lab, color, isGlove, isHighlighted, isHidden }: { val: number, lab: string, color: string, isGlove?: boolean, isHighlighted?: boolean, isHidden?: boolean }) => (
    <div style={{
      background: isHighlighted ? `${color}33` : '#000',
      color: isHidden ? '#222' : (isHighlighted ? color : '#fff'),
      fontSize: 13, padding: '4px 6px', borderRadius: 6,
      fontFamily: 'JetBrains Mono', fontWeight: 900, display: 'flex', flexDirection: 'column',
      alignItems: 'center', minWidth: 50, border: `1px solid ${isHighlighted ? color : (isHidden ? '#222' : color + '44')}`,
      transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
      boxShadow: isHighlighted ? `0 0 15px ${color}` : 'none',
      transition: 'all 0.2s ease',
      opacity: isHidden ? 0.3 : 1
    }}>
      <span style={{ fontSize: 8, opacity: isHidden ? 0.1 : 0.5, color: isHighlighted ? color : (isGlove ? COLORS.primaryLight : '#fff'), marginBottom: 2 }}>{lab}</span>
      {val.toFixed(2)}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '40px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 30 }}>

      <div style={{ opacity: titleOp, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.primaryLight }}>SA-Transformer Architecture</div>
        <div style={{ fontSize: 16, color: COLORS.positive, background: `${COLORS.positive}15`, padding: '8px 24px', borderRadius: 99, border: `2px solid ${COLORS.positive}44`, fontWeight: 800 }}>
          {lidx === -1 ? 'INITIALIZING' : lidx === 0 ? 'ENCODER: PREPARING S⁰' : lidx <= 3 ? `SECTION 5: LAYER ${lidx} / 3` : 'ENCODING COMPLETE'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: 80, flex: 1, minHeight: 0 }}>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ opacity: outputOp, background: `${COLORS.positive}15`, border: `4px solid ${COLORS.positive}`, borderRadius: 16, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.positive }}>S⁽³⁾</div>
            <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 900 }}>SYNTAX-AWARE OUTPUT</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 25, position: 'relative' }}>
            {Array.from({ length: L }).map((_, li) => {
              const op = layerOp(li);
              const isProcessing = li === lidx;
              const activeColor = (isProcessing && stepIdx >= 0) ? formulas[stepIdx]?.color : undefined;
              const layerCol = li === 0 ? COLORS.aspect : li === 3 ? COLORS.primaryLight : COLORS.primary;
              const hasComputed = li < lidx;
              const isBase = li === 0;

              const currentIn = getFullVector(li - 1);
              const currentOut = getFullVector(li);

              return (
                <div key={li} style={{
                  opacity: op, transform: `translateX(${op * 12}px)`, position: 'relative',
                  marginTop: isProcessing ? 80 : 0, marginBottom: isProcessing ? 90 : 0,
                  transition: 'all 0.4s ease'
                }}>
                  {isProcessing && (
                    <>
                      <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 15, zIndex: 10 }}>
                        <div style={{
                          background: isBase ? COLORS.aspect : COLORS.positive, borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, border: '2.5px solid #fff',
                          boxShadow: (isBase || stepIdx === 5) ? `0 0 40px ${isBase ? COLORS.aspect : COLORS.positive}` : '0 8px 32px rgba(0,0,0,0.4)',
                          transform: (isBase || stepIdx === 5) ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.3s ease'
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: isBase ? '#fff' : '#000', width: 45 }}>{isBase ? 'S⁰ = h' : `S⁽${li}⁾ OUT`}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {currentOut.map((v, i) => (
                              <VectorCell
                                key={i} val={v} lab={['POS', 'SYN', 'SEM', 'DEP'][i]}
                                color={isBase ? '#fff' : COLORS.positive} isHidden={!isBase && stepIdx < 5}
                                isHighlighted={isBase || stepIdx === 5}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 15, zIndex: 10 }}>
                        <div style={{ background: isBase ? COLORS.primary : COLORS.surface, borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, border: '3px solid #fff', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', width: 45 }}>{isBase ? 'GLOVE' : `S⁽${li - 1}⁾ IN`}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {currentIn.map((v, i) => (
                              <VectorCell
                                key={i} val={v} lab={isBase ? `F${i + 1}` : ['POS', 'SYN', 'SEM', 'DEP'][i]}
                                color="#fff" isGlove={isBase} isHighlighted={isBase || stepIdx === i}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{
                    background: isProcessing ? (activeColor ? `${activeColor}22` : `${layerCol}35`) : hasComputed ? `${layerCol}10` : `${layerCol}15`,
                    border: isProcessing ? `6.5px solid ${activeColor || layerCol}` : hasComputed ? `2px solid ${layerCol}66` : `3.5px solid ${layerCol}`,
                    borderRadius: 20, padding: '30px 40px',
                    boxShadow: isProcessing ? `0 0 100px ${(activeColor || layerCol)}50` : 'none',
                    transform: isProcessing ? `scale(1.06)` : 'scale(1)',
                    transition: 'all 0.4s ease',
                    display: 'flex', alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 950, color: isProcessing ? '#fff' : layerCol }}>
                      {isBase ? '$S^0 = h$ (BiLSTM Context)' : `SA-Transformer Layer ${li}`}
                    </div>
                    {isProcessing && <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 950, background: activeColor || layerCol, color: '#000', padding: '6px 16px', borderRadius: 99, letterSpacing: '0.12em' }}>{isBase ? 'PREPARING S⁰' : (formulas[stepIdx]?.label.split(':')[1].toUpperCase() || 'COMPUTING')}</div>}
                    {hasComputed && <div style={{ marginLeft: 'auto', color: COLORS.positive, fontWeight: 950, fontSize: 24 }}>✓ DONE</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '20px 25px', border: '2px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {[
                { k: 'POS', v: 'Positional Context' },
                { k: 'SYN', v: 'Syntactic Mapping' },
                { k: 'SEM', v: 'Lexical Meaning' },
                { k: 'DEP', v: 'Edge Dependency' }
              ].map((item, i) => {
                const isActive = lidx >= 1 && stepIdx === i;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 15, opacity: isActive ? 1 : 0.4, transition: 'all 0.3s ease' }}>
                    <div style={{ background: isActive ? formulas[stepIdx]?.color : '#000', color: isActive ? '#000' : COLORS.primaryLight, fontSize: 11, padding: '3px 6px', borderRadius: 4, fontWeight: 900, minWidth: 40, textAlign: 'center' }}>{item.k}</div>
                    <div style={{ fontSize: 14, color: isActive ? '#fff' : COLORS.textMuted, fontWeight: 800 }}>{item.v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calculus Loop */}
        <div style={{ flex: 1.3, opacity: lidx >= 1 ? 1 : 0, visibility: lidx >= 1 ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column', gap: 15, transition: 'all 0.4s ease' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.textMuted, marginBottom: 15 }}>
            THE CALCULUS <span style={{ color: COLORS.positive }}>— L{lidx} Detail</span>
          </div>

          {formulas.map((fo, i) => {
            const op = formulaOp(i);
            const isLayerActive = lidx >= 1 && lidx <= 3;
            const isCurrentStep = isLayerActive && stepIdx === i;

            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${(1 - op) * 32}px)`,
                background: isCurrentStep ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.5)',
                borderRadius: 16, padding: '18px 32px',
                borderLeft: `14px solid ${fo.color}`,
                minHeight: isCurrentStep ? 160 : 85,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: 11, color: fo.color, fontWeight: 900, marginBottom: 10, textTransform: 'uppercase' }}>{fo.label}</div>
                <div style={{ fontSize: 24, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>

                {isCurrentStep && (
                  <div style={{ marginTop: 15, padding: '14px 20px', background: 'rgba(0,0,0,0.85)', borderRadius: 10, border: `1.5px solid ${fo.color}44`, color: COLORS.positive, fontSize: 16, fontWeight: 800 }}>
                    <div style={{ fontSize: 14 }}><InlineMath math={getCalcValMath(lidx, i)} /></div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ opacity: outputOp, marginTop: 'auto', background: `${COLORS.positive}15`, border: `4px solid ${COLORS.positive}66`, borderRadius: 18, padding: '24px' }}>
            <div style={{ fontSize: 15, color: COLORS.positive, fontWeight: 800, marginBottom: 15, textTransform: 'uppercase' }}> {`Latent State S⁽${lidx}⁾ Captured`}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {getFullVector(lidx).map((v, i) => (
                <VectorCell key={i} val={v} lab={['POS', 'SYN', 'SEM', 'DEP'][i]} color={COLORS.positive} isHidden={false} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
