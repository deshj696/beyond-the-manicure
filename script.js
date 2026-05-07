const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

$$("[data-fallback]").forEach((image) => {
  const updateImageState = () => {
    const loaded = image.complete && image.naturalWidth > 0;
    image.classList.toggle("is-missing", !loaded);
    image.closest("figure")?.classList.toggle("has-image", loaded);
  };

  image.addEventListener("load", updateImageState);
  image.addEventListener("error", updateImageState);
  updateImageState();
});

const switchCard = $("[data-switch-card]");
if (switchCard) {
  const button = $("[data-switch-button]", switchCard);
  const before = $(".before", switchCard);
  const after = $(".after", switchCard);

  switchCard.addEventListener("click", () => {
    const showingBefore = before.classList.contains("active");
    before.classList.toggle("active", !showingBefore);
    after.classList.toggle("active", showingBefore);
    button.textContent = showingBefore ? "After" : "Before";
  });
}

$$("[data-expandable]").forEach((card) => {
  const button = $("button", card);
  const marker = $("strong", button);

  button.addEventListener("click", () => {
    const isOpen = card.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    marker.textContent = isOpen ? "-" : "+";
  });
});

const designOutput = $(".design-output p");
$$(".design-card").forEach((card) => {
  card.addEventListener("click", () => {
    $$(".design-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    designOutput.textContent = card.dataset.design;
  });
});

const conceptOutput = $(".concept-output");
$$(".nail-hotspots button").forEach((button) => {
  const revealConcept = () => {
    $$(".nail-hotspots button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    conceptOutput.textContent = button.dataset.concept;
  };

  button.addEventListener("mouseenter", revealConcept);
  button.addEventListener("focus", revealConcept);
  button.addEventListener("click", revealConcept);
});

const tooltipOutput = $(".tooltip-output");
$$(".labor-map button").forEach((node) => {
  const revealTip = () => {
    $$(".labor-map button").forEach((item) => item.classList.remove("active"));
    node.classList.add("active");
    tooltipOutput.textContent = node.dataset.tip;
  };

  node.addEventListener("mouseenter", revealTip);
  node.addEventListener("focus", revealTip);
  node.addEventListener("click", revealTip);
});

const trail = $(".cursor-trail");
let trailX = 0;
let trailY = 0;
let targetX = 0;
let targetY = 0;
let lastSparkle = 0;

window.addEventListener("pointermove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
  if (trail) {
    trail.style.opacity = "1";
  }

  if (performance.now() - lastSparkle > 90) {
    createSparkle(event.clientX, event.clientY);
    lastSparkle = performance.now();
  }
});

function animateTrail() {
  if (!trail) {
    return;
  }

  trailX += (targetX - trailX) * 0.18;
  trailY += (targetY - trailY) * 0.18;
  trail.style.left = `${trailX}px`;
  trail.style.top = `${trailY}px`;
  requestAnimationFrame(animateTrail);
}

if (trail) {
  animateTrail();
}

$$("a, button, [data-drag]").forEach((element) => {
  element.addEventListener("mouseenter", () => trail?.classList.add("is-hovering"));
  element.addEventListener("mouseleave", () => trail?.classList.remove("is-hovering"));
});

function createSparkle(x, y) {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.textContent = Math.random() > 0.5 ? "✦" : "+";
  sparkle.style.left = `${x + (Math.random() * 18 - 9)}px`;
  sparkle.style.top = `${y + (Math.random() * 18 - 9)}px`;
  sparkle.style.color = Math.random() > 0.5 ? "var(--pink)" : "var(--blue)";
  document.body.append(sparkle);
  sparkle.addEventListener("animationend", () => sparkle.remove());
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

$$(".reveal").forEach((element) => revealObserver.observe(element));

$$(".reveal").forEach((element) => {
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    element.classList.add("in-view");
  }
});

$$("[data-drag]").forEach((element) => {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) {
      return;
    }

    const rect = element.getBoundingClientRect();
    isDragging = true;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    element.classList.add("dragging");
    element.style.position = "fixed";
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    element.style.left = `${event.clientX - offsetX}px`;
    element.style.top = `${event.clientY - offsetY}px`;
  });

  element.addEventListener("pointerup", (event) => {
    isDragging = false;
    element.classList.remove("dragging");
    element.releasePointerCapture(event.pointerId);
  });
});
