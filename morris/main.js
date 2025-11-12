(function(){
  const book = document.getElementById('book');
  const pages = [...book.querySelectorAll('.page')];

  pages.forEach((p,i)=> p.style.zIndex = String(1000 - i));

  let currentIndex = 0;
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const status = document.getElementById('status');

  const mq = matchMedia('(max-width: 800px)');
  const isSingle = () => mq.matches;

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
    if(currentIndex >= pages.length-1) return;
    const page = pages[currentIndex];
    page.classList.add('flipped');
    page.style.zIndex = String(2000 + currentIndex);
    currentIndex++;
    updateStatus();
    applySingleVisibility();
  }

  function flipBack(){
    if(currentIndex <= 0) return;
    const prevPage = pages[currentIndex-1];
    prevPage.classList.remove('flipped');
    prevPage.style.zIndex = String(1000 - (currentIndex-1));
    currentIndex--;
    updateStatus();
    applySingleVisibility();
  }

  nextBtn.addEventListener('click', flipForward);
  prevBtn.addEventListener('click', flipBack);
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') flipForward();
    if(e.key === 'ArrowLeft') flipBack();
  });

  function addDragHandlers(page, index){
    let startX=null, rect=null, dragging=false;
    const down = (clientX)=>{ startX = clientX; rect = page.getBoundingClientRect(); dragging = true; page.classList.add('dragging'); };
    const move = (clientX)=>{
      if(!dragging || index !== currentIndex) return;
      const dx = Math.min(Math.max(startX - clientX, 0), rect.width);
      const angle = -180 * (dx / rect.width);
      page.style.transform = `rotateY(${angle}deg)`;
      const inner = page.querySelector('.inner');
      if(inner){ inner.style.transform = `rotateY(${ -angle }deg) translateZ(0)`; }
    };
    const up = (clientX)=>{
      if(!dragging || index !== currentIndex) return;
      const dx = Math.min(Math.max(startX - clientX, 0), rect.width);
      const shouldFlip = dx > rect.width * 0.45;
      page.classList.remove('dragging');
      page.style.transform = ''; const inner = page.querySelector('.inner'); if(inner){ inner.style.transform=''; }
      dragging = false;
      if(shouldFlip){ flipForward(); }
    };

    page.addEventListener('mousedown', (e)=>{
      if(e.button!==0 || index !== currentIndex) return;
      const x = e.offsetX; if(x < page.clientWidth - 80) return;
      down(e.clientX); e.preventDefault();
    });
    document.addEventListener('mousemove', (e)=> move(e.clientX));
    document.addEventListener('mouseup', (e)=> up(e.clientX));

    page.addEventListener('touchstart', (e)=>{
      if(index !== currentIndex) return;
      const t = e.changedTouches[0];
      const r = page.getBoundingClientRect();
      const x = t.clientX - r.left;
      if(x < page.clientWidth - 80) return;
      down(t.clientX);
    }, {passive:true});
    page.addEventListener('touchmove', (e)=>{ const t = e.changedTouches[0]; move(t.clientX); }, {passive:true});
    page.addEventListener('touchend', (e)=>{ const t = e.changedTouches[0]; up(t.clientX); }, {passive:true});
  }
  pages.forEach((p,i)=> addDragHandlers(p,i));

  updateMode();
  updateStatus();
  mq.addEventListener('change', updateMode);
})();