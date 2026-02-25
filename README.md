# Syntax-Aware Transformer Visualization 🎥

<p align="center">
  <img src="https://img.shields.io/badge/Rendered_with-Remotion-blue?style=for-the-badge&logo=remotion" alt="Remotion" />
  <img src="https://img.shields.io/badge/Context-Adjacent_Edge_Attention-orange?style=for-the-badge" alt="AEA" />
</p>

This project provides a cinematic, step-by-step visualization of the **Syntax-Aware Transformer (SAT)** architecture, specifically focusing on the **Adjacent Edge Attention (AEA)** mechanism.

The visualization explores how transformers can evolve from "sequential-blind" models into "syntax-aware" extractors by leveraging dependency trees to break mathematical symmetry between identical tokens.

## 📺 Result Preview

<p align="center">
  <video src="https://raw.githubusercontent.com/azhry/syntax-aware-transformers-visualization/main/out/SATransformerVideo.mp4" controls width="100%" style="max-width: 800px; border-radius: 20px;"></video>
</p>

> **Full Video Download**: [`out/SATransformerVideo.mp4`](./out/SATransformerVideo.mp4)

## 🧠 Key Scientific Concepts Visualized

### 1. Symmetry Breaking (The Problem)
One of the biggest challenges in Aspect-Based Sentiment Triplet Extraction (ASTE) is when two clauses have identical structure (e.g., *"The staff was courteous but the food was terrible"*). Initial embeddings for "was₁" and "was₂" are often 100% identical, making relation extraction ambiguous.

### 2. Adjacent Edge Attention (AEA)
The video breaks down the **Root of the Universe** calculation:
- **Projection**: Extracting "meaning-seeking" features (Query, Key, Value).
- **Scoring**: Mathematical Dot-Product measuring the "fit" between an edge and its neighbors.
- **Neural Audit Scoreboard**: A literal trace of how importance (α weights) is distributed across neighbors (e.g., *staff*, *courteous*, *but*).
- **Aggregation**: Blending contextual "essence" into the edge representation to create a unique, refined vector.

### 3. Deep Trace Calculation
The README math matches the video's terminal-style computation traces:
- **Query $\vec{q}$** vs **Key $\vec{k}$** dot products.
- **Softmax** normalization with explicit denominators.
- **Symmetry Resolution**: Proving how unique neighborhoods result in $>40\%$ difference in finalized weights.

## 🛠️ Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Live Preview
```bash
npm run remotion
```

### 3. Render Final Video
```bash
npx remotion render
```

## 🏗️ Project Structure

- `src/remotion/SATransformer/`: Core visualization logic.
  - `Scene2Encoder.tsx`: Showing the initial token blind-spots.
  - `Scene3Dependency.tsx`: Mapping the 7-word dependency graph.
  - `Scene4AEA.tsx`: The "Main Event" — Step-by-step Attention mechanics.
- `out/`: Contains the latest rendered build.
- `plans/`: Detailed implementation spec for the mathematical steps.

## 📜 Academic Reference
This visualization is based on the paper:  
*"Encoding Syntactic Information into Transformers for Aspect-Based Sentiment Triplet Extraction"*

---
Built with 🥃 and **Remotion** by [Lyrid](https://github.com/azhry)
