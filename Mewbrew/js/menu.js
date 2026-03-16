// menu.js - MENU PAGE ONLY

// Global flag to track initialization
let menuInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the menu page
    if (!document.body.classList.contains('menu-page')) {
        console.log('Not on menu page, skipping menu.js initialization');
        return;
    }
    
    // Check dependencies
    if (typeof MewBrew === 'undefined') {
        console.error('MewBrew global object not found. Ensure main.js is loaded before menu.js');
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap JS not found. Ensure bootstrap.bundle.min.js is loaded');
        return;
    }
    
    // Initialize menu - only once
    if (!menuInitialized) {
        try {
            initMenu();
            menuInitialized = true;
        } catch (error) {
            console.error('Error initializing menu:', error);
        }
    }
    
    // Listen for cart updates
    document.addEventListener('cartUpdated', updateCartDisplay);
    
    // Initial cart display
    updateCartDisplay();
});

/**
 * Initialize all menu functionality
 */
function initMenu() {
    setupSearch();
    setupDietaryFilters();
    setupQuantityControls();
    setupAddToCart();
    setupCategoryTabs();
    setupCartIcon();
    setupCheckout();
    populateCategoryContainers();
    setupRecentlyViewed();
    setupTermsLink();
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const search = document.getElementById('menuSearch');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!search) return;
    
    let searchTimeout;
    search.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const term = e.target.value.toLowerCase().trim();
            filterMenuItems(term);
        }, 150);
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            search.value = '';
            filterMenuItems('');
            search.focus();
        });
    }
    
    // Escape key to clear
    search.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            search.value = '';
            filterMenuItems('');
        }
    });
}

/**
 * Filter menu items based on search term
 */
function filterMenuItems(term) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const name = item.querySelector('h3')?.textContent?.toLowerCase() || '';
        const desc = item.querySelector('p')?.textContent?.toLowerCase() || '';
        
        const matches = term === '' || name.includes(term) || desc.includes(term);
        item.closest('.col-md-6, .col-lg-3')?.classList.toggle('d-none', !matches);
    });
}

/**
 * Setup dietary filters
 */
function setupDietaryFilters() {
    document.querySelectorAll('.filter-dietary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const diet = e.currentTarget.dataset.diet;
            applyDietaryFilter(diet);
            
            // Update active state
            document.querySelectorAll('.filter-dietary').forEach(b => {
                b.classList.remove('bg-warning', 'text-dark');
                b.classList.add('bg-light', 'text-dark');
            });
            e.currentTarget.classList.remove('bg-light');
            e.currentTarget.classList.add('bg-warning', 'text-dark');
        });
    });
}

/**
 * Apply dietary filter
 */
function applyDietaryFilter(diet) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const col = item.closest('.col-md-6, .col-lg-3');
        if (!col) return;
        
        if (diet === 'all') {
            col.classList.remove('d-none');
            return;
        }
        
        // Check for dietary badges
        const hasVegan = item.querySelector('.fa-seedling');
        const hasGlutenFree = item.querySelector('.fa-wheat-alt');
        const hasDairy = item.querySelector('.fa-cow');
        const hasHot = item.querySelector('.fa-fire');
        const hasCold = item.querySelector('.fa-snowflake');
        
        let show = false;
        switch(diet) {
            case 'vegan':
                show = hasVegan !== null;
                break;
            case 'gluten-free':
                show = hasGlutenFree === null; // No wheat icon = gluten free
                break;
            case 'dairy-free':
                show = hasDairy === null; // No cow icon = dairy free
                break;
            case 'hot':
                show = hasHot !== null;
                break;
            case 'cold':
                show = hasCold !== null;
                break;
        }
        
        col.classList.toggle('d-none', !show);
    });
}

/**
 * Setup quantity controls with SINGLE delegated listener
 */
function setupQuantityControls() {
    // Remove any existing handlers by using a named function we can check
    document.addEventListener('click', handleMenuQuantityClick);
}

/**
 * Handle quantity button clicks - SINGLE HANDLER
 */
function handleMenuQuantityClick(e) {
    const btn = e.target.closest('.qty-minus, .qty-plus');
    if (!btn) return;
    
    // Stop everything
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    const isMinus = btn.classList.contains('qty-minus');
    const container = btn.closest('.input-group');
    const input = container?.querySelector('input[type="number"]');
    
    if (!input) return;
    
    let val = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 10;
    
    if (isMinus && val > min) {
        input.value = val - 1;
    } else if (!isMinus && val < max) {
        input.value = val + 1;
    }
}

