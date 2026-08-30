## Context

The site is a static HTML/CSS/JavaScript knowledge system. AI topics are represented by individual pages, canonical node profiles, and reviewed semantic relations. The existing module is broad and largely intermediate; the new learning experience must organize those pages for beginners while preserving each existing page as the owner of its concept.

The work spans route design, five new instructional pages beyond stage one, generated knowledge data, site discovery, and browser interactions. The working tree already contains unrelated user changes, so implementation must be additive and narrowly patched.

## Goals / Non-Goals

**Goals:**

- Deliver four ordered stages with explicit learning outcomes and links.
- Teach only the mathematics required to understand the referenced LLM mechanism.
- Provide deterministic browser simulations for calculations, model flow, failures, and comparisons.
- Keep one canonical owner for each concept and express reuse through links and knowledge relations.
- Make all new pages discoverable and verifiable through existing project tooling.

**Non-Goals:**

- A complete university mathematics curriculum.
- Real browser-side model API calls or storage of provider credentials.
- Production-scale training, CUDA, distributed training, or research-architecture coverage.
- Rewriting existing Tokenization, Embedding, Attention, training, fine-tuning, RLHF, or model-merging lessons.

## Decisions

### Use one route and five focused follow-up pages

The route remains the single beginner entry. Stages two through four add three math pages, one Mini GPT page, and one optimizer lab. This keeps the number of new concept owners small while still giving each interactive topic enough space.

Alternative: embed all material into the route page. Rejected because one large document would mix navigation, equations, code, and simulations and become difficult to test or maintain.

### Reuse the existing generic stepper runtime

Pages use the established `window.AI_DEMO` configuration and `ai.js` for step playback where a node-edge sequence is sufficient. Specialized calculation widgets use small inline scripts with deterministic inputs.

Alternative: add a framework or chart dependency. Rejected because the site is static, current interactions already work without dependencies, and the educational datasets are intentionally small.

### Keep mathematical scope mechanism-driven

The vector page owns vector shape, dot product, and matrix multiplication; the probability page owns stable Softmax and cross-entropy; the gradient page owns derivative intuition, chain rule, backpropagation, and one update. Existing AI pages continue to own their domain applications.

Alternative: create a top-level mathematics module. Rejected because it expands scope and separates prerequisites from their immediate LLM use.

### Keep Mini GPT executable reference separate from browser simulation

The browser demonstrates tensor shapes and data flow with JavaScript. A compact PyTorch reference shows the corresponding runnable model and training loop. The page explicitly distinguishes this teaching model from production systems.

Alternative: run Python training in the browser. Rejected because it adds a large runtime dependency and obscures the model flow with environment setup.

### Keep the OpenSpec change active after implementation

The change records all four stages as one releasable learning outcome. Implementation and tasks can be complete, but archiving waits for user acceptance because archive status updates the baseline contract.

### Separate the beginner journey from the topic library

The AI module uses a beginner-first hierarchy: one direct first-lesson action, a compact four-stage overview, and an explicitly optional topic library grouped by learning goal. The full route expands stage one by default and keeps later-stage lesson inventories collapsed until requested.

Alternative: keep every AI page in one equal-weight card grid. Rejected because the route card competes with individual concepts and leaves a first-time learner to infer both the correct path and the first lesson.

## Risks / Trade-offs

- **Simplified calculations may look production-realistic** → Label fixed values, tensor sizes, and teaching assumptions at each lab.
- **Concept duplication may drift over time** → Assign a main page owner and use explicit knowledge relations instead of copied explanations.
- **Large inline pages can become hard to maintain** → Keep each page focused on one learning objective and reuse `ai.css`/`ai.js`.
- **Existing dirty worktree can cause accidental bundling** → Patch only named files, never reset unrelated work, and report implementation changes separately.
- **Generated data creates large diffs** → Treat `knowledge/nodes/*.json` and `knowledge/relations.json` as canonical and verify generated output byte-for-byte.
- **Progressive disclosure can hide useful references** → Keep every existing topic link present in semantic HTML, use native `details` only on the staged route, and make the optional topic library visibly grouped on the AI module page.

## Migration Plan

1. Introduce OpenSpec and keep the change unarchived.
2. Add new pages without changing existing page URLs.
3. Add node profiles and reviewed relations, then regenerate knowledge data.
4. Replace future-stage placeholders in the route with links after their pages exist.
5. Update discovery and audits, then run full static, unit, integration, layout, and browser checks.
6. Roll back by removing only the new route/page entries and their new relations; existing concept pages remain unaffected.

## Open Questions

None for implementation. External Obsidian synchronization remains outside this repository and requires separate authorization.
