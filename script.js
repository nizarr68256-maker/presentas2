/* =====================================================
   PRESENTASI IPA — script.js
   Kontrol perpindahan slide sepenuhnya menggunakan
   JavaScript (bukan scroll).
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------
     NAVIGASI SLIDE
  ----------------------------------------------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;

  const progressFill = document.querySelector('.progress-fill');
  const progressMarker = document.querySelector('.progress-marker');
  const progressLabels = document.querySelectorAll('.progress-step-label');

  const nextTriggers = document.querySelectorAll('[data-next]');
  const gotoTriggers = document.querySelectorAll('[data-goto]');

  const floatPrevBtn = document.getElementById('floatPrevBtn');
  const floatNextBtn = document.getElementById('floatNextBtn');

  // Index slide yang berisi diagram "Bagaimana Hewan Berkembang".
  // Dihitung otomatis dari DOM, jadi tetap benar walau urutan slide
  // berubah di kemudian hari.
  const flowSlideIndex = slides.findIndex(slide => slide.querySelector('.hewan-flow-slide'));

  let currentSlide = 0;

  function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    // Tandai apakah perpindahan ini BENAR-BENAR masuk ke slide diagram
    // (dari slide lain menuju slide 4), bukan sekadar showSlide()
    // dipanggil ulang untuk slide yang sama.
    const isEnteringFlowSlide =
      flowSlideIndex !== -1 &&
      index === flowSlideIndex &&
      currentSlide !== flowSlideIndex;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });

    currentSlide = index;
    updateProgress();
    updateFloatingNav();

    // PENTING (perbaikan bug flicker):
    // Sebelumnya restartActiveFlowScene() dipanggil di SETIAP
    // perpindahan slide apa pun, termasuk slide 1 <-> 2 <-> 3 yang
    // tidak berhubungan dengan diagram. Itu membuat browser meng-clone
    // ulang SVG besar + memaksa reflow (getBoundingClientRect) pada
    // setiap klik navigasi, tepat saat animasi transisi slide berjalan
    // — itulah yang terlihat seperti "kedipan/refresh" layar.
    // Sekarang restart HANYA terjadi saat benar-benar masuk ke slide
    // diagram, sehingga slide lain berpindah mulus tanpa beban ekstra.
    if (isEnteringFlowSlide) {
      restartActiveFlowScene();
    }
  }
  const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60; // Jumlah kunang-kunang / spora

// Set ukuran canvas full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Posisi kursor mouse
const mouse = {
  x: null,
  y: null,
  radius: 150 // Jarak interaksi dengan partikel
};

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Class Partikel Spora/Kunang-kunang
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1.5; // Ukuran partikel
    this.speedX = (Math.random() - 0.5) * 0.8; // Kecepatan gerak X
    this.speedY = (Math.random() - 0.5) * 0.8; // Kecepatan gerak Y
    
    // Warna gabungan Hijau Spora & Biru Neon
    const colors = ['rgba(74, 222, 128, ', 'rgba(56, 189, 248, ', 'rgba(167, 139, 250, '];
    this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.6 + 0.2;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Efek redup-terang (kelap-kelip bernapas)
    this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.01;
    if (this.alpha <= 0.1) this.alpha = 0.1;
    if (this.alpha >= 0.8) this.alpha = 0.8;

    // Efek saat mendekati kursor mouse (partikel agak menjauh pelan)
    if (mouse.x && mouse.y) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * 3;
        this.y -= (dy / distance) * force * 3;
      }
    }

    // Jika keluar layar, munculkan lagi dari sisi lain
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    
    // Efek Cahaya / Glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.colorBase + '1)';
    ctx.fillStyle = this.colorBase + this.alpha + ')';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow biar ga berat
  }
}

// Inisialisasi Partikel
function init() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

// Loop Animasi
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

init();
animate();


  function updateProgress() {
    if (totalSlides <= 1) return;

    const percentage = (currentSlide / (totalSlides - 1)) * 100;

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressMarker) progressMarker.style.left = `${percentage}%`;

    progressLabels.forEach(label => {
      const labelIndex = parseInt(label.getAttribute('data-label-for'), 10);
      label.style.color = labelIndex === currentSlide
        ? 'var(--color-primary-dark)'
        : 'var(--color-text-soft)';
    });
  }

  /* -----------------------------------------------
     TOMBOL FLOATING PINDAH SLIDE (▲ / ▼)
  ----------------------------------------------- */
  function updateFloatingNav() {
    if (floatPrevBtn) floatPrevBtn.disabled = currentSlide <= 0;
    if (floatNextBtn) floatNextBtn.disabled = currentSlide >= totalSlides - 1;
  }

  if (floatPrevBtn) {
    floatPrevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
    });
  }

  if (floatNextBtn) {
    floatNextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
    });
  }

/* -----------------------------------------------
     TOMBOL PINDAH BAB (tengah kiri, ‹ ›)
     Masing-masing tombol otomatis tersembunyi jika
     atribut data-prev-chapter / data-next-chapter kosong.
  ----------------------------------------------- */
  function setupChapterButton(id, attr) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const url = btn.getAttribute(attr);
    if (!url || url.trim() === '') {
      btn.classList.add('is-hidden');
    }
  }

  setupChapterButton('chapterPrevBtn', 'data-prev-chapter');
  setupChapterButton('chapterNextBtn', 'data-next-chapter');

  /* -----------------------------------------------
     TOMBOL NEXT/PREV BAWAAN TIAP SLIDE (data-next / data-goto)
  ----------------------------------------------- */
  nextTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
    });
  });

  gotoTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIndex = parseInt(btn.getAttribute('data-goto'), 10);
      showSlide(targetIndex);
    });
  });

  /* -----------------------------------------------
     SLIDE 3 — TAB PERBANDINGAN BERKEMBANG BIAK
  ----------------------------------------------- */
  const compareBtns = document.querySelectorAll('[data-compare-btn]');
  const comparePanels = document.querySelectorAll('.hewan-compare-panel');

  compareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');

      compareBtns.forEach(b => b.classList.remove('hewan-compare-btn--active'));
      btn.classList.add('hewan-compare-btn--active');

      comparePanels.forEach(panel => {
        panel.classList.toggle('hewan-compare-panel--active', panel.getAttribute('data-panel') === target);
      });
    });
  });

  /* -----------------------------------------------
     SLIDE 4 — BAGAIMANA HEWAN BERKEMBANG
     Diagram circular + panel penjelasan.
  ----------------------------------------------- */
  const flowData = {
    tanpa: {
      title: 'Tanpa Metamorfosis (Ametamorfosis)',
      desc: 'Tanpa metamorfosis atau ametamorfosis adalah proses pertumbuhan hewan tanpa mengalami perubahan bentuk tubuh yang berarti sejak lahir atau menetas hingga dewasa. Anak hewan sudah memiliki bentuk yang hampir sama dengan induknya, hanya berukuran lebih kecil. Seiring waktu, hewan tersebut hanya mengalami pertambahan ukuran, berat, dan kematangan organ tanpa melalui tahap larva, nimfa, atau pupa..',
      stages: [
        'Telur menetas menjadi anak hewan',
        'Anak hewan tumbuh membesar',
        'Berkembang menjadi hewan dewasa'
      ],
      examples: ['Ayam', 'Itik', 'Burung']
    },
    sempurna: {
      title: 'Metamorfosis Sempurna',
      desc: 'Metamorfosis sempurna adalah proses perkembangan hewan yang mengalami perubahan bentuk tubuh secara total dari awal hingga dewasa. Setiap tahap memiliki bentuk dan fungsi yang berbeda. Hewan akan melalui empat tahap, yaitu telur, larva, pupa (kepompong), dan imago (dewasa). Perubahan yang terjadi sangat jelas sehingga bentuk larva sama sekali berbeda dengan hewan dewasanya..',
      stages: [
        'Telur diletakkan di tempat aman',
        'Menetas menjadi larva (ulat)',
        'Larva membentuk kepompong (pupa)',
        'Kepompong terbuka menjadi kupu-kupu (imago)'
      ],
      examples: ['Kupu-kupu', 'Nyamuk', 'Lalat', 'Lebah']
    },
    tidak: {
      title: 'Metamorfosis Tidak Sempurna',
      desc: 'Metamorfosis tidak sempurna adalah proses perkembangan hewan yang mengalami perubahan bentuk secara bertahap, tetapi tidak melalui fase pupa atau kepompong. Setelah telur menetas, hewan menjadi nimfa, yaitu bentuk muda yang sudah menyerupai hewan dewasa, tetapi ukurannya lebih kecil, belum memiliki organ reproduksi yang sempurna, dan pada beberapa hewan belum memiliki sayap yang berkembang penuh. Nimfa akan mengalami beberapa kali pergantian kulit hingga menjadi hewan dewasa (imago)..',
      stages: [
        'Telur menetas menjadi nimfa',
        'Nimfa berganti kulit beberapa kali sambil tumbuh',
        'Nimfa berkembang menjadi hewan dewasa (imago)'
      ],
      examples: ['Belalang', 'Kecoa', 'Capung', 'Jangkrik']
    }
  };

  const flowInfo = document.querySelector('.hewan-flow-info');
  const flowDiagram = document.querySelector('.hewan-flow-diagram');

  // Restart TOTAL: clone SVG scene dan ganti elemen lama dengan yang baru.
  // Ini menjamin SEMUA animasi (CSS maupun SMIL animateTransform pada
  // bola/ring/orbit-dot) benar-benar mulai dari 0 setiap kali scene
  // ditampilkan.
  function restartFlowScene(mode) {
    if (!flowDiagram) return;
    const oldScene = flowDiagram.querySelector(`[data-flow-scene="${mode}"]`);
    if (!oldScene) return;

    const clone = oldScene.cloneNode(true);
    oldScene.replaceWith(clone);

    // Paksa reflow SEBELUM apa pun terjadi lagi, agar animasi CSS
    // benar-benar dimulai ulang dari 0% (bukan hanya "berkedip sekali").
    void clone.getBoundingClientRect();

    // Restart eksplisit setiap <animateTransform> (SMIL).
    clone.querySelectorAll('animateTransform').forEach((anim) => {
      if (typeof anim.beginElement === 'function') {
        try {
          anim.beginElement();
        } catch (e) {
          // Diamkan jika browser tidak mendukung beginElement()
        }
      }
    });

    flowDiagram.querySelectorAll('.hewan-flow-scene').forEach(scene => {
      scene.classList.toggle('hewan-flow-scene--active', scene.getAttribute('data-flow-scene') === mode);
    });
  }

  function restartActiveFlowScene() {
    const activeScene = flowDiagram ? flowDiagram.querySelector('.hewan-flow-scene--active') : null;
    if (activeScene) {
      restartFlowScene(activeScene.getAttribute('data-flow-scene'));
    }
  }

  function setFlowMode(mode) {
    const data = flowData[mode];
    if (!data) return;

    document.querySelectorAll('[data-flow-target]').forEach(btn => {
      btn.classList.toggle('hewan-flow-menu-btn--active', btn.getAttribute('data-flow-target') === mode);
    });

    restartFlowScene(mode);

    if (flowInfo) {
      flowInfo.querySelector('[data-flow-field="title"]').textContent = data.title;
      flowInfo.querySelector('[data-flow-field="desc"]').textContent = data.desc;

      const stagesEl = flowInfo.querySelector('[data-flow-field="stages"]');
      stagesEl.innerHTML = data.stages.map(s => `<li>${s}</li>`).join('');

      const examplesEl = flowInfo.querySelector('[data-flow-field="examples"]');
      examplesEl.innerHTML = data.examples.map(e => `<li>${e}</li>`).join('');
    }
  }

  document.querySelectorAll('[data-flow-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      setFlowMode(btn.getAttribute('data-flow-target'));
    });
  });

  if (document.querySelector('[data-flow-target]')) {
    setFlowMode('tanpa');
  }

  /* -----------------------------------------------
     INISIALISASI AWAL
  ----------------------------------------------- */
  updateProgress();
  updateFloatingNav();

});

