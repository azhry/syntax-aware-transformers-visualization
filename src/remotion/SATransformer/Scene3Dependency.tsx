import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

// Simplified 6-word version for clarity
const WORDS_DATA: { w: string; t: 'n' | 'a' | 'o' }[] = [
  { w: 'The', t: 'n' }, { w: 'staff', t: 'a' }, { w: 'was', t: 'n' },
  { w: 'very', t: 'o' }, { w: 'courteous', t: 'o' }, { w: 'but', t: 'n' },
  { w: 'the', t: 'n' }, { w: 'food', t: 'a' }, { w: 'was', t: 'n' }, { w: 'terrible.', t: 'o' },
];
const WORDS = WORDS_DATA.map(d => d.w);
const TYPES = WORDS_DATA.map(d => d.t);
const N = WORDS.length;

// Edges: [src, tgt, label], 0-indexed into WORDS
// Following common dependency patterns for the sentence
const EDGES: [number, number, string][] = [
  [0, 1, 'det'],      // The -> staff
  [1, 2, 'nsubj'],    // staff -> was
  [3, 4, 'advmod'],   // very -> courteous
  [4, 2, 'acomp'],    // courteous -> was
  [2, 8, 'conj'],     // was(2) -> was(8)
  [5, 8, 'cc'],       // but -> was(8)
  [6, 7, 'det'],      // the -> food
  [7, 8, 'nsubj'],    // food -> was(8)
  [9, 8, 'acomp'],    // terrible -> was(8)
];

const EXPLANATIONS = [
  "'The' is a determiner (det) identifying 'staff'.",
  "'staff' is the nominal subject (nsubj) of the verb 'was'.",
  "'very' is an adverbial modifier (advmod) for 'courteous'.",
  "'courteous' is the adjectival complement (acomp) of 'was'.",
  "The conjunction connects the first clause to the second.",
  "'but' is the coordinating conjunction (cc) for the structure.",
  "'the' is the determiner (det) identifying 'food'.",
  "'food' is the nominal subject (nsubj) of the second 'was'.",
  "'terrible' is the adjectival complement (acomp) of 'was₂'.",
];

const DEP_COLORS: Record<string, string> = {
  nsubj: '#60a5fa', acomp: '#34d399', conj: '#f97316', det: '#94a3b8', advmod: '#c084fc', cc: '#f472b6'
};
const wCol = (t: string) => t === 'a' ? COLORS.aspect : t === 'o' ? COLORS.opinion : COLORS.text;

// Symmetric adjacency (self-loops included)
const ADJ = Array.from({ length: N }, (_, r) =>
  Array.from({ length: N }, (_, c) => {
    if (r === c) return 1;
    return EDGES.some(([s, t]) => (s === r && t === c) || (s === c && t === r)) ? 1 : 0;
  })
);

