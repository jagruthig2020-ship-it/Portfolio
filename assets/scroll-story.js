(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const section=document.querySelector('#journey'),world=document.querySelector('#route-world'),road=document.querySelector('#route-road'),progress=document.querySelector('#route-progress'),marker=document.querySelector('#route-marker'),webs=document.querySelector('#route-webs'),swing=document.querySelector('#route-swing');
 if(!section||!road)return;
 const NS='http://www.w3.org/2000/svg',len=road.getTotalLength(),chapters=[...section.querySelectorAll('.route-chapter')],buttons=[...section.querySelectorAll('[data-route-stop]')];
 progress.style.strokeDasharray=String(len);progress.style.strokeDashoffset=String(len);
 const positions=[.075,.355,.635,.915].map(t=>road.getPointAtLength(t*len));
 const add=(tag,attrs,parent)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));parent.append(el);return el};
 const nets=positions.map((p,i)=>{
  const g=add('g',{transform:`translate(${p.x} ${p.y})`,class:'route-anchor'},webs);
  add('circle',{r:'23',class:'route-stop-halo'},g);add('circle',{r:'7',class:'route-stop-dot'},g);
  const impact=add('circle',{r:'32',class:'route-impact'},g);
  const net=add('g',{class:'route-anchor-net'},g),n=18;
  for(let k=0;k<n;k++){const a=k*Math.PI*2/n;add('path',{d:`M0 0L${Math.cos(a)*210} ${Math.sin(a)*210}`},net)}
  for(let j=1;j<=8;j++){const r=j*25;let d='';for(let k=0;k<n;k++){let a=k*Math.PI*2/n,b=(k+1)*Math.PI*2/n,m=(a+b)/2;if(!k)d=`M${r} 0`;d+=`Q${Math.cos(m)*r*.91} ${Math.sin(m)*r*.91} ${Math.cos(b)*r} ${Math.sin(b)*r}`}add('path',{d},net)}
  add('text',{x:'35',y:'-28',class:'route-map-number'},g).textContent='0'+(i+1);return net;
 });
 let target=0,smoothed=0,index=-1,active=false,raf=0,shotTime=0;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function setChapter(i){if(i===index)return;index=i;shotTime=performance.now();chapters.forEach((c,j)=>{c.classList.toggle('active',i===j);c.setAttribute('aria-hidden',String(i!==j))});buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));document.querySelector('#route-count').textContent=`0${i+1} / 04`;
  nets.forEach((net,j)=>net.classList.toggle('visited',j<=i));
  if(!reduced){const photo=chapters[i].querySelector('.route-photo');photo.animate([{translate:'65px -45px',rotate:'-8deg'},{translate:'-9px 5px',rotate:'1.5deg',offset:.7},{translate:'0 0',rotate:'0deg'}],{duration:1150,easing:'cubic-bezier(.16,1,.3,1)'});}
  if(!reduced){
   const impact=nets[i].parentNode.querySelector('.route-impact');
   impact.animate([{opacity:.9,transform:'scale(.4)'},{opacity:0,transform:'scale(6)'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'});
   [...nets[i].querySelectorAll('path')].forEach((thread,k)=>{const l=thread.getTotalLength();thread.animate([{strokeDasharray:l,strokeDashoffset:l},{strokeDasharray:l,strokeDashoffset:0}],{duration:650,delay:k<18?k*13:120+(k-18)*35,easing:'cubic-bezier(.16,1,.3,1)'});});
  }
  if(!reduced)nets[i].animate([{opacity:0,transform:'scale(.03)'},{opacity:.8,transform:'scale(1.08)'},{opacity:.45,transform:'scale(1)'}],{duration:950,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
 }
 function read(){const rect=section.getBoundingClientRect();target=clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight))}
 function frame(now){if(!active){raf=0;return}raf=requestAnimationFrame(frame);if(document.hidden)return;smoothed+=(target-smoothed)*(reduced?1:.1);
  const pos=.075+smoothed*.84,point=road.getPointAtLength(pos*len),scale=innerWidth<650?.62:Math.min(1,innerWidth/1400);
  const sway=reduced?0:Math.sin(smoothed*Math.PI*6)*35;
  world.style.transform=`translate(${(700-point.x)*scale*.42}px,${innerHeight*.46-point.y*scale}px) rotate(${sway*.07}deg) scale(${scale})`;
  progress.style.strokeDashoffset=String(len*(1-pos));marker.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${Math.sin(smoothed*12)*14})`);
  const chapter=Math.min(3,Math.floor(smoothed*4));setChapter(chapter);
  const anchor=positions[Math.min(3,chapter+1)],since=clamp((now-shotTime)/420),reach=reduced?1:since;
  const ax=point.x+(anchor.x-point.x)*reach,ay=point.y+(anchor.y-point.y)*reach;
  const tension=clamp((now-shotTime)/950);
  const sag=reduced?0:Math.sin(smoothed*Math.PI*8)*(1-tension)*150; 
  swing.setAttribute('d',`M${point.x} ${point.y}Q${(point.x+ax)/2+sag} ${(point.y+ay)/2-80} ${ax} ${ay}`);swing.style.opacity=chapter===3?'.2':'.8';
  document.querySelector('#route-percent').textContent=String(Math.round(smoothed*100)).padStart(2,'0')+'%';
 }
 buttons.forEach((b,i)=>b.addEventListener('click',()=>window.scrollTo({top:section.getBoundingClientRect().top+scrollY+(section.offsetHeight-innerHeight)*(i===0?0:(i+.12)/4),behavior:reduced?'auto':'smooth'})));
 const observer=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active&&!raf){read();raf=requestAnimationFrame(frame)}else if(!active&&raf){cancelAnimationFrame(raf);raf=0}},{rootMargin:'100px'});observer.observe(section);addEventListener('scroll',read,{passive:true});addEventListener('resize',read,{passive:true});read();setChapter(0);
 const hero=document.querySelector('#home');new IntersectionObserver(([e])=>hero.classList.toggle('cover-paused',!e.isIntersecting)).observe(hero);
 // The comic title settles into place in separate print layers, then reacts gently to the cursor.
 const mark=document.querySelector('.cover-mark');if(mark&&!reduced){const reveal=new IntersectionObserver(([e])=>{if(e.isIntersecting){mark.animate([{opacity:0,transform:'translateY(28px) rotate(-3deg) scale(.95)'},{opacity:1,transform:'none'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});reveal.disconnect()}},{threshold:.1});reveal.observe(mark);
  hero.addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);mark.style.translate=`${x*13}px ${y*9}px`;document.querySelector('.comic-sun').style.translate=`${-x*11}px ${-y*7}px`},{passive:true});hero.addEventListener('pointerleave',()=>{mark.style.translate='0 0';document.querySelector('.comic-sun').style.translate='0 0'})}
})();
