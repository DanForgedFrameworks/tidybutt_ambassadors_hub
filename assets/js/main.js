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
      let leaves = [];
      let frame = 0;
      let animationId = null;

      function resize() {
        const rect = parent.getBoundingClientRect();
        width = Math.max(10, Math.floor(rect.width));
        height = Math.max(260, Math.floor(rect.height));
        canvas.width = width;
        canvas.height = height;
      }

      function makeDrop() {
        return {
          x: Math.random() * width,
          y: -20 - Math.random() * height * 0.3,
          speed: 1.1 + Math.random() * 1.3,
          radius: 1.5 + Math.random() * 1.8,
          ripple: false,
          rippleR: 0,
          rippleA: 0.20 + Math.random() * 0.1,
          tint: Math.random() > 0.5 ? "rgba(107,32,210,0.18)" : "rgba(67,167,227,0.18)"
        };
      }

      function makeLeaf() {
        return {
          x: width + 20 + Math.random() * 120,
          y: Math.random() * height,
          size: 6 + Math.random() * 8,
          dx: -(0.25 + Math.random() * 0.35),
          dy: -0.04 + Math.random() * 0.08,
          sway: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? "rgba(240,136,56,0.10)" : "rgba(107,32,210,0.08)"
        };
      }

      function seed() {
        drops = [];
        leaves = [];
        for (let i = 0; i < 16; i += 1) drops.push(makeDrop());
        for (let i = 0; i < 6; i += 1) leaves.push(makeLeaf());
      }

      function drawDrop(drop) {
        if (!drop.ripple) {
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
          ctx.fillStyle = drop.tint;
          ctx.fill();

          drop.y += drop.speed;
          if (drop.y > height * 0.72 + Math.random() * height * 0.18) {
            drop.ripple = true;
            drop.rippleR = 1;
          }
        } else {
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${drop.rippleA})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();

          drop.rippleR += 0.8;
          drop.rippleA *= 0.97;

          if (drop.rippleR > 24 || drop.rippleA < 0.03) {
            Object.assign(drop, makeDrop());
          }
        }
      }

      function drawLeaf(leaf) {
        const swayX = Math.sin(frame * 0.02 + leaf.sway) * 8;
        const swayR = Math.sin(frame * 0.015 + leaf.sway) * 0.35;

        ctx.save();
        ctx.translate(leaf.x + swayX, leaf.y);
        ctx.rotate(leaf.rot + swayR);
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size * 1.4, leaf.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        leaf.x += leaf.dx;
        leaf.y += leaf.dy;

        if (leaf.x < -80 || leaf.y < -40 || leaf.y > height + 40) {
          Object.assign(leaf, makeLeaf());
        }
      }

      function render() {
        frame += 1;
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "rgba(8,18,40,0.00)");
        grad.addColorStop(0.5, "rgba(67,167,227,0.04)");
        grad.addColorStop(1, "rgba(107,32,210,0.03)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        drops.forEach(drawDrop);
        leaves.forEach(drawLeaf);

        animationId = requestAnimationFrame(render);
      }

      resize();
      seed();
      render();
      window.addEventListener("resize", resize);

      parent.addEventListener("remove", () => {
        if (animationId) cancelAnimationFrame(animationId);
      });
    });
  }

  function initAccordions() {
    const accordions = document.querySelectorAll(".tb-accordion");
    accordions.forEach((acc) => {
      const buttons = acc.querySelectorAll(".tb-accordion-trigger");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = btn.closest(".tb-accordion-item");
          if (!item) return;
          item.classList.toggle("is-open");
          const expanded = item.classList.contains("is-open");
          btn.setAttribute("aria-expanded", expanded ? "true" : "false");
        });
      });
    });
  }

  function initRolesCarousel() {
    const carousels = document.querySelectorAll("[data-role-carousel]");
    carousels.forEach((carousel) => {
      const cards = Array.from(carousel.querySelectorAll(".role-card"));
      const prev = carousel.parentElement.querySelector("[data-carousel-prev]");
      const next = carousel.parentElement.querySelector("[data-carousel-next]");
      if (!cards.length || !prev || !next) return;

      let index = 0;

      function render() {
        cards.forEach((card, i) => {
          card.classList.remove("is-active", "is-left", "is-right", "is-hidden");
          if (i === index) card.classList.add("is-active");
          else if (i === (index - 1 + cards.length) % cards.length) card.classList.add("is-left");
          else if (i === (index + 1) % cards.length) card.classList.add("is-right");
          else card.classList.add("is-hidden");
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

      render();
    });
  }

  window.addEventListener("layout:ready", () => {
    initAmbientCanvas();
    initAccordions();
    initRolesCarousel();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initAmbientCanvas();
      initAccordions();
      initRolesCarousel();
    });
  } else {
    initAmbientCanvas();
    initAccordions();
    initRolesCarousel();
  }
})();
