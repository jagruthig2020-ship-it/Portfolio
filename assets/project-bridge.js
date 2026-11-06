/* Internal project navigation stays in the parent portfolio's audio session. */
(()=>{
 if(parent===window)return;
 document.documentElement.classList.add('inside-portfolio');
 function send(action,extra={}){parent.postMessage({channel:'jagruthi-case',action,...extra},location.origin)}
 document.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');if(!link||link.target==='_blank')return;
  const u=new URL(link.href);if(u.origin!==location.origin)return;
  if(u.pathname===location.pathname&&u.hash){event.preventDefault();event.stopImmediatePropagation();document.querySelector(u.hash)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}
  if(/\/projects\/[a-z0-9-]+\.html$/.test(u.pathname)){event.preventDefault();event.stopImmediatePropagation();send('open',{url:u.href})}
  else if(/\/index\.html$/.test(u.pathname)){event.preventDefault();event.stopImmediatePropagation();send('close',{anchor:u.hash})}
 },true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();send('close')}});
})();
