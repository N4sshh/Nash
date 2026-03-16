// cats.js - CATS PAGE ONLY

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.cats-page')) return;
    
    initCats();
});

// Cat data with proper dates (newest first)
const catsData = [
    { 
        id: 'xia-ming', 
        name: 'Xia Ming', 
        age: '9 months', 
        ageMonths: 9,
        arrivalDate: '2026-02-15', // Newest - arrived Feb 2026
        color: 'Tilapya', 
        personality: 'Shy & Friendly',
        traits: ['shy', 'curious', 'quiet', 'friendly'],
        status: 'available', 
        visits: 15,
        description: 'Xia Ming rarely meows and is always curious about everything. Though shy at first, she warms up quickly.',
        image: 'Xian_Ming.jpg'
    },
    { 
        id: 'ying-yang', 
        name: 'Ying Yang', 
        age: '9 months', 
        ageMonths: 9,
        arrivalDate: '2026-02-10', // Arrived Feb 2026
        color: 'Black & White', 
        personality: 'Energetic',
        traits: ['energetic', 'alert', 'curious'],
        status: 'available', 
        visits: 22,
        description: 'Ying Yang loves to watch people gossip and is always curious about anything happening around.',
        image: 'Ying_Yang.jpg'
    },
    { 
        id: 'mini', 
        name: 'Mini', 
        age: '9 months', 
        ageMonths: 9,
        arrivalDate: '2026-01-20', // Arrived Jan 2026
        color: 'Calico', 
        personality: 'Playful & Energetic',
        traits: ['playful', 'energetic', 'kneader', 'cuddly'],
        status: 'available', 
        visits: 19,
        description: 'Mini is famous for her bread-making skills! She loves to knead on soft blankets and pillows.',
        image: 'mini.jpg'
    },
    { 
        id: 'tangol', 
        name: 'Tangol', 
        age: '1 year', 
        ageMonths: 12,
        arrivalDate: '2025-12-01', // Oldest - arrived Dec 2025
        color: 'Orange & White', 
        personality: 'Playful & Loud',
        traits: ['playful', 'loud', 'energetic'],
        status: 'available', 
        visits: 28,
        description: 'Tangol loves to roll around and bite stuff! He\'s a playful and loud cat who keeps everyone entertained with his antics.',
        image: 'tangol.jpg'
    }
];

function initCats() {
    setupSearch();
    setupPersonalityFilter();
    setupSort();
    setupFavoriteButtons();
    setupFeaturedCatFavorite();
    setupCatDetails();
    setupAdoptionModal();
    setupFeaturedCatAdoption();
    setupTabs();
    loadFavoriteStates();
    fixFeaturedCatImage();
    
    // Clean up any stuck modals on page load
    cleanupModals();
}

// Clean up any stuck modals
function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

function fixFeaturedCatImage() {
    const featuredImg = document.querySelector('#featuredCatCarousel img');
    if (featuredImg) {
        featuredImg.style.height = '250px';
        featuredImg.style.width = '100%';
        featuredImg.style.objectFit = 'cover';
        
        featuredImg.onerror = function() {
            this.src = 'https://ui-avatars.com/api/?name=Mini&background=ffb74d&color=fff&size=250';
        };
    }
}

function setupFeaturedCatFavorite() {
    const favoriteBtn = document.querySelector('#featuredCatCarousel .favorite-btn');
    if (!favoriteBtn) return;
    
    favoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const catId = 'mini';
        const icon = favoriteBtn.querySelector('i');
        
        if (!icon) return;
        
        let favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
        
        if (favorites.includes(catId)) {
            favorites = favorites.filter(id => id !== catId);
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
            favoriteBtn.classList.remove('active');
            showNotification('Mini removed from favorites', 'info');
        } else {
            favorites.push(catId);
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#dc3545';
            favoriteBtn.classList.add('active');
            showNotification('Mini added to favorites!', 'success');
        }
        
        localStorage.setItem('catFavorites', JSON.stringify(favorites));
        updateFavoritesTab();
    });
    
    const favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
    const icon = favoriteBtn.querySelector('i');
    if (favorites.includes('mini') && icon) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#dc3545';
        favoriteBtn.classList.add('active');
    }
}

