const portrait = document.querySelector(".portrait-frame img");

if (portrait) {
  const showFallback = () => portrait.closest(".portrait-frame")?.classList.add("is-missing");
  portrait.addEventListener("error", showFallback);
  if (portrait.complete && portrait.naturalWidth === 0) showFallback();
}

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  document.querySelector(".scroll-progress span")?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, progress))})`);
};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        const counter = entry.target.querySelector("[data-count]");
        if (counter && !counter.dataset.counted) {
          counter.dataset.counted = "true";
          const total = Number(counter.dataset.count || 0);
          const suffix = counter.dataset.suffix || "";
          const startedAt = performance.now();
          const tick = (now) => {
            const ratio = Math.min(1, (now - startedAt) / 900);
            const eased = 1 - Math.pow(1 - ratio, 3);
            counter.textContent = `${Math.round(total * eased)}${suffix}`;
            if (ratio < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const selected = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", selected);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -58%", threshold: [0.05, 0.25, 0.5] },
  );
  observedSections.forEach((section) => navObserver.observe(section));
}

const heroPanel = document.querySelector(".hero-panel");
const portraitFrame = document.querySelector(".portrait-frame");

if (!reducedMotion && heroPanel && portraitFrame) {
  heroPanel.addEventListener("pointermove", (event) => {
    const bounds = heroPanel.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    portraitFrame.style.setProperty("--portrait-x", `${(-y * 5).toFixed(2)}deg`);
    portraitFrame.style.setProperty("--portrait-y", `${(x * 7).toFixed(2)}deg`);
  });
  heroPanel.addEventListener("pointerleave", () => {
    portraitFrame.style.removeProperty("--portrait-x");
    portraitFrame.style.removeProperty("--portrait-y");
  });
}

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const company = String(data.get("company") || "").trim();
  const message = String(data.get("message") || "").trim();
  const subject = `Ab Initio opportunity${company ? ` at ${company}` : ""}`;
  const body = [
    `Hello Mohammad,`,
    "",
    message,
    "",
    `From: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:abutalib.talib@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (status) status.textContent = "Opening your email app. If nothing happens, use the email link beside the form.";
  window.location.href = mailto;
});
