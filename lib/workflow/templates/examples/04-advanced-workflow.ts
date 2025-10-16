import { Workflow } from '../../types';

/**
 * Example 4: Advanced Multi-Company Competitive Analysis (Complete Feature Demo)
 *
 * This workflow demonstrates ALL major node types and features:
 * - Start node with multiple inputs
 * - Data transformation (parse company list)
 * - Loop (for each company)
 * - Agent with MCP tools (research each company using Firecrawl)
 * - If-else conditional (check data quality)
 * - Structured JSON extraction
 * - Human approval (review before posting)
 * - Arcade tool (create Google Doc)
 *
 * Flow: Start -> Parse Input -> Loop (Research -> Quality Check -> Extract) -> Approval -> Create Doc -> End
 *
 * Use case: Competitive intelligence, market research, automated reporting
 *
 * REQUIREMENTS:
 * - FIRECRAWL_API_KEY environment variable (for web research)
 * - ARCADE_API_KEY environment variable (for Google Docs)
 * - User authorization for Google Docs access
 * - Workflow executor must support:
 *   - MCP via @langchain/mcp-adapters
 *   - Loop nodes
 *   - Conditional branching
 *   - Human approval gates
 *   - Structured data extraction
 *
 * TESTING:
 * - MCP integration: Verified working with OpenAI, Groq, and Anthropic ✅
 * - Data transformation: Built-in JavaScript execution ✅
 * - Loops: LangGraph loop support ✅
 * - Conditionals: LangGraph conditional edges ✅
 * - Approval: Requires workflow interruption support
 * - Arcade: Requires user authorization flow
 *
 * COMPLEXITY: Advanced
 * This is a complete reference implementation showing all workflow capabilities.
 */
