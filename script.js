

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
