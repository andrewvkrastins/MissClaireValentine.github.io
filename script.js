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

  // Gift slider
  const giftSlides = Array.from(document.querySelectorAll(".gift-slide"));
  const giftPrev = document.getElementById("giftPrev");
  const giftNext = document.getElementById("giftNext");
  const giftDots = document.getElementById("giftDots");

  let giftIndex = 0;
  let typeToken = 0;

  // fullscreen pop state
  let lovePopTimer = null;
  let lovePopEl = null;

  // welcome back
  const welcomeBackEl = document.getElementById("welcomeBack");
  if (welcomeBackEl) {
    const seen = localStorage.getItem("claireCardSeen") === "1";
    welcomeBackEl.textContent = seen ? "welcome back 💕" : "";
  }

  // loading overlay
  const loadingOverlay = document.getElementById("loadingOverlay");

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function showLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.add("show");
    loadingOverlay.setAttribute("aria-hidden", "false");
  }

  function hideLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove("show");
    loadingOverlay.setAttribute("aria-hidden", "true");
  }

  // subtle heart cursor trail
  let lastTrail = 0;
  document.addEventListener("pointermove", (e) => {
    const now = Date.now();
    if (now - lastTrail < 70) return;
    lastTrail = now;

    const h = document.createElement("div");
    h.className = "trail-heart";
    h.textContent = "❤";
    h.style.left = e.clientX + "px";
    h.style.top = e.clientY + "px";

    const size = 10 + Math.random() * 10;
    h.style.fontSize = size + "px";
    h.style.opacity = (0.22 + Math.random() * 0.18).toFixed(2);
    h.style.color = "rgba(255,77,136,.95)";

    document.body.appendChild(h);
    setTimeout(() => h.remove(), 950);
  });

  // click "Love, Andrew" to reveal ps note
  const frontSignature = document.getElementById("frontSignature");
  const psNote = document.getElementById("psNote");

  function togglePsNote() {
    if (!psNote) return;
    psNote.classList.toggle("show");
    psNote.setAttribute(
      "aria-hidden",
      psNote.classList.contains("show") ? "false" : "true"
    );
  }

  if (frontSignature) {
    frontSignature.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePsNote();
    });

    frontSignature.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        togglePsNote();
      }
    });
  }

  function ensureLovePop() {
    if (lovePopEl) return lovePopEl;

    const wrap = document.createElement("div");
    wrap.className = "love-pop";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `<div class="love-text"></div>`;
    document.body.appendChild(wrap);

    lovePopEl = wrap;
    return wrap;
  }

  function showLovePop(text) {
    const el = ensureLovePop();
    const textEl = el.querySelector(".love-text");

    textEl.textContent = text;

    // reset animation by forcing reflow
    el.classList.remove("show");
    void el.offsetHeight;

    el.classList.add("show");

    if (lovePopTimer) clearTimeout(lovePopTimer);
    lovePopTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 5000); // <-- how long the big message stays
  }

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
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let idx = 0; idx < total; idx++) {
      const d = document.createElement("div");
      d.className = "dot" + (idx === active ? " on" : "");
      wrap.appendChild(d);
    }
  }

  async function typeElement(el, speed, token) {
    const full = (el.dataset.full ?? el.textContent).trim();
    if (!el.dataset.full) el.dataset.full = full;

    el.textContent = "";

    for (let idx = 0; idx < full.length; idx++) {
      if (token !== typeToken) return false;
      el.textContent += full[idx];
      await sleep(speed);
    }

    if (token !== typeToken) return false;
    return true;
  }

  async function typeTargets(targets) {
    typeToken += 1;
    const token = typeToken;

    targets.forEach((el) => {
      if (!el.dataset.full) el.dataset.full = (el.textContent || "").trim();
      el.textContent = "";
    });

    async function typeWithTypo(el, speed) {
      const finalText = (el.dataset.full || "").trim();
      const startText = (el.dataset.typoStart || finalText).trim();
      const fromText = (el.dataset.typoFrom || "").trim();
      const toText = (el.dataset.typoTo || "").trim();

      el.textContent = "";

      // type the "mistake"
      for (let k = 0; k < startText.length; k++) {
        if (token !== typeToken) return false;
        el.textContent += startText[k];
        await sleep(speed);
      }

      // pause before deleting (longer)
      await sleep(900);
      if (token !== typeToken) return false;

      // backspace wrong part (slower)
      const backCount = fromText.length || 0;
      for (let b = 0; b < backCount; b++) {
        if (token !== typeToken) return false;
        el.textContent = el.textContent.slice(0, -1);
        await sleep(90);
      }

      // small pause
      await sleep(220);
      if (token !== typeToken) return false;

      // type corrected part (slower)
      for (let t = 0; t < toText.length; t++) {
        if (token !== typeToken) return false;
        el.textContent += toText[t];
        await sleep(110);
      }

      // keep final text for replay restores
      el.dataset.full = finalText || el.textContent.trim();

      return true;
    }

    for (const el of targets) {
      let speed = el.tagName === "H2" || el.tagName === "H3" ? 14 : 12;

      if (el.dataset.speed) {
        const s = parseInt(el.dataset.speed, 10);
        if (!Number.isNaN(s)) speed = s;
      }

      let finished = false;

      if (el.dataset.typoStart) {
        finished = await typeWithTypo(el, speed);
      } else {
        finished = await typeElement(el, speed, token);
      }

      await sleep(140);

      if (!finished) return;
      if (token !== typeToken) return;

      // fullscreen pop
      if (el.dataset.pop === "true") {
        showLovePop(el.dataset.full || el.textContent);
      }
    }
  }

  function typeWithin(container) {
    const targets = Array.from(container.querySelectorAll(".typewriter"));
    if (targets.length === 0) return;
    typeTargets(targets);
  }

  function setNextLabel() {
    nextBtn.textContent = i === slides.length - 1 ? "Reveal plan 🎁" : "Next";
  }

  function showSlide(idx, opts = {}) {
    i = Math.max(0, Math.min(slides.length - 1, idx));
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    prevBtn.disabled = i === 0;
    setNextLabel();
    renderDots(dotsWrap, slides.length, i);

    if (!opts.skipTypewriter) typeWithin(slides[i]);
  }

  function openCard() {
    if (opened) return;
    opened = true;

    // mark as seen for welcome back
    localStorage.setItem("claireCardSeen", "1");
    if (welcomeBackEl) welcomeBackEl.textContent = "welcome back 💕";

    card.classList.add("is-open");
    hint.textContent = "Keep clicking the heart to turn pages 💗";
    frontCover.style.pointerEvents = "none";

    showSlide(0, { skipTypewriter: false });
  }

  function showGiftSlide(idx) {
    giftIndex = Math.max(0, Math.min(giftSlides.length - 1, idx));
    giftSlides.forEach((s, k) => s.classList.toggle("is-active", k === giftIndex));

    giftPrev.disabled = giftIndex === 0;
    giftNext.textContent =
      giftIndex === giftSlides.length - 1 ? "Done 💘" : "Next";

    renderDots(giftDots, giftSlides.length, giftIndex);
    typeWithin(giftSlides[giftIndex]);
  }

  async function revealGift() {
    showLoading();
    await sleep(4000); // <-- loading screen duration
    hideLoading();

    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Ok now we talkin.";

    confettiBurst();

    giftIndex = 0;
    showGiftSlide(0);

    typeWithin(reveal);
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

  // Replay closes the card again (without breaking anything)
  reset.addEventListener("click", (e) => {
    e.stopPropagation();

    // stop typing
    typeToken += 1;

    // stop fullscreen pop if active
    if (lovePopTimer) clearTimeout(lovePopTimer);
    if (lovePopEl) lovePopEl.classList.remove("show");

    // hide loader if visible
    hideLoading();

    // hide reveal first
    reveal.classList.remove("show");
    reveal.setAttribute("aria-hidden", "true");

    // reset hint + allow cover clicks again
    hint.textContent = "Click the heart 💌";
    frontCover.style.pointerEvents = "auto";

    // hide the ps note on replay
    if (psNote) {
      psNote.classList.remove("show");
      psNote.setAttribute("aria-hidden", "true");
    }

    // scroll back to the heart so you see it close
    card.scrollIntoView({ behavior: "smooth", block: "center" });

    // close the heart after a short moment (so animation is visible)
    setTimeout(() => {
      opened = false;
      i = 0;

      card.classList.remove("is-open");

      // restore original text for typewriter
      document.querySelectorAll(".typewriter").forEach((el) => {
        if (el.dataset.full) el.textContent = el.dataset.full;
      });

      showSlide(0, { skipTypewriter: true });
    }, 650);
  });

  // init
  showSlide(0, { skipTypewriter: true });
  renderDots(giftDots, giftSlides.length, 0);
});