/* =====================================================
   TUMBUHAN.HTML — SLIDE 10 : "BIJI MENJADI TUMBUHAN"
   Listener terpisah, hanya aktif jika elemen #s10Sim ada
   di halaman (jadi tidak memengaruhi index.html / hewan.html).
   Tidak autoplay — fase hanya berubah lewat klik pengguna
   pada slider, dot, atau nama fase.
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const sim = document.getElementById('s10Sim');
  if (!sim) return;

  const info = document.getElementById('s10Info');
  const fill = document.getElementById('s10Fill');
  const knob = document.getElementById('s10Knob');
  const dots = Array.from(document.querySelectorAll('.s10-dot'));
  const labelBtns = Array.from(document.querySelectorAll('.s10-label-btn'));

  const phases = ['semen', 'germinatio', 'plantula', 'juvenile', 'adult'];

  const phaseData = {
    semen: {
      tag: 'SEMEN',
      subtitle: 'Biji',
      desc: 'Biji mengandung embrio tumbuhan serta cadangan makanan yang akan digunakan sebagai sumber energi awal sebelum tumbuhan mampu berfotosintesis sendiri.',
      points: ['Mengandung embrio', 'Memiliki cadangan makanan', 'Akan tumbuh jika syarat terpenuhi']
    },
    germinatio: {
      tag: 'GERMINATIO',
      subtitle: 'Perkecambahan',
      desc: 'Perkecambahan adalah proses awal pertumbuhan biji menjadi tumbuhan baru, ditandai dengan pecahnya kulit biji dan munculnya akar pertama (radikula).',
      points: ['Membutuhkan air', 'Membutuhkan oksigen', 'Membutuhkan suhu yang sesuai']
    },
    plantula: {
      tag: 'PLANTULA',
      subtitle: 'Kecambah',
      desc: 'Pada tahap kecambah, kotiledon membuka dan daun pertama muncul sehingga tumbuhan mulai melakukan fotosintesis untuk memenuhi kebutuhan energinya sendiri.',
      points: ['Daun pertama terbentuk', 'Fotosintesis mulai berlangsung', 'Cadangan makanan mulai habis digunakan']
    },
    juvenile: {
      tag: 'JUVENILE PLANT',
      subtitle: 'Tanaman Muda',
      desc: 'Tanaman muda mengalami pertumbuhan yang cepat — batang bertambah tinggi, jumlah daun bertambah, dan sistem akar semakin berkembang.',
      points: ['Batang memanjang', 'Daun bertambah', 'Pertumbuhan berlangsung cepat']
    },
    adult: {
      tag: 'ADULT PLANT',
      subtitle: 'Tanaman Dewasa',
      desc: 'Tanaman dewasa telah memiliki organ tubuh yang lengkap dan siap menghasilkan bunga sebagai alat perkembangbiakan generatif.',
      points: ['Organ tumbuhan lengkap', 'Siap menghasilkan bunga', 'Siap berkembang biak']
    }
  };

  let currentPhase = 'semen';
  let fadeTimeout = null;

  function renderInfo(phase) {
    const data = phaseData[phase];
    if (!data || !info) return;

    info.querySelector('[data-field="tag"]').textContent = data.tag;
    info.querySelector('[data-field="subtitle"]').textContent = data.subtitle;
    info.querySelector('[data-field="desc"]').textContent = data.desc;
    info.querySelector('[data-field="points"]').innerHTML =
      data.points.map(p => `<li>${p}</li>`).join('');
  }

  function setPhase(phase) {
    if (!phases.includes(phase) || phase === currentPhase) return;
    currentPhase = phase;

    const index = phases.indexOf(phase);
    const percentage = (index / (phases.length - 1)) * 100;

    // Simulasi: cukup ganti atribut, CSS yang menangani transisi
    // opacity + transform (~500ms) untuk setiap bagian tanaman.
    sim.setAttribute('data-phase', phase);

    // Slider: fill & knob bergerak smooth mengikuti transisi CSS.
    if (fill) fill.style.width = `${percentage}%`;
    if (knob) knob.style.left = `${percentage}%`;

    dots.forEach(dot => {
      dot.classList.toggle('is-active', dot.getAttribute('data-phase') === phase);
    });
    labelBtns.forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-phase') === phase);
    });

    // Materi: fade out singkat, ganti teks, lalu fade in.
    if (info) {
      clearTimeout(fadeTimeout);
      info.classList.add('is-fading');
      fadeTimeout = setTimeout(() => {
        renderInfo(phase);
        info.classList.remove('is-fading');
      }, 220);
    }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => setPhase(dot.getAttribute('data-phase')));
  });

  labelBtns.forEach(btn => {
    btn.addEventListener('click', () => setPhase(btn.getAttribute('data-phase')));
  });

  // Klik langsung di sepanjang track juga memindahkan fase terdekat.
  const track = document.querySelector('.s10-track');
  if (track) {
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const nearestIndex = Math.round(ratio * (phases.length - 1));
      setPhase(phases[nearestIndex]);
    });
  }

  // Inisialisasi tampilan awal (fase "semen") tanpa animasi fade.
  renderInfo(currentPhase);
});

/* =====================================================
   TUMBUHAN.HTML — SLIDE 11 : "PERTUMBUHAN PRIMER & SEKUNDER"
   (REDESAIN #2 — popup kembali dekat hotspot)

   Listener terpisah, hanya aktif jika elemen #s11Scene ada di
   halaman (tidak memengaruhi slide/halaman lain). Panel kiri
   bersifat statis (tidak disentuh JS ini sama sekali). Memilih
   hotspot membuka popup annotation yang sudah diposisikan lewat
   CSS tepat di dekat hotspot tersebut (leader line ikut karena
   posisinya presisi mengikuti hotspot), sekaligus menyalakan
   highlight pada bagian tanaman terkait. Hanya satu popup yang
   terbuka dalam satu waktu.
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.getElementById('s11Scene');
  if (!scene) return;

  const hotspots = Array.from(scene.querySelectorAll('.s11-hotspot'));
  const popups = Array.from(scene.querySelectorAll('.s11-popup'));
  const parts = Array.from(scene.querySelectorAll('[data-part]'));

  let activeHotspot = null;

  function closeAllPopups() {
    popups.forEach(p => p.classList.remove('is-open'));
  }

  function clearGlow() {
    parts.forEach(p => p.classList.remove('is-glow'));
  }

  function selectHotspot(name) {
    if (!name) return;

    hotspots.forEach(h => {
      h.classList.toggle('is-active', h.getAttribute('data-hotspot') === name);
    });

    closeAllPopups();
    clearGlow();

    const popup = scene.querySelector(`.s11-popup[data-popup="${name}"]`);
    if (popup) popup.classList.add('is-open');

    scene.querySelectorAll(`[data-part="${name}"]`).forEach(part => {
      part.classList.add('is-glow');
    });

    activeHotspot = name;
  }

  function closeActive() {
    hotspots.forEach(h => h.classList.remove('is-active'));
    closeAllPopups();
    clearGlow();
    activeHotspot = null;
  }

  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = hotspot.getAttribute('data-hotspot');
      if (activeHotspot === name) {
        closeActive();
      } else {
        selectHotspot(name);
      }
    });
  });

  popups.forEach(popup => {
    const closeBtn = popup.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeActive();
      });
    }
    // Klik di dalam popup tidak menutupnya lewat listener luar.
    popup.addEventListener('click', (e) => e.stopPropagation());
  });

  // Klik di luar hotspot/popup menutup popup yang sedang terbuka.
  document.addEventListener('click', () => {
    if (activeHotspot) closeActive();
  });

  // Inisialisasi: tampilkan hotspot & popup default (Meristem Apikal
  // Batang pada tanaman primer) tanpa animasi fade tambahan — sudah
  // ditandai .is-active / .is-open langsung di HTML, di sini hanya
  // menyalakan highlight bagian tanaman yang sesuai serta mencatat
  // state internal agar toggle berikutnya berjalan benar.
  activeHotspot = 'primer-stem';
  scene.querySelectorAll('[data-part="primer-stem"]').forEach(part => {
    part.classList.add('is-glow');
  });
});
/* =====================================================
   ADDITIONAL DRAGGABLE POPUP FOR SLIDE 11
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const popups = document.querySelectorAll('.s11-popup');

  popups.forEach(popup => {
    const box = popup.querySelector('.s11-popup-box');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Fungsi mulai drag
    const dragStart = (e) => {
      // Hanya mulai jika target bukan tombol close
      if (e.target.closest('[data-close]')) return;
      
      isDragging = true;
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;

      // Ambil posisi saat ini
      const style = window.getComputedStyle(popup);
      initialX = parseInt(style.left, 10);
      initialY = parseInt(style.top, 10);
      
      popup.style.transition = 'none'; // Matikan transisi saat drag
      box.style.cursor = 'grabbing';
    };

    // Fungsi proses drag
    const dragging = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      popup.style.left = (initialX + dx) + 'px';
      popup.style.top = (initialY + dy) + 'px';
    };

    // Fungsi berhenti drag
    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      popup.style.transition = ''; // Kembalikan transisi CSS
      box.style.cursor = '';
    };

    // Event Listeners Mouse
    box.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragging);
    document.addEventListener('mouseup', dragEnd);

    // Event Listeners Touch (Smartboard/TV)
    box.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', dragging, { passive: false });
    document.addEventListener('touchend', dragEnd);
  });
});
/* =====================================================
   FITUR DRAGGABLE UNTUK POPUP SLIDE 11
===================================================== */
function initDraggablePopups() {
  const popups = document.querySelectorAll('.s11-popup');

  popups.forEach(popup => {
    const box = popup.querySelector('.s11-popup-box');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    box.addEventListener('mousedown', startDrag);
    box.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
      if (e.target.closest('[data-close]')) return;
      
      isDragging = true;
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;
      
      initialLeft = popup.offsetLeft;
      initialTop = popup.offsetTop;

      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      if (e.type === 'touchmove') e.preventDefault(); 

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      popup.style.left = `${initialLeft + dx}px`;
      popup.style.top = `${initialTop + dy}px`;
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
    }
  });
}

// Jalankan fungsi draggable
document.addEventListener('DOMContentLoaded', initDraggablePopups);