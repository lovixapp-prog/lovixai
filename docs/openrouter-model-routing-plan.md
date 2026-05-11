# OpenRouter model routing idea

Status: saved for future implementation.

## Goal

Use OpenRouter as a single model gateway so Lovix can call the best available model for each task without hard-coding every private provider in the UI.

This can cover chat/orchestration models first, then multimodal and generation models when supported by OpenRouter or by compatible provider adapters. Examples to evaluate later: Kling 3, Seedance/Seedream, Veo, image models, Nano Banana-style image editing, and other video/image/audio models as they become available.

## Proposed architecture

1. Agent request enters Lovix chat or a tool.
2. A server-side model router classifies the job:
   - marketing strategy
   - UGC script
   - video generation
   - image generation/editing
   - motion/lip-sync
   - connector automation
3. The router selects the best model from a capability table.
4. A provider adapter calls OpenRouter or the existing private API fallback.
5. Async jobs store provider, model id, cost, prompt, status, and result assets.
6. UI shows the plan, estimated credits, selected model, and fallback status before execution when the request is complex.

## Implementation phases

Phase 1: foundation
- Add `OPENROUTER_API_KEY` only on the server.
- Create a `modelCatalog` with capabilities, cost class, input types, output types, and fallback provider.
- Add a `modelRouter` service with deterministic routing rules.
- Keep all existing providers working as fallback.

Phase 2: agent orchestration
- Let the chat agent create a structured action plan for complex campaigns.
- Add editable plan fields for product URL, service/app URL, influencer type, generated or owned influencer, format, duration, language, platforms, hooks, scenes, and deliverables.
- Route each plan step to the most suitable model.

Phase 3: generation tools
- Add OpenRouter-backed adapters where the model supports the required output.
- Normalize async generation polling for video/image models.
- Store provider job ids and generation metadata for support/debugging.

Phase 4: UI and controls
- Add a model mode selector: Auto, Fast, Quality, Budget.
- Show estimated credits before execution.
- Show which model was selected, with fallback when needed.
- Add admin/dev controls to disable unstable models without redeploying.

## Risks to check

- OpenRouter availability differs by model and output type.
- Some video models may require provider-specific upload, polling, or asset URLs.
- Costs and rate limits need a Lovix credits mapping.
- User prompts and uploaded files must stay server-side and never expose API keys in the browser.
- Need graceful fallback when a model is unavailable, overloaded, or removed.

## Recommended next step

When we implement this, start with chat/orchestration routing first. It is lower risk and creates the foundation for routing video/image generation later.
