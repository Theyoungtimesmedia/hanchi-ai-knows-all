const OPENAI_API_URL = 'https://api.openai.com/v1';

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: unknown;
};

type ChatCompletionOptions = {
  apiKey: string;
  model?: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' };
};

export async function openAIChatCompletion({
  apiKey,
  model = 'gpt-4o-mini',
  messages,
  stream = false,
  maxTokens,
  temperature,
  responseFormat,
}: ChatCompletionOptions) {
  const body: Record<string, unknown> = { model, messages, stream };
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (temperature !== undefined) body.temperature = temperature;
  if (responseFormat) body.response_format = responseFormat;

  return fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function openAITranscription({
  apiKey,
  bytes,
  mimeType,
  fileName,
  language,
}: {
  apiKey: string;
  bytes: Uint8Array;
  mimeType: string;
  fileName: string;
  language?: string;
}) {
  const formData = new FormData();
  formData.append('file', new File([bytes], fileName, { type: mimeType }));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  if (language && language !== 'auto' && language.length === 2) {
    formData.append('language', language === 'pid' ? 'en' : language);
  }

  return fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });
}

export async function getProviderError(response: Response) {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.message || raw || `Provider request failed (${response.status})`;
  } catch {
    return raw || `Provider request failed (${response.status})`;
  }
}