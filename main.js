let highestZ = 1;
let movedPapers = new Set();
const dragThreshold = 5;
let startX = 0, startY = 0, currentPaper = null, isDragging = false;

// Position papers with tilt
document.querySelectorAll('.paper').forEach((paper, index) => {
  const offset = index * 4;
  const tilt = (Math.random() * 14) - 7; // -7° to +7°
  paper.style.position = 'absolute';
  paper.style.top = `calc(50% + ${offset}px)`;
  paper.style.left = `calc(50% + ${offset}px)`;
  paper.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
  paper.dataset.index = index;
});

// Start drag from topmost paper
function startDrag(e) {
  const pointX = e.touches ? e.touches[0].clientX : e.clientX;
  const pointY = e.touches ? e.touches[0].clientY : e.clientY;
  const target = document.elementFromPoint(pointX, pointY);

  if (!target.closest('.paper')) return;
  currentPaper = target.closest('.paper');

  // Heart paper logic — only bring it forward last
  if (currentPaper.classList.contains('heart') && movedPapers.size < document.querySelectorAll('.paper').length - 1) {
    return; // block heart until all others moved
  }

  startX = pointX;
  startY = pointY;
  isDragging = false;

  document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', onMove);
  document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', endDrag);
}

function onMove(e) {
  const pointX = e.touches ? e.touches[0].clientX : e.clientX;
  const pointY = e.touches ? e.touches[0].clientY : e.clientY;

  const dx = pointX - startX;
  const dy = pointY - startY;

  // Only start dragging if movement passes threshold
  if (!isDragging && Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
    isDragging = true;
    currentPaper.style.zIndex = highestZ++;
    movedPapers.add(currentPaper);
  }

  if (isDragging) {
    const rect = currentPaper.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    currentPaper.style.transform = `translate(${dx}px, ${dy}px) rotate(${currentPaper.dataset.tilt || 0}deg)`;
    currentPaper.style.position = 'absolute';
    currentPaper.style.left = `${rect.left + dx + centerX}px`;
    currentPaper.style.top = `${rect.top + dy + centerY}px`;
  }
}

function endDrag(e) {
  document.removeEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', onMove);
  document.removeEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', endDrag);
  currentPaper = null;
  isDragging = false;
}

// Global listeners
document.addEventListener('mousedown', startDrag);
document.addEventListener('touchstart', startDrag, { passive: false });

// Mode Toggle
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

// Image Upload + Telegram
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
