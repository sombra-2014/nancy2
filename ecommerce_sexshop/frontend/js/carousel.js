document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.getElementById('carousel-images');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentIndex = 0;
    let images = [];
    let interval;

    async function fetchCarouselImages() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/carousel_images');
            images = await response.json();
            if (images.length > 0) {
                // Muestra la primera imagen al cargar
                displayImage();
                // Inicia el carrusel
                startCarousel();
            }
        } catch (error) {
            console.error("Error al obtener imágenes del carrusel:", error);
        }
    }

    function displayImage() {
        carouselContainer.innerHTML = '';
        const img = document.createElement('img');
        // Asegura que la URL de la imagen sea absoluta
        img.src = `http://127.0.0.1:5000${images[currentIndex].url}`;
        img.alt = images[currentIndex].alt;
        carouselContainer.appendChild(img);
    }

    function startCarousel() {
        interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            displayImage();
        }, 3000); // Cambia de imagen cada 3 segundos
    }

    function stopCarousel() {
        clearInterval(interval);
    }

    // Navegación manual
    prevBtn.addEventListener('click', () => {
        stopCarousel();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        displayImage();
        startCarousel();
    });

    nextBtn.addEventListener('click', () => {
        stopCarousel();
        currentIndex = (currentIndex + 1) % images.length;
        displayImage();
        startCarousel();
    });

    fetchCarouselImages();
});