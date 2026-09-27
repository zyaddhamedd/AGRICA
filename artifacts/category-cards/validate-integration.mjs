import fs from "node:fs/promises";
import assert from "node:assert/strict";
const debug="http://127.0.0.1:9338";
const target=await (await fetch(debug+"/json/new?about:blank",{method:"PUT"})).json();
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r,j)=>{ws.addEventListener("open",r,{once:true});ws.addEventListener("error",j,{once:true});});
let id=0;const pending=new Map();const errors=[];const responses=[];
ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==="Runtime.exceptionThrown")errors.push(m.params.exceptionDetails.text);if(m.method==="Network.responseReceived"&&m.params.response.url.includes("/_next/image"))responses.push({url:m.params.response.url,status:m.params.response.status,mime:m.params.response.mimeType,bytes:m.params.response.encodedDataLength});});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async(expression)=>{const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
const wait=async(fn)=>{for(let n=0;n<100;n++){if(await ev(fn))return;await new Promise(r=>setTimeout(r,200));}throw Error("Timed out: "+fn);};
await send("Page.enable");await send("Runtime.enable");await send("Network.enable");
const reports=[];
try {
 for(const [name,width,height] of [["desktop",1440,1000],["mobile",390,844]]){
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:name==="mobile"});
  await send("Page.navigate",{url:"http://localhost:3126/en/"});
  await wait('document.readyState==="complete" && document.querySelectorAll(".world-card-media img").length===3');
  await ev('document.querySelector("#products").scrollIntoView({block:"start",behavior:"instant"})');
  await ev('Promise.all([...document.querySelectorAll(".world-card-media img")].map(async im=>{im.loading="eager";await im.decode();}))');
  await ev('document.fonts.ready');
  await new Promise(r=>setTimeout(r,700));
  const cards=await ev(`[...document.querySelectorAll(".world-card-scene")].map(el=>{const im=el.querySelector("img"),title=el.querySelector(".world-card-front .world-card-title"),cta=el.querySelector(".world-card-front .world-card-footer"),r=el.getBoundingClientRect(),ir=im.getBoundingClientRect();return {key:el.dataset.world,loaded:im.complete&&im.naturalWidth>0,src:im.getAttribute("src"),alt:im.alt,natural:[im.naturalWidth,im.naturalHeight],card:{x:r.x,y:r.y,width:r.width,height:r.height},image:{width:ir.width,height:ir.height},titleAlign:getComputedStyle(title).textAlign,ctaAlign:getComputedStyle(cta).justifyContent,pulse:getComputedStyle(cta.querySelector("span")).animationName,objectPosition:getComputedStyle(im).objectPosition};})`);
  assert.equal(cards.length,3);assert.ok(cards.every(x=>x.loaded));
  assert.ok(cards.every(x=>decodeURIComponent(x.src).includes("/assets/categories/"+x.key+"-master.png")));
  assert.ok(cards.every(x=>x.titleAlign==="center"&&x.ctaAlign==="center"&&x.pulse==="world-card-cta-pulse"));
  const overflow=await ev('document.documentElement.scrollWidth>innerWidth');assert.equal(overflow,false);
  await ev('document.activeElement?.blur(); window.scrollTo({top:0,behavior:"instant"})');
  await new Promise(r=>setTimeout(r,300));
  const rect=await ev('(()=>{const r=document.querySelector("#products").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})()');
  const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{...rect,scale:1}});
  await fs.writeFile("artifacts/category-cards/integrated-"+name+".png",Buffer.from(shot.data,"base64"));
  reports.push({name,width,height,cards,overflow});
 }
 assert.equal(errors.length,0);
 await fs.writeFile("artifacts/category-cards/integration-validation.json",JSON.stringify({reports,errors,imageResponses:responses},null,2));
 console.log(JSON.stringify({viewports:reports.map(r=>({name:r.name,cards:r.cards.map(c=>({key:c.key,loaded:c.loaded,image:c.image})),overflow:r.overflow})),errors,imageResponses:responses.map(r=>({status:r.status,mime:r.mime}))},null,2));
} finally {ws.close();await fetch(debug+"/json/close/"+target.id);}

