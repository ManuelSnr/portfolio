// Navigation utility for handling clean URLs in production and .html extensions locally
class NavigationManager {
    constructor() {
        this.isProduction = this.detectProductionEnvironment();
        this.init();
    }

    detectProductionEnvironment() {
        // Check if we're in production (Vercel, Netlify, or custom domain)
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Local development indicators
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            protocol === 'file:') {
            return false;
        }
        
        return true;
    }

    getNavigationUrl(page) {
        // Page mappings
        const pages = {
            'home': '',
            'work': 'work',
            'about': 'about',
            'lab': 'lab',
            'work-hyper': 'work-hyper'
        };

        const basePath = pages[page];
        
        if (this.isProduction) {
            // Production: use clean URLs
            return basePath === '' ? '/' : `/${basePath}`;
        } else {
            // Local development: use .html extensions
            return basePath === '' ? '/index.html' : `/${basePath}.html`;
        }
    }

    navigate(page, event = null) {
        if (event) {
            event.preventDefault();
        }
        
        const url = this.getNavigationUrl(page);
        window.location.href = url;
    }

    updateNavigationLinks() {
        // Update all navigation links on the page
        const navLinks = document.querySelectorAll('[data-nav-page]');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-nav-page');
            const url = this.getNavigationUrl(page);
            link.href = url;
        });
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateNavigationLinks();
            });
        } else {
            this.updateNavigationLinks();
        }
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Export for use in other scripts
window.navigationManager = navigationManager;
