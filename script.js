document.documentElement.classList.add("js-ready");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const contactFeedback = document.getElementById("contactFeedback");
const appointmentFeedback = document.getElementById("appointmentFeedback");

const setMenuState = (isOpen) => {
  if (!menuToggle || !navLinks) return;

  navLinks.classList.toggle("active", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");

  const icon = menuToggle.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-bars", !isOpen);
    icon.classList.toggle("fa-xmark", isOpen);
  }
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuState(!navLinks.classList.contains("active"));
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      setMenuState(false);
    }
  });
}

const updateFeedbackFromUrl = (feedback, parameter, successMessage, errorMessage) => {
  if (!feedback) return;

  const status = new URLSearchParams(window.location.search).get(parameter);
  if (status === "success") {
    feedback.textContent = successMessage;
    feedback.className = "contact-feedback success";
  } else if (status === "error") {
    feedback.textContent = errorMessage;
    feedback.className = "contact-feedback error";
  }
};

updateFeedbackFromUrl(
  contactFeedback,
  "contact",
  "Merci, votre message a bien été envoyé.",
  "Votre message n'a pas pu être envoyé. Vérifiez les informations et réessayez."
);

updateFeedbackFromUrl(
  appointmentFeedback,
  "appointment",
  "Votre demande a été envoyée. Nous vous contacterons pour confirmer le rendez-vous.",
  "Votre demande n'a pas pu être envoyée. Vérifiez les informations et réessayez."
);

const appointmentDate = document.querySelector('input[name="appointment_date"]');
if (appointmentDate) {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  appointmentDate.min = localDate;
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("active"));
}

const counterElements = document.querySelectorAll(".counter[data-target]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setCounterValue = (counter, value) => {
  counter.textContent = new Intl.NumberFormat("fr-FR").format(value);
};

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target);
  if (!Number.isFinite(target)) return;

  if (prefersReducedMotion) {
    setCounterValue(counter, target);
    return;
  }

  const duration = 1700;
  const startTime = performance.now();
  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  const updateCounter = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    setCounterValue(counter, Math.round(target * easeOutCubic(progress)));

    if (progress < 1) {
      window.requestAnimationFrame(updateCounter);
    }
  };

  window.requestAnimationFrame(updateCounter);
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counterElements.forEach((counter) => counterObserver.observe(counter));
} else {
  counterElements.forEach(animateCounter);
}

const hidePreloader = () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  window.requestAnimationFrame(() => {
    preloader.classList.add("hidden");
    window.setTimeout(() => preloader.remove(), 450);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hidePreloader, { once: true });
} else {
  hidePreloader();
}

const setupAsyncForm = (form, feedback, successMessage, errorMessage) => {
  if (!form || !feedback) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const originalText = button ? button.innerHTML : "";
    feedback.className = "contact-feedback success";
    feedback.textContent = "Envoi en cours...";

    if (button) {
      button.disabled = true;
      button.textContent = "Envoi en cours...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Form submission failed");
      }

      form.reset();
      if (appointmentDate) {
        appointmentDate.min = new Date().toISOString().split("T")[0];
      }
      feedback.className = "contact-feedback success";
      feedback.textContent = successMessage;
    } catch (error) {
      feedback.className = "contact-feedback error";
      feedback.textContent = errorMessage;
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    }
  });
};

setupAsyncForm(
  document.querySelector('form[action="contact.php"]'),
  contactFeedback,
  "Merci, votre message a bien été envoyé.",
  "Votre message n'a pas pu être envoyé. Vérifiez les informations et réessayez."
);

setupAsyncForm(
  document.querySelector('form[action="appointment.php"]'),
  appointmentFeedback,
  "Votre demande a été envoyée. Nous vous contacterons pour confirmer le rendez-vous.",
  "Votre demande n'a pas pu être envoyée. Vérifiez les informations et réessayez."
);
