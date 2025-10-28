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
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import CreateOnboarding from "./pages/CreateOnboarding";
import OnboardingForm from "./pages/OnboardingForm";
import OnboardingExport from "./pages/OnboardingExport";
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
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/create" element={<CreateOnboarding />} />
        <Route path="/onboarding/export/:id" element={<OnboardingExport />} />
          </Route>
          {/* Public onboarding form route (no layout) */}
          <Route path="/onboarding/form/:id" element={<OnboardingForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
