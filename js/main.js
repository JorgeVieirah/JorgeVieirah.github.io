// Impedir retenção indesejada de cache de scroll ao redefinir a página
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Captura do ano para o rodapé
document.getElementById('year').textContent = new Date().getFullYear();

/* --- Menu Mobile --- */
const navToggle = document.getElementById('navToggle');
const navlinks = document.getElementById('navlinks');
navToggle.addEventListener('click', () => navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

/* --- Navegação Ativa + Voltar ao Topo + Scrollspy --- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.navlinks a');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });

  // CORREÇÃO: Força a ativação da última aba quando o usuário rolar até o limite do fundo da página
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
    current = 'contato';
  }

  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
  backToTop.classList.toggle('show', window.scrollY > 600);
}, { passive: true });

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* --- Configuração da Digitação Avançada (Sobre Mim) --- */
const aboutParagraphs = document.querySelectorAll('.about-text p');
const skillsBlock = document.querySelector('.skills-block');

// 1. Salva o texto original com as tags HTML
const originalParagraphsHTML = Array.from(aboutParagraphs).map(p => p.innerHTML);

// 2. Limpa todos os parágrafos imediatamente no carregamento da página
aboutParagraphs.forEach(p => p.innerHTML = "");

let typingTimeouts = [];

function typeParagraphSequential(index) {
  if (index >= aboutParagraphs.length) {
    if (skillsBlock) skillsBlock.classList.add('visible');
    return;
  }
  
  let p = aboutParagraphs[index];
  let fullHTML = originalParagraphsHTML[index];
  let i = 0;
  
  function draw() {
    if (!document.getElementById('sobre').classList.contains('in')) return;
    
    if (i < fullHTML.length) {
      // Pula as tags HTML para não quebrar a formatação durante a digitação
      if (fullHTML[i] === '<') {
        let tagEnd = fullHTML.indexOf('>', i);
        if (tagEnd !== -1) i = tagEnd + 1;
      } else {
        i++;
      }
      p.innerHTML = fullHTML.slice(0, i);
      let timeout = setTimeout(draw, 5); // Velocidade da digitação (5ms)
      typingTimeouts.push(timeout);
    } else {
      // Quando terminar este parágrafo, chama o próximo
      typeParagraphSequential(index + 1);
    }
  }
  draw();
}

/* --- Scroll Reveal (Executa apenas uma vez) --- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      
      if (e.target.id === 'sobre') {
        let startTimeout = setTimeout(() => {
          typeParagraphSequential(0);
        }, 1800);
        typingTimeouts.push(startTimeout);
      }
      
      // Garante que a animação e o carregamento não se repitam no scroll
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

/* --- Typewriter Effect (Hero) --- */
const roles = [
  'profissional de infraestrutura de TI',
  'pesquisador em IA aplicada à segurança',
  'blue team em formação',
  'usuário de Arch Linux no dia a dia',
  'automatizador de tarefas em Python'
];
const typedEl = document.getElementById('typed-role');
let rIndex = 0, cIndex = 0, deleting = false;

function typeLoop(){
  const current = roles[rIndex];
  if (!deleting){
    cIndex++;
    typedEl.textContent = current.slice(0, cIndex);
    if (cIndex === current.length){
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    cIndex--;
    typedEl.textContent = current.slice(0, cIndex);
    if (cIndex === 0){
      deleting = false;
      rIndex = (rIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 28 : 48);
}
setTimeout(typeLoop, 2100);

/* --- Filtro Dinâmico de Projetos --- */
const filterBtns = document.querySelectorAll('.filter-btn');
function aplicarFiltro(filtro) {
  const projCards = document.querySelectorAll('.proj-card');
  projCards.forEach(card => {
    const cats = (card.dataset.cat || '').split(/\s+/);
    const show = filtro === 'all' || cats.includes(filtro);
    card.style.display = show ? '' : 'none';
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    aplicarFiltro(btn.dataset.filter);
  });
});

/* --- Terminal Interativo (Simulador Live-Terminal) --- */
const termBody = document.getElementById('termBody');
const termForm = document.getElementById('termForm');
const termInput = document.getElementById('termInput');

function printLine(html){
  const div = document.createElement('div');
  div.className = 'ln';
  div.innerHTML = html;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

// Escapa o texto digitado antes de exibir (evita injeção de HTML no terminal)
function escapeHTML(str){
  return str.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function irPara(id, msg){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
  return `<span class="out">${msg}</span>`;
}

const commands = {
  help: () => `<span class="out">Comandos disponíveis:</span><br>
    <span class="ok">whoami</span> — quem sou eu, em uma linha<br>
    <span class="ok">sobre</span> — resumo do perfil profissional<br>
    <span class="ok">pesquisa</span> — minha iniciação tecnológica (PIBITI)<br>
    <span class="ok">skills</span> — ferramentas por área<br>
    <span class="ok">neofetch</span> — informações do "sistema"<br>
    <span class="ok">certificados</span> — credenciais de segurança e redes<br>
    <span class="ok">projetos</span> — ir para a galeria de projetos<br>
    <span class="ok">contato</span> — formas de contato<br>
    <span class="ok">clear</span> — limpar o terminal`,
  whoami: () => `<span class="out">jorge — infraestrutura de TI · cibersegurança · IA aplicada à segurança</span>`,
  sobre: () => `<span class="out">Jorge Vieira. Assistente de Infraestrutura em Manaus e formando em ADS. Trabalho com AD/IAM, redes e endpoints; estudo segurança defensiva e pesquiso IA para detectar exfiltração de dados.</span>`,
  pesquisa: () => irPara('pesquisa', 'PIBITI: Autoencoders + NLP para detectar exfiltração e proteger dados sensíveis (LGPD) em ONGs. Abrindo ./pesquisa...'),
  skills: () => `<span class="ok">infra/linux</span> <span class="out">Arch · Fedora · Active Directory · Cisco Meraki · UEM · Git</span><br>
    <span class="warn">segurança</span> <span class="out">Wireshark · Nmap · Suricata · Splunk · Hardening · LGPD</span><br>
    <span class="ia">ia/dados</span> <span class="out">Python · PyTorch · scikit-learn · Transformers · pandas · Scapy</span>`,
  neofetch: () => `<span class="ok">jorge@arch</span><br><span class="out">OS: Arch Linux x86_64 · Shell: zsh · Role: Infra &amp; SecOps · Research: IA p/ detecção de exfiltração</span>`,
  certificados: () => `<span class="out">Google Cybersecurity Professional Certificate · Cisco Ethical Hacker · Cisco Introduction to Cybersecurity</span>`,
  projetos: () => irPara('projetos', 'Navegando até ./projetos...'),
  contato: () => irPara('contato', 'Navegando até ./contato...'),
  ls: () => `<span class="out">sobre_mim.md  pesquisa/  projetos/  certificados.log  contato.txt</span>`,
  clear: () => { termBody.innerHTML = ''; return null; },
};

commands['sudo hire-me'] = () => `<span class="warn">[sudo]</span> <span class="out">permissão concedida. Use os links da seção de contato para formalizar a proposta  para formalizar a proposta! 🚀</span>gt;_</span>`;
commands['rm -rf /'] = () => `<span class="warn">nice try.</span> <span class="out">princípio do privilégio mínimo ativo ;)</span>`;

termForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = termInput.value.trim();
  if (!raw) return;
  printLine(`<span class="p">visitante@portfolio:~$</span> ${escapeHTML(raw)}`);

  const key = raw.toLowerCase();
  if (commands[key]){
    const result = commands[key]();
    if (result) printLine(result);
  } else {
    printLine(`<span class="out">comando não encontrado: <span class="warn">${escapeHTML(raw)}</span>. digite <span class="ok">help</span> para instruções.</span>`);
  }
  termInput.value = '';
});