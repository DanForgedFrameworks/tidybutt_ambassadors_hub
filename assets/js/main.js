(function () {
  function initAmbientCanvas() {
    const canvases = document.querySelectorAll(".hero-ripple-canvas");

    canvases.forEach((canvas) => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let drops = [];
      let ripples = [];
      let leaves = [];
      let frame = 0;
      let animationId = null;

      function resize() {
        const rect = parent.getBoundingClientRect();
        width = Math.max(10, Math.floor(rect.width));
        height = Math.max(320, Math.floor(rect.height));
        canvas.width = width;
        canvas.height = height;
      }

      function makeDrop(seedY = null) {
        return {
          x: Math.random() * width,
          y: seedY ?? (-40 - Math.random() * 120),
          len: 12 + Math.random() * 18,
          speed: 4.6 + Math.random() * 3.4,
          drift: -0.2 + Math.random() * 0.35,
          alpha: 0.46 + Math.random() * 0.24
        };
      }

      function makeLeaf() {
        const variants = ["rounded", "curled", "slender", "double"];
        const variant = variants[Math.floor(Math.random() * variants.length)];

        return {
          variant,
          x: -80 - Math.random() * 180,
          y: Math.random() * height,
          size: 8 + Math.random() * 12,
          dx: 0.28 + Math.random() * 0.55,
          dy: -0.10 + Math.random() * 0.20,
          sway: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          curl: 0.35 + Math.random() * 0.45,
          alpha: 0.10 + Math.random() * 0.08,
          colorBase: Math.random() > 0.5 ? "240,136,56" : "107,32,210"
        };
      }

      function seed() {
        drops = [];
        ripples = [];
        leaves = [];

        const dropCount = Math.max(24, Math.floor(width / 55));
        const leafCount = Math.max(5, Math.floor(width / 260));

        for (let i = 0; i < dropCount; i += 1) {
          drops.push(makeDrop(Math.random() * height));
        }

        for (let i = 0; i < leafCount; i += 1) {
          leaves.push(makeLeaf());
        }
      }

      function addRipple(x, y) {
        ripples.push({
          x,
          y,
          r: 2,
          alpha: 0.48 + Math.random() * 0.18,
          line: 1.3 + Math.random() * 0.5
        });
      }
      function drawRain() {
        drops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.drift * 4, drop.y + drop.len);
          ctx.strokeStyle = `rgba(255,255,255,${drop.alpha})`;
          ctx.lineWidth = 1.35;
          ctx.stroke();

          drop.x += drop.drift;
          drop.y += drop.speed;

          const waterTop = height * 0.60;
          const waterDepth = height * 0.30;
          const surfaceY =
            waterTop +
            Math.sin((drop.x + frame) * 0.01) * 6 +
            Math.sin((drop.x * 0.025) + frame * 0.012) * 4;

          const rippleY = Math.min(
            height - 24,
            Math.max(waterTop, surfaceY + Math.random() * waterDepth * 0.35)
          );

          if (drop.y > rippleY) {
            addRipple(drop.x, rippleY);
            Object.assign(drop, makeDrop());
          }
        });
      }
      function drawRipples() {
        ripples.forEach((ripple) => {
          for (let i = 0; i < 4; i += 1) {
            const radius = ripple.r + i * 8;

            ctx.beginPath();
            ctx.ellipse(
              ripple.x,
              ripple.y,
              radius,
              radius * 0.32,
              0,
              0,
              Math.PI * 2
            );
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(ripple.alpha - i * 0.07, 0)})`;
            ctx.lineWidth = ripple.line;
            ctx.stroke();
          }

          ripple.r += 0.72;
          ripple.alpha *= 0.978;
        });

        ripples = ripples.filter((r) => r.alpha > 0.02 && r.r < 58);
      }
      
      function drawLeaf(leaf) {
        const swayX = Math.sin(frame * 0.018 + leaf.sway) * 7;
        const swayY = Math.cos(frame * 0.014 + leaf.sway) * 2.5;
        const swayR = Math.sin(frame * 0.010 + leaf.sway) * 0.42;

        ctx.save();
        ctx.translate(leaf.x + swayX, leaf.y + swayY);
        ctx.rotate(leaf.rot + swayR);
        ctx.fillStyle = `rgba(${leaf.colorBase},${leaf.alpha})`;
        ctx.strokeStyle = `rgba(${leaf.colorBase},${Math.min(leaf.alpha + 0.06, 0.24)})`;
        ctx.lineWidth = 1;

        if (leaf.variant === "rounded") {
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size);
          ctx.bezierCurveTo(
            leaf.size * 0.95, -leaf.size * 0.40,
            leaf.size * 0.82, leaf.size * 0.72,
            0, leaf.size
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.92, leaf.size * 0.68,
            -leaf.size * 0.98, -leaf.size * 0.36,
            0, -leaf.size
          );
          ctx.fill();
        } else if (leaf.variant === "curled") {
          ctx.beginPath();
          ctx.moveTo(-leaf.size * 0.22, -leaf.size);
          ctx.bezierCurveTo(
            leaf.size * 0.88, -leaf.size * 0.82,
            leaf.size * 0.92, leaf.size * 0.22,
            leaf.size * 0.14, leaf.size
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.50, leaf.size * 0.54,
            -leaf.size * 0.58, -leaf.size * 0.10,
            -leaf.size * 0.22, -leaf.size
          );
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(leaf.size * 0.05, -leaf.size * 0.72);
          ctx.quadraticCurveTo(
            leaf.size * 0.72, -leaf.size * 0.10,
            leaf.size * 0.22, leaf.size * 0.42
          );
          ctx.stroke();
        } else if (leaf.variant === "slender") {
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 1.15);
          ctx.bezierCurveTo(
            leaf.size * 0.45, -leaf.size * 0.35,
            leaf.size * 0.34, leaf.size * 0.78,
            0, leaf.size * 1.05
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.30, leaf.size * 0.70,
            -leaf.size * 0.44, -leaf.size * 0.28,
            0, -leaf.size * 1.15
          );
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size);
          ctx.bezierCurveTo(
            leaf.size * 0.82, -leaf.size * 0.28,
            leaf.size * 0.62, leaf.size * 0.48,
            0, leaf.size * 0.55
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.66, leaf.size * 0.46,
            -leaf.size * 0.80, -leaf.size * 0.22,
            0, -leaf.size
          );
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 0.28);
          ctx.bezierCurveTo(
            leaf.size * 0.66, 0,
            leaf.size * 0.56, leaf.size * 0.88,
            0, leaf.size * 1.02
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.52, leaf.size * 0.84,
            -leaf.size * 0.60, 0,
            0, -leaf.size * 0.28
          );
          ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(0, -leaf.size * 0.86);
        ctx.lineTo(0, leaf.size * 0.90);
        ctx.stroke();

        leaf.x += leaf.dx;
        leaf.y += leaf.dy;

        if (leaf.x > width + 100 || leaf.y < -60 || leaf.y > height + 60) {
          Object.assign(leaf, makeLeaf());
        }
      }

      function render() {
        frame += 1;
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "rgba(107,32,210,0.08)");
        grad.addColorStop(0.5, "rgba(67,167,227,0.06)");
        grad.addColorStop(1, "rgba(240,136,56,0.05)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        drawRain();
        drawRipples();
        leaves.forEach(drawLeaf);

        animationId = requestAnimationFrame(render);
      }

      resize();
      seed();
      render();

      window.addEventListener("resize", () => {
        resize();
        seed();
      });

      window.addEventListener("beforeunload", () => {
        if (animationId) cancelAnimationFrame(animationId);
      });
    });
  }

  function prepAccordionPanel(panel, open) {
    if (!panel) return;
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";
  }

  function restartReveal(container) {
    if (!container) return;
    container.classList.remove("is-revealing");
    void container.offsetWidth;
    container.classList.add("is-revealing");
  }

  function openAccordionById(id) {
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    const item = target.classList.contains("tb-accordion-item")
      ? target
      : target.closest(".tb-accordion-item");

    if (!item) return;

    const btn = item.querySelector(".tb-accordion-trigger");
    const panel = item.querySelector(".tb-accordion-panel");
    const revealTarget = item.querySelector(".tb-chip-cloud") || item.querySelector(".reveal-stagger");

    item.classList.add("is-open");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (panel) prepAccordionPanel(panel, true);
    if (revealTarget) restartReveal(revealTarget);

    setTimeout(() => {
      item.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function initAccordions() {
    const accordions = document.querySelectorAll(".tb-accordion");

    accordions.forEach((acc) => {
      const items = Array.from(acc.querySelectorAll(".tb-accordion-item"));

      items.forEach((item) => {
        const btn = item.querySelector(".tb-accordion-trigger");
        const panel = item.querySelector(".tb-accordion-panel");
        const revealTarget =
          item.querySelector(".tb-chip-cloud") || item.querySelector(".reveal-stagger");

        if (!btn || !panel) return;

        const isOpen = item.classList.contains("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        prepAccordionPanel(panel, isOpen);

        if (isOpen && revealTarget) {
          restartReveal(revealTarget);
        }

        btn.addEventListener("click", () => {
          const currentlyOpen = item.classList.contains("is-open");
          item.classList.toggle("is-open");
          const nowOpen = !currentlyOpen;
          btn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
          prepAccordionPanel(panel, nowOpen);

          if (nowOpen && revealTarget) {
            restartReveal(revealTarget);
            setTimeout(() => prepAccordionPanel(panel, true), 320);
          }
        });
      });
    });

    window.addEventListener("resize", () => {
      document.querySelectorAll(".tb-accordion-item.is-open .tb-accordion-panel").forEach((panel) => {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });
    });
  }

  function initAccordionAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const raw = link.getAttribute("href");
        if (!raw || raw === "#") return;

        const id = raw.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        if (target.classList.contains("tb-accordion-item") || target.closest(".tb-accordion-item")) {
          event.preventDefault();

          if (link.hasAttribute("data-open-first-accordion")) {
            const accordion = target.closest(".tb-accordion");
            if (accordion) {
              accordion.querySelectorAll(".tb-accordion-item").forEach((item) => {
                item.classList.remove("is-open");

                const btn = item.querySelector(".tb-accordion-trigger");
                const panel = item.querySelector(".tb-accordion-panel");

                if (btn) btn.setAttribute("aria-expanded", "false");
                if (panel) prepAccordionPanel(panel, false);
              });
            }
          }

          openAccordionById(id);
        }
      });
    });

    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => openAccordionById(id), 250);
    }
  }

  function initRolesCarousel() {
    const carousels = document.querySelectorAll("[data-role-carousel]");

    carousels.forEach((carousel) => {
      const cards = Array.from(carousel.querySelectorAll(".role-card"));
      const parentWrap = carousel.closest(".roles-carousel-wrap");
      if (!parentWrap) return;

      const prev = parentWrap.querySelector("[data-carousel-prev]");
      const next = parentWrap.querySelector("[data-carousel-next]");
      if (!cards.length || !prev || !next) return;

      let index = 0;

      function render() {
        cards.forEach((card, i) => {
          card.classList.remove("is-active", "is-left", "is-right", "is-hidden");
          card.removeAttribute("tabindex");

          if (i === index) {
            card.classList.add("is-active");
          } else if (i === (index - 1 + cards.length) % cards.length) {
            card.classList.add("is-left");
          } else if (i === (index + 1) % cards.length) {
            card.classList.add("is-right");
          } else {
            card.classList.add("is-hidden");
          }

          if (!card.classList.contains("is-hidden")) {
            card.setAttribute("tabindex", "0");
          }
        });
      }

      prev.addEventListener("click", () => {
        index = (index - 1 + cards.length) % cards.length;
        render();
      });

      next.addEventListener("click", () => {
        index = (index + 1) % cards.length;
        render();
      });

      cards.forEach((card, i) => {
        card.addEventListener("click", () => {
          if (card.classList.contains("is-left") || card.classList.contains("is-right")) {
            index = i;
            render();
          }
        });
      });

      render();
    });
  }

  function initClouds() {
    document.querySelectorAll(".tb-chip-cloud").forEach((cloud) => {
      cloud.classList.remove("is-revealing");
    });
  }

  function boot() {
    initAmbientCanvas();
    initAccordions();
    initAccordionAnchorLinks();
    initRolesCarousel();
    initClouds();
  }

  window.addEventListener("layout:ready", boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
