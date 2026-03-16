// booking.js - BOOKING PAGE ONLY

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.booking-page')) return;
    
    initBooking();
});

function initBooking() {
    setupDatePicker();
    setupGuestCounter();
    setupCategorySelect();
    setupTimeSlots();
    setupAddons();
    setupSpecialOccasion();
    setupGiftBooking();
    setupBookingForm();
    updateBookingSummary();
    
    // Clean up any stuck modals
    cleanupModals();
}

function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

function setupDatePicker() {
    const dateInput = document.getElementById('datepicker');
    if (!dateInput) return;
    
    // Check if dark mode is active
    const isDarkMode = document.body.classList.contains('dark-theme');
    
    if (typeof flatpickr !== 'undefined') {
        // Configure flatpickr with dark mode support
        flatpickr(dateInput, {
            minDate: 'today',
            dateFormat: 'F j, Y',
            disable: [
                function(date) {
                    // Disable Sundays
                    return date.getDay() === 0;
                }
            ],
            onChange: (dates, dateStr) => {
                const summaryDate = document.getElementById('summary-date');
                if (summaryDate) summaryDate.textContent = dateStr;
                updateBookingSummary();
                
                // Update peak hours alert based on day of week
                if (dates[0]) {
                    const day = dates[0].getDay();
                    const peakAlert = document.getElementById('peakHoursAlert');
                    if (peakAlert) {
                        peakAlert.style.display = (day === 5 || day === 6) ? 'block' : 'none';
                    }
                }
            },
            // Flatpickr theme based on dark mode
            theme: isDarkMode ? 'dark' : 'default'
        });
        
        // Fix flatpickr input styling for dark mode
        if (isDarkMode) {
            dateInput.style.backgroundColor = '#2d2d2d';
            dateInput.style.color = '#ffffff';
            dateInput.style.borderColor = '#404040';
        }
    }
    
    // Add manual styling for the flatpickr calendar in dark mode
    addFlatpickrDarkModeStyles();
}

// Add custom dark mode styles for flatpickr
function addFlatpickrDarkModeStyles() {
    // Check if styles already exist
    if (document.getElementById('flatpickr-dark-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'flatpickr-dark-styles';
    style.textContent = `
        /* Dark mode for flatpickr */
        .dark-theme .flatpickr-calendar {
            background: #2d2d2d !important;
            border-color: #404040 !important;
            box-shadow: 0 3px 13px rgba(0,0,0,0.5) !important;
        }
        
        .dark-theme .flatpickr-months .flatpickr-month {
            background: #2d2d2d !important;
            color: #ffffff !important;
            fill: #ffffff !important;
        }
        
        .dark-theme .flatpickr-months .flatpickr-prev-month,
        .dark-theme .flatpickr-months .flatpickr-next-month {
            color: #ffffff !important;
            fill: #ffffff !important;
        }
        
        .dark-theme .flatpickr-months .flatpickr-prev-month:hover svg,
        .dark-theme .flatpickr-months .flatpickr-next-month:hover svg {
            fill: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-current-month .flatpickr-monthDropdown-months {
            background: #2d2d2d !important;
            color: #ffffff !important;
            border-color: #404040 !important;
        }
        
        .dark-theme .flatpickr-current-month .flatpickr-monthDropdown-months option {
            background: #2d2d2d !important;
            color: #ffffff !important;
        }
        
        .dark-theme .flatpickr-weekdays {
            background: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-weekday {
            background: #2d2d2d !important;
            color: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-days {
            background: #2d2d2d !important;
            border-color: #404040 !important;
        }
        
        .dark-theme .dayContainer {
            background: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-day {
            color: #ffffff !important;
            background: #2d2d2d !important;
            border-color: #404040 !important;
        }
        
        .dark-theme .flatpickr-day:hover {
            background: #404040 !important;
            color: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-day.today {
            border-color: #ffb74d !important;
            color: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-day.today:hover {
            background: #ffb74d !important;
            color: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-day.selected {
            background: #ffb74d !important;
            color: #2d2d2d !important;
            border-color: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-day.disabled {
            color: #666666 !important;
            background: #2d2d2d !important;
            border-color: #404040 !important;
        }
        
        .dark-theme .flatpickr-day.prevMonthDay,
        .dark-theme .flatpickr-day.nextMonthDay {
            color: #666666 !important;
            background: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-time {
            background: #2d2d2d !important;
            border-color: #404040 !important;
        }
        
        .dark-theme .flatpickr-time input {
            color: #ffffff !important;
            background: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-time .flatpickr-am-pm {
            color: #ffffff !important;
            background: #2d2d2d !important;
        }
        
        .dark-theme .flatpickr-time .flatpickr-am-pm:hover {
            background: #404040 !important;
            color: #ffb74d !important;
        }
        
        .dark-theme .flatpickr-time .numInputWrapper span.arrowUp,
        .dark-theme .flatpickr-time .numInputWrapper span.arrowDown {
            color: #ffffff !important;
        }
        
        /* Input field styling */
        .dark-theme #datepicker {
            background-color: #2d2d2d !important;
            color: #ffffff !important;
            border-color: #404040 !important;
        }
        
        .dark-theme #datepicker::placeholder {
            color: #999999 !important;
        }
        
        .dark-theme .input-group-text {
            background-color: #2d2d2d !important;
            color: #ffb74d !important;
            border-color: #404040 !important;
        }
    `;
    
    document.head.appendChild(style);
}

function setupGuestCounter() {
    const guests = document.getElementById('guests');
    if (!guests) return;
    
    const decreaseBtn = document.getElementById('decrease');
    const increaseBtn = document.getElementById('increase');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(guests.value) || 1;
            if (val > 1) {
                guests.value = val - 1;
                guests.dispatchEvent(new Event('input'));
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let val = parseInt(guests.value) || 1;
            if (val < 10) {
                guests.value = val + 1;
                guests.dispatchEvent(new Event('input'));
            }
        });
    }
    
    guests.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) || 1;
        if (val < 1) e.target.value = 1;
        if (val > 10) e.target.value = 10;
        
        const summaryGuests = document.getElementById('summary-guests');
        if (summaryGuests) summaryGuests.textContent = e.target.value;
        
        updateGroupDiscount(parseInt(e.target.value));
        updateBookingSummary();
    });
}

