# Supabase Integration Guide for UX Heuristics Analyzer

This guide explains how to set up and use Supabase for data storage in the UX Heuristics Analyzer application. The application uses Supabase to store user information, analyzed websites, and analysis results.

## Database Setup

### 1. Create a Supabase Account and Project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon/public key from the project settings

### 2. Set Up Database Schema

Execute the SQL in `supabase/schema.sql` in the SQL Editor of your Supabase project. This will create the following tables:

- **leads**: Stores user contact information
- **sites**: Stores analyzed website URLs
- **requests**: Stores analysis results, including heuristic scores and screenshots

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Data Structure

### 1. Leads Table

Stores information about users who have performed analyses:

```sql
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### 2. Sites Table

Stores information about analyzed websites:

```sql
CREATE TABLE public.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### 3. Requests Table

Stores the actual analysis results:

```sql
CREATE TABLE public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) NOT NULL,
  site_id UUID REFERENCES public.sites(id) NOT NULL,
  screenshot TEXT, -- Base64 encoded screenshot
  scores JSONB NOT NULL, -- Structured JSON with heuristic scores and details
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

The `scores` column uses a JSONB structure that looks like:

```json
{
  "heuristic_1": {
    "id": 1,
    "title": "Visibility",
    "score": 85,
    "findings": ["Finding 1", "Finding 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "heuristic_2": {
    "id": 2,
    "title": "Real World",
    "score": 70,
    "findings": ["Finding 1", "Finding 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  // ... more heuristics
}
```

## Security

The database uses Row Level Security (RLS) to ensure that users can only access their own data:

1. Public users can read site information (URLs)
2. Users can create leads and requests
3. Users can only read their own leads and requests
4. The service role can read/write all data

## Using the Supabase Client

The application provides a Supabase service (`src/utils/supabase-service.ts`) with the following functions:

1. `submitAssessment`: Saves an analysis to the database
2. `getAssessmentsByEmail`: Retrieves analyses for a specific email address

### Example Usage

```typescript
import { submitAssessment } from "@/utils/supabase-service";

// Save analysis results
const result = await submitAssessment({
  email: "user@example.com",
  url: "https://example.com",
  screenshot: "base64string",
  scores: {
    // Scores object
  },
  overallScore: 75
});

// Check if submission was successful
if (result.success) {
  console.log("Analysis saved successfully!");
} else {
  console.error("Failed to save analysis:", result.message);
}
```

## Migrating from Formspree/EmailJS

This implementation completely replaces the previous Formspree and EmailJS integrations. Instead of sending emails with results, the application now saves results directly to the Supabase database.

The benefits of this approach include:
- Persistent storage of analysis results
- Ability to retrieve historical analyses
- No email sending limits
- Better user experience with immediate feedback
- More robust error handling