/**
 * Setup add to cart buttons
 */
function setupAddToCart() {
    // Use event delegation for all add-to-cart buttons
    document.addEventListener('click', handleMenuAddToCart);
}

/**
 * Handle add to cart clicks
 */
function handleMenuAddToCart(e) {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get data from button
    let name = btn.dataset.name;
    let price = parseFloat(btn.dataset.price);
    let id = btn.dataset.id;
    let category = btn.dataset.category || 'menu';
    
    // If missing, try to get from DOM
    if (!name || !price) {
        const card = btn.closest('.card');
        if (card) {
            name = name || card.querySelector('h3')?.textContent?.trim();
            const priceEl = card.querySelector('.badge.bg-warning');
            if (priceEl && !price) {
                const match = priceEl.textContent.match(/₱(\d+)/);
                if (match) price = parseFloat(match[1]);
            }
        }
    }
    
    // Get quantity from sibling input
    const card = btn.closest('.card');
    const qtyInput = card?.querySelector('input[type="number"]');
    const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    
    // Validate
    if (!name) {
        showMenuNotification('Error: Could not find item name', 'danger');
        return;
    }
    
    if (!price || price <= 0) {
        showMenuNotification('Error: Invalid price', 'danger');
        return;
    }
    
    // Generate ID if missing
    if (!id) {
        id = 'menu-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    // Show loading
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
    
    // Add to cart
    setTimeout(() => {
        try {
            MewBrew.cart.add({
                id: id,
                name: name,
                price: price,
                category: category,
                quantity: quantity
            });
            
            // Track recently viewed
            const img = card?.querySelector('img')?.src;
            trackMenuRecentlyViewed(name, price, img);
            
            // Reset quantity
            if (qtyInput) qtyInput.value = '1';
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            showMenuNotification('Failed to add item', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    }, 300);
}

/**
 * Track recently viewed menu items
 */
function trackMenuRecentlyViewed(name, price, img) {
    const key = 'menu_recently_viewed';
    let viewed = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Remove if exists
    viewed = viewed.filter(item => item.name !== name);
    
    // Add to front
    viewed.unshift({
        name: name,
        price: price,
        img: img,
        timestamp: Date.now()
    });
    
    // Keep only 4
    localStorage.setItem(key, JSON.stringify(viewed.slice(0, 4)));
    
    updateMenuRecentlyViewedUI();
}

/**
 * Setup recently viewed section
 */
function setupRecentlyViewed() {
    updateMenuRecentlyViewedUI();
}

/**
 * Update recently viewed UI
 */
function updateMenuRecentlyViewedUI() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;
    
    const viewed = JSON.parse(localStorage.getItem('menu_recently_viewed') || '[]');
    
    if (viewed.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted"><small>No recently viewed items</small></div>';
        return;
    }
    
    container.innerHTML = viewed.map(item => `
        <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
                <div style="height: 100px; overflow: hidden;">
                    <img src="${item.img || 'https://via.placeholder.com/100x100/ffb74d/ffffff?text=Food'}" 
                         class="card-img-top" 
                         alt="${item.name}"
                         style="height: 100%; width: 100%; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/100x100/ffb74d/ffffff?text=${encodeURIComponent(item.name.charAt(0))}'">
                </div>
                <div class="card-body p-2 text-center">
                    <small class="fw-bold d-block text-truncate">${item.name}</small>
                    <small class="text-warning">₱${parseInt(item.price).toLocaleString()}</small>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Setup category tabs
 */
function setupCategoryTabs() {
    document.querySelectorAll('#menuTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            // Populate category containers when tab is shown
            const target = e.target.getAttribute('data-bs-target');
            if (target && target !== '#all-items') {
                populateCategoryContainers();
            }
        });
    });
}

/**
 * Populate category containers
 */
function populateCategoryContainers() {
    const containers = {
        'coffee': document.getElementById('coffee-container'),
        'pastry': document.getElementById('pastries-container'),
        'non-coffee': document.getElementById('non-coffee-container')
    };
    
    const allItems = document.querySelectorAll('#all-items .menu-item');
    
    Object.keys(containers).forEach(cat => {
        const container = containers[cat];
        if (!container) return;
        
        container.innerHTML = '';
        
        let count = 0;
        allItems.forEach(item => {
            const btn = item.querySelector('.add-to-cart-btn');
            const itemCat = btn?.dataset.category;
            
            if (itemCat === cat) {
                const clone = item.closest('.col-md-6, .col-lg-3').cloneNode(true);
                container.appendChild(clone);
                count++;
            }
        });
        
        if (count === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-utensils fa-4x text-muted mb-3"></i>
                    <h5>No items in this category</h5>
                    <p class="text-muted">Check back soon!</p>
                </div>
            `;
        }
    });
}

