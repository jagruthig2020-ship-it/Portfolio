(()=>{
 'use strict';
 const canvas=document.querySelector('#cinema3d'),section=document.querySelector('#lab');if(!canvas||!section)return;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
 const rand=s=>{const v=Math.sin(s*127.1+19.71)*43758.54;return v-Math.floor(v)};
 const brick=new Image();brick.src='assets/materials/scanned-brick.webp';
 const buildings=[];const palettes=['#615148','#4a4f50','#806851','#554740','#6e6458','#48494d'];
 // Actual facade proportions: regular floor spacing, recessed panes, cornices, a parapet and roof plant.
 for(let row=0;row<12;row++)for(let side of [-1,1]){
  const id=row*2+(side+1)/2,z=32-row*24.5,w=12+rand(id+2)*5,d=20+rand(id+4)*3,levels=5+Math.floor(rand(id+8)*6),h=levels*3.4;
  buildings.push({x:side*(11+w/2),z,w,d,h,id,levels,color:palettes[id%palettes.length],facade:null});
 }
 function facade(b){
  const c=document.createElement('canvas');c.width=512;c.height=1024;const g=c.getContext('2d');
  g.fillStyle=b.color;g.fillRect(0,0,512,1024);
  if(brick.complete&&brick.naturalWidth){g.globalAlpha=.65;for(let y=0;y<1024;y+=128)for(let x=0;x<512;x+=256)g.drawImage(brick,x,y,256,128);g.globalAlpha=1;g.fillStyle=b.color+'70';g.fillRect(0,0,512,1024)}
  const rows=b.levels,step=980/rows;
  for(let row=0;row<rows;row++){
   const yy=28+row*step;
   g.fillStyle='#17171855';g.fillRect(0,yy+step-8,512,5);g.fillStyle='#bbb6a02b';g.fillRect(0,yy+step-10,512,2);
   for(let col=0;col<4;col++){
    const xx=24+col*124,pw=76,ph=step*.64;g.fillStyle='#16191c';g.fillRect(xx-4,yy-3,pw+8,ph+8);
    const lit=rand(b.id*23+row*7+col*5)>.67,grad=g.createLinearGradient(xx,yy,xx+pw,yy+ph);
    grad.addColorStop(0,lit?'#a79068':'#536474');grad.addColorStop(.43,lit?'#d2bb88':'#293c4e');grad.addColorStop(.45,lit?'#9d8966':'#1b2b38');grad.addColorStop(1,lit?'#8c7955':'#17232d');g.fillStyle=grad;g.fillRect(xx,yy,pw,ph);
    g.fillStyle='#25272c';g.fillRect(xx+pw*.49,yy,3,ph);g.fillRect(xx,yy+ph*.5,pw,3);g.fillStyle='#2b2c2e';g.fillRect(xx-5,yy+ph+3,pw+10,7);g.fillStyle='#a5a199';g.fillRect(xx-6,yy+ph,pw+12,3);
    if(rand(b.id*13+row*19+col)>.6){g.fillStyle='#0b111a55';g.fillRect(xx,yy,pw,ph*rand(row*8+col+3))}
   }
  }
  // Weathering, drainpipe, window surrounds and occasional iron fire escape.
  g.fillStyle='#18191c80';g.fillRect(496,0,4,1024);g.fillStyle='#888070';g.fillRect(500,0,2,1024);
  if(b.id%3===0){g.strokeStyle='#181c20';g.lineWidth=5;for(let row=1;row<rows;row++){const y=30+row*step;g.strokeRect(142,y,221,9);g.beginPath();g.moveTo(145,y);g.lineTo(350,y+step);g.stroke();g.lineWidth=2;for(let n=0;n<9;n++){g.beginPath();g.moveTo(150+n*24,y+4+n*step/9);g.lineTo(179+n*24,y+4+n*step/9);g.stroke()}g.lineWidth=5}}
  const shade=g.createLinearGradient(0,0,512,0);shade.addColorStop(0,'#0003');shade.addColorStop(.5,'transparent');shade.addColorStop(1,'#0006');g.fillStyle=shade;g.fillRect(0,0,512,1024);return c;
 }
 brick.onload=()=>{buildings.forEach(b=>b.facade=null);dirty=true};
 let w=0,h=0,dpr=1,p=0,smooth=0,raf=0,last=0,active=false,dirty=true,px=0;
 const cards=[...section.querySelectorAll('.cinema-chapter')];let chapter=-1;
 function progress(){const r=section.getBoundingClientRect();p=clamp(-r.top/Math.max(1,section.offsetHeight-innerHeight));const n=Math.min(3,Math.floor(p*4));if(n!==chapter){chapter=n;cards.forEach((c,i)=>{c.classList.toggle('active',i===n);c.setAttribute('aria-hidden',String(i!==n))})}dirty=true}
 function resize(){dpr=Math.min(devicePixelRatio||1,innerWidth<700?1:1.25);w=canvas.clientWidth*dpr;h=canvas.clientHeight*dpr;canvas.width=w;canvas.height=h;dirty=true}
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]);
 function norm(a){const d=Math.hypot(...a)||1;return a.map(v=>v/d)}
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 // Continuous camera travel keeps the avenue open; no collisions or floating centrepiece.
 function project(v,eye,target){const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),dv=sub(v,eye),z=dot(dv,forward);if(z<1)return null;const f=Math.min(w,h)*1.07;return [w*.58+dot(dv,right)*f/z,h*.47-dot(dv,up)*f/z,z]}
 function polygon(pts,fill,alpha=1){if(pts.some(v=>!v))return;ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=1}
 function segment(a,b,color,width=1,alpha=1){if(!a||!b)return;ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width*dpr;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.globalAlpha=1}
 // Two triangles map a photographed material into perspective. Subdivision prevents affine stretching nearby.
 function tri(img,a,b,c,u,v,q,alpha){if(!a||!b||!c)return;const det=u[0]*(v[1]-q[1])+v[0]*(q[1]-u[1])+q[0]*(u[1]-v[1]);if(!det)return;
  const mat=(z1,z2,z3)=>[(z1*(v[1]-q[1])+z2*(q[1]-u[1])+z3*(u[1]-v[1]))/det,(z1*(q[0]-v[0])+z2*(u[0]-q[0])+z3*(v[0]-u[0]))/det,(z1*(v[0]*q[1]-q[0]*v[1])+z2*(q[0]*u[1]-u[0]*q[1])+z3*(u[0]*v[1]-v[0]*u[1]))/det];
  const x=mat(a[0],b[0],c[0]),y=mat(a[1],b[1],c[1]);ctx.save();ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.clip();ctx.globalAlpha=alpha;ctx.setTransform(x[0],y[0],x[1],y[1],x[2],y[2]);ctx.drawImage(img,0,0);ctx.restore();
 }
 function wall(P,vertices,img,shade,alpha){const depth=P(vertices[0]);if(!depth)return;const nx=depth[2]<65?2:1,ny=depth[2]<65?4:1;
  const world=(u,v)=>vertices[0].map((n,j)=>n+(vertices[1][j]-n)*u+(vertices[3][j]-n)*v);
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const u=x/nx,v=y/ny,u2=(x+1)/nx,v2=(y+1)/ny;let a=P(world(u,v)),b=P(world(u2,v)),c=P(world(u2,v2)),d=P(world(u,v2));tri(img,a,b,c,[u*512,v*1024],[u2*512,v*1024],[u2*512,v2*1024],alpha);tri(img,a,c,d,[u*512,v*1024],[u2*512,v2*1024],[u*512,v2*1024],alpha)}
  polygon(vertices.map(P),'#0d1420',shade*alpha);
 }
 function render(){
  const eye=[Math.sin(smooth*Math.PI*1.4)*2+px*.4,17+smooth*11,65-smooth*220],target=[0,15+smooth*8,eye[2]-85];const P=v=>project(v,eye,target);
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#6a798c');sky.addColorStop(.55,'#bac0c0');sky.addColorStop(1,'#424b52');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  polygon([[-300,-.2,eye[2]-3],[300,-.2,eye[2]-3],[300,-.2,-450],[-300,-.2,-450]].map(P),'#31343a');
  for(let side of [-1,1])polygon([[side*7,0,eye[2]-3],[side*11,0,eye[2]-3],[side*11,0,-420],[side*7,0,-420]].map(P),'#777471');
  for(let z=80;z>-430;z-=9){segment(P([-.08,.04,z]),P([-.08,.04,z-4]),'#b9ad8a',1.2,.65);for(let side of [-1,1])segment(P([side*7,.1,z]),P([side*11,.1,z]),'#b7b4a9',.5,.4)}
  const faces=[];
  for(const b of buildings){const l=b.x-b.w/2,r=b.x+b.w/2,f=b.z+b.d/2,k=b.z-b.d/2,top=b.h,mid=P([b.x,top*.5,b.z]);if(!mid||mid[2]>290)continue;
   if(!b.facade)b.facade=facade(b);const alpha=clamp((330-mid[2])/280,.15,1);
   const choices=[[[l,top,f],[r,top,f],[r,0,f],[l,0,f]],[[r,top,k],[l,top,k],[l,0,k],[r,0,k]],[[l,top,k],[l,top,f],[l,0,f],[l,0,k]],[[r,top,f],[r,top,k],[r,0,k],[r,0,f]]];
   choices.forEach((v,i)=>{const normal=[[0,0,1],[0,0,-1],[-1,0,0],[1,0,0]][i];const centre=v[0].map((n,j)=>(n+v[2][j])/2);if(dot(sub(eye,centre),normal)<=0)return;const z=v.reduce((sum,a)=>sum+dot(sub(a,eye),norm(sub(target,eye))),0)/4;if(z>0)faces.push({v,z,b,alpha,shade:[.2,.5,.38,.06][i]})});
   if(eye[1]>top+.2)faces.push({v:[[l,top,f],[r,top,f],[r,top,k],[l,top,k]],z:mid[2],b,alpha,roof:true});
  }
  faces.sort((a,b)=>b.z-a.z);
  for(const face of faces){const {v,b,alpha}=face;if(face.roof){polygon(v.map(P),'#494b4d',alpha);for(let i=0;i<4;i++)segment(P(v[i]),P(v[(i+1)%4]),'#b5ada1',2,alpha*.7);
    if(face.z<100){const x=b.x,y=b.h+.25,z=b.z;polygon([[x-2,y,z-2],[x+1,y,z-2],[x+1,y+1.5,z-2],[x-2,y+1.5,z-2]].map(P),'#696d70',alpha);segment(P([x+3,y,z+2]),P([x+3,y+5,z+2]),'#373e46',1,alpha)}
   }else wall(P,v,b.facade,face.shade,alpha);
  }
  // Thin hanging utility wires establish scale; no giant neon webs obscure the architecture.
  for(let i=0;i<6;i++){const z=30-i*47;let last=null;for(let t=0;t<=1;t+=.04){let pt=P([-13+26*t,25-Math.sin(t*Math.PI)*2,z]);if(last)segment(last,pt,'#222a32',.65,.5);last=pt}}
  const haze=ctx.createLinearGradient(0,0,w,0);haze.addColorStop(0,'#060810d9');haze.addColorStop(.4,'#06081033');haze.addColorStop(.7,'transparent');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
 }
 function frame(t){if(!active){raf=0;return}raf=requestAnimationFrame(frame);if(document.hidden||t-last<33)return;last=t;if(!w)resize();smooth+=((reduced?p:p)-smooth)*(reduced?1:.075);if(dirty||Math.abs(p-smooth)>.0002){render();dirty=false}}
 const obs=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active&&!raf)raf=requestAnimationFrame(frame);if(!active&&raf){cancelAnimationFrame(raf);raf=0}},{rootMargin:'100px'});obs.observe(section);
 canvas.addEventListener('pointermove',e=>{if(reduced)return;px=(e.clientX/canvas.clientWidth-.5)*2;dirty=true},{passive:true});addEventListener('scroll',progress,{passive:true});addEventListener('resize',resize,{passive:true});resize();progress();
})();
