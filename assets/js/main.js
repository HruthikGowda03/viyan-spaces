/* ==========================================================================
   Viyán Spaces — interaction layer
   No dependencies. Everything degrades gracefully without JS.
   --------------------------------------------------------------------------
   01 helpers            06 hero: split text, rotator, parallax
   02 preloader          07 process timeline
   03 header + nav       08 projects: filter + lightbox
   04 mobile menu        09 testimonials slider
   05 reveal + counters  10 contact form
   11 micro-interactions  12 footer word + misc
   ========================================================================== */
(function () {
  'use strict';

  /* ================================================================ 01 ==== */
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE    = window.matchMedia('(pointer: fine)').matches;

  // one shared rAF ticker for all scroll-driven work
  const tickers = [];
  const onFrame = (fn) => { tickers.push(fn); schedule(); };
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const y = window.pageYOffset;
      for (let i = 0; i < tickers.length; i++) tickers[i](y);
    });
  }

  /* ================================================================ 02 ==== */
  /* Preloader                                                            */
  const preloader = $('#preloader');
  const preBar = $('#preBar');
  const preNum = $('#preNum');
  let unlocked = false;

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (preloader) preloader.classList.add('is-done');
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-ready');
    startHeroIntro();
    setTimeout(() => { if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 900);
  }

  document.body.classList.add('is-locked');

  if (preloader) {
    if (REDUCED) {
      if (preBar) preBar.style.width = '100%';
      if (preNum) preNum.textContent = '100';
      setTimeout(unlock, 120);
    } else {
      let pct = 0;
      const started = performance.now();
      const step = (now) => {
        const t = clamp((now - started) / 1500, 0, 1);
        // ease-out so it settles quickly then holds
        pct = Math.round(100 * (1 - Math.pow(1 - t, 2.1)));
        if (preBar) preBar.style.width = pct + '%';
        if (preNum) preNum.textContent = pct;
        if (t < 1) requestAnimationFrame(step);
        else setTimeout(unlock, 260);
      };
      requestAnimationFrame(step);
      // failsafe — never trap the visitor
      setTimeout(unlock, 5000);
    }
  } else {
    document.body.classList.remove('is-locked');
  }

  /* ================================================================ 03 ==== */
  /* Sticky header, scroll progress, active nav pill                     */
  const header = $('#header');
  const bar = $('#scrollBar');
  const navPill = $('#navPill');
  const toTop = $('#toTop');
  const toTopRing = $('#toTopRing');
  const RING = 2 * Math.PI * 20;

  if (toTopRing) {
    toTopRing.style.strokeDasharray = RING;
    toTopRing.style.strokeDashoffset = RING;
  }

  function scrollWork(y) {
    const vh = window.innerHeight;
    const doc = document.documentElement.scrollHeight - vh;
    const p = doc > 0 ? clamp(y / doc, 0, 1) : 0;

    if (header) header.classList.toggle('is-stuck', y > 40);
    if (bar) bar.style.width = (p * 100) + '%';
    if (toTop) toTop.classList.toggle('is-on', y > vh * 0.7);
    if (toTopRing) toTopRing.style.strokeDashoffset = RING * (1 - p);

    movePill();
  }
  onFrame(scrollWork);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  const navLinks = $$('.nav__link');
  function movePill() {
    if (!navPill || !header || !header.classList.contains('is-stuck')) return;
    const active = navLinks.find((a) => a.classList.contains('is-active')) || navLinks[0];
    if (!active) return;
    navPill.style.width = active.offsetWidth + 'px';
    navPill.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }

  // active section highlighting
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
        movePill();
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ================================================================ 04 ==== */
  /* Mobile menu                                                          */
  const burger = $('#burger');
  const menu = $('#mobileMenu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
  }
  if (burger) {
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ================================================================ 05 ==== */
  /* Scroll reveal + counters                                             */
  const revealables = $$('[data-reveal]');
  if (REDUCED || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach((el) => ro.observe(el));
  }

  const counters = $$('.count');
  function runCount(el) {
    const to = parseFloat(el.getAttribute('data-to')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    if (REDUCED) { el.textContent = to + suffix; return; }
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        runCount(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  }

  /* ================================================================ 06 ==== */
  /* Hero: word-by-word intro, rotating label, parallax                   */
  const heroTitle = $('[data-split]');

  function splitWords(el) {
    if (!el) return [];
    const words = [];
    const walk = (node) => {
      Array.prototype.slice.call(node.childNodes).forEach((kid) => {
        if (kid.nodeType === 3) {
          if (!kid.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          kid.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const mask = document.createElement('span');
            mask.className = 'w-mask';
            const w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            mask.appendChild(w);
            frag.appendChild(mask);
            words.push(w);
          });
          node.replaceChild(frag, kid);
        } else if (kid.nodeType === 1 && kid.tagName !== 'BR') {
          walk(kid);
        }
      });
    };
    walk(el);
    return words;
  }

  let heroWords = [];
  function startHeroIntro() {
    if (REDUCED) { heroWords.forEach((w) => { w.style.transform = 'none'; }); return; }
    heroWords.forEach((w, i) => {
      w.style.transitionDelay = (90 + i * 55) + 'ms';
      requestAnimationFrame(() => { w.style.transform = 'none'; });
    });
  }
  heroWords = splitWords(heroTitle);
  heroWords.forEach((w) => { w.style.transform = 'translateY(115%)'; });

  // rotating label
  const rotator = $('#rotator');
  if (rotator) {
    const words = JSON.parse(rotator.getAttribute('data-words') || '[]');
    if (words.length > 1 && !REDUCED) {
      let i = 0;
      setInterval(() => {
        i = (i + 1) % words.length;
        rotator.style.transition = 'opacity .35s ease, transform .35s ease';
        rotator.style.opacity = '0';
        rotator.style.transform = 'translateY(-8px)';
        setTimeout(() => {
          rotator.textContent = words[i];
          rotator.style.opacity = '1';
          rotator.style.transform = 'none';
        }, 360);
      }, 3000);
    }
  }

  // parallax layers
  const layers = $$('[data-parallax]');
  if (layers.length) {
    onFrame((y) => {
      const vh = window.innerHeight;
      for (let i = 0; i < layers.length; i++) {
        const el = layers[i];
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        const mid = r.top + r.height / 2;
        el.style.transform = 'translate3d(0,' + (-(mid - vh / 2) * speed).toFixed(2) + 'px,0)';
      }
    });
  }

  // marquee: duplicate the track so the loop is seamless
  const track = $('#marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ================================================================ 07 ==== */
  /* Process timeline fill                                                */
  const steps = $('#steps');
  if (steps) {
    const so = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-animating');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    so.observe(steps);
  }

  /* ================================================================ 08 ==== */
  /* Projects: filter + lightbox                                          */
  const grid = $('#projGrid');
  const allProjects = $$('.proj');
  const filters = $$('.filter');

  function animateIn(cards) {
    cards.forEach((card, i) => {
      card.style.transitionDelay = REDUCED ? '0ms' : (i * 55) + 'ms';
      card.classList.remove('is-in');
      // force reflow so the transition restarts
      void card.offsetWidth;
      card.classList.add('is-in');
    });
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-filter');
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      const shown = [];
      allProjects.forEach((card) => {
        const match = f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !match);
        if (match) shown.push(card);
      });
      animateIn(shown);
    });
  });

  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle');
  const lbDesc = $('#lbDesc');
  const lbType = $('#lbType');
  const lbLoc = $('#lbLoc');
  const lbArea = $('#lbArea');
  const lbYear = $('#lbYear');
  let visible = allProjects.slice();
  let lbIndex = 0;
  let lastFocus = null;

  function fill(i) {
    const card = visible[i];
    if (!card) return;
    lbIndex = i;
    const d = card.dataset;
    lbImg.src = d.img;
    lbImg.alt = d.title;
    lbTitle.textContent = d.title;
    lbDesc.textContent = d.desc;
    lbType.textContent = d.type;
    lbLoc.textContent = d.loc;
    lbArea.textContent = d.area;
    lbYear.textContent = d.year;
  }
  function openLb(card) {
    if (!lb) return;
    visible = allProjects.filter((c) => !c.classList.contains('is-hidden'));
    const idx = visible.indexOf(card);
    fill(idx < 0 ? 0 : idx);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    lastFocus = document.activeElement;
    const c = $('#lbClose'); if (c) c.focus();
  }
  function closeLb() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  allProjects.forEach((card) => {
    card.addEventListener('click', () => openLb(card));
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(card); }
    });
  });

  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => fill((lbIndex - 1 + visible.length) % visible.length));
    $('#lbNext').addEventListener('click', () => fill((lbIndex + 1) % visible.length));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    const lbCta = $('#lbCta');
    if (lbCta) lbCta.addEventListener('click', () => setTimeout(closeLb, 60));
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') fill((lbIndex - 1 + visible.length) % visible.length);
      else if (e.key === 'ArrowRight') fill((lbIndex + 1) % visible.length);
    });
    // swipe
    let sx = 0;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 60) fill(dx < 0 ? (lbIndex + 1) % visible.length : (lbIndex - 1 + visible.length) % visible.length);
    });
  }

  /* ================================================================ 09 ==== */
  /* Testimonials slider                                                  */
  const vTrack = $('#voiceTrack');
  if (vTrack) {
    const slides = $$('.slide', vTrack);
    const dotsWrap = $('#voiceDots');
    let vi = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);

    function go(i) {
      vi = (i + slides.length) % slides.length;
      vTrack.style.transform = 'translateX(' + (-vi * 100) + '%)';
      dots.forEach((d, n) => d.classList.toggle('is-active', n === vi));
      slides.forEach((s, n) => s.classList.toggle('is-active', n === vi));
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (REDUCED) return;
      timer = setInterval(() => go(vi + 1), 6800);
    }
    const prev = $('#voicePrev'), next = $('#voiceNext');
    if (prev) prev.addEventListener('click', () => { go(vi - 1); restart(); });
    if (next) next.addEventListener('click', () => { go(vi + 1); restart(); });

    const slider = vTrack.closest('.slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
      slider.addEventListener('mouseleave', restart);
    }

    // drag / swipe
    let dx0 = null;
    vTrack.addEventListener('pointerdown', (e) => { dx0 = e.clientX; vTrack.setPointerCapture(e.pointerId); });
    vTrack.addEventListener('pointerup', (e) => {
      if (dx0 === null) return;
      const dx = e.clientX - dx0;
      if (Math.abs(dx) > 50) { go(dx < 0 ? vi + 1 : vi - 1); restart(); }
      dx0 = null;
    });

    go(0);
    restart();
  }

  /* ================================================================ 10 ==== */
  /* Contact form                                                         */
  /* Demo build: shows a success state locally.
     To go live, set FORM_ENDPOINT below to a Formspree / Google Apps
     Script / Web3Forms URL and the enquiry will POST for real.            */
  const FORM_ENDPOINT = '';

  const form = $('#enquiryForm');
  if (form) {
    const success = $('#formSuccess');
    // keep the hidden success panel out of the tab order
    if (success) { success.inert = true; }

    const rules = {
      name: (v) => v.trim().length > 1,
      phone: (v) => (v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').length === 10),
      email: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
      message: (v) => v.trim().length > 8,
    };

    function validateField(input) {
      const rule = rules[input.id];
      if (!rule) return true;
      const ok = rule(input.value);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      return ok;
    }

    $$('input, textarea', form).forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      $$('input, textarea', form).forEach((input) => {
        if (input.type === 'hidden' || input.classList.contains('hp')) return;
        if (!validateField(input) && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== 'company') data[k] = v; });

      const done = () => {
        form.style.transition = 'opacity .4s ease, transform .4s ease';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-8px)';
        if (success) {
          success.inert = false;
          success.classList.add('is-on');
          success.setAttribute('aria-hidden', 'false');
        }
      };

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(done).catch(done);
      } else {
        setTimeout(done, 750);
      }
    });

    const reset = $('#resetForm');
    if (reset) {
      reset.addEventListener('click', () => {
        form.reset();
        $$('.field', form).forEach((f) => f.classList.remove('is-invalid'));
        form.style.opacity = '1';
        form.style.transform = 'none';
        if (success) {
          success.classList.remove('is-on');
          success.setAttribute('aria-hidden', 'true');
          success.inert = true;
        }
        const n = $('#name'); if (n) n.focus();
      });
    }
  }

  /* ================================================================ 11 ==== */
  /* Micro-interactions: magnetic buttons + card tilt                     */
  if (FINE && !REDUCED) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (dx * 12).toFixed(1) + 'px,' + (dy * 9).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .18s linear';
        el.style.transform =
          'perspective(1000px) translateY(-5px) rotateX(' + (-py * 4).toFixed(2) +
          'deg) rotateY(' + (px * 5).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  /* ================================================================ 12 ==== */
  /* Cursor spotlight, footer word, year                                 */
  const spotlight = $('#spotlight');
  if (spotlight && FINE && !REDUCED) {
    document.body.classList.add('has-pointer');
    let tx = 50, ty = 50;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      schedule();
    }, { passive: true });
    onFrame(() => {
      spotlight.style.setProperty('--mx', tx + 'px');
      spotlight.style.setProperty('--my', ty + 'px');
    });
  }

  const word = $('.footer__word');
  if (word) {
    onFrame((y) => {
      const r = word.getBoundingClientRect();
      if (r.bottom < 0) return;
      const shift = clamp((r.top - window.innerHeight) * -0.04, -40, 40);
      word.style.setProperty('--wordShift', shift.toFixed(1) + 'px');
    });
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // kick the first frame
  schedule();
})();
