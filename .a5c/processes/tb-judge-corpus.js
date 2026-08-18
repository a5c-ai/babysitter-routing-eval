/**
 * @process tb/judge-corpus
 * @description Run the primary routing judge once across Terminal-Bench tasks.
 * @inputs { workspaceDir: string, manifestPath?: string, chunkSize?: number,
 *           model?: string, effort?: string, modelId?: string, taskIds?: string[] }
 * @outputs { judged: number, taskIds: string[], model: string, effort: string,
 *            modelId: string }
 *
 * This is the judge-only counterpart to tb/routing-eval: no Terminal-Bench task execution,
 * smoke duplicate, threshold breakpoint, panel, or report. Results remain journaled in the
 * same format and can be materialized with scripts/recompute-payload.mjs.
 */

import { readFileSync } from 'node:fs';
import { judgeTask } from './tb-routing-eval.js';

export async function process(inputs, ctx) {
  const { workspaceDir } = inputs;
  if (!workspaceDir) throw new Error('workspaceDir is required');

  const manifestPath = inputs.manifestPath ?? `${workspaceDir}/out/manifest.json`;
  const chunkSize = inputs.chunkSize ?? 8;
  const model = inputs.model ?? inputs.modelId ?? 'gpt-5.6-sol';
  const effort = inputs.effort ?? 'high';
  const modelId = inputs.modelId ?? model;
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 32) {
    throw new Error('chunkSize must be an integer from 1 to 32');
  }

  const rubric = readFileSync(`${workspaceDir}/babysitter-vs-vanilla-eval.md`, 'utf8');
  const profile = readFileSync(`${workspaceDir}/prompts/tb-profile.md`, 'utf8');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const byId = new Map(manifest.tasks.map((task) => [task.id, task]));
  const requestedIds = inputs.taskIds ?? manifest.tasks.map((task) => task.id);
  const unknown = requestedIds.filter((id) => !byId.has(id));
  if (unknown.length) throw new Error(`unknown task ids: ${unknown.join(', ')}`);
  const tasks = requestedIds.map((id) => byId.get(id));

  ctx.log(
    'info',
    `judging ${tasks.length} routing decisions with modelId=${modelId}, model=${model}, effort=${effort}`,
  );
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    await ctx.parallel.map(chunk, (task) =>
      ctx.task(
        judgeTask,
        { task, rubric, profile, judgeIndex: 0, model, effort },
        { label: `judge:${task.id}` },
      ),
    );
    ctx.log('info', `judged ${Math.min(i + chunkSize, tasks.length)}/${tasks.length}`);
  }

  return {
    judged: tasks.length,
    taskIds: tasks.map((task) => task.id),
    model,
    effort,
    modelId,
  };
}
