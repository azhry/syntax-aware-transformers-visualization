import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { COLORS } from './types';

const e3 = (x: number) => 1 - Math.pow(1 - x, 3);
const ap = (f: number, s: number, d: number) => e3(Math.min(Math.max((f - s) / d, 0), 1));

const WORDS = ['The', 'staff', 'was', 'very', 'courteous', 'but', 'the', 'food', 'was', 'terrible'];
const TYPES: ('n' | 'a' | 'o')[] = ['n', 'a', 'n', 'o', 'o', 'n', 'n', 'a', 'n', 'o'];
const N = WORDS.length;

// Embedding values for each word (illustrative 4-dim vectors)
const WORD_EMBEDDINGS: Record<string, number[]> = {
  'The': [0.12, -0.34, 0.56, 0.23],
  'staff': [0.45, 0.67, -0.12, 0.89],
  'was': [-0.23, 0.45, 0.34, -0.56],
  'very': [0.78, -0.23, 0.45, 0.12],
  'courteous': [0.34, 0.89, 0.23, -0.45],
  'but': [-0.12, 0.34, -0.67, 0.23],
  'food': [0.56, 0.12, 0.78, -0.34],
  'terrible': [-0.89, -0.45, 0.12, 0.67],
};

// Hidden states for forward LSTM (illustrative)
const FORWARD_HIDDEN = [
  [0.32, 0.48, 0.15, 0.22],
  [0.45, 0.62, 0.28, 0.35],
  [0.52, 0.71, 0.33, 0.42],
  [0.58, 0.78, 0.38, 0.48],
  [0.65, 0.84, 0.42, 0.55],
  [0.71, 0.88, 0.45, 0.60],
  [0.76, 0.91, 0.48, 0.64],
  [0.80, 0.94, 0.51, 0.68],
  [0.83, 0.96, 0.53, 0.71],
  [0.86, 0.98, 0.55, 0.74],
];

// Hidden states for backward LSTM (illustrative)
const BACKWARD_HIDDEN = [
  [0.75, 0.92, 0.48, 0.65],
  [0.72, 0.89, 0.45, 0.62],
  [0.68, 0.85, 0.42, 0.58],
  [0.64, 0.81, 0.38, 0.54],
  [0.60, 0.76, 0.35, 0.50],
  [0.55, 0.71, 0.32, 0.46],
  [0.50, 0.65, 0.28, 0.41],
  [0.44, 0.58, 0.24, 0.36],
  [0.38, 0.51, 0.20, 0.30],
  [0.30, 0.42, 0.15, 0.24],
];

// Final concatenated hidden states
const FINAL_HIDDEN = FORWARD_HIDDEN.map((f, i) =>
  [...f, ...BACKWARD_HIDDEN[i]]
);

function WordBox({ word, type, opacity, y, isHighlighted }: { word: string; type: 'n' | 'a' | 'o'; opacity: number; y: number; isHighlighted?: boolean }) {
  const col = type === 'a' ? COLORS.aspect : type === 'o' ? COLORS.opinion : COLORS.text;
  return (
    <div style={{
      opacity, transform: `translateY(${y}px)`,
      padding: '8px 16px', border: `3px solid ${col}88`,
      background: isHighlighted ? `${col}44` : `${col}18`, borderRadius: 10, fontSize: 22, color: col,
      fontWeight: 800, minWidth: 80, textAlign: 'center',
      boxShadow: isHighlighted ? `0 0 20px ${col}` : (type !== 'n' ? `0 0 15px ${col}44` : 'none'),
      transition: 'all 0.3s ease',
    }}>{word}</div>
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

const DiagramBox = ({ x, y, label, color, isActive, size = [40, 25] }: { x: number, y: number, label: React.ReactNode, color: string, isActive: boolean, size?: [number, number] }) => (
  <div style={{
    position: 'absolute',
    left: x,
    top: y,
    width: size[0],
    height: size[1],
    background: isActive ? color : `${color}22`,
    borderRadius: 6,
    border: `2px solid ${isActive ? '#fff' : `${color}66`}`,
    color: isActive ? '#fff' : color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 900,
    boxShadow: isActive ? `0 0 20px ${color}` : 'none',
    transition: 'all 0.3s ease',
    zIndex: 10,
    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.2)' : 'scale(1)'}`,
    fontFamily: 'JetBrains Mono, monospace'
  }}>{label}</div>
);

const DiagramOp = ({ x, y, label, color, isActive }: { x: number, y: number, label: React.ReactNode, color: string, isActive: boolean }) => (
  <div style={{
    position: 'absolute',
    left: x,
    top: y,
    width: 32,
    height: 32,
    background: isActive ? color : `${color}22`,
    borderRadius: '50%',
    border: `2px solid ${isActive ? '#fff' : `${color}66`}`,
    color: isActive ? '#fff' : color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 900,
    boxShadow: isActive ? `0 0 20px ${color}` : 'none',
    transition: 'all 0.3s ease',
    zIndex: 10,
    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.2)' : 'scale(1)'}`,
    fontFamily: 'JetBrains Mono, monospace'
  }}>{label}</div>
);

