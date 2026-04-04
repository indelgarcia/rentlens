# CLAUDE.md - Claude Code Configuration

## Project Context
**App:** RentLens
**Stack:** Next.js + Tailwind (frontend) | FastAPI + Python (backend) | Supabase (database)
**Stage:** MVP Development

## Directives
1. **Master Plan:** Read `AGENTS.md` first for current phase and tasks
2. **Documentation:** Refer to `agent_docs/` for implementation details
3. **Plan-First:** Propose plan, wait for approval before implementing
4. **Incremental:** One feature at a time, verify before moving on
5. **Teach:** Explain DB, API, and deployment concepts as they come up — user is learning these

## Commands

### Frontend (from /frontend)
- `npm run dev` - Start Next.js dev server (port 3000)
- `npm run build` - Build for production
- `npm run lint` - Check code style

### Backend (from /backend)
- `uvicorn app.main:app --reload` - Start FastAPI dev server (port 8000)
- `pip install -r requirements.txt` - Install dependencies

## Commit Style
- Short 1-2 sentence commit messages
- No co-authored-by tags

## Project Structure
```
rentlens/
├── frontend/          # Next.js + Tailwind
├── backend/           # FastAPI + Python
├── docs/              # Research, PRD, Tech Design
├── agent_docs/        # Build instructions
├── AGENTS.md          # Master plan
└── CLAUDE.md          # This file
```
