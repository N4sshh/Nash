// shop.js - SHOP PAGE ONLY

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.shop-page')) return;
    
    initShop();
    
    // Listen for cart updates
    document.addEventListener('cartUpdated', updateCartDisplay);
    updateCartDisplay();
});

function initShop() {
    setupSearch();
    setupPriceFilter();
    setupSort();
    setupWishlist();
    setupQuickView();
    setupQuantityControls();
    setupAddToCart();
    setupCategoryTabs();
    setupRecentlyViewed();
    setupCartIcon();
    fixProductImages();
    
    // Populate category containers
    populateCategoryContainers();
}

// Fix product images
function fixProductImages() {
    document.querySelectorAll('.product-img-container img, .product-img-small img, .card-img-top').forEach(img => {
        img.style.height = '200px';
        img.style.width = '100%';
        img.style.objectFit = 'contain';
        img.style.padding = '10px';
        img.style.backgroundColor = '#f8f9fa';
        
        // Add error handling
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300x200/ffb74d/ffffff?text=' + 
                      (this.alt || 'Product').replace(/ /g, '+');
            this.style.objectFit = 'contain';
        };
    });
    
    // Fix small images
    document.querySelectorAll('.product-img-small img').forEach(img => {
        img.style.height = '160px';
    });
}

// Populate category containers with products
function populateCategoryContainers() {
    const apparelContainer = document.getElementById('apparel-container') || document.querySelector('#apparel-products .row');
    const homeContainer = document.getElementById('home-container') || document.querySelector('#home-products .row');
    const accessoriesContainer = document.getElementById('accessories-container') || document.querySelector('#accessories-products .row');
    
    if (!apparelContainer || !homeContainer || !accessoriesContainer) return;
    
    // Clear containers
    apparelContainer.innerHTML = '';
    homeContainer.innerHTML = '';
    accessoriesContainer.innerHTML = '';
    
    // Get all product items from the main view only
    const allProducts = document.querySelectorAll('#all-products .product-item');
    
    allProducts.forEach(product => {
        const category = product.dataset.category;
        
        if (category === 'apparel') {
            const clone = product.cloneNode(true);
            apparelContainer.appendChild(clone);
        } else if (category === 'home') {
            const clone = product.cloneNode(true);
            homeContainer.appendChild(clone);
        } else if (category === 'accessories') {
            const clone = product.cloneNode(true);
            accessoriesContainer.appendChild(clone);
        }
    });
    
    // If any container is empty, show message
    if (apparelContainer.children.length === 0) {
        apparelContainer.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-tshirt fa-4x text-muted mb-3"></i><h5>No apparel items</h5><p class="text-muted">Check back soon!</p></div>';
    }
    
    if (homeContainer.children.length === 0) {
        homeContainer.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-home fa-4x text-muted mb-3"></i><h5>No home items</h5><p class="text-muted">Check back soon!</p></div>';
    }
    
    if (accessoriesContainer.children.length === 0) {
        accessoriesContainer.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-key fa-4x text-muted mb-3"></i><h5>No accessories</h5><p class="text-muted">Check back soon!</p></div>';
    }
    
    // Reattach event listeners to cloned items
    setupWishlist();
    setupQuickView();
    setupAddToCart();
    fixProductImages();
}

// Ensure cart icon is clickable
function setupCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.cursor = 'pointer';
        // Remove old onclick and add new event listener
        cartIcon.removeAttribute('onclick');
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof bootstrap !== 'undefined') {
                const offcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
                offcanvas.show();
            }
        });
    }
}

function setupSearch() {
    const search = document.getElementById('productSearch');
    if (!search) return;
    
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        // Only search in main products, not category tabs
        document.querySelectorAll('#all-products .product-item').forEach(item => {
            const name = item.dataset.name?.toLowerCase() || '';
            const category = item.dataset.category?.toLowerCase() || '';
            item.style.display = (term === '' || name.includes(term) || category.includes(term)) ? '' : 'none';
        });
    });
    
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            search.value = '';
            search.dispatchEvent(new Event('input'));
        });
    }
}

