
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import StoryGenerator from "./pages/StoryGenerator";
import PlotAnalysis from "./pages/PlotAnalysis";
import WritingAssistant from "./pages/WritingAssistant";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } 
          />
          <Route 
            path="/generate" 
            element={
              <MainLayout>
                <StoryGenerator />
              </MainLayout>
            } 
          />
          <Route 
            path="/plot-analysis" 
            element={
              <MainLayout>
                <PlotAnalysis />
              </MainLayout>
            } 
          />
          <Route 
            path="/writing" 
            element={
              <MainLayout>
                <WritingAssistant />
              </MainLayout>
            } 
          />
          <Route 
            path="/collaboration" 
            element={
              <MainLayout>
                <Collaboration />
              </MainLayout>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
