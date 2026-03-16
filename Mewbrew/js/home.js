// home.js - HOMEPAGE ONLY
// Include this ONLY on index.html

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.home-page')) return;
    
    initHome();
});

function initHome() {
    setupStatsCounter();
    setupVisitorGreeting();
    setupHeroAnimation();
    setupCatCarousel();
    setupTestimonialCarousel();
    setupNewsletter();
}

function setupStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const targetText = counter.textContent.trim();
        const target = parseInt(targetText.replace(/[^0-9]/g, ''));
        
        if (isNaN(target) || target === 0) return;
        
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when counter is visible
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

function setupVisitorGreeting() {
    const visitCount = parseInt(localStorage.getItem('mewbrew_visit_count') || '0');
    
    if (visitCount === 1) {
        setTimeout(() => {
            MewBrew.cart.showNotification('Welcome to MewBrew Café! First-time visitor? Enjoy 10% off your first order!', 'info', 5000);
        }, 1000);
    }
}

function setupHeroAnimation() {
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (heroImage) {
        heroImage.style.opacity = '0';
        heroImage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            heroImage.style.transition = 'all 0.8s ease 0.3s';
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'scale(1)';
        }, 200);
    }
}

function setupCatCarousel() {
    const carousel = document.getElementById('catCarousel');
    if (!carousel || typeof bootstrap === 'undefined') return;
    
    // Initialize Bootstrap carousel with 5-minute interval
    new bootstrap.Carousel(carousel, {
        interval: 300000, // 5 minutes
        ride: 'carousel',
        wrap: true
    });
    
    // Add hover pause
    carousel.addEventListener('mouseenter', () => {
        const instance = bootstrap.Carousel.getInstance(carousel);
        if (instance) instance.pause();
    });
    
    carousel.addEventListener('mouseleave', () => {
        const instance = bootstrap.Carousel.getInstance(carousel);
        if (instance) instance.cycle();
    });
}

function setupTestimonialCarousel() {
    const carousel = document.getElementById('testimonialCarousel');
    if (!carousel || typeof bootstrap === 'undefined') return;
    
    new bootstrap.Carousel(carousel, {
        interval: 5000,
        ride: 'carousel',
        wrap: true
    });
    
    // Update active indicator
    carousel.addEventListener('slide.bs.carousel', (e) => {
        const indicators = carousel.querySelectorAll('.carousel-indicators button');
        indicators.forEach((btn, idx) => {
            if (idx === e.to) {
                btn.classList.add('active');
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.classList.remove('active');
                btn.removeAttribute('aria-current');
            }
        });
    });
}

function setupNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput?.value;
        
        if (!email) {
            MewBrew.cart.showNotification('Please enter your email address', 'warning');
            return;
        }
        
        if (!MewBrew.utils.isValidEmail(email)) {
            MewBrew.cart.showNotification('Please enter a valid email address', 'warning');
            return;
        }
        
        // Save subscriber
        const subscribers = JSON.parse(localStorage.getItem('mewbrew_subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('mewbrew_subscribers', JSON.stringify(subscribers));
        }
        
        MewBrew.cart.showNotification('Thank you for subscribing!', 'success');
        emailInput.value = '';
    });
}

// Add smooth scrolling for anchor links
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

// Track visit count
const visitCount = parseInt(localStorage.getItem('mewbrew_visit_count') || '0');
localStorage.setItem('mewbrew_visit_count', (visitCount + 1).toString());

// Track page view
const pageViews = JSON.parse(localStorage.getItem('mewbrew_page_views') || '{}');
pageViews['index.html'] = (pageViews['index.html'] || 0) + 1;
localStorage.setItem('mewbrew_page_views', JSON.stringify(pageViews));