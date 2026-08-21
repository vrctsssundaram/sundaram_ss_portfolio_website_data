# Vanguard Action Registry (VAR)

**VAR** is a private executive operating system for C-Suite, H-Suite and D-Suite leadership in fast-moving technology organizations.

## Product purpose

VAR centralizes executive actions, projects, OKRs, risks, decisions, approvals, governance obligations, meetings, stakeholders, finance/operations signals, controlled records and audit history in one organization-scoped command system.

## Current staging scope

- Executive command centre and unified attention queue
- Workboard for assignments, ownership, due dates and priorities
- Strategy, objectives, OKRs and KPIs
- Portfolio and project health
- Finance and operations pulse
- Risk and issue register
- Decision register and rationale
- Executive approvals
- Governance and compliance obligations
- Leadership / organization oversight
- Meetings, agendas and follow-up actions
- Stakeholder management
- Reports and executive briefs
- Knowledge / controlled records
- Activity and audit history
- C/H/D-Suite role context
- Responsive phone / tablet / desktop PWA

## Production architecture prepared

The production VAR v0.2 build is a standalone static PWA backed by Supabase Auth and organization-scoped PostgreSQL Row Level Security. VAR-specific database objects are isolated from SHINI and include organizations, memberships, invitations, the unified registry, settings and audit events.

The public web shell contains no executive data and no service-role secret. Only a Supabase publishable key is used in the browser; authorization is enforced in the database.

## Domain

Production target: `https://sundaramss.space`

## Repository status

This folder remains only a staging location. VAR should ultimately live in a dedicated repository and should **not** be merged as the permanent production home inside the portfolio repository.
