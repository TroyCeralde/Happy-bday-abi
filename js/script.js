(() => {
  const bgCanvas = document.getElementById('bgCanvas');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const wishesRoot = document.getElementById('floating-wishes');

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  function resizeCanvas(canvas){
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  resizeCanvas(bgCanvas); resizeCanvas(confettiCanvas);

  const bgCtx = bgCanvas.getContext('2d');
  const confettiCtx = confettiCanvas.getContext('2d');
  bgCtx.scale(dpr,dpr); confettiCtx.scale(dpr,dpr);

  let stars = [];
  let shootingStars = [];

  function rand(min,max){ return Math.random()*(max-min)+min }

  function initStars(){
    stars = [];
    const count = Math.round((window.innerWidth * window.innerHeight) / 6000) + 120;
    for(let i=0;i<count;i++){
      stars.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*1.2+0.2,alpha:Math.random(),twinkle:Math.random()*4})
    }
  }

  function spawnShooting(){
    const y = rand(20, window.innerHeight*0.6);
    const fromX = -50;
    const toX = window.innerWidth + 50;
    shootingStars.push({x:fromX,y:y, vx:rand(8,14), vy:rand(-2,2), len:rand(60,140), life:0});
  }

  let lastShoot = 0;
  function drawBG(t){
    bgCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
    bgCtx.fillStyle = 'rgba(10,8,28,0.3)';
    bgCtx.fillRect(0,0,window.innerWidth,window.innerHeight);

    for(let s of stars){
      const tw = 0.5+0.5*Math.sin((t/800)*(s.twinkle+1));
      bgCtx.beginPath(); bgCtx.globalAlpha = 0.7*tw*s.alpha; bgCtx.fillStyle = '#fff'; bgCtx.arc(s.x,s.y,s.r,0,Math.PI*2); bgCtx.fill();
    }

    for(let i = shootingStars.length-1;i>=0;i--){
      const st = shootingStars[i];
      st.x += st.vx; st.y += st.vy; st.life += 1;
      const grd = bgCtx.createLinearGradient(st.x, st.y, st.x - st.len, st.y - st.len*0.2);
      grd.addColorStop(0, 'rgba(255,255,255,0.95)');
      grd.addColorStop(1, 'rgba(255,200,140,0)');
      bgCtx.beginPath(); bgCtx.globalAlpha = Math.max(0, 1 - st.life/80); bgCtx.strokeStyle = grd; bgCtx.lineWidth = 2.6; bgCtx.moveTo(st.x, st.y); bgCtx.lineTo(st.x - st.len, st.y - st.len*0.2); bgCtx.stroke();
      if(st.x > window.innerWidth + 100 || st.life > 120) shootingStars.splice(i,1);
    }

    bgCtx.globalAlpha = 1;
    if(t - lastShoot > rand(2500,6000)) { spawnShooting(); lastShoot = t }
    requestAnimationFrame(drawBG);
  }

  initStars(); requestAnimationFrame(drawBG);

  window.addEventListener('resize', ()=>{ resizeCanvas(bgCanvas); resizeCanvas(confettiCanvas); initStars(); });

  // Intro overlay behavior: play audio, show heart, then hide overlay
  const introOverlay = document.getElementById('introOverlay');
  const introBtn = document.getElementById('introBtn');
  const introHeart = document.getElementById('introHeart');
  const bgAudio = document.getElementById('bgAudio');
  const audioUpload = document.getElementById('audioUpload');

  // mark page as intro-open so background is hidden/blurred
  document.body.classList.add('intro-open');

  introBtn.addEventListener('click', async () => {
    try{
      // If user has selected a file, use it
      if(audioUpload.files && audioUpload.files[0]){
        const file = audioUpload.files[0];
        bgAudio.src = URL.createObjectURL(file);
      }
      bgAudio.volume = 0.85; bgAudio.loop = true;
      await bgAudio.play();
    }catch(e){
      console.warn('Audio play failed:', e);
    }

    // show heart pop
    introHeart.classList.add('show');
    // small pulse for the whole page
    document.body.animate([{filter:'brightness(0.95)'},{filter:'brightness(1.08)'},{filter:'brightness(1)'}],{duration:900,fill:'forwards'});

    // reveal main after brief delay
    setTimeout(()=>{ introOverlay.style.transition = 'opacity 700ms ease'; introOverlay.style.opacity = 0; setTimeout(()=>{ introOverlay.remove(); document.body.classList.remove('intro-open'); },900); }, 900);
  });

  // Allow long-press or secondary option: click the subtitle area to upload your own song
  const introSubEl = document.querySelector('.intro-card-sub'); if(introSubEl) introSubEl.addEventListener('click', ()=> audioUpload.click());
  audioUpload.addEventListener('change', ()=>{ /* file will be used on click */ });

  // Floating particles: gentle glowing orbs
  (function floatingOrbs(){
    const el = document.getElementById('aurora');
    el.animate([{opacity:0.7, transform:'translateY(0) rotate(0deg)'},{opacity:0.95, transform:'translateY(-8px) rotate(3deg)'},{opacity:0.7, transform:'translateY(0) rotate(0deg)'}],{duration:8000,iterations:Infinity,easing:'ease-in-out'});
  })();

  // Confetti engine
  const confetti = [];
  function spawnConfetti(x,y,amount=80){
    for(let i=0;i<amount;i++){
      confetti.push({x:x||rand(0,window.innerWidth), y:y||rand(0,window.innerHeight/2), vx:rand(-8,8), vy:rand(-10,4), r:rand(4,10), c:`hsl(${Math.round(rand(0,360))}deg ${rand(70,100)}% ${rand(40,60)}%)`, rot:rand(0,360), vr:rand(-10,10), life:0, ttl:rand(80,160)});
    }
  }

  function updateConfetti(){
    confettiCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
    for(let i=confetti.length-1;i>=0;i--){
      const p = confetti[i];
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      confettiCtx.save(); confettiCtx.translate(p.x,p.y); confettiCtx.rotate(p.rot*Math.PI/180); confettiCtx.fillStyle = p.c; confettiCtx.globalAlpha = Math.max(0, 1 - p.life/p.ttl);
      confettiCtx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
      confettiCtx.restore();
      if(p.life > p.ttl || p.y > window.innerHeight + 60) confetti.splice(i,1);
    }
    requestAnimationFrame(updateConfetti);
  }
  requestAnimationFrame(updateConfetti);

  // Floating wishes
  const wishes = [
    'Wishing you endless joy ✨',
    'May your dreams take flight 🌟',
    'So grateful for you 💖',
    'Celebrate every moment 🥂',
    'Shine bright, Mikaela ✨',
    'Love and laughter always ❤️'
  ];

  function spawnWish(trigger){
    const el = document.createElement('div'); el.className = 'wish'; el.textContent = wishes[Math.floor(Math.random()*wishes.length)];
    const startX = rand(10, window.innerWidth-200); const startY = window.innerHeight + 30;
    el.style.left = startX + 'px'; el.style.top = startY + 'px'; el.style.opacity = 0; el.style.transform = 'translateY(0)'; el.style.zIndex = 5;
    wishesRoot.appendChild(el);
    const dur = rand(6000,11000);
    requestAnimationFrame(()=>{ el.style.transition = `transform ${dur}ms cubic-bezier(.2,.9,.2,1), opacity 900ms ease-in-out`; el.style.transform = `translateY(-${window.innerHeight + rand(60,160)}px)`; el.style.opacity = 1; });
    setTimeout(()=>{ el.style.opacity = 0; }, dur-900);
    setTimeout(()=>{ el.remove() }, dur+600);
  }

  // Randomly spawn wishes
  setInterval(()=>{ if(Math.random() < 0.45) spawnWish('auto') }, 2200);

  // Celebrate button removed — confetti can still be triggered programmatically if desired

  // small intro animation for title glow
  window.addEventListener('load', ()=>{
    const t = document.querySelector('.title'); t.animate([{filter:'blur(6px) drop-shadow(0 0 0 rgba(0,0,0,0))'},{filter:'blur(0px) drop-shadow(0 16px 40px rgba(107,76,255,0.18))'}],{duration:1400,fill:'forwards'});
  });

  // make candle flames slightly vary over time for organic fire
  (function organicFlames(){
    const candles = document.querySelectorAll('.candle');
    function tick(){
      candles.forEach((c,i)=>{
        const flame = c.querySelector('.flame');
        if(!flame) return;
        const scale = 0.92 + Math.sin((Date.now()/220) + i) * 0.08 * Math.random();
        const tx = (Math.sin((Date.now()/300) + i*1.5) * 2).toFixed(2);
        const blur = 5 + Math.abs(Math.sin(Date.now()/210 + i)) * 2;
        flame.style.transform = `translateX(calc(-50% + ${tx}px)) translateY(${(-2 + Math.sin(Date.now()/180 + i))*2}px) scale(${scale})`;
        flame.style.filter = `blur(${blur}px)`;
        flame.style.opacity = `${0.86 + Math.abs(Math.sin(Date.now()/160 + i))*0.14}`;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  // Typewriter effect for the main message, with signature '-troy' at the end
  const messageEl = document.querySelector('.message');
  const paragraphs = [
    'Today, the stars shine a little brighter because it is your special day.',
    'Happy Birthday Mikaela!',
    'You are someone who brings warmth, happiness, and light wherever you go. Your kindness, laughter, and beautiful spirit make the lives of those around you brighter every single day.',
    'As another wonderful year begins, may your journey be filled with unforgettable memories, endless opportunities, genuine happiness, and dreams that come true. May every challenge make you stronger, every success make you prouder, and every moment remind you of how truly special you are.',
    'Life is a collection of beautiful moments, and today is one of those moments dedicated entirely to celebrating you. May your heart be filled with joy, your mind with peace, and your future with endless possibilities.',
    'The stars above may sparkle tonight, but none shine as brightly as the wonderful person we celebrate today.',
    'May this birthday bring you love, laughter, success, good health, and countless reasons to smile.',
    'Never stop believing in yourself because you are capable of amazing things.',
    'Thank you for being the incredible person that you are.'
  ];

  function typeParagraphLetters(text, container, baseSpeed = 36){
    return new Promise(resolve => {
      const p = document.createElement('p'); p.className = 'typed-p typing';
      const span = document.createElement('span'); span.className = 'typed-span';
      p.appendChild(span); container.appendChild(p);

      let i = 0; let cancelled = false;

      function finishInstant(){
        cancelled = true;
        span.textContent = text;
        p.classList.remove('typing');
        p.style.opacity = 1;
        resolve();
      }

      // allow external skip
      p._finish = finishInstant;

      function tick(){
        if(cancelled) return;
        if(i < text.length){
          const ch = text.charAt(i);
          span.textContent += ch;
          i++;
          let delay = baseSpeed + Math.random()*22;
          if(ch === ',') delay += 120;
          if(ch === '.' || ch === '!' || ch === '?') delay += 260;
          if(ch === ' ') delay = baseSpeed * 0.6;
          setTimeout(tick, delay);
        } else {
          p.classList.remove('typing');
          p.style.opacity = 1;
          resolve();
        }
      }
      // start on next frame
      requestAnimationFrame(()=> tick());
    });
  }

  let TYPEWRITER_STARTED = false;
  async function runTypewriter(){
    if(!messageEl) return;
    if(TYPEWRITER_STARTED) return;
    TYPEWRITER_STARTED = true;
    messageEl.innerHTML = '';
    messageEl.style.opacity = 1;
    // insert highlighted "From Troy" badge at the top
    const badge = document.createElement('div'); badge.className = 'from-troy'; badge.textContent = 'From Troy'; messageEl.appendChild(badge);
    // slight reveal for badge
    badge.style.opacity = 0; requestAnimationFrame(()=> badge.style.transition = 'opacity 420ms ease', badge.style.opacity = 1);
    await new Promise(r => setTimeout(r, 420));
    const activeParas = [];
    for(const para of paragraphs){
      const promise = typeParagraphLetters(para, messageEl, 34);
      activeParas.push(promise);
      await promise;
      await new Promise(r => setTimeout(r, 160));
    }
    const final = document.createElement('p'); final.className = 'final typed-p'; final.textContent = '✨ Happy Birthday Mikaela ✨'; messageEl.appendChild(final);
    await new Promise(r => setTimeout(r, 260));
    const sign = document.createElement('p'); sign.className = 'signature typed-p'; sign.textContent = '-troy'; messageEl.appendChild(sign);
  }

  // allow clicking the message area to skip typing and reveal all
  messageEl.addEventListener('click', ()=>{
    const typingNodes = messageEl.querySelectorAll('.typed-p.typing');
    typingNodes.forEach(n=>{ if(n._finish) n._finish(); });
  });

  // Start typing after intro overlay removed or immediately if no overlay
  const introOverlayEl = document.getElementById('introOverlay');
  if(introOverlayEl){
    // when intro button is clicked we already remove overlay after ~900ms; start a bit later
    document.getElementById('introBtn').addEventListener('click', ()=>{
      setTimeout(()=>{ runTypewriter(); }, 1000);
    });
  } else {
    // if no intro overlay, run shortly after load
    window.addEventListener('load', ()=> setTimeout(runTypewriter, 600));
  }

})();
