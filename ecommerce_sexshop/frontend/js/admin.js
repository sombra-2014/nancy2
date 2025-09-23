document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si no está logueado
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }

    const API_URL = 'http://127.0.0.1:5000/api/products';
    const productForm = document.getElementById('product-form');
    const productTableBody = document.querySelector('#product-table tbody');
    const addProductBtn = document.getElementById('add-product-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Función para obtener y mostrar productos
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
        }
    }

    // Función para mostrar los productos en la tabla
    function displayProducts(products) {
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = productTableBody.insertRow();
            // Mostrar la primera imagen como miniatura
            const imageUrl = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '';
            const thumbnail = imageUrl ? `<img src="http://127.0.0.1:5000${imageUrl}" alt="${product.name}" style="width: 50px; height: 50px;">` : 'No Image';
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.stock}</td>
                <td>${thumbnail}</td>
                <td class="admin-actions">
                    <button class="edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    }

    // Manejar el envío del formulario (crear o editar producto)
    async function handleFormSubmit(event) {
        event.preventDefault();
        const productId = document.getElementById('product-id').value;
        const formData = new FormData();
        const imageFiles = document.getElementById('image').files;

        formData.append('name', document.getElementById('name').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('stock', document.getElementById('stock').value);

        let url = '';
        let method = '';
        let bodyData;

        if (productId) {
            url = `http://127.0.0.1:5000/api/products/${productId}`;
            method = 'PUT';
            
            // Para editar, enviamos un JSON. El servidor no manejará el archivo de imagen directamente.
            // La actualización de imágenes se manejará por separado si fuera necesario.
            bodyData = {
                name: formData.get('name'),
                price: formData.get('price'),
                category: formData.get('category'),
                description: formData.get('description'),
                stock: formData.get('stock')
            };

            // Aquí podrías agregar lógica para manejar nuevas imágenes,
            // pero para simplificar, se recomienda borrar y recrear el producto
            // si se necesitan cambiar las imágenes.
        } else {
            url = 'http://127.0.0.1:5000/api/products';
            method = 'POST';
            
            // Si es un producto nuevo, agregamos todos los archivos al FormData.
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }
            bodyData = formData;
        }
        
        try {
            const response = await fetch(url, {
                method: method,
                body: (method === 'POST') ? bodyData : JSON.stringify(bodyData),
                headers: (method === 'PUT') ? { 'Content-Type': 'application/json' } : {}
            });

            if (response.ok) {
                alert(`Producto ${productId ? 'actualizado' : 'agregado'} con éxito.`);
                document.getElementById('product-form').reset();
                document.getElementById('product-form').classList.add('form-hidden');
                fetchProducts();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al guardar el producto.');
        }
    }

    // Manejar la eliminación de productos
    async function handleDelete(event) {
        if (event.target.closest('.delete-btn')) {
            const productId = event.target.closest('.delete-btn').dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/products/${productId}`, {
                        method: 'DELETE',
                    });
                    if (response.ok) {
                        alert('Producto eliminado con éxito.');
                        fetchProducts();
                    } else {
                        const errorData = await response.json();
                        alert(`Error: ${errorData.error}`);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Ocurrió un error al eliminar el producto.');
                }
            }
        }
    }

    // Manejar la edición de productos
    async function handleEdit(event) {
        if (event.target.closest('.edit-btn')) {
            const productId = event.target.closest('.edit-btn').dataset.id;
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/products/${productId}`);
                const product = await response.json();
                
                document.getElementById('product-id').value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('category').value = product.category;
                document.getElementById('description').value = product.description;
                document.getElementById('stock').value = product.stock;
                
                productForm.classList.remove('form-hidden');
            } catch (error) {
                console.error('Error:', error);
                alert('No se pudo cargar la información del producto.');
            }
        }
    }

    // Event Listeners
    addProductBtn.addEventListener('click', () => {
        productForm.classList.remove('form-hidden');
        productForm.reset();
    });
    cancelEditBtn.addEventListener('click', () => {
        productForm.classList.add('form-hidden');
        productForm.reset();
    });
    productForm.addEventListener('submit', handleFormSubmit);
    productTableBody.addEventListener('click', handleEdit);
    productTableBody.addEventListener('click', handleDelete);

    fetchProducts();
});