export const Scene3Dependency: React.FC = () => {
  const f = useCurrentFrame();

  const titleOp = ap(f, 0, 12);
  const nodeOp = (i: number) => ap(f, 10 + i * 3, 10);
  const edgeOp = (i: number) => ap(f, 45 + i * 12, 12);
  const matrixP = ap(f, 130, 15);
  const cellOp = (r: number, c: number) => {
    // Regular cells appear with matrix
    if (r === c) return matrixP;
    // Find if there's an edge for this cell
    const edgeIdx = EDGES.findIndex(([s, t]) => (s === r && t === c) || (s === c && t === r));
    if (edgeIdx !== -1) {
      // Cell appears when its edge appears
      return edgeOp(edgeIdx);
    }
    return matrixP;
  };
  const formulaOp = ap(f, 210, 12);

  // Identify which edge is currently being "parsed"
  const activeEdgeIdx = Math.floor((f - 40) / 12);
  const curEdge = activeEdgeIdx >= 0 && activeEdgeIdx < EDGES.length ? EDGES[activeEdgeIdx] : null;
  const parseProgress = ((f - 40) % 12) / 12;
  const insightOp = ap(f, 35, 10);

  const SVG_W = 860, SVG_H = 600;
  const POSITIONS = WORDS.map((_, i) => ({
    x: 40 + i * (SVG_W - 80) / (N - 1),
    y: 520
  }));

  // CELL size for matrix — scaled to fit 10x10
  const CELL = 52;
  const LABEL_W = 80;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '36px 56px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Title */}
      <div style={{ opacity: titleOp, fontSize: 44, fontWeight: 800, color: COLORS.primaryLight, marginBottom: 12 }}>Dependency Structure</div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0, justifyContent: 'center', alignItems: 'center', width: '100%' }}>

        {/* ── Left: Dependency Tree ── */}
        <div style={{ flex: '0 0 760px', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: COLORS.textMuted, fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dependency Parse Tree</div>

          <svg width={SVG_W} height={SVG_H} style={{ overflow: 'visible' }}>
            {/* Edges */}
            {EDGES.map(([s, t, lbl], i) => {
              const op = edgeOp(i);
              if (op < 0.01) return null;
              const p1 = POSITIONS[s], p2 = POSITIONS[t];
              const dist = Math.abs(s - t);
              const mx = (p1.x + p2.x) / 2;
              const my = p1.y - (dist * 45) - 20; // Arc height based on distance
              const col = DEP_COLORS[lbl] ?? '#888';
              const isBridge = lbl === 'conj' || lbl === 'cc';
              const pathLen = Math.abs(p2.x - p1.x) * 2;
              return (
                <g key={i} opacity={op}>
                  <path
                    d={`M${p1.x},${p1.y - 40} Q${mx},${my} ${p2.x},${p2.y - 40}`}
                    fill="none" stroke={col} strokeWidth={isBridge ? 4 : 2.5} strokeLinecap="round"
                    strokeDasharray={`${op * pathLen} ${pathLen}`}
                  />
                  {op > 0.5 && (
                    <text x={mx} y={my - 8} textAnchor="middle" fill={col}
                      fontSize={24} fontWeight="bold"
                      style={{ paintOrder: 'stroke', stroke: '#020617', strokeWidth: 5 }}>
                      {lbl}
                    </text>
                  )}
                  {/* Arrow tip */}
                  {op > 0.8 && (() => {
                    const dx = p2.x - mx, dy = p2.y - 40 - my;
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    return (
                      <polygon
                        points={`${p2.x},${p2.y - 40} ${p2.x - 10},${p2.y - 45} ${p2.x - 10},${p2.y - 35}`}
                        fill={col}
                        transform={`rotate(${angle - 90}, ${p2.x}, ${p2.y - 40})`}
                      />
                    );
                  })()}
                </g>
              );
            })}

            {/* Nodes */}
            {WORDS.map((word, i) => {
              const op = nodeOp(i);
              const col = wCol(TYPES[i]);
              const pos = POSITIONS[i];
              const isKey = TYPES[i] !== 'n';

              // Highlight if being scanned as child/head during parsing
              const isChild = curEdge?.[0] === i;
              const isHead = curEdge?.[1] === i;
              const highlight = (isChild || isHead) && parseProgress > 0.1;

              return (
                <g key={i} opacity={op} transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect x={-40} y={-35} width={80} height={45} rx={8}
                    fill={highlight ? `${col}44` : `${col}22`}
                    stroke={highlight ? '#fff' : col}
                    strokeWidth={highlight ? 4 : (isKey ? 3 : 1)}
                    style={{
                      filter: (isKey || highlight) ? `drop-shadow(0 0 12px ${highlight ? '#fff' : col}66)` : undefined,
                      transition: 'all 0.2s ease-out'
                    }} />
                  <text textAnchor="middle" fill={highlight ? '#fff' : col}
                    fontSize={20} fontWeight={isKey || highlight ? "bold" : "normal"}>{word}</text>

                  {isChild && parseProgress > 0.1 && (
                    <text y={25} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="900" opacity={0.8}>CHILD</text>
                  )}
                  {isHead && parseProgress > 0.1 && (
                    <text y={25} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="900" opacity={0.8}>HEAD</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Linguistic Insight Panel */}
          <div style={{
            opacity: insightOp,
            width: '100%',
            background: `${COLORS.surface}CC`,
            border: `2px solid ${COLORS.primary}44`,
            borderRadius: 16,
            padding: '20px 30px',
            backdropFilter: 'blur(10px)',
            marginTop: -60,
            zIndex: 10,
            position: 'relative'
          }}>
            <div style={{ color: COLORS.primaryLight, fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Linguistic Parsing Insight
            </div>
            <div style={{ fontSize: 24, minHeight: 70, display: 'flex', alignItems: 'center', color: '#fff' }}>
              {activeEdgeIdx >= 0 && activeEdgeIdx < EXPLANATIONS.length ? (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <span style={{ color: COLORS.primaryLight, fontWeight: 900 }}>Step {activeEdgeIdx + 1}:</span> {EXPLANATIONS[activeEdgeIdx]}
                </div>
              ) : (
                <div style={{ color: COLORS.textMuted }}>Select a dependency node to see grammatical logic...</div>
              )}
            </div>
          </div>

          {/* Formulas */}
          <div style={{ opacity: formulaOp, display: 'flex', gap: 20, marginTop: 4 }}>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.primary}44`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Adjacency Matrix</div>
              <InlineMath math="A = \{a_{ij}\} \in \{0,1\}^{n \times n}" />
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.aspect}44`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Relationship Matrix</div>
              <InlineMath math="R = \{r_{ij}\} \in \mathbb{R}^{n \times n}" />
            </div>
            <div style={{ background: COLORS.surface, borderRadius: 10, padding: '10px 20px', border: `1px solid ${COLORS.aspect}66`, fontSize: 20 }}>
              <div style={{ color: COLORS.textMuted, fontSize: 20, marginBottom: 4 }}>Dependency Tuple</div>
              <InlineMath math="(x_i, x_j, r_{ij})" />
            </div>
          </div>
        </div>

        {/* ── Right: Adjacency Matrix ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center', alignItems: 'center', overflow: 'visible', paddingLeft: 60 }}>
          <div style={{ opacity: matrixP, fontSize: 32, fontWeight: 700, color: COLORS.primaryLight, marginBottom: 10 }}>
            Adjacency Matrix A <span style={{ fontSize: 24, color: COLORS.textMuted, fontWeight: 400 }}>(10×10)</span>
          </div>
          <div style={{ opacity: matrixP, overflow: 'visible' }}>
            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `${LABEL_W}px ${WORDS.map(() => `${CELL}px`).join(' ')}`, gap: 2 }}>
              {/* Col headers */}
              <div />
              {WORDS.map((w, c) => (
                <div key={c} style={{
                  fontSize: 16, color: wCol(TYPES[c]),
                  textAlign: 'center', height: 60, display: 'flex',
                  alignItems: 'flex-end', justifyContent: 'center', marginBottom: 10, paddingBottom: 4,
                  transform: 'rotate(-45deg)', transformOrigin: 'bottom center',
                  fontWeight: 700,
                  marginLeft: 55,
                }}>
                  {w}
                </div>
              ))}
              {/* Data rows */}
              {WORDS.map((word, r) => (
                <React.Fragment key={r}>
                  <div style={{ fontSize: 16, color: wCol(TYPES[r]), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontWeight: 700, overflow: 'visible' }}>
                    {word}
                  </div>
                  {WORDS.map((_, c) => {
                    const val = ADJ[r][c];
                    const op = cellOp(r, c);
                    const edgeIdx = EDGES.findIndex(([s, t]) => (s === r && t === c) || (s === c && t === r));
                    const edge = edgeIdx !== -1 ? EDGES[edgeIdx] : null;
                    const edgeLabel = edge ? edge[2] : null;

                    const isDiagonal = r === c;
                    const bg = val === 1 ? (edgeLabel === 'conj' ? `${COLORS.aspect}88` : isDiagonal ? '#2d3748' : `${COLORS.primary}55`) : '#1e293b';
                    return (
                      <div key={c} style={{
                        opacity: op,
                        width: CELL, height: CELL - 4,
                        background: bg,
                        border: `1.5px solid ${val === 1 ? (edgeLabel ? DEP_COLORS[edgeLabel] : COLORS.primary) : '#334155'}`,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: val === 1 ? 700 : 400,
                        color: val === 1 ? '#fff' : COLORS.textMuted,
                        boxShadow: edgeLabel && val === 1 ? `0 0 10px ${DEP_COLORS[edgeLabel]}66` : 'none',
                      }}>
                        {val}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: 10, padding: '8px 14px', background: `${COLORS.aspect}18`, border: `1px solid ${COLORS.aspect}44`, borderRadius: 8, fontSize: 18, color: COLORS.textMuted, display: 'inline-block' }}>
              Syntactic dependencies map directly to the <strong>Adjacency Matrix A</strong>
            </div>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
