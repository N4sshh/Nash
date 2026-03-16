// contact.js - CONTACT PAGE ONLY
// Include this ONLY on contact.html

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.contact-page')) return;
    
    initContact();
});

function initContact() {
    setupContactForm();
    setupFAQSearch();
    setupBusinessHours();
    setupCopyAddress();
    setupWhatsAppButtons();
    setupCharacterCounter();
}

function setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contact-name')?.value;
        const email = document.getElementById('contact-email')?.value;
        const subject = document.getElementById('contact-subject')?.value;
        const message = document.getElementById('contact-message')?.value;
        
        if (!name || !email || !subject || !message) {
            MewBrew.cart.showNotification('Please fill in all fields', 'warning');
            return;
        }
        
        if (!MewBrew.utils.isValidEmail(email)) {
            MewBrew.cart.showNotification('Invalid email address', 'warning');
            return;
        }
        
        // Simulate sending
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerHTML;
        
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
        }
        
        setTimeout(() => {
            MewBrew.cart.showNotification('Message sent successfully!', 'success');
            form.reset();
            
            if (submitBtn) {
                submitBtn.innerHTML = originalText || 'Send Message';
                submitBtn.disabled = false;
            }
            
            if (typeof bootstrap !== 'undefined') {
                new bootstrap.Modal(document.getElementById('successModal')).show();
            }
        }, 1500);
    });
}

function setupFAQSearch() {
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

function setupBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const isOpen = hour >= 10 && hour < 21;
    
    const statusEl = document.getElementById('open-status');
    if (statusEl) {
        statusEl.innerHTML = isOpen ? 
            '<span class="badge bg-success mb-2">● Open Now</span>' : 
            '<span class="badge bg-danger mb-2">● Closed</span>';
    }
    
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = now.getDay();
    
    days.forEach((d, index) => {
        const el = document.getElementById(d + '-status');
        if (el) {
            if (index === today) {
                el.className = isOpen ? 'badge bg-success' : 'badge bg-danger';
                el.textContent = isOpen ? 'Open Now' : 'Closed Now';
            } else {
                el.className = 'badge bg-success';
                el.textContent = 'Open';
            }
        }
    });
}

function setupCopyAddress() {
    const copyBtn = document.querySelector('.copy-address');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('123 Cat Street, Iloilo City, Philippines 5000');
            MewBrew.cart.showNotification('Address copied to clipboard!', 'success');
        });
    }
}

function setupWhatsAppButtons() {
    document.querySelectorAll('[data-whatsapp]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = btn.dataset.message || '';
            const url = `https://wa.me/639123456789?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    });
}

function setupCharacterCounter() {
    const message = document.getElementById('contact-message');
    const counter = document.getElementById('charCount');
    
    if (message && counter) {
        message.addEventListener('input', () => {
            counter.textContent = message.value.length + '/2000 characters';
        });
    }
}