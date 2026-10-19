/**
 * BOT AUTO-RESPONDEDOR REDDIT ESPAÑA (CEO DISTRIBUTION ENGINE)
 * - Controla Chrome real vía CDP (puerto 9229) con perfil persistente en tu PC.
 * - Detecta automáticamente ventanas emergentes (como el popup de 'Continuar con Google')
 *   y permite hacer clic y escribir con tu teclado directamente sobre la pantalla en vivo en http://localhost:3333.
 * - Una vez conectado, publica automáticamente la respuesta experta en el hilo de r/ESLegal.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const PROFILE_DIR = path.join(process.env.USERPROFILE || "C:\\Users\\jorge", ".gemini", "reddit-bot-profile");
const REPLIED_FILE = path.join(__dirname, ".reddit-replied.json");
const RADAR_FILE = path.join(__dirname, "radar-oportunidades-hoy.md");
const CDP_PORT = 9229;
const UI_PORT = 3333;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getChromePath() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return candidates.find((p) => fs.existsSync(p));
}

function loadReplied() {
  if (fs.existsSync(REPLIED_FILE)) {
    try { return JSON.parse(fs.readFileSync(REPLIED_FILE, "utf8")); } catch (_) {}
  }
  return { repliedPostIds: [], history: [] };
}

function saveReplied(data) {
  fs.writeFileSync(REPLIED_FILE, JSON.stringify(data, null, 2), "utf8");
}

function parseRadarOpportunities() {
  if (!fs.existsSync(RADAR_FILE)) return [];
  const md = fs.readFileSync(RADAR_FILE, "utf8");
  const lines = md.split("\n");
  const items = [];
  let current = null;

  for (const line of lines) {
    const mTitle = line.match(/^\d+\.\s+\*\*\[([^\]]+)\]\*\*\s+\[([^\]]+)\]\((https:\/\/www\.reddit\.com\/r\/[^/]+\/comments\/([a-z0-9]+)[^)]*)\)/i);
    if (mTitle) {
      if (current) items.push(current);
      current = {
        subreddit: mTitle[1],
        title: mTitle[2],
        url: mTitle[3],
        postId: "t3_" + mTitle[4],
        shortId: mTitle[4],
        replyText: ""
      };
    } else if (current && line.trim().startsWith("> ")) {
      current.replyText = line.trim().slice(2).trim();
    }
  }
  if (current) items.push(current);
  return items.filter((i) => i.postId && i.replyText);
}

async function cdpCall(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1e9);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("CDP Timeout: " + method)), 12000);
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          clearTimeout(timeout);
          ws.removeEventListener("message", handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (_) {}
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInPage(ws, expression) {
  const res = await cdpCall(ws, "Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return res?.result?.value;
}

let activeWs = null;
let activeTargetId = null;

async function getActiveWs() {
  let targets = null;
  try {
    targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).then((r) => r.json());
  } catch (_) {}

  if (!Array.isArray(targets) || !targets.some((t) => t.type === "page")) {
    const chromePath = getChromePath();
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
    const proc = spawn(
      chromePath,
      [
        `--user-data-dir=${PROFILE_DIR}`,
        `--remote-debugging-port=${CDP_PORT}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1280,820",
        "https://www.reddit.com/login/"
      ],
      { detached: true, stdio: "ignore" }
    );
    proc.unref();

    for (let i = 0; i < 20; i++) {
      await sleep(1000);
      try {
        targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).then((r) => r.json());
        if (Array.isArray(targets) && targets.some((t) => t.type === "page")) break;
      } catch (_) {}
    }
  }

  // Priorizar popup de Google OAuth si está abierto; si no, la pestaña de Reddit
  const pages = targets.filter((t) => t.type === "page");
  const chosen =
    pages.find((t) => t.url.includes("accounts.google.com/v3/signin") || t.url.includes("accounts.google.com/o/oauth2")) ||
    pages.find((t) => t.url.includes("reddit.com")) ||
    pages[0];

  if (activeWs && activeTargetId === chosen.id && activeWs.readyState === 1) {
    return activeWs;
  }

  if (activeWs) {
    try { activeWs.close(); } catch (_) {}
  }

  const ws = new WebSocket(chosen.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });

  await cdpCall(ws, "Page.enable");
  await cdpCall(ws, "Runtime.enable");
  await cdpCall(ws, "Network.enable");
  await cdpCall(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 820,
    deviceScaleFactor: 1,
    mobile: false
  });

  activeWs = ws;
  activeTargetId = chosen.id;
  return ws;
}

async function checkLoggedUser(ws) {
  const { cookies } = await cdpCall(ws, "Network.getCookies", {
    urls: ["https://www.reddit.com", "https://old.reddit.com"]
  }).catch(() => ({ cookies: [] }));

  const hasSession = (cookies || []).some((c) => c.name === "reddit_session" && c.value && c.value.length > 10);
  if (!hasSession) return null;

  const me = await evalInPage(
    ws,
    `fetch("https://www.reddit.com/api/me.json", { credentials: "include" })
      .then(r => r.json())
      .then(j => (j && j.data && j.data.name ? { name: j.data.name, modhash: j.data.modhash } : null))
      .catch(() => null)`
  );
  if (me && me.name) return me;
  return { name: "CuentaConectada", modhash: "" };
}

async function performRealDomLogin(ws, username, password) {
  // Cerrar popups de Google si estaban abiertos para volver al login de Reddit
  const targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).then((r) => r.json()).catch(() => []);
  for (const t of targets) {
    if (t.type === "page" && t.url.includes("accounts.google.com")) {
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${t.id}`).catch(() => {});
    }
  }
  ws = await getActiveWs();

  const currentUrl = await evalInPage(ws, "location.href");
  if (!currentUrl || !currentUrl.includes("reddit.com/login")) {
    await cdpCall(ws, "Page.navigate", { url: "https://www.reddit.com/login/" });
    await sleep(3500);
  }

  const focusField = async (isPass) => {
    return await evalInPage(
      ws,
      `(() => {
        function findDeep(root, pred) {
          for (const el of root.querySelectorAll("*")) {
            if (pred(el)) return el;
            if (el.shadowRoot) {
              const found = findDeep(el.shadowRoot, pred);
              if (found) return found;
            }
          }
          return null;
        }
        const inp = findDeep(document, el =>
          el.tagName === "INPUT" &&
          (${isPass ? 'el.type === "password" || el.name === "password"' : 'el.name === "username" || el.id === "login-username" || el.type === "text"'})
        );
        if (inp) {
          inp.focus();
          inp.value = "";
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          const r = inp.getBoundingClientRect();
          return { ok: true, x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { ok: false };
      })()`
    );
  };

  const uBox = await focusField(false);
  if (uBox && uBox.ok) {
    await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mousePressed", x: uBox.x, y: uBox.y, button: "left", clickCount: 1 });
    await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mouseReleased", x: uBox.x, y: uBox.y, button: "left", clickCount: 1 });
    await sleep(200);
    await cdpCall(ws, "Input.insertText", { text: username });
    await sleep(400);
  }

  const pBox = await focusField(true);
  if (pBox && pBox.ok) {
    await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mousePressed", x: pBox.x, y: pBox.y, button: "left", clickCount: 1 });
    await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mouseReleased", x: pBox.x, y: pBox.y, button: "left", clickCount: 1 });
    await sleep(200);
    await cdpCall(ws, "Input.insertText", { text: password });
    await sleep(400);
  }

  await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 13, key: "Enter", code: "Enter" });
  await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 13, key: "Enter", code: "Enter" });

  for (let i = 0; i < 8; i++) {
    await sleep(1000);
    const me = await checkLoggedUser(ws);
    if (me && me.name) return { ok: true, me };
  }

  return { ok: false, error: "Mira la pantalla interactiva a la derecha para completar el paso en pantalla." };
}

async function postNextOpportunity(ws, userData) {
  const opportunities = parseRadarOpportunities();
  const replied = loadReplied();
  const pending = opportunities.filter((o) => !replied.repliedPostIds.includes(o.postId));
  if (pending.length === 0) {
    return { ok: false, message: "No hay hilos pendientes de responder hoy." };
  }

  const target =
    pending.find((p) => /fianza|incasol|alquiler|finiquito|despido|multa/i.test(p.title)) || pending[0];

  const oldRedditUrl = `https://old.reddit.com/r/${target.subreddit.replace("r/", "")}/comments/${target.shortId}/`;
  await cdpCall(ws, "Page.navigate", { url: oldRedditUrl });
  await sleep(4500);

  const pageAuth = await evalInPage(
    ws,
    `(() => ({
      uh: document.querySelector("input[name='uh']")?.value || ${JSON.stringify(userData.modhash || "")},
      user: document.querySelector(".user a")?.textContent || ${JSON.stringify(userData.name || "")}
    }))()`
  );

  const postResult = await evalInPage(
    ws,
    `(() => {
      const ta = document.querySelector("textarea[name='text']");
      if (ta) ta.value = ${JSON.stringify(target.replyText)};
      const form = new URLSearchParams();
      form.set("thing_id", ${JSON.stringify(target.postId)});
      form.set("text", ${JSON.stringify(target.replyText)});
      form.set("uh", ${JSON.stringify(pageAuth.uh)});
      form.set("api_type", "json");
      return fetch("https://old.reddit.com/api/comment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: form.toString()
      }).then(r => r.json()).catch(e => ({ error: e.message }));
    })()`
  );

  const errors = postResult?.json?.errors || [];
  if (errors.length === 0 && postResult?.json?.data) {
    replied.repliedPostIds.push(target.postId);
    replied.history.push({
      date: new Date().toISOString(),
      account: pageAuth.user,
      postId: target.postId,
      title: target.title,
      url: target.url,
      replyText: target.replyText
    });
    saveReplied(replied);
    return {
      ok: true,
      account: pageAuth.user,
      title: target.title,
      url: target.url,
      replyText: target.replyText
    };
  }
  return {
    ok: false,
    account: pageAuth.user,
    title: target.title,
    url: target.url,
    errors: errors.length ? errors : postResult
  };
}

async function startBotServer() {
  await getActiveWs();
  let lastStatus = "Listo: Ahora ves también las ventanas emergentes (como el login de Google) y puedes escribir en ellas.";

  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/screenshot.png")) {
      try {
        const ws = await getActiveWs();
        const shot = await cdpCall(ws, "Page.captureScreenshot", { format: "png" });
        const buf = Buffer.from(shot.data, "base64");
        res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
        res.end(buf);
      } catch (e) {
        res.writeHead(500);
        res.end();
      }
      return;
    }

    if (req.url === "/api/status") {
      try {
        const ws = await getActiveWs();
        const me = await checkLoggedUser(ws);
        const curUrl = await evalInPage(ws, "location.href").catch(() => "");
        const replied = loadReplied();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ loggedIn: !!(me && me.name), username: me?.name || null, currentUrl: curUrl, lastStatus, history: replied.history }));
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ loggedIn: false, lastStatus }));
      }
      return;
    }

    if (req.url === "/api/click" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        try {
          const ws = await getActiveWs();
          const { x, y } = JSON.parse(body);
          await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
          await cdpCall(ws, "Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(500);
          res.end();
        }
      });
      return;
    }

    if (req.url === "/api/type" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        try {
          const ws = await getActiveWs();
          const { text, key } = JSON.parse(body);
          if (key === "Enter") {
            await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 13, key: "Enter", code: "Enter" });
            await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 13, key: "Enter", code: "Enter" });
          } else if (key === "Backspace") {
            await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 8, key: "Backspace", code: "Backspace" });
            await cdpCall(ws, "Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 8, key: "Backspace", code: "Backspace" });
          } else if (text) {
            await cdpCall(ws, "Input.insertText", { text });
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(500);
          res.end();
        }
      });
      return;
    }

    if (req.url === "/api/close-popup" && req.method === "POST") {
      const targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).then((r) => r.json()).catch(() => []);
      for (const t of targets) {
        if (t.type === "page" && t.url.includes("accounts.google.com")) {
          await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${t.id}`).catch(() => {});
        }
      }
      activeWs = null;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.url === "/api/login" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        try {
          const ws = await getActiveWs();
          const { username, password } = JSON.parse(body);
          lastStatus = "Escribiendo credenciales en el formulario oficial de Reddit...";
          const loginRes = await performRealDomLogin(ws, username, password);
          if (loginRes.ok && loginRes.me) {
            lastStatus = "✅ Conectado como u/" + loginRes.me.name + ". Publicando primera respuesta en r/ESLegal...";
            const pub = await postNextOpportunity(ws, loginRes.me);
            if (pub.ok) {
              lastStatus = "🎉 ¡Publicado con éxito en: " + pub.title + "!";
            } else {
              lastStatus = "⚠️ Conectado como u/" + loginRes.me.name + ", aviso al publicar: " + JSON.stringify(pub.errors);
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, username: loginRes.me.name, publishResult: pub }));
          } else {
            lastStatus = "⚠️ " + (loginRes.error || "Revisa la pantalla interactiva a la derecha.");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: lastStatus }));
          }
        } catch (e) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    if (req.url === "/api/post-next" && req.method === "POST") {
      const ws = await getActiveWs();
      const me = await checkLoggedUser(ws);
      if (!me || !me.name) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Inicia sesión primero en Reddit." }));
        return;
      }
      const pub = await postNextOpportunity(ws, me);
      lastStatus = pub.ok ? "🎉 ¡Publicado en: " + pub.title + "!" : "⚠️ Aviso: " + JSON.stringify(pub.errors);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pub));
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Panel de Conexión Reddit Bot — FinanzaSmart CEO</title>
  <style>
    body { background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
    .wrap { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 360px 1fr; gap: 20px; }
    .card { background: #151c2c; border: 1px solid #263147; border-radius: 14px; padding: 18px; }
    h1 { font-size: 1.2rem; margin-top: 0; color: #10b981; }
    label { display: block; font-size: 0.83rem; color: #94a3b8; margin: 10px 0 4px; }
    input { width: 100%; box-sizing: border-box; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; }
    button { width: 100%; margin-top: 10px; padding: 11px; border: none; border-radius: 8px; background: #10b981; color: #052e16; font-weight: 800; cursor: pointer; font-size: 0.9rem; }
    button.sec { background: #3b82f6; color: #fff; }
    button.warn { background: #475569; color: #fff; font-size: 0.8rem; padding: 8px; }
    .status { margin-top: 12px; padding: 12px; border-radius: 8px; background: #0f172a; border: 1px solid #334155; font-size: 0.84rem; color: #cbd5e1; line-height: 1.45; }
    #screen { width: 100%; border-radius: 10px; border: 2px solid #10b981; background: #000; cursor: pointer; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>🤖 Control en Vivo del Bot</h1>
      <label>1. Enviar texto al campo activo de la pantalla derecha</label>
      <div style="display:flex;gap:6px;">
        <input type="text" id="directText" placeholder="Escribe email, código o clave..." onkeydown="if(event.key==='Enter')sendDirectText()" />
        <button style="width:auto;margin:0;padding:0 14px;" onclick="sendDirectText()">Enviar ↵</button>
      </div>
      <hr style="border-color:#263147;margin:14px 0;">
      <label>2. O login directo con Usuario + Contraseña de Reddit</label>
      <input type="text" id="u" placeholder="Usuario o Email de Reddit" style="margin-bottom:6px;" />
      <input type="password" id="p" placeholder="Contraseña de Reddit" />
      <button onclick="doLogin()">🔐 Conectar Usuario/Clave y Publicar</button>
      <button class="sec" onclick="postNext()">🚀 Publicar Siguiente Hilo del Radar</button>
      <button class="warn" onclick="closePopup()">↩️ Cerrar Popup de Google y Volver a Reddit</button>
      <div class="status" id="st">Cargando estado...</div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>📺 Pantalla Interactiva (Haz clic en cualquier botón o caja de texto)</strong>
        <span id="urlBadge" style="font-size:0.76rem;color:#93c5fd;"></span>
      </div>
      <img id="screen" src="/screenshot.png" alt="Pantalla del Bot" onclick="clickScreen(event)" />
    </div>
  </div>
  <script>
    async function refresh() {
      document.getElementById("screen").src = "/screenshot.png?t=" + Date.now();
      const r = await fetch("/api/status").then(x => x.json()).catch(() => null);
      if (r) {
        document.getElementById("urlBadge").textContent = (r.currentUrl || "").slice(0, 65);
        document.getElementById("st").innerHTML =
          (r.loggedIn ? "✅ <strong>Conectado como: u/" + r.username + "</strong><br>" : "🔒 <strong>Sin sesión iniciada</strong><br>") +
          r.lastStatus +
          (r.history && r.history.length ? "<hr style='border-color:#263147'><strong>Respuestas publicadas (" + r.history.length + "):</strong><br>" + r.history.map(h => "• <a href='" + h.url + "' target='_blank' style='color:#10b981'>" + h.title + "</a>").join("<br>") : "");
      }
    }
    async function clickScreen(e) {
      const img = e.target;
      const rect = img.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 1280);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 820);
      await fetch("/api/click", { method: "POST", body: JSON.stringify({ x, y }) });
      setTimeout(refresh, 400);
    }
    async function sendDirectText() {
      const val = document.getElementById("directText").value;
      if (val) {
        await fetch("/api/type", { method: "POST", body: JSON.stringify({ text: val }) });
        await fetch("/api/type", { method: "POST", body: JSON.stringify({ key: "Enter" }) });
        document.getElementById("directText").value = "";
        setTimeout(refresh, 600);
      }
    }
    async function closePopup() {
      await fetch("/api/close-popup", { method: "POST" });
      setTimeout(refresh, 500);
    }
    async function doLogin() {
      const username = document.getElementById("u").value.trim();
      const password = document.getElementById("p").value;
      document.getElementById("st").textContent = "⏳ Rellenando formulario en el navegador del bot...";
      await fetch("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
      refresh();
    }
    async function postNext() {
      document.getElementById("st").textContent = "⏳ Publicando siguiente respuesta en r/ESLegal...";
      await fetch("/api/post-next", { method: "POST" });
      refresh();
    }
    setInterval(refresh, 1600);
    refresh();
  </script>
</body>
</html>`);
  });

  server.listen(UI_PORT, "127.0.0.1", () => {
    console.log(`✅ Panel de control interactivo del Bot de Reddit activo en: http://localhost:${UI_PORT}`);
  });
}

startBotServer().catch(console.error);
