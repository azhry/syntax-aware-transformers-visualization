import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'staff', 'was₁', 'very', 'courteous', 'but', 'the', 'food', 'was₂', 'terrible'];
const L = 4;

export const Scene5SATLayers: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 18);
  const layerOp = (l: number) => ap(f, 20 + l * 22, 18);
  const edgeInjectOp = ap(f, 115, 22);
  const formulaOp = (i: number) => ap(f, 140 + i * 12, 15);
  const outputOp = ap(f, 215, 18);

  const layerNames = ['S⁰ = h (BiLSTM output)', 'SA-Transformer Layer 1', 'SA-Transformer Layer 2', 'SA-Transformer Layer 3'];
  const layerColors = [COLORS.positive, COLORS.primary, COLORS.primary, COLORS.primaryLight];

  const formulas = [
    { label: 'Query', math: 'Q^g_i = W^Q S^{(l-1)}_i', color: COLORS.primary },
    { label: 'Key + Edge', math: 'K^g_i = W^K S^{(l-1)} + \\beta W_{e,K} e_i', color: COLORS.aspect },
    { label: 'Value + Edge', math: 'V^g_i = W^V S^{(l-1)} + \\beta W_{e,V} e_i', color: COLORS.aspect },
    { label: 'Attention', math: 'D^g_i = \\text{softmax}\\!\\left(A_i \\frac{Q^g_i (K^g_i)^\\top}{\\sqrt{d_s}}\\right) V^g_i', color: '#a78bfa' },
    { label: 'LayerNorm', math: 'S^{(l)} = \\text{LayerNorm}(\\tilde{S}^{(l)} + S^{(l-1)})', color: COLORS.positive },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '40px 72px', boxSizing: 'border-box', display: 'flex', gap: 48 }}>

      {/* Left: Layer stack */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ opacity: titleOp, fontSize: 48, fontWeight: 800, color: COLORS.primaryLight, marginBottom: 8 }}>SA-Transformer Layers</div>

        {/* Output */}
        <div style={{ opacity: outputOp, background: `${COLORS.positive}22`, border: `2.5px solid ${COLORS.positive}`, borderRadius: 12, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.positive }}>S⁽ᴸ⁾</div>
          <div style={{ fontSize: 17, color: COLORS.textMuted }}>Final syntax-enriched word representations</div>
        </div>

        {/* Residual arrow up */}
        {Array.from({ length: L }, (_, l) => {
          const li = L - 1 - l;
          const op = layerOp(li);
          const col = layerColors[li];
          return (
            <div key={li} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)` }}>
              {li > 0 && (
                <div style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 20, height: 14, marginBottom: 2 }}>↑ residual</div>
              )}
              <div style={{ background: `${col}22`, border: `2px solid ${col}`, borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: col }}>{layerNames[li]}</div>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    {WORDS.slice(0, 8).map((w, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: col, opacity: 0.8 }} />
                    ))}
                    <span style={{ fontSize: 14, color: COLORS.textMuted }}>...</span>
                  </div>
                </div>
              </div>
              {/* Edge injection indicator */}
              {li > 0 && edgeInjectOp > 0.3 && (
                <div style={{ opacity: edgeInjectOp, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingLeft: 16 }}>
                  <div style={{ width: 32, height: 2, background: COLORS.aspect }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.aspect }} />
                  <span style={{ fontSize: 14, color: COLORS.aspect }}>+ edge repr. injected into K, V</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Edge representation E box */}
        <div style={{ opacity: edgeInjectOp, transform: `translateX(${(1 - edgeInjectOp) * -30}px)`, marginTop: 8, background: `${COLORS.aspect}22`, border: `2px solid ${COLORS.aspect}`, borderRadius: 12, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.aspect }}>E</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.aspect }}>Edge Representations</div>
            <div style={{ fontSize: 15, color: COLORS.textMuted }}>Learned by AEA module → injected into K and V of each layer</div>
          </div>
        </div>
      </div>

      {/* Right: Formulas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textMuted, marginBottom: 4 }}>Key Formulas (per head g, word i)</div>
        {formulas.map((fo, i) => (
          <div style={{ opacity: formulaOp(i), transform: `translateX(${(1 - formulaOp(i)) * 30}px)`, background: COLORS.surface, borderRadius: 8, padding: '8px 16px', borderLeft: `4px solid ${fo.color}` }}>
            <div style={{ fontSize: 15, color: fo.color, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fo.label}</div>
            <InlineMath math={fo.math} />
          </div>
        ))}
        <div style={{ opacity: formulaOp(5), background: COLORS.surface, borderRadius: 10, padding: '12px 20px', border: `1px solid ${COLORS.primaryLight}44` }}>
          <div style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 4 }}>where β controls edge influence strength</div>
          <InlineMath math="\beta = \sigma(W_\beta [S^{(l-1)} : e_i] + b_\beta)" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
