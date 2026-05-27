/* =========================================================
   MEIA VOLTA DO ÚRANO — interactions v2
   ========================================================= */

(() => {
  'use strict';

  /* ── Year ─────────────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Render events from store before any observers attach ── */
  if (window.MVUEvents) {
    window.MVUEvents.renderEvents(document.getElementById('eventos-list'));
  }

  /* ── Nav: frosted glass on scroll ────────────────────── */
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ───────────────────────────────── */
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      mobile.setAttribute('aria-hidden', String(!open));
    });
    mobile.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobile.setAttribute('aria-hidden', 'true');
      })
    );
  }

  /* ── Scroll reveal ───────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = el.parentElement
        ? [...el.parentElement.querySelectorAll(':scope > .reveal')]
        : [];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = `${Math.min(idx * 80, 480)}ms`;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── Smooth anchor scroll with nav offset ────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const navH = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
          ) || 68;
          const top = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ── Hero sketch scroll animation ───────────────────── */
  const heroEl      = document.querySelector('.hero');
  const ring1       = document.getElementById('ring-1');
  const ring2       = document.getElementById('ring-2');
  const ring3       = document.getElementById('ring-3');
  const ring1f      = document.getElementById('ring-1f');
  const ring2f      = document.getElementById('ring-2f');
  const ring3f      = document.getElementById('ring-3f');
  const planetBands = document.getElementById('planet-bands');
  const moonGroup   = document.getElementById('moon-group');
  const figureBook  = document.getElementById('figure-book');
  const stars       = [
    { el: document.getElementById('star-1'), rate: 1.0 },
    { el: document.getElementById('star-2'), rate: 0.65 },
    { el: document.getElementById('star-3'), rate: 0.55 },
    { el: document.getElementById('star-4'), rate: 0.80 },
    { el: document.getElementById('star-5'), rate: 0.35 },
    { el: document.getElementById('star-6'), rate: 0.28 },
    { el: document.getElementById('star-7'), rate: 0.45 },
  ];

  if (heroEl && ring1 && ring2 && ring3) {
    const easeIO = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const lerpN  = (a, b, t) => a + (b - a) * t;
    const turnPage1 = document.getElementById('turn-page-1');
    const turnPage2 = document.getElementById('turn-page-2');
    const turnPage3 = document.getElementById('turn-page-3');

    // Page-turn: the free edge arcs upward over the spine, like a real page flip.
    // tp 0 = page resting on right side; tp 0.5 = page standing vertical (max lift);
    // tp 1 = page resting on left side.
    const morphPage = (el, tp) => {
      if (!el) return;

      // Rotate angle 0 → π maps right-flat → upright → left-flat
      const angle = tp * Math.PI;
      const cosA  = Math.cos(angle);   // 1 → 0 → -1  (horizontal reach)
      const sinA  = Math.sin(angle);   // 0 → 1 → 0   (vertical lift)

      const spineX    = 210;
      const pageWidth = 160;  // 370-210 each side
      const maxLift   = 82;   // peak upward travel of the free edge (px)

      const freeX = spineX + cosA * pageWidth;
      const ctrlX = spineX + cosA * pageWidth * 0.55;

      // Free edge lifts with sin; control points overshoot slightly for curl
      const liftFree = sinA * maxLift;
      const liftCtrl = sinA * maxLift * 1.35;

      el.setAttribute('d',
        `M 210,428 ` +
        `Q ${ctrlX.toFixed(1)},${(443 - liftCtrl).toFixed(1)} ${freeX.toFixed(1)},${(443 - liftFree).toFixed(1)} ` +
        `L ${freeX.toFixed(1)},${(572 - liftFree * 0.45).toFixed(1)} ` +
        `Q ${ctrlX.toFixed(1)},${(566 - liftCtrl * 0.35).toFixed(1)} 210,564 Z`
      );
    };

    const animateSketch = () => {
      const prog = Math.max(0, Math.min(1, window.scrollY / (heroEl.offsetHeight * 0.88)));

      // Rings stay horizontal, each tilts very slightly as planet "turns"
      const a1 = 12 + prog * 5;
      const a2 = 12 + prog * 3.5;
      const a3 =  9 + prog * 2;
      ring1.setAttribute('transform',  `rotate(${a1} 210 150)`);
      ring2.setAttribute('transform',  `rotate(${a2} 210 150)`);
      ring3.setAttribute('transform',  `rotate(${a3} 210 150)`);
      if (ring1f) ring1f.setAttribute('transform', `rotate(${a1} 210 150)`);
      if (ring2f) ring2f.setAttribute('transform', `rotate(${a2} 210 150)`);
      if (ring3f) ring3f.setAttribute('transform', `rotate(${a3} 210 150)`);

      // Planet bands rotate visibly (planet turning)
      if (planetBands) {
        planetBands.style.transformOrigin = '210px 150px';
        planetBands.style.transform = `rotate(${prog * 160}deg)`;
      }

      // Moon drifts along its orbit arc
      if (moonGroup) {
        moonGroup.style.transform = `translate(${prog * 42}px, ${prog * 90}px)`;
      }

      // Stars parallax — closer (bigger) stars scroll faster
      stars.forEach(({ el, rate }) => {
        if (el) el.style.transform = `translateY(${-prog * 110 * rate}px)`;
      });

      // Book floats very gently (subtle upward drift)
      if (figureBook) {
        figureBook.style.transform = `translateY(${-prog * 10}px)`;
      }

      // Page turns — top of stack flips first (page 3 = highest DOM z-order)
      morphPage(turnPage3, easeIO(Math.max(0, Math.min(1, (prog - 0.02) / 0.30))));
      morphPage(turnPage2, easeIO(Math.max(0, Math.min(1, (prog - 0.36) / 0.30))));
      morphPage(turnPage1, easeIO(Math.max(0, Math.min(1, (prog - 0.68) / 0.28))));
    };

    window.addEventListener('scroll', animateSketch, { passive: true });
    animateSketch();
  }

  /* ── Wine pour animation (scroll-driven) ────────────── */
  const pourSection   = document.querySelector('.statement');
  const pourWrap      = document.getElementById('statement-pour');
  const bottleGroup   = document.getElementById('bottle-group');
  const pourClipRect  = document.getElementById('pour-clip-rect');
  const wineFill      = document.getElementById('wine-fill');

  if (pourSection && pourWrap && bottleGroup && pourClipRect && wineFill) {
    const STREAM_TOP  = 44;    // clip rect starting y (top of pour)
    const STREAM_H    = 242;   // 285 - 43 = full pour height
    const BOWL_TOP    = 285;   // glass rim y
    const BOWL_BOTTOM = 375;   // glass stem join y
    const BOWL_H      = BOWL_BOTTOM - BOWL_TOP;  // 90

    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animatePour = () => {
      const rect  = pourSection.getBoundingClientRect();
      const viewH = window.innerHeight;

      const raw  = (viewH - rect.top) / (viewH * 1.1 + rect.height * 0.6);
      const prog = Math.max(0, Math.min(1, raw));

      if (prog > 0.05) pourWrap.classList.add('visible');

      // ① Bottle tilt: 0deg → -30deg over progress 0 → 0.55
      const tiltT = Math.max(0, Math.min(1, prog / 0.55));
      bottleGroup.style.transform = `rotate(${-30 * ease(tiltT)}deg)`;

      // ② Pour stream: reveal clip rect top-to-bottom, progress 0.28 → 0.65
      const streamT = Math.max(0, Math.min(1, (prog - 0.28) / 0.37));
      pourClipRect.setAttribute('height', (STREAM_H * ease(streamT)).toFixed(1));

      // ③ Wine fill: rises from progress 0.36 → 0.78
      const fillT = Math.max(0, Math.min(1, (prog - 0.36) / 0.42));
      const fillH = BOWL_H * ease(fillT);
      wineFill.setAttribute('y',      (BOWL_BOTTOM - fillH).toFixed(1));
      wineFill.setAttribute('height', fillH.toFixed(1));
    };

    window.addEventListener('scroll', animatePour, { passive: true });
    animatePour();
  }




})();
