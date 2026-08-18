import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ADAPTERS = new Set([
  'openai-chat',
  'openrouter',
  'anthropic-messages',
  'gemini-interactions',
]);
const OUTPUT_MODES = new Set(['json-schema', 'json-object', 'prompt-only']);
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const ENV_NAME = /^[A-Z_][A-Z0-9_]*$/;
const MODEL_ID = /^[a-z0-9][a-z0-9._-]*$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEnvName(value, label) {
  assert(typeof value === 'string' && ENV_NAME.test(value), `${label} must be an environment-variable name`);
}

function assertSafeUrl(value, label) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  assert(url.protocol === 'https:' || (url.protocol === 'http:' && local), `${label} must use HTTPS (HTTP is allowed only for localhost)`);
  assert(!url.username && !url.password, `${label} must not contain credentials`);
}

function rejectLiteralSecrets(providerId, provider) {
  for (const key of Object.keys(provider)) {
    assert(!/^(apiKey|token|secret|authorization)$/i.test(key), `provider ${providerId}: put credentials in an env var, not ${key}`);
  }
  for (const key of Object.keys(provider.headers ?? {})) {
    assert(!/(authorization|api[-_]?key|token|secret)/i.test(key), `provider ${providerId}: secret header ${key} must use apiKeyEnv or headersFromEnv`);
  }
}

function rejectSecretFields(value, label) {
  if (Array.isArray(value)) return value.forEach((item, index) => rejectSecretFields(item, `${label}[${index}]`));
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    assert(!/(authorization|api[-_]?key|access[-_]?token|secret)/i.test(key), `${label}.${key}: credentials must come from provider environment settings`);
    rejectSecretFields(child, `${label}.${key}`);
  }
}

export function resolveProviderEnvironment(env = process.env) {
  const encoded = env.JUDGE_PROVIDER_ENV_JSON;
  if (!encoded) return env;
  let extra;
  try {
    extra = JSON.parse(encoded);
  } catch {
    throw new Error('JUDGE_PROVIDER_ENV_JSON must be a JSON object');
  }
  assert(isObject(extra), 'JUDGE_PROVIDER_ENV_JSON must be a JSON object');
  for (const [name, value] of Object.entries(extra)) {
    assertEnvName(name, 'JUDGE_PROVIDER_ENV_JSON key');
    assert(typeof value === 'string', `JUDGE_PROVIDER_ENV_JSON.${name} must be a string`);
  }
  return { ...extra, ...env };
}

