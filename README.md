# Nodebase

Nodebase is a visual canvas for wiring together AI agents, transforms, and tool integrations into repeatable workflows. Drag a start node, add agents (with optional MCP tools), plug in transforms or conditionals, and the runtime orchestrates execution with streaming updates, human approvals, and persistence via Convex.

## Core Capabilities
- Visual workflow builder with Agent, Transform, MCP tool, Loop, Conditional, Approval, and End nodes.
- LangGraph-powered execution that keeps state, streams progress, and handles interrupts.
- Firecrawl MCP tools for live web scraping/search plus Arcade/HTTP integrations for external services.
- Clerk authentication, Convex storage, and tenant-aware API endpoints for automation.

## Quick Start
1. `git clone https://github.com/firecrawl/open-agent-builder.git` (Nodebase lives on this repo) and `npm install`.
2. Run `npm run dev` after setting `NEXT_PUBLIC_CONVEX_URL`, `FIRECRAWL_API_KEY`, and Clerk credentials in `.env.local`.
3. Open the UI, build a workflow, and execute it—results stream in real time and persist in Convex.

For deeper setup details, explore the `app/` directory and the workflow templates under `lib/workflow/templates`.
