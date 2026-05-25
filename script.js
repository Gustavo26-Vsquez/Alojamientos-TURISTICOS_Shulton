

'use strict';

/* 1. NAVBAR – scroll + hamburguesa + anclas*/
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    const links = document.querySelectorAll('.nav-link');


    function onScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightActiveLink();
        toggleBackToTop();
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    /* Abrir y cerrar menú hamburguesa */
    function openMenu() {
        hamburger.classList.add('open');
        navLinks.classList.add('open');
        overlay.style.display = 'block';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-label', 'Cerrar menú');
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-label', 'Abrir menú');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }

    hamburger.addEventListener('click', () => {
        if (hamburger.classList.contains('open')) closeMenu();
        else openMenu();
    });

    overlay.addEventListener('click', closeMenu);


    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) closeMenu();
        });
    });


    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });

    /* Resaltar sección activa en la navbar */
    function highlightActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        let currentId = '';

        sections.forEach(section => {
            const top = section.getBoundingClientRect().top;
            if (top <= 120) currentId = section.getAttribute('id');
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    }
})();


(function initBackToTop() {
    const btn = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }


    window.toggleBackToTop = toggleBackToTop;

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();


/*ANIMACIÓN DE CONTADORES (estadísticas Hero)*/
(function initCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    let animated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target, 10);
            const duration = 2000; // ms
            const step = Math.ceil(target / (duration / 16));
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = current;
            }, 16);
        });
    }


    const heroStats = document.querySelector('.hero-stats');

    if (heroStats && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        animateCounters();
                    }
                });
            },
            { threshold: 0.5 }
        );
        obs.observe(heroStats);
    } else {

        animateCounters();
    }
})();


/*GALERÍA */
(function initGaleria() {
    const btns = document.querySelectorAll('.filtro-btn');
    const items = document.querySelectorAll('.gal-item');

    if (!btns.length || !items.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Cambiar estado activo en los botones
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // 2. Filtrar elementos
            items.forEach(item => {
                const cat = item.dataset.cat;

                if (filter === 'todos' || cat === filter) {
                    // Mostrar elemento
                    item.classList.remove('hidden');

                    // Forzar a que la animación de reveal no lo rompa al reaparecer
                    setTimeout(() => {
                        item.classList.add('visible');
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);

                    // Control de rejilla (Grid) por si usas elementos grandes
                    if (item.classList.contains('grande')) {
                        item.style.gridColumn = '';
                    }
                } else {
                    // Ocultar elemento por completo
                    item.classList.add('hidden');
                    item.classList.remove('visible');
                    item.style.opacity = '0';
                }
            });
        });
    });
})();


