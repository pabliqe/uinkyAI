import { createClient } from '@supabase/supabase-js';
import { HeuristicScore } from '@/types/heuristics';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Interface for assessment submission
 */
export interface AssessmentData {
  email: string;
  url: string;
  screenshot: string; // base64 encoded
  scores: Record<string, HeuristicScore>;
  overallScore: number;
}

/**
 * Interface for assessment submission response
 */
export interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    created_at: string;
  };
}

/**
 * Submit an assessment to Supabase
 */
export async function submitAssessment(data: AssessmentData): Promise<SubmissionResponse> {
  try {
    // 1. Insert or get lead (user)
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .upsert({ email: data.email }, { onConflict: 'email' })
      .select('id')
      .single();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      return { success: false, message: `Error saving user: ${leadError.message}` };
    }

    const leadId = leadData.id;

    // 2. Insert or get site
    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .upsert({ url: data.url }, { onConflict: 'url' })
      .select('id')
      .single();

    if (siteError) {
      console.error('Error saving site:', siteError);
      return { success: false, message: `Error saving site: ${siteError.message}` };
    }

    const siteId = siteData.id;

    // 3. Insert request (assessment)
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .insert({
        lead_id: leadId,
        site_id: siteId,
        screenshot: data.screenshot,
        scores: data.scores,
        overall_score: data.overallScore
      })
      .select('id, created_at')
      .single();

    if (requestError) {
      console.error('Error saving assessment:', requestError);
      return { success: false, message: `Error saving assessment: ${requestError.message}` };
    }

    return { 
      success: true, 
      message: 'Assessment saved successfully', 
      data: {
        id: requestData.id,
        created_at: requestData.created_at
      }
    };
  } catch (error) {
    console.error('Unexpected error in submitAssessment:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Interface for assessment retrieval
 */
export interface Assessment {
  id: string;
  url: string;
  screenshot: string;
  scores: Record<string, HeuristicScore>;
  overall_score: number;
  created_at: string;
}

/**
 * Interface for assessment retrieval response
 */
export interface AssessmentsResponse {
  success: boolean;
  message: string;
  data?: Assessment[];
}

/**
 * Get assessments by email
 */
export async function getAssessmentsByEmail(email: string): Promise<AssessmentsResponse> {
  try {
    // First get the lead ID for this email
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (leadError) {
      // If not found, return empty array
      if (leadError.code === 'PGRST116') {
        return { success: true, message: 'No assessments found', data: [] };
      }
      return { success: false, message: `Error finding user: ${leadError.message}` };
    }

    const leadId = leadData.id;

    // Get all requests for this lead with site information
    const { data: requestsData, error: requestsError } = await supabase
      .from('requests')
      .select(`
        id, 
        screenshot, 
        scores, 
        overall_score, 
        created_at,
        sites:site_id (url)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (requestsError) {
      return { success: false, message: `Error retrieving assessments: ${requestsError.message}` };
    }

    // Format the data for the frontend
    const formattedData = requestsData.map(item => ({
      id: item.id,
      url: item.sites.url,
      screenshot: item.screenshot,
      scores: item.scores,
      overall_score: item.overall_score,
      created_at: item.created_at
    }));

    return {
      success: true,
      message: `Found ${formattedData.length} assessments`,
      data: formattedData
    };
  } catch (error) {
    console.error('Unexpected error in getAssessmentsByEmail:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Get a specific assessment by ID
 */
export async function getAssessmentById(id: string): Promise<{ success: boolean; message: string; data?: Assessment }> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id, 
        screenshot, 
        scores, 
        overall_score, 
        created_at,
        sites:site_id (url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, message: `Error retrieving assessment: ${error.message}` };
    }

    const formattedData = {
      id: data.id,
      url: data.sites.url,
      screenshot: data.screenshot,
      scores: data.scores,
      overall_score: data.overall_score,
      created_at: data.created_at
    };

    return {
      success: true,
      message: 'Assessment retrieved successfully',
      data: formattedData
    };
  } catch (error) {
    console.error('Unexpected error in getAssessmentById:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}