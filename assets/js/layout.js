(function () {
  const SITE_ROOT = "/y-cam-cyntaf/";

  function normalisePath(p) {
    return (p || "/")
      .replace(/\/index\.html$/i, "/")
      .replace(/\/+$/, "/");
  }

  const path = normalisePath(window.location.pathname);

  const navItems = [
  { href: SITE_ROOT, label: "Home", key: "home" },
  { href: SITE_ROOT + "about/", label: "About the role", key: "about" },
  { href: SITE_ROOT + "roles/", label: "Roles", key: "roles" },
  { href: SITE_ROOT + "getting-started/", label: "Getting started", key: "start" },
  { href: SITE_ROOT + "support/", label: "Support", key: "support" },
  { href: SITE_ROOT + "downloads/", label: "Downloads", key: "downloads" },
  { href: SITE_ROOT + "faqs/", label: "FAQs", key: "faqs" }
];

  function getActiveKeyByPath() {
    if (path === SITE_ROOT) return "home";
    if (path.includes("/orientation/")) return "orientation";
    if (path.includes("/downloads/")) return "downloads";
    if (path.includes("/support/")) return "support";
    if (path.includes("/benchmark/")) return "benchmark";
    if (path.includes("/sessions/session-1/")) return "s1";
    if (path.includes("/sessions/session-2/")) return "s2";
    if (path.includes("/sessions/session-3/")) return "s3";
    if (path.includes("/sessions/session-4/")) return "s4";
    if (path.includes("/sessions/session-5/")) return "s5";
    if (path.includes("/sessions/session-6/")) return "s6";
    return "home";
  }

  // Find the page content
  const pageContentEl = document.querySelector("[data-page-content]");
  if (!pageContentEl) return;

  // Allow pages to explicitly set an active key (optional)
  const explicitActive = (pageContentEl.getAttribute("data-active") || "").trim();
  const activeKey = explicitActive ? explicitActive : getActiveKeyByPath();

  // Sidebar toggle
  const wantsSidebar = pageContentEl.getAttribute("data-sidebar") === "true";

  // Home detection
  const isHome =
    path === SITE_ROOT ||
    path === "/y-cam-cyntaf/" ||
    path === "/y-cam-cyntaf/index.html";

  const sidebarHtml = wantsSidebar
    ? `
      <aside class="coursehub" aria-label="Course hub navigation">
        <div class="coursehub-inner">
          <p class="coursehub-title">Course hub</p>
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

    <div class="topstrip" role="region" aria-label="Course support strip">
      <div class="topstrip-inner">
        <span>Course support</span>
        <span aria-hidden="true">•</span>
        <a href="${SITE_ROOT}support/">Support and contact</a>
      </div>
    </div>

    <header class="siteheader" aria-label="Site header">
      <div class="siteheader-inner">
        <a class="brand" href="${SITE_ROOT}">
          <img class="brand-logo" src="${SITE_ROOT}assets/img/tidybutt-logo.png" alt="Tidy Butt logo" />
          <div class="brand-text">
            <div class="brand-title">Y Cam Cyntaf</div>
            <div class="brand-subtitle">First steps in Welsh</div>
          </div>
        </a>

        ${
          isHome
            ? ""
            : `
          <nav class="topnav" aria-label="Top navigation">
            <a class="topnav-pill ${activeKey === "home" ? "is-active" : ""}" href="${SITE_ROOT}">Home</a>
            <a class="topnav-pill ${activeKey === "downloads" ? "is-active" : ""}" href="${SITE_ROOT}downloads/">Downloads</a>
            <a class="topnav-pill ${activeKey === "benchmark" ? "is-active" : ""}" href="${SITE_ROOT}benchmark/">Distance travelled</a>
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
              <li><a href="${SITE_ROOT}orientation/">Orientation</a></li>
              <li><a href="${SITE_ROOT}benchmark/">Distance travelled</a></li>
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
  `;

  const target = shell.querySelector("#pagepanel-inner");
  target.appendChild(pageContentEl);

  document.body.innerHTML = "";
  document.body.appendChild(shell);

  window.dispatchEvent(new Event("layout:ready"));
})();
(function addFavicons() {
  const base = "/y-cam-cyntaf";

  // Do not add twice
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
  meta.setAttribute("content", "Y Cam Cyntaf");
  head.appendChild(meta);
})();
