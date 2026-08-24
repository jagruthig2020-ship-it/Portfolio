const intro=document.querySelector("#intro"), enter=document.querySelector("#enterBtn");
document.body.style.overflow="hidden";
enter.addEventListener("click",()=>{
  intro.classList.add("entering");
  document.body.style.overflow="hidden";
  setTimeout(()=>{
    intro.classList.add("exit");
    document.body.style.overflow="auto";
    window.scrollTo(0,0);
  },1250);
});

const dot=document.querySelector(".cursor-dot"), ring=document.querySelector(".cursor-ring");
window.addEventListener("mousemove",e=>{dot.style.left=e.clientX+"px";dot.style.top=e.clientY+"px";ring.style.left=e.clientX+"px";ring.style.top=e.clientY+"px"});
document.querySelectorAll("a,button,.magnetic-card,.region").forEach(el=>{
  el.addEventListener("mouseenter",()=>ring.classList.add("big"));
  el.addEventListener("mouseleave",()=>ring.classList.remove("big"));
});
document.querySelectorAll(".magnetic").forEach(el=>{
  el.addEventListener("mousemove",e=>{
    const r=el.getBoundingClientRect(), x=(e.clientX-r.left-r.width/2)/5, y=(e.clientY-r.top-r.height/2)/5;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener("mouseleave",()=>el.style.transform="");
});

const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>revealObs.observe(el));
const journeyObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.3});
journeyObs.observe(document.querySelector(".journey"));

const stories={
 school:["01 / 04","School","The first place where curiosity became a habit. Replace this text with the real school story, favourite subjects, achievements and the moment computer science started feeling like a road worth following."],
 college:["02 / 04","GLEC","Where my CS journey started."],
 dexterity:["03 / 04","Dexterity","One of the most important milestones along the way — one of 100 young leaders selected globally for the Dexterity School of Leadership and Entrepreneurship."],
 future:["04 / 04","Next Destination","The map is still unfolding. More ideas to build, more places to explore, and more stories waiting to be added. This is only the beginning."]
};
document.querySelectorAll(".destination").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".destination").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  const s=stories[btn.dataset.panel], p=document.querySelector("#storyPanel");
  p.animate([{opacity:.3,transform:"translateY(12px) rotate(-1deg)"},{opacity:1,transform:"translateY(0) rotate(-1deg)"}],{duration:400});
  p.querySelector(".panel-index").textContent=s[0];p.querySelector("h3").textContent=s[1];p.querySelector("p").textContent=s[2];
}));

document.querySelectorAll(".encounter").forEach(x=>x.addEventListener("click",()=>{document.querySelectorAll(".encounter").forEach(y=>y.classList.remove("active"));x.classList.add("active")}));

// Gentle parallax makes the first world feel like a physical scene.
window.addEventListener("mousemove",e=>{
  const x=(e.clientX/innerWidth-.5), y=(e.clientY/innerHeight-.5);
  document.querySelector(".intro-card").style.transform=`translate(${x*10}px,${y*10}px)`;
  document.querySelector(".orbit-a").style.marginLeft=`${x*18}px`;
  document.querySelector(".orbit-b").style.marginTop=`${y*18}px`;
});

const communityStories={
 dexterity:"DexSchool was a semi-monastic, semi-military academy that trained young leaders to solve 21st-century problems. I learned about the Indian ethos, values, and practices, core values to become a great leader, and humility in service, from Nobel Laureates, Olympians, and Forbes-listed CEOs. I found the direction through Dexterity. I aspire to be an effective global leader and citizen, constantly working towards change. Through the Fellows Development Program, I was accepted into Pepperdine University with a partial scholarship.",
 precollege:"Scholar, Dexterity Global Pre-College Program in International Affairs and International Business, with faculty from Harvard and Yale.",
 hackathons:"Attended my first hackathon — a small step into building, experimenting, and solving problems under pressure. Looking forward to exploring more hackathons, ideas, and challenges along the way."
};
document.querySelectorAll(".encounter").forEach(btn=>btn.addEventListener("click",()=>{
 const box=document.querySelector("#encounterStory");
 if(box){box.querySelector("p").textContent=communityStories[btn.dataset.community]}
}));
