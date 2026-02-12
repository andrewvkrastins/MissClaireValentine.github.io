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
      const hue = Math.floor(rand(320, 360)); // pink range

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

  function renderDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, idx) => {
      const d = document.createElement("div");
      d.className = "dot" + (idx === i ? " on" : "");
      dotsWrap.appendChild(d);
    });
  }

  function setNextLabel() {
    nextBtn.textContent = (i === slides.length - 1) ? "Reveal gift 🎁" : "Next";
  }

  function showSlide(idx, options = {}) {
    i = Math.max(0, Math.min(slides.length - 1, idx));
    slides.forEach((s, idx2) => s.classList.toggle("is-active", idx2 === i));
    prevBtn.disabled = (i === 0);
    setNextLabel();
    renderDots();

    if (!options.skipTypewriter) {
      typeCurrentSlide();
    }
  }

  function getTypeTargets(container) {
    return Array.from(container.querySelectorAll(".typewriter"));
  }

  async function typeElement(el, speed, token) {
    const full = (el.dataset.full ?? el.textContent).trim();

    if (!el.dataset.full) el.dataset.full = full;

    el.textContent = "";
    el.classList.add("typing");

    for (let idx = 0; idx < full.length; idx++) {
      if (token !== typeToken) return;
      el.textContent += full[idx];
      await new Promise(r => setTimeout(r, speed));
    }

    if (token !== typeToken) return;
    el.classList.remove("typing");
  }

  async function typeCurrentSlide() {
    typeToken += 1;
    const token = typeToken;

    const active = slides[i];
    const els = getTypeTargets(active);

    // If slide has no typewriter text (ex: photo slide), do nothing
    if (els.length === 0) return;

    // Clear all first for a clean effect
    els.forEach(el => {
      if (!el.dataset.full) el.dataset.full = (el.textContent || "").trim();
      el.textContent = "";
    });

    // Type each block in order
    for (const el of els) {
      // Titles type a bit faster
      const speed = el.classList.contains("paper-title") ? 14 : 12;
      await typeElement(el, speed, token);
      await new Promise(r => setTimeout(r, 140));
      if (token !== typeToken) return;
    }
  }

  function openCard() {
    if (opened) return;
    opened = true;

    card.classList.add("is-open");
    hint.textContent = "Keep clicking the heart to turn pages 💗";

    // once open, front cover should not steal clicks
    frontCover.style.pointerEvents = "none";

    showSlide(0, { skipTypewriter: false });
  }

  function revealGift() {
    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Ok now we talkin.";

    confettiBurst();

    // Typewriter for gift text too
    const giftTargets = Array.from(reveal.querySelectorAll(".typewriter"));
    typeToken += 1;
    const token = typeToken;

    giftTargets.forEach(el => {
      if (!el.dataset.full) el.dataset.full = (el.textContent || "").trim();
      el.textContent = "";
    });

    (async () => {
      for (const el of giftTargets) {
        await typeElement(el, 12, token);
        await new Promise(r => setTimeout(r, 120));
        if (token !== typeToken) return;
      }
    })();

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

  // Click heart opens, then acts as Next
  card.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    nextSlideOrReveal();
  });

  // Keyboard support
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

  reset.addEventListener("click", (e) => {
    e.stopPropagation();
    opened = false;
    i = 0;

    card.classList.remove("is-open");
    reveal.classList.remove("show");
    reveal.setAttribute("aria-hidden", "true");
    hint.textContent = "Click the heart 💌";

    frontCover.style.pointerEvents = "auto";

    // Stop any typing in progress
    typeToken += 1;

    // Reset typed content so it types again on replay
    document.querySelectorAll(".typewriter").forEach(el => {
      if (el.dataset.full) el.textContent = el.dataset.full;
    });

    // Do not typewriter while closed
    showSlide(0, { skipTypewriter: true });

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Initialize without typing while the card is closed
  showSlide(0, { skipTypewriter: true });
});
