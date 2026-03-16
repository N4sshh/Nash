// events.js - EVENTS PAGE ONLY

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.events-page')) return;
    
    initEvents();
});

function initEvents() {
    setupSearch();
    setupEventToggle();
    setupPriceFilter(); // Fixed this function
    setupCategoryTabs();
    setupRegistration();
    setupEventDetails();
    setupReminders();
    setupCountdowns();
    setupCopyLinks();
    
    // Clean up any stuck modals
    cleanupModals();
}

function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

function setupSearch() {
    const search = document.getElementById('eventSearch');
    if (!search) return;
    
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('.event-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? '' : 'none';
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

function setupEventToggle() {
    const upcoming = document.getElementById('upcomingEvents');
    const past = document.getElementById('pastEvents');
    const upcomingSection = document.getElementById('upcoming-section');
    const pastSection = document.getElementById('past-section');
    
    if (!upcoming || !past || !upcomingSection || !pastSection) return;
    
    upcoming.addEventListener('change', () => {
        upcomingSection.style.display = 'block';
        pastSection.style.display = 'none';
    });
    
    past.addEventListener('change', () => {
        upcomingSection.style.display = 'none';
        pastSection.style.display = 'block';
    });
}

// FIXED: Price filter now actually works
function setupPriceFilter() {
    const priceFilters = document.querySelectorAll('input[name="priceFilter"]');
    
    priceFilters.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            
            document.querySelectorAll('.event-item').forEach(item => {
                const priceAttr = item.dataset.price;
                
                // Convert price to number for comparison
                let priceValue;
                if (priceAttr === 'free') {
                    priceValue = 0;
                } else {
                    priceValue = parseInt(priceAttr) || 999999; // Default high value if not set
                }
                
                let shouldShow = true;
                
                switch(filterValue) {
                    case 'all':
                        shouldShow = true;
                        break;
                    case 'free':
                        shouldShow = (priceValue === 0);
                        break;
                    case 'under100':
                        shouldShow = (priceValue > 0 && priceValue < 100);
                        break;
                    case '100to200':
                        shouldShow = (priceValue >= 100 && priceValue <= 200);
                        break;
                    case 'over200':
                        shouldShow = (priceValue > 200);
                        break;
                    default:
                        shouldShow = true;
                }
                
                item.style.display = shouldShow ? '' : 'none';
            });
        });
    });
}

function setupCategoryTabs() {
    // All Events tab
    const allTab = document.getElementById('all-events-tab');
    if (allTab) {
        allTab.addEventListener('shown.bs.tab', () => {
            filterEventsByType('all');
        });
    }
    
    // Adoption tab
    const adoptionTab = document.getElementById('adoption-events-tab');
    if (adoptionTab) {
        adoptionTab.addEventListener('shown.bs.tab', () => {
            filterEventsByType('adoption');
        });
    }
    
    // Games tab
    const gamesTab = document.getElementById('games-events-tab');
    if (gamesTab) {
        gamesTab.addEventListener('shown.bs.tab', () => {
            filterEventsByType('games');
        });
    }
    
    // Workshops tab
    const workshopsTab = document.getElementById('workshops-events-tab');
    if (workshopsTab) {
        workshopsTab.addEventListener('shown.bs.tab', () => {
            filterEventsByType('workshops');
        });
    }
    
    // Yoga tab
    const yogaTab = document.getElementById('yoga-events-tab');
    if (yogaTab) {
        yogaTab.addEventListener('shown.bs.tab', () => {
            filterEventsByType('yoga');
        });
    }
}

