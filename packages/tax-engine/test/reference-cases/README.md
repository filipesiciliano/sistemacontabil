# Reference cases

Fixtures provided by the tax responsibles (decision D3). They are the answer key of the engine.

- One case per file: `RC-<number>.json` (e.g. `RC-001.json`).
- Files starting with `_` are templates and are only checked for format.
- Format, precision/rounding criteria and the minimum scenario list: `docs/07-casos-de-referencia.md`.
- Schema enforced by `ReferenceCaseSchema` (`packages/tax-engine/src/reference-case/reference-case.schema.ts`).
- Only anonymized and authorized data. Never commit a real CNPJ, name or document.
