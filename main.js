let highestZ = 1;
let draggedPapers = new Set();

class Paper {
  holdingPaper = false;
  dragStarted = false;
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

  init(paper) {
    const startHold = (x, y) => {
      this.holdingPaper = true;
      this.dragStarted = false; // reset drag flag
      this.touchStartX = x;
      this.touchStartY = y;
      this.prevTouchX = x;
      this.prevTouchY = y;
    };

    const startDrag = () => {
      if (!this.dragStarted) {
        // Mark this paper as moved (except heart)
        if (!paper.classList.contains("heart")) {
          draggedPapers.add(paper);
          paper.style.zIndex = ++highestZ;
        } else {
          paper.style.zIndex = ++highestZ;
        }

        // Reveal heart paper only when all others moved
        const totalNonHeart = document.querySelectorAll(".paper:not(.heart)").length;
        if (draggedPapers.size === totalNonHeart) {
          const heart = document.querySelector(".paper.heart");
          heart.style.zIndex = ++highestZ;
        }

        this.dragStarted = true;
      }
    };

    const moveHold = (x, y) => {
      const dx = x - this.touchStartX;
      const dy = y - this.touchStartY;

      // Only start drag if moved enough (5px threshold)
      if (!this.dragStarted && Math.sqrt(dx * dx + dy * dy) > 5) {
        startDrag();
      }

      if (this.holdingPaper && this.dragStarted) {
        this.velX = x - this.prevTouchX;
        this.velY = y - this.prevTouchY;

        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;

        this.prevTouchX = x;
        this.prevTouchY = y;

        paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
      }
    };

    const endHold = () => {
      this.holdingPaper = false;
      this.dragStarted = false;
    };

    // Touch events
    paper.addEventListener("touchstart", (e) => {
      startHold(e.touches[0].clientX, e.touches[0].clientY);
    });
    paper.addEventListener("touchmove", (e) => {
      e.preventDefault();
      moveHold(e.touches[0].clientX, e.touches[0].clientY);
    });
    paper.addEventListener("touchend", endHold);

    // Mouse events
    paper.addEventListener("mousedown", (e) => {
      startHold(e.clientX, e.clientY);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    const onMouseMove = (e) => moveHold(e.clientX, e.clientY);
    const onMouseUp = () => {
      endHold();
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

// Center stack with tilt + random small offset to prevent overlap
document.querySelectorAll(".paper").forEach((paper, index) => {
  const offsetX = (Math.random() * 30) - 15; // -15px to +15px
  const offsetY = (Math.random() * 30) - 15;
  const tilt = (Math.random() * 16) - 8; // -8° to +8°
  paper.style.position = "absolute";
  paper.style.top = `calc(50% + ${offsetY}px)`;
  paper.style.left = `calc(50% + ${offsetX}px)`;
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
