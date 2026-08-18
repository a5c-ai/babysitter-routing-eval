#!/usr/bin/env node

import { appendFile } from 'node:fs/promises';
import { buildProviderRequest, loadProviderConfig, selectModels } from './provider-client.mjs';

const args = process.argv.slice(2);
const configPath = args[0];
if (!configPath) {
  throw new Error('usage: node scripts/provider-config.mjs <config.json> [--models a,b] [--check-env] [--matrix] [--github-output <file>]');
}
const flag = (name, fallback = null) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

const config = await loadProviderConfig(configPath);
const ids = String(flag('models', ''))
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const models = selectModels(config, ids);

if (has('check-env')) {
  for (const model of models) {
    buildProviderRequest({
      config,
      model,
      prompt: 'configuration check',
      schema: { type: 'object', properties: {}, required: [] },
    });
  }
}

const matrix = models.map((model) => ({
  modelId: model.id,
  concurrency: model.concurrency ?? 4,
}));
const githubOutput = flag('github-output');
if (githubOutput) {
  await appendFile(githubOutput, `matrix=${JSON.stringify(matrix)}\n`);
} else if (has('matrix')) {
  process.stdout.write(`${JSON.stringify(matrix)}\n`);
} else {
  process.stdout.write(
    `${models.map((model) => `${model.id}\t${model.provider}\t${model.model}`).join('\n')}\n`,
  );
}
