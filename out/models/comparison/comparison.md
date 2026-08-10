# Multi-model routing comparison

Corpus: 163 tasks · models: 2 · unanimous: 127/163 (77.9%) · awaiting a third judge: 36

## Judge protocol

| model | source | verdict mode | notes |
|---|---|---|---|
| Opus 5 | `out/models/opus-5/payload.json` | primary-score | Primary judge from the existing Opus 5 run; the published report additionally panels borderline tasks. |
| GPT-5.6-sol | `out/models/gpt-5.6-sol/payload.json` | primary-score | One primary judgment per task, effort high, using the identical rubric and Terminal-Bench profile. |

The comparison uses each model's primary `net_live` score and the shared thresholds. The original published Opus report remains unchanged and may use its panel verdict for borderline tasks.

## Recommendation counts

| model | babysitter | borderline | vanilla | mean net_live |
|---|---:|---:|---:|---:|
| Opus 5 | 58 | 65 | 40 | 9.4 |
| GPT-5.6-sol | 62 | 61 | 40 | 11.3 |

## Pairwise verdict agreement

| | Opus 5 | GPT-5.6-sol |
|---|---:|---:|
| Opus 5 | 163/163 (100%) | 127/163 (77.9%) |
| GPT-5.6-sol | 127/163 (77.9%) | 163/163 (100%) |

## Tasks

