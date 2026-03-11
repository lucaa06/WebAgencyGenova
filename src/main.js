import './style.scss';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------
// 1. DYNAMIC BACKGROUND TYPOGRAPHY (DOM PARALLAX)
// --------------------------------------------------------
const bgTypos = document.querySelectorAll('.bg-typography');

bgTypos.forEach((typo, i) => {
  // We want them to start at different rotations and depths
  gsap.set(typo, {
    y: window.innerHeight * 0.5 * i,
    rotationX: 45,
    rotationY: -20 + (i * 10),
    z: -100 * i,
    opacity: 0.1
  });

  gsap.to(typo, {
    y: -window.innerHeight,
    rotationX: -45,
    rotationY: 20,
    z: 200,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5 // Smooth lagging parallax
    }
  });
});


// --------------------------------------------------------
// 1.5 CUSTOM CURSOR LOGIC
// --------------------------------------------------------
const cursor = document.querySelector('.custom-cursor');

if (cursor) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  // Update mouse coordinates based on actual mouse movement
  // Note: We already have a mousemove listener for Three.js, but we'll add one here specifically for the cursor
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow using requestAnimationFrame
  const renderCursor = () => {
    // LERP (Linear Interpolation) for smooth trailing effect
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  // Add hover states to all links and buttons
  const hoverElements = document.querySelectorAll('a, button, .magnetic-btn, .image-reveal');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover-active'));
  });
}

// --------------------------------------------------------
// 2. GSAP SCROLLTRIGGER ANIMATIONS
// --------------------------------------------------------

// Navbar Logo Scroll Animation
const logoSvg = document.querySelector('.logo-svg');
if (logoSvg) {
  gsap.to(logoSvg, {
    width: 40,
    height: 25,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "+=300",
      scrub: true
    }
  });
}

console.log("Main JS loaded - initializing Title & A11y...");

// ---- Hero title: ALWAYS visible immediately (never depends on GSAP opacity) ----
const heroTitle = document.querySelector('.hero__title');
if (heroTitle) {
  // Immediately force full visibility via style — no GSAP opacity control
  heroTitle.style.opacity = '1';
  heroTitle.style.visibility = 'visible';
  heroTitle.style.display = 'block';
  heroTitle.style.transform = 'none'; // Prevent any existing transform from lingering

  // One-shot entrance animation only — no ScrollTrigger, no scrub, no repeat
  // The `from` tween only applies on first paint and immediately resolves to y:0
  gsap.from(heroTitle, {
    y: 40,
    duration: 1.2,
    ease: "power4.out",
    delay: 0.1,
    clearProps: 'transform', // Only clear transform — leave opacity/visibility alone
    onComplete: () => {
      // Lock visibility permanently after animation finishes
      heroTitle.style.opacity = '1';
      heroTitle.style.visibility = 'visible';
    }
  });
} else {
  console.warn("Hero title NOT found!");
}

// ---- Other split-text elements (below fold) ----
const splitTexts = document.querySelectorAll('.split-text:not(.hero__title)');
splitTexts.forEach((text, i) => {

  gsap.fromTo(text,
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1.1, ease: "power4.out",
      onComplete: () => {
        text.style.opacity = '1';
        text.style.transform = 'none';
      },
      scrollTrigger: { trigger: text, start: "top 95%", once: true }
    }
  );
});

