import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeuristicsAnalyzerPage from './pages/Index';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';
import ResultsPage from './pages/Results';
import { Navbar } from './components/Navbar';
import { createClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase context
export const SupabaseContext = createContext(supabase);

// Custom hook to use Supabase client
export const useSupabase = () => useContext(SupabaseContext);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseContext.Provider value={supabase}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            <Routes>
              <Route path="/" element={<HeuristicsAnalyzerPage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseContext.Provider>
  </QueryClientProvider>
);

export default App;