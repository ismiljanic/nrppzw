document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll('.fade-in');
    
    images.forEach((image, index) => {
        setTimeout(() => {
            image.style.opacity = 1;
        }, 300 * index);
    });

    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            window.scrollTo({
                top: targetElement.offsetTop - 20,
                behavior: 'smooth',
            });
        });
    });
});