export async function loadProviderConfig(filePath) {
  const resolvedPath = path.resolve(filePath);
  const parsed = JSON.parse(await readFile(resolvedPath, 'utf8'));
  assert(isObject(parsed.providers), 'config.providers must be an object');
  assert(Array.isArray(parsed.models), 'config.models must be an array');

  for (const [providerId, provider] of Object.entries(parsed.providers)) {
    assert(MODEL_ID.test(providerId), `invalid provider id: ${providerId}`);
    assert(isObject(provider), `provider ${providerId} must be an object`);
    assert(ADAPTERS.has(provider.adapter), `provider ${providerId}: unsupported adapter ${provider.adapter}`);
    rejectLiteralSecrets(providerId, provider);
    if (provider.apiKeyEnv) assertEnvName(provider.apiKeyEnv, `provider ${providerId}.apiKeyEnv`);
    if (provider.baseUrlEnv) assertEnvName(provider.baseUrlEnv, `provider ${providerId}.baseUrlEnv`);
    if (provider.baseUrl) assertSafeUrl(provider.baseUrl, `provider ${providerId}.baseUrl`);
    if (provider.endpoint !== undefined) {
      assert(typeof provider.endpoint === 'string' && provider.endpoint.length > 0, `provider ${providerId}.endpoint must be a relative path`);
      assert(!provider.endpoint.includes('://') && !provider.endpoint.startsWith('//'), `provider ${providerId}.endpoint must be a relative path`);
    }
    assert(isObject(provider.headers ?? {}), `provider ${providerId}.headers must be an object`);
    assert(isObject(provider.headersFromEnv ?? {}), `provider ${providerId}.headersFromEnv must be an object`);
    for (const [header, envName] of Object.entries(provider.headersFromEnv ?? {})) {
      assertEnvName(envName, `provider ${providerId}.headersFromEnv.${header}`);
    }
  }

  const seen = new Set();
  for (const model of parsed.models) {
    assert(isObject(model), 'every model entry must be an object');
    assert(typeof model.id === 'string' && MODEL_ID.test(model.id), `invalid model id: ${model.id}`);
    assert(!seen.has(model.id), `duplicate model id: ${model.id}`);
    seen.add(model.id);
    assert(parsed.providers[model.provider], `model ${model.id}: unknown provider ${model.provider}`);
    assert(typeof model.model === 'string' && model.model.trim(), `model ${model.id}: model is required`);
    const mode = model.structuredOutput ?? parsed.providers[model.provider].structuredOutput ?? 'json-schema';
    assert(OUTPUT_MODES.has(mode), `model ${model.id}: unsupported structuredOutput ${mode}`);
    if (model.concurrency !== undefined) {
      assert(Number.isInteger(model.concurrency) && model.concurrency > 0 && model.concurrency <= 32, `model ${model.id}: concurrency must be 1..32`);
    }
    if (model.timeoutMs !== undefined) {
      assert(Number.isInteger(model.timeoutMs) && model.timeoutMs >= 1000, `model ${model.id}: timeoutMs must be an integer of at least 1000`);
    }
    if (model.enabled !== undefined) assert(typeof model.enabled === 'boolean', `model ${model.id}: enabled must be boolean`);
    assert(isObject(model.request ?? {}), `model ${model.id}.request must be an object`);
    rejectSecretFields(model.request ?? {}, `model ${model.id}.request`);
  }

  const thresholds = parsed.thresholds ?? { low: -31, high: 4 };
  assert(Number.isFinite(thresholds.low) && Number.isFinite(thresholds.high) && thresholds.low < thresholds.high, 'thresholds must have numeric low < high');
  const maxRetries = parsed.maxRetries ?? 4;
  const timeoutMs = parsed.timeoutMs ?? 300_000;
  assert(Number.isInteger(maxRetries) && maxRetries >= 0 && maxRetries <= 10, 'maxRetries must be an integer from 0 to 10');
  assert(Number.isInteger(timeoutMs) && timeoutMs >= 1000, 'timeoutMs must be an integer of at least 1000');

  return { ...parsed, thresholds, maxRetries, timeoutMs, path: resolvedPath };
}

export function selectModels(config, ids = []) {
  const selected = ids.length
    ? ids.map((id) => {
        const model = config.models.find((candidate) => candidate.id === id);
        assert(model, `unknown model id: ${id}`);
        return model;
      })
    : config.models.filter((model) => model.enabled !== false);
  assert(selected.length > 0, 'no models selected');
  return selected;
}

function defaultBaseUrl(adapter) {
  if (adapter === 'openrouter') return 'https://openrouter.ai/api/v1';
  if (adapter === 'anthropic-messages') return 'https://api.anthropic.com';
  if (adapter === 'gemini-interactions') return 'https://generativelanguage.googleapis.com/v1beta';
  return null;
}

function defaultEndpoint(adapter) {
  if (adapter === 'openai-chat') return 'v1/chat/completions';
  if (adapter === 'openrouter') return 'chat/completions';
  if (adapter === 'anthropic-messages') return 'v1/messages';
  if (adapter === 'gemini-interactions') return 'interactions';
  throw new Error(`unsupported adapter ${adapter}`);
}

function joinUrl(baseUrl, endpoint) {
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}

function endpointFor(adapter, baseUrl, explicitEndpoint) {
  if (explicitEndpoint) return explicitEndpoint;
  if (adapter === 'openai-chat' && /\/v1\/?$/.test(new URL(baseUrl).pathname)) {
    return 'chat/completions';
  }
  return defaultEndpoint(adapter);
}

