// Serverless function for sending emails
const emailjs = require('@emailjs/nodejs');

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
    
    // Parse body to get the email data
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
    
    // Check for required fields
    const { to_email, subject, message_html } = body;
    if (!to_email || !message_html) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email address and message content are required' })
      };
    }
    
    // Initialize EmailJS with environment variables
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    });
    
    // Send the email
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email,
        subject: subject || 'UX Heuristics Analysis Results',
        message_html,
      }
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: result.status,
        text: result.text,
        message: 'Email sent successfully'
      })
    };
  } catch (error) {
    console.error('Email sending error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Failed to send email: ${error.message}`
      })
    };
  }
};