/**
 * Setup cart icon
 */
function setupCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;
    
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        const offcanvasEl = document.getElementById('cartOffcanvas');
        if (offcanvasEl && typeof bootstrap !== 'undefined') {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
            offcanvas.show();
            updateCartDisplay();
        }
    });
}

/**
 * Update cart display in offcanvas
 */
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItems) return;
    
    const items = MewBrew.cart.items;
    const subtotal = MewBrew.cart.getSubtotal();
    
    // Filter for menu items only
    const menuItems = items.filter(item => item.category === 'menu' || item.category === 'coffee' || item.category === 'pastry' || item.category === 'non-coffee');
    
    if (menuItems.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted mb-1">Your cart is empty</p>
                <p class="small text-muted">Add some delicious items from our menu!</p>
                <button type="button" class="btn btn-outline-warning btn-sm mt-3" data-bs-dismiss="offcanvas">
                    Continue Browsing
                </button>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let cartHtml = '';
    menuItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartHtml += `
            <div class="cart-item mb-3 pb-3 border-bottom" data-id="${item.id}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1 fw-bold">${escapeHtml(item.name)}</h6>
                        <small class="text-muted">₱${item.price.toLocaleString()} each</small>
                    </div>
                    <span class="fw-bold text-warning">₱${itemTotal.toLocaleString()}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button type="button" class="btn btn-outline-warning qty-minus-cart" aria-label="Decrease quantity">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" max="10" aria-label="Quantity">
                        <button type="button" class="btn btn-outline-warning qty-plus-cart" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item" aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHtml;
    
    // Attach listeners to cart items
    attachMenuCartListeners(cartItems);
    
    // Update summary
    updateMenuCartSummary(subtotal);
    
    if (cartSummary) cartSummary.style.display = 'block';
}

/**
 * Attach cart item listeners
 */
function attachMenuCartListeners(container) {
    // Quantity minus
    container.querySelectorAll('.qty-minus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            
            if (id && input) {
                let val = parseInt(input.value) - 1;
                if (val >= 1) {
                    MewBrew.cart.updateQuantity(id, val);
                } else {
                    if (confirm('Remove this item?')) {
                        MewBrew.cart.remove(id);
                    }
                }
            }
        });
    });
    
    // Quantity plus
    container.querySelectorAll('.qty-plus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            
            if (id && input) {
                let val = parseInt(input.value) + 1;
                if (val <= 10) {
                    MewBrew.cart.updateQuantity(id, val);
                } else {
                    showMenuNotification('Maximum quantity is 10', 'warning');
                }
            }
        });
    });
    
    // Input change
    container.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            let val = parseInt(e.target.value) || 1;
            val = Math.max(1, Math.min(10, val));
            e.target.value = val;
            
            if (id) MewBrew.cart.updateQuantity(id, val);
        });
    });
    
    // Remove buttons
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            
            if (id && confirm('Remove this item from your cart?')) {
                MewBrew.cart.remove(id);
            }
        });
    });
}

/**
 * Update cart summary
 */
function updateMenuCartSummary(subtotal) {
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;
    const points = Math.floor(subtotal / 10);
    
    // Free drink progress
    const progress = Math.min((subtotal / 500) * 100, 100);
    const progressBar = document.getElementById('drink-progress-bar');
    const progressText = document.getElementById('drink-progress-text');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
    }
    if (progressText) {
        progressText.textContent = `₱${subtotal.toLocaleString()}/₱500`;
    }
    
    // Summary
    const elements = {
        'cart-subtotal': '₱' + subtotal.toLocaleString(),
        'cart-service-fee': '₱' + serviceFee.toLocaleString(),
        'cart-total': '₱' + total.toLocaleString(),
        'points-earned': points.toString()
    };
    
    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elements[id];
    });
    
    // Combo suggestion
    const comboSuggestion = document.getElementById('combo-suggestion');
    if (comboSuggestion) {
        // Show if subtotal is between 100 and 180 (close to combo price)
        comboSuggestion.style.display = (subtotal >= 100 && subtotal <= 180) ? 'block' : 'none';
    }
}

/**
 * Setup checkout
 */
function setupCheckout() {
    // Checkout button is handled by global onclick, but we need to populate modal
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (MewBrew.cart.items.length === 0) {
                showMenuNotification('Your cart is empty!', 'warning');
                return;
            }
            
            // Populate modal
            const modalCart = document.getElementById('modal-cart-items');
            const modalTotal = document.getElementById('modal-total');
            
            if (modalCart) {
                modalCart.innerHTML = '';
                const menuItems = MewBrew.cart.items.filter(item => 
                    item.category === 'menu' || item.category === 'coffee' || item.category === 'pastry' || item.category === 'non-coffee'
                );
                
                menuItems.forEach(item => {
                    modalCart.innerHTML += `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>₱${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `;
                });
            }
            
            if (modalTotal) {
                const subtotal = MewBrew.cart.getSubtotal();
                const serviceFee = subtotal * 0.05;
                modalTotal.textContent = '₱' + (subtotal + serviceFee).toLocaleString();
            }
            
            // Show modal
            const modalEl = document.getElementById('checkoutModal');
            if (modalEl && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }
}

/**
 * Setup terms link
 */
function setupTermsLink() {
    const termsLink = document.querySelector('.terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const modalEl = document.getElementById('termsModal');
            if (modalEl && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }
}

/**
 * Show notification helper
 */
function showMenuNotification(message, type = 'info') {
    if (window.MewBrew && MewBrew.cart && MewBrew.cart.showNotification) {
        MewBrew.cart.showNotification(message, type);
    } else {
        alert(message);
    }
}

/**
 * Escape HTML helper
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global functions for onclick handlers
window.proceedToCheckout = function() {
    // This is handled by the event listener in setupCheckout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.click();
    }
};

window.placeOrder = function() {
    const form = document.getElementById('orderForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const termsInput = document.getElementById('terms');
    
    // Validate
    if (!nameInput?.value?.trim()) {
        showMenuNotification('Please enter your name', 'warning');
        nameInput?.focus();
        return;
    }
    
    if (!emailInput?.value?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showMenuNotification('Please enter a valid email', 'warning');
        emailInput?.focus();
        return;
    }
    
    if (!phoneInput?.value?.trim()) {
        showMenuNotification('Please enter your phone number', 'warning');
        phoneInput?.focus();
        return;
    }
    
    if (!termsInput?.checked) {
        showMenuNotification('Please agree to the terms', 'warning');
        return;
    }
    
    // Process order
    const orderNum = 'MB-' + Date.now().toString().slice(-8);
    const subtotal = MewBrew.cart.getSubtotal();
    const points = Math.floor(subtotal / 10);
    
    // Update success modal
    const successModal = document.getElementById('orderSuccessModal');
    if (!successModal) {
        // Create success modal dynamically if it doesn't exist
        showMenuNotification(`Order placed! Order #: ${orderNum}`, 'success');
        MewBrew.cart.clear();
        
        // Close checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            const modal = bootstrap.Modal.getInstance(checkoutModal);
            if (modal) modal.hide();
        }
        return;
    }
    
    const orderNumEl = successModal.querySelector('#orderNumber');
    const pointsEl = successModal.querySelector('#orderPoints');
    
    if (orderNumEl) orderNumEl.textContent = orderNum;
    if (pointsEl) pointsEl.textContent = points;
    
    // Clear cart
    MewBrew.cart.clear();
    
    // Close checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        const modal = bootstrap.Modal.getInstance(checkoutModal);
        if (modal) {
            modal.hide();
            cleanupMenuModals();
        }
    }
    
    // Show success modal
    setTimeout(() => {
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(successModal);
            modal.show();
        }
    }, 300);
};

/**
 * Cleanup modal backdrops
 */
function cleanupMenuModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupMenuModals);