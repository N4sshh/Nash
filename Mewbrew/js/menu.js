// menu.js - MENU PAGE ONLY

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.menu-page')) return;
    
    initMenu();
    document.addEventListener('cartUpdated', updateCartDisplay);
    updateCartDisplay();
});

function initMenu() {
    setupSearch();
    setupDietaryFilters();
    setupCategoryTabs();
    fixImages(); // Simple image fix
    setupAddToCartButtons();
    setupQuantityControls();
    setupCheckoutForm();
    setupTermsModal();
}

// Simple image fix - just contain, no backgrounds or padding
function fixImages() {
    document.querySelectorAll('.menu-item img').forEach(img => {
        img.style.height = '180px';
        img.style.width = '100%';
        img.style.objectFit = 'cover'; // Use cover to fill space properly
    });
}

function setupSearch() {
    const search = document.getElementById('menuSearch');
    if (!search) return;
    
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('.menu-item').forEach(item => {
            const parent = item.closest('.col-md-6, .col-lg-3');
            if (!parent) return;
            
            const name = item.querySelector('.h5')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('p.small')?.textContent.toLowerCase() || '';
            
            parent.style.display = (term === '' || name.includes(term) || desc.includes(term)) ? '' : 'none';
        });
    });
    
    document.getElementById('clearSearch')?.addEventListener('click', () => {
        search.value = '';
        search.dispatchEvent(new Event('input'));
    });
}

function setupDietaryFilters() {
    document.querySelectorAll('.filter-dietary').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const diet = e.currentTarget.dataset.diet;
            
            document.querySelectorAll('.filter-dietary').forEach(f => {
                f.classList.remove('active', 'bg-warning', 'text-dark');
                f.classList.add('bg-light', 'text-dark');
            });
            
            e.currentTarget.classList.add('active', 'bg-warning', 'text-dark');
            
            if (diet === 'all') {
                document.querySelectorAll('.menu-item').forEach(item => {
                    const parent = item.closest('.col-md-6, .col-lg-3');
                    if (parent) parent.style.display = '';
                });
                return;
            }
            
            document.querySelectorAll('.menu-item').forEach(item => {
                const parent = item.closest('.col-md-6, .col-lg-3');
                if (!parent) return;
                
                const icons = item.querySelectorAll('.badge.bg-light[title] i');
                let hasDiet = false;
                
                icons.forEach(icon => {
                    if (diet === 'vegan' && icon.classList.contains('fa-seedling')) hasDiet = true;
                    if (diet === 'gluten-free' && icon.classList.contains('fa-wheat-alt')) hasDiet = true;
                    if (diet === 'dairy-free' && icon.classList.contains('fa-cow')) hasDiet = true;
                    if (diet === 'hot' && icon.classList.contains('fa-fire')) hasDiet = true;
                    if (diet === 'cold' && icon.classList.contains('fa-snowflake')) hasDiet = true;
                });
                
                parent.style.display = hasDiet ? '' : 'none';
            });
        });
    });
}

function setupCategoryTabs() {
    // Get all items from All Items tab
    const allItems = document.querySelectorAll('#all-items .menu-item');
    
    // Map items by category
    const coffeeItems = [];
    const pastryItems = [];
    const nonCoffeeItems = [];
    
    allItems.forEach(item => {
        const category = item.querySelector('.add-to-cart-btn')?.dataset.category;
        if (category === 'coffee') coffeeItems.push(item);
        else if (category === 'pastry') pastryItems.push(item);
        else if (category === 'non-coffee') nonCoffeeItems.push(item);
    });
    
    // Function to populate a tab
    const populateTab = (tabId, items) => {
        const container = document.querySelector(`${tabId} .row`);
        if (!container) return;
        
        container.innerHTML = '';
        items.forEach(item => {
            // Clone the entire column, not just the card
            const col = item.closest('.col-md-6, .col-lg-3');
            if (col) {
                const clone = col.cloneNode(true);
                container.appendChild(clone);
            }
        });
    };
    
    // Populate tabs when they're shown
    document.querySelectorAll('#menuTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target');
            
            if (targetId === '#coffee') {
                populateTab('#coffee', coffeeItems);
            } else if (targetId === '#pastries') {
                populateTab('#pastries', pastryItems);
            } else if (targetId === '#non-coffee') {
                populateTab('#non-coffee', nonCoffeeItems);
            }
            
            // Re-attach event listeners to new buttons
            setupAddToCartButtons();
            fixImages();
        });
    });
}

