document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('product-container');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // --- NUEVA FUNCIÓN PARA AGREGAR PRODUCTOS AL CARRITO ---
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} ha sido agregado al carrito.`);
    }
    // --------------------------------------------------------

    async function fetchProducts(category = null) {
        try {
            let url = 'http://127.0.0.1:5000/api/products';
            if (category && category !== 'all') {
                url = `http://127.0.0.1:5000/api/products/category/${category}`;
            }

            const response = await fetch(url);
            const products = await response.json();

            // Llama a la función actualizada para mostrar los productos
            displayProducts(products);

        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productContainer.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
        }
    }

    // --- FUNCIÓN CORREGIDA PARA MOSTRAR PRODUCTOS ---
    function displayProducts(products) {
        productContainer.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // --- CAMBIO CLAVE: Usa el primer elemento de la lista image_urls ---
            const imageUrl = product.image_urls && product.image_urls.length > 0 ?
                `http://127.0.0.1:5000${product.image_urls[0]}` :
                './uploads/placeholder.png';

            const phoneNumber = '5491161141506';
            const message = encodeURIComponent(`¡Hola! Estoy interesado en el producto "${product.name}". ¿Podrías darme más información?`);
            const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

            const stockText = product.stock > 0 ? `Stock: ${product.stock} unidades` : 'AGOTADO';
            const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
            const productLinkClass = product.stock > 0 ? '' : 'disabled';

            productCard.innerHTML = `
                <a href="product-detail.html?id=${product.id}" class="product-link ${productLinkClass}">
                    <img src="${imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p><strong>$${product.price}</strong></p>
                    <p class="${stockClass}">${stockText}</p>
                </a>
                ${product.stock > 0 ?
                `<button class="add-to-cart-btn">Agregar al Carrito</button>
                 <a href="${whatsappLink}" class="whatsapp-btn" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>`
                : ''}
            `;

            if (product.stock > 0) {
                const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                addToCartBtn.addEventListener('click', () => {
                    addToCart(product);
                });
            }
            productContainer.appendChild(productCard);
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            fetchProducts(category);
        });
    });

    fetchProducts();
});