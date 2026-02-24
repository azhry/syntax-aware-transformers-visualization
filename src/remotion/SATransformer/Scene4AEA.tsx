import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const DEP_COLORS: Record<string, string> = {
  nsubj: '#60a5fa', acomp: '#34d399', advmod: '#fbbf24', conj: '#f97316', cc: '#a78bfa', self: '#64748b',
};

// Scene durations (local frames within AEA's 600-frame window)
const T = {
  A: { s: 0, d: 60 },  // 2s
  B: { s: 60, d: 120 },  // 4s
  C: { s: 180, d: 120 },  // 4s
  D: { s: 300, d: 150 },  // 5s — multi-head attention
  E: { s: 450, d: 90 },  // 3s
  F: { s: 540, d: 60 },  // 2s
};

function SceneHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.primaryLight }}>{title}</div>
      {subtitle && <div style={{ fontSize: 22, color: COLORS.textMuted, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}



/* ---------- 4a: Problem Statement ---------- */
function SubA({ f }: { f: number }) {
  const op = ap(f, 0, 12);
  const e1op = ap(f, 10, 10);
  const e2op = ap(f, 16, 10);
  const qop = ap(f, 22, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '48px 120px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SceneHeader title="AEA: The Problem" subtitle="Adjacent Edge Attention — Core Innovation" />
      <div style={{ opacity: op, fontSize: 28, color: COLORS.text, lineHeight: 1.6 }}>
        Two edges with the <strong style={{ color: COLORS.aspect }}>same</strong> dependency type <strong style={{ color: COLORS.aspect }}>"conj"</strong> — but should they have the same weight?
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ opacity: e1op, transform: `translateX(${(1 - e1op) * -30}px)`, flex: 1, background: `${COLORS.positive}15`, border: `2px solid ${COLORS.positive}88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.positive, marginBottom: 8 }}>✓ SHOULD propagate</div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <span style={{ color: COLORS.opinion, fontWeight: 700 }}>courteous</span>
            <span style={{ color: COLORS.aspect, margin: '0 12px', fontWeight: 700 }}>──conj──▶</span>
            <span style={{ color: COLORS.opinion, fontWeight: 700 }}>great</span>
          </div>
          <div style={{ fontSize: 18, color: COLORS.textMuted }}>Opinion word context → high propagation weight</div>
        </div>
        <div style={{ opacity: e2op, transform: `translateX(${(1 - e2op) * 30}px)`, flex: 1, background: `${COLORS.negative}15`, border: `2px solid ${COLORS.negative}88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.negative, marginBottom: 8 }}>✗ SHOULD NOT propagate</div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>was</span>
            <span style={{ color: COLORS.aspect, margin: '0 12px', fontWeight: 700 }}>──conj──▶</span>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>was</span>
          </div>
          <div style={{ fontSize: 18, color: COLORS.textMuted }}>Clause connector → should block cross-clause propagation</div>
        </div>
      </div>
      <div style={{ opacity: qop, fontSize: 26, color: COLORS.primaryLight, fontStyle: 'italic', background: COLORS.surface, borderRadius: 10, padding: '14px 28px' }}>
        💡 Solution: Look at <strong>adjacent edges</strong> to learn context-aware weights!
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4b: Initial Edge Embedding ---------- */
function SubB({ f }: { f: number }) {
  const tableOp = ap(f, 12, 15);
  const formulaOp = ap(f, 28, 12);
  const calcOp = ap(f, 38, 10);

  const embTable = [
    { type: 'nsubj', vec: '[0.12, -0.34, 0.56, 0.21, -0.11, ...]', color: DEP_COLORS.nsubj },
    { type: 'acomp', vec: '[0.78, 0.23, -0.45, 0.33, 0.55, ...]', color: DEP_COLORS.acomp },
    { type: 'conj', vec: '[-0.22, 0.67, 0.11, -0.45, 0.33, ...]', color: DEP_COLORS.conj },
    { type: 'cc', vec: '[0.05, -0.18, 0.44, 0.67, -0.23, ...]', color: DEP_COLORS.cc },
    { type: 'self', vec: '[0.00, 0.00, 0.00, 0.00, 0.00, ...]', color: DEP_COLORS.self },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 100px', boxSizing: 'border-box', display: 'flex', gap: 48 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SceneHeader title="4b: Initial Edge Embedding" subtitle="Z = Embedding(R) — all con same type start identical" />

        <div style={{ opacity: formulaOp }}>
          <div style={{ background: COLORS.surface, borderRadius: 12, padding: '16px 28px', border: `1px solid ${COLORS.primary}44` }}>
            <BlockMath math="Z = \text{Embedding}(R) \in \mathbb{R}^{n \times n \times d_z}, \quad d_z = 200" />
          </div>
        </div>

        <div style={{ opacity: tableOp, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 600 }}>Embedding Lookup Table:</div>
          {embTable.map((row, i) => (
            <div key={i} style={{ opacity: ap(f, 14 + i * 3, 8), display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 18 }}>
              <span style={{ color: row.color, fontWeight: 700, width: 80 }}>{row.type}</span>
              <span style={{ color: COLORS.text }}>→</span>
              <span style={{ color: COLORS.textMuted, fontSize: 16 }}>{row.vec}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ opacity: calcOp, marginTop: 72 }}>
          <div style={{ fontSize: 18, color: COLORS.textMuted, fontWeight: 600, marginBottom: 12 }}>Step-by-step for edge (3, 10):</div>
          {[
            { step: 1, text: 'Look up dependency type:', result: 'r₃,₁₀ = "conj"', color: DEP_COLORS.conj },
            { step: 2, text: 'Retrieve embedding vector:', result: 'z₃,₁₀ = [-0.22, 0.67, 0.11, ...]', color: COLORS.primaryLight },
            { step: 3, text: 'SAME for ALL "conj" edges', result: 'z_courteous,great = z_was,was = ...', color: COLORS.aspect },
          ].map((s, i) => (
            <div key={i} style={{ opacity: ap(f, 40 + i * 5, 8), display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16, background: COLORS.surface, borderRadius: 10, padding: '12px 20px', border: `1px solid ${s.color}44` }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 17, color: COLORS.textMuted }}>{s.text}</div>
                <div style={{ fontSize: 19, fontFamily: 'JetBrains Mono, monospace', color: s.color, marginTop: 4 }}>{s.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4c: Adjacent Edge Discovery ---------- */
function SubC({ f }: { f: number }) {
  const op = ap(f, 0, 12);

  const was1Edges = [
    { idx: 1, lbl: 'nsubj', word: 'staff' },
    { idx: 2, lbl: 'self', word: 'was₁' },
    { idx: 4, lbl: 'acomp', word: 'courteous' },
    { idx: 5, lbl: 'cc', word: 'but' },
    { idx: 8, lbl: 'conj', word: 'was₂' },
  ];
  const was2Edges = [
    { idx: 2, lbl: 'conj', word: 'was₁' },
    { idx: 7, lbl: 'nsubj', word: 'food' },
    { idx: 8, lbl: 'self', word: 'was₂' },
    { idx: 9, lbl: 'acomp', word: 'terrible' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SceneHeader title="4c: Adjacent Edge Discovery" subtitle="Scan adjacency matrix to find neighboring edges" />

      <div style={{ opacity: op, fontSize: 22, color: COLORS.text }}>
        Target edge: <span style={{ color: COLORS.aspect, fontWeight: 700 }}>e₃,₁₀</span> (was₁ –<span style={{ color: DEP_COLORS.conj }}>conj</span>→ was₂)
      </div>

      <div style={{ display: 'flex', gap: 40, flex: 1 }}>
        {/* Was₁ */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 12 }}>
            Adjacent to <span style={{ color: COLORS.text }}>was₁</span> (x₃)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {was1Edges.map((e, i) => {
              const op1 = ap(f, 10 + i * 6, 10);
              const col = DEP_COLORS[e.lbl] ?? '#888';
              return (
                <div key={i} style={{ opacity: op1, transform: `translateX(${(1 - op1) * -20}px)`, display: 'flex', alignItems: 'center', gap: 12, background: `${col}18`, border: `1.5px solid ${col}66`, borderRadius: 10, padding: '10px 18px' }}>
                  <span style={{ color: col, fontWeight: 700, width: 72, fontSize: 17 }}>{e.lbl}</span>
                  <span style={{ color: COLORS.textMuted }}>→</span>
                  <span style={{ color: COLORS.text, fontSize: 20, fontWeight: 600 }}>{e.word}</span>
                </div>
              );
            })}
            <div style={{ opacity: ap(f, 45, 8), fontSize: 17, color: COLORS.textMuted, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
              e₃ = &#123;nsubj, self, acomp, cc, conj&#125;
            </div>
          </div>
        </div>

        {/* Was₂ */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>
            Adjacent to <span style={{ color: COLORS.text }}>was₂</span> (x₁₀)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {was2Edges.map((e, i) => {
              const op2 = ap(f, 30 + i * 6, 10);
              const col = DEP_COLORS[e.lbl] ?? '#888';
              return (
                <div key={i} style={{ opacity: op2, transform: `translateX(${(1 - op2) * 20}px)`, display: 'flex', alignItems: 'center', gap: 12, background: `${col}18`, border: `1.5px solid ${col}66`, borderRadius: 10, padding: '10px 18px' }}>
                  <span style={{ color: col, fontWeight: 700, width: 72, fontSize: 17 }}>{e.lbl}</span>
                  <span style={{ color: COLORS.textMuted }}>→</span>
                  <span style={{ color: COLORS.text, fontSize: 20, fontWeight: 600 }}>{e.word}</span>
                </div>
              );
            })}
            <div style={{ opacity: ap(f, 58, 8), fontSize: 17, color: COLORS.textMuted, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
              e₁₀ = &#123;conj, nsubj, self, acomp&#125;
            </div>
          </div>
        </div>
      </div>

      <div style={{ opacity: ap(f, 55, 10), background: `${COLORS.positive}18`, border: `2px solid ${COLORS.positive}66`, borderRadius: 12, padding: '14px 28px', fontSize: 24, color: COLORS.positive, fontWeight: 700 }}>
        🔑 Different neighboring contexts → Different learned representations!
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4d: Attention Mechanism ---------- */
function SubD({ f }: { f: number }) {
  const softmax = [0.28, 0.23, 0.29, 0.19, 0.24];
  const labels = ['nsubj', 'self', 'acomp', 'cc', 'conj'];
  const rawScores = [0.31, 0.0, 0.37, -0.17, 0.03];
  const barColors = labels.map(l => DEP_COLORS[l] ?? '#888');

  const step1op = ap(f, 0, 18);
  const step2op = ap(f, 25, 18);
  const step3op = ap(f, 55, 18);
  const step4op = ap(f, 90, 18);
  const barProgress = ap(f, 58, 35);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '36px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SceneHeader title="4d: Multi-Head Attention" subtitle="Computing attention scores over adjacent edges" />

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0 }}>

        {/* Left: Steps 1, 2, 4 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          <div style={{ opacity: step1op }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1: Project Q, K, V</div>
            <div style={{ background: COLORS.surface, borderRadius: 8, padding: '10px 16px' }}>
              <BlockMath math="\tilde{Q}^m_{ij} = \tilde{W}^Q z_{ij},\quad \tilde{K}^m_i = \tilde{W}^K z_i,\quad \tilde{V}^m_i = \tilde{W}^V z_i" />
            </div>
          </div>

          <div style={{ opacity: step2op }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 2: Dot Products</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: COLORS.text, background: COLORS.surface, borderRadius: 8, padding: '10px 16px', lineHeight: 1.75 }}>
              <div>Q̃ = [0.5, -0.3, 0.2]</div>
              {labels.map((l, i) => (
                <div key={i} style={{ color: barColors[i] }}>
                  K̃({l}): score = <strong>{rawScores[i].toFixed(2)}</strong>
                  {' '}→ scaled /{String.fromCodePoint(0x221a)}3: <strong>{(rawScores[i] / Math.sqrt(3)).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={{ opacity: step4op }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 4: Weighted Sum</div>
            <div style={{ background: COLORS.surface, borderRadius: 8, padding: '10px 16px' }}>
              <BlockMath math="U^m_{ij} = \sum_k \alpha_k \tilde{V}_k = 0.28\tilde{V}_{nsubj} + 0.23\tilde{V}_{self} + 0.29\tilde{V}_{acomp} + \cdots" />
            </div>
          </div>
        </div>

        {/* Right: Step 3 bar chart */}
        <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ opacity: step3op }}>
            <div style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 3: Softmax → Attention Weights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {softmax.map((w, i) => (
                <div key={i} style={{ opacity: ap(f, 58 + i * 7, 12) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: barColors[i], fontSize: 16, fontWeight: 700 }}>{labels[i]}</span>
                    <span style={{ color: barColors[i], fontSize: 16, fontWeight: 700 }}>{Math.round(w * barProgress * 100)}%</span>
                  </div>
                  <div style={{ height: 26, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${w * barProgress * 100}%`, height: '100%', background: barColors[i], borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '8px 14px', background: `${COLORS.positive}18`, border: `1px solid ${COLORS.positive}44`, borderRadius: 8, fontSize: 14, color: COLORS.positive }}>
              ↑ acomp gets highest attention weight (29%) — opinion context matters most
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4e: Bidirectional ---------- */
function SubE({ f }: { f: number }) {
  const op1 = ap(f, 0, 12);
  const op2 = ap(f, 15, 12);
  const gateOp = ap(f, 28, 12);
  const finalOp = ap(f, 36, 12);
  const alphaProgress = ap(f, 28, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 120px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SceneHeader title="4e: Bidirectional Gate" subtitle="Combine views from both endpoints" />
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ opacity: op1, flex: 1, background: `${COLORS.primary}15`, border: `2px solid ${COLORS.primary}88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 8 }}>ẽ³₃,₁₀</div>
          <div style={{ fontSize: 17, color: COLORS.textMuted }}>View from was₁</div>
          <div style={{ fontSize: 16, color: COLORS.textMuted, marginTop: 6 }}>Adjacent: staff, courteous, but ...</div>
        </div>
        <div style={{ opacity: op2, flex: 1, background: `#a78bfa15`, border: `2px solid #a78bfa88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>ẽ¹⁰₃,₁₀</div>
          <div style={{ fontSize: 17, color: COLORS.textMuted }}>View from was₂</div>
          <div style={{ fontSize: 16, color: COLORS.textMuted, marginTop: 6 }}>Adjacent: food, terrible ...</div>
        </div>
      </div>

      <div style={{ opacity: gateOp, background: COLORS.surface, borderRadius: 12, padding: '18px 32px', border: `1px solid ${COLORS.neutral}44` }}>
        <div style={{ fontSize: 17, color: COLORS.textMuted, marginBottom: 8 }}>Gate coefficient — calculation:</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 19, color: COLORS.text, lineHeight: 2 }}>
          concat = [0.45, -0.23, ..., 0.67, 0.12, ...]<br />
          linear = W_r · concat + b_r = 0.35<br />
          <span style={{ color: COLORS.positive, fontWeight: 700 }}>α = σ(0.35) = <strong>0.59</strong></span>
        </div>
      </div>

      <div style={{ opacity: gateOp }}>
        <div style={{ fontSize: 18, color: COLORS.textMuted, marginBottom: 8 }}>α = {(0.59 * alphaProgress).toFixed(2)}</div>
        <div style={{ height: 32, background: '#1e293b', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${0.59 * alphaProgress * 100}%`, background: COLORS.primary, borderRadius: '8px 0 0 8px' }} />
          <div style={{ width: `${(1 - 0.59) * alphaProgress * 100}%`, background: '#a78bfa' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 16 }}>
          <span style={{ color: COLORS.primaryLight }}>← ẽ³ (was₁ view) 59%</span>
          <span style={{ color: '#a78bfa' }}>41% ẽ¹⁰ (was₂ view) →</span>
        </div>
      </div>

      <div style={{ opacity: finalOp, background: `${COLORS.positive}15`, border: `2px solid ${COLORS.positive}`, borderRadius: 14, padding: '18px 32px' }}>
        <BlockMath math="e_{3,10} = \alpha \cdot \tilde{e}^3_{3,10} + (1-\alpha) \cdot \tilde{e}^{10}_{3,10} = 0.59 \cdot \tilde{e}^3 + 0.41 \cdot \tilde{e}^{10}" />
      </div>
    </AbsoluteFill>
  );
}

/* ---------- 4f: Result Comparison ---------- */
function SubF({ f }: { f: number }) {
  const op = ap(f, 0, 12);
  const rows = [
    { edge: '(courteous, great)', dep: 'conj', adj: '{acomp, conj}', weight: 0.85, dir: '↑ high', c: COLORS.positive },
    { edge: '(was₁, was₂)', dep: 'conj', adj: '{nsubj, cc, acomp}', weight: 0.23, dir: '↓ low', c: COLORS.negative },
  ];
  const barP = ap(f, 10, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 120px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SceneHeader title="4f: Result Comparison" subtitle='Same "conj" type — DIFFERENT learned weights!' />
      <div style={{ opacity: op, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ opacity: ap(f, 5 + i * 10, 10), background: `${row.c}15`, border: `2px solid ${row.c}88`, borderRadius: 14, padding: '20px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: row.c }}>{row.edge}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: DEP_COLORS.conj }}>{row.dep}</span>
              <span style={{ fontSize: 20, color: COLORS.textMuted }}>{row.adj}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: row.c }}>{row.dir} ({row.weight})</span>
            </div>
            <div style={{ height: 24, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${row.weight * barP * 100}%`, height: '100%', background: row.c, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ opacity: ap(f, 20, 10), fontSize: 28, color: COLORS.positive, fontWeight: 700 }}>
        ✓ AEA successfully differentiates edges by context!
      </div>
    </AbsoluteFill>
  );
}

/* ---------- Main Scene4 ---------- */
export const Scene4AEA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {f >= T.A.s && f < T.B.s && <SubA f={f - T.A.s} />}
      {f >= T.B.s && f < T.C.s && <SubB f={f - T.B.s} />}
      {f >= T.C.s && f < T.D.s && <SubC f={f - T.C.s} />}
      {f >= T.D.s && f < T.E.s && <SubD f={f - T.D.s} />}
      {f >= T.E.s && f < T.F.s && <SubE f={f - T.E.s} />}
      {f >= T.F.s && <SubF f={f - T.F.s} />}
    </>
  );
};