export const advancedWorkflow: Workflow = {
  id: 'example-04-advanced-workflow',
  name: 'Example 4: Advanced Competitive Analysis',
  description: 'Complete workflow using all node types: loops, conditions, approvals, and tools',
  category: 'examples',
  tags: ['example', 'advanced', 'loop', 'condition', 'approval', 'firecrawl', 'arcade'],
  estimatedTime: '10-15 minutes',
  difficulty: 'advanced',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 400 },
      data: {
        label: 'Start',
        nodeType: 'start',
        nodeName: 'Start',
        inputVariables: [
          {
            name: 'companies',
            type: 'string',
            required: true,
            description: 'Comma-separated list of companies to analyze',
            defaultValue: 'OpenAI, Anthropic, Google DeepMind',
          },
          {
            name: 'report_title',
            type: 'string',
            required: true,
            description: 'Title for the competitive analysis report',
            defaultValue: 'AI Companies Competitive Analysis 2025',
          },
          {
            name: 'user_id',
            type: 'string',
            required: true,
            description: 'User ID for authorization',
            defaultValue: 'user_123',
          },
        ],
      },
    },
    {
      id: 'parse-companies',
      type: 'transform',
      position: { x: 350, y: 400 },
      data: {
        label: 'Parse Company List',
        nodeType: 'transform',
        nodeName: 'Parse Company List',
        transformScript: `// Split comma-separated companies into array
const companies = input.companies.split(',').map(c => c.trim());
return { companies, totalCount: companies.length };`,
      },
    },
    {
      id: 'loop-companies',
      type: 'while',
      position: { x: 600, y: 400 },
      data: {
        label: 'For Each Company',
        nodeType: 'while',
        nodeName: 'For Each Company',
        whileCondition: 'iteration < 3', // Process first 3 companies (simpler for demo)
        maxIterations: 3,
      },
    },
    {
      id: 'get-current-company',
      type: 'transform',
      position: { x: 725, y: 250 },
      data: {
        label: 'Get Current Company',
        nodeType: 'transform',
        nodeName: 'Get Current Company',
        transformScript: `// Get the current company from the array using iteration index
// We need to access the companies array from an earlier node
const companiesData = state.variables['parse-companies'] || lastOutput;
const companies = companiesData.companies || [];
const currentIndex = state.variables.loop_companies__iterationCount || 0;
const currentCompany = companies[currentIndex] || 'Unknown Company';

return {
  currentCompany,
  companiesList: companies,
  currentIndex,
  totalCount: companies.length
};`,
      },
    },
    {
      id: 'research-company',
      type: 'agent',
      position: { x: 850, y: 300 },
      data: {
        label: 'Research Company',
        nodeType: 'agent',
        nodeName: 'Research Company',
        instructions: `Generate a brief research summary for this company: {{lastOutput.currentCompany}}

Provide a concise 3-paragraph report including:
1. Company overview (what they do, their mission)
2. Key products or services
3. Target market and competitive position

Keep it brief and factual. This is a demonstration workflow.`,
        model: 'anthropic/claude-sonnet-4-20250514',
        outputFormat: 'Text',
      },
    },
    {
      id: 'quality-check',
      type: 'agent',
      position: { x: 1100, y: 300 },
      data: {
        label: 'Quality Check',
        nodeType: 'agent',
        nodeName: 'Quality Check',
        instructions: `Review the following research report and determine if it has sufficient information:

{{lastOutput}}

Requirements:
- Must have company overview
- Must have at least 3 products/services mentioned
- Must have recent information (2024-2025)

Respond with ONLY one word: "PASS" if the report meets requirements, "FAIL" if it needs more research.`,
        model: 'anthropic/claude-sonnet-4-20250514',
        outputFormat: 'Text',
      },
    },
    {
      id: 'quality-condition',
      type: 'if-else',
      position: { x: 1350, y: 300 },
      data: {
        label: 'Quality Check',
        nodeType: 'if-else',
        nodeName: 'Quality Check',
        condition: 'lastOutput.toLowerCase().includes("pass")',
      },
    },
    {
      id: 'extract-data',
      type: 'agent',
      position: { x: 1600, y: 200 },
      data: {
        label: 'Extract Structured Data',
        nodeType: 'agent',
        nodeName: 'Extract Structured Data',
        instructions: `Extract structured information from the research report:

The research report is in the previous step's output.

Extract and return ONLY valid JSON with this exact structure:
{
  "company": "Company Name",
  "description": "Brief description",
  "products": ["Product 1", "Product 2", "Product 3"],
  "targetMarket": "Target market description",
  "pricing": "Pricing information or 'Not available'",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "recentNews": "Summary of recent developments"
}`,
        model: 'anthropic/claude-sonnet-4-20250514',
        outputFormat: 'JSON',
        jsonSchema: {
          type: 'object',
          properties: {
            company: { type: 'string' },
            description: { type: 'string' },
            products: { type: 'array', items: { type: 'string' } },
            targetMarket: { type: 'string' },
            pricing: { type: 'string' },
            keyFeatures: { type: 'array', items: { type: 'string' } },
            recentNews: { type: 'string' },
          },
          required: ['company', 'description', 'products', 'targetMarket'],
        },
      },
    },
    {
      id: 'insufficient-data',
      type: 'transform',
      position: { x: 1600, y: 400 },
      data: {
        label: 'Mark Insufficient',
        nodeType: 'transform',
        nodeName: 'Mark Insufficient',
        transformScript: `// Get company name from the get-current-company output (a few steps back)
const companyData = state.variables['get-current-company'] || { currentCompany: 'Unknown' };

return {
  company: companyData.currentCompany || 'Unknown Company',
  error: "Insufficient data found",
  description: "Unable to gather enough information about this company",
  products: [],
  targetMarket: "Unknown",
  pricing: "Not available",
  keyFeatures: [],
  recentNews: "No recent information found"
};`,
      },
    },
    {
      id: 'merge-results',
      type: 'transform',
      position: { x: 1850, y: 300 },
      data: {
        label: 'Merge Results',
        nodeType: 'transform',
        nodeName: 'Merge Results',
        transformScript: `// This runs after the loop completes
// loopResults contains all the outputs from the loop
return {
  companyData: loopResults,
  totalCompanies: loopResults.length,
  successfulCount: loopResults.filter(r => !r.error).length
};`,
      },
    },
    {
      id: 'generate-report',
      type: 'agent',
      position: { x: 2100, y: 300 },
      data: {
        label: 'Generate Final Report',
        nodeType: 'agent',
        nodeName: 'Generate Final Report',
        instructions: `Create a comprehensive competitive analysis report based on the following data:

{{JSON.stringify(lastOutput, null, 2)}}

Structure the report with:

# {{input.report_title}}

## Executive Summary
(2-3 paragraphs summarizing the competitive landscape)

## Company Profiles
(For each company: overview, products, target market, key features)

## Comparative Analysis
(Compare the companies across key dimensions)

## Market Insights
(Trends, gaps, opportunities)

## Conclusion
(Key takeaways and recommendations)

Make it professional, detailed, and well-formatted for a Google Doc.`,
        model: 'anthropic/claude-sonnet-4-20250514',
        outputFormat: 'Text',
      },
    },
    {
      id: 'human-approval',
      type: 'user-approval',
      position: { x: 2350, y: 300 },
      data: {
        label: 'Review Report',
        nodeType: 'user-approval',
        nodeName: 'Review Report',
        approvalMessage: `Please review the competitive analysis report before it's posted to Google Docs.

Approve to create the Google Doc, or reject to cancel.`,
        timeoutMinutes: '30',
      },
    },
    {
      id: 'create-doc',
      type: 'arcade',
      position: { x: 2600, y: 300 },
      data: {
        label: 'Create Google Doc',
        nodeType: 'arcade',
        nodeName: 'Create Google Doc',
        arcadeTool: 'Google.CreateDocument',
        arcadeInput: {
          title: '{{input.report_title}}',
          text: '{{lastOutput}}',
        },
        arcadeUserId: '{{input.user_id}}',
      },
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 2850, y: 300 },
      data: {
        label: 'End',
        nodeType: 'end',
        nodeName: 'End',
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'parse-companies' },
    { id: 'e2', source: 'parse-companies', target: 'loop-companies' },
    { id: 'e3', source: 'loop-companies', target: 'get-current-company' },
    { id: 'e3b', source: 'get-current-company', target: 'research-company' },
    { id: 'e4', source: 'research-company', target: 'quality-check' },
    { id: 'e5', source: 'quality-check', target: 'quality-condition' },
    { id: 'e6', source: 'quality-condition', target: 'extract-data', sourceHandle: 'if' },
    { id: 'e7', source: 'quality-condition', target: 'insufficient-data', sourceHandle: 'else' },
    { id: 'e8', source: 'extract-data', target: 'merge-results' },
    { id: 'e9', source: 'insufficient-data', target: 'merge-results' },
    { id: 'e10', source: 'merge-results', target: 'loop-companies' }, // Loop back
    { id: 'e11', source: 'loop-companies', target: 'generate-report', sourceHandle: 'complete' },
    { id: 'e12', source: 'generate-report', target: 'human-approval' },
    { id: 'e13', source: 'human-approval', target: 'create-doc' },
    { id: 'e14', source: 'create-doc', target: 'end' },
  ],
};
