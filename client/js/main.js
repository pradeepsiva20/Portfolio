// ============================================================
// Config — point this at your deployed backend when you host it.
// While developing locally with `npm start` in /server, this default works.
// ============================================================
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:4000"
  : ""; // set this to your deployed backend URL, e.g. "https://your-api.onrender.com"

// ------------------------------------------------------------
// Mobile nav toggle
// ------------------------------------------------------------
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");
navToggle?.addEventListener("click", () => {
  navMobile.classList.toggle("open");
});
navMobile?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navMobile.classList.remove("open"));
});

// ------------------------------------------------------------
// Scroll reveal for sections
// ------------------------------------------------------------
const revealTargets = document.querySelectorAll(
  ".section-head, .about-grid, .skill-card, .project-card, .tl-item, .contact-grid"
);
revealTargets.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach(el => io.observe(el));

// ------------------------------------------------------------
// KPI count-up animation (hero panel)
// ------------------------------------------------------------
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const kpiObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        kpiObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll(".kpi-value[data-count]").forEach(el => kpiObserver.observe(el));

// ------------------------------------------------------------
// Contact form -> backend API
// ------------------------------------------------------------
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  status.textContent = "";
  status.className = "form-status";

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Something went wrong");

    status.textContent = "Message sent — thanks for reaching out, I'll reply soon.";
    status.classList.add("ok");
    form.reset();
  } catch (err) {
    status.textContent = "Couldn't send that. Please email me directly at Pradeep200420@gmail.com.";
    status.classList.add("err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
