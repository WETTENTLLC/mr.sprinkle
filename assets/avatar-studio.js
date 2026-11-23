(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const controls=["avatarPreset","avatarMetal","avatarCoverage","avatarJaw","avatarStones","avatarDetail","avatarFinish"];
  const presets={
    "gold-slugs":{metal:"gold14k",coverage:"6",jaw:"upper",stones:"none",detail:"none",design:"classic",label:"Classic Gold Slugs"},
    "silver-slugs":{metal:"silver",coverage:"6",jaw:"upper",stones:"none",detail:"none",design:"classic",label:"Polished Silver"},
    "gold-fangs":{metal:"gold14k",coverage:"2",jaw:"upper",stones:"none",detail:"none",design:"fangs",label:"Gold Fangs"},
    "black-ice":{metal:"silver",coverage:"8",jaw:"upper",stones:"black",detail:"none",design:"iced",label:"Black Ice"},
    "diamond-smile":{metal:"silver",coverage:"8",jaw:"upper",stones:"clear",detail:"none",design:"iced",label:"Diamond Smile"},
    "deep-cut":{metal:"silver",coverage:"6",jaw:"upper",stones:"none",detail:"deepBar",design:"cut",label:"Deep Cut Silver"}
  };
  const metalNames={gold14k:"14K yellow gold",gold10k:"10K yellow gold",silver:"polished silver"};
  const stoneNames={none:"no stones",clear:"clear stones",black:"black stones",pink:"pink stones"};
  const frontUpper=["13","12","11","21","22","23","14","24"];
  const frontLower=["43","42","41","31","32","33","44","34"];
  const fullUpper=["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
  const fullLower=["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
  const metalColors={gold14k:"#d9ad45",gold10k:"#b9832e",silver:"#c6ced9"};
  let current={...presets["gold-slugs"]};
  function countList(value){return value==="full"?16:Number(value)||6}
  function teethFor(jaw,count){
    const upper=count===16?fullUpper:frontUpper.slice(0,count),lower=count===16?fullLower:frontLower.slice(0,count);
    return jaw==="both"?upper.concat(lower):jaw==="lower"?lower:upper;
  }
  function stoneColor(){return current.stones==="black"?"#17191d":current.stones==="pink"?"#df72a5":"#f4f8ff"}
  function updatePortrait(){
    const group=$("avatarTeeth");group.replaceChildren();
    const rows=current.jaw==="both"?["upper","lower"]:[current.jaw];
    const count=countList(current.coverage);
    const color=metalColors[current.metal]||metalColors.gold14k;
    const teethColor=current.metal==="silver"?"url(#silverTone)":"url(#goldTone)";
    rows.forEach((jaw)=>{
      const y=jaw==="upper"?278:292;
      const width=Math.min(8,count);
      const toothW=count>=8?22:count>=6?26:30;
      const gap=2;
      const total=width*toothW+(width-1)*gap;
      for(let i=0;i<width;i++){
        const x=210-total/2+i*(toothW+gap);
        const h=jaw==="upper"?17:13;
        const tooth=document.createElementNS("http://www.w3.org/2000/svg","rect");
        tooth.setAttribute("x",x);tooth.setAttribute("y",y+(Math.abs(i-(width-1)/2)*.7));tooth.setAttribute("width",toothW);tooth.setAttribute("height",h);tooth.setAttribute("rx",4);tooth.setAttribute("fill",teethColor);tooth.setAttribute("stroke",color);tooth.setAttribute("stroke-width",1.3);group.appendChild(tooth);
        if(current.stones!=="none"){
          const gem=document.createElementNS("http://www.w3.org/2000/svg","circle");
          gem.setAttribute("cx",x+toothW/2);gem.setAttribute("cy",y+7);gem.setAttribute("r",2.8);gem.setAttribute("fill",stoneColor());gem.setAttribute("stroke",current.stones==="black"?"#69717b":"#fff");gem.setAttribute("stroke-width",.8);group.appendChild(gem);
        }
      }
    });
    if(current.detail==="centerSplit"||current.detail==="deepBar"){
      const line=document.createElementNS("http://www.w3.org/2000/svg","path");
      line.setAttribute("d",current.detail==="centerSplit"?"M210 279 v15":"M185 279 v14 M235 279 v14");line.setAttribute("stroke",current.metal==="silver"?"#69717b":"#805819");line.setAttribute("stroke-width",2);group.appendChild(line);
    }
    if(current.detail==="openFace"){
      const heart=document.createElementNS("http://www.w3.org/2000/svg","path");
      heart.setAttribute("d","M210 286 C201 278 190 282 210 299 C230 282 219 278 210 286Z");heart.setAttribute("fill","none");heart.setAttribute("stroke",color);heart.setAttribute("stroke-width",2);group.appendChild(heart);
    }
    $("avatarStyleLabel").textContent=(metalNames[current.metal]||"Custom metal").toUpperCase()+" · "+current.label.toUpperCase();
    $("avatarPortrait").dataset.finish=current.finish||"street";
    $("avatarHoodie").setAttribute("fill",current.finish==="clean"?"#263344":"url(#hoodieTone)");
    $("avatarStageLabel").querySelector("span").textContent=current.finish==="clean"?"CLEAN AVATAR PREVIEW":"STREETWEAR AVATAR PREVIEW";
  }
  function buildConfig(){
    const teeth=teethFor(current.jaw,countList(current.coverage));
    const stones=current.stones==="none"?"none":"labGrownDiamond";
    const profileColor=stoneColor();
    const stoneProfiles={};const stoneLayout={};
    teeth.forEach((tooth)=>{if(stones!=="none"){stoneProfiles[tooth]={manual:true,type:"labGrownDiamond",color:profileColor,shape:"round"};stoneLayout[tooth]=[6,8,12,16,18];}});
    return {teeth,metal:current.metal,design:current.design==="fangs"?"fangs":"classic",stones,stoneCount:stones==="none"?0:teeth.length*5,size:"1.3",stoneShape:"round",stoneTeeth:stones==="none"?[]:teeth,stoneLayout,stoneProfiles,cuts:current.detail==="none"?[]:[current.detail]};
  }
  function sync(){
    current={...current,metal:$("avatarMetal").value,coverage:$("avatarCoverage").value,jaw:$("avatarJaw").value,stones:$("avatarStones").value,detail:$("avatarDetail").value,finish:$("avatarFinish").value};
    const activePreset=presets[$("avatarPreset").value]||presets["gold-slugs"];
    const stillPreset=["metal","coverage","jaw","stones","detail"].every(key=>current[key]===activePreset[key]);
    current.label=stillPreset?activePreset.label:"Custom Grillz";
    const spec=buildConfig();
    window.__MrSprinkleGrillConfig=spec;
    if(window.MrSprinkleGrill3D&&typeof window.MrSprinkleGrill3D.update==="function")window.MrSprinkleGrill3D.update(spec);
    window.dispatchEvent(new CustomEvent("mr-sprinkle:grill-config",{detail:spec}));
    updatePortrait();
    const jawLabel=current.jaw==="both"?"upper + lower":current.jaw;
    $("avatarSpecTitle").textContent=current.label;
    $("avatarSpecSummary").textContent=spec.teeth.length+" teeth · "+metalNames[current.metal]+" · "+stoneNames[current.stones]+" · "+jawLabel;
    $("requestAvatarQuote").href="sms:+15302140676?&body="+encodeURIComponent("Hi Mr. Sprinkle! I'd like a quote for this grillz design concept: "+current.label+". "+$("avatarSpecSummary").textContent+". This is a digital concept; please confirm the physical design and price.");
  }
  function applyPreset(id){
    const p=presets[id]||presets["gold-slugs"];current={...p};
    $("avatarMetal").value=p.metal;$("avatarCoverage").value=p.coverage;$("avatarJaw").value=p.jaw;$("avatarStones").value=p.stones;$("avatarDetail").value=p.detail;
    sync();
  }
  $("avatarPreset").addEventListener("change",()=>applyPreset($("avatarPreset").value));
  controls.slice(1).forEach(id=>$(id).addEventListener("change",sync));
  $("saveAvatarSpec").addEventListener("click",()=>{
    const payload={brand:"Mr. Sprinkle",schemaVersion:"1.0.0",designId:"MS-"+current.label.toUpperCase().replace(/[^A-Z0-9]+/g,"-"),createdAt:new Date().toISOString(),label:current.label,avatar:{style:current.finish||"street"},configuration:buildConfig(),commercialStatus:"concept-only-no-game-integration",notes:"Digital concept only. Confirm physical materials, stone setting, fit and final price separately. No GTA VI or Rockstar integration is included."};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="mr-sprinkle-digital-grillz-design.json";a.click();URL.revokeObjectURL(url);
  });
  $("saveAvatarPng").addEventListener("click",()=>{
    const svg=$("avatarPortrait").cloneNode(true);
    svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
    svg.setAttribute("width","840");svg.setAttribute("height","940");
    const source=new XMLSerializer().serializeToString(svg);
    const image=new Image();const blob=new Blob([source],{type:"image/svg+xml;charset=utf-8"});const url=URL.createObjectURL(blob);
    image.onload=()=>{const canvas=document.createElement("canvas");canvas.width=840;canvas.height=940;const ctx=canvas.getContext("2d");ctx.fillStyle="#101012";ctx.fillRect(0,0,840,940);ctx.drawImage(image,0,0,840,940);URL.revokeObjectURL(url);const a=document.createElement("a");a.download="mr-sprinkle-avatar-look.png";a.href=canvas.toDataURL("image/png");a.click();};
    image.onerror=()=>{URL.revokeObjectURL(url);alert("The avatar image could not be exported in this browser. Please try the design file download.");};image.src=url;
  });
  window.addEventListener("mr-sprinkle:grill-renderer-ready",sync);
  applyPreset("gold-slugs");
})();