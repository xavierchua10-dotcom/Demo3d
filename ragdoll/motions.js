/* Motion catalogue: each returns {A,B,prop,muscle,...}. Coordinates are in the 300x240 figure box (floor y=212). */
(function(g){
var FL = 212, F = [150,206];
function ST(o){ return Object.assign({hx:150,hy:121,tor:0,ft:[150,206],kb:-1,eb:1,nk:0,hl:[-62,4]}, o||{}); }
function SEAT(o){ return Object.assign({hx:140,hy:158,tor:-4,ft:[186,206],kb:-1,eb:1,nk:0,hl:[-62,4]}, o||{}); }
var PADC = '#2a2d33', PADS = '#4a4f58';
function benchScene(K){
  var b = [-K.n[0]*17, -K.n[1]*17], a = [K.H[0]-K.t[0]*10+b[0], K.H[1]-K.t[1]*10+b[1]], c = [K.S[0]+K.t[0]*24+b[0], K.S[1]+K.t[1]*24+b[1]];
  var out = [{k:'l',a:a,b:[a[0],FL],w:5,c:'#3a3e46'},{k:'l',a:c,b:[c[0],FL],w:5,c:'#3a3e46'},{k:'l',a:a,b:c,w:10,c:PADC}];
  if (K.t[1] > 0.1){ // decline: bench runs on under the legs, ankles hooked under a roller
    var d = [-K.t[0], -K.t[1]], e = [a[0]+d[0]*84, a[1]+d[1]*84];
    out.push({k:'l',a:a,b:e,w:10,c:PADC},{k:'l',a:e,b:[e[0],FL],w:5,c:'#3a3e46'},{k:'l',a:[K.ank[0]-3,K.ank[1]-11],b:[K.ank[0]+3,K.ank[1]-11],w:9,c:'#3a3e46'});
  }
  return out;
}
function seatScene(x,y,backTop){
  return function(){ return [{k:'l',a:[x+8,y+8],b:[x+8,FL],w:5,c:'#3a3e46'},{k:'r',x:x-22,y:y,w:60,h:9,r:4},{k:'l',a:[x-26,y+2],b:[x-34,backTop||70],w:9,c:PADC}]; };
}
function rack(){ return []; }
function pullBar(y){ return [{k:'l',a:[100,y],b:[200,y],w:5,c:'#5a606b'},{k:'l',a:[100,y],b:[100,y-2],w:2,c:'#5a606b'}]; }
var M = {};

// ---------- chest ----------
M.bench = function(inc, prop, muscle, close){
  var a = -90 + inc, hy = inc < 0 ? 140 : 152, S = {hx:218,hy:hy,tor:a,ft:inc<0?[296,119]:[262,206],kb:-1,eb:1,nk:0,hl:[4,64],lz:0.08,hz:close?-0.08:0.1,ez:close?-0.02:0.08};
  var sp = {A:S, B:{hl:[-12,16],ez:close?0.0:0.16}, prop:prop, muscle:muscle||'chest', scene:benchScene};
  return sp;
};
M.machineBench = function(){
  return {A:SEAT({tor:-6,hl:[-4,20]}), B:{hl:[-4,62]}, prop:'lever', pivot:[118,156], muscle:'chest', scene:function(){
    var o = seatScene(138,166,60)();
    o.push({k:'r',x:56,y:52,w:36,h:152,r:4},{k:'r',x:52,y:44,w:44,h:10,r:3},
      {k:'l',a:[74,70],b:[74,196],w:3,c:'#6b717c'},{k:'l',a:[62,98],b:[86,98],w:4,c:'#d94b4b'},
      {k:'l',a:[60,FL-3],b:[190,FL-3],w:6,c:'#2b2e35'},
      {k:'l',a:[128,174],b:[158,FL-3],w:5,c:'#3a3e46'},
      {k:'l',a:[118,150],b:[118,166],w:7,c:'#2b2e35'});
    return o; }};
};
M.fly = function(){ // lying DB fly
  return {A:{hx:218,hy:152,tor:-90,ft:[262,206],kb:-1,eb:-1,nk:0,hl:[2,16],fl:92,lz:0.08}, B:{hl:[0,64],fl:-8}, prop:'db', muscle:'chest', scene:benchScene, tempo:[1.5,0.3,1.5,0.3], wide:true};
};
M.cableFly = function(kind){
  var low = kind === 'Incline', high = kind === 'Decline';
  var anc = low ? [100,200] : (high ? [100,24] : [100,92]);
  var fe0 = low ? -34 : (high ? 34 : -4), fe1 = low ? 30 : (high ? -36 : -8);
  return {A:ST({tor:10,hl:[-6,10],eb:1,hy:122,fl:84,fe:fe0}), B:ST({tor:10,hl:[-14,56],hy:122,fl:6,fe:fe1}), prop:'cable', anchor:anc, twin:true, wide:true, tempo:[1.3,0.3,1.3,0.3], muscle:'chest', scene:function(){ return [{k:'l',a:[anc[0]-8,anc[1]],b:[anc[0]-8,FL],w:8,c:'#33363d'}]; }};
};
M.pecDeck = function(){
  return {A:SEAT({tor:-4,hl:[-2,2],fl:78,fd:1}), B:{hl:[-6,50],fl:8}, prop:'lever', pivot:[140,40], wide:true, tempo:[1.4,0.3,1.4,0.3], muscle:'chest', scene:seatScene(138,166,60)};
};
M.cablePress = function(){
  return {A:ST({tor:8,hy:122,hl:[-6,22]}), B:ST({tor:8,hy:122,hl:[-6,62]}), prop:'cable', anchor:[40,72], twin:true, colTop:22, muscle:'chest', scene:function(){ return [{k:'l',a:[32,22],b:[32,FL],w:8,c:'#33363d'}]; }};
};
M.pushup = function(){
  var hd=[203,205], ft=[60,205];
  return {A:{hx:138,hy:169,tor:65.7,ft:ft,kb:-1,eb:1,nk:-40,hd:hd}, B:{hx:145,hy:187,tor:81.3}, muscle:'chest'};
};
M.dips = function(muscle){
  var bars = function(){ return [{k:'l',a:[112,130],b:[196,130],w:5,c:'#5a606b'},{k:'l',a:[116,130],b:[116,FL],w:5,c:'#3a3e46'},{k:'l',a:[192,130],b:[192,FL],w:5,c:'#3a3e46'}]; };
  return {A:{hx:140,hy:123,tor:10,ft:[106,160],kb:-1,eb:1,nk:0,hd:[150,127]}, B:{hx:139.5,hy:141,tor:18,ft:[104,176]}, muscle:muscle||'triceps', scene:bars};
};

// ---------- back ----------
M.pullup = function(){
  return {A:{hx:150,hy:148,tor:0,ft:[122,184],kb:-1,eb:1,nk:0,hd:[160,22]}, B:{hy:108,ft:[122,144]}, muscle:'back', scene:function(){ return [{k:'l',a:[100,20],b:[204,20],w:5,c:'#5a606b'},{k:'l',a:[100,20],b:[100,FL],w:4,c:'#2b2e35'},{k:'l',a:[204,20],b:[204,FL],w:4,c:'#2b2e35'}]; }};
};
M.hang = function(){
  return {A:{hx:150,hy:140,tor:0,ft:[122,178],kb:-1,eb:1,nk:0,hd:[158,14]}, B:{hy:144,ft:[122,182]}, muscle:'forearms', tempo:[1.4,0.1,1.4,0.1], scene:function(){ return [{k:'l',a:[100,12],b:[204,12],w:5,c:'#5a606b'},{k:'l',a:[100,12],b:[100,FL],w:4,c:'#2b2e35'},{k:'l',a:[204,12],b:[204,FL],w:4,c:'#2b2e35'}]; }};
};
M.pulldown = function(machine){
  var ex = {A:SEAT({hx:138,tor:-2,hl:[62,12],eb:1}), B:{tor:-10,hl:[-12,24],eb:1}, prop:'cable', anchor:[170,14], muscle:'back',
    scene:function(){ return [{k:'l',a:[170,10],b:[170,14],w:4,c:'#5a606b'},{k:'l',a:[150,10],b:[210,10],w:6,c:'#33363d'},{k:'l',a:[205,10],b:[205,FL],w:8,c:'#33363d'},{k:'r',x:138-22,y:166,w:60,h:9,r:4},{k:'l',a:[138+8,175],b:[138+8,FL],w:5,c:'#3a3e46'},{k:'l',a:[168,144],b:[188,148],w:9,c:PADC},{k:'l',a:[178,146],b:[178,100],w:3,c:'#33363d'}]; }};
  return ex;
};
M.rowBent = function(prop, muscle){
  return {A:{hx:120,hy:122,tor:54,ft:[150,206],kb:-1,eb:1,nk:-35,hs:[6,58]}, B:{hs:[-18,26]}, prop:prop, muscle:muscle||'back'};
};
M.rowSeated = function(machine){
  var base = {hx:128,hy:160,tor:-2,ft:[196,192],kb:-1,eb:1,nk:0,hs:[60,22]};
  return {A:base, B:{tor:-12,hs:[8,28]}, prop:machine?'lever':'cable', anchor:[262,128], pivot:[230,125], muscle:'back',
    scene:function(K){ var o=[{k:'r',x:100,y:168,w:56,h:9,r:4},{k:'l',a:[108,176],b:[108,FL],w:5,c:'#3a3e46'},{k:'l',a:[200,200],b:[216,184],w:6,c:'#3a3e46'},{k:'l',a:[262,100],b:[262,FL],w:8,c:'#33363d'}]; if (machine && K) o.push({k:'l',a:[K.S[0]+13,K.S[1]+14],b:[K.S[0]+13,K.S[1]+46],w:9,c:PADC},{k:'l',a:[K.S[0]+13,K.S[1]+46],b:[K.S[0]+13,FL],w:5,c:'#3a3e46'}); return o; }};
};
M.rowOne = function(){
  return {A:{hx:112,hy:122,tor:75,ft:[112,206],kb:-1,eb:1,nk:-40,hs:[4,54],hd2:[190,142]}, B:{hs:[-20,20]}, prop:'db', muscle:'back',
    scene:function(){ return [{k:'r',x:150,y:150,w:90,h:9,r:4},{k:'l',a:[160,159],b:[160,FL],w:5,c:'#3a3e46'},{k:'l',a:[230,159],b:[230,FL],w:5,c:'#3a3e46'}]; }};
};
M.pullover = function(){ // standing straight-arm pulldown: arms stay straight and sweep an arc from overhead-forward down to the thighs
  var A = ST({hx:146,hy:126,tor:18,ft:[150,206],hl:undefined,as:146}), B = {as:14};
  return {A:A, B:B, prop:'cable', anchor:[214,10], muscle:'back', tempo:[1.4,0.3,1.4,0.3], scene:function(){ return [{k:'l',a:[224,8],b:[224,FL],w:8,c:'#33363d'},{k:'l',a:[204,10],b:[226,10],w:5,c:'#33363d'}]; }};
};
M.deadlift = function(sumo, prop){
  return {A:{hx:sumo?124:118,hy:sumo?158:150,tor:sumo?52:62,ft:[150,206],kb:-1,eb:1,nk:-30,hd:[sumo?170:172,190]}, B:ST({hl:undefined,hd:[158,130]}), prop:prop||'bar', muscle:'back', pr:17};
};

// ---------- shoulders ----------
M.ohp = function(prop, seated, arnold){
  var A = seated ? SEAT({tor:-3,hl:[-6,arnold?16:10],eb:1}) : ST({hl:[-4,arnold?14:10],eb:1});
  var B = seated ? {hl:[62,4]} : {hl:[62,4]};
  var sp = {A:A, B:B, prop:prop, muscle:'shoulders'};
  if (seated) sp.scene = seatScene(138,166,64);
  if (prop === 'cable') sp.anchor = [60,205];
  if (prop === 'lever') sp.pivot = [102,116];
  return sp;
};
M.latRaise = function(prop){
  var sp = {A:ST({hl:[-60,6],eb:1,zs:0}), B:ST({hl:[-2,44],eb:1,zs:0.32}), prop:prop, muscle:'shoulders'};
  if (prop === 'cable') sp.anchor = [100,200];
  if (prop === 'lever'){ sp.A = SEAT({tor:-3,hl:[-58,8],zs:0}); sp.B = {hl:[-4,44],eb:1,zs:0.32}; sp.pivot = [100,110]; sp.scene = seatScene(138,166,64); }
  return sp;
};
M.frontRaise = function(prop){
  var sp = {A:ST({hl:[-62,10],eb:1}), B:ST({hl:[2,62],eb:1}), prop:prop, muscle:'shoulders'};
  if (prop === 'cable') sp.anchor = [60,205];
  return sp;
};
M.rearFly = function(prop){
  if (prop === 'cable') return {A:ST({tor:6,hl:undefined,hs:[60,6],eb:1}), B:{hs:[16,4]}, prop:'cable', anchor:[232,72], muscle:'shoulders', tempo:[1.3,0.3,1.3,0.3], scene:function(){ return [{k:'l',a:[226,22],b:[226,FL],w:8,c:'#33363d'}]; }};
  var sp = {A:{hx:118,hy:138,tor:66,ft:[150,206],kb:-1,eb:1,nk:-40,hs:[8,60],zs:0}, B:{hs:[-4,16],eb:1,zs:0.3}, prop:prop, muscle:'shoulders'};
  return sp;
};

M.facePull = function(){
  return {A:ST({tor:-4,hl:[-2,60],eb:1}), B:ST({tor:-4,hl:[22,16],eb:-1}), prop:'cable', anchor:[250,60], muscle:'shoulders', scene:function(){ return [{k:'l',a:[256,50],b:[256,FL],w:8,c:'#33363d'}]; }};
};
M.shrug = function(prop){
  var sp = {A:ST({hl:[-62,4]}), B:{sh:10}, prop:prop, muscle:'traps', tempo:[0.6,0.35,0.9,0.2]};
  if (prop === 'cable') sp.anchor = [150,205];
  return sp;
};
M.upright = function(prop){
  return {A:ST({hl:[-62,6],eb:1,eo:[2,34]}), B:{hl:[-18,18],eo:[6,-10]}, prop:prop, muscle:'traps'};
};

// ---------- arms ----------
M.curl = function(prop, kind){
  var A = ST({hl:[-62,4],eb:1}), B = {hl:[-8,32]}, sp = {A:A, B:B, prop:prop, muscle:'biceps'};
  if (prop === 'bar' || prop === 'ez') sp.pr = 14;
  if (prop === 'cable') sp.anchor = [210,204];
  if (kind === 'preacher'){
    sp.A = SEAT({hx:128,hy:158,tor:14,hl:[-30,50]}); sp.B = {hl:[-6,30]};
    sp.scene = function(K){ var p0 = [K.S[0]+K.n[0]*14-K.t[0]*4, K.S[1]+K.n[1]*14-K.t[1]*4], p1 = [K.S[0]+K.n[0]*52-K.t[0]*56, K.S[1]+K.n[1]*52-K.t[1]*56]; return [{k:'r',x:106,y:166,w:50,h:9,r:4},{k:'l',a:[114,175],b:[114,FL],w:5,c:'#3a3e46'},{k:'l',a:p0,b:p1,w:13,c:PADC},{k:'l',a:[p1[0]-6,p1[1]],b:[p1[0]-14,FL],w:5,c:'#3a3e46'}]; };
  }
  if (kind === 'conc'){
    sp.A = SEAT({hx:138,hy:158,tor:58,hl:undefined,hd:[184,193],ft:[188,206],nk:-14}); sp.B = {hd:[200,134]};
    sp.scene = function(){ return [{k:'r',x:114,y:166,w:62,h:9,r:4},{k:'l',a:[122,175],b:[122,FL],w:5,c:'#3a3e46'},{k:'l',a:[168,175],b:[168,FL],w:5,c:'#3a3e46'}]; };
  }
  return sp;
};
M.pushdown = function(){
  return {A:ST({hl:[-22,22],eb:1}), B:ST({hl:[-58,8],eb:1}), prop:'cable', anchor:[190,14], muscle:'triceps', scene:function(){ return [{k:'l',a:[190,10],b:[190,FL],w:8,c:'#33363d'},{k:'l',a:[160,10],b:[220,10],w:6,c:'#33363d'}]; }};
};
M.skull = function(prop){
  return {A:{hx:218,hy:152,tor:-90,ft:[262,206],kb:-1,eb:1,nk:0,hl:[14,62]}, B:{hl:[26,22],eb:1}, prop:prop, muscle:'triceps', scene:benchScene, pr:15};
};
M.overheadExt = function(prop){
  var sp = {A:ST({hl:[64,2],eb:1}), B:{hl:[8,-24],eb:1}, prop:prop, muscle:'triceps'};
  if (prop === 'cable') sp.anchor = [60,200];
  return sp;
};
M.kickback = function(prop){
  var sp = {A:{hx:120,hy:122,tor:62,ft:[150,206],kb:-1,eb:1,nk:-35,hs:[-34,36]}, B:{hs:[-64,6]}, prop:prop, muscle:'triceps'};
  if (prop === 'cable') sp.anchor = [240,205];
  return sp;
};
M.wrist = function(prop){
  var sp = {A:SEAT({tor:24,hd:[190,152],eb:1,hl:undefined}), B:{hd:[192,138]}, prop:prop, muscle:'forearms',
    scene:function(){ return [{k:'r',x:114,y:166,w:62,h:9,r:4},{k:'l',a:[122,175],b:[122,FL],w:5,c:'#3a3e46'},{k:'l',a:[168,175],b:[168,FL],w:5,c:'#3a3e46'}]; }};
  delete sp.A.hl;
  if (prop === 'cable') sp.anchor = [250,206];
  return sp;
};

// ---------- core ----------
M.crunch = function(){
  return {A:{hx:210,hy:198,tor:-90,ft:[246,206],kb:-1,eb:1,nk:0,hs:[-12,-6]}, B:{tor:-58,nk:-6}, muscle:'abs', tempo:[0.8,0.2,0.8,0.2]};
};
M.plank = function(){
  return {A:{hx:132,hy:181,tor:80,ft:[48,204],kb:-1,eb:1,nk:-60,hd:[226,205]}, B:{hy:178}, muscle:'abs', tempo:[1.4,0.2,1.4,0.2]};
};
M.legRaise = function(){
  return {A:{hx:150,hy:140,tor:0,ft:[128,178],kb:-1,eb:-1,nk:0,hd:[152,16]}, B:{tor:-6,ft:[234,138]}, muscle:'abs', scene:function(){ return [{k:'l',a:[100,12],b:[204,12],w:5,c:'#5a606b'},{k:'l',a:[100,12],b:[100,FL],w:4,c:'#2b2e35'},{k:'l',a:[204,12],b:[204,FL],w:4,c:'#2b2e35'}]; }};
};
M.cableCrunch = function(){
  return {A:{hx:140,hy:160,tor:0,ft:[96,205],kb:-1,eb:-1,nk:0,hl:[2,16]}, B:{tor:55,hy:164,hl:[-4,12]}, prop:'cable', anchor:[160,14], muscle:'abs',
    scene:function(){ return [{k:'l',a:[160,10],b:[160,FL],w:8,c:'#33363d'},{k:'r',x:150,y:196,w:40,h:10,r:3}]; }};
};
M.pallof = function(){
  return {A:ST({tor:2,hl:[-2,16]}), B:ST({tor:2,hl:[-2,60]}), prop:'cable', anchor:[262,96], muscle:'abs', scene:function(){ return [{k:'l',a:[262,86],b:[262,FL],w:8,c:'#33363d'}]; }};
};
M.twist = function(){
  return {A:{hx:150,hy:196,tor:-38,ft:[222,168],kb:-1,eb:1,nk:0,hl:[-8,26]}, B:{hl:[-16,16]}, prop:'db', muscle:'abs', tempo:[0.7,0.1,0.7,0.1]};
};
M.abWheel = function(){
  return {A:{hx:104,hy:162,tor:55,ft:[62,205],kb:-1,eb:1,nk:-30,hd:[150,197]}, B:{hx:148,hy:187,tor:82,hd:[258,203],nk:-50,ft:[68,205]}, prop:'wheel', muscle:'abs'};
};

// ---------- legs ----------
M.squat = function(kind){
  var A = ST({tor:2,hl:undefined}), B = ST({hx:112,hy:168,tor:36});
  var sp = {A:A, B:B, muscle:'quads'};
  delete sp.A.hl; delete B.hl;
  if (kind === 'back'){ A.hs=[-4,-2]; sp.prop='bar'; sp.ps=[-8,-4]; sp.pr=15; A.eb=-1; }
  else if (kind === 'front'){ A.hs=[12,2]; sp.prop='bar'; sp.ps=[10,0]; sp.pr=15; A.eb=-1; }
  else { A.hs=[14,12]; sp.prop='db'; A.eb=1; }
  sp.A = A; sp.B = {hx:112,hy:168,tor:36};
  if (kind === 'goblet') sp.B.tor = 28;
  return sp;
};
M.legPress = function(calf){
  if (calf) return M.calfPress();
  var A = {hx:118,hy:172,tor:-52,ft:[188,125],kb:-1,eb:1,nk:0,hd:[100,152],fa:-122}, B = {ft:[150,148]};
  return {A:A, B:B, prop:'sled', lp:true, muscle:'quads', scene:function(K){
    var bx = -K.n[0]*17, by = -K.n[1]*17, H = K.H, S = K.S, t = K.t;
    return [{k:'l',a:[96,186],b:[236,96],w:6,c:'#33363d'},
      {k:'l',a:[H[0]-t[0]*10+bx, H[1]-t[1]*10+by],b:[S[0]+t[0]*26+bx, S[1]+t[1]*26+by],w:10,c:PADC},
      {k:'l',a:[H[0]-4+bx*0.55, H[1]+by*0.55+2],b:[H[0]+22+bx*0.55, H[1]-5+by*0.55],w:9,c:PADC}]; }};
};
M.calfPress = function(){
  return {A:{hx:126,hy:160,tor:-12,ft:[210,152],kb:-1,eb:1,nk:0,hd:[136,150],fa:-14}, B:{fa:30}, muscle:'calves', tempo:[0.9,0.3,0.9,0.3],
    scene:function(K){ var o = seatScene(138,166,64)(); o.push({k:'r',x:226,y:112,w:7,h:84,r:2},{k:'l',a:[229,196],b:[229,FL],w:6,c:'#2b2e35'},{k:'l',a:[150,FL-5],b:[240,FL-5],w:6,c:'#2b2e35'},{k:'l',a:[150,176],b:[132,184],w:6,c:'#3a3e46'}); return o; }};
};
M.lunge = function(prop){
  var A = ST({hx:143,hy:121,tor:0,ft:[168,206],ft2:[118,206],hl:[-62,4]}), B = {hx:143,hy:156,tor:3,ft:[186,206],ft2:[94,204],fa2:-35};
  var sp = {A:A, B:B, prop:prop, muscle:'quads'};
  if (prop === 'bar'){ delete A.hl; A.hs=[-4,-2]; A.eb=-1; sp.ps=[-8,-4]; sp.pr=15; }
  if (prop === 'none'){ delete A.hl; A.hs=[12,26]; A.eb=1; }
  return sp;
};
M.bulgarian = function(prop, muscle){
  var A = ST({hx:150,hy:128,tor:0,ft:[178,206],ft2:[96,170],hl:[-62,4]}), B = {hx:146,hy:154,tor:6,ft:[182,206],ft2:[96,168],fa2:-60};
  return {A:A, B:B, prop:prop==='db'?'db':'none', muscle:muscle||'quads', scene:function(){ return [{k:'r',x:62,y:172,w:46,h:9,r:3},{k:'l',a:[70,181],b:[70,FL],w:5,c:'#3a3e46'},{k:'l',a:[100,181],b:[100,FL],w:5,c:'#3a3e46'}]; }};
};
M.legExt = function(){
  return {A:{hx:128,hy:160,tor:-8,ft:[176,206],kb:-1,eb:1,nk:0,hd:[132,162]}, B:{ft:[213,152]}, prop:'pad', attach:'ank', muscle:'quads',
    scene:function(){ return [{k:'r',x:100,y:168,w:60,h:9,r:4},{k:'l',a:[108,177],b:[108,FL],w:5,c:'#3a3e46'},{k:'l',a:[104,166],b:[94,92],w:9,c:PADC}]; }};
};
M.legCurlSeated = function(){
  return {A:{hx:128,hy:160,tor:-8,ft:[213,160],kb:-1,eb:1,nk:0,hd:[132,162]}, B:{ft:[174,206]}, prop:'pad', attach:'ank', muscle:'hamstrings',
    scene:function(K){
      var u = [K.knee[0]-K.H[0], K.knee[1]-K.H[1]], l = Math.sqrt(u[0]*u[0]+u[1]*u[1]) || 1; u = [u[0]/l, u[1]/l];
      var nr = [u[1], -u[0]], pa = [K.H[0]+u[0]*20+nr[0]*12, K.H[1]+u[1]*20+nr[1]*12], pb = [K.knee[0]-u[0]*6+nr[0]*12, K.knee[1]-u[1]*6+nr[1]*12], pm = [(pa[0]+pb[0])/2, (pa[1]+pb[1])/2], top = [pm[0]+2, pm[1]-30];
      return [{k:'l',a:pa,b:pb,w:9,c:PADC},{k:'l',a:[pm[0]+nr[0]*4,pm[1]+nr[1]*4],b:top,w:5,c:'#3a3e46'},{k:'l',a:top,b:[top[0]-36,top[1]-2],w:5,c:'#3a3e46'},
        {k:'r',x:100,y:168,w:60,h:9,r:4},{k:'l',a:[108,177],b:[108,FL],w:5,c:'#3a3e46'},{k:'l',a:[104,166],b:[94,92],w:9,c:PADC}]; }};
};
M.legCurlLying = function(){
  return {A:{hx:196,hy:150,tor:90,ft:[112,152],kb:-1,eb:-1,nk:-30,hd:[250,160]}, B:{ft:[156,108],kb:-1}, prop:'pad', attach:'ank', muscle:'hamstrings',
    scene:function(){ return [{k:'l',a:[80,170],b:[262,170],w:10,c:PADC},{k:'l',a:[96,170],b:[96,FL],w:5,c:'#3a3e46'},{k:'l',a:[240,170],b:[240,FL],w:5,c:'#3a3e46'}]; }};
};
M.nordic = function(){
  return {A:{hx:150,hy:162,tor:0,ft:[108,205],kb:-1,eb:1,nk:0,hs:[16,26],hl:undefined}, B:{hx:191,hy:186,tor:70,hs:[6,36]}, muscle:'hamstrings', tempo:[1.5,0.3,1.0,0.3],
    scene:function(){ return [{k:'r',x:132,y:204,w:36,h:6,r:3}]; }};
};
M.rdl = function(prop, kind){
  var A = ST({hl:[-62,4]}), B = {hx:122,hy:128,tor:64,nk:-20}, sp = {A:A, B:B, prop:prop, muscle:'hamstrings'};
  delete A.hl; A.hs=[3,62]; B.hs=[-12,62];
  if (kind === 'gm'){ A.hs=[-4,-2]; B.hs=[-4,-2]; A.eb=-1; B.eb=-1; sp.ps=[-8,-4]; sp.pr=15; sp.prop='bar'; }
  if (prop === 'cable'){ sp.anchor = [40,200]; }
  return sp;
};
M.hipThrust = function(prop, muscle){
  var A = {hx:178,hy:192,tor:-46,ft:[236,206],kb:-1,eb:1,nk:-10,hh:[10,-8]}, B = {hx:195,hy:150,tor:-90};
  var sp = {A:A, B:B, prop:prop, muscle:muscle||'glutes', scene:function(){ return [{k:'r',x:70,y:166,w:62,h:10,r:4},{k:'l',a:[80,176],b:[80,FL],w:5,c:'#3a3e46'},{k:'l',a:[122,176],b:[122,FL],w:5,c:'#3a3e46'}]; }};
  if (prop === 'bar' || prop === 'ez'){ sp.ph = [0,-12]; sp.pr = 15; }
  if (prop === 'cable'){ sp.anchor = [200,206]; sp.ph = [0,-12]; }
  if (prop === 'lever'){ sp.pivot = [262,150]; }
  return sp;
};
M.bridge = function(){
  return {A:{hx:190,hy:199,tor:-90,ft:[236,206],kb:-1,eb:1,nk:0,hd:[192,206]}, B:{hx:179,hy:166,tor:-125,nk:35}, muscle:'glutes', tempo:[0.8,0.45,0.8,0.2]};
};
M.glutKick = function(){
  return {A:{hx:150,hy:124,tor:28,ft:[160,206],ft2:[148,176],kb:-1,eb:1,nk:-20,hd:[196,100]}, B:{ft2:[92,160]}, prop:'cable', anchor:[200,206], muscle:'glutes', attach:'ankF',
    scene:function(){ return [{k:'l',a:[204,90],b:[204,FL],w:10,c:'#33363d'}]; }};
};
M.calf = function(prop){
  var A = ST({hl:undefined,hs:[-4,0]}), B = {hy:111,ft:[150,196],fa:42,fa2:42};
  var sp = {A:A, B:B, muscle:'calves'};
  A.fa = 0; A.fa2 = 0;
  if (prop === 'bar'){ A.hs=[-4,-2]; A.eb=-1; sp.prop='bar'; sp.ps=[-8,-4]; sp.pr=15; }
  else if (prop === 'db'){ delete A.hs; A.hl=[-62,4]; sp.prop='db'; sp.pr=8.5; }
  else if (prop === 'lever'){ A.hs=[12,16]; A.eb=1; sp.prop='pad'; sp.ps=[-2,-9]; sp.scene=function(K){ return [{k:'r',x:128,y:205,w:52,h:7,r:3},{k:'l',a:[K.S[0]-18,K.S[1]-8],b:[K.S[0]-18,FL],w:7,c:'#33363d'},{k:'l',a:[K.S[0]-18,K.S[1]-8],b:[K.S[0]+6,K.S[1]-8],w:6,c:'#33363d'}]; }; }
  return sp;
};
M.calfSeated = function(){
  return {A:SEAT({tor:2,hd:[188,150],hl:undefined,fa:0,fa2:0}), B:{ft:[186,196],fa:42,fa2:42}, prop:'pad', muscle:'calves',
    scene:function(K){ var o=seatScene(138,166,70)(); o.push({k:'l',a:[K.knee[0]-16,K.knee[1]-9],b:[K.knee[0]+4,K.knee[1]-9],w:10,c:PADC},{k:'r',x:K.ank[0]-6,y:K.ank[1]+4,w:36,h:6,r:3}); return o; }};
};

// ---------- cardio (continuous, time-driven motions: spec.gen(t) returns the pose; spec.scene3 / spec.dyn3 build the 3D machine) ----------
var DEG = Math.PI/180, GOLD = '#f2b134';
function sm01(v){ v = Math.max(0,Math.min(1,v)); return v*v*(3-2*v); }
function shoulderOf(hx,hy,tor){ return [hx+Math.sin(tor*DEG)*60, hy-Math.cos(tor*DEG)*60]; }
function armFar(S,ang,len){ return [S[0]+len*Math.sin(ang*DEG), S[1]+len*Math.cos(ang*DEG)]; }
// one foot on a walking / running stride: stance (foot slides back on the ground) then swing (foot lifts and returns forward)
function stride(ph,o){
  ph = ph - Math.floor(ph);
  if (ph < o.st){ var k = ph/o.st; return {p:[o.hx+o.xf+(o.xb-o.xf)*k, o.g], a:-8+o.toe*sm01((k-0.45)/0.55)}; }
  var q = (ph-o.st)/(1-o.st);
  return {p:[o.hx+o.xb+(o.xf-o.xb)*sm01(q), o.g-o.lift*Math.sin(Math.PI*q)], a:o.toe*0.7*(1-sm01(q*1.2)) - 8*sm01(q)};
}
function gaitGen(o){
  return function(t){
    var ph = (t/o.T) % 1, f1 = stride(ph,o), f2 = stride(ph+0.5,o);
    var hy = o.hy + o.bob*Math.cos(4*Math.PI*(ph-o.mid));
    var S = shoulderOf(o.hx,hy,o.tor), sw = Math.cos(2*Math.PI*ph)*o.arm;
    return {hx:o.hx,hy:hy,tor:o.tor,ft:f1.p,fa:f1.a,ft2:f2.p,fa2:f2.a,kb:-1,kb2:-1,eb:1,eb2:1,nk:0,as:-sw,al:o.al,hd2:armFar(S,sw,o.al),lz:0.02,hz:0.0,ez:0.12};
  };
}
var RUN = {T:0.66,hx:150,hy:123,g:206,xf:30,xb:-36,lift:30,st:0.38,toe:34,bob:3.2,mid:0.19,tor:9,arm:62,al:44};
var WALK = {T:1.05,hx:150,hy:122,g:206,xf:26,xb:-26,lift:9,st:0.62,toe:26,bob:1.8,mid:0.25,tor:2,arm:26,al:58};
function cardioSpec(gen,extra,T){
  var sp = {gen:gen, T:T, A:gen(0), B:gen(T*0.5), muscle:'quads'};
  return Object.assign(sp,extra||{});
}
function groundSpeed(o){ return (o.xf-o.xb)/(o.st*o.T); }
// floor markers that slide back at exactly the speed the planted foot moves (so the feet don't skate)
function dashes(o,y,zs,len){
  var v = groundSpeed(o), gap = 70;
  return function(E,t){ for (var i = 0; i < 6; i++){ var x = ((i*gap - v*t) % (gap*6) + gap*6) % (gap*6) - 40; zs.forEach(function(z){ E.box(E.P(x,y,z), len*0.01, 0.004, 0.03, E.GOLDM); }); } };
}
M.run = function(){
  var sp = cardioSpec(gaitGen(RUN),{muscle:'quads',wide:true,fit:[[80,206],[230,206],[150,60]]},RUN.T);
  var dz = dashes(RUN,FL+0.4,[-0.55,0.55],16);
  sp.dyn3 = function(E,K,p,t){ dz(E,t); };
  sp.scene3 = function(){};
  sp.scene = function(K,p,t){ var v = groundSpeed(RUN), o=[]; for (var i=0;i<6;i++){ var x=((i*70 - v*(t||0)) % 420 + 420) % 420 - 60; o.push({k:'l',a:[x,FL+4],b:[x+16,FL+4],w:3,c:GOLD}); } return o; };
  return sp;
};
M.walk = function(){
  var sp = cardioSpec(gaitGen(WALK),{muscle:'calves',wide:true,fit:[[80,206],[230,206],[150,60]]},WALK.T);
  var dz = dashes(WALK,FL+0.4,[-0.55,0.55],16);
  sp.dyn3 = function(E,K,p,t){ dz(E,t); };
  sp.scene3 = function(){};
  sp.scene = function(K,p,t){ var v = groundSpeed(WALK), o=[]; for (var i=0;i<6;i++){ var x=((i*70 - v*(t||0)) % 420 + 420) % 420 - 60; o.push({k:'l',a:[x,FL+4],b:[x+16,FL+4],w:3,c:GOLD}); } return o; };
  return sp;
};
// ---- treadmill: same stride on a belt (belt top y=200), console + handrails in front
var TRD = Object.assign({}, RUN, {T:0.74,hx:140,hy:109,g:194,xf:28,xb:-32,lift:26,st:0.4,bob:2.6,tor:7});
M.treadmill = function(){
  var gen = gaitGen(TRD), v = groundSpeed(TRD);
  var sp = cardioSpec(gen,{muscle:'quads',wide:true,fit:[[60,203],[240,203],[226,70]]},TRD.T);
  sp.scene = function(K,p,t){
    var o = [{k:'l',a:[64,203],b:[236,203],w:9,c:'#2b2e35'},{k:'l',a:[76,208],b:[76,FL],w:5,c:'#3a3e46'},{k:'l',a:[226,208],b:[226,FL],w:5,c:'#3a3e46'},
      {k:'l',a:[232,203],b:[226,84],w:7,c:'#3a3e46'},{k:'r',x:208,y:72,w:42,h:20,r:5},{k:'l',a:[226,110],b:[190,118],w:4,c:'#5a606b'}];
    for (var i = 0; i < 7; i++){ var x = ((i*26 - v*(t||0)) % 182 + 182) % 182 + 62; o.push({k:'l',a:[x,198.5],b:[x+8,198.5],w:2,c:'#555b66'}); }
    return o;
  };
  sp.scene3 = function(E){
    var P = E.P, z = 0.31;
    E.box(P(150,203,0), 1.74, 0.06, 0.56, E.DARK);                       // belt deck
    [-1,1].forEach(function(s){
      E.box(P(150,205,s*z), 1.74, 0.09, 0.06, E.METAL);                  // side rails
      E.rod(P(76,208,s*z), P(76,FL,s*z), 0.02, E.DARK); E.rod(P(226,208,s*z), P(226,FL,s*z), 0.02, E.DARK);
      E.rod(P(232,205,s*z), P(226,88,s*z), 0.024, E.METAL);              // uprights
      E.rod(P(226,112,s*z), P(188,119,s*z), 0.018, E.METAL);             // handrails
    });
    E.rod(P(188,119,-z), P(188,119,z), 0.016, E.METAL);
    E.box(P(224,82,0), 0.2, 0.15, 0.7, E.DARK, 0.25); E.box(P(227,82.5,0), 0.02, 0.1, 0.5, E.GOLDM, 0.25);
  };
  sp.dyn3 = function(E,K,p,t){   // belt slats sliding back at foot speed
    for (var i = 0; i < 7; i++){ var x = ((i*26 - v*t) % 182 + 182) % 182 + 62; E.box(E.P(x,200.2,0), 0.035, 0.004, 0.5, E.METAL); }
  };
  return sp;
};
// ---- stationary bike: foot on a crank circle, hands on the bars
var BIKE = {T:0.9,BB:[160,180],R:17,hx:110,hy:128,tor:38,hand:[200,106],sad:[108,136]};
M.bike = function(){
  var o = BIKE;
  var gen = function(t){
    var th = (t/o.T)*2*Math.PI, f1 = [o.BB[0]+o.R*Math.cos(th), o.BB[1]+o.R*Math.sin(th)], f2 = [o.BB[0]-o.R*Math.cos(th), o.BB[1]-o.R*Math.sin(th)];
    var hy = o.hy + 0.8*Math.sin(2*th);
    return {hx:o.hx,hy:hy,tor:o.tor,ft:f1,ft2:f2,fa:-4,fa2:-4,kb:-1,kb2:-1,eb:1,eb2:1,nk:-10,hd:o.hand,hd2:[o.hand[0],o.hand[1]],lz:0.03,hz:0.0,ez:0.06};
  };
  var sp = cardioSpec(gen,{muscle:'quads',wide:true,fit:[[80,210],[236,210],[200,92]]},BIKE.T);
  sp.scene = function(){ return [{k:'l',a:[96,FL-3],b:[226,FL-3],w:6,c:'#2b2e35'},{k:'l',a:[124,186],b:[198,176],w:6,c:'#3a3e46'},{k:'l',a:[126,188],b:[108,138],w:5,c:'#3a3e46'},{k:'r',x:92,y:132,w:30,h:7,r:3},
    {k:'l',a:[198,176],b:[202,106],w:6,c:'#3a3e46'},{k:'c',x:202,y:176,r:24},{k:'l',a:[194,104],b:[210,104],w:5,c:'#5a606b'}]; };
  sp.scene3 = function(E){
    var P = E.P;
    E.rod(P(124,186,0), P(198,176,0), 0.03, E.DARK);                    // spine
    E.rod(P(126,188,0), P(108,138,0), 0.026, E.METAL);                   // seat post
    E.box(P(104,134,0), 0.3, 0.05, 0.2, E.DARK, 0.12);                   // saddle
    E.rod(P(198,176,0), P(202,106,0), 0.03, E.DARK);                     // front post
    E.cylz(P(202,172,0), 0.24, 0.07, E.PLATE); E.cylz(P(202,172,0.036), 0.215, 0.01, E.GOLDM);   // flywheel
    E.rod(P(202,106,-0.22), P(202,106,0.22), 0.018, E.METAL);            // handlebar
    E.ball(P(202,106,-0.22), 0.03, E.DARK); E.ball(P(202,106,0.22), 0.03, E.DARK);
    E.box(P(108,209,0), 0.06, 0.04, 0.62, E.DARK); E.box(P(222,209,0), 0.06, 0.04, 0.62, E.DARK); E.rod(P(108,209,0), P(222,209,0), 0.02, E.DARK);
    E.cylz(P(o.BB[0],o.BB[1],0), 0.03, 0.34, E.METAL);                   // crank axle
  };
  sp.dyn3 = function(E,K,p,t){
    var P = E.P, bb = o.BB;
    [[K.ank,0.14],[K.ankF,-0.14]].forEach(function(q){ E.rod(P(bb[0],bb[1],q[1]), P(q[0][0],q[0][1],q[1]), 0.016, E.METAL); E.box(P(q[0][0],q[0][1]+2,q[1]), 0.13, 0.025, 0.09, E.DARK); });
    var a = t*6; E.rod(P(202+Math.cos(a)*20,172+Math.sin(a)*20,0.04), P(202-Math.cos(a)*20,172-Math.sin(a)*20,0.04), 0.007, E.GOLDM);
  };
  return sp;
};
// ---- rowing machine: legs, then body, then arms; and back
var ROW = {T:2.4};
M.rower = function(){
  var gen = function(t){
    var c = (t/ROW.T) % 1, s = c < 0.4 ? sm01(c/0.4) : 1 - sm01((c-0.4)/0.6);          // 0 = catch, 1 = finish
    var Lg = sm01(s/0.55), Bd = sm01((s-0.3)/0.55), Ar = sm01((s-0.62)/0.38);
    var hx = 168 + (122-168)*Lg, hy = 170 + (176-170)*Lg, tor = 26 + (-24-26)*Bd;
    var hs = [62 + (26-62)*Ar, 32 + (22-32)*Ar];
    return {hx:hx,hy:hy,tor:tor,ft:[204,182],ft2:[204,182],fa:-30,fa2:-30,kb:-1,kb2:-1,eb:1,eb2:1,nk:-6*(1-Bd),hs:hs,lz:0.04,hz:0.0,ez:0.1};
  };
  var sp = cardioSpec(gen,{muscle:'back',wide:true,fit:[[40,206],[246,206],[200,100]]},ROW.T);
  sp.scene = function(K){ return [{k:'l',a:[52,200],b:[234,200],w:6,c:'#4a4f58'},{k:'r',x:K.H[0]-14,y:K.H[1]+6,w:30,h:7,r:3},{k:'c',x:234,y:172,r:24},{k:'l',a:[206,186],b:[214,176],w:5,c:'#3a3e46'}]; };
  sp.scene3 = function(E){
    var P = E.P;
    E.box(P(142,200,0), 1.9, 0.045, 0.1, E.METAL);                      // rail
    E.box(P(54,206,0), 0.07, 0.1, 0.5, E.DARK); E.box(P(228,206,0), 0.07, 0.1, 0.5, E.DARK);
    E.cylz(P(234,170,0), 0.28, 0.14, E.PLATE); E.cylz(P(234,170,0.075), 0.255, 0.012, E.GOLDM);
    E.rod(P(228,206,-0.2), P(228,170,-0.2), 0.02, E.DARK); E.rod(P(228,206,0.2), P(228,170,0.2), 0.02, E.DARK);
    [-1,1].forEach(function(s){ E.box(P(208,184,s*0.15), 0.2, 0.03, 0.1, E.DARK, -0.5); });   // foot plates
  };
  sp.dyn3 = function(E,K,p,t){
    var P = E.P, h = K.hand;
    E.box(P(K.H[0],188,0), 0.26, 0.045, 0.2, E.DARK);                    // sliding seat
    E.rod(P(h[0],h[1],-0.22), P(h[0],h[1],0.22), 0.016, E.GOLDM);        // handle
    E.rod(P(h[0],h[1],0), P(234,170,0), 0.006, E.METAL);                 // chain to the flywheel
  };
  return sp;
};
// ---- elliptical: feet on pedals moving in long ovals, hands on swinging handles
var ELL = {T:1.15,hx:150,hy:98,tor:3,xc:152,yc:178,a:26,b:9};
M.elliptical = function(){
  var o = ELL;
  var gen = function(t){
    var th = (t/o.T)*2*Math.PI, c = Math.cos(th), s = Math.sin(th), S = shoulderOf(o.hx,o.hy,o.tor);
    var f1 = [o.xc+o.a*c, o.yc+o.b*s], f2 = [o.xc-o.a*c, o.yc-o.b*s];
    var an = 38*Math.cos(th+Math.PI) , hn = [188-16*c, 78+0], hf = [188+16*c, 78];
    return {hx:o.hx,hy:o.hy+1.2*Math.sin(2*th),tor:o.tor,ft:f1,ft2:f2,fa:-4+10*c,fa2:-4-10*c,kb:-1,kb2:-1,eb:1,eb2:1,nk:0,hd:hn,hd2:hf,lz:0.03,hz:0.0,ez:0.1};
  };
  var sp = cardioSpec(gen,{muscle:'glutes',wide:true,fit:[[64,208],[240,208],[206,50]]},ELL.T);
  sp.scene = function(){ return [{k:'l',a:[70,FL-5],b:[232,FL-5],w:6,c:'#2b2e35'},{k:'l',a:[212,FL-5],b:[210,66],w:7,c:'#3a3e46'},{k:'r',x:192,y:52,w:40,h:18,r:5},{k:'c',x:92,y:178,r:14}]; };
  sp.scene3 = function(E){
    var P = E.P, z = 0.3;
    E.box(P(150,208,0), 1.7, 0.06, 0.08, E.DARK);
    E.box(P(72,206,0), 0.07, 0.07, 0.7, E.DARK); E.box(P(228,206,0), 0.07, 0.07, 0.7, E.DARK);
    [-1,1].forEach(function(s){ E.rod(P(222,206,s*0.22), P(210,64,s*0.22), 0.026, E.METAL); E.cylz(P(92,178,s*0.2), 0.14, 0.05, E.PLATE); });
    E.box(P(206,56,0), 0.24, 0.14, 0.62, E.DARK, 0.15); E.box(P(209,56.5,0), 0.02, 0.09, 0.45, E.GOLDM, 0.15);
    E.rod(P(92,178,-0.2), P(92,178,0.2), 0.02, E.METAL);
  };
  sp.dyn3 = function(E,K,p,t){
    var P = E.P, piv = [210,70];
    [[K.ank,0.16,K.hand],[K.ankF,-0.16,K.handF]].forEach(function(q){
      E.rod(P(92,178,q[1]*1.2), P(q[0][0]-2,q[0][1]+3,q[1]), 0.018, E.METAL);                   // crank-linked pedal arm
      E.box(P(q[0][0],q[0][1]+4,q[1]), 0.2, 0.03, 0.13, E.DARK);                                 // pedal
      E.rod(P(piv[0],piv[1],q[1]*1.4), P(q[2][0],q[2][1],q[1]*1.25), 0.018, E.METAL);            // handle arm
      E.ball(P(q[2][0],q[2][1],q[1]*1.25), 0.03, E.GOLDM);
    });
  };
  return sp;
};
// ---- stair climber: two pedals going up and down in turn, hands on the rails
var STR = {T:1.4,hx:146,hy:96,tor:6,yc:178,amp:15,hand:[198,96]};
M.stairs = function(){
  var o = STR;
  var gen = function(t){
    var th = (t/o.T)*2*Math.PI, s = Math.sin(th), f1 = [o.hx+22, o.yc+o.amp*s], f2 = [o.hx+22, o.yc-o.amp*s];
    return {hx:o.hx,hy:o.hy+1.5*Math.cos(th),tor:o.tor,ft:f1,ft2:f2,fa:-3,fa2:-3,kb:-1,kb2:-1,eb:1,eb2:1,nk:0,hd:o.hand,hd2:[o.hand[0],o.hand[1]],lz:0.03,hz:0.0,ez:0.08};
  };
  var sp = cardioSpec(gen,{muscle:'glutes',wide:true,fit:[[80,210],[240,210],[210,60]]},STR.T);
  sp.scene = function(){ return [{k:'l',a:[90,FL-5],b:[230,FL-5],w:8,c:'#2b2e35'},{k:'l',a:[216,FL-5],b:[214,70],w:7,c:'#3a3e46'},{k:'r',x:196,y:56,w:36,h:18,r:5},{k:'l',a:[186,100],b:[214,100],w:4,c:'#5a606b'}]; };
  sp.scene3 = function(E){
    var P = E.P;
    E.box(P(160,208,0), 1.5, 0.07, 0.62, E.DARK);
    [-1,1].forEach(function(s){ E.rod(P(220,206,s*0.3), P(214,72,s*0.3), 0.026, E.METAL); E.rod(P(214,102,s*0.3), P(184,102,s*0.3), 0.018, E.METAL); });
    E.box(P(212,64,0), 0.22, 0.14, 0.7, E.DARK, 0.2); E.box(P(215,64.5,0), 0.02, 0.09, 0.5, E.GOLDM, 0.2);
  };
  sp.dyn3 = function(E,K,p,t){
    var P = E.P;
    [[K.ank,0.14],[K.ankF,-0.14]].forEach(function(q){
      E.box(P(q[0][0]+4,q[0][1]+5,q[1]), 0.3, 0.035, 0.18, E.DARK);
      E.rod(P(q[0][0]-14,208,q[1]), P(q[0][0]-14,q[0][1]+5,q[1]), 0.014, E.METAL);              // piston
    });
  };
  return sp;
};
// ---- jump rope: small hops, rope turning overhead -> under the feet each hop
var JR = {T:0.5,hx:150,g:206,hy0:122};
M.rope = function(){
  var gen = function(t){
    var rho = (t/JR.T) % 1, lift = 11*Math.pow(Math.sin(Math.PI*rho),2), wr = 2*Math.PI*rho;
    var hy = JR.hy0 - lift, S = shoulderOf(JR.hx,hy,0), hc = [S[0]+26+4*Math.cos(wr), S[1]+52+4*Math.sin(wr)];
    return {hx:JR.hx,hy:hy,tor:0,ft:[JR.hx+4,JR.g-lift*1.2],ft2:[JR.hx-4,JR.g-lift*1.2],fa:14*(lift/11),fa2:14*(lift/11),kb:-1,kb2:-1,eb:1,eb2:1,nk:0,hd:hc,hd2:hc,lz:0.03,hz:0.1,ez:0.14};
  };
  var sp = cardioSpec(gen,{muscle:'calves',fit:[[100,14],[200,214]]},JR.T);
  sp.scene = function(K,p,t){
    var rho = ((t||0)/JR.T) % 1, ang = Math.PI/2 - 2*Math.PI*rho, c = [K.hand[0], K.hand[1]], R = 94;
    return [{k:'l',a:c,b:[c[0]+R*Math.cos(ang), c[1]-R*Math.sin(ang)],w:2.4,c:GOLD}];
  };
  sp.scene3 = function(){};
  sp.dyn3 = function(E,K,p,t){
    var P = E.P, rho = (t/JR.T) % 1, ang = Math.PI/2 - 2*Math.PI*rho, R = 94, hc = K.hand, z0 = 0.2, prev = null;
    for (var i = 0; i <= 14; i++){
      var s = -1 + i/7, bulge = Math.sqrt(Math.max(0,1-s*s)), pt = P(hc[0]+R*bulge*Math.cos(ang), hc[1]-R*bulge*Math.sin(ang), z0*s);
      if (prev) E.rod(prev, pt, 0.008, E.GOLDM); prev = pt;
    }
    [-1,1].forEach(function(sg){ E.ball(P(hc[0],hc[1],sg*z0), 0.03, E.DARK); });
  };
  return sp;
};

g.RDM = M;
})(window);
