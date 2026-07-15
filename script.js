document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const revealItems = [...document.querySelectorAll(".reveal")];
  const yearNode = document.querySelector("#current-year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("open");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  const updateOnScroll = () => {
    const scrollPosition = window.scrollY;
    if (header) header.classList.toggle("scrolled", scrollPosition > 24);

    let currentId = "";
    const marker = scrollPosition + Math.min(220, window.innerHeight * 0.35);
    sections.forEach((section) => {
      if (section.offsetTop <= marker) currentId = section.id;
    });

    navLinks.forEach((link) => {
      const isCurrent = currentId && link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active", Boolean(isCurrent));
      if (isCurrent) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateOnScroll);
    },
    { passive: true }
  );

  updateOnScroll();

  revealItems.forEach((item) => {
    if (item.dataset.delay) item.style.setProperty("--delay", `${item.dataset.delay}ms`);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px" }
    );

    document.documentElement.classList.add("motion-ready");
    requestAnimationFrame(() => revealItems.forEach((item) => observer.observe(item)));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
});