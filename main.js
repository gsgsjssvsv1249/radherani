let highestZ = 1;

// 📝 Paper Class for Dragging
class Paper {
  constructor() {
    this.paper = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
  }

  init(paperElement) {
    this.paper = paperElement;

    this.paper.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());
  }

  startDrag(e) {
    this.isDragging = true;
    this.offsetX = e.clientX - this.paper.offsetLeft;
    this.offsetY = e.clientY - this.paper.offsetTop;
    highestZ++;
    this.paper.style.zIndex = highestZ;
    this.paper.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging) return;
    this.paper.style.left = `${e.clientX - this.offsetX}px`;
    this.paper.style.top = `${e.clientY - this.offsetY}px`;
  }

  endDrag() {
    this.isDragging = false;
    this.paper.style.cursor = 'grab';
  }
}

// 🧩 Initialize all papers
document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// 🌗 Mode Toggle + Background Animation
const toggleBtn = document.getElementById('modeToggle');
const body = document.body;
const backgroundContainer = document.createElement('div');
backgroundContainer.className = 'background-container';
document.body.appendChild(backgroundContainer);

function clearBackground() {
  backgroundContainer.innerHTML = '';
}

function createPetals() {
  clearBackground();
  for (let i = 0; i < 30; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${5 + Math.random() * 5}s`;
    backgroundContainer.appendChild(petal);
  }
}

function createSparkles() {
  clearBackground();
  for (let i = 0; i < 40; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}vw`;
    sparkle.style.top = `${Math.random() * 100}vh`;
    sparkle.style.animationDuration = `${6 + Math.random() * 4}s`;
    backgroundContainer.appendChild(sparkle);
  }
}

// 🌞 Initial Mode
body.classList.add('day-mode');
toggleBtn.textContent = '🌞';
createPetals();

toggleBtn.addEventListener('click', () => {
  if (body.classList.contains('day-mode')) {
    body.classList.remove('day-mode');
    body.classList.add('night-mode');
    toggleBtn.textContent = '🌙';
    createSparkles();
  } else {
    body.classList.remove('night-mode');
    body.classList.add('day-mode');
    toggleBtn.textContent = '🌞';
    createPetals();
  }
});

// 📤 Image Upload + Telegram Integration
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

      const res = await fetch('http://localhost:3000/upload', {
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
