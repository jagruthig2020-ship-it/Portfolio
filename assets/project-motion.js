(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const elements=[...document.querySelectorAll('.case-story article>section,.case-story article>figure,.demo-box,.case-links')];
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});observer.unobserve(e.target)}}),{threshold:.12});elements.forEach(e=>observer.observe(e));
 const cover=document.querySelector('.case-cover img');let pending=false;
 function scroll(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(!cover)return;const r=cover.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)cover.style.transform=`translateY(${Math.max(-20,Math.min(20,-r.top*.035))}px) scale(1.04)`})}
 addEventListener('scroll',scroll,{passive:true});scroll();
 document.querySelectorAll('.next-project').forEach(link=>link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();document.querySelector('main').animate([{opacity:1},{opacity:0,transform:'translateY(-15px)'}],{duration:180,fill:'forwards'}).finished.then(()=>location.href=link.href)}));
})();
