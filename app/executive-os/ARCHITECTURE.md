# Executive OS Architecture

## Product principle

Executive OS is not another project-management tool. It is an executive operating layer that connects **direction → ownership → execution → evidence → decision → reporting**.

## Operating domains

1. **Execute** — Command Centre, Executive Inbox, Workboard
2. **Direction** — Strategy/OKRs, Portfolio/Projects, Finance/Operations
3. **Control** — Risks/Issues, Decisions, Approvals, Governance
4. **People** — Leadership/Org, Meetings/Agenda, Stakeholders
5. **Intelligence** — Reports/Briefs, Knowledge/Records, Audit
6. **System** — Organization settings, role context, backup/restore

## Production target

### Client
- Responsive PWA, mobile-first interaction and desktop command-centre density
- Offline-safe cached shell
- Role-aware navigation and actions
- Global search / command palette
- Notification centre and deep-linkable records

### Backend
Recommended: dedicated Supabase project (not SHINI's live finance project).

Core production entities:
- organizations
- profiles
- memberships
- roles / permissions
- objectives / key_results / metrics
- portfolios / projects / milestones
- tasks / dependencies / comments
- meetings / agenda_items / actions
- decisions
- risks / issues / mitigations
- approvals / approval_steps
- stakeholders / interactions
- governance_obligations / evidence
- documents / document_versions
- notifications
- audit_events
- executive_reports

Security requirements:
- MFA-ready authentication
- organization-scoped RLS on every exposed table
- role permissions stored in trusted authorization metadata/tables
- immutable audit events for sensitive actions
- attachment access policies
- no service-role credentials in the browser
- separate environments for development and production

## Executive access model

- **C-Suite:** enterprise-wide strategy, financial, portfolio, people, risk and approval authority.
- **H-Suite:** functional portfolio, capacity, delivery, risks, approvals and reporting within delegated scope.
- **D-Suite:** governance, direction, board-level views, material decisions and oversight.

Permissions should be capability-based, not title-only, so one leader can hold multiple delegated authorities.

## Planned phases

- **v0.1:** functional local-first PWA and operating model.
- **v0.2:** dedicated backend, auth, organizations, RBAC/RLS, realtime sync.
- **v0.3:** advanced CRUD, dependencies, comments, attachments, notifications, recurring cadence.
- **v0.4:** executive analytics, automated review packs, PDF/XLSX exports, email/calendar integrations.
- **v1.0:** hardened multi-user production release with admin console, backups, observability and audit controls.
