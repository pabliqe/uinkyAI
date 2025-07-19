// Serverless function for web scraping
const axios = require('axios');
const cheerio = require('cheerio');

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:8888',
  'https://ux-heuristics-analyzer.netlify.app',
  'https://ai.uink.digital',
  'https://uinkyai.netlify.app'
];

// Handle browser preflight OPTIONS request
function handleCORS(event) {
  const origin = event.headers.origin || event.headers.Origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
  }
  
  // Default headers for other origins
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

exports.handler = async function(event, context) {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: handleCORS(event),
      body: ''
    };
  }

  // CORS headers for actual request
  const headers = handleCORS(event);
  
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
    
    // Parse body to get the URL
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }
    
    // Check if URL is provided
    const url = body.url;
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }
    
    // Make request to target URL
    const response = await axios.get(url, {
      headers: {
        // Use a common browser user-agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000, // 15 second timeout
    });
    
    // Get HTML content
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract data
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const h1Count = $('h1').length;
    
    // Images analysis
    const images = $('img');
    const imgCount = images.length;
    let imgWithAlt = 0;
    
    images.each((_, img) => {
      if ($(img).attr('alt')) {
        imgWithAlt++;
      }
    });
    
    // Links analysis
    const linkCount = $('a').length;
    
    // Form and interactive elements
    const formCount = $('form').length;
    const inputFieldCount = $('input, textarea, select').length;
    const buttonCount = $('button, input[type="button"], input[type="submit"]').length;
    
    // Navigation and structure
    const hasNavigation = $('nav, header, .nav, .navigation, .menu, #menu').length > 0;
    const hasFooter = $('footer, .footer, #footer').length > 0;
    
    // Text content (limited to avoid response size issues)
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
    
    // Security and performance
    const hasHttpsProtocol = url.startsWith('https://');
    
    // HTML structure (simplified)
    const htmlStructure = $('html').html()?.substring(0, 1000) || '';
    
    // Also capture a screenshot using a third-party API
    let screenshot = null;
    try {
      // Use Netlify environment variable for API key
      const apiKey = process.env.SCREENSHOT_API_KEY || 'demo';
      console.log(`Using API key: ${apiKey === 'demo' ? 'demo (default)' : 'from environment'}`);
      
      const screenshotApiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&quality=85&width=1280&height=800&response_type=json&fresh=true`;
      
      console.log(`Requesting screenshot from: ${screenshotApiUrl}`);
      const screenshotResponse = await axios.get(screenshotApiUrl);
      console.log("Screenshot API response:", JSON.stringify(screenshotResponse.data));
      
      if (screenshotResponse.data && screenshotResponse.data.url) {
        // Fetch the actual image and convert to base64
        console.log(`Fetching image from: ${screenshotResponse.data.url}`);
        const imageResponse = await axios.get(screenshotResponse.data.url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        screenshot = imageBuffer.toString('base64');
        console.log(`Screenshot captured successfully (${imageBuffer.length} bytes)`);
      } else {
        console.log("No screenshot URL in response");
      }
    } catch (screenshotError) {
      console.error('Screenshot capture failed:', screenshotError);
      // Continue without a screenshot
    }
    
    // Return the scraped data
    const scrapedData = {
      title,
      description,
      h1Count,
      imgCount,
      imgWithAlt,
      linkCount,
      formCount,
      inputFieldCount,
      buttonCount,
      hasNavigation,
      hasFooter,
      textContent,
      hasHttpsProtocol,
      htmlStructure,
      rawHtml: html.substring(0, 10000), // Limit rawHtml to avoid response size issues
      screenshot
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(scrapedData)
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Failed to scrape website: ${error.message}`,
        url: body ? body.url : 'No URL provided'
      })
    };
  }
};