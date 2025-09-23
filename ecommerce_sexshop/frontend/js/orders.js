async function fetchOrders() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
    }
}

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>No hay pedidos aún.</p>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const productListHTML = order.products.map(item => `
            <li>${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}</li>
        `).join('');

        orderCard.innerHTML = `
            <div class="order-header">
                <h3>Pedido #${order.id}</h3>
                <p class="order-date">${new Date(order.order_date).toLocaleString()}</p>
            </div>
            <div class="order-details">
                <p><strong>Cliente:</strong> ${order.customer_name || 'N/A'}</p>
                <p><strong>Email/WhatsApp:</strong> ${order.customer_email || 'N/A'}</p>
                <p><strong>Mensaje:</strong> ${order.message || 'N/A'}</p>
                <h4>Productos:</h4>
                <ul class="order-products">
                    ${productListHTML}
                </ul>
            </div>
            <div class="order-footer">
                <p><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <button class="delete-order-btn" data-order-id="${order.id}">Eliminar Pedido</button>
        `;
        ordersContainer.appendChild(orderCard);
    });

    // Lógica para los botones de eliminar
    const deleteButtons = document.querySelectorAll('.delete-order-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const orderId = button.dataset.orderId;
            if (confirm(`¿Estás seguro de que quieres eliminar el pedido #${orderId}?`)) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        alert('Pedido eliminado correctamente.');
                        fetchOrders(); // Recargar la lista de pedidos
                    } else {
                        const error = await response.json();
                        alert(`Error: ${error.error}`);
                    }
                } catch (error) {
                    console.error('Error al conectar con el servidor:', error);
                    alert('Hubo un error al intentar eliminar el pedido.');
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', fetchOrders);