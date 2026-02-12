document.addEventListener("DOMContentLoaded", () => {
  let opened = false;
  let i = 0;

  const card = document.getElementById("card");
  const frontCover = document.getElementById("frontCover");
  const hint = document.getElementById("hint");
  const reveal = document.getElementById("reveal");
  const reset = document.getElementById("reset");

  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");
  const dotsWrap = document.getElementById("dots");

  if (!card || !frontCover || !hint || !reveal || !reset || !prevBtn || !nextBtn || !dotsWrap || slides.length === 0) {
    console.error("Missing elements for card/slider. Check ids in index.html.");
    return;
  }

  function renderDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, idx) => {
      const d = document.createElement("div");
      d.className = "dot" + (idx === i ? " on" : "");
      dotsWrap.appendChild(d);
    });
  }

  function showSlide(idx) {
    i = Math.max(0, Math.min(slides.length - 1, idx));
    slides.forEach((s, idx2) => s.classList.toggle("is-active", idx2 === i));

    prevBtn.disabled = (i === 0);
    nextBtn.textContent = (i === slides.length - 1) ? "Reveal gift 🎁" : "Next";

    renderDots();
  }

  function openCard() {
    if (opened) return;
    opened = true;

    card.classList.add("is-open");
    hint.textContent = "Keep clicking the heart to turn pages 💗";

    // Once open, let clicks go through to the inside
    frontCover.style.pointerEvents = "none";

    showSlide(0);
  }

  function revealGift() {
    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Ok now we talkin.";
    reveal.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextSlideOrReveal() {
    if (!opened) {
      openCard();
      return;
    }

    if (i >= slides.length - 1) {
      revealGift();
      return;
    }

    showSlide(i + 1);
  }

  // Click heart to open and also act as Next
  card.addEventListener("click", (e) => {
    // If the click is on a button, let the button handler run instead
    if (e.target.closest("button")) return;
    nextSlideOrReveal();
  });

  // Keyboard open
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nextSlideOrReveal();
    }
  });

  // Back button
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!opened) openCard();
    showSlide(i - 1);
  });

  // Next button
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nextSlideOrReveal();
  });

  // Reset
  reset.addEventListener("click", (e) => {
    e.stopPropagation();
    opened = false;
    i = 0;

    card.classList.remove("is-open");
    reveal.classList.remove("show");
    reveal.setAttribute("aria-hidden", "true");
    hint.textContent = "Click the heart 💌";

    frontCover.style.pointerEvents = "auto";

    showSlide(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Initial state
  showSlide(0);
});
