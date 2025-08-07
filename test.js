const { chromium } = require('playwright');
const cheerio = require('cheerio');

// Import the scraper function (we'll copy it here for testing)
async function scrapePortfolio(url) {
  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    const candidateName = extractCandidateName($);
    const candidateBio = extractCandidateBio($);
    const imageUrls = extractImageUrls($, url);
    const resumePdfLinks = extractResumeLinks($, url);
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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

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
      if (selector === 'title') {
        return text.replace(/portfolio|website|home/gi, '').trim();
      }
      return text;
    }
  }
  
  return 'Unknown';
}

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

function extractImageUrls($, baseUrl) {
  const images = [];
  const baseUrlObj = new URL(baseUrl);
  
  $('img').each((i, img) => {
    let src = $(img).attr('src');
    if (src) {
      if (src.startsWith('/')) {
        src = `${baseUrlObj.protocol}//${baseUrlObj.host}${src}`;
      } else if (!src.startsWith('http')) {
        src = new URL(src, baseUrl).href;
      }
      
      if (!src.includes('favicon') && 
          !src.includes('icon') && 
          !src.includes('logo') &&
          !src.includes('pixel') &&
          !src.includes('tracking')) {
        images.push(src);
      }
    }
  });
  
  return [...new Set(images)];
}

function extractResumeLinks($, baseUrl) {
  const resumeLinks = [];
  const baseUrlObj = new URL(baseUrl);
  
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    const text = $(link).text().toLowerCase();
    
    if (href && (href.endsWith('.pdf') || text.includes('resume') || text.includes('cv'))) {
      let fullUrl = href;
      
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

function extractProjectSummaries($) {
  const projects = [];
  
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
  
  if (projects.length === 0) {
    $('h1, h2, h3').each((i, heading) => {
      const $heading = $(heading);
      const title = $heading.text().trim();
      
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
  
  return projects.slice(0, 10);
}

// Test function
async function runTest() {
  const testUrl = 'https://alexanderdavisgrimes.github.io/portfolio.html';
  
  console.log('Testing Portfolio Scraper');
  console.log('========================');
  console.log(`Testing URL: ${testUrl}`);
  console.log('');
  
  try {
    const result = await scrapePortfolio(testUrl);
    console.log('SUCCESS! Scraping results:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('TEST FAILED:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runTest();
}

module.exports = { scrapePortfolio, runTest };