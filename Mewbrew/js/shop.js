// shop.js - SHOP PAGE ONLY - COMPLETELY FIXED VERSION

// Global flags to track initialization
let quantityControlsInitialized = false;
let checkoutInitialized = false;
let quickViewListenersAttached = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.shop-page')) return;
    if (typeof MewBrew === 'undefined') {
        console.error('MewBrew not found');
        return;
    }
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap not found');
        return;
    }
    
    initShop();
    document.addEventListener('cartUpdated', updateCartDisplay);
    updateCartDisplay();
});

function initShop() {
    setupSearch();
    setupPriceFilter();
    setupSort();
    setupWishlist();
    setupQuickView();
    
    // Only setup quantity controls ONCE
    if (!quantityControlsInitialized) {
        setupQuantityControls();
        quantityControlsInitialized = true;
    }
    
    setupAddToCart();
    setupCategoryTabs();
    setupRecentlyViewed();
    setupCartIcon();
    
    // Only setup checkout once
    if (!checkoutInitialized) {
        setupCheckout();
        checkoutInitialized = true;
    }
    
    fixProductImages();
    fixPriceDisplay();
    populateCategoryContainers();
}

/**
 * Setup quantity controls - SINGLETON PATTERN
 */
function setupQuantityControls() {
    // Use a single delegated listener - NO cloning that breaks things
    document.addEventListener('click', function quantityHandler(e) {
        const btn = e.target.closest('.qty-minus, .qty-plus');
        if (!btn) return;
        
        // Prevent any default behavior
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const inputGroup = btn.closest('.input-group');
        if (!inputGroup) return;
        
        const input = inputGroup.querySelector('input[type="number"]');
        if (!input) return;
        
        let val = parseInt(input.value) || 1;
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 10;
        
        if (btn.classList.contains('qty-minus')) {
            if (val > min) {
                input.value = val - 1;
            }
        } else if (btn.classList.contains('qty-plus')) {
            if (val < max) {
                input.value = val + 1;
            }
        }
    });
}

/**
 * Setup search
 */
function setupSearch() {
    const search = document.getElementById('productSearch');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!search) return;
    
    let searchTimeout;
    search.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('#all-products .product-item').forEach(item => {
                const name = item.dataset.name?.toLowerCase() || '';
                const category = item.dataset.category?.toLowerCase() || '';
                item.classList.toggle('d-none', !(term === '' || name.includes(term) || category.includes(term)));
            });
        }, 150);
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            search.value = '';
            search.dispatchEvent(new Event('input'));
            search.focus();
        });
    }
}

/**
 * Setup price filter
 */
function setupPriceFilter() {
    document.querySelectorAll('input[name="priceFilter"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const filter = e.target.id;
            document.querySelectorAll('#all-products .product-item').forEach(item => {
                const price = parseInt(item.dataset.price) || 0;
                let show = false;
                switch(filter) {
                    case 'priceAll': show = true; break;
                    case 'priceUnder200': show = price < 200; break;
                    case 'price200to400': show = price >= 200 && price <= 400; break;
                    case 'priceOver400': show = price > 400; break;
                }
                item.classList.toggle('d-none', !show);
            });
        });
    });
}

/**
 * Setup sort
 */
function setupSort() {
    const sort = document.getElementById('sortProducts');
    if (!sort) return;
    
    sort.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'default') return;
        
        const containers = [
            document.getElementById('featured-products'),
            document.getElementById('all-products-grid')
        ];
        
        containers.forEach(container => {
            if (!container) return;
            const items = Array.from(container.children);
            items.sort((a, b) => {
                const priceA = parseInt(a.dataset.price) || 0;
                const priceB = parseInt(b.dataset.price) || 0;
                return value === 'price-low' ? priceA - priceB : priceB - priceA;
            });
            items.forEach(item => container.appendChild(item));
        });
    });
}

/**
 * Setup wishlist
 */
function setupWishlist() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', handleWishlist);
    });
    loadWishlistStates();
}

function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const icon = btn.querySelector('i');
    
    if (!productId || !icon) return;
    
    let wishlist = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
    const isInWishlist = wishlist.includes(productId);
    
    if (isInWishlist) {
        wishlist = wishlist.filter(id => id !== productId);
        icon.classList.remove('fas', 'text-danger');
        icon.classList.add('far');
        icon.style.color = '';
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        icon.classList.remove('far');
        icon.classList.add('fas', 'text-danger');
        icon.style.color = '#dc3545';
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
}

function loadWishlistStates() {
    const wishlist = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.dataset.product;
        const icon = btn.querySelector('i');
        if (!productId || !icon) return;
        
        if (wishlist.includes(productId)) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-danger');
            icon.style.color = '#dc3545';
        } else {
            icon.classList.remove('fas', 'text-danger');
            icon.classList.add('far');
            icon.style.color = '';
        }
    });
}

