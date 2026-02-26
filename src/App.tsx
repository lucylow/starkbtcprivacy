import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { WalletProvider } from "@/contexts/WalletProvider";
import { ZephyrMockProvider } from "@/mock/zephyrMockProvider";
import DashboardMock from "@/components/DashboardMock";

const queryClient = new QueryClient();

const USE_ZEPHYR_MOCK =
  import.meta.env.VITE_USE_ZEPHYR_MOCK === "true";

const App = () => {
  const appContent = (
    <WalletProvider defaultNetwork="sepolia">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {USE_ZEPHYR_MOCK && (
            <Route path="/mock" element={<DashboardMock />} />
          )}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
