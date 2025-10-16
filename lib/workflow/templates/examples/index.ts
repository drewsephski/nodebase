/**
 * Example Templates Index
 *
 * This file exports all example templates organized by complexity level.
 * Each example demonstrates specific features and use cases.
 */

import { simpleAgent } from './01-simple-agent';
import { agentWithFirecrawl } from './02-agent-with-firecrawl';
import { scrapeSummarizeDocs } from './03-scrape-summarize-docs';
import { advancedWorkflow } from './04-advanced-workflow';

export const exampleTemplates = {
  'example-01-simple-agent': simpleAgent,
  'example-02-agent-with-firecrawl': agentWithFirecrawl,
  'example-03-scrape-summarize-docs': scrapeSummarizeDocs,
  'example-04-advanced-workflow': advancedWorkflow,
};

export const exampleTemplatesList = [
  {
    id: 'example-01-simple-agent',
    name: 'Example 1: Simple Agent',
    description: 'A basic workflow with one agent that answers questions',
    difficulty: 'beginner',
    estimatedTime: '1-2 minutes',
  },
  {
    id: 'example-02-agent-with-firecrawl',
    name: 'Example 2: Agent with Firecrawl',
    description: 'An agent that can search and scrape the web using Firecrawl',
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
  },
  {
    id: 'example-03-scrape-summarize-docs',
    name: 'Example 3: Scrape, Summarize & Post to Docs',
    description: 'Scrape a website, summarize content, and create a Google Doc',
    difficulty: 'intermediate',
    estimatedTime: '3-5 minutes',
  },
  {
    id: 'example-04-advanced-workflow',
    name: 'Example 4: Advanced Competitive Analysis',
    description: 'Complete workflow using all node types: loops, conditions, approvals, and tools',
    difficulty: 'advanced',
    estimatedTime: '10-15 minutes',
  },
];
