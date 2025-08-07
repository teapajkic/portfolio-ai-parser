# Portfolio Scraper API

A simple AI-powered web scraping app that extracts structured data from portfolio websites and returns it as JSON. Built with Node.js, Express, Playwright, and Cheerio.

## Features

- 🔍 **Smart Content Extraction**: Automatically identifies and extracts candidate names, bios, project summaries
- 🖼️ **Image Detection**: Finds and catalogues all portfolio images, profile pictures, and visual assets
- 📄 **Resume Detection**: Locates and extracts downloadable PDF resume links
- 🌐 **Universal Compatibility**: Works with any public portfolio website
- 🚀 **Fast & Lightweight**: Uses headless browser for accurate content rendering
- 📊 **Structured Output**: Returns clean, structured JSON data

## API Response Structure

```json
{
  "success": true,
  "data": {
    "candidate_name": "John Doe",
    "candidate_bio": "Passionate web developer with 5 years of experience...",
    "image_urls": [
      "https://example.com/profile.jpg",
      "https://example.com/project1.png"
    ],
    "resume_pdf_links": [
      {
        "url": "https://example.com/resume.pdf",
        "text": "Download Resume"
      }
    ],
    "project_summaries": [
      {
        "title": "E-commerce Platform",
        "description": "Built a full-stack e-commerce solution using React and Node.js..."
      }
    ],
    "scraped_at": "2025-08-07T02:20:24.021Z",
    "source_url": "https://example.com/portfolio"
  }
}
```

## Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd portfolio-scraper-api
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install chromium
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Test the API**
   ```bash
   curl -X POST http://localhost:3000/scrape-portfolio \
     -H "Content-Type: application/json" \
     -d '{"url": "https://alexanderdavisgrimes.github.io/portfolio.html"}'
   ```

### Environment Variables

- `PORT` - Server port (default: 3000)

## API Endpoints

### `POST /scrape-portfolio`

Scrapes a portfolio website and returns structured data.

**Request Body:**
```json
{
  "url": "https://example.com/portfolio"
}
```

**Response:**
- `200` - Success with scraped data
- `400` - Invalid URL format
- `500` - Scraping error

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-07T02:20:24.021Z"
}
```

### `GET /`

API documentation and usage instructions.

## Deployment Options

### 1. Local Deployment

Perfect for development and testing:

```bash
npm install
npx playwright install chromium
npm start
```

### 2. Make.com Integration

The API is designed to work seamlessly with Make.com (formerly Integromat):

1. **Deploy to a cloud service** (Heroku, Railway, DigitalOcean, etc.)
2. **In Make.com, use the HTTP module:**
   - Method: POST
   - URL: `https://your-deployed-app.com/scrape-portfolio`
   - Headers: `Content-Type: application/json`
   - Body: `{"url": "{{portfolio_url}}"}`

3. **Parse the JSON response** in subsequent Make.com modules

### 3. Docker Deployment

```dockerfile
FROM node:18-alpine

# Install dependencies for Playwright
RUN apk add --no-cache chromium

# Set environment variable for Playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Install Playwright
RUN npx playwright install chromium

EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Cloud Platform Deployment

#### Heroku
```bash
heroku create your-app-name
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack.git
heroku buildpacks:add heroku/nodejs
git push heroku main
```

#### Railway
```bash
railway login
railway new
railway up
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables if needed
3. Deploy automatically

## How It Works

1. **Browser Automation**: Uses Playwright to load the portfolio website in a headless browser
2. **Content Parsing**: Extracts HTML content and parses it with Cheerio
3. **Smart Extraction**: Uses CSS selectors and text analysis to identify:
   - Candidate names (h1, .name, #name, etc.)
   - Bio sections (.about, #about, .bio, etc.)
   - Images (all img tags with filtering)
   - Resume links (PDF files and resume-related text)
   - Projects (structured project sections or headings + descriptions)
4. **URL Resolution**: Converts relative URLs to absolute URLs
5. **JSON Response**: Returns structured, clean data

## Supported Portfolio Patterns

The scraper is designed to work with common portfolio patterns:

- **Personal websites** (GitHub Pages, custom domains)
- **Portfolio builders** (Webflow, Squarespace, Wix)
- **Developer portfolios** (React, Vue, static sites)
- **Design portfolios** (Behance-style layouts)
- **Academic portfolios** (Research, publications)

## Customization

### Adding New Extraction Patterns

Modify the helper functions in `index.js`:

- `extractCandidateName()` - Add new name selectors
- `extractCandidateBio()` - Add new bio section patterns
- `extractProjectSummaries()` - Add new project layout patterns

### Filtering Content

Update the filtering logic in:
- `extractImageUrls()` - Add image filtering rules
- `extractResumeLinks()` - Add resume detection patterns

## Limitations

- Requires JavaScript-enabled websites (uses headless browser)
- Rate limiting recommended for production use
- Some heavily dynamic sites may need longer load times
- CAPTCHA-protected sites are not supported

## Testing

Run the included test:

```bash
npm test
```

Or test with a custom URL:

```javascript
const { scrapePortfolio } = require('./test');

async function testCustomUrl() {
  const result = await scrapePortfolio('https://your-portfolio-url.com');
  console.log(JSON.stringify(result, null, 2));
}

testCustomUrl();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the GitHub issues
- Review the API response for error messages
- Ensure the target website is publicly accessible
- Verify Playwright browsers are installed correctly

---

**Happy Scraping! 🕷️✨**
