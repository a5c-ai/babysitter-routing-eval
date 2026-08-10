# Terminal-Bench 2.1 + 3 — Babysitter vs Vanilla routing

Generated 2026-08-10T14:52:02.328Z · run `01KZNWNZGBF2DJXHKG8XCC790C + 01KZP295QJFKTZ7MPZ4J656B19`
Corpus: 163 tasks (tb2.1 89 @ `ffccbe05`, tb3 74 @ `d7ff2f36`)
Thresholds: babysitter ≥ 20, vanilla ≤ -15 (doc defaults)

**59 babysitter · 61 borderline · 43 vanilla**


| task | bench | category | expert est | verdict | net_live | benefit | cost | top B | top C | process rec | agree |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fp8-rmsnorm-gemm | tb3 | ML | 12h | **babysitter** | 74.7 | 74.7 | 0 | B3 | C1 | custom |  |
| distributed-dedup | tb3 | Software | 10h | **babysitter** | 69 | 69 | 0 | B3 | C1 | custom |  |
| vf2-speedup-networkx | tb3 | Software | 4h | **babysitter** | 67.8 | 67.8 | 0 | B5 | C1 | custom |  |
| exam-pdf-eval | tb3 | ML | 14h | **babysitter** | 65.3 | 83.9 | 18.6 | B3 | C1 | library/methodologies/spec-driven-development.js |  |
| sam-cell-seg | tb2.1 | data-science | 10h | **babysitter** | 64.9 | 64.9 | 0 | B3 | C1 | custom |  |
| freight-dispatch-shift | tb3 | Operations | 4h | **babysitter** | 64.9 | 64.9 | 0 | B1 | C1 | library/methodologies/spec-driven-development.js |  |
| production-planning | tb3 | Operations | 4h | **babysitter** | 64.9 | 64.9 | 0 | B1 | C1 | custom |  |
| wal-recovery-ordering | tb3 | Software | 6h | **babysitter** | 64.9 | 64.9 | 0 | B1 | C1 | library/methodologies/tdd.js |  |
| bn-fit-modify | tb2.1 | scientific-computing | 8h | **babysitter** | 63.2 | 63.2 | 0 | B3 | C1 | library/methodologies/plan-and-execute.js |  |
| wdm-design | tb3 | Science | 4h | **babysitter** | 62.1 | 62.1 | 0 | B5 | C1 | library/methodologies/evolutionary.js |  |
| ontology-kg-querying | tb3 | Software | 20h | **babysitter** | 60.7 | 79.3 | 18.6 | B3 | C1 | library/methodologies/tdd.js |  |
| fin-saccr-rwa | tb3 | Operations | 8h | **babysitter** | 59.2 | 59.2 | 0 | B1 | C1 | library/methodologies/plan-and-execute.js |  |
| react-lead-form | tb3 | Software | 5h | **babysitter** | 59.2 | 59.2 | 0 | B1 | C1 | library/methodologies/spec-driven-development.js |  |
| gsea-proteomics | tb3 | Science | 4h | **babysitter** | 58 | 58 | 0 | B1 | C1 | custom |  |
| jax-speedrun-gpu | tb3 | ML | 10h | **babysitter** | 57.9 | 76.4 | 18.6 | B3 | C1 | custom |  |
| live-database-cutover | tb3 | Software | 8h | **babysitter** | 57.9 | 76.4 | 18.6 | B1 | C1 | custom |  |
| rs-archive-clone | tb3 | Software | 16h | **babysitter** | 56.7 | 75.3 | 18.6 | B3 | C1 | custom |  |
| install-windows-3.11 | tb2.1 | system-administration | 5h | **babysitter** | 56.3 | 56.3 | 0 | B3 | C1 | library/methodologies/plan-and-execute.js |  |
| torch-pipeline-parallelism | tb2.1 | software-engineering | 4h | **babysitter** | 54.6 | 54.6 | 0 | B1 | C1 | library/methodologies/tdd.js |  |
| regex-chess | tb2.1 | software-engineering | 24h | **babysitter** | 53.4 | 53.4 | 0 | B3 | C1 | library/methodologies/tdd.js |  |
| atrx-vep-crispr | tb3 | Science | 7h | **babysitter** | 53.4 | 53.4 | 0 | B1 | C1 | custom | 3/3 |
| hof-topology-interpenetration | tb3 | Science | 8h | **babysitter** | 53.4 | 53.4 | 0 | B1 | C1 | library/methodologies/plan-and-execute.js |  |
| math-eval-grader | tb3 | ML | 6h | **babysitter** | 53.4 | 53.4 | 0 | B3 | C1 | library/methodologies/plan-and-execute.js |  |
| erp-procurement-planning | tb3 | Operations | 4h | **babysitter** | 52.1 | 70.7 | 18.6 | B1 | C1 | custom |  |
| schemelike-metacircular-eval | tb2.1 | software-engineering | 5h | **babysitter** | 51.7 | 51.7 | 0 | B3 | C1 | library/methodologies/tdd.js |  |
| biped-contact-dynamics | tb3 | Science | 5h | **babysitter** | 49.2 | 67.8 | 18.6 | B3 | C1 | custom |  |
| retro-console-soc | tb3 | Hardware | 10h | **babysitter** | 48.1 | 66.7 | 18.6 | B3 | C1 | custom | 3/3 |
| intrastat-meldung | tb3 | Operations | 3h | **babysitter** | 46.4 | 64.9 | 18.6 | B1 | C1 | custom | 3/3 |
| vba-userform-port | tb3 | Software | 4h | **babysitter** | 46.4 | 64.9 | 18.6 | B1 | C1 | library/specializations/code-migration-modernization/ |  |
| mcmc-sampling-stan | tb2.1 | data-science | 3h | **babysitter** | 46 | 46 | 0 | B3 | C1 | custom | 3/3 |
| takens-embedding-lean | tb3 | Science | 60h | **babysitter** | 46 | 46 | 0 | B3 | C1 | custom | 3/3 |
| data-anonymization | tb3 | Software | 24h | **babysitter** | 43.5 | 62.1 | 18.6 | B3 | C1 | custom | 3/3 |
| git-multibranch | tb2.1 | system-administration | 3h | **babysitter** | 42 | 42 | 0 | B3 | C1 | library/methodologies/plan-and-execute.js |  |
| torch-tensor-parallelism | tb2.1 | software-engineering | 4h | **babysitter** | 42 | 42 | 0 | B3 | C1 | custom | 3/3 |
| adaptive-rejection-sampler | tb2.1 | scientific-computing | 3h | **babysitter** | 41.6 | 56.3 | 14.8 | B3 | C2 | library/methodologies/tdd.js |  |
| cli-2ph-simplex | tb3 | Software | 2h | **babysitter** | 41.6 | 56.3 | 14.8 | B1 | C1 | custom | 3/3 |
| gpt2-codegolf | tb2.1 | software-engineering | 40h | **babysitter** | 40.6 | 59.2 | 18.6 | B3 | C1 | custom | 3/3 |
| roy-polymorph-cn | tb3 | Science | 3h | **babysitter** | 40.6 | 59.2 | 18.6 | B1 | C1 | custom | 2/3 |
| circuit-fibsqrt | tb2.1 | software-engineering | 16h | **babysitter** | 40.2 | 40.2 | 0 | B3 | C1 | custom | 3/3 |
| telecom-entity-resolution | tb3 | Software | 16h | **babysitter** | 38.1 | 75.3 | 37.2 | B3 | C4 | library/methodologies/evolutionary.js |  |
| layout-config-recreation2 | tb3 | Media | 2h | **babysitter** | 37.4 | 70.7 | 33.3 | B1 | C1 | library/methodologies/evolutionary.js |  |
| risk-scorer-replay | tb3 | ML | 4h | **babysitter** | 33.5 | 70.7 | 37.2 | B1 | C1 | custom | 2/3 |
| ctr-optimization | tb3 | Operations | 4.8h | **babysitter** | 28.9 | 66.1 | 37.2 | B1 | C4 | library/methodologies/evolutionary.js |  |
| sound-change-cascade | tb3 | Science | 4h | **babysitter** | 28.9 | 66.1 | 37.2 | B1 | C4 | library/methodologies/evolutionary.js |  |
| batched-eval-parity | tb3 | ML | 24h | **babysitter** | 27.8 | 64.9 | 37.2 | B3 | C4 | library/methodologies/tdd.js |  |
| satb-audio-transcription | tb3 | Media | 8h | **babysitter** | 26.2 | 44.8 | 18.6 | B3 | C4 | library/methodologies/plan-and-execute.js |  |
| portfolio-optimization | tb2.1 | optimization | 2h | **babysitter** | 25.5 | 40.2 | 14.8 | B5 | C1 | custom | 3/3 |
| freecad-impeller | tb3 | Hardware | 2h | **babysitter** | 25.5 | 40.2 | 14.8 | B3 | C1 | library/methodologies/plan-and-execute.js | 2/3 |
| make-mips-interpreter | tb2.1 | software-engineering | 8h | **babysitter** | 24.9 | 62.1 | 37.2 | B3 | C1 | custom | 2/3 |
| lake-temp-glm | tb3 | Science | 8h | **babysitter** | 24.5 | 43.1 | 18.6 | B3 | C4 | library/methodologies/evolutionary.js |  |
| freecad-spring-clip | tb3 | Hardware | 2h | **babysitter** | 22.6 | 37.4 | 14.8 | B3 | C1 | library/methodologies/spec-driven-development.js | 3/3 |
| caffe-cifar-10 | tb2.1 | machine-learning | — | **babysitter** | 22.2 | 51.7 | 29.5 | B1 | C1 | custom | 3/3 |
| sparql-university | tb2.1 | data-querying | 13.3h | **babysitter** | 21.7 | 40.2 | 18.6 | B3 | C1 | library/methodologies/plan-and-execute.js | 2/3 |
| dna-assembly | tb2.1 | scientific-computing | 1h | **babysitter** | 21.1 | 50.6 | 29.5 | B1 | C1 | custom | 2/3 |
| layout-config-recreation | tb3 | Media | 2h | **babysitter** | 20.1 | 53.4 | 33.3 | B5 | C1 | custom | 2/3 |
| gpt2-codegolf | tb3 | ML | 40h | **babysitter** | 14.6 | 51.7 | 37.2 | B3 | C1 | custom | 2/3 |
| heat-pump-warranty | tb3 | Operations | 4h | **babysitter** | 11.9 | 30.5 | 18.6 | B3 | C1 | custom | 2/3 |
| write-compressor | tb2.1 | software-engineering | 24h | **babysitter** | -1.1 | 54.6 | 55.7 | B3 | C1 | custom | 2/3 |
| rstan-to-pystan | tb2.1 | data-science | 3h | **babysitter** | -11.7 | 40.2 | 51.9 | B3 | C4 | library/methodologies/plan-and-execute.js | 2/3 |
| kv-live-surgery | tb3 | Software | 4h | _borderline_ | 28.9 | 66.1 | 37.2 | B1 | C1 | custom | 2/3 |
| legacy-utility-triage | tb3 | Operations | 3.5h | _borderline_ | 27.6 | 27.6 | 0 | B3 | C1 | custom | 2/3 |
| bun-sourcemap-leak | tb3 | Software | 1.5h | _borderline_ | 20.1 | 53.4 | 33.3 | B1 | C1 | custom | 2/3 |
| photonic-waveguide-routing | tb3 | Software | 45m | _borderline_ | 18.2 | 47.7 | 29.5 | B3 | C2 | library/methodologies/evolutionary.js | 3/3 |
| medical-claims-processing | tb3 | Operations | 2h | _borderline_ | 17.6 | 69.5 | 51.9 | B1 | C1 | custom | 3/3 |
| cargo-flight-dispatch | tb3 | Operations | 2.5h | _borderline_ | 17.2 | 50.6 | 33.3 | B3 | C4 | library/cradle/bugfix.js | 2/3 |
| build-pmars | tb2.1 | software-engineering | 1.5h | _borderline_ | 16.9 | 31.6 | 14.8 | B1 | C2 | library/cradle/project-install.js | 3/3 |
| feal-linear-cryptanalysis | tb2.1 | mathematics | 16h | _borderline_ | 16.3 | 53.4 | 37.2 | B3 | C1 | custom | 3/3 |
| feal-differential-cryptanalysis | tb2.1 | mathematics | 8h | _borderline_ | 15.9 | 34.5 | 18.6 | B3 | C1 | custom | 3/3 |
| glycan-ms2-elucidation | tb3 | Science | 5h | _borderline_ | 15.9 | 34.5 | 18.6 | B3 | C1 | custom | 2/3 |
| llm-inference-batching-scheduler | tb2.1 | machine-learning | 45m | _borderline_ | 15.3 | 44.8 | 29.5 | B5 | C1 | library/methodologies/evolutionary.js | 3/3 |
| fix-uautomizer-soundness | tb3 | Software | 3h | _borderline_ | 14.6 | 51.7 | 37.2 | B3 | C4 | library/cradle/bugfix.js | 3/3 |
| ks-solver-cpp | tb3 | Science | 10h | _borderline_ | 14.6 | 51.7 | 37.2 | B3 | C1 | custom | 2/3 |
| mailman | tb2.1 | system-administration | 1h | _borderline_ | 14.4 | 47.7 | 33.3 | B1 | C1 | custom | 3/3 |
| dna-insert | tb2.1 | scientific-computing | 30m | _borderline_ | 13.6 | 43.1 | 29.5 | B5 | C1 | custom | 3/3 |
| cumulative-layout-shift | tb3 | Software | 6h | _borderline_ | 13.4 | 50.6 | 37.2 | B5 | C4 | library/specializations/performance-optimization/ | 3/3 |
| cancel-async-tasks | tb2.1 | software-engineering | 2h | _borderline_ | 11.1 | 25.9 | 14.8 | B1 | C2 | library/methodologies/tdd.js | 2/3 |
| distribution-search | tb2.1 | machine-learning | 2h | _borderline_ | 11.1 | 25.9 | 14.8 | B5 | C2 | library/methodologies/tdd.js | 3/3 |
| extract-moves-from-video | tb2.1 | file-operations | 2h | _borderline_ | 11.1 | 25.9 | 14.8 | B1 | C1 | custom | 3/3 |
| build-pov-ray | tb2.1 | software-engineering | 1h | _borderline_ | 10.7 | 40.2 | 29.5 | B3 | C2 | library/cradle/project-install.js | 2/3 |
| git-leak-recovery | tb2.1 | software-engineering | 30m | _borderline_ | 10.7 | 40.2 | 29.5 | B1 | C1 | custom | 3/3 |
| embedding-drift-monitor | tb3 | ML | 5h | _borderline_ | 10.5 | 47.7 | 37.2 | B3 | C4 | library/cradle/bugfix.js | 3/3 |
| make-doom-for-mips | tb2.1 | software-engineering | 8h | _borderline_ | 8.8 | 46 | 37.2 | B3 | C1 | custom | 3/3 |
| lean-midpoint-proof | tb3 | Science | 10h | _borderline_ | 8.8 | 46 | 37.2 | B3 | C4 | library/methodologies/tdd.js | 3/3 |
| protein-assembly | tb2.1 | scientific-computing | 1h | _borderline_ | 8.2 | 56.3 | 48.1 | B1 | C1 | custom | 3/3 |
| session-window-debug | tb3 | Software | 8h | _borderline_ | 7.7 | 44.8 | 37.2 | B3 | C4 | library/cradle/bugfix.js | 3/3 |
| shadow-relay | tb3 | Security | 3h | _borderline_ | 7.7 | 44.8 | 37.2 | B3 | C4 | library/methodologies/state-machine-orchestration.js | 3/3 |
| financial-document-processor | tb2.1 | data-processing | 30m | _borderline_ | 6.7 | 36.2 | 29.5 | B1 | C1 | custom | 3/3 |
| multi-source-data-merger | tb2.1 | data-processing | 30m | _borderline_ | 6.7 | 36.2 | 29.5 | B1 | C2 | library/methodologies/plan-and-execute.js | 3/3 |
| query-optimize | tb2.1 | data-science | 1h | _borderline_ | 5 | 34.5 | 29.5 | B5 | C1 | custom | 2/3 |
| train-fasttext | tb2.1 | model-training | 30m | _borderline_ | 5 | 34.5 | 29.5 | B5 | C1 | custom | 2/3 |
| ico-path-patch | tb3 | Security | 8h | _borderline_ | 3.5 | 59.2 | 55.7 | B1 | C4 | custom | 3/3 |
| polyglot-rust-c | tb2.1 | software-engineering | 3h | _borderline_ | 2.5 | 17.2 | 14.8 | B3 | C2 | library/methodologies/tdd.js | 2/3 |
| compile-compcert | tb2.1 | system-administration | 1h | _borderline_ | 2.1 | 31.6 | 29.5 | B1 | C2 | library/cradle/project-install.js | 3/3 |
| count-dataset-tokens | tb2.1 | model-training | 30m | _borderline_ | 2.1 | 31.6 | 29.5 | B1 | C1 | custom | 2/3 |
| reshard-c4-data | tb2.1 | data-science | 30m | _borderline_ | 2.1 | 31.6 | 29.5 | B1 | C1 | custom | 3/3 |
| music-harmony | tb3 | Media | 1h | _borderline_ | 2.1 | 31.6 | 29.5 | B3 | C1 | custom | 3/3 |
| pypi-server | tb2.1 | software-engineering | 1h | _borderline_ | 1 | 30.5 | 29.5 | B1 | C1 | custom | 3/3 |
| large-scale-text-editing | tb2.1 | file-operations | 40m | _borderline_ | -3.6 | 25.9 | 29.5 | B1 | C2 | library/methodologies/tdd.js | 2/3 |
| qemu-startup | tb2.1 | system-administration | 30m | _borderline_ | -3.6 | 25.9 | 29.5 | B1 | C1 | custom | 3/3 |
| fix-ocaml-gc | tb2.1 | software-engineering | 24h | _borderline_ | -4 | 51.7 | 55.7 | B3 | C4 | library/cradle/bugfix.js | 3/3 |
| mvcc-lsm-compaction | tb3 | Software | 4h | _borderline_ | -4 | 51.7 | 55.7 | B3 | C1 | custom | 2/3 |
| video-processing | tb2.1 | video-processing | 6.7h | _borderline_ | -5.5 | 31.6 | 37.2 | B3 | C1 | custom | 3/3 |
| coq-block-bound | tb3 | Science | 16h | _borderline_ | -5.5 | 31.6 | 37.2 | B3 | C1 | custom | 3/3 |
| freecad-platform-drawing | tb3 | Hardware | 1.5h | _borderline_ | -5.9 | 46 | 51.9 | B3 | C1 | custom | 3/3 |
| sqlite-with-gcov | tb2.1 | system-administration | 30m | _borderline_ | -6.5 | 23 | 29.5 | B3 | C2 | library/cradle/project-install.js | 3/3 |
| nextjs-performance | tb3 | Software | 3h | _borderline_ | -7.1 | 44.8 | 51.9 | B3 | C4 | library/specializations/performance-optimization/ | 2/3 |
| log-summary-date-ranges | tb2.1 | data-processing | 1.3h | _borderline_ | -7.7 | 21.8 | 29.5 | B3 | C1 | custom | 2/3 |
| largest-eigenval | tb2.1 | mathematics | 1h | _borderline_ | -7.9 | 40.2 | 48.1 | B5 | C2 | library/methodologies/evolutionary.js | 2/3 |
| tune-mjcf | tb2.1 | scientific-computing | 30m | _borderline_ | -7.9 | 40.2 | 48.1 | B5 | C1 | custom | 2/3 |
| payments-pipeline-fix | tb3 | Software | 2h | _borderline_ | -8.8 | 43.1 | 51.9 | B3 | C4 | library/methodologies/plan-and-execute.js | 2/3 |
| protein-autointerp-disulfide | tb3 | Science | 2h | _borderline_ | -8.8 | 43.1 | 51.9 | B3 | C1 | custom | 3/3 |
| overfull-hbox | tb2.1 | debugging | 1h | _borderline_ | -9.4 | 20.1 | 29.5 | B3 | C1 | custom | 3/3 |
| headless-terminal | tb2.1 | software-engineering | 2h | _borderline_ | -10.3 | 23 | 33.3 | B3 | C1 | library/methodologies/tdd.js | 3/3 |
| mp-checkpoint-consolidation | tb3 | ML | 6h | _borderline_ | -10.9 | 44.8 | 55.7 | B3 | C1 | custom | 2/3 |
| uefi-bootkit | tb3 | Security | 2h | _borderline_ | -11.7 | 40.2 | 51.9 | B3 | C4 | library/methodologies/plan-and-execute.js | 2/3 |
| sanitize-git-repo | tb2.1 | security | 30m | _borderline_ | -11.9 | 36.2 | 48.1 | B1 | C1 | custom | 3/3 |
| winning-avg-corewars | tb2.1 | software-engineering | 1h | _borderline_ | -11.9 | 36.2 | 48.1 | B5 | C2 | library/methodologies/evolutionary.js | 3/3 |
| chess-best-move | tb2.1 | games | 45m | _borderline_ | -12.3 | 17.2 | 29.5 | B3 | C1 | custom | 3/3 |
| code-from-image | tb2.1 | software-engineering | 30m | _borderline_ | -18.4 | 25.9 | 44.3 | B1 | C2 | n/a | 2/3 |
| sglang-qwen-burst | tb3 | ML | 2h | _borderline_ | -21.6 | 48.9 | 70.5 | B1 | C4 | library/cradle/bugfix.js | 2/3 |
| path-tracing | tb2.1 | software-engineering | 6h | vanilla | 3.1 | 40.2 | 37.2 | B5 | C4 | library/methodologies/evolutionary.js | 2/3 |
| qemu-alpine-ssh | tb2.1 | system-administration | 30m | vanilla | 2.1 | 31.6 | 29.5 | B1 | C1 | custom | 2/3 |
| filter-js-from-html | tb2.1 | security | 45m | vanilla | -0.8 | 28.7 | 29.5 | B3 | C1 | custom | 2/3 |
| regex-log | tb2.1 | data-processing | 45m | vanilla | -0.8 | 28.7 | 29.5 | B3 | C2 | library/methodologies/tdd.js | 2/3 |
| path-tracing-reverse | tb2.1 | software-engineering | 2h | vanilla | -14.6 | 37.4 | 51.9 | B1 | C1 | custom | 2/3 |
| modernize-scientific-stack | tb2.1 | scientific-computing | 2h | vanilla | -15.1 | 14.4 | 29.5 | B3 | C2 | library/specializations/code-migration-modernization/ |  |
| html-js-filter | tb3 | Security | 45m | vanilla | -15.1 | 14.4 | 29.5 | B3 | C2 | library/methodologies/tdd.js | 3/3 |
| pytorch-model-cli | tb2.1 | model-training | 30m | vanilla | -16.5 | 31.6 | 48.1 | B1 | C1 | custom |  |
| foodstuff-beta-activity | tb3 | Science | 1.5h | vanilla | -16.5 | 31.6 | 48.1 | B3 | C1 | custom |  |
| nginx-request-logging | tb2.1 | system-administration | 20m | vanilla | -16.7 | 27.6 | 44.3 | B1 | C2 | custom |  |
| model-extraction-relu-logits | tb2.1 | mathematics | 8h | vanilla | -18.4 | 37.4 | 55.7 | B3 | C1 | custom |  |
| formal-crypto | tb3 | Security | 3h | vanilla | -18.4 | 37.4 | 55.7 | B3 | C1 | custom |  |
| pretrain-shard-corruption | tb3 | ML | 2h | vanilla | -18.8 | 51.7 | 70.5 | B3 | C4 | custom |  |
| fix-code-vulnerability | tb2.1 | security | 2h | vanilla | -20.3 | 31.6 | 51.9 | B1 | C4 | library/cradle/bugfix.js | 3/3 |
| password-recovery | tb2.1 | security | 1.7h | vanilla | -20.3 | 31.6 | 51.9 | B1 | C1 | custom |  |
| kv-store-grpc | tb2.1 | software-engineering | 15m | vanilla | -21.3 | 23 | 44.3 | B1 | C2 | custom |  |
| openssl-selfsigned-cert | tb2.1 | security | 20m | vanilla | -21.3 | 23 | 44.3 | B1 | C2 | library/methodologies/plan-and-execute.js | 3/3 |
| interleaved-vigenere | tb3 | Security | 2h | vanilla | -21.6 | 48.9 | 70.5 | B5 | C4 | library/methodologies/evolutionary.js | 2/3 |
| gcode-to-text | tb2.1 | file-operations | 1h | vanilla | -22.2 | 25.9 | 48.1 | B1 | C1 | custom |  |
| constraints-scheduling | tb2.1 | personal-assistant | 15m | vanilla | -22.4 | 21.8 | 44.3 | B1 | C2 | library/methodologies/plan-and-execute.js |  |
| vpp-loss-divergence | tb3 | ML | 2h | vanilla | -24.5 | 46 | 70.5 | B3 | C4 | custom |  |
| build-cython-ext | tb2.1 | debugging | 1h | vanilla | -24.7 | 42 | 66.7 | B1 | C1 | custom |  |
| raman-fitting | tb2.1 | scientific-computing | 5m | vanilla | -25.3 | 19 | 44.3 | B1 | C1 | custom |  |
| cad-model | tb3 | Hardware | 2h | vanilla | -26.1 | 25.9 | 51.9 | B3 | C1 | custom |  |
| pytorch-model-recovery | tb2.1 | model-training | 15m | vanilla | -28.4 | 34.5 | 62.8 | B1 | C1 | custom |  |
| cobol-modernization | tb2.1 | software-engineering | 20m | vanilla | -29.9 | 14.4 | 44.3 | B1 | C2 | library/methodologies/plan-and-execute.js |  |
| hf-model-inference | tb2.1 | data-science | 20m | vanilla | -29.9 | 14.4 | 44.3 | B1 | C2 | library/methodologies/plan-and-execute.js |  |
| extract-elf | tb2.1 | file-operations | 30m | vanilla | -32.2 | 34.5 | 66.7 | B5 | C1 | custom |  |
| vllm-deepseek-streaming | tb3 | ML | 2h | vanilla | -33.1 | 37.4 | 70.5 | B3 | C4 | library/cradle/bugfix.js | 3/3 |
| mteb-retrieve | tb2.1 | data-science | 15m | vanilla | -35.6 | 8.6 | 44.3 | B1 | C2 | n/a |  |
| prove-plus-comm | tb2.1 | software-engineering | 5m | vanilla | -35.6 | 8.6 | 44.3 | B1 | C2 | custom |  |
| sqlite-db-truncate | tb2.1 | debugging | 1h | vanilla | -37.9 | 28.7 | 66.7 | B3 | C1 | custom |  |
| memcached-backdoor | tb3 | Security | 2h | vanilla | -38.9 | 31.6 | 70.5 | B3 | C4 | custom |  |
| configure-git-webserver | tb2.1 | system-administration | 15m | vanilla | -39.9 | 23 | 62.8 | B1 | C1 | custom |  |
| merge-diff-arc-agi-task | tb2.1 | debugging | 20m | vanilla | -39.9 | 23 | 62.8 | B1 | C1 | custom |  |
| mteb-leaderboard | tb2.1 | data-science | 5m | vanilla | -39.9 | 23 | 62.8 | B1 | C2 | custom |  |
| polyglot-c-py | tb2.1 | software-engineering | 20m | vanilla | -44.3 | 0 | 44.3 | B1 | C2 | n/a |  |
| db-wal-recovery | tb2.1 | file-operations | 45m | vanilla | -53.6 | 31.6 | 85.2 | B1 | C1 | custom |  |
| crack-7z-hash | tb2.1 | security | 5m | vanilla | -54.2 | 8.6 | 62.8 | B1 | C1 | custom |  |
| fix-git | tb2.1 | software-engineering | 5m | vanilla | -58.4 | 23 | 81.4 | B1 | C1 | custom |  |
| custom-memory-heap-crash | tb2.1 | debugging | 30m | vanilla | -65.1 | 20.1 | 85.2 | B3 | C4 | library/cradle/bugfix.js |  |
| break-filter-js-from-html | tb2.1 | security | 20m | vanilla | -67.1 | 14.4 | 81.4 | B1 | C2 | library/methodologies/tdd.js |  |
| vulnerable-secret | tb2.1 | security | 20m | vanilla | -91.4 | 8.6 | 100 | B1 | C2 | custom |  |

`net_live` renormalizes the rubric over the 7 dimensions that vary across this corpus; 6 are pinned constant (see `prompts/tb-profile.md`). Panel column shows majority agreement where a 3-judge panel ran.