/* =========================
   MOBILE MENU
========================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {

    const isClickInsideMenu = navLinks.contains(e.target);
    const isClickToggle = menuToggle.contains(e.target);

    if (!isClickInsideMenu && !isClickToggle) {
      navLinks.classList.remove("active");
    }

  });

  document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });

  });

}

/* =========================
   SCROLL REVEAL
========================= */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }

    });

  },
  {
    threshold: 0.15
  }
);

revealElements.forEach(el => {
  revealObserver.observe(el);
});

/* =========================
   COUNTER ANIMATION
========================= */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        const counter = entry.target;

        const target = +counter.dataset.target;

        let current = 0;

        const increment = target / 100;

        const updateCounter = () => {

          current += increment;

          if (current < target) {

            counter.innerText = Math.ceil(current);

            requestAnimationFrame(updateCounter);

          } else {

            counter.innerText = target;

          }

        };

        updateCounter();

        counterObserver.unobserve(counter);

      }

    });

  },
  {
    threshold: 0.5
  }
);

counters.forEach(counter => {
  counter.innerText = "0";
  counterObserver.observe(counter);
});

/* =========================
   PRELOADER
========================= */

window.addEventListener("load", () => {

  const preloader = document.getElementById("preloader");

  if (preloader) {

    preloader.style.opacity = "0";

    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);

  }

});