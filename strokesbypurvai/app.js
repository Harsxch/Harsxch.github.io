(() => {
  const S = window.SHOP, P = window.PAINTINGS, SP = window.SPACES || [];
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const money = (n) => S.currency + n.toLocaleString("en-IN");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => P.find((p) => p.id === id);
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // ---- cart ----
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("sbp-cart") || "[]").filter((id) => byId(id) && !byId(id).sold); } catch {}
  const saveCart = () => { try { localStorage.setItem("sbp-cart", JSON.stringify(cart)); } catch {} };

  // ---- static text ----
  document.title = `${S.name} — Original Paintings`;
  $("#brand").textContent = S.name;
  $("#heroTag").textContent = `${S.tagline} Original artworks, painted by hand. Pick a piece, or ask for something made just for you.`;
  $("#thanks").textContent = `Thank you for visiting ${S.name}.`;
  $("#footText").innerHTML = `<a href="https://instagram.com/${esc(S.instagram)}" target="_blank" rel="noopener">@${esc(S.instagram)}</a> · © ${new Date().getFullYear()} ${esc(S.name)}`;
  const waLink = (t) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(t)}`;

  // ---- rooms: one painting each ----
  const title = (t) => t.split(" ").map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
  const rots = [-1.2, .8, -.6, 1.1];
  $("#rooms").innerHTML = P.map((p, i) => {
    const no = String(i + 1).padStart(2, "0");
    return `<section class="room ${i % 2 ? "flip" : ""}" id="room-${p.id}" data-sec data-no="${no}" data-id="${p.id}">
      <div class="room-inner">
        <figure class="piece"><div class="spot"></div>
          <button class="mat" data-zoom="${p.id}" style="--rot:${rots[i % 4]}deg" aria-label="View ${esc(p.title)} larger"><img src="${esc(p.image)}" alt="${esc(p.title)}, ${esc(p.medium)}" loading="${i < 2 ? "eager" : "lazy"}"></button>
          <figcaption class="cap">No. ${no}</figcaption></figure>
        <div class="info">
          <p class="hand cat fade">catalogue no. ${no}</p>
          <h2>${title(p.title)}</h2>
          <p class="desc fade">${esc(p.desc)}</p>
          <div class="facts fade"><div>Medium<b>${esc(p.medium)}</b></div><div>Size<b>${esc(p.size)}</b></div><div>Edition<b>Original</b></div></div>
          <div class="buy fade"><span class="price">${p.sold ? "Sold" : money(p.price)}</span>
            <button class="btn" data-add="${p.id}" ${p.sold ? "disabled" : ""}>${p.sold ? "Sold out" : cart.includes(p.id) ? "In your cart" : "Add to cart"}</button></div>
        </div>
      </div></section>`;
  }).join("");

  // jump rail in hero
  $("#rail").innerHTML = P.map((p) => `<button data-jump="${p.id}" aria-label="Go to ${esc(p.title)}" title="${esc(p.title)}"><img src="${esc(p.image)}" alt=""></button>`).join("");
  $("#rail").onclick = (e) => { const b = e.target.closest("[data-jump]"); if (b) $("#room-" + b.dataset.jump).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };

  // collage
  const crots = [-2, 1.5, -1, 2, -1.6, 1];
  $("#collage").innerHTML = SP.map((s, i) => `<figure class="rv" style="--rot:${crots[i % 6]}deg"><img src="${esc(s.image)}" alt="${esc(s.caption)}" loading="lazy"><figcaption>${esc(s.caption)}</figcaption></figure>`).join("");

  // ---- reveal on scroll ----
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18 }) : null;
  document.querySelectorAll(".room,.rv").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  // ---- page colour follows the painting in view ----
  const DEF = { bg: "#130f12", ink: "#f4ece1", accent: "#ff6a3d", muted: "rgba(244,236,225,.66)", line: "rgba(244,236,225,.16)" };
  let accent = DEF.accent;
  function applyTheme(t) {
    t = t || DEF; accent = t.accent;
    root.style.setProperty("--bg", t.bg); root.style.setProperty("--ink", t.ink);
    root.style.setProperty("--accent", t.accent); root.style.setProperty("--muted", t.muted); root.style.setProperty("--line", t.line);
  }
  function dominant(img) {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 32;
      const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, 32, 32);
      const d = x.getImageData(0, 0, 32, 32).data, b = Array.from({ length: 12 }, () => ({ w: 0, h: 0, s: 0 }));
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, g = d[i + 1] / 255, bl = d[i + 2] / 255, mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), l = (mx + mn) / 2, df = mx - mn;
        if (!df) continue;
        const s = df / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - bl) / df) % 6 : mx === g ? (bl - r) / df + 2 : (r - g) / df + 4; h = (h * 60 + 360) % 360;
        const w = s * Math.max(0, 1 - Math.abs(l - 0.5) * 1.7), k = b[Math.floor(h / 30)]; k.w += w; k.h += h * w; k.s += s * w;
      }
      const best = b.reduce((m, k) => (k.w > m.w ? k : m), b[0]);
      return best.w > 0.5 ? { h: Math.round(best.h / best.w), s: Math.min(1, best.s / best.w) } : { h: 30, s: 0.1 };
    } catch { return null; }
  }
  function roomTheme(img) {
    const c = dominant(img); if (!c) return null;
    const as = Math.round(Math.max(40, Math.min(90, c.s * 100)));
    return { bg: `hsl(${c.h} ${Math.round(Math.min(45, c.s * 55))}% 9%)`, ink: `hsl(${c.h} 30% 94%)`, accent: `hsl(${c.h} ${as}% 66%)`, muted: `hsl(${c.h} 18% 82% / .68)`, line: `hsl(${c.h} 30% 90% / .16)` };
  }
  document.querySelectorAll(".room").forEach((room) => {
    const img = room.querySelector("img");
    const set = () => { room._theme = roomTheme(img); if (room._active) applyTheme(room._theme); };
    img.complete && img.naturalWidth ? set() : img.addEventListener("load", set, { once: true });
  });
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      e.target._active = e.isIntersecting;
      if (e.isIntersecting) applyTheme(e.target.classList.contains("room") ? e.target._theme : null);
    }), { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll("[data-sec]").forEach((s) => so.observe(s));
  }

  // ---- zoom ----
  const zoom = $("#zoom");
  document.addEventListener("click", (e) => {
    const z = e.target.closest("[data-zoom]");
    if (z) { const p = byId(z.dataset.zoom); $("#zoomImg").src = p.image; $("#zoomImg").alt = p.title; zoom.showModal(); return; }
    if (e.target === zoom || e.target.dataset.close !== undefined) zoom.close();
    const a = e.target.closest("[data-add]");
    if (a) { add(a.dataset.add); openDrawer(); }
  });

  // ---- cart ----
  function add(id) { if (!cart.includes(id)) cart.push(id); saveCart(); renderCart(); }
  function remove(id) { cart = cart.filter((x) => x !== id); saveCart(); renderCart(); }
  function renderCart() {
    $("#cartCount").textContent = cart.length;
    const items = cart.map(byId);
    $("#cartItems").innerHTML = items.length ? items.map((p) => `
      <div class="cart-item"><img src="${esc(p.image)}" alt="">
      <div><b>${esc(p.title)}</b><small>${esc(p.medium)} · ${esc(p.size)}</small><br><button data-rm="${p.id}">Remove</button></div>
      <strong>${money(p.price)}</strong></div>`).join("") : '<p class="empty">Your cart is empty.</p>';
    $("#checkout").hidden = !items.length;
    $("#cartTotal").textContent = money(items.reduce((t, p) => t + p.price, 0));
    document.querySelectorAll("[data-add]").forEach((b) => { const p = byId(b.dataset.add); if (!p.sold) b.textContent = cart.includes(p.id) ? "In your cart" : "Add to cart"; });
  }
  $("#cartItems").onclick = (e) => { const id = e.target.dataset.rm; if (id) remove(id); };
  const drawer = $("#drawer"), scrim = $("#scrim");
  function openDrawer() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; }
  $("#cartBtn").onclick = openDrawer;
  $("#drawerClose").onclick = scrim.onclick = closeDrawer;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ---- send as message ----
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3500); }
  async function send(text, via) {
    if (via === "ig") {
      try { await navigator.clipboard.writeText(text); toast("Copied. Paste it in the DM."); } catch { toast("Copy failed. Type your message in the DM."); }
      window.open(`https://ig.me/m/${S.instagram}`, "_blank", "noopener");
    } else window.open(waLink(text), "_blank", "noopener");
  }
  $("#checkout").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target), items = cart.map(byId), total = items.reduce((t, p) => t + p.price, 0);
    send([`New order — ${S.name}`, "", ...items.map((p, i) => `${i + 1}. ${p.title} (${p.medium}, ${p.size}) — ${money(p.price)}`), "", `Total: ${money(total)}`, "", `Name: ${f.get("name")}`, `Phone: ${f.get("phone")}`, `Address: ${f.get("address")}`].join("\n"), e.submitter && e.submitter.value);
  };
  $("#brief").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target), v = (k) => f.get(k) || "-";
    send(["Commission request", "", `Subject / idea: ${v("subject")}`, `Size: ${v("size")}`, `Medium: ${v("medium")}`, `Deadline: ${v("deadline")}`, `Budget: ${v("budget")}`, `Contact: ${v("contact")}`].join("\n"), e.submitter && e.submitter.value);
  };

  // ---- hero parallax ----
  const hero = $(".hero");
  if (!reduce) hero.addEventListener("pointermove", (e) => { hero.querySelector(".hero-pic").style.setProperty("--px", (e.clientX / innerWidth - .5).toFixed(2)); hero.querySelector(".hero-pic").style.setProperty("--py", (e.clientY / innerHeight - .5).toFixed(2)); });

  // ---- paint trail in the current accent colour ----
  const cv = $("#trail");
  if (cv && !reduce && matchMedia("(hover:hover)").matches) {
    const cx = cv.getContext("2d"); let dots = [], last = null;
    const fit = () => { cv.width = innerWidth; cv.height = innerHeight; }; fit(); addEventListener("resize", fit);
    addEventListener("pointermove", (e) => {
      if (!last) { last = { x: e.clientX, y: e.clientY }; return; }
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (d > 12) { dots.push({ x: e.clientX, y: e.clientY, px: last.x, py: last.y, c: Math.random() < .25 ? "#f4ece1" : accent, w: Math.min(16, 3 + d / 5), a: .6 }); last = { x: e.clientX, y: e.clientY }; }
    });
    (function tick() {
      cx.clearRect(0, 0, cv.width, cv.height); cx.lineCap = "round";
      dots = dots.filter((d) => (d.a -= .012) > 0);
      for (const d of dots) { cx.globalAlpha = d.a; cx.strokeStyle = d.c; cx.lineWidth = d.w; cx.beginPath(); cx.moveTo(d.px, d.py); cx.lineTo(d.x, d.y); cx.stroke(); }
      requestAnimationFrame(tick);
    })();
  }

  renderCart();
})();
