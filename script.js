/* =========================================================
   script.js  –  Hover-Editor + Navigation + Effekte
   ========================================================= */

/* ---------- 1. Navigation & Modal (index.html + karte.html) ---------- */
const boxWrapper   = document.getElementById('boxWrapper');
const briefWrapper = document.getElementById('briefWrapper');
const rolleWrapper = document.getElementById('rolleWrapper');
const modal        = document.getElementById('modal');
const modalImg     = document.getElementById('modalImage');
const modalClose   = document.getElementById('modalClose');

if (boxWrapper)   boxWrapper.addEventListener('click', () => {
  if (!document.body.classList.contains('edit-mode')) location.href = 'box.html';
});
if (rolleWrapper) rolleWrapper.addEventListener('click', () => {
  if (!document.body.classList.contains('edit-mode')) location.href = 'karte.html';
});
if (briefWrapper && modal && modalImg){
  briefWrapper.addEventListener('click', () => {
    modalImg.src = 'assets/anschreiben.jpg';
    modal.style.display = 'block';
  });
}
if (modal && modalClose){
  modalClose.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

/* ---------- 2. Karten-Hotspots (karte.html) mit Edit-Mode-Abschaltung ---------- */
const wrapper12 = document.getElementById('wrapper12'); // 1.png → rtg.html
const wrapper6  = document.getElementById('wrapper6');  // 2.png → contact.html
const wrapper9  = document.getElementById('wrapper9');  // 3.png → schul.html
const wrapper3  = document.getElementById('wrapper3');  // 4.png → skill.html

function navIfNotEdit(element, target) {
  if (!element) return;
  element.addEventListener('click', () => {
    if (!document.body.classList.contains('edit-mode')) {
      location.href = target;
    }
  });
}

navIfNotEdit(wrapper12, 'rtg.html');
navIfNotEdit(wrapper6,  'contact.html');
navIfNotEdit(wrapper9,  'schul.html');
navIfNotEdit(wrapper3,  'skill.html');

/* ---------- 3. Fade-In der 4 Karten-PNG-Icons ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.png-overlay').forEach((el, i) => {
    setTimeout(() => {
      el.classList.remove('hidden');
      el.classList.add('fade-in');
    }, 200 * i);
  });
});

/* ---------- 4. Zufällige Bounce / Wobble (rtg & skill) ---------- */
function animateRandomIcon() {
  const icons = document.querySelectorAll('.rtg-overlay, .skill-overlay');
  if (!icons.length) return;
  const el  = icons[Math.floor(Math.random() * icons.length)];
  const cls = Math.random() < 0.5 ? 'animate-bounce' : 'animate-wobble';
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}
function loopRandom() {
  if (document.querySelector('.rtg-overlay, .skill-overlay')) {
    animateRandomIcon();
    setTimeout(loopRandom, 800 + Math.random() * 1200);
  }
}
document.addEventListener('DOMContentLoaded', loopRandom);

/* ---------- 5. Mail-Bounce (contact.html) ---------- */
function mailBounce() {
  const m = document.querySelector('.mail-roll');
  if (!m) return;
  m.classList.add('animate-roll');
  m.addEventListener('animationend', () => m.classList.remove('animate-roll'), { once: true });
  setTimeout(mailBounce, 1500 + Math.random() * 1500);
}
document.addEventListener('DOMContentLoaded', mailBounce);

/* ---------- 6. Parallax für schul.html ---------- */
document.addEventListener('mousemove', e => {
  const imgs = document.querySelectorAll('.schul-overlay');
  if (!imgs.length) return;
  const relX = (e.clientX / innerWidth  - 0.5) * 2;
  const relY = (e.clientY / innerHeight - 0.5) * 2;
  imgs.forEach((img, i) => {
    const d = (i + 1) * 2;
    img.style.setProperty('--tx', `${relX * d}px`);
    img.style.setProperty('--ty', `${relY * d}px`);
  });
});

/* ---------- 7. EDIT-MODE: Drag + Resize-Erkennung + Werte-Dump ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // png-wrappers im Edit-Mode als karte-hover markieren
  if (document.body.classList.contains('edit-mode')) {
    document.querySelectorAll('.png-wrapper')
            .forEach(w => w.classList.add('karte-hover'));
  }

  const boxes = document.querySelectorAll('.schul-hover, .karte-hover, .png-wrapper');
  boxes.forEach(box => box.addEventListener('mousedown', onBoxMouseDown));
});

function onBoxMouseDown(e) {
  if (!document.body.classList.contains('edit-mode') || e.target !== this) return;

  const rect     = this.getBoundingClientRect();
  const clickX   = e.clientX - rect.left;
  const clickY   = e.clientY - rect.top;
  const handleSz = 16;

  // Klick auf Resize-Handle? Dann native Resize erlauben
  if (clickX > rect.width - handleSz && clickY > rect.height - handleSz) {
    return; // kein preventDefault -> CSS Resize übernimmt
  }

  // Drag starten
  e.preventDefault();
  const startX    = e.clientX,   startY  = e.clientY;
  const startLeft = rect.left,   startTop = rect.top;

  function onMove(ev) {
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    this.style.left = `${startLeft + dx}px`;
    this.style.top  = `${startTop  + dy}px`;
  }
  const boundOnMove = onMove.bind(this);

  // onUp als Arrow-Funktion bindet automatisch this vom umgebenden Scope
  const onUp = () => {
    document.removeEventListener('mousemove', boundOnMove);
    document.removeEventListener('mouseup',   onUp);

    const r      = this.getBoundingClientRect();
    const top    = (r.top    / innerHeight * 100).toFixed(1);
    const left   = (r.left   / innerWidth  * 100).toFixed(1);
    const width  = (r.width  / innerWidth  * 100).toFixed(1);
    const height = (r.height / innerHeight * 100).toFixed(1);

    console.log(`/* CSS für ${this.classList[1]} */`);
    console.log(`top:${top}%; left:${left}%; width:${width}vw; height:${height}vh;`);
    console.log('---------------------------------------------');
  };

  document.addEventListener('mousemove', boundOnMove);
  document.addEventListener('mouseup',   onUp);
}

// ==== Back-Button automatisch einfügen (außer index & anschreiben) ====
(() => {
  const exceptions = ['/', '/index.html', '/anschreiben.html'];
  const path = window.location.pathname;
  if (exceptions.includes(path)) return;

  // 1) Fullscreen-Back-Image (nur visuell)
  const backImg = document.createElement('img');
  backImg.id = 'backImg';
  backImg.src = 'assets/back.png';
  backImg.alt = 'Zurück';
  backImg.className = 'back-full';
  document.body.appendChild(backImg);

  // 2) Klick-/Hover-Box oben links
  const backBox = document.createElement('div');
  backBox.id = 'backBox';
  backBox.className = 'back-box';
  document.body.appendChild(backBox);

  // 3) Hover-Scaling
  backBox.addEventListener('mouseenter', () => backImg.classList.add('back-scale'));
  backBox.addEventListener('mouseleave', () => backImg.classList.remove('back-scale'));

  // 4) Klick → zurück
  backBox.addEventListener('click', () => window.history.back());
})();

// Pulsier-Effekt für die Karte-Icons (1.png–4.png)
(function() {
  const icons = document.querySelectorAll('.png-overlay');
  if (!icons.length) return;

  function pulse() {
    // Zufälliges Icon auswählen
    const icon = icons[Math.floor(Math.random() * icons.length)];
    // kurz auf 103 % skalieren
    icon.style.transform = 'translate(-50%, -50%) scale(1.03)';
    // nach 300 ms wieder zurücksetzen
    setTimeout(() => {
      icon.style.transform = '';
    }, 300);
    // nächsten Puls in 1–5 Sekunden starten
    setTimeout(pulse, Math.random() * 4000 + 1000);
  }

  // gleich loslegen
  pulse();
})();
