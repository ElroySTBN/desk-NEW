import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import ClientDetails from "./pages/ClientDetails";
import Invoices from "./pages/Invoices";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import CreateOnboarding from "./pages/CreateOnboarding";
import OnboardingForm from "./pages/OnboardingForm";
import OnboardingExport from "./pages/OnboardingExport";
import ClientEmployees from "./pages/ClientEmployees";
import ClientReviewSettings from "./pages/ClientReviewSettings";
import ClientScanReports from "./pages/ClientScanReports";
import ClientNegativeReviews from "./pages/ClientNegativeReviews";
import FunnelSetup from "./pages/FunnelSetup";
import FunnelContentFlow from "./pages/FunnelContentFlow";
import ScanRedirect from "./pages/ScanRedirect";
import ReviewFunnel from "./pages/ReviewFunnel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<NewClient />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        <Route path="/clients/:id/employees" element={<ClientEmployees />} />
        <Route path="/clients/:id/review-settings" element={<ClientReviewSettings />} />
        <Route path="/clients/:id/scan-reports" element={<ClientScanReports />} />
        <Route path="/clients/:id/negative-reviews" element={<ClientNegativeReviews />} />
        <Route path="/clients/:clientId/funnel-setup" element={<FunnelSetup />} />
        <Route path="/clients/:clientId/funnel-content" element={<FunnelContentFlow />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/create" element={<CreateOnboarding />} />
        <Route path="/onboarding/export/:id" element={<OnboardingExport />} />
          </Route>
          {/* Public routes (no layout) */}
          <Route path="/onboarding/form/:id" element={<OnboardingForm />} />
          <Route path="/scan/:employeeId" element={<ScanRedirect />} />
          <Route path="/review/:clientId" element={<ReviewFunnel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
