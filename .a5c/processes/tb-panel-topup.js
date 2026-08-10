/**
 * @process tb/panel-topup
 * @description Add the two extra panel judges for tasks that landed in the borderline band
 *   only after a rubric change, so every borderline task is decided by three judges.
 * @inputs { workspaceDir: string, manifestPath: string, taskIds: string[], chunkSize?: number }
 * @outputs { judged: number, taskIds: string[] }
 *
 * Reuses judgeTask from tb-routing-eval.js unchanged, so the panel judges see exactly the
 * prompt the original judges saw. Results land in this run's journal and are merged by
 * scripts/recompute-payload.mjs, which accepts several run directories.
 */

import { readFileSync } from 'node:fs';
import { judgeTask } from './tb-routing-eval.js';

export async function process(inputs, ctx) {
  const { workspaceDir, manifestPath, taskIds } = inputs;
  const chunkSize = inputs.chunkSize ?? 8;

  const rubric = readFileSync(`${workspaceDir}/babysitter-vs-vanilla-eval.md`, 'utf8');
  const profile = readFileSync(`${workspaceDir}/prompts/tb-profile.md`, 'utf8');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const byId = Object.fromEntries(manifest.tasks.map((t) => [t.id, t]));

  const missing = taskIds.filter((id) => !byId[id]);
  if (missing.length) throw new Error(`unknown task ids: ${missing.join(', ')}`);

  ctx.log('info', `panel top-up for ${taskIds.length} task(s), 2 extra judges each`);

  for (let i = 0; i < taskIds.length; i += chunkSize) {
    const chunk = taskIds.slice(i, i + chunkSize);
    await ctx.parallel.all(
      chunk.flatMap((id) => [
        () => ctx.task(judgeTask, { task: byId[id], rubric, profile, judgeIndex: 1 }, { label: `panel1:${id}` }),
        () => ctx.task(judgeTask, { task: byId[id], rubric, profile, judgeIndex: 2 }, { label: `panel2:${id}` }),
      ]),
    );
    ctx.log('info', `panelled ${Math.min(i + chunkSize, taskIds.length)}/${taskIds.length}`);
  }

  return { judged: taskIds.length, taskIds };
}
