(function () {
  var script = document.currentScript;
  var base = script ? new URL('.', script.src) : new URL('./', location.href);
  var sections = ['social-benefits', 'svo', 'africa', 'territorial', 'bpls'];
  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var theme = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var flagImage = new Image();
  var canvas = document.querySelector('.hero-flag canvas');
  var context = canvas && canvas.getContext('2d');
  var frame = 0;

  function asset(name) {
    return new URL(name, base).href;
  }

  function setTheme(nextTheme) {
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('service-theme', theme); } catch (_) {}

    sections.forEach(function (id) {
      var media = document.querySelector('#' + id + ' .section-media');
      if (!media) return;
      var image = media.querySelector('img');
      if (!image) {
        image = document.createElement('img');
        image.alt = '';
        image.decoding = 'async';
        image.loading = 'lazy';
        media.appendChild(image);
      }
      image.classList.remove('is-loaded');
      image.onload = function () { image.classList.add('is-loaded'); };
      image.src = asset('bg-' + id + '-' + (theme === 'dark' ? 'night' : 'day') + '.webp');
      if (image.complete && image.naturalWidth) image.classList.add('is-loaded');
    });

    if (canvas) {
      canvas.removeAttribute('data-loaded');
      flagImage = new Image();
      flagImage.decoding = 'async';
      flagImage.onload = function () {
        canvas.dataset.loaded = 'true';
        drawFlag(performance.now());
      };
      flagImage.src = asset('flag-fabric-' + (theme === 'dark' ? 'night' : 'day') + '.webp');
    }
  }

  function drawFlag(time) {
    if (!canvas || !context || !flagImage.naturalWidth) return;
    var bounds = canvas.getBoundingClientRect();
    var width = Math.max(1, bounds.width);
    var height = Math.max(1, bounds.height);
    var ratio = Math.min(devicePixelRatio || 1, 1.5);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    var imageAspect = flagImage.naturalWidth / flagImage.naturalHeight;
    var canvasAspect = width / height;
    var sx = 0, sy = 0, sw = flagImage.naturalWidth, sh = flagImage.naturalHeight;
    if (imageAspect > canvasAspect) {
      sw = flagImage.naturalHeight * canvasAspect;
      sx = (flagImage.naturalWidth - sw) / 2;
    } else {
      sh = flagImage.naturalWidth / canvasAspect;
      sy = (flagImage.naturalHeight - sh) / 2;
    }
    var amplitude = reducedMotion ? 0 : Math.max(9, Math.min(17, width * 0.008));
    var slice = 4;
    var count = Math.ceil(width / slice);
    var sourceSlice = sw / count;
    var seconds = time / 1000;
    for (var index = 0; index < count; index += 1) {
      var progress = index / Math.max(1, count - 1);
      var phase = progress * Math.PI * 3.35 - seconds * 0.76;
      var wave = Math.sin(phase) * amplitude + Math.sin(phase * 0.56 + seconds * 0.38) * amplitude * 0.34;
      context.drawImage(flagImage, sx + index * sourceSlice, sy, sourceSlice + 0.9, sh, index * slice - 0.6, -28 + wave, Math.min(slice, width - index * slice) + 1.8, height + 56);
    }
    cancelAnimationFrame(frame);
    if (!reducedMotion) frame = requestAnimationFrame(drawFlag);
  }

  document.querySelectorAll('.theme-toggle').forEach(function (button) {
    button.addEventListener('click', function () { setTheme(theme === 'dark' ? 'light' : 'dark'); });
  });
  addEventListener('resize', function () { if (flagImage.naturalWidth) drawFlag(performance.now()); }, { passive: true });
  setTheme(theme);
})();