function setupFeaturedCatAdoption() {
    const adoptBtn = document.querySelector('#featuredCatCarousel .btn-warning[data-bs-target="#adoptionModal"]');
    if (!adoptBtn) return;
    
    adoptBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const selectedCatName = document.getElementById('selectedCatName');
        if (selectedCatName) {
            selectedCatName.textContent = 'Mini';
        }
        
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(document.getElementById('adoptionModal'));
            modal.show();
        }
    });
}

function setupSearch() {
    const search = document.getElementById('catSearch');
    if (!search) return;
    
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('.cat-card').forEach(card => {
            const col = card.closest('.col-md-6, .col-lg-3');
            if (!col) return;
            
            const name = card.querySelector('.h4')?.textContent.toLowerCase() || '';
            const personality = Array.from(card.querySelectorAll('.personality-tags .badge'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            
            if (term === '') {
                col.style.display = '';
            } else {
                col.style.display = (name.includes(term) || personality.includes(term)) ? '' : 'none';
            }
        });
    });
}

function setupPersonalityFilter() {
    const filter = document.getElementById('personalityFilter');
    if (!filter) return;
    
    filter.addEventListener('change', (e) => {
        const value = e.target.value.toLowerCase();
        
        document.querySelectorAll('.cat-card').forEach(card => {
            const col = card.closest('.col-md-6, .col-lg-3');
            if (!col) return;
            
            if (value === 'all') {
                col.style.display = '';
                return;
            }
            
            const personalityTags = Array.from(card.querySelectorAll('.personality-tags .badge'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            
            col.style.display = personalityTags.includes(value) ? '' : 'none';
        });
    });
}

function setupSort() {
    const sort = document.getElementById('sortFilter');
    if (!sort) return;
    
    sort.addEventListener('change', (e) => {
        const value = e.target.value;
        const container = document.getElementById('all-cats-container');
        if (!container) return;
        
        // Get all cards with their parent columns
        const cards = Array.from(document.querySelectorAll('#all-cats .cat-card'));
        const cardData = cards.map(card => {
            const catId = card.dataset.catId;
            const cat = catsData.find(c => c.id === catId);
            return { card, cat, col: card.closest('.col-md-6, .col-lg-3') };
        }).filter(item => item.col); // Only keep those with columns
        
        // Sort based on selected option
        cardData.sort((a, b) => {
            if (value === 'name') {
                const nameA = a.cat?.name || '';
                const nameB = b.cat?.name || '';
                return nameA.localeCompare(nameB);
            } 
            else if (value === 'age') {
                // Sort by age (youngest first)
                const ageA = a.cat?.ageMonths || 0;
                const ageB = b.cat?.ageMonths || 0;
                return ageA - ageB; // Ascending = youngest first
            }
            else if (value === 'newest') {
                // Sort by arrival date (newest first)
                const dateA = a.cat?.arrivalDate || '2000-01-01';
                const dateB = b.cat?.arrivalDate || '2000-01-01';
                return dateB.localeCompare(dateA); // Descending = newest first
            }
            return 0;
        });
        
        // Reorder the DOM
        container.innerHTML = '';
        cardData.forEach(item => {
            if (item.col) {
                container.appendChild(item.col);
            }
        });
        
        // Reattach event listeners
        setupFavoriteButtons();
        loadFavoriteStates();
    });
}

function setupFavoriteButtons() {
    document.querySelectorAll('.favorite-toggle, .favorite-btn:not(#featuredCatCarousel .favorite-btn)').forEach(btn => {
        btn.removeAttribute('onclick');
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = btn.closest('.cat-card');
            const catId = card?.dataset.catId;
            
            if (!catId) return;
            
            const icon = btn.querySelector('i');
            if (!icon) return;
            
            let favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
            
            if (favorites.includes(catId)) {
                favorites = favorites.filter(id => id !== catId);
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                btn.classList.remove('active');
                showNotification(`${getCatName(catId)} removed from favorites`, 'info');
            } else {
                favorites.push(catId);
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#dc3545';
                btn.classList.add('active');
                showNotification(`${getCatName(catId)} added to favorites!`, 'success');
            }
            
            localStorage.setItem('catFavorites', JSON.stringify(favorites));
            updateFavoritesTab();
        });
    });
}

