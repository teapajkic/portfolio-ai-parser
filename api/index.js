// Root endpoint with API documentation for Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use GET.' 
    });
  }
  
  const baseUrl = `https://${req.headers.host}`;
  
  return res.status(200).json({
    message: 'Portfolio Scraper API - Vercel Serverless',
    version: '1.0.0',
    platform: 'vercel',
    endpoints: {
      scrape: {
        method: 'POST',
        url: `${baseUrl}/scrape-portfolio`,
        description: 'Scrape portfolio website and return structured JSON',
        body: {
          url: 'https://example.com/portfolio'
        }
      },
      health: {
        method: 'GET',
        url: `${baseUrl}/health`,
        description: 'Health check endpoint'
      }
    },
    usage: {
      curl_example: `curl -X POST ${baseUrl}/scrape-portfolio -H "Content-Type: application/json" -d '{"url":"https://alexanderdavisgrimes.github.io/portfolio.html"}'`,
      make_com: {
        method: 'POST',
        url: `${baseUrl}/scrape-portfolio`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{"url": "{{portfolio_url}}"}'
      }
    },
    response_format: {
      success: true,
      data: {
        candidate_name: 'string',
        candidate_bio: 'string',
        image_urls: ['string'],
        resume_pdf_links: [{ url: 'string', text: 'string' }],
        project_summaries: [{ title: 'string', description: 'string' }],
        scraped_at: 'ISO 8601 datetime',
        source_url: 'string'
      }
    }
  });
};