function showNotification(message, type) {
    if (window.MewBrew && MewBrew.cart) {
        MewBrew.cart.showNotification(message, type);
    } else {
        alert(message);
    }
}

/**
 * Setup quick view
 */
function setupQuickView() {
    document.querySelectorAll('.quick-view').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', handleQuickView);
    });
}

function handleQuickView(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const card = btn.closest('.card');
    if (!card) return;
    
    const img = card.querySelector('img')?.src || '';
    const name = card.querySelector('.card-title')?.textContent || '';
    
    // FIXED: Get price from data attribute first, then fall back to badge text
    let price = '0';
    const productItem = card.closest('.product-item');
    if (productItem && productItem.dataset.price) {
        price = productItem.dataset.price;
    } else {
        // Fallback to badge text
        const priceEl = card.querySelector('.badge.bg-warning');
        if (priceEl) {
            const match = priceEl.textContent.match(/₱(\d+)/);
            if (match) price = match[1];
        }
    }
    
    const desc = card.querySelector('p.small')?.textContent || '';
    
    // Update modal content
    const modalImg = document.getElementById('quickViewImage');
    const modalName = document.getElementById('quickViewName');
    const modalPrice = document.getElementById('quickViewPrice');
    const modalDesc = document.getElementById('quickViewDescription');
    const modalQty = document.getElementById('quickViewQty');
    const addBtn = document.getElementById('quickViewAddToCart');
    
    if (modalImg) modalImg.src = img;
    if (modalImg) modalImg.alt = name;
    if (modalName) modalName.textContent = name;
    if (modalPrice) modalPrice.textContent = '₱' + price;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalQty) modalQty.value = '1';
    
    if (addBtn) {
        addBtn.dataset.name = name;
        addBtn.dataset.price = price;
        addBtn.dataset.id = productId || 'qv-' + Date.now();
    }
    
    const modalEl = document.getElementById('quickViewModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    modalEl.addEventListener('hidden.bs.modal', cleanupModals, { once: true });
}

/**
 * Setup add to cart
 */
function setupAddToCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const card = btn.closest('.card');
    const qtyInput = card?.querySelector('input[type="number"]');
    
    let name = btn.dataset.name;
    let price = parseFloat(btn.dataset.price);
    let id = btn.dataset.id;
    let category = btn.dataset.category || 'shop';
    
    if (!name) {
        name = card?.querySelector('.card-title')?.textContent?.trim() || 'Product';
    }
    
    if (!price || isNaN(price)) {
        const productItem = card?.closest('.product-item');
        if (productItem && productItem.dataset.price) {
            price = parseFloat(productItem.dataset.price);
        } else {
            const priceEl = card?.querySelector('.badge.bg-warning');
            const match = priceEl?.textContent.match(/₱(\d+)/);
            price = match ? parseFloat(match[1]) : 0;
        }
    }
    
    if (!id) {
        id = 'shop-' + name.toLowerCase().replace(/\s+/g, '-');
    }
    
    const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    
    if (price <= 0) {
        showNotification('Error: Invalid product price', 'warning');
        return;
    }
    
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
    
    try {
        MewBrew.cart.add({
            id: id,
            name: name,
            price: price,
            category: category,
            quantity: quantity
        });
        
        if (qtyInput) qtyInput.value = '1';
        trackRecentlyViewed(name, price, card?.querySelector('img')?.src);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add item', 'danger');
    } finally {
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 500);
    }
}

function trackRecentlyViewed(name, price, img) {
    const viewed = JSON.parse(localStorage.getItem('shop_recently_viewed') || '[]');
    const existingIndex = viewed.findIndex(v => v.name === name);
    if (existingIndex !== -1) viewed.splice(existingIndex, 1);
    
    viewed.unshift({
        name: name,
        price: price,
        img: img || '../img/products/placeholder.jpg',
        timestamp: Date.now()
    });
    
    localStorage.setItem('shop_recently_viewed', JSON.stringify(viewed.slice(0, 4)));
    updateRecentlyViewedUI();
}

function setupRecentlyViewed() {
    updateRecentlyViewedUI();
}

