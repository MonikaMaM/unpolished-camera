// =====================================================================
// UNPOLISHED PRESENCE — CAMERA APP
// =====================================================================

(function () {
  'use strict';

  // === STATE ===
  const state = {
    stream: null,
    facingMode: 'environment',
    currentFilm: 'PORTRA_400',
    frameCount: 1,
    capturing: false,
    rendering: false,
    lastCaptureBlob: null,
    lastCaptureUrl: null,
  };

  // === DOM ===
  const $ = (id) => document.getElementById(id);
  const startScreen = $('start-screen');
  const startBtn = $('start-btn');
  const video = $('video');
  const canvas = $('canvas-preview');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const filmStrip = $('film-strip');
  const currentFilmLabel = $('current-film');
  const frameCountLabel = $('frame-count');
  const shutter = $('shutter');
  const flipBtn = $('flip-btn');
  const flash = $('flash');
  const previewScreen = $('preview-screen');
  const previewImage = $('preview-image');
  const previewFilm = $('preview-film');
  const previewNum = $('preview-num');
  const saveBtn = $('save-btn');
  const discardBtn = $('discard-btn');
  const errorMsg = $('error-msg');

  // === FRAMECOUNT PERSISTENCE ===
  try {
    const saved = parseInt(localStorage.getItem('frameCount'), 10);
    if (saved && saved > 0) state.frameCount = saved;
  } catch (e) {}

  function saveFrameCount() {
    try { localStorage.setItem('frameCount', String(state.frameCount)); } catch (e) {}
  }

  function formatFrame(n) {
    return String(n).padStart(3, '0');
  }

  // === FILM STRIP UI ===
  function buildFilmStrip() {
    filmStrip.innerHTML = '';
    FILM_ORDER.forEach((key) => {
      const film = FILMS[key];
      const btn = document.createElement('button');
      btn.className = 'film-tab' + (key === state.currentFilm ? ' active' : '');
      btn.textContent = film.short;
      btn.dataset.film = key;
      btn.addEventListener('click', () => selectFilm(key));
      filmStrip.appendChild(btn);
    });
  }

  function selectFilm(key) {
    state.currentFilm = key;
    currentFilmLabel.textContent = FILMS[key].short;
    document.querySelectorAll('.film-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.film === key);
    });
  }

  // === CAMERA START ===
  async function startCamera() {
    showError('');
    try {
      if (state.stream) {
        state.stream.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        audio: false,
        video: {
          facingMode: state.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      state.stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = state.stream;
      await video.play();

      // Vänta på att video har dimensioner
      await new Promise((resolve) => {
        if (video.videoWidth) return resolve();
        video.onloadedmetadata = () => resolve();
      });

      shutter.disabled = false;
      startRenderLoop();
    } catch (err) {
      console.error(err);
      let msg = 'KAMERAN KUNDE INTE STARTAS';
      if (err.name === 'NotAllowedError') {
        msg = 'KAMERA-ÅTKOMST NEKAD<br><br>Tillåt kameran i Inställningar > Safari > Kamera';
      } else if (err.name === 'NotFoundError') {
        msg = 'INGEN KAMERA HITTADES';
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg = 'KRÄVER HTTPS<br><br>Öppna sidan via HTTPS-URL';
      }
      showError(msg);
    }
  }

  function showError(html) {
    if (!html) {
      errorMsg.classList.remove('show');
      return;
    }
    errorMsg.innerHTML = html;
    errorMsg.classList.add('show');
  }

  // === RENDER LOOP (live preview med filter) ===
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }

  function startRenderLoop() {
    if (state.rendering) return;
    state.rendering = true;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    if (!state.rendering) return;
    if (video.readyState >= 2 && video.videoWidth > 0) {
      drawVideoToCanvas(ctx, canvas, video);
      applyFilmFilter(ctx, canvas, FILMS[state.currentFilm]);
    }
    requestAnimationFrame(renderFrame);
  }

  // Cover-fit: video fyller hela canvas, beskärs proportionellt
  function drawVideoToCanvas(ctx, canvas, video) {
    const cw = canvas.width;
    const ch = canvas.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const canvasAspect = cw / ch;
    const videoAspect = vw / vh;

    let sx, sy, sw, sh;
    if (videoAspect > canvasAspect) {
      // Video bredare — beskär horisontellt
      sh = vh;
      sw = vh * canvasAspect;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      // Video smalare — beskär vertikalt
      sw = vw;
      sh = vw / canvasAspect;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    // Spegelvänd för främre kamera
    if (state.facingMode === 'user') {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, -cw, 0, cw, ch);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
    }
  }

  // === FILM FILTER PIPELINE ===
  // Applicerar: BW→tint→kontrast→saturation→temp/tint→shadow/highlight→rgb shift→halation→vinjett→korn
  function applyFilmFilter(ctx, canvas, film) {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const contrast = film.contrast;
    const saturation = film.saturation;
    const temp = film.temperature;
    const tint = film.tint;
    const shadowLift = film.shadowLift;
    const highlightRoll = film.highlightRoll;
    const rShift = film.rShift;
    const gShift = film.gShift;
    const bShift = film.bShift;

    // Förberäknad LUT för kontrast
    const contrastLUT = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
      let v = (i - 128) * contrast + 128;
      // Shadow lift
      if (i < 80) {
        const t = (80 - i) / 80;
        v += shadowLift * t;
      }
      // Highlight rolloff
      if (i > 180) {
        const t = (i - 180) / 75;
        v -= highlightRoll * t;
      }
      contrastLUT[i] = Math.max(0, Math.min(255, v));
    }

    // Pixel pipeline
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Channel swap för LomoChrome Purple (BEFORE BW conversion)
      if (film.channelSwap === 'purple') {
        // Roterar färgkanalerna: grönt -> lila/magenta, blått -> guld/gul
        // R kanal: blandning av original R + boost från grönt (gröna områden blir purple)
        // G kanal: dämpad
        // B kanal: blandning av blått + grönt (för magenta-effekt på grönt)
        const origR = r;
        const origG = g;
        const origB = b;
        r = origR * 0.7 + origG * 0.55;       // grönt blir rödaktigt/magenta
        g = origG * 0.45 + origB * 0.25;      // dämpa grönt, lite blått in
        b = origB * 0.85 + origG * 0.45;      // grönt blir lite blått (-> magenta/purple)
      }

      // BW conversion
      if (film.bw) {
        const mix = film.bwMix;
        const lum = r * mix.r + g * mix.g + b * mix.b;
        r = g = b = lum;
      }

      // Kontrast + skugga/highlight via LUT
      r = contrastLUT[r];
      g = contrastLUT[g];
      b = contrastLUT[b];

      // Saturation (bara för färgfilm)
      if (!film.bw && saturation !== 1) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum + (r - lum) * saturation;
        g = lum + (g - lum) * saturation;
        b = lum + (b - lum) * saturation;
      }

      // Temperatur, tint, RGB shift — HOPPA ÖVER för BW (annars förstörs gråtonerna)
      if (!film.bw) {
        r += temp;
        b -= temp;
        g -= tint;
        r += rShift;
        g += gShift;
        b += bShift;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    // Korn (random noise per pixel)
    if (film.grain > 0) {
      const grainAmount = film.grain * 255;
      if (film.bw) {
        // För BW: samma värde på alla kanaler för att hålla det svartvitt
        for (let i = 0; i < data.length; i += 4) {
          const n = (Math.random() - 0.5) * grainAmount;
          data[i] = Math.max(0, Math.min(255, data[i] + n));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
        }
      } else {
        // För färg: lite färgvariation i kornet (mer realistiskt)
        for (let i = 0; i < data.length; i += 4) {
          const n = (Math.random() - 0.5) * grainAmount;
          const variation = (Math.random() - 0.5) * grainAmount * 0.3;
          data[i] = Math.max(0, Math.min(255, data[i] + n + variation));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n - variation));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Halation (röd glow runt highlights — appliceras som blur-overlay)
    if (film.halation > 0) {
      applyHalation(ctx, canvas, film.halationColor, film.halation);
    }

    // Vinjett
    if (film.vignette > 0) {
      applyVignette(ctx, canvas, film.vignette);
    }
  }

  function applyHalation(ctx, canvas, color, strength) {
    const w = canvas.width;
    const h = canvas.height;
    // Skapa highlight-mask via temporary canvas
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(canvas, 0, 0);

    // Hämta highlights (luminans > tröskel)
    const tmpData = tctx.getImageData(0, 0, w, h);
    const td = tmpData.data;
    for (let i = 0; i < td.length; i += 4) {
      const lum = 0.299 * td[i] + 0.587 * td[i + 1] + 0.114 * td[i + 2];
      const alpha = Math.max(0, (lum - 200) / 55);
      td[i] = color[0];
      td[i + 1] = color[1];
      td[i + 2] = color[2];
      td[i + 3] = alpha * 255;
    }
    tctx.putImageData(tmpData, 0, 0);

    // Blur via skalning ner+upp (snabbare än CSS filter på canvas)
    const blurCanvas = document.createElement('canvas');
    const scale = 0.06;
    blurCanvas.width = w * scale;
    blurCanvas.height = h * scale;
    const bctx = blurCanvas.getContext('2d');
    bctx.imageSmoothingEnabled = true;
    bctx.imageSmoothingQuality = 'high';
    bctx.drawImage(tmp, 0, 0, blurCanvas.width, blurCanvas.height);

    // Lägg över med screen blend
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = strength;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(blurCanvas, 0, 0, w, h);
    ctx.restore();
  }

  function applyVignette(ctx, canvas, strength) {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    const grad = ctx.createRadialGradient(cx, cy, maxR * 0.55, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${strength})`);

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // === CAPTURE ===
  function capture() {
    if (state.capturing) return;
    if (video.readyState < 2 || !video.videoWidth) return;

    state.capturing = true;

    // Flash-animation
    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');

    // Haptic feedback (om stöd finns)
    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }

    // Rendera full-upplösning till offscreen canvas
    const fullCanvas = document.createElement('canvas');
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Använd canvas-aspekt som vi visar — beskär likadant
    const previewRect = canvas.getBoundingClientRect();
    const previewAspect = previewRect.width / previewRect.height;

    let outW, outH;
    if (vw / vh > previewAspect) {
      outH = vh;
      outW = Math.round(vh * previewAspect);
    } else {
      outW = vw;
      outH = Math.round(vw / previewAspect);
    }

    fullCanvas.width = outW;
    fullCanvas.height = outH;
    const fctx = fullCanvas.getContext('2d', { willReadFrequently: true });

    // Rita video centrerat
    const sx = (vw - outW) / 2;
    const sy = (vh - outH) / 2;

    if (state.facingMode === 'user') {
      fctx.save();
      fctx.scale(-1, 1);
      fctx.drawImage(video, sx, sy, outW, outH, -outW, 0, outW, outH);
      fctx.restore();
    } else {
      fctx.drawImage(video, sx, sy, outW, outH, 0, 0, outW, outH);
    }

    // Applicera samma film-filter
    applyFilmFilter(fctx, fullCanvas, FILMS[state.currentFilm]);

    // Konvertera till blob
    fullCanvas.toBlob((blob) => {
      if (!blob) {
        state.capturing = false;
        return;
      }

      // Cleanup förra URL
      if (state.lastCaptureUrl) URL.revokeObjectURL(state.lastCaptureUrl);

      state.lastCaptureBlob = blob;
      state.lastCaptureUrl = URL.createObjectURL(blob);

      previewImage.src = state.lastCaptureUrl;
      previewFilm.textContent = FILMS[state.currentFilm].short;
      previewNum.textContent = formatFrame(state.frameCount);

      previewScreen.classList.add('show');
      state.capturing = false;
    }, 'image/jpeg', 0.92);
  }

  // === SPARA till Foton ===
  async function savePhoto() {
    if (!state.lastCaptureBlob) return;

    const filename = `unpolished_${FILMS[state.currentFilm].short.toLowerCase().replace(/[^a-z0-9]/g, '')}_${formatFrame(state.frameCount)}.jpg`;

    // Försök Web Share API först (bästa UX på iPhone — öppnar share sheet med "Spara på bilder")
    if (navigator.canShare) {
      try {
        const file = new File([state.lastCaptureBlob], filename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          afterSave();
          return;
        }
      } catch (err) {
        // Användaren avbröt eller stöd saknas — fall through till download
        if (err.name === 'AbortError') return; // Användaren avbröt — gör inget
      }
    }

    // Fallback: download-länk (long-press "Spara på bilder" på iPhone)
    const a = document.createElement('a');
    a.href = state.lastCaptureUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    afterSave();
  }

  function afterSave() {
    state.frameCount++;
    saveFrameCount();
    frameCountLabel.textContent = formatFrame(state.frameCount);
    closePreview();
  }

  function discardPhoto() {
    closePreview();
  }

  function closePreview() {
    previewScreen.classList.remove('show');
    if (state.lastCaptureUrl) {
      URL.revokeObjectURL(state.lastCaptureUrl);
      state.lastCaptureUrl = null;
      state.lastCaptureBlob = null;
    }
    previewImage.src = '';
  }

  // === FLIP CAMERA ===
  async function flipCamera() {
    state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
    await startCamera();
  }

  // === EVENT LISTENERS ===
  startBtn.addEventListener('click', async () => {
    startScreen.classList.add('hidden');
    buildFilmStrip();
    frameCountLabel.textContent = formatFrame(state.frameCount);
    await startCamera();
  });

  shutter.addEventListener('click', capture);
  flipBtn.addEventListener('click', flipCamera);
  saveBtn.addEventListener('click', savePhoto);
  discardBtn.addEventListener('click', discardPhoto);

  // Pinch/swipe för film-byte (vänster/höger swipe på sökaren)
  let touchStartX = null;
  $('viewfinder-container').addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
  }, { passive: true });

  $('viewfinder-container').addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = (e.changedTouches[0].clientX) - touchStartX;
    if (Math.abs(dx) > 60) {
      const idx = FILM_ORDER.indexOf(state.currentFilm);
      let newIdx;
      if (dx < 0) newIdx = (idx + 1) % FILM_ORDER.length;
      else newIdx = (idx - 1 + FILM_ORDER.length) % FILM_ORDER.length;
      selectFilm(FILM_ORDER[newIdx]);
      // Scrolla film-strip till aktiv
      const activeBtn = filmStrip.querySelector('.film-tab.active');
      if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    touchStartX = null;
  }, { passive: true });

  // Stoppa stream när sidan göms
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
      shutter.disabled = true;
    } else if (!document.hidden && !state.stream && !startScreen.classList.contains('hidden')) {
      // Användaren kom tillbaka — startScreen visas redan
    } else if (!document.hidden && !state.stream && startScreen.classList.contains('hidden')) {
      startCamera();
    }
  });

  // Service worker för offline (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
