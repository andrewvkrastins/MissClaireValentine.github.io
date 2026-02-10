let step = 0;

const card = document.getElementById("card");
const hint = document.getElementById("hint");
const reveal = document.getElementById("reveal");
const reset = document.getElementById("reset");

card.addEventListener("click", () => {
  step += 1;

  if (step === 1) {
    card.classList.add("is-open");
    hint.textContent = "Click again to reveal your surprise 🎁";
  } else if (step === 2) {
    reveal.classList.add("show");
    reveal.setAttribute("aria-hidden", "false");
    hint.textContent = "Sheeeesh. W boyfriend.";
    // scroll the reveal into view on mobile
    reveal.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // do nothing
  }
});

reset.addEventListener("click", (e) => {
  e.stopPropagation();
  step = 0;
  card.classList.remove("is-open");
  reveal.classList.remove("show");
  reveal.setAttribute("aria-hidden", "true");
  hint.textContent = "Click the card 💌";
  window.scrollTo({ top: 0, behavior: "smooth" });
});