// Parallax Image Reveal
const imageReveal = document.querySelector('.image-reveal');
if (imageReveal) {
  gsap.to(imageReveal, {
    scale: 1,
    ease: "none",
    scrollTrigger: {
      trigger: '.image-reveal-container',
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
}

// Section 3 removed (was 3D logic)

// --------------------------------------------------------
// 4. MAGNETIC BUTTONS (AESTHETIC HOVER)
// --------------------------------------------------------
const magneticBtns = document.querySelectorAll('.magnetic-btn');
const overlay = document.querySelector('.macro-cta-overlay');

// helper to hide overlay and restore scroll
function hideOverlay() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.hidden = true;
  document.body.style.overflow = '';
}

// attach close controls if overlay exists
if (overlay) {
  const closeBtn = overlay.querySelector('.macro-cta-overlay__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideOverlay);
  }
  // clicking the backdrop should also close
  overlay.addEventListener('click', (evt) => {
    if (evt.target === overlay) hideOverlay();
  });
  // links inside overlay close it too so user returns to page
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', hideOverlay));
}

magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    // Disable magnetic effect on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  btn.addEventListener('mouseleave', () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  // Mobile Touch Toggle for Macro CTA
  if (btn.classList.contains('macro-cta')) {
    const toggleMacro = (e) => {
      // Prevent toggling if user tapped one of the icons inside the reveal
      if (e.target.closest('.macro-cta__icons-list')) return;

      // on phone/tablet act like a hamburger menu: show overlay and hide page
      if (window.matchMedia('(max-width: 1024px)').matches) {
        e.preventDefault();
        if (overlay) {
          overlay.hidden = false;
          overlay.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
        return; // skip desktop behaviour
      }

      e.preventDefault();
      console.log('macro-cta clicked, before class list', btn.className);
      btn.classList.toggle('is-touch-active');
      console.log('after toggle class list', btn.className);
    };

    // listen for touch events on actual phones/tablets
    btn.addEventListener('touchstart', toggleMacro, { passive: false });
    // also listen for click so the behaviour works in desktop emulators
    btn.addEventListener('click', toggleMacro);
  }
});
// --------------------------------------------------------
// 5. PARALLAX TEXT ELEMENTS
// --------------------------------------------------------
const parallaxElements = document.querySelectorAll('[data-speed]:not(.hero__title)');
const isMobile = window.matchMedia('(max-width: 1024px)').matches; // Breakpoint aligned with SCSS tablet

if (!isMobile) {
  parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-speed');
    gsap.to(el, {
      y: () => (1 - parseFloat(speed)) * (ScrollTrigger.maxScroll(window) - (ScrollTrigger.maxScroll(window) / 2)),
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  });

  // Services Parallax Grid Animation (01-07)
  const serviceItems = document.querySelectorAll('.services__list .service-item');
  if (serviceItems.length > 0) {
    serviceItems.forEach((item, index) => {
      // Create a staggered entry effect depending on the column index
      const yOffset = index % 2 === 0 ? 60 : 120;

      gsap.fromTo(item,
        { y: yOffset, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%", // Start fading in slightly before it hits the viewport
            end: "top 40%",
            scrub: 1, // Smooth dragging effect
          }
        }
      );
    });
  }
}

// --------------------------------------------------------
// 6. FOOTER CLIP-PATH REVEAL & STICKY PADDING
// --------------------------------------------------------
const footerSection = document.querySelector('.footer');
const mainContent = document.querySelector('main');

if (footerSection && mainContent) {
  // Use static footer to prevent layout bugs and white gaps
  footerSection.style.position = 'static';
  footerSection.style.clipPath = 'none';
  mainContent.style.marginBottom = '0';

  // Clean up any stray inline styles from older logic just in case
  footerSection.style.transform = 'none';
  footerSection.style.filter = 'none';
}

// Since the footer is position:fixed, normal anchor scrolling doesn't work.
// Intercept #contact links and scroll to the very bottom of the document instead.
document.querySelectorAll('a[href="#contact"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  });
});

// Mobile Footer Email Scale Animation
// Only on mobile: the email grows as you scroll to footer, shrinks as you go back up
const footerEmail = document.querySelector('.footer__email');
if (footerEmail && window.matchMedia('(max-width: 768px)').matches) {
  gsap.fromTo(footerEmail,
    { scale: 0.8, opacity: 0 },
    {
      scale: 1.05,
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerSection,
        start: "top 80%",
        end: "top 30%",
        scrub: 1,
      }
    }
  );
}