export const Scene2Encoder: React.FC = () => {
  const f = useCurrentFrame();

  // ── TIMING (Duration 360 frames) ──
  const titleOp = ap(f, 0, 15);
  const tokenOp = (i: number) => ap(f, 6 + i * 2, 12);

  // Phase timing - each phase has enough time for all words
  const PHASE_START = 30;
  const INPUT_DUR = 30;        // Input phase duration
  const LSTM_DUR = 100;        // Each LSTM phase duration (10 frames per word for 10 words)
  const CONCAT_DUR = 30;       // Concatenation phase duration

  // Determine current processing phase
  const phase = f < PHASE_START ? -1
    : f < PHASE_START + INPUT_DUR ? 0  // Input phase
      : f < PHASE_START + INPUT_DUR + LSTM_DUR ? 1  // Forward LSTM
        : f < PHASE_START + INPUT_DUR + 2 * LSTM_DUR ? 2  // Backward LSTM
          : f < PHASE_START + INPUT_DUR + 2 * LSTM_DUR + CONCAT_DUR ? 3  // Concatenation
            : 4;  // Output

  const phaseStartFrame = phase <= 0 ? PHASE_START
    : phase === 1 ? PHASE_START + INPUT_DUR
      : phase === 2 ? PHASE_START + INPUT_DUR + LSTM_DUR
        : phase === 3 ? PHASE_START + INPUT_DUR + 2 * LSTM_DUR
          : PHASE_START + INPUT_DUR + 2 * LSTM_DUR + CONCAT_DUR;

  const relF = f - phaseStartFrame;

  // For LSTM phases: each word gets 5 steps (formulas 0-4), then formula 5 for concatenation
  // Word duration within LSTM phase
  const WORD_DUR = LSTM_DUR / N;  // 15 frames per word

  // Current word being processed (for LSTM phases)
  // Forward: 0 → N-1 (left to right)
  // Backward: N-1 → 0 (right to left)
  const currentWordIdx = phase === 1
    ? Math.min(N - 1, Math.floor(relF / WORD_DUR))
    : phase === 2
      ? Math.max(0, N - 1 - Math.floor(relF / WORD_DUR))  // Reversed for backward
      : phase === 3 ? 1 : 0;  // Focus on "staff" (index 1) for concatenation

  // Step index within current word (formulas 0-4 for each word, formula 5 for final concatenation)
  const wordRelF = relF - (phase === 2 ? (N - 1 - currentWordIdx) : currentWordIdx) * WORD_DUR;
  const stepIdx = phase >= 1 && phase <= 2
    ? Math.min(4, Math.floor(wordRelF / (WORD_DUR / 5)))
    : phase === 3 ? 5 : -1;

  // Formula opacity
  const formulaOp = (i: number) => ap(f, PHASE_START + 15 + i * 12, 18);
  const outputOp = ap(f, PHASE_START + INPUT_DUR + 2 * LSTM_DUR + CONCAT_DUR + 10, 25);

  // Formulas for BiLSTM - Reordered for Left-to-Right diagram flow
  const formulas = [
    { label: 'Formula 1: Forget Gate', math: 'f_t = \\sigma(W_f x_t + U_f h_{t-1} + b_f)', color: COLORS.aspect },
    { label: 'Formula 2: Input Gate', math: 'i_t = \\sigma(W_i x_t + U_i h_{t-1} + b_i)', color: COLORS.primary },
    { label: 'Formula 3: Cell Update', math: '\\tilde{C}_t = \\tanh(W_c x_t + U_c h_{t-1} + b_c)', color: COLORS.opinion },
    { label: 'Formula 4: Cell State', math: 'C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t', color: COLORS.primaryLight },
    { label: 'Formula 5: Hidden State', math: 'h_t = o_t \\odot \\tanh(C_t)', color: COLORS.positive },
    { label: 'Formula 6: BiLSTM Output', math: 'h_i = [\\vec{h}_i ; \\overleftarrow{h}_i]', color: COLORS.positive },
  ];

  // Get calculation values for current step
  const getCalcValMath = (currentPhase: number, si: number) => {
    const wordIdx = Math.max(0, Math.min(currentWordIdx, N - 1));
    const word = WORDS[wordIdx];
    const emb = WORD_EMBEDDINGS[word] || [0, 0, 0, 0];
    const fwdH = FORWARD_HIDDEN[wordIdx];
    const bwdH = BACKWARD_HIDDEN[wordIdx];

    const bmax = (val: string) => `\\begin{bmatrix} ${val} \\end{bmatrix}`;
    const h4 = (v: number[]) => bmax(v.map(x => x.toFixed(2)).join(',\\, '));

    // LSTM weights (illustrative)
    const wi = 0.45;
    const wf = 0.32;
    const wc = 0.58;

    const prevH = wordIdx > 0 ? FORWARD_HIDDEN[wordIdx - 1] : [0, 0, 0, 0];

    const iGate = emb.map((v, i) => v * wi + prevH[i] * 0.3);
    const fGate = emb.map((v, i) => v * wf + prevH[i] * 0.25);
    const cTilde = emb.map((v, i) => v * wc);
    const cellState = fGate.map((v, i) => v * 0.5 + iGate[i] * cTilde[i]);
    const hiddenState = fwdH;

    const steps = [
      `\\sigma(${wf} \\cdot ${h4(emb)} + 0.25 \\cdot ${h4(prevH)}) = ${h4(fGate.map(v => Math.min(1, Math.max(0, v))))}`,
      `\\sigma(${wi} \\cdot ${h4(emb)} + 0.30 \\cdot ${h4(prevH)}) = ${h4(iGate.map(v => Math.min(1, Math.max(0, v))))}`,
      `\\tanh(${wc} \\cdot ${h4(emb)}) = ${h4(cTilde)}`,
      `${h4(fGate.map(v => v * 0.5))} + ${h4(iGate.map((v, i) => v * cTilde[i]))} = ${h4(cellState)}`,
      `o_t \\odot \\tanh(${h4(cellState)}) = ${h4(hiddenState)}`,
      `[${h4(fwdH)} ; ${h4(bwdH)}] = ${h4([...fwdH, ...bwdH])}`,
    ];

    return steps[si] || '';
  };

  // Get phase label
  const getPhaseLabel = () => {
    switch (phase) {
      case -1: return 'INITIALIZING';
      case 0: return 'INPUT: WORD EMBEDDINGS';
      case 1: return 'FORWARD LSTM PASS';
      case 2: return 'BACKWARD LSTM PASS';
      case 3: return 'HIDDEN CONCATENATION';
      case 4: return 'ENCODING COMPLETE';
      default: return 'PROCESSING';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 0: return COLORS.primary;
      case 1: return COLORS.primary;
      case 2: return COLORS.aspect;
      case 3: return COLORS.positive;
      case 4: return COLORS.positive;
      default: return COLORS.textMuted;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: '40px 60px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.primaryLight }}>Context Encoder (BiLSTM)</div>
        <div style={{ fontSize: 14, color: getPhaseColor(), background: `${getPhaseColor()}15`, padding: '8px 20px', borderRadius: 99, border: `2px solid ${getPhaseColor()}44`, fontWeight: 800 }}>
          {getPhaseLabel()}
        </div>
      </div>

      {/* Token Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {WORDS.map((w, i) => (
          <WordBox
            key={i}
            word={w}
            type={TYPES[i]}
            opacity={tokenOp(i)}
            y={(1 - tokenOp(i)) * 15}
            isHighlighted={phase >= 0 && i === currentWordIdx}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 50, flex: 1 }}>
        {/* Left: Processing Visualization */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Input Section */}
          <div style={{
            opacity: phase >= 0 ? 1 : 0.3,
            background: phase === 0 ? `${COLORS.primary}15` : 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: 16,
            border: `2px solid ${phase === 0 ? COLORS.primary : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase' }}>
              Input: Word Embedding (xᵢ)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                background: '#000',
                padding: '12px 16px',
                borderRadius: 10,
                border: `2px solid ${phase === 0 ? COLORS.primary : 'rgba(255,255,255,0.2)'}`,
                boxShadow: phase === 0 ? `0 0 20px ${COLORS.primary}44` : 'none'
              }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Word: "{WORDS[Math.max(0, currentWordIdx)]}"</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(WORD_EMBEDDINGS[WORDS[Math.max(0, currentWordIdx)]] || [0, 0, 0, 0]).map((v, i) => (
                    <VectorCell
                      key={i}
                      val={v}
                      lab={`F${i + 1}`}
                      color={COLORS.primary}
                      isHighlighted={phase === 0}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 16, color: COLORS.text }}>
                <InlineMath math="x_i \in \mathbb{R}^{d_w}" />
              </div>
            </div>
          </div>

          {/* LSTM Processing Section */}
          <div style={{
            opacity: phase >= 1 ? 1 : 0.3,
            background: phase === 1 || phase === 2 ? `${COLORS.primary}10` : 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: 16,
            border: `2px solid ${phase === 1 ? COLORS.primary : phase === 2 ? COLORS.aspect : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.3s ease',
            flex: 1
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>
              Bi-directional LSTM Processing
            </div>

            {/* Forward LSTM */}
            <div style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: 18
                }}>→</div>
                <span style={{ fontSize: 16, color: COLORS.primary, fontWeight: 800 }}>Forward LSTM</span>
                {phase === 1 && (
                  <span style={{
                    fontSize: 11,
                    background: COLORS.primary,
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontWeight: 800
                  }}>
                    PROCESSING WORD {currentWordIdx + 1}/{N}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: N }).map((_, i) => {
                  // Forward LSTM: cells fill left to right during phase 1
                  // After phase 1, all cells remain filled
                  const isFilled = phase > 1 || (phase === 1 && i <= currentWordIdx);
                  const isCurrent = phase === 1 && i === currentWordIdx;
                  return (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: isFilled ? COLORS.primary : 'rgba(255,255,255,0.1)',
                      opacity: isCurrent ? 1 : (isFilled ? 0.7 : 0.3),
                      transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, color: '#fff', fontSize: 12,
                      border: isCurrent ? `2px solid #fff` : 'none',
                      boxShadow: isCurrent ? `0 0 15px ${COLORS.primary}` : 'none',
                      transition: 'all 0.2s ease'
                    }}>{i + 1}</div>
                  );
                })}
              </div>
            </div>

            {/* Backward LSTM */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: COLORS.aspect,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: 18
                }}>←</div>
                <span style={{ fontSize: 16, color: COLORS.aspect, fontWeight: 800 }}>Backward LSTM</span>
                {phase === 2 && (
                  <span style={{
                    fontSize: 11,
                    background: COLORS.aspect,
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontWeight: 800
                  }}>
                    PROCESSING WORD {currentWordIdx + 1}/{N}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: N }).map((_, i) => {
                  // Backward LSTM: cells fill right to left during phase 2
                  // currentWordIdx goes from N-1 to 0, so cells >= currentWordIdx are filled
                  const isFilled = phase > 2 || (phase === 2 && i >= currentWordIdx);
                  const isCurrent = phase === 2 && i === currentWordIdx;
                  return (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: isFilled ? COLORS.aspect : 'rgba(255,255,255,0.1)',
                      opacity: isCurrent ? 1 : (isFilled ? 0.7 : 0.3),
                      transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, color: '#fff', fontSize: 12,
                      border: isCurrent ? `2px solid #fff` : 'none',
                      boxShadow: isCurrent ? `0 0 15px ${COLORS.aspect}` : 'none',
                      transition: 'all 0.2s ease'
                    }}>{i + 1}</div>
                  );
                })}
              </div>
            </div>

            {/* LSTM Cell Detail - Overhauled diagram to match reference */}
            {(phase === 1 || phase === 2) && (
              <div style={{
                marginTop: 15,
                padding: '24px',
                background: 'rgba(0,0,0,0.45)',
                borderRadius: 24,
                border: `2px solid ${phase === 1 ? COLORS.primary : COLORS.aspect}33`,
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 15, fontWeight: 800, textAlign: 'center', letterSpacing: 1.2 }}>
                  LSTM CELL INTERNAL STRUCTURE — Word "{WORDS[currentWordIdx]}"
                </div>

                <div style={{ position: 'relative', height: 260, width: '100%', maxWidth: 700, margin: '0 auto' }}>
                  {/* Internal Background Container */}
                  <div style={{
                    position: 'absolute',
                    top: 20, left: 50, right: 50, bottom: 40,
                    background: `${COLORS.positive}08`,
                    borderRadius: 30,
                    border: `2px solid ${COLORS.textMuted}22`,
                    zIndex: 0
                  }} />

                  {/* SVG for sophisticated connection lines */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textMuted} />
                      </marker>
                    </defs>

                    {/* Top Line: Cell State Path (C_t) */}
                    <path
                      d="M 20 60 L 680 60"
                      stroke={stepIdx >= 3 ? COLORS.primaryLight : `${COLORS.primaryLight}44`}
                      strokeWidth="3.5"
                      fill="none"
                      markerEnd="url(#arrow)"
                      style={{ transition: 'all 0.4s ease' }}
                    />

                    {/* Bottom Line: Hidden State Bus (h_t) */}
                    <path d="M 20 200 L 120 200" stroke={COLORS.positive} strokeWidth="3.5" fill="none" />
                    <path d="M 120 200 L 450 200" stroke={COLORS.textMuted} strokeWidth="3.5" fill="none" />

                    {/* x_t input flow */}
                    <path
                      d="M 100 240 Q 100 200 130 200"
                      stroke={COLORS.primary}
                      strokeWidth="3"
                      fill="none"
                    />

                    {/* Vertical Gates Flows */}
                    {/* Forget path: bus -> sigma -> top cross */}
                    <path d="M 150 200 Q 150 170 150 145" stroke={stepIdx === 0 ? COLORS.aspect : `${COLORS.aspect}22`} strokeWidth="3" fill="none" />
                    <path d="M 150 115 L 150 78" stroke={stepIdx === 0 ? COLORS.aspect : `${COLORS.aspect}22`} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

                    {/* Input path: bus -> sigma -> intermediate cross */}
                    <path d="M 220 200 L 220 145" stroke={stepIdx === 1 ? COLORS.primary : `${COLORS.primary}22`} strokeWidth="3" fill="none" />
                    <path d="M 220 115 Q 220 100 260 100" stroke={stepIdx === 1 ? COLORS.primary : `${COLORS.primary}22`} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

                    {/* Candidate path: bus -> tanh -> intermediate cross */}
                    <path d="M 330 200 L 330 145" stroke={stepIdx === 2 ? COLORS.opinion : `${COLORS.opinion}22`} strokeWidth="3" fill="none" />
                    <path d="M 330 115 Q 330 100 295 100" stroke={stepIdx === 2 ? COLORS.opinion : `${COLORS.opinion}22`} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

                    {/* Update path: intermediate cross -> top plus */}
                    <path d="M 278 85 L 278 78" stroke={stepIdx === 3 ? COLORS.primaryLight : `${COLORS.primaryLight}22`} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

                    {/* Output gate path: bus -> sigma -> final cross */}
                    <path d="M 430 200 L 430 145" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="3" fill="none" />
                    <path d="M 430 115 Q 430 150 505 150" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="3" fill="none" markerEnd="url(#arrow)" />

                    {/* Cell State to Hidden State conversion: top -> tanh -> final cross */}
                    <path d="M 520 60 L 520 85" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="2.5" fill="none" />
                    <path d="M 520 115 L 520 135" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="2.5" fill="none" markerEnd="url(#arrow)" />

                    {/* final h_t outputs from the cross at (520, 150) */}
                    <path d="M 535 150 L 680 150" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="3.5" fill="none" markerEnd="url(#arrow)" />
                    <path d="M 560 150 L 560 30" stroke={stepIdx === 4 ? COLORS.positive : `${COLORS.positive}22`} strokeWidth="3.5" fill="none" markerEnd="url(#arrow)" />
                  </svg>

                  {/* Pointwise Operations */}
                  <DiagramOp x={150} y={60} label={<InlineMath math="\times" />} color={COLORS.aspect} isActive={stepIdx === 0} />
                  <DiagramOp x={278} y={60} label={<InlineMath math="+" />} color={COLORS.primaryLight} isActive={stepIdx === 3} />
                  <DiagramOp x={278} y={100} label={<InlineMath math="\times" />} color={COLORS.primary} isActive={stepIdx === 1 || stepIdx === 2} />
                  <DiagramOp x={520} y={150} label={<InlineMath math="\times" />} color={COLORS.positive} isActive={stepIdx === 4} />

                  {/* Activation Boxes (Gates) */}
                  <DiagramBox x={150} y={130} label={<InlineMath math="\sigma" />} color={COLORS.aspect} isActive={stepIdx === 0} size={[34, 24]} />
                  <DiagramBox x={220} y={130} label={<InlineMath math="\sigma" />} color={COLORS.primary} isActive={stepIdx === 1} size={[34, 24]} />
                  <DiagramBox x={330} y={130} label={<InlineMath math="\tanh" />} color={COLORS.opinion} isActive={stepIdx === 2} size={[50, 24]} />
                  <DiagramBox x={430} y={130} label={<InlineMath math="\sigma" />} color={COLORS.positive} isActive={stepIdx === 4} size={[34, 24]} />
                  <DiagramBox x={520} y={100} label={<InlineMath math="\tanh" />} color={COLORS.positive} isActive={stepIdx === 4} size={[50, 24]} />

                  {/* Semantic Labels for Inputs/Outputs */}
                  <div style={{ position: 'absolute', left: 15, top: 35, fontSize: 13, color: COLORS.primaryLight, fontWeight: 900, opacity: 0.8 }}>
                    <InlineMath math="C_{t-1}" />
                  </div>
                  <div style={{ position: 'absolute', right: 15, top: 35, fontSize: 13, color: COLORS.primaryLight, fontWeight: 900, opacity: 0.8 }}>
                    <InlineMath math="C_t" />
                  </div>
                  <div style={{ position: 'absolute', left: 15, top: 175, fontSize: 13, color: COLORS.positive, fontWeight: 900, opacity: 0.8 }}>
                    <InlineMath math="h_{t-1}" />
                  </div>
                  <div style={{ position: 'absolute', right: 15, top: 175, fontSize: 13, color: COLORS.positive, fontWeight: 900, opacity: 0.8 }}>
                    <InlineMath math="h_t" />
                  </div>
                  <div style={{ position: 'absolute', left: 100, bottom: -5, fontSize: 13, color: COLORS.primary, fontWeight: 900 }}>
                    <InlineMath math="x_t" />
                  </div>
                  <div style={{ position: 'absolute', right: 100, top: -5, fontSize: 13, color: COLORS.positive, fontWeight: 900 }}>
                    <InlineMath math="h_t" />
                  </div>
                </div>

                {/* Gate Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: COLORS.aspect }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.aspect }} /> FORGET GATE (f_t)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: COLORS.primary }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.primary }} /> INPUT GATE (i_t)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: COLORS.opinion }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.opinion }} /> CANDIDATE (C̃_t)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: COLORS.positive }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.positive }} /> OUTPUT GATE (o_t)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div style={{
            opacity: phase >= 3 ? 1 : 0.3,
            background: phase >= 3 ? `${COLORS.positive}15` : 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: 16,
            border: `2px solid ${phase >= 3 ? COLORS.positive : 'rgba(255,255,255,0.1)'}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMuted, marginBottom: 10, textTransform: 'uppercase' }}>
              Output: Hidden State (hᵢ)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                background: '#000',
                padding: '12px 16px',
                borderRadius: 10,
                border: `2px solid ${phase >= 3 ? COLORS.positive : 'rgba(255,255,255,0.2)'}`,
                boxShadow: phase >= 3 ? `0 0 20px ${COLORS.positive}44` : 'none'
              }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>hᵢ = [h→ᵢ ; h←ᵢ]</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {FINAL_HIDDEN[Math.max(0, currentWordIdx)].map((v, i) => (
                    <VectorCell
                      key={i}
                      val={v}
                      lab={i < 4 ? `F${i + 1}` : `B${i - 3}`}
                      color={i < 4 ? COLORS.primary : COLORS.aspect}
                      isHighlighted={phase >= 3}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 14, color: COLORS.text }}>
                <InlineMath math="h_i \in \mathbb{R}^{2d_h}" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calculation Details */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 12, opacity: phase >= 1 ? 1 : 0, transition: 'all 0.4s ease' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.textMuted, marginBottom: 10 }}>
            THE CALCULUS <span style={{ color: COLORS.positive }}>— BiLSTM Detail</span>
          </div>

          {formulas.map((fo, i) => {
            const op = formulaOp(i);
            const isCurrentStep = phase >= 1 && phase <= 3 && stepIdx === i;
            const isRelevant = (phase === 1 || phase === 2) ? (i < 5) : (phase === 3 ? i === 5 : false);

            return (
              <div key={i} style={{
                opacity: isRelevant ? op : 0.2,
                transform: `translateX(${(1 - op) * 24}px)`,
                background: isCurrentStep ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.5)',
                borderRadius: 14, padding: '14px 24px',
                borderLeft: `12px solid ${fo.color}`,
                minHeight: isCurrentStep ? 120 : 70,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: 10, color: fo.color, fontWeight: 900, marginBottom: 6, textTransform: 'uppercase' }}>{fo.label}</div>
                <div style={{ fontSize: 18, color: '#fff' }}>
                  <InlineMath math={fo.math} />
                </div>

                {isCurrentStep && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.85)', borderRadius: 8, border: `1.5px solid ${fo.color}44`, color: COLORS.positive, fontSize: 13, fontWeight: 800 }}>
                    <div style={{ fontSize: 12 }}><InlineMath math={getCalcValMath(phase, i)} /></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Current State Summary */}
          {phase >= 1 && (
            <div style={{
              opacity: outputOp,
              marginTop: 'auto',
              background: `${COLORS.positive}15`,
              border: `3px solid ${COLORS.positive}66`,
              borderRadius: 14,
              padding: '16px'
            }}>
              <div style={{ fontSize: 13, color: COLORS.positive, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>
                Current Hidden State for "{WORDS[Math.max(0, currentWordIdx)]}"
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {FINAL_HIDDEN[Math.max(0, currentWordIdx)].map((v, i) => (
                  <VectorCell
                    key={i}
                    val={v}
                    lab={i < 4 ? `F${i + 1}` : `B${i - 3}`}
                    color={COLORS.positive}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
