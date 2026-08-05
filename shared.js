/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('done');
  }, 900);
});

/* ── CURSOR ── */
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx+'px'; cur.style.top = my+'px';
});
document.addEventListener('mousedown', () => {
  document.body.classList.add('click');
  setTimeout(()=>document.body.classList.remove('click'), 200);
});
(function loop(){
  rx += (mx-rx)*.13; ry += (my-ry)*.13;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.work-item,.project-card,.post-card,.skill-card,.testi-card,.exp-row').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('link-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('link-hover'));
});

/* ── NAV SCROLL ── */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

/* ── NAV ACTIVE ── */
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(a => {
  const h = a.getAttribute('href');
  if (h === here || (here === 'index.html' && h === 'index.html')) a.classList.add('active');
});

/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach((e,i) => {
    if(e.isIntersecting){
      setTimeout(() => e.target.classList.add('on'), i * 55);
      obs.unobserve(e.target);
    }
  });
}, {threshold: 0.07, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.r').forEach(el => obs.observe(el));

/* ── ANIMATED COUNTER ── */
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  let start = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = Math.floor(start);
  }, 28);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){ animateCount(e.target); countObs.unobserve(e.target); }
  });
}, {threshold:0.5});
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

/* ── FLOATING PARTICLE CANVAS ── */
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random()*1000, y: Math.random()*600,
      r: Math.random()*1.8+.3, vx: (Math.random()-.5)*.18,
      vy: -Math.random()*.22-.08,
      o: Math.random()*.45+.08, life: Math.random()
    });
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life += .003;
      if(p.y < -4 || p.life > 1){ p.y = H+4; p.x = Math.random()*W; p.life = 0; }
      const alpha = p.o * Math.sin(p.life * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x % W, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(196,169,107,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
initParticles('particles');

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn-gold, .btn-outline, .nav-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top + r.height/2);
    btn.style.transform = `translate(${dx*.12}px, ${dy*.12 - 3}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ── TEXT SCRAMBLE on hover ── */
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el) {
  const orig = el.dataset.text || el.textContent;
  el.dataset.text = orig;
  let frame = 0;
  const interval = setInterval(() => {
    el.textContent = orig.split('').map((c,i) => {
      if(c === ' ') return ' ';
      if(i < frame/2) return orig[i];
      return chars[Math.floor(Math.random()*26)];
    }).join('');
    if(frame++ >= orig.length*2) { el.textContent = orig; clearInterval(interval); }
  }, 28);
}
document.querySelectorAll('[data-scramble]').forEach(el => {
  el.addEventListener('mouseenter', () => scramble(el));
});

/* ── PARALLAX ── */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || .3;
    el.style.transform = `translateY(${sy * speed}px)`;
  });
}, {passive:true});