// --------------------------------------------------------
// 6. 16K SCROLL SEQUENCE (PROCEDURAL FRAME-BY-FRAME)
// Real-time canvas rendering matching Apple's scrub effect
// --------------------------------------------------------
const seqCanvas = document.getElementById("sequence-canvas");
if (seqCanvas) {
  const ctx = seqCanvas.getContext("2d");

  const updateSize = () => {
    // 16K Infinite Resolution Scaling
    seqCanvas.width = window.innerWidth * window.devicePixelRatio;
    seqCanvas.height = window.innerHeight * window.devicePixelRatio;
    renderSequence(scrollObj.progress);
  };

  const scrollObj = { progress: 0 };

  gsap.to(scrollObj, {
    progress: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".video-sequence",
      start: "top bottom", // Trigger as soon as the top of sequence hits bottom of viewport
      end: "bottom top",   // End as soon as bottom of sequence leaves top of viewport
      scrub: 1, // smooth scrubbing frame by frame
      invalidateOnRefresh: true
    },
    onUpdate: () => renderSequence(scrollObj.progress)
  });

  function renderSequence(p) {
    const w = seqCanvas.width;
    const h = seqCanvas.height;

    // Background Off-White
    ctx.fillStyle = "#F4F4F5";
    ctx.fillRect(0, 0, w, h);

    // Orb drawing helper with soft radial gradients
    const drawOrb = (x, y, r, color) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      let rgb = color === 'cobalt' ? '0, 71, 255' :
        color === 'coral' ? '255, 107, 107' : '200, 220, 255';

      grad.addColorStop(0, `rgba(${rgb}, 0.8)`);
      grad.addColorStop(0.5, `rgba(${rgb}, 0.4)`);
      grad.addColorStop(1, `rgba(${rgb}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // Calculate dynamic positions simulating a video sequence
    const x1 = w * 0.5 + Math.sin(p * Math.PI * 2) * (w * 0.3);
    const y1 = h * 0.5 + Math.cos(p * Math.PI * 2) * (h * 0.4);
    drawOrb(x1, y1, w * 0.5, 'cobalt');

    const x2 = w * 0.5 + Math.cos(p * Math.PI * 2) * (w * 0.25);
    const y2 = h * 0.5 + Math.sin(p * Math.PI * 2 + 1) * (h * 0.3);
    drawOrb(x2, y2, w * 0.4, 'coral');

    const x3 = w * 0.5 + Math.sin(p * Math.PI * 4) * (w * 0.2);
    const y3 = h * 0.5 + Math.cos(p * Math.PI * 2) * (h * 0.2);
    drawOrb(x3, y3, w * 0.4, 'lightblue');
  }

  window.addEventListener("resize", updateSize);
  updateSize(); // Initial setup

  // Fade up the Video Overlay Text on scroll — desktop only
  // On mobile/tablet the overlay is static in DOM (CSS handles visibility)
  const seqOverlay = document.querySelector('.video-sequence__overlay');
  const isMobileVideo = window.matchMedia('(max-width: 1024px)').matches;
  if (seqOverlay && !isMobileVideo) {
    gsap.fromTo(seqOverlay,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".video-sequence",
          start: "top 50%",
          once: true
        }
      }
    );
  } else if (seqOverlay) {
    // On mobile: immediate show, no animation — CSS handles it
    gsap.set(seqOverlay, { opacity: 1, y: 0, clearProps: 'all' });
  }
}

// --------------------------------------------------------
// 7. DISRUPTIVE COOKIE TICKER LOGIC
// --------------------------------------------------------
const cookieBanner = document.getElementById('cookie-banner');
const acceptBtn = document.getElementById('accept-cookies');
const rejectBtn = document.getElementById('reject-cookies');

if (cookieBanner && acceptBtn && rejectBtn) {
  const dismissBanner = () => {
    // Add hidden class to trigger CSS exit animation
    cookieBanner.classList.add('hidden');
    setTimeout(() => {
      cookieBanner.style.display = 'none';
      cookieBanner.remove(); // Remove from DOM after transition
    }, 600); // match CSS duration
  };

  acceptBtn.addEventListener('click', dismissBanner);
  rejectBtn.addEventListener('click', dismissBanner);
}

// --------------------------------------------------------
// 8. TRUE CSS 3D FLOATING SHAPES — EXPLOSION FROM CENTER
// 5 shape types, 20 shapes, physics-based bounce with damping
// --------------------------------------------------------
const shapesScene = document.getElementById('shapes-scene');
if (shapesScene) {
  const palette = [
    { bg: 'rgba(255,90,70,0.18)', border: 'rgba(255,90,70,0.65)' },
    { bg: 'rgba(130,120,255,0.15)', border: 'rgba(130,120,255,0.6)' },
    { bg: 'rgba(160,210,255,0.13)', border: 'rgba(160,210,255,0.55)' },
    { bg: 'rgba(255,200,80,0.15)', border: 'rgba(255,200,80,0.6)' },
    { bg: 'rgba(80,230,180,0.13)', border: 'rgba(80,230,180,0.55)' },
    { bg: 'rgba(220,80,220,0.13)', border: 'rgba(220,80,220,0.55)' },
  ];

  // ---------- Shape factory helpers ----------
  const createCube = (size, color) => {
    const wrap = document.createElement('div');
    wrap.className = 'shape-3d shape-cube';
    wrap.style.cssText = `width:${size}px;height:${size}px;transform-style:preserve-3d;position:absolute;`;
    const half = size / 2;
    [
      { t: `translateZ(${half}px)`, bg: color.bg, op: .75 },
      { t: `translateZ(-${half}px) rotateY(180deg)`, bg: color.bg, op: .45 },
      { t: `translateX(-${half}px) rotateY(-90deg)`, bg: color.border, op: .55 },
      { t: `translateX(${half}px) rotateY(90deg)`, bg: color.border, op: .55 },
      { t: `translateY(-${half}px) rotateX(90deg)`, bg: 'rgba(255,255,255,.1)', op: .65 },
      { t: `translateY(${half}px) rotateX(-90deg)`, bg: 'rgba(0,0,0,.08)', op: .3 },
    ].forEach(f => {
      const face = document.createElement('div');
      face.style.cssText = `position:absolute;width:${size}px;height:${size}px;transform-style:preserve-3d;transform:${f.t};background:${f.bg};opacity:${f.op};border:1px solid ${color.border};box-sizing:border-box;backdrop-filter:blur(2px);`;
      wrap.appendChild(face);
    });
    return wrap;
  };

  const createRing = (size, color) => {
    const wrap = document.createElement('div');
    wrap.className = 'shape-3d shape-ring';
    wrap.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;border:3px solid ${color.border};transform-style:preserve-3d;position:absolute;box-shadow:0 0 14px ${color.border};`;
    const inner = document.createElement('div');
    inner.style.cssText = `position:absolute;top:15%;left:15%;width:70%;height:70%;border-radius:50%;border:1.5px solid ${color.border.replace(/[\d.]+\)$/, '0.35)')};transform:rotateX(70deg);`;
    wrap.appendChild(inner);
    return wrap;
  };

  // Pyramid: 4-sided CSS clip-path approach with 3D tilt
  const createPyramid = (size, color) => {
    const wrap = document.createElement('div');
    wrap.className = 'shape-3d shape-pyramid';
    wrap.style.cssText = `width:${size}px;height:${size}px;transform-style:preserve-3d;position:absolute;`;
    // Base
    const base = document.createElement('div');
    base.style.cssText = `position:absolute;bottom:0;left:0;width:${size}px;height:${size * 0.6}px;background:${color.bg};border:1px solid ${color.border};transform:rotateX(90deg) translateZ(${size * 0.3}px);box-sizing:border-box;`;
    // 4 triangular faces using clip-path
    const faceData = [
      { rotY: 0, tz: size / 2 },
      { rotY: 90, tz: size / 2 },
      { rotY: 180, tz: size / 2 },
      { rotY: 270, tz: size / 2 },
    ];
    faceData.forEach(f => {
      const tri = document.createElement('div');
      tri.style.cssText = `position:absolute;width:${size}px;height:${size}px;clip-path:polygon(50% 0%, 0% 100%, 100% 100%);background:${color.bg};border-bottom:2px solid ${color.border};transform:rotateY(${f.rotY}deg) translateZ(${f.tz}px);`;
      wrap.appendChild(tri);
    });
    wrap.appendChild(base);
    return wrap;
  };

  // Diamond: two pyramids mirrored
  const createDiamond = (size, color) => {
    const wrap = document.createElement('div');
    wrap.className = 'shape-3d shape-diamond';
    wrap.style.cssText = `width:${size}px;height:${size}px;transform-style:preserve-3d;position:absolute;`;
    [0, 180].forEach(rx => {
      const half = document.createElement('div');
      half.style.cssText = `position:absolute;width:${size}px;height:${size * 0.55}px;clip-path:polygon(50% 0%, 0% 100%, 100% 100%);background:${color.bg};border:1px solid ${color.border};transform:rotateX(${rx}deg) translateY(${rx === 0 ? 0 : -size * 0.55}px);`;
      wrap.appendChild(half);
    });
    return wrap;
  };

  // Octahedron-like: 8 triangular faces using two square pyramids
  const createOctahedron = (size, color) => {
    const wrap = document.createElement('div');
    wrap.className = 'shape-3d shape-octahedron';
    wrap.style.cssText = `width:${size}px;height:${size}px;transform-style:preserve-3d;position:absolute;`;
    for (let a = 0; a < 8; a++) {
      const face = document.createElement('div');
      const angle = (a / 8) * 360;
      const flip = a % 2 === 0 ? 0 : 180;
      face.style.cssText = `position:absolute;width:${size * 0.7}px;height:${size * 0.7}px;clip-path:polygon(50% 0%, 0% 100%, 100% 100%);background:${color.bg};border:1px solid ${color.border};transform:rotateY(${angle}deg) rotateX(${flip + 30}deg) translateZ(${size * 0.3}px);opacity:0.8;`;
      wrap.appendChild(face);
    }
    return wrap;
  };

  // ---------- Physics state ----------
  const TOTAL_SHAPES = 20;
  const spawnedShapes = [];

  // Viewport center in pixels
  const cx = shapesScene.offsetWidth * 0.5 || window.innerWidth * 0.5;
  const cy = shapesScene.offsetHeight * 0.5 || window.innerHeight * 0.35;

  const shapeTypes = ['cube', 'ring', 'pyramid', 'diamond', 'octahedron'];

  for (let i = 0; i < TOTAL_SHAPES; i++) {
    const color = palette[i % palette.length];
    const type = shapeTypes[i % shapeTypes.length];
    const size = 30 + Math.random() * 44; // 30–74 px

    let el;
    if (type === 'ring') el = createRing(size, color);
    else if (type === 'pyramid') el = createPyramid(size, color);
    else if (type === 'diamond') el = createDiamond(size, color);
    else if (type === 'octahedron') el = createOctahedron(size, color);
    else el = createCube(size, color);

    // All shapes start from center
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.marginLeft = `-${size / 2}px`;
    el.style.marginTop = `-${size / 2}px`;
    el.style.opacity = '0';
    shapesScene.appendChild(el);

    // Explosion target: random angle, radius 5–80% of viewport to fill the screen
    const angle = Math.random() * Math.PI * 2;
    const minRes = Math.min(window.innerWidth, window.innerHeight);
    const radius = (0.05 + Math.random() * 0.75) * minRes;
    const targetX = Math.cos(angle) * radius;
    const targetY = Math.sin(angle) * radius;

    const depth = 0.3 + Math.random() * 0.7;

    // Phase 1: Flash in at center, then EXPLODE outward with elastic bounce
    // All shapes explode at once (no delay)
    gsap.timeline({ delay: 0 })
      // Snap visible at center
      .set(el, { opacity: 1 })
      // Explode outward: elastic.out gives natural overshoot+decay feel
      .to(el, {
        x: targetX,
        y: targetY,
        duration: 1.6 + Math.random() * 0.8,  // 1.6–2.4 s — moderate speed
        ease: 'elastic.out(1, 0.45)',           // bounce + dampen to rest
      });

    // Phase 2: After settling, continuous slow drift (yoyo)
    gsap.to(el, {
      x: targetX + (Math.random() - 0.5) * 55,
      y: targetY + (Math.random() - 0.5) * 55,
      duration: 9 + Math.random() * 10,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 2.2 + i * 0.06,
    });

    // Continuous 3D spin
    gsap.to(el, {
      rotationX: `random(-360, 360)`,
      rotationY: `random(-360, 360)`,
      rotationZ: `random(-180, 180)`,
      duration: 9 + Math.random() * 13,
      ease: 'none',
      repeat: -1,
      yoyo: true,
    });

    spawnedShapes.push({ el, depth, baseX: targetX, baseY: targetY });
  }

  // Mouse parallax — absolute offset to avoid accumulation
  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5);
    const my = (e.clientY / window.innerHeight - 0.5);
    spawnedShapes.forEach(({ el, depth, baseX, baseY }) => {
      gsap.to(el, {
        x: baseX + mx * depth * 30,
        y: baseY + my * depth * 30,
        duration: 2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });
}

// --------------------------------------------------------
// 9. FAQ SCROLL-DRIVEN ANIMATION
// Disabled on mobile (≤768px) — CSS static stack is used instead
// --------------------------------------------------------
const faqSection = document.querySelector('.startup-faq');
const faqItems = gsap.utils.toArray('.startup-faq__item');
// consider the FAQ mobile only based on viewport width; desktop should
// always get the scroll‑driven animation even if a touchpad reports coarse.
const isMobileFaq = window.matchMedia('(max-width: 768px)').matches;

if (faqSection && faqItems.length > 0 && !isMobileFaq) {
  // Desktop only: GSAP pin + scroll-driven fade
  gsap.set(faqItems, { y: 60 });

  const faqTl = gsap.timeline({
    scrollTrigger: {
      trigger: faqSection,
      start: "top 20%",
      end: "+=2000",
      pin: true,
      scrub: 1,
    }
  });

  faqItems.forEach((item, i) => {
    faqTl.to(item, { y: 0, opacity: 1, duration: 1 });

    if (i !== faqItems.length - 1) {
      faqTl.to(item, { y: -60, opacity: 0, duration: 1 }, "+=0.5");
    } else {
      faqTl.to(item, { opacity: 1, duration: 1 }, "+=0.5");
    }
  });
}
// On mobile: CSS handles display (position:static, opacity:1 — see media query)

// --------------------------------------------------------
// 10. PHASE 16 — HAMBURGER MENU + ACCESSIBILITY WIDGET
// --------------------------------------------------------

// ---- Hamburger Menu ----
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuClose = document.getElementById('mobile-menu-close');

const openMenu = () => {
  mobileMenu.hidden = false;
  mobileMenu.setAttribute('aria-hidden', 'false');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  // Small delay so display:block is applied before CSS transition
  requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
  // Trap focus within menu, move to close button
  menuClose.focus();
  document.body.style.overflow = 'hidden';
};

const closeMenu = () => {
  mobileMenu.classList.remove('is-open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Hide after transition ends
  mobileMenu.addEventListener('transitionend', () => {
    mobileMenu.hidden = true;
  }, { once: true });
  hamburgerBtn.focus(); // Return focus to trigger button
};

if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);

  // Close on any menu link click
  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key (WCAG 2.1)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

// ---- Macro CTA Overlay (Mobile/Tablet) ----
const ctaBtn = document.querySelector('.macro-cta');
const ctaOverlay = document.querySelector('.macro-cta-overlay');
const ctaCloseBtn = document.querySelector('.macro-cta-overlay__close');

if (ctaBtn && ctaOverlay && ctaCloseBtn) {
  const openCtaOverlay = (e) => {
    // Only intercept if we are on a smaller screen since desktop relies on CSS hover
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      ctaOverlay.hidden = false;
      // Force layout recalculation so transition runs
      ctaOverlay.offsetHeight;
      ctaOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCtaOverlay = () => {
    ctaOverlay.classList.remove('is-open');
    document.body.style.overflow = '';

    // Wait for transition to finish before hiding display
    const onTransitionEnd = () => {
      ctaOverlay.hidden = true;
      ctaOverlay.removeEventListener('transitionend', onTransitionEnd);
    };
    ctaOverlay.addEventListener('transitionend', onTransitionEnd);
  };

  ctaBtn.addEventListener('click', openCtaOverlay);
  ctaCloseBtn.addEventListener('click', closeCtaOverlay);

  // Close when clicking outside of the links (e.g. on the background)
  ctaOverlay.addEventListener('click', (e) => {
    if (e.target === ctaOverlay) {
      closeCtaOverlay();
    }
  });
}

// ---- Accessibility Widget ----
const a11yToggle = document.getElementById('a11y-toggle');
const a11yPanel = document.getElementById('a11y-panel');

if (a11yToggle && a11yPanel) {
  console.log("Accessibility widget elements found.");
  const handleA11yToggle = (e) => {
    e.preventDefault();
    console.log("A11y toggle clicked.");
    const isHidden = a11yPanel.hasAttribute('hidden');
    if (isHidden) {
      a11yPanel.removeAttribute('hidden');
      a11yToggle.setAttribute('aria-expanded', 'true');
      const firstBtn = a11yPanel.querySelector('button');
      if (firstBtn) firstBtn.focus();
    } else {
      a11yPanel.setAttribute('hidden', '');
      a11yToggle.setAttribute('aria-expanded', 'false');
    }
  };

  a11yToggle.addEventListener('click', handleA11yToggle);
  a11yToggle.addEventListener('touchstart', (e) => {
    e.cancelable && e.preventDefault();
    handleA11yToggle(e);
  }, { passive: false });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    if (!a11yPanel.hasAttribute('hidden') && !e.target.closest('#a11y-widget')) {
      console.log("A11y outside click detected, closing...");
      a11yPanel.setAttribute('hidden', '');
      a11yToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !a11yPanel.hasAttribute('hidden')) {
      a11yPanel.setAttribute('hidden', '');
      a11yToggle.setAttribute('aria-expanded', 'false');
      a11yToggle.focus();
    }
  });
} else {
  console.error("Accessibility widget NOT found in DOM!");
}

