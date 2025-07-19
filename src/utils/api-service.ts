import axios from 'axios';
import type { ScrapedPageData } from './web-scraper';

/**
 * Get the API base URL depending on the environment
 */
function getApiBaseUrl(): string {
  // If running in Netlify production
  if (import.meta.env.PROD) {
    return '/.netlify/functions';
  }
  
  // If running in Netlify dev
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '8888') {
    return '/.netlify/functions';
  }
  
  // For local development (assumes function is running on port 9000)
  return 'http://localhost:9000/.netlify/functions';
}

/**
 * Scrape a website using the serverless function
 */
export async function scrapeWebsiteApi(url: string): Promise<ScrapedPageData> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await axios.post(`${baseUrl}/scrape-website`, { url });
    
    return response.data as ScrapedPageData;
  } catch (error) {
    console.error('Error scraping website through API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.data?.error || error.message}`);
    }
    
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : String(error)}`);
  }
}