function updateGroupDiscount(guests) {
    const msg = document.getElementById('groupDiscountMsg');
    const progress = document.getElementById('discountProgressBar');
    const needed = document.getElementById('neededForDiscount');
    
    if (!msg || !progress || !needed) return;
    
    if (guests >= 5) {
        msg.style.display = 'block';
        progress.style.width = '100%';
        needed.textContent = '0';
    } else {
        msg.style.display = 'none';
        progress.style.width = (guests / 5 * 100) + '%';
        needed.textContent = 5 - guests;
    }
}

function setupCategorySelect() {
    const category = document.getElementById('category');
    if (!category) return;
    
    category.addEventListener('change', () => {
        updateBookingSummary();
        
        const rate = getRate(category.value);
        const summaryRate = document.getElementById('summary-rate');
        if (summaryRate) summaryRate.textContent = '₱' + rate;
    });
}

function getRate(category) {
    const prices = { standard: 200, student: 150, group: 170 };
    return prices[category] || 200;
}

function setupTimeSlots() {
    const timeRadios = document.querySelectorAll('input[name="time"]');
    const summaryTime = document.getElementById('summary-time');
    const waitlistCard = document.getElementById('waitlistCard');
    
    const timeMap = {
        '10:00': '10:00 AM', '11:00': '11:00 AM', '12:00': '12:00 PM',
        '13:00': '1:00 PM', '14:00': '2:00 PM', '15:00': '3:00 PM',
        '16:00': '4:00 PM', '17:00': '5:00 PM', '18:00': '6:00 PM',
        '19:00': '7:00 PM', '20:00': '8:00 PM'
    };
    
    timeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (summaryTime) {
                summaryTime.textContent = timeMap[e.target.value] || e.target.value;
            }
            
            if (waitlistCard) {
                waitlistCard.style.display = e.target.value === '14:00' ? 'block' : 'none';
            }
        });
    });
}

function setupAddons() {
    const addons = ['addonPastry', 'addonDrinks', 'addonToy'];
    
    addons.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateBookingSummary);
        }
    });
}

function setupSpecialOccasion() {
    const birthday = document.getElementById('birthday');
    const anniversary = document.getElementById('anniversary');
    const msg = document.getElementById('specialOccasionMsg');
    
    if (!birthday || !anniversary || !msg) return;
    
    [birthday, anniversary].forEach(cb => {
        cb.addEventListener('change', () => {
            msg.style.display = (birthday.checked || anniversary.checked) ? 'block' : 'none';
        });
    });
}

