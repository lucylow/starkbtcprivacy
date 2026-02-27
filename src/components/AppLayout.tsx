import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Eye,
  Blocks,
  Settings,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  Home,
} from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { NetworkSelector } from "@/components/NetworkSelector";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Wallet", path: "/wallet", icon: Wallet },
  { label: "Deposit", path: "/deposit", icon: ArrowDownToLine },
  { label: "Withdraw", path: "/withdraw", icon: ArrowUpFromLine },
  { label: "Activity", path: "/activity", icon: Activity },
  { label: "Privacy", path: "/privacy", icon: Eye },
  { label: "DeFi", path: "/defi", icon: Blocks },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Docs", path: "/docs", icon: BookOpen },
  { label: "Help", path: "/help", icon: HelpCircle },
];

const mobileNavItems = navItems.slice(1, 5); // Wallet, Deposit, Withdraw, Activity

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 flex items-center px-4 lg:px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors mr-2"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center space-x-2 mr-6">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-lg font-bold hidden sm:block">Zephyr</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center space-x-3">
          <NetworkSelector />
          <WalletConnectButton />
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 fixed top-16 bottom-0 left-0 bg-sidebar border-r border-sidebar-border py-4 overflow-y-auto">
          <nav className="flex flex-col space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-4 py-3 mx-3 rounded-lg glass text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Your secrets stay on your device.</p>
            <p>No server ever sees your private keys.</p>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/80 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed top-16 bottom-0 left-0 z-50 w-56 bg-sidebar border-r border-sidebar-border py-4 overflow-y-auto lg:hidden"
              >
                <nav className="flex flex-col space-y-1 px-3">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 lg:ml-56 min-h-[calc(100vh-4rem)] pb-20 lg:pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border flex items-center justify-around h-16 lg:hidden">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
