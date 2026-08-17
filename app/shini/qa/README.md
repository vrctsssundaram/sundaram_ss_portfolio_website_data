# SHINI QA Gate

This directory contains the deterministic release gate for the private SHINI application. It uses only Node.js built-ins so the audit does not add an npm/runtime dependency or supply-chain requirement.

The gate reconstructs the compressed application, parses every active JavaScript layer, verifies the canonical `/app/shini/` hierarchy, rejects the legacy `/hiden/vasu/` tree, checks central-vault/import/navigation invariants, verifies SHINI presentation controls are isolated from ledger mutation functions, and checks that the public portfolio root remains byte-identical to its protected baseline.

A green workflow is required before promoting SHINI runtime changes.