let highestZ = 1;

class Paper {
  constructor(paper) {
    this.paper = paper;
    this.holdingPaper = false;
    this.mouseTouchX = 0;
    this.mouseTouchY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = Math.random() * 30 - 15;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.rotating = false;

    this.init();
  }

  init() {
    this.paper.addEventListener('mousedown', (e) => {
      if (this.holdingPaper) return;
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

    this.paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  onMouseMove = (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    this.velX = this.mouseX - this.prevMouseX;
    this.velY = this.mouseY - this.prevMouseY;

    const dirX = this.mouseX - this.mouseTouchX;
    const dirY = this.mouseY - this.mouseTouchY;
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);

    let degrees = this.rotation;
    if (this.rotating && dirLength !== 0) {
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;
      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      degrees = (360 + Math.round(180 * angle / Math.PI)) % 360;
      this.rotation = degrees;
    }

    if (this.holdingPaper) {
      if (!this.rotating) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
      }

      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;

      this.paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${degrees}deg)`;
    }
  };

  onMouseUp = () => {
    this.holdingPaper = false;
    this.rotating = false;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
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


// 🌟 Image Upload + Telegram Integration
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

    fetch('http://localhost:3000/upload', {
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
