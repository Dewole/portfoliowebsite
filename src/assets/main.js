const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ---- LANGUAGE SWITCH — jumps between the English site and the /pl/ version,
  // mapping the current page to its equivalent in the other language ----
  const langSwitch = document.getElementById('langSwitch');
  if(langSwitch){
    const currentLang = document.documentElement.lang === 'pl' ? 'pl' : 'en';
    langSwitch.value = currentLang;
    langSwitch.addEventListener('change', ()=>{
      const target = langSwitch.value;
      let path = window.location.pathname;
      if(target === 'pl'){
        if(!path.startsWith('/pl/')) path = '/pl' + path;
      } else if(path.startsWith('/pl/')){
        path = path.slice(3) || '/';
      }
      window.location.href = path;
    });
  }

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    let batch = 0;
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        if(!reduceMotion){
          // cards/paragraphs that enter together cascade in, 70ms apart
          el.style.transitionDelay = (Math.min(batch++, 5) * 70) + 'ms';
          el.addEventListener('transitionend', ()=>{ el.style.transitionDelay = ''; }, {once:true});
        }
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  },{threshold:.15});
  revealEls.forEach(el=>io.observe(el));

  // section progress rail
  // Each dot gets a hover bubble with the section's name: its small label
  // ("PORTFOLIO" → "Portfolio"), else its heading, else "Intro" for the hero.
  function sectionLabel(sec, i){
    const pl = document.documentElement.lang === 'pl';
    const clean = (t)=>(t || '').replace(/\s+/g, ' ').trim();
    const named = [
      ['hero', 'Intro', 'Start'], ['about-hero', 'About', 'O mnie'], ['about', pl ? 'O mnie' : 'About', 'O mnie'],
      ['testi', 'Testimonials', 'Opinie'], ['final-cta', 'Contact', 'Kontakt'], ['contact-hero', 'Contact', 'Kontakt'],
      ['cs-detail', 'Overview', 'Przegląd'], ['cs-details', 'Project details', 'Szczegóły'], ['cs-body', 'Project', 'Projekt'],
    ];
    // on the About page the photo/bio block follows the intro — call it "Bio"
    if(sec.classList.contains('about') && document.querySelector('.about-hero')) return 'Bio';
    for(const [cls, en, plName] of named){ if(sec.classList.contains(cls)) return pl ? plName : en; }
    let kicker = clean(sec.querySelector('.kicker')?.textContent).replace(/\s*·.*$/, '');
    if(kicker){
      kicker = kicker.charAt(0).toUpperCase() + kicker.slice(1).toLowerCase();
      return pl ? kicker : kicker.replace(/\bi\b/g, 'I');
    }
    const h = clean(sec.querySelector('h1, h2, h3')?.textContent);
    if(h) return h.length > 30 ? h.slice(0, 28).replace(/\s+\S*$/, '') + '…' : h;
    return (pl ? 'Sekcja ' : 'Section ') + (i + 1);
  }

  const sections = document.querySelectorAll('section');
  const rail = document.getElementById('rail');
  sections.forEach((s,i)=>{
    const d = document.createElement('div');
    d.className='dot';
    d.dataset.i=i;
    d.setAttribute('role','button');
    d.setAttribute('tabindex','0');
    const label = sectionLabel(s, i);
    d.setAttribute('aria-label', (document.documentElement.lang === 'pl' ? 'Przejdź do: ' : 'Jump to: ') + label);
    const tip = document.createElement('span');
    tip.className = 'rail-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.textContent = label;
    d.appendChild(tip);
    const jump = ()=>s.scrollIntoView({behavior:'smooth', block:'start'});
    d.addEventListener('click', jump);
    d.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); jump(); } });
    rail.appendChild(d);
  });
  const dots = rail.querySelectorAll('.dot');
  const railIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const idx = Array.from(sections).indexOf(e.target);
      if(e.isIntersecting){ dots.forEach(d=>{ d.classList.remove('active'); d.removeAttribute('aria-current'); }); dots[idx]?.classList.add('active'); dots[idx]?.setAttribute('aria-current','true'); }
    });
  },{threshold:.5});
  sections.forEach(s=>railIO.observe(s));

  // category filter pills — shared behavior for Portfolio and Products listing pages
  function wireFilterPills(filtersId, gridId){
    const filters = document.getElementById(filtersId);
    const grid = document.getElementById(gridId);
    if(!filters || !grid) return;
    const cards = Array.from(grid.querySelectorAll('.filter-card'));
    const pills = Array.from(filters.querySelectorAll('.pill'));
    const isPl = document.documentElement.lang === 'pl';
    // Semantics: a labelled group of toggle buttons, plus a polite live
    // region so screen-reader users hear how many items are showing.
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', isPl ? 'Filtruj według kategorii' : 'Filter by category');
    const status = document.createElement('p');
    status.className = 'filter-status';
    status.setAttribute('aria-live', 'polite');
    filters.insertAdjacentElement('afterend', status);
    const countText = (n)=> isPl
      ? `Wyświetlono: ${n} z ${cards.length}`
      : `Showing ${n} of ${cards.length}`;

    // Edge fades only on the side that can still scroll (tablet/phone row)
    function updateFades(){
      const max = filters.scrollWidth - filters.clientWidth;
      filters.classList.toggle('fade-left', filters.scrollLeft > 4);
      filters.classList.toggle('fade-right', max > 4 && filters.scrollLeft < max - 4);
    }
    filters.addEventListener('scroll', updateFades, {passive:true});
    window.addEventListener('resize', updateFades);
    updateFades();

    function select(btn, focus){
      pills.forEach(b=>{ const on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      const filter = btn.dataset.filter;
      let shown = 0;
      cards.forEach(card=>{
        const match = filter === 'all' || card.dataset.category === filter;
        const wasHidden = card.classList.contains('hide');
        card.classList.toggle('hide', !match);
        if(match){ shown++; if(wasHidden || focus){ card.classList.remove('just-shown'); void card.offsetWidth; card.classList.add('just-shown'); } }
      });
      status.textContent = filter === 'all' ? '' : countText(shown);
      // keep the chosen pill fully visible in the swipeable row
      if(filters.scrollWidth > filters.clientWidth){
        btn.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'nearest', inline:'center'});
      }
    }
    pills.forEach(btn=>{
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      btn.addEventListener('click', ()=>select(btn, true));
    });
    // Arrow keys move between pills (Home/End jump to the ends)
    filters.addEventListener('keydown', (e)=>{
      const i = pills.indexOf(document.activeElement);
      if(i < 0) return;
      let n = null;
      if(e.key === 'ArrowRight') n = (i + 1) % pills.length;
      else if(e.key === 'ArrowLeft') n = (i - 1 + pills.length) % pills.length;
      else if(e.key === 'Home') n = 0;
      else if(e.key === 'End') n = pills.length - 1;
      if(n === null) return;
      e.preventDefault();
      pills[n].focus();
    });
  }
  // the sticky filter row sits right under the fixed nav, whatever its height
  (function(){
    const nav = document.querySelector('header.nav');
    if(!nav) return;
    const setH = ()=>document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    setH(); window.addEventListener('resize', setH);
  })();
  wireFilterPills('portfolioFilters', 'portfolioGrid');
  wireFilterPills('productFilters', 'productsGrid');

  // testimonial carousel — slides are rendered server-side from CMS content;
  // this just handles which one is visible.
  const testiSlides = Array.from(document.querySelectorAll('.testi-slide'));
  const testiDotsWrap = document.getElementById('testiDots');
  let tIndex = testiSlides.findIndex(s=>s.classList.contains('active'));
  if(tIndex < 0) tIndex = 0;

  if(testiSlides.length && testiDotsWrap){
    testiSlides.forEach((_,i)=>{
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Show testimonial ' + (i+1) + ' of ' + testiSlides.length);
      if(i===tIndex){ d.classList.add('active'); d.setAttribute('aria-current','true'); }
      d.addEventListener('click', ()=>{ tIndex = i; renderTesti(); });
      testiDotsWrap.appendChild(d);
    });
    function renderTesti(){
      testiSlides.forEach((slide,i)=>slide.classList.toggle('active', i===tIndex));
      Array.from(testiDotsWrap.children).forEach((d,i)=>{ d.classList.toggle('active', i===tIndex); if(i===tIndex) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
    }
    const testiPrevBtn = document.getElementById('testiPrev');
    const testiNextBtn = document.getElementById('testiNext');
    if(testiPrevBtn) testiPrevBtn.addEventListener('click', ()=>{ tIndex=(tIndex-1+testiSlides.length)%testiSlides.length; renderTesti(); });
    if(testiNextBtn) testiNextBtn.addEventListener('click', ()=>{ tIndex=(tIndex+1)%testiSlides.length; renderTesti(); });
  }

  // ---- SIDE MENU ----
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  function openSideMenu(){
    sideMenu.removeAttribute('inert');
    sideMenu.classList.add('open'); menuOverlay.classList.add('open');
    menuBtn.classList.add('is-open'); document.body.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded','true');
    setTimeout(()=>menuClose.focus(), 30);
  }
  function closeSideMenu(){
    const wasOpen = sideMenu.classList.contains('open');
    sideMenu.classList.remove('open'); menuOverlay.classList.remove('open');
    menuBtn.classList.remove('is-open'); document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded','false');
    sideMenu.setAttribute('inert','');
    if(wasOpen) menuBtn.focus();
  }
  // keep Tab inside the open menu
  sideMenu.addEventListener('keydown', (e)=>{
    if(e.key !== 'Tab') return;
    const f = Array.from(sideMenu.querySelectorAll('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])')).filter(el=>el.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  menuBtn.addEventListener('click', ()=>{
    sideMenu.classList.contains('open') ? closeSideMenu() : openSideMenu();
  });
  menuClose.addEventListener('click', closeSideMenu);
  menuOverlay.addEventListener('click', closeSideMenu);
  document.querySelectorAll('.side-menu-links a').forEach(a=>a.addEventListener('click', closeSideMenu));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeSideMenu(); });

  // ---- TEXT REVEAL: split headings into per-word masks, animate in ----
  function splitReveal(el){
    function walk(node){
      if(node.nodeType === Node.TEXT_NODE){
        const frag = document.createDocumentFragment();
        // split on ordinary whitespace only: a non-breaking space (Polish
        // sierotki, set at build time) keeps its two words in one unit
        const tokens = node.textContent.split(/([ \t\n\r\f]+)/);
        tokens.forEach(tok=>{
          if(tok==='' || /^[ \t\n\r\f]+$/.test(tok)){ frag.appendChild(document.createTextNode(tok)); return; }
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = tok;
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        node.parentNode.replaceChild(frag, node);
      } else if(node.nodeType === Node.ELEMENT_NODE){
        Array.from(node.childNodes).forEach(walk);
      }
    }
    Array.from(el.childNodes).forEach(walk);
    let i = 0;
    el.querySelectorAll('.word-inner').forEach(w=>{ w.style.transitionDelay = (i*38)+'ms'; i++; });
  }

  const splitTitles = document.querySelectorAll('.split-title');
  splitTitles.forEach(el=>splitReveal(el));

  const splitIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); splitIO.unobserve(e.target); }
    });
  },{threshold:.3});

  splitTitles.forEach(el=>{
    if(el.closest('.hero')){
      // hero text is visible immediately on load — reveal shortly after paint
      setTimeout(()=>el.classList.add('in'), el.id==='heroSub' ? 480 : 250);
    } else {
      splitIO.observe(el);
    }
  });

  // ---- HERO HANDWRITE — "Digital designer" wipes in like a pen stroke, after the sub-heading reveals ----
  const heroHandwrite = document.getElementById('heroHandwrite');
  if(heroHandwrite){
    setTimeout(()=>heroHandwrite.classList.add('in'), 700);
  }

  // ---- CUSTOM CURSOR (dot + lagging ring) ----
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let ringX = mouseX, ringY = mouseY;
  let cursorActive = false;
  window.addEventListener('mousemove', (e)=>{
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    if(!cursorActive){ cursorDot.style.opacity = 1; cursorRing.style.opacity = 1; cursorActive = true; }
  });
  window.addEventListener('mouseleave', ()=>{ cursorDot.style.opacity = 0; cursorRing.style.opacity = 0; });
  (function ringLoop(){
    if(reduceMotion) return;
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  })();
  document.querySelectorAll('a, button, .service-card, .case-card, .prod-card, .rail .dot').forEach(el=>{
    el.addEventListener('mouseenter', ()=>cursorRing.classList.add('grow'));
    el.addEventListener('mouseleave', ()=>cursorRing.classList.remove('grow'));
  });

  // ---- HERO PARALLAX TILT ----
  const heroSection = document.getElementById('s1');
  const heroTitle = document.getElementById('heroTitle');
  let heroPX = 0, heroPY = 0;
  if(heroSection && !reduceMotion){
    heroSection.addEventListener('mousemove', (e)=>{
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroPX = px; heroPY = py;
      if(heroTitle){
        heroTitle.style.transform = `perspective(900px) rotateY(${px*4}deg) rotateX(${-py*4}deg) translate(${px*10}px, ${py*6}px)`;
      }
    });
    heroSection.addEventListener('mouseleave', ()=>{
      if(heroTitle) heroTitle.style.transform = 'none';
      heroPX = 0; heroPY = 0;
    });
  }

  // ---- HERO GRADIENT + GRID — gradient drifts and the grid warps toward the cursor ----
  const blobWraps = document.querySelectorAll('.blob-wrap');
  const heroGrid = document.querySelector('.hero-grid');
  if(blobWraps.length || heroGrid){
    let blobX = 0, blobY = 0;
    (function heroFxLoop(){
      if(reduceMotion) return;
      blobX += (heroPX - blobX) * 0.045;
      blobY += (heroPY - blobY) * 0.045;
      blobWraps.forEach((wrap, i)=>{
        const dir = i % 2 === 0 ? 1 : -1;
        const strength = 90 + i * 40;
        wrap.style.transform = `translate(${blobX * strength * dir}px, ${blobY * strength}px)`;
      });
      if(heroGrid){
        heroGrid.style.transform =
          `perspective(700px) rotateX(${-blobY * 9}deg) rotateY(${blobX * 9}deg) scale(1.08) translate(${blobX * -26}px, ${blobY * -26}px)`;
      }
      requestAnimationFrame(heroFxLoop);
    })();
  }

  // ---- BIG QUOTE — word-by-word color fill tied to scroll progress (50%–100% through viewport) ----
  const fillTitle = document.querySelector('.fill-title');
  if(fillTitle){
    (function wrapFillWords(el){
      function walk(node){
        if(node.nodeType === Node.TEXT_NODE){
          const frag = document.createDocumentFragment();
          node.textContent.split(/([ \t\n\r\f]+)/).forEach(tok=>{
            if(tok==='' || /^[ \t\n\r\f]+$/.test(tok)){ frag.appendChild(document.createTextNode(tok)); return; }
            const span = document.createElement('span');
            span.className = 'fill-word';
            span.textContent = tok;
            frag.appendChild(span);
          });
          node.parentNode.replaceChild(frag, node);
        } else if(node.nodeType === Node.ELEMENT_NODE){
          Array.from(node.childNodes).forEach(walk);
        }
      }
      Array.from(el.childNodes).forEach(walk);
    })(fillTitle);

    const fillWords = fillTitle.querySelectorAll('.fill-word');
    let fillTicking = false;
    function updateFill(){
      fillTicking = false;
      const rect = fillTitle.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress 0 when the heading is at 50% down the viewport, progress 1 once it reaches the top
      const start = vh * 0.5;
      let progress = (start - rect.top) / start;
      progress = reduceMotion ? 1 : Math.min(1, Math.max(0, progress));
      const n = fillWords.length;
      fillWords.forEach((w, i)=>{
        w.classList.toggle('filled', progress >= i / n);
      });
    }
    window.addEventListener('scroll', ()=>{
      if(!fillTicking){ fillTicking = true; requestAnimationFrame(updateFill); }
    }, {passive:true});
    updateFill();
  }

  // ---- FOOTER NAME — scales to fill the full width of the footer, margin preserved by .wrap padding ----
  const footWord = document.querySelector('.foot-word');
  if(footWord){
    function fitFootWord(){
      const cs = getComputedStyle(footWord);
      const padding = parseFloat(cs.paddingLeft || 0) + parseFloat(cs.paddingRight || 0);
      const targetWidth = footWord.clientWidth - padding;
      if(!targetWidth) return;
      // block + overflow:hidden means scrollWidth can never read smaller than
      // clientWidth, so measure the true (unclamped) text width by briefly
      // switching to a shrink-to-fit box instead.
      const prevDisplay = footWord.style.display;
      const prevWidth = footWord.style.width;
      footWord.style.fontSize = '100px';
      footWord.style.display = 'inline-block';
      footWord.style.width = 'auto';
      const naturalWidth = footWord.scrollWidth - padding;
      footWord.style.display = prevDisplay;
      footWord.style.width = prevWidth;
      if(!naturalWidth) return;
      const newSize = 100 * (targetWidth / naturalWidth);
      footWord.style.fontSize = newSize + 'px';
    }
    fitFootWord();
    window.addEventListener('resize', fitFootWord);
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(fitFootWord);
    }
  }

  // ---- BUTTON TEXT REVEAL — hovering slides the current label up and out
  // while an identical duplicate slides up to take its place. The mask is
  // always built as a fresh inner <span> rather than turning the target
  // itself into the mask, so it's never affected by any padding the target
  // has (a filter pill, say) — see the CSS .reveal-mask comment for why that
  // matters. ----
  function makeRevealMask(target){
    if(!target || target.dataset.reveal) return;
    const html = target.innerHTML.trim();
    if(!html) return;
    target.dataset.reveal = 'true';
    target.innerHTML =
      '<span class="reveal-mask">' +
        '<span class="reveal-layer reveal-original">' + html + '</span>' +
        '<span class="reveal-layer reveal-clone" aria-hidden="true">' + html + '</span>' +
      '</span>';
  }

  // Every ".btn" is built the same way now — a ".btn-label" span that gets
  // the text-reveal mask, and, where there's an icon, a ".btn-icon" span that
  // instead nudges a few pixels in the direction it points (an arrow flipping
  // to reveal an identical arrow underneath animated nothing, so icons get a
  // more legible, purposeful hover of their own — see the CSS .btn-icon rules).
  // A .btn with no span children (rare) falls back to masking the whole element.
  document.querySelectorAll('.btn').forEach(btn=>{
    const spanChildren = Array.from(btn.children).filter(c=>c.tagName==='SPAN');
    if(spanChildren.length){
      spanChildren.forEach(span=>{
        if(span.classList.contains('btn-icon')) return;
        makeRevealMask(span);
      });
    } else {
      makeRevealMask(btn);
    }
  });

  // Filter pills are label-only — mask the whole element.
  document.querySelectorAll('.filter-pills .pill').forEach(makeRevealMask);

  // Top-nav "Menu" button — reveal only the text label, leave the burger
  // icon lines alone so they keep their own hover animation untouched.
  makeRevealMask(document.querySelector('.menu-btn > span:first-child'));

  // Testimonial prev/next arrows get their own directional nudge instead of
  // the text-reveal treatment (see the CSS #testiPrev/#testiNext rules) —
  // intentionally not masked here.

  // ---- MARQUEE HELPER — auto-scrolls, and is swipeable/draggable ----
  // Native overflow-x:auto gives touch swipe for free; a rAF loop drives the
  // idle auto-scroll, and pointer events add click-and-drag for mouse users.
  // The item list is rendered twice in the markup, so once the scroll passes
  // one full set's width we jump back by that width for a seamless loop.
  // Shared by the portfolio marquee and the photography marquee below.
  function initMarquee(container, trackSelector, speed){
    if(!container) return;
    const track = container.querySelector(trackSelector);
    if(!track) return;
    let setWidth = 0;
    function measureSetWidth(){ setWidth = track.scrollWidth / 2; }
    measureSetWidth();
    window.addEventListener('resize', measureSetWidth);

    let autoScroll = !reduceMotion;
    let userPaused = reduceMotion;
    let dragging = false;
    // the track's items are rendered twice for the seamless loop — hide the
    // duplicate half from screen readers and the Tab order
    const kids = Array.from(track.children);
    kids.slice(Math.ceil(kids.length/2)).forEach(el=>{ el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); });
    container.addEventListener('focusin', ()=>{ autoScroll = false; });
    container.addEventListener('focusout', ()=>{ autoScroll = !userPaused; });
    let dragStartX = 0;
    let dragStartScroll = 0;

    function wrapScroll(){
      if(setWidth <= 0) return;
      if(container.scrollLeft >= setWidth) container.scrollLeft -= setWidth;
      else if(container.scrollLeft < 0) container.scrollLeft += setWidth;
    }

    // Track the position as a float and write a rounded value: phones
    // (iOS Safari especially) ignore fractional scrollLeft changes, so
    // "+= 0.6" every frame never actually moved the strip on mobile.
    let pos = container.scrollLeft;
    let touching = false;
    let resumeTimer = null;
    let last = performance.now();
    (function marqueeLoop(now){
      const dt = Math.min(64, (now || performance.now()) - last); // steady speed at any refresh rate
      last = now || performance.now();
      if(autoScroll && !dragging && !touching && setWidth > 0){
        // if the visitor scrolled it themselves, carry on from there
        if(Math.abs(container.scrollLeft - Math.round(pos)) > 2) pos = container.scrollLeft;
        pos += speed * (dt / 12);   // ≈ 40–50px a second, the same on 60Hz phones and 120Hz screens
        if(pos >= setWidth) pos -= setWidth;
        container.scrollLeft = Math.round(pos);
      }
      requestAnimationFrame(marqueeLoop);
    })();

    // Mouse: pause while hovering. (Touch devices fire a fake mouseenter on
    // tap with no mouseleave, which used to stop the strip for good — so
    // only real mouse pointers count here.)
    container.addEventListener('pointerenter', (e)=>{ if(e.pointerType === 'mouse') autoScroll = false; });
    container.addEventListener('pointerleave', (e)=>{ if(e.pointerType === 'mouse') autoScroll = !userPaused; });
    // Touch: pause while the finger is down / swiping, resume shortly after
    container.addEventListener('touchstart', ()=>{ touching = true; clearTimeout(resumeTimer); }, {passive:true});
    const endTouch = ()=>{ clearTimeout(resumeTimer); resumeTimer = setTimeout(()=>{ touching = false; pos = container.scrollLeft; }, 1800); };
    container.addEventListener('touchend', endTouch, {passive:true});
    container.addEventListener('touchcancel', endTouch, {passive:true});

    container.addEventListener('pointerdown', (e)=>{
      if(e.pointerType && e.pointerType !== 'mouse') return; // let touch/pen use native swipe scrolling
      dragging = true;
      container.classList.add('dragging');
      dragStartX = e.clientX;
      dragStartScroll = container.scrollLeft;
    });
    window.addEventListener('pointermove', (e)=>{
      if(!dragging) return;
      container.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    window.addEventListener('pointerup', ()=>{
      if(!dragging) return;
      dragging = false;
      container.classList.remove('dragging');
    });

    container.addEventListener('scroll', wrapScroll, {passive:true});
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(measureSetWidth);
    }
  }

  initMarquee(document.getElementById('caseMarquee'), '.case-track', 0.6);
  // Photography — same continuous, swipeable marquee, slightly slower.
  initMarquee(document.getElementById('photoMarquee'), '.photo-track', 0.5);

  // ---- LIGHTBOX — click any [data-lightbox-src] element to view it
  // full-size. Handles three kinds of content via [data-lightbox-type]:
  // "image" (default), "video", and "lottie". ----
  (function(){
    let overlay = document.querySelector('.lightbox');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.setAttribute('hidden', '');
      overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Close">\u00d7</button>' +
        '<img class="lightbox-img" alt="">' +
        '<video class="lightbox-video" controls playsinline></video>' +
        '<div class="lightbox-lottie"></div>';
      document.body.appendChild(overlay);
    }
    const img = overlay.querySelector('.lightbox-img');
    const video = overlay.querySelector('.lightbox-video');
    const lottieBox = overlay.querySelector('.lightbox-lottie');
    const closeBtn = overlay.querySelector('.lightbox-close');
    let lottieInstance = null;

    function resetMedia(){
      img.hidden = true; img.src = '';
      video.hidden = true; video.pause(); video.removeAttribute('src'); video.load();
      lottieBox.hidden = true;
      lottieBox.style.aspectRatio = '';
      if(lottieInstance){ lottieInstance.destroy(); lottieInstance = null; }
      lottieBox.innerHTML = '';
    }

    function openLightbox(src, alt, type){
      if(!src) return; // no URL (image/video) and no animationData (lottie)
      resetMedia();
      if(type === 'video'){
        video.hidden = false;
        video.src = src;
        video.muted = false;
        video.play().catch(()=>{});
      } else if(type === 'lottie'){
        lottieBox.hidden = false;
        // Size the box to the animation's own artboard (its "w"/"h" fields)
        // instead of a fixed square, so it isn't stretched/cropped.
        if(src && src.w && src.h){
          lottieBox.style.aspectRatio = src.w + ' / ' + src.h;
        }
        if(window.lottie && src){
          lottieInstance = window.lottie.loadAnimation({
            container: lottieBox,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: src,
          });
        }
      } else {
        img.hidden = false;
        img.src = src;
        img.alt = alt || '';
      }
      overlay.removeAttribute('hidden');
      document.body.classList.add('lightbox-open');
    }
    function closeLightbox(){
      overlay.setAttribute('hidden', '');
      resetMedia();
      document.body.classList.remove('lightbox-open');
    }

    document.addEventListener('click', (e)=>{
      const trigger = e.target.closest('[data-lightbox-src]');
      if(trigger){
        e.preventDefault();
        const type = trigger.getAttribute('data-lightbox-type') || 'image';
        const alt = trigger.getAttribute('data-lightbox-alt');
        if(type === 'lottie'){
          const inner = trigger.querySelector('.cs-media-lottie');
          openLightbox(inner && inner._lottieAnimationData, alt, 'lottie');
        } else {
          openLightbox(trigger.getAttribute('data-lightbox-src'), alt, type);
        }
        return;
      }
      if(e.target === overlay || e.target === closeBtn){
        closeLightbox();
      }
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeLightbox();
    });
  })();

  // ---- CONTACT FORM — submits via fetch (so we can show our own success
  // modal instead of a full-page redirect/reload) to whatever endpoint is
  // configured in the CMS's "Contact form submission endpoint" field
  // (site.contactFormEndpoint). Works for both the EN and /pl/ forms, which
  // share this same markup/attribute contract. ----
  (function(){
    const form = document.querySelector('[data-contact-form]');
    if(!form) return;

    let modal = document.querySelector('.form-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.className = 'form-modal';
      modal.setAttribute('hidden', '');
      modal.innerHTML =
        '<div class="form-modal-card">' +
          '<button type="button" class="form-modal-close" aria-label="Close">\u00d7</button>' +
          '<div class="form-modal-icon"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
          '<h3 class="form-modal-title"></h3>' +
          '<p class="form-modal-message"></p>' +
        '</div>';
      document.body.appendChild(modal);
    }
    const closeBtn = modal.querySelector('.form-modal-close');
    const titleEl = modal.querySelector('.form-modal-title');
    const messageEl = modal.querySelector('.form-modal-message');

    function openModal(title, message){
      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.removeAttribute('hidden');
      document.body.classList.add('form-modal-open');
    }
    function closeModal(){
      modal.setAttribute('hidden', '');
      document.body.classList.remove('form-modal-open');
    }
    modal.addEventListener('click', (e)=>{
      if(e.target === modal || e.target === closeBtn) closeModal();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });

    const errorEl = form.querySelector('.form-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.action){
        if(errorEl){
          errorEl.textContent = form.getAttribute('data-error-text') || 'Something went wrong — please try again.';
          errorEl.hidden = false;
        }
        return;
      }
      if(errorEl) errorEl.hidden = true;
      const labelEl = submitBtn && submitBtn.querySelector('.btn-label');
      const labelOriginal = labelEl ? labelEl.textContent : '';
      if(submitBtn) submitBtn.disabled = true;
      if(labelEl && form.getAttribute('data-sending-text')) labelEl.textContent = form.getAttribute('data-sending-text');
      const data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      }).then((res) => {
        if(res.ok){
          form.reset();
          openModal(
            form.getAttribute('data-modal-title') || 'Message sent!',
            form.getAttribute('data-modal-message') || ''
          );
        } else {
          throw new Error('Submit failed');
        }
      }).catch(() => {
        if(errorEl){
          errorEl.textContent = form.getAttribute('data-error-text') || 'Something went wrong — please try again.';
          errorEl.hidden = false;
        }
      }).finally(() => {
        if(submitBtn) submitBtn.disabled = false;
        if(labelEl) labelEl.textContent = labelOriginal;
      });
    });
  })();

  // ---- ANIMATED (Lottie/Bodymovin) elements + GALLERY MEDIA autoplay ----
  // Two kinds of Lottie element share the [data-lottie-inline] attribute,
  // each carrying its animation JSON as a nested
  // <script type="application/json"> (fetched server-side at build time --
  // see lib/fetchCollection.js / lib/fetchSiteSettings.js -- and NOT via a
  // browser-side fetch of the Sanity file URL, which Sanity's file CDN
  // blocks with no CORS headers):
  //  - the nav/side-menu logo (.brand-logo-lottie) — always autoplays, as
  //    it's small and meant to be a persistent bit of branding.
  //  - a gallery attachment (.cs-media-lottie), and any gallery video
  //    (.cs-media-video) — these start paused; playback is driven by the
  //    hover/in-viewport controller below, so a page with many clips
  //    doesn't autoplay all of them at once. Clicking still opens the
  //    full-size lightbox (wired up above via [data-lightbox-src]).
  //
  // Each gallery Lottie still re-checks its desired play state once its
  // `DOMLoaded` event fires (rather than assuming an earlier play()/pause()
  // call already took effect), since building the SVG from the animation
  // data isn't instantaneous even when the data itself is already inline.
  (function(){
    const state = new Map();

    function play(el){
      if(el.tagName === 'VIDEO'){ el.play().catch(()=>{}); return; }
      const anim = el._lottieInstance;
      if(anim && anim.isLoaded) anim.play();
    }
    function pause(el){
      if(el.tagName === 'VIDEO'){ el.pause(); return; }
      const anim = el._lottieInstance;
      if(anim && anim.isLoaded) anim.pause();
    }
    function sync(el){
      const s = state.get(el);
      if(s && (s.hovering || s.inView)) play(el); else pause(el);
    }

    document.querySelectorAll('[data-lottie-inline]').forEach((el) => {
      if (!window.lottie) return;
      const dataScript = el.querySelector('script[type="application/json"]');
      if (!dataScript) return;
      let animationData;
      try {
        animationData = JSON.parse(dataScript.textContent);
      } catch (err) {
        return;
      }
      el._lottieAnimationData = animationData;
      el.innerHTML = ''; // clear the data script before lottie renders its SVG in
      const isGalleryItem = el.classList.contains('cs-media-lottie');
      // A hero banner Lottie (.cs-hero-lottie) fills a fixed banner shape
      // like the hero image/video next to it, so it's cropped to cover
      // (same idea as CSS object-fit:cover) rather than kept at its native
      // ratio the way a gallery Lottie is.
      const isHeroItem = el.classList.contains('cs-hero-lottie') || el.classList.contains('hero-bg-lottie') || el.classList.contains('bigquote-bg-lottie');
      const anim = window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: true,
        autoplay: !isGalleryItem,
        animationData,
        rendererSettings: isHeroItem ? { preserveAspectRatio: 'xMidYMid slice' } : undefined,
      });
      el._lottieInstance = anim;
      if(isGalleryItem){
        anim.addEventListener('DOMLoaded', () => sync(el));
      }
    });

    const items = document.querySelectorAll('.cs-media-video, .cs-media-lottie');
    if(!items.length) return;

    items.forEach((el) => {
      state.set(el, { hovering: false, inView: false });
      const wrap = el.closest('.cs-media-video-wrap, .cs-media-lottie-wrap') || el;
      wrap.addEventListener('mouseenter', () => { state.get(el).hovering = true; sync(el); });
      wrap.addEventListener('mouseleave', () => { state.get(el).hovering = false; sync(el); });
    });

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const s = state.get(entry.target);
          if(s){ s.inView = entry.isIntersecting; sync(entry.target); }
        });
      }, { threshold: 0.5 });
      items.forEach((el) => io.observe(el));
    }
  })();


