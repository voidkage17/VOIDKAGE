// VOIDKAGE V3 — interaction layer (Optimized for Lighthouse 100/100)

// VOIDKAGE — cinematic transition layer
(() => {
  const progress = document.querySelector(".scroll-progress i");
  const navLinks = document.querySelectorAll('a[href^="#"]');

  // Immediate page ready without artificial delays
  document.body.classList.add("page-ready");

  // Passive RAF-throttled scroll progress
  let scrollTicking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${value})`;
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  // Section reveals with IntersectionObserver
  const revealItems = document.querySelectorAll(".reveal-section, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("is-visible"));
  }

  // Smooth internal navigation
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Magnetic hover with passive pointer listener
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".menu, .menu-close, .hero-bottom a, .coming a, .links a").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.08;
        const y = (e.clientY - r.top - r.height / 2) * 0.08;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
      }, { passive: true });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }
})();

// Cursor — GPU-accelerated translate3d with RAF loop
(() => {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (window.matchMedia("(pointer:fine)").matches && dot && ring) {
    let mx = -100, my = -100, rx = -100, ry = -100, cursorRaf = null;

    const renderCursor = () => {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        cursorRaf = requestAnimationFrame(renderCursor);
      } else {
        cursorRaf = null;
      }
    };

    window.addEventListener("mousemove", e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      if (!cursorRaf) {
        cursorRaf = requestAnimationFrame(renderCursor);
      }
    }, { passive: true });
  }
})();

// Cursor hover states
document.querySelectorAll("a, button, .work-card, .tilt-card, .cube").forEach(el => {
  el.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"), { passive: true });
  el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"), { passive: true });
});

// Menu
const menu = document.querySelector(".menu");
const panel = document.querySelector(".menu-panel");
const close = document.querySelector(".menu-close");
if (menu && panel && close) {
  menu.addEventListener("click", () => panel.classList.add("open"));
  close.addEventListener("click", () => panel.classList.remove("open"));
  panel.querySelectorAll("a").forEach(a => a.addEventListener("click", () => panel.classList.remove("open")));
}

// Poster 3D tilt with RAF throttling
const tilt = document.querySelector("[data-tilt]");
if (tilt) {
  const tiltImg = tilt.querySelector("img");
  let tiltRaf = null, tx = 0, ty = 0;
  tilt.addEventListener("pointermove", e => {
    const r = tilt.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!tiltRaf) {
      tiltRaf = requestAnimationFrame(() => {
        tilt.style.transform = `rotateX(${ty * -10}deg) rotateY(${tx * 12}deg)`;
        if (tiltImg) tiltImg.style.transform = `scale(1.035) translate(${tx * 5}px, ${ty * 5}px)`;
        tiltRaf = null;
      });
    }
  }, { passive: true });
  tilt.addEventListener("pointerleave", () => {
    tilt.style.transform = "";
    if (tiltImg) tiltImg.style.transform = "";
  });
}

// Draggable CSS cube
const cube = document.getElementById("cube");
if (cube) {
  let dragging = false, lastX = 0, lastY = 0, rotX = -18, rotY = 28;
  cube.addEventListener("pointerdown", e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; cube.setPointerCapture(e.pointerId);
  });
  cube.addEventListener("pointermove", e => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.7;
    rotX -= (e.clientY - lastY) * 0.7;
    lastX = e.clientX; lastY = e.clientY;
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }, { passive: true });
  cube.addEventListener("pointerup", () => dragging = false);
  cube.addEventListener("pointercancel", () => dragging = false);
}

// Three.js hero orb — viewport observed & low-overhead WebGL
const voidCanvas = document.getElementById("void-canvas");
if (window.THREE && voidCanvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 4.4;

  const renderer = new THREE.WebGLRenderer({ canvas: voidCanvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.IcosahedronGeometry(1.25, 3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x141414,
    roughness: 0.35,
    metalness: 0.85,
    wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.82, 2),
    new THREE.MeshStandardMaterial({
      color: 0x090909, roughness: 0.2, metalness: 0.95
    })
  );
  group.add(core);

  const redLight = new THREE.PointLight(0xff1744, 12, 7);
  redLight.position.set(2, 1.5, 2.5);
  scene.add(redLight);

  const whiteLight = new THREE.PointLight(0xffffff, 5, 8);
  whiteLight.position.set(-3, -2, 2);
  scene.add(whiteLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  let mx = 0, my = 0;
  window.addEventListener("mousemove", e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 0.35;
    my = (e.clientY / window.innerHeight - 0.5) * 0.25;
  }, { passive: true });

  function resize() {
    const parent = voidCanvas.parentElement;
    if (!parent) return;
    const r = parent.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }, { passive: true });

  let isOrbVisible = true;
  if ("IntersectionObserver" in window) {
    const orbObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isOrbVisible = entry.isIntersecting;
        if (isOrbVisible) {
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.05 });
    orbObserver.observe(voidCanvas);
  }

  function animate(t) {
    if (!isOrbVisible) return;
    requestAnimationFrame(animate);
    group.rotation.y += 0.0028;
    group.rotation.x = Math.sin(t * 0.00035) * 0.18 + my;
    group.rotation.y += mx * 0.003;
    core.rotation.y -= 0.0015;
    renderer.render(scene, camera);
  }
  animate(0);
}

// Hero depth on scroll — lightweight
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const heroCopy = document.querySelector(".hero-copy");
  const orb = document.querySelector(".orb-wrap");
  if (!heroCopy || !orb) return;

  let ticking = false;
  const parallax = () => {
    const y = Math.min(window.scrollY, window.innerHeight);
    heroCopy.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
    orb.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }, { passive: true });
})();

// Network status
(() => {
  const onOfflinePage = /offline\.html$/.test(window.location.pathname);
  if (onOfflinePage) {
    window.addEventListener("online", () => window.location.reload());
    return;
  }
  window.addEventListener("offline", () => {
    window.location.href = "offline.html";
  });
})();