function setupPriceFilter() {
    document.querySelectorAll('input[name="priceFilter"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const filter = e.target.id;
            
            // Only filter main products
            document.querySelectorAll('#all-products .product-item').forEach(item => {
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

function setupSort() {
    const sort = document.getElementById('sortProducts');
    if (!sort) return;
    
    sort.addEventListener('change', (e) => {
        const value = e.target.value;
        
        if (value === 'default') return;
        
        // Get containers
        const featuredContainer = document.getElementById('featured-products');
        const allProductsGrid = document.getElementById('all-products-grid');
        
        if (!featuredContainer || !allProductsGrid) return;
        
        // Get all products from their current containers
        const featuredProducts = Array.from(featuredContainer.children);
        const regularProducts = Array.from(allProductsGrid.children);
        
        // Combine all products
        const allProducts = [...featuredProducts, ...regularProducts];
        
        // Sort products
        allProducts.sort((a, b) => {
            const priceA = parseInt(a.dataset.price);
            const priceB = parseInt(b.dataset.price);
            
            if (value === 'price-low') return priceA - priceB;
            if (value === 'price-high') return priceB - priceA;
            return 0;
        });
        
        // Clear containers (but don't remove elements from DOM yet)
        featuredContainer.innerHTML = '';
        allProductsGrid.innerHTML = '';
        
        // Separate featured and regular products by ID
        const featuredIds = ['mug', 'tshirt', 'bag'];
        
        allProducts.forEach(product => {
            // Get product ID from various possible attributes
            const id = product.dataset.id || 
                      product.querySelector('.add-to-cart-btn')?.dataset.id ||
                      product.querySelector('.wishlist-btn')?.dataset.product;
            
            if (featuredIds.includes(id)) {
                featuredContainer.appendChild(product);
            } else {
                allProductsGrid.appendChild(product);
            }
        });
        
        // Reattach event listeners
        setupWishlist();
        setupQuickView();
        setupAddToCart();
        fixProductImages();
    });
}

function setupWishlist() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        // Remove old onclick
        btn.removeAttribute('onclick');
        
        // Remove old event listeners and add new one
        btn.removeEventListener('click', handleWishlist);
        btn.addEventListener('click', handleWishlist);
    });
    
    // Load wishlist states
    loadWishlistStates();
}

function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const productId = btn.dataset.product || 
                     btn.closest('.product-item')?.dataset.id ||
                     btn.closest('.card')?.querySelector('.add-to-cart-btn')?.dataset.id;
    const icon = btn.querySelector('i');
    
    if (!productId || !icon) return;
    
    let wishlist = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
    
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';
        btn.classList.remove('active');
        showNotification('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#dc3545';
        btn.classList.add('active');
        showNotification('Added to wishlist!', 'success');
    }
    
    localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
}

function loadWishlistStates() {
    const wishlist = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.dataset.product || 
                         btn.closest('.product-item')?.dataset.id ||
                         btn.closest('.card')?.querySelector('.add-to-cart-btn')?.dataset.id;
        const icon = btn.querySelector('i');
        
        if (productId && icon) {
            if (wishlist.includes(productId)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#dc3545';
                btn.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                btn.classList.remove('active');
            }
        }
    });
}

function showNotification(message, type) {
    if (window.MewBrew) {
        MewBrew.cart.showNotification(message, type);
    } else {
        alert(message);
    }
}

function setupQuickView() {
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.removeEventListener('click', handleQuickView);
        btn.addEventListener('click', handleQuickView);
    });
}

