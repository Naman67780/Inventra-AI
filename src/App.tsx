import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import SalesEntryPage from "@/pages/SalesEntryPage";
import CSVUploadPage from "@/pages/CSVUploadPage";
import OCRScanPage from "@/pages/OCRScanPage";
import ForecastPage from "@/pages/ForecastPage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import OrderPredictionsPage from "@/pages/OrderPredictionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sales-entry" element={<SalesEntryPage />} />
            <Route path="/upload" element={<CSVUploadPage />} />
            <Route path="/scan" element={<OCRScanPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/predictions" element={<OrderPredictionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
