document.addEventListener('DOMContentLoaded', () => {
    const currentUserJSON = localStorage.getItem('currentUser');

    // Redirect to login if no active user
    if (!currentUserJSON) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(currentUserJSON);

    // Set UI elements
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.uname}`;

    const checkBalanceBtn = document.getElementById('checkBalanceBtn');
    const balanceCard = document.getElementById('balanceCard');
    const balanceDisplay = document.getElementById('balanceDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    checkBalanceBtn.addEventListener('click', () => {
        // Fetch up-to-date user info (balance) from users array just in case
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUser = users.find(u => u.uname === currentUser.uname) || currentUser;

        const balance = updatedUser.balance || 0;

        // Format balance as currency
        balanceDisplay.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(balance);

        // Hide button, show card
        checkBalanceBtn.style.display = 'none';
        balanceCard.classList.add('reveal');

        // Party popper animation using canvas-confetti
        triggerConfetti();
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});

function triggerConfetti() {
    var duration = 3000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
    }, 250);
}
