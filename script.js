let highestZ = 1;

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
    const mouseX = e.clientX;
    const mouseY = e.clientY;

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
  };

  onMouseUp = () => {
    this.holdingPaper = false;
    this.rotating = false;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}

// Initialize papers
document.querySelectorAll('.paper').forEach(paper => {
  new Paper(paper);
});

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
