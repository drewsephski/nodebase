import { Workflow } from './types';

/**
 * Yahoo Finance Template
 *
 * Simple, working template - no loops (they have bugs)
 */

const templates: Record<string, Workflow> = {
  // =============================================================================
  // Multi-Company Stock Analysis (Loop Demo)
  // =============================================================================
  'multi-company-stock-analysis': {
    id: 'multi-company-stock-analysis',
    name: 'Multi-Company Stock Analysis (Loop Demo)',
    description: 'Loop through companies, get tickers with structured data, research Yahoo Finance, and summarize',
    category: 'Finance',
    tags: ['finance', 'yahoo', 'stock', 'loop', 'structured-data'],
    difficulty: 'intermediate',
    estimatedTime: '5-7 minutes',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 350 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            {
              name: 'companies',
              type: 'string',
              required: true,
              description: 'Comma-separated company names (e.g., Tesla, Apple, Microsoft)',
              defaultValue: 'Tesla, Apple, Microsoft'
            }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'note',
          label: 'Loop Demo Overview',
          noteText: `Multi-Company Stock Analysis

Demonstrates:
1. Parse company list
2. LOOP through companies
3. Get ticker (structured data)
4. Research Yahoo Finance
5. Collect results
6. Summarize after loop

Watch the execution panel!`,
        },
      },
      {
        id: 'parse-companies',
        type: 'transform',
        position: { x: 350, y: 350 },
        data: {
          nodeType: 'transform',
          label: 'Parse Company List',
          nodeName: 'Parse Company List',
          transformScript: `// Split comma-separated companies into array
const companiesStr = input.companies || '';
const companies = companiesStr.split(',').map(c => c.trim());

const result = {
    companies: companies,
    totalCount: companies.length,
    results: []
};

return result;`,
        },
      },
      {
        id: 'loop-companies',
        type: 'while',
        position: { x: 600, y: 350 },
        data: {
          nodeType: 'while',
          label: 'Loop Companies',
          nodeName: 'Loop Companies',
          whileCondition: 'iteration <= 3',
          maxIterations: 3,
        },
      },
      {
        id: 'get-current-company',
        type: 'transform',
        position: { x: 750, y: 200 },
        data: {
          nodeType: 'transform',
          label: 'Get Current Company',
          nodeName: 'Get Current Company',
          transformScript: `// Get current company from array based on iteration
const companiesData = state.variables?.['parse-companies'] || {};
const companies = companiesData.companies || [];

// Loop iteration starts at 1, but array indices start at 0
// So we use (iteration - 1) for zero-based indexing
const loopIteration = lastOutput?.iteration !== undefined ? lastOutput.iteration : 1;
const currentIndex = loopIteration - 1;
const currentCompany = companies[currentIndex] || 'Unknown Company';

console.log(\`Get Current Company - loopIteration: \${loopIteration}, index: \${currentIndex}, company: \${currentCompany}\`);

const result = {
    currentCompany: currentCompany,
    currentIndex: currentIndex,
    totalCount: companies.length
};

return result;`,
        },
      },
      {
        id: 'get-ticker',
        type: 'agent',
        position: { x: 900, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Get Ticker Symbol',
          nodeName: 'Get Ticker Symbol',
          instructions: `What is the stock ticker symbol for {{lastOutput.currentCompany}}?

Return ONLY valid JSON with this exact structure:
{
  "company": "Company Name",
  "ticker": "TICKER"
}

Example for Tesla:
{
  "company": "Tesla",
  "ticker": "TSLA"
}`,
          model: 'groq/openai/gpt-oss-120b',
          outputFormat: 'JSON',
          jsonOutputSchema: JSON.stringify({
            type: 'object',
            properties: {
              company: { type: 'string' },
              ticker: { type: 'string' }
            },
            required: ['company', 'ticker']
          }),
        },
      },
      {
        id: 'research-yahoo',
        type: 'agent',
        position: { x: 1150, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Research Yahoo Finance',
          nodeName: 'Research Yahoo Finance',
          instructions: `Search Yahoo Finance for ticker {{lastOutput.ticker}} ({{lastOutput.company}}) and gather:

1. Current price
2. Daily change ($ and %)
3. Recent price movement trend (up/down/flat over last week)
4. One key headline if available

Use Firecrawl MCP to search and scrape Yahoo Finance.

Format as a brief summary (3-4 sentences).`,
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'Text',
          mcpTools: [
            {
              name: 'Firecrawl',
              url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
              authType: 'url',
              label: 'Firecrawl',
            }
          ],
        },
      },
      {
        id: 'collect-result',
        type: 'transform',
        position: { x: 1400, y: 250 },
        data: {
          nodeType: 'transform',
          label: 'Collect Result',
          nodeName: 'Collect Result',
          transformScript: `// Get ticker from previous step
const tickerData = state.variables?.['get-ticker'] || {};
const research = lastOutput || 'No research available';

// Create result for this iteration
const resultItem = {
    company: tickerData.company || 'Unknown',
    ticker: tickerData.ticker || 'N/A',
    research: research
};

console.log(\`Collected result for: \${resultItem.company}\`);

// IMPORTANT: Return the accumulated results as a special key
// that will be picked up by the node executor
const result = {
    ...resultItem,
    __appendToLoopResults: resultItem  // Signal to append this to loop results
};

return result;`,
        },
      },
      {
        id: 'prepare-summary-data',
        type: 'transform',
        position: { x: 1500, y: 350 },
        data: {
          nodeType: 'transform',
          label: 'Prepare Summary Data',
          nodeName: 'Prepare Summary Data',
          transformScript: `// Get accumulated loop results from LangGraph state
// Note: state here is the LangGraph state, not WorkflowState
const loopResults = state.loopResults || [];

console.log(\`Preparing summary with loopResults: \${loopResults.length} items\`);
console.log(\`Data: \${JSON.stringify(loopResults, null, 2)}\`);

const result = {
    companies: loopResults,
    totalAnalyzed: loopResults.length,
    message: \`Collected \${loopResults.length} company analyses\`,
    data: loopResults
};

return result;`,
        },
      },
      {
        id: 'generate-summary',
        type: 'agent',
        position: { x: 1750, y: 350 },
        data: {
          nodeType: 'agent',
          label: 'Generate Summary Report',
          nodeName: 'Generate Summary Report',
          instructions: `Create a professional stock analysis summary report using the company data from lastOutput.

The lastOutput contains:
{{JSON.stringify(lastOutput, null, 2)}}

Use the actual company names, tickers, and research summaries from this data to create a comprehensive report.

Format the report as:

# Multi-Company Stock Analysis Report

## Executive Summary
(2-3 sentences about overall market trends from these companies)

## Company Analysis

### [Company 1] (Ticker)
- Current Status: ...
- Price Movement: ...
- Key Insight: ...

### [Company 2] (Ticker)
- Current Status: ...
- Price Movement: ...
- Key Insight: ...

### [Company 3] (Ticker)
- Current Status: ...
- Price Movement: ...
- Key Insight: ...

## Conclusion
(Which company looks strongest/weakest and why - 2-3 sentences)

Make it professional and well-formatted.`,
          model: 'groq/openai/gpt-oss-120b',
          outputFormat: 'Text',
          includeChatHistory: true,
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 1900, y: 350 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'parse-companies' },
      { id: 'e2', source: 'parse-companies', target: 'loop-companies' },
      { id: 'e3', source: 'loop-companies', target: 'get-current-company' },
      { id: 'e4', source: 'get-current-company', target: 'get-ticker' },
      { id: 'e5', source: 'get-ticker', target: 'research-yahoo' },
      { id: 'e6', source: 'research-yahoo', target: 'collect-result' },
      { id: 'e7', source: 'collect-result', target: 'loop-companies' }, // Loop back
      { id: 'e8', source: 'loop-companies', target: 'prepare-summary-data', sourceHandle: 'break' },
      { id: 'e8b', source: 'prepare-summary-data', target: 'generate-summary' },
      { id: 'e9', source: 'generate-summary', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // =============================================================================
  // Yahoo Finance Stock Report
  // =============================================================================
  'yahoo-finance-stock-report': {
    id: 'yahoo-finance-stock-report',
    name: 'Yahoo Finance Stock Report',
    description: 'Research a stock on Yahoo Finance and generate a professional report',
    category: 'Finance',
    tags: ['finance', 'yahoo', 'stock', 'report'],
    difficulty: 'simple',
    estimatedTime: '2-3 minutes',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 250 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol (e.g., NVDA, AAPL, TSLA)', defaultValue: 'NVDA' }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 80 },
        data: {
          nodeType: 'note',
          label: 'Workflow Overview',
          noteText: `Yahoo Finance Stock Report

1. Agent searches Yahoo Finance
2. Uses Firecrawl MCP tools
3. Second agent formats report
4. Professional output

Simple 4-node workflow!`,
        },
      },
      {
        id: 'research',
        type: 'agent',
        position: { x: 350, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Research Stock',
          nodeName: 'Research Stock',
          instructions: 'Search Yahoo Finance for ticker ' + '{{input.ticker}}' + ' and gather:\n- Current price\n- Daily change ($ and %)\n- Market cap\n- P/E ratio\n- 52-week high/low\n- Top 2 recent news headlines\n\nUse Firecrawl MCP to search and scrape the data.',
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'Text',
          mcpTools: [
            {
              name: 'Firecrawl',
              url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
              authType: 'url',
              label: 'Firecrawl',
            }
          ],
        },
      },
      {
        id: 'write-report',
        type: 'agent',
        position: { x: 600, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Write Report',
          nodeName: 'Write Report',
          instructions: 'Write a professional stock analysis report for ' + '{{input.ticker}}' + ' using this research:\n\n' + '{{lastOutput}}' + '\n\nInclude:\n- Executive Summary (3 sentences)\n- Key Metrics table\n- Performance Analysis\n- Recent News Summary\n- Investment Recommendation\n\nMake it professional and well-formatted.',
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'Text',
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 850, y: 250 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'research' },
      { id: 'e2', source: 'research', target: 'write-report' },
      { id: 'e3', source: 'write-report', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // =============================================================================
  // Simple Loop Test (No LLM)
  // =============================================================================
  'simple-loop-test': {
    id: 'simple-loop-test',
    name: 'Simple Loop Test (No LLM)',
    description: 'Test loop functionality with pure transforms - no LLM calls',
    category: 'Testing',
    tags: ['test', 'loop', 'transform'],
    difficulty: 'simple',
    estimatedTime: '10 seconds',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            {
              name: 'items',
              type: 'string',
              required: true,
              description: 'Comma-separated items (e.g., Red, Blue, Green)',
              defaultValue: 'Red, Blue, Green'
            }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 50 },
        data: {
          nodeType: 'note',
          label: 'Test Overview',
          noteText: `Simple Loop Test

No LLM - pure transforms!
Tests loop functionality with data processing.

Fast execution for testing.`,
        },
      },
      {
        id: 'parse-items',
        type: 'transform',
        position: { x: 300, y: 200 },
        data: {
          nodeType: 'transform',
          label: 'Parse Items',
          nodeName: 'Parse Items',
          transformScript: `const items = input.items.split(',').map(i => i.trim());
return {
  items,
  totalCount: items.length,
  runningConcat: '', // Initialize running concatenation
  processedCount: 0   // Track how many we've processed
};`,
        },
      },
      {
        id: 'loop-items',
        type: 'while',
        position: { x: 500, y: 200 },
        data: {
          nodeType: 'while',
          label: 'Loop Items',
          nodeName: 'Loop Items',
          whileCondition: 'iteration <= state.variables["parse-items"].totalCount',
          maxIterations: 10,
        },
      },
      {
        id: 'get-current-item',
        type: 'transform',
        position: { x: 650, y: 100 },
        data: {
          nodeType: 'transform',
          label: 'Get Current Item',
          nodeName: 'Get Current Item',
          transformScript: `const itemsData = state.variables['parse-items'] || {};
const items = itemsData.items || [];
const loopIteration = lastOutput.iteration !== undefined ? lastOutput.iteration : 1;
const currentIndex = loopIteration - 1;
const currentItem = items[currentIndex] || 'No Item';

console.log(\`Loop iteration \${loopIteration}: Processing "\${currentItem}" (index \${currentIndex})\`);

return {
  currentItem,
  currentIndex,
  totalCount: items.length,
  iteration: loopIteration
};`,
        },
      },
      {
        id: 'process-item',
        type: 'transform',
        position: { x: 850, y: 100 },
        data: {
          nodeType: 'transform',
          label: 'Process Item',
          nodeName: 'Process Item',
          transformScript: `const item = lastOutput.currentItem || 'Unknown';
const index = lastOutput.currentIndex || 0;
const iteration = lastOutput.iteration || 1;

// Apply multiple transformations to show data flow
const uppercase = item.toUpperCase();
const reversed = item.split('').reverse().join('');
const withEmoji = \`🎨 \${item} ✨\`;
const charCount = item.length;

console.log(\`  Processed "\${item}" -> "\${uppercase}" (reversed: "\${reversed}")\`);

return {
  item,
  index,
  iteration,
  uppercase,
  reversed,
  withEmoji,
  charCount,
  processedAt: new Date().toISOString()
};`,
        },
      },
      {
        id: 'collect-item',
        type: 'transform',
        position: { x: 1050, y: 100 },
        data: {
          nodeType: 'transform',
          label: 'Collect & Concatenate',
          nodeName: 'Collect & Concatenate',
          transformScript: `const processed = lastOutput || {};

// Get the current running concatenation from parse-items initial state
const parseData = state.variables['parse-items'] || {};
const loopResults = state.loopResults || [];

// Build running concatenation from all previous results
const previousConcat = loopResults.map(r => r.uppercase).join(' + ');
const newConcat = previousConcat ? \`\${previousConcat} + \${processed.uppercase}\` : processed.uppercase;

console.log(\`  Concatenation so far: "\${newConcat}"\`);

const result = {
  original: processed.item,
  uppercase: processed.uppercase,
  reversed: processed.reversed,
  withEmoji: processed.withEmoji,
  charCount: processed.charCount,
  index: processed.index,
  iteration: processed.iteration,
  runningConcat: newConcat,
  processedAt: processed.processedAt
};

return {
  ...result,
  __appendToLoopResults: result
};`,
        },
      },
      {
        id: 'prepare-results',
        type: 'transform',
        position: { x: 1250, y: 200 },
        data: {
          nodeType: 'transform',
          label: 'Prepare Results',
          nodeName: 'Prepare Results',
          transformScript: `const loopResults = state.loopResults || [];

console.log('Loop Complete! Final results:', JSON.stringify(loopResults, null, 2));

// Build comprehensive output showing context was preserved
const uppercaseSummary = loopResults.map(r => r.uppercase).join(' + ');
const reversedSummary = loopResults.map(r => r.reversed).join(' | ');
const emojiSummary = loopResults.map(r => r.withEmoji).join(' ');
const finalConcat = loopResults.length > 0 ? loopResults[loopResults.length - 1].runningConcat : '';

return {
  totalProcessed: loopResults.length,
  results: loopResults,
  uppercaseSummary,
  reversedSummary,
  emojiSummary,
  finalConcatenation: finalConcat,
  summary: \`Processed \${loopResults.length} items: \${uppercaseSummary}\`,
  message: '✨ Context preserved across all iterations! ✨'
};`,
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 1450, y: 200 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'parse-items' },
      { id: 'e2', source: 'parse-items', target: 'loop-items' },
      { id: 'e3', source: 'loop-items', target: 'get-current-item' },
      { id: 'e4', source: 'get-current-item', target: 'process-item' },
      { id: 'e5', source: 'process-item', target: 'collect-item' },
      { id: 'e6', source: 'collect-item', target: 'loop-items' }, // Loop back
      { id: 'e7', source: 'loop-items', target: 'prepare-results', sourceHandle: 'break' },
      { id: 'e8', source: 'prepare-results', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // =============================================================================
  // Amazon Product Research (Simple)
  // =============================================================================
  'amazon-product-research': {
    id: 'amazon-product-research',
    name: 'Amazon Product Research',
    description: 'Research a product on Amazon - get details, reviews, and buying recommendation',
    category: 'E-commerce',
    tags: ['amazon', 'shopping', 'product', 'firecrawl', 'reviews'],
    difficulty: 'simple',
    estimatedTime: '2-3 minutes',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 250 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            {
              name: 'product',
              type: 'string',
              required: true,
              description: 'Product to search for on Amazon (e.g., "mechanical keyboard", "noise cancelling headphones")',
              defaultValue: 'wireless mouse'
            }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 80 },
        data: {
          nodeType: 'note',
          label: 'Workflow Overview',
          noteText: `Amazon Product Research

Simple 3-agent workflow:
1. Search & scrape Amazon
2. Analyze reviews & features
3. Make recommendation

Great for: Shopping decisions, price research`,
        },
      },
      {
        id: 'search-amazon',
        type: 'agent',
        position: { x: 350, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Search & Scrape Amazon',
          nodeName: 'Search & Scrape Amazon',
          instructions: `Search Amazon for: {{input.product}}

1. Use firecrawl_search to find the product on Amazon
2. Identify the most relevant product listing
3. Use firecrawl_scrape on the product page URL
4. Extract key information:
   - Product title
   - Current price
   - Rating (out of 5 stars)
   - Number of reviews
   - Key features/specs
   - Top 3-5 customer review summaries

Return all extracted data in a clear format.`,
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'Text',
          mcpTools: [
            {
              name: 'Firecrawl',
              url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
              authType: 'url',
              label: 'Firecrawl',
            }
          ],
        },
      },
      {
        id: 'analyze-recommend',
        type: 'agent',
        position: { x: 600, y: 250 },
        data: {
          nodeType: 'agent',
          label: 'Analyze & Recommend',
          nodeName: 'Analyze & Recommend',
          instructions: `Analyze this product data and create a buying recommendation:

{{lastOutput}}

Provide:

## Product Overview
(Name, price, rating summary)

## Pros & Cons
Based on reviews and features:
**Pros:**
- (list 3-5 positive aspects)

**Cons:**
- (list 3-5 negative aspects or concerns)

## Value Assessment
Is it worth the price? Compare to typical market prices.

## Recommendation
Clear BUY or SKIP recommendation with reasoning (2-3 sentences).

## Best For
Who would benefit most from this product?`,
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'Text',
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 850, y: 250 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'search-amazon' },
      { id: 'e2', source: 'search-amazon', target: 'analyze-recommend' },
      { id: 'e3', source: 'analyze-recommend', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // =============================================================================
  // Zillow Property Finder (Intermediate)
  // =============================================================================
  'zillow-property-finder': {
    id: 'zillow-property-finder',
    name: 'Zillow Property Finder',
    description: 'Find and compare properties on Zillow matching your criteria',
    category: 'Real Estate',
    tags: ['zillow', 'real-estate', 'property', 'firecrawl', 'loop', 'comparison'],
    difficulty: 'intermediate',
    estimatedTime: '4-6 minutes',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 350 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            {
              name: 'location',
              type: 'string',
              required: true,
              description: 'City and state (e.g., "Austin, TX", "Seattle, WA")',
              defaultValue: 'Austin, TX'
            },
            {
              name: 'max_price',
              type: 'string',
              required: true,
              description: 'Maximum price (e.g., "500000")',
              defaultValue: '500000'
            },
            {
              name: 'min_beds',
              type: 'string',
              required: true,
              description: 'Minimum bedrooms',
              defaultValue: '3'
            }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'note',
          label: 'Workflow Overview',
          noteText: `Zillow Property Finder

Demonstrates:
1. Search Zillow with filters
2. Parse property listings
3. LOOP through top properties
4. Scrape & analyze each
5. Generate comparison report

Intermediate complexity with loops!`,
        },
      },
      {
        id: 'search-zillow',
        type: 'agent',
        position: { x: 350, y: 350 },
        data: {
          nodeType: 'agent',
          label: 'Search Zillow',
          nodeName: 'Search Zillow',
          instructions: 'Search Zillow for properties matching:\n' +
'- Location: {{input.location}}\n' +
'- Max Price: ${{input.max_price}}\n' +
'- Min Bedrooms: {{input.min_beds}}\n' +
'\n' +
'Use firecrawl_search to find properties on Zillow.\n' +
'Then use firecrawl_scrape on the Zillow search results page.\n' +
'\n' +
'Extract and return a JSON array of the top 5 properties with:\n' +
'{\n' +
'  "properties": [\n' +
'    {\n' +
'      "address": "123 Main St",\n' +
'      "price": 450000,\n' +
'      "beds": 3,\n' +
'      "baths": 2,\n' +
'      "sqft": 1800,\n' +
'      "zillow_url": "https://www.zillow.com/..."\n' +
'    }\n' +
'  ]\n' +
'}\n' +
'\n' +
'Return ONLY the JSON, no other text.',
          model: 'anthropic/claude-sonnet-4-20250514',
          outputFormat: 'JSON',
          jsonOutputSchema: JSON.stringify({
            type: 'object',
            properties: {
              properties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    address: { type: 'string' },
                    price: { type: 'number' },
                    beds: { type: 'number' },
                    baths: { type: 'number' },
                    sqft: { type: 'number' },
                    zillow_url: { type: 'string' }
                  }
                }
              }
            }
          }),
          mcpTools: [
            {
              name: 'Firecrawl',
              url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
              authType: 'url',
              label: 'Firecrawl',
            }
          ],
        },
      },
      {
        id: 'parse-properties',
        type: 'transform',
        position: { x: 600, y: 350 },
        data: {
          nodeType: 'transform',
          label: 'Parse Properties',
          nodeName: 'Parse Properties',
          transformScript: `// Parse the property listings - handle both pure JSON and markdown-wrapped JSON
let data;
if (typeof lastOutput === 'string') {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = lastOutput.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\\s*\`\`\`/);
  if (jsonMatch) {
    data = JSON.parse(jsonMatch[1]);
  } else {
    // Try to parse directly
    data = JSON.parse(lastOutput);
  }
} else {
  data = lastOutput;
}

const properties = data.properties || [];

console.log(\`Found \${properties.length} properties to analyze\`);

return {
  properties,
  totalCount: properties.length,
  location: input.location
};`,
        },
      },
      {
        id: 'loop-properties',
        type: 'while',
        position: { x: 850, y: 350 },
        data: {
          nodeType: 'while',
          label: 'Loop Properties',
          nodeName: 'Loop Properties',
          whileCondition: 'iteration <= state.variables["parse-properties"].totalCount',
          maxIterations: 5,
        },
      },
      {
        id: 'get-current-property',
        type: 'transform',
        position: { x: 1000, y: 200 },
        data: {
          nodeType: 'transform',
          label: 'Get Current Property',
          nodeName: 'Get Current Property',
          transformScript: `const propertiesData = state.variables['parse-properties'] || {};
const properties = propertiesData.properties || [];

const loopIteration = lastOutput.iteration !== undefined ? lastOutput.iteration : 1;
const currentIndex = loopIteration - 1;
const property = properties[currentIndex] || {};

console.log(\`🏠 Analyzing property \${loopIteration}: \${property.address}\`);

return {
  ...property,
  currentIndex,
  iteration: loopIteration
};`,
        },
      },
      {
        id: 'analyze-property',
        type: 'agent',
        position: { x: 1200, y: 200 },
        data: {
          nodeType: 'agent',
          label: 'Analyze Property',
          nodeName: 'Analyze Property',
          instructions: 'Analyze this property:\n' +
'\n' +
'Address: {{lastOutput.address}}\n' +
'Price: ${{lastOutput.price}}\n' +
'Beds: {{lastOutput.beds}} | Baths: {{lastOutput.baths}}\n' +
'Square Feet: {{lastOutput.sqft}}\n' +
'URL: {{lastOutput.zillow_url}}\n' +
'\n' +
'Use firecrawl_scrape to get more details from the Zillow URL if needed.\n' +
'\n' +
'Provide analysis:\n' +
'\n' +
'**Value Assessment:**\n' +
'- Price per sqft: $[calculate]\n' +
'- Value rating: [Good/Fair/Poor Deal]\n' +
'\n' +
'**Property Highlights:**\n' +
'- [2-3 key features or concerns]\n' +
'\n' +
'**Investment Potential:**\n' +
'- [Brief assessment for rental/resale]\n' +
'\n' +
'Keep it concise (3-4 sentences total).',
          model: 'groq/openai/gpt-oss-120b',
          outputFormat: 'Text',
          mcpTools: [
            {
              name: 'Firecrawl',
              url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
              authType: 'url',
              label: 'Firecrawl',
            }
          ],
        },
      },
      {
        id: 'collect-property',
        type: 'transform',
        position: { x: 1400, y: 200 },
        data: {
          nodeType: 'transform',
          label: 'Collect Result',
          nodeName: 'Collect Result',
          transformScript: `const propertyData = state.variables['get-current-property'] || {};
const analysis = lastOutput || 'No analysis available';

const result = {
  address: propertyData.address,
  price: propertyData.price,
  beds: propertyData.beds,
  baths: propertyData.baths,
  sqft: propertyData.sqft,
  url: propertyData.zillow_url,
  analysis: analysis,
  pricePerSqft: propertyData.sqft > 0 ? Math.round(propertyData.price / propertyData.sqft) : 0
};

console.log(\`Collected analysis for: \${result.address}\`);

return {
  ...result,
  __appendToLoopResults: result
};`,
        },
      },
      {
        id: 'prepare-comparison',
        type: 'transform',
        position: { x: 1550, y: 350 },
        data: {
          nodeType: 'transform',
          label: 'Prepare Comparison',
          nodeName: 'Prepare Comparison',
          transformScript: `const loopResults = state.loopResults || [];

console.log(\`Preparing comparison of \${loopResults.length} properties\`);

// Sort by price per sqft (best value first)
const sorted = [...loopResults].sort((a, b) => a.pricePerSqft - b.pricePerSqft);

return {
  properties: sorted,
  totalAnalyzed: loopResults.length,
  bestValue: sorted[0],
  location: state.variables['parse-properties']?.location || 'Unknown'
};`,
        },
      },
      {
        id: 'generate-report',
        type: 'agent',
        position: { x: 1800, y: 350 },
        data: {
          nodeType: 'agent',
          label: 'Generate Report',
          nodeName: 'Generate Comparison Report',
          instructions: `Create a property comparison report for {{lastOutput.location}}:

Properties analyzed: {{lastOutput.totalAnalyzed}}

Property data:
{{JSON.stringify(lastOutput.properties, null, 2)}}

Format as:

# Property Comparison Report - {{lastOutput.location}}

## Top Recommendation
[Best value property with reasoning]

## All Properties (Ranked by Value)

### 1. [Address]
- **Price:** $[price] | **$/sqft:** $[pricePerSqft]
- **Specs:** [beds] bed, [baths] bath, [sqft] sqft
- **Analysis:** [analysis]
- **Link:** [url]

[Repeat for each property...]

## Summary
[2-3 sentences on market insights and recommendations]`,
          model: 'groq/openai/gpt-oss-120b',
          outputFormat: 'Text',
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 2050, y: 350 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'search-zillow' },
      { id: 'e2', source: 'search-zillow', target: 'parse-properties' },
      { id: 'e3', source: 'parse-properties', target: 'loop-properties' },
      { id: 'e4', source: 'loop-properties', target: 'get-current-property' },
      { id: 'e5', source: 'get-current-property', target: 'analyze-property' },
      { id: 'e6', source: 'analyze-property', target: 'collect-property' },
      { id: 'e7', source: 'collect-property', target: 'loop-properties' },
      { id: 'e8', source: 'loop-properties', target: 'prepare-comparison', sourceHandle: 'break' },
      { id: 'e9', source: 'prepare-comparison', target: 'generate-report' },
      { id: 'e10', source: 'generate-report', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // =============================================================================
  // Human-in-the-Loop Approval Demo
  // =============================================================================
  'human-in-loop-approval': {
    id: 'human-in-loop-approval',
    name: 'Human-in-the-Loop Approval Demo',
    description: 'Test workflow pausing for human approval with Convex real-time updates',
    category: 'Demo',
    tags: ['approval', 'human-in-loop', 'convex', 'demo'],
    difficulty: 'simple',
    estimatedTime: '30 seconds + your approval time',
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 100, y: 250 },
        data: {
          nodeType: 'start',
          label: 'Start',
          nodeName: 'Start',
          inputVariables: [
            {
              name: 'task',
              type: 'string',
              required: true,
              description: 'What task should we ask approval for?',
              defaultValue: 'Send 100 emails to customers'
            }
          ],
        },
      },
      {
        id: 'note-overview',
        type: 'note',
        position: { x: 100, y: 80 },
        data: {
          nodeType: 'note',
          label: 'Demo Overview',
          noteText: `Human-in-the-Loop Approval

Tests Convex real-time approvals:
1. Workflow analyzes task
2. PAUSES for your approval
3. You approve/reject in UI
4. Workflow resumes instantly
5. Executes approved task

Watch execution panel!`,
        },
      },
      {
        id: 'analyze-task',
        type: 'transform',
        position: { x: 350, y: 250 },
        data: {
          nodeType: 'transform',
          label: 'Analyze Task',
          nodeName: 'Analyze Task',
          transformScript: `const task = input.task || 'Unknown task';

// Simulate analysis
const analysis = {
  task: task,
  risk: task.toLowerCase().includes('delete') ? 'HIGH' :
        task.toLowerCase().includes('email') ? 'MEDIUM' : 'LOW',
  estimated_time: '5 minutes',
  reversible: !task.toLowerCase().includes('delete'),
  requires_approval: true,
};

return {
  ...analysis,
  message: \`Task analyzed: \${task}\`,
  recommendation: analysis.risk === 'HIGH' ? 'Careful review needed' : 'Should be safe'
};`,
        },
      },
      {
        id: 'request-approval',
        type: 'user-approval',
        position: { x: 600, y: 250 },
        data: {
          nodeType: 'user-approval',
          label: 'Request Approval',
          nodeName: 'Request Human Approval',
          approvalMessage: 'TASK ANALYSIS COMPLETE\n\nTask: {{analyze-task.task}}\nRisk Level: {{analyze-task.risk}}\nEstimated Time: {{analyze-task.estimated_time}}\nReversible: {{analyze-task.reversible}}\n\nRecommendation: {{analyze-task.recommendation}}\n\nDo you approve this task?',
        },
      },
      {
        id: 'execute-task',
        type: 'transform',
        position: { x: 850, y: 250 },
        data: {
          nodeType: 'transform',
          label: 'Execute Task',
          nodeName: 'Execute Approved Task',
          transformScript: `const taskInfo = state.variables['analyze-task'] || {};

return {
  status: 'completed',
  task: taskInfo.task,
  executed_at: new Date().toISOString(),
  approved_by: 'user',
  result: \`Successfully executed: \${taskInfo.task}\`,
  message: 'Task completed after approval'
};`,
        },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 1100, y: 250 },
        data: {
          nodeType: 'end',
          label: 'End',
          nodeName: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'analyze-task' },
      { id: 'e2', source: 'analyze-task', target: 'request-approval' },
      { id: 'e3', source: 'request-approval', target: 'execute-task' },
      { id: 'e4', source: 'execute-task', target: 'end' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export function getTemplate(templateId: string): Workflow | null {
  return templates[templateId] || null;
}

export function listTemplates(): Array<{
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: string;
}> {
  return Object.values(templates).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    tags: t.tags,
    difficulty: t.difficulty,
    estimatedTime: t.estimatedTime,
  }));
}
