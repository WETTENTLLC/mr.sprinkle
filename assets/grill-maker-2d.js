/* Mr. Sprinkle Grill Designer 2.0: precision flat 2D pavé renderer.
   8 crowns per arch; reference-matched silhouettes mirrored across each arch; 40 square settings per crown. */
(function(root){
"use strict";
const NS="http://www.w3.org/2000/svg";
const UPPER=["14","13","12","11","21","22","23","24"];
const LOWER=["44","43","42","41","31","32","33","34"];
const WIDTHS=[168,154,176,214,214,176,154,168];
const HEIGHTS=[332,286,310,330,330,310,286,332];
const METALS={
 silver:{a:"#ffffff",b:"#c7cdd5",c:"#737d8b",edge:"#f3f6fa",seat:"#b8c0cb"},
 gold10k:{a:"#fff0a6",b:"#d29a36",c:"#754411",edge:"#ffe6a0",seat:"#bd8528"},
 gold14k:{a:"#fff2ad",b:"#e3ad36",c:"#8a4d0c",edge:"#ffe9a5",seat:"#d49a2d"},
 dentalGold14k:{a:"#fff6c4",b:"#e4c36a",c:"#98732b",edge:"#fff2b8",seat:"#d7b45b"},
 quote:{a:"#f7e6b0",b:"#b79b5b",c:"#5f4c2b",edge:"#e8d08c",seat:"#a98d4b"}
};
let host=null;
function node(tag,attrs,text){
 const n=document.createElementNS(NS,tag);
 Object.keys(attrs||{}).forEach(k=>n.setAttribute(k,String(attrs[k])));
 if(text!==undefined)n.textContent=text;
 return n;
}
function safe(v){return String(v||"").replace(/[^a-zA-Z0-9_-]/g,"");}
function toothPath(w,h,shape,jaw){
 const upper=jaw==="upper";
 if(shape==="fang"){
  if(upper)return "M "+(-w*.38)+" "+(-h*.37)+" Q "+(-w*.51)+" "+(-h*.55)+" 0 "+(-h*.54)+" Q "+(w*.51)+" "+(-h*.55)+" "+(w*.38)+" "+(-h*.37)+" Q "+(w*.35)+" "+(h*.02)+" 0 "+(h*.50)+" Q "+(-w*.35)+" "+(h*.02)+" "+(-w*.38)+" "+(-h*.37)+" Z";
  return "M "+(-w*.38)+" "+(h*.37)+" Q "+(-w*.51)+" "+(h*.55)+" 0 "+(h*.54)+" Q "+(w*.51)+" "+(h*.55)+" "+(w*.38)+" "+(h*.37)+" Q "+(w*.35)+" "+(-h*.02)+" 0 "+(-h*.50)+" Q "+(-w*.35)+" "+(-h*.02)+" "+(-w*.38)+" "+(h*.37)+" Z";
 }
 if(shape==="oval"){
  return "M 0 "+(-h*.51)+" C "+(w*.37)+" "+(-h*.51)+" "+(w*.48)+" "+(-h*.30)+" "+(w*.47)+" 0 C "+(w*.46)+" "+(h*.34)+" "+(w*.28)+" "+(h*.51)+" 0 "+(h*.51)+" C "+(-w*.28)+" "+(h*.51)+" "+(-w*.46)+" "+(h*.34)+" "+(-w*.47)+" 0 C "+(-w*.48)+" "+(-h*.30)+" "+(-w*.37)+" "+(-h*.51)+" 0 "+(-h*.51)+" Z";
 }
 if(shape==="rounded"){
  return "M "+(-w*.42)+" "+(-h*.43)+" Q "+(-w*.48)+" "+(-h*.50)+" "+(-w*.32)+" "+(-h*.51)+" Q 0 "+(-h*.55)+" "+(w*.32)+" "+(-h*.51)+" Q "+(w*.48)+" "+(-h*.50)+" "+(w*.42)+" "+(-h*.43)+" Q "+(w*.49)+" "+(-h*.20)+" "+(w*.47)+" "+(h*.18)+" Q "+(w*.44)+" "+(h*.49)+" "+(w*.22)+" "+(h*.51)+" Q 0 "+(h*.54)+" "+(-w*.22)+" "+(h*.51)+" Q "+(-w*.44)+" "+(h*.49)+" "+(-w*.47)+" "+(h*.18)+" Q "+(-w*.49)+" "+(-h*.20)+" "+(-w*.42)+" "+(-h*.43)+" Z";
 }
 return "M "+(-w*.43)+" "+(-h*.43)+" Q "+(-w*.48)+" "+(-h*.49)+" "+(-w*.35)+" "+(-h*.51)+" Q 0 "+(-h*.55)+" "+(w*.35)+" "+(-h*.51)+" Q "+(w*.48)+" "+(-h*.49)+" "+(w*.43)+" "+(-h*.43)+" Q "+(w*.48)+" "+(-h*.20)+" "+(w*.48)+" "+(h*.28)+" Q "+(w*.47)+" "+(h*.51)+" "+(w*.27)+" "+(h*.52)+" Q 0 "+(h*.55)+" "+(-w*.27)+" "+(h*.52)+" Q "+(-w*.47)+" "+(h*.51)+" "+(-w*.48)+" "+(h*.28)+" Q "+(-w*.48)+" "+(-h*.20)+" "+(-w*.43)+" "+(-h*.43)+" Z";
}
function addMetal(defs,metal,id){
 const g=node("linearGradient",{id:id,x1:"0",y1:"0",x2:"1",y2:"1"});
 [[0,metal.a],[.28,metal.b],[.55,metal.a],[.78,metal.b],[1,metal.c]].forEach(p=>g.appendChild(node("stop",{offset:(p[0]*100)+"%","stop-color":p[1]})));
 defs.appendChild(g);
 const seat=node("linearGradient",{id:id+"Seat",x1:"0",y1:"0",x2:"1",y2:"1"});
 [[0,metal.a],[.5,metal.seat],[1,metal.c]].forEach(p=>seat.appendChild(node("stop",{offset:(p[0]*100)+"%","stop-color":p[1]})));
 defs.appendChild(seat);
}
function addGem(defs,color){
 const id="gem-"+safe(color);
 if(defs.querySelector("#"+id))return id;
 const isWhite=String(color).toLowerCase()==="#f4f8ff";
 const stops=isWhite?["#ffffff","#e6f3ff","#718da8","#ffffff"]:[color,color,"#ffffff",color];
 const g=node("linearGradient",{id:id,x1:"0",y1:"0",x2:"1",y2:"1"});
 [[0,stops[0]],[.35,stops[1]],[.58,stops[2]],[1,stops[3]]].forEach(p=>g.appendChild(node("stop",{offset:(p[0]*100)+"%","stop-color":p[1]})));
 defs.appendChild(g);return id;
}
function makeTooth(tooth,index,jaw,position,config,metal,defs){
 const w=WIDTHS[index],h=HEIGHTS[index];
 const shape=index===0||index===7?"fang":index===1||index===6?"oval":index===2||index===5?"rounded":"square";
 const fang=shape==="fang";
 const d=toothPath(w,h,shape,jaw),g=node("g",{class:"ms2d-tooth","data-tooth":tooth,"data-jaw":jaw,tabindex:"0",role:"button","aria-label":jaw+" tooth "+tooth+" with forty customizable square settings"});
 const t=node("g",{transform:"translate("+position.x+" "+position.y+")"});
 const selected=new Set((config.teeth||[]).map(String)),sample=selected.size===0,onSet=sample||selected.has(tooth);
 if(!onSet){
  g.appendChild(t);
  g.addEventListener("click",()=>root.dispatchEvent(new CustomEvent("mr-sprinkle:select-tooth",{detail:{tooth:tooth}})));
  return g;
 }
 const key=tooth+"-"+jaw,metalId="metal-"+key,clipId="clip-"+key;
 addMetal(defs,metal,metalId);
 const clip=node("clipPath",{id:clipId});
 clip.appendChild(node("path",{d:d,transform:"scale(.82 .82)"}));defs.appendChild(clip);
 t.appendChild(node("path",{d:d,fill:"#050505",stroke:"#090909","stroke-width":24,"stroke-linejoin":"round",transform:"translate(0 8)"}));
 t.appendChild(node("path",{d:d,fill:"url(#"+metalId+")",stroke:"#6c3906","stroke-width":17,"stroke-linejoin":"round"}));
 t.appendChild(node("path",{d:d,fill:"none",stroke:metal.edge,"stroke-width":7,"stroke-linejoin":"round"}));
 t.appendChild(node("path",{d:d,fill:"none",stroke:"#6b3c0a","stroke-width":3.2,"stroke-linejoin":"round",transform:"scale(.88 .88)"}));
 const surface=node("g",{"clip-path":"url(#"+clipId+")"});
 surface.appendChild(node("path",{d:d,fill:"url(#"+metalId+")",stroke:"#fff1b1","stroke-width":2,transform:"scale(.82 .82)"}));
 const placements=new Set(((config.stoneLayout||{})[tooth]||[]).map(Number));
 const profile=(config.stoneProfiles||{})[tooth]||{};
 const cellColors=(config.stoneCellColors||{})[tooth]||{};
 const profileColor=String(profile.color||"#f4f8ff").toLowerCase();
 for(let row=0;row<8;row++){
  for(let col=0;col<5;col++){
   const cell=row*5+col,rowT=row/7;
   const yy=-h*.31+rowT*h*.62;
   const taper=fang?(jaw==="upper"?1-rowT*.53:.47+rowT*.53):1;
   const xx=(col-2)*w*.145*taper;
   const cw=Math.min(20,w*.115),ch=22,hasGem=placements.has(cell);
   const color=String(cellColors[cell]||profileColor).toLowerCase();
   const seat=node("g",{class:"ms2d-stone-seat","data-tooth":tooth,"data-cell":cell,tabindex:"0",role:"button",
    "aria-label":"Tooth "+tooth+", square "+(cell+1)+" of 40"+(hasGem?", gemstone placed":", metal setting")});
   seat.appendChild(node("rect",{x:xx-cw/2,y:yy-ch/2,width:cw,height:ch,rx:2.1,
    fill:hasGem?"url(#"+addGem(defs,color)+")":"url(#"+metalId+"Seat)",
    stroke:hasGem?"#fff9df":metal.c,"stroke-width":hasGem?1.4:1.05}));
   if(hasGem){
    seat.appendChild(node("path",{d:"M "+(xx-cw*.42)+" "+yy+" L "+xx+" "+(yy-ch*.36)+" L "+(xx+cw*.42)+" "+yy+" L "+xx+" "+(yy+ch*.36)+" Z",fill:"rgba(255,255,255,.44)",stroke:"rgba(255,255,255,.78)","stroke-width":.7}));
    seat.appendChild(node("path",{d:"M "+(xx-cw*.38)+" "+(yy-ch*.34)+" L "+xx+" "+(yy-ch*.08)+" L "+(xx+cw*.38)+" "+(yy-ch*.34),fill:"none",stroke:"#fff","stroke-width":1.1}));
   }else{
    seat.appendChild(node("path",{d:"M "+(xx-cw*.32)+" "+(yy-ch*.27)+" L "+(xx+cw*.32)+" "+(yy+ch*.27),fill:"none",stroke:"rgba(255,255,255,.28)","stroke-width":.8}));
   }
   seat.addEventListener("click",event=>{event.stopPropagation();root.dispatchEvent(new CustomEvent("mr-sprinkle:select-stone-cell",{detail:{tooth:tooth,cell:cell}}));});
   seat.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();seat.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
   surface.appendChild(seat);
  }
 }
 for(let row=0;row<=8;row++){
  const yy=-h*.31+row*h*.62/8;
  surface.appendChild(node("path",{d:"M "+(-w*.36)+" "+yy+" Q 0 "+yy+" "+(w*.36)+" "+yy,fill:"none",stroke:metal.seat,"stroke-width":1.6,opacity:.94}));
 }
 t.appendChild(surface);
 t.appendChild(node("path",{d:"M "+(-w*.30)+" "+(-h*.43)+" Q 0 "+(-h*.52)+" "+(w*.30)+" "+(-h*.43),fill:"none",stroke:"#fff8d6","stroke-width":5,"stroke-linecap":"round",opacity:.86}));
 t.appendChild(node("path",{d:"M "+(-w*.38)+" "+(h*.36)+" Q 0 "+(h*.49)+" "+(w*.38)+" "+(h*.36),fill:"none",stroke:"#fff0a1","stroke-width":3.2,"stroke-linecap":"round",opacity:.7}));
 if(selected.has(tooth))t.appendChild(node("path",{d:d,fill:"none",stroke:"#00c6c9","stroke-width":3.5,"stroke-linejoin":"round",opacity:.9}));
 g.appendChild(t);
 g.addEventListener("click",event=>{if(event.target.closest&&event.target.closest(".ms2d-stone-seat"))return;root.dispatchEvent(new CustomEvent("mr-sprinkle:select-tooth",{detail:{tooth:tooth}}));});
 g.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();root.dispatchEvent(new CustomEvent("mr-sprinkle:select-tooth",{detail:{tooth:tooth}}));}});
 return g;
}
function render(config){
 if(!host)return;
 const c=config||{},metal=METALS[c.metal]||METALS.silver;
 const svg=node("svg",{class:"ms2d-grill-svg",viewBox:"0 0 1600 820",role:"img","aria-label":"Eight upper and eight lower custom grill teeth with forty square positions per tooth"});
 const defs=node("defs",{});
 const bg=node("linearGradient",{id:"ms2d-bg",x1:"0",y1:"0",x2:"0",y2:"1"});
 bg.append(node("stop",{offset:"0%","stop-color":"#050505"}),node("stop",{offset:"100%","stop-color":"#000"}));defs.appendChild(bg);svg.appendChild(defs);
 svg.appendChild(node("rect",{x:0,y:0,width:1600,height:820,fill:"url(#ms2d-bg)"}));
 let x=67;const top=[],bottom=[];
 for(let i=0;i<8;i++){const w=WIDTHS[i];top.push({x:x+w/2,y:214});bottom.push({x:x+w/2,y:620});x+=w+6;}
 const upper=node("g",{class:"ms2d-arch ms2d-arch--upper"}),lower=node("g",{class:"ms2d-arch ms2d-arch--lower"});
 UPPER.forEach((tooth,i)=>upper.appendChild(makeTooth(tooth,i,"upper",top[i],c,metal,defs)));
 LOWER.forEach((tooth,i)=>lower.appendChild(makeTooth(tooth,i,"lower",bottom[i],c,metal,defs)));
 svg.append(upper,lower);host.replaceChildren(svg);host.dataset.ready="true";
}
function update(config){if(!host)host=document.getElementById("grillMaker2D");if(host)render(config||{});}
function init(){
 host=document.getElementById("grillMaker2D");if(!host)return;
 root.addEventListener("mr-sprinkle:grill-config",event=>update(event.detail||{}));
 update(root.__MrSprinkleGrillConfig||{});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
root.MrSprinkleGrill2D=Object.freeze({update:update,render:render,getInventory:()=>({upper:UPPER.slice(),lower:LOWER.slice(),positionsPerTooth:40,totalPositions:640})});
})(typeof window!=="undefined"?window:globalThis);
