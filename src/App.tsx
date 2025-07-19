import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeuristicsAnalyzerPage from './pages/Index';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';
import { Navbar } from './components/Navbar';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<HeuristicsAnalyzerPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;