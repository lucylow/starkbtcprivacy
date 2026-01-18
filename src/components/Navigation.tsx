import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, ExternalLink } from 'lucide-react';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Docs', href: '#docs', external: true },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xl font-bold">ZK-BTC Mixer</span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{link.label}</span>
                  {link.external && <ExternalLink className="w-3 h-3" />}
                </motion.a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-primary rounded-lg font-semibold shadow-glow-blue hover:shadow-glow-purple transition-shadow"
              >
                Launch App
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 glass-strong p-4 md:hidden"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <span>{link.label}</span>
                  {link.external && <ExternalLink className="w-4 h-4" />}
                </a>
              ))}
              <button className="w-full py-3 bg-gradient-primary rounded-lg font-semibold">
                Launch App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
