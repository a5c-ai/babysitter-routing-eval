# Multi-model routing comparison

Corpus: 163 tasks · models: 4 · unanimous: 75/163 (46%)

## Judge protocol

| model | source | verdict mode | notes |
|---|---|---|---|
| GPT-5.6-terra | `out/models/gpt-5.6-terra/payload.json` | stored | Stored majority recommendation from three judgments per task under the anchored profile. Originally labelled "Opus 5"; the local `claude` CLI routes to gpt-5.6-terra, which its own modelUsage field reports for every judgment. |
| GPT-5.6-sol | `out/models/gpt-5.6-sol/payload.json` | primary-score | One primary judgment per task, effort high, using the same anchored rubric and Terminal-Bench profile. |
| Claude Opus 5 | `out/models/claude-opus-5/payload.json` | primary-score | One judgment per task, effort high. Cross-vendor (Anthropic). 161/163 scored: declined break-filter-js-from-html and crack-7z-hash on content policy. |
| Gemini 2.5 Pro | `out/models/gemini-2.5-pro/payload.json` | primary-score | One judgment per task, effort high. Cross-vendor (Google). 163/163 scored, no refusals. |

Recommendations use each model's configured verdict mode and the shared thresholds where `primary-score` is selected. The score in parentheses is the payload's primary `net_live`; a stored verdict may reflect a panel.

## Recommendation counts

| model | babysitter | borderline | vanilla | mean net_live |
|---|---:|---:|---:|---:|
| GPT-5.6-terra | 59 | 69 | 35 | -6.5 |
| GPT-5.6-sol | 66 | 75 | 22 | -0.3 |
| Claude Opus 5 | 66 | 65 | 30 | -2.6 |
| Gemini 2.5 Pro | 91 | 53 | 19 | 11.6 |

## Pairwise verdict agreement

| | GPT-5.6-terra | GPT-5.6-sol | Claude Opus 5 | Gemini 2.5 Pro |
|---|---:|---:|---:|---:|
| GPT-5.6-terra | 163/163 (100%) | 129/163 (79.1%) | 120/163 (73.6%) | 106/163 (65%) |
| GPT-5.6-sol | 129/163 (79.1%) | 163/163 (100%) | 118/163 (72.4%) | 107/163 (65.6%) |
| Claude Opus 5 | 120/163 (73.6%) | 118/163 (72.4%) | 163/163 (100%) | 104/163 (63.8%) |
| Gemini 2.5 Pro | 106/163 (65%) | 107/163 (65.6%) | 104/163 (63.8%) | 163/163 (100%) |

## Tasks

