import { Workflow } from './types';
import { saveWorkflow, getWorkflows } from './storage';

/**
 * Initialize default example workflows if none exist
 */
export function initializeDefaultWorkflows() {
  if (typeof window === 'undefined') return;

  const existing = getWorkflows();
  if (existing.length > 0) {
    console.log('✅ Found', existing.length, 'existing workflows');
    return; // Already have workflows
  }

  console.log('📦 Initializing default example workflows...');

  const examples: Workflow[] = [
    {
      id: 'example_web_scraper',
      name: 'Web Scraper Example',
      description: 'Simple example: scrape a URL and extract key info',
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 250, y: 100 },
          data: {
            label: 'Start',
            nodeType: 'start',
            nodeName: 'Start',
            inputVariables: [
              {
                name: 'url',
                type: 'url',
                required: true,
                description: 'Website URL to scrape',
                defaultValue: 'https://firecrawl.dev',
              },
            ],
          },
        },
        {
          id: 'scrape',
          type: 'mcp',
          position: { x: 250, y: 250 },
          data: {
            label: 'Scrape Website',
            nodeType: 'mcp',
            nodeName: 'Scrape Website',
            mcpAction: 'scrape',
            outputField: 'markdown',
            mcpServers: [
              {
                id: 'firecrawl',
                name: 'Firecrawl',
                label: 'firecrawl',
                url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
                authType: 'Access token / API key',
              },
            ],
          },
        },
        {
          id: 'analyze',
          type: 'agent',
          position: { x: 250, y: 400 },
          data: {
            label: 'Analyze Content',
            nodeType: 'agent',
            nodeName: 'Analyze Content',
            name: 'Analyzer',
            instructions: 'Summarize this website in 2-3 sentences. Focus on what they do and their main value proposition.',
            model: 'anthropic/claude-sonnet-4-20250514',
            outputFormat: 'Text',
          },
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 250, y: 550 },
          data: {
            label: 'End',
            nodeType: 'end',
            nodeName: 'End',
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'scrape' },
        { id: 'e2', source: 'scrape', target: 'analyze' },
        { id: 'e3', source: 'analyze', target: 'end' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    {
      id: 'example_search_and_scrape',
      name: 'Search & Scrape Example',
      description: 'Search the web, then scrape top result',
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 250, y: 100 },
          data: {
            label: 'Start',
            nodeType: 'start',
            nodeName: 'Start',
            inputVariables: [
              {
                name: 'query',
                type: 'string',
                required: true,
                description: 'Search query',
                defaultValue: 'AI agent frameworks',
              },
            ],
          },
        },
        {
          id: 'search',
          type: 'mcp',
          position: { x: 250, y: 250 },
          data: {
            label: 'Search Web',
            nodeType: 'mcp',
            nodeName: 'Search Web',
            mcpAction: 'search',
            outputField: 'first',
            mcpServers: [
              {
                id: 'firecrawl',
                name: 'Firecrawl',
                label: 'firecrawl',
                url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
                authType: 'Access token / API key',
              },
            ],
          },
        },
        {
          id: 'transform',
          type: 'transform',
          position: { x: 250, y: 400 },
          data: {
            label: 'Get First URL',
            nodeType: 'transform',
            nodeName: 'Get First URL',
            transformScript: `// Extract URL from first search result
return input.url || input;`,
          },
        },
        {
          id: 'scrape',
          type: 'mcp',
          position: { x: 250, y: 550 },
          data: {
            label: 'Scrape Page',
            nodeType: 'mcp',
            nodeName: 'Scrape Page',
            mcpAction: 'scrape',
            outputField: 'markdown',
            mcpServers: [
              {
                id: 'firecrawl',
                name: 'Firecrawl',
                label: 'firecrawl',
                url: 'https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp',
                authType: 'Access token / API key',
              },
            ],
          },
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 250, y: 700 },
          data: {
            label: 'End',
            nodeType: 'end',
            nodeName: 'End',
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'search' },
        { id: 'e2', source: 'search', target: 'transform' },
        { id: 'e3', source: 'transform', target: 'scrape' },
        { id: 'e4', source: 'scrape', target: 'end' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Save examples
  examples.forEach(workflow => {
    saveWorkflow(workflow);
    console.log('  ✅ Saved:', workflow.name);
  });

  console.log('✅ Initialized', examples.length, 'example workflows');
}
