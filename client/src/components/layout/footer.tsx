import { Hotel } from "lucide-react";
import { Twitter, Linkedin, Github } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "API Documentation", href: "#" },
      { label: "Integrations", href: "#" }
    ]
  },
  {
    title: "Support", 
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Support", href: "#" },
      { label: "Status Page", href: "#" },
      { label: "Privacy Policy", href: "#" }
    ]
  }
];

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6" data-testid="footer-logo">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                <Hotel className="text-white text-sm" />
              </div>
              <span className="font-display font-bold text-xl">LuxuryHotelSaaS</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md" data-testid="footer-description">
              The most advanced hotel management platform designed for modern hoteliers. Offline-first, multi-tenant, and built for scale.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-twitter">
                <Twitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-linkedin">
                <Linkedin className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-github">
                <Github className="text-xl" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4" data-testid={`footer-section-${index}`}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-white transition-colors text-left"
                        data-testid={`footer-link-${index}-${linkIndex}`}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                        data-testid={`footer-link-${index}-${linkIndex}`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm" data-testid="footer-copyright">
            © 2024 LuxuryHotelSaaS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-terms">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-privacy">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
