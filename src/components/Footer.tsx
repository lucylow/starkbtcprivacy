import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Github, Twitter, MessageCircle, FileText } from 'lucide-react';

const footerLinks = {
  Protocol: [
    { label: 'Start Mixing', href: '#' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Security', href: '#security' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Audit Reports', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Support', href: '#' },
  ],
  Community: [
    { label: 'Discord', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Telegram', href: '#' },
    { label: 'Forum', href: '#' },
  ],
  Legal: [
    { label: 'Terms of Use', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Disclaimer', href: '#' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: FileText, href: '#', label: 'Docs' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center space-x-2 mb-4"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">ZK-BTC Mixer</span>
            </motion.a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Quantum-resistant privacy for Bitcoin on Starknet. 
              Break the on-chain link with Zero-Knowledge proofs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 ZK-BTC Mixer. Open source protocol.
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-glow-green rounded-full animate-pulse" />
              Starknet Mainnet
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
