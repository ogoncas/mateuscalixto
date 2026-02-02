document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. CONTROLE DO MENU HAMBÚRGUER (MOBILE DRAWER)
       ========================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    /**
     * Alterna o estado do menu (Abre/Fecha)
     */
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navList.classList.toggle('active');
        
        // Adiciona classe ao body para bloquear o scroll lateral/fundo
        if (navList.classList.contains('active')) {
            body.classList.add('menu-open');
        } else {
            body.classList.remove('menu-open');
        }
    };

    // Evento de clique no botão hambúrguer
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita propagação indesejada
            toggleMenu();
        });
    }

    // Fecha o menu automaticamente ao clicar em qualquer link da navegação
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navList.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Fecha o menu se o usuário clicar fora da área do menu lateral
    document.addEventListener('click', (e) => {
        if (navList.classList.contains('active') && !navList.contains(e.target) && !hamburger.contains(e.target)) {
            toggleMenu();
        }
    });


    /* ==========================================================================
       2. EFEITO DE SCROLL NO HEADER (BLUR E BACKGROUND)
       ========================================================================== */
    const header = document.getElementById('header');

    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);


    /* ==========================================================================
       3. SCROLL REVEAL (ANIMAÇÃO DE ENTRADA DOS ELEMENTOS)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const checkReveal = () => {
        // Define que a animação dispara quando o item está a 85% da altura da tela
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    // Registra o evento de scroll para as animações
    window.addEventListener('scroll', checkReveal);
    // Executa uma vez no carregamento para itens que já estão visíveis
    checkReveal();


    /* ==========================================================================
       4. NAVEGAÇÃO ATIVA (ACTIVE LINK NO SCROLL)
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');

    const scrollActive = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Ajuste baseado na altura do header
            const sectionId = current.getAttribute('id');
            const link = document.querySelector(`.nav-list a[href*=${sectionId}]`);

            if (link) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            }
        });
    };

    window.addEventListener('scroll', scrollActive);


    /* ==========================================================================
       5. INTERATIVIDADE DO HERO (PARALLAX E MOVIMENTO DO MOUSE)
       ========================================================================== */
    const codeCard = document.querySelector('.code-card');
    const heroGlow = document.querySelector('.hero-bg-glow');

    /**
     * Aplica inclinação 3D no card de código baseada na posição do mouse
     */
    const handleHeroParallax = (e) => {
        if (window.innerWidth > 1024) { // Executa apenas em desktops para performance
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calcula o centro da tela
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Determina a intensidade da inclinação
            const percentX = (mouseX - centerX) / centerX;
            const percentY = (mouseY - centerY) / centerY;

            if (codeCard) {
                const rotateX = percentY * -10; // Inclinação no eixo X
                const rotateY = percentX * 10;  // Inclinação no eixo Y
                codeCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }

            if (heroGlow) {
                const moveX = percentX * 30;
                const moveY = percentY * 30;
                heroGlow.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        }
    };

    // Detecta movimento do mouse na seção hero
    window.addEventListener('mousemove', handleHeroParallax);


    /* ==========================================================================
       6. OTIMIZAÇÃO DE PERFORMANCE (DEBOUNCE/THROTTLE)
       ========================================================================== */
    // Função utilitária para evitar excesso de processamento no resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Se a tela for redimensionada para desktop, remove bloqueio de scroll
            if (window.innerWidth > 768) {
                body.classList.remove('menu-open');
                if (navList.classList.contains('active')) {
                    toggleMenu();
                }
            }
        }, 250);
    });

});