function handleQuickView(e) {
    e.preventDefault();
    
    const btn = e.currentTarget;
    const productId = btn.dataset.product;
    const card = btn.closest('.card');
    
    if (!card) return;
    
    // Get product details from the card
    const img = card.querySelector('img')?.src;
    const name = card.querySelector('.card-title, h5, h6')?.textContent;
    const priceElement = card.querySelector('.badge.bg-warning');
    let price = '0';
    
    if (priceElement) {
        const priceText = priceElement.textContent;
        const match = priceText.match(/₱(\d+)/);
        if (match) price = match[1];
    }
    
    const desc = card.querySelector('p.small')?.textContent;
    
    // Populate modal
    document.getElementById('quickViewImage').src = img || '';
    document.getElementById('quickViewName').textContent = name || '';
    document.getElementById('quickViewPrice').textContent = '₱' + price;
    document.getElementById('quickViewDescription').textContent = desc || 'No description available';
    document.getElementById('quickViewQty').value = '1';
    
    // Store product data for add to cart
    const addBtn = document.getElementById('quickViewAddToCart');
    addBtn.dataset.name = name;
    addBtn.dataset.price = price;
    addBtn.dataset.id = productId;
    
    // Show modal
    if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        modal.show();
        
        document.getElementById('quickViewModal').addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        }, { once: true });
    }
}

function setupQuantityControls() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.qty-minus')) {
            const container = e.target.closest('.input-group');
            const input = container?.querySelector('input[type="number"]');
            if (input) {
                let val = parseInt(input.value) || 1;
                if (val > 1) input.value = val - 1;
            }
        }
        
        if (e.target.closest('.qty-plus')) {
            const container = e.target.closest('.input-group');
            const input = container?.querySelector('input[type="number"]');
            if (input) {
                let val = parseInt(input.value) || 1;
                if (val < 10) input.value = val + 1;
            }
        }
    });
}

function setupAddToCart() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    e.preventDefault();
    
    const btn = e.currentTarget;
    const card = btn.closest('.card');
    const qtyInput = card?.querySelector('input[type="number"]');
    
    // Get price from badge if not in data attribute
    let price = parseFloat(btn.dataset.price);
    if (!price) {
        const priceElement = card?.querySelector('.badge.bg-warning');
        if (priceElement) {
            const priceText = priceElement.textContent;
            const match = priceText.match(/₱(\d+)/);
            if (match) price = parseFloat(match[1]);
        }
    }
    
    const item = {
        id: btn.dataset.id || 'product-' + Date.now(),
        name: btn.dataset.name || card?.querySelector('.card-title, h5, h6')?.textContent || 'Product',
        price: price || 0,
        category: btn.dataset.category || 'shop',
        quantity: qtyInput ? parseInt(qtyInput.value) : 1
    };
    
    if (item.price > 0) {
        MewBrew.cart.add(item);
        
        // Track recently viewed
        trackRecentlyViewed(item.name, item.price, card?.querySelector('img')?.src);
    }
}