function filterEventsByType(type) {
    const containers = {
        'adoption': document.getElementById('adoption-events-container'),
        'games': document.getElementById('games-events-container'),
        'workshops': document.getElementById('workshops-events-container'),
        'yoga': document.getElementById('yoga-events-container')
    };
    
    if (type === 'all') return;
    
    const container = containers[type];
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Filter existing events by type
    const allEvents = document.querySelectorAll('#all-events .event-item');
    let found = false;
    
    allEvents.forEach(event => {
        if (event.dataset.type === type) {
            const clone = event.cloneNode(true);
            container.appendChild(clone);
            found = true;
        }
    });
    
    if (!found) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                <h5>No ${type} events found</h5>
                <p class="text-muted">Check back later for upcoming events!</p>
            </div>
        `;
    }
    
    // Reattach event listeners
    setupRegistration();
    setupEventDetails();
    setupReminders();
    setupCopyLinks();
    setupCountdowns();
}

function setupRegistration() {
    // Set event name in modal
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventName = btn.dataset.event || 
                btn.closest('.card-body')?.querySelector('h4')?.textContent;
            
            const eventInput = document.getElementById('eventName');
            const modalTitle = document.querySelector('#registrationModal .modal-title');
            
            if (eventInput) eventInput.value = eventName || 'Event';
            if (modalTitle) modalTitle.textContent = `Register for ${eventName || 'Event'}`;
        });
    });
    
    // Handle registration confirmation
    const confirmBtn = document.getElementById('confirmRegistration');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const name = document.getElementById('regName')?.value;
            const email = document.getElementById('regEmail')?.value;
            const phone = document.getElementById('regPhone')?.value;
            const eventName = document.getElementById('eventName')?.value;
            
            if (!name || !email || !phone) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Invalid email address', 'warning');
                return;
            }
            
            // Close registration modal
            if (typeof bootstrap !== 'undefined') {
                bootstrap.Modal.getInstance(document.getElementById('registrationModal'))?.hide();
                cleanupModals();
            }
            
            // Show success
            const successContent = document.getElementById('registrationSuccessContent');
            if (successContent) {
                successContent.innerHTML = `
                    <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                    <h5 class="mb-3">Registration Successful!</h5>
                    <p class="mb-2">You've registered for:</p>
                    <p class="fw-bold">${eventName || 'Event'}</p>
                    <p class="small text-muted">A confirmation email will be sent to ${email}</p>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-warning" onclick="addToCalendar('${eventName}')">
                            <i class="fas fa-calendar-plus me-1"></i>Add to Calendar
                        </button>
                    </div>
                `;
            }
            
            if (typeof bootstrap !== 'undefined') {
                const successModal = new bootstrap.Modal(document.getElementById('registrationSuccessModal'));
                successModal.show();
                
                document.getElementById('registrationSuccessModal').addEventListener('hidden.bs.modal', function() {
                    cleanupModals();
                }, { once: true });
            }
            
            // Clear form
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPhone').value = '';
        });
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type) {
    if (window.MewBrew) {
        MewBrew.cart.showNotification(message, type);
    } else {
        alert(message);
    }
}

function setupEventDetails() {
    document.querySelectorAll('[data-bs-target="#eventDetailsModal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const eventType = btn.dataset.event;
            const content = document.getElementById('eventDetailsContent');
            
            if (!content) return;
            
            // Event details based on type
            const details = {
                'adoption': `
                    <h6>Cat Adoption Day</h6>
                    <p><strong>Date:</strong> March 15, 2026</p>
                    <p><strong>Time:</strong> 11:00 AM - 4:00 PM</p>
                    <p><strong>Location:</strong> Cat Lounge</p>
                    <p><strong>Host:</strong> PAWS Philippines</p>
                    <p><strong>Price:</strong> Free</p>
                    <p><strong>Description:</strong> Meet local rescue organizations and potentially adopt a new furry friend! Several cats from our café will also be available for adoption. All cats are vaccinated and ready for their forever homes.</p>
                    <p><strong>What to bring:</strong> Valid ID, proof of address, and lots of love!</p>
                `,
                'chess': `
                    <h6>Beginner's Chess Workshop</h6>
                    <p><strong>Date:</strong> March 22, 2026</p>
                    <p><strong>Time:</strong> 2:00 PM - 4:00 PM</p>
                    <p><strong>Location:</strong> Workshop Area</p>
                    <p><strong>Host:</strong> Nash Eicker Datiles</p>
                    <p><strong>Price:</strong> ₱50</p>
                    <p><strong>Description:</strong> Learn the basics of chess from a local instructor. Perfect for beginners. Includes coffee or tea.</p>
                    <p><strong>Includes:</strong> Chess board rental, coffee/tea, handouts</p>
                `,
                'yoga': `
                    <h6>Cat Yoga Session</h6>
                    <p><strong>Date:</strong> April 10, 2026</p>
                    <p><strong>Time:</strong> 9:00 AM - 10:30 AM</p>
                    <p><strong>Location:</strong> Cat Lounge</p>
                    <p><strong>Host:</strong> Naya Faye Barbero</p>
                    <p><strong>Price:</strong> ₱300</p>
                    <p><strong>Description:</strong> Gentle yoga surrounded by our friendly cats. Includes 60-minute session, yoga mat rental, and a healthy smoothie.</p>
                    <p><strong>What to bring:</strong> Comfortable clothes, water bottle</p>
                `,
                'gamenight': `
                    <h6>Friday Game Night</h6>
                    <p><strong>Date:</strong> April 2, 2026</p>
                    <p><strong>Time:</strong> 6:00 PM - 9:00 PM</p>
                    <p><strong>Location:</strong> Game Room</p>
                    <p><strong>Host:</strong> Rian Mae Jino-o</p>
                    <p><strong>Price:</strong> Free</p>
                    <p><strong>Description:</strong> Our weekly game night! Bring friends or make new ones while playing from our board game collection. Special drink discounts for participants.</p>
                    <p><strong>Games available:</strong> Over 50 board games to choose from!</p>
                `,
                'workshops': `
                    <h6>Cat Care Workshop</h6>
                    <p><strong>Date:</strong> April 5, 2026</p>
                    <p><strong>Time:</strong> 3:00 PM - 5:00 PM</p>
                    <p><strong>Location:</strong> Workshop Area</p>
                    <p><strong>Host:</strong> Joel Dionson Jr</p>
                    <p><strong>Price:</strong> ₱100</p>
                    <p><strong>Description:</strong> Learn about cat behavior, health, and how to provide the best care for your feline friends. Great for new cat owners!</p>
                    <p><strong>What to learn:</strong> Cat nutrition, behavior tips, health basics</p>
                `
            };
            
            content.innerHTML = details[eventType] || '<p>Event details coming soon!</p>';
            
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
                modal.show();
                
                document.getElementById('eventDetailsModal').addEventListener('hidden.bs.modal', function() {
                    cleanupModals();
                }, { once: true });
            }
        });
    });
}

function setupReminders() {
    document.querySelectorAll('.reminder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventName = btn.dataset.event;
            showNotification(`Reminder set for ${eventName}!`, 'success');
        });
    });
}

function setupCountdowns() {
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

function setupCopyLinks() {
    document.querySelectorAll('.copy-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const link = btn.dataset.link;
            navigator.clipboard.writeText(window.location.origin + '/' + link);
            showNotification('Link copied to clipboard!', 'success');
        });
    });
}

// Make functions globally available
window.addToCalendar = function(eventName) {
    if (typeof bootstrap !== 'undefined') {
        const calendarModal = new bootstrap.Modal(document.getElementById('calendarModal'));
        calendarModal.show();
        
        document.getElementById('calendarModal').addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        }, { once: true });
    }
};

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    cleanupModals();
});