# AGENTS.md - Master Plan for RentLens

## Project Overview
**App:** RentLens
**Goal:** An NYC apartment listing evaluator that scores any listing on market value, safety, and commute distance to custom POIs
**Stack:** Next.js + Tailwind (Vercel) → FastAPI (Railway) → Supabase (Postgres) + External APIs
**Current Phase:** Phase 1 - Foundation

## How I Should Think
1. **Understand Intent First**: Identify what the user actually needs
2. **Ask If Unsure**: If critical info is missing, ask before proceeding
3. **Plan Before Coding**: Propose a plan, get approval, then implement
4. **Verify After Changes**: Run tests/checks after each change
5. **Explain As You Go**: User is learning DBs, APIs, and deployment — teach key concepts when building them

## Plan -> Execute -> Verify
1. **Plan:** Outline approach, ask for approval
2. **Execute:** One feature at a time
3. **Verify:** Run tests/checks, fix before moving on

## Context Files
Load only when needed:
- `agent_docs/tech_stack.md` - Tech details, libraries, versions
- `agent_docs/code_patterns.md` - Code style and conventions
- `agent_docs/project_brief.md` - Product vision and rules
- `agent_docs/product_requirements.md` - Features and success criteria
- `agent_docs/testing.md` - Test strategy
- `docs/PRD-RentLens-MVP.md` - Full product requirements
- `docs/TechDesign-RentLens-MVP.md` - Full technical design

## Current State
**Last Updated:** 2026-04-04
**Working On:** Project setup
**Recently Completed:** Research, PRD, Tech Design, Agent Config
**Blocked By:** None

## Roadmap

### Phase 1: Foundation
- [ ] Initialize Next.js frontend with Tailwind
- [ ] Initialize FastAPI backend
- [ ] Set up Supabase project and create tables
- [ ] Download and load HUD FMR data into Supabase
- [ ] Create .gitignore and .env files
- [ ] Basic landing page with form UI (static, no API yet)

### Phase 2: Core Features (one at a time)
- [ ] Market Value Rating (Supabase lookup + calculation)
- [ ] Safety Score (NYC Open Data SODA API + scoring logic)
- [ ] POI Commute Calculator (Google Maps API)
- [ ] Wire up frontend form to backend `/api/evaluate`
- [ ] Results Dashboard (display all scores)

### Phase 3: Polish
- [ ] Form validation and error handling
- [ ] Loading states and UX feedback
- [ ] Mobile responsive styling
- [ ] Collapsible sections on results page
- [ ] Methodology/data source explanations

### Phase 4: Deploy
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Connect to production Supabase
- [ ] Environment variables configured
- [ ] End-to-end test on live URL

## What NOT To Do
- Do NOT add features not in current phase (no accounts, no listing search, no AI features)
- Do NOT delete files without confirmation
- Do NOT modify database schemas without explaining the change
- Do NOT skip error handling for API calls (external APIs can fail)
- Do NOT hardcode API keys — always use environment variables
- Do NOT add save/compare/history features (v2)
- Do NOT over-engineer — this is an MVP portfolio project
