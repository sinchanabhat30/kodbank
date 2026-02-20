document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // redirect if already logged in (optional, but good for UX)
    if(localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const uname = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        
        // Fetch users from localStorage
        const usersJSON = localStorage.getItem('users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        
        // Find user
        const user = users.find(u => u.uname === uname && u.password === pass);
        
        if (user) {
            // Success
            loginError.style.display = 'none';
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            // Error
            loginError.textContent = 'Invalid username or password.';
            loginError.style.display = 'block';
        }
    });
});