function updateRecentlyViewedUI() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;
    
    const viewed = JSON.parse(localStorage.getItem('shop_recently_viewed') || '[]');
    
    if (viewed.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted"><small>No recently viewed items</small></div>';
        return;
    }
    
    container.innerHTML = viewed.map(item => `
        <div class="col-3">
            <div class="card border-0 shadow-sm">
                <div class="product-img-small">
                    <img src="${item.img}" class="card-img-top" alt="${item.name}" loading="lazy" style="height: 80px; object-fit: contain; background: #f8f9fa; padding: 5px;" onerror="this.src='https://via.placeholder.com/80x80/ffb74d/5d4037?text=${item.name.charAt(0)}'">
                </div>
                <div class="card-body p-2 text-center">
                    <small class="fw-bold d-block text-truncate">${item.name}</small>
                    <small class="text-warning d-block">₱${item.price}</small>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Setup category tabs - FIXED to not re-attach quantity controls
 */
function setupCategoryTabs() {
    document.querySelectorAll('#productTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            setTimeout(() => {
                fixProductImages();
                fixPriceDisplay();
            }, 100);
        });
    });
}

/**
 * Populate category containers - FIXED to not re-attach quantity controls
 */
function populateCategoryContainers() {
    const containers = {
        apparel: document.getElementById('apparel-container') || document.querySelector('#apparel-products .row'),
        home: document.getElementById('home-container') || document.querySelector('#home-products .row'),
        accessories: document.getElementById('accessories-container') || document.querySelector('#accessories-products .row')
    };
    
    const allProducts = document.querySelectorAll('#all-products .product-item');
    
    Object.keys(containers).forEach(cat => {
        const container = containers[cat];
        if (!container) return;
        
        container.innerHTML = '';
        
        allProducts.forEach(product => {
            if (product.dataset.category === cat) {
                const clone = product.cloneNode(true);
                container.appendChild(clone);
            }
        });
        
        if (container.children.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                    <h5>No ${cat} items</h5>
                    <p class="text-muted">Check back soon!</p>
                </div>
            `;
        }
    });
    
    setupWishlist();
    setupQuickView();
    setupAddToCart();
}

/**
 * Setup cart icon
 */
function setupCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;
    
    cartIcon.style.cursor = 'pointer';
    
    if (cartIcon.hasAttribute('data-bs-toggle')) return;
    
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        const offcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
        offcanvas.show();
    });
}

