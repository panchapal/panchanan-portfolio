/* ==========================================================================
   LIQUID RAIN DESIGN SYSTEM - INTERACTIVE JAVASCRIPT
   (Background now uses a Constellation Particle Network animation)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     1. PERFORMANCE & DEVICE DETECT
     ========================================== */
  const isMobile = window.innerWidth <= 768;
  const pixelRatio = window.devicePixelRatio || 1;

  /* ==========================================
     2. CONSTELLATION PARTICLE NETWORK
     ========================================== */
  const canvas = document.getElementById('rain-canvas');
  const ctx = canvas.getContext('2d');

  // Color Palette (Midnight Azure theme)
  const colors = {
    primary: '13, 162, 231',    /* Electric Azure */
    secondary: '137, 84, 212',  /* Violet Glow */
    accent: '90, 173, 181',     /* Teal Mist */
    lightSand: '177, 210, 221', /* Light Sky */
  };

  // Network Presets
  const PRESETS = {
    SUBTLE:  { count: isMobile ? 30 : 70,  speed: 0.18, linkDist: 130, name: 'Subtle Network' },
    NORMAL:  { count: isMobile ? 45 : 110, speed: 0.28, linkDist: 150, name: 'Normal Network' },
    DENSE:   { count: isMobile ? 65 : 170, speed: 0.35, linkDist: 170, name: 'Dense Network' },
    GALAXY:  { count: isMobile ? 80 : 220, speed: 0.5,  linkDist: 190, name: 'Galaxy Mode' }
  };

  let currentPreset = PRESETS.NORMAL;
  let particles = [];
  let pulses = [];

  // Mouse tracking
  const mouse = {
    x: -1000,
    y: -1000,
    radius: 150,
    active: false
  };

  // Resize canvas to match screen size
  function resizeCanvas() {
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(pixelRatio, pixelRatio);

    particles = [];
    initParticles();
  }

  window.addEventListener('resize', resizeCanvas);

  // Particle (node) class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;

      const angle = Math.random() * Math.PI * 2;
      const speed = currentPreset.speed * (0.5 + Math.random());
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.radius = 1.4 + Math.random() * 2.2;
      this.baseOpacity = 0.35 + Math.random() * 0.45;

      // Twinkle effect
      this.twinkleSpeed = 0.005 + Math.random() * 0.02;
      this.twinklePhase = Math.random() * Math.PI * 2;

      const colorKeys = Object.keys(colors);
      this.color = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x <= 0 || this.x >= window.innerWidth) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(window.innerWidth, this.x));
      }
      if (this.y <= 0 || this.y >= window.innerHeight) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(window.innerHeight, this.y));
      }

      // Gentle repulsion from mouse
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0.01) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.2;
          this.y += (dy / dist) * force * 1.2;
        }
      }

      this.twinklePhase += this.twinkleSpeed;
    }

    draw() {
      const twinkle = 0.6 + Math.sin(this.twinklePhase) * 0.4;
      const opacity = this.baseOpacity * twinkle;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${opacity})`;
      ctx.shadowColor = `rgba(${this.color}, 0.9)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Click "pulse" ring - expanding shockwave through the network
  class Pulse {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = 1;
      this.maxRadius = 260;
      this.alpha = 0.8;
    }

    update() {
      this.radius += 6;
      this.alpha = 0.8 * (1 - this.radius / this.maxRadius);

      // Push nearby particles outward as the pulse passes
      particles.forEach(p => {
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - this.radius) < 18 && dist > 0.01) {
          const force = 1.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      });
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function initParticles() {
    for (let i = 0; i < currentPreset.count; i++) {
      particles.push(new Particle());
    }
  }

  // Mouse interactivity
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Click sends out a glowing pulse through the constellation
  window.addEventListener('click', (e) => {
    if (pulses.length > 6) pulses.shift();
    pulses.push(new Pulse(e.clientX, e.clientY, colors.primary));
  });

  // Main Canvas Render Loop
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const theme = document.documentElement.getAttribute('data-theme');
    const lineBaseAlpha = theme === 'light' ? 0.12 : 0.18;
    const mouseLineAlpha = theme === 'light' ? 0.35 : 0.45;

    // Update particles first
    particles.forEach(p => p.update());

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < currentPreset.linkDist) {
          const opacity = (1 - dist / currentPreset.linkDist) * lineBaseAlpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${colors.primary}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw connections from mouse to nearby particles (interactive web)
    if (mouse.active) {
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const opacity = (1 - dist / mouse.radius) * mouseLineAlpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${colors.secondary}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Soft glow around cursor
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      grad.addColorStop(0, `rgba(${colors.primary}, 0.06)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw particles on top of connections
    particles.forEach(p => p.draw());

    // Update & draw click pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.update();
      if (pulse.alpha <= 0) {
        pulses.splice(i, 1);
      } else {
        pulse.draw();
      }
    }

    requestAnimationFrame(animate);
  }

  // Initialize
  resizeCanvas();
  animate();

  /* ==========================================
     3. INTERACTIVE CONTROLS (THEMES & DENSITY)
     ========================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const densityBtn = document.getElementById('rain-intensity-btn');

  // Theme Logic
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #8954d4;"></i>';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  });

  // Network Density Cycle Logic
  const densityModes = [PRESETS.NORMAL, PRESETS.DENSE, PRESETS.GALAXY, PRESETS.SUBTLE];
  let currentModeIndex = 0; // Starts at NORMAL (index 0)

  densityBtn.addEventListener('click', () => {
    currentModeIndex = (currentModeIndex + 1) % densityModes.length;
    currentPreset = densityModes[currentModeIndex];

    // Rebuild particle field for new density
    particles = [];
    initParticles();

    // Visual indicators/toasts and button icon changes
    let iconClass = 'fa-circle-nodes';
    if (currentPreset === PRESETS.DENSE) {
      iconClass = 'fa-diagram-project';
      showToast('Background Mode: Dense Network 🔗');
    } else if (currentPreset === PRESETS.GALAXY) {
      iconClass = 'fa-meteor';
      showToast('Background Mode: Galaxy Mode ✨');
    } else if (currentPreset === PRESETS.SUBTLE) {
      iconClass = 'fa-circle-dot';
      showToast('Background Mode: Subtle Network 🌌');
    } else {
      showToast('Background Mode: Normal Network 🔗');
    }

    densityBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
  });

  /* ==========================================
     4. HEADER SCROLL STATE & ACTIVE LINKS
     ========================================== */
  const header = document.getElementById('header-nav');
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  function updateScrollState() {
    const scrollPos = window.scrollY;

    // Header background toggle on scroll
    if (scrollPos > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll-to-Top Button visibility (appears after scrolling 400px)
    if (scrollToTopBtn) {
      if (scrollPos > 400) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }

    // Scroll Spy active nav items
    let currentSectionId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.querySelector('a').getAttribute('href').substring(1);
      if (href === currentSectionId) {
        item.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  // Initial check on load
  updateScrollState();

  /* ==========================================
     5. MOBILE MENU DRAWER
     ========================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
    
    const isOpen = navLinks.classList.contains('active');
    menuToggle.innerHTML = isOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('active');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });

  // Close mobile menu on nav link clicks
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  /* ==========================================
     6. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================== */
  const elementsToReveal = [
    ...document.querySelectorAll('.hero-content'),
    ...document.querySelectorAll('.hero-portrait-container'),
    ...document.querySelectorAll('.about-text'),
    ...document.querySelectorAll('.about-stats'),
    ...document.querySelectorAll('.skills-category'),
    ...document.querySelectorAll('.project-card'),
    ...document.querySelectorAll('.timeline-item'),
    ...document.querySelectorAll('.contact-info'),
    ...document.querySelectorAll('.contact-form')
  ];

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    elementsToReveal.forEach(el => {
      el.classList.add('js-reveal');
      revealObserver.observe(el);
    });
  } else {
    elementsToReveal.forEach(el => {
      el.classList.add('active');
    });
  }

  /* ==========================================
     7. CONTACT FORM SUBMISSION
     ========================================== */
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('form-toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(message, isError = false) {
    toastMessage.textContent = message;
    
    if (isError) {
      toast.style.borderColor = 'hsl(265, 60%, 58%)';
      toast.querySelector('i').className = 'fa-solid fa-circle-exclamation';
    } else {
      toast.style.borderColor = 'var(--color-primary)';
      toast.querySelector('i').className = 'fa-solid fa-circle-check';
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;

    // Show sending spinner state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending message... <i class="fa-solid fa-circle-notch fa-spin"></i>';

    // Simulated network delay (1.5 seconds)
    setTimeout(() => {
      const name = document.getElementById('name').value;
      
      // Success toast feedback
      showToast(`Thank you, ${name}! Your message was successfully received.`);
      
      // Reset form fields
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Send a network pulse from the contact button
      const rect = submitBtn.getBoundingClientRect();
      if (pulses.length > 6) pulses.shift();
      pulses.push(new Pulse(rect.left + rect.width / 2, rect.top + rect.height / 2, colors.primary));
    }, 1500);
  });

  /* ==========================================
     8. SCROLL-TO-TOP BUTTON
     ========================================== */
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});