| task | Opus 5 | GPT-5.6-sol | consensus | agreement |
|---|---|---|---|---:|
| tb2.1__adaptive-rejection-sampler | babysitter (41.6) | babysitter (41.6) | babysitter | 2/2 |
| tb2.1__bn-fit-modify | babysitter (63.2) | babysitter (31.8) | babysitter | 2/2 |
| tb2.1__break-filter-js-from-html | vanilla (-67.1) | vanilla (-67.1) | vanilla | 2/2 |
| tb2.1__build-cython-ext | vanilla (-24.7) | borderline (-8.6) | needs-third-judge | 1/2 |
| tb2.1__build-pmars | borderline (16.9) | borderline (7.8) | borderline | 2/2 |
| tb2.1__build-pov-ray | borderline (10.7) | borderline (-2.1) | borderline | 2/2 |
| tb2.1__caffe-cifar-10 | babysitter (22.2) | babysitter (28.3) | babysitter | 2/2 |
| tb2.1__cancel-async-tasks | borderline (11.1) | borderline (4) | borderline | 2/2 |
| tb2.1__chess-best-move | borderline (-12.3) | borderline (-6.5) | borderline | 2/2 |
| tb2.1__circuit-fibsqrt | babysitter (40.2) | babysitter (49.2) | babysitter | 2/2 |
| tb2.1__cobol-modernization | vanilla (-29.9) | vanilla (-38.1) | vanilla | 2/2 |
| tb2.1__code-from-image | vanilla (-18.4) | vanilla (-29.3) | vanilla | 2/2 |
| tb2.1__compile-compcert | borderline (2.1) | vanilla (-16.5) | needs-third-judge | 1/2 |
| tb2.1__configure-git-webserver | vanilla (-39.9) | vanilla (-16.7) | vanilla | 2/2 |
| tb2.1__constraints-scheduling | vanilla (-22.4) | vanilla (-16.7) | vanilla | 2/2 |
| tb2.1__count-dataset-tokens | borderline (2.1) | vanilla (-16.5) | needs-third-judge | 1/2 |
| tb2.1__crack-7z-hash | vanilla (-54.2) | vanilla (-54.2) | vanilla | 2/2 |
| tb2.1__custom-memory-heap-crash | vanilla (-65.1) | vanilla (-47.9) | vanilla | 2/2 |
| tb2.1__db-wal-recovery | vanilla (-53.6) | vanilla (-20.7) | vanilla | 2/2 |
| tb2.1__distribution-search | borderline (11.1) | borderline (6.9) | borderline | 2/2 |
| tb2.1__dna-assembly | babysitter (21.1) | babysitter (32.6) | babysitter | 2/2 |
| tb2.1__dna-insert | borderline (13.6) | borderline (-5) | borderline | 2/2 |
| tb2.1__extract-elf | vanilla (-32.2) | vanilla (-16.5) | vanilla | 2/2 |
| tb2.1__extract-moves-from-video | borderline (11.1) | babysitter (31.2) | needs-third-judge | 1/2 |
| tb2.1__feal-differential-cryptanalysis | borderline (15.9) | borderline (14.6) | borderline | 2/2 |
| tb2.1__feal-linear-cryptanalysis | borderline (16.3) | babysitter (23.2) | needs-third-judge | 1/2 |
| tb2.1__filter-js-from-html | borderline (-0.8) | borderline (-9.4) | borderline | 2/2 |
| tb2.1__financial-document-processor | borderline (6.7) | borderline (12.4) | borderline | 2/2 |
| tb2.1__fix-code-vulnerability | vanilla (-20.3) | vanilla (-18.8) | vanilla | 2/2 |
| tb2.1__fix-git | vanilla (-58.4) | vanilla (-58.4) | vanilla | 2/2 |
| tb2.1__fix-ocaml-gc | borderline (-4) | borderline (4.6) | borderline | 2/2 |
| tb2.1__gcode-to-text | vanilla (-22.2) | vanilla (-33.7) | vanilla | 2/2 |
| tb2.1__git-leak-recovery | borderline (10.7) | borderline (-2.1) | borderline | 2/2 |
| tb2.1__git-multibranch | babysitter (42) | babysitter (46.2) | babysitter | 2/2 |
| tb2.1__gpt2-codegolf | babysitter (40.6) | babysitter (60.7) | babysitter | 2/2 |
| tb2.1__headless-terminal | borderline (-10.3) | babysitter (22.6) | needs-third-judge | 1/2 |
| tb2.1__hf-model-inference | vanilla (-29.9) | vanilla (-16.7) | vanilla | 2/2 |
| tb2.1__install-windows-3.11 | babysitter (56.3) | babysitter (43.5) | babysitter | 2/2 |
| tb2.1__kv-store-grpc | vanilla (-21.3) | vanilla (-15.5) | vanilla | 2/2 |
| tb2.1__large-scale-text-editing | borderline (-3.6) | vanilla (-21.8) | needs-third-judge | 1/2 |
| tb2.1__largest-eigenval | borderline (-7.9) | vanilla (-16.5) | needs-third-judge | 1/2 |
| tb2.1__llm-inference-batching-scheduler | borderline (15.3) | borderline (-3.3) | borderline | 2/2 |
| tb2.1__log-summary-date-ranges | borderline (-7.7) | borderline (-7.7) | borderline | 2/2 |
| tb2.1__mailman | borderline (14.4) | borderline (5.4) | borderline | 2/2 |
| tb2.1__make-doom-for-mips | borderline (8.8) | borderline (3.1) | borderline | 2/2 |
| tb2.1__make-mips-interpreter | babysitter (24.9) | babysitter (24.9) | babysitter | 2/2 |
| tb2.1__mcmc-sampling-stan | babysitter (46) | babysitter (31.2) | babysitter | 2/2 |
| tb2.1__merge-diff-arc-agi-task | vanilla (-39.9) | vanilla (-28) | vanilla | 2/2 |
| tb2.1__model-extraction-relu-logits | vanilla (-18.4) | borderline (14.6) | needs-third-judge | 1/2 |
| tb2.1__modernize-scientific-stack | vanilla (-15.1) | borderline (4.2) | needs-third-judge | 1/2 |
| tb2.1__mteb-leaderboard | vanilla (-39.9) | vanilla (-27) | vanilla | 2/2 |
| tb2.1__mteb-retrieve | vanilla (-35.6) | vanilla (-35.6) | vanilla | 2/2 |
| tb2.1__multi-source-data-merger | borderline (6.7) | borderline (12.4) | borderline | 2/2 |
| tb2.1__nginx-request-logging | vanilla (-16.7) | vanilla (-16.7) | vanilla | 2/2 |
| tb2.1__openssl-selfsigned-cert | vanilla (-21.3) | vanilla (-21.3) | vanilla | 2/2 |
| tb2.1__overfull-hbox | borderline (-9.4) | borderline (-13.6) | borderline | 2/2 |
| tb2.1__password-recovery | vanilla (-20.3) | vanilla (-17.4) | vanilla | 2/2 |
| tb2.1__path-tracing | borderline (3.1) | borderline (-6.9) | borderline | 2/2 |
| tb2.1__path-tracing-reverse | borderline (-14.6) | vanilla (-21.6) | needs-third-judge | 1/2 |
| tb2.1__polyglot-c-py | vanilla (-44.3) | vanilla (-33.9) | vanilla | 2/2 |
| tb2.1__polyglot-rust-c | borderline (2.5) | borderline (14) | borderline | 2/2 |
| tb2.1__portfolio-optimization | babysitter (25.5) | babysitter (38.7) | babysitter | 2/2 |
| tb2.1__protein-assembly | borderline (8.2) | borderline (18.6) | borderline | 2/2 |
| tb2.1__prove-plus-comm | vanilla (-35.6) | vanilla (-29.9) | vanilla | 2/2 |
| tb2.1__pypi-server | borderline (1) | borderline (6.7) | borderline | 2/2 |
| tb2.1__pytorch-model-cli | vanilla (-16.5) | borderline (-6.5) | needs-third-judge | 1/2 |
| tb2.1__pytorch-model-recovery | vanilla (-28.4) | vanilla (-32.6) | vanilla | 2/2 |
| tb2.1__qemu-alpine-ssh | borderline (2.1) | borderline (7.8) | borderline | 2/2 |
| tb2.1__qemu-startup | borderline (-3.6) | borderline (2.1) | borderline | 2/2 |
| tb2.1__query-optimize | borderline (5) | vanilla (-32.2) | needs-third-judge | 1/2 |
| tb2.1__raman-fitting | vanilla (-25.3) | vanilla (-43.9) | vanilla | 2/2 |
| tb2.1__regex-chess | babysitter (53.4) | babysitter (71.1) | babysitter | 2/2 |
| tb2.1__regex-log | borderline (-0.8) | borderline (-9.4) | borderline | 2/2 |
| tb2.1__reshard-c4-data | borderline (2.1) | borderline (12.4) | borderline | 2/2 |
| tb2.1__rstan-to-pystan | borderline (-11.7) | babysitter (36) | needs-third-judge | 1/2 |
| tb2.1__sam-cell-seg | babysitter (64.9) | babysitter (40.6) | babysitter | 2/2 |
| tb2.1__sanitize-git-repo | borderline (-11.9) | borderline (5.4) | borderline | 2/2 |
| tb2.1__schemelike-metacircular-eval | babysitter (51.7) | babysitter (43.5) | babysitter | 2/2 |
| tb2.1__sparql-university | babysitter (21.7) | borderline (18.8) | needs-third-judge | 1/2 |
| tb2.1__sqlite-db-truncate | vanilla (-37.9) | vanilla (-32.2) | vanilla | 2/2 |
| tb2.1__sqlite-with-gcov | borderline (-6.5) | borderline (2.1) | borderline | 2/2 |
| tb2.1__torch-pipeline-parallelism | babysitter (54.6) | babysitter (64.9) | babysitter | 2/2 |
| tb2.1__torch-tensor-parallelism | babysitter (42) | babysitter (56.3) | babysitter | 2/2 |
| tb2.1__train-fasttext | borderline (5) | borderline (10.7) | borderline | 2/2 |
| tb2.1__tune-mjcf | borderline (-7.9) | borderline (-7.9) | borderline | 2/2 |
| tb2.1__video-processing | borderline (-5.5) | borderline (-8.4) | borderline | 2/2 |
| tb2.1__vulnerable-secret | vanilla (-91.4) | vanilla (-85.6) | vanilla | 2/2 |
| tb2.1__winning-avg-corewars | borderline (-11.9) | borderline (-11.9) | borderline | 2/2 |
| tb2.1__write-compressor | borderline (-1.1) | babysitter (28.9) | needs-third-judge | 1/2 |
| tb3__atrx-vep-crispr | babysitter (53.4) | babysitter (67.8) | babysitter | 2/2 |
| tb3__batched-eval-parity | babysitter (27.8) | babysitter (39.3) | babysitter | 2/2 |
| tb3__biped-contact-dynamics | babysitter (49.2) | babysitter (48.1) | babysitter | 2/2 |
| tb3__bun-sourcemap-leak | babysitter (20.1) | borderline (5.4) | needs-third-judge | 1/2 |
| tb3__cad-model | vanilla (-26.1) | borderline (16.9) | needs-third-judge | 1/2 |
| tb3__cargo-flight-dispatch | borderline (17.2) | borderline (4.4) | borderline | 2/2 |
| tb3__cli-2ph-simplex | babysitter (41.6) | babysitter (41.6) | babysitter | 2/2 |
| tb3__coq-block-bound | borderline (-5.5) | vanilla (-18.4) | needs-third-judge | 1/2 |
| tb3__ctr-optimization | babysitter (28.9) | borderline (16.1) | needs-third-judge | 1/2 |
| tb3__cumulative-layout-shift | borderline (13.4) | babysitter (26.6) | needs-third-judge | 1/2 |
| tb3__data-anonymization | babysitter (43.5) | babysitter (73.6) | babysitter | 2/2 |
| tb3__distributed-dedup | babysitter (69) | babysitter (60.7) | babysitter | 2/2 |
| tb3__embedding-drift-monitor | borderline (10.5) | borderline (15.1) | borderline | 2/2 |
| tb3__erp-procurement-planning | babysitter (52.1) | babysitter (57.9) | babysitter | 2/2 |
| tb3__exam-pdf-eval | babysitter (65.3) | babysitter (65.3) | babysitter | 2/2 |
| tb3__fin-saccr-rwa | babysitter (59.2) | babysitter (45.2) | babysitter | 2/2 |
| tb3__fix-uautomizer-soundness | borderline (14.6) | borderline (6.3) | borderline | 2/2 |
| tb3__foodstuff-beta-activity | vanilla (-16.5) | borderline (2.5) | needs-third-judge | 1/2 |
| tb3__formal-crypto | vanilla (-18.4) | vanilla (-18.8) | vanilla | 2/2 |
| tb3__fp8-rmsnorm-gemm | babysitter (74.7) | babysitter (56.1) | babysitter | 2/2 |
| tb3__freecad-impeller | babysitter (25.5) | babysitter (41.6) | babysitter | 2/2 |
| tb3__freecad-platform-drawing | borderline (-5.9) | borderline (18.4) | borderline | 2/2 |
| tb3__freecad-spring-clip | babysitter (22.6) | babysitter (41.6) | babysitter | 2/2 |
| tb3__freight-dispatch-shift | babysitter (64.9) | babysitter (70.7) | babysitter | 2/2 |
| tb3__glycan-ms2-elucidation | borderline (15.9) | borderline (8.8) | borderline | 2/2 |
| tb3__gpt2-codegolf | borderline (14.6) | babysitter (52.1) | needs-third-judge | 1/2 |
| tb3__gsea-proteomics | babysitter (58) | babysitter (66.7) | babysitter | 2/2 |
| tb3__heat-pump-warranty | borderline (11.9) | babysitter (36.6) | needs-third-judge | 1/2 |
| tb3__hof-topology-interpenetration | babysitter (53.4) | babysitter (39.5) | babysitter | 2/2 |
| tb3__html-js-filter | vanilla (-15.1) | borderline (-3.6) | needs-third-judge | 1/2 |
| tb3__ico-path-patch | borderline (3.5) | borderline (15) | borderline | 2/2 |
| tb3__interleaved-vigenere | vanilla (-21.6) | borderline (-13) | needs-third-judge | 1/2 |
| tb3__intrastat-meldung | babysitter (46.4) | babysitter (50.6) | babysitter | 2/2 |
| tb3__jax-speedrun-gpu | babysitter (57.9) | babysitter (52.1) | babysitter | 2/2 |
| tb3__ks-solver-cpp | borderline (14.6) | babysitter (27.8) | needs-third-judge | 1/2 |
| tb3__kv-live-surgery | babysitter (28.9) | borderline (16.1) | needs-third-judge | 1/2 |
| tb3__lake-temp-glm | babysitter (24.5) | babysitter (24.9) | babysitter | 2/2 |
| tb3__layout-config-recreation | babysitter (20.1) | borderline (1.5) | needs-third-judge | 1/2 |
| tb3__layout-config-recreation2 | babysitter (37.4) | babysitter (33.3) | babysitter | 2/2 |
| tb3__lean-midpoint-proof | borderline (8.8) | vanilla (-18.4) | needs-third-judge | 1/2 |
| tb3__legacy-utility-triage | babysitter (27.6) | babysitter (55.2) | babysitter | 2/2 |
| tb3__live-database-cutover | babysitter (57.9) | babysitter (45) | babysitter | 2/2 |
| tb3__math-eval-grader | babysitter (53.4) | babysitter (61.3) | babysitter | 2/2 |
| tb3__medical-claims-processing | borderline (17.6) | babysitter (33.7) | needs-third-judge | 1/2 |
| tb3__memcached-backdoor | vanilla (-38.9) | vanilla (-38.9) | vanilla | 2/2 |
| tb3__mp-checkpoint-consolidation | borderline (-10.9) | borderline (9.2) | borderline | 2/2 |
| tb3__music-harmony | borderline (2.1) | borderline (7.8) | borderline | 2/2 |
| tb3__mvcc-lsm-compaction | borderline (-4) | borderline (14.6) | borderline | 2/2 |
| tb3__nextjs-performance | borderline (-7.1) | borderline (-1) | borderline | 2/2 |
| tb3__ontology-kg-querying | babysitter (60.7) | babysitter (22) | babysitter | 2/2 |
| tb3__payments-pipeline-fix | borderline (-8.8) | vanilla (-30.3) | needs-third-judge | 1/2 |
| tb3__photonic-waveguide-routing | borderline (18.2) | borderline (19.9) | borderline | 2/2 |
| tb3__pretrain-shard-corruption | vanilla (-18.8) | borderline (-4.4) | needs-third-judge | 1/2 |
| tb3__production-planning | babysitter (64.9) | babysitter (57.9) | babysitter | 2/2 |
| tb3__protein-autointerp-disulfide | borderline (-8.8) | borderline (-14.2) | borderline | 2/2 |
| tb3__react-lead-form | babysitter (59.2) | babysitter (64.9) | babysitter | 2/2 |
| tb3__retro-console-soc | babysitter (48.1) | babysitter (59.6) | babysitter | 2/2 |
| tb3__risk-scorer-replay | babysitter (33.5) | babysitter (33.5) | babysitter | 2/2 |
| tb3__roy-polymorph-cn | babysitter (40.6) | babysitter (45.2) | babysitter | 2/2 |
| tb3__rs-archive-clone | babysitter (56.7) | babysitter (43.9) | babysitter | 2/2 |
| tb3__satb-audio-transcription | babysitter (26.2) | babysitter (37.7) | babysitter | 2/2 |
| tb3__session-window-debug | borderline (7.7) | borderline (-4) | borderline | 2/2 |
| tb3__sglang-qwen-burst | vanilla (-21.6) | vanilla (-22.8) | vanilla | 2/2 |
| tb3__shadow-relay | borderline (7.7) | borderline (16.3) | borderline | 2/2 |
| tb3__sound-change-cascade | babysitter (28.9) | borderline (15) | needs-third-judge | 1/2 |
| tb3__takens-embedding-lean | babysitter (46) | babysitter (30.3) | babysitter | 2/2 |
| tb3__telecom-entity-resolution | babysitter (38.1) | babysitter (35.3) | babysitter | 2/2 |
| tb3__uefi-bootkit | borderline (-11.7) | vanilla (-15.9) | needs-third-judge | 1/2 |
| tb3__vba-userform-port | babysitter (46.4) | babysitter (48.1) | babysitter | 2/2 |
| tb3__vf2-speedup-networkx | babysitter (67.8) | babysitter (35.3) | babysitter | 2/2 |
| tb3__vllm-deepseek-streaming | vanilla (-33.1) | borderline (-8.4) | needs-third-judge | 1/2 |
| tb3__vpp-loss-divergence | vanilla (-24.5) | vanilla (-18.8) | vanilla | 2/2 |
| tb3__wal-recovery-ordering | babysitter (64.9) | babysitter (46.4) | babysitter | 2/2 |
| tb3__wdm-design | babysitter (62.1) | babysitter (34.9) | babysitter | 2/2 |
