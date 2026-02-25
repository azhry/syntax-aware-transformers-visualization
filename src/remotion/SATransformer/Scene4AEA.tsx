import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
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
        Two edges with the <strong style={{ color: COLORS.aspect }}>same</strong> dependency type <strong style={{ color: COLORS.aspect }}>"nsubj"</strong> — but should they have the same weight?
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ opacity: e1op, transform: `translateX(${(1 - e1op) * -30}px)`, flex: 1, background: `${COLORS.primary}15`, border: `2px solid ${COLORS.primary}88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 8, textTransform: 'uppercase' }}>Edge 1: (staff, was₁)</div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>staff</span>
            <span style={{ color: COLORS.aspect, margin: '0 12px', fontWeight: 700 }}>──nsubj──▶</span>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>was₁</span>
          </div>
          <div style={{ fontSize: 16, color: COLORS.textMuted }}>Context: Aspect meeting first verb</div>
        </div>
        <div style={{ opacity: e2op, transform: `translateX(${(1 - e2op) * 30}px)`, flex: 1, background: `${COLORS.aspect}15`, border: `2px solid ${COLORS.aspect}88`, borderRadius: 14, padding: '20px 28px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.aspect, marginBottom: 8, textTransform: 'uppercase' }}>Edge 2: (food, was₂)</div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>food</span>
            <span style={{ color: COLORS.aspect, margin: '0 12px', fontWeight: 700 }}>──nsubj──▶</span>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>was₂</span>
          </div>
          <div style={{ fontSize: 16, color: COLORS.textMuted }}>Context: Aspect meeting second verb</div>
        </div>
      </div>
      <div style={{ opacity: qop, fontSize: 26, color: COLORS.primaryLight, fontStyle: 'italic', background: COLORS.surface, borderRadius: 10, padding: '14px 28px' }}>
        💡 Solution: Look at <strong>adjacent edges</strong> to learn context-aware weights!
      </div>
    </AbsoluteFill>
  );
}

const VectorCell = ({ val, lab, color, isHighlighted, isHidden }: { val: number, lab: string, color: string, isHighlighted?: boolean, isHidden?: boolean }) => (
  <div style={{
    background: isHighlighted ? `${color}33` : '#000',
    color: isHidden ? '#222' : (isHighlighted ? color : '#fff'),
    fontSize: 12, padding: '3px 5px', borderRadius: 5,
    fontFamily: 'JetBrains Mono', fontWeight: 900, display: 'flex', flexDirection: 'column',
    alignItems: 'center', minWidth: 45, border: `1px solid ${isHighlighted ? color : (isHidden ? '#222' : color + '44')}`,
    transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isHighlighted ? `0 0 12px ${color}` : 'none',
    transition: 'all 0.2s ease',
    opacity: isHidden ? 0.3 : 1
  }}>
    <span style={{ fontSize: 7, opacity: isHidden ? 0.1 : 0.5, color: isHighlighted ? color : '#fff', marginBottom: 1 }}>{lab}</span>
    {val.toFixed(2)}
  </div>
);

/* ---------- 4b: Initial Edge Embedding ---------- */
function SubB({ f }: { f: number }) {
  const tableOp = ap(f, 12, 15);
  const calcOp = ap(f, 38, 10);

  const embTable = [
    { type: 'nsubj', vec: [0.12, -0.34, 0.56, 0.21], color: DEP_COLORS.nsubj },
    { type: 'acomp', vec: [0.78, 0.23, -0.45, 0.33], color: DEP_COLORS.acomp },
    { type: 'conj', vec: [-0.22, 0.67, 0.11, -0.45], color: DEP_COLORS.conj },
    { type: 'cc', vec: [0.05, -0.18, 0.44, 0.67], color: DEP_COLORS.cc },
    { type: 'self', vec: [0.00, 0.00, 0.00, 0.00], color: DEP_COLORS.self },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '60px 100px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%', height: '100%' }}>

        <div style={{ display: 'flex', gap: 60, width: '100%', flex: 1 }}>
          {/* Left: Visualization Column */}
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#fff' }}>4b: Initial Edge Embedding</div>
              <div style={{ fontSize: 24, color: COLORS.textMuted }}>Static lookup of dependency labels from Matrix R</div>
            </div>

            {/* Relationship Matrix R Visualization */}
            <div style={{ opacity: tableOp, background: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 20, color: COLORS.textMuted, fontWeight: 800 }}>RELATIONSHIP MATRIX R (Fragment)</div>
                <div style={{ fontSize: 14, color: COLORS.aspect, background: `${COLORS.aspect}22`, padding: '4px 12px', borderRadius: 6, border: `1px solid ${COLORS.aspect}44`, fontWeight: 800 }}>● EXTERNAL PARSER INPUT</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 12, textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
                {/* Header */}
                <div />{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => <div key={x} style={{ fontSize: 20, color: COLORS.textMuted }}>x{x}</div>)}

                {/* Row for x2 (was1) */}
                <div style={{ fontSize: 20, color: COLORS.textMuted }}>x2</div>
                {['—', '—', '—', '—', '—', '—', '—', '—', 'conj', '—'].map((v, i) => {
                  const active = v === 'conj';
                  return (
                    <div key={i} style={{
                      padding: '16px 4px',
                      background: active ? `${DEP_COLORS.conj}33` : 'rgba(255,255,255,0.03)',
                      color: active ? DEP_COLORS.conj : '#444',
                      borderRadius: 10,
                      fontSize: 24,
                      fontWeight: active ? 900 : 400,
                      border: active ? `2.5px solid ${DEP_COLORS.conj}` : '1.5px solid transparent',
                      boxShadow: active ? `0 0 25px ${DEP_COLORS.conj}44` : 'none',
                      transform: active && f > 75 ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}>
                      {v}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 24, fontSize: 26, color: COLORS.textMuted, textAlign: 'center', fontWeight: 600 }}>
                Coordinate <span style={{ color: COLORS.aspect }}>(2, 8)</span> results in type <span style={{ color: DEP_COLORS.conj, fontWeight: 900 }}>"conj"</span>
              </div>
            </div>

            <div style={{ opacity: tableOp, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <div style={{ fontSize: 26, color: COLORS.textMuted, fontWeight: 800 }}>EMBEDDING LOOKUP TABLE:</div>
                <div style={{ fontSize: 16, color: COLORS.primaryLight, background: `${COLORS.primary}22`, padding: '6px 16px', borderRadius: 8, border: `1px solid ${COLORS.primary}44`, fontWeight: 800 }}>● LEARNED PARAMETERS</div>
              </div>
              {embTable.map((row, i) => {
                const isTarget = row.type === 'conj';
                return (
                  <div key={i} style={{
                    opacity: ap(f, 14 + i * 3, 8),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 24,
                    background: isTarget ? `${row.color}15` : 'transparent',
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: isTarget ? `1px solid ${row.color}33` : '1px solid transparent',
                    transform: isTarget && f > 90 ? 'translateX(15px)' : 'none',
                    transition: 'all 0.4s ease'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: row.color, fontWeight: 700, width: 90 }}>{row.type}</span>
                      {row.type === 'conj' && <span style={{ fontSize: 12, color: row.color, opacity: 0.8, marginTop: -4 }}>TARGET</span>}
                    </div>
                    <span style={{ color: COLORS.text, fontSize: 32 }}>→</span>
                    <div style={{ display: 'flex', gap: 40 }}>
                      {row.vec.map((v, vi) => (
                        <div key={vi} style={{ transform: 'scale(1.4)' }}>
                          <VectorCell val={v} lab={`d${vi + 1}`} color={row.color} isHighlighted={row.type === 'conj' && f > 100} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Calculus Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ opacity: calcOp, marginTop: 10 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.textMuted, marginBottom: 24 }}>
                THE CALCULUS <span style={{ color: COLORS.primary }}>— Step-by-step</span>
              </div>
              {[
                { step: 1, text: 'Look up dependency type:', result: 'r₂,₇ = "conj"', color: DEP_COLORS.conj, math: 'R_{2,7} \\to \\text{"conj"}' },
                { step: 2, text: 'Retrieve embedding vector:', result: 'z₂,₇ = [-0.22, 0.67, 0.11, -0.45]', color: COLORS.primaryLight, math: 'Z_{2,7} = \\text{Lookup}(\\text{"conj"})' },
                { step: 3, text: 'Shared for all "conj" edges:', result: 'Embedding is not yet token-aware', color: COLORS.aspect, math: 'Z_{i,j} \\text{ is static at this stage}' },
              ].map((s, i) => (
                <div key={i} style={{
                  opacity: ap(f, 40 + i * 15, 10),
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 20,
                  padding: '24px 32px',
                  borderLeft: `12px solid ${s.color}`,
                  border: `1px solid ${s.color}22`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>{s.step}</div>
                    <div style={{ fontSize: 14, color: s.color, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{s.text}</div>
                  </div>
                  <div style={{ paddingLeft: 44 }}>
                    <div style={{ fontSize: 24, color: '#fff', marginBottom: 8 }}>
                      <InlineMath math={s.math} />
                    </div>
                    <div style={{ fontSize: 18, color: COLORS.textMuted, fontFamily: 'JetBrains Mono' }}>{s.result}</div>
                    {i === 2 && (
                      <div style={{ marginTop: 16, padding: '12px 20px', background: `${COLORS.negative}22`, borderRadius: 10, border: `1px solid ${COLORS.negative}44`, fontSize: 16, color: COLORS.negative, fontWeight: 700 }}>
                        ⚠️ PROBLEM: These vectors are currently identical for all "nsubj" edges!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}


/* ---------- 4c: Adjacent Edge Discovery ---------- */
function SubC({ f }: { f: number }) {
  const op = ap(f, 0, 12);

  const formulaOp = (i: number) => ap(f, 10 + i * 20, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '40px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SceneHeader title="4c: Adjacent Edge Discovery" subtitle="Identifying neighbors through the Adjacency Matrix A" />

      <div style={{ display: 'flex', gap: 32, flex: 1, minHeight: 0 }}>
        {/* Left: Visualization */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Compact Top Panel */}
          <div style={{ opacity: op, color: COLORS.text, background: `${COLORS.primary}15`, padding: '16px 24px', borderRadius: 20, border: `2px solid ${COLORS.primary}44`, display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: 24 }}>
              <div style={{ fontSize: 13, color: COLORS.aspect, fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>The Challenge</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.primaryLight }}>Two "was" tokens?</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.4 }}>
                They look identical. To distinguish them, we scan <strong>Row 2</strong> and <strong>Row 7</strong> to extract their unique structural "fingerprints."
              </div>
            </div>

            {/* Matrix - Fixed width to prevent jitter */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', padding: '12px 100px 12px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 380, position: 'relative'
            }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 8, fontWeight: 900, textAlign: 'center' }}>ADJACENCY MATRIX A</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 85, fontSize: 8, color: COLORS.textMuted }}>row=Head</div>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => <div key={x} style={{ width: 18, fontSize: 9, color: COLORS.textMuted, textAlign: 'center' }}>{x}</div>)}
                </div>
                {/* Data Rows */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(rowIdx => {
                  const isScanningRow = (rowIdx === 2 && f > 35 && f < 65) || (rowIdx === 8 && f > 65 && f < 95);
                  const rowColor = rowIdx === 2 ? COLORS.primaryLight : rowIdx === 8 ? '#a78bfa' : COLORS.textMuted;
                  const rowValues = rowIdx === 2 ? [0, 1, 0, 0, 1, 0, 0, 0, 1, 0] : rowIdx === 8 ? [0, 0, 1, 0, 0, 1, 0, 1, 0, 1] : Array(10).fill(0).map(() => Math.random() > 0.8 ? 1 : 0);

                  return (
                    <div key={rowIdx} style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative', height: 20, opacity: isScanningRow ? 1 : (rowIdx === 2 || rowIdx === 8 ? 0.7 : 0.15), transition: 'opacity 0.3s ease' }}>
                      {/* Robust row-bounded highlight */}
                      {isScanningRow && <div style={{ position: 'absolute', inset: '-2px -8px', background: `${rowColor}44`, borderRadius: 6, border: `2px solid ${rowColor}88`, zIndex: 0, boxShadow: `0 0 15px ${rowColor}33` }} />}

                      <div style={{ width: 85, fontSize: 10, color: rowColor, fontWeight: isScanningRow ? 900 : 400, zIndex: 1 }}>
                        {rowIdx === 2 ? 'x2 (was₁)' : rowIdx === 8 ? 'x8 (was₂)' : `x${rowIdx}`}
                      </div>
                      <div style={{ display: 'flex', gap: 4, zIndex: 1 }}>
                        {rowValues.map((v, colIdx) => (
                          <div key={colIdx} style={{
                            width: 18, height: 18, background: v ? (isScanningRow && v === 1 ? rowColor : 'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.02)',
                            borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: v ? '#000' : 'transparent',
                            border: isScanningRow && v === 1 ? `1px solid ${rowColor}` : 'none'
                          }}>{v}</div>
                        ))}
                      </div>
                      {/* Fixed width jitter by using absolute positioning for the label */}
                      {isScanningRow && (
                        <div style={{
                          position: 'absolute', left: '100%', marginLeft: 16, whiteSpace: 'nowrap',
                          fontSize: 9, color: rowColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          {rowIdx === 2 ? '← Scanning Head' : '← Scanning Tail'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 12 }}>
              <div style={{ fontSize: 14, color: COLORS.aspect, fontWeight: 900 }}>DISCOVERY LOG:</div>
              <div style={{ fontSize: 15, fontFamily: 'JetBrains Mono', color: COLORS.textMuted }}>
                {f > 35 && <div><span style={{ color: COLORS.primaryLight }}>[1]</span> Scan x₂: staff, courteous</div>}
                {f > 65 && <div style={{ marginTop: 6 }}><span style={{ color: '#a78bfa' }}>[2]</span> Scan x₈: but, food, terrible</div>}
              </div>
            </div>
          </div>

          <div style={{ flex: 1.2, position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: 32, border: '2px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {/* SVG Graph area - Rationale removed from here to prevent overlap */}
            <svg viewBox="0 0 1000 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.textMuted} />
                </marker>
              </defs>

              {/* Neighbors for was₁ (x₂) */}
              {[
                { x: 150, y: 150, lbl: 'nsubj', word: 'staff', id: 1 },
                { x: 100, y: 300, lbl: 'acomp', word: 'courteous', id: 4 },
              ].map((n, i) => {
                const stepOp = ap(f, 40 + i * 10, 10);
                const isScanning = f > 35 && f < 55;
                return (
                  <g key={i} style={{ opacity: stepOp, transition: 'all 0.5s ease' }}>
                    <line
                      x1={n.x} y1={n.y} x2={400} y2={300}
                      stroke={isScanning ? COLORS.primaryLight : DEP_COLORS[n.lbl]}
                      strokeWidth={isScanning ? "5" : "3"}
                      strokeDasharray={isScanning ? "none" : "6 4"}
                      opacity={isScanning ? 1 : 0.6}
                    />
                    <circle cx={n.x} cy={n.y} r={55} fill={COLORS.surface} stroke={DEP_COLORS[n.lbl]} strokeWidth={isScanning ? 4 : 2} />
                    <text x={n.x} y={n.y - 5} textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">{n.word}</text>
                    <text x={n.x} y={n.y + 20} textAnchor="middle" fill={DEP_COLORS[n.lbl]} fontSize="16" fontWeight="700">{n.lbl}</text>
                  </g>
                );
              })}

              {/* Neighbors for was₂ (x₈) */}
              {[
                { x: 850, y: 150, lbl: 'cc', word: 'but', id: 5 },
                { x: 900, y: 300, lbl: 'nsubj', word: 'food', id: 7 },
                { x: 850, y: 450, lbl: 'acomp', word: 'terrible', id: 9 },
              ].map((n, i) => {
                const stepOp = ap(f, 65 + i * 10, 10);
                const isScanning = f > 60 && f < 80;
                return (
                  <g key={i} style={{ opacity: stepOp, transition: 'all 0.5s ease' }}>
                    <line
                      x1={n.x} y1={n.y} x2={600} y2={300}
                      stroke={isScanning ? "#a78bfa" : DEP_COLORS[n.lbl]}
                      strokeWidth={isScanning ? "5" : "3"}
                      strokeDasharray={isScanning ? "none" : "6 4"}
                      opacity={isScanning ? 1 : 0.6}
                    />
                    <circle cx={n.x} cy={n.y} r={55} fill={COLORS.surface} stroke={DEP_COLORS[n.lbl]} strokeWidth={isScanning ? 4 : 2} />
                    <text x={n.x} y={n.y - 5} textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">{n.word}</text>
                    <text x={n.x} y={n.y + 20} textAnchor="middle" fill={DEP_COLORS[n.lbl]} fontSize="16" fontWeight="700">{n.lbl}</text>
                  </g>
                );
              })}

              {/* Main Target Edge Connection */}
              <line x1={400} y1={300} x2={600} y2={300} stroke={COLORS.aspect} strokeWidth="6" markerEnd="url(#arrowhead-main)" style={{ opacity: ap(f, 20, 15) }} />
              <text x={500} y={280} textAnchor="middle" fill={COLORS.aspect} fontSize="24" fontWeight="900" style={{ opacity: ap(f, 20, 15) }}>conj</text>

              {/* was1 and was2 nodes */}
              <g style={{ opacity: ap(f, 10, 15) }}>
                <circle cx={400} cy={300} r={70} fill={COLORS.surface} stroke={COLORS.primaryLight} strokeWidth="4" />
                <text x={400} y={305} textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900">was₁</text>
                <text x={400} y={345} textAnchor="middle" fill={COLORS.primaryLight} fontSize="14" fontWeight="800">HEAD (x₂)</text>
              </g>

              <g style={{ opacity: ap(f, 10, 15) }}>
                <circle cx={600} cy={300} r={70} fill={COLORS.surface} stroke="#a78bfa" strokeWidth="4" />
                <text x={600} y={305} textAnchor="middle" fill="#fff" fontSize="24" fontWeight="900">was₂</text>
                <text x={600} y={345} textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="800">TAIL (x₈)</text>
              </g>
            </svg>

            {/* Context Labels moved closer to their nodes to save space */}
            <div style={{ position: 'absolute', left: 40, top: 20, width: 220, opacity: ap(f, 45, 15) }}>
              <div style={{ fontSize: 12, color: COLORS.primaryLight, marginBottom: 4, fontWeight: 800 }}>V1 PRE-CONTEXT:</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 6, border: `1px solid ${COLORS.primaryLight}33` }}>
                &#123; staff, courteous &#125;
              </div>
            </div>

            <div style={{ position: 'absolute', right: 40, top: 20, width: 220, opacity: ap(f, 55, 15), textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#a78bfa', marginBottom: 4, fontWeight: 800 }}>V2 POST-CONTEXT:</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 6, border: '1px solid #a78bfa33' }}>
                &#123; but, food, terrible &#125;
              </div>
            </div>
          </div>

          {/* Dedicated Rationale Section below the diagram to prevent overlap */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)', padding: '20px 24px', borderRadius: 24,
            border: `2px solid ${COLORS.aspect}33`, opacity: op,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ background: COLORS.aspect, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Rationale</div>
              <div style={{ fontSize: 15, color: COLORS.text, fontWeight: 700 }}>Symmetry Breaking: Distinguishing identical tokens</div>
            </div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 10, lineHeight: 1.5 }}>
              Although both words are <strong>"was"</strong>, they have different jobs. We scan <strong>Rows 2 & 7</strong> to pull their unique neighborhoods. This creates <strong>distinct identities</strong>—turning identical words into unique structural vectors.
            </div>
          </div>
        </div>


        {/* Right: Calculus Card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.textMuted, marginBottom: 20 }}>
            THE CALCULUS <span style={{ color: COLORS.aspect }}>— Discovery</span>
          </div>

          {[
            { label: 'Step 1: Row Scan', math: 'A_{2,:} \\to \\mathcal{E}^2 = \\{ x_1, x_4 \\}', color: COLORS.primaryLight },
            { label: 'Step 2: Row Scan', math: 'A_{8,:} \\to \\mathcal{E}^8 = \\{ x_5, x_7, x_9 \\}', color: '#a78bfa' },
            { label: 'Divergence Check', math: '\\mathcal{E}^2 \\neq \\mathcal{E}^8 \\implies \\text{Context Distillation}', color: COLORS.aspect },
            { label: 'Final State', math: '\\text{Result: Distinct identities for "conj"}', color: COLORS.positive },
          ].map((fo, i) => {
            const op = formulaOp(i);
            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateX(${(1 - op) * 20}px)`,
                background: i === 3 ? `${COLORS.positive}15` : 'rgba(15, 23, 42, 0.4)',
                borderRadius: 16,
                padding: '14px 24px',
                borderLeft: `10px solid ${fo.color}`,
                border: i === 3 ? `2px solid ${COLORS.positive}44` : '1px solid rgba(255,255,255,0.05)',
                minHeight: 80,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: 13, color: fo.color, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>{fo.label}</div>
                <div style={{ fontSize: 28, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>
              </div>
            );
          })}

          <div style={{
            opacity: ap(f, 85, 15),
            marginTop: 'auto',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
            border: `1px solid ${COLORS.positive}44`,
            borderRadius: 16,
            padding: '20px',
          }}>
            <div style={{ fontSize: 14, color: COLORS.positive, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.positive }} />
              KEY INSIGHT: BRIDGING TO 4d
            </div>
            <div style={{ fontSize: 16, color: COLORS.textMuted, lineHeight: 1.5 }}>
              Because <span style={{ color: COLORS.primaryLight }}>Set A</span> ≠ <span style={{ color: '#a78bfa' }}>Set B</span>, the next step (Aggregation) will sum different vectors, resulting in
              <strong style={{ color: '#fff' }}> unique embedding updates</strong> for each "conj" edge.
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill >
  );
}


