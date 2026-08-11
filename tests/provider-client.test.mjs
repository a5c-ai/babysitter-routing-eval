import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildProviderRequest,
  loadProviderConfig,
  parseProviderResponse,
  requestProvider,
  resolveProviderEnvironment,
} from '../scripts/provider-client.mjs';

const schema = {
  type: 'object',
  required: ['taskId'],
  properties: { taskId: { type: 'string' }, rationale: { type: 'string' } },
};

function config(adapter, provider = {}) {
  return {
    providers: { test: { adapter, apiKeyEnv: 'TEST_API_KEY', ...provider } },
    models: [],
    thresholds: { low: -31, high: 4 },
  };
}

const model = (overrides = {}) => ({
  id: 'judge', provider: 'test', model: 'vendor/model',
  structuredOutput: 'json-schema', request: {}, ...overrides,
});

test('OpenAI-compatible adapter sends model and JSON schema to chat completions', () => {
  const request = buildProviderRequest({
    config: config('openai-chat', { baseUrl: 'https://gateway.example' }),
    model: model({ request: { temperature: 0 } }), prompt: 'judge this task', schema,
    env: { TEST_API_KEY: 'secret' },
  });
  assert.equal(request.url, 'https://gateway.example/v1/chat/completions');
  assert.equal(request.headers.authorization, 'Bearer secret');
  assert.equal(request.body.model, 'vendor/model');
  assert.equal(request.body.messages[0].content, 'judge this task');
  assert.equal(request.body.temperature, 0);
  assert.equal(request.body.response_format.type, 'json_schema');
  assert.deepEqual(request.body.response_format.json_schema.schema.required, ['taskId', 'rationale']);
  assert.equal(request.body.response_format.json_schema.schema.additionalProperties, false);
});

test('OpenRouter adapter keeps provider-routing options in the OpenRouter payload', () => {
  const request = buildProviderRequest({
    config: config('openrouter'),
    model: model({ request: { provider: { order: ['Together'], require_parameters: true } } }),
    prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' },
  });
  assert.equal(request.url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.deepEqual(request.body.provider, { order: ['Together'], require_parameters: true });
  assert.equal(request.body.response_format.json_schema.strict, true);
});

test('OpenAI-compatible base URLs ending in v1 do not duplicate the version segment', () => {
  const request = buildProviderRequest({
    config: config('openai-chat', { baseUrl: 'https://gateway.example/v1' }),
    model: model(), prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' },
  });
  assert.equal(request.url, 'https://gateway.example/v1/chat/completions');
});

test('Anthropic adapter uses Messages output_config.format', () => {
  const request = buildProviderRequest({
    config: config('anthropic-messages'),
    model: model({
      model: 'claude-model',
      request: { max_tokens: 2048, output_config: { effort: 'high' } },
    }),
    prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' },
  });
  assert.equal(request.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(request.headers['x-api-key'], 'secret');
  assert.equal(request.headers['anthropic-version'], '2023-06-01');
  assert.equal(request.body.max_tokens, 2048);
  assert.equal(request.body.output_config.effort, 'high');
  assert.equal(request.body.output_config.format.type, 'json_schema');
  assert.deepEqual(request.body.output_config.format.schema.required, ['taskId', 'rationale']);
});

test('Gemini adapter uses the Interactions structured-output payload', () => {
  const request = buildProviderRequest({
    config: config('gemini-interactions'), model: model({ model: 'gemini-model' }),
    prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' },
  });
  assert.equal(request.url, 'https://generativelanguage.googleapis.com/v1beta/interactions');
  assert.equal(request.headers['x-goog-api-key'], 'secret');
  assert.equal(request.body.response_format.type, 'text');
  assert.equal(request.body.response_format.mime_type, 'application/json');
  assert.deepEqual(request.body.response_format.schema.required, ['taskId', 'rationale']);
});

test('response parsers preserve only useful model metadata', () => {
  const openai = parseProviderResponse({
    adapter: 'openrouter', providerId: 'router', requestedModel: 'vendor/model',
    response: {
      id: 'request-1', model: 'resolved/model',
      choices: [{ finish_reason: 'stop', message: { content: '{"taskId":"a"}' } }],
      usage: { total_tokens: 42 },
    },
  });
  assert.equal(openai.text, '{"taskId":"a"}');
  assert.deepEqual(openai.metadata, {
    provider: 'router', adapter: 'openrouter', requestedModel: 'vendor/model',
    responseModel: 'resolved/model', finishReason: 'stop', usage: { total_tokens: 42 },
    requestId: 'request-1',
  });
  assert.equal(parseProviderResponse({
    adapter: 'anthropic-messages', providerId: 'a', requestedModel: 'm',
    response: { content: [{ type: 'text', text: '{"ok":true}' }] },
  }).text, '{"ok":true}');
  assert.equal(parseProviderResponse({
    adapter: 'gemini-interactions', providerId: 'g', requestedModel: 'm',
    response: { steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"ok":true}' }] }] },
  }).text, '{"ok":true}');
});

test('generic secret JSON adds arbitrary provider environment variables', () => {
  const env = resolveProviderEnvironment({
    JUDGE_PROVIDER_ENV_JSON: '{"MISTRAL_API_KEY":"secret","MISTRAL_BASE_URL":"https://mistral.example"}',
  });
  assert.equal(env.MISTRAL_API_KEY, 'secret');
  assert.equal(env.MISTRAL_BASE_URL, 'https://mistral.example');
});

test('config rejects literal credentials', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'provider-config-'));
  const file = path.join(dir, 'config.json');
  await writeFile(file, JSON.stringify({
    providers: { unsafe: { adapter: 'openai-chat', baseUrl: 'https://example.com', apiKey: 'secret' } },
    models: [],
  }));
  await assert.rejects(loadProviderConfig(file), /put credentials in an env var/);
  await rm(dir, { recursive: true });
});

test('request retries rate limits and honors a valid response', async () => {
  let calls = 0;
  const sleeps = [];
  const fetchImpl = async () => {
    calls++;
    if (calls === 1) return {
      ok: false, status: 429, headers: { get: () => '0' },
      json: async () => ({ error: { message: 'rate limited' } }),
    };
    return {
      ok: true, status: 200, headers: { get: () => null },
      json: async () => ({ choices: [{ message: { content: '{"taskId":"a"}' } }] }),
    };
  };
  const result = await requestProvider({
    config: { ...config('openai-chat', { baseUrl: 'https://gateway.example' }), maxRetries: 2 },
    model: model(), prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' }, fetchImpl,
    sleep: async (ms) => sleeps.push(ms),
  });
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [0]);
  assert.equal(result.text, '{"taskId":"a"}');
});

test('provider errors redact key-like values', async () => {
  const fetchImpl = async () => ({
    ok: false, status: 401, headers: { get: () => null },
    json: async () => ({ error: { message: 'bad key sk-abcdefghijk' } }),
  });
  await assert.rejects(
    requestProvider({
      config: config('openai-chat', { baseUrl: 'https://gateway.example' }),
      model: model(), prompt: 'judge', schema, env: { TEST_API_KEY: 'secret' }, fetchImpl,
    }),
    (error) => error.message.includes('[REDACTED]') && !error.message.includes('abcdefghijk'),
  );
});
