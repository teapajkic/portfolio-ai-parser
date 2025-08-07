const axios = require('axios');

// Example usage of the Portfolio Scraper API
// Make sure the server is running (npm start) before running this example

const API_BASE_URL = 'http://localhost:3000';

async function scrapePortfolioExample() {
  try {
    console.log('🚀 Testing Portfolio Scraper API');
    console.log('================================\n');

    // Test portfolios
    const testUrls = [
      'https://alexanderdavisgrimes.github.io/portfolio.html',
      // Add more test URLs here
    ];

    for (const url of testUrls) {
      console.log(`📊 Scraping: ${url}`);
      console.log('-'.repeat(50));

      const response = await axios.post(`${API_BASE_URL}/scrape-portfolio`, {
        url: url
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.success) {
        const data = response.data.data;
        
        console.log(`✅ Candidate Name: ${data.candidate_name}`);
        console.log(`📝 Bio: ${data.candidate_bio.substring(0, 100)}${data.candidate_bio.length > 100 ? '...' : ''}`);
        console.log(`🖼️  Images Found: ${data.image_urls.length}`);
        console.log(`📄 Resume Links: ${data.resume_pdf_links.length}`);
        console.log(`💼 Projects: ${data.project_summaries.length}`);
        
        if (data.image_urls.length > 0) {
          console.log('\n🖼️  Image URLs:');
          data.image_urls.slice(0, 3).forEach((img, index) => {
            console.log(`   ${index + 1}. ${img}`);
          });
          if (data.image_urls.length > 3) {
            console.log(`   ... and ${data.image_urls.length - 3} more`);
          }
        }

        if (data.resume_pdf_links.length > 0) {
          console.log('\n📄 Resume Links:');
          data.resume_pdf_links.forEach((resume, index) => {
            console.log(`   ${index + 1}. ${resume.text}: ${resume.url}`);
          });
        }

        if (data.project_summaries.length > 0) {
          console.log('\n💼 Projects:');
          data.project_summaries.slice(0, 2).forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.title}`);
            console.log(`      ${project.description.substring(0, 80)}${project.description.length > 80 ? '...' : ''}`);
          });
          if (data.project_summaries.length > 2) {
            console.log(`   ... and ${data.project_summaries.length - 2} more projects`);
          }
        }

        console.log(`\n⏰ Scraped at: ${data.scraped_at}`);
        
      } else {
        console.log('❌ Failed to scrape portfolio');
      }

      console.log('\n' + '='.repeat(70) + '\n');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: Could not connect to the API server.');
      console.error('   Make sure the server is running with: npm start');
    } else if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Health check example
async function healthCheck() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('Portfolio Scraper API Example\n');
  
  // Check if server is running
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.log('\n🔧 To start the server, run: npm start');
    return;
  }

  console.log('');
  await scrapePortfolioExample();
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = { scrapePortfolioExample, healthCheck };