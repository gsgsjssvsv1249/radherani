let highestZ = 1;

class Paper {
  constructor(paper) {
    this.paper = paper;
    this.holdingPaper = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.prevTouchX = 0;
    this.prevTouchY = 0;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.rotation = Math.random() * 30 - 15;
    this.rotating = false;

    this.init();
  }

  init() {
    this.paper.style.touchAction = 'none';

    this.paper.addEventListener('touchstart', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      this.paper.style.zIndex = highestZ++;

      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;

      if (e.touches.length === 2) {
        this.rotating = true;
      }
    });

    this.paper.addEventListener('touchmove', (e) => {
      e.preventDefault();

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const velX = touchX - this.prevTouchX;
      const velY = touchY - this.prevTouchY;

      const dirX = touchX - this.touchStartX;
      const dirY = touchY - this.touchStartY;
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

      this.prevTouchX = touchX;
      this.prevTouchY = touchY;
    });

    this.paper.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
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
  const files = Array.from(event.target.files);
  if (files.length !== 3) {
    alert("Please upload exactly 3 images to personalize the animation.");
    return;
  }

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = imageElements[index];
      const paper = img.closest('.paper');
      const currentTransform = paper.style.transform;

      img.src = e.target.result;

      setTimeout(() => {
        paper.style.transform = currentTransform;
        new Paper(paper); // Rebind drag
      }, 500);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    fetch('https://radharani9-3.onrender.com/upload', {
      method: 'POST',
      body: formData
    })
    .then(res => res.text())
    .then(msg => console.log(`Image ${index + 1} uploaded:`, msg))
    .catch(err => console.error(`Upload failed for image ${index + 1}:`, err));
  });
});
