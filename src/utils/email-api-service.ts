import axios from 'axios';

/**
 * Interface for email sending parameters
 */
interface EmailParams {
  to_email: string;
  subject: string;
  message_html: string;
}

/**
 * Interface for email sending response
 */
interface EmailResponse {
  success: boolean;
  message?: string;
  status?: number;
  text?: string;
  error?: string;
}

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
 * Send an email using the serverless function
 */
export async function sendEmailApi(emailData: EmailParams): Promise<EmailResponse> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await axios.post(`${baseUrl}/send-email`, emailData);
    
    return response.data as EmailResponse;
  } catch (error) {
    console.error('Error sending email through API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data?.error || error.message
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}