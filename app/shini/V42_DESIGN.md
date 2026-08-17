# SHINI v4.2 — Data Integrity & CRUD

Design invariants for this release:

1. Destructive actions require a separate deletion credential; plaintext deletion credentials are never stored.
2. Referenced definitions cannot be hard-deleted without an explicit same-domain replacement/remap; system definitions are archive-only.
3. Transaction deletion reverses account/debt effects and creates a tombstone so a later statement import does not silently recreate the deleted row.
4. Imported master data uses stable IDs and merge semantics that preserve fields explicitly edited by the user.
5. Notification resolution state is stored independently from inferred alerts, so later imports can reconcile rather than erase manual resolution.
6. Every editable domain has create/edit/archive/delete or a deliberate safer substitute.
7. Document/identity records store metadata and masked references by default, not document images or full sensitive identifiers.
8. Cross-module references are audited before release; invalid IDs, dangling references, duplicate IDs and unsafe remaps are release blockers.
