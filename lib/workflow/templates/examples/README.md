# Example Workflow Templates

This directory contains a curated set of example workflow templates that demonstrate the capabilities of the Open Agent Builder platform. Examples progress from simple to complex, helping you learn by doing.

## 🎯 MCP Integration Status

All examples using Firecrawl have been updated to use **Model Context Protocol (MCP)** for tool access.

**Verified Working:**
- ✅ OpenAI (via Responses API)
- ✅ Groq (via Responses API)
- ✅ Anthropic (via Messages API + MCP Beta)

**See:** `/test-scripts/` directory for working MCP test examples.

**Note:** The workflow executor needs to be updated to use `@langchain/mcp-adapters` for these examples to work. The templates define the correct MCP configuration, but the executor currently uses direct LangChain calls which don't support MCP.

## Available Examples

### 1️⃣ Example 1: Simple Agent
**File:** `01-simple-agent.ts`
**Difficulty:** Beginner
**Estimated Time:** 1-2 minutes

The most basic workflow possible - a single agent that answers questions.

**What you'll learn:**
- Basic workflow structure (Start → Agent → End)
- Input variables
- Agent instructions and prompts
- Simple text output

**Test it:**
```bash
curl -N -X POST http://localhost:3000/api/workflow/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "example-01-simple-agent",
    "input": {
      "question": "What are the key benefits of using AI agents?"
    }
  }'
```

---

### 2️⃣ Example 2: Agent with Firecrawl Tool (MCP)
**File:** `02-agent-with-firecrawl.ts`
**Difficulty:** Beginner
**Estimated Time:** 2-3 minutes

An agent equipped with Firecrawl MCP tools for web searching and scraping.

**What you'll learn:**
- How to configure MCP tools on an agent node
- Web search and scraping via Model Context Protocol
- Tool configuration with API keys
- Multi-step agent reasoning with real web data

**MCP Status:** ✅ Verified working with OpenAI, Groq, and Anthropic

**Test it:**
```bash
curl -N -X POST http://localhost:3000/api/workflow/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "example-02-agent-with-firecrawl",
    "input": {
      "search_query": "latest AI developments in 2025"
    }
  }'
```

**Requirements:**
- `FIRECRAWL_API_KEY` environment variable

---

### 3️⃣ Example 3: Scrape, Summarize & Post to Google Docs (MCP + Arcade)
**File:** `03-scrape-summarize-docs.ts`
**Difficulty:** Intermediate
**Estimated Time:** 3-5 minutes

A practical multi-step workflow that scrapes content via MCP, summarizes it, and creates a Google Doc.

**What you'll learn:**
- Multi-agent workflows with MCP tools
- Chaining agents together
- Using Arcade tools for Google Docs integration
- Authorization flows for external services
- Real-world automation patterns

**MCP Status:** ✅ Firecrawl MCP verified working
**Arcade Status:** Requires user authorization flow

**Flow:**
```
Start → Scrape Agent (MCP) → Summarize Agent → Create Doc (Arcade) → End
```

**Test it:**
```bash
curl -N -X POST http://localhost:3000/api/workflow/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "example-03-scrape-summarize-docs",
    "input": {
      "url": "https://www.anthropic.com/news",
      "doc_title": "AI News Summary",
      "user_id": "user_123"
    }
  }'
```

**Requirements:**
- `FIRECRAWL_API_KEY` environment variable
- `ARCADE_API_KEY` environment variable
- User authorization for Google Docs

---

### 4️⃣ Example 4: Advanced Competitive Analysis (Complete Feature Demo)
**File:** `04-advanced-workflow.ts`
**Difficulty:** Advanced
**Estimated Time:** 10-15 minutes

A comprehensive workflow showcasing ALL major node types and advanced patterns with MCP integration.

**What you'll learn:**
- Data transformation nodes (JavaScript execution)
- Loop nodes (for-each patterns)
- Conditional branching (if-else)
- Agents with MCP tools (Firecrawl for research)
- Structured JSON data extraction
- Human approval gates
- Arcade integration (Google Docs)
- Complex state management
- Multi-company analysis workflow

**MCP Status:** ✅ Firecrawl MCP verified working
**Arcade Status:** Requires user authorization flow
**Complexity:** This is a complete reference implementation

**Flow:**
```
Start → Parse Input → Loop (
  Research Company → Quality Check → If-Else (
    Pass → Extract Data
    Fail → Mark Insufficient
  ) → Merge Results
) → Generate Report → Human Approval → Create Doc → End
```

**Features Demonstrated:**
- ✅ Start node with multiple inputs
- ✅ Data transformation (JavaScript)
- ✅ Loop node (iterate over array)
- ✅ Agent with MCP tools
- ✅ If-else conditional logic
- ✅ Structured JSON extraction
- ✅ Human approval gate
- ✅ Arcade tool integration
- ✅ State management across nodes

**Test it:**
```bash
curl -N -X POST http://localhost:3000/api/workflow/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "example-04-advanced-workflow",
    "input": {
      "companies": "OpenAI, Anthropic, Google DeepMind",
      "report_title": "AI Companies Competitive Analysis 2025",
      "user_id": "user_123"
    }
  }'
```

**Requirements:**
- `FIRECRAWL_API_KEY` environment variable
- `ARCADE_API_KEY` environment variable
- User authorization for Google Docs

---

## Testing Examples

### List All Examples
```bash
curl http://localhost:3000/api/workflow/test | jq '.templates[] | select(.id | startswith("example-"))'
```

### Load a Specific Template
```bash
curl http://localhost:3000/api/workflows/test/example-01-simple-agent | jq
```

### Execute with Streaming
All examples support Server-Sent Events (SSE) streaming for real-time updates:

```bash
curl -N -X POST http://localhost:3000/api/workflow/test \
  -H "Content-Type: application/json" \
  -d '{"templateId":"example-01-simple-agent","input":{...}}'
```

The streaming response includes:
- `start` - Workflow initialization
- `node_update` - Real-time node execution updates
- `complete` - Final results
- `error` - Any errors encountered

---

## Environment Setup

Create a `.env.local` file with required API keys:

```env
# Required for examples 2, 3, 4
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Required for examples 3, 4
ARCADE_API_KEY=your_arcade_api_key

# AI Model providers
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

---

## Next Steps

1. **Start Simple:** Run Example 1 to understand basic workflow structure
2. **Add Tools:** Try Example 2 to see how agents use external tools
3. **Build Workflows:** Use Example 3 to learn multi-step automation
4. **Master Advanced Patterns:** Study Example 4 for complex workflows

## Creating Your Own Templates

Use these examples as starting points for your own workflows:

1. Copy an example file
2. Modify the workflow ID and name
3. Adjust the nodes and edges for your use case
4. Test with the streaming API
5. Add to the examples index

---

## Support

- **Documentation:** See main project README
- **Issues:** Report bugs or request features on GitHub
- **Community:** Join discussions and share your workflows

Happy building! 🚀
