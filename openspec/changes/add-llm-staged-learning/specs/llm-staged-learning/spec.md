## ADDED Requirements

### Requirement: Four-stage learning route
The site SHALL provide one beginner route that presents API usage, Transformer foundations, Mini GPT implementation, and training optimization in that order, with completion criteria for every stage.

#### Scenario: Learner opens the route
- **WHEN** a learner opens the LLM learning route
- **THEN** the system displays all four stages in order and provides working links for every delivered lesson

#### Scenario: Learner checks stage completion
- **WHEN** a learner reviews a stage
- **THEN** the system displays concrete knowledge or practice outcomes that indicate readiness for the next stage

### Requirement: Beginner-first entry hierarchy
The AI module SHALL distinguish the four-stage beginner route from the advanced topic library and SHALL present one unambiguous first lesson before exposing the full lesson inventory.

#### Scenario: First-time learner opens the AI module
- **WHEN** a learner opens the AI module without knowing which topic to choose
- **THEN** the system identifies API usage as the current starting point, displays the four stages in order, and provides one primary action that opens the first lesson

#### Scenario: Learner browses existing topics
- **WHEN** a learner wants to study outside the beginner route
- **THEN** the system groups the existing concept owners by learning goal and labels them as an optional topic library rather than equal next steps

#### Scenario: Learner opens the full route
- **WHEN** a learner opens the four-stage route
- **THEN** the first stage is expanded, later stages remain available through progressive disclosure, and delivery-status language does not masquerade as learner progress

### Requirement: Canonical concept ownership
The learning route MUST reuse an existing concept page when that page already owns the topic, and new pages MUST limit their content to the missing prerequisite or synthesis responsibility.

#### Scenario: Existing Transformer concept is referenced
- **WHEN** the route teaches Tokenization, Embedding, Attention, training, fine-tuning, RLHF, or model merging
- **THEN** it links to the existing owning page instead of creating another page with the same primary objective

#### Scenario: New page overlaps an existing page
- **WHEN** a new lesson mentions a concept owned elsewhere
- **THEN** it explains only the local role and provides a link or reviewed relation to the owning page

### Requirement: Safe API lifecycle lesson
The site SHALL teach model API usage from the caller perspective, including server-side credentials, bounded requests, streaming, validation, and recovery.

#### Scenario: Normal streaming request
- **WHEN** a learner steps through the normal API animation
- **THEN** the system shows client input, server-side authentication, model request, stream consumption, validation, and safe business output

#### Scenario: API failure path
- **WHEN** a learner selects rate limiting, timeout, context overflow, or invalid structured output
- **THEN** the system shows the specific failure and an appropriate bounded retry, reduction, fallback, or rejection response

### Requirement: LLM-focused mathematical foundations
The site SHALL provide focused lessons for vectors/matrices, Softmax/cross-entropy, and gradients/backpropagation using small calculations tied directly to LLM mechanisms.

#### Scenario: Learner calculates attention prerequisites
- **WHEN** a learner uses the vector and matrix lesson
- **THEN** the system demonstrates vector shape, dot-product similarity, matrix multiplication, and their role in Embedding or Attention

#### Scenario: Learner calculates a token probability and loss
- **WHEN** a learner uses the Softmax and cross-entropy lesson
- **THEN** the system converts logits to normalized probabilities, identifies the target-token probability, and calculates its loss with numerical-stability guidance

#### Scenario: Learner follows parameter learning
- **WHEN** a learner uses the gradient and backpropagation lesson
- **THEN** the system traces a loss derivative through a small computation graph and performs one bounded parameter update

### Requirement: Mini GPT synthesis lesson
The site SHALL provide one Mini GPT walkthrough that connects text data, tokenization, embeddings, a Transformer block, logits, loss, backpropagation, parameter updates, and autoregressive generation.

#### Scenario: Learner follows model data flow
- **WHEN** a learner steps through the Mini GPT simulation
- **THEN** the system displays each component in execution order with its representative input and output shape

#### Scenario: Learner uses the reference implementation
- **WHEN** a learner reads the corresponding code
- **THEN** the system provides a coherent PyTorch teaching implementation and states how it differs from a production LLM

### Requirement: Training optimization lab
The site SHALL provide deterministic comparisons for SGD and AdamW, learning-rate regimes, batch size, gradient clipping, regularization, and the boundary between basic training and LoRA fine-tuning.

#### Scenario: Learner diagnoses a loss curve
- **WHEN** a learner selects a stable, too-small, too-large, overfitting, or exploding-gradient scenario
- **THEN** the system displays the characteristic curve or state and explains the matching intervention

#### Scenario: Learner compares optimizer responsibilities
- **WHEN** a learner compares SGD, AdamW, clipping, regularization, and LoRA
- **THEN** the system distinguishes optimization dynamics, stability controls, generalization controls, and parameter-efficient adaptation

### Requirement: Interactive and failure-state coverage
Every new interactive lesson MUST support deterministic navigation and MUST include normal, boundary, failure, and recovery or comparison states where those states apply.

#### Scenario: Learner operates an animation
- **WHEN** a learner uses reset, previous, play/pause, next, or a step selector
- **THEN** the visual state, explanation, metrics, and code remain synchronized

#### Scenario: Learner reaches a boundary state
- **WHEN** the selected example reaches invalid dimensions, saturated probability, unstable gradient, or an equivalent lesson boundary
- **THEN** the system highlights the boundary and explains a valid correction or limitation

### Requirement: Knowledge-system integration and verification
Every new lesson SHALL be registered in canonical knowledge data, linked by reviewed semantic relations, discoverable from the AI module, and covered by automated validation.

#### Scenario: Knowledge data is generated
- **WHEN** the knowledge build runs after the change
- **THEN** every new page has one valid profile, all formal relations resolve, and the generated file matches canonical sources

#### Scenario: Project verification runs
- **WHEN** maintainers run knowledge, layout, unit/integration, and targeted browser checks
- **THEN** the new route and lessons produce no validation errors or warnings and their primary interactions pass
