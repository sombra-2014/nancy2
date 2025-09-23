// Función para obtener el carrito del localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Función para guardar el carrito en el localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para renderizar el carrito
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cart = getCart();
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
        document.getElementById('checkout-info').style.display = 'none';
        document.getElementById('cart-total-container').style.display = 'none';
        return;
    }
    
    document.getElementById('checkout-info').style.display = 'block';
    document.getElementById('cart-total-container').style.display = 'block';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <p class="item-price">$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item-btn" data-product-id="${item.id}">Eliminar</button>
        `;
        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Función para manejar la finalización de la compra
async function handleFinalizePurchase(event) {
    event.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const message = document.getElementById('message').value;

    const cart = getCart();

    const productsToSend = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
    }));

    try {
        const response = await fetch('http://127.0.0.1:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: customerName,
                customer_email: customerEmail,
                products: productsToSend,
                message: message
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        alert('Hubo un error al conectar con el servidor. Intenta de nuevo más tarde.');
    }
}

// Lógica para todos los eventos del carrito (eliminar, aumentar/disminuir)
document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFinalizePurchase);
    }
    
    // Usamos event delegation para manejar clics en elementos dinámicos
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const productId = parseInt(button.dataset.productId);
            let cart = getCart();
            const item = cart.find(i => i.id === productId);

            // Eliminar producto
            if (button.classList.contains('remove-item-btn')) {
                cart = cart.filter(i => i.id !== productId);
                saveCart(cart);
                renderCart();
            }
            
            // Aumentar cantidad
            if (button.classList.contains('increase-btn') && item) {
                item.quantity++;
                saveCart(cart);
                renderCart();
            }

            // Disminuir cantidad
            if (button.classList.contains('decrease-btn') && item && item.quantity > 1) {
                item.quantity--;
                saveCart(cart);
                renderCart();
            }
        });
    }
});