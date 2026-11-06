(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,coarse=matchMedia('(pointer: coarse)').matches,NS='http://www.w3.org/2000/svg';
 const node=(tag,attrs,parent)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));parent.append(el);return el};
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const animate=(ms,step)=>new Promise(resolve=>{const start=performance.now();function run(now){const p=Math.min(1,(now-start)/ms);step(ease(p),p);if(p<1)requestAnimationFrame(run);else resolve()}requestAnimationFrame(run)});
 function overlay(){const layer=document.createElement('div');layer.className='web-transit';layer.setAttribute('aria-hidden','true');document.body.append(layer);const svg=node('svg',{viewBox:`0 0 ${innerWidth} ${innerHeight}`},layer);return {layer,svg}}
 function net(svg,x,y,size=80){const g=node('g',{transform:`translate(${x} ${y})`},svg);for(let i=0;i<12;i++){const a=i*Math.PI/6;node('line',{x1:0,y1:0,x2:Math.cos(a)*size,y2:Math.sin(a)*size},g)}for(let j=1;j<=4;j++){let d='';const r=j*size/4;for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6,m=(a+b)/2;if(!i)d=`M${r} 0`;d+=`Q${Math.cos(m)*r*.84} ${Math.sin(m)*r*.84} ${Math.cos(b)*r} ${Math.sin(b)*r}`}node('path',{d},g)}return g}
 // One purposeful cast from the invitation into the first build.
 const cta=document.querySelector('.comic-enter');let pulling=false;
 cta?.addEventListener('click',async event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced)return;
  event.preventDefault();event.stopImmediatePropagation();if(pulling)return;pulling=true;
  const rect=cta.getBoundingClientRect(),startY=scrollY,section=document.querySelector('#projects'),endY=section.getBoundingClientRect().top+scrollY;
  const {layer,svg}=overlay(),x=rect.x+rect.width*.85,y=rect.y+rect.height*.5,ax=innerWidth*.51,ay=innerHeight*.83;
  const rope=node('path',{d:`M${x} ${y}L${x} ${y}`},svg),burst=net(svg,ax,ay,110);burst.style.opacity='0';
  await animate(230,(p)=>{rope.setAttribute('d',`M${x} ${y}Q${(x+ax)/2+40*(1-p)} ${(y+ay)/2} ${x+(ax-x)*p} ${y+(ay-y)*p}`)});
  burst.animate([{opacity:0,transform:`translate(${ax}px,${ay}px) scale(.12)`},{opacity:.7,transform:`translate(${ax}px,${ay}px) scale(1)`}],{duration:280,fill:'forwards'});
  await animate(1050,(p,t)=>{window.scrollTo({top:startY+(endY-startY)*p,behavior:'instant'});rope.setAttribute('d',`M${x} ${y-innerHeight*p}Q${ax+Math.sin(p*Math.PI)*110} ${ay-160*p} ${ax} ${ay}`);layer.style.opacity=String(t>.75?(1-t)*4:1)});
  layer.remove();pulling=false;
 },true);
 // Four corner catches frame the clicked cover before the reader opens.
 window.portfolioProjectTransition=async url=>{
  if(reduced)return;
  const cards=[...document.querySelectorAll('.film-card')],card=cards.find(c=>new URL(c.href).href===url),r=card?.getBoundingClientRect();
  if(!card||!r||r.right<0||r.left>innerWidth||r.top>innerHeight||r.bottom<0)return;
  const {layer,svg}=overlay(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const corners=[[r.left,r.top],[r.right,r.top],[r.right,r.bottom],[r.left,r.bottom]],threads=corners.map(()=>node('path',{d:`M${cx} ${cy}L${cx} ${cy}`},svg));
  await animate(170,p=>threads.forEach((thread,i)=>{const [x,y]=corners[i];thread.setAttribute('d',`M${cx} ${cy}L${cx+(x-cx)*p} ${cy+(y-cy)*p}`)}));
  corners.forEach(([x,y])=>net(svg,x,y,38));
  const print=document.createElement('div');print.className='web-catch-print';print.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background-image:url("${card.dataset.art}")`;layer.prepend(print);
  await print.animate([{transform:'none',opacity:1},{transform:`translate(${innerWidth/2-cx}px,${innerHeight/2-cy}px) scale(${Math.max(innerWidth/r.width,innerHeight/r.height)*1.1})`,opacity:.4}],{duration:330,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'}).finished;
  layer.remove();
 };
 // Subtle web tension: no touch interception and no perpetual animation loop.
 if(!reduced&&!coarse){const svg=node('svg',{class:'magnet-thread','aria-hidden':'true'},document.body),thread=node('path',{d:''},svg);
  document.querySelectorAll('.control,.comic-enter,.question-link,.form-controls button').forEach(button=>{
   button.classList.add('web-magnetic');let bounds;
   button.addEventListener('pointerenter',()=>{bounds=button.getBoundingClientRect()});
   button.addEventListener('pointermove',event=>{if(!bounds)return;const cx=bounds.x+bounds.width/2,cy=bounds.y+bounds.height/2,dx=(event.clientX-cx)*.13,dy=(event.clientY-cy)*.16;button.style.translate=`${dx}px ${dy}px`;thread.setAttribute('d',`M${cx} ${bounds.bottom+8}Q${event.clientX+12} ${event.clientY+25} ${event.clientX} ${event.clientY}`)});
   button.addEventListener('pointerleave',()=>{button.style.translate='0 0';thread.setAttribute('d','');bounds=null});button.addEventListener('click',()=>thread.setAttribute('d',''));
  });
 }
 const mask='<path class="crawler-body" d="M19 37Q28 28 37 37L35 57Q28 65 21 57Z"/><ellipse class="crawler-body" cx="28" cy="24" rx="11" ry="14"/><path class="crawler-eye" d="M19 20L26 23L24 29Q19 28 19 20M37 20L30 23L32 29Q37 28 37 20"/><path d="M28 12V37M18 24H38M20 16L35 32M36 16L21 32" stroke="#441627" stroke-width=".6" fill="none"/><path d="M25 44L28 42L31 44L30 51H26Z" fill="#10121b"/>';
 // A short upside-down visit when the contact section enters view.
 const cameo=document.createElement('div');cameo.className='contact-crawler';cameo.setAttribute('aria-hidden','true');cameo.innerHTML=`<svg viewBox="0 0 70 175"><path class="crawler-web" d="M35 -200V92"/><g transform="translate(7 172) scale(1 -1)">${mask}<path class="crawler-limb crawler-blue" d="M23 57L15 72L26 82M33 57L41 72L30 82"/><path class="crawler-limb" d="M21 39L11 48L6 32"/><g class="crawler-wave"><path class="crawler-limb" d="M35 39L45 47L50 31"/></g></g></svg>`;document.querySelector('.contact-copy')?.append(cameo);
 let contactVisible=false,visitTimer;function visit(){if(!contactVisible||document.hidden||reduced)return;cameo.classList.remove('is-visiting');void cameo.offsetWidth;cameo.classList.add('is-visiting');visitTimer=setTimeout(visit,26000)}
 const contact=document.querySelector('#contact');if(contact)new IntersectionObserver(([entry])=>{contactVisible=entry.isIntersecting;clearTimeout(visitTimer);if(contactVisible)visit()},{threshold:.35}).observe(contact);
 // Game Mode uses the original Red Thread arena in index.html.
})();
