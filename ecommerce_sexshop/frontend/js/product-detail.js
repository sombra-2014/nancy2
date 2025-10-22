document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    async function fetchProductDetail() {
        try {
            if (!productId) {
                productDetailContainer.innerHTML = '<p>Producto no encontrado.</p>';
                return;
            }

            const response = await fetch(`http://127.0.0.1:5000/api/products/${productId}`);
            const product = await response.json();

            if (product) {
                const imageUrls = product.image_urls.map(url => `http://127.0.0.1:5000${url}`);
                const defaultImage = './uploads/placeholder.png';
                const mainImage = imageUrls.length > 0 ? imageUrls[0] : defaultImage;

                const galleryHtml = imageUrls.map(url => `
                    <div class="gallery-item">
                        <img src="${url}" alt="${product.name}">
                    </div>
                `).join('');

                const productHtml = `
                    <div class="product-info-wrapper">
                        <div class="product-gallery">
                            <img src="${mainImage}" alt="${product.name}" class="main-image">
                            <div class="thumbnail-container">
                                ${imageUrls.map(url => `<img src="${url}" alt="Thumbnail" class="thumbnail-image">`).join('')}
                            </div>
                        </div>
                        <div class="product-details">
                            <h2>${product.name}</h2>
                            <p class="product-price">$${product.price}</p>
                            <p class="product-description">${product.description}</p>
                            <p class="stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.stock > 0 ? `Stock: ${product.stock} unidades` : 'AGOTADO'}
                            </p>
                            ${product.stock > 0 ? `
                                <button class="add-to-cart-btn" data-product-id="${product.id}">Agregar al Carrito</button>
                                <a href="https://wa.me/5491161141506?text=Hola! Me interesa el producto ${product.name}." class="whatsapp-btn" target="_blank">Consultar por WhatsApp</a>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                productDetailContainer.innerHTML = productHtml;

                // Lógica para cambiar la imagen principal al hacer clic en las miniaturas
                const mainImageEl = document.querySelector('.main-image');
                const thumbnails = document.querySelectorAll('.thumbnail-image');
                thumbnails.forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        mainImageEl.src = thumb.src;
                    });
                });

                // Lógica para agregar al carrito
                const addToCartBtn = document.querySelector('.add-to-cart-btn');
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', () => {
                        addToCart(product);
                    });
                }

            } else {
                productDetailContainer.innerHTML = '<p>Producto no encontrado.</p>';
            }

        } catch (error) {
            console.error('Error al cargar los detalles del producto:', error);
            productDetailContainer.innerHTML = '<p>Error al cargar el producto. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }

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
                image: product.image_urls && product.image_urls.length > 0 ? `http://127.0.0.1:5000${product.image_urls[0]}` : null
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} ha sido agregado al carrito.`);
    }

    fetchProductDetail();
});