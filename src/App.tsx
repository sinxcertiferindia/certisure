import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import Certificates from "./pages/Certificates";
import Recipients from "./pages/Recipients";
import Organizations from "./pages/Organizations";
import Analytics from "./pages/Analytics";
import IssueCertificate from "./pages/IssueCertificate";
import BulkUpload from "./pages/BulkUpload";
import MasterDashboard from "./pages/MasterDashboard";
import OrganizationDetail from "./pages/OrganizationDetail";
import MasterPlans from "./pages/MasterPlans";
import MasterCertificates from "./pages/MasterCertificates";
import MasterAnalytics from "./pages/MasterAnalytics";
import MasterUsers from "./pages/MasterUsers";
import MasterAuditLogs from "./pages/MasterAuditLogs";
import MasterTemplates from "./pages/MasterTemplates";
import Templates from "./pages/Templates";
import EmailTemplates from "./pages/EmailTemplates";
import EmailTemplateBuilder from "./pages/EmailTemplateBuilder";
import CertificateTemplates from "./pages/CertificateTemplates";
import CertificateBuilder from "./pages/CertificateBuilder";
import SavedTemplates from "./pages/SavedTemplates";
import OrganizationOverview from "./pages/OrganizationOverview";
import PaymentQR from "./pages/PaymentQR";
import TeamMembers from "./pages/TeamMembers";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:certificateId" element={<Verify />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment/qr" element={<PaymentQR />} />
          <Route path="/organization" element={<OrganizationOverview />} />
          <Route path="/organization-overview" element={<OrganizationOverview />} />
          <Route path="/main-dashboard" element={<MainDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/certificates" element={<Certificates />} />
          <Route path="/dashboard/recipients" element={<Recipients />} />
          <Route path="/dashboard/organizations" element={<Organizations />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/issue-certificate" element={<IssueCertificate />} />
          <Route path="/dashboard/bulk-upload" element={<BulkUpload />} />
          <Route path="/dashboard/templates/email/builder" element={<EmailTemplateBuilder />} />
          <Route path="/dashboard/templates/email" element={<EmailTemplates />} />
          <Route path="/dashboard/templates/builder" element={<CertificateBuilder />} />
          <Route path="/dashboard/templates/certificate" element={<CertificateTemplates />} />
          <Route path="/dashboard/templates/saved" element={<SavedTemplates />} />
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/team" element={<TeamMembers />} />
          <Route path="/dashboard/admin" element={<AdminPage />} />
          <Route path="/master-dashboard" element={<MasterDashboard />} />
          <Route path="/master-dashboard/organizations" element={<MasterDashboard />} />
          <Route path="/master-dashboard/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/master-dashboard/users" element={<MasterUsers />} />
          <Route path="/master-dashboard/audit-logs" element={<MasterAuditLogs />} />
          <Route path="/master-dashboard/plans" element={<MasterPlans />} />
          <Route path="/master-dashboard/certificates" element={<MasterCertificates />} />
          <Route path="/master-dashboard/templates" element={<MasterTemplates />} />
          <Route path="/master-dashboard/analytics" element={<MasterAnalytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
