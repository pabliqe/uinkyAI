import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedPageData {
  title: string;
  description: string;
  h1Count: number;
  imgCount: number;
  imgWithAlt: number;
  linkCount: number;
  formCount: number;
  inputFieldCount: number;
  buttonCount: number;
  hasNavigation: boolean;
  hasFooter: boolean;
  textContent: string;
  hasHttpsProtocol: boolean;
  htmlStructure: string;
  rawHtml: string;
}

/**
 * Error class for CORS-related issues
 */
export class CORSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CORSError';
  }
}

/**
 * Scrape a web page and analyze its content
 */
export const scrapeWebPage = async (url: string): Promise<ScrapedPageData> => {
  try {
    // Set a user agent to avoid being blocked
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Basic data extraction
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
    
    // Text content
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Security and performance
    const hasHttpsProtocol = url.startsWith('https://');
    
    // HTML structure (simplified)
    const htmlStructure = $('html').html()?.substring(0, 1000) || '';
    
    return {
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
      rawHtml: html,
    };
  } catch (error) {
    console.error('Error scraping web page:', error);
    // Identify CORS-related errors
    if (
      error.message.includes('Network Error') || 
      error.message.includes('CORS') || 
      error.message.includes('cross-origin') || 
      error.message.includes('blocked by CORS policy')
    ) {
      throw new CORSError(
        'Unable to access the website directly due to browser security restrictions (CORS). ' +
        'To analyze this website, you would need a server-side solution or browser extension.'
      );
    }
    throw new Error(`Failed to scrape web page: ${error instanceof Error ? error.message : String(error)}`);
  }
};