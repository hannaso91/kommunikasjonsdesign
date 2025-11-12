// Retro segmented loader – følger scroll
(function () {
  const fill  = document.querySelector('.tl-fill');
  const root  = document.querySelector('.top-loader');
  if (!fill || !root) return;

  // Valgfritt: “chunky” steg som matcher segmentene
  const SEGMENTS = 12; // hold lik --segments i CSS

  function setProgress(p) {
    // clamp 0..1
    p = Math.max(0, Math.min(1, p));
    // Snap til segmenter for retro-følelse
    const stepped = Math.round(p * SEGMENTS) / SEGMENTS;
    fill.style.width = (stepped * 100) + '%';
    root.setAttribute('aria-valuenow', String(Math.round(stepped * 100)));
  }

  const useGSAP = !!(window.gsap && window.ScrollTrigger);
  if (useGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => setProgress(self.progress),
      invalidateOnRefresh: true
    });
  } else {
    // Vanilla med requestAnimationFrame
    let ticking = false;
    const compute = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const p = (doc.scrollTop || document.body.scrollTop) / max;
      setProgress(p);
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(compute); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', compute);
    compute();
  }
})();
