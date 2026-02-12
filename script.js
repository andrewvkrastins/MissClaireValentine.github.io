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

  // Gift slider elements
  const giftSlides = Array.from(document.querySelectorAll(".gift-slide"));
  const giftPrev = document.getElementById("giftPrev");
  const giftNext = document.getElementById("giftNext");
  const giftDots = document.getElementById("giftDots");

  let giftIndex = 0;
  let typeToken = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function confettiBurst() {
    const count = 110;
    for (let k = 0; k < count; k++) {
      const c = document.createElement("div");
      c.className = "confetti";

      const left = rand(5, 95);
      const dx = rand(-25, 25) + "vw";
      const rot = Math.floor(rand(360, 1200)) + "deg";
      const dur = rand(2.2, 4.2) + "s";
      const delay = rand(0, 0.35) + "s";
      const hue = Math.floor(rand(320, 360));

      c.style.left = left + "vw";
      c.style.backgroundColor = `hsl(${hue} 85% 65%)`;
      c.style.animationDuration = dur;
      c.style.animationDelay = delay;
      c.style.setProperty("--dx", dx);
      c.style.setProperty("--rot", rot);

      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5200);
    }
  }

  function renderDots(wrap, total, active) {
    wrap.innerHTML = "";
    for (let idx = 0; idx < total; idx++) {
      const d = document.createElement("div");
      d.className = "dot" + (idx === active ? " on" : "");
      wrap.appendChild(d);
    }
  }

  function setNextLabel() {
    nextBtn.textContent = (i === slides.length - 1) ? "Reveal plan 🎁" : "Next";
  }

  function showSlide(idx, options = {}) {
    i = Math.max(0, Math.min(slides.length - 1, idx));
    slides.forEach((s, idx2) => s.classList.toggle("is-active", idx2 === i));
    prevBtn.disabled = (i === 0);
    setNextLabel();
    renderDots(dotsWrap, slides.length, i);

    if (!options.skipTypewriter) typeCurrentSlide();
  }

  function getTypeTargets(container) {
    return Array.from(container.querySelectorAll(".typewriter"));
  }

  async function typeElement(el, speed, token) {
    const full = (el.dataset.full ?? el.textContent).trim();
    if (!el.dataset.full) el.dataset.full = full;

    el.textContent = "";

    for (let idx = 0; idx < full.length; idx++) {
      if (token !== typeToken) return;
      el.textContent += full[idx];
      await new Promise(r => setTimeout(r, speed));
    }
  }

  async function typeTargets(targets) {
    typeToken += 1;
    const token = typeToken;

    targets.forEach(el => {
      if (!el.dataset.full) el.dataset.full = (el.textContent || "").trim();
      el.textContent = "";
    });

    for (const el of targets) {
      const speed = el.classList.contains("paper-title") ? 14 : 12;
      await typeElement(el, speed, token);
      await new Promise(r => setTimeout(r, 140));
      if (token !== typeToken) return;
    }
  }

  function typeCurrentSlide() {
    const active = slides[i];
    const targets = getTypeTargets(active);
    if (targets.length === 0) return;
    typeTargets(targets);
  }

  function typeGiftSlide() {
    const active = giftSlides[giftIndex];
    const targets = getTypeTargets(active);
    if (targets.length === 0) return;
    typeTargets(targets);
  }

  function openCard() {
    if (opened) return;
    opened = true;

    card.classList.add("is-open");
    hint.textContent = "Keep clicking the heart to turn pages 💗";
    frontCover.style.pointerEvents = "none";

    showSlide(0, { skipTypewriter: false });
  }

  function showGiftSlide(idx) {
    giftIndex = Math.max(0, Math.min(giftSlides.length - 1, idx));
    giftSlides.forEach((s, k) => s.classList.toggle("is-active", k === giftIndex));

    giftPrev.disabled = (giftIndex === 0);
    giftNext.textContent = (giftIndex === giftSlides.length - 1) ? "Done 💘" : "Next";

    renderDots(giftDots, giftSlides.length, giftIndex);
    typeGiftSlide();
  }

  function revealGift() {
    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Ok now we talkin.";

    confettiBurst();

    giftIndex = 0;
    showGiftSlide(0);

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

    showSlide(i + 1, { skipTypewriter: false });
  }

  // Heart click opens then acts as Next
  card.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    nextSlideOrReveal();
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      nextSlideOrReveal();
    }
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!opened) openCard();
    showSlide(i - 1, { skipTypewriter: false });
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nextSlideOrReveal();
  });

  // Gift controls
  giftPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    showGiftSlide(giftIndex - 1);
  });

  giftNext.addEventListener("click", (e) => {
    e.stopPropagation();
    if (giftIndex >= giftSlides.length - 1) return;
    showGiftSlide(giftIndex + 1);
  });

  reset.addEventListener("click", (e) => {
    e.stopPropagation();
    opened = false;
    i = 0;

    card.classList.remove("is-open");
    reveal.classList.remove("show");
    reveal.setAttribute("aria-hidden", "true");
    hint.textContent = "Click the heart 💌";
    frontCover.style.pointerEvents = "auto";

    typeToken += 1;

    document.querySelectorAll(".typewriter").forEach(el => {
      if (el.dataset.full) el.textContent = el.dataset.full;
    });

    showSlide(0, { skipTypewriter: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // init
  showSlide(0, { skipTypewriter: true });
  if (giftSlides.length > 0) {
    renderDots(giftDots, giftSlides.length, 0);
  }
});
