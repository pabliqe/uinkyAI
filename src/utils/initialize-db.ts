import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Initialize the database schema in Supabase
 * This script can be run manually or through the application
 */
export async function initializeDatabase() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return { success: false, message: 'Missing Supabase credentials' };
    }
    
    // Initialize Supabase client with service key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Read SQL schema file
    const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql });
    
    if (error) {
      console.error('Error initializing database:', error);
      return { success: false, message: `Database initialization failed: ${error.message}` };
    }
    
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Unexpected error initializing database:', error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Run this script directly if called from command line
if (require.main === module) {
  initializeDatabase()
    .then(result => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}