function trackRecentlyViewed(name, price, img) {
    const viewed = JSON.parse(localStorage.getItem('shop_recently_viewed') || '[]');
    const newItem = { name, price, img, timestamp: Date.now() };
    
    const existing = viewed.findIndex(v => v.name === name);
    if (existing !== -1) viewed.splice(existing, 1);
    viewed.unshift(newItem);
    
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
                    <img src="${item.img || '../img/products/placeholder.jpg'}" class="card-img-top" alt="${item.name}" style="height: 80px; object-fit: contain; background: #f8f9fa; padding: 5px;" onerror="this.src='https://via.placeholder.com/80x80/ffb74d/ffffff?text=${item.name.charAt(0)}'">
                </div>
                <div class="card-body p-2 text-center">
                    <small class="fw-bold">${item.name}</small>
                    <small class="text-warning d-block">₱${item.price}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function setupCategoryTabs() {
    document.querySelectorAll('#productTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');
            
            // Fix images when tab changes
            setTimeout(() => {
                fixProductImages();
            }, 100);
        });
    });
}

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
                <p class="text-muted">Your cart is empty</p>
                <p class="small text-muted">Add some items from our shop!</p>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let cartHtml = '';
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartHtml += `
            <div class="cart-item mb-3 pb-3 border-bottom" data-id="${item.id}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">₱${item.price} each</small>
                    </div>
                    <span class="fw-bold">₱${itemTotal}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button class="btn btn-outline-warning qty-minus" type="button">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" max="10" style="height: 31px;">
                        <button class="btn btn-outline-warning qty-plus" type="button">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHtml;
    
    // Attach event listeners
    cartItems.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            if (id && input) {
                let val = parseInt(input.value) - 1;
                if (val >= 1) MewBrew.cart.updateQuantity(id, val);
                else MewBrew.cart.remove(id);
            }
        });
    });
    
    cartItems.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            const input = item?.querySelector('input');
            if (id && input) {
                let val = parseInt(input.value) + 1;
                if (val <= 10) MewBrew.cart.updateQuantity(id, val);
            }
        });
    });
    
    cartItems.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            if (id) MewBrew.cart.updateQuantity(id, e.target.value);
        });
    });
    
    cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            if (id) MewBrew.cart.remove(id);
        });
    });
    
    // Update summary
    const shipping = subtotal >= 1000 ? 0 : 100;
    const total = subtotal + shipping;
    const points = Math.floor(subtotal / 10);
    
    document.getElementById('cart-subtotal').textContent = '₱' + subtotal;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Free' : '₱' + shipping;
    document.getElementById('cart-total').textContent = '₱' + total;
    document.getElementById('points-earned').textContent = points;
    
    const progress = Math.min((subtotal / 1000) * 100, 100);
    document.getElementById('shipping-progress-bar').style.width = progress + '%';
    document.getElementById('shipping-progress-text').textContent = `₱${subtotal}/₱1000`;
    
    if (cartSummary) cartSummary.style.display = 'block';
}

function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Quick view modal controls
document.getElementById('quickViewDecrease')?.addEventListener('click', () => {
    const qty = document.getElementById('quickViewQty');
    let val = parseInt(qty.value);
    if (val > 1) qty.value = val - 1;
});

document.getElementById('quickViewIncrease')?.addEventListener('click', () => {
    const qty = document.getElementById('quickViewQty');
    let val = parseInt(qty.value);
    if (val < 10) qty.value = val + 1;
});

document.getElementById('quickViewAddToCart')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const id = btn.dataset.id || 'product-' + Date.now();
    const qty = parseInt(document.getElementById('quickViewQty')?.value || '1');
    
    if (name && price) {
        MewBrew.cart.add({
            id: id,
            name: name,
            price: price,
            category: 'shop',
            quantity: qty
        });
        
        if (typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getInstance(document.getElementById('quickViewModal'))?.hide();
            cleanupModals();
        }
    }
});

// Apply discount code
document.getElementById('applyDiscount')?.addEventListener('click', () => {
    const code = document.getElementById('discountCode')?.value;
    if (code === 'MEW10') {
        showNotification('Discount applied! 10% off', 'success');
    } else {
        showNotification('Invalid discount code', 'warning');
    }
});

// Checkout functions
window.proceedToCheckout = function() {
    if (MewBrew.cart.items.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        modal.show();
        
        document.getElementById('checkoutModal').addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        }, { once: true });
    }
};

window.placeOrder = function() {
    const name = document.getElementById('checkoutName')?.value;
    const email = document.getElementById('checkoutEmail')?.value;
    const address = document.getElementById('checkoutAddress')?.value;
    
    if (!name || !email || !address) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Invalid email address', 'warning');
        return;
    }
    
    const orderNum = 'MB-' + Date.now().toString().slice(-8);
    const subtotal = MewBrew.cart.getSubtotal();
    const points = Math.floor(subtotal / 10);
    
    document.getElementById('orderNumber').textContent = orderNum;
    document.getElementById('orderPoints').textContent = points;
    
    MewBrew.cart.clear();
    
    if (typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();
        cleanupModals();
        
        setTimeout(() => {
            const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
            successModal.show();
            
            document.getElementById('orderSuccessModal').addEventListener('hidden.bs.modal', function() {
                cleanupModals();
            }, { once: true });
        }, 300);
    }
};

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    cleanupModals();
});