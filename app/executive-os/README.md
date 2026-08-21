# Executive OS — C/H/D-Suite Command System

Executive OS is a responsive, installable PWA for senior leadership of a fast-moving deep-tech / fabless semiconductor company. It consolidates the operating work normally scattered across project management, task trackers, spreadsheets, meeting notes, risk registers, approval workflows, dashboards, document lists, and management reporting.

## v0.1 scope

- Executive command centre and attention queue
- Unified workboard for assignments, due dates, priorities and project linkage
- Strategy, objectives, OKRs and KPI progress
- Portfolio / project health, milestones and programme economics
- Finance and operations executive pulse
- Risk and issue register
- Decision register and institutional rationale
- Executive approval queue
- Governance / compliance obligation tracker
- Leadership and organization capacity view
- Meeting calendar, agenda and follow-up task conversion
- Strategic stakeholder tracker
- Executive operating brief generator
- Knowledge / controlled-record index
- Activity and audit history
- Role-context switching for C-Suite, H-Suite and D-Suite users
- Responsive mobile / tablet / desktop UI
- PWA installability and offline cache
- Local workspace persistence
- JSON backup / restore
- Global command search (`Cmd/Ctrl + K`)

## Architecture choice

v0.1 is deliberately dependency-light: HTML + CSS + JavaScript, matching the proven static-host deployment model used by SHINI while keeping this product isolated. It can deploy directly to Hostinger or any static web host.

The next production layer should add a dedicated backend with multi-user authentication, RBAC, row-level security, audit events, realtime updates, notifications, attachments, organization/workspace tenancy, and server-side reporting. Do **not** point this build at SHINI's finance vault tables.

## Deployment path

Current staging path: `/app/executive-os/` on the feature branch. Once the product name, domain and hosting target are fixed, move this folder to a dedicated repository and deploy the build at the new domain.
