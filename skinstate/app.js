(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroPhoto = document.getElementById('heroPhoto');
  const heroImg = heroPhoto?.querySelector('img');
  if (!reduceMotion && heroPhoto && heroImg) {
    heroPhoto.addEventListener('pointermove', e => {
      const r = heroPhoto.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      heroImg.style.transform = `scale(1.11) translate(${x*-14}px,${y*-10}px)`;
    });
    heroPhoto.addEventListener('pointerleave',()=>heroImg.style.transform='scale(1.07)');
  }

  const signals = {
    tight:{label:'тянет',color:'#42d9ff',abbr:'T'},
    reactive:{label:'реагирует',color:'#ff5d8f',abbr:'R'},
    texture:{label:'неровно',color:'#dfff45',abbr:'X'},
    dull:{label:'тускло',color:'#8d65ff',abbr:'D'},
    shine:{label:'блестит',color:'#ff7a2f',abbr:'S'},
    lines:{label:'линии',color:'#ffffff',abbr:'L'}
  };
  const zones = {
    forehead:'Лоб', eyeL:'Под левым глазом', eyeR:'Под правым глазом', nose:'T-зона',
    cheekL:'Левая щека', cheekR:'Правая щека', mouth:'Вокруг рта', chin:'Подбородок'
  };
  let activeSignal='tight', intensity=2;
  const mapState={};
  const signalButtons=[...document.querySelectorAll('.signal')];
  const zoneEls=[...document.querySelectorAll('.zone')];
  const summaryList=document.getElementById('summaryList');
  const mapCount=document.getElementById('mapCount');
  const mapCode=document.getElementById('mapCode');
  const intensityEl=document.getElementById('intensity');
  const intensityLabel=document.getElementById('intensityLabel');
  const request=document.getElementById('request');

  function setSignal(sig){
    activeSignal=sig;
    signalButtons.forEach(b=>b.classList.toggle('active',b.dataset.signal===sig));
  }
  signalButtons.forEach(b=>b.addEventListener('click',()=>setSignal(b.dataset.signal)));
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const n=Number(e.key); if(n>=1&&n<=6){ const b=signalButtons[n-1]; if(b){setSignal(b.dataset.signal); b.focus();} }
  });

  intensityEl.addEventListener('input',e=>{intensity=Number(e.target.value);intensityLabel.textContent=`${intensity} / 3`;});

  function updateZone(el){
    const data=mapState[el.dataset.zone];
    el.classList.toggle('is-set',!!data);
    if(data){el.style.setProperty('--zone-color',signals[data.signal].color);el.style.opacity=String(.68+data.intensity*.1);}else{el.style.removeProperty('--zone-color');el.style.opacity='1';}
  }

  function makeCode(){
    const entries=Object.entries(mapState);
    if(!entries.length) return 'EMPTY';
    return entries.map(([z,v])=>z.slice(0,2).toUpperCase()+signals[v.signal].abbr+v.intensity).join('-');
  }

  function renderSummary(){
    const entries=Object.entries(mapState);
    mapCount.textContent=entries.length;
    mapCode.textContent=makeCode();
    if(!entries.length){
      summaryList.innerHTML='<div class="summary-empty">Пока пусто. Отметьте хотя бы одну зону — здесь появится краткий список для первой встречи.</div>';
      return;
    }
    summaryList.innerHTML='';
    entries.forEach(([zone,v])=>{
      const row=document.createElement('div');row.className='summary-item';
      row.innerHTML=`<div><b>${zones[zone]}</b><div style="display:flex;gap:9px;align-items:center;margin-top:5px"><i class="summary-dot" style="background:${signals[v.signal].color}"></i><span>${signals[v.signal].label}</span></div></div><span class="mono">${v.intensity}/3</span>`;
      summaryList.appendChild(row);
    });
  }

  function applyZone(el){
    const z=el.dataset.zone;
    mapState[z]={signal:activeSignal,intensity};
    updateZone(el);renderSummary();
  }
  zoneEls.forEach(el=>{
    el.addEventListener('click',()=>applyZone(el));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();applyZone(el);}});
  });

  document.getElementById('mapReset').addEventListener('click',()=>{
    Object.keys(mapState).forEach(k=>delete mapState[k]);zoneEls.forEach(updateZone);renderSummary();
  });

  const faceStage=document.getElementById('faceStage'),faceWrap=document.getElementById('faceWrap');
  if(!reduceMotion && faceStage && faceWrap){
    faceStage.addEventListener('pointermove',e=>{
      const r=faceStage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      faceWrap.style.transform=`perspective(900px) rotateY(${x*5}deg) rotateX(${-y*4}deg)`;
    });
    faceStage.addEventListener('pointerleave',()=>faceWrap.style.transform='');
  }

  const drawerBg=document.getElementById('drawerBg');
  function openDrawer(e){if(e)e.preventDefault();drawerBg.classList.add('open');document.body.classList.add('drawer-open');setTimeout(()=>document.getElementById('name')?.focus(),20);}
  function closeDrawer(){drawerBg.classList.remove('open');document.body.classList.remove('drawer-open');}
  document.querySelectorAll('.js-book').forEach(b=>b.addEventListener('click',openDrawer));
  document.getElementById('drawerClose').addEventListener('click',closeDrawer);
  drawerBg.addEventListener('click',e=>{if(e.target===drawerBg)closeDrawer();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});

  document.getElementById('mapBook').addEventListener('click',()=>{
    const entries=Object.entries(mapState);
    if(entries.length){
      const lines=entries.map(([z,v])=>`• ${zones[z]}: ${signals[v.signal].label}, ${v.intensity}/3`);
      request.value=`Моя Skin Signal Map (${makeCode()}):\n${lines.join('\n')}\n\nЧто ещё хочу добавить: `;
    } else {
      request.value='Skin Signal Map пока пустая. Что хочу обсудить: ';
    }
    openDrawer();
  });

  document.getElementById('bookingForm').addEventListener('submit',e=>{
    e.preventDefault();const btn=e.target.querySelector('.form-submit');btn.textContent='Заявка сохранена (demo) ✓';setTimeout(closeDrawer,900);
  });

  renderSummary();
})();
