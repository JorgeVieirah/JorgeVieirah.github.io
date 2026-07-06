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

// 2. CORREÇÃO: Limpa todos os parágrafos imediatamente no carregamento da página
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
  'estudante de Análise e Desenvolvimento de Sistemas',
  'aspirante Cibersegurança Defensiva',
  'desenvolvedor de automações em Python',
  'profissional de infraestrutura de TI'
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
    const cats = card.dataset.cat;
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

/* --- Integração Dinâmica com a API do GitHub --- */
async function carregarProjetosDoGitHub() {
  const username = "JorgeVieirah";
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`;
  const gridContainer = document.getElementById('projGrid');
  const loader = document.getElementById('repo-loader');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao conectar com a API do GitHub');
    
    const repos = await response.json();
    if (loader) loader.remove();

    const meusRepos = repos.filter(repo => !repo.fork && repo.description);

    if (meusRepos.length === 0) {
      gridContainer.innerHTML = `<div class="ln" style="grid-column:1/-1; text-align:center; color:var(--amber);">[ AVISO ] Nenhum repositório público descritivo encontrado.</div>`;
      return;
    }

    meusRepos.forEach(repo => {
      const principalLanguage = repo.language ? repo.language : "Shell";
      const card = document.createElement('article');
      card.className = 'proj-card';
      
      const categoriaFiltro = principalLanguage.toLowerCase();
      card.setAttribute('data-cat', `all ${categoriaFiltro}`); 

      card.innerHTML = `
        <div class="proj-termbar">
            <span class="pdot" style="background:#ff5f57;"></span>
            <span class="pdot" style="background:#febc2e;"></span>
            <span class="pdot" style="background:#28c840;"></span>
            <span class="path">${repo.name.toLowerCase()}.git</span>
        </div>
        <div class="proj-body">
            <div class="proj-cmd"><span class="p">$</span> git clone ${repo.clone_url}</div>
            <h3>${repo.name.replace(/-/g, ' ')}</h3>
            <p>${repo.description}</p>
            <div class="proj-stack">
                <span>${principalLanguage}</span>
                <span>OpenSource</span>
            </div>
            <div class="proj-links">
                <a href="${repo.html_url}" target="_blank" rel="noopener">↗ GitHub</a>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener">demo</a>` : `<a href="#" class="disabled">demo</a>`}
            </div>
        </div>
      `;
      gridContainer.appendChild(card);
    });

    const filtroAtivo = document.querySelector('.filter-btn.active').dataset.filter;
    aplicarFiltro(filtroAtivo);

  } catch (error) {
    console.error(error);
    if (loader) {
      loader.innerHTML = `<span class="warn" style="color:var(--red);">[ ERRO ] Falha ao carregar repositórios remotos.</span>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', carregarProjetosDoGitHub);

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

const commands = {
  help: () => `<span class="out">Comandos disponíveis:</span><br>
    <span class="ok">sobre</span> — resumo do perfil profissional<br>
    <span class="ok">skills</span> — stack de ferramentas e tecnologias<br>
    <span class="ok">certificados</span> — credenciais de segurança e redes<br>
    <span class="ok">projetos</span> — rolar até a galeria de projetos<br>
    <span class="ok">clear</span> — limpar o histórico do terminal`,
  sobre: () => `<span class="out">Jorge Vieira. Profissional de Infraestrutura de TI e graduando em ADS. Especialização focada em Blue Team, análise de logs e automação com scripts Python.</span>`,
  skills: () => `<span class="out">Python · Linux (Fedora/Arch) · Git/GitHub · Active Directory · Redes Cisco · Cybersecurity · Log Parsing</span>`,
  certificados: () => `<span class="out">Google Cybersecurity Professional Certificate · Cisco Networking Academy (Hacking Ético / Introdução a Redes)</span>`,
  projetos: () => { document.getElementById('projetos').scrollIntoView({behavior:'smooth'}); return `<span class="out">Navegando até ./projetos...</span>`; },
  clear: () => { termBody.innerHTML = ''; return null; },
};

commands['sudo hire-me'] = () => `<span class="warn">[sudo]</span> <span class="out">permissão concedida. Solicitação de recrutamento iniciada. Use os links da seção de contato para formalizar a proposta! 🚀</span>`;

termForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = termInput.value.trim();
  if (!raw) return;
  printLine(`<span class="p">visitante@portfolio:~$</span> ${raw}`);

  const key = raw.toLowerCase();
  if (commands[key]){
    const result = commands[key]();
    if (result) printLine(result);
  } else {
    printLine(`<span class="out">comando não encontrado: <span class="warn">${raw}</span>. digite <span class="ok">help</span> para instruções.</span>`);
  }
  termInput.value = '';
});