// main.js - Unified JavaScript for MewBrew Café
// Focuses on custom functionality that Bootstrap doesn't provide

document.addEventListener('DOMContentLoaded', function() {
    console.log('🐱 MewBrew Café System initialized');
    MewBrewSystem.getInstance().init();
});

class MewBrewSystem {
    static instance = null;
    
    static getInstance() {
        if (!MewBrewSystem.instance) {
            MewBrewSystem.instance = new MewBrewSystem();
        }
        return MewBrewSystem.instance;
    }

    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isMobile = window.innerWidth <= 768;
        this.isDarkMode = this.checkDarkMode();
        this.scrollPosition = 0;
        this.visitCount = parseInt(localStorage.getItem('mewbrew_visit_count') || '0');
        
        // Initialize data stores
        this.initDataStores();
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    init() {
        this.setupEventListeners();
        this.initDarkMode();
        this.initPageFeatures();
        this.setupUniversalFeatures();
        this.trackVisit();
        
        // Make system globally available
        window.mewbrew = this;
    }

    initDataStores() {
        // Booking data
        this.bookingData = {
            PRICES: { standard: 200, student: 150, group: 170 },
            TIME_SLOTS: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
            currentBooking: null,
            bookings: JSON.parse(localStorage.getItem('mewbrew_bookings') || '[]')
        };
        
        // Cats data
        this.catsData = [
            { id: 'tangol', name: 'Tangol', age: '1 year', color: 'Orange & White', personality: 'Playful & Loud', status: 'available', visits: 28, favoriteToy: 'Crinkly balls', description: 'Tangol loves to roll around and bite stuff! He\'s a playful and loud cat who keeps everyone entertained with his antics.' },
            { id: 'xia-ming', name: 'Xia Ming', age: '9 months', color: 'Tilapya', personality: 'Shy & Friendly', status: 'available', visits: 15, favoriteToy: 'Catnip mouse', description: 'Xia Ming rarely meows and is always curious about everything. Though shy at first, she warms up quickly.' },
            { id: 'ying-yang', name: 'Ying Yang', age: '9 months', color: 'Black & White', personality: 'Energetic', status: 'available', visits: 22, favoriteToy: 'Feather wand', description: 'Ying Yang loves to watch people gossip and is always curious about anything happening around.' },
            { id: 'mini', name: 'Mini', age: '9 months', color: 'Black, Orange & White', personality: 'Playful & Energetic', status: 'available', visits: 19, favoriteToy: 'Soft blankets', description: 'Mini is famous for her bread-making skills! She loves to knead on soft blankets and pillows.' }
        ];
        
        // Menu data
        this.menuData = [
            { id: 'espresso', name: 'Espresso', price: 100, category: 'coffee', tags: ['Hot', 'Strong'], description: 'Strong, rich coffee served in a small cup', rating: 4.5, favorites: 120, available: true },
            { id: 'cappuccino', name: 'Cappuccino', price: 130, category: 'coffee', tags: ['Foamy', 'Classic'], description: 'Equal parts espresso, steamed milk, and milk foam', rating: 4.7, favorites: 150, available: true },
            { id: 'latte', name: 'Latte', price: 140, category: 'coffee', tags: ['Creamy', 'Mild'], description: 'Espresso with steamed milk and a light foam layer', rating: 4.6, favorites: 180, available: true },
            { id: 'mocha', name: 'Mocha', price: 150, category: 'coffee', tags: ['Chocolate', 'Sweet'], description: 'Chocolate-infused espresso with steamed milk', rating: 4.8, favorites: 200, available: true },
            { id: 'croissant', name: 'Croissant', price: 80, category: 'pastry', tags: ['Buttery', 'Fresh'], description: 'Buttery, flaky pastry made with layered dough', rating: 4.4, favorites: 90, available: true },
            { id: 'chocolate-muffin', name: 'Chocolate Muffin', price: 90, category: 'pastry', tags: ['Chocolate', 'Moist'], description: 'Rich chocolate muffin with chocolate chips', rating: 4.5, favorites: 110, available: true },
            { id: 'brownies', name: 'Brownies', price: 85, category: 'pastry', tags: ['Chocolate', 'Fudgy'], description: 'Rich, fudgy chocolate brownies with a crispy top', rating: 4.6, favorites: 130, available: true },
            { id: 'cherry-pie', name: 'Cherry Pie', price: 95, category: 'pastry', tags: ['Fruity', 'Sweet'], description: 'Classic cherry pie with flaky crust and sweet cherry filling', rating: 4.7, favorites: 140, available: true },
            { id: 'fruit-tea', name: 'Fruit Tea', price: 110, category: 'non-coffee', tags: ['Fruity', 'Refreshing'], description: 'Refreshing tea with natural fruit flavors', rating: 4.4, favorites: 95, available: true },
            { id: 'chocolate-milktea', name: 'Chocolate Milk Tea', price: 120, category: 'non-coffee', tags: ['Creamy', 'With Pearls'], description: 'Creamy milk tea with rich chocolate flavor and tapioca pearls', rating: 4.6, favorites: 125, available: true },
            { id: 'iced-matcha', name: 'Iced Matcha', price: 95, category: 'non-coffee', tags: ['Refreshing', 'Cold'], description: 'Refreshing cold matcha green tea served over ice', rating: 4.5, favorites: 110, available: true },
            { id: 'matcha-latte', name: 'Matcha Latte', price: 135, category: 'non-coffee', tags: ['Green Tea', 'Healthy'], description: 'Japanese green tea with steamed milk', rating: 4.5, favorites: 120, available: true }
        ];
        
        // Shop data
        this.shopData = {
            cart: JSON.parse(localStorage.getItem('mewbrew_shop_cart') || '[]'),
            orders: JSON.parse(localStorage.getItem('mewbrew_shop_orders') || '[]'),
            shippingCost: 100,
            freeShippingThreshold: 1000,
            supportPercentage: 20
        };
        
        // Favorites
        this.favorites = {
            menu: JSON.parse(localStorage.getItem('mewbrew_favorites') || '[]'),
            cats: JSON.parse(localStorage.getItem('mewbrew_favorite_cats') || '[]')
        };
        
        // Adoption inquiries
        this.adoptionInquiries = JSON.parse(localStorage.getItem('mewbrew_adoption_inquiries') || '[]');
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
        const savedTheme = localStorage.getItem('mewbrew_theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
        
        this.updateThemeToggleIcon();
    }

    updateThemeToggleIcon() {
        const isDark = document.body.classList.contains('dark-theme');
        if (this.themeToggle) {
            this.themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('mewbrew_theme', isDark ? 'dark' : 'light');
        this.updateThemeToggleIcon();
    }

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll);
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('mewbrew_theme')) {
                document.body.classList.toggle('dark-theme', e.matches);
                document.body.classList.toggle('light-theme', !e.matches);
                this.updateThemeToggleIcon();
            }
        });
        
        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse?.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
    }

    handleScroll() {
        this.scrollPosition = window.scrollY;
        
        if (this.backToTopBtn) {
            this.backToTopBtn.classList.toggle('visible', this.scrollPosition > 300);
        }
        
        if (this.scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            this.scrollProgress.style.width = `${scrolled}%`;
        }
        
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.toggle('navbar-scrolled', this.scrollPosition > 100);
        }
    }

    initPageFeatures() {
        this.setupAnimations();
        this.setupBackToTop();
        this.setupThemeToggle();
        this.setupScrollProgress();
        this.setupPageTransitions();
        
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
            case 'events':
                this.initEvents();
                break;
        }
    }

    setupUniversalFeatures() {
        this.setupFloatingCats();
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        document.querySelectorAll('.card, .section-title, .menu-item, .cat-card, .product-item, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
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
        this.themeToggle.className = 'theme-toggle';
        this.themeToggle.innerHTML = `<i class="fas fa-${this.isDarkMode ? 'sun' : 'moon'}"></i>`;
        this.themeToggle.setAttribute('aria-label', 'Toggle theme');
        document.body.appendChild(this.themeToggle);
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setupScrollProgress() {
        if (this.scrollProgress) return;
        
        this.scrollProgress = document.createElement('div');
        this.scrollProgress.className = 'scroll-progress';
        document.body.appendChild(this.scrollProgress);
    }

    setupPageTransitions() {
        document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
            if (link.href && link.href.includes(window.location.origin) && 
                !link.href.includes('#') && !link.hasAttribute('download') &&
                !link.closest('.cart-toggle') && !link.closest('.theme-toggle')) {
                link.addEventListener('click', (e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                        this.showPageTransition();
                    }
                });
            }
        });
    }

    showPageTransition() {
        let overlay = document.querySelector('.page-transition-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'page-transition-overlay';
            overlay.innerHTML = `
                <div class="page-transition-content text-center">
                    <div class="cat-loader mb-3">
                        <i class="fas fa-cat fa-4x text-warning"></i>
                    </div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.classList.add('active');
        
        window.addEventListener('load', () => {
            overlay.classList.remove('active');
        }, { once: true });
    }

    setupFloatingCats() {
        if (document.querySelector('.floating-cats')) return;
        
        const container = document.createElement('div');
        container.className = 'floating-cats';
        
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

    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `position-fixed top-0 end-0 m-3 p-3 bg-${type} text-white rounded shadow-lg`;
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.style.animation = 'slideIn 0.3s ease';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\d\s\-\+\(\)]{7,15}$/.test(phone);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    trackVisit() {
        this.visitCount++;
        localStorage.setItem('mewbrew_visit_count', this.visitCount.toString());
        
        const pageViews = JSON.parse(localStorage.getItem('mewbrew_page_views') || '{}');
        pageViews[this.currentPage + '.html'] = (pageViews[this.currentPage + '.html'] || 0) + 1;
        localStorage.setItem('mewbrew_page_views', JSON.stringify(pageViews));
    }

    // ==================== HOMEPAGE ====================

    initHomepage() {
        this.setupStatsCounter();
        this.setupVisitorGreeting();
        this.setupHeroAnimation();
    }

    setupHeroAnimation() {
        document.querySelectorAll('.hero-content, .hero-image').forEach((el, i) => {
            el.classList.add('animate-on-load');
            el.style.animationDelay = `${0.2 + i * 0.2}s`;
        });
    }

    setupStatsCounter() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const targetText = counter.textContent.trim();
            const target = parseInt(targetText.replace(/[^0-9]/g, ''));
            
            if (isNaN(target) || target === 0) return;
            
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

    setupVisitorGreeting() {
        if (this.visitCount === 1) {
            setTimeout(() => {
                this.showNotification('Welcome to MewBrew Café! First-time visitor? Enjoy 10% off your first order!', 'info', 5000);
            }, 1000);
        }
    }

    // ==================== BOOKING ====================

    initBooking() {
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
            }
        });
        
        increase.addEventListener('click', () => {
            let value = parseInt(guests.value);
            if (value < 10) {
                guests.value = value + 1;
                this.bookingCurrent.guests = guests.value;
                this.updateBookingSummary();
                
                if (value + 1 >= 5 && this.bookingElements.category) {
                    this.bookingElements.category.value = 'group';
                    this.bookingCurrent.category = 'group';
                    this.updateBookingSummary();
                    this.showNotification('Group discount applied! ₱170 per person', 'success');
                }
            }
        });
        
        guests.addEventListener('change', () => {
            let value = parseInt(guests.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) value = 10;
            
            guests.value = value;
            this.bookingCurrent.guests = value;
            this.updateBookingSummary();
        });
    }

    setupBookingEvents() {
        const { category, time, email } = this.bookingElements;
        
        if (category) {
            category.addEventListener('change', (e) => {
                this.bookingCurrent.category = e.target.value;
                this.updateBookingSummary();
            });
        }
        
        if (time) {
            time.addEventListener('change', (e) => {
                this.bookingCurrent.time = e.target.value;
            });
        }
        
        if (email) {
            email.addEventListener('blur', () => {
                if (email.value && !this.isValidEmail(email.value)) {
                    this.showNotification('Please enter a valid email address', 'warning');
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
    }

    validateBooking() {
        const { fullname, email, date, time, guests, category } = this.bookingElements;
        
        if (!fullname?.value?.trim()) {
            this.showNotification('Please enter your full name', 'warning');
            return false;
        }
        
        if (!email?.value?.trim()) {
            this.showNotification('Please enter your email address', 'warning');
            return false;
        } else if (!this.isValidEmail(email.value)) {
            this.showNotification('Please enter a valid email address', 'warning');
            return false;
        }
        
        if (!date?.value) {
            this.showNotification('Please select a date', 'warning');
            return false;
        }
        
        if (!time?.value) {
            this.showNotification('Please select a time', 'warning');
            return false;
        }
        
        if (!guests?.value || parseInt(guests.value) < 1) {
            this.showNotification('Please select at least 1 guest', 'warning');
            return false;
        }
        
        if (!category?.value) {
            this.showNotification('Please select a category', 'warning');
            return false;
        }
        
        return true;
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
            
            this.showNotification(`Booking confirmed! Your ID: ${bookingId}`, 'success');
            this.resetBookingForm();
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
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
            this.showNotification('Weekends are popular! Some slots may be limited.', 'info');
        }
    }

    // ==================== CATS ====================

    initCats() {
        this.catCards = document.querySelectorAll('.cat-card');
        this.adoptionForm = document.querySelector('.adoption-form');
        this.adoptionElements = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            cat: document.getElementById('cat'),
            experience: document.getElementById('experience'),
            message: document.getElementById('message')
        };
        
        this.selectedCat = null;
        this.tooltipTimeout = null;
        
        this.setupCatCards();
        this.setupAdoptionForm();
        this.setupCatFilters();
        
        this.checkUrlForCatSelection();
    }

    setupCatCards() {
        this.catCards.forEach(card => {
            const catName = card.querySelector('.card-title')?.textContent.trim();
            const catData = this.catsData.find(cat => cat.name === catName);
            
            if (!catData) return;
            
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a') && !e.target.closest('button')) {
                    this.selectCatForAdoption(catData);
                }
            });
            
            this.addCatFavoriteButton(card, catData);
        });
    }

    addCatFavoriteButton(card, catData) {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle';
        favoriteBtn.style.width = '36px';
        favoriteBtn.style.height = '36px';
        favoriteBtn.style.background = 'var(--card-bg)';
        favoriteBtn.style.border = '1px solid var(--accent-orange)';
        favoriteBtn.setAttribute('aria-label', `Favorite ${catData.name}`);
        
        favoriteBtn.innerHTML = this.favorites.cats.includes(catData.id) 
            ? '<i class="fas fa-heart text-danger"></i>' 
            : '<i class="far fa-heart"></i>';
        
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
            this.showNotification(`Removed ${catData.name} from favorites`, 'info');
        } else {
            this.favorites.cats.push(catData.id);
            button.innerHTML = '<i class="fas fa-heart text-danger"></i>';
            this.showNotification(`Added ${catData.name} to favorites!`, 'success');
            
            button.style.animation = 'pulse 0.5s';
            setTimeout(() => button.style.animation = '', 500);
        }
        
        localStorage.setItem('mewbrew_favorite_cats', JSON.stringify(this.favorites.cats));
    }

    setupAdoptionForm() {
        if (!this.adoptionForm) return;
        
        this.adoptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateAdoptionForm()) {
                this.submitAdoptionInquiry();
            }
        });
    }

    validateAdoptionForm() {
        const { name, email, phone, cat } = this.adoptionElements;
        
        if (!name?.value?.trim()) {
            this.showNotification('Please enter your name', 'warning');
            return false;
        }
        
        if (!email?.value?.trim()) {
            this.showNotification('Please enter your email', 'warning');
            return false;
        } else if (!this.isValidEmail(email.value)) {
            this.showNotification('Please enter a valid email', 'warning');
            return false;
        }
        
        if (!phone?.value?.trim()) {
            this.showNotification('Please enter your phone number', 'warning');
            return false;
        } else if (!this.isValidPhone(phone.value)) {
            this.showNotification('Please enter a valid phone number', 'warning');
            return false;
        }
        
        if (!cat?.value) {
            this.showNotification('Please select a cat', 'warning');
            return false;
        }
        
        return true;
    }

    submitAdoptionInquiry() {
        const submitBtn = this.adoptionForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitBtn.disabled = true;
        
        const selectedCat = this.catsData.find(cat => cat.id === this.adoptionElements.cat?.value) || { name: 'Not specified' };
        
        setTimeout(() => {
            const inquiry = {
                id: 'ADOPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                name: this.adoptionElements.name?.value || '',
                email: this.adoptionElements.email?.value || '',
                phone: this.adoptionElements.phone?.value || '',
                cat: this.adoptionElements.cat?.value || '',
                catName: selectedCat.name,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            this.adoptionInquiries.push(inquiry);
            localStorage.setItem('mewbrew_adoption_inquiries', JSON.stringify(this.adoptionInquiries));
            
            this.showNotification(`Adoption inquiry submitted! Reference: ${inquiry.id}`, 'success');
            this.adoptionForm.reset();
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    setupCatFilters() {
        const filterContainer = document.querySelector('.cat-filters');
        if (!filterContainer) return;
        
        filterContainer.querySelectorAll('button[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterCats(e.target.dataset.filter);
            });
        });
    }

    filterCats(filter) {
        const catCards = document.querySelectorAll('.cat-card');
        
        catCards.forEach(card => {
            const parentCol = card.closest('.col-md-6, .col-lg-3, .col');
            if (!parentCol) return;
            
            const catName = card.querySelector('.card-title')?.textContent.trim();
            const catData = this.catsData.find(cat => cat.name === catName);
            
            if (!catData) return;
            
            const isFavorited = this.favorites.cats.includes(catData.id);
            let show = false;
            
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case 'available':
                    show = catData.status === 'available';
                    break;
                case 'favorites':
                    show = isFavorited;
                    break;
                default:
                    show = true;
            }
            
            parentCol.classList.toggle('d-none', !show);
        });
    }

    selectCatForAdoption(catData) {
        this.selectedCat = catData;
        
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (this.adoptionElements.cat) {
            this.adoptionElements.cat.value = catData.id;
        }
        
        this.showNotification(`Selected ${catData.name} for adoption! Please complete the form below.`, 'success');
    }

    checkUrlForCatSelection() {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        
        if (catParam) {
            const catData = this.catsData.find(cat => cat.id === catParam);
            if (catData) {
                setTimeout(() => this.selectCatForAdoption(catData), 500);
            }
        }
    }

    // ==================== CONTACT ====================

    initContact() {
        this.contactForm = document.querySelector('.contact-form');
        this.contactElements = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
        
        this.setupContactForm();
        this.setupFAQ();
        this.addBusinessHoursCheck();
    }

    setupContactForm() {
        if (!this.contactForm) return;
        
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateContactForm()) {
                this.submitContactForm();
            }
        });
        
        // Character counter for message
        const messageEl = this.contactElements.message;
        if (messageEl) {
            messageEl.addEventListener('input', () => {
                const counter = messageEl.parentNode.querySelector('.char-counter') || 
                    document.createElement('div');
                if (!counter.classList.contains('char-counter')) {
                    counter.className = 'char-counter small text-muted text-end mt-1';
                    messageEl.parentNode.appendChild(counter);
                }
                counter.textContent = `${messageEl.value.length}/2000 characters`;
                counter.classList.toggle('text-warning', messageEl.value.length > 1800);
            });
        }
    }

    validateContactForm() {
        const { name, email, subject, message } = this.contactElements;
        
        if (!name?.value?.trim()) {
            this.showNotification('Please enter your name', 'warning');
            return false;
        }
        
        if (!email?.value?.trim()) {
            this.showNotification('Please enter your email', 'warning');
            return false;
        } else if (!this.isValidEmail(email.value)) {
            this.showNotification('Please enter a valid email', 'warning');
            return false;
        }
        
        if (!subject?.value) {
            this.showNotification('Please select a subject', 'warning');
            return false;
        }
        
        if (!message?.value?.trim()) {
            this.showNotification('Please enter your message', 'warning');
            return false;
        }
        
        return true;
    }

    submitContactForm() {
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const messageId = 'MSG-' + Date.now().toString().slice(-8);
            this.showNotification(`Message sent! Reference: ${messageId}`, 'success');
            this.contactForm.reset();
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.accordion-item');
        faqItems.forEach((item, index) => {
            const collapse = item.querySelector('.accordion-collapse');
            if (collapse) {
                collapse.addEventListener('show.bs.collapse', () => {
                    // Track FAQ views if needed
                    console.log(`FAQ ${index + 1} viewed`);
                });
            }
        });
    }

    addBusinessHoursCheck() {
        const hoursCard = document.querySelector('.info-card .card-body');
        if (!hoursCard) return;
        
        const currentHour = new Date().getHours();
        const isOpen = currentHour >= 10 && currentHour < 21;
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge ${isOpen ? 'bg-success' : 'bg-secondary'} position-absolute top-0 end-0 m-3`;
        statusBadge.textContent = isOpen ? 'Open Now' : 'Closed';
        
        hoursCard.parentElement?.appendChild(statusBadge);
    }

    // ==================== MENU ====================

    initMenu() {
        this.menuItems = document.querySelectorAll('.menu-item');
        this.cartIcon = document.querySelector('.cart-icon');
        this.cartCount = document.querySelector('.cart-count');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSummary = document.getElementById('cart-summary');
        
        this.serviceFeePercent = 0.05;
        
        this.setupCart();
        this.setupMenuFilters();
        this.setupMenuSearch();
        this.updateCartCount();
    }

    setupCart() {
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.toggleCart());
        }
        
        document.querySelector('.cart-overlay')?.addEventListener('click', () => this.toggleCart());
        document.querySelector('.cart-sidebar .btn-close')?.addEventListener('click', () => this.toggleCart());
        
        this.updateCartDisplay();
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

    addToCart(item) {
        if (!item.available) {
            this.showNotification(`${item.name} is currently unavailable`, 'warning');
            return;
        }
        
        const existingItem = this.shopData.cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.shopData.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                category: item.category
            });
        }
        
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification(`${item.name} added to cart!`, 'success');
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
        this.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        
        if (totalItems > 0) {
            this.cartCount.classList.add('updated');
            setTimeout(() => this.cartCount.classList.remove('updated'), 300);
        }
    }

    updateCartDisplay() {
        if (!this.cartItemsContainer) return;
        
        this.cartItemsContainer.innerHTML = '';
        
        if (this.shopData.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Your cart is empty</p>
                    <p class="small text-muted">Add some delicious items from our menu!</p>
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
            itemElement.className = 'cart-item mb-3 pb-3 border-bottom';
            itemElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">₱${item.price} each</small>
                    </div>
                    <span class="fw-bold">₱${itemTotal}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="quantity-controls d-flex align-items-center">
                        <button class="quantity-btn btn btn-sm btn-outline-secondary rounded-circle" data-index="${index}" data-action="decrease">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-btn btn btn-sm btn-outline-secondary rounded-circle" data-index="${index}" data-action="increase">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(itemElement);
        });
        
        // Add event listeners
        this.cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                const action = e.target.closest('button').dataset.action;
                this.updateQuantity(index, action === 'increase' ? 1 : -1);
            });
        });
        
        this.cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.removeFromCart(index);
            });
        });
        
        const serviceFee = subtotal * this.serviceFeePercent;
        const total = subtotal + serviceFee;
        
        document.getElementById('subtotal').textContent = `₱${subtotal}`;
        document.getElementById('service-fee').textContent = `₱${serviceFee.toFixed(2)}`;
        document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
        
        if (this.cartSummary) this.cartSummary.style.display = 'block';
    }

    animateCartIcon() {
        if (!this.cartIcon) return;
        this.cartIcon.style.animation = 'bounce 0.5s';
        setTimeout(() => this.cartIcon.style.animation = '', 500);
    }

    setupMenuFilters() {
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterMenuItems(e.target.dataset.filter);
            });
        });
    }

    filterMenuItems(filterType) {
        document.querySelectorAll('.menu-item').forEach((item, index) => {
            const menuData = this.menuData[index];
            if (!menuData) return;
            
            const parentCol = item.closest('.col-md-6, .col-lg-3');
            if (!parentCol) return;
            
            const shouldShow = filterType === 'all' || menuData.category === filterType;
            parentCol.classList.toggle('d-none', !shouldShow);
        });
    }

    setupMenuSearch() {
        const searchInput = document.getElementById('menuSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.menu-item').forEach((item, index) => {
                const menuData = this.menuData[index];
                if (!menuData) return;
                
                const parentCol = item.closest('.col-md-6, .col-lg-3');
                if (!parentCol) return;
                
                const matches = menuData.name.toLowerCase().includes(query) || 
                               menuData.description.toLowerCase().includes(query);
                
                // If query is empty, show all (filters will be applied by the active filter button)
                if (query.length === 0) {
                    // Get current active filter
                    const activeFilter = document.querySelector('[data-filter].active');
                    const filterType = activeFilter ? activeFilter.dataset.filter : 'all';
                    const shouldShow = filterType === 'all' || menuData.category === filterType;
                    parentCol.classList.toggle('d-none', !shouldShow);
                } else {
                    parentCol.classList.toggle('d-none', !matches);
                }
            });
        });
        
        document.getElementById('clearSearch')?.addEventListener('click', () => {
            const searchInput = document.getElementById('menuSearch');
            if (searchInput) {
                searchInput.value = '';
                
                // Trigger input event to reset display
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            }
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
            this.shopData.cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                modalCartItems.innerHTML += `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>₱${itemTotal}</span>
                    </div>
                `;
            });
        }
        
        const total = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 + this.serviceFeePercent);
        document.getElementById('modal-total').textContent = `₱${total.toFixed(2)}`;
        
        const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        modal.show();
    }

    submitOrder() {
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
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
        const total = subtotal * (1 + this.serviceFeePercent);
        
        const order = {
            id: 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
            customer: { name, email, phone },
            items: [...this.shopData.cart],
            total: total,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        this.shopData.orders.push(order);
        localStorage.setItem('mewbrew_shop_orders', JSON.stringify(this.shopData.orders));
        
        this.shopData.cart = [];
        localStorage.setItem('mewbrew_shop_cart', JSON.stringify(this.shopData.cart));
        this.updateCartCount();
        this.updateCartDisplay();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        if (modal) modal.hide();
        
        document.getElementById('orderForm')?.reset();
        this.showNotification(`Order placed! Your ID: ${order.id}`, 'success');
    }

    // ==================== SHOP ====================

    initShop() {
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
        
        this.setupShopEventListeners();
        this.updateShopCartDisplay();
    }

    setupShopEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const product = button.dataset.product || button.getAttribute('data-product');
                const price = parseInt(button.dataset.price || button.getAttribute('data-price'));
                if (product && price) {
                    this.addShopProduct(product, price);
                }
            });
        });
        
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.filterShopProducts(e.target.dataset.filter);
            });
        });
        
        if (this.shopCartModal) {
            this.shopCartModal.addEventListener('show.bs.modal', () => {
                this.updateShopCartModal();
            });
        }
        
        if (this.shopCheckoutBtn) {
            this.shopCheckoutBtn.addEventListener('click', () => {
                if (this.shopData.cart.length === 0) {
                    this.showNotification('Your cart is empty!', 'warning');
                    return;
                }
                
                const cartModal = bootstrap.Modal.getInstance(this.shopCartModal);
                if (cartModal) cartModal.hide();
                
                this.updateShopCheckoutModal();
                const checkoutModal = new bootstrap.Modal(this.shopCheckoutModal);
                checkoutModal.show();
            });
        }
        
        if (this.shopCheckoutForm) {
            this.shopCheckoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processShopOrder();
            });
        }
        
        document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateShopCheckoutModal());
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
        const existingItem = this.shopData.cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.shopData.cart.push({
                id: 'item-' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: productName,
                price: price,
                quantity: 1
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
        
        if (this.shopCartModal?.classList.contains('show')) {
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
            
            if (this.shopCartModal?.classList.contains('show')) {
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
        
        if (this.shopCartModal?.classList.contains('show')) {
            this.updateShopCartModal();
        }
        
        if (this.shopCheckoutModal?.classList.contains('show')) {
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
            cartItem.className = 'cart-item mb-3 pb-3 border-bottom';
            cartItem.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-6">
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-warning">₱${item.price}</small>
                    </div>
                    <div class="col-3">
                        <div class="quantity-controls d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary rounded-circle p-0" style="width: 30px; height: 30px;" onclick="window.mewbrew?.updateShopQuantity('${item.id}', -1)">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary rounded-circle p-0" style="width: 30px; height: 30px;" onclick="window.mewbrew?.updateShopQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <div class="col-3 text-end">
                        <span class="fw-bold">₱${itemTotal}</span>
                        <button class="btn btn-sm btn-link text-danger p-0 ms-2" onclick="window.mewbrew?.removeShopItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            this.shopCartItemsContainer.appendChild(cartItem);
        });
        
        if (this.shopCartSubtotal) this.shopCartSubtotal.textContent = `₱${subtotal}`;
        if (this.shopCartShipping) {
            this.shopCartShipping.textContent = shipping === 0 ? 'Free!' : `₱${shipping}`;
            this.shopCartShipping.classList.toggle('text-success', shipping === 0);
        }
        if (this.shopCartTotal) this.shopCartTotal.textContent = `₱${total}`;
        if (this.shopCheckoutBtn) this.shopCheckoutBtn.disabled = false;
        
        if (subtotal > 0 && subtotal < this.shopData.freeShippingThreshold) {
            const amountNeeded = this.shopData.freeShippingThreshold - subtotal;
            const freeShippingMsg = document.createElement('div');
            freeShippingMsg.className = 'alert alert-info alert-sm mt-3';
            freeShippingMsg.innerHTML = `
                <i class="fas fa-truck me-2"></i>
                Add ₱${amountNeeded} more for free shipping!
            `;
            this.shopCartItemsContainer.appendChild(freeShippingMsg);
        }
    }

    updateShopCheckoutModal() {
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
        const shipping = shippingMethod?.value === 'pickup' ? 0 : this.shopData.shippingCost;
        const total = subtotal + shipping;
        const supportAmount = (subtotal * this.shopData.supportPercentage) / 100;
        
        const checkoutItems = document.getElementById('checkoutItems');
        const checkoutShipping = document.getElementById('checkoutShipping');
        const checkoutTotal = document.getElementById('checkoutTotal');
        const checkoutSupport = document.getElementById('checkoutSupport');
        
        if (checkoutItems) checkoutItems.textContent = `₱${subtotal}`;
        if (checkoutShipping) checkoutShipping.textContent = shipping === 0 ? 'Free!' : `₱${shipping}`;
        if (checkoutTotal) checkoutTotal.textContent = `₱${total}`;
        if (checkoutSupport) checkoutSupport.textContent = `₱${supportAmount}`;
        
        const addressField = document.getElementById('checkoutAddress');
        if (addressField) {
            addressField.required = shippingMethod?.value === 'delivery';
            addressField.closest('.mb-3').style.display = shippingMethod?.value === 'delivery' ? 'block' : 'none';
        }
    }

    animateShopCartButton() {
        const cartToggle = document.querySelector('.cart-toggle');
        if (cartToggle) {
            cartToggle.style.transform = 'scale(1.1)';
            setTimeout(() => cartToggle.style.transform = 'scale(1)', 200);
        }
    }

    filterShopProducts(filter) {
        document.querySelectorAll('.product-item').forEach(item => {
            item.style.display = filter === 'all' || item.dataset.category === filter ? 'block' : 'none';
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
            customer: { name, email, phone, address: shippingMethod?.value === 'delivery' ? address : 'Local Pickup' },
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
        
        document.getElementById('orderId').textContent = orderId;
        document.getElementById('orderTotal').textContent = `₱${total}`;
        document.getElementById('orderSupport').textContent = `₱${supportAmount}`;
        
        setTimeout(() => {
            const successModal = new bootstrap.Modal(this.shopSuccessModal);
            successModal.show();
        }, 300);
        
        this.showNotification('Order placed successfully!', 'success');
    }

    shopCartToggle() {
        if (this.shopCartModal) {
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

    // ==================== EVENTS ====================

    initEvents() {
        this.setupEventRegistration();
    }

    setupEventRegistration() {
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventItem = e.target.closest('.event-item');
                const eventName = eventItem?.querySelector('.card-title')?.textContent;
                if (eventName) {
                    document.getElementById('eventName')?.setAttribute('value', eventName);
                }
            });
        });
        
        document.getElementById('confirmRegistration')?.addEventListener('click', () => {
            const name = document.getElementById('regName')?.value;
            const email = document.getElementById('regEmail')?.value;
            const phone = document.getElementById('regPhone')?.value;
            const eventName = document.getElementById('eventName')?.value;
            
            if (name && email && phone && eventName) {
                const registrationModal = bootstrap.Modal.getInstance(document.getElementById('registrationModal'));
                registrationModal?.hide();
                
                document.getElementById('registrationSuccessContent').innerHTML = `
                    <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                    <h5 class="mb-3">Registration Successful!</h5>
                    <p class="mb-2">You've registered for:</p>
                    <p class="fw-bold">${eventName}</p>
                    <p class="small text-muted">A confirmation email will be sent to ${email}</p>
                `;
                
                const successModal = new bootstrap.Modal(document.getElementById('registrationSuccessModal'));
                successModal?.show();
                
                document.getElementById('regName').value = '';
                document.getElementById('regEmail').value = '';
                document.getElementById('regPhone').value = '';
            } else {
                this.showNotification('Please fill in all fields', 'warning');
            }
        });
        
        document.getElementById('regName')?.addEventListener('input', this.validateField);
        document.getElementById('regEmail')?.addEventListener('input', this.validateField);
        document.getElementById('regPhone')?.addEventListener('input', this.validateField);
    }

    validateField(e) {
        const field = e.target;
        if (field.value.trim()) {
            field.classList.remove('is-invalid');
        }
    }
}