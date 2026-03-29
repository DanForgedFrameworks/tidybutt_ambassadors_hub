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
        height = Math.max(340, Math.floor(parent.scrollHeight || rect.height || 340));
        canvas.width = width;
        canvas.height = height;
      }

      function makeDrop(seedY = null) {
        return {
          x: Math.random() * width,
          y: seedY ?? (-40 - Math.random() * 120),
          len: 10 + Math.random() * 16,
          speed: 4.2 + Math.random() * 3.6,
          drift: -0.15 + Math.random() * 0.3,
          alpha: 0.18 + Math.random() * 0.18
        };
      }

      function makeLeaf() {
        return {
          x: -60 - Math.random() * 160,
          y: Math.random() * height,
          size: 7 + Math.random() * 10,
          dx: 0.35 + Math.random() * 0.45,
          dy: -0.05 + Math.random() * 0.10,
          sway: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? "rgba(240,136,56,0.10)" : "rgba(107,32,210,0.08)"
        };
      }

      function seed() {
        drops = [];
        ripples = [];
        leaves = [];
        const dropCount = Math.max(18, Math.floor(width / 70));
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
          alpha: 0.26 + Math.random() * 0.10,
          line: 1.1 + Math.random() * 0.5
        });
      }

      function drawRain() {
        drops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.drift * 4, drop.y + drop.len);
          ctx.strokeStyle = `rgba(255,255,255,${drop.alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          drop.x += drop.drift;
          drop.y += drop.speed;

          const splashLine = height * 0.78 + Math.sin((drop.x + frame) * 0.01) * 8;
          if (drop.y > splashLine) {
            addRipple(drop.x, splashLine);
            Object.assign(drop, makeDrop());
          }
        });
      }

      function drawRipples() {
        ripples.forEach((ripple) => {
          for (let i = 0; i < 3; i += 1) {
            ctx.beginPath();
            ctx.ellipse(
              ripple.x,
              ripple.y,
              ripple.r + i * 7,
              (ripple.r + i * 7) * 0.34,
              0,
              0,
              Math.PI * 2
            );
            ctx.strokeStyle = `rgba(255,255,255,${Math.max(ripple.alpha - i * 0.05, 0)})`;
            ctx.lineWidth = ripple.line;
            ctx.stroke();
          }

          ripple.r += 0.85;
          ripple.alpha *= 0.972;
        });

        ripples = ripples.filter((r) => r.alpha > 0.025 && r.r < 42);
      }

      function drawLeaf(leaf) {
        const swayX = Math.sin(frame * 0.018 + leaf.sway) * 6;
        const swayY = Math.cos(frame * 0.015 + leaf.sway) * 2;
        const swayR = Math.sin(frame * 0.012 + leaf.sway) * 0.35;

        ctx.save();
        ctx.translate(leaf.x + swayX, leaf.y + swayY);
        ctx.rotate(leaf.rot + swayR);
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size * 0.9);
        ctx.quadraticCurveTo(leaf.size * 0.9, -leaf.size * 0.1, 0, leaf.size);
        ctx.quadraticCurveTo(-leaf.size * 0.9, -leaf.size * 0.1, 0, -leaf.size * 0.9);
        ctx.fill();
        ctx.restore();

        leaf.x += leaf.dx;
        leaf.y += leaf.dy;

        if (leaf.x > width + 80 || leaf.y < -40 || leaf.y > height + 40) {
          Object.assign(leaf, makeLeaf());
        }
      }

      function render() {
        frame += 1;
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "rgba(107,32,210,0.06)");
        grad.addColorStop(0.5, "rgba(67,167,227,0.05)");
        grad.addColorStop(1, "rgba(240,136,56,0.04)");
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

        if (isOpen) {
          restartReveal(revealTarget);
        }

        btn.addEventListener("click", () => {
          const currentlyOpen = item.classList.contains("is-open");
          item.classList.toggle("is-open");
          const nowOpen = !currentlyOpen;
          btn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
          prepAccordionPanel(panel, nowOpen);

          if (nowOpen) {
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