| task | GPT-5.6-terra | GPT-5.6-sol | Claude Opus 5 | Gemini 2.5 Pro | consensus | agreement |
|---|---|---|---|---|---|---:|
| tb2.1__adaptive-rejection-sampler | babysitter (8.6) | babysitter (17.2) | babysitter (14.4) | babysitter (41.6) | babysitter | 4/4 |
| tb2.1__bn-fit-modify | babysitter (-3.1) | babysitter (5.6) | babysitter (31.6) | babysitter (69) | babysitter | 4/4 |
| tb2.1__break-filter-js-from-html | vanilla (-61.3) | vanilla (-58.4) | refused (null) | vanilla (-52.7) | vanilla | 3/4 |
| tb2.1__build-cython-ext | borderline (-16.1) | borderline (-10.3) | borderline (-19) | babysitter (16.5) | borderline | 3/4 |
| tb2.1__build-pmars | babysitter (-2.1) | babysitter (16.5) | borderline (-5) | babysitter (7.8) | babysitter | 3/4 |
| tb2.1__build-pov-ray | babysitter (-2.1) | babysitter (25.1) | babysitter (8.2) | babysitter (22.2) | babysitter | 4/4 |
| tb2.1__caffe-cifar-10 | babysitter (22.2) | babysitter (28) | babysitter (32.8) | babysitter (22.2) | babysitter | 4/4 |
| tb2.1__cancel-async-tasks | borderline (-16.5) | vanilla (-33.7) | vanilla (-33.7) | borderline (-9.4) | undecided | 2/4 |
| tb2.1__chess-best-move | vanilla (-49.4) | vanilla (-43.7) | borderline (-25.1) | borderline (2.1) | undecided | 2/4 |
| tb2.1__circuit-fibsqrt | babysitter (30.3) | babysitter (46.4) | babysitter (37.7) | babysitter (80.5) | babysitter | 4/4 |
| tb2.1__cobol-modernization | vanilla (-61.3) | vanilla (-56.7) | borderline (-29.5) | borderline (-21.3) | undecided | 2/4 |
| tb2.1__code-from-image | vanilla (-43.7) | borderline (-26.4) | vanilla (-55.6) | vanilla (-49.8) | vanilla | 3/4 |
| tb2.1__compile-compcert | borderline (-16.5) | borderline (-16.5) | borderline (-10.7) | babysitter (16.5) | borderline | 3/4 |
| tb2.1__configure-git-webserver | vanilla (-31.2) | borderline (-25.5) | vanilla (-38.1) | borderline (-19.7) | undecided | 2/4 |
| tb2.1__constraints-scheduling | vanilla (-58.4) | vanilla (-43.9) | vanilla (-43.9) | borderline (3.4) | vanilla | 3/4 |
| tb2.1__count-dataset-tokens | vanilla (-30.5) | borderline (-26.4) | vanilla (-58.4) | vanilla (-64.2) | vanilla | 3/4 |
| tb2.1__crack-7z-hash | vanilla (-54.2) | vanilla (-64.2) | refused (null) | borderline (-27) | vanilla | 2/4 |
| tb2.1__custom-memory-heap-crash | vanilla (-56.5) | vanilla (-50.8) | vanilla (-74.1) | vanilla (-56.9) | vanilla | 4/4 |
| tb2.1__db-wal-recovery | borderline (-20.7) | borderline (-14.9) | borderline (-23.6) | vanilla (-33.5) | borderline | 3/4 |
| tb2.1__distribution-search | borderline (-19.4) | borderline (-10.7) | borderline (-13.6) | borderline (-9.4) | borderline | 4/4 |
| tb2.1__dna-assembly | borderline (-27.6) | borderline (-27.6) | borderline (-9) | babysitter (42.9) | borderline | 3/4 |
| tb2.1__dna-insert | vanilla (-32.2) | borderline (-13.6) | vanilla (-55.6) | babysitter (23.9) | undecided | 2/4 |
| tb2.1__extract-elf | vanilla (-43.7) | borderline (-25.1) | vanilla (-42.7) | vanilla (-55.6) | vanilla | 3/4 |
| tb2.1__extract-moves-from-video | vanilla (-30.8) | vanilla (-35.1) | borderline (-30.5) | borderline (-29.3) | undecided | 2/4 |
| tb2.1__feal-differential-cryptanalysis | borderline (-8.8) | borderline (-0.2) | borderline (-8.8) | babysitter (12.6) | borderline | 3/4 |
| tb2.1__feal-linear-cryptanalysis | babysitter (11.7) | babysitter (11.7) | babysitter (27.8) | babysitter (50.4) | babysitter | 4/4 |
| tb2.1__filter-js-from-html | borderline (-25.1) | vanilla (-33.7) | borderline (-14.8) | borderline (-25.1) | borderline | 3/4 |
| tb2.1__financial-document-processor | borderline (1.3) | babysitter (19.9) | borderline (-11.9) | babysitter (30.3) | undecided | 2/4 |
| tb2.1__fix-code-vulnerability | borderline (-20.7) | borderline (-20.7) | borderline (-19) | babysitter (22.2) | borderline | 3/4 |
| tb2.1__fix-git | vanilla (-77) | vanilla (-77) | vanilla (-85.6) | vanilla (-71.3) | vanilla | 4/4 |
| tb2.1__fix-ocaml-gc | borderline (4.6) | babysitter (4.6) | babysitter (10.4) | babysitter (10.4) | babysitter | 3/4 |
| tb2.1__gcode-to-text | vanilla (-49.4) | vanilla (-49.4) | vanilla (-43.7) | vanilla (-49.4) | vanilla | 4/4 |
| tb2.1__git-leak-recovery | borderline (-10.7) | borderline (-29.3) | borderline (-28.4) | borderline (2.1) | borderline | 4/4 |
| tb2.1__git-multibranch | babysitter (50.2) | babysitter (37.4) | babysitter (28.7) | babysitter (45.6) | babysitter | 4/4 |
| tb2.1__gpt2-codegolf | babysitter (37.6) | babysitter (60.7) | babysitter (37.7) | babysitter (57.5) | babysitter | 4/4 |
| tb2.1__headless-terminal | borderline (-25.1) | vanilla (-39.1) | borderline (-20.5) | borderline (-0.8) | borderline | 3/4 |
| tb2.1__hf-model-inference | borderline (-21.3) | borderline (-16.7) | borderline (-10.9) | borderline (-27) | borderline | 4/4 |
| tb2.1__install-windows-3.11 | babysitter (2.9) | babysitter (38.7) | babysitter (4.4) | babysitter (35.8) | babysitter | 4/4 |
| tb2.1__kv-store-grpc | borderline (-12.7) | borderline (-12.7) | borderline (-8.1) | borderline (-18.4) | borderline | 4/4 |
| tb2.1__large-scale-text-editing | borderline (-23.6) | borderline (-9.2) | borderline (-27.6) | babysitter (22.2) | borderline | 3/4 |
| tb2.1__largest-eigenval | borderline (-7.9) | borderline (-7.9) | borderline (-2.1) | borderline (0.8) | borderline | 4/4 |
| tb2.1__llm-inference-batching-scheduler | borderline (-21.8) | borderline (-21.8) | borderline (-21.8) | babysitter (15.3) | borderline | 3/4 |
| tb2.1__log-summary-date-ranges | borderline (-7.7) | borderline (-1.9) | borderline (-20.5) | borderline (2.7) | borderline | 4/4 |
| tb2.1__mailman | borderline (-19.4) | borderline (-6.1) | borderline (-0.4) | babysitter (19.3) | borderline | 3/4 |
| tb2.1__make-doom-for-mips | borderline (-5.9) | borderline (-5.9) | babysitter (4.4) | borderline (-4.4) | borderline | 3/4 |
| tb2.1__make-mips-interpreter | borderline (-5.9) | babysitter (23) | babysitter (14.4) | babysitter (74.7) | babysitter | 3/4 |
| tb2.1__mcmc-sampling-stan | babysitter (34.1) | babysitter (38.7) | babysitter (41.6) | babysitter (34.1) | babysitter | 4/4 |
| tb2.1__merge-diff-arc-agi-task | vanilla (-44.1) | vanilla (-39.5) | vanilla (-39.5) | borderline (-6.9) | vanilla | 3/4 |
| tb2.1__model-extraction-relu-logits | borderline (6.9) | borderline (-20.3) | babysitter (9.8) | babysitter (6.9) | undecided | 2/4 |
| tb2.1__modernize-scientific-stack | borderline (-1.9) | borderline (-1.9) | borderline (-20.5) | borderline (-6.5) | borderline | 4/4 |
| tb2.1__mteb-leaderboard | vanilla (-54.2) | borderline (-21.3) | vanilla (-48.5) | vanilla (-39.9) | vanilla | 3/4 |
| tb2.1__mteb-retrieve | borderline (-18.4) | borderline (-18.4) | vanilla (-48.5) | borderline (-27) | borderline | 3/4 |
| tb2.1__multi-source-data-merger | babysitter (15.3) | babysitter (15.3) | vanilla (-38.1) | babysitter (12.4) | babysitter | 3/4 |
| tb2.1__nginx-request-logging | borderline (-10.9) | borderline (-2.3) | borderline (-19.5) | borderline (-12.7) | borderline | 4/4 |
| tb2.1__openssl-selfsigned-cert | borderline (-8.1) | borderline (-6.9) | borderline (-10.9) | borderline (-12.7) | borderline | 4/4 |
| tb2.1__overfull-hbox | borderline (-0.8) | babysitter (6.7) | borderline (-3.3) | borderline (-0.8) | borderline | 3/4 |
| tb2.1__password-recovery | vanilla (-43.7) | vanilla (-43.7) | vanilla (-33.3) | vanilla (-50.8) | vanilla | 4/4 |
| tb2.1__path-tracing | borderline (-0.2) | borderline (-3.1) | borderline (2.7) | borderline (-8.8) | borderline | 4/4 |
| tb2.1__path-tracing-reverse | vanilla (-32.2) | vanilla (-32.2) | vanilla (-32.2) | borderline (-23.6) | vanilla | 3/4 |
| tb2.1__polyglot-c-py | vanilla (-38.5) | vanilla (-48.5) | vanilla (-46.7) | vanilla (-38.5) | vanilla | 4/4 |
| tb2.1__polyglot-rust-c | borderline (-10.3) | borderline (-10.3) | borderline (-18.6) | babysitter (22.6) | borderline | 3/4 |
| tb2.1__portfolio-optimization | babysitter (10.7) | babysitter (23.9) | babysitter (15.3) | babysitter (13.6) | babysitter | 4/4 |
| tb2.1__protein-assembly | borderline (-10.3) | borderline (0) | borderline (1.3) | babysitter (26.8) | borderline | 3/4 |
| tb2.1__prove-plus-comm | borderline (-27) | borderline (-21.3) | vanilla (-42.7) | borderline (-27) | borderline | 3/4 |
| tb2.1__pypi-server | babysitter (-7.9) | babysitter (16.5) | borderline (2.5) | borderline (-16.5) | undecided | 2/4 |
| tb2.1__pytorch-model-cli | borderline (-22.2) | borderline (-16.5) | borderline (-29.5) | borderline (-27) | borderline | 4/4 |
| tb2.1__pytorch-model-recovery | vanilla (-38.3) | vanilla (-38.3) | vanilla (-46.9) | vanilla (-32.6) | vanilla | 4/4 |
| tb2.1__qemu-alpine-ssh | borderline (-10.7) | borderline (-10.7) | borderline (-28.4) | babysitter (13.6) | borderline | 3/4 |
| tb2.1__qemu-startup | borderline (-19.4) | borderline (-10.7) | vanilla (-42.7) | borderline (2.1) | borderline | 3/4 |
| tb2.1__query-optimize | vanilla (-49.4) | borderline (-26.4) | vanilla (-32.2) | babysitter (5) | undecided | 2/4 |
| tb2.1__raman-fitting | vanilla (-53.8) | vanilla (-68.2) | vanilla (-43.9) | vanilla (-33.9) | vanilla | 4/4 |
| tb2.1__regex-chess | babysitter (49.2) | babysitter (60.7) | babysitter (43.5) | babysitter (89.7) | babysitter | 4/4 |
| tb2.1__regex-log | borderline (-20.9) | borderline (-15.1) | borderline (-19.4) | borderline (-9.4) | borderline | 4/4 |
| tb2.1__reshard-c4-data | borderline (-16.5) | borderline (-0.4) | borderline (-0.4) | babysitter (18.2) | borderline | 3/4 |
| tb2.1__rstan-to-pystan | borderline (-17.8) | borderline (-3.1) | babysitter (23) | babysitter (34.1) | undecided | 2/4 |
| tb2.1__sam-cell-seg | babysitter (34.9) | babysitter (39.5) | babysitter (37.7) | babysitter (48.9) | babysitter | 4/4 |
| tb2.1__sanitize-git-repo | borderline (-1.9) | borderline (2.5) | vanilla (-32.4) | borderline (-1.9) | borderline | 3/4 |
| tb2.1__schemelike-metacircular-eval | borderline (-7.1) | babysitter (7.3) | babysitter (20.1) | babysitter (29.9) | babysitter | 3/4 |
| tb2.1__sparql-university | borderline (3.1) | borderline (3.1) | borderline (-15.7) | babysitter (40.2) | borderline | 3/4 |
| tb2.1__sqlite-db-truncate | vanilla (-35.1) | vanilla (-35.1) | vanilla (-37.9) | borderline (-23.6) | vanilla | 3/4 |
| tb2.1__sqlite-with-gcov | borderline (2.1) | borderline (-16.5) | vanilla (-48.5) | borderline (-16.5) | borderline | 3/4 |
| tb2.1__torch-pipeline-parallelism | babysitter (20.1) | babysitter (34.1) | babysitter (31.2) | babysitter (34.1) | babysitter | 4/4 |
| tb2.1__torch-tensor-parallelism | babysitter (30.1) | babysitter (30.1) | borderline (-5.7) | babysitter (12.8) | babysitter | 3/4 |
| tb2.1__train-fasttext | borderline (-13.6) | borderline (-7.9) | borderline (-7.9) | babysitter (5) | borderline | 3/4 |
| tb2.1__tune-mjcf | borderline (-26.4) | borderline (-26.4) | vanilla (-49.8) | babysitter (10.7) | undecided | 2/4 |
| tb2.1__video-processing | borderline (-20.3) | borderline (-20.3) | borderline (-14.6) | borderline (-14.6) | borderline | 4/4 |
| tb2.1__vulnerable-secret | vanilla (-58.4) | vanilla (-58.4) | vanilla (-67.1) | vanilla (-91.4) | vanilla | 4/4 |
| tb2.1__winning-avg-corewars | borderline (-21.8) | babysitter (5.4) | borderline (-21.8) | vanilla (-36.2) | undecided | 2/4 |
| tb2.1__write-compressor | babysitter (8.8) | babysitter (14.6) | babysitter (14.6) | babysitter (69) | babysitter | 4/4 |
| tb3__atrx-vep-crispr | babysitter (38.7) | babysitter (47.3) | babysitter (28.7) | babysitter (38.7) | babysitter | 4/4 |
| tb3__batched-eval-parity | babysitter (13.4) | borderline (0.6) | babysitter (33.5) | babysitter (4.6) | babysitter | 3/4 |
| tb3__biped-contact-dynamics | babysitter (18.8) | babysitter (33.3) | babysitter (24.7) | babysitter (20.7) | babysitter | 4/4 |
| tb3__bun-sourcemap-leak | borderline (-6.1) | borderline (-19) | borderline (-19) | babysitter (16.5) | borderline | 3/4 |
| tb3__cad-model | vanilla (-35.1) | borderline (-20.3) | borderline (-16.5) | vanilla (-40.8) | undecided | 2/4 |
| tb3__cargo-flight-dispatch | borderline (-1.3) | borderline (0.4) | borderline (0.4) | borderline (-0.2) | borderline | 4/4 |
| tb3__cli-2ph-simplex | babysitter (33.7) | babysitter (55.9) | babysitter (23.9) | babysitter (28) | babysitter | 4/4 |
| tb3__coq-block-bound | borderline (3.1) | babysitter (8.8) | babysitter (19.2) | borderline (-4) | undecided | 2/4 |
| tb3__ctr-optimization | babysitter (19.9) | babysitter (14.2) | babysitter (38.9) | babysitter (7.1) | babysitter | 4/4 |
| tb3__cumulative-layout-shift | babysitter (11.9) | borderline (-6.7) | borderline (-1) | borderline (-19.9) | borderline | 3/4 |
| tb3__data-anonymization | babysitter (27.8) | babysitter (27.8) | babysitter (33.5) | babysitter (80.5) | babysitter | 4/4 |
| tb3__distributed-dedup | babysitter (56.1) | babysitter (60.7) | babysitter (57.9) | babysitter (74.7) | babysitter | 4/4 |
| tb3__embedding-drift-monitor | borderline (-33.1) | borderline (-1.3) | borderline (-9.6) | babysitter (61.7) | borderline | 3/4 |
| tb3__erp-procurement-planning | babysitter (24.5) | babysitter (24.5) | babysitter (24.5) | babysitter (67.4) | babysitter | 4/4 |
| tb3__exam-pdf-eval | babysitter (51.3) | babysitter (75.7) | babysitter (66.5) | babysitter (57.1) | babysitter | 4/4 |
| tb3__fin-saccr-rwa | borderline (1.5) | borderline (1.5) | babysitter (39.1) | babysitter (51.9) | undecided | 2/4 |
| tb3__fix-uautomizer-soundness | borderline (-15.9) | borderline (-18.8) | borderline (-8.4) | borderline (-13) | borderline | 4/4 |
| tb3__foodstuff-beta-activity | vanilla (-35.1) | borderline (-21.8) | borderline (-30.5) | borderline (-11.9) | borderline | 3/4 |
| tb3__formal-crypto | borderline (-8.8) | borderline (-8.8) | borderline (-3.1) | babysitter (5.6) | borderline | 3/4 |
| tb3__fp8-rmsnorm-gemm | babysitter (74.7) | babysitter (60.7) | babysitter (49.2) | babysitter (74.7) | babysitter | 4/4 |
| tb3__freecad-impeller | borderline (-16.5) | babysitter (38.7) | babysitter (14) | babysitter (16.5) | babysitter | 3/4 |
| tb3__freecad-platform-drawing | vanilla (-35.1) | borderline (-17.8) | borderline (-24.7) | borderline (-6.3) | borderline | 3/4 |
| tb3__freecad-spring-clip | babysitter (-7.9) | babysitter (41.6) | borderline (-0.4) | babysitter (26.8) | babysitter | 3/4 |
| tb3__freight-dispatch-shift | babysitter (25.9) | babysitter (44.4) | babysitter (36.2) | babysitter (39.8) | babysitter | 4/4 |
| tb3__glycan-ms2-elucidation | borderline (-8.8) | borderline (-7.1) | babysitter (17.2) | borderline (-14.6) | borderline | 3/4 |
| tb3__gpt2-codegolf | babysitter (28.9) | babysitter (43.5) | babysitter (43.5) | babysitter (71.8) | babysitter | 4/4 |
| tb3__gsea-proteomics | babysitter (43.3) | babysitter (53.6) | babysitter (25.9) | babysitter (41.6) | babysitter | 4/4 |
| tb3__heat-pump-warranty | borderline (-7.1) | borderline (-2.5) | borderline (3.3) | babysitter (45) | borderline | 3/4 |
| tb3__hof-topology-interpenetration | babysitter (6.1) | babysitter (17.6) | babysitter (36.2) | babysitter (77) | babysitter | 4/4 |
| tb3__html-js-filter | borderline (-28) | borderline (-25.1) | borderline (-14.8) | borderline (-15.1) | borderline | 4/4 |
| tb3__ico-path-patch | babysitter (18.8) | babysitter (30.3) | babysitter (10.2) | babysitter (33.1) | babysitter | 4/4 |
| tb3__interleaved-vigenere | borderline (-29.3) | borderline (-14.9) | borderline (-4.6) | borderline (-27.8) | borderline | 4/4 |
| tb3__intrastat-meldung | babysitter (7.3) | babysitter (63.4) | babysitter (26.2) | babysitter (50.2) | babysitter | 4/4 |
| tb3__jax-speedrun-gpu | babysitter (39.3) | babysitter (66.5) | babysitter (57.9) | babysitter (67.6) | babysitter | 4/4 |
| tb3__ks-solver-cpp | babysitter (21.7) | babysitter (21.7) | babysitter (43.5) | babysitter (13.2) | babysitter | 4/4 |
| tb3__kv-live-surgery | borderline (-10.1) | borderline (0.2) | babysitter (24.5) | borderline (1.3) | borderline | 3/4 |
| tb3__lake-temp-glm | babysitter (5.6) | babysitter (5.6) | babysitter (24.5) | babysitter (45.6) | babysitter | 4/4 |
| tb3__layout-config-recreation | borderline (-13.2) | borderline (-13.2) | borderline (-7.5) | babysitter (4.6) | borderline | 3/4 |
| tb3__layout-config-recreation2 | babysitter (5.4) | babysitter (10.2) | babysitter (6.1) | babysitter (41.2) | babysitter | 4/4 |
| tb3__lean-midpoint-proof | borderline (8.8) | babysitter (8.8) | babysitter (19.2) | babysitter (50.6) | babysitter | 3/4 |
| tb3__legacy-utility-triage | borderline (2.9) | borderline (-5.4) | borderline (-5.4) | babysitter (22) | borderline | 3/4 |
| tb3__live-database-cutover | babysitter (19.9) | babysitter (24.5) | babysitter (51.7) | babysitter (30.5) | babysitter | 4/4 |
| tb3__math-eval-grader | babysitter (16.5) | babysitter (53.6) | babysitter (50.6) | babysitter (53.6) | babysitter | 4/4 |
| tb3__medical-claims-processing | babysitter (8.6) | babysitter (21.8) | babysitter (8.6) | borderline (-4.2) | babysitter | 3/4 |
| tb3__memcached-backdoor | vanilla (-35.1) | borderline (-20.3) | borderline (-30.5) | vanilla (-40.8) | undecided | 2/4 |
| tb3__mp-checkpoint-consolidation | borderline (7.3) | babysitter (4.4) | borderline (-4.2) | babysitter (45.6) | undecided | 2/4 |
| tb3__music-harmony | vanilla (-35.1) | vanilla (-35.1) | borderline (-24.7) | babysitter (25.1) | undecided | 2/4 |
| tb3__mvcc-lsm-compaction | babysitter (8.4) | borderline (-1.3) | babysitter (4.4) | borderline (-4.4) | undecided | 2/4 |
| tb3__nextjs-performance | borderline (-23.9) | borderline (-26.8) | borderline (-6.7) | borderline (3.6) | borderline | 4/4 |
| tb3__ontology-kg-querying | babysitter (16.3) | babysitter (27.8) | babysitter (27.8) | babysitter (67.8) | babysitter | 4/4 |
| tb3__payments-pipeline-fix | vanilla (-45) | borderline (-19.9) | borderline (-26.1) | borderline (-16.3) | borderline | 3/4 |
| tb3__photonic-waveguide-routing | borderline (-29.3) | borderline (-20.1) | babysitter (5.4) | babysitter (28.5) | undecided | 2/4 |
| tb3__pretrain-shard-corruption | borderline (-19.2) | borderline (-13) | borderline (-17.4) | borderline (-27.8) | borderline | 4/4 |
| tb3__production-planning | babysitter (18.8) | babysitter (24.5) | babysitter (37.4) | babysitter (55.9) | babysitter | 4/4 |
| tb3__protein-autointerp-disulfide | borderline (-30.5) | borderline (-17.2) | borderline (-19) | borderline (-21.8) | borderline | 4/4 |
| tb3__react-lead-form | babysitter (38.7) | babysitter (36.2) | babysitter (9) | babysitter (51.3) | babysitter | 4/4 |
| tb3__retro-console-soc | babysitter (49.2) | babysitter (62.5) | babysitter (62.5) | babysitter (83.9) | babysitter | 4/4 |
| tb3__risk-scorer-replay | babysitter (13) | babysitter (13) | babysitter (18.8) | babysitter (14.2) | babysitter | 4/4 |
| tb3__roy-polymorph-cn | babysitter (7.3) | babysitter (6.1) | borderline (-1.3) | babysitter (27.6) | babysitter | 3/4 |
| tb3__rs-archive-clone | babysitter (53.8) | babysitter (37) | babysitter (43.9) | babysitter (71.1) | babysitter | 4/4 |
| tb3__satb-audio-transcription | babysitter (1.5) | borderline (2.9) | babysitter (46.4) | babysitter (62.1) | babysitter | 3/4 |
| tb3__session-window-debug | vanilla (-33.1) | borderline (-28.5) | borderline (-28.5) | borderline (-18.8) | borderline | 3/4 |
| tb3__sglang-qwen-burst | vanilla (-53.6) | vanilla (-53.6) | vanilla (-43.3) | borderline (-30.6) | vanilla | 3/4 |
| tb3__shadow-relay | borderline (-7.1) | borderline (-7.1) | babysitter (13) | borderline (-15.9) | borderline | 3/4 |
| tb3__sound-change-cascade | babysitter (8.4) | babysitter (24.5) | babysitter (15.9) | babysitter (57.1) | babysitter | 4/4 |
| tb3__takens-embedding-lean | borderline (3.1) | babysitter (17.4) | babysitter (23.8) | babysitter (49.2) | babysitter | 3/4 |
| tb3__telecom-entity-resolution | babysitter (35.3) | babysitter (35.3) | babysitter (24.9) | babysitter (50.4) | babysitter | 4/4 |
| tb3__uefi-bootkit | vanilla (-33.5) | borderline (-18.8) | vanilla (-33.5) | borderline (-19.2) | undecided | 2/4 |
| tb3__vba-userform-port | babysitter (23.4) | babysitter (6.1) | babysitter (39.1) | babysitter (61.7) | babysitter | 4/4 |
| tb3__vf2-speedup-networkx | babysitter (34.5) | babysitter (33.3) | babysitter (34.5) | babysitter (47.3) | babysitter | 4/4 |
| tb3__vllm-deepseek-streaming | vanilla (-47.9) | borderline (-24.5) | vanilla (-43.3) | vanilla (-33.5) | vanilla | 3/4 |
| tb3__vpp-loss-divergence | vanilla (-23.6) | borderline (-27.4) | borderline (-30.6) | vanilla (-36.4) | undecided | 2/4 |
| tb3__wal-recovery-ordering | babysitter (44.4) | babysitter (43.3) | borderline (-4.2) | babysitter (45.6) | babysitter | 3/4 |
| tb3__wdm-design | babysitter (32.8) | babysitter (20.1) | babysitter (34.5) | babysitter (42.7) | babysitter | 4/4 |
