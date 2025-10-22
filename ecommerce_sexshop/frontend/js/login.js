document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.is_admin) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('isAdmin', 'true');
                    window.location.href = 'admin.html';
                } else {
                    messageDiv.textContent = 'Credenciales inválidas para acceso de administrador.';
                }
            } else {
                const errorData = await response.json();
                messageDiv.textContent = errorData.error;
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'Ocurrió un error al intentar iniciar sesión.';
        }
    });
});