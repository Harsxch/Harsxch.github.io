(() => {
  const S = window.SHOP, P = window.PAINTINGS;
  const $ = (s) => document.querySelector(s);
  const money = (n) => S.currency + n.toLocaleString("en-IN");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => P.find((p) => p.id === id);

  // ---- cart (localStorage, wrapped: may be unavailable) ----
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("sbp-cart") || "[]").filter((id) => byId(id) && !byId(id).sold); } catch {}
  const saveCart = () => { try { localStorage.setItem("sbp-cart", JSON.stringify(cart)); } catch {} };

  // ---- placeholder art: seeded abstract painting ----
  function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) + 0x6d2b79f5), ((h ^ (h >>> 13)) >>> 0) / 4294967296); }
  function placeholder(p) {
    const r = rng(p.id + p.title), c = p.palette;
    let s = `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(p.title)} (placeholder artwork)"><defs><filter id="f-${p.id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".02 .05" numOctaves="3" seed="${p.id.length + p.title.length}"/><feDisplacementMap in="SourceGraphic" scale="26"/></filter></defs><rect width="400" height="500" fill="${c[2]}"/><g filter="url(#f-${p.id})">`;
    for (let i = 0; i < 9; i++) {
      const col = c[Math.floor(r() * c.length)], x = r() * 400, y = r() * 500;
      s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(60 + r() * 150).toFixed(0)}" ry="${(30 + r() * 90).toFixed(0)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${col}" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 14; i++) {
      const col = c[Math.floor(r() * c.length)], x = r() * 400, y = r() * 500;
      s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q${(r() * 120 - 60).toFixed(0)} ${(r() * 120 - 60).toFixed(0)} ${(r() * 160 - 80).toFixed(0)} ${(r() * 160 - 80).toFixed(0)}" stroke="${col}" stroke-width="${(5 + r() * 16).toFixed(0)}" stroke-linecap="round" fill="none" opacity="0.8"/>`;
    }
    return s + "</g></svg>";
  }
  const artHtml = (p) => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : placeholder(p);

  // ---- static text ----
  document.title = `${S.name} — Original Paintings`;
  $("#brand").textContent = S.name;
  $("#heroTitle").textContent = S.tagline;
  $("#heroTag").textContent = `Original artworks & commissions by ${S.name}. Pick a piece, or DM for something custom.`;
  $("#shipFact").textContent = S.shipping;
  $("#igLink").href = `https://instagram.com/${S.instagram}`;
  $("#igLink").textContent = `@${S.instagram}`;
  $("#footText").textContent = `© ${new Date().getFullYear()} ${S.name} · @${S.instagram}`;
  const ordMsg = (t) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(t)}`;
  $("#commissionLink").href = ordMsg("Hi! I'd like to commission a painting.\nSize:\nColours / mood:\nBudget:");

  // ---- grid ----
  const ratio = (p) => { const m = (p.size || "").match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/); return m ? `${m[1]}/${m[2]}` : "4/5"; };
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
  function reveal() { document.querySelectorAll(".rv:not(.in),.brush:not(.in)").forEach((el, i) => io ? io.observe(el) : el.classList.add("in")); }
  const mediums = ["All", ...new Set(P.map((p) => p.medium))];
  $("#filter").innerHTML = mediums.map((m) => `<option value="${esc(m)}">${m === "All" ? "All mediums" : esc(m)}</option>`).join("");
  function renderGrid() {
    const f = $("#filter").value, s = $("#sort").value;
    let list = P.filter((p) => f === "All" || p.medium === f);
    if (s === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (s === "high") list = [...list].sort((a, b) => b.price - a.price);
    $("#grid").innerHTML = list.map((p, i) => `
      <button class="card rv" data-id="${p.id}" style="--rot:${[-1.6, 1.2, -.7, 1.8, -1.2][i % 5]}deg">
        <div class="frame"><div class="art" style="aspect-ratio:${ratio(p)}">${artHtml(p)}${p.sold ? '<span class="sold-tag">Sold</span>' : ""}</div></div>
        <div class="meta"><h3>${esc(p.title)}</h3><p>${esc(p.medium)} · ${esc(p.size)}</p><p class="price">${p.sold ? "Sold" : money(p.price)}</p></div>
      </button>`).join("");
    reveal();
  }
  $("#filter").onchange = $("#sort").onchange = renderGrid;
  $("#grid").onclick = (e) => { const c = e.target.closest(".card"); if (c) openModal(c.dataset.id); };

  // ---- modal ----
  const modal = $("#modal");
  function openModal(id) {
    const p = byId(id), inCart = cart.includes(id);
    $("#modalBody").innerHTML = `<div class="modal-grid"><div class="frame"><div class="art" style="aspect-ratio:${ratio(p)}">${artHtml(p)}</div></div>
      <div class="modal-info"><h2>${esc(p.title)}</h2><p>${esc(p.desc)}</p>
      <dl><dt>Medium</dt><dd>${esc(p.medium)}</dd><dt>Size</dt><dd>${esc(p.size)}</dd><dt>Edition</dt><dd>Original, one of a kind</dd></dl>
      <p class="price" style="font-size:1.4rem!important">${p.sold ? "Sold" : money(p.price)}</p>
      <button class="btn" id="addBtn" ${p.sold || inCart ? "disabled" : ""}>${p.sold ? "Sold out" : inCart ? "In cart" : "Add to cart"}</button>
      <p class="note" style="margin-top:12px">${esc(S.shipping)}</p></div></div>`;
    const b = $("#addBtn");
    if (b) b.onclick = () => { add(id); modal.close(); openDrawer(); };
    modal.showModal();
  }
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.dataset.close !== undefined) modal.close(); });

  // ---- cart ----
  function add(id) { if (!cart.includes(id)) cart.push(id); saveCart(); renderCart(); }
  function remove(id) { cart = cart.filter((x) => x !== id); saveCart(); renderCart(); }
  function renderCart() {
    $("#cartCount").textContent = cart.length;
    const items = cart.map(byId);
    $("#cartItems").innerHTML = items.length ? items.map((p) => `
      <div class="cart-item"><div class="art">${artHtml(p)}</div>
      <div><b>${esc(p.title)}</b><small>${esc(p.medium)} · ${esc(p.size)}</small><br><button data-rm="${p.id}">Remove</button></div>
      <strong>${money(p.price)}</strong></div>`).join("") : '<p class="empty">Your cart is empty.</p>';
    $("#checkout").hidden = !items.length;
    $("#cartTotal").textContent = money(items.reduce((t, p) => t + p.price, 0));
  }
  $("#cartItems").onclick = (e) => { const id = e.target.dataset.rm; if (id) remove(id); };
  const drawer = $("#drawer"), scrim = $("#scrim");
  function openDrawer() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; }
  $("#cartBtn").onclick = openDrawer;
  $("#drawerClose").onclick = scrim.onclick = closeDrawer;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ---- checkout: builds an order message ----
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3500); }
  $("#checkout").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target), via = e.submitter && e.submitter.value;
    const items = cart.map(byId), total = items.reduce((t, p) => t + p.price, 0);
    const text = [`New order — ${S.name}`, "", ...items.map((p, i) => `${i + 1}. ${p.title} (${p.medium}, ${p.size}) — ${money(p.price)}`), "", `Total: ${money(total)}`, "", `Name: ${f.get("name")}`, `Phone: ${f.get("phone")}`, `Address: ${f.get("address")}`].join("\n");
    if (via === "ig") {
      try { await navigator.clipboard.writeText(text); toast("Order copied. Paste it in the DM."); } catch { toast("Copy failed. Type your order in the DM."); }
      window.open(`https://ig.me/m/${S.instagram}`, "_blank", "noopener");
    } else {
      window.open(ordMsg(text), "_blank", "noopener");
    }
  };

  renderGrid();
  renderCart();
  document.querySelectorAll(".about p,.facts,.commission p,.commission .btn").forEach((el) => el.classList.add("rv"));
  reveal();

  // ---- paint trail under the cursor ----
  const cv = $("#trail");
  if (cv && matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    const cx = cv.getContext("2d"), cols = ["#e4572e", "#2e5eaa", "#f2b134", "#5aa17f"];
    let dots = [], last = null, ci = 0;
    const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
    fit(); addEventListener("resize", fit);
    addEventListener("pointermove", (e) => {
      if (last) {
        const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
        if (d > 14) { if (Math.random() < 0.05) ci = (ci + 1) % cols.length; dots.push({ x: e.clientX, y: e.clientY, px: last.x, py: last.y, c: cols[ci], w: Math.min(14, 3 + d / 6), a: 0.55 }); last = { x: e.clientX, y: e.clientY }; }
      } else last = { x: e.clientX, y: e.clientY };
    });
    (function tick() {
      cx.clearRect(0, 0, cv.width, cv.height);
      cx.lineCap = "round";
      dots = dots.filter((d) => (d.a -= 0.012) > 0);
      for (const d of dots) { cx.globalAlpha = d.a; cx.strokeStyle = d.c; cx.lineWidth = d.w; cx.beginPath(); cx.moveTo(d.px, d.py); cx.lineTo(d.x, d.y); cx.stroke(); }
      requestAnimationFrame(tick);
    })();
  }
})();
