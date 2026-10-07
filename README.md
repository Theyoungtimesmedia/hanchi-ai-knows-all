# Hanchi AI Assistant

[25/09, 8:14 pm] DEAR: /td 
Hey I want to make My own AI hanchi AI hanchi means nose in Hausa so my AI will be an AI that nose all it can say joke make do assignment process images and Like recording and answer anything
It can answer questions about images 
 and translate Between English and Hausa as text or image it can also help you Code and do some other things I want the AI to be like Chat gpt but better and have good UI/Ux design and speaks both Nigerian standard English and Pidgin and Hausa and American English it will sound as human as possible and be based on Gemini open source model  it can also search the web for information and think before it talks it nose everything and above all 100 percent accurate
[25/09, 8:14 pm] DEAR: *Project summary*
Hanchi is a multilingual, multimodal assistant that “noses out” answers: text, images, voice, code, translation between English and Hausa, plus Nigerian Pidgin and American English styles. The product goal is ChatGPT-level capabilities with better local/linguistic relevance, fast UI/UX, multimodal inputs, web search, and deliberate (chain-of-thought) reasoning. Hanchi cannot be guaranteed 100 percent accurate; build-in grounding, retrieval, and human review to maximize correctness.

---

*Priority MVP feature list*
1. Core chat: contextual conversation, session history, user profiles.
2. Bilingual text translation: English ↔ Hausa and Pidgin support for short ↔ medium text.
3. Multimodal input: upload image for captioning, Q&A, OCR.
4. Voice I/O: record, ASR transcription in Hausa/English/Pidgin, TTS with selectable voice styles.
5. Code helper: syntax-highlighted snippets, explanation, simple run sandbox for JS/Python.
6. Web search + retrieval: source-backed answers with citations and timestamps.
7. Safety and moderation: profanity filter, hallucination detection and confidence score.
8. Simple UI: chat, language toggle, quick intent chips (Translate, Image, Code, Record).

---

*Model and tooling comparison*
OptionStrengthsWeaknessesOpen-source Gemini-style model (user-specified)Tunable, offline hosting possible; can be customized for HausaOfficial Gemini is not open-source; community clones vary in capabilityLlama-family or equivalent open modelsStrong community support; good fine-tuning toolingRequires infrastructure for low-latency inferenceMistral / Mosaic modelsHigh quality for smaller footprintsLess pretrained Hausa data out of the boxHosted LLM providersFast deployment, managed scaling, built-in safety toolsCostly at scale and less customizable for Hausa nuancesSources: none required for internal comparison.

---

*Architecture overview*
- Frontend: React Web + React Native for mobile; component library for accessibility and responsive UI.
- API layer: stateless gateway that routes to: conversation service, retrieval service, media processor, ASR/TTS, and translation microservice.
- Models: inference cluster with GPU-backed nodes; retrieval-augmented generation layer that queries an embeddings DB and external web search.
- Storage: Postgres for metadata, vector DB for embeddings, object store for media.
- Real-time: WebSockets for streaming responses and live transcription.
- Observability: tracing, logs, and metrics for latency and error rate.

---

*Accuracy and “think before talk” strategy*
- Retrieval-Augmented Generation: fetch relevant docs and web snippets and condition the LLM to cite sources in responses.
- Multi-step reasoning: implement deliberation chains where the model produces an internal plan (short chain-of-thought kept off-user-facing) and then a concise final answer.
- Verification pass: after generating an answer, run a fast verifier model that checks factual claims against retrieved sources and flags low-confidence claims.
- Confidence and provenance: show confidence score and sources for factual queries.
- Human-in-loop: manual review flows for high-stakes or low-confidence outputs.
- Continuous evaluation: automated metrics (precision/recall for facts), human eval for translation quality and ASR WER for Hausa.

---

*Multimodal and language specifics*
- Image Q&A and OCR: use vision encoders to extract text and objects, then pass to the conversational model for Q&A and translation.
- Translation pipeline: text translation model fine-tuned on English↔Hausa parallel corpora and tuned examples for Pidgin. Include idiom/proverb handlers (rule-based mapping plus examples).
- ASR/TTS: fine-tune ASR for Hausa dialects and Pidgin samples; create TTS voices for Nigerian-standard English, Pidgin, Hausa, and American English with natural prosody. Use Lovable cloud and Lovable AI

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hanchi-ai-knows-all.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d9d4ee1-0fe7-4f0c-8845-9841604e4cf3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
