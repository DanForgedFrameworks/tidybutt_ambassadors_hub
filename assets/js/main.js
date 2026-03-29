(function () {
  const SITE_ROOT = "/tidybutt_ambassadors_hub/";
  const EXPRESS_INTEREST_LINK = "mailto:hello@tidybutt.co.uk?subject=Expression%20of%20interest%20%E2%80%93%20Tidy%20Butt%20Ambassador&body=Introduce%20yourself%3A%0A%0AWhy%20would%20you%20like%20to%20get%20involved%3F%0A%0ATell%20us%20a%20bit%20about%20your%20interests%2C%20skills%2C%20or%20any%20ideas%20you%20have%3A%0A%0A";

  function normalisePath(p) {
    return (p || "/")
      .replace(/\/index\.html$/i, "/")
      .replace(/\/+$/, "/");
  }

  const path = normalisePath(window.location.pathname);

  const navItems = [
    { href: SITE_ROOT, label: "Home", key: "home" },
    { href: SITE_ROOT + "overview/", label: "Overview", key: "overview" },
    { href: SITE_ROOT + "downloads/", label: "Downloads", key: "downloads" },
    { href: SITE_ROOT + "support/", label: "Support and contact", key: "support" }
  ];

  function getActiveKeyByPath() {
    if (path === SITE_ROOT) return "home";
    if (path.includes("/overview/")) return "overview";
    if (path.includes("/downloads/")) return "downloads";
    if (path.includes("/support/")) return "support";
    if (path.includes("/about/")) return "overview";
    if (path.includes("/getting-started/")) return "overview";
    return "home";
  }

  const pageContentEl = document.querySelector("[data-page-content]");
  if (!pageContentEl) return;

  const explicitActive = (pageContentEl.getAttribute("data-active") || "").trim();
  const activeKey = explicitActive ? explicitActive : getActiveKeyByPath();
  const wantsSidebar = pageContentEl.getAttribute("data-sidebar") === "true";

  const isHome =
    path === SITE_ROOT ||
    path === "/tidybutt_ambassadors_hub/" ||
    path === "/tidybutt_ambassadors_hub/index.html";

  const sidebarHtml = wantsSidebar
    ? `
      <aside class="coursehub" aria-label="Ambassador hub navigation">
        <div class="coursehub-inner">
          <p class="coursehub-title">Ambassador hub</p>
          <nav aria-label="Primary">
            <ul class="coursehub-list">
              ${navItems
                .filter((n) => n.key !== "home")
                .map((n) => {
                  const isActive = n.key === activeKey;
                  return `<li>
                    <a class="coursehub-link ${isActive ? "is-active" : ""}"
                       href="${n.href}"
                       ${isActive ? 'aria-current="page"' : ""}>
                      ${n.label}
                    </a>
                  </li>`;
                })
                .join("")}
            </ul>
          </nav>
        </div>
      </aside>
    `
    : "";

  const headerHtml = `
    <a class="skip-link" href="#main">Skip to main content</a>

    <div class="topstrip" role="region" aria-label="Ambassador support strip">
      <div class="topstrip-inner">
        <span>Ambassador support</span>
        <span aria-hidden="true">•</span>
        <a href="${SITE_ROOT}support/">Support and contact</a>
      </div>
    </div>

    <header class="siteheader" aria-label="Site header">
      <div class="siteheader-inner">
        <a class="brand" href="${SITE_ROOT}">
          <img class="brand-logo" src="${SITE_ROOT}assets/img/tidybutt-logo.png" alt="Tidy Butt logo" />
          <div class="brand-text">
            <div class="brand-title">Tidy Butt Ambassadors Hub</div>
            <div class="brand-subtitle">Y cam cyntaf i lysgenhadon</div>
          </div>
        </a>

        ${
          isHome
            ? ""
            : `
          <nav class="topnav" aria-label="Top navigation">
            <a class="topnav-pill ${activeKey === "home" ? "is-active" : ""}" href="${SITE_ROOT}">Home</a>
            <a class="topnav-pill ${activeKey === "overview" ? "is-active" : ""}" href="${SITE_ROOT}overview/">Overview</a>
            <a class="topnav-pill ${activeKey === "downloads" ? "is-active" : ""}" href="${SITE_ROOT}downloads/">Downloads</a>
            <a class="topnav-pill ${activeKey === "support" ? "is-active" : ""}" href="${SITE_ROOT}support/">Support and contact</a>
          </nav>
        `
        }
      </div>
    </header>
  `;

  const footerHtml = `
    <footer class="sitefooter" aria-label="Site footer">
      <div class="sitefooter-inner">
        <div class="footergrid">
          <div class="footercol">
            <img class="footerlogo" src="${SITE_ROOT}assets/img/tidybutt-logo.png" alt="Tidy Butt logo" />
            <p class="small">Registered Charity 1195392</p>
          </div>

          <div class="footercol">
            <p><strong>Navigation</strong></p>
            <ul class="footerlinks">
              <li><a href="${SITE_ROOT}overview/">Overview</a></li>
              <li><a href="${SITE_ROOT}downloads/">Downloads</a></li>
              <li><a href="${SITE_ROOT}support/">Support and contact</a></li>
            </ul>
          </div>

          <div class="footercol">
            <p><strong>Socials</strong></p>
            <ul class="footerlinks">
              <li><a href="https://www.facebook.com/tidybuttmat">Facebook</a></li>
              <li><a href="https://www.instagram.com/tidy_butt">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div class="footerfineprint">
          <p class="small">© Tidy Butt. If you notice anything incorrect, please contact Tidy Butt.</p>
        </div>
      </div>
    </footer>
  `;

  const shell = document.createElement("div");
  shell.className = "pageshell";
  shell.setAttribute("data-page-key", activeKey);

  shell.innerHTML = `
    ${headerHtml}
    <main id="main" class="pagemain">
      <div class="pagelayout ${wantsSidebar ? "has-sidebar" : "no-sidebar"}">
        ${sidebarHtml}
        <section class="pagepanel" aria-label="Page content">
          <div class="pagepanel-inner" id="pagepanel-inner"></div>
        </section>
      </div>
    </main>
    ${footerHtml}
    <div class="express-interest-float">
      <a href="${EXPRESS_INTEREST_LINK}">Express interest</a>
    </div>
  `;

  const target = shell.querySelector("#pagepanel-inner");
  target.appendChild(pageContentEl);

  document.body.innerHTML = "";
  document.body.appendChild(shell);

  window.dispatchEvent(new Event("layout:ready"));
})();

(function addFavicons() {
  const base = "/tidybutt_ambassadors_hub";

  const already =
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[rel="shortcut icon"]') ||
    document.querySelector('link[rel="apple-touch-icon"]') ||
    document.querySelector('link[rel="manifest"]');

  if (already) return;

  const head = document.head;
  if (!head) return;

  const links = [
    { rel: "icon", type: "image/png", sizes: "96x96", href: `${base}/favicon-96x96.png` },
    { rel: "icon", type: "image/svg+xml", href: `${base}/favicon.svg` },
    { rel: "shortcut icon", href: `${base}/favicon.ico` },
    { rel: "apple-touch-icon", sizes: "180x180", href: `${base}/apple-touch-icon.png` },
    { rel: "manifest", href: `${base}/site.webmanifest` }
  ];

  links.forEach(attrs => {
    const link = document.createElement("link");
    Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v));
    head.appendChild(link);
  });

  const meta = document.createElement("meta");
  meta.setAttribute("name", "apple-mobile-web-app-title");
  meta.setAttribute("content", "Tidy Butt Ambassadors Hub");
  head.appendChild(meta);
})();
