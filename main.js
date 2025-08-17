let highestZ = 1;

// 🌸 Floating Petals (Day Mode only)
const petalContainer = document.querySelector('.floating-petals');

function createFloatingPetal() {
  if (!document.body.classList.contains('day-mode')) return;

  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.animationDuration = `${5 + Math.random() * 5}s`;
  petal.style.opacity = Math.random();
  petalContainer.appendChild(petal);
  setTimeout(() => petal.remove(), 10000);
}

setInterval(createFloatingPetal, 500);

// 🌟 Gold Neon Stars (Night Mode)
function createStar() {
  if (!document.body.classList.contains('night-mode')) return;

  const star = document.createElement('div');
  star.className = 'star';
  star.style.left = `${Math.random() * 100}vw`;
  star.style.top = `${Math.random() * 100}vh`;
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 5000);
}

setInterval(createStar, 300);

// 🧚‍♀️ Floating Fairy (Fantasy Mode)
function createFairy() {
function createFloatingFairy() {
  if (!document.body.classList.contains('fantasy-mode')) return;

  const fairy = document.createElement('div');
  fairy.className = 'floating-fairy';
  fairy.style.left = `${Math.random() * 100}vw`;
  fairy.style.animationDuration = `${8 + Math.random() * 5}s`;
  fairy.style.opacity = Math.random();
  document.body.appendChild(fairy);

  setTimeout(() => fairy.remove(), 15000);
}

setInterval(createFloatingFairy, 5000);


// 📝 Paper Dragging
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
    paper.style.left = "50%";
    paper.style.top = "50%";
    paper.style.position = "absolute";
    paper.style.zIndex = highestZ++;
    paper.style.transform = `translate(-50%, -50%) rotateZ(${this.rotation}deg)`;

    const startDrag = (x, y, isRotating = false) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ++;
      paper.classList.add('selected');
      this.touchStartX = x;
      this.touchStartY = y;
      this.prevTouchX = x;
      this.prevTouchY = y;
      this.rotating = isRotating;
    };

    const moveDrag = (x, y) => {
      this.touchMoveX = x;
      this.touchMoveY = y;
      this.velX = this.touchMoveX - this.prevTouchX;
      this.velY = this.touchMoveY - this.prevTouchY;

      if (this.holdingPaper) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translate(calc(-50% + ${this.currentPaperX}px), calc(-50% + ${this.currentPaperY}px)) rotateZ(${this.rotation}deg)`;
      }
    };

    const endDrag = () => {
      this.holdingPaper = false;
      this.rotating = false;
      paper.classList.remove('selected');
    };

    paper.addEventListener('touchstart', (e) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, e.touches.length === 2);
    });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });

    paper.addEventListener('touchend', endDrag);

    paper.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => {
      endDrag();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }
}

document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// 📤 Image Upload
const imageUpload = document.getElementById('imageUpload');
const imageElements = document.querySelectorAll('.paper.image img');

imageUpload.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  if (files.length !== 3) {
    alert("Please upload exactly 3 images to personalize the animation.");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(e) {
      if (imageElements[i]) {
        imageElements[i].classList.add('replacing');
        imageElements[i].src = e.target.result;
        setTimeout(() => {
          imageElements[i].classList.remove('replacing');
        }, 500);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData
      });

      const msg = await res.text();
      console.log(`Image ${i + 1} uploaded:`, msg);
    } catch (err) {
      console.error(`Upload failed for image ${i + 1}:`, err);
    }
  }
});

// 🌗 Mode Toggle Button (cycles through day → night → fantasy)
const modeToggle = document.getElementById('modeToggle');
const body = document.body;
const modes = ['day-mode', 'night-mode', 'fantasy-mode'];
let currentMode = 0;

modeToggle.addEventListener('click', () => {
  body.classList.remove(modes[currentMode]);
  currentMode = (currentMode + 1) % modes.length;
  body.classList.add(modes[currentMode]);

  modeToggle.textContent = currentMode === 0 ? '🌞' : currentMode === 1 ? '🌙' : '🧚';
});

// 🌞 Reality & 🧚 Fantasy Buttons
const realityBtn = document.getElementById('realityBtn');
const fantasyBtn = document.getElementById('fantasyBtn');

realityBtn.addEventListener('click', () => {
  body.classList.remove('night-mode', 'fantasy-mode');
  body.classList.add('day-mode');
  currentMode = 0;
  modeToggle.textContent = '🌞';
});

fantasyBtn.addEventListener('click', () => {
  body.classList.remove('day-mode', 'night-mode');
  body.classList.add('fantasy-mode');
  currentMode = 2;
  modeToggle.textContent = '🧚';
});

// ✨ Sparkle Trail (only in fantasy mode)
document.addEventListener('mousemove', (e) => {
  if (!body.classList.contains('fantasy-mode')) return;

  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${e.pageX}px`;
  sparkle.style.top = `${e.pageY}px`;
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 500);
});
