# Multi-model routing comparison

Corpus: 163 tasks · models: 4 · unanimous: 86/163 (52.8%)

## Judge protocol

| model | source | verdict mode | notes |
|---|---|---|---|
| GPT-5.6-terra | `out/models/gpt-5.6-terra/payload.json` | stored | Stored majority recommendation from three judgments per task under the anchored profile. |
| GPT-5.6-sol | `out/models/gpt-5.6-sol/payload.json` | primary-score | One primary judgment per task, effort high, using the same anchored rubric and Terminal-Bench profile. |
| Claude Opus 5 | `out/models/claude-opus-5/payload.json` | primary-score | One judgment per task, effort high. Cross-vendor (Anthropic). 161/163 scored: declined break-filter-js-from-html and crack-7z-hash on content policy. |
| Gemini 2.5 Pro | `out/models/gemini-2.5-pro/payload.json` | primary-score | One judgment per task, effort high. Cross-vendor (Google). 163/163 scored, no refusals. |

Recommendations use each model's configured verdict mode and the shared thresholds where `primary-score` is selected. The score in parentheses is the payload's primary `net_live`; a stored verdict may reflect a panel.

## Recommendation counts

| model | babysitter | borderline | vanilla | mean net_live |
|---|---:|---:|---:|---:|
| GPT-5.6-terra | 50 | 82 | 31 | -2.7 |
| GPT-5.6-sol | 64 | 78 | 21 | 3.9 |
| Claude Opus 5 | 51 | 68 | 42 | -4.2 |
| Gemini 2.5 Pro | 59 | 63 | 41 | -0.6 |

## Pairwise verdict agreement

| | GPT-5.6-terra | GPT-5.6-sol | Claude Opus 5 | Gemini 2.5 Pro |
|---|---:|---:|---:|---:|
| GPT-5.6-terra | 163/163 (100%) | 127/163 (77.9%) | 117/163 (71.8%) | 121/163 (74.2%) |
| GPT-5.6-sol | 127/163 (77.9%) | 163/163 (100%) | 108/163 (66.3%) | 120/163 (73.6%) |
| Claude Opus 5 | 117/163 (71.8%) | 108/163 (66.3%) | 163/163 (100%) | 126/163 (77.3%) |
| Gemini 2.5 Pro | 121/163 (74.2%) | 120/163 (73.6%) | 126/163 (77.3%) | 163/163 (100%) |

## Tasks

