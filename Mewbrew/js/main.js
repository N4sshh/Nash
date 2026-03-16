// main.js - GLOBAL SHARED FUNCTIONS ONLY

const MewBrew = {
    // Shared cart system
    cart: {
        items: JSON.parse(localStorage.getItem('mewbrew_cart') || '[]'),
        
        add(item) {
            const existing = this.items.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += item.quantity || 1;
            } else {
                this.items.push({...item, quantity: item.quantity || 1});
            }
            this.save();
            this.updateUI();
            this.showNotification(`${item.name} added to cart!`, 'success');
        },
        
        remove(id) {
            this.items = this.items.filter(i => i.id !== id);
            this.save();
            this.updateUI();
        },
        
        updateQuantity(id, qty) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.quantity = parseInt(qty) || 1;
                if (item.quantity <= 0) this.remove(id);
                else this.save();
                this.updateUI();
            }
        },
        
        clear() {
            this.items = [];
            this.save();
            this.updateUI();
        },
        
        save() {
            localStorage.setItem('mewbrew_cart', JSON.stringify(this.items));
        },
        
        getSubtotal() {
            return this.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        },
        
        getCount() {
            return this.items.reduce((sum, i) => sum + i.quantity, 0);
        },
        
        updateUI() {
            // Update cart counters
            document.querySelectorAll('.cart-count').forEach(el => {
                const count = this.getCount();
                el.textContent = count;
                el.style.display = count > 0 ? 'inline-block' : 'none';
            });
            
            // Trigger page-specific cart updates
            document.dispatchEvent(new CustomEvent('cartUpdated', { 
                detail: { items: this.items, subtotal: this.getSubtotal() }
            }));
        },
        
        showNotification(message, type = 'success') {
            const notif = document.createElement('div');
            notif.className = `position-fixed top-0 end-0 m-3 p-3 bg-${type} text-white rounded shadow-lg`;
            notif.style.zIndex = '9999';
            notif.style.minWidth = '300px';
            notif.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                    <span>${message}</span>
                    <button class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 3000);
        }
    },
    
    // Theme handling - FIXED to match your CSS
    theme: {
        init() {
            // Check for saved theme
            const saved = localStorage.getItem('mewbrew_theme');
            
            if (saved === 'dark') {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else if (saved === 'light') {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                // Use system preference if no saved theme
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            }
            
            // Create theme toggle button if it doesn't exist
            this.createToggle();
            
            // Update icon based on current theme
            this.updateIcon();
        },
        
        createToggle() {
            // Remove existing toggle if any
            const existing = document.querySelector('.theme-toggle');
            if (existing) existing.remove();
            
            // Create new toggle with proper classes for your CSS
            const themeBtn = document.createElement('button');
            themeBtn.className = 'theme-toggle'; // Your CSS targets .theme-toggle directly
            themeBtn.setAttribute('aria-label', 'Toggle theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeBtn.onclick = () => MewBrew.theme.toggle();
            document.body.appendChild(themeBtn);
        },
        
        toggle() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('mewbrew_theme', isDark ? 'dark' : 'light');
            this.updateIcon();
            
            // Show notification
            MewBrew.cart.showNotification(`${isDark ? 'Dark' : 'Light'} mode activated`, 'info');
        },
        
        updateIcon() {
            const themeBtn = document.querySelector('.theme-toggle');
            if (!themeBtn) return;
            
            const isDark = document.body.classList.contains('dark-theme');
            themeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        }
    },
    
    // Utility functions
    utils: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        },
        
        formatPrice(price) {
            return '₱' + parseFloat(price).toFixed(2);
        },
        
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        isValidPhone(phone) {
            return /^[\d\s\-\+\(\)]{7,15}$/.test(phone);
        },
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
};

// Initialize global features
document.addEventListener('DOMContentLoaded', () => {
    MewBrew.theme.init();
    MewBrew.cart.updateUI();
    
    // Setup back to top
    if (!document.querySelector('.back-to-top')) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-top'; // Your CSS targets .back-to-top directly
        backBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backBtn.setAttribute('aria-label', 'Back to top');
        backBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(backBtn);
        
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('visible', window.scrollY > 300);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only change if user hasn't set a preference
        if (!localStorage.getItem('mewbrew_theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            MewBrew.theme.updateIcon();
        }
    });
    
    // Add floating cats (optional decorative element)
    if (!document.querySelector('.floating-cats') && Math.random() > 0.5) { // Only show sometimes
        MewBrew.theme.addFloatingCats();
    }
});

// Add floating cats method (optional)
MewBrew.theme.addFloatingCats = function() {
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
};

// Make globally available
window.MewBrew = MewBrew;