# UX Heuristics Analyzer

A web application for analyzing websites against Nielsen's heuristics principles.

## Technology Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for data storage)

All shadcn/ui components have been downloaded under `@/components/ui`.

## Features

- Analyze websites against 10 Nielsen's heuristics
- Capture full-page screenshots
- Score websites on usability criteria
- Generate detailed findings and recommendations
- Save results to Supabase database
- View historical analysis results

## Setup

### Prerequisites

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Set up the database schema by running the SQL in `supabase/schema.sql`

### Environment Variables

Create a `.env.local` file based on the `.env.local.example` template:

```
# Supabase configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Keys (only used in Netlify functions if needed)
SCREENSHOT_API_KEY=your-screenshot-api-key

# App version
APP_VERSION=1.0.0
```

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration
- `supabase/schema.sql` - SQL for setting up the Supabase database structure

## Database Structure

The application uses a Supabase database with the following tables:

1. **leads** - Stores user contact information
2. **sites** - Stores analyzed website URLs
3. **requests** - Stores analysis results, including heuristic scores and screenshots

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration
- The `@/` path alias points to the `src/` directory

## Commands

**Install Dependencies**

```shell
pnpm i
```

**Start Development Server**

```shell
pnpm run dev
```

**Build for Production**

```shell
pnpm run build
```