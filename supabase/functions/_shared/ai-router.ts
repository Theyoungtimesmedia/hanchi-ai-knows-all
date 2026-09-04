// Provider-neutral model router.
// Adapters are registered per provider; callers request a CAPABILITY and the
// router resolves the best available model from the keys configured in the
// environment. No Lovable AI Gateway dependency anywhere in this file.

export type Capability =
  | 'text'
  | 'image_input'
  | 'audio_input'
  | 'video_input'
  | 'documents'
  | 'image_generation'
  | 'structured_output'
  | 'tool_calling'
  | 'streaming';

export type ProviderName = 'openai' | 'anthropic' | 'google' | 'replicate';

export type RouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: unknown;
};

export type ModelEntry = {
  provider: ProviderName;
  /** Provider-native model id. */
  id: string;
  /** Stable alias exposed to the frontend. */
  alias: string;
  label: string;
  capabilities: Capability[];
};

/**
 * Catalogue of models the backend knows how to call. Aliases keep the frontend
 * contract stable even when the underlying provider/model changes.
 */
export const MODEL_CATALOGUE: ModelEntry[] = [
  {
    provider: 'openai',
    id: 'gpt-4o',
    alias: 'hanchi-pro',
    label: 'Hanchi Pro',
    capabilities: ['text', 'image_input', 'documents', 'structured_output', 'tool_calling', 'streaming'],
  },
  {
    provider: 'openai',
    id: 'gpt-4o-mini',
    alias: 'hanchi-instant',
    label: 'Hanchi Instant',
    capabilities: ['text', 'image_input', 'documents', 'structured_output', 'tool_calling', 'streaming'],
  },
  {
    provider: 'openai',
    id: 'whisper-1',
    alias: 'hanchi-listen',
    label: 'Hanchi Listen',
    capabilities: ['audio_input', 'video_input'],
  },
  {
    provider: 'openai',
    id: 'gpt-image-1',
    alias: 'hanchi-vision',
    label: 'Hanchi Vision',
    capabilities: ['image_generation'],
  },
  {
    provider: 'anthropic',
    id: 'claude-3-5-sonnet-latest',
    alias: 'hanchi-reason',
    label: 'Hanchi Reason',
    capabilities: ['text', 'image_input', 'documents', 'structured_output', 'tool_calling', 'streaming'],
  },
  {
    provider: 'google',
    id: 'gemini-1.5-pro',
    alias: 'hanchi-context',
    label: 'Hanchi Context',
    capabilities: ['text', 'image_input', 'audio_input', 'video_input', 'documents', 'streaming'],
  },
  {
    provider: 'replicate',
    id: 'stability-ai/sdxl',
    alias: 'hanchi-art',
    label: 'Hanchi Art',
    capabilities: ['image_generation'],
  },
];

/** Legacy UI model names kept working so the frontend contract does not break. */
const LEGACY_ALIASES: Record<string, string> = {
  'gemini-pro': 'hanchi-pro',
  'gemini-flash': 'hanchi-instant',
  'gpt-5': 'hanchi-pro',
  'gpt-5-mini': 'hanchi-instant',
  'gpt-5-nano': 'hanchi-instant',
  'deep-think': 'hanchi-pro',
  'claude': 'hanchi-reason',
  'sdxl': 'hanchi-art',
};

export function providerKey(provider: ProviderName): string | null {
  const names: Record<ProviderName, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GEMINI_API_KEY',
    replicate: 'REPLICATE_API_KEY',
  };
  return Deno.env.get(names[provider]) ?? null;
}

export function isProviderAvailable(provider: ProviderName): boolean {
  return !!providerKey(provider);
}

/**
 * Resolve a model for the requested capabilities. Falls back through the
 * catalogue so a missing provider key never breaks the request path.
 */
export function resolveModel(
  requested: string | undefined,
  capabilities: Capability[],
): ModelEntry {
  const alias = requested ? (LEGACY_ALIASES[requested] || requested) : undefined;

  const supportsAll = (entry: ModelEntry) =>
    capabilities.every((cap) => entry.capabilities.includes(cap));

  if (alias) {
    const exact = MODEL_CATALOGUE.find(
      (entry) => (entry.alias === alias || entry.id === alias) && supportsAll(entry) && isProviderAvailable(entry.provider),
    );
    if (exact) return exact;
  }

  const capable = MODEL_CATALOGUE.find((entry) => supportsAll(entry) && isProviderAvailable(entry.provider));
  if (capable) return capable;

  const anyCapable = MODEL_CATALOGUE.find(supportsAll);
  if (anyCapable) {
    throw new Error(
      `No provider key configured for ${capabilities.join(', ')}. Configure ${anyCapable.provider.toUpperCase()}_API_KEY.`,
    );
  }

  throw new Error(`No model supports the requested capabilities: ${capabilities.join(', ')}`);
}

/** Public, non-secret catalogue for the frontend model selector. */
export function availableModels() {
  return MODEL_CATALOGUE.filter((entry) => isProviderAvailable(entry.provider)).map((entry) => ({
    alias: entry.alias,
    label: entry.label,
    provider: entry.provider,
    capabilities: entry.capabilities,
  }));
}

type ChatArgs = {
  model: ModelEntry;
  messages: RouterMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' };
};

/**
 * Single entry point for chat completions. Every provider is normalized to the
 * OpenAI-style streaming/JSON shape the frontend already understands.
 */
export async function routedChat({
  model,
  messages,
  stream = false,
  maxTokens,
  temperature,
  responseFormat,
}: ChatArgs): Promise<Response> {
  const key = providerKey(model.provider);
  if (!key) throw new Error(`${model.provider} API key is not configured`);

  if (model.provider === 'anthropic') {
    return anthropicChat(key, model, messages, stream, maxTokens, temperature);
  }
  if (model.provider === 'google') {
    return googleChat(key, model, messages, stream, maxTokens, temperature, responseFormat);
  }

  const body: Record<string, unknown> = { model: model.id, messages, stream };
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (temperature !== undefined) body.temperature = temperature;
  if (responseFormat) body.response_format = responseFormat;

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function anthropicChat(
  key: string,
  model: ModelEntry,
  messages: RouterMessage[],
  stream: boolean,
  maxTokens?: number,
  temperature?: number,
): Promise<Response> {
  const system = messages.filter((m) => m.role === 'system').map((m) => String(m.content)).join('\n\n');
  const rest = messages.filter((m) => m.role !== 'system');

  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.id,
      system: system || undefined,
      messages: rest,
      max_tokens: maxTokens ?? 2048,
      temperature,
      stream,
    }),
  });
}

async function googleChat(
  key: string,
  model: ModelEntry,
  messages: RouterMessage[],
  stream: boolean,
  maxTokens?: number,
  temperature?: number,
  responseFormat?: { type: 'json_object' },
): Promise<Response> {
  // Gemini exposes an OpenAI-compatible surface, so the normalized shape holds.
  const body: Record<string, unknown> = { model: model.id, messages, stream };
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (temperature !== undefined) body.temperature = temperature;
  if (responseFormat) body.response_format = responseFormat;

  return fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function routerError(response: Response) {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.message || raw || `Provider request failed (${response.status})`;
  } catch {
    return raw || `Provider request failed (${response.status})`;
  }
}
