document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerError = document.getElementById('registerError');
    const uidInput = document.getElementById('uid');

    // Generate a random UID as suggestion
    uidInput.value = 'U' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const uid = document.getElementById('uid').value.trim();
        const uname = document.getElementById('uname').value.trim();
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const role = document.getElementById('role').value;

        // Assign a random balance between 1000 and 10000 for demo purposes
        const balance = Math.floor(Math.random() * 9000) + 1000;

        const newUser = { uid, uname, password, email, phone, role, balance };

        // Get existing users
        const usersJSON = localStorage.getItem('users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];

        // Check for duplicates
        if (users.some(u => u.uname === uname)) {
            registerError.textContent = 'Username already exists.';
            registerError.style.display = 'block';
            return;
        }

        if (users.some(u => u.email === email)) {
            registerError.textContent = 'Email already registered.';
            registerError.style.display = 'block';
            return;
        }

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Redirect to login
        window.location.href = 'index.html';
    });
});
