console.log('🚀 Starting Portfolio Scraper API...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Node version:', process.version);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cheerio = require('cheerio');

// Try to import playwright, fallback to simple HTTP fetch if not available
let chromium = null;
console.log('🔍 Attempting to load Playwright...');
try {
  const playwright = require('playwright');
  chromium = playwright.chromium;
  console.log('✅ Playwright loaded successfully');
} catch (error) {
  console.log('⚠️ Playwright not available, using simple HTTP fetch fallback');
  console.log('Error details:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Portfolio scraper function with fallback
async function scrapePortfolio(url) {
  try {
    let $;
    
    if (chromium) {
      // Use Playwright if available
      console.log('🚀 Using Playwright for scraping');
      $ = await scrapeWithPlaywright(url);
    } else {
      // Fallback to simple HTTP fetch
      console.log('🌐 Using HTTP fetch fallback');
      $ = await scrapeWithFetch(url);
    }
    
    // Extract candidate name
    const candidateName = extractCandidateName($);
    
    // Extract bio/about section
    const candidateBio = extractCandidateBio($);
    
    // Extract image URLs
    const imageUrls = extractImageUrls($, url);
    
    // Extract PDF resume links
    const resumePdfLinks = extractResumeLinks($, url);
    
    // Extract project summaries
    const projectSummaries = extractProjectSummaries($);
    
    return {
      candidate_name: candidateName,
      candidate_bio: candidateBio,
      image_urls: imageUrls,
      resume_pdf_links: resumePdfLinks,
      project_summaries: projectSummaries,
      scraped_at: new Date().toISOString(),
      source_url: url
    };
    
  } catch (error) {
    console.error('Error scraping portfolio:', error);
    throw new Error(`Failed to scrape portfolio: ${error.message}`);
  }
}

// Playwright scraping method
async function scrapeWithPlaywright(url) {
  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--disable-extensions'
      ]
    };

    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    }

    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const content = await page.content();
    return cheerio.load(content);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Simple HTTP fetch fallback method
async function scrapeWithFetch(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const html = await response.text();
  return cheerio.load(html);
}

// Helper function to extract candidate name
function extractCandidateName($) {
  const selectors = [
    'h1',
    '.name',
    '#name',
    '.title h1',
    '.header h1',
    '.intro h1',
    '.hero h1',
    'title'
  ];
  
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 0 && text.length < 100) {
      // Clean up title tags
      if (selector === 'title') {
        return text.replace(/portfolio|website|home/gi, '').trim();
      }
      return text;
    }
  }
  
  return 'Unknown';
}

// Helper function to extract bio/about section
function extractCandidateBio($) {
  const bioSelectors = [
    '.about',
    '#about',
    '.bio',
    '#bio',
    '.introduction',
    '.intro',
    '.description',
    '.summary'
  ];
  
  let bio = '';
  
  for (const selector of bioSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      bio = element.text().trim();
      if (bio.length > 50) break;
    }
  }
  
  // If no dedicated bio section, look for paragraphs near headings
  if (!bio || bio.length < 50) {
    const aboutHeadings = $('h1, h2, h3, h4').filter((i, el) => 
      /about|bio|introduction|summary/i.test($(el).text())
    );
    
    if (aboutHeadings.length > 0) {
      const firstHeading = aboutHeadings.first();
      const followingP = firstHeading.nextAll('p').first();
      if (followingP.length > 0) {
        bio = followingP.text().trim();
      }
    }
  }
  
  return bio || 'No bio available';
}

// Helper function to extract image URLs
function extractImageUrls($, baseUrl) {
  const images = [];
  const baseUrlObj = new URL(baseUrl);
  
  $('img').each((i, img) => {
    let src = $(img).attr('src');
    if (src) {
      // Convert relative URLs to absolute
      if (src.startsWith('/')) {
        src = `${baseUrlObj.protocol}//${baseUrlObj.host}${src}`;
      } else if (!src.startsWith('http')) {
        src = new URL(src, baseUrl).href;
      }
      
      // Filter out common non-portfolio images
      if (!src.includes('favicon') && 
          !src.includes('icon') && 
          !src.includes('logo') &&
          !src.includes('pixel') &&
          !src.includes('tracking')) {
        images.push(src);
      }
    }
  });
  
  return [...new Set(images)]; // Remove duplicates
}

// Helper function to extract resume PDF links
function extractResumeLinks($, baseUrl) {
  const resumeLinks = [];
  const baseUrlObj = new URL(baseUrl);
  
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    const text = $(link).text().toLowerCase();
    
    if (href && (href.endsWith('.pdf') || text.includes('resume') || text.includes('cv'))) {
      let fullUrl = href;
      
      // Convert relative URLs to absolute
      if (href.startsWith('/')) {
        fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
      } else if (!href.startsWith('http')) {
        fullUrl = new URL(href, baseUrl).href;
      }
      
      resumeLinks.push({
        url: fullUrl,
        text: $(link).text().trim()
      });
    }
  });
  
  return resumeLinks;
}

// Helper function to extract project summaries
function extractProjectSummaries($) {
  const projects = [];
  
  // Look for common project section patterns
  const projectSelectors = [
    '.project',
    '.projects .item',
    '.portfolio-item',
    '.work-item',
    '.case-study'
  ];
  
  for (const selector of projectSelectors) {
    $(selector).each((i, project) => {
      const $project = $(project);
      const title = $project.find('h1, h2, h3, h4, .title').first().text().trim();
      const description = $project.find('p, .description, .summary').first().text().trim();
      
      if (title || description) {
        projects.push({
          title: title || 'Untitled Project',
          description: description || 'No description available'
        });
      }
    });
  }
  
  // If no structured projects found, look for headings followed by descriptions
  if (projects.length === 0) {
    $('h1, h2, h3').each((i, heading) => {
      const $heading = $(heading);
      const title = $heading.text().trim();
      
      // Skip common non-project headings
      if (!/about|contact|bio|skills|experience|education/i.test(title) && title.length > 0) {
        const nextP = $heading.nextAll('p').first();
        const description = nextP.length > 0 ? nextP.text().trim() : '';
        
        if (description.length > 20) {
          projects.push({
            title: title,
            description: description
          });
        }
      }
    });
  }
  
  return projects.slice(0, 10); // Limit to 10 projects
}

// API endpoint
app.post('/scrape-portfolio', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    console.log(`Scraping portfolio: ${url}`);
    const result = await scrapePortfolio(url);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint with usage instructions
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Scraper API',
    usage: 'POST /scrape-portfolio with {"url": "https://example.com"}',
    health: 'GET /health'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Portfolio Scraper API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: POST http://localhost:${PORT}/scrape-portfolio`);
});

module.exports = app;