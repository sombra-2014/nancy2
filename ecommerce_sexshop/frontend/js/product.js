document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const productNameElem = document.getElementById('product-name');
    const productDescElem = document.getElementById('product-description');
    const productPriceElem = document.getElementById('product-price');
    const mainImageElem = document.getElementById('main-product-image');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const productTitleElem = document.getElementById('product-title');

    async function fetchProductDetails() {
        if (!productId) {
            productNameElem.textContent = 'Producto no encontrado.';
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }
            const product = await response.json();
            
            productTitleElem.textContent = product.name;
            productNameElem.textContent = product.name;
            productDescElem.textContent = product.description;
            productPriceElem.textContent = product.price.toFixed(2);

            // Cargar la imagen principal
            if (product.image_url) {
                mainImageElem.src = `http://127.0.0.1:5000${product.image_url}`;
            }

            addToCartBtn.setAttribute('data-id', product.id);
            addToCartBtn.setAttribute('data-name', product.name);
            addToCartBtn.setAttribute('data-price', product.price);

            addToCartBtn.addEventListener('click', addToCart);

        } catch (error) {
            console.error('Error al cargar los detalles del producto:', error);
            productNameElem.textContent = 'Error al cargar el producto.';
        }
    }

    function addToCart(event) {
        const productId = event.target.dataset.id;
        const productName = event.target.dataset.name;
        const productPrice = parseFloat(event.target.dataset.price);

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        };

        const existingProduct = cart.find(item => item.id === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${productName} ha sido añadido al carrito.`);
    }

    fetchProductDetails();
});