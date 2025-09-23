document.addEventListener('DOMContentLoaded', () => {
    function getHeaderHtml(isLoggedIn) {
        let navLinks = '';
        if (isLoggedIn) {
            navLinks = `
                <li><a href="index.html" class="nav-link"><i class="fas fa-store"></i> Ver Tienda</a></li>
                <li><a href="admin.html" class="nav-link"><i class="fas fa-user-cog"></i> Administrar</a></li>
                <li><a href="orders.html" class="nav-link"><i class="fas fa-box-open"></i> Pedidos</a></li>
                <li><button id="logout-btn" class="nav-link"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button></li>
            `;
        } else {
            navLinks = `
                <li><a href="index.html" class="nav-link"><i class="fas fa-store"></i> Inicio</a></li>
                <li><a href="cart.html" class="nav-link"><i class="fas fa-shopping-cart"></i> Carrito</a></li>
                <li><a href="login.html" class="nav-link"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</a></li>
            `;
        }
    
        return `
            <header>
                <div class="header-content">
                    <div class="logo-title-container">
                        <h1 class="logo-title">
                            <i class="fas fa-heart"></i>El suspiro del Deseo... <i class="fas fa-heart"></i>
                        </h1>
                    </div>
                    
                    <div class="header-nav">
                        <nav>
                            <ul>
                                ${navLinks}
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>
        `;
    }

    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = getHeaderHtml(isLoggedIn);
    }
    
    // Asocia el evento de logout si el botón existe
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });
    }
});