function getCatName(catId) {
    const cat = catsData.find(c => c.id === catId);
    return cat ? cat.name : 'Cat';
}

function showNotification(message, type) {
    if (window.MewBrew) {
        MewBrew.cart.showNotification(message, type);
    } else {
        const notif = document.createElement('div');
        notif.className = `position-fixed top-0 end-0 m-3 p-3 bg-${type} text-white rounded shadow-lg`;
        notif.style.zIndex = '9999';
        notif.style.minWidth = '300px';
        notif.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
}

function loadFavoriteStates() {
    const favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
    
    document.querySelectorAll('.cat-card .favorite-toggle').forEach(btn => {
        const card = btn.closest('.cat-card');
        const catId = card?.dataset.catId;
        const icon = btn.querySelector('i');
        
        if (catId && icon) {
            if (favorites.includes(catId)) {
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
    
    const featuredFavoriteBtn = document.querySelector('#featuredCatCarousel .favorite-btn');
    if (featuredFavoriteBtn) {
        const icon = featuredFavoriteBtn.querySelector('i');
        if (favorites.includes('mini') && icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#dc3545';
            featuredFavoriteBtn.classList.add('active');
        } else if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '';
            featuredFavoriteBtn.classList.remove('active');
        }
    }
}

function setupCatDetails() {
    document.querySelectorAll('.view-details, [data-bs-target="#catDetailsModal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const catId = btn.getAttribute('data-cat-id') || 
                         btn.closest('.cat-card')?.dataset.catId;
            
            if (!catId) return;
            
            const cat = catsData.find(c => c.id === catId);
            if (!cat) return;
            
            const modalLabel = document.getElementById('catDetailsModalLabel');
            const modalContent = document.getElementById('catDetailsContent');
            const adoptBtn = document.getElementById('adoptFromDetailsBtn');
            
            if (modalLabel) modalLabel.textContent = cat.name;
            if (adoptBtn) {
                adoptBtn.setAttribute('data-cat-id', catId);
                adoptBtn.setAttribute('data-cat-name', cat.name);
            }
            
            if (modalContent) {
                modalContent.innerHTML = `
                    <div class="text-center mb-4">
                        <img src="../img/cats/${cat.image}" class="img-fluid rounded" style="max-height: 200px; width: 100%; object-fit: contain;" alt="${cat.name}" onerror="this.src='https://ui-avatars.com/api/?name=${cat.name}&background=ffb74d&color=fff&size=200'">
                    </div>
                    <div class="mb-3">
                        <p><strong>Age:</strong> ${cat.age}</p>
                        <p><strong>Color:</strong> ${cat.color}</p>
                        <p><strong>Personality:</strong> ${cat.personality}</p>
                        <p><strong>Visits this month:</strong> ${cat.visits}</p>
                        <p><strong>Arrived:</strong> ${new Date(cat.arrivalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <p>${cat.description}</p>
                `;
            }
            
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(document.getElementById('catDetailsModal'));
                modal.show();
            }
        });
    });
    
    const detailsModal = document.getElementById('catDetailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        });
    }
}

