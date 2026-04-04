(function () {
  function initAmbientCanvas() {
    const canvases = document.querySelectorAll(".hero-ripple-canvas");

    canvases.forEach((canvas) => {
      if (canvas.dataset.ambientReady === "true") return;
      canvas.dataset.ambientReady = "true";

      const parent = canvas.parentElement;
      if (!parent) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        height = Math.max(300, Math.floor(rect.height));

        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      function makeDrop(seedY = null) {
        return {
          x: Math.random() * width,
          y: seedY ?? (-80 - Math.random() * 140),
          len: 10 + Math.random() * 14,
          speed: 2.6 + Math.random() * 1.8,
          drift: -0.07 + Math.random() * 0.14,
          alpha: 0.08 + Math.random() * 0.08
        };
      }

      function makeLeaf() {
        const variants = ["rounded", "curled", "slender"];
        const orangeBias = Math.random() < 0.48;
        return {
          variant: variants[Math.floor(Math.random() * variants.length)],
          x: -60 - Math.random() * 140,
          y: Math.random() * height,
          size: 9 + Math.random() * 10,
          dx: 0.14 + Math.random() * 0.26,
          dy: -0.04 + Math.random() * 0.08,
          sway: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          pace: 0.7 + Math.random() * 0.9,
          alpha: 0.030 + Math.random() * 0.035,
          colorBase: orangeBias ? "240,136,56" : "107,32,210"
        };
      }

      function seed() {
        drops = [];
        ripples = [];
        leaves = [];

        const dropCount = prefersReducedMotion ? 0 : Math.max(12, Math.floor(width / 105));
        const leafCount = prefersReducedMotion ? 2 : Math.max(6, Math.floor(width / 260));

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
          r: 1.5,
          alpha: 0.10 + Math.random() * 0.08,
          line: 0.8 + Math.random() * 0.35
        });
      }

      function currentSurfaceY(x) {
        const waterTop = height * 0.80;
        return (
          waterTop +
          Math.sin((x * 0.010) + frame * 0.013) * 3.2 +
          Math.sin((x * 0.018) + frame * 0.008) * 1.6
        );
      }

      function drawWaterSurface() {
        const waterTop = height * 0.80;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width + 8; x += 8) {
          ctx.lineTo(x, currentSurfaceY(x));
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waterGrad = ctx.createLinearGradient(0, waterTop - 10, 0, height);
        waterGrad.addColorStop(0, "rgba(255,255,255,0.04)");
        waterGrad.addColorStop(1, "rgba(255,255,255,0.012)");
        ctx.fillStyle = waterGrad;
        ctx.fill();
        ctx.restore();
      }

      function drawRain() {
        drops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.drift * 4, drop.y + drop.len);
          ctx.strokeStyle = `rgba(255,255,255,${drop.alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          drop.x += drop.drift;
          drop.y += drop.speed;

          const surfaceY = currentSurfaceY(drop.x);

          if (drop.y + drop.len >= surfaceY) {
            addRipple(drop.x, surfaceY);
            Object.assign(drop, makeDrop());
          }

          if (drop.y > height + 30 || drop.x < -30 || drop.x > width + 30) {
            Object.assign(drop, makeDrop());
          }
        });
      }

      function drawRipples() {
        ripples.forEach((ripple) => {
          for (let i = 0; i < 2; i += 1) {
            const radius = ripple.r + i * 6;

            ctx.beginPath();
            ctx.ellipse(
              ripple.x,
              ripple.y,
              radius,
              radius * 0.26,
              0,
              0,
              Math.PI * 2
            );
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(ripple.alpha - i * 0.04, 0)})`;
            ctx.lineWidth = ripple.line;
            ctx.stroke();
          }

          ripple.r += 0.52;
          ripple.alpha *= 0.968;
        });

        ripples = ripples.filter((r) => r.alpha > 0.015 && r.r < 32);
      }

      function drawLeafShape(leaf) {
        if (leaf.variant === "rounded") {
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size);
          ctx.bezierCurveTo(
            leaf.size * 0.88, -leaf.size * 0.30,
            leaf.size * 0.80, leaf.size * 0.70,
            0, leaf.size
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.84, leaf.size * 0.64,
            -leaf.size * 0.92, -leaf.size * 0.28,
            0, -leaf.size
          );
          ctx.fill();
        } else if (leaf.variant === "curled") {
          ctx.beginPath();
          ctx.moveTo(-leaf.size * 0.18, -leaf.size);
          ctx.bezierCurveTo(
            leaf.size * 0.74, -leaf.size * 0.70,
            leaf.size * 0.82, leaf.size * 0.18,
            leaf.size * 0.10, leaf.size
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.42, leaf.size * 0.48,
            -leaf.size * 0.52, -leaf.size * 0.10,
            -leaf.size * 0.18, -leaf.size
          );
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 1.05);
          ctx.bezierCurveTo(
            leaf.size * 0.36, -leaf.size * 0.28,
            leaf.size * 0.28, leaf.size * 0.72,
            0, leaf.size
          );
          ctx.bezierCurveTo(
            -leaf.size * 0.28, leaf.size * 0.68,
            -leaf.size * 0.38, -leaf.size * 0.22,
            0, -leaf.size * 1.05
          );
          ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(0, -leaf.size * 0.78);
        ctx.lineTo(0, leaf.size * 0.82);
        ctx.stroke();
      }

      function drawLeaves() {
        leaves.forEach((leaf) => {
          const swayX = Math.sin(frame * (0.0045 * leaf.pace) + leaf.sway) * 4;
          const swayY = Math.cos(frame * (0.0032 * leaf.pace) + leaf.sway) * 1.2;
          const swayR = Math.sin(frame * (0.0030 * leaf.pace) + leaf.sway) * 0.12;

          ctx.save();
          ctx.translate(leaf.x + swayX, leaf.y + swayY);
          ctx.rotate(leaf.rot + swayR);

          ctx.fillStyle = `rgba(${leaf.colorBase},${leaf.alpha})`;
          ctx.strokeStyle = `rgba(${leaf.colorBase},${leaf.alpha * 1.55})`;
          ctx.lineWidth = 0.65;

          drawLeafShape(leaf);
          ctx.restore();

          leaf.x += leaf.dx * leaf.pace;
          leaf.y += leaf.dy * leaf.pace;

          if (leaf.x > width + 80 || leaf.y < -40 || leaf.y > height + 40) {
            Object.assign(leaf, makeLeaf());
          }
        });
      }

      function render() {
        frame += 1;
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "rgba(107,32,210,0.05)");
        grad.addColorStop(0.5, "rgba(67,167,227,0.04)");
        grad.addColorStop(1, "rgba(240,136,56,0.03)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        drawWaterSurface();

        if (!prefersReducedMotion) {
          drawRain();
          drawRipples();
        }

        drawLeaves();

        animationId = requestAnimationFrame(render);
      }

      function onResize() {
        resize();
        seed();
      }

      resize();
      seed();
      render();

      window.addEventListener("resize", onResize);

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
