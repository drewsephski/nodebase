import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import { getServerAPIKeys } from '@/lib/api/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params, jsonSchema, extractPrompt } = body;

    // Get API keys from server
    const apiKeys = getServerAPIKeys();
    if (!apiKeys?.firecrawl) {
      return NextResponse.json(
        { error: 'Firecrawl API key not configured in .env.local' },
        { status: 500 }
      );
    }

    const firecrawl = new FirecrawlApp({ apiKey: apiKeys.firecrawl });

    let result;

    switch (action) {
      case 'scrape':
        // Check if JSON mode is enabled
        if (jsonSchema && extractPrompt) {
          // Use JSON mode within scrape
          result = await firecrawl.scrape(params.url, {
            formats: [
              {
                type: 'json',
                schema: JSON.parse(jsonSchema),
                prompt: extractPrompt,
              }
            ],
          });
        } else {
          // Regular scrape
          result = await firecrawl.scrape(params.url, {
            formats: params.formats || ['markdown'],
          });
        }
        break;

      case 'search':
        result = await firecrawl.search(params.query, {
          limit: params.limit || 5,
        });
        break;

      case 'map':
        result = await firecrawl.map(params.url);
        break;

      case 'crawl':
        // Check if JSON mode is enabled for crawl
        if (jsonSchema && extractPrompt) {
          const crawlResult = await firecrawl.crawl(params.url, {
            limit: params.limit || 10,
            scrapeOptions: {
              formats: [
                {
                  type: 'json',
                  schema: JSON.parse(jsonSchema),
                  prompt: extractPrompt,
                }
              ],
            },
          });
          result = crawlResult;
        } else {
          const crawlResult = await firecrawl.crawl(params.url, {
            limit: params.limit || 10,
            scrapeOptions: {
              formats: params.formats || ['markdown'],
            },
          });
          result = crawlResult;
        }
        break;

      case 'batch_scrape':
        // Batch scrape multiple URLs
        result = await firecrawl.batchScrape(params.urls);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported: scrape, search, map, crawl, batch_scrape` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
    });
  } catch (error) {
    console.error('Firecrawl execution error:', error);
    return NextResponse.json(
      {
        error: 'Firecrawl execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