// ---- Font Size Scaling ----
let fontScale = parseFloat(localStorage.getItem('a11y-font-scale') || '1');

const applyFontScale = (scale) => {
  fontScale = Math.max(0.8, Math.min(1.5, scale));
  document.documentElement.style.fontSize = `${fontScale * 16}px`;
  localStorage.setItem('a11y-font-scale', fontScale);
};

// Restore saved scale
applyFontScale(fontScale);

document.getElementById('font-increase')?.addEventListener('click', () => applyFontScale(fontScale + 0.1));
document.getElementById('font-decrease')?.addEventListener('click', () => applyFontScale(fontScale - 0.1));
document.getElementById('font-reset')?.addEventListener('click', () => applyFontScale(1));

// ---- High Contrast Mode ----
const highContrastBtn = document.getElementById('high-contrast-toggle');
let highContrast = localStorage.getItem('a11y-high-contrast') === 'true';

const applyHighContrast = (active) => {
  document.documentElement.classList.toggle('high-contrast', active);
  highContrastBtn?.setAttribute('aria-pressed', String(active));
  localStorage.setItem('a11y-high-contrast', active);
};

applyHighContrast(highContrast);

highContrastBtn?.addEventListener('click', () => {
  highContrast = !highContrast;
  applyHighContrast(highContrast);
});