/* ---------- 4d: Attention Mechanism ---------- */
function SubD({ f }: { f: number }) {
  const labels = ['staff', 'courteous', 'but', 'food', 'terrible'];
  const barColors = labels.map(l => (['staff', 'courteous'].includes(l) ? COLORS.primaryLight : '#a78bfa'));
  const softmax = [0.10, 0.45, 0.20, 0.15, 0.10]; // staff, courteous, but, food, terrible

  // stepIdx: 0 to 3
  const DURATION = 150;
  const stepIdx = Math.min(3, Math.floor(f / (DURATION / 4)));

  const formulaOp = (i: number) => ap(f, i * 30, 15);

  const formulas = [
    { label: 'Step 1: Project Q, K, V', math: '\\tilde{Q}^m_{ij} = W^Q z_{ij},\\,\\, \\tilde{K}^m_i = W^K z_i,\\,\\, \\tilde{V}^m_i = W^V z_i', color: COLORS.primary },
    { label: 'Step 2: Dot Products', math: 'e_{ij,k} = \\tilde{Q}^m_{ij} \\cdot (\\tilde{K}^m_k)^T / \\sqrt{d_e}', color: COLORS.aspect },
    { label: 'Step 3: Softmax', math: '\\alpha_k = \\frac{\\exp(e_{ij,k})}{\\sum_{l} \\exp(e_{ij,l})}', color: '#a78bfa' },
    { label: 'Step 4: Weighted Sum', math: 'U^m_{ij} = \\sum_k \\alpha_k \\tilde{V}^m_k', color: COLORS.positive },
  ];

  const getCalcValMath = (si: number) => {
    const bmax = (val: string) => `\\begin{bmatrix} ${val} \\end{bmatrix}`;
    const h3 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join(',\\, '));

    const z_in = [-0.22, 0.67, 0.11, -0.45]; // Literal 'conj' embedding from Scene 4b
    const x_in = [0.45, -0.12, 0.88, 0.12];  // Token embedding from Scene 2 (Encoder)
    const q = [0.50, -0.30, 0.20, 0.05];
    const k_val = [0.32, -0.41, 0.55, -0.10];
    const v_val = [0.15, 0.85, -0.10, 0.22];
    const res = [0.38, 0.12, -0.24, 0.08];

    const steps = [
      `\\begin{cases} Q = W^Q \\cdot \\underbrace{${h3(z_in)}}_{\\text{conj (Scene 4b)}} = ${h3(q)} \\\\ K_{ctous} = W^K \\cdot \\underbrace{${h3(x_in)}}_{\\text{Encoder } h_k} = ${h3(k_val)} \\\\ V_{ctous} = W^V \\cdot ${h3(x_in)} = ${h3(v_val)} \\end{cases}`,
      `${h3(q)} \\cdot ${h3(k_val)}^T / \\sqrt{4} = 0.32 \\text{ (Score for 'courteous')}`,
      `\\underbrace{\\exp(0.32)}_{1.38} / \\underbrace{(0.20 + 1.38 + 1.77 + \\dots)}_{3.93} = 0.35`,
      `0.05\\tilde{V}_{staff} + 0.35${h3(v_val)} + 0.45\\tilde{V}_{but} + \\dots = ${h3(res)}`,
    ];
    return steps[si] || '';
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '36px 60px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <SceneHeader title="4d: Multi-Head Attention" subtitle="Different neighboring contexts yield different attention patterns" />
        <div style={{ fontSize: 13, color: formulas[stepIdx].color, background: `${formulas[stepIdx].color}15`, padding: '6px 16px', borderRadius: 99, border: `2px solid ${formulas[stepIdx].color}44`, fontWeight: 800 }}>
          STEP {stepIdx + 1}: {formulas[stepIdx].label.split(':')[1].toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 40, flex: 1, minHeight: 0 }}>
        {/* Left: Visualization */}
        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AEA Mechanism Architecture Diagram */}
          <div style={{
            flex: 1,
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 24,
            border: `2px solid ${formulas[stepIdx].color}44`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
          }}>
            <div style={{ position: 'absolute', top: 15, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: COLORS.textMuted, fontWeight: 800, letterSpacing: 1.5 }}>
              AEA INTERNAL MECHANISM — MULTI-HEAD ATTENTION
            </div>

            {/* Core Objective Label */}
            <div style={{
              position: 'absolute', top: 50, left: 30, zIndex: 20,
              background: `${COLORS.positive}22`, border: `1px solid ${COLORS.positive}66`, padding: '6px 12px', borderRadius: 8,
              fontSize: 12, color: COLORS.positive, fontWeight: 900, opacity: ap(f, 0, 10)
            }}>
              GOAL: REFINE GENERIC EDGE → UNIQUE EDGE
            </div>

            {/* SVG Graph - preserveAspectRatio="none" syncs it with CSS % positioning */}
            <svg
              viewBox="0 0 800 500"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <marker id="arrowhead-main" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={formulas[stepIdx].color} />
                </marker>
              </defs>

              {/* Input Paths - Converging at (400, 250) */}
              {/* Target Edge Path (Query) - From (648, 400) (match 81%/80%) to Center (400, 250) */}
              <path d="M 648 400 L 400 250" stroke={stepIdx >= 0 ? COLORS.aspect : '#333'} strokeWidth="3" fill="none" style={{ transition: 'all 0.5s ease', opacity: ap(f, 0, 10) }} />

              {/* Neighbor Paths (Keys/Values) - From discovered pool in 4c */}
              {[100, 175, 250, 325, 400].map((y, i) => (
                <path
                  key={i}
                  d={`M 152 ${y} L 400 250`}
                  stroke={stepIdx >= 0 ? COLORS.primary : '#333'}
                  strokeWidth="2"
                  strokeDasharray={stepIdx === 0 ? "5 3" : "none"}
                  fill="none"
                  style={{ transition: 'all 0.5s ease', opacity: ap(f, 10 + i * 5, 20) }}
                />
              ))}

              {/* Output Path - From Center (400, 250) to (400, 75) (match 50%/15%) */}
              <path d="M 400 250 L 400 75" stroke={stepIdx === 3 ? COLORS.positive : '#333'} strokeWidth="5" fill="none" markerEnd="url(#arrowhead-main)" style={{ transition: 'all 0.5s ease', opacity: stepIdx === 3 ? 1 : 0.2 }} />
            </svg>

            {/* Target Edge Node (THE QUERY) */}
            <div style={{
              position: 'absolute', left: '81%', top: '80%', transform: 'translate(-50%, -50%)', width: 150, padding: '12px', background: `${COLORS.primary}22`, border: `4px solid ${COLORS.primaryLight}`, borderRadius: 12,
              opacity: ap(f, 0, 10),
              boxShadow: `0 0 30px ${COLORS.primary}44`,
              transition: 'all 0.3s ease',
              zIndex: 10
            }}>
              <div style={{ fontSize: 10, color: COLORS.primaryLight, fontWeight: 900, marginBottom: 4, textAlign: 'center' }}>THE QUERY (Target)</div>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 900, textAlign: 'center' }}>Edge e₁,₅</div>
              <div style={{ fontSize: 9, color: COLORS.primaryLight, marginTop: 4, textAlign: 'center', opacity: 0.8 }}>"Who are my neighbors?"</div>
            </div>

            <div style={{ position: 'absolute', left: '19%', top: '10%', transform: 'translateX(-50%)', color: COLORS.aspect, fontSize: 10, fontWeight: 900, opacity: formulaOp(0) }}>NEIGHBOR KEYS (Context)</div>
            {labels.map((l, i) => {
              const tops = ['20%', '35%', '50%', '65%', '80%'];
              const source = ['staff', 'courteous'].includes(l) ? 'x₁' : 'x₅';
              const isSetA = source === 'x₁';
              const isWinning = l === 'courteous' && stepIdx >= 1;
              return (
                <div key={i} style={{
                  position: 'absolute', left: '19%', top: tops[i],
                  width: 110, height: 48, padding: '4px', background: `${isSetA ? COLORS.primaryLight : '#a78bfa'}22`, border: `2px solid ${isWinning ? '#fff' : (isSetA ? COLORS.primaryLight : '#a78bfa')}88`, borderRadius: 8,
                  opacity: ap(f, 10 + i * 5, 20),
                  transform: `translate(-50%, -50%) ${stepIdx === i ? 'scale(1.1)' : 'scale(1)'}`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: isWinning ? `0 0 15px #fff` : `0 4px 12px rgba(0,0,0,0.3)`,
                  zIndex: 5
                }}>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>{l}</div>
                  <div style={{ fontSize: 8, color: isSetA ? COLORS.primaryLight : '#a78bfa', fontWeight: 700 }}>attached to {source}</div>
                </div>
              );
            })}

            {/* Context Scoreboard - The 'Neural Audit' */}
            <div style={{
              position: 'absolute', right: 30, top: 120, width: 260,
              background: 'rgba(15, 23, 42, 0.95)', border: `2px solid ${formulas[stepIdx].color}66`,
              borderRadius: 16, padding: '16px', zIndex: 30,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              opacity: stepIdx >= 1 ? 1 : 0
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: formulas[stepIdx].color, marginBottom: 12, borderBottom: `1px solid ${formulas[stepIdx].color}44`, paddingBottom: 8 }}>
                NEURAL AUDIT: NEIGHBOR WEIGHTS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '8px 4px', marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800 }}>NEIGHBOR</span>
                <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800 }}>EXP(e)</span>
                <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800 }}>WEIGHT</span>
                {[
                  { label: 'staff', exp: '0.20', weight: '0.05' },
                  { label: 'courteous', exp: '1.38', weight: '0.35' },
                  { label: 'but', exp: '1.18', weight: '0.30' },
                  { label: 'food', exp: '0.59', weight: '0.15' },
                  { label: 'terrible', exp: '0.39', weight: '0.10' }
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    <span style={{ fontSize: 12, color: i === 1 ? '#fff' : COLORS.textMuted, fontWeight: i === 1 ? 900 : 400 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: i === 1 ? formulas[stepIdx].color : COLORS.textMuted, fontFamily: 'JetBrains Mono' }}>{s.exp}</span>
                    <span style={{ fontSize: 12, color: i === 1 ? COLORS.positive : '#fff', fontWeight: 800 }}>{s.weight}</span>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: `1px dashed ${formulas[stepIdx].color}44`, fontSize: 11, color: COLORS.positive, fontWeight: 900, display: 'flex', justifyContent: 'space-between' }}>
                <span>TOTAL CONTEXT:</span>
                <span>(Σ = 0.95)</span>
              </div>
            </div>

            {/* Central Attention Block */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: 160, height: 160, borderRadius: 30, background: COLORS.surface, border: `3px solid ${formulas[stepIdx].color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 0 50px ${formulas[stepIdx].color}33`,
              transition: 'all 0.4s ease', opacity: ap(f, 0, 10)
            }}>
              <div style={{ fontSize: 32 }}>{stepIdx === 0 ? '⚙️' : stepIdx === 1 ? '🎯' : stepIdx === 2 ? '📊' : '✨'}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: formulas[stepIdx].color, textAlign: 'center', lineHeight: 1.2 }}>
                {[
                  'STEP 1: PROJECTING\n(Feature Isolation)',
                  'STEP 2: SCORING\n(Feature Matching)',
                  'STEP 3: ATTENDING\n(Probability)',
                  'STEP 4: AGGREGATING\n(Integration)'
                ][stepIdx].split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>

              {/* Internal Mini Bar Chart */}
              {stepIdx >= 2 && (
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
                  {softmax.map((w, i) => (
                    <div key={i} style={{ width: 10, height: `${w * 100}%`, background: barColors[i], borderRadius: 2 }} />
                  ))}
                </div>
              )}
            </div>

            {/* Result Node (THE OUTPUT) */}
            <div style={{
              position: 'absolute', left: '50%', top: '12%', transform: 'translate(-50%, -50%)',
              padding: '12px 24px', background: `${COLORS.positive}22`, border: `3px solid ${COLORS.positive}`, borderRadius: 12,
              opacity: stepIdx === 3 ? 1 : 0.3, transition: 'all 0.5s ease',
              boxShadow: `0 0 40px ${COLORS.positive}44`,
              zIndex: 10
            }}>
              <div style={{ fontSize: 10, color: COLORS.positive, fontWeight: 900, marginBottom: 4, textAlign: 'center' }}>REFINED EDGE (Output)</div>
              <div style={{ fontSize: 20, color: '#fff', fontWeight: 900 }}>Ẽ₂.₇ <span style={{ fontSize: 12, color: COLORS.textMuted }}>(Context-Aware)</span></div>
            </div>

            {/* Narrative Overlay - FIXED COMMA ERROR */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, width: 220, padding: '12px',
              background: 'rgba(0,0,0,0.7)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, opacity: ap(f, 20, 20)
            }}>
              <strong style={{ color: COLORS.primaryLight }}>Edge {`e2,8`}</strong> looks at its neighbors to see what "kind" of conjunction it is. It finds that <strong>courteous</strong> provides missing sentiment data, making this edge unique.
            </div>
          </div>

          {/* Process Decoder Panel */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '20px',
            borderRadius: 20,
            border: `2px solid ${formulas[stepIdx].color}44`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
            opacity: ap(f, 0, 15)
          }}>
            <div style={{ color: formulas[stepIdx].color, fontWeight: 900, fontSize: 14 }}>🔍 MECHANICAL INSIGHT</div>
            <div style={{ fontSize: 15, color: '#fff', lineHeight: 1.5 }}>
              {stepIdx === 0 && <><strong>Projection:</strong> Extracting features. e.g. the <em>conj</em> edge looking for sentiment context in neighbors.</>}
              {stepIdx === 1 && <><strong>Scoring:</strong> Dot products for all neighbors: staff: -1.62, courteous: 0.32, but: 0.57. Higher = better match.</>}
              {stepIdx === 2 && <><strong>Attention:</strong> Softmax turns scores into percentages. courteous (35%) and but (45%) dominate this edge's focus.</>}
              {stepIdx === 3 && <><strong>Aggregation:</strong> Final Integration. We blend 5% of staff, 35% of courteous, 30% of but, 15% of food, and 10% of terrible into the edge vector.</>}
            </div>
          </div>
        </div>


        {/* Right: Calculus Card */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted, marginBottom: 10 }}>
            THE CALCULUS <span style={{ color: COLORS.primaryLight }}>— Sub-Head Detail</span>
          </div>

          {formulas.map((fo, i) => {
            const op = formulaOp(i);
            const isCurrent = stepIdx === i;

            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateX(${(1 - op) * 20}px)`,
                background: isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.4)',
                borderRadius: 16,
                padding: '16px 24px',
                borderLeft: `12px solid ${fo.color}`,
                minHeight: isCurrent ? 130 : 70,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                border: isCurrent ? `1px solid ${fo.color}44` : '1px solid transparent'
              }}>
                <div style={{ fontSize: 11, color: fo.color, fontWeight: 900, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{fo.label}</div>
                <div style={{ fontSize: 18, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>
                {isCurrent && (
                  <div style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.8)',
                    borderRadius: 8,
                    border: `1.5px solid ${fo.color}44`,
                    color: COLORS.positive,
                    fontSize: 14,
                    fontWeight: 800
                  }}>
                    <InlineMath math={getCalcValMath(i)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}


/* ---------- 4e: Bidirectional Gate ---------- */
function SubE({ f }: { f: number }) {
  const DURATION = 90;
  const stepIdx = Math.min(1, Math.floor(f / (DURATION / 2)));
  const formulaOp = (i: number) => ap(f, i * 40, 20);

  const formulas = [
    { label: 'Step 5: Gate Prediction', math: 'g = \\sigma(W_r \\cdot [\\tilde{e}^{was1} ; \\tilde{e}^{was2}] + b_r)', color: COLORS.neutral },
    { label: 'Step 6: Final Integration', math: 'e_{2,7} = g \\cdot \\tilde{e}^{was1} + (1-g) \\cdot \\tilde{e}^{was2}', color: COLORS.positive },
  ];

  const getCalcValMath = (si: number) => {
    const e_was1 = [0.38, 0.12, -0.24, 0.08]; // This matches the 'res' from Scene 4d!
    const e_was2 = [0.12, 0.88, -0.15, 0.05];
    const gate_g = 0.59;
    const final = e_was1.map((v, i) => v * gate_g + e_was2[i] * (1 - gate_g));

    const bmax = (val: string) => `\\begin{bmatrix} ${val} \\end{bmatrix}`;
    const h3 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join(',\\, '));

    const steps = [
      `\\sigma(W_r \\cdot [${h3(e_was1)} \\, ; \\, ${h3(e_was2)}] + b_r) = 0.59`,
      `0.59 \\cdot \\tilde{e}^{was1} + 0.41 \\cdot \\tilde{e}^{was2} = ${h3(final)}`,
    ];
    return steps[si] || '';
  };

  const alphaProgress = ap(f, 0, 45);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <SceneHeader title="4e: Bidirectional Gate" subtitle="Reconciling perspectives from both endpoints" />
        <div style={{ fontSize: 13, color: formulas[stepIdx].color, background: `${formulas[stepIdx].color}15`, padding: '6px 16px', borderRadius: 99, border: `2px solid ${formulas[stepIdx].color}44`, fontWeight: 800 }}>
          STEP {stepIdx + 5}: {formulas[stepIdx].label.split(':')[1].toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 60, flex: 1, minHeight: 0 }}>
        {/* Left: Visualization */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 900, color: COLORS.primaryLight, background: `${COLORS.primary}22`, padding: '6px 12px', borderRadius: 6, width: 'fit-content', marginBottom: -10,
            border: `1px solid ${COLORS.primary}44`
          }}>
            INPUT: REFINED VECTORS FROM 4D
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ opacity: ap(f, 0, 15), flex: 1, background: `${COLORS.primary}15`, border: `2px solid ${COLORS.primary}88`, borderRadius: 14, padding: '16px 24px', boxShadow: `0 0 20px ${COLORS.primary}33` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primaryLight, marginBottom: 8 }}>Ẽ(was₁)₁,₅</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>Perspective from WAS₁ (x₁)</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Context: [staff, courteous]</div>
            </div>
            <div style={{ opacity: ap(f, 15, 15), flex: 1, background: `#a78bfa15`, border: `2px solid #a78bfa88`, borderRadius: 14, padding: '16px 24px', boxShadow: `0 0 20px #a78bfa33` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginBottom: 8 }}>Ẽ(was₂)₁,₅</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>Perspective from WAS₂ (x₅)</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Context: [but, food, terrible]</div>
            </div>
          </div>

          {/* Gating Logic Visualization */}
          <div style={{
            marginTop: 20,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 20,
            padding: '24px',
            border: `2px solid ${formulas[stepIdx].color}33`,
            transition: 'all 0.4s ease'
          }}>
            <div style={{ fontSize: 16, color: COLORS.textMuted, fontWeight: 800, marginBottom: 15, textAlign: 'center' }}>
              GATE COEFFICIENT (α) DISTRIBUTION
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.neutral }}>g = {(0.59 * alphaProgress).toFixed(2)}</span>
              <div style={{ flex: 1, height: 40, background: '#1e293b', borderRadius: 10, overflow: 'hidden', display: 'flex', border: '1px solid #ffffff22' }}>
                <div style={{ width: `${0.59 * alphaProgress * 100}%`, background: COLORS.primary, transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>{Math.round(0.59 * alphaProgress * 100)}%</div>
                <div style={{ width: `${(1 - 0.59) * alphaProgress * 100}%`, background: '#a78bfa', transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>{Math.round((1 - 0.59) * alphaProgress * 100)}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: COLORS.primaryLight }}>← PERSPECTIVE 1 (was₁)</span>
              <span style={{ color: '#a78bfa' }}>PERSPECTIVE 2 (was₂) →</span>
            </div>
          </div>

          <div style={{
            background: `${COLORS.positive}10`,
            padding: '16px 24px',
            borderRadius: 14,
            border: `3px solid ${COLORS.positive}66`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: `0 0 30px ${COLORS.positive}22`,
            opacity: ap(f, 60, 20)
          }}>
            <div style={{ fontSize: 13, color: COLORS.positive, fontWeight: 900 }}>✓ REFINED EDGE VECTOR PRODUCED</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>This vector is now ready for <strong>Scene 5: Triplet Extraction</strong> where it will be used to classify sentiment.</div>
          </div>
        </div>

        {/* Right: Calculus Card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted, marginBottom: 10 }}>
            THE CALCULUS <span style={{ color: COLORS.neutral }}>— Gating Logic</span>
          </div>

          {formulas.map((fo, i) => {
            const op = formulaOp(i);
            const isCurrent = stepIdx === i;

            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateX(${(1 - op) * 24}px)`,
                background: isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.4)',
                borderRadius: 18,
                padding: '20px 28px',
                borderLeft: `14px solid ${fo.color}`,
                minHeight: isCurrent ? 150 : 80,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                border: isCurrent ? `1px solid ${fo.color}44` : '1px solid transparent'
              }}>
                <div style={{ fontSize: 11, color: fo.color, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{fo.label}</div>
                <div style={{ fontSize: 20, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>
                {isCurrent && (
                  <div style={{
                    marginTop: 15,
                    padding: '12px 18px',
                    background: 'rgba(0,0,0,0.85)',
                    borderRadius: 10,
                    border: `1.5px solid ${fo.color}44`,
                    color: COLORS.positive,
                    fontSize: 15,
                    fontWeight: 800
                  }}>
                    <InlineMath math={getCalcValMath(i)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}


/* ---------- 4f: Result Comparison ---------- */
function SubF({ f }: { f: number }) {
  const rows = [
    { edge: '(was₁ → was₂)', dep: 'conj', adj: '{staff, courteous, but, food, terrible}', weight: 0.95, vec: '[0.38, 0.12, -0.24, 0.08]', c: COLORS.positive, label: 'The Bridge Edge' },
    { edge: '(staff → was₁)', dep: 'nsubj', adj: '{staff, courteous}', weight: 0.72, vec: '[0.45, -0.10, 0.33, 0.12]', c: COLORS.primaryLight, label: 'Subject 1' },
    { edge: '(food → was₂)', dep: 'nsubj', adj: '{food, terrible}', weight: 0.42, vec: '[0.12, 0.88, -0.15, 0.05]', c: COLORS.aspect, label: 'Subject 2' },
  ];
  const barP = ap(f, 10, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SceneHeader title="4f: Result Comparison" subtitle='Same dependency type — COMPLETELY different attention weights' />

      <div style={{ display: 'flex', gap: 40, flex: 1, minHeight: 0 }}>
        {/* Left: Comparison Bars */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              opacity: ap(f, 5 + i * 10, 10),
              background: 'rgba(15, 23, 42, 0.4)',
              border: `2px solid ${row.c}33`,
              borderRadius: 16,
              padding: '24px 32px',
              boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1.5fr 1fr', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: row.c }}>{row.edge}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8', background: `rgba(148, 163, 184, 0.1)`, padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>{row.dep}</span>
                <span style={{ fontSize: 14, color: COLORS.textMuted, fontFamily: 'JetBrains Mono' }}>adj: {row.adj}</span>
                <span style={{ fontSize: 14, color: COLORS.positive, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>Vector: {row.vec}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: row.c }}>{row.weight}</span>
                </div>
              </div>
              <div style={{ height: 16, background: '#1e293b', borderRadius: 99, overflow: 'hidden', border: '1px solid #ffffff11' }}>
                <div style={{ width: `${row.weight * barP * 100}%`, height: '100%', background: row.c, borderRadius: 99, boxShadow: `0 0 15px ${row.c}` }} />
              </div>
            </div>
          ))}

          <div style={{
            opacity: ap(f, 40, 15),
            marginTop: 'auto',
            background: `linear-gradient(135deg, ${COLORS.positive}22 0%, ${COLORS.primary}22 100%)`,
            border: `3px solid ${COLORS.positive}88`,
            borderRadius: 20,
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            boxShadow: `0 12px 48px rgba(0,0,0,0.4)`
          }}>
            <div style={{ fontSize: 32 }}>🎯</div>
            <div>
              <div style={{ fontSize: 20, color: COLORS.positive, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>
                Symmetry Broken Successfully
              </div>
              <div style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.4 }}>
                Even though both edges are "nsubj", the <strong style={{ color: COLORS.primaryLight }}>refined weights</strong> differ by {">"}40% because of their unique neighborhoods.
                The model no longer sees them as identical.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Literal Computation Trace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, opacity: ap(f, 20, 15) }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.textMuted, marginBottom: 8 }}>COMPUTATION TRACE</div>

          {[
            {
              label: 'Case A: (was₁ → was₂) Final Context',
              math: '\\sum \\alpha_k = 0.05 + 0.35 + 0.30 + 0.15 + 0.10 = 0.95',
              sum: 'Proven: 95% of this edge is now refined by neighbors.',
              color: COLORS.positive,
              source: 'Literal Bridge Sum'
            },
            {
              label: 'Case B: Symmetry Breakdown (nsubj)',
              math: '\\begin{cases} \\text{staff: } \\underbrace{0.12}_{\\frac{exp(-1.1)}{2.75}} + \\underbrace{0.60}_{\\frac{exp(0.5)}{2.75}} = 0.72 \\\\ \\text{food: } \\underbrace{0.12}_{\\frac{exp(-1.1)}{2.75}} + \\underbrace{0.30}_{\\frac{exp(-0.2)}{2.75}} = 0.42 \\end{cases}',
              sum: 'Proven: Different dot-products (0.5 vs -0.2) lead to unique weights.',
              color: COLORS.primaryLight,
              source: 'Parallel AEA Trace'
            }
          ].map((trace, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 16,
              padding: '20px',
              border: `1px solid ${trace.color}44`,
              borderLeft: `12px solid ${trace.color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ fontSize: 10, color: trace.color, fontWeight: 900, textTransform: 'uppercase' }}>{trace.source}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 900 }}>{trace.label}</div>
              <div style={{
                fontSize: 18, color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <InlineMath math={trace.math} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>
                {trace.sum}
              </div>
            </div>
          ))}

          <div style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 'auto', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <div style={{ color: COLORS.primaryLight, fontWeight: 900, marginBottom: 8, fontSize: 11, textTransform: 'uppercase' }}>🔍 DEEP TRACE: THE ROOT CALCULATION (-1.1)</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: '#fff', lineHeight: 1.4, background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: 8 }}>
              <div>1. Query <InlineMath math="\vec{q} = [0.5, -0.8, 0.2, 0.5]" /></div>
              <div>2. Key <InlineMath math="\vec{k} = [-1.5, 1.0, -4.5, -3.8]" /></div>
              <div style={{ marginTop: 6, color: COLORS.aspect }}>
                <InlineMath math="\text{Score} = (\vec{q} \cdot \vec{k}^T) / \sqrt{4}" /> <br />
                <InlineMath math="= (-0.75 - 0.80 - 0.90 + 0.25) / 2 = \mathbf{-1.10}" />
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11 }}>Note: Denominators ($3.94$ for A, $2.75$ for B) represent $\sum \exp(e)$. Weights sum to the final confidence.</div>
          </div>
        </div>
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