| task | GPT-5.6-terra | GPT-5.6-sol | Claude Opus 5 | Gemini 2.5 Pro | consensus | agreement |
|---|---|---|---|---|---|---:|
| tb2.1__adaptive-rejection-sampler | babysitter (37.4) | babysitter (37.4) | babysitter (28.7) | babysitter (47.3) | babysitter | 4/4 |
| tb2.1__bn-fit-modify | babysitter (17.1) | babysitter (17.1) | borderline (8.4) | babysitter (17.1) | babysitter | 3/4 |
| tb2.1__break-filter-js-from-html | vanilla (-46.9) | vanilla (-46.9) | refused (null) | vanilla (-65.5) | vanilla | 3/4 |
| tb2.1__build-cython-ext | vanilla (-34.7) | vanilla (-28.9) | vanilla (-28.9) | vanilla (-45) | vanilla | 4/4 |
| tb2.1__build-pmars | borderline (-2.1) | babysitter (16.5) | borderline (-10.7) | borderline (-2.1) | borderline | 3/4 |
| tb2.1__build-pov-ray | borderline (-20.7) | borderline (6.5) | borderline (-7.5) | babysitter (10.7) | borderline | 3/4 |
| tb2.1__caffe-cifar-10 | babysitter (28) | babysitter (45.2) | babysitter (32.8) | babysitter (22.2) | babysitter | 4/4 |
| tb2.1__cancel-async-tasks | borderline (-10.7) | borderline (-10.7) | borderline (-13.6) | babysitter (13.6) | borderline | 3/4 |
| tb2.1__chess-best-move | vanilla (-26.4) | borderline (-14.9) | borderline (-23.6) | borderline (-4.6) | borderline | 3/4 |
| tb2.1__circuit-fibsqrt | babysitter (42.2) | babysitter (42.2) | babysitter (42.2) | babysitter (29.5) | babysitter | 4/4 |
| tb2.1__cobol-modernization | vanilla (-52.7) | vanilla (-49.8) | vanilla (-42.3) | vanilla (-58.4) | vanilla | 4/4 |
| tb2.1__code-from-image | borderline (-20.7) | vanilla (-26.4) | vanilla (-35.1) | vanilla (-58.4) | vanilla | 3/4 |
| tb2.1__compile-compcert | borderline (-2.1) | borderline (-20.7) | borderline (-10.7) | borderline (-7.9) | borderline | 4/4 |
| tb2.1__configure-git-webserver | borderline (-15.1) | borderline (-15.1) | vanilla (-38.1) | vanilla (-25.5) | undecided | 2/4 |
| tb2.1__constraints-scheduling | vanilla (-33.7) | vanilla (-33.7) | vanilla (-34.1) | vanilla (-44.1) | vanilla | 4/4 |
| tb2.1__count-dataset-tokens | borderline (-26.4) | borderline (-17.2) | vanilla (-58.4) | vanilla (-26.4) | undecided | 2/4 |
| tb2.1__crack-7z-hash | vanilla (-44.1) | vanilla (-44.1) | refused (null) | vanilla (-58.4) | vanilla | 3/4 |
| tb2.1__custom-memory-heap-crash | vanilla (-22) | borderline (-22) | vanilla (-79.9) | vanilla (-77) | vanilla | 3/4 |
| tb2.1__db-wal-recovery | vanilla (-39.3) | vanilla (-27.8) | vanilla (-33.5) | vanilla (-33.5) | vanilla | 4/4 |
| tb2.1__distribution-search | borderline (0.8) | borderline (0.8) | borderline (-7.9) | borderline (-22.2) | borderline | 4/4 |
| tb2.1__dna-assembly | borderline (-4.6) | babysitter (37.2) | borderline (5.4) | borderline (-10.3) | borderline | 3/4 |
| tb2.1__dna-insert | borderline (-14.9) | borderline (-9.2) | vanilla (-41.2) | borderline (7.5) | borderline | 3/4 |
| tb2.1__extract-elf | vanilla (-43.7) | vanilla (-26.4) | vanilla (-52.7) | vanilla (-58.4) | vanilla | 4/4 |
| tb2.1__extract-moves-from-video | vanilla (-29.3) | borderline (-24.7) | borderline (-24.7) | vanilla (-29.3) | undecided | 2/4 |
| tb2.1__feal-differential-cryptanalysis | babysitter (14.2) | borderline (5.6) | borderline (5.6) | borderline (6.9) | borderline | 3/4 |
| tb2.1__feal-linear-cryptanalysis | babysitter (26.1) | babysitter (28.9) | babysitter (36.4) | babysitter (31.8) | babysitter | 4/4 |
| tb2.1__filter-js-from-html | borderline (-5) | borderline (9.4) | borderline (-3.3) | borderline (-5) | borderline | 4/4 |
| tb2.1__financial-document-processor | borderline (-6.9) | borderline (-6.9) | vanilla (-43.5) | borderline (-1.1) | borderline | 3/4 |
| tb2.1__fix-code-vulnerability | borderline (-20.7) | vanilla (-39.3) | borderline (-19) | vanilla (-47.9) | undecided | 2/4 |
| tb2.1__fix-git | vanilla (-71.3) | vanilla (-65.5) | vanilla (-65.5) | vanilla (-71.3) | vanilla | 4/4 |
| tb2.1__fix-ocaml-gc | babysitter (13.2) | babysitter (13.2) | babysitter (10.4) | babysitter (19) | babysitter | 4/4 |
| tb2.1__gcode-to-text | vanilla (-35.1) | vanilla (-29.3) | vanilla (-29.3) | vanilla (-40.8) | vanilla | 4/4 |
| tb2.1__git-leak-recovery | borderline (-20.7) | borderline (-20.7) | vanilla (-52.7) | vanilla (-26.4) | undecided | 2/4 |
| tb2.1__git-multibranch | babysitter (31.6) | babysitter (43.1) | babysitter (23) | babysitter (37.4) | babysitter | 4/4 |
| tb2.1__gpt2-codegolf | babysitter (42.2) | babysitter (42.2) | babysitter (42.2) | babysitter (50.4) | babysitter | 4/4 |
| tb2.1__headless-terminal | vanilla (-29.3) | borderline (-23.6) | vanilla (-27.6) | borderline (-13.6) | undecided | 2/4 |
| tb2.1__hf-model-inference | vanilla (-34.1) | borderline (-6.9) | vanilla (-29.5) | borderline (-21.3) | undecided | 2/4 |
| tb2.1__install-windows-3.11 | babysitter (23) | babysitter (13) | borderline (-1.3) | babysitter (12.6) | babysitter | 3/4 |
| tb2.1__kv-store-grpc | borderline (-6.9) | borderline (-12.7) | borderline (-8.1) | borderline (-12.7) | borderline | 4/4 |
| tb2.1__large-scale-text-editing | borderline (-23.6) | borderline (-23.6) | borderline (-13.2) | vanilla (-32.2) | borderline | 3/4 |
| tb2.1__largest-eigenval | borderline (-17.8) | borderline (-12.1) | borderline (-7.9) | borderline (0.8) | borderline | 4/4 |
| tb2.1__llm-inference-batching-scheduler | borderline (-4.6) | borderline (-4.6) | borderline (-13.2) | borderline (-4.6) | borderline | 4/4 |
| tb2.1__log-summary-date-ranges | borderline (-24.7) | babysitter (19.9) | vanilla (-39.1) | borderline (-1.5) | undecided | 2/4 |
| tb2.1__mailman | borderline (-10.7) | borderline (-0.4) | borderline (5.4) | borderline (5.4) | borderline | 4/4 |
| tb2.1__make-doom-for-mips | borderline (2.7) | babysitter (13) | borderline (-0.2) | borderline (8.4) | borderline | 3/4 |
| tb2.1__make-mips-interpreter | borderline (7.3) | borderline (7.3) | babysitter (10.2) | borderline (7.3) | borderline | 3/4 |
| tb2.1__mcmc-sampling-stan | babysitter (34.1) | babysitter (50.2) | babysitter (23) | babysitter (28.3) | babysitter | 4/4 |
| tb2.1__merge-diff-arc-agi-task | vanilla (-44.1) | borderline (-13.6) | vanilla (-33.7) | vanilla (-44.1) | vanilla | 3/4 |
| tb2.1__model-extraction-relu-logits | borderline (8.4) | borderline (4.4) | borderline (4.4) | borderline (7.3) | borderline | 4/4 |
| tb2.1__modernize-scientific-stack | vanilla (-34.7) | vanilla (-34.7) | vanilla (-33.3) | borderline (-24.7) | vanilla | 3/4 |
| tb2.1__mteb-leaderboard | vanilla (-52.7) | borderline (-9.4) | vanilla (-61.3) | vanilla (-52.7) | vanilla | 3/4 |
| tb2.1__mteb-retrieve | borderline (-20.9) | borderline (-18.4) | vanilla (-39.9) | borderline (6.9) | borderline | 3/4 |
| tb2.1__multi-source-data-merger | borderline (-3.3) | babysitter (21.1) | borderline (-6.1) | babysitter (21.1) | undecided | 2/4 |
| tb2.1__nginx-request-logging | borderline (-2.3) | borderline (3.4) | borderline (-10.9) | borderline (-12.7) | borderline | 4/4 |
| tb2.1__openssl-selfsigned-cert | borderline (-8.1) | borderline (-2.3) | borderline (-20.9) | borderline (-12.7) | borderline | 4/4 |
| tb2.1__overfull-hbox | vanilla (-9.2) | vanilla (-45) | borderline (-7.9) | borderline (-17.8) | undecided | 2/4 |
| tb2.1__password-recovery | vanilla (-29.3) | vanilla (-47.9) | vanilla (-29.3) | vanilla (-47.9) | vanilla | 4/4 |
| tb2.1__path-tracing | babysitter (14.2) | babysitter (14.2) | borderline (5.6) | borderline (-10.1) | undecided | 2/4 |
| tb2.1__path-tracing-reverse | borderline (-23.6) | borderline (-4.6) | vanilla (-26.4) | vanilla (-29.3) | undecided | 2/4 |
| tb2.1__polyglot-c-py | vanilla (-39.9) | borderline (-20.9) | vanilla (-43.9) | vanilla (-39.9) | vanilla | 3/4 |
| tb2.1__polyglot-rust-c | babysitter (-1.7) | borderline (-5.9) | borderline (-15.7) | vanilla (-33.1) | undecided | 2/4 |
| tb2.1__portfolio-optimization | borderline (-17.8) | borderline (-9.2) | borderline (-3.3) | babysitter (13.6) | borderline | 3/4 |
| tb2.1__protein-assembly | borderline (-4.6) | borderline (0) | borderline (-14.4) | babysitter (22.2) | borderline | 3/4 |
| tb2.1__prove-plus-comm | vanilla (-52.7) | borderline (-21.3) | vanilla (-61.3) | vanilla (-58.4) | vanilla | 3/4 |
| tb2.1__pypi-server | borderline (-2.1) | borderline (-2.1) | borderline (2.5) | borderline (-7.9) | borderline | 4/4 |
| tb2.1__pytorch-model-cli | vanilla (-26.4) | borderline (-10.7) | borderline (-15.1) | vanilla (-45.6) | undecided | 2/4 |
| tb2.1__pytorch-model-recovery | vanilla (-32.6) | vanilla (-32.6) | vanilla (-32.6) | vanilla (-32.6) | vanilla | 4/4 |
| tb2.1__qemu-alpine-ssh | borderline (-10.7) | borderline (-5) | vanilla (-52.7) | borderline (-10.7) | borderline | 3/4 |
| tb2.1__qemu-startup | borderline (-10.7) | borderline (-5) | vanilla (-61.3) | borderline (-10.7) | borderline | 3/4 |
| tb2.1__query-optimize | borderline (-3.4) | borderline (-12.1) | vanilla (-26.4) | vanilla (-32.2) | undecided | 2/4 |
| tb2.1__raman-fitting | vanilla (-42.3) | vanilla (-42.3) | vanilla (-51) | vanilla (-42.3) | vanilla | 4/4 |
| tb2.1__regex-chess | babysitter (49.2) | babysitter (65.3) | babysitter (36.4) | babysitter (73.6) | babysitter | 4/4 |
| tb2.1__regex-log | borderline (-19.4) | borderline (-6.1) | borderline (-19.4) | borderline (-13.6) | borderline | 4/4 |
| tb2.1__reshard-c4-data | borderline (-3.4) | borderline (-7.5) | borderline (-13.2) | vanilla (-29.5) | borderline | 3/4 |
| tb2.1__rstan-to-pystan | borderline (-3.1) | borderline (2.7) | borderline (-5.9) | borderline (-8.8) | borderline | 4/4 |
| tb2.1__sam-cell-seg | babysitter (42.2) | babysitter (52.5) | babysitter (33.5) | babysitter (37) | babysitter | 4/4 |
| tb2.1__sanitize-git-repo | borderline (-29.3) | borderline (5.7) | vanilla (-51) | vanilla (-32.8) | undecided | 2/4 |
| tb2.1__schemelike-metacircular-eval | borderline (8.4) | babysitter (24.5) | borderline (1.5) | babysitter (37.4) | undecided | 2/4 |
| tb2.1__sparql-university | babysitter (17.4) | babysitter (22) | babysitter (22) | babysitter (11.7) | babysitter | 4/4 |
| tb2.1__sqlite-db-truncate | borderline (-23.6) | vanilla (-42.1) | vanilla (-26.4) | vanilla (-36.4) | vanilla | 3/4 |
| tb2.1__sqlite-with-gcov | borderline (-2.1) | borderline (-14.9) | vanilla (-28.4) | vanilla (-25.5) | undecided | 2/4 |
| tb2.1__torch-pipeline-parallelism | borderline (2.7) | babysitter (45.6) | babysitter (31.6) | babysitter (39.8) | babysitter | 3/4 |
| tb2.1__torch-tensor-parallelism | babysitter (31.6) | babysitter (50.2) | borderline (8.6) | babysitter (44.4) | babysitter | 3/4 |
| tb2.1__train-fasttext | borderline (-20.7) | borderline (-3.4) | borderline (-17.8) | vanilla (-35.4) | borderline | 3/4 |
| tb2.1__tune-mjcf | borderline (-17.8) | borderline (-12.1) | vanilla (-49.8) | vanilla (-41.2) | undecided | 2/4 |
| tb2.1__video-processing | borderline (-5.9) | borderline (2.7) | borderline (-5.9) | borderline (5.6) | borderline | 4/4 |
| tb2.1__vulnerable-secret | vanilla (-58.4) | vanilla (-49.8) | vanilla (-61.3) | vanilla (-58.4) | vanilla | 4/4 |
| tb2.1__winning-avg-corewars | borderline (1.1) | borderline (-7.5) | borderline (-21.8) | borderline (-7.5) | borderline | 4/4 |
| tb2.1__write-compressor | babysitter (37.6) | babysitter (47.9) | babysitter (23.2) | babysitter (23.2) | babysitter | 4/4 |
| tb3__atrx-vep-crispr | babysitter (38.7) | babysitter (53.1) | babysitter (25.9) | babysitter (39.8) | babysitter | 4/4 |
| tb3__batched-eval-parity | babysitter (13.2) | babysitter (23.6) | babysitter (15) | babysitter (10.4) | babysitter | 4/4 |
| tb3__biped-contact-dynamics | babysitter (23.4) | babysitter (23.4) | babysitter (18.8) | babysitter (47.7) | babysitter | 4/4 |
| tb3__bun-sourcemap-leak | vanilla (-43.3) | vanilla (-37.5) | vanilla (-37.5) | vanilla (-43.3) | vanilla | 4/4 |
| tb3__cad-model | borderline (-20.7) | borderline (2.7) | borderline (-20.7) | borderline (-14.9) | borderline | 4/4 |
| tb3__cargo-flight-dispatch | borderline (-5.5) | borderline (-5.5) | borderline (0.2) | borderline (0.2) | borderline | 4/4 |
| tb3__cli-2ph-simplex | babysitter (26.8) | babysitter (26.8) | borderline (8.2) | babysitter (16.5) | babysitter | 3/4 |
| tb3__coq-block-bound | borderline (8.8) | borderline (8.8) | babysitter (13.4) | babysitter (24.9) | undecided | 2/4 |
| tb3__ctr-optimization | babysitter (19.9) | babysitter (19.9) | babysitter (24.5) | babysitter (25.7) | babysitter | 4/4 |
| tb3__cumulative-layout-shift | borderline (4.8) | babysitter (16.3) | borderline (-6.7) | borderline (6.5) | borderline | 3/4 |
| tb3__data-anonymization | babysitter (42.2) | babysitter (42.2) | babysitter (42.2) | babysitter (42.2) | babysitter | 4/4 |
| tb3__distributed-dedup | babysitter (50.4) | babysitter (26.1) | babysitter (55) | babysitter (66.5) | babysitter | 4/4 |
| tb3__embedding-drift-monitor | borderline (-5.5) | borderline (4.8) | borderline (-3.8) | borderline (0.2) | borderline | 4/4 |
| tb3__erp-procurement-planning | babysitter (18.8) | babysitter (24.5) | babysitter (24.5) | babysitter (30.3) | babysitter | 4/4 |
| tb3__exam-pdf-eval | babysitter (42.2) | babysitter (51.3) | babysitter (47.9) | babysitter (57.1) | babysitter | 4/4 |
| tb3__fin-saccr-rwa | babysitter (25.9) | borderline (6.1) | babysitter (24.9) | babysitter (66.7) | babysitter | 3/4 |
| tb3__fix-uautomizer-soundness | borderline (-5.5) | borderline (-10.1) | borderline (-5.5) | borderline (-4.4) | borderline | 4/4 |
| tb3__foodstuff-beta-activity | borderline (-12.1) | borderline (-13.2) | borderline (-13.2) | borderline (-13.2) | borderline | 4/4 |
| tb3__formal-crypto | babysitter (5.6) | babysitter (14.2) | borderline (5.6) | borderline (2.7) | undecided | 2/4 |
| tb3__fp8-rmsnorm-gemm | babysitter (56.1) | babysitter (47.9) | babysitter (42.2) | babysitter (69) | babysitter | 4/4 |
| tb3__freecad-impeller | babysitter (3.6) | babysitter (11.1) | babysitter (14) | borderline (0.8) | babysitter | 3/4 |
| tb3__freecad-platform-drawing | borderline (-12.1) | borderline (-0.6) | borderline (-10.3) | borderline (-14.9) | borderline | 4/4 |
| tb3__freecad-spring-clip | borderline (6.5) | babysitter (55.9) | babysitter (14) | babysitter (16.5) | babysitter | 3/4 |
| tb3__freight-dispatch-shift | borderline (7.3) | borderline (7.3) | babysitter (13) | babysitter (31.6) | undecided | 2/4 |
| tb3__glycan-ms2-elucidation | borderline (8.4) | borderline (8.4) | babysitter (13) | borderline (8.4) | borderline | 3/4 |
| tb3__gpt2-codegolf | babysitter (37.6) | babysitter (60.7) | babysitter (42.2) | babysitter (56.1) | babysitter | 4/4 |
| tb3__gsea-proteomics | babysitter (57.7) | babysitter (19.4) | babysitter (31.6) | babysitter (54.8) | babysitter | 4/4 |
| tb3__heat-pump-warranty | babysitter (6.1) | babysitter (28) | borderline (3.3) | babysitter (13.6) | babysitter | 3/4 |
| tb3__hof-topology-interpenetration | borderline (7.3) | babysitter (10.7) | babysitter (20.5) | babysitter (46.9) | babysitter | 3/4 |
| tb3__html-js-filter | borderline (-22.2) | borderline (-10.7) | borderline (-3.3) | borderline (-7.9) | borderline | 4/4 |
| tb3__ico-path-patch | borderline (-5.5) | borderline (0.2) | borderline (5.9) | borderline (-10.1) | borderline | 4/4 |
| tb3__interleaved-vigenere | borderline (-6.3) | borderline (4) | borderline (-4.6) | borderline (-0.6) | borderline | 4/4 |
| tb3__intrastat-meldung | borderline (7.3) | babysitter (15.9) | babysitter (23.4) | babysitter (54.8) | babysitter | 3/4 |
| tb3__jax-speedrun-gpu | babysitter (47.9) | babysitter (47.9) | babysitter (39.3) | babysitter (61.9) | babysitter | 4/4 |
| tb3__ks-solver-cpp | babysitter (41.8) | babysitter (38.9) | babysitter (27.8) | babysitter (61.9) | babysitter | 4/4 |
| tb3__kv-live-surgery | borderline (-4.4) | borderline (5.9) | babysitter (18.8) | borderline (-4.4) | borderline | 3/4 |
| tb3__lake-temp-glm | borderline (5.6) | babysitter (14.2) | borderline (5.6) | babysitter (22.8) | undecided | 2/4 |
| tb3__layout-config-recreation | borderline (-4.6) | borderline (-4.6) | borderline (-8.6) | borderline (-13.2) | borderline | 4/4 |
| tb3__layout-config-recreation2 | borderline (-4.6) | babysitter (23.4) | borderline (0) | borderline (-0.6) | borderline | 3/4 |
| tb3__lean-midpoint-proof | babysitter (8.8) | babysitter (17.4) | babysitter (22) | babysitter (31.8) | babysitter | 4/4 |
| tb3__legacy-utility-triage | borderline (-11.1) | babysitter (10.7) | borderline (9) | borderline (-3.6) | borderline | 3/4 |
| tb3__live-database-cutover | babysitter (19.9) | babysitter (24.5) | babysitter (47.9) | babysitter (72.2) | babysitter | 4/4 |
| tb3__math-eval-grader | babysitter (11.9) | babysitter (28) | babysitter (37.7) | babysitter (19.4) | babysitter | 4/4 |
| tb3__medical-claims-processing | vanilla (-30.1) | borderline (-14) | borderline (-4.2) | borderline (-14) | borderline | 3/4 |
| tb3__memcached-backdoor | vanilla (-26.4) | vanilla (-30.3) | vanilla (-29.3) | vanilla (-38.9) | vanilla | 4/4 |
| tb3__mp-checkpoint-consolidation | babysitter (13) | babysitter (17.6) | borderline (-1.3) | borderline (8.4) | undecided | 2/4 |
| tb3__music-harmony | borderline (-14.9) | borderline (5.2) | borderline (-9.2) | borderline (-0.6) | borderline | 4/4 |
| tb3__mvcc-lsm-compaction | borderline (-10.1) | borderline (-10.1) | borderline (-5.5) | borderline (-15.9) | borderline | 4/4 |
| tb3__nextjs-performance | borderline (-6.7) | babysitter (16.3) | borderline (-6.7) | borderline (1.9) | borderline | 3/4 |
| tb3__ontology-kg-querying | babysitter (24.9) | babysitter (42.2) | babysitter (36.4) | babysitter (33.5) | babysitter | 4/4 |
| tb3__payments-pipeline-fix | borderline (-24.9) | borderline (-7.3) | vanilla (-26.1) | borderline (-13.4) | borderline | 3/4 |
| tb3__photonic-waveguide-routing | borderline (-1.7) | borderline (-1.7) | borderline (-19) | borderline (-20.7) | borderline | 4/4 |
| tb3__pretrain-shard-corruption | borderline (-19.2) | borderline (1.3) | borderline (-17.4) | borderline (-22) | borderline | 4/4 |
| tb3__production-planning | babysitter (13) | babysitter (13) | babysitter (24.5) | babysitter (13) | babysitter | 4/4 |
| tb3__protein-autointerp-disulfide | borderline (-1.7) | borderline (-5.7) | borderline (-10.3) | borderline (-4.6) | borderline | 4/4 |
| tb3__react-lead-form | borderline (-15.9) | borderline (-11.3) | borderline (-11.3) | borderline (-11.3) | borderline | 4/4 |
| tb3__retro-console-soc | babysitter (60.7) | babysitter (71.1) | babysitter (62.5) | babysitter (59.6) | babysitter | 4/4 |
| tb3__risk-scorer-replay | borderline (-5.5) | borderline (-5.5) | borderline (0.2) | borderline (-15.9) | borderline | 4/4 |
| tb3__roy-polymorph-cn | babysitter (17.6) | babysitter (17.6) | babysitter (13) | babysitter (10.2) | babysitter | 4/4 |
| tb3__rs-archive-clone | babysitter (35.3) | babysitter (35.3) | babysitter (32.4) | babysitter (45.6) | babysitter | 4/4 |
| tb3__satb-audio-transcription | borderline (7.3) | borderline (3.3) | babysitter (36.4) | borderline (2.7) | borderline | 3/4 |
| tb3__session-window-debug | borderline (-10.1) | borderline (-14.2) | borderline (-14.2) | borderline (-4.4) | borderline | 4/4 |
| tb3__sglang-qwen-burst | vanilla (-42.1) | vanilla (-28.9) | vanilla (-37.5) | vanilla (-36.4) | vanilla | 4/4 |
| tb3__shadow-relay | borderline (-3.1) | babysitter (15.9) | borderline (2.7) | babysitter (13) | undecided | 2/4 |
| tb3__sound-change-cascade | babysitter (18.8) | babysitter (23.4) | babysitter (24.5) | babysitter (14.2) | babysitter | 4/4 |
| tb3__takens-embedding-lean | babysitter (11.7) | babysitter (17.4) | babysitter (27.8) | babysitter (35.3) | babysitter | 4/4 |
| tb3__telecom-entity-resolution | babysitter (16.3) | babysitter (24.9) | babysitter (33.5) | babysitter (53.6) | babysitter | 4/4 |
| tb3__uefi-bootkit | borderline (-30.6) | borderline (-10.1) | vanilla (-33.5) | vanilla (-45) | undecided | 2/4 |
| tb3__vba-userform-port | borderline (7.3) | babysitter (23.4) | babysitter (26.2) | babysitter (11.9) | babysitter | 3/4 |
| tb3__vf2-speedup-networkx | babysitter (28.7) | babysitter (25.9) | babysitter (28.7) | babysitter (28.7) | babysitter | 4/4 |
| tb3__vllm-deepseek-streaming | vanilla (-30.6) | borderline (-14.2) | vanilla (-28.9) | vanilla (-33.5) | vanilla | 3/4 |
| tb3__vpp-loss-divergence | vanilla (-27.8) | borderline (-10.1) | vanilla (-27.8) | vanilla (-39.3) | vanilla | 3/4 |
| tb3__wal-recovery-ordering | borderline (-5.5) | borderline (-5.5) | borderline (-5.5) | borderline (-5.5) | borderline | 4/4 |
| tb3__wdm-design | babysitter (43.1) | babysitter (43.1) | babysitter (28.7) | babysitter (29.9) | babysitter | 4/4 |