// ---- SCROLL PROGRESS BAR + BACK-TO-TOP ----
(function(){
  const bar = document.getElementById('scrollProgress');
  const isPl = document.documentElement.lang === 'pl';
  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'to-top';
  top.setAttribute('aria-label', isPl ? 'Wróć na górę' : 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  top.addEventListener('click', ()=>{
    window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
    const m = document.getElementById('main'); if(m) m.focus({preventScroll:true});
  });
  document.body.appendChild(top);
  let ticking = false;
  function update(){
    ticking = false;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if(bar) bar.style.setProperty('--p', p.toFixed(4));
    top.classList.toggle('show', window.scrollY > 700);
  }
  window.addEventListener('scroll', ()=>{ if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
  window.addEventListener('resize', update);
  update();
})();

// ---- STAT COUNT-UP — the big number counts up once when it scrolls into view.
// Screen readers get the final value immediately (the animated copy is aria-hidden). ----
(function(){
  const el = document.querySelector('.stats .num-big');
  if(!el || reduceMotion) return;
  const text = el.textContent.trim();
  const m = text.match(/(\d[\d.,]*)/);
  if(!m) return;
  const raw = m[1];
  const target = parseFloat(raw.replace(/,/g,''));
  if(!isFinite(target) || target <= 0) return;
  const decimals = (raw.split('.')[1] || '').length;
  const useCommas = raw.indexOf(',') > -1;
  const pre = text.slice(0, m.index), post = text.slice(m.index + raw.length);
  const fmt = (v)=>{
    let t = v.toFixed(decimals);
    if(useCommas){ const [a,b] = t.split('.'); t = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.'+b : ''); }
    return pre + t + post;
  };
  const live = document.createElement('span'); live.setAttribute('aria-hidden','true'); live.textContent = fmt(0);
  const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
  el.textContent = ''; el.appendChild(sr); el.appendChild(live);
  const io = new IntersectionObserver((entries)=>{
    if(!entries[0].isIntersecting) return;
    io.disconnect();
    const dur = 1400, t0 = performance.now();
    (function tick(now){
      const k = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      live.textContent = fmt(target * eased);
      if(k < 1) requestAnimationFrame(tick); else live.textContent = text;
    })(t0);
  }, {threshold:.4});
  io.observe(el);
})();

// ---- ABOUT PHOTO STACK — prints stacked at angles; click/tap (or the ↻
// button, or Enter/Space on it) sends the top photo flying to the back. ----
(function(){
  const stack = document.getElementById('photoStack');
  if(!stack) return;
  const items = Array.from(stack.querySelectorAll('.photo-stack-item'));
  let order = items.map((_, i)=>i);          // order[pos] = item index
  function paint(){ order.forEach((idx, pos)=>items[idx].setAttribute('data-pos', pos < 5 ? pos : 'x')); }
  let busy = false;
  function next(){
    if(busy || items.length < 2) return;
    busy = true;
    const top = items[order[0]];
    if(reduceMotion){ order.push(order.shift()); paint(); busy = false; return; }
    top.classList.add('fly');
    setTimeout(()=>{
      order.push(order.shift());
      paint();
      top.classList.remove('fly');
      setTimeout(()=>{ busy = false; }, 350);
    }, 380);
  }
  stack.addEventListener('click', next);
  // entrance: prints drop in one after another when scrolled into view
  if(!reduceMotion){
    stack.classList.add('pre');
    const io = new IntersectionObserver((es)=>{
      if(!es[0].isIntersecting) return;
      io.disconnect();
      items.slice().reverse().forEach((it, i)=>{ it.style.transitionDelay = (i*110) + 'ms'; });
      requestAnimationFrame(()=>stack.classList.remove('pre'));
      setTimeout(()=>items.forEach((it)=>{ it.style.transitionDelay = ''; }), 1600);
    }, {threshold:.25});
    io.observe(stack);
  }
})();

// ---- SKILLS & TOOLS — pills fall into place when the section scrolls in ----
(function(){
  const grid = document.querySelector('.skills-grid');
  if(!grid || reduceMotion) return;
  const chips = Array.from(grid.querySelectorAll('.skill-chip'));
  if(!chips.length) return;
  const rand = (a,b)=>a + Math.random()*(b-a);
  chips.forEach((c, i)=>{
    c.style.setProperty('--d', Math.round(i*45 + rand(0,260)) + 'ms');
    c.style.setProperty('--spin', rand(-50,50).toFixed(1) + 'deg');
    c.style.setProperty('--rest', rand(-3,3).toFixed(1) + 'deg');
  });
  grid.classList.add('will-drop');
  const io = new IntersectionObserver((es)=>{
    if(!es[0].isIntersecting) return;
    io.disconnect();
    grid.classList.add('dropping');
    const longest = chips.length*45 + 260 + 1100;
    setTimeout(()=>{ grid.classList.remove('will-drop','dropping'); grid.classList.add('dropped'); }, longest);
  }, {threshold:.3});
  io.observe(grid);
})();

// ---- "6+ years" glass card — light follows the cursor, gentle 3D tilt ----
(function(){
  const card = document.querySelector('.stats-figure');
  if(!card || !window.matchMedia('(hover:hover)').matches) return;
  card.addEventListener('pointermove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', (x*100).toFixed(1) + '%');
    card.style.setProperty('--my', (y*100).toFixed(1) + '%');
    if(!reduceMotion){
      card.style.setProperty('--ty', ((x - .5) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--tx', ((.5 - y) * 8).toFixed(2) + 'deg');
    }
  });
  card.addEventListener('pointerleave', ()=>{
    card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg');
  });
})();

// ---- FLOATING NAV THEME — dark glass over dark sections, light glass over
// light ones. Samples what's behind the bar at a few points (left / centre /
// right) and goes light when most of it is light. ----
(function(){
  const nav = document.querySelector('header.nav');
  if(!nav) return;
  const parse = (c)=>{ const m = c && c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p = m[1].split(',').map(parseFloat); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum = ({r,g,b})=>(0.299*r + 0.587*g + 0.114*b) / 255;
  function bgAt(x, y){
    const stack = document.elementsFromPoint(x, y);
    for(const el of stack){
      if(nav.contains(el) || el.closest('.scroll-progress,.rail,.to-top,.cursor-dot,.cursor-ring,.side-menu,.side-menu-overlay')) continue;
      let e = el;
      while(e && e !== document.documentElement){
        const cs = getComputedStyle(e);
        const c = parse(cs.backgroundColor);
        if(c && c.a > 0.5) return lum(c);
        if(cs.backgroundImage && cs.backgroundImage !== 'none'){
          const g = parse(cs.backgroundImage);   // first colour stop of a gradient
          if(g) return lum(g);
        }
        e = e.parentElement;
      }
      break;
    }
    return lum(parse(getComputedStyle(document.body).backgroundColor) || {r:237,g:240,b:243});
  }
  let ticking = false;
  function update(){
    ticking = false;
    const r = nav.getBoundingClientRect();
    const y = r.bottom - 4;
    const xs = [r.left + r.width*0.12, r.left + r.width*0.5, r.left + r.width*0.88];
    const light = xs.filter((x)=>bgAt(x, y) > 0.6).length >= 2;
    nav.classList.toggle('nav-light', light);
    document.body.classList.toggle('dark-nav', !light);
  }
  const req = ()=>{ if(!ticking){ ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', req, {passive:true});
  window.addEventListener('resize', req);
  window.addEventListener('load', req);
  update();
})();
