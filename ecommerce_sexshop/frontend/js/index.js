document.addEventListener('DOMContentLoaded', async () => {
    // URL base de tu API
    const API_URL = 'http://127.0.0.1:5000/api';

    // Función para obtener productos desde el backend
    async function getProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            document.getElementById('product-list').innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
        }
    }

    // Función para renderizar los productos en la página
    function renderProducts(products) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <button class="add-to-cart-btn" data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}">
                    Añadir al Carrito
                </button>
            `;
            productList.appendChild(productCard);
        });
        attachAddToCartListeners();
    }

    // Función para adjuntar event listeners a los botones de "Añadir al Carrito"
    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                const productPrice = parseFloat(event.target.dataset.productPrice);
                const product = { id: parseInt(productId), name: productName, price: productPrice, quantity: 1 };
                addToCart(product);
            });
        });
    }

    // Función para añadir un producto al carrito en localStorage
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} agregado al carrito.`);
    }

    // Iniciar la carga de productos al cargar la página
    getProducts();
});