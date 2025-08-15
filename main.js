let highestZ = 5; // Start higher than any paper's initial z-index

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = 0;
  currentPaperX = 0;
  currentPaperY = 0;

  init(paper) {
    const startDrag = (x, y) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ++; // Bring to top
      this.touchStartX = x;
      this.touchStartY = y;
      this.prevTouchX = x;
      this.prevTouchY = y;

      // Store current transform values
      const rect = paper.getBoundingClientRect();
      this.currentPaperX = rect.left;
      this.currentPaperY = rect.top;
    };

    const moveDrag = (x, y) => {
      if (!this.holdingPaper) return;
      this.velX = x - this.prevTouchX;
      this.velY = y - this.prevTouchY;

      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;

      this.prevTouchX = x;
      this.prevTouchY = y;

      paper.style.left = this.currentPaperX + "px";
      paper.style.top = this.currentPaperY + "px";
    };

    const endDrag = () => {
      this.holdingPaper = false;
    };

    // Touch
    paper.addEventListener('touchstart', e => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    paper.addEventListener('touchmove', e => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    paper.addEventListener('touchend', endDrag);

    // Mouse
    paper.addEventListener('mousedown', e => {
      startDrag(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = e => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => {
      endDrag();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }
}

// Init papers
document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Toggle mode
const toggleBtn = document.getElementById('modeToggle');
const body = document.body;
body.classList.add('day-mode');
toggleBtn.textContent = '🌞';

toggleBtn.addEventListener('click', () => {
  if (body.classList.contains('day-mode')) {
    body.classList.remove('day-mode');
    body.classList.add('night-mode');
    toggleBtn.textContent = '🌙';
  } else {
    body.classList.remove('night-mode');
    body.classList.add('day-mode');
    toggleBtn.textContent = '🌞';
  }
});

// Image upload
const imageUpload = document.getElementById('imageUpload');
const imageElements = document.querySelectorAll('.paper.image img');

imageUpload.addEventListener('change', async event => {
  const files = Array.from(event.target.files);
  if (files.length !== 3) {
    alert("Please upload exactly 3 images.");
    return;
  }
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = e => {
      if (imageElements[i]) {
        imageElements[i].src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
});
