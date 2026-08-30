## Why

The AI module contains strong individual pages but lacks a beginner path that connects safe API usage to Transformer foundations, a runnable Mini GPT, and training optimization. Without an explicit staged contract, learners either encounter advanced material too early or receive duplicate explanations with inconsistent ownership.

## What Changes

- Add one four-stage learning route with explicit prerequisites and completion criteria.
- Add a caller-side LLM API lifecycle lesson with security and recovery paths.
- Add three minimal-math lessons scoped to LLM vectors/matrices, Softmax/cross-entropy, and gradient/backpropagation.
- Add a Mini GPT walkthrough that connects data, model components, training, and generation.
- Add a training optimization lab for optimizer choice, learning rate, batch size, clipping, regularization, and LoRA boundaries.
- Reuse existing Tokenization, Embedding, Attention, training pipeline, fine-tuning, RLHF, and model-merging pages instead of duplicating their normative concepts.
- Register all new pages in the knowledge graph, navigation, SEO, audits, and automated tests.

## Capabilities

### New Capabilities

- `llm-staged-learning`: A staged, beginner-oriented LLM learning experience with concept ownership, interactive failure/boundary cases, and measurable completion criteria.

### Modified Capabilities

None. This project had no OpenSpec baseline before this change.

## Impact

- Adds static pages under `ai/` and a learning-route entry on `ai/index.html`.
- Adds AI page profiles and reviewed knowledge relations, then regenerates `knowledge-data.js`.
- Updates site discovery, content-priority audit data, and Vitest/Playwright coverage.
- Introduces the project-level `openspec/` convention and keeps this change active until user acceptance; it will not be archived automatically.
