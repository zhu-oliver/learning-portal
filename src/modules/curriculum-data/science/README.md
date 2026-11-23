# Ontario Science and Technology (2022), additional grades

The seven additional grade registries deliberately exclude Grade 4, whose existing
content is unchanged. All explanatory text, questions, paraphrases, and the small
plant-cell SVG are original.

## Research and verification

Primary source: [Ministry curriculum](https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology).
The ministry's [downloads page](https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology/downloads)
was independently opened on 2026-10-11. Its full 179-page 2022 curriculum PDF was
downloaded and extracted for grade-by-grade topic and specific-ID verification:

[The Ontario Curriculum Grades 1–8 – Science and Technology 2022](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/36038265-bd6d-4991-882b-52b4b06c32d0/The%20Ontario%20Curriculum%20Grades%201%E2%80%938%20%E2%80%93%20Science%20and%20Technology%202022_2.pdf).

| Grade | Official specific expectations | Lessons |
|---|---:|---:|
| 1 | 44 | 12 |
| 2 | 41 | 12 |
| 3 | 44 | 12 |
| 5 | 42 | 12 |
| 6 | 44 | 13 |
| 7 | 50 | 13 |
| 8 | 52 | 15 |
| Total | 317 | 89 |

`expectations.ts` contains independent original focus paraphrases, not a list
derived from lesson mappings. `science.test.ts` separately transcribes official
per-grade ranges, checks complete section mappings, tests content anchors and
independent scientific/numerical answers, and validates all interactive answer
references and the original diagram. Run:

```
npm.cmd test -- src\modules\curriculum-data\science\science.test.ts
npm.cmd run typecheck -- --pretty false
```

Each lesson has three teaching sections with practice checks and four independent
final MC questions. Activity banks provide one interactive practice and two
different final activities. Worked reasoning is included in the teaching text;
the authored final scenarios do not repeat practice prompts. STEM skills are
applied in grade-specific scientific models and investigations, not treated as
Grade 4 topics transplanted into other grades.

All practical work requires adult-selected materials and supervision. Models and
supplied data replace risky heat, pressure, mains electricity, ingestion, microbial
culture, biological collection, and real safety-equipment testing. Indigenous
knowledge learning tasks explicitly require adult-selected, named,
community-authored public resources and respect their use guidance. These tasks
are inquiry prompts, not fabricated cultural examples: a family or educator must
select an appropriate resource, and unavailable evidence remains an acknowledged
gap. Classroom models do not certify real structures, drinking water, or medical
conditions.
