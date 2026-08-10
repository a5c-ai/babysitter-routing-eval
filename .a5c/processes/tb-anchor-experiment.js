/**
 * @process tb/anchor-experiment
 * @description Re-judge a fixed task set N times with the current profile, to test whether
 *   tightening a dimension's scoring anchors reduces inter-judge disagreement.
 * @inputs { workspaceDir: string, manifestPath: string, taskIds: string[], judges?: number, chunkSize?: number }
 * @outputs { tasks: number, judges: number }
 *
 * Controlled comparison: only B1 and B5 gained anchor ladders. B3/B6/B8/C2/C4 are
 * unchanged and act as the control group — if their disagreement moves as much as B1/B5's,
 * the difference is run-to-run variation rather than the anchors.
 *
 * Writes to its own run journal. Do NOT merge this run into the production payload: these
 * judgments were produced under a different profile revision.
 */

import { readFileSync } from 'node:fs';
import { judgeTask } from './tb-routing-eval.js';

export async function process(inputs, ctx) {
  const { workspaceDir, manifestPath, taskIds } = inputs;
  const judges = inputs.judges ?? 3;
  const chunkSize = inputs.chunkSize ?? 8;

  const rubric = readFileSync(`${workspaceDir}/babysitter-vs-vanilla-eval.md`, 'utf8');
  const profile = readFileSync(`${workspaceDir}/prompts/tb-profile.md`, 'utf8');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const byId = Object.fromEntries(manifest.tasks.map((t) => [t.id, t]));

  const missing = taskIds.filter((id) => !byId[id]);
  if (missing.length) throw new Error(`unknown task ids: ${missing.join(', ')}`);

  ctx.log('info', `anchor experiment: ${taskIds.length} tasks × ${judges} judges`);

  for (let i = 0; i < taskIds.length; i += chunkSize) {
    const chunk = taskIds.slice(i, i + chunkSize);
    await ctx.parallel.all(
      chunk.flatMap((id) =>
        Array.from({ length: judges }, (_, j) => () =>
          ctx.task(judgeTask, { task: byId[id], rubric, profile, judgeIndex: j }, { label: `x${j}:${id}` }),
        ),
      ),
    );
    ctx.log('info', `judged ${Math.min(i + chunkSize, taskIds.length)}/${taskIds.length}`);
  }

  return { tasks: taskIds.length, judges };
}
