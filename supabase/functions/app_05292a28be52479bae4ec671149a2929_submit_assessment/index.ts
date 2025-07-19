// UX Heuristics Analyzer Edge Function
// This function handles the submission of UX assessment results
// It stores the data in Supabase tables and sends notification emails if configured

import { createClient } from 'npm:@supabase/supabase-js@2';
import { v4 as uuidv4 } from "npm:uuid";

// Initialize request ID for consistent logging throughout the request lifecycle
const requestId = uuidv4();

// Initialize the Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Log basic request info
  console.log(`[${requestId}] ${req.method} request received`);

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  let payload;
  try {
    payload = await req.json();
    console.log(`[${requestId}] Request body size: ${JSON.stringify(payload).length} bytes`);
  } catch (error) {
    console.error(`[${requestId}] Error parsing request body:`, error);
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const { email, url, scores, overallScore, screenshot } = payload;

  // Validate required fields
  if (!email || !url || !scores || overallScore === undefined) {
    console.error(`[${requestId}] Missing required fields`);
    return new Response(
      JSON.stringify({ error: 'Missing required fields: email, url, scores, and overallScore are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    // Step 1: Create or get lead by email
    console.log(`[${requestId}] Creating or getting lead with email: ${email}`);
    let lead = null;
    const { data: existingLead, error: leadError } = await supabase
      .from('app_05292a28be52479bae4ec671149a2929_leads')
      .select('id')
      .eq('email', email)
      .single();

    if (leadError && leadError.code !== 'PGRST116') {
      throw new Error(`Error fetching lead: ${leadError.message}`);
    }

    if (existingLead) {
      lead = existingLead;
      console.log(`[${requestId}] Found existing lead with ID: ${lead.id}`);
    } else {
      const { data: newLead, error: insertLeadError } = await supabase
        .from('app_05292a28be52479bae4ec671149a2929_leads')
        .insert({ email })
        .select('id')
        .single();

      if (insertLeadError) {
        throw new Error(`Error creating lead: ${insertLeadError.message}`);
      }
      lead = newLead;
      console.log(`[${requestId}] Created new lead with ID: ${lead.id}`);
    }

    // Step 2: Create or get site by URL
    console.log(`[${requestId}] Creating or getting site with URL: ${url}`);
    let site = null;
    const { data: existingSite, error: siteError } = await supabase
      .from('app_05292a28be52479bae4ec671149a2929_sites')
      .select('id')
      .eq('url', url)
      .single();

    if (siteError && siteError.code !== 'PGRST116') {
      throw new Error(`Error fetching site: ${siteError.message}`);
    }

    if (existingSite) {
      site = existingSite;
      console.log(`[${requestId}] Found existing site with ID: ${site.id}`);
    } else {
      const { data: newSite, error: insertSiteError } = await supabase
        .from('app_05292a28be52479bae4ec671149a2929_sites')
        .insert({ url })
        .select('id')
        .single();

      if (insertSiteError) {
        throw new Error(`Error creating site: ${insertSiteError.message}`);
      }
      site = newSite;
      console.log(`[${requestId}] Created new site with ID: ${site.id}`);
    }

    // Step 3: Create assessment request
    console.log(`[${requestId}] Creating assessment request`);
    const { data: request, error: requestError } = await supabase
      .from('app_05292a28be52479bae4ec671149a2929_requests')
      .insert({
        lead_id: lead.id,
        site_id: site.id,
        scores,
        overall_score: overallScore,
        screenshot
      })
      .select('id')
      .single();

    if (requestError) {
      throw new Error(`Error creating request: ${requestError.message}`);
    }

    console.log(`[${requestId}] Created assessment request with ID: ${request.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          requestId: request.id,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing assessment:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});