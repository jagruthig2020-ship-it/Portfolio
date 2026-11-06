/* The soundtrack belongs to this document. Case studies change inside a full-screen reader. */
(()=>{
 'use strict';
 const homeTitle=document.title,base=new URL(location.href),initial=base.searchParams.get('project');
 base.searchParams.delete('project');
 const baseURL=base.pathname+base.search+base.hash;
 const dialog=document.createElement('dialog');dialog.className='case-reader';dialog.setAttribute('aria-label','Project case study');
 dialog.innerHTML='<div class="reader-bar"><button type="button" class="reader-close">← BACK TO PORTFOLIO</button><span class="reader-title">PROJECT NOTES</span><button type="button" class="reader-sound" aria-pressed="false">♫ PLAY MUSIC</button></div><iframe title="Project case study" class="reader-frame" allow="autoplay" src="about:blank"></iframe>';
 document.body.append(dialog);
 const frame=dialog.querySelector('iframe'),close=dialog.querySelector('.reader-close'),sound=dialog.querySelector('.reader-sound'),audio=document.querySelector('#soundtrack');
 let current='',lastFocus=null,depth=0,pending='';
 function navigateFrame(url){frame.dataset.project=url;try{frame.contentWindow.location.replace(url)}catch{frame.src=url}}
 function valid(value){try{const u=new URL(value,location.href),prefix=new URL('projects/',new URL(base.pathname,location.origin)).pathname;return u.origin===location.origin&&u.pathname.startsWith(prefix)&&/^[a-z0-9-]+\.html$/.test(u.pathname.slice(prefix.length))?u:null}catch{return null}}
 function open(value,push=true,arrived=false){
  const url=valid(value);if(!url)return false;
  const slug=url.pathname.split('/').pop().replace('.html','');
  if(dialog.open&&current===url.href)return true;
  if(!dialog.open&&!arrived&&window.portfolioProjectTransition){if(pending)return true;pending=url.href;window.portfolioProjectTransition(url.href).catch(()=>{}).then(()=>{pending='';open(url.href,push,true)});return true;}
  if(!dialog.open){lastFocus=document.activeElement;document.body.classList.add('case-is-open');dialog.showModal();close.focus();}
  current=url.href;navigateFrame(url.href);dialog.classList.add('is-loading');
  if(push){depth++;const next=new URL(base.href);next.searchParams.set('project',slug);history.pushState({caseViewer:true,project:slug,depth},'',next.pathname+next.search+next.hash)}
  document.title=slug.replace(/-/g,' ').toUpperCase()+' — Jagruthi Guttula';return true;
 }
 function hide(){if(!dialog.open)return;dialog.close();navigateFrame('about:blank');current='';depth=0;document.body.classList.remove('case-is-open');document.title=homeTitle;lastFocus?.focus({preventScroll:true});}
 function leave(anchor){if(!dialog.open)return;if(depth>0){history.go(-depth);if(anchor)setTimeout(()=>document.querySelector(anchor)?.scrollIntoView({behavior:'smooth'}),100)}else{history.replaceState(null,'',baseURL);hide();if(anchor)document.querySelector(anchor)?.scrollIntoView({behavior:'smooth'})}}
 window.openPortfolioProject=value=>open(value);
 document.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const link=event.target.closest('a[href]');if(!link||link.target==='_blank'||link.hasAttribute('download'))return;if(valid(link.href)){event.preventDefault();event.stopImmediatePropagation();open(link.href)}},true);
 close.addEventListener('click',()=>leave());dialog.addEventListener('cancel',event=>{event.preventDefault();leave()});
 addEventListener('popstate',event=>{if(event.state?.caseViewer){depth=event.state.depth||1;open('projects/'+event.state.project+'.html',false)}else hide()});
 addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.channel!=='jagruthi-case')return;
  if(event.data.action==='open')open(event.data.url);
  if(event.data.action==='close')leave(event.data.anchor==='#contact'?'#contact':undefined);
 });
 frame.addEventListener('load',()=>{dialog.classList.remove('is-loading');if(!dialog.open)return;try{dialog.querySelector('.reader-title').textContent=frame.contentDocument.title.split(' — ')[0]}catch{}});
 function sync(){if(!audio)return;const playing=!audio.paused;sound.textContent=playing?'♫ PAUSE MUSIC':'♫ PLAY MUSIC';sound.setAttribute('aria-pressed',String(playing));}
 sound.addEventListener('click',()=>document.querySelector('#music-toggle').click());audio?.addEventListener('play',sync);audio?.addEventListener('pause',sync);sync();
 if(initial&&/^[a-z0-9-]+$/.test(initial)){history.replaceState(null,'',baseURL);open('projects/'+initial+'.html')}
})();
