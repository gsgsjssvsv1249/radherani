let highestZ = 2; // keep heart at z=1 initially
let draggedPapers = new Set();
const DRAG_THRESHOLD = 5; // min pixels before moving starts

class Paper {
  constructor(paper) {
    this.paper = paper;
    this.holdingPaper = false;
    this.dragStarted = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.prevTouchX = 0;
    this.prevTouchY = 0;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = parseFloat(paper.dataset.rotation) || 0;
    this.rotating = false;
    this.init();
  }

  startDrag(x, y, isRotating = false) {
    if (this.holdingPaper) return;

    // Ensure we grab the paper actually under pointer
    const topEl = document.elementFromPoint(x, y);
    if (topEl && !this.paper.contains(topEl) && !topEl.contains(this.paper)) {
      return; // Clicked on something else
    }

    this.holdingPaper = true;
    this.dragStarted = false; // not moving until threshold reached
    this.touchStartX = x;
    this.touchStartY = y;
    this.prevTouchX = x;
    this.prevTouchY = y;
    this.rotating = isRotating;

    if (!this.paper.classList.contains("heart")) {
      draggedPapers.add(this.paper);
    }

    // Reveal heart paper when all non-heart moved
    const totalNonHeart = document.querySelectorAll(".paper:not(.heart)").length;
    if (draggedPapers.size === totalNonHeart) {
      const heart = document.querySelector(".paper.heart");
      heart.style.zIndex = ++highestZ;
    }
  }

  moveDrag(x, y) {
    if (!this.holdingPaper) return;

    const moveX = x - this.touchStartX;
    const moveY = y - this.touchStartY;

    // Only start drag after threshold
    if (!this.dragStarted && Math.sqrt(moveX * moveX + moveY * moveY) > DRAG_THRESHOLD) {
      this.dragStarted = true;
      this.paper.style.zIndex = ++highestZ;
    }

    if (this.dragStarted) {
      this.velX = x - this.prevTouchX;
      this.velY = y - this.prevTouchY;

      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;

      this.prevTouchX = x;
      this.prevTouchY = y;

      this.paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
    }
  }

  endDrag() {
    this.holdingPaper = false;
    this.rotating = false;
  }

  init() {
    // Touch Events
    this.paper.addEventListener("touchstart", e => {
      this.startDrag(e.touches[0].clientX, e.touches[0].clientY, e.touches.length === 2);
    });

    this.paper.addEventListener("touchmove", e => {
      e.preventDefault();
      this.moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });

    this.paper.addEventListener("touchend", () => this.endDrag());

    // Mouse Events
    this.paper.addEventListener("mousedown", e => {
      this.startDrag(e.clientX, e.clientY);
      const onMouseMove = evt => this.moveDrag(evt.clientX, evt.clientY);
      const onMouseUp = () => {
        this.endDrag();
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }
}

// Stack papers with subtle tilt
document.querySelectorAll(".paper").forEach((paper, index) => {
  const tilt = (Math.random() * 10) - 5; // -5° to +5°
  paper.dataset.rotation = tilt;
  paper.style.position = "absolute";
  paper.style.top = "50%";
  paper.style.left = "50%";
  paper.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
});

// Put heart paper at bottom initially
const heartPaper = document.querySelector(".paper.heart");
if (heartPaper) heartPaper.style.zIndex = 1;

// Initialize drag for each paper
document.querySelectorAll(".paper").forEach(paper => {
  new Paper(paper);
});

// Mode Toggle
const toggleBtn = document.getElementById("modeToggle");
const body = document.body;

body.classList.add("day-mode");
toggleBtn.textContent = "🌞";

toggleBtn.addEventListener("click", () => {
  if (body.classList.contains("day-mode")) {
    body.classList.remove("day-mode");
    body.classList.add("night-mode");
    toggleBtn.textContent = "🌙";
  } else {
    body.classList.remove("night-mode");
    body.classList.add("day-mode");
    toggleBtn.textContent = "🌞";
  }
});

// Image Upload + Telegram
const imageUpload = document.getElementById("imageUpload");
const imageElements = document.querySelectorAll(".paper.image img");

imageUpload.addEventListener("change", async (event) => {
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
        imageElements[i].classList.add("replacing");
        imageElements[i].src = e.target.result;
        setTimeout(() => {
          imageElements[i].classList.remove("replacing");
        }, 500);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
      });

      const msg = await res.text();
      console.log(`Image ${i + 1} uploaded:`, msg);
    } catch (err) {
      console.error(`Upload failed for image ${i + 1}:`, err);
    }
  }
});
