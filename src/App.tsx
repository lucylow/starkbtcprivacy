import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletProvider";
import { ZephyrMockProvider } from "@/mock/zephyrMockProvider";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/Index";
import WalletPage from "@/pages/WalletPage";
import DepositPage from "@/pages/DepositPage";
import WithdrawPage from "@/pages/WithdrawPage";
import ActivityPage from "@/pages/ActivityPage";
import PrivacyPage from "@/pages/PrivacyPage";
import DefiPage from "@/pages/DefiPage";
import SettingsPage from "@/pages/SettingsPage";
import DocsPage from "@/pages/DocsPage";
import HelpPage from "@/pages/HelpPage";
import NotFound from "@/pages/NotFound";
import DashboardMock from "@/components/DashboardMock";

const queryClient = new QueryClient();

const USE_ZEPHYR_MOCK = import.meta.env.VITE_USE_ZEPHYR_MOCK === "true";

const App = () => {
  const appContent = (
    <WalletProvider defaultNetwork="sepolia">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/defi" element={<DefiPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/help" element={<HelpPage />} />
            {USE_ZEPHYR_MOCK && (
              <Route path="/mock" element={<DashboardMock />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </WalletProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {USE_ZEPHYR_MOCK ? (
          <ZephyrMockProvider>{appContent}</ZephyrMockProvider>
        ) : (
          appContent
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
