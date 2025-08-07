// Test Vercel serverless functions locally
const scrapePortfolio = require('./api/scrape-portfolio');
const health = require('./api/health');
const index = require('./api/index');

// Mock request and response objects
function createMockReq(method = 'GET', body = {}, headers = {}) {
  return {
    method,
    body,
    headers: {
      host: 'localhost:3000',
      ...headers
    }
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint');
  console.log('========================');
  
  const req = createMockReq('GET');
  const res = createMockRes();
  
  await health(req, res);
  
  console.log('Status:', res.statusCode);
  console.log('Response:', JSON.stringify(res.body, null, 2));
  console.log('');
}

async function testIndexEndpoint() {
  console.log('📖 Testing Index Endpoint');
  console.log('========================');
  
  const req = createMockReq('GET');
  const res = createMockRes();
  
  await index(req, res);
  
  console.log('Status:', res.statusCode);
  console.log('Response keys:', Object.keys(res.body));
  console.log('Message:', res.body.message);
  console.log('');
}

async function testScrapeEndpoint() {
  console.log('🕷️ Testing Scrape Endpoint');
  console.log('========================');
  
  const req = createMockReq('POST', {
    url: 'https://alexanderdavisgrimes.github.io/portfolio.html'
  });
  const res = createMockRes();
  
  try {
    await scrapePortfolio(req, res);
    
    console.log('Status:', res.statusCode);
    if (res.body.success) {
      console.log('✅ Success! Scraped data:');
      console.log('- Candidate:', res.body.data.candidate_name);
      console.log('- Bio length:', res.body.data.candidate_bio.length);
      console.log('- Images:', res.body.data.image_urls.length);
      console.log('- Resume links:', res.body.data.resume_pdf_links.length);
      console.log('- Projects:', res.body.data.project_summaries.length);
    } else {
      console.log('❌ Failed:', res.body.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');
}

async function runAllTests() {
  console.log('🚀 Testing Vercel Serverless Functions\n');
  
  await testHealthEndpoint();
  await testIndexEndpoint();
  await testScrapeEndpoint();
  
  console.log('✅ All tests completed!');
  console.log('\n💡 To deploy to Vercel:');
  console.log('   npm i -g vercel');
  console.log('   vercel --prod');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testHealthEndpoint, testIndexEndpoint, testScrapeEndpoint };