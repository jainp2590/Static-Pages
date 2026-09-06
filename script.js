(function () {
  'use strict';

  /* ===== Heart gate unlock ===== */
  const heart_gate = document.getElementById('heart-gate');
  const gate_unlock = document.getElementById('gate-unlock');
  let gate_is_opening = false;
  let scroll_position = 0;

  function preventGateScroll(event) {
    if (gate_is_opening) return;
    event.preventDefault();
  }

  function preventGateKeys(event) {
    if (gate_is_opening) return;

    const scroll_keys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', ' ',
    ];

    if (scroll_keys.includes(event.key)) {
      event.preventDefault();
    }
  }

  function lockPageScroll() {
    scroll_position = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('gate-locked');
    document.body.classList.add('gate-locked');
    document.body.style.top = `-${scroll_position}px`;
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove('gate-locked');
    document.body.classList.remove('gate-locked');
    document.body.style.top = '';
    document.removeEventListener('touchmove', preventGateScroll);
    document.removeEventListener('wheel', preventGateScroll);
    document.removeEventListener('keydown', preventGateKeys);
    window.scrollTo(0, scroll_position);
  }

  if (heart_gate) {
    lockPageScroll();
    document.addEventListener('touchmove', preventGateScroll, { passive: false });
    document.addEventListener('wheel', preventGateScroll, { passive: false });
    document.addEventListener('keydown', preventGateKeys);
  }

  function openHeartGate() {
    if (!heart_gate || gate_is_opening) return;

    gate_is_opening = true;
    unlockPageScroll();
    heart_gate.classList.add('heart-gate--opening');

    const lock_icon = heart_gate.querySelector('.heart-gate__lock-icon');
    if (lock_icon) {
      lock_icon.innerHTML = `
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.75"/>
        <path d="M12 15v2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      `;
    }

    const unlock_text = heart_gate.querySelector('.heart-gate__unlock-text');
    if (unlock_text) {
      unlock_text.textContent = 'Opening...';
    }

    if (gate_unlock) {
      gate_unlock.disabled = true;
    }

    setTimeout(() => {
      heart_gate.classList.add('heart-gate--hidden');
      heart_gate.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        heart_gate.remove();
      }, 400);
    }, 1200);
  }

  if (gate_unlock) {
    gate_unlock.addEventListener('click', openHeartGate);
  }

  /* ===== Cursor glow (desktop only) ===== */
  const cursor_glow = document.querySelector('.cursor-glow');
  if (cursor_glow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (event) => {
      cursor_glow.style.left = event.clientX + 'px';
      cursor_glow.style.top = event.clientY + 'px';
    });
  }

  /* ===== Scroll reveal ===== */
  const reveal_elements = document.querySelectorAll('.reveal');
  const reveal_observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveal_elements.forEach((element) => reveal_observer.observe(element));

  /* ===== Playful "No" button ===== */
  const btn_no = document.getElementById('btn-no');
  const btn_yes = document.getElementById('btn-yes');
  const no_hint = document.getElementById('no-hint');
  const no_button_zone = document.getElementById('no-button-zone');
  let no_click_count = 0;

  const no_messages = [
    'Are you sure? 🥺',
    'Pretty please?',
    'My heart says yes!',
    'Try again... 💕',
    'You know you want to 😊',
  ];

  function showNoHint() {
    if (!no_hint) return;

    no_hint.hidden = false;
    no_hint.textContent = no_messages[
      Math.min(no_click_count - 1, no_messages.length - 1)
    ];
  }

  function moveNoButton() {
    if (!btn_no || !no_button_zone) return;

    const zone_rect = no_button_zone.getBoundingClientRect();
    const btn_rect = btn_no.getBoundingClientRect();
    const padding = 4;
    const max_x = zone_rect.width - btn_rect.width - padding * 2;
    const max_y = zone_rect.height - btn_rect.height - padding * 2;

    const random_x = padding + Math.random() * Math.max(max_x, 0);
    const random_y = padding + Math.random() * Math.max(max_y, 0);

    btn_no.style.position = 'absolute';
    btn_no.style.left = random_x + 'px';
    btn_no.style.top = random_y + 'px';
  }

  function handleNoPress(event) {
    event.preventDefault();
    no_click_count += 1;
    moveNoButton();
    showNoHint();

    if (btn_yes && no_click_count >= 3) {
      btn_yes.style.transform = 'scale(1.08)';
      btn_yes.textContent = 'Yes! Please? 💗';
    }
  }

  if (btn_no) {
    btn_no.addEventListener('mouseenter', () => {
      if (window.matchMedia('(pointer: fine)').matches) {
        moveNoButton();
      }
    });

    let touch_handled = false;

    btn_no.addEventListener('touchend', (event) => {
      touch_handled = true;
      handleNoPress(event);
    });

    btn_no.addEventListener('click', (event) => {
      if (touch_handled) {
        touch_handled = false;
        return;
      }

      handleNoPress(event);
    });
  }

  /* ===== Confetti celebration ===== */
  const canvas = document.getElementById('confetti');
  const celebration = document.getElementById('celebration');
  const question_section = document.getElementById('question');
  let confetti_active = false;
  let animation_id = null;

  const confetti_colors = [
    '#f43f5e', '#fb7185', '#fda4b8', '#fecdd9',
    '#fce7f3', '#d4a574', '#fff5f7',
  ];

  const confetti_pieces = [];

  function createConfettiPiece() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      color: confetti_colors[Math.floor(Math.random() * confetti_colors.length)],
      speed_y: Math.random() * 3 + 2,
      speed_x: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotation_speed: Math.random() * 10 - 5,
      shape: Math.random() > 0.5 ? 'heart' : 'circle',
    };
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const top_curve_height = size * 0.3;
    ctx.moveTo(0, top_curve_height);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, top_curve_height);
    ctx.bezierCurveTo(
      -size / 2, (size + top_curve_height) / 2,
      0, size * 0.75,
      0, size
    );
    ctx.bezierCurveTo(
      0, size * 0.75,
      size / 2, (size + top_curve_height) / 2,
      size / 2, top_curve_height
    );
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, top_curve_height);
    ctx.fill();
    ctx.restore();
  }

  function animateConfetti() {
    if (!canvas || !confetti_active) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti_pieces.forEach((piece, index) => {
      piece.y += piece.speed_y;
      piece.x += piece.speed_x;
      piece.rotation += piece.rotation_speed;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;

      if (piece.shape === 'heart') {
        drawHeart(ctx, 0, 0, piece.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (piece.y > canvas.height + 20) {
        confetti_pieces.splice(index, 1);
      }
    });

    if (confetti_pieces.length < 150) {
      confetti_pieces.push(createConfettiPiece());
    }

    animation_id = requestAnimationFrame(animateConfetti);
  }

  function startCelebration() {
    if (!canvas || !celebration) return;

    confetti_active = true;
    resizeCanvas();

    for (let i = 0; i < 100; i++) {
      const piece = createConfettiPiece();
      piece.y = Math.random() * canvas.height;
      confetti_pieces.push(piece);
    }

    animateConfetti();

    if (question_section) {
      question_section.style.display = 'none';
    }

    celebration.hidden = false;
    celebration.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (btn_yes) {
    btn_yes.addEventListener('click', startCelebration);
  }

  window.addEventListener('resize', resizeCanvas);

  /* ===== Floating background hearts ===== */
  function spawnHeart() {
    const hearts_bg = document.querySelector('.hearts-bg');
    if (!hearts_bg) return;

    const heart = document.createElement('span');
    heart.textContent = ['💕', '💖', '💗', '✨', '🌸'][Math.floor(Math.random() * 5)];
    heart.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      bottom: -30px;
      font-size: ${Math.random() * 16 + 12}px;
      opacity: 0;
      pointer-events: none;
      animation: rise ${Math.random() * 4 + 6}s ease-in forwards;
    `;
    hearts_bg.appendChild(heart);

    setTimeout(() => heart.remove(), 10000);
  }

  const rise_style = document.createElement('style');
  rise_style.textContent = `
    @keyframes rise {
      0% { opacity: 0; transform: translateY(0) rotate(0deg); }
      10% { opacity: 0.5; }
      90% { opacity: 0.3; }
      100% { opacity: 0; transform: translateY(-100vh) rotate(360deg); }
    }
  `;
  document.head.appendChild(rise_style);

  const heart_interval = setInterval(spawnHeart, 800);

  if (window.matchMedia('(max-width: 768px)').matches) {
    clearInterval(heart_interval);
    setInterval(spawnHeart, 2000);
  }

  /* ===== Subtle parallax on scrapbook polaroids ===== */
  const scrapbook_stage = document.querySelector('.scrapbook-stage');
  const polaroids = document.querySelectorAll('.polaroid');

  if (scrapbook_stage && polaroids.length && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('scroll', () => {
      const rect = scrapbook_stage.getBoundingClientRect();
      const center_offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;

      polaroids.forEach((polaroid, index) => {
        const direction = index === 0 ? -1 : 1;
        const shift = center_offset * 12 * direction;
        polaroid.style.transform = `translateY(${shift}px) rotate(${index === 0 ? -2 : 4}deg)`;
      });
    }, { passive: true });
  }
})();
