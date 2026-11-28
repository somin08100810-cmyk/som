/* evy8 official site v17 — interaction, written from scratch */
(function () {
  const D = window.EVY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else if (v === false || v == null) {}
        else if (v === true) n.setAttribute(k, "");
        else n.setAttribute(k, v);
      });
    }
    kids.flat().forEach((c) => {
      if (c == null) return;
      n.append(c.nodeType ? c : document.createTextNode(c));
    });
    return n;
  }

  /* D-day (Asia/Seoul) */
  (function dday() {
    const end = new Date("2026-12-31T00:00:00+09:00");
    const now = new Date();
    const days = Math.ceil((end - now) / 86400000);
    const box = $("#dday-num");
    if (!box) return;
    const b = el("b", { html: days >= 0 ? "D-" + days : "D+" + Math.abs(days) });
    box.append(b);
  })();

  /* nav */
  const toggle = $("#nav-toggle");
  const links = $("#nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  const sections = ["intro", "world", "guide", "year", "factions", "characters"];
  const navMap = Object.fromEntries(
    $$("#nav-links a").map((a) => [a.getAttribute("href").slice(1), a])
  );
  const io = new IntersectionObserver(
    (ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        $$("#nav-links a").forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + en.target.id));
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((id) => {
    const n = document.getElementById(id);
    if (n) io.observe(n);
  });

  /* world rules */
  const rules = $("#rules");
  D.rules.forEach((r) => {
    rules.append(el("div", { class: "rule" }, el("b", null, r.title), r.text));
  });

  /* seasons */
  const seas = $("#seasons");
  D.seasons.forEach((s) => {
    seas.append(
      el(
        "article",
        { class: "season" + (s.id === "sealwar" ? " is-end" : "") },
        el("div", { class: "when" }, s.name + " · " + s.months),
        el("h3", { class: "serif" }, s.name),
        el("p", null, s.text)
      )
    );
  });

  /* start + guide */
  $("#start-note").textContent = D.startNote;
  const form = $("#start-form");
  form.append(el("b", null, "첫 대화에 이렇게 적어 보세요"));
  form.append(el("br"));
  D.startForm.forEach((line, i) => {
    form.append(document.createTextNode(line));
    if (i < D.startForm.length - 1) form.append(el("br"));
  });
  const glist = $("#guide-list");
  D.guide.forEach((g) => {
    glist.append(el("div", { class: "guide-item" }, el("b", null, "▸ " + g.q), el("span", null, g.a)));
  });

  /* factions */
  let facId = D.factions[0].id;
  const tabs = $("#fac-tabs");
  const view = $("#fac-view");
  function renderFac(id) {
    facId = id;
    $$("button", tabs).forEach((b) => b.classList.toggle("is-on", b.dataset.id === id));
    const f = D.factions.find((x) => x.id === id);
    view.innerHTML = "";
    view.append(
      el("div", null, el("figure", { class: "frame" }, el("img", { src: f.img, alt: f.name + " 배경" }))),
      el(
        "div",
        { class: "fac-copy" },
        el("p", { class: "fac-meta" }, [f.rank, f.tier, f.home].filter(Boolean).join(" · ")),
        el("h3", { class: "serif", style: "color:" + f.color }, f.name),
        el("p", null, f.blurb),
        f.shard || f.plus
          ? el(
              "dl",
              { class: "fac-dl" },
              f.shard ? [el("dt", null, "조각"), el("dd", null, f.shard)] : [],
              f.plus ? [el("dt", null, "좋은 점"), el("dd", null, f.plus)] : [],
              f.minus ? [el("dt", null, "어려운 점"), el("dd", null, f.minus)] : []
            )
          : null
      )
    );
  }
  D.factions.forEach((f) => {
    const b = el("button", { type: "button", "data-id": f.id, style: "--tab:" + f.color }, f.name);
    b.addEventListener("click", () => renderFac(f.id));
    tabs.append(b);
  });
  renderFac(facId);

  /* characters */
  const FAC_ORDER = ["all", "solein", "belua", "karsel", "roban", "edel", "caligo", "sixth", "free"];
  const FAC_LABEL = {
    all: "전체",
    solein: "솔레인",
    belua: "벨루아",
    karsel: "카르셀",
    roban: "로반",
    edel: "에델",
    caligo: "마군",
    sixth: "여섯째 손",
    free: "자유인",
  };
  let filter = "all";
  let current = D.characters[0];

  function filtered() {
    return filter === "all" ? D.characters : D.characters.filter((c) => c.faction === filter);
  }
  function byId(id) {
    return D.characters.find((c) => c.id === id);
  }

  const filterBox = $("#char-filter");
  FAC_ORDER.forEach((id) => {
    const b = el("button", { type: "button", "data-fac": id }, FAC_LABEL[id]);
    b.addEventListener("click", () => {
      filter = id;
      const list = filtered();
      if (!list.some((c) => c.id === current.id)) current = list[0];
      renderChars();
    });
    filterBox.append(b);
  });

  function cardImg(c) {
    return "images/characters/cards/" + c.id + ".webp";
  }
  function fullImg(c) {
    return "images/characters/full/" + c.id + ".webp";
  }
  function metaLine(c) {
    return [c.factionName, c.role, c.age + "세", c.gender].filter(Boolean).join(" · ");
  }

  function charBody(c, withBtn) {
    const kids = [
      el("h3", { class: "serif" }, c.name),
      el("p", { class: "meta" }, metaLine(c) + (c.difficulty ? " · " + c.difficulty : "")),
      c.tagline ? el("p", null, c.tagline) : null,
      c.personality ? el("p", null, c.personality) : null,
    ];
    const kv = [];
    if (c.goal) kv.push(el("dt", null, "바라는 것"), el("dd", null, c.goal));
    if (c.look) kv.push(el("dt", null, "외형"), el("dd", null, c.look));
    if (c.outfit) kv.push(el("dt", null, "복장"), el("dd", null, c.outfit));
    if (c.colors) kv.push(el("dt", null, "대표색"), el("dd", null, c.colors));
    if (c.signature) kv.push(el("dt", null, "특징"), el("dd", null, c.signature));
    if (c.routes && c.routes.length) kv.push(el("dt", null, "관계 결"), el("dd", null, c.routes.join(" · ")));
    if (kv.length) kids.push(el("dl", { class: "kv" }, kv));
    if (withBtn) {
      kids.push(
        el(
          "button",
          { class: "btn btn-gold", type: "button", style: "margin-top:8px", onclick: () => openModal(c) },
          "인물 소개 읽기"
        )
      );
    }
    return kids;
  }

  function renderShowcase(c) {
    current = c;
    const art = $("#char-art");
    art.innerHTML = "";
    art.append(
      el(
        "figure",
        { class: "frame" },
        el("img", { src: fullImg(c), alt: c.name + " 전신" })
      )
    );
    const info = $("#char-info");
    info.innerHTML = "";
    charBody(c, true).forEach((n) => info.append(n));
    $$("#char-cards .card").forEach((b) => b.classList.toggle("is-on", b.dataset.id === c.id));
  }

  function renderChars() {
    $$("button", filterBox).forEach((b) => b.classList.toggle("is-on", b.dataset.fac === filter));
    const list = filtered();
    const box = $("#char-cards");
    box.innerHTML = "";
    list.forEach((c) => {
      const b = el(
        "button",
        { class: "card", type: "button", "data-id": c.id, "aria-label": c.name },
        el("div", { class: "card-photo" }, el("img", { src: cardImg(c), alt: "" })),
        el("span", { class: "nm" }, c.name),
        el("span", { class: "rl" }, c.role)
      );
      b.addEventListener("click", () => {
        renderShowcase(c);
        $("#char-art").scrollIntoView({ block: "start", behavior: "smooth" });
      });
      box.append(b);
    });
    if (!list.some((c) => c.id === current.id)) current = list[0];
    renderShowcase(current);
  }

  const modal = $("#modal");
  function openModal(c) {
    $("#modal-title").textContent = c.name;
    const body = $("#modal-body");
    body.innerHTML = "";
    body.append(
      el("figure", { class: "frame" }, el("img", { src: fullImg(c), alt: c.name + " 전신" })),
      el("div", null, charBody(c, false))
    );
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }
  function closeModal() {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }
  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  renderChars();
})();
