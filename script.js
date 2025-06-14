

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