/*VALIDACIÓN DEL FORMULARIO*/
(function initForm() {
    const form = document.getElementById('reservaForm');
    const success = document.getElementById('formSuccess');
    const btnNueva = document.getElementById('btnNuevaReserva');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;


    const rules = {
        nombre: {
            validate: (v) => v.trim().length >= 3,
            message: 'Ingresa tu nombre completo (mínimo 3 caracteres).'
        },
        email: {
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
            message: 'Ingresa un correo electrónico válido.'
        },
        telefono: {
            validate: (v) => /^[\d\s\+\-\(\)]{7,15}$/.test(v.trim()),
            message: 'Ingresa un número de teléfono válido.'
        },
        personas: {
            validate: (v) => v !== '',
            message: 'Selecciona el número de personas.'
        },
        llegada: {
            validate: (v) => {
                if (!v) return false;
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                return new Date(v + 'T00:00:00') >= hoy;
            },
            message: 'La fecha de llegada no puede ser anterior a hoy.'
        },
        salida: {
            validate: (v) => {
                const llegada = document.getElementById('llegada').value;
                if (!v || !llegada) return false;
                return new Date(v + 'T00:00:00') > new Date(llegada + 'T00:00:00');
            },
            message: 'La fecha de salida debe ser posterior a la llegada.'
        },
        mensaje: {
            validate: (v) => v.trim().length === 0 || v.trim().length >= 10,
            message: 'Si escribes un mensaje, debe tener al menos 10 caracteres.'
        },
        terminos: {
            validate: () => document.getElementById('terminos').checked,
            message: 'Debes aceptar los términos y condiciones.'
        }
    };

    /* Mostrar error en un campo */
    function showError(fieldId, msg) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`error-${fieldId}`);

        if (!field) return;

        field.classList.add('error');
        field.classList.remove('valid');

        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
    }

    /* Marcar campo como válido */
    function showValid(fieldId) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`error-${fieldId}`);

        if (!field) return;

        field.classList.remove('error');
        field.classList.add('valid');

        if (errorEl) {
            errorEl.textContent = '';
        }
    }

    /* Validar un campo individual */
    function validateField(fieldId) {
        const rule = rules[fieldId];
        if (!rule) return true;

        const field = document.getElementById(fieldId);
        if (!field) return true;

        const value = field.type === 'checkbox' ? field.checked : field.value;

        if (rule.validate(value)) {
            showValid(fieldId);
            return true;
        } else {
            showError(fieldId, rule.message);
            return false;
        }
    }

    /*Validación en tiempo real */
    Object.keys(rules).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const eventType = field.type === 'checkbox' ? 'change' : 'blur';
        field.addEventListener(eventType, () => validateField(fieldId));

        //  limpiar errores en el imput mientras escribe
        if (field.type !== 'checkbox') {
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) validateField(fieldId);
            });
        }
    });

    /*  Submit */
    form.addEventListener('submit', (e) => {
        e.preventDefault();


        const isValid = Object.keys(rules).reduce((acc, fieldId) => {
            return validateField(fieldId) && acc;
        }, true);

        if (!isValid) {

            const firstError = form.querySelector('.error, input.error, select.error, textarea.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Simular envío
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

        setTimeout(() => {
            form.style.display = 'none';
            success.classList.add('visible');
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1800);
    });

    /* Nueva reserva */
    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
            form.reset();

            // Limpiar clases de validación
            form.querySelectorAll('input, select, textarea').forEach(el => {
                el.classList.remove('valid', 'error');
            });
            form.querySelectorAll('.error-msg').forEach(el => {
                el.textContent = '';
            });

            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').textContent = 'Solicitar Reserva';

            form.style.display = 'block';
            success.classList.remove('visible');
        });
    }
})();


/* AÑO DINÁMICO  */
(function setYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
})();



(function initAnimations() {
    if (!('IntersectionObserver' in window)) return;


    const style = document.createElement('style');
    style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-left {
      opacity: 0;
      transform: translateX(-30px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .reveal-left.visible {
      opacity: 1;
      transform: translateX(0);
    }
    .reveal-right {
      opacity: 0;
      transform: translateX(30px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .reveal-right.visible {
      opacity: 1;
      transform: translateX(0);
    }
  `;
    document.head.appendChild(style);

    // Asignar clases reveal a elementos clave
    const toReveal = [
        { selector: '.section-header', cls: 'reveal' },
        { selector: '.servicio-card', cls: 'reveal' },
        { selector: '.gal-item', cls: 'reveal' },
        { selector: '.nosotros-visual', cls: 'reveal-left' },
        { selector: '.nosotros-text', cls: 'reveal-right' },
        { selector: '.contacto-info', cls: 'reveal-left' },
        { selector: '.form-wrapper', cls: 'reveal-right' },
        { selector: '.footer-brand', cls: 'reveal' },
        { selector: '.footer-nav', cls: 'reveal' },
        { selector: '.info-item', cls: 'reveal' },
    ];

    toReveal.forEach(({ selector, cls }) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add(cls);
            el.style.transitionDelay = `${i * 0.08}s`;
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
        
        setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        el.classList.add('visible');
    });
}, 2500); // Si en 2.5s no animó, forzar visible
    });
})();


/* FECHAS MÍNIMAS EN EL FORMULARIO */
(function setMinDates() {
    const llegada = document.getElementById('llegada');
    const salida = document.getElementById('salida');

    if (!llegada || !salida) return;

    const hoy = new Date().toISOString().split('T')[0];
    llegada.min = hoy;
    salida.min = hoy;

    // Actualizar mínimo de salida al cambiar llegada
    llegada.addEventListener('change', () => {
        salida.min = llegada.value;
        if (salida.value && salida.value <= llegada.value) {
            salida.value = '';
        }
    });
})();
