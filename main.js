    // ================================================
    // 1. SVG DRAW-ON — Compute path lengths (Drasner)
    // ================================================
    document.querySelectorAll('.lab-card__icon svg *, .service-icon svg *').forEach(el => {
      let len;
      try {
        if (el.getTotalLength) len = el.getTotalLength();
      } catch(e) {}
      if (!len) {
        if (el.tagName === 'circle') len = 2 * Math.PI * parseFloat(el.getAttribute('r'));
        else if (el.tagName === 'rect') {
          const w = parseFloat(el.getAttribute('width'));
          const h = parseFloat(el.getAttribute('height'));
          len = 2 * (w + h);
        } else if (el.tagName === 'line') {
          const x1 = parseFloat(el.getAttribute('x1'));
          const y1 = parseFloat(el.getAttribute('y1'));
          const x2 = parseFloat(el.getAttribute('x2'));
          const y2 = parseFloat(el.getAttribute('y2'));
          len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        } else if (el.tagName === 'ellipse') {
          const rx = parseFloat(el.getAttribute('rx'));
          const ry = parseFloat(el.getAttribute('ry'));
          len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
        } else len = 60;
      }
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.style.setProperty('--path-len', len);
    });

    // ================================================
    // 2. SCROLL REVEAL — IntersectionObserver
    // ================================================
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Stamp flash + screen shake for lab cards emerging from factory
          if (entry.target.classList.contains('lab-card')) {
            entry.target.classList.add('stamp-flash');
            setTimeout(() => entry.target.classList.remove('stamp-flash'), 600);
          }
          // Trigger SVG draw-on for children
          entry.target.querySelectorAll('svg *[style*="stroke-dashoffset"]').forEach(el => {
            el.style.strokeDashoffset = 0;
          });
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ================================================
    // 3. REDUCED MOTION CHECK
    // ================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Remove SMIL animations for reduced motion
    if (prefersReducedMotion) {
      document.querySelectorAll('animate, animateMotion, animateTransform').forEach(el => el.remove());
    }

    // ================================================
    // ALL INTERACTIVE SYSTEMS (gated)
    // ================================================
    if (!prefersReducedMotion) {

      // ==============================================
      // ATMOSPHERE PARTICLES (Bruno)
      // ==============================================
      (function() {
        const colors = ['79,109,245', '129,140,248', '13,148,136', '217,119,6', '0,212,255'];
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
        container.setAttribute('aria-hidden', 'true');
        document.body.prepend(container);

        for (let i = 0; i < 12; i++) {
          const p = document.createElement('div');
          const tier = i < 5 ? 'spark' : 'orb';
          const size = tier === 'spark' ? (2 + Math.random() * 3)
                     : (8 + Math.random() * 6);
          const color = colors[Math.floor(Math.random() * colors.length)];
          const op = tier === 'spark' ? (0.12 + Math.random() * 0.15)
                   : (0.06 + Math.random() * 0.06);

          p.className = 'atmosphere-particle atmosphere-particle--' + tier;
          p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;' +
            'background:rgba(' + color + ',' + op + ');' +
            'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;' +
            '--dur:' + ((tier === 'spark' ? 8 : 15) + Math.random() * 10) + 's;' +
            '--delay:' + (Math.random() * -20) + 's;' +
            '--range:' + (60 + Math.random() * 80) + 'px;' +
            '--dx:' + ((Math.random() - 0.5) * 100) + 'px;' +
            '--base-op:' + op + ';';
          container.appendChild(p);
        }
      })();

      // ==============================================
      // CURSOR GLOW TRAIL (Bruno)
      // ==============================================
      const cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-glow';
      document.body.appendChild(cursorGlow);
      document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      });

      const robot = document.querySelector('.hero-robot');
      const hero = document.querySelector('.hero');
      const bubble = document.getElementById('robotBubble');

      // ==============================================
      // 4. ROBOT CURSOR TRACKING (Comeau)
      // ==============================================
      let robotRect = null;
      let rafId = null;
      let targetRX = 0, targetRY = 0, targetTX = 0, targetTY = 0;
      let curRX = 0, curRY = 0, curTX = 0, curTY = 0;
      let robotMouseInHero = false;

      function updateRobotRect() { robotRect = robot.getBoundingClientRect(); }

      hero.addEventListener('mouseenter', () => {
        robotMouseInHero = true;
        robot.style.animationPlayState = 'paused';
      });

      hero.addEventListener('mousemove', (e) => {
        if (!robotRect) updateRobotRect();
        const cx = robotRect.left + robotRect.width / 2;
        const cy = robotRect.top + robotRect.height / 2;
        const dx = (e.clientX - cx) / (window.innerWidth / 2);
        const dy = (e.clientY - cy) / (window.innerHeight / 2);
        targetRY = dx * 12;
        targetRX = dy * -8;
        targetTX = dx * 6;
        targetTY = dy * 4;

        // Hero parallax particles
        hero.style.setProperty('--hero-mx', (dx * -15) + 'px');
        hero.style.setProperty('--hero-my', (dy * -10) + 'px');

        if (!rafId) rafId = requestAnimationFrame(animateRobot);
      });

      hero.addEventListener('mouseleave', () => {
        robotMouseInHero = false;
        targetRX = 0; targetRY = 0; targetTX = 0; targetTY = 0;
        hero.style.setProperty('--hero-mx', '0px');
        hero.style.setProperty('--hero-my', '0px');
        if (!rafId) rafId = requestAnimationFrame(animateRobot);
        setTimeout(() => {
          if (!robotMouseInHero) {
            robot.style.transform = '';
            robot.style.filter = '';
            robot.style.animationPlayState = 'running';
          }
        }, 400);
      });

      function animateRobot() {
        const lerp = 0.08;
        curRX += (targetRX - curRX) * lerp;
        curRY += (targetRY - curRY) * lerp;
        curTX += (targetTX - curTX) * lerp;
        curTY += (targetTY - curTY) * lerp;

        robot.style.transform = `translate(${curTX}px, ${curTY}px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;
        const sx = -curRY * 0.5;
        const sy = 8 + curRX * 0.5;
        robot.style.filter = `drop-shadow(${sx}px ${sy}px 24px rgba(79, 109, 245, 0.3))`;

        const still = Math.abs(targetRX - curRX) < 0.01 && Math.abs(targetRY - curRY) < 0.01;
        if (still && !robotMouseInHero) { rafId = null; return; }
        rafId = requestAnimationFrame(animateRobot);
      }

      window.addEventListener('scroll', updateRobotRect, { passive: true });
      window.addEventListener('resize', updateRobotRect);

      // ==============================================
      // 5. ROBOT CLICK SPIN + COMBO (Bruno/Comeau)
      // ==============================================
      let isSpinning = false;
      let clickCount = 0;
      let lastClickTime = 0;

      robot.addEventListener('click', function() {
        const now = Date.now();
        if (now - lastClickTime > 2000) clickCount = 0;
        clickCount++;
        lastClickTime = now;

        if (!isSpinning) {
          isSpinning = true;
          this.style.animationPlayState = 'running';
          this.style.animation = 'none';
          this.offsetHeight;
          this.style.animation = 'robot-spin 0.6s ease-in-out';
          setTimeout(() => {
            this.style.animation = 'robot-alive 3s ease-in-out infinite';
            if (robotMouseInHero) this.style.animationPlayState = 'paused';
            isSpinning = false;
          }, 700);
        }

        if (clickCount >= 5) {
          clickCount = 0;
          triggerConfetti(this.getBoundingClientRect());
        }
      });

      // ==============================================
      // 6. ROBOT LONG-HOVER DANCE + BUBBLE (Bruno)
      // ==============================================
      let hoverTimer = null;
      const robotMessages = [
        "You found me!",
        "I'm the mascot. I do very little.",
        "Ship it.",
        "404: Motivation not found.",
        "The hula is my only skill.",
        "Try clicking me 5 times fast!",
      ];

      robot.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          robot.style.animationPlayState = 'running';
          robot.style.animation = 'none';
          robot.offsetHeight;
          robot.style.animation = 'robot-hula-dance 2s var(--spring-bounce)';
          if (bubble) {
            bubble.textContent = robotMessages[Math.floor(Math.random() * robotMessages.length)];
            bubble.classList.add('show');
          }
          setTimeout(() => {
            robot.style.animation = 'robot-alive 3s ease-in-out infinite';
            if (robotMouseInHero) robot.style.animationPlayState = 'paused';
          }, 2000);
          setTimeout(() => { if (bubble) bubble.classList.remove('show'); }, 3000);
        }, 3000);
      });

      robot.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); });

      // ==============================================
      // 7. ROBOT SCROLL REACTION (Comeau)
      // ==============================================
      let wasInHero = true;
      const heroObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !wasInHero) {
            wasInHero = true;
            robot.style.animation = 'none';
            robot.offsetHeight;
            robot.style.animation = 'robot-welcome 0.5s var(--spring-bounce)';
            setTimeout(() => {
              robot.style.animation = 'robot-alive 3s ease-in-out infinite';
            }, 500);
          } else if (!entry.isIntersecting) {
            wasInHero = false;
          }
        });
      }, { threshold: 0.3 });
      heroObs.observe(hero);

      // ==============================================
      // 8. CARD GLOSS MOUSE TRACKING
      // ==============================================
      document.querySelectorAll('.lab-card, .service-card').forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
          el.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });

      // ==============================================
      // 9. CARD ICON HOVER RE-DRAW (Drasner)
      // ==============================================
      document.querySelectorAll('.lab-card').forEach(card => {
        const paths = card.querySelectorAll('.lab-card__icon svg *');
        card.addEventListener('mouseenter', () => {
          paths.forEach(p => {
            const len = parseFloat(p.style.getPropertyValue('--path-len')) || 60;
            p.style.transition = 'none';
            p.style.strokeDashoffset = len;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                p.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.65,0,0.35,1)';
                p.style.strokeDashoffset = 0;
              });
            });
          });
        });
      });

      // ==============================================
      // 11. CTA RIPPLE (Comeau)
      // ==============================================
      document.querySelector('.hero-cta').addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'cta-ripple';
        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });

      // ==============================================
      // 12. CONFETTI PARTICLE SYSTEM (Bruno)
      // ==============================================
      function triggerConfetti(originRect, count) {
        count = count || 20;
        const colors = ['#4f6df5','#818cf8','#d97706','#fbbf24','#0d9488','#2dd4bf','#f43f5e'];
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
        document.body.appendChild(container);
        const cx = originRect.left + originRect.width / 2;
        const cy = originRect.top + originRect.height / 2;

        for (let i = 0; i < count; i++) {
          const p = document.createElement('div');
          const size = Math.random() * 8 + 4;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const angle = Math.random() * Math.PI * 2;
          const vel = Math.random() * 200 + 100;
          const dx = Math.cos(angle) * vel;
          const dy = Math.sin(angle) * vel - 150;
          const rot = Math.random() * 720 - 360;
          const dur = Math.random() * 600 + 800;

          p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random()>0.5?'50%':'2px'};opacity:1;transform:translate(0,0)rotate(0deg);transition:transform ${dur}ms cubic-bezier(0.25,0.46,0.45,0.94),opacity ${dur}ms ease;will-change:transform,opacity;`;
          container.appendChild(p);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              p.style.transform = `translate(${dx}px,${dy+300}px)rotate(${rot}deg)`;
              p.style.opacity = '0';
            });
          });
        }
        setTimeout(() => container.remove(), 2000);
      }

      // ==============================================
      // 13. KONAMI CODE (Bruno)
      // ==============================================
      const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      let konamiIdx = 0;

      document.addEventListener('keydown', (e) => {
        if (e.key === konamiSeq[konamiIdx]) {
          konamiIdx++;
          if (konamiIdx === konamiSeq.length) {
            konamiIdx = 0;
            document.documentElement.style.setProperty('--brand', '#ff6b6b');
            document.querySelectorAll('.lab-card, .service-card').forEach((c, i) => {
              c.style.transition = 'filter 0.5s ease';
              c.style.filter = `hue-rotate(${i * 60}deg)`;
            });
            triggerConfetti(robot.getBoundingClientRect(), 40);
            setTimeout(() => {
              document.documentElement.style.setProperty('--brand', '#4f6df5');
              document.querySelectorAll('.lab-card, .service-card').forEach(c => {
                c.style.filter = '';
              });
            }, 4000);
          }
        } else konamiIdx = 0;
      });

      // "hula" easter egg (Comeau)
      let typed = '';
      document.addEventListener('keydown', (e) => {
        typed += e.key.toLowerCase();
        typed = typed.slice(-4);
        if (typed === 'hula') {
          robot.style.animation = 'none';
          robot.offsetHeight;
          robot.style.animation = 'robot-hula-dance 1.5s var(--spring-bounce)';
          setTimeout(() => {
            robot.style.animation = 'robot-alive 3s ease-in-out infinite';
          }, 1500);
          typed = '';
        }
      });

      // ==============================================
      // 14. SCROLL COMPLETION REWARD (Bruno)
      // ==============================================
      let reachedBottom = false;
      const footer = document.querySelector('footer');
      const bottomObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !reachedBottom) {
          reachedBottom = true;
          triggerConfetti(footer.getBoundingClientRect(), 15);
          const msg = document.createElement('div');
          msg.textContent = "You explored the whole lab!";
          msg.style.cssText = 'color:var(--brand-light);font-size:0.8rem;margin-top:0.5rem;opacity:0;transition:opacity 0.5s ease;';
          footer.querySelector('.container').appendChild(msg);
          requestAnimationFrame(() => { msg.style.opacity = '1'; });
          setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
          }, 3000);
        }
      }, { threshold: 0.5 });
      bottomObs.observe(footer);

    } // end reduced motion gate

    // ================================================
    // ALWAYS-ON SYSTEMS (no motion dependency)
    // ================================================

    // Mobile menu toggle with a11y
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinksEl = document.getElementById('navLinks');
    if (mobileToggle && navLinksEl) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = navLinksEl.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinksEl.classList.contains('active')) {
          navLinksEl.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.focus();
        }
      });
    }

    // Scroll progress bar
    const progressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = pct + '%';
    }, { passive: true });

    // Nav shadow on scroll
    const navEl = document.querySelector('nav');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navEl.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.08)';
        navEl.style.borderBottomColor = 'transparent';
      } else {
        navEl.style.boxShadow = '';
        navEl.style.borderBottomColor = '';
      }
    }, { passive: true });

    // Active nav section tracking — scroll-based, picks the one section
    // whose top is closest to (but not below) the viewport top + nav height
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let activeNavTicking = false;

    function updateActiveNav() {
      const navHeight = 72;
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - navHeight - 40;
        if (window.scrollY >= top) current = section.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
      activeNavTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!activeNavTicking) {
        requestAnimationFrame(updateActiveNav);
        activeNavTicking = true;
      }
    }, { passive: true });
    updateActiveNav();
