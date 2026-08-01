const pages = Array.from({length:21}, (_,i)=>({
  src:`assets/pages/page-${String(i+1).padStart(2,'0')}.webp`,
  title:[
    'Bìa tập san','Ngôi trường mến mộ','Lời ngỏ','Dấu ấn điện ảnh','Dưới mái trường yêu dấu','Niên khóa 1987–1994','Tri thức và ký ức','Niên khóa 1992–1999','Ký ức tuổi học trò','Niên khóa 1997–2004','Tri ân người khai sáng','Niên khóa 2002–2008','Hành trình trưởng thành','Niên khóa 2006–2012','Người thầy trong tim','Niên khóa 2010–2016','Một chặng đường','Niên khóa 2014–2020','Dấu son truyền thống','Niên khóa 2018–2023','Lời kết'
  ][i]
}));
let current=0, soundOn=true, touchX=0;
const $=s=>document.querySelector(s);
const landing=$('#landing'), reader=$('#reader'), left=$('#leftSlot'), right=$('#rightSlot');
const isMobile=()=>matchMedia('(max-width:800px)').matches;
function pageHTML(i){ if(i<0||i>=pages.length) return ''; return `<img class="page-image" src="${pages[i].src}" data-index="${i}" alt="${pages[i].title}, trang ${i+1}">`; }
function playFlip(){if(!soundOn)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(180,a.currentTime);o.frequency.exponentialRampToValueAtTime(70,a.currentTime+.09);g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.1);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+.11)}catch(e){}}
function render(dir='next'){
  const mobile=isMobile();
  const coverMode=current===0;
  $('#book').classList.toggle('cover-mode',coverMode);
  if(coverMode){left.innerHTML='';right.innerHTML=pageHTML(0);}
  else if(mobile){left.innerHTML='';right.innerHTML=pageHTML(current);}
  else{const start=current%2===1?current:current-1;left.innerHTML=pageHTML(start);right.innerHTML=pageHTML(start+1);current=start;}
  left.classList.toggle('empty',!left.innerHTML);right.classList.toggle('empty',!right.innerHTML);
  const slot=dir==='next'?right:left; slot.classList.remove('turn-next','turn-prev');void slot.offsetWidth;slot.classList.add(dir==='next'?'turn-next':'turn-prev');
  $('#pageLabel').textContent=coverMode?`Bìa · Trang 1 / ${pages.length}`:(mobile?`Trang ${current+1} / ${pages.length}`:`Trang ${current+1}${current+2<=pages.length?'–'+(current+2):''} / ${pages.length}`);
  $('#pageRange').value=current+1;$('#chapterTitle').textContent=pages[current].title;
  $('#prevBtn').disabled=current===0;$('#nextBtn').disabled=mobile?current===pages.length-1:current>=pages.length-1;
  document.querySelectorAll('.thumb').forEach((el,i)=>el.classList.toggle('active',i===current||( !mobile && i===current+1)));
  bindZoom();
}
function go(delta){const step=(isMobile()||current===0||delta<0&&current===1)?1:2;const n=Math.max(0,Math.min(pages.length-1,current+delta*step));if(n===current)return;current=n;playFlip();render(delta>0?'next':'prev')}
function bindZoom(){document.querySelectorAll('.page-image').forEach(img=>img.onclick=()=>{$('#zoomImage').src=img.src;$('#zoomDialog').showModal()})}
$('#openBookBtn').onclick=()=>{landing.hidden=true;reader.hidden=false;document.body.classList.add('reading');current=0;render();const book=$('#book');book.classList.remove('opening');void book.offsetWidth;book.classList.add('opening')};
$('#closeReaderBtn').onclick=()=>{reader.hidden=true;landing.hidden=false;document.body.classList.remove('reading')};
$('#nextBtn').onclick=()=>go(1);$('#prevBtn').onclick=()=>go(-1);
$('#pageRange').oninput=e=>{current=+e.target.value-1;render(current>+e.target.dataset.old?'next':'prev');e.target.dataset.old=current};
$('#soundBtn').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'🔊':'🔇'};
$('#fullscreenBtn').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
$('#closeZoomBtn').onclick=()=>$('#zoomDialog').close();
$('#zoomDialog').onclick=e=>{if(e.target.id==='zoomDialog')e.currentTarget.close()};
const panel=$('#thumbPanel'),overlay=$('#overlay');
function panelOpen(v){panel.classList.toggle('open',v);panel.setAttribute('aria-hidden',!v);overlay.hidden=!v}
$('#thumbBtn').onclick=()=>panelOpen(true);$('#closeThumbBtn').onclick=()=>panelOpen(false);overlay.onclick=()=>panelOpen(false);
const grid=$('#thumbGrid');pages.forEach((p,i)=>{const b=document.createElement('button');b.className='thumb';b.innerHTML=`<img loading="lazy" src="${p.src}" alt="${p.title}"><span>${i+1}</span>`;b.onclick=()=>{current=i;render();panelOpen(false)};grid.appendChild(b)});
addEventListener('keydown',e=>{if(reader.hidden)return;if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1);if(e.key==='Escape')panelOpen(false)});
$('#bookStage').addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
$('#bookStage').addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>45)go(d<0?1:-1)},{passive:true});
addEventListener('resize',()=>{if(!reader.hidden)render()});
