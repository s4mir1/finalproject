

let habits = [];



document.addEventListener('DOMContentLoaded', function() {
    loadHabits();
    
  
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'tracker':
            initializeTrackerPage();
            break;
        case 'analytics':
            initializeAnalyticsPage();
            break;
        case 'contact':
            initializeContactPage();
            break;
        case 'about':
            initializeAboutPage();
            break;
    }
});

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === '' || page === 'index.html') return 'index';
    if (page === 'tracker.html') return 'tracker';
    if (page === 'analytics.html') return 'analytics';
    if (page === 'contact.html') return 'contact';
    if (page === 'about.html') return 'about';
    
    return 'index'; // default
}

function initializeHomePage() {
    console.log('Initializing Home Page...');
    updateHomeStats();
}

function updateHomeStats() {
    const totalHabitsEl = document.getElementById('total-habits');
    const totalCompletionsEl = document.getElementById('total-completions');
    const longestStreakEl = document.getElementById('longest-streak');
    
    if (totalHabitsEl) totalHabitsEl.textContent = habits.length;
    if (totalCompletionsEl) totalCompletionsEl.textContent = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
    if (longestStreakEl) longestStreakEl.textContent = Math.max(0, ...habits.map(habit => habit.streak));
}

function initializeTrackerPage() {
    console.log('Initializing Tracker Page...');
    renderHabits();
}

function addHabit() {
    const nameInput = document.getElementById('habit-name');
    const categorySelect = document.getElementById('habit-category');
    const errorDiv = document.getElementById('habit-error');
    
    if (!nameInput || !categorySelect) return;
    
    const name = nameInput.value.trim();
    const category = categorySelect.value;
    
    if (errorDiv) errorDiv.textContent = '';
    
    if (!name) {
        if (errorDiv) errorDiv.textContent = 'Please enter a habit name';
        return;
    }
    
    if (name.length < 3) {
        if (errorDiv) errorDiv.textContent = 'Habit name must be at least 3 characters long';
        return;
    }
    
    if (habits.some(habit => habit.name.toLowerCase() === name.toLowerCase())) {
        if (errorDiv) errorDiv.textContent = 'This habit already exists';
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: name,
        category: category,
        streak: 0,
        totalCompletions: 0,
        lastCompleted: null,
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    habits.push(newHabit);
    saveHabits();
    nameInput.value = '';
    renderHabits();
    
    if (errorDiv) {
        errorDiv.className = 'success';
        errorDiv.textContent = 'Habit added successfully!';
        setTimeout(() => {
            errorDiv.textContent = '';
            errorDiv.className = 'error';
        }, 3000);
    }
}

function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabits();
        
        if (getCurrentPage() === 'analytics') {
            renderAnalytics();
        }
    }
}

function renderHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #666; font-style: italic; grid-column: 1/-1; padding: 40px;">
                <h3>No habits yet!</h3>
                <p>Add your first habit above to start your journey.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = habits.map(habit => {
        const progressPercent = Math.min((habit.streak / 30) * 100, 100);
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habit.lastCompleted === today;
        
        return `
            <div class="habit-card">
                <div class="habit-header">
                    <div class="habit-name">${escapeHtml(habit.name)}</div>
                    <div class="habit-streak">${habit.streak} days</div>
                </div>
                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <small style="color: #666; margin-top: 5px; display: block;">
                        Progress: ${habit.streak}/30 days (${Math.round(progressPercent)}%)
                    </small>
                </div>
                <div style="margin-bottom: 15px;">
                    <span style="background: #e2e8f0; padding: 4px 12px; border-radius: 15px; font-size: 12px; color: #4a5568;">
                        ${habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                    </span>
                    <span style="background: #f0f4f8; padding: 4px 12px; border-radius: 15px; font-size: 12px; color: #4a5568; margin-left: 8px;">
                        Total: ${habit.totalCompletions}
                    </span>
                </div>
                <div class="habit-actions">
                    <button class="btn btn-small btn-success" onclick="markComplete(${habit.id})" 
                        ${completedToday ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                        ${completedToday ? '✓ Completed Today' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteHabit(${habit.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function markComplete(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (habit.lastCompleted === today) {
        alert('You already completed this habit today!');
        return;
    }
    
    habit.totalCompletions++;
    habit.lastCompleted = today;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (habit.streak === 0 || habit.lastCompleted === yesterdayStr) {
        habit.streak++;
    } else {
        const lastCompletedDate = new Date(habit.lastCompleted);
        const daysDiff = Math.floor((new Date(today) - lastCompletedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            habit.streak++;
        } else {
            habit.streak = 1;
        }
    }
    
    saveHabits();
    renderHabits();
    
    const button = document.querySelector(`button[onclick="markComplete(${habitId})"]`);
    if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Completed!';
        button.style.backgroundColor = '#38a169';
        setTimeout(() => {
            renderHabits();
        }, 1000);
    }
}

// about page
function initializeAboutPage() {
    console.log('Initializing About Page...');
}

// analytics page
function initializeAnalyticsPage() {
    console.log('Initializing Analytics Page...');
    renderAnalytics();
}

function renderAnalytics() {
    const tbody = document.getElementById('analytics-tbody');
    if (!tbody) return;
    
    let filteredHabits = [...habits];
    
   
    const filterSelect = document.getElementById('analytics-filter');
    const filterValue = filterSelect ? filterSelect.value : 'all';
    if (filterValue !== 'all') {
        filteredHabits = filteredHabits.filter(habit => habit.category === filterValue);
    }
    
    
    const sortSelect = document.getElementById('sort-analytics');
    const sortValue = sortSelect ? sortSelect.value : 'name';
    filteredHabits.sort((a, b) => {
        switch (sortValue) {
            case 'streak':
                return b.streak - a.streak;
            case 'completions':
                return b.totalCompletions - a.totalCompletions;
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    if (filteredHabits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666; font-style: italic; padding: 40px;">No habits to display</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredHabits.map(habit => `
        <tr>
            <td>${escapeHtml(habit.name)}</td>
            <td style="text-transform: capitalize;">${habit.category}</td>
            <td>
                <span style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                    ${habit.streak} days
                </span>
            </td>
            <td>${habit.totalCompletions}</td>
            <td>${formatDate(habit.createdDate)}</td>
        </tr>
    `).join('');
}

function filterAnalytics() {
    renderAnalytics();
}

function sortAnalytics() {
    renderAnalytics();
}

function initializeContactPage() {
    console.log('Initializing Contact Page...');
    setupContactForm();
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value.trim();
        
        // Clear previous errors
        document.querySelectorAll('.error').forEach(error => error.textContent = '');
        
        let isValid = true;
        
        // Validation
        if (!name || name.length < 2) {
            const nameError = document.getElementById('name-error');
            if (nameError) {
                nameError.textContent = 'Please enter a valid name (at least 2 characters)';
                isValid = false;
            }
        }
        
        if (!email || !isValidEmail(email)) {
            const emailError = document.getElementById('email-error');
            if (emailError) {
                emailError.textContent = 'Please enter a valid email address';
                isValid = false;
            }
        }
        
        if (!subject) {
            const subjectError = document.getElementById('subject-error');
            if (subjectError) {
                subjectError.textContent = 'Please select a subject';
                isValid = false;
            }
        }
        
        if (!message || message.length < 10) {
            const messageError = document.getElementById('message-error');
            if (messageError) {
                messageError.textContent = 'Please enter a message (at least 10 characters)';
                isValid = false;
            }
        }
        
        if (isValid) {
            handleContactFormSubmission(name, email, subject, message);
        }
    });
}

function handleContactFormSubmission(name, email, subject, message) {
    // Simulate form submission
    const statusDiv = document.getElementById('form-status');
    if (statusDiv) {
        statusDiv.innerHTML = '<div class="success">✓ Thank you for your message! We\'ll get back to you soon.</div>';
    }
    
    // Reset form
    document.getElementById('contact-form').reset();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
        if (statusDiv) statusDiv.innerHTML = '';
    }, 5000);
    
    // Log form data (in real app, this would be sent to server)
    console.log('Contact Form Submitted:', { name, email, subject, message });
}