/**
 * Update cart display
 */
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItems) return;
    
    const items = MewBrew.cart.items;
    const subtotal = MewBrew.cart.getSubtotal();
    
    if (items.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted mb-1">Your cart is empty</p>
                <p class="small text-muted">Add some items from our shop!</p>
                <button type="button" class="btn btn-outline-warning btn-sm mt-3" data-bs-dismiss="offcanvas">
                    Continue Browsing
                </button>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let cartHtml = '';
    items.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        cartHtml += `
            <div class="cart-item mb-3 pb-3 border-bottom" data-id="${item.id}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1 fw-bold">${escapeHtml(item.name)}</h6>
                        <small class="text-muted">₱${item.price.toFixed(2)} each</small>
                    </div>
                    <span class="fw-bold text-warning">₱${itemTotal}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button type="button" class="btn btn-outline-warning qty-minus-cart" aria-label="Decrease quantity">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" max="10" aria-label="Quantity" style="height: 31px;">
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
    attachCartListeners(cartItems);
    updateCartTotals(subtotal);
    
    if (cartSummary) cartSummary.style.display = 'block';
}

/**
 * Attach cart listeners - uses DIFFERENT class names to avoid conflicts
 */
function attachCartListeners(container) {
    container.querySelectorAll('.qty-minus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            
            if (!id || !input) return;
            
            let val = parseInt(input.value) - 1;
            if (val >= 1) {
                MewBrew.cart.updateQuantity(id, val);
            } else {
                if (confirm('Remove this item from cart?')) {
                    MewBrew.cart.remove(id);
                }
            }
        });
    });
    
    container.querySelectorAll('.qty-plus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            
            if (!id || !input) return;
            
            let val = parseInt(input.value) + 1;
            if (val <= 10) {
                MewBrew.cart.updateQuantity(id, val);
            } else {
                showNotification('Maximum quantity reached', 'warning');
            }
        });
    });
    
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            
            if (id && confirm('Remove this item from your cart?')) {
                MewBrew.cart.remove(id);
            }
        });
    });
    
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
}

function updateCartTotals(subtotal) {
    const shipping = subtotal >= 1000 ? 0 : 100;
    const total = subtotal + shipping;
    const points = Math.floor(subtotal / 10);
    const progress = Math.min((subtotal / 1000) * 100, 100);
    
    const elements = {
        'cart-subtotal': '₱' + subtotal.toFixed(2),
        'cart-shipping': shipping === 0 ? 'Free' : '₱' + shipping,
        'cart-total': '₱' + total.toFixed(2),
        'points-earned': points,
        'shipping-progress-text': `₱${subtotal.toFixed(0)}/₱1000`,
        'shipping-progress-bar': progress
    };
    
    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (id === 'shipping-progress-bar') {
            el.style.width = elements[id] + '%';
            el.setAttribute('aria-valuenow', elements[id]);
        } else {
            el.textContent = elements[id];
        }
    });
}

/**
 * Setup checkout - FIXED with initialization guard
 */
function setupCheckout() {
    if (checkoutInitialized) return;
    checkoutInitialized = true;
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    const applyDiscountBtn = document.getElementById('applyDiscount');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = document.getElementById('discountCode')?.value?.trim().toUpperCase();
            if (code === 'MEW10') {
                showNotification('10% discount applied!', 'success');
                const discount = MewBrew.cart.getSubtotal() * 0.1;
                document.getElementById('cart-discount').textContent = '-₱' + discount.toFixed(0);
            } else {
                showNotification('Invalid discount code', 'warning');
            }
        });
    }
    
    // Quick view modal controls - ONLY attach once using flag
    if (!quickViewListenersAttached) {
        quickViewListenersAttached = true;
        
        document.getElementById('quickViewDecrease')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const qty = document.getElementById('quickViewQty');
            let val = parseInt(qty.value) || 1;
            if (val > 1) qty.value = val - 1;
        });
        
        document.getElementById('quickViewIncrease')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const qty = document.getElementById('quickViewQty');
            let val = parseInt(qty.value) || 1;
            if (val < 10) qty.value = val + 1;
        });
        
        document.getElementById('quickViewAddToCart')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.currentTarget;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const id = btn.dataset.id || 'qv-' + Date.now();
            const qty = parseInt(document.getElementById('quickViewQty')?.value) || 1;
            
            if (name && price && !isNaN(price)) {
                MewBrew.cart.add({
                    id: id,
                    name: name,
                    price: price,
                    category: 'shop',
                    quantity: qty
                });
                
                bootstrap.Modal.getInstance(document.getElementById('quickViewModal'))?.hide();
                cleanupModals();
            } else {
                showNotification('Error: Invalid product data', 'danger');
            }
        });
    }
    
    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
}

function proceedToCheckout() {
    if (MewBrew.cart.items.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    const modalEl = document.getElementById('checkoutModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    modalEl.addEventListener('hidden.bs.modal', cleanupModals, { once: true });
}

function placeOrder() {
    const form = document.getElementById('checkoutForm');
    const name = document.getElementById('checkoutName')?.value?.trim();
    const email = document.getElementById('checkoutEmail')?.value?.trim();
    const address = document.getElementById('checkoutAddress')?.value?.trim();
    
    if (!name) {
        showNotification('Please enter your name', 'warning');
        return;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email', 'warning');
        return;
    }
    
    if (!address) {
        showNotification('Please enter your address', 'warning');
        return;
    }
    
    const orderNum = 'MB-' + Date.now().toString().slice(-8);
    const subtotal = MewBrew.cart.getSubtotal();
    const points = Math.floor(subtotal / 10);
    
    document.getElementById('orderNumber').textContent = orderNum;
    document.getElementById('orderPoints').textContent = points;
    
    MewBrew.cart.clear();
    
    bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();
    cleanupModals();
    
    setTimeout(() => {
        const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        successModal.show();
        document.getElementById('orderSuccessModal').addEventListener('hidden.bs.modal', cleanupModals, { once: true });
    }, 300);
    
    form?.reset();
}

function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

function fixProductImages() {
    document.querySelectorAll('.product-img-container img, .product-img-small img, .card-img-top').forEach(img => {
        img.style.objectFit = 'contain';
        img.style.padding = '10px';
        img.style.backgroundColor = '#f8f9fa';
        
        if (!img.hasAttribute('onerror') || img.getAttribute('onerror').includes('http:')) {
            const altText = (img.alt || 'Product').split(' - ')[0];
            img.setAttribute('onerror', `this.src='https://via.placeholder.com/300x200/ffb74d/5d4037?text=${encodeURIComponent(altText)}'`);
        }
    });
    
    document.querySelectorAll('.product-img-container img').forEach(img => {
        img.style.height = '200px';
        img.style.width = '100%';
    });
    
    document.querySelectorAll('.product-img-small img').forEach(img => {
        img.style.height = '160px';
        img.style.width = '100%';
    });
}

function fixPriceDisplay() {
    document.querySelectorAll('.product-item').forEach(item => {
        const priceValue = item.dataset.price;
        if (!priceValue) return;
        
        const priceSpan = item.querySelector('.fw-bold.text-warning');
        if (priceSpan && !priceSpan.textContent.includes('₱')) {
            priceSpan.textContent = '₱' + priceValue;
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.addEventListener('beforeunload', cleanupModals);