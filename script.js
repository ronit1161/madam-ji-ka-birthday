(function(){
  const TOTAL = 11;
  let current = 0;
  let locked = false;

  const stage = document.getElementById('stage');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  function updateNav(){
    prevBtn.classList.toggle('hidden', current === 0);
    nextBtn.classList.toggle('hidden', current === TOTAL - 1);
    nextBtn.textContent = current === 0 ? 'Begin ❤' : 'Next ❤';
  }

  // ─── GOTO ───
  function goTo(idx){
    if(locked || idx < 0 || idx >= TOTAL) return;
    locked = true;
    current = idx;
    stage.style.transform = `translateX(${-current * 100}vw)`;
    updateNav();
    setTimeout(() => locked = false, 580);
  }

  // ─── BUTTONS ───
  nextBtn.addEventListener('click', () => goTo(current + 1));
  prevBtn.addEventListener('click', () => goTo(current - 1));

  // ─── TAP LANDING ───
  document.getElementById('scene-0').addEventListener('click', () => {
    if(current === 0) goTo(1);
  });

  // ─── SWIPE / DRAG ───
  let touchStartX = 0, touchStartY = 0, dragging = false;
  let mouseStartX = 0, isDragging = false;

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    dragging = true;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if(!dragging) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if(Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', e => {
    if(!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 40) return;
    if(dx < 0) goTo(current + 1);
    else goTo(current - 1);
  });

  // mouse drag (desktop)
  document.addEventListener('mousedown', e => {
    mouseStartX = e.clientX; 
    isDragging = true;
  });

  document.addEventListener('mouseup', e => {
    if(!isDragging) return; 
    isDragging = false;
    const dx = e.clientX - mouseStartX;
    if(Math.abs(dx) < 50) return;
    if(dx < 0) goTo(current + 1);
    else goTo(current - 1);
  });

  // keyboard
  document.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight') goTo(current + 1);
    if(e.key === 'ArrowLeft')  goTo(current - 1);
  });

  updateNav();

  // ─── STARS CANVAS ───
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for(let i = 0; i < 120; i++){
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawStars(t){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,220,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  drawStars(0);

  // ─── LANDING PETALS ───
  const scene0 = document.getElementById('scene-0');
  const petalChars = ['❤','✿','✦','·','˚'];

  for(let i = 0; i < 14; i++){
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = petalChars[i % petalChars.length];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.fontSize = (0.6 + Math.random() * 0.8) + 'rem';
    p.style.color = i % 3 === 0 
      ? 'rgba(201,168,76,0.5)' 
      : 'rgba(232,180,184,0.4)';
    scene0.appendChild(p);
  }

})();