export function strictOutputSchema(schema) {
  if (!isObject(schema)) return schema;
  if (schema.type === 'object') {
    const properties = Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([key, value]) => [key, strictOutputSchema(value)]),
    );
    return { ...schema, properties, required: Object.keys(properties), additionalProperties: false };
  }
  if (schema.type === 'array') return { ...schema, items: strictOutputSchema(schema.items) };
  return schema;
}

function assertRequestKeys(model, reserved) {
  const clashes = Object.keys(model.request ?? {}).filter((key) => reserved.includes(key));
  assert(!clashes.length, `model ${model.id}: request cannot override ${clashes.join(', ')}`);
}

export function buildProviderRequest({ config, model, prompt, schema, env = process.env }) {
  env = resolveProviderEnvironment(env);
  const provider = config.providers[model.provider];
  assert(provider, `unknown provider ${model.provider}`);
  const adapter = provider.adapter;
  const baseUrl = (provider.baseUrlEnv && env[provider.baseUrlEnv]) || provider.baseUrl || defaultBaseUrl(adapter);
  assert(baseUrl, `provider ${model.provider}: set baseUrl or ${provider.baseUrlEnv ?? 'baseUrlEnv'}`);
  assertSafeUrl(baseUrl, `provider ${model.provider} base URL`);
  const apiKey = provider.apiKeyEnv ? env[provider.apiKeyEnv] : null;
  if (provider.apiKeyEnv) assert(apiKey, `provider ${model.provider}: missing ${provider.apiKeyEnv}`);

  const headers = { 'content-type': 'application/json', ...(provider.headers ?? {}) };
  for (const [header, envName] of Object.entries(provider.headersFromEnv ?? {})) {
    assert(env[envName], `provider ${model.provider}: missing ${envName}`);
    headers[header] = env[envName];
  }
  const outputMode = model.structuredOutput ?? provider.structuredOutput ?? 'json-schema';
  if (outputMode === 'json-schema') assert(isObject(schema), `model ${model.id}: json-schema mode requires an output schema`);
  const outputSchema = strictOutputSchema(schema);
  const request = model.request ?? {};
  let body;

  if (adapter === 'openai-chat' || adapter === 'openrouter') {
    assertRequestKeys(model, ['model', 'messages', 'response_format', 'stream']);
    if (apiKey) headers.authorization = `Bearer ${apiKey}`;
    body = { model: model.model, messages: [{ role: 'user', content: prompt }], ...request };
    if (outputMode === 'json-schema') {
      body.response_format = {
        type: 'json_schema',
        json_schema: { name: 'routing_judgment', strict: true, schema: outputSchema },
      };
    } else if (outputMode === 'json-object') {
      body.response_format = { type: 'json_object' };
    }
  } else if (adapter === 'anthropic-messages') {
    assertRequestKeys(model, ['model', 'messages', 'stream']);
    assert(outputMode !== 'json-object', `model ${model.id}: Anthropic does not use json-object mode`);
    if (apiKey) headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = provider.apiVersion ?? '2023-06-01';
    const { output_config: outputConfig = {}, ...anthropicRequest } = request;
    assert(isObject(outputConfig), `model ${model.id}: request.output_config must be an object`);
    assert(!('format' in outputConfig), `model ${model.id}: request.output_config.format is managed by structuredOutput`);
    body = {
      model: model.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      ...anthropicRequest,
    };
    if (outputMode === 'json-schema') {
      body.output_config = {
        ...outputConfig,
        format: { type: 'json_schema', schema: outputSchema },
      };
    } else if (Object.keys(outputConfig).length) {
      body.output_config = outputConfig;
    }
  } else if (adapter === 'gemini-interactions') {
    assertRequestKeys(model, ['model', 'input', 'response_format', 'stream']);
    assert(outputMode !== 'json-object', `model ${model.id}: Gemini does not use json-object mode`);
    if (apiKey) headers['x-goog-api-key'] = apiKey;
    body = { model: model.model, input: prompt, ...request };
    if (outputMode === 'json-schema') {
      body.response_format = { type: 'text', mime_type: 'application/json', schema: outputSchema };
    }
  }

  return {
    url: joinUrl(baseUrl, endpointFor(adapter, baseUrl, provider.endpoint)),
    headers,
    body,
    adapter,
    providerId: model.provider,
  };
}