function setupAdoptionModal() {
    document.querySelectorAll('[data-bs-target="#adoptionModal"], .btn-warning:has(.fa-paw)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let catName = btn.getAttribute('data-cat-name');
            
            if (!catName) {
                const card = btn.closest('.cat-card');
                if (card) {
                    catName = card.querySelector('.h4')?.textContent;
                }
            }
            
            if (!catName) {
                catName = 'this cat';
            }
            
            const selectedCatName = document.getElementById('selectedCatName');
            if (selectedCatName) {
                selectedCatName.textContent = catName;
            }
            
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(document.getElementById('adoptionModal'));
                modal.show();
            }
        });
    });
    
    const continueBtn = document.querySelector('#adoptionModal .btn-warning');
    if (continueBtn) {
        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const adoptionModal = bootstrap.Modal.getInstance(document.getElementById('adoptionModal'));
            if (adoptionModal) adoptionModal.hide();
            
            cleanupModals();
            
            setTimeout(() => {
                const formSection = document.querySelector('.form-section');
                if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth' });
                    
                    setTimeout(() => {
                        document.getElementById('name')?.focus();
                    }, 500);
                }
            }, 300);
        });
    }
    
    const adoptFromDetailsBtn = document.getElementById('adoptFromDetailsBtn');
    if (adoptFromDetailsBtn) {
        adoptFromDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const catName = adoptFromDetailsBtn.getAttribute('data-cat-name') || 'this cat';
            
            const detailsModal = bootstrap.Modal.getInstance(document.getElementById('catDetailsModal'));
            if (detailsModal) detailsModal.hide();
            
            cleanupModals();
            
            setTimeout(() => {
                const selectedCatName = document.getElementById('selectedCatName');
                if (selectedCatName) {
                    selectedCatName.textContent = catName;
                }
                
                const adoptionModal = new bootstrap.Modal(document.getElementById('adoptionModal'));
                adoptionModal.show();
            }, 300);
        });
    }
    
    const adoptionModal = document.getElementById('adoptionModal');
    if (adoptionModal) {
        adoptionModal.addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        });
    }
}

function setupTabs() {
    const availableTab = document.getElementById('available-cats-tab');
    if (availableTab) {
        availableTab.addEventListener('shown.bs.tab', () => {
            updateAvailableTab();
        });
    }
    
    const favoritesTab = document.getElementById('favorite-cats-tab');
    if (favoritesTab) {
        favoritesTab.addEventListener('shown.bs.tab', () => {
            updateFavoritesTab();
        });
    }
}

function updateAvailableTab() {
    const container = document.getElementById('available-cats-container');
    if (!container) return;
    
    const availableCats = document.querySelectorAll('#all-cats .cat-card[data-status="available"]');
    
    if (availableCats.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-check-circle fa-4x text-muted mb-3"></i><h5>No available cats</h5><p class="text-muted">Check back soon!</p></div>';
        return;
    }
    
    container.innerHTML = '';
    availableCats.forEach(cat => {
        const col = cat.closest('.col-md-6, .col-lg-3');
        if (col) {
            const clone = col.cloneNode(true);
            container.appendChild(clone);
        }
    });
    
    setupFavoriteButtons();
    setupCatDetails();
    setupAdoptionModal();
    loadFavoriteStates();
}

function updateFavoritesTab() {
    const container = document.getElementById('favorite-cats-container');
    if (!container) return;
    
    const favorites = JSON.parse(localStorage.getItem('catFavorites') || '[]');
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><i class="fas fa-heart fa-4x text-muted mb-3"></i><h5>No favorite cats yet</h5><p class="text-muted">Click the heart icon on any cat to add them here!</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    const allCats = document.querySelectorAll('#all-cats .cat-card');
    
    favorites.forEach(catId => {
        allCats.forEach(cat => {
            if (cat.dataset.catId === catId) {
                const col = cat.closest('.col-md-6, .col-lg-3');
                if (col) {
                    const clone = col.cloneNode(true);
                    container.appendChild(clone);
                }
            }
        });
    });
    
    setupFavoriteButtons();
    setupCatDetails();
    setupAdoptionModal();
    loadFavoriteStates();
}

// Make functions available globally
window.toggleFavorite = (catId, btn) => {
    const button = typeof btn === 'string' ? document.querySelector(`[onclick*="${catId}"]`) : btn;
    if (button) {
        const event = new Event('click');
        button.dispatchEvent(event);
    }
};

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    cleanupModals();
});