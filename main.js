let highestZ = 1;
let draggedPapers = new Set();

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
  rotation = Math.random() * 16 - 8; // bigger tilt range
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    const startDrag = (x, y, isRotating = false) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      if (!paper.classList.contains("heart")) {
        draggedPapers.add(paper);
        paper.style.zIndex = ++highestZ;
      } else {
        paper.style.zIndex = ++highestZ;
      }

      const totalNonHeart = document.querySelectorAll(".paper:not(.heart)").length;
      if (draggedPapers.size === totalNonHeart) {
        const heart = document.querySelector(".paper.heart");
        heart.style.zIndex = ++highestZ;
      }

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

        paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
      }
    };

    const endDrag = () => {
      this.holdingPaper = false;
      this.rotating = false;
    };

    paper.addEventListener("touchstart", (e) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, e.touches.length === 2);
    });

    paper.addEventListener("touchmove", (e) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });

    paper.addEventListener("touchend", endDrag);

    paper.addEventListener("mousedown", (e) => {
      startDrag(e.clientX, e.clientY);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => {
      endDrag();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }
}

// Initialize papers
document.querySelectorAll(".paper").forEach((paper) => {
  const p = new Paper();
  p.init(paper);
});

// Put heart paper at bottom initially
const heartPaper = document.querySelector(".paper.heart");
if (heartPaper) {
  heartPaper.style.zIndex = 1;
}

// Center stack with more tilt to avoid overlap
document.querySelectorAll(".paper").forEach((paper, index) => {
  const offset = index * 4;
  const tilt = (Math.random() * 16) - 8; // -8° to +8°
  paper.style.position = "absolute";
  paper.style.top = `calc(50% + ${offset}px)`;
  paper.style.left = `calc(50% + ${offset}px)`;
  paper.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
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

// Image Upload + Telegram Integration
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
    reader.onload = function (e) {
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
        body: formData,
      });

      const msg = await res.text();
      console.log(`Image ${i + 1} uploaded:`, msg);
    } catch (err) {
      console.error(`Upload failed for image ${i + 1}:`, err);
    }
  }
});