function openAiText(response) {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter((part) => part.type === 'text').map((part) => part.text).join('');
  throw new Error('provider response did not contain choices[0].message.content');
}

function anthropicText(response) {
  const text = response.content?.filter((part) => part.type === 'text').map((part) => part.text).join('');
  if (!text) throw new Error('Anthropic response did not contain a text block');
  return text;
}

function geminiText(response) {
  if (typeof response.output_text === 'string') return response.output_text;
  const steps = [...(response.steps ?? [])].reverse();
  for (const step of steps) {
    if (step.type !== 'model_output') continue;
    const text = step.content?.filter((part) => part.type === 'text').map((part) => part.text).join('');
    if (text) return text;
  }
  throw new Error('Gemini response did not contain model-output text');
}

export function parseProviderResponse({ adapter, providerId, requestedModel, response }) {
  let text;
  let finishReason = null;
  if (adapter === 'openai-chat' || adapter === 'openrouter') {
    text = openAiText(response);
    finishReason = response.choices?.[0]?.finish_reason ?? null;
  } else if (adapter === 'anthropic-messages') {
    text = anthropicText(response);
    finishReason = response.stop_reason ?? null;
  } else if (adapter === 'gemini-interactions') {
    text = geminiText(response);
    finishReason = response.status ?? null;
  } else {
    throw new Error(`unsupported adapter ${adapter}`);
  }
  return {
    text,
    metadata: {
      provider: providerId,
      adapter,
      requestedModel,
      responseModel: response.model ?? null,
      finishReason,
      usage: response.usage ?? response.usageMetadata ?? null,
      requestId: response.id ?? null,
    },
  };
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get?.('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, 60_000);
    const at = Date.parse(retryAfter);
    if (Number.isFinite(at)) return Math.min(Math.max(at - Date.now(), 0), 60_000);
  }
  return Math.min(1000 * 2 ** attempt, 15_000) + Math.floor(Math.random() * 250);
}

function safeErrorMessage(body, status, env) {
  const raw = body?.error?.message ?? body?.message ?? `HTTP ${status}`;
  let safe = String(raw)
    .replace(/\b(sk|key|token)-[A-Za-z0-9._-]{8,}\b/gi, '[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
  for (const [name, value] of Object.entries(env)) {
    if (/(key|token|secret|authorization)/i.test(name) && typeof value === 'string' && value.length >= 4) {
      safe = safe.split(value).join('[REDACTED]');
    }
  }
  return safe.slice(0, 500);
}

export async function requestProvider({
  config,
  model,
  prompt,
  schema,
  env = process.env,
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  env = resolveProviderEnvironment(env);
  const request = buildProviderRequest({ config, model, prompt, schema, env });
  const maxRetries = config.maxRetries ?? 4;
  const timeoutMs = model.timeoutMs ?? config.timeoutMs ?? 300_000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        return parseProviderResponse({
          adapter: request.adapter,
          providerId: request.providerId,
          requestedModel: model.model,
          response: body,
        });
      }
      if (!RETRYABLE_STATUS.has(response.status) || attempt === maxRetries) {
        throw new Error(`${model.provider}/${model.model}: ${safeErrorMessage(body, response.status, env)}`);
      }
    } catch (error) {
      if (error.message?.startsWith(`${model.provider}/${model.model}:`)) throw error;
      if (attempt === maxRetries) {
        const message = error.name === 'AbortError' ? `timed out after ${timeoutMs}ms` : error.message;
        throw new Error(`${model.provider}/${model.model}: ${safeErrorMessage({ message }, 'network error', env)}`);
      }
    } finally {
      clearTimeout(timer);
    }
    await sleep(retryDelay(response, attempt));
  }
  throw new Error(`${model.provider}/${model.model}: request failed`);
}
