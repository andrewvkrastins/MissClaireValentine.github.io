let opened = false;

const card = document.getElementById("card");
const frontCover = document.getElementById("frontCover");
const hint = document.getElementById("hint");
const reveal = document.getElementById("reveal");
const reset = document.getElementById("reset");

const slides = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");
const dotsWrap = document.getElementById("dots");

let i = 0;

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
  hint.textContent = "Use Next inside the heart 💗";
  showSlide(0);

  // After open, the front cover should not block clicks
  frontCover.style.pointerEvents = "none";
}

card.addEventListener("click", () => {
  openCard();
});

card.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openCard();
  }
});

prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  showSlide(i - 1);
});

nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (i === slides.length - 1) {
    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Ok now we talkin.";
    reveal.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  showSlide(i + 1);
});

reset.addEventListener("click", (e) => {
  e.stopPropagation();
  opened = false;

  card.classList.remove("is-open");
  reveal.classList.remove("show");
  reveal.setAttribute("aria-hidden", "true");
  hint.textContent = "Click the heart 💌";

  // re-enable cover clicks after reset
  frontCover.style.pointerEvents = "auto";

  showSlide(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
