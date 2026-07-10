document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. TEMA (MODO ESCURO/CLARO) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = sessionStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            sessionStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            sessionStorage.setItem('theme', 'dark');
        }
    });


    // --- 2. LÓGICA DE NAVEGAÇÃO SPA ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    function updateRoute() {
        let hash = window.location.hash || '#home';
        
        sections.forEach(sec => sec.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        const activeSection = document.querySelector(hash);
        if (activeSection) {
            activeSection.classList.add('active');
        } else {
            document.querySelector('#home').classList.add('active');
            hash = '#home';
        }

        const activeLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        closeMobileMenu();
        window.scrollTo(0,0);
        
        observeElements();
    }

    function toggleMobileMenu() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
        if (sidebar.classList.contains('open')) {
            navLinks[0].focus();
        }
    }

    function closeMobileMenu() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    window.addEventListener('hashchange', updateRoute);
    

    // --- 3. INTERSECTION OBSERVER (ANIMAÇÕES DE SCROLL) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function observeElements() {
        const elementsToAnimate = document.querySelectorAll('.fade-up');
        elementsToAnimate.forEach(el => {
            el.classList.remove('is-visible');
            scrollObserver.observe(el);
        });
    }


    // --- 4. GERAÇÃO DE DADOS DINÂMICOS (HOME) ---
    function initHomeStats() {
        const statsContainer = document.getElementById('home-stats');
        statsContainer.innerHTML = ''; 
        
        const totalAlunos = alunos.length;
        const totalFerramentas = alunos.filter(a => a.ferramenta !== null).length;
        // Mapeia anos, garantindo que inteiros e decimais (ex: 2026.1) sejam formatados como texto para min/max se precisar, 
        // mas Math.min e max lidam bem com números decimais. Usaremos o valor inteiro para extrair apenas o "Ano".
        const anosInt = alunos.map(a => Math.floor(a.ano)); 
        const anoMin = Math.min(...anosInt);
        const anoMax = Math.max(...anosInt);
        const periodo = `${anoMin} – ${anoMax}`;

        const statsData = [
            { num: totalAlunos, label: 'Alunos Orientados' },
            { num: totalFerramentas, label: 'Ferramentas Criadas' },
            { num: periodo, label: 'Período de Atuação' }
        ];

        statsData.forEach(stat => {
            const statBox = document.createElement('div');
            statBox.classList.add('stat-box');

            const spanNum = document.createElement('span');
            spanNum.classList.add('stat-num');
            spanNum.textContent = stat.num;

            const spanLabel = document.createElement('span');
            spanLabel.classList.add('stat-label');
            spanLabel.textContent = stat.label;

            statBox.appendChild(spanNum);
            statBox.appendChild(spanLabel);
            statsContainer.appendChild(statBox);
        });
    }


    // --- 5. RENDERIZAÇÃO E BUSCA DE TCCs ---
    const tccGrid = document.getElementById('tcc-grid');
    const tccEmptyState = document.getElementById('tcc-empty-state');
    const searchInput = document.getElementById('search-tcc');
    const semesterFilter = document.getElementById('filter-semester');

    // Popular o select de semestres dinamicamente
    function initSemesterFilter() {
        // Extrai anos/semestres únicos, converte para string e ordena de forma decrescente
        const uniqueSemesters = [...new Set(alunos.map(a => a.ano))].sort((a, b) => b - a);
        
        uniqueSemesters.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre.toString();
            option.textContent = semestre.toString();
            semesterFilter.appendChild(option);
        });
    }

    function renderTCCs(data) {
        tccGrid.innerHTML = ''; 

        if (data.length === 0) {
            tccGrid.style.display = 'none';
            tccEmptyState.classList.remove('hidden');
            return;
        }

        tccGrid.style.display = 'grid';
        tccEmptyState.classList.add('hidden');

        data.forEach(aluno => {
            const card = document.createElement('div');
            card.classList.add('card', 'fade-up');
            
            const cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header');
            
            const badgeAno = document.createElement('span');
            badgeAno.classList.add('badge-ano');
            badgeAno.textContent = aluno.ano;
            cardHeader.appendChild(badgeAno);
            
            const title = document.createElement('h3');
            title.classList.add('card-title');
            title.textContent = aluno.tituloTCC;
            
            const meta = document.createElement('div');
            meta.classList.add('card-meta');
            const strongAluno = document.createElement('strong');
            strongAluno.textContent = 'Aluno(a): ';
            meta.appendChild(strongAluno);
            meta.appendChild(document.createTextNode(aluno.nome));
            
            const actions = document.createElement('div');
            actions.classList.add('card-actions', 'mt-auto');
            
            // Lógica de validação do Link do TCC
            const isLinkValid = aluno.linkTCC && (aluno.linkTCC.startsWith('http://') || aluno.linkTCC.startsWith('https://'));
            const linkTCC = document.createElement('a');
            
            if (isLinkValid) {
                linkTCC.href = aluno.linkTCC;
                linkTCC.target = '_blank';
                linkTCC.classList.add('btn', 'btn-primary', 'btn-sm');
            } else {
                linkTCC.href = '#';
                linkTCC.classList.add('btn', 'btn-primary', 'btn-sm', 'btn-disabled');
                linkTCC.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Este documento não possui link direto. Por favor, procure por este trabalho no repositório institucional da UFC.');
                });
            }
            
            linkTCC.textContent = 'Ver TCC';
            actions.appendChild(linkTCC);
            
            if (aluno.ferramenta) {
                const linkFerramenta = document.createElement('a');
                linkFerramenta.href = aluno.ferramenta.link;
                linkFerramenta.target = '_blank';
                linkFerramenta.classList.add('btn', 'btn-accent', 'btn-sm');
                linkFerramenta.textContent = 'Ver Ferramenta';
                actions.appendChild(linkFerramenta);
            }

            if (aluno.github) {
                const linkGithub = document.createElement('a');
                linkGithub.href = aluno.github;
                linkGithub.target = '_blank';
                linkGithub.classList.add('btn', 'btn-outline', 'btn-sm');
                linkGithub.textContent = 'GitHub';
                actions.appendChild(linkGithub);
            }
            
            card.appendChild(cardHeader);
            card.appendChild(title);
            card.appendChild(meta);
            card.appendChild(actions);
            
            tccGrid.appendChild(card);
            scrollObserver.observe(card);
        });
    }

    // Função de filtragem combinada (texto + semestre)
    function applyFilters() {
        const termo = searchInput.value.toLowerCase();
        const semestreSelecionado = semesterFilter.value;

        const filtrados = alunos.filter(a => {
            const matchTexto = a.nome.toLowerCase().includes(termo) || a.tituloTCC.toLowerCase().includes(termo);
            const matchSemestre = semestreSelecionado === "" || a.ano.toString() === semestreSelecionado;
            
            return matchTexto && matchSemestre;
        });

        renderTCCs(filtrados);
    }

    // Listeners para ambos os campos dispararem a filtragem
    searchInput.addEventListener('input', applyFilters);
    semesterFilter.addEventListener('change', applyFilters);


    // --- 6. RENDERIZAÇÃO DE FERRAMENTAS ---
    function renderFerramentas() {
        const ferramentasGrid = document.getElementById('ferramentas-grid');
        ferramentasGrid.innerHTML = '';

        const trabalhosComFerramenta = alunos.filter(a => a.ferramenta !== null);

        trabalhosComFerramenta.forEach(aluno => {
            const card = document.createElement('div');
            card.classList.add('card', 'fade-up');
            
            const title = document.createElement('h3');
            title.classList.add('card-title');
            title.textContent = aluno.ferramenta.nome;
            
            const meta = document.createElement('div');
            meta.classList.add('card-meta');
            const strongAutor = document.createElement('strong');
            strongAutor.textContent = 'Autor(a): ';
            meta.appendChild(strongAutor);
            meta.appendChild(document.createTextNode(`${aluno.nome} (${aluno.ano})`));
            
            const desc = document.createElement('p');
            desc.classList.add('card-desc');
            desc.textContent = aluno.ferramenta.descricao;
            
            const actions = document.createElement('div');
            actions.classList.add('card-actions');
            
            const linkAcesso = document.createElement('a');
            linkAcesso.href = aluno.ferramenta.link;
            linkAcesso.target = '_blank';
            linkAcesso.classList.add('btn', 'btn-primary', 'btn-sm', 'w-100');
            linkAcesso.textContent = 'Acessar Ferramenta';
            actions.appendChild(linkAcesso);

            if (aluno.github) {
                const linkGithub = document.createElement('a');
                linkGithub.href = aluno.github;
                linkGithub.target = '_blank';
                linkGithub.classList.add('btn', 'btn-outline', 'btn-sm', 'w-100');
                linkGithub.textContent = 'Ver Repositório';
                actions.appendChild(linkGithub);
            }
            
            card.appendChild(title);
            card.appendChild(meta);
            card.appendChild(desc);
            card.appendChild(actions);
            
            ferramentasGrid.appendChild(card);
            scrollObserver.observe(card);
        });
    }


    // --- 7. INICIALIZAÇÃO GERAL ---
    document.getElementById('ano-atual').textContent = new Date().getFullYear();

    initHomeStats();
    initSemesterFilter(); // Inicializa o novo filtro
    
    // Ordena os TCCs do mais recente para o mais antigo por padrão
    const alunosOrdenados = [...alunos].sort((a, b) => b.ano - a.ano);
    renderTCCs(alunosOrdenados);
    
    renderFerramentas();
    
    updateRoute(); 
});