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
            TIME_MAP: {
                '10:00': '10:00 AM', '11:00': '11:00 AM', '12:00': '12:00 PM',
                '13:00': '1:00 PM', '14:00': '2:00 PM', '15:00': '3:00 PM',
                '16:00': '4:00 PM', '17:00': '5:00 PM', '18:00': '6:00 PM',
                '19:00': '7:00 PM', '20:00': '8:00 PM'
            },
            currentBooking: null,
            bookings: JSON.parse(localStorage.getItem('mewbrew_bookings') || '[]')
        };
        
        // Cats data
        this.catsData = [
            { id: 'tangol', name: 'Tangol', age: '1 year', color: 'Orange & White', personality: 'Playful & Loud', status: 'available', visits: 28, favoriteToy: 'Crinkly balls', description: 'Tangol loves to roll around and bite stuff! He\'s a playful and loud cat who keeps everyone entertained with his antics.' },
            { id: 'xia-ming', name: 'Xia Ming', age: '9 months', color: 'Tilapya', personality: 'Shy & Friendly', status: 'available', visits: 15, favoriteToy: 'Catnip mouse', description: 'Xia Ming rarely meows and is always curious about everything. Though shy at first, she warms up quickly.' },
            { id: 'ying-yang', name: 'Ying Yang', age: '9 months', color: 'Black & White', personality: 'Energetic', status: 'available', visits: 22, favoriteToy: 'Feather wand', description: 'Ying Yang loves to watch people gossip and is always curious about anything happening around.' },
            { id: 'mini', name: 'Mini', age: '9 months', color: 'Calico', personality: 'Playful & Energetic', status: 'available', visits: 19, favoriteToy: 'Soft blankets', description: 'Mini is famous for her bread-making skills! She loves to knead on soft blankets and pillows.' }
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
        this.bookingForm = document.querySelector('.needs-validation');
        this.bookingElements = {
            guests: document.getElementById('guests'),
            decrease: document.getElementById('decrease'),
            increase: document.getElementById('increase'),
            category: document.getElementById('category'),
            date: document.getElementById('datepicker'),
            time: document.querySelectorAll('input[name="time"]'),
            fullname: document.getElementById('fullname'),
            email: document.getElementById('email'),
            notes: document.getElementById('notes'),
            summaryGuests: document.getElementById('summary-guests'),
            summaryRate: document.getElementById('summary-rate'),
            summaryTotal: document.getElementById('summary-total'),
            summaryDate: document.getElementById('summary-date'),
            summaryTime: document.getElementById('summary-time'),
            summaryAddons: document.getElementById('summary-addons'),
            groupDiscountMsg: document.getElementById('groupDiscountMsg'),
            discountProgressBar: document.getElementById('discountProgressBar'),
            neededForDiscount: document.getElementById('neededForDiscount'),
            waitlistCard: document.getElementById('waitlistCard'),
            specialOccasionMsg: document.getElementById('specialOccasionMsg'),
            giftMessageField: document.getElementById('giftMessageField'),
            confirmationPreview: document.getElementById('confirmationPreview'),
            previewEmail: document.getElementById('preview-email'),
            addonPastry: document.getElementById('addonPastry'),
            addonDrinks: document.getElementById('addonDrinks'),
            addonToy: document.getElementById('addonToy'),
            birthday: document.getElementById('birthday'),
            anniversary: document.getElementById('anniversary'),
            giftBooking: document.getElementById('giftBooking'),
            giftMessage: document.getElementById('giftMessage'),
            joinWaitlist: document.getElementById('joinWaitlist'),
            peakHoursAlert: document.getElementById('peakHoursAlert')
        };
        
        this.bookingCurrent = {
            guests: 1,
            category: 'standard',
            date: '',
            time: '',
            addons: 0,
            total: this.bookingData.PRICES.standard
        };
        
        this.setupBookingDatePicker();
        this.setupBookingGuestCounter();
        this.setupBookingCategory();
        this.setupBookingTimeSelection();
        this.setupAddons();
        this.setupSpecialOccasion();
        this.setupGiftBooking();
        this.setupEmailPreview();
        this.setupJoinWaitlist();
        this.setupBookingFormSubmit();
    }

    setupBookingDatePicker() {
        if (typeof flatpickr !== 'undefined' && this.bookingElements.date) {
            flatpickr(this.bookingElements.date, {
                minDate: "today",
                dateFormat: "F j, Y",
                disable: [
                    function(date) {
                        // Disable Sundays (0 = Sunday)
                        return date.getDay() === 0;
                    }
                ],
                onChange: (selectedDates, dateStr) => {
                    if (this.bookingElements.summaryDate) {
                        this.bookingElements.summaryDate.textContent = dateStr;
                    }
                    this.bookingCurrent.date = dateStr;
                    
                    if (selectedDates[0]) {
                        const day = selectedDates[0].getDay();
                        if (this.bookingElements.peakHoursAlert) {
                            this.bookingElements.peakHoursAlert.style.display = (day === 5 || day === 6) ? 'block' : 'none';
                        }
                    }
                }
            });
        }
    }

    setupBookingGuestCounter() {
        const { guests, decrease, increase } = this.bookingElements;
        
        if (!guests || !decrease || !increase) return;
        
        decrease.addEventListener('click', () => {
            let value = parseInt(guests.value);
            if (value > 1) {
                guests.value = value - 1;
                guests.dispatchEvent(new Event('input'));
            }
        });
        
        increase.addEventListener('click', () => {
            let value = parseInt(guests.value);
            if (value < 10) {
                guests.value = value + 1;
                guests.dispatchEvent(new Event('input'));
            }
        });
        
        guests.addEventListener('input', (e) => {
            const guestCount = parseInt(e.target.value) || 1;
            this.bookingCurrent.guests = guestCount;
            this.updateGroupDiscount(guestCount);
            this.updateBookingSummary();
            
            if (this.bookingElements.summaryGuests) {
                this.bookingElements.summaryGuests.textContent = guestCount;
            }
        });
    }

    updateGroupDiscount(guests) {
        const { groupDiscountMsg, discountProgressBar, neededForDiscount } = this.bookingElements;
        
        if (!groupDiscountMsg || !discountProgressBar || !neededForDiscount) return;
        
        if (guests >= 5) {
            groupDiscountMsg.style.display = 'block';
            discountProgressBar.style.width = '100%';
            neededForDiscount.textContent = '0';
        } else {
            groupDiscountMsg.style.display = 'none';
            const percent = (guests / 5) * 100;
            discountProgressBar.style.width = percent + '%';
            neededForDiscount.textContent = 5 - guests;
        }
    }

    setupBookingCategory() {
        const { category } = this.bookingElements;
        if (category) {
            category.addEventListener('change', (e) => {
                this.bookingCurrent.category = e.target.value;
                this.updateBookingSummary();
                
                if (this.bookingElements.summaryRate) {
                    let rate = this.bookingData.PRICES.standard;
                    if (e.target.value === 'student') rate = this.bookingData.PRICES.student;
                    if (e.target.value === 'group') rate = this.bookingData.PRICES.group;
                    this.bookingElements.summaryRate.textContent = '₱' + rate;
                }
            });
        }
    }

    setupBookingTimeSelection() {
        const { time, summaryTime, waitlistCard } = this.bookingElements;
        
        time.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (summaryTime) {
                    summaryTime.textContent = this.bookingData.TIME_MAP[e.target.value] || e.target.value;
                }
                
                if (waitlistCard) {
                    waitlistCard.style.display = e.target.value === '14:00' ? 'block' : 'none';
                }
            });
        });
    }

    setupAddons() {
        const { addonPastry, addonDrinks, addonToy, summaryAddons } = this.bookingElements;
        
        const addonElements = [addonPastry, addonDrinks, addonToy].filter(el => el);
        
        addonElements.forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.calculateAddons();
                    this.updateBookingSummary();
                });
            }
        });
    }

    calculateAddons() {
        const { addonPastry, addonDrinks, addonToy, summaryAddons } = this.bookingElements;
        
        let total = 0;
        if (addonPastry && addonPastry.checked) total += 150;
        if (addonDrinks && addonDrinks.checked) total += 200;
        if (addonToy && addonToy.checked) total += 100;
        
        this.bookingCurrent.addons = total;
        
        if (summaryAddons) {
            summaryAddons.textContent = '₱' + total;
        }
        
        return total;
    }

    updateBookingSummary() {
        const { summaryTotal, summaryGuests, summaryRate } = this.bookingElements;
        if (!summaryTotal) return;
        
        const guestCount = this.bookingCurrent.guests;
        const category = this.bookingCurrent.category;
        
        let rate = this.bookingData.PRICES.standard;
        if (category === 'student') rate = this.bookingData.PRICES.student;
        if (category === 'group') rate = this.bookingData.PRICES.group;
        
        const subtotal = (guestCount * rate) + this.bookingCurrent.addons;
        
        summaryTotal.textContent = '₱' + subtotal;
        this.bookingCurrent.total = subtotal;
    }

    setupSpecialOccasion() {
        const { birthday, anniversary, specialOccasionMsg } = this.bookingElements;
        
        if (!birthday || !anniversary || !specialOccasionMsg) return;
        
        [birthday, anniversary].forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                specialOccasionMsg.style.display = 
                    (birthday.checked || anniversary.checked) ? 'block' : 'none';
            });
        });
    }

    setupGiftBooking() {
        const { giftBooking, giftMessageField } = this.bookingElements;
        
        if (giftBooking && giftMessageField) {
            giftBooking.addEventListener('change', (e) => {
                giftMessageField.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }

    setupEmailPreview() {
        const { email, previewEmail } = this.bookingElements;
        
        if (email && previewEmail) {
            email.addEventListener('input', (e) => {
                previewEmail.textContent = e.target.value || 'your@email.com';
            });
        }
    }

    setupJoinWaitlist() {
        const { joinWaitlist, waitlistCard } = this.bookingElements;
        
        if (joinWaitlist && waitlistCard) {
            joinWaitlist.addEventListener('click', () => {
                alert('You\'ve been added to the waitlist! We\'ll notify you if a spot opens up.');
                waitlistCard.style.display = 'none';
            });
        }
    }

    setupBookingFormSubmit() {
        if (!this.bookingForm) return;
        
        this.bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateBooking()) {
                this.processBooking();
            }
        });
    }

    validateBooking() {
        const { fullname, email, date, guests, category } = this.bookingElements;
        const timeSelected = document.querySelector('input[name="time"]:checked');
        
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
        
        if (!timeSelected) {
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
        const originalText = submitBtn?.innerHTML;
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            submitBtn.disabled = true;
        }
        
        setTimeout(() => {
            const bookingId = 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            const timeSelected = document.querySelector('input[name="time"]:checked');
            
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
                    date: this.bookingElements.date?.value || '',
                    time: timeSelected?.value || '',
                    addons: this.bookingCurrent.addons,
                    total: this.bookingCurrent.total
                },
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            };
            
            this.bookingData.bookings.push(booking);
            localStorage.setItem('mewbrew_bookings', JSON.stringify(this.bookingData.bookings));
            
            this.showNotification(`Booking confirmed! Your ID: ${bookingId}`, 'success');
            
            if (this.bookingElements.confirmationPreview) {
                this.bookingElements.confirmationPreview.style.display = 'block';
                this.bookingElements.confirmationPreview.scrollIntoView({ behavior: 'smooth' });
            }
            
            if (this.bookingElements.giftBooking?.checked) {
                this.showGiftVoucher();
            }
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText || 'Confirm Booking';
                submitBtn.disabled = false;
            }
        }, 1500);
    }

    showGiftVoucher() {
        const fullname = this.bookingElements.fullname?.value || 'Friend';
        const giftMsg = this.bookingElements.giftMessage?.value || 'Enjoy your visit!';
        
        const giftRecipient = document.getElementById('giftRecipient');
        const giftDisplayMessage = document.getElementById('giftDisplayMessage');
        
        if (giftRecipient) giftRecipient.textContent = fullname;
        if (giftDisplayMessage) giftDisplayMessage.textContent = giftMsg;
        
        if (typeof bootstrap !== 'undefined') {
            const giftModal = new bootstrap.Modal(document.getElementById('giftVoucherModal'));
            giftModal.show();
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
        
        this.setupCatSearch();
        this.setupCatPersonalityFilter();
        this.setupCatSort();
        this.setupCatDetailsModal();
        this.setupAdoptionModal();
        this.setupAdoptionForm();
        this.loadFavoriteStates();
        this.setupFavoriteTabs();
    }

    setupCatSearch() {
        const searchInput = document.getElementById('catSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#all-cats .cat-card').forEach(card => {
                const name = card.querySelector('.h4')?.textContent.toLowerCase() || '';
                const personalityTags = Array.from(card.querySelectorAll('.personality-tags .badge'))
                    .map(tag => tag.textContent.toLowerCase())
                    .join(' ');
                
                card.closest('.col-md-6, .col-lg-3').style.display = 
                    (name.includes(term) || personalityTags.includes(term)) ? '' : 'none';
            });
        });
    }

    setupCatPersonalityFilter() {
        const filter = document.getElementById('personalityFilter');
        if (!filter) return;
        
        filter.addEventListener('change', (e) => {
            const value = e.target.value.toLowerCase();
            document.querySelectorAll('#all-cats .cat-card').forEach(card => {
                if (value === 'all') {
                    card.closest('.col-md-6, .col-lg-3').style.display = '';
                    return;
                }
                
                const personalityTags = Array.from(card.querySelectorAll('.personality-tags .badge'))
                    .map(tag => tag.textContent.toLowerCase())
                    .join(' ');
                
                card.closest('.col-md-6, .col-lg-3').style.display = 
                    personalityTags.includes(value) ? '' : 'none';
            });
        });
    }

    setupCatSort() {
        const sort = document.getElementById('sortFilter');
        if (!sort) return;
        
        sort.addEventListener('change', (e) => {
            const value = e.target.value;
            const container = document.getElementById('all-cats-container');
            const cards = Array.from(document.querySelectorAll('#all-cats .cat-card'));
            
            cards.sort((a, b) => {
                if (value === 'name') {
                    const nameA = a.querySelector('.h4').textContent;
                    const nameB = b.querySelector('.h4').textContent;
                    return nameA.localeCompare(nameB);
                } else if (value === 'age') {
                    const ageA = parseInt(a.querySelector('.badge.bg-light i.fa-birthday-cake')?.parentNode?.textContent || '0');
                    const ageB = parseInt(b.querySelector('.badge.bg-light i.fa-birthday-cake')?.parentNode?.textContent || '0');
                    return ageA - ageB;
                }
                return 0;
            });
            
            container.innerHTML = '';
            cards.forEach(card => {
                const col = card.closest('.col-md-6, .col-lg-3');
                if (col) container.appendChild(col);
            });
            
            this.loadFavoriteStates();
        });
    }

    setupCatDetailsModal() {
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const catId = btn.getAttribute('data-cat-id');
                const cat = this.catsData.find(c => c.id === catId);
                
                if (cat) {
                    const modalLabel = document.getElementById('catDetailsModalLabel');
                    const modalContent = document.getElementById('catDetailsContent');
                    const adoptBtn = document.getElementById('adoptFromDetailsBtn');
                    
                    if (modalLabel) modalLabel.textContent = cat.name;
                    if (adoptBtn) adoptBtn.setAttribute('data-cat', catId);
                    
                    if (modalContent) {
                        modalContent.innerHTML = `
                            <div class="text-center mb-4">
                                <img src="../img/cats/${catId}.jpg" class="img-fluid rounded" style="max-height: 200px;" alt="${cat.name}" onerror="this.src='https://ui-avatars.com/api/?name=${cat.name}&background=ffb74d&color=fff&size=200'">
                            </div>
                            <div class="mb-3">
                                <p><strong>Age:</strong> ${cat.age}</p>
                                <p><strong>Color:</strong> ${cat.color}</p>
                                <p><strong>Personality:</strong> ${cat.personality}</p>
                            </div>
                            <p>${cat.description}</p>
                        `;
                    }
                }
            });
        });
    }

    setupAdoptionModal() {
        document.querySelectorAll('[data-bs-target="#adoptionModal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardBody = btn.closest('.card-body');
                const catName = cardBody ? cardBody.querySelector('.h4')?.textContent : 'this cat';
                const selectedCatName = document.getElementById('selectedCatName');
                if (selectedCatName) selectedCatName.textContent = catName;
            });
        });
        
        const adoptFromDetailsBtn = document.getElementById('adoptFromDetailsBtn');
        if (adoptFromDetailsBtn) {
            adoptFromDetailsBtn.addEventListener('click', () => {
                const catId = adoptFromDetailsBtn.getAttribute('data-cat');
                const cat = this.catsData.find(c => c.id === catId);
                const selectedCatName = document.getElementById('selectedCatName');
                if (selectedCatName && cat) selectedCatName.textContent = cat.name;
            });
        }
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
        const originalText = submitBtn?.innerHTML;
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
            submitBtn.disabled = true;
        }
        
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
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText || 'Submit Inquiry';
                submitBtn.disabled = false;
            }
        }, 1500);
    }

    toggleFavorite(button, catId) {
        const icon = button.querySelector('i');
        let favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#dc3545';
            
            if (!favorites.includes(catId)) {
                favorites.push(catId);
                localStorage.setItem('catFavorites', JSON.stringify(favorites));
            }
            this.showNotification(catId + ' added to favorites!', 'success');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
            
            favorites = favorites.filter(id => id !== catId);
            localStorage.setItem('catFavorites', JSON.stringify(favorites));
            this.showNotification(catId + ' removed from favorites', 'info');
        }
        
        this.updateFavoritesTab();
    }

    loadFavoriteStates() {
        const favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
        
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    const catId = match[1];
                    const icon = btn.querySelector('i');
                    
                    if (favorites.includes(catId)) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        icon.style.color = '#dc3545';
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        icon.style.color = '';
                    }
                }
            }
        });
    }

    updateFavoritesTab() {
        const favoritesContainer = document.getElementById('favorite-cats-container');
        if (!favoritesContainer) return;
        
        const favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
        
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-heart fa-4x text-muted mb-3"></i><h5>No favorite cats yet</h5><p class="text-muted">Click the heart icon on any cat to add them here!</p></div>';
            return;
        }
        
        favoritesContainer.innerHTML = '';
        
        const allCats = document.querySelectorAll('#all-cats .cat-card');
        
        favorites.forEach(catId => {
            const originalCat = Array.from(allCats).find(cat => cat.getAttribute('data-cat-id') === catId);
            
            if (originalCat) {
                const clone = originalCat.cloneNode(true);
                favoritesContainer.appendChild(clone);
            }
        });
        
        favoritesContainer.querySelectorAll('.favorite-toggle').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    const catId = match[1];
                    btn.setAttribute('onclick', `mewbrew.toggleFavorite(this, '${catId}')`);
                }
            }
        });
        
        this.loadFavoriteStates();
    }

    setupFavoriteTabs() {
        const availableTab = document.getElementById('available-cats-tab');
        const favoritesTab = document.getElementById('favorite-cats-tab');
        
        if (availableTab) {
            availableTab.addEventListener('shown.bs.tab', () => {
                this.updateAvailableTab();
            });
        }
        
        if (favoritesTab) {
            favoritesTab.addEventListener('shown.bs.tab', () => {
                this.updateFavoritesTab();
            });
        }
    }

    updateAvailableTab() {
        const availableContainer = document.getElementById('available-cats-container');
        if (!availableContainer) return;
        
        const availableCats = document.querySelectorAll('#all-cats .cat-card[data-status="available"]');
        
        if (availableCats.length === 0) {
            availableContainer.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-check-circle fa-4x text-muted mb-3"></i><h5>No available cats</h5><p class="text-muted">Check back soon!</p></div>';
            return;
        }
        
        availableContainer.innerHTML = '';
        availableCats.forEach(cat => {
            const clone = cat.cloneNode(true);
            availableContainer.appendChild(clone);
        });
        
        availableContainer.querySelectorAll('.favorite-toggle').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    const catId = match[1];
                    btn.setAttribute('onclick', `mewbrew.toggleFavorite(this, '${catId}')`);
                }
            }
        });
        
        this.loadFavoriteStates();
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
        this.setupCopyAddress();
        this.setupWhatsApp();
        this.setupCharacterCounter();
    }

    setupContactForm() {
        if (!this.contactForm) return;
        
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateContactForm()) {
                this.submitContactForm();
            }
        });
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
        const originalText = submitBtn?.innerHTML;
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
        }
        
        setTimeout(() => {
            const messageId = 'MSG-' + Date.now().toString().slice(-8);
            this.showNotification(`Message sent! Reference: ${messageId}`, 'success');
            this.contactForm.reset();
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText || 'Send Message';
                submitBtn.disabled = false;
            }
            
            if (typeof bootstrap !== 'undefined') {
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            }
        }, 1500);
    }

    setupFAQ() {
        const search = document.getElementById('faqSearch');
        if (!search) return;
        
        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.accordion-item').forEach(item => {
                const question = item.querySelector('.accordion-button')?.textContent.toLowerCase() || '';
                const answer = item.querySelector('.accordion-body')?.textContent.toLowerCase() || '';
                
                item.style.display = (question.includes(term) || answer.includes(term)) ? '' : 'none';
            });
        });
    }

    addBusinessHoursCheck() {
        const now = new Date();
        const hour = now.getHours();
        const isOpen = hour >= 10 && hour < 21;
        
        const statusElement = document.getElementById('open-status');
        if (statusElement) {
            statusElement.innerHTML = isOpen ? 
                '<span class="badge bg-success mb-2">● Open Now</span>' : 
                '<span class="badge bg-danger mb-2">● Closed</span>';
        }
        
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const today = now.getDay();
        
        days.forEach((d, index) => {
            const statusEl = document.getElementById(d + '-status');
            if (statusEl) {
                if (index === today) {
                    statusEl.className = isOpen ? 'badge bg-success' : 'badge bg-danger';
                    statusEl.textContent = isOpen ? 'Open Now' : 'Closed Now';
                } else {
                    statusEl.className = 'badge bg-success';
                    statusEl.textContent = 'Open';
                }
            }
        });
    }

    setupCopyAddress() {
        const copyBtn = document.querySelector('.copy-address');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText('123 Cat Street, Iloilo City, Philippines 5000');
                alert('Address copied to clipboard!');
            });
        }
    }

    setupWhatsApp() {
        document.querySelectorAll('[onclick*="window.open(\'https://wa.me/"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = btn.getAttribute('onclick')?.match(/'(https:[^']+)'/)?.[1];
                if (url) window.open(url, '_blank');
            });
        });
    }

    setupCharacterCounter() {
        const message = document.getElementById('message');
        if (message) {
            const counter = document.getElementById('charCount');
            message.addEventListener('input', () => {
                if (counter) counter.textContent = message.value.length + '/2000 characters';
            });
        }
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
        this.setupMenuSearch();
        this.setupRecentlyViewed();
        this.setupDietaryFilters();
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
        
        this.addToRecentlyViewed(item);
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
        
        const subtotalEl = document.getElementById('subtotal');
        const serviceFeeEl = document.getElementById('service-fee');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `₱${subtotal}`;
        if (serviceFeeEl) serviceFeeEl.textContent = `₱${serviceFee.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
        
        if (this.cartSummary) this.cartSummary.style.display = 'block';
    }

    animateCartIcon() {
        if (!this.cartIcon) return;
        this.cartIcon.style.animation = 'bounce 0.5s';
        setTimeout(() => this.cartIcon.style.animation = '', 500);
    }

    setupMenuSearch() {
        const searchInput = document.getElementById('menuSearch');
        const clearBtn = document.getElementById('clearSearch');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.menu-item').forEach(item => {
                const parentCol = item.closest('.col-md-6, .col-lg-3');
                if (!parentCol) return;
                
                const name = item.querySelector('.h5')?.textContent.toLowerCase() || '';
                const desc = item.querySelector('p.small')?.textContent.toLowerCase() || '';
                
                if (query.length === 0) {
                    parentCol.style.display = '';
                } else {
                    parentCol.style.display = (name.includes(query) || desc.includes(query)) ? '' : 'none';
                }
            });
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
            });
        }
    }

    setupDietaryFilters() {
        document.querySelectorAll('.filter-dietary').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const diet = e.currentTarget.dataset.diet;
                
                document.querySelectorAll('.filter-dietary').forEach(f => {
                    f.classList.remove('active', 'bg-warning', 'text-dark');
                    f.classList.add('bg-light', 'text-dark');
                });
                
                e.currentTarget.classList.remove('bg-light', 'text-dark');
                e.currentTarget.classList.add('active', 'bg-warning', 'text-dark');
                
                document.querySelectorAll('.menu-item').forEach(item => {
                    const parentCol = item.closest('.col-md-6, .col-lg-3');
                    if (!parentCol) return;
                    
                    const icons = item.querySelectorAll('.badge.bg-light[title] i');
                    let hasDiet = false;
                    
                    icons.forEach(icon => {
                        if (diet === 'vegan' && icon.classList.contains('fa-seedling')) hasDiet = true;
                        if (diet === 'gluten-free' && icon.classList.contains('fa-wheat-alt')) hasDiet = true;
                        if (diet === 'dairy-free' && icon.classList.contains('fa-cow')) hasDiet = true;
                        if (diet === 'hot' && icon.classList.contains('fa-fire')) hasDiet = true;
                        if (diet === 'cold' && icon.classList.contains('fa-snowflake')) hasDiet = true;
                    });
                    
                    parentCol.style.display = (diet === 'all' || hasDiet) ? '' : 'none';
                });
            });
        });
    }

    setupRecentlyViewed() {
        const container = document.getElementById('recently-viewed');
        if (!container) return;
        
        const viewed = JSON.parse(localStorage.getItem('mewbrew_recently_viewed') || '[]');
        
        if (viewed.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><small>No recently viewed items</small></div>';
            return;
        }
        
        container.innerHTML = '';
        viewed.slice(0, 3).forEach(item => {
            container.innerHTML += `
                <div class="col-4">
                    <div class="card border-0 shadow-sm">
                        <img src="../img/menu/${item.image}" class="card-img-top" style="height: 80px; object-fit: cover;" alt="${item.name}">
                        <div class="card-body p-2 text-center">
                            <small class="fw-bold">${item.name}</small>
                            <small class="text-warning d-block">₱${item.price}</small>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    addToRecentlyViewed(item) {
        let recentlyViewed = JSON.parse(localStorage.getItem('mewbrew_recently_viewed') || '[]');
        
        recentlyViewed = recentlyViewed.filter(i => i.id !== item.id);
        recentlyViewed.unshift({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.id + '.jpg',
            timestamp: Date.now()
        });
        
        recentlyViewed = recentlyViewed.slice(0, 5);
        localStorage.setItem('mewbrew_recently_viewed', JSON.stringify(recentlyViewed));
        
        this.setupRecentlyViewed();
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
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const serviceFee = subtotal * this.serviceFeePercent;
        const total = subtotal + serviceFee;
        
        const modalTotal = document.getElementById('modal-total');
        if (modalTotal) modalTotal.textContent = `₱${total.toFixed(2)}`;
        
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
            modal.show();
        }
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
        const serviceFee = subtotal * this.serviceFeePercent;
        const total = subtotal + serviceFee;
        
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
        
        if (typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (modal) modal.hide();
        }
        
        document.getElementById('orderForm')?.reset();
        this.showNotification(`Order placed! Your ID: ${order.id}`, 'success');
    }

    // ==================== SHOP ====================

    initShop() {
        this.shopCartCount = document.getElementById('cartCount');
        this.shopCartItemsContainer = document.getElementById('cart-items-container');
        this.shopCartSubtotal = document.getElementById('cart-subtotal');
        this.shopCartShipping = document.getElementById('cart-shipping');
        this.shopCartDiscount = document.getElementById('cart-discount');
        this.shopCartTotal = document.getElementById('cart-total');
        this.shopPointsEarned = document.getElementById('points-earned');
        this.shopShippingProgressBar = document.getElementById('shipping-progress-bar');
        this.shopShippingProgressText = document.getElementById('shipping-progress-text');
        
        this.setupShopEventListeners();
        this.setupShopSearch();
        this.setupShopPriceFilter();
        this.setupShopSort();
        this.setupWishlist();
        this.setupQuantityControls();
        this.setupQuickView();
        this.setupDiscountCode();
        this.updateShopCartDisplay();
    }

    setupShopEventListeners() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const product = btn.dataset.product || btn.getAttribute('data-product');
                const price = parseInt(btn.dataset.price || btn.getAttribute('data-price'));
                const card = btn.closest('.card');
                const qtyInput = card?.querySelector('input[type="number"]');
                const qty = qtyInput ? parseInt(qtyInput.value) : 1;
                
                if (product && price) {
                    this.addShopProduct(product, price, qty, card);
                }
            });
        });
        
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const targetId = e.target.getAttribute('data-bs-target')?.replace('#', '');
                this.populateCategoryTab(targetId);
            });
        });
        
        const cartOffcanvas = document.getElementById('cartOffcanvas');
        if (cartOffcanvas) {
            cartOffcanvas.addEventListener('show.bs.offcanvas', () => {
                this.updateShopCartDisplay();
            });
        }
    }

    setupShopSearch() {
        const search = document.getElementById('productSearch');
        const clear = document.getElementById('clearSearch');
        
        if (!search) return;
        
        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.product-item').forEach(item => {
                const name = item.dataset.name?.toLowerCase() || '';
                const category = item.dataset.category?.toLowerCase() || '';
                item.style.display = (name.includes(term) || category.includes(term)) ? '' : 'none';
            });
        });
        
        if (clear) {
            clear.addEventListener('click', () => {
                search.value = '';
                const event = new Event('input', { bubbles: true });
                search.dispatchEvent(event);
            });
        }
    }

    setupShopPriceFilter() {
        document.querySelectorAll('input[name="priceFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filter = e.target.id;
                document.querySelectorAll('.product-item').forEach(item => {
                    const price = parseInt(item.dataset.price);
                    
                    if (filter === 'priceAll') {
                        item.style.display = '';
                    } else if (filter === 'priceUnder200' && price < 200) {
                        item.style.display = '';
                    } else if (filter === 'price200to400' && price >= 200 && price <= 400) {
                        item.style.display = '';
                    } else if (filter === 'priceOver400' && price > 400) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    setupShopSort() {
        const sort = document.getElementById('sortProducts');
        if (!sort) return;
        
        sort.addEventListener('change', (e) => {
            const value = e.target.value;
            const container = document.getElementById('all-products-grid');
            if (!container) return;
            
            const products = Array.from(container.children);
            
            products.sort((a, b) => {
                const priceA = parseInt(a.dataset.price);
                const priceB = parseInt(b.dataset.price);
                
                if (value === 'price-low') return priceA - priceB;
                if (value === 'price-high') return priceB - priceA;
                return 0;
            });
            
            container.innerHTML = '';
            products.forEach(p => container.appendChild(p));
        });
    }

    setupWishlist() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = btn.querySelector('i');
                const productId = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                
                if (!productId) return;
                
                let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                
                if (wishlist.includes(productId)) {
                    wishlist = wishlist.filter(id => id !== productId);
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                    this.showNotification('Removed from wishlist', 'info');
                } else {
                    wishlist.push(productId);
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#dc3545';
                    this.showNotification('Added to wishlist!', 'success');
                }
                
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            });
        });
    }

    setupQuantityControls() {
        document.querySelectorAll('[onclick="decrementQty(this)"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const input = btn.parentNode.querySelector('input[type="number"]');
                if (input) {
                    let val = parseInt(input.value);
                    if (val > 1) input.value = val - 1;
                }
            });
        });
        
        document.querySelectorAll('[onclick="incrementQty(this)"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const input = btn.parentNode.querySelector('input[type="number"]');
                if (input) {
                    let val = parseInt(input.value);
                    if (val < 10) input.value = val + 1;
                }
            });
        });
    }

    setupQuickView() {
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const product = btn.dataset.product;
                const card = btn.closest('.card');
                if (!card) return;
                
                const title = card.querySelector('.card-title, h5, h6')?.textContent || '';
                const price = card.querySelector('.badge.bg-warning')?.textContent.replace('₱', '') || '0';
                const img = card.querySelector('img')?.src || '';
                const desc = card.querySelector('p.small, p.text-muted')?.textContent || '';
                
                const modalTitle = document.getElementById('quickViewTitle');
                const modalImage = document.getElementById('quickViewImage');
                const modalName = document.getElementById('quickViewName');
                const modalPrice = document.getElementById('quickViewPrice');
                const modalDesc = document.getElementById('quickViewDescription');
                
                if (modalTitle) modalTitle.textContent = title;
                if (modalImage) modalImage.src = img;
                if (modalName) modalName.textContent = title;
                if (modalPrice) modalPrice.textContent = `₱${price}`;
                if (modalDesc) modalDesc.textContent = desc;
                
                if (typeof bootstrap !== 'undefined') {
                    const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
                    modal.show();
                }
            });
        });
        
        const decrease = document.getElementById('quickViewDecrease');
        const increase = document.getElementById('quickViewIncrease');
        const qty = document.getElementById('quickViewQty');
        
        if (decrease) {
            decrease.addEventListener('click', () => {
                if (qty) {
                    let val = parseInt(qty.value);
                    if (val > 1) qty.value = val - 1;
                }
            });
        }
        
        if (increase) {
            increase.addEventListener('click', () => {
                if (qty) {
                    let val = parseInt(qty.value);
                    if (val < 10) qty.value = val + 1;
                }
            });
        }
        
        const addToCart = document.getElementById('quickViewAddToCart');
        if (addToCart) {
            addToCart.addEventListener('click', () => {
                const name = document.getElementById('quickViewName')?.textContent;
                const price = parseInt(document.getElementById('quickViewPrice')?.textContent.replace('₱', '') || '0');
                const quantity = parseInt(document.getElementById('quickViewQty')?.value || '1');
                
                if (name && price) {
                    this.addShopProduct(name, price, quantity);
                    if (typeof bootstrap !== 'undefined') {
                        bootstrap.Modal.getInstance(document.getElementById('quickViewModal'))?.hide();
                    }
                }
            });
        }
    }

    setupDiscountCode() {
        const applyBtn = document.getElementById('applyDiscount');
        if (!applyBtn) return;
        
        applyBtn.addEventListener('click', () => {
            const code = document.getElementById('discountCode')?.value;
            if (code === 'MEW10') {
                this.showNotification('Discount applied! 10% off', 'success');
            } else {
                this.showNotification('Invalid discount code', 'warning');
            }
        });
    }

    addShopProduct(productName, price, qty = 1, card = null) {
        const existingItem = this.shopData.cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            this.shopData.cart.push({
                id: 'item-' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: productName,
                price: price,
                quantity: qty
            });
        }
        
        this.saveShopCart();
        this.updateShopCartDisplay();
        this.showNotification(`${productName} added to cart!`, 'success');
        
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.animation = 'bounce 0.5s';
            setTimeout(() => cartIcon.style.animation = '', 500);
        }
        
        if (card) {
            const img = card.querySelector('img')?.src || '';
            this.addToShopRecentlyViewed({
                id: productName.toLowerCase().replace(/\s+/g, '-'),
                name: productName,
                price: price,
                image: img
            });
        }
    }

    removeShopItem(itemId) {
        this.shopData.cart = this.shopData.cart.filter(item => item.id !== itemId);
        this.saveShopCart();
        this.updateShopCartDisplay();
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
        }
    }

    updateShopQuantityDirect(itemId, value) {
        const itemIndex = this.shopData.cart.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            this.shopData.cart[itemIndex].quantity = parseInt(value) || 1;
            this.saveShopCart();
            this.updateShopCartDisplay();
        }
    }

    saveShopCart() {
        localStorage.setItem('shopCart', JSON.stringify(this.shopData.cart));
    }

    updateShopCartDisplay() {
        const totalItems = this.shopData.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.shopCartCount) {
            this.shopCartCount.textContent = totalItems;
        }
        
        if (!this.shopCartItemsContainer) return;
        
        this.shopCartItemsContainer.innerHTML = '';
        
        if (this.shopData.cart.length === 0) {
            this.shopCartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Your cart is empty</p>
                    <p class="small text-muted">Add some items from our shop!</p>
                </div>
            `;
            return;
        }
        
        let subtotal = 0;
        
        this.shopData.cart.forEach(item => {
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
                    <div class="input-group input-group-sm" style="width: 100px;">
                        <button class="btn btn-outline-warning" type="button" onclick="mewbrew.updateShopQuantity('${item.id}', -1)">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" style="height: 31px;" onchange="mewbrew.updateShopQuantityDirect('${item.id}', this.value)">
                        <button class="btn btn-outline-warning" type="button" onclick="mewbrew.updateShopQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="mewbrew.removeShopItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.shopCartItemsContainer.appendChild(itemElement);
        });
        
        const shipping = subtotal >= 1000 ? 0 : 100;
        const total = subtotal + shipping;
        const points = Math.floor(subtotal / 10);
        
        if (this.shopCartSubtotal) this.shopCartSubtotal.textContent = `₱${subtotal}`;
        if (this.shopCartShipping) this.shopCartShipping.textContent = shipping === 0 ? 'Free' : `₱${shipping}`;
        if (this.shopCartDiscount) this.shopCartDiscount.textContent = '-₱0';
        if (this.shopCartTotal) this.shopCartTotal.textContent = `₱${total}`;
        if (this.shopPointsEarned) this.shopPointsEarned.textContent = points;
        
        if (this.shopShippingProgressBar) {
            const progressPercent = Math.min((subtotal / 1000) * 100, 100);
            this.shopShippingProgressBar.style.width = progressPercent + '%';
        }
        
        if (this.shopShippingProgressText) {
            this.shopShippingProgressText.textContent = `₱${subtotal}/₱1000`;
        }
    }

    addToShopRecentlyViewed(product) {
        let recently = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        recently = recently.filter(p => p.id !== product.id);
        recently.unshift(product);
        recently = recently.slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(recently));
        this.updateShopRecentlyViewed();
    }

    updateShopRecentlyViewed() {
        const container = document.getElementById('recently-viewed');
        if (!container) return;
        
        const recently = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        if (recently.length === 0) {
            container.innerHTML = '<div class="col-12 text-muted small">No recently viewed items</div>';
            return;
        }
        
        container.innerHTML = '';
        recently.slice(0, 4).forEach(product => {
            container.innerHTML += `
                <div class="col-3">
                    <div class="card border-0 shadow-sm">
                        <div class="product-img-small">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        </div>
                        <div class="card-body p-2 text-center">
                            <small class="fw-bold">${product.name}</small>
                            <small class="text-warning d-block">₱${product.price}</small>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    populateCategoryTab(tabId) {
        const containerMap = {
            'apparel-products': 'apparel-container',
            'home-products': 'home-container',
            'accessories-products': 'accessories-container'
        };
        
        const containerId = containerMap[tabId];
        if (!containerId) return;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const category = tabId.replace('-products', '');
        
        document.querySelectorAll(`.product-item[data-category="${category}"]`).forEach(item => {
            container.appendChild(item.cloneNode(true));
        });
    }

    proceedToCheckout() {
        if (this.shopData.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }
        
        if (typeof bootstrap !== 'undefined') {
            bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'))?.hide();
            
            setTimeout(() => {
                const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
                checkoutModal.show();
            }, 300);
        }
    }

    placeOrder() {
        const name = document.getElementById('checkoutName')?.value;
        const email = document.getElementById('checkoutEmail')?.value;
        const address = document.getElementById('checkoutAddress')?.value;
        
        if (!name || !email || !address) {
            this.showNotification('Please fill in all fields', 'warning');
            return;
        }
        
        const orderNum = 'MB-' + Date.now().toString().slice(-8);
        const orderNumberEl = document.getElementById('orderNumber');
        if (orderNumberEl) orderNumberEl.textContent = orderNum;
        
        const subtotal = this.shopData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const points = Math.floor(subtotal / 10);
        
        const orderPointsEl = document.getElementById('orderPoints');
        if (orderPointsEl) orderPointsEl.textContent = points;
        
        this.shopData.cart = [];
        this.saveShopCart();
        this.updateShopCartDisplay();
        
        if (typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();
            
            setTimeout(() => {
                const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
                successModal.show();
            }, 300);
        }
    }

    // ==================== EVENTS ====================

    initEvents() {
        this.setupEventSearch();
        this.setupEventToggle();
        this.setupPriceFilter();
        this.setupEventRegistration();
        this.setupEventDetails();
        this.setupReminderButtons();
        this.setupCopyLink();
        this.setupCountdownTimers();
    }

    setupEventSearch() {
        const search = document.getElementById('eventSearch');
        const clear = document.getElementById('clearSearch');
        
        if (!search) return;
        
        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.event-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(term) ? '' : 'none';
            });
        });
        
        if (clear) {
            clear.addEventListener('click', () => {
                search.value = '';
                const event = new Event('input', { bubbles: true });
                search.dispatchEvent(event);
            });
        }
    }

    setupEventToggle() {
        const upcoming = document.getElementById('upcomingEvents');
        const past = document.getElementById('pastEvents');
        
        if (!upcoming || !past) return;
        
        upcoming.addEventListener('change', () => {
            document.getElementById('upcoming-section').style.display = 'block';
            document.getElementById('past-section').style.display = 'none';
        });
        
        past.addEventListener('change', () => {
            document.getElementById('upcoming-section').style.display = 'none';
            document.getElementById('past-section').style.display = 'block';
        });
    }

    setupPriceFilter() {
        document.querySelectorAll('input[name="priceFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const filter = e.target.value;
                document.querySelectorAll('.event-item').forEach(item => {
                    const price = item.dataset.price;
                    
                    if (filter === 'all') {
                        item.style.display = '';
                    } else if (filter === 'free' && price === 'free') {
                        item.style.display = '';
                    } else if (filter === 'under100' && parseInt(price) < 100) {
                        item.style.display = '';
                    } else if (filter === '100to200' && parseInt(price) >= 100 && parseInt(price) <= 200) {
                        item.style.display = '';
                    } else if (filter === 'over200' && parseInt(price) > 200) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    setupEventRegistration() {
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventName = btn.dataset.event || btn.closest('.card-body')?.querySelector('h4')?.textContent;
                const eventNameInput = document.getElementById('eventName');
                const modalTitle = document.querySelector('#registrationModal .modal-title');
                
                if (eventNameInput) eventNameInput.value = eventName;
                if (modalTitle) modalTitle.textContent = `Register for ${eventName}`;
            });
        });
        
        const confirmBtn = document.getElementById('confirmRegistration');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const name = document.getElementById('regName')?.value;
                const email = document.getElementById('regEmail')?.value;
                const phone = document.getElementById('regPhone')?.value;
                const eventName = document.getElementById('eventName')?.value;
                
                if (name && email && phone && eventName) {
                    if (typeof bootstrap !== 'undefined') {
                        bootstrap.Modal.getInstance(document.getElementById('registrationModal'))?.hide();
                    }
                    
                    const successContent = document.getElementById('registrationSuccessContent');
                    if (successContent) {
                        successContent.innerHTML = `
                            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                            <h5 class="mb-3">Registration Successful!</h5>
                            <p class="mb-2">You've registered for:</p>
                            <p class="fw-bold">${eventName}</p>
                            <p class="small text-muted">A confirmation email will be sent to ${email}</p>
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-warning me-2" onclick="addToCalendar('${eventName}')">
                                    <i class="fas fa-calendar-plus me-1"></i>Add to Calendar
                                </button>
                            </div>
                        `;
                    }
                    
                    if (typeof bootstrap !== 'undefined') {
                        const successModal = new bootstrap.Modal(document.getElementById('registrationSuccessModal'));
                        successModal.show();
                    }
                    
                    const nameInput = document.getElementById('regName');
                    const emailInput = document.getElementById('regEmail');
                    const phoneInput = document.getElementById('regPhone');
                    
                    if (nameInput) nameInput.value = '';
                    if (emailInput) emailInput.value = '';
                    if (phoneInput) phoneInput.value = '';
                } else {
                    this.showNotification('Please fill in all fields', 'warning');
                }
            });
        }
    }

    setupEventDetails() {
        document.querySelectorAll('[data-bs-target="#eventDetailsModal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventType = btn.dataset.event;
                const content = document.getElementById('eventDetailsContent');
                
                if (!content) return;
                
                const details = {
                    adoption: `
                        <h6>Cat Adoption Day</h6>
                        <p><strong>Date:</strong> March 15, 2026</p>
                        <p><strong>Time:</strong> 11:00 AM - 4:00 PM</p>
                        <p><strong>Location:</strong> Cat Lounge</p>
                        <p><strong>Host:</strong> PAWS Philippines</p>
                        <p><strong>Description:</strong> Meet local rescue organizations and potentially adopt a new furry friend! Several cats from our café will also be available for adoption. All cats are vaccinated and ready for their forever homes.</p>
                        <p><strong>What to bring:</strong> Valid ID, proof of address, and lots of love!</p>
                    `,
                    chess: `
                        <h6>Beginner's Chess Workshop</h6>
                        <p><strong>Date:</strong> March 22, 2026</p>
                        <p><strong>Time:</strong> 2:00 PM - 4:00 PM</p>
                        <p><strong>Location:</strong> Workshop Area</p>
                        <p><strong>Host:</strong> Nash Eicker Datiles</p>
                        <p><strong>Description:</strong> Learn the basics of chess from a local instructor. Perfect for beginners. Includes coffee or tea.</p>
                        <p><strong>Includes:</strong> Chess board rental, coffee/tea, handouts</p>
                    `,
                    yoga: `
                        <h6>Cat Yoga Session</h6>
                        <p><strong>Date:</strong> April 10, 2026</p>
                        <p><strong>Time:</strong> 9:00 AM - 10:30 AM</p>
                        <p><strong>Location:</strong> Cat Lounge</p>
                        <p><strong>Host:</strong> Naya Faye Barbero</p>
                        <p><strong>Description:</strong> Gentle yoga surrounded by our friendly cats. Includes 60-minute session, yoga mat rental, and a healthy smoothie.</p>
                        <p><strong>What to bring:</strong> Comfortable clothes, water bottle</p>
                    `,
                    gamenight: `
                        <h6>Friday Game Night</h6>
                        <p><strong>Date:</strong> April 2, 2026</p>
                        <p><strong>Time:</strong> 6:00 PM - 9:00 PM</p>
                        <p><strong>Location:</strong> Game Room</p>
                        <p><strong>Host:</strong> Rian Mae Jino-o</p>
                        <p><strong>Description:</strong> Our weekly game night! Bring friends or make new ones while playing from our board game collection. Special drink discounts for participants.</p>
                        <p><strong>Games available:</strong> Over 50 board games to choose from!</p>
                    `
                };
                
                content.innerHTML = details[eventType] || '<p>Event details coming soon!</p>';
            });
        });
    }

    setupReminderButtons() {
        document.querySelectorAll('.reminder-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventName = btn.dataset.event;
                alert(`Reminder set for ${eventName}! We'll email you 24 hours before the event.`);
            });
        });
    }

    setupCopyLink() {
        document.querySelectorAll('.copy-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const link = btn.dataset.link;
                navigator.clipboard.writeText(window.location.origin + '/' + link);
                alert('Link copied to clipboard!');
            });
        });
    }

    setupCountdownTimers() {
        const updateCountdowns = () => {
            document.querySelectorAll('.countdown').forEach(el => {
                const eventDate = new Date(el.dataset.date);
                const now = new Date();
                const diff = eventDate - now;
                
                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    el.textContent = days > 0 
                        ? `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`
                        : `${hours} hour${hours > 1 ? 's' : ''}`;
                } else {
                    el.textContent = 'Event started';
                }
            });
        };
        
        updateCountdowns();
        setInterval(updateCountdowns, 60000);
    }
}

// Global functions for onclick handlers
function toggleFavorite(button, catId) {
    if (window.mewbrew) {
        window.mewbrew.toggleFavorite(button, catId);
    }
}

function decrementQty(btn) {
    const input = btn.parentNode.querySelector('input[type="number"]');
    if (input) {
        let val = parseInt(input.value);
        if (val > 1) input.value = val - 1;
    }
}

function incrementQty(btn) {
    const input = btn.parentNode.querySelector('input[type="number"]');
    if (input) {
        let val = parseInt(input.value);
        if (val < 10) input.value = val + 1;
    }
}

function toggleCart() {
    if (window.mewbrew) {
        window.mewbrew.toggleCart();
    }
}

function proceedToCheckout() {
    if (window.mewbrew) {
        window.mewbrew.proceedToCheckout();
    }
}

function placeOrder() {
    if (window.mewbrew) {
        window.mewbrew.placeOrder();
    }
}

function addToCalendar(eventName) {
    if (typeof bootstrap !== 'undefined') {
        const calendarModal = new bootstrap.Modal(document.getElementById('calendarModal'));
        calendarModal.show();
    }
}