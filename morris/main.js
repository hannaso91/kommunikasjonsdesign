(function(){
  const book = document.getElementById('book');
  const pages = [...book.querySelectorAll('.page')];

  // Legg de øverste sidene "øverst" i stakken
  pages.forEach((p,i)=> p.style.zIndex = String(1000 - i));

  let currentIndex = 0;
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const status = document.getElementById('status');

  const mq = matchMedia('(max-width: 800px)');
  const isSingle = () => mq.matches;

  // Sjekk om enhet har touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 🛑 Anti-dobbel-klikking: cooldown mellom flips
  let lastFlipTime = 0;
  const FLIP_COOLDOWN = 350; // ms

  function canFlip(){
    const now = Date.now();
    if (now - lastFlipTime < FLIP_COOLDOWN) {
      return false;
    }
    lastFlipTime = now;
    return true;
  }

  function updateMode(){
    book.classList.toggle('single', isSingle());
    applySingleVisibility();
  }

  function updateStatus(){
    const total = pages.length;
    status.textContent = `Side ${currentIndex+1} av ${total}`;
  }

  function applySingleVisibility(){
    if(!isSingle()){
      pages.forEach(p=> p.classList.remove('is-hidden'));
      return;
    }
    pages.forEach((p,i)=> p.classList.toggle('is-hidden', i !== currentIndex));
  }

  function flipForward(){
    if(!canFlip()) return;              // ⬅️ Ny beskyttelse
    if(currentIndex >= pages.length-1) return;

    const page = pages[currentIndex];
    page.classList.add('flipped');
    page.style.zIndex = String(2000 + currentIndex);

    currentIndex++;
    updateStatus();
    applySingleVisibility();
  }

  function flipBack(){
    if(!canFlip()) return;              // ⬅️ Ny beskyttelse
    if(currentIndex <= 0) return;

    const prevPage = pages[currentIndex-1];
    prevPage.classList.remove('flipped');
    prevPage.style.zIndex = String(1000 - (currentIndex-1));

    currentIndex--;
    updateStatus();
    applySingleVisibility();
  }

  // Knappene – funker både på desktop og mobil
  nextBtn.addEventListener('click', flipForward);
  prevBtn.addEventListener('click', flipBack);

  // Piltaster på tastatur (desktop)
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') flipForward();
    if(e.key === 'ArrowLeft') flipBack();
  });

  function addDragHandlers(page, index){
    // ❗ Skru helt av dra-blading på touch-enheter (mobil/nettbrett)
    if (isTouchDevice) return;

    let startX = null;
    let rect = null;
    let dragging = false;

    const down = (clientX)=>{
      startX = clientX;
      rect = page.getBoundingClientRect();
      dragging = true;
      page.classList.add('dragging');
    };

    const move = (clientX)=>{
      if(!dragging || index !== currentIndex) return;
      const dx = Math.min(Math.max(startX - clientX, 0), rect.width);
      const angle = -180 * (dx / rect.width);
      page.style.transform = `rotateY(${angle}deg)`;
      const inner = page.querySelector('.inner');
      if(inner){
        inner.style.transform = `rotateY(${ -angle }deg) translateZ(0)`;
      }
    };

    const up = (clientX)=>{
      if(!dragging || index !== currentIndex) return;
      const dx = Math.min(Math.max(startX - clientX, 0), rect.width);
      const shouldFlip = dx > rect.width * 0.45;

      page.classList.remove('dragging');
      page.style.transform = '';
      const inner = page.querySelector('.inner');
      if(inner){ inner.style.transform = ''; }

      dragging = false;
      if(shouldFlip){
        flipForward(); // går gjennom canFlip()
      }
    };

    // Kun mus-drag (desktop)
    page.addEventListener('mousedown', (e)=>{
      if(e.button!==0 || index !== currentIndex) return;
      const x = e.offsetX;
      if(x < page.clientWidth - 80) return;
      down(e.clientX);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e)=> move(e.clientX));
    document.addEventListener('mouseup', (e)=> up(e.clientX));
  }

  pages.forEach((p,i)=> addDragHandlers(p,i));

  updateMode();
  updateStatus();
  mq.addEventListener('change', updateMode);
})();