function setupGiftBooking() {
    const gift = document.getElementById('giftBooking');
    const field = document.getElementById('giftMessageField');
    
    if (gift && field) {
        gift.addEventListener('change', () => {
            field.style.display = gift.checked ? 'block' : 'none';
        });
    }
}

function updateBookingSummary() {
    const guests = parseInt(document.getElementById('guests')?.value || 1);
    const category = document.getElementById('category')?.value || 'standard';
    const rate = getRate(category);
    
    const rateEl = document.getElementById('summary-rate');
    const totalEl = document.getElementById('summary-total');
    const addonsEl = document.getElementById('summary-addons');
    
    if (rateEl) rateEl.textContent = '₱' + rate;
    
    let addons = 0;
    if (document.getElementById('addonPastry')?.checked) addons += 150;
    if (document.getElementById('addonDrinks')?.checked) addons += 200;
    if (document.getElementById('addonToy')?.checked) addons += 100;
    
    if (addonsEl) addonsEl.textContent = '₱' + addons;
    
    const total = (guests * rate) + addons;
    if (totalEl) totalEl.textContent = '₱' + total;
}

function setupBookingForm() {
    const form = document.querySelector('.needs-validation');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateBooking()) return;
        
        processBooking();
    });
}

function validateBooking() {
    const name = document.getElementById('fullname')?.value;
    const email = document.getElementById('email')?.value;
    const date = document.getElementById('datepicker')?.value;
    const time = document.querySelector('input[name="time"]:checked');
    const guests = document.getElementById('guests')?.value;
    const category = document.getElementById('category')?.value;
    
    if (!name || !email || !date || !time || !guests || !category) {
        showNotification('Please fill in all required fields', 'warning');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Invalid email address', 'warning');
        return false;
    }
    
    return true;
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

function processBooking() {
    const submitBtn = document.querySelector('.needs-validation button[type="submit"]');
    const originalText = submitBtn?.innerHTML;
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitBtn.disabled = true;
    }
    
    setTimeout(() => {
        const bookingId = 'BOOK-' + Date.now().toString().slice(-8);
        
        const booking = {
            id: bookingId,
            name: document.getElementById('fullname')?.value,
            email: document.getElementById('email')?.value,
            date: document.getElementById('datepicker')?.value,
            time: document.querySelector('input[name="time"]:checked')?.value,
            guests: parseInt(document.getElementById('guests')?.value),
            category: document.getElementById('category')?.value,
            addons: calculateAddons(),
            total: calculateTotal(),
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('mewbrew_bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('mewbrew_bookings', JSON.stringify(bookings));
        
        showNotification(`Booking confirmed! ID: ${bookingId}`, 'success');
        
        const preview = document.getElementById('confirmationPreview');
        if (preview) {
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth' });
            
            const previewEmail = document.getElementById('preview-email');
            if (previewEmail) previewEmail.textContent = booking.email;
        }
        
        // Show gift voucher if checked
        if (document.getElementById('giftBooking')?.checked) {
            showGiftVoucher(booking.name);
        }
        
        if (submitBtn) {
            submitBtn.innerHTML = originalText || 'Confirm Booking';
            submitBtn.disabled = false;
        }
    }, 1500);
}

function calculateAddons() {
    let total = 0;
    if (document.getElementById('addonPastry')?.checked) total += 150;
    if (document.getElementById('addonDrinks')?.checked) total += 200;
    if (document.getElementById('addonToy')?.checked) total += 100;
    return total;
}

function calculateTotal() {
    const guests = parseInt(document.getElementById('guests')?.value || 1);
    const category = document.getElementById('category')?.value || 'standard';
    return (guests * getRate(category)) + calculateAddons();
}

function showGiftVoucher(recipient) {
    const msg = document.getElementById('giftMessage')?.value || 'Enjoy your visit!';
    
    const recipientEl = document.getElementById('giftRecipient');
    const msgEl = document.getElementById('giftDisplayMessage');
    
    if (recipientEl) recipientEl.textContent = recipient || 'Friend';
    if (msgEl) msgEl.textContent = msg;
    
    if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(document.getElementById('giftVoucherModal'));
        modal.show();
        
        // Clean up modal backdrop when hidden
        document.getElementById('giftVoucherModal')?.addEventListener('hidden.bs.modal', function() {
            cleanupModals();
        }, { once: true });
    }
}

// Make sure flatpickr theme updates when dark mode toggles
document.addEventListener('darkModeToggled', function(e) {
    const dateInput = document.getElementById('datepicker');
    if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.set('theme', e.detail.isDark ? 'dark' : 'default');
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    cleanupModals();
});