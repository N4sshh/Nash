// main.js - Unified JavaScript for MewBrew Café
// Combines all functionality into one optimized system

document.addEventListener('DOMContentLoaded', function() {
    console.log('🐱 MewBrew Café Unified System initialized');
    MewBrewSystem.getInstance().init();
});

/**
 * MewBrewSystem - Singleton class that handles all café functionality
 * Combines booking, cats, contact, events (menu), shop, and universal features
 */
class MewBrewSystem {
    static instance = null;
    
    static getInstance() {
        if (!MewBrewSystem.instance) {
            MewBrewSystem.instance = new MewBrewSystem();
        }
        return MewBrewSystem.instance;
    }

    constructor() {
        // Initialize state
        this.currentPage = this.getCurrentPage();
        this.isMobile = window.innerWidth <= 768;
        this.isDarkMode = this.checkDarkMode();
        this.scrollPosition = 0;
        this.visitCount = parseInt(localStorage.getItem('mewbrew_visit_count') || '0');
        this.lastScrollTop = 0;
        
        // Initialize all data stores
        this.initDataStores();
        
        // Initialize DOM references based on current page
        this.initDOMReferences();
        
        // Bind methods to maintain 'this' context
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // ==================== INITIALIZATION ====================

    init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize dark mode FIRST
        this.initDarkMode();
        
        // Initialize page-specific features
        this.initPageFeatures();
        
        // Setup universal features
        this.setupUniversalFeatures();
        
        // Track visit
        this.trackVisit();
        
        // Make system globally available
        window.mewbrew = this;
    }

    getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path.replace('.html', '');
    }

    checkDarkMode() {
        const savedTheme = localStorage.getItem('mewbrew_theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    initDarkMode() {
        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('mewbrew_theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            this.isDarkMode = true;
        } else if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            this.isDarkMode = false;
        } else {
            // Use system preference
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemDark) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
                this.isDarkMode = true;
            } else {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
                this.isDarkMode = false;
            }
        }
        
        // Update toggle button if it exists
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = `fas fa-${this.isDarkMode ? 'sun' : 'moon'}`;
            }
        }
    }

    initDataStores() {
        // Booking data
        this.bookingData = {
            PRICES: { standard: 200, student: 150, group: 170 },
            TIME_SLOTS: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
            currentBooking: null,
            bookings: JSON.parse(localStorage.getItem('mewbrew_bookings') || '[]')
        };
        
       // Cats data - UPDATED with your new cats
this.catsData = [
    { 
        id: 'tangol', 
        name: 'Tangol', 
        age: '1 year', 
        color: 'Orange & White', 
        personality: 'Playful & Loud', 
        status: 'available', 
        visits: 28, 
        favoriteToy: 'Crinkly balls', 
        description: 'Tangol loves to roll around and bite stuff! He\'s a playful and loud cat who keeps everyone entertained with his antics. Very energetic and fun to be around.' 
    },
    { 
        id: 'xia-ming', 
        name: 'Xia Ming', 
        age: '9 months', 
        color: 'Tilapya', 
        personality: 'Shy & Friendly', 
        status: 'available', 
        visits: 15, 
        favoriteToy: 'Catnip mouse', 
        description: 'Xia Ming rarely meows and is always curious about everything. Though shy at first, she warms up quickly and becomes a friendly companion. Loves to explore and observe.' 
    },
    { 
        id: 'ying-yang', 
        name: 'Ying Yang', 
        age: '9 months', 
        color: 'Black & White', 
        personality: 'Energetic', 
        status: 'available', 
        visits: 22, 
        favoriteToy: 'Feather wand', 
        description: 'Ying Yang loves to watch people gossip and is always curious about anything happening around. Very energetic and alert, he never misses any action in the café!' 
    },
    { 
        id: 'mini', 
        name: 'Mini', 
        age: '9 months', 
        color: 'Black, Orange & White', 
        personality: 'Playful & Energetic', 
        status: 'available', 
        visits: 19, 
        favoriteToy: 'Soft blankets', 
        description: 'Mini is famous for her bread-making skills! She loves to knead on soft blankets and pillows. Very playful and energetic, she\'ll keep you entertained for hours.' 
    }
];
        
        // Menu data - UPDATED to match the image changes
        this.menuData = [
            // Coffee
            { id: 'espresso', name: 'Espresso', price: 100, category: 'coffee', tags: ['Hot', 'Strong'], description: 'Strong, rich coffee served in a small cup', rating: 4.5, favorites: 120, available: true, image: 'img/menu/espresso.jpg' },
            { id: 'cappuccino', name: 'Cappuccino', price: 130, category: 'coffee', tags: ['Foamy', 'Classic'], description: 'Equal parts espresso, steamed milk, and milk foam', rating: 4.7, favorites: 150, available: true, image: 'img/menu/cappuccino.jpg' },
            { id: 'latte', name: 'Latte', price: 140, category: 'coffee', tags: ['Creamy', 'Mild'], description: 'Espresso with steamed milk and a light foam layer', rating: 4.6, favorites: 180, available: true, image: 'img/menu/latte.jpg' },
            { id: 'mocha', name: 'Mocha', price: 150, category: 'coffee', tags: ['Chocolate', 'Sweet'], description: 'Chocolate-infused espresso with steamed milk', rating: 4.8, favorites: 200, available: true, image: 'img/menu/mocha.jpg' },
            
            // Pastries - UPDATED: brownies and cherry pie added
            { id: 'croissant', name: 'Croissant', price: 80, category: 'pastry', tags: ['Buttery', 'Fresh'], description: 'Buttery, flaky pastry made with layered dough', rating: 4.4, favorites: 90, available: true, image: 'img/menu/croissant.jpg' },
            { id: 'chocolate-muffin', name: 'Chocolate Muffin', price: 90, category: 'pastry', tags: ['Chocolate', 'Moist'], description: 'Rich chocolate muffin with chocolate chips', rating: 4.5, favorites: 110, available: true, image: 'img/menu/muffin.jpg' },
            { id: 'brownies', name: 'Brownies', price: 85, category: 'pastry', tags: ['Chocolate', 'Fudgy'], description: 'Rich, fudgy chocolate brownies with a crispy top', rating: 4.6, favorites: 130, available: true, image: 'img/menu/brownies.jpg' },
            { id: 'cherry-pie', name: 'Cherry Pie', price: 95, category: 'pastry', tags: ['Fruity', 'Sweet'], description: 'Classic cherry pie with flaky crust and sweet cherry filling', rating: 4.7, favorites: 140, available: true, image: 'img/menu/cherry_pie.jpg' },
            
            // Non-Coffee - UPDATED: chocolate milk tea and iced matcha
            { id: 'fruit-tea', name: 'Fruit Tea', price: 110, category: 'non-coffee', tags: ['Fruity', 'Refreshing'], description: 'Refreshing tea with natural fruit flavors', rating: 4.4, favorites: 95, available: true, image: 'img/menu/fruit_tea.jpg' },
            { id: 'chocolate-milktea', name: 'Chocolate Milk Tea', price: 120, category: 'non-coffee', tags: ['Creamy', 'With Pearls'], description: 'Creamy milk tea with rich chocolate flavor and tapioca pearls', rating: 4.6, favorites: 125, available: true, image: 'img/menu/chocolate_milktea.jpg' },
            { id: 'iced-matcha', name: 'Iced Matcha', price: 95, category: 'non-coffee', tags: ['Refreshing', 'Cold'], description: 'Refreshing cold matcha green tea served over ice', rating: 4.5, favorites: 110, available: true, image: 'img/menu/iced_matcha.jpg' },
            { id: 'matcha-latte', name: 'Matcha Latte', price: 135, category: 'non-coffee', tags: ['Green Tea', 'Healthy'], description: 'Japanese green tea with steamed milk', rating: 4.5, favorites: 120, available: true, image: 'img/menu/matcha_lattee.jpg' }
        ];
        
        // Shop data
        this.shopData = {
            cart: JSON.parse(localStorage.getItem('mewbrew_shop_cart') || '[]'),
            orders: JSON.parse(localStorage.getItem('mewbrew_shop_orders') || '[]'),
            shippingCost: 100,
            freeShippingThreshold: 1000,
            supportPercentage: 20
        };
        
        // Contact data
        this.contactData = {
            messages: JSON.parse(localStorage.getItem('mewbrew_contact_messages') || '[]'),
            faqs: [
                { id: 'faq1', question: 'Do I need to book in advance?', answer: 'We highly recommend booking in advance, especially on weekends.', category: 'booking', views: 0 },
                { id: 'faq2', question: 'Are children allowed?', answer: 'Yes, children aged 8 and above are welcome when accompanied by an adult.', category: 'general', views: 0 },
                { id: 'faq3', question: 'Can I bring my own cat?', answer: 'For safety reasons, we do not allow outside cats in the café.', category: 'cats', views: 0 },
                { id: 'faq4', question: 'Do you serve food and drinks?', answer: 'Yes, we have a full menu of coffee, tea, and pastries.', category: 'menu', views: 0 },
                { id: 'faq5', question: 'How can I adopt a cat?', answer: 'Visit our Cats page to see available cats and fill out an adoption inquiry.', category: 'adoption', views: 0 }
            ]
        };
        
        // Favorites
        this.favorites = {
            menu: JSON.parse(localStorage.getItem('mewbrew_favorites') || '[]'),
            cats: JSON.parse(localStorage.getItem('mewbrew_favorite_cats') || '[]')
        };
        
        // Adoption inquiries
        this.adoptionInquiries = JSON.parse(localStorage.getItem('mewbrew_adoption_inquiries') || '[]');
    }

    initDOMReferences() {
        // Common elements
        this.navbar = document.querySelector('.navbar');
        this.navbarToggler = document.querySelector('.navbar-toggler');
        this.navbarCollapse = document.querySelector('#navbarNav');
        this.backToTopBtn = null;
        this.themeToggle = null;
        
        // Page-specific elements (will be populated when needed)
        this.pageElements = {};
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('keydown', this.handleKeyDown);
        
        // Dark mode media query
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!localStorage.getItem('mewbrew_theme')) {
                this.toggleTheme(e.matches);
            }
        });
        
        // Mobile menu
        if (this.navbarToggler && this.navbarCollapse) {
            this.navbarToggler.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close menu on link click (mobile)
            if (this.isMobile) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', () => this.closeMobileMenu());
                });
            }
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
        });
    }

    // ==================== PAGE INITIALIZATION ====================

    initPageFeatures() {
        // Universal features for all pages
        this.setupAnimations();
        this.setupBackToTop();
        this.setupThemeToggle();
        
        // Page-specific features
        switch(this.currentPage) {
            case 'index':
                this.initHomepage();
                break;
            case 'booking':
                this.initBooking();
                break;
            case 'cats':
                this.initCats();
                break;
            case 'contact':
                this.initContact();
                break;
            case 'menu':
                this.initMenu();
                break;
            case 'shop':
                this.initShop();
                break;
            default:
                // For any other pages, load based on available elements
                this.detectAndLoadFeatures();
        }
    }

    detectAndLoadFeatures() {
        // Detect and load features based on DOM elements
        if (document.querySelector('.booking-form')) this.initBooking();
        if (document.querySelector('.cat-card')) this.initCats();
        if (document.querySelector('.contact-form')) this.initContact();
        if (document.querySelector('.menu-item')) this.initMenu();
        if (document.querySelector('.product-item')) this.initShop();
        if (document.querySelector('.faq-accordion')) this.initFaq();
        if (document.querySelector('.cart-toggle')) this.initCart();
    }

    // ==================== UNIVERSAL FEATURES ====================

    setupUniversalFeatures() {
        this.addGlobalStyles();
        this.setupScrollProgress();
        this.setupPageTransitions();
        this.setupImageLazyLoading();
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    if (entry.target.dataset.animateOnce !== 'false') {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        // Observe elements
        document.querySelectorAll('.card, .section-title, .menu-item, .cat-card, .product-item, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        this.animationObserver = observer;
    }

    setupBackToTop() {
        if (this.backToTopBtn) return;
        
        this.backToTopBtn = document.createElement('button');
        this.backToTopBtn.className = 'back-to-top btn btn-warning';
        this.backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        this.backToTopBtn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(this.backToTopBtn);
        
        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setupThemeToggle() {
        if (this.themeToggle) return;
        
        this.themeToggle = document.createElement('button');
        this.themeToggle.className = 'theme-toggle btn btn-outline-warning btn-sm';
        this.themeToggle.innerHTML = `<i class="fas fa-${this.isDarkMode ? 'sun' : 'moon'}"></i>`;
        this.themeToggle.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(this.themeToggle);
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setupScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = `${scrolled}%`;
        });
    }

    setupPageTransitions() {
        document.querySelectorAll('a').forEach(link => {
            if (link.href && link.href.includes(window.location.origin) && 
                !link.href.includes('#') && !link.target && !link.hasAttribute('download')) {
                link.addEventListener('click', (e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                        this.showPageTransition();
                    }
                });
            }
        });
    }

    setupImageLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                img.loading = 'lazy';
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
        }
    }

    // ==================== HANDLERS ====================

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
    }

    handleScroll() {
        this.scrollPosition = window.scrollY;
        
        // Navbar scroll effect
        if (this.navbar) {
            if (this.scrollPosition > 100) {
                this.navbar.classList.add('navbar-scrolled');
            } else {
                this.navbar.classList.remove('navbar-scrolled');
            }
            
            // Hide/show navbar
            if (this.scrollPosition > 200 && this.scrollPosition > this.lastScrollTop) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }
            this.lastScrollTop = this.scrollPosition;
        }
        
        // Back to top button
        if (this.backToTopBtn) {
            if (this.scrollPosition > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }
    }

    handleKeyDown(e) {
        // Escape key - close all modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            });
        }
    }

    handleAnchorClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, null, href);
            
            // Close mobile menu if open
            this.closeMobileMenu();
        }
    }

    toggleMobileMenu() {
        if (!this.navbarToggler || !this.navbarCollapse) return;
        
        const icon = this.navbarToggler.querySelector('i');
        if (this.navbarCollapse.classList.contains('show')) {
            this.closeMobileMenu();
        } else {
            this.navbarCollapse.classList.add('show');
            icon?.classList.remove('fa-bars');
            icon?.classList.add('fa-times');
            if (this.isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }
    }

    closeMobileMenu() {
        if (!this.navbarToggler || !this.navbarCollapse) return;
        
        this.navbarCollapse.classList.remove('show');
        const icon = this.navbarToggler.querySelector('i');
        icon?.classList.remove('fa-times');
        icon?.classList.add('fa-bars');
        document.body.style.overflow = '';
    }

    toggleTheme(forceDark = null) {
        const isDark = forceDark !== null ? forceDark : !this.isDarkMode;
        
        // Toggle the class on body
        if (isDark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
        
        // Update toggle button icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = `fas fa-${isDark ? 'sun' : 'moon'}`;
            }
        }
        
        // Save preference
        localStorage.setItem('mewbrew_theme', isDark ? 'dark' : 'light');
        this.isDarkMode = isDark;
        
        // Trigger theme change event
        document.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
        
        console.log('Theme toggled:', isDark ? 'dark' : 'light');
    }

    showPageTransition() {
        let overlay = document.querySelector('.page-transition-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'page-transition-overlay';
            overlay.innerHTML = `
                <div class="page-transition-content">
                    <div class="cat-loader">
                        <i class="fas fa-cat"></i>
                        <i class="fas fa-coffee"></i>
                    </div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.add('active');
        
        // Remove after page loads
        window.addEventListener('load', () => {
            overlay.classList.remove('active');
        }, { once: true });
    }

    showNotification(message, type = 'success', duration = 3000) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${icon} me-2"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `global-alert alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.style.zIndex = '9999';
        alertDiv.style.width = '90%';
        alertDiv.style.maxWidth = '500px';
        alertDiv.innerHTML = `
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    createModal(options = {}) {
        const {
            id = 'modal-' + Date.now(),
            title = '',
            content = '',
            size = '',
            buttons = []
        } = options;
        
        let modal = document.getElementById(id);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = id;
            modal.tabIndex = '-1';
            modal.setAttribute('aria-hidden', 'true');
            document.body.appendChild(modal);
        }
        
        const sizeClass = size ? `modal-${size}` : '';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered ${sizeClass}">
                <div class="modal-content">
                    <div class="modal-header border-0">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer border-0">
                        ${buttons.map(btn => `
                            <button type="button" class="btn ${btn.class || 'btn-secondary'}" 
                                    data-bs-dismiss="${btn.dismiss ? 'modal' : ''}" 
                                    data-action="${btn.action || ''}">
                                ${btn.icon ? `<i class="fas fa-${btn.icon} me-2"></i>` : ''}
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        setTimeout(() => {
            modal.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    if (options[action]) options[action]();
                });
            });
        }, 0);
        
        return modal;
    }

    // ==================== HOMEPAGE FEATURES ====================

    initHomepage() {
        console.log('Initializing homepage features');
        
        this.setupHeroAnimation();
        this.setupInteractiveCards();
        this.setupStatsCounter();
        this.setupTestimonials();
        this.setupFloatingCats();
        this.setupVisitorGreeting();
    }

    setupHeroAnimation() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        // Add animation classes
        hero.querySelectorAll('.hero-content, .hero-image').forEach((el, i) => {
            el.classList.add('animate-on-load');
            el.style.animationDelay = `${0.2 + i * 0.2}s`;
        });
        
        // Parallax effect
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroImage = hero.querySelector('.hero-image');
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrolled * -0.5}px)`;
            }
        });
    }

    setupInteractiveCards() {
        document.querySelectorAll('.features .card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                
                const icon = card.querySelector('.card-icon i');
                if (icon) icon.style.transform = 'scale(1.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
                
                const icon = card.querySelector('.card-icon i');
                if (icon) icon.style.transform = 'scale(1)';
            });
        });
    }

    setupStatsCounter() {
        const statsSection = document.querySelector('.stats-counter');
        if (!statsSection) return;
    
        const counters = statsSection.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const targetText = counter.textContent.trim();
            const target = parseInt(targetText.replace(/[^0-9]/g, ''));
            
            // Check if target is valid
            if (isNaN(target) || target === 0) {
                console.warn('Invalid counter target:', targetText);
                return;
            }
            
            // Calculate increment
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target;
                }
            };
        
        const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !counter.dataset.animated) {
                        updateCounter();
                        counter.dataset.animated = 'true';
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    setupTestimonials() {
        const testimonialsSection = document.querySelector('.testimonials');
        if (!testimonialsSection) return;
        
        // Auto-rotate testimonials (if multiple)
        const testimonialCards = testimonialsSection.querySelectorAll('.testimonial-card');
        if (testimonialCards.length > 1) {
            let currentIndex = 0;
            
            setInterval(() => {
                testimonialCards.forEach(card => card.classList.remove('active'));
                testimonialCards[currentIndex].classList.add('active');
                currentIndex = (currentIndex + 1) % testimonialCards.length;
            }, 5000);
        }
    }

    setupFloatingCats() {
        if (document.querySelector('.floating-cats')) return;
        
        const container = document.createElement('div');
        container.className = 'floating-cats';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        
        const icons = ['fa-cat', 'fa-paw', 'fa-heart', 'fa-star'];
        
        for (let i = 0; i < 8; i++) {
            const el = document.createElement('i');
            el.className = `fas ${icons[Math.floor(Math.random() * icons.length)]}`;
            el.style.cssText = `
                position: absolute;
                color: rgba(255, 152, 0, 0.1);
                font-size: ${20 + Math.random() * 30}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatAround ${20 + Math.random() * 20}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(el);
        }
        
        document.body.appendChild(container);
    }

    setupVisitorGreeting() {
        if (this.visitCount === 1) {
            setTimeout(() => {
                const modal = this.createModal({
                    id: 'welcomeModal',
                    title: 'Welcome to MewBrew Café! 🐱',
                    content: `
                        <div class="text-center">
                            <i class="fas fa-cat fa-4x text-warning mb-3"></i>
                            <h4 class="mb-3">Hello there!</h4>
                            <p class="mb-3">Welcome to our cozy cat café. We're so excited to have you here!</p>
                            <div class="alert alert-info">
                                <i class="fas fa-gift me-2"></i>
                                <strong>First-time visitor offer:</strong> Mention this welcome for 10% off your first order!
                            </div>
                        </div>
                    `,
                    buttons: [
                        { text: 'Start Exploring!', class: 'btn-warning w-100', dismiss: true }
                    ]
                });
                
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }, 1000);
        }
    }

    // ==================== BOOKING FEATURES ====================

    initBooking() {
        console.log('Initializing booking features');
        
        this.bookingForm = document.querySelector('.booking-form');
        this.bookingElements = {
            guests: document.getElementById('guests'),
            decrease: document.getElementById('decrease'),
            increase: document.getElementById('increase'),
            category: document.getElementById('category'),
            date: document.getElementById('date'),
            time: document.getElementById('time'),
            fullname: document.getElementById('fullname'),
            email: document.getElementById('email'),
            notes: document.getElementById('notes'),
            summaryGuests: document.getElementById('summary-guests'),
            summaryRate: document.getElementById('summary-rate'),
            summaryTotal: document.getElementById('summary-total')
        };
        
        this.bookingCurrent = {
            guests: 1,
            category: 'standard',
            date: '',
            time: '',
            total: this.bookingData.PRICES.standard
        };
        
        this.setupBookingDatePicker();
        this.setupBookingGuestCounter();
        this.setupBookingEvents();
        this.updateBookingSummary();
    }

    setupBookingDatePicker() {
        const dateInput = this.bookingElements.date;
        if (!dateInput) return;
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
        
        dateInput.setAttribute('min', tomorrowFormatted);
        dateInput.value = tomorrowFormatted;
        this.bookingCurrent.date = tomorrowFormatted;
        
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const day = selectedDate.getDay();
            
            if (day === 0 || day === 6) {
                this.showAlert('Weekends might be busier. Book in advance!', 'info');
            }
            
            this.bookingCurrent.date = e.target.value;
            this.checkBookingAvailability();
        });
    }

    setupBookingGuestCounter() {
        const { guests, decrease, increase } = this.bookingElements;
        if (!guests || !decrease || !increase) return;
        
        decrease.addEventListener('click', () => {
            let value = parseInt(guests.value);
            if (value > 1) {
                guests.value = value - 1;
                this.bookingCurrent.guests = guests.value;
                this.updateBookingSummary();
                this.animateElement(guests, 'decrease');
            }
        });
        
        increase.addEventListener('click', () => {
            let value = parseInt(guests.value);
            if (value < 10) {
                guests.value = value + 1;
                this.bookingCurrent.guests = guests.value;
                this.updateBookingSummary();
                this.animateElement(guests, 'increase');
                
                if (value + 1 >= 5 && this.bookingElements.category) {
                    this.bookingElements.category.value = 'group';
                    this.bookingCurrent.category = 'group';
                    this.updateBookingSummary();
                    this.showAlert('Group discount applied! ₱170 per person', 'success');
                }
            }
        });
        
        guests.addEventListener('change', () => {
            let value = parseInt(guests.value);
            
            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) {
                value = 10;
                this.showAlert('Maximum 10 guests per booking', 'warning');
            }
            
            guests.value = value;
            this.bookingCurrent.guests = value;
            this.updateBookingSummary();
            
            if (value >= 5 && this.bookingElements.category && this.bookingElements.category.value !== 'group') {
                this.bookingElements.category.value = 'group';
                this.bookingCurrent.category = 'group';
                this.updateBookingSummary();
                this.showAlert('Group discount applied! ₱170 per person', 'success');
            }
        });
    }

    setupBookingEvents() {
        const { category, time, email, fullname } = this.bookingElements;
        
        if (category) {
            category.addEventListener('change', (e) => {
                this.bookingCurrent.category = e.target.value;
                
                if (e.target.value === 'group' && this.bookingCurrent.guests < 5) {
                    this.showAlert('Group booking requires 5+ guests', 'warning');
                    category.value = 'standard';
                    this.bookingCurrent.category = 'standard';
                }
                
                if (e.target.value === 'student') {
                    this.showAlert('Please bring valid ID for student discount', 'info');
                }
                
                this.updateBookingSummary();
            });
        }
        
        if (time) {
            time.addEventListener('change', (e) => {
                this.bookingCurrent.time = e.target.value;
                
                if (['14:00', '16:00', '18:00'].includes(e.target.value)) {
                    this.showAlert('This is a popular time slot!', 'info');
                }
            });
        }
        
        if (email) {
            email.addEventListener('blur', () => {
                if (email.value && !this.isValidEmail(email.value)) {
                    this.showAlert('Please enter a valid email address', 'warning');
                }
            });
        }
        
        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateBooking()) {
                    this.processBooking();
                }
            });
        }
    }

    updateBookingSummary() {
        const { summaryGuests, summaryRate, summaryTotal } = this.bookingElements;
        if (!summaryGuests || !summaryRate || !summaryTotal) return;
        
        const guests = parseInt(this.bookingCurrent.guests) || 1;
        const rate = this.bookingData.PRICES[this.bookingCurrent.category] || this.bookingData.PRICES.standard;
        const total = guests * rate;
        
        summaryGuests.textContent = guests;
        summaryRate.textContent = `₱${rate}`;
        summaryTotal.textContent = `₱${total}`;
        
        this.bookingCurrent.total = total;
        this.animateElement(summaryTotal, 'highlight');
    }

    validateBooking() {
        const { fullname, email, date, time, guests, category } = this.bookingElements;
        let isValid = true;
        
        if (!fullname?.value?.trim()) {
            this.showAlert('Please enter your full name', 'warning');
            isValid = false;
        }
        
        if (!email?.value?.trim()) {
            this.showAlert('Please enter your email address', 'warning');
            isValid = false;
        } else if (!this.isValidEmail(email.value)) {
            this.showAlert('Please enter a valid email address', 'warning');
            isValid = false;
        }
        
        if (!date?.value) {
            this.showAlert('Please select a date', 'warning');
            isValid = false;
        } else {
            const selectedDate = new Date(date.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.showAlert('Please select a future date', 'warning');
                isValid = false;
            }
        }
        
        if (!time?.value) {
            this.showAlert('Please select a time', 'warning');
            isValid = false;
        }
        
        if (!guests?.value || parseInt(guests.value) < 1) {
            this.showAlert('Please select at least 1 guest', 'warning');
            isValid = false;
        }
        
        if (!category?.value) {
            this.showAlert('Please select a category', 'warning');
            isValid = false;
        }
        
        return isValid;
    }

    processBooking() {
        const submitBtn = this.bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const bookingId = 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            const booking = {
                id: bookingId,
                customer: {
                    name: this.bookingElements.fullname?.value || '',
                    email: this.bookingElements.email?.value || '',
                    notes: this.bookingElements.notes?.value || ''
                },
                details: {
                    guests: this.bookingCurrent.guests,
                    category: this.bookingCurrent.category,
                    date: this.bookingCurrent.date,
                    time: this.bookingCurrent.time,
                    total: this.bookingCurrent.total
                },
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            };
            
            this.bookingData.bookings.push(booking);
            localStorage.setItem('mewbrew_bookings', JSON.stringify(this.bookingData.bookings));
            
            this.showBookingSuccessModal(booking);
            this.resetBookingForm();
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    showBookingSuccessModal(booking) {
        const modal = this.createModal({
            id: 'bookingSuccessModal',
            title: 'Booking Confirmed!',
            content: `
                <div class="text-center">
                    <i class="fas fa-calendar-check fa-4x text-warning mb-3"></i>
                    <h4 class="mb-3">Thank You for Booking!</h4>
                    <div class="booking-details mb-3 p-3 bg-light rounded">
                        <p class="mb-1"><strong>Booking ID:</strong> ${booking.id}</p>
                        <p class="mb-1"><strong>Date:</strong> ${this.formatDate(booking.details.date)}</p>
                        <p class="mb-1"><strong>Time:</strong> ${booking.details.time}:00</p>
                        <p class="mb-1"><strong>Guests:</strong> ${booking.details.guests}</p>
                        <p class="mb-0"><strong>Total:</strong> ₱${booking.details.total}</p>
                    </div>
                    <p class="mb-0">Your reservation has been confirmed.</p>
                </div>
            `,
            buttons: [
                { text: 'Done', class: 'btn-warning', dismiss: true },
                { text: 'Print', class: 'btn-outline-secondary', icon: 'print', action: 'printBooking' }
            ],
            printBooking: () => window.print()
        });
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    resetBookingForm() {
        if (!this.bookingForm) return;
        
        this.bookingForm.reset();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.bookingCurrent = {
            guests: 1,
            category: 'standard',
            date: tomorrow.toISOString().split('T')[0],
            time: '',
            total: this.bookingData.PRICES.standard
        };
        
        if (this.bookingElements.date) {
            this.bookingElements.date.value = this.bookingCurrent.date;
        }
        
        if (this.bookingElements.guests) {
            this.bookingElements.guests.value = 1;
        }
        
        if (this.bookingElements.category) {
            this.bookingElements.category.value = 'standard';
        }
        
        if (this.bookingElements.time) {
            this.bookingElements.time.value = '';
        }
        
        this.updateBookingSummary();
    }

    checkBookingAvailability() {
        const date = this.bookingElements.date;
        if (!date?.value) return;
        
        const selectedDate = new Date(date.value);
        const day = selectedDate.getDay();
        
        if (day === 5 || day === 6) {
            this.showAlert('Weekends are popular! Some slots may be limited.', 'info');
        }
    }

    // ==================== CATS FEATURES ====================

    initCats() {
        console.log('Initializing cats features');
        
        this.catCards = document.querySelectorAll('.cat-card');
        this.adoptionForm = document.querySelector('.adoption-form');
        this.adoptionElements = {
            cat: document.getElementById('cat'),
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            experience: document.getElementById('experience'),
            message: document.getElementById('message')
        };
        
        this.selectedCat = null;
        this.tooltipTimeout = null;
        
        this.setupCatCards();
        this.setupAdoptionForm();
        this.setupCatFilters();
        this.updateCatStats();
    }

    setupCatCards() {
        this.catCards.forEach(card => {
            const catName = card.querySelector('.card-title')?.textContent.trim().toLowerCase();
            const catData = this.catsData.find(cat => cat.name.toLowerCase() === catName);
            
            if (!catData) return;
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                
                this.tooltipTimeout = setTimeout(() => {
                    this.showCatTooltip(card, catData);
                }, 500);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                
                if (this.tooltipTimeout) {
                    clearTimeout(this.tooltipTimeout);
                    this.tooltipTimeout = null;
                }
                
                this.hideCatTooltip();
            });
            
            // Click to select for adoption
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.cat-status') && !e.target.closest('a')) {
                    this.selectCatForAdoption(catData);
                }
            });
            
            // Add favorite button
            this.addCatFavoriteButton(card, catData);
            
            // Add visit badge
            this.addCatVisitBadge(card, catData);
        });
    }

    showCatTooltip(card, catData) {
        const existingTooltip = document.querySelector('.cat-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'cat-tooltip card shadow-lg';
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '1000';
        tooltip.style.maxWidth = '300px';
        tooltip.style.display = 'none';
        
        tooltip.innerHTML = `
            <div class="card-body p-3">
                <h5 class="card-title mb-2">${this.escapeHtml(catData.name)}</h5>
                <div class="cat-stats mb-2">
                    <small class="text-muted me-3"><i class="fas fa-eye me-1"></i>${catData.visits} visits</small>
                    <small class="text-muted"><i class="fas fa-heart me-1"></i>${this.escapeHtml(catData.favoriteToy)}</small>
                </div>
                <p class="card-text mb-2">${this.escapeHtml(catData.description || 'A lovely cat looking for a home!')}</p>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-warning adopt-tooltip-btn" data-cat="${catData.id}">
                        <i class="fas fa-heart me-1"></i>Adopt
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = card.getBoundingClientRect();
        const tooltipWidth = 300;
        const tooltipHeight = tooltip.offsetHeight;
        
        let left = rect.left + rect.width/2 - tooltipWidth/2;
        let top = rect.top - tooltipHeight - 10;
        
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
        if (top < 10) top = rect.bottom + 10;
        if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10;
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.display = 'block';
        
        tooltip.querySelector('.adopt-tooltip-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCatForAdoption(catData);
        });
    }

    hideCatTooltip() {
        document.querySelector('.cat-tooltip')?.remove();
    }

    addCatFavoriteButton(card, catData) {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'cat-favorite-btn btn btn-sm position-absolute top-0 end-0 m-2';
        favoriteBtn.setAttribute('aria-label', `Favorite ${catData.name}`);
        
        if (this.favorites.cats.includes(catData.id)) {
            favoriteBtn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            favoriteBtn.classList.add('favorited');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        }
        
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCatFavorite(catData, favoriteBtn);
        });
        
        card.querySelector('.card-body').appendChild(favoriteBtn);
    }

    toggleCatFavorite(catData, button) {
        if (this.favorites.cats.includes(catData.id)) {
            this.favorites.cats = this.favorites.cats.filter(id => id !== catData.id);
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('favorited');
            this.showNotification(`Removed ${catData.name} from favorites`, 'info');
        } else {
            this.favorites.cats.push(catData.id);
            button.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            button.classList.add('favorited');
            this.showNotification(`Added ${catData.name} to favorites!`, 'success');
        }
        
        localStorage.setItem('mewbrew_favorite_cats', JSON.stringify(this.favorites.cats));
        this.updateCatStats();
    }

    addCatVisitBadge(card, catData) {
        const visitBadge = document.createElement('div');
        visitBadge.className = 'cat-visits badge position-absolute top-0 start-0 m-2';
        visitBadge.innerHTML = `<i class="fas fa-eye me-1"></i>${catData.visits}`;
        card.querySelector('.card-body').appendChild(visitBadge);
    }

    setupAdoptionForm() {
        if (!this.adoptionForm) return;
        
        this.adoptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateAdoptionForm()) {
                this.submitAdoptionInquiry();
            }
        });
        
        // Real-time validation
        ['name', 'email', 'phone', 'cat'].forEach(field => {
            const element = this.adoptionElements[field];
            if (element) {
                element.addEventListener('blur', () => this.validateAdoptionField(field));
            }
        });
        
        // Check URL for cat selection
        this.checkUrlForCatSelection();
    }

    validateAdoptionForm() {
        let isValid = true;
        
        this.clearAdoptionErrors();
        
        if (!this.adoptionElements.name?.value?.trim()) {
            this.showAdoptionError('name', 'Please enter your name');
            isValid = false;
        }
        
        if (!this.adoptionElements.email?.value?.trim()) {
            this.showAdoptionError('email', 'Please enter your email');
            isValid = false;
        } else if (!this.isValidEmail(this.adoptionElements.email.value)) {
            this.showAdoptionError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!this.adoptionElements.phone?.value?.trim()) {
            this.showAdoptionError('phone', 'Please enter your phone number');
            isValid = false;
        } else if (!this.isValidPhone(this.adoptionElements.phone.value)) {
            this.showAdoptionError('phone', 'Please enter a valid phone number');
            isValid = false;
        }
        
        if (!this.adoptionElements.cat?.value) {
            this.showAdoptionError('cat', 'Please select a cat');
            isValid = false;
        }
        
        if (!isValid) {
            this.showAlert('Please fill in all required fields correctly', 'warning');
        }
        
        return isValid;
    }

    validateAdoptionField(field) {
        const element = this.adoptionElements[field];
        if (!element) return true;
        
        const value = element.value.trim();
        this.clearAdoptionError(field);
        
        switch(field) {
            case 'name':
                if (value && value.length < 2) {
                    this.showAdoptionError('name', 'Name must be at least 2 characters');
                    return false;
                }
                break;
                
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showAdoptionError('email', 'Please enter a valid email');
                    return false;
                }
                break;
                
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    this.showAdoptionError('phone', 'Please enter a valid phone number');
                    return false;
                }
                break;
                
            case 'cat':
                if (!value) {
                    this.showAdoptionError('cat', 'Please select a cat');
                    return false;
                }
                break;
        }
        
        return true;
    }

    showAdoptionError(field, message) {
        const element = this.adoptionElements[field];
        if (!element) return;
        
        element.classList.add('is-invalid');
        
        let feedback = element.nextElementSibling;
        while (feedback && !feedback.classList.contains('invalid-feedback')) {
            feedback = feedback.nextElementSibling;
        }
        
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    clearAdoptionError(field) {
        const element = this.adoptionElements[field];
        if (element) {
            element.classList.remove('is-invalid');
        }
    }

    clearAdoptionErrors() {
        ['name', 'email', 'phone', 'cat'].forEach(field => this.clearAdoptionError(field));
    }

    submitAdoptionInquiry() {
        const submitBtn = this.adoptionForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitBtn.disabled = true;
        
        const selectedCat = this.catsData.find(cat => cat.id === this.adoptionElements.cat?.value) || { name: 'Not specified' };
        
        const inquiry = {
            id: 'ADOPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            name: this.adoptionElements.name?.value || '',
            email: this.adoptionElements.email?.value || '',
            phone: this.adoptionElements.phone?.value || '',
            cat: this.adoptionElements.cat?.value || '',
            catName: selectedCat.name || 'Not specified',
            experience: this.adoptionElements.experience?.value || '',
            message: this.adoptionElements.message?.value || '',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        setTimeout(() => {
            this.adoptionInquiries.push(inquiry);
            localStorage.setItem('mewbrew_adoption_inquiries', JSON.stringify(this.adoptionInquiries));
            
            this.showAdoptionSuccessModal(inquiry);
            
            this.adoptionForm.reset();
            this.clearAdoptionErrors();
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            this.updateCatStats();
        }, 1500);
    }

    showAdoptionSuccessModal(inquiry) {
        const modal = this.createModal({
            id: 'adoptionSuccessModal',
            title: 'Adoption Inquiry Submitted!',
            content: `
                <div class="text-center">
                    <i class="fas fa-cat fa-4x text-warning mb-3"></i>
                    <h4 class="mb-3">Thank You!</h4>
                    <div class="inquiry-details mb-3 p-3 bg-light rounded">
                        <p class="mb-1"><strong>Reference:</strong> ${inquiry.id}</p>
                        <p class="mb-1"><strong>Cat:</strong> ${inquiry.catName}</p>
                        <p class="mb-0"><strong>Submitted:</strong> ${new Date(inquiry.timestamp).toLocaleDateString()}</p>
                    </div>
                    <p class="mb-0">We will contact you within 48 hours.</p>
                </div>
            `,
            buttons: [
                { text: 'Done', class: 'btn-warning', dismiss: true }
            ]
        });
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    setupCatFilters() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'cat-filters mb-4 text-center';
        filterContainer.innerHTML = `
            <h3 class="h5 mb-3">Filter Cats</h3>
            <div class="btn-group" role="group" aria-label="Cat filters">
                <button type="button" class="btn btn-outline-warning active" data-filter="all">All</button>
                <button type="button" class="btn btn-outline-warning" data-filter="available">Available</button>
                <button type="button" class="btn btn-outline-warning" data-filter="pending">Pending</button>
                <button type="button" class="btn btn-outline-warning" data-filter="favorites">Favorites</button>
            </div>
        `;
        
        const gallery = document.querySelector('.cats-gallery');
        if (gallery) {
            const existingFilters = gallery.querySelector('.cat-filters');
            if (existingFilters) {
                existingFilters.remove();
            }
            gallery.insertBefore(filterContainer, gallery.querySelector('.row'));
        }
        
        filterContainer.querySelectorAll('button[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterCats(e.target.dataset.filter);
            });
        });
    }

    filterCats(filter) {
        this.catCards.forEach(card => {
            const catName = card.querySelector('.card-title')?.textContent.trim().toLowerCase();
            const catData = this.catsData.find(cat => cat.name.toLowerCase() === catName);
            
            if (!catData) {
                card.style.display = 'none';
                return;
            }
            
            const statusElement = card.querySelector('.cat-status');
            const isAvailable = statusElement?.classList.contains('available');
            const isPending = statusElement?.classList.contains('pending');
            const isFavorited = this.favorites.cats.includes(catData.id);
            
            let show = false;
            
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case 'available':
                    show = isAvailable;
                    break;
                case 'pending':
                    show = isPending;
                    break;
                case 'favorites':
                    show = isFavorited;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
        
        const visibleCount = Array.from(this.catCards).filter(card => card.style.display !== 'none').length;
        if (visibleCount === 0) {
            this.showAlert(`No ${filter} cats found`, 'info');
        }
    }

    selectCatForAdoption(catData) {
        this.selectedCat = catData;
        
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (this.adoptionElements.cat) {
            this.adoptionElements.cat.value = catData.id;
            this.validateAdoptionField('cat');
        }
        
        this.highlightCatCard(catData.name);
        
        if (catData.status === 'available') {
            this.showAlert(`Selected ${catData.name} for adoption! Please complete the form below.`, 'success');
        } else if (catData.status === 'pending') {
            this.showAlert(`${catData.name} has a pending application. You can still express interest.`, 'warning');
        }
    }

    highlightCatCard(catName) {
        this.catCards.forEach(card => {
            card.classList.remove('selected-for-adoption');
            if (card.querySelector('.card-title')?.textContent.trim() === catName) {
                card.classList.add('selected-for-adoption');
            }
        });
    }

    checkUrlForCatSelection() {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        
        if (catParam && this.adoptionElements.cat) {
            const catData = this.catsData.find(cat => cat.id === catParam);
            if (catData) {
                setTimeout(() => {
                    this.selectCatForAdoption(catData);
                }, 500);
            }
        }
    }

    updateCatStats() {
        const statsContainer = document.querySelector('.cat-stats');
        if (!statsContainer) return;
        
        const totalCats = this.catsData.length;
        const availableCats = this.catsData.filter(cat => cat.status === 'available').length;
        const totalInquiries = this.adoptionInquiries.length;
        const favorites = this.favorites.cats.length;
        
        const stats = statsContainer.querySelectorAll('.stat-number');
        if (stats.length >= 4) {
            stats[0].textContent = totalCats;
            stats[1].textContent = availableCats;
            stats[2].textContent = totalInquiries;
            stats[3].textContent = favorites;
        }
    }

    // ==================== CONTACT FEATURES ====================

    initContact() {
        console.log('Initializing contact features');
        
        this.contactForm = document.querySelector('.contact-form');
        this.contactElements = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
        
        this.faqAccordion = document.getElementById('faqAccordion');
        this.faqItems = document.querySelectorAll('.accordion-item');
        this.infoCards = document.querySelectorAll('.info-card');
        
        this.setupContactForm();
        this.setupFAQ();
        this.setupInfoCards();
        this.setupDirections();
        this.addBusinessHoursCheck();
        
        // Load saved draft
        this.loadContactDraft();
    }

    initFaq() {
        console.log('Initializing FAQ features');
        if (this.faqAccordion) {
            this.setupFAQ();
        }
    }

    initCart() {
        console.log('Initializing cart features');
        // Cart is already initialized in menu or shop
    }

    setupContactForm() {
        if (!this.contactForm) return;
        
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateContactForm()) {
                this.submitContactForm();
            }
        });
        
        // Real-time validation and auto-save
        ['name', 'email', 'subject', 'message'].forEach(field => {
            const element = this.contactElements[field];
            if (element) {
                element.addEventListener('blur', () => this.validateContactField(field));
                element.addEventListener('input', () => {
                    this.clearContactError(field);
                    this.debounce(() => this.saveContactDraft(), 1000);
                    
                    if (field === 'message') {
                        this.autoGrowTextarea(element);
                    }
                });
            }
        });
        
        // Subject-based help
        if (this.contactElements.subject) {
            this.contactElements.subject.addEventListener('change', () => this.updateSubjectHelp());
        }
    }

    validateContactForm() {
        let isValid = true;
        
        this.clearContactErrors();
        
        if (!this.validateContactField('name')) isValid = false;
        if (!this.validateContactField('email')) isValid = false;
        if (!this.validateContactField('subject')) isValid = false;
        if (!this.validateContactField('message')) isValid = false;
        
        // Check spam
        const message = this.contactElements.message?.value || '';
        if (message.toLowerCase().includes('http://') || message.toLowerCase().includes('https://')) {
            this.showContactError('message', 'Please remove URLs from your message');
            isValid = false;
        }
        
        if (message.length < 10) {
            this.showContactError('message', 'Please provide more details (minimum 10 characters)');
            isValid = false;
        }
        
        return isValid;
    }

    validateContactField(field) {
        const element = this.contactElements[field];
        if (!element) return true;
        
        const value = element.value.trim();
        this.clearContactError(field);
        
        switch(field) {
            case 'name':
                if (value.length < 2) {
                    this.showContactError('name', 'Name must be at least 2 characters');
                    return false;
                } else if (value.length > 100) {
                    this.showContactError('name', 'Name is too long (max 100 characters)');
                    return false;
                }
                break;
                
            case 'email':
                if (!value) {
                    this.showContactError('email', 'Email is required');
                    return false;
                } else if (!this.isValidEmail(value)) {
                    this.showContactError('email', 'Please enter a valid email');
                    return false;
                }
                break;
                
            case 'subject':
                if (!value) {
                    this.showContactError('subject', 'Please select a subject');
                    return false;
                }
                break;
                
            case 'message':
                if (!value) {
                    this.showContactError('message', 'Message is required');
                    return false;
                } else if (value.length > 2000) {
                    this.showContactError('message', 'Message is too long (max 2000 characters)');
                    return false;
                }
                break;
        }
        
        return true;
    }

    showContactError(field, message) {
        const element = this.contactElements[field];
        if (!element) return;
        
        element.classList.add('is-invalid');
        
        let errorDiv = element.parentNode.querySelector('.invalid-feedback');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            element.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    clearContactError(field) {
        const element = this.contactElements[field];
        if (element) {
            element.classList.remove('is-invalid');
        }
    }

    clearContactErrors() {
        ['name', 'email', 'subject', 'message'].forEach(field => this.clearContactError(field));
    }

    autoGrowTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        this.updateCharacterCount(textarea);
    }

    updateCharacterCount(textarea) {
        let counter = textarea.parentNode.querySelector('.char-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'char-counter form-text text-end mt-1';
            textarea.parentNode.appendChild(counter);
        }
        
        const current = textarea.value.length;
        const max = 2000;
        counter.textContent = `${current}/${max} characters`;
        counter.classList.toggle('text-warning', current > max * 0.9);
    }

    updateSubjectHelp() {
        const subject = this.contactElements.subject?.value;
        const helpTexts = {
            'booking': 'For booking inquiries, please include your preferred date and number of guests.',
            'adoption': 'For adoption inquiries, please specify which cat you\'re interested in.',
            'feedback': 'We appreciate your feedback! Please be as specific as possible.',
            'partnership': 'Tell us about your organization and proposed partnership.',
            'general': 'How can we help you today?',
            'other': 'Please provide details about your inquiry.'
        };
        
        let helpDiv = this.contactForm.querySelector('.subject-help');
        
        if (!helpDiv && helpTexts[subject]) {
            helpDiv = document.createElement('div');
            helpDiv.className = 'subject-help alert alert-info alert-dismissible fade show mt-2';
            this.contactElements.subject?.parentNode.appendChild(helpDiv);
        }
        
        if (helpDiv) {
            if (helpTexts[subject]) {
                helpDiv.innerHTML = `<i class="fas fa-lightbulb me-2"></i>${helpTexts[subject]}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
                helpDiv.classList.remove('d-none');
            } else {
                helpDiv.classList.add('d-none');
            }
        }
    }

    loadContactDraft() {
        const draft = localStorage.getItem('mewbrew_contact_draft');
        if (!draft) return;
        
        try {
            const data = JSON.parse(draft);
            if (this.contactElements.name) this.contactElements.name.value = data.name || '';
            if (this.contactElements.email) this.contactElements.email.value = data.email || '';
            if (this.contactElements.subject) this.contactElements.subject.value = data.subject || '';
            if (this.contactElements.message) {
                this.contactElements.message.value = data.message || '';
                this.autoGrowTextarea(this.contactElements.message);
            }
            
            if (data.timestamp) {
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'btn btn-sm btn-outline-warning mt-2';
                restoreBtn.innerHTML = '<i class="fas fa-history me-1"></i>Restored from draft';
                restoreBtn.addEventListener('click', () => {
                    localStorage.removeItem('mewbrew_contact_draft');
                    restoreBtn.remove();
                    this.showNotification('Draft cleared', 'info');
                });
                
                const formSubmit = this.contactForm.querySelector('.form-submit');
                if (formSubmit) {
                    formSubmit.insertAdjacentElement('beforebegin', restoreBtn);
                }
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }

    saveContactDraft() {
        const draft = {
            name: this.contactElements.name?.value || '',
            email: this.contactElements.email?.value || '',
            subject: this.contactElements.subject?.value || '',
            message: this.contactElements.message?.value || '',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('mewbrew_contact_draft', JSON.stringify(draft));
    }

    submitContactForm() {
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.disabled = true;
        
        const subjectText = this.contactElements.subject?.options[this.contactElements.subject.selectedIndex]?.text || '';
        
        const messageData = {
            id: 'MSG-' + Date.now().toString().slice(-8),
            name: this.contactElements.name?.value || '',
            email: this.contactElements.email?.value || '',
            subject: this.contactElements.subject?.value || '',
            subjectText: subjectText,
            message: this.contactElements.message?.value || '',
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        
        setTimeout(() => {
            this.contactData.messages.push(messageData);
            localStorage.setItem('mewbrew_contact_messages', JSON.stringify(this.contactData.messages));
            localStorage.removeItem('mewbrew_contact_draft');
            
            this.showContactSuccessModal(messageData);
            
            this.contactForm.reset();
            this.clearContactErrors();
            
            const counter = this.contactElements.message?.parentNode.querySelector('.char-counter');
            if (counter) counter.remove();
            
            if (this.contactElements.message) {
                this.contactElements.message.style.height = 'auto';
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    showContactSuccessModal(messageData) {
        const modal = this.createModal({
            id: 'contactSuccessModal',
            title: 'Message Sent!',
            content: `
                <div class="text-center">
                    <i class="fas fa-envelope-open-text fa-4x text-warning mb-3"></i>
                    <h4 class="mb-3">Thank You for Contacting Us!</h4>
                    <div class="message-details mb-3 p-3 bg-light rounded">
                        <p class="mb-1"><strong>Reference:</strong> ${messageData.id}</p>
                        <p class="mb-1"><strong>Subject:</strong> ${messageData.subjectText}</p>
                        <p class="mb-0"><strong>Submitted:</strong> ${new Date(messageData.timestamp).toLocaleString()}</p>
                    </div>
                    <p class="mb-0">We'll get back to you within 24-48 hours.</p>
                </div>
            `,
            buttons: [
                { text: 'Done', class: 'btn-warning', dismiss: true },
                { text: 'Copy Reference', class: 'btn-outline-secondary', icon: 'copy', action: 'copyReference' }
            ],
            copyReference: () => {
                navigator.clipboard.writeText(messageData.id);
                this.showNotification('Reference copied to clipboard!', 'success');
            }
        });
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    setupFAQ() {
        if (!this.faqAccordion) return;
        
        // Load FAQ views
        const savedViews = localStorage.getItem('mewbrew_faq_views');
        if (savedViews) {
            try {
                const views = JSON.parse(savedViews);
                this.contactData.faqs.forEach((faq, i) => {
                    if (views[i]) faq.views = views[i].views || 0;
                });
            } catch (e) {
                console.error('Failed to load FAQ views:', e);
            }
        }
        
        // Track FAQ views
        this.faqItems.forEach((item, index) => {
            const button = item.querySelector('.accordion-button');
            const collapseId = button?.getAttribute('data-bs-target')?.replace('#', '');
            const collapse = collapseId ? document.getElementById(collapseId) : null;
            
            if (collapse) {
                collapse.addEventListener('show.bs.collapse', () => {
                    if (this.contactData.faqs[index]) {
                        this.contactData.faqs[index].views++;
                        localStorage.setItem('mewbrew_faq_views', JSON.stringify(this.contactData.faqs));
                    }
                });
            }
        });
        
        this.addFAQSearch();
        this.addFAQCategories();
    }

    addFAQSearch() {
        const faqSection = document.querySelector('.faq-section');
        if (!faqSection) return;
        
        const searchDiv = document.createElement('div');
        searchDiv.className = 'faq-search mb-4';
        searchDiv.innerHTML = `
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="search" class="form-control" placeholder="Search FAQs..." id="faqSearch">
                <button class="btn btn-outline-warning" type="button" id="clearSearch">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        faqSection.insertBefore(searchDiv, this.faqAccordion);
        
        const searchInput = document.getElementById('faqSearch');
        const clearBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query.length >= 2) {
                    this.searchFAQs(query);
                } else {
                    this.showAllFAQs();
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.showAllFAQs();
                }
            });
        }
    }

    searchFAQs(query) {
        this.faqItems.forEach((item, index) => {
            const faq = this.contactData.faqs[index];
            if (faq) {
                const matches = faq.question.toLowerCase().includes(query) || 
                               faq.answer.toLowerCase().includes(query);
                item.style.display = matches ? 'block' : 'none';
            }
        });
    }

    showAllFAQs() {
        this.faqItems.forEach(item => {
            item.style.display = 'block';
        });
    }

    addFAQCategories() {
        const categories = [...new Set(this.contactData.faqs.map(faq => faq.category))];
        const searchDiv = document.querySelector('.faq-search');
        
        if (searchDiv && categories.length > 1) {
            const categoriesDiv = document.createElement('div');
            categoriesDiv.className = 'faq-categories mb-3';
            categoriesDiv.innerHTML = `
                <div class="d-flex flex-wrap gap-2">
                    <span class="badge bg-light text-dark category-badge active" data-category="all">All</span>
                    ${categories.map(cat => 
                        `<span class="badge bg-light text-dark category-badge" data-category="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`
                    ).join('')}
                </div>
            `;
            
            searchDiv.parentNode.insertBefore(categoriesDiv, searchDiv);
            
            categoriesDiv.querySelectorAll('.category-badge').forEach(badge => {
                badge.addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    
                    categoriesDiv.querySelectorAll('.category-badge').forEach(b => 
                        b.classList.remove('active')
                    );
                    e.target.classList.add('active');
                    
                    this.filterFAQsByCategory(category);
                });
            });
        }
    }

    filterFAQsByCategory(category) {
        this.faqItems.forEach((item, index) => {
            const faq = this.contactData.faqs[index];
            if (faq) {
                const show = category === 'all' || faq.category === category;
                item.style.display = show ? 'block' : 'none';
            }
        });
    }

    setupInfoCards() {
        this.infoCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                const icon = card.querySelector('.info-icon i');
                if (icon) icon.style.transform = 'scale(1.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                const icon = card.querySelector('.info-icon i');
                if (icon) icon.style.transform = 'scale(1)';
            });
        });
    }

    setupDirections() {
        const copyBtn = document.querySelector('.copy-coordinates-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const coordinates = '10.7202° N, 122.5621° E';
                navigator.clipboard.writeText(coordinates);
                this.showNotification('Coordinates copied to clipboard!', 'success');
            });
        }
        
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.cursor = 'pointer';
            mapPlaceholder.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('directionsModal'));
                modal.show();
            });
        }
    }

    addBusinessHoursCheck() {
        const hoursCard = document.querySelector('.info-card:nth-child(2)');
        if (!hoursCard) return;
        
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        
        const isWeekday = currentDay >= 1 && currentDay <= 7;
        const isWithinHours = currentHour >= 10 && currentHour < 21;
        const isOpen = isWeekday && isWithinHours;
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `hours-status-badge badge ${isOpen ? 'bg-success' : 'bg-secondary'} position-absolute top-0 end-0 m-3`;
        statusBadge.textContent = isOpen ? 'Open Now' : 'Closed';
        
        hoursCard.querySelector('.card-body')?.appendChild(statusBadge);
        
        if (isOpen) {
            const closingTime = new Date();
            closingTime.setHours(21, 0, 0, 0);
            const hoursUntilClose = Math.floor((closingTime - new Date()) / (1000 * 60 * 60));
            
            if (hoursUntilClose < 2) {
                const closingAlert = document.createElement('div');
                closingAlert.className = 'alert alert-warning alert-sm mt-3 mb-0';
                closingAlert.innerHTML = `<i class="fas fa-clock me-2"></i>Closes in ${hoursUntilClose} hour${hoursUntilClose !== 1 ? 's' : ''}`;
                hoursCard.querySelector('.card-body')?.appendChild(closingAlert);
            }
        }
    }

    // ==================== MENU FEATURES ====================

    initMenu() {
        console.log('Initializing menu features');
        
        this.menuItems = document.querySelectorAll('.menu-item');
        this.cartIcon = document.querySelector('.cart-icon');
        this.cartCount = document.querySelector('.cart-count');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSummary = document.getElementById('cart-summary');
        this.checkoutModal = document.getElementById('checkoutModal');
        
        this.serviceFeePercent = 0.05;
        this.orderHistory = JSON.parse(localStorage.getItem('mewbrew_order_history')) || [];
        this.cartTotal = 0;
        
        this.setupMenuItems();
        this.setupCart();
        this.setupCheckoutModal();
        this.setupMenuFilters();
        this.setupMenuSearch();
        this.updateCartCount();
    }

    setupMenuItems() {
        this.menuItems.forEach((item, index) => {
            const menuData = this.menuData[index];
            if (!menuData) return;
            
            item.setAttribute('data-item-id', menuData.id);
            item.setAttribute('data-item-category', menuData.category);
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.order-btn') && !e.target.closest('button')) {
                    this.showItemDetails(menuData);
                }
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-5px)';
                const priceBadge = item.querySelector('.price-badge');
                if (priceBadge) priceBadge.style.transform = 'scale(1.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                const priceBadge = item.querySelector('.price-badge');
                if (priceBadge) priceBadge.style.transform = 'scale(1)';
            });
            
            const orderBtn = item.querySelector('.order-btn');
            if (orderBtn) {
                orderBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addToCart(menuData);
                });
            }
            
            this.addMenuFavoriteButton(item, menuData);
            this.addMenuRating(item, menuData);
        });
    }

    addMenuFavoriteButton(item, menuData) {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn btn btn-sm position-absolute top-0 end-0 m-2';
        favoriteBtn.setAttribute('aria-label', `Favorite ${menuData.name}`);
        
        if (this.favorites.menu.includes(menuData.id)) {
            favoriteBtn.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            favoriteBtn.classList.add('favorited');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        }
        
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenuFavorite(menuData, favoriteBtn);
        });
        
        item.querySelector('.card-body').appendChild(favoriteBtn);
    }

    toggleMenuFavorite(menuData, button) {
        if (this.favorites.menu.includes(menuData.id)) {
            this.favorites.menu = this.favorites.menu.filter(id => id !== menuData.id);
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('favorited');
            this.showNotification(`Removed ${menuData.name} from favorites`, 'info');
        } else {
            this.favorites.menu.push(menuData.id);
            button.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            button.classList.add('favorited');
            this.showNotification(`Added ${menuData.name} to favorites!`, 'success');
            
            button.style.animation = 'pulse 0.5s';
            setTimeout(() => button.style.animation = '', 500);
        }
        
        localStorage.setItem('mewbrew_favorites', JSON.stringify(this.favorites.menu));
    }

    addMenuRating(item, menuData) {
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'item-rating mt-2';
        ratingDiv.innerHTML = `
            <div class="d-flex align-items-center small">
                <div class="stars me-2">
                    ${this.getStarRating(menuData.rating)}
                </div>
                <span class="text-muted">(${menuData.favorites})</span>
            </div>
        `;
        
        item.querySelector('.card-body').appendChild(ratingDiv);
    }

    getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        
        return stars;
    }

    showItemDetails(menuData) {
        const modal = this.createModal({
            id: 'itemDetailsModal',
            title: menuData.name,
            content: `
                <div class="item-details">
                    <div class="text-center mb-4">
                        <img src="${menuData.image || 'images/menu/placeholder.jpg'}" alt="${menuData.name}" class="img-fluid rounded mb-3" style="max-height: 200px;">
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <h6 class="text-muted">Description</h6>
                            <p>${menuData.description}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-muted">Details</h6>
                            <ul class="list-unstyled">
                                <li class="mb-2"><i class="fas fa-tag me-2 text-warning"></i>₱${menuData.price}</li>
                                <li class="mb-2"><i class="fas fa-star me-2 text-warning"></i>${menuData.rating}/5</li>
                                <li class="mb-2">
                                    <i class="fas fa-tags me-2 text-warning"></i>
                                    ${menuData.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
                                </li>
                                <li class="mb-2">
                                    <i class="fas fa-${menuData.available ? 'check' : 'times'} me-2 ${menuData.available ? 'text-success' : 'text-danger'}"></i>
                                    ${menuData.available ? 'Available' : 'Currently Unavailable'}
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    ${menuData.category === 'coffee' ? `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Customization:</strong> Extra shot (+₱20), Soy milk (+₱15), Sugar-free syrup (+₱10)
                        </div>
                    ` : ''}
                    
                    ${menuData.category === 'pastry' ? `
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Note:</strong> Contains gluten. Gluten-free options available.
                        </div>
                    ` : ''}
                </div>
            `,
            buttons: [
                { text: 'Close', class: 'btn-outline-secondary', dismiss: true },
                { text: 'Add to Order', class: 'btn-warning', icon: 'plus', action: 'addToCart' }
            ],
            addToCart: () => {
                this.addToCart(menuData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('itemDetailsModal'));
                if (modal) modal.hide();
            }
        });
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    setupCart() {
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.toggleCart());
        }
        
        document.querySelector('.cart-overlay')?.addEventListener('click', () => this.toggleCart());
        document.querySelector('.cart-sidebar .btn-outline-secondary')?.addEventListener('click', () => this.toggleCart());
        
        this.updateCartDisplay();
    }

    addToCart(menuData) {
        if (!menuData.available) {
            this.showNotification(`${menuData.name} is currently unavailable`, 'warning');
            return;
        }
        
        const existingItem = this.shopData.cart.find(item => item.id === menuData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.shopData.cart.push({
                id: menuData.id,
                name: menuData.name,
                price: menuData.price,
                quantity: 1,
                category: menuData.category
            });
        }
        
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        
        this.updateCartCount();
        this.updateCartDisplay();
        
        this.showNotification(`${menuData.name} added to cart!`, 'success');
        this.animateCartIcon();
    }

    removeFromCart(index) {
        this.shopData.cart.splice(index, 1);
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        this.updateCartCount();
        this.updateCartDisplay();
    }

    updateQuantity(index, change) {
        this.shopData.cart[index].quantity += change;
        
        if (this.shopData.cart[index].quantity <= 0) {
            this.shopData.cart.splice(index, 1);
        }
        
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        this.updateCartCount();
        this.updateCartDisplay();
    }

    updateCartCount() {
        if (!this.cartCount) return;
        
        const totalItems = this.shopData.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            this.cartCount.style.display = 'flex';
            this.cartCount.classList.add('updated');
            setTimeout(() => this.cartCount.classList.remove('updated'), 300);
        } else {
            this.cartCount.style.display = 'none';
        }
    }

    updateCartDisplay() {
        if (!this.cartItemsContainer) return;
        
        this.cartItemsContainer.innerHTML = '';
        
        if (this.shopData.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>Your cart is empty</p>
                    <p>Add some delicious items from our menu!</p>
                </div>
            `;
            if (this.cartSummary) this.cartSummary.style.display = 'none';
            return;
        }
        
        let subtotal = 0;
        
        this.shopData.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="mb-0 text-muted">₱${item.price} each</p>
                    </div>
                    <span class="fw-bold">₱${itemTotal}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(itemElement);
        });
        
        // Add event listeners
        this.cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const action = e.target.dataset.action;
                this.updateQuantity(index, action === 'increase' ? 1 : -1);
            });
        });
        
        this.cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFromCart(index);
            });
        });
        
        const serviceFee = subtotal * this.serviceFeePercent;
        const total = subtotal + serviceFee;
        this.cartTotal = total;
        
        const subtotalEl = document.getElementById('subtotal');
        const serviceFeeEl = document.getElementById('service-fee');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
        if (serviceFeeEl) serviceFeeEl.textContent = `₱${serviceFee.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
        
        if (this.cartSummary) this.cartSummary.style.display = 'block';
    }

    animateCartIcon() {
        if (!this.cartIcon) return;
        
        this.cartIcon.style.animation = 'bounce 0.5s';
        setTimeout(() => {
            this.cartIcon.style.animation = '';
        }, 500);
    }

    toggleCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        cartSidebar?.classList.toggle('open');
        cartOverlay?.classList.toggle('active');
        
        if (cartSidebar?.classList.contains('open')) {
            this.updateCartDisplay();
        }
    }

    showCartModal() {
        if (this.shopCartModal) {
            const cartModal = new bootstrap.Modal(this.shopCartModal);
            cartModal.show();
        }
    }

    setupCheckoutModal() {
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.showCheckoutModal());
        }
        
        document.querySelector('#checkoutModal .btn-warning')?.addEventListener('click', () => {
            this.submitOrder();
        });
    }

    showCheckoutModal() {
        if (this.shopData.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }
        
        this.toggleCart();
        
        const modalCartItems = document.getElementById('modal-cart-items');
        if (modalCartItems) {
            modalCartItems.innerHTML = '';
            
            this.shopData.cart.forEach((item) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'd-flex justify-content-between mb-2';
                itemElement.innerHTML = `
                    <span>${item.quantity}x ${item.name}</span>
                    <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                `;
                modalCartItems.appendChild(itemElement);
            });
        }
        
        const modalTotal = document.getElementById('modal-total');
        if (modalTotal) modalTotal.textContent = `₱${this.cartTotal?.toFixed(2) || '0.00'}`;
        
        const timeInput = document.getElementById('preferredTime');
        if (timeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            timeInput.value = now.toISOString().slice(0, 16);
        }
        
        const modal = new bootstrap.Modal(this.checkoutModal);
        modal.show();
    }

    submitOrder() {
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const orderType = document.getElementById('orderType')?.value;
        const instructions = document.getElementById('specialInstructions')?.value;
        const preferredTime = document.getElementById('preferredTime')?.value;
        const terms = document.getElementById('terms')?.checked;
        
        if (!name || !email || !phone) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        if (!terms) {
            this.showNotification('Please agree to the terms and conditions', 'warning');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'warning');
            return;
        }
        
        if (!this.isValidPhone(phone)) {
            this.showNotification('Please enter a valid phone number', 'warning');
            return;
        }
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const serviceFee = subtotal * this.serviceFeePercent;
        const total = subtotal + serviceFee;
        
        const order = {
            id: 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
            customer: { name, email, phone },
            items: [...this.shopData.cart],
            details: {
                type: orderType,
                instructions,
                preferredTime,
                subtotal,
                serviceFee,
                total
            },
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        this.orderHistory.push(order);
        localStorage.setItem('mewbrew_order_history', JSON.stringify(this.orderHistory));
        
        this.shopData.cart = [];
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        
        const modal = bootstrap.Modal.getInstance(this.checkoutModal);
        if (modal) modal.hide();
        
        document.getElementById('orderForm')?.reset();
        
        this.showOrderSuccessModal(order);
    }

    showOrderSuccessModal(order) {
        const modal = this.createModal({
            id: 'orderSuccessModal',
            title: '<i class="fas fa-check-circle text-success me-2"></i>Order Confirmed!',
            content: `
                <div class="text-center py-4">
                    <i class="fas fa-coffee fa-4x text-warning mb-3"></i>
                    <h4 class="mb-3">Thank You for Your Order!</h4>
                    <div class="order-details mb-3 p-3 bg-light rounded">
                        <p class="mb-1"><strong>Order ID:</strong> ${order.id}</p>
                        <p class="mb-1"><strong>Total:</strong> ₱${order.details.total.toFixed(2)}</p>
                        <p class="mb-1"><strong>Type:</strong> ${order.details.type}</p>
                        ${order.details.preferredTime ? 
                            `<p class="mb-0"><strong>Preferred Time:</strong> ${new Date(order.details.preferredTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>` : 
                            ''
                        }
                    </div>
                    <p class="mb-0">Your order has been received and is being prepared.</p>
                </div>
            `,
            buttons: [
                { text: 'Close', class: 'btn-primary w-100', dismiss: true },
                { text: 'Copy Order ID', class: 'btn-outline-warning mt-2', icon: 'copy', action: 'copyOrderId' }
            ],
            copyOrderId: () => {
                navigator.clipboard.writeText(order.id);
                this.showNotification('Order ID copied to clipboard!', 'success');
            }
        });
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    setupMenuFilters() {
        const menuContainer = document.querySelector('.menu-container');
        if (!menuContainer) return;
        
        const filterDiv = document.createElement('div');
        filterDiv.className = 'menu-filters mb-5';
        filterDiv.innerHTML = `
            <div class="d-flex flex-wrap gap-3 align-items-center justify-content-center">
                <span class="fw-bold">Filter by:</span>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-warning active" data-filter="all">All Items</button>
                    <button type="button" class="btn btn-outline-warning" data-filter="coffee">Coffee</button>
                    <button type="button" class="btn btn-outline-warning" data-filter="pastry">Pastries</button>
                    <button type="button" class="btn btn-outline-warning" data-filter="non-coffee">Non-Coffee</button>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="availableOnly">
                    <label class="form-check-label" for="availableOnly">Available Only</label>
                </div>
            </div>
        `;
        
        const firstCategory = document.querySelector('.menu-category');
        if (firstCategory) {
            menuContainer.insertBefore(filterDiv, firstCategory);
        }
        
        filterDiv.querySelectorAll('button[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterDiv.querySelectorAll('button[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterMenuItems(e.target.dataset.filter);
            });
        });
        
        const availableCheckbox = document.getElementById('availableOnly');
        availableCheckbox?.addEventListener('change', () => {
            const activeFilter = filterDiv.querySelector('button[data-filter].active').dataset.filter;
            this.filterMenuItems(activeFilter);
        });
    }

    filterMenuItems(filterType) {
        const showAvailableOnly = document.getElementById('availableOnly')?.checked || false;
        
        this.menuItems.forEach((item, index) => {
            const menuData = this.menuData[index];
            if (!menuData) return;
            
            let show = true;
            
            if (filterType !== 'all') {
                show = show && menuData.category === filterType;
            }
            
            if (showAvailableOnly) {
                show = show && menuData.available;
            }
            
            const categorySection = item.closest('.menu-category');
            if (categorySection) {
                const itemsInSection = categorySection.querySelectorAll('.menu-item');
                const visibleItems = Array.from(itemsInSection).filter(item => {
                    const itemIndex = Array.from(this.menuItems).indexOf(item);
                    const itemData = this.menuData[itemIndex];
                    if (!itemData) return false;
                    
                    let itemShow = true;
                    if (filterType !== 'all') itemShow = itemData.category === filterType;
                    if (showAvailableOnly) itemShow = itemShow && itemData.available;
                    return itemShow;
                });
                
                categorySection.style.display = visibleItems.length > 0 ? 'block' : 'none';
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    setupMenuSearch() {
        const menuContainer = document.querySelector('.menu-container');
        if (!menuContainer) return;
        
        const searchDiv = document.createElement('div');
        searchDiv.className = 'menu-search mb-4';
        searchDiv.innerHTML = `
            <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="search" class="form-control" placeholder="Search menu items..." id="menuSearch">
                <button class="btn btn-outline-warning" type="button" id="clearSearch">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const filters = document.querySelector('.menu-filters');
        if (filters) {
            menuContainer.insertBefore(searchDiv, filters);
        } else {
            const firstCategory = document.querySelector('.menu-category');
            if (firstCategory) {
                menuContainer.insertBefore(searchDiv, firstCategory);
            }
        }
        
        const searchInput = document.getElementById('menuSearch');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            this.searchMenuItems(query);
        });
        
        clearBtn?.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                this.searchMenuItems('');
            }
        });
    }

    searchMenuItems(query) {
        this.menuItems.forEach((item, index) => {
            const menuData = this.menuData[index];
            if (!menuData) return;
            
            let show = true;
            
            if (query) {
                const matches = menuData.name.toLowerCase().includes(query) ||
                               menuData.description.toLowerCase().includes(query) ||
                               menuData.tags.some(tag => tag.toLowerCase().includes(query));
                show = matches;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    // ==================== SHOP FEATURES ====================

    initShop() {
        console.log('Initializing shop features');
        
        this.shopCartCount = document.getElementById('cartCount');
        this.shopCartItemsContainer = document.getElementById('cartItemsContainer');
        this.shopCartSubtotal = document.getElementById('cartSubtotal');
        this.shopCartShipping = document.getElementById('cartShipping');
        this.shopCartTotal = document.getElementById('cartTotal');
        this.shopCheckoutBtn = document.getElementById('checkoutBtn');
        this.shopCartModal = document.getElementById('cartModal');
        this.shopCheckoutModal = document.getElementById('checkoutModal');
        this.shopSuccessModal = document.getElementById('successModal');
        this.shopCheckoutForm = document.getElementById('checkoutForm');
        this.shopCartToggle = document.querySelector('.cart-toggle');
        
        this.shopIsCartModalOpen = false;
        
        this.setupShopEventListeners();
        this.updateShopCartDisplay();
    }

    setupShopEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const productName = button.getAttribute('data-product');
                const price = parseInt(button.getAttribute('data-price'));
                
                this.addShopProduct(productName, price);
            });
        });
        
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.filterShopProducts(e.target.getAttribute('data-filter'));
            });
        });
        
        if (this.shopCartModal) {
            this.shopCartModal.addEventListener('show.bs.modal', () => {
                this.shopIsCartModalOpen = true;
                this.updateShopCartModal();
            });
            
            this.shopCartModal.addEventListener('hidden.bs.modal', () => {
                this.shopIsCartModalOpen = false;
            });
        }
        
        if (this.shopCartToggle) {
            this.shopCartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                document.querySelectorAll('.modal.show').forEach(modal => {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                });
                
                setTimeout(() => {
                    const cartModal = new bootstrap.Modal(this.shopCartModal);
                    cartModal.show();
                }, 300);
            });
        }
        
        if (this.shopCheckoutBtn) {
            this.shopCheckoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.shopData.cart.length === 0) {
                    this.showNotification('Your cart is empty!', 'warning');
                    return;
                }
                
                const cartModal = bootstrap.Modal.getInstance(this.shopCartModal);
                if (cartModal) cartModal.hide();
                
                this.updateShopCheckoutModal();
                
                setTimeout(() => {
                    const checkoutModal = new bootstrap.Modal(this.shopCheckoutModal);
                    checkoutModal.show();
                }, 300);
            });
        }
        
        if (this.shopCheckoutForm) {
            this.shopCheckoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processShopOrder();
            });
        }
        
        document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateShopCheckoutModal();
                
                const addressField = document.getElementById('checkoutAddress');
                const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
                
                if (addressField) {
                    if (shippingMethod?.value === 'delivery') {
                        addressField.required = true;
                        addressField.closest('.mb-3').style.display = 'block';
                    } else {
                        addressField.required = false;
                        addressField.closest('.mb-3').style.display = 'none';
                    }
                }
            });
        });
        
        document.getElementById('copyOrderId')?.addEventListener('click', () => {
            const orderId = document.getElementById('orderId')?.textContent;
            if (orderId) {
                navigator.clipboard.writeText(orderId);
                this.showNotification('Order ID copied to clipboard!', 'success');
            }
        });
        
        document.getElementById('continueShopping')?.addEventListener('click', () => {
            const successModal = bootstrap.Modal.getInstance(this.shopSuccessModal);
            if (successModal) successModal.hide();
        });
    }

    addShopProduct(productName, price) {
        const existingItemIndex = this.shopData.cart.findIndex(item => item.name === productName);
        
        if (existingItemIndex > -1) {
            this.shopData.cart[existingItemIndex].quantity += 1;
        } else {
            this.shopData.cart.push({
                id: 'item-' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: productName,
                price: price,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveShopCart();
        this.updateShopCartDisplay();
        this.showNotification(`${productName} added to cart!`, 'success');
        this.animateShopCartButton();
    }

    removeShopItem(itemId) {
        this.shopData.cart = this.shopData.cart.filter(item => item.id !== itemId);
        this.saveShopCart();
        this.updateShopCartDisplay();
        
        if (this.shopIsCartModalOpen) {
            this.updateShopCartModal();
        }
    }

    updateShopQuantity(itemId, change) {
        const itemIndex = this.shopData.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex > -1) {
            this.shopData.cart[itemIndex].quantity += change;
            
            if (this.shopData.cart[itemIndex].quantity <= 0) {
                this.shopData.cart.splice(itemIndex, 1);
            }
            
            this.saveShopCart();
            this.updateShopCartDisplay();
            
            if (this.shopIsCartModalOpen) {
                this.updateShopCartModal();
            }
        }
    }

    saveShopCart() {
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
    }

    updateShopCartDisplay() {
        const totalItems = this.shopData.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.shopCartCount) {
            this.shopCartCount.textContent = totalItems;
            this.shopCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        if (this.shopIsCartModalOpen) {
            this.updateShopCartModal();
        }
        
        if (document.querySelector('#checkoutModal.show')) {
            this.updateShopCheckoutModal();
        }
    }

    updateShopCartModal() {
        if (!this.shopCartItemsContainer) return;
        
        this.shopCartItemsContainer.innerHTML = '';
        
        if (this.shopData.cart.length === 0) {
            this.shopCartItemsContainer.innerHTML = `
                <div class="cart-empty text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                    <p class="text-muted">Your cart is empty</p>
                    <p class="small text-muted">Add some items to support cat rescue!</p>
                </div>
            `;
            
            if (this.shopCartSubtotal) this.shopCartSubtotal.textContent = '₱0';
            if (this.shopCartShipping) this.shopCartShipping.textContent = '₱0';
            if (this.shopCartTotal) this.shopCartTotal.textContent = '₱0';
            if (this.shopCheckoutBtn) this.shopCheckoutBtn.disabled = true;
            return;
        }
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal >= this.shopData.freeShippingThreshold ? 0 : this.shopData.shippingCost;
        const total = subtotal + shipping;
        const supportAmount = (subtotal * this.shopData.supportPercentage) / 100;
        
        this.shopData.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-6">
                        <h6 class="mb-1">${this.escapeHtml(item.name)}</h6>
                        <small class="text-warning">₱${item.price} each</small>
                    </div>
                    <div class="col-3">
                        <div class="quantity-controls d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.mewbrew?.updateShopQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.mewbrew?.updateShopQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-3 text-end">
                        <span class="fw-bold">₱${itemTotal}</span>
                        <button class="btn btn-sm btn-outline-danger ms-2" onclick="window.mewbrew?.removeShopItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            this.shopCartItemsContainer.appendChild(cartItem);
        });
        
        const supportDiv = document.createElement('div');
        supportDiv.className = 'row mt-2';
        supportDiv.innerHTML = `
            <div class="col-6">
                <small class="text-success">
                    <i class="fas fa-paw me-1"></i>Cat Rescue Support:
                </small>
            </div>
            <div class="col-6 text-end">
                <small class="text-success fw-bold">₱${supportAmount.toFixed(2)}</small>
            </div>
        `;
        this.shopCartItemsContainer.appendChild(supportDiv);
        
        if (this.shopCartSubtotal) this.shopCartSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
        if (this.shopCartShipping) {
            this.shopCartShipping.textContent = shipping === 0 ? 'Free!' : `₱${shipping.toFixed(2)}`;
            this.shopCartShipping.classList.toggle('text-success', shipping === 0);
        }
        if (this.shopCartTotal) this.shopCartTotal.textContent = `₱${total.toFixed(2)}`;
        if (this.shopCheckoutBtn) this.shopCheckoutBtn.disabled = false;
        
        if (subtotal > 0 && subtotal < this.shopData.freeShippingThreshold) {
            const amountNeeded = this.shopData.freeShippingThreshold - subtotal;
            const freeShippingMsg = document.createElement('div');
            freeShippingMsg.className = 'alert alert-info alert-sm mt-3';
            freeShippingMsg.innerHTML = `
                <i class="fas fa-truck me-2"></i>
                Add ₱${amountNeeded.toFixed(2)} more for free shipping!
            `;
            this.shopCartItemsContainer.appendChild(freeShippingMsg);
        }
    }

    updateShopCheckoutModal() {
        if (!this.shopCheckoutModal) return;
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
        const shipping = shippingMethod?.value === 'pickup' ? 0 : this.shopData.shippingCost;
        const total = subtotal + shipping;
        const supportAmount = (subtotal * this.shopData.supportPercentage) / 100;
        
        const checkoutItems = document.getElementById('checkoutItems');
        const checkoutShipping = document.getElementById('checkoutShipping');
        const checkoutTotal = document.getElementById('checkoutTotal');
        const checkoutSupport = document.getElementById('checkoutSupport');
        
        if (checkoutItems) checkoutItems.textContent = `₱${subtotal.toFixed(2)}`;
        if (checkoutShipping) checkoutShipping.textContent = shipping === 0 ? 'Free!' : `₱${shipping.toFixed(2)}`;
        if (checkoutTotal) checkoutTotal.textContent = `₱${total.toFixed(2)}`;
        if (checkoutSupport) checkoutSupport.textContent = `₱${supportAmount.toFixed(2)}`;
    }

    animateShopCartButton() {
        if (this.shopCartToggle) {
            this.shopCartToggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.shopCartToggle.style.transform = 'scale(1)';
            }, 200);
        }
    }

    filterShopProducts(filter) {
        document.querySelectorAll('.product-item').forEach(item => {
            item.style.display = filter === 'all' || item.getAttribute('data-category') === filter ? 'block' : 'none';
        });
    }

    processShopOrder() {
        if (this.shopData.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }
        
        const name = document.getElementById('checkoutName')?.value;
        const email = document.getElementById('checkoutEmail')?.value;
        const phone = document.getElementById('checkoutPhone')?.value;
        const address = document.getElementById('checkoutAddress')?.value;
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
        
        if (!name || !email || !phone) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        if (shippingMethod?.value === 'delivery' && !address) {
            this.showNotification('Please enter your delivery address', 'warning');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'warning');
            return;
        }
        
        if (!this.isValidPhone(phone)) {
            this.showNotification('Please enter a valid phone number', 'warning');
            return;
        }
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = shippingMethod?.value === 'pickup' ? 0 : this.shopData.shippingCost;
        const total = subtotal + shipping;
        const supportAmount = (subtotal * this.shopData.supportPercentage) / 100;
        
        const orderId = 'ORDER-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        
        const order = {
            id: orderId,
            customer: {
                name,
                email,
                phone,
                address: shippingMethod?.value === 'delivery' ? address : 'Local Pickup',
                shippingMethod: shippingMethod?.value || 'pickup'
            },
            items: [...this.shopData.cart],
            totals: { subtotal, shipping, supportAmount, total },
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        this.shopData.orders.push(order);
        localStorage.setItem('mewbrew_shop_orders', JSON.stringify(this.shopData.orders));
        
        this.shopData.cart = [];
        this.saveShopCart();
        this.updateShopCartDisplay();
        
        const checkoutModal = bootstrap.Modal.getInstance(this.shopCheckoutModal);
        if (checkoutModal) checkoutModal.hide();
        
        this.shopCheckoutForm?.reset();
        
        const orderIdEl = document.getElementById('orderId');
        const orderTotalEl = document.getElementById('orderTotal');
        const orderSupportEl = document.getElementById('orderSupport');
        
        if (orderIdEl) orderIdEl.textContent = orderId;
        if (orderTotalEl) orderTotalEl.textContent = `₱${total.toFixed(2)}`;
        if (orderSupportEl) orderSupportEl.textContent = `₱${supportAmount.toFixed(2)}`;
        
        setTimeout(() => {
            const successModal = new bootstrap.Modal(this.shopSuccessModal);
            successModal.show();
        }, 300);
        
        this.showNotification('Order placed successfully!', 'success');
    }

    shopCartToggle() {
        if (this.shopCartModal) {
            // Close any open modals first
            document.querySelectorAll('.modal.show').forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            });
            
            setTimeout(() => {
                const cartModal = new bootstrap.Modal(this.shopCartModal);
                cartModal.show();
            }, 300);
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\d\s\-\+\(\)]{7,15}$/;
        return re.test(phone);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    animateElement(element, animationType) {
        if (!element) return;
        
        const classes = {
            increase: 'animate-increase',
            decrease: 'animate-decrease',
            highlight: 'highlight-total'
        };
        
        element.classList.remove(...Object.values(classes));
        void element.offsetWidth;
        element.classList.add(classes[animationType] || '');
        
        setTimeout(() => {
            element.classList.remove(classes[animationType] || '');
        }, 300);
    }

    trackVisit() {
        this.visitCount++;
        localStorage.setItem('mewbrew_visit_count', this.visitCount.toString());
        
        const pageViews = JSON.parse(localStorage.getItem('mewbrew_page_views') || '{}');
        const currentPage = this.currentPage + '.html';
        pageViews[currentPage] = (pageViews[currentPage] || 0) + 1;
        localStorage.setItem('mewbrew_page_views', JSON.stringify(pageViews));
    }

    // ==================== STYLES ====================

    addGlobalStyles() {
        if (document.getElementById('mewbrew-global-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mewbrew-global-styles';
        style.textContent = `
            /* CSS Variables */
            :root {
                --bg-primary: #fffaf0;
                --text-primary: #5d4037;
                --text-secondary: #795548;
                --card-bg: #ffffff;
                --border-color: #ffe0b2;
                --footer-bg: #3e2723;
                --footer-text: #d7ccc8;
            }
            
            .dark-theme {
                --bg-primary: #121212 !important;
                --text-primary: #ffffff !important;
                --text-secondary: #e0e0e0 !important;
                --card-bg: #1e1e1e !important;
                --border-color: #333333 !important;
                --footer-bg: #0a0a0a !important;
                --footer-text: #b0b0b0 !important;
            }
            
            /* Universal styles */
            body {
                background-color: var(--bg-primary) !important;
                color: var(--text-primary) !important;
                transition: background-color 0.3s ease, color 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            h1, h2, h3, h4, h5, h6 {
                color: var(--text-primary) !important;
            }
            
            p, li, span, div:not(.badge):not(.btn):not(.stat-number):not(.text-warning) {
                color: var(--text-secondary) !important;
            }
            
            .card {
                background-color: var(--card-bg) !important;
                border-color: var(--border-color) !important;
                transition: all 0.3s ease;
            }
            
            .card:hover {
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            }
            
            .card-title, .card-text {
                color: var(--text-primary) !important;
            }
            
            footer {
                background-color: var(--footer-bg) !important;
            }
            
            .footer-section p,
            .footer-section ul li a {
                color: var(--footer-text) !important;
            }
            
            .text-warning,
            .stat-number,
            .highlight {
                color: #ff9800 !important;
            }
            
            .navbar {
                background: linear-gradient(135deg, #8d6e63 0%, #5d4037 100%) !important;
            }
            
            .dark-theme .navbar {
                background: linear-gradient(135deg, #3d2e2a 0%, #2c1e1a 100%) !important;
            }
            
            .nav-link {
                color: white !important;
            }
            
            .hero,
            .hero h1,
            .hero p,
            .hero .lead,
            .hero .hero-description,
            .hero .tagline {
                color: white !important;
            }
            
            /* Animation classes */
            .animate-on-load {
                opacity: 0;
                transform: translateY(20px);
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
                transition: all 0.6s ease;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Back to top button */
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .back-to-top.visible {
                display: flex;
                animation: fadeIn 0.3s ease;
            }
            
            .back-to-top:hover {
                transform: translateY(-5px);
            }
            
            /* Theme toggle */
            .theme-toggle {
                position: fixed;
                bottom: 90px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(255, 152, 0, 0.2);
                transition: all 0.3s ease;
            }
            
            .theme-toggle:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(255, 152, 0, 0.3);
            }
            
            /* Scroll progress */
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #ff9800, #ffb74d);
                z-index: 9999;
                transition: width 0.1s ease;
                box-shadow: 0 2px 10px rgba(255, 152, 0, 0.2);
            }
            
            /* Page transition overlay */
            .page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--bg-primary);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .page-transition-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .page-transition-content {
                text-align: center;
            }
            
            .cat-loader {
                position: relative;
                width: 100px;
                height: 100px;
                margin: 0 auto 20px;
            }
            
            .cat-loader .fa-cat {
                font-size: 4rem;
                color: #ff9800;
                animation: bounce 1s infinite alternate;
            }
            
            .cat-loader .fa-coffee {
                font-size: 2rem;
                color: var(--text-secondary);
                position: absolute;
                bottom: 10px;
                right: 10px;
                animation: rotate 2s linear infinite;
            }
            
            /* Notifications */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1060;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes bounce {
                from {
                    transform: translateY(0);
                }
                to {
                    transform: translateY(-10px);
                }
            }
            
            @keyframes rotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes floatAround {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                }
                33% {
                    transform: translate(10px, -10px) rotate(5deg);
                }
                66% {
                    transform: translate(-10px, 10px) rotate(-5deg);
                }
                100% {
                    transform: translate(0, 0) rotate(0deg);
                }
            }
            
            /* Floating cats */
            .floating-cats {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            }
            
            /* Cart animations */
            .cart-count.updated {
                animation: bounce 0.3s;
            }
            
            .cart-item {
                animation: fadeIn 0.3s ease;
            }
            
            /* Filter buttons */
            .menu-filters .btn-outline-warning.active,
            .cat-filters .btn-outline-warning.active {
                background-color: #ff9800;
                color: white;
                border-color: #ff9800;
            }
            
            /* Cat tooltip */
            .cat-tooltip {
                position: fixed;
                z-index: 1000;
                max-width: 300px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            }
            
            /* Category badges */
            .category-badge {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .category-badge:hover,
            .category-badge.active {
                background-color: #ff9800 !important;
                color: white !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .back-to-top,
                .theme-toggle {
                    bottom: 20px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                }
                
                .theme-toggle {
                    bottom: 75px;
                }
                
                .menu-filters,
                .menu-search {
                    flex-direction: column;
                    gap: 10px !important;
                }
                
                .menu-filters .btn-group {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .menu-filters .btn {
                    margin-bottom: 5px;
                }
            }
            
            /* Quantity controls */
            .quantity-controls {
                display: flex;
                align-items: center;
            }
            
            .quantity-btn {
                width: 30px;
                height: 30px;
                border: 1px solid var(--border-color);
                background: var(--card-bg);
                color: var(--text-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .quantity-btn:hover {
                background: #ff9800;
                color: white;
            }
            
            .remove-btn {
                background: none;
                border: none;
                color: #dc3545;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .remove-btn:hover {
                transform: scale(1.1);
            }
            
            /* Global alert */
            .global-alert {
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MewBrewSystem.getInstance();
});

// Make system globally available
window.MewBrewSystem = MewBrewSystem;