function setupAddToCartButtons() {
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
    
    MewBrew.cart.add({
        id: btn.dataset.id || 'menu-' + Date.now(),
        name: btn.dataset.name || card?.querySelector('.h5')?.textContent || 'Menu Item',
        price: parseFloat(btn.dataset.price) || 0,
        category: btn.dataset.category || 'menu',
        quantity: qtyInput ? parseInt(qtyInput.value) : 1
    });
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

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItems) return;
    
    const items = MewBrew.cart.items;
    const subtotal = MewBrew.cart.getSubtotal();
    
    if (items.length === 0) {
        cartItems.innerHTML = '<div class="text-center py-5"><i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i><p class="text-muted">Your cart is empty</p></div>';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let cartHtml = '';
    items.forEach(item => {
        cartHtml += `
            <div class="cart-item mb-3 pb-3 border-bottom" data-id="${item.id}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">₱${item.price} each</small>
                    </div>
                    <span class="fw-bold">₱${item.price * item.quantity}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button class="btn btn-outline-warning qty-minus" type="button">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" max="10">
                        <button class="btn btn-outline-warning qty-plus" type="button">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-item"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHtml;
    
    // Add event listeners
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
    
    cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            const id = item?.dataset.id;
            if (id) MewBrew.cart.remove(id);
        });
    });
    
    // Update totals
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;
    
    document.getElementById('cart-subtotal').textContent = '₱' + subtotal;
    document.getElementById('cart-service-fee').textContent = '₱' + serviceFee.toFixed(2);
    document.getElementById('cart-total').textContent = '₱' + total.toFixed(2);
    document.getElementById('points-earned').textContent = Math.floor(subtotal / 10);
    
    const progress = Math.min((subtotal / 500) * 100, 100);
    document.getElementById('drink-progress-bar').style.width = progress + '%';
    document.getElementById('drink-progress-text').textContent = `₱${subtotal}/₱500`;
    
    if (cartSummary) cartSummary.style.display = 'block';
}

function setupCheckoutForm() {
    document.querySelector('.checkout-btn')?.addEventListener('click', proceedToCheckout);
}

function proceedToCheckout() {
    if (MewBrew.cart.items.length === 0) {
        MewBrew.cart.showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
    
    // Update modal
    const modalCart = document.getElementById('modal-cart-items');
    if (modalCart) {
        modalCart.innerHTML = '';
        MewBrew.cart.items.forEach(item => {
            modalCart.innerHTML += `<div class="d-flex justify-content-between mb-2"><span>${item.quantity}x ${item.name}</span><span>₱${item.price * item.quantity}</span></div>`;
        });
        
        const subtotal = MewBrew.cart.getSubtotal();
        document.getElementById('modal-total').textContent = '₱' + (subtotal + subtotal * 0.05).toFixed(2);
    }
}

function placeOrder() {
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    const terms = document.getElementById('terms')?.checked;
    
    if (!name || !email || !phone || !terms) {
        MewBrew.cart.showNotification('Please fill all fields and agree to terms', 'warning');
        return;
    }
    
    if (!MewBrew.utils.isValidEmail(email)) {
        MewBrew.cart.showNotification('Invalid email', 'warning');
        return;
    }
    
    MewBrew.cart.showNotification('Order placed! Thank you!', 'success');
    MewBrew.cart.clear();
    bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();
    document.getElementById('orderForm')?.reset();
}

function setupTermsModal() {
    // Simple terms modal handler
    document.querySelectorAll('a[href="#"], a[data-bs-target="#termsModal"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if modal exists
            let termsModal = document.getElementById('termsModal');
            
            if (!termsModal) {
                // Create modal
                const modalHTML = `
                    <div class="modal fade" id="termsModal" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Terms and Conditions</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <p>By placing an order at MewBrew Café, you agree to:</p>
                                    <ul>
                                        <li>Your order will be prepared fresh and may take 10-15 minutes</li>
                                        <li>Cancellations must be made within 5 minutes of ordering</li>
                                        <li>Allergy information is available upon request</li>
                                        <li>Prices are subject to change without prior notice</li>
                                    </ul>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-warning" data-bs-dismiss="modal">I Understand</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                termsModal = document.getElementById('termsModal');
            }
            
            // Show modal
            const modal = new bootstrap.Modal(termsModal);
            modal.show();
            
            // Remove backdrop when modal is hidden
            termsModal.addEventListener('hidden.bs.modal', () => {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
            }, { once: true });
        });
    });
}

// Make functions global
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;