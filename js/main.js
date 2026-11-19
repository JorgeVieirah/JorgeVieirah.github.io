/* ============================================================
   Portfólio Jorge Vieira — interações
   tema claro/escuro · PT/EN · transições · glitch · terminal
   ============================================================ */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Menu mobile ---------------- */
const navToggle = document.getElementById('navToggle');
const navlinks = document.getElementById('navlinks');
navToggle.addEventListener('click', () => navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

/* ---------------- Scroll: navegação ativa, progresso, topo ---------------- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.navlinks a');
const backToTop = document.getElementById('backToTop');
const termbar = document.getElementById('termbar');
const progress = document.getElementById('scrollProgress');
const nextCmd = document.getElementById('nextCmd');

function onScroll() {
  const y = window.scrollY;
  let current = '';
  sections.forEach(sec => { if (y >= sec.offsetTop - 120) current = sec.id; });
  if (window.innerHeight + y >= document.body.offsetHeight - 50) current = 'contato';
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  termbar.classList.toggle('scrolled', y > 40);
  nextCmd.classList.toggle('gone', y > 80);
  backToTop.classList.toggle('show', y > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------------- Cascata: índice de atraso por item ---------------- */
document.querySelectorAll('.stagger').forEach(group => {
  [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
});
document.querySelectorAll('.pipeline-card .step, .pipeline-card .arrow').forEach((el, i) => el.style.setProperty('--i', i));

/* ---------------- Idioma (PT / EN) ---------------- */
let lang = store.get('jv-lang') === 'en' ? 'en' : 'pt';
const aboutParagraphs = [...document.querySelectorAll('.about-text p')];
const i18nEls = [...document.querySelectorAll('[data-en]')].filter(el => !aboutParagraphs.includes(el));

// guarda o texto original em português de cada elemento
i18nEls.forEach(el => { el.dataset.pt = el.innerHTML; });
aboutParagraphs.forEach(p => { p.dataset.pt = p.innerHTML.trim(); p.innerHTML = ''; });
document.querySelectorAll('[data-en-aria]').forEach(el => { el.dataset.ptAria = el.getAttribute('aria-label'); });
document.querySelectorAll('[data-en-placeholder]').forEach(el => { el.dataset.ptPlaceholder = el.getAttribute('placeholder'); });

const titles = {
  pt: 'Jorge Vieira — Infraestrutura, Segurança & IA',
  en: 'Jorge Vieira — Infrastructure, Security & AI'
};

function aboutHTML(p) { return lang === 'en' ? p.dataset.en : p.dataset.pt; }

function applyLang(newLang) {
  lang = newLang;
  root.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
  document.title = titles[lang];
  i18nEls.forEach(el => { el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.pt; });
  document.querySelectorAll('[data-en-aria]').forEach(el => el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAria : el.dataset.ptAria));
  document.querySelectorAll('[data-en-placeholder]').forEach(el => el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.ptPlaceholder));
  document.querySelectorAll('#langToggle .lang-opt').forEach(o => o.classList.toggle('on', o.dataset.lang === lang));
  if (typingState !== 'idle') finishTyping();
  glitchEls.forEach(resetGlitchWord);
  rIndex = 0; cIndex = 0; deleting = false;
  store.set('jv-lang', lang);
}

document.getElementById('langToggle').addEventListener('click', () => applyLang(lang === 'pt' ? 'en' : 'pt'));

/* ---------------- Tema (claro / escuro) ---------------- */
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  themeMeta.setAttribute('content', t === 'light' ? '#f5f7f6' : '#0a0e0f');
  store.set('jv-theme', t);
}
applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
document.getElementById('themeToggle').addEventListener('click', () => {
  root.classList.add('theme-anim');
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  setTimeout(() => root.classList.remove('theme-anim'), 450);
});

/* ---------------- Digitação do "Sobre" ---------------- */
const skillsBlock = document.querySelector('.skills-block');
let typingState = 'idle'; // idle | running | done
let typingTimeouts = [];

function finishTyping() {
  typingTimeouts.forEach(clearTimeout);
  typingTimeouts = [];
  aboutParagraphs.forEach(p => { p.innerHTML = aboutHTML(p); });
  skillsBlock.classList.add('visible');
  typingState = 'done';
}

function typeParagraph(index) {
  if (index >= aboutParagraphs.length) { skillsBlock.classList.add('visible'); typingState = 'done'; return; }
  const p = aboutParagraphs[index];
  const full = aboutHTML(p);
  let i = 0;
  (function draw() {
    if (i < full.length) {
      if (full[i] === '<') { const end = full.indexOf('>', i); i = end !== -1 ? end + 1 : i + 1; }
      else i++;
      p.innerHTML = full.slice(0, i);
      typingTimeouts.push(setTimeout(draw, 5));
    } else {
      typeParagraph(index + 1);
    }
  })();
}

function startTyping() {
  if (typingState !== 'idle') return;
  if (reduceMotion) { finishTyping(); return; }
  typingState = 'running';
  typingTimeouts.push(setTimeout(() => typeParagraph(0), 1400));
}

/* ---------------- Revelação ao rolar ---------------- */
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.id === 'sobre') startTyping();
    observer.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------------- Typewriter do hero ---------------- */
const roles = {
  pt: ['profissional de infraestrutura de TI', 'pesquisador em IA aplicada à segurança', 'blue team em formação', 'usuário de Arch Linux no dia a dia', 'automatizador de tarefas em Python'],
  en: ['IT infrastructure professional', 'researcher in AI applied to security', 'blue teamer in the making', 'daily Arch Linux user', 'Python task automator']
};
const typedEl = document.getElementById('typed-role');
let rIndex = 0, cIndex = 0, deleting = false;
function typeLoop() {
  const list = roles[lang];
  const current = list[rIndex % list.length];
  if (!deleting) {
    cIndex++;
    typedEl.textContent = current.slice(0, cIndex);
    if (cIndex >= current.length) { deleting = true; setTimeout(typeLoop, 1600); return; }
  } else {
    cIndex--;
    typedEl.textContent = current.slice(0, Math.max(cIndex, 0));
    if (cIndex <= 0) { deleting = false; rIndex = (rIndex + 1) % list.length; }
  }
  setTimeout(typeLoop, deleting ? 28 : 48);
}
if (reduceMotion) typedEl.textContent = roles[lang][0];
else setTimeout(typeLoop, 1900);

/* ---------------- Glitch: palavras que falham e trocam ---------------- */
const glitchEls = [...document.querySelectorAll('.glitch')];
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

function wordsOf(el) { return (lang === 'en' ? el.dataset.wordsEn : el.dataset.words).split('|'); }
function resetGlitchWord(el) { el.dataset.idx = '0'; el.textContent = wordsOf(el)[0]; }
glitchEls.forEach(el => { el.setAttribute('aria-live', 'off'); });

function glitchTo(el, target, done) {
  const from = el.textContent;
  const len = Math.max(from.length, target.length);
  const frames = 14;
  let f = 0;
  el.classList.add('is-glitching');
  (function step() {
    let out = '';
    for (let i = 0; i < len; i++) {
      const settle = (i / len) * frames * 0.75;
      if (f >= frames || f > settle + 4) out += target[i] || '';
      else out += Math.random() < 0.6 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : (target[i] || from[i] || '');
    }
    el.textContent = out;
    if (f++ < frames) setTimeout(step, 38);
    else { el.textContent = target; el.classList.remove('is-glitching'); if (done) done(); }
  })();
}

function inView(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

function glitchTick() {
  const visible = glitchEls.filter(inView);
  if (visible.length) {
    const el = visible[Math.floor(Math.random() * visible.length)];
    const words = wordsOf(el);
    const idx = ((parseInt(el.dataset.idx || '0', 10)) + 1) % words.length;
    el.dataset.idx = String(idx);
    glitchTo(el, words[idx]);
  }
  setTimeout(glitchTick, 2600 + Math.random() * 2200);
}

// o sobrenome só "falha" visualmente de vez em quando, sem trocar o texto
const glitchName = document.querySelector('.glitch-name');
function nameTick() {
  if (inView(glitchName)) {
    glitchName.classList.add('is-glitching');
    setTimeout(() => glitchName.classList.remove('is-glitching'), 320);
  }
  setTimeout(nameTick, 6000 + Math.random() * 5000);
}

/* ---------------- Cards de projeto: profundidade ao passar o mouse ---------------- */
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ---------------- Filtro de projetos com transição ---------------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards = [...document.querySelectorAll('.proj-card')];
function applyFilter(filtro) {
  projCards.forEach(card => {
    const show = filtro === 'all' || (card.dataset.cat || '').split(/\s+/).includes(filtro);
    if (show) {
      card.hidden = false;
      requestAnimationFrame(() => card.classList.remove('is-out'));
    } else {
      card.classList.add('is-out');
      setTimeout(() => { if (card.classList.contains('is-out')) card.hidden = true; }, reduceMotion ? 0 : 260);
    }
  });
}
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilter(btn.dataset.filter);
}));

/* ---------------- Terminal interativo ---------------- */
const termBody = document.getElementById('termBody');
const termForm = document.getElementById('termForm');
const termInput = document.getElementById('termInput');

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function printLine(html) {
  const div = document.createElement('div');
  div.className = 'ln';
  div.innerHTML = html;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}
function goTo(id, msg) {
  document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  return `<span class="out">${msg}</span>`;
}
const T = (pt, en) => (lang === 'en' ? en : pt);

const commands = {
  help: () => T(
    `<span class="out">Comandos disponíveis:</span><br>
    <span class="ok">whoami</span> — quem sou eu, em uma linha<br>
    <span class="ok">sobre</span> — resumo do perfil profissional<br>
    <span class="ok">pesquisa</span> — minha iniciação tecnológica (PIBITI)<br>
    <span class="ok">skills</span> — ferramentas por área<br>
    <span class="ok">neofetch</span> — informações do "sistema"<br>
    <span class="ok">certificados</span> — credenciais de segurança e redes<br>
    <span class="ok">projetos</span> — ir para a galeria de projetos<br>
    <span class="ok">contato</span> — formas de contato<br>
    <span class="ok">lang</span> — trocar idioma (PT/EN) · <span class="ok">theme</span> — trocar tema<br>
    <span class="ok">clear</span> — limpar o terminal`,
    `<span class="out">Available commands:</span><br>
    <span class="ok">whoami</span> — who I am, in one line<br>
    <span class="ok">about</span> — professional summary<br>
    <span class="ok">research</span> — my research project (PIBITI)<br>
    <span class="ok">skills</span> — tools by area<br>
    <span class="ok">neofetch</span> — "system" info<br>
    <span class="ok">certs</span> — security and networking credentials<br>
    <span class="ok">projects</span> — jump to the project gallery<br>
    <span class="ok">contact</span> — how to reach me<br>
    <span class="ok">lang</span> — switch language (PT/EN) · <span class="ok">theme</span> — switch theme<br>
    <span class="ok">clear</span> — clear the terminal`),
  whoami: () => `<span class="out">${T('jorge — infraestrutura de TI · cibersegurança · IA aplicada à segurança', 'jorge — IT infrastructure · cybersecurity · AI applied to security')}</span>`,
  sobre: () => `<span class="out">${T('Jorge Vieira. Assistente de Infraestrutura em Manaus e formando em ADS. Trabalho com AD/IAM, redes e endpoints; estudo segurança defensiva e pesquiso IA para detectar exfiltração de dados.', 'Jorge Vieira. IT Infrastructure Assistant in Manaus, graduating in Systems Analysis and Development. I work with AD/IAM, networks and endpoints; I study defensive security and research AI to detect data exfiltration.')}</span>`,
  pesquisa: () => goTo('pesquisa', T('PIBITI: Autoencoders + NLP para detectar exfiltração e proteger dados sensíveis (LGPD) em ONGs. Abrindo ./pesquisa...', 'PIBITI: Autoencoders + NLP to detect exfiltration and protect sensitive data (LGPD) in NGOs. Opening ./research...')),
  skills: () => `<span class="ok">infra/linux</span> <span class="out">Arch · Fedora · Active Directory · Cisco Meraki · UEM · Git</span><br>
    <span class="warn">${T('segurança', 'security')}</span> <span class="out">Wireshark · Nmap · Suricata · Splunk · Hardening · LGPD</span><br>
    <span class="ia">${T('ia/dados', 'ai/data')}</span> <span class="out">Python · PyTorch · scikit-learn · Transformers · pandas · Scapy</span>`,
  neofetch: () => `<span class="ok">jorge@arch</span><br><span class="out">OS: Arch Linux x86_64 · Shell: zsh · Role: Infra &amp; SecOps · Research: ${T('IA p/ detecção de exfiltração', 'AI for exfiltration detection')}</span>`,
  certificados: () => `<span class="out">Google Cybersecurity Professional Certificate · Cisco Ethical Hacker · Cisco Introduction to Cybersecurity</span>`,
  projetos: () => goTo('projetos', T('Navegando até ./projetos...', 'Navigating to ./projects...')),
  contato: () => goTo('contato', T('Navegando até ./contato...', 'Navigating to ./contact...')),
  ls: () => `<span class="out">${T('sobre_mim.md  pesquisa/  projetos/  certificados.log  contato.txt', 'about_me.md  research/  projects/  certificates.log  contact.txt')}</span>`,
  lang: () => { applyLang(lang === 'pt' ? 'en' : 'pt'); return `<span class="out">${T('idioma: português', 'language: english')}</span>`; },
  theme: () => { document.getElementById('themeToggle').click(); return `<span class="out">${T('tema alterado', 'theme switched')}</span>`; },
  clear: () => { termBody.innerHTML = ''; return null; },
};
// apelidos em inglês
commands.about = commands.sobre;
commands.research = commands.pesquisa;
commands.certs = commands.certificados;
commands.projects = commands.projetos;
commands.contact = commands.contato;
commands['sudo hire-me'] = () => `<span class="warn">[sudo]</span> <span class="out">${T('permissão concedida. Use os links da seção de contato para formalizar a proposta', 'permission granted. Use the links in the contact section to make it official')} &gt;_</span>`;
commands['rm -rf /'] = () => `<span class="warn">nice try.</span> <span class="out">${T('princípio do privilégio mínimo ativo', 'least privilege principle enabled')} ;)</span>`;

termForm.addEventListener('submit', e => {
  e.preventDefault();
  const raw = termInput.value.trim();
  if (!raw) return;
  printLine(`<span class="p">${T('visitante', 'visitor')}@portfolio:~$</span> ${escapeHTML(raw)}`);
  const cmd = commands[raw.toLowerCase()];
  if (cmd) { const r = cmd(); if (r) printLine(r); }
  else printLine(`<span class="out">${T('comando não encontrado', 'command not found')}: <span class="warn">${escapeHTML(raw)}</span>. ${T('digite', 'type')} <span class="ok">help</span>.</span>`);
  termInput.value = '';
});

/* ---------------- Inicialização ---------------- */
applyLang(lang);
if (!reduceMotion) {
  setTimeout(glitchTick, 3200);
  setTimeout(nameTick, 4500);
}
