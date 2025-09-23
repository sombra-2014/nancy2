document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    async function handleAuth(event, endpoint) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok && endpoint === 'login') {
                localStorage.setItem('userToken', result.token);
                if (result.is_admin) {
                    localStorage.setItem('isAdmin', 'true');
                } else {
                    localStorage.removeItem('isAdmin');
                }
                window.location.href = 'index.html';
            }
            
        } catch (error) {
            console.error(`Error en la solicitud ${endpoint}:`, error);
            alert(`Hubo un error al ${endpoint === 'login' ? 'iniciar sesión' : 'registrar el usuario'}.`);
        }
    }

    loginBtn.addEventListener('click', (event) => handleAuth(event, 'login'));
    registerBtn.addEventListener('click', (event) => handleAuth(event, 'register'));
});