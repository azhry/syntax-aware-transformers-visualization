import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const PATH_WORDS = ['very', 'courteous', 'was', 'was', 'food'];
const PATH_TYPES: ('o' | 'n' | 'a')[] = ['o', 'o', 'n', 'n', 'a'];
const PATH_LABELS = ['advmod', 'acomp', 'conj', 'nsubj'];

const wCol = (t: 'o' | 'n' | 'a') => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

export const Scene6Distance: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 10);
  // Phase 1: BFS Path Discovery (0s - 4s)
  const bfsOp = (h: number) => ap(f, 10 + h * 20, 15);
  // Phase 2: Embedding Lookup (4s - 6s)
  const tableOp = ap(f, 90, 15);
  const lookupOp = ap(f, 110, 12);
  // Phase 3: Assembly (6s+)
  const formulaOp = ap(f, 130, 12);
  const assemblyOp = ap(f, 150, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '44px 100px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ opacity: titleOp, fontSize: 48, fontWeight: 800, color: COLORS.primaryLight }}>Syntactic Relative Distance</div>
      <div style={{ opacity: titleOp, fontSize: 22, color: COLORS.textMuted }}>Computation: Finding the shortest path in the dependency tree</div>

      {/* Row 1: BFS Discovery Process */}
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', height: 400 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted }}>1. SHORTEST PATH SEARCH (BFS)</div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: COLORS.textMuted, lineHeight: 1.6 }}>
              {PATH_WORDS.map((w, i) => {
                if (i === 0) return <div key={i} style={{ color: COLORS.primaryLight }}>[START] x3: very</div>;
                const op = bfsOp(i - 1);
                if (op < 0.1) return null;
                return (
                  <div key={i} style={{ opacity: op }}>
                    <span style={{ color: COLORS.textMuted }}>[Hop {i}]</span> Search → <span style={{ color: COLORS.positive }}>{w}</span>
                    <span style={{ color: COLORS.textMuted, fontSize: 11 }}> (via {PATH_LABELS[i - 1]})</span>
                  </div>
                );
              })}
              {bfsOp(3) > 0.9 && <div style={{ marginTop: 12, fontSize: 18, color: COLORS.positive, fontWeight: 900 }}>✓ PATH FOUND: dist(3, 7) = 4</div>}
            </div>
          </div>
        </div>

        <div style={{ flex: 2.5, position: 'relative' }}>
          <svg width={800} height={300} style={{ overflow: 'visible' }}>
            {/* Hops */}
            {PATH_LABELS.map((lbl, h) => {
              const op = bfsOp(h);
              const x1 = 60 + h * 160;
              const x2 = 60 + (h + 1) * 160;
              const mx = (x1 + x2) / 2;
              const cy = 100 - 50;
              return (
                <g key={h} style={{ opacity: op }}>
                  <path d={`M${x1 + 35},100 Q${mx},${cy} ${x2 - 35},100`}
                    fill="none" stroke={COLORS.primary} strokeWidth={3} strokeDasharray="5,3" />
                  {op > 0.8 && <text x={mx} y={cy - 10} textAnchor="middle" fill={COLORS.primary} fontSize={14} fontWeight="900">{lbl}</text>}
                  {op > 0.9 && (
                    <circle cx={mx} cy={cy - 30} r={14} fill={COLORS.primary} />
                  )}
                  {op > 0.9 && <text x={mx} y={cy - 30} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={11} fontWeight="900">+{h + 1}</text>}
                </g>
              );
            })}

            {/* Nodes */}
            {PATH_WORDS.map((word, i) => {
              const op = i === 0 ? 1 : bfsOp(i - 1);
              const x = 60 + i * 160;
              const col = wCol(PATH_TYPES[i]);
              const isTarget = i === 4;
              return (
                <g key={i} style={{ opacity: op }}>
                  <rect x={x - 40} y={100 - 22} width={80} height={44} rx={8}
                    fill={isTarget && op > 0.9 ? COLORS.positive : `${col}22`} stroke={isTarget && op > 0.9 ? COLORS.positive : col} strokeWidth={2} />
                  <text x={x} y={100} textAnchor="middle" dominantBaseline="middle" fill={isTarget && op > 0.9 ? "#000" : col} fontSize={14} fontWeight="900">{word}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Row 2: Distance Embedding Table Lookup */}
      <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, opacity: tableOp }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted }}>2. EMBEDDING LOOKUP: E_dist[4]</div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10 }}>
              {[1, 2, 3, 4, 5].map(d => {
                const isMatch = d === 4;
                const active = isMatch && lookupOp > 0.5;
                return (
                  <React.Fragment key={d}>
                    <div style={{ fontSize: 16, color: active ? COLORS.positive : COLORS.textMuted, fontWeight: active ? 900 : 400 }}>Index {d}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0.12, -0.44, 0.82, 0.19].map((v, i) => (
                        <div key={i} style={{
                          flex: 1, height: 20, borderRadius: 4,
                          background: active ? COLORS.positive : 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, color: active ? '#000' : 'transparent', fontWeight: 900,
                          transition: 'all 0.4s ease'
                        }}>{v}</div>
                      ))}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Vector Composition */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16, opacity: assemblyOp }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted }}>3. FINAL ASSEMBLY (o_ij)</div>
          <div style={{ background: COLORS.surface, borderRadius: 24, padding: '32px', border: `2px solid ${COLORS.primaryLight}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: COLORS.opinion, fontWeight: 900, marginBottom: 8 }}>S_very</div>
                <div style={{ background: COLORS.opinion, borderRadius: 8, padding: '10px 0', position: 'relative' }}>
                  {/* Origin Label */}
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', fontSize: 9, color: COLORS.textMuted, marginBottom: 12, fontStyle: 'italic' }}>From SA-Transformer L-Layer output</div>

                  <div style={{ display: 'flex', gap: 2, padding: '0 4px' }}>
                    {[0.33, -0.1, 0.92, 0.4].map((v, i) => (
                      <div key={i} style={{ flex: 1, fontSize: 10, color: '#000', fontWeight: 900, textAlign: 'center' }}>{v}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ color: COLORS.textMuted, fontWeight: 900 }}>:</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: COLORS.aspect, fontWeight: 900, marginBottom: 8 }}>S_food</div>
                <div style={{ background: COLORS.aspect, borderRadius: 8, padding: '10px 0', position: 'relative' }}>
                  {/* Origin Label */}
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', fontSize: 9, color: COLORS.textMuted, marginBottom: 12, fontStyle: 'italic' }}>From SA-Transformer L-Layer output</div>

                  <div style={{ display: 'flex', gap: 2, padding: '0 4px' }}>
                    {[0.12, 0.88, -0.2, 0.7].map((v, i) => (
                      <div key={i} style={{ flex: 1, fontSize: 10, color: '#000', fontWeight: 900, textAlign: 'center' }}>{v}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ color: COLORS.textMuted, fontWeight: 900 }}>:</div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: COLORS.positive, fontWeight: 900, marginBottom: 8 }}>f^d[4]</div>
                <div style={{ background: COLORS.positive, borderRadius: 8, padding: '10px 0', position: 'relative' }}>
                  {/* Origin Label */}
                  <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', fontSize: 9, color: COLORS.textMuted, marginBottom: 12, fontStyle: 'italic' }}>From Distance Embedding Table Entry #4</div>

                  <div style={{ display: 'flex', gap: 2, padding: '0 4px' }}>
                    {[0.12, -0.44, 0.82, 0.19].map((v, i) => (
                      <div key={i} style={{ flex: 1, fontSize: 10, color: '#000', fontWeight: 900, textAlign: 'center' }}>{v}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 24, color: COLORS.textMuted, margin: '0 10px' }}>→</div>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ height: 60, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ flex: 1.2, background: COLORS.opinion, opacity: 0.9, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000' }}>[S_i]</div>
                  </div>
                  <div style={{ flex: 1.2, background: COLORS.aspect, opacity: 0.9, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000' }}>[S_j]</div>
                  </div>
                  <div style={{ flex: 1, background: COLORS.positive, opacity: 0.9, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000' }}>[f^d]</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center' }}>Final Pair Representation (Concatenated)</div>
              </div>
            </div>

            <div style={{ marginTop: 32, opacity: formulaOp }}>
              <BlockMath math="o_{very,food} = [S^{(L)}_{very} \parallel S^{(L)}_{food} \parallel E_{dist}[4]]" />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
