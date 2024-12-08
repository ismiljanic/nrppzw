document.addEventListener("DOMContentLoaded", function () {
    var images = document.querySelectorAll('.gallery-image');
    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');
    var caption = document.getElementById('caption');
    var closeBtn = document.querySelector('.close');

    images.forEach(function(image) {
        image.onclick = function() {
            modal.style.display = "block";
            modalImage.src = this.src;
            caption.innerHTML = this.alt;
        };
    });

    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
