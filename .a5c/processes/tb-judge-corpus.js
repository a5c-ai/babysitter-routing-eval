/**
 * @process tb/judge-corpus
 * @description Run the primary routing judge once across the complete Terminal-Bench corpus.
 * @inputs { workspaceDir: string, manifestPath?: string, chunkSize?: number,
 *           model?: string, effort?: string }
 * @outputs { judged: number, taskIds: string[], model: string, effort: string }
 *
 * This is the judge-only counterpart to tb/routing-eval: no smoke duplicate, threshold
 * breakpoint, panel, or report. Results remain journaled in the same format and can be
 * materialized with scripts/recompute-payload.mjs.
 */

import { readFileSync } from 'node:fs';
import { judgeTask } from './tb-routing-eval.js';

export async function process(inputs, ctx) {
  const { workspaceDir } = inputs;
  const manifestPath = inputs.manifestPath ?? `${workspaceDir}/out/manifest.json`;
  const chunkSize = inputs.chunkSize ?? 8;
  const model = inputs.model ?? 'gpt-5.6-sol';
  const effort = inputs.effort ?? 'high';

  const rubric = readFileSync(`${workspaceDir}/babysitter-vs-vanilla-eval.md`, 'utf8');
  const profile = readFileSync(`${workspaceDir}/prompts/tb-profile.md`, 'utf8');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const taskIds = manifest.tasks.map((task) => task.id);

  ctx.log('info', `judging ${taskIds.length} tasks with model=${model}, effort=${effort}`);

  for (let i = 0; i < manifest.tasks.length; i += chunkSize) {
    const chunk = manifest.tasks.slice(i, i + chunkSize);
    await ctx.parallel.map(chunk, (task) =>
      ctx.task(
        judgeTask,
        { task, rubric, profile, judgeIndex: 0, model, effort },
        { label: `judge:${task.id}` },
      ),
    );
    ctx.log('info', `judged ${Math.min(i + chunkSize, taskIds.length)}/${taskIds.length}`);
  }

  return { judged: taskIds.length, taskIds, model, effort };
}