// ---- Stop Animations ----
const stopAnimBtn = document.getElementById('stop-animations-toggle');
let animStopped = localStorage.getItem('a11y-animations-stopped') === 'true';

const applyAnimStop = (stopped) => {
  document.documentElement.classList.toggle('animations-stopped', stopped);
  stopAnimBtn?.setAttribute('aria-pressed', String(stopped));
  localStorage.setItem('a11y-animations-stopped', stopped);
  // Also pause/resume GSAP globally
  if (stopped) {
    gsap.globalTimeline.pause();
  } else {
    gsap.globalTimeline.resume();
  }
};

applyAnimStop(animStopped);

stopAnimBtn?.addEventListener('click', () => {
  animStopped = !animStopped;
  applyAnimStop(animStopped);
});

// ---- Dyslexia / Readability Mode ----
const dyslexiaBtn = document.getElementById('dyslexia-toggle');
let dyslexiaOn = localStorage.getItem('a11y-dyslexia') === 'true';

const applyDyslexia = (active) => {
  document.documentElement.classList.toggle('dyslexia-mode', active);
  dyslexiaBtn?.setAttribute('aria-pressed', String(active));
  localStorage.setItem('a11y-dyslexia', active);
};

applyDyslexia(dyslexiaOn);

dyslexiaBtn?.addEventListener('click', () => {
  dyslexiaOn = !dyslexiaOn;
  applyDyslexia(dyslexiaOn);
});

// ---- Respect prefers-reduced-motion on load ----
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.pause();
}

// End of main.js
