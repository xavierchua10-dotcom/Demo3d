/* Ragdoll exercise figure: tiny 2D side-view skeleton drawn as SVG.
   A motion = two poses (A -> B -> A). Poses use hip position, torso angle and
   IK targets for hands / feet. See motions.js for the catalogue. */
(function(g){
var FL = 212, D = {tor:60, ua:34, fa:32, th:44, sh:42, hd:11};
var GOLD = '#f2b134', SK = '#d7dbe0', SKD = '#8f959e', BG = '#14161a', PAD = '#2a2d33', PADS = '#4a4f58';
function lerp(a,b,t){ return a+(b-a)*t; }
function mix(A,B,t){
  var o = {}, k, a, b;
  for (k in B) if (A[k] === undefined) o[k] = B[k];
  for (k in A){
    a = A[k]; b = (B && B[k] !== undefined) ? B[k] : a;
    if (a instanceof Array) o[k] = a.map(function(v,i){ return typeof v === 'number' ? lerp(v, b[i], t) : v; });
    else if (typeof a === 'number') o[k] = lerp(a, b, t); else o[k] = a;
  }
  return o;
}
function ik(a,b,l1,l2,s){
  var dx = b[0]-a[0], dy = b[1]-a[1], d = Math.sqrt(dx*dx+dy*dy) || 0.001, ux = dx/d, uy = dy/d;
  var dd = Math.min(d, l1+l2-0.05), x = (l1*l1-l2*l2+dd*dd)/(2*dd), h = Math.sqrt(Math.max(l1*l1-x*x,0));
  return { mid:[a[0]+ux*x-uy*h*s, a[1]+uy*x+ux*h*s], end:[a[0]+ux*dd, a[1]+uy*dd] };
}
function kin(p){
  var ta = p.tor*Math.PI/180, t = [Math.sin(ta), -Math.cos(ta)], n = [-t[1], t[0]];
  var H = [p.hx, p.hy], sh = p.sh || 0;
  var S = [H[0]+t[0]*D.tor, H[1]+t[1]*D.tor - sh];
  var ha = (p.tor + (p.nk||0))*Math.PI/180, hv = [Math.sin(ha), -Math.cos(ha)];
  var C = [S[0]+hv[0]*(4+D.hd), S[1]+hv[1]*(4+D.hd)];
  var hand;
  if (p.hl) hand = [S[0]+t[0]*p.hl[0]+n[0]*p.hl[1], S[1]+t[1]*p.hl[0]+n[1]*p.hl[1]];
  else if (p.hs) hand = [S[0]+p.hs[0], S[1]+p.hs[1]];
  else if (p.hh) hand = [H[0]+p.hh[0], H[1]+p.hh[1]];
  else hand = p.hd;
  var fh = p.hd2 ? p.hd2 : [hand[0]-5, hand[1]-1];
  var arm = ik(S, hand, D.ua, D.fa, p.eb), armF = ik(S, fh, D.ua, D.fa, p.eb2 === undefined ? p.eb : p.eb2);
  var ft = p.ft, ft2 = p.ft2 || [ft[0]-9, ft[1]];
  var leg = ik(H, ft, D.th, D.sh, p.kb), legF = ik(H, ft2, D.th, D.sh, p.kb2 === undefined ? p.kb : p.kb2);
  var fa = (p.fa||0)*Math.PI/180, fa2 = (p.fa2 === undefined ? p.fa||0 : p.fa2)*Math.PI/180;
  return { H:H, S:S, C:C, t:t, n:n, hv:hv, hand:arm.end, elb:arm.mid, handF:armF.end, elbF:armF.mid,
           ank:leg.end, knee:leg.mid, ankF:legF.end, kneeF:legF.mid, fa:fa, fa2:fa2 };
}
function f1(v){ return Math.round(v*10)/10; }
function cap(a,b,w,c){ return '<line x1="'+f1(a[0])+'" y1="'+f1(a[1])+'" x2="'+f1(b[0])+'" y2="'+f1(b[1])+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>'; }
function circ(c,r,f,s,sw){ return '<circle cx="'+f1(c[0])+'" cy="'+f1(c[1])+'" r="'+r+'" fill="'+f+'"'+(s?' stroke="'+s+'" stroke-width="'+(sw||1.6)+'"':'')+'/>'; }
function lerp2(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
function ell(c,rx,ry,deg,f,o){ return '<ellipse cx="'+f1(c[0])+'" cy="'+f1(c[1])+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+f1(deg)+' '+f1(c[0])+' '+f1(c[1])+')" fill="'+f+'" opacity="'+o+'"/>'; }
function shape(s){
  if (s.k === 'r') return '<rect x="'+s.x+'" y="'+s.y+'" width="'+s.w+'" height="'+s.h+'" rx="'+(s.r||2)+'" fill="'+(s.f||PAD)+'" stroke="'+(s.s||PADS)+'" stroke-width="1.2"/>';
  if (s.k === 'l') return cap(s.a, s.b, s.w||6, s.c||PAD);
  if (s.k === 'c') return circ([s.x,s.y], s.r, s.f||PAD, s.s||PADS);
  return '';
}
// gold muscle highlight on the body
function hilite(m, K, o, p){
  var out = '', f = GOLD, t = K.t, n = K.n, ang = Math.atan2(t[1],t[0])*180/Math.PI;
  function onT(u,off){ return [K.H[0]+t[0]*D.tor*u+n[0]*off, K.H[1]+t[1]*D.tor*u+n[1]*off - (p.sh||0)*u]; }
  function seg(a,b,u0,u1,w,op){ var A = lerp2(a,b,u0), B = lerp2(a,b,u1); return '<line x1="'+f1(A[0])+'" y1="'+f1(A[1])+'" x2="'+f1(B[0])+'" y2="'+f1(B[1])+'" stroke="'+f+'" stroke-width="'+w+'" stroke-linecap="round" opacity="'+op+'"/>'; }
  var M = {
    chest: function(){ return ell(onT(0.78,6),15,9,ang,f,o); },
    back: function(){ return ell(onT(0.6,-7),22,8,ang,f,o); },
    abs: function(){ return ell(onT(0.3,8),16,8,ang,f,o); },
    traps: function(){ return ell(onT(0.97,-4),11,7,ang,f,o) + ell([K.S[0]+K.hv[0]*3,K.S[1]+K.hv[1]*3],7,5,ang,f,o); },
    shoulders: function(){ return circ([K.S[0]+n[0]*2,K.S[1]+n[1]*2],9,f).replace('/>',' opacity="'+o+'"/>'); },
    biceps: function(){ return seg(K.S,K.elb,.18,.82,13,o) + seg(K.S,K.elbF,.18,.82,13,o*.45); },
    triceps: function(){ return seg(K.S,K.elb,.18,.82,13,o) + seg(K.S,K.elbF,.18,.82,13,o*.45); },
    forearms: function(){ return seg(K.elb,K.hand,.12,.88,11,o) + seg(K.elbF,K.handF,.12,.88,11,o*.45); },
    quads: function(){ return seg(K.H,K.knee,.12,.88,18,o) + seg(K.H,K.kneeF,.12,.88,18,o*.45); },
    hamstrings: function(){ return seg(K.H,K.knee,.12,.88,18,o) + seg(K.H,K.kneeF,.12,.88,18,o*.45); },
    glutes: function(){ return circ([K.H[0]-n[0]*5,K.H[1]-n[1]*5],14,f).replace('/>',' opacity="'+o+'"/>'); },
    calves: function(){ return seg(K.knee,K.ank,.1,.85,14,o) + seg(K.kneeF,K.ankF,.1,.85,14,o*.45); }
  };
  return M[m] ? M[m]() : '';
}
function foot(a, fa, w, c){ var toe = [a[0]+Math.cos(fa)*15, a[1]+Math.sin(fa)*15]; return cap([a[0]-3,a[1]+1.5], toe, 7, c); }
function drawProp(spec, p, K, Hn){
  var kind = spec.prop, out = '', pr = p.pr, hand = K.hand, r = spec.pr || (kind === 'db' ? 8.5 : (kind === 'bar' ? 17 : 5));
  if (p.ph) pr = [K.H[0]+p.ph[0], K.H[1]+p.ph[1]];
  if (p.ps) pr = [K.S[0]+p.ps[0], K.S[1]+p.ps[1]];
  var at = pr || hand;
  if (spec.attach && K[spec.attach]) at = K[spec.attach];
  if (kind === 'bar' || kind === 'ez'){
    out += circ(at, r, '#22252b', GOLD, 2.6) + circ(at, r*0.68, 'none', '#5a606b', 1.4) + circ(at, 3, '#8a909b');
  } else if (kind === 'db'){
    out += circ(K.handF, r, '#22252b', GOLD, 2) ; out += circ(hand, r, '#22252b', GOLD, 2.2);
  } else if (kind === 'cable'){
    var a = spec.anchor; out += cap(a, at, 1.4, '#c9ced6') + circ(a, 4, PAD, GOLD, 1.4) + circ(at, 3.2, GOLD);
  } else if (kind === 'lever'){
    out += cap(spec.pivot, at, 5, '#3a3e46') + circ(spec.pivot, 5, PAD, PADS) + circ(at, 4.2, GOLD);
  } else if (kind === 'grip'){
    out += circ(at, 4, GOLD);
  } else if (kind === 'wheel'){
    out += circ(at, 8, '#22252b', GOLD, 2.4) + circ(at, 2.4, '#8a909b');
  } else if (kind === 'pad'){
    out += circ(at, 8, '#2a2d33', GOLD, 1.8);
  } else if (kind === 'sled'){
    var dx = K.ank[0]-K.H[0], dy = K.ank[1]-K.H[1], l = Math.sqrt(dx*dx+dy*dy) || 1, ux = dx/l, uy = dy/l, q = [K.ank[0]+ux*5, K.ank[1]+uy*5], pp = [-uy, ux];
    out += cap([q[0]-pp[0]*24,q[1]-pp[1]*24],[q[0]+pp[0]*24,q[1]+pp[1]*24],7,'#3a3e46') + cap([q[0]-pp[0]*20,q[1]-pp[1]*20],[q[0]+pp[0]*20,q[1]+pp[1]*20],2,GOLD);
  }
  if (spec.rope && kind === 'cable') out += '';
  return out;
}
function render(spec, u, time){
  var p = mix(spec.A, spec.B, u), K = kin(p), o = '', i;
  o += '<rect x="-300" y="-300" width="900" height="700" fill="'+BG+'"/><rect x="-300" y="'+FL+'" width="900" height="200" fill="#1a1c21"/><line x1="-300" y1="'+FL+'" x2="600" y2="'+FL+'" stroke="#3c4048" stroke-width="2"/>';
  o += '<ellipse cx="150" cy="'+(FL+1)+'" rx="95" ry="4" fill="#000" opacity=".35"/>';
  (spec.scene ? spec.scene(K, p) : []).forEach(function(s){ o += shape(s); });
  // far limbs
  o += cap(K.H, K.kneeF, 13, SKD) + cap(K.kneeF, K.ankF, 10, SKD) + foot(K.ankF, K.fa2, 7, SKD);
  o += cap(K.S, K.elbF, 10, SKD) + cap(K.elbF, K.handF, 8.5, SKD);
  // torso, neck, head
  o += cap(K.H, K.S, 26, SK) + cap([K.S[0]+K.hv[0]*2,K.S[1]+K.hv[1]*2],[K.S[0]+K.hv[0]*6,K.S[1]+K.hv[1]*6],10,SK);
  o += circ(K.C, D.hd, SK) + circ([K.C[0]+K.n[0]*5.5+K.hv[0]*1, K.C[1]+K.n[1]*5.5+K.hv[1]*1], 1.5, BG);
  // near leg
  o += cap(K.H, K.knee, 15, SK) + cap(K.knee, K.ank, 11.5, SK) + foot(K.ank, K.fa, 7.5, SK);
  if (spec.prop === 'sled' || spec.prop === 'lever' || spec.prop === 'cable') o += drawProp(spec, p, K);
  // far arm over torso? draw prop plate between far and near arm for bars
  if (spec.prop === 'bar' || spec.prop === 'ez' || spec.prop === 'db' || spec.prop === 'wheel' || spec.prop === 'grip' || spec.prop === 'pad') o += drawProp(spec, p, K);
  // near arm
  o += cap(K.S, K.elb, 11, SK) + cap(K.elb, K.hand, 9.5, SK);
  // muscle highlight
  var pulse = 0.5 + 0.2*Math.sin((time||0)*5);
  if (spec.muscle) o += hilite(spec.muscle, K, pulse, p);
  // joints
  [K.knee, K.elb].forEach(function(j){ o += circ(j, 3.6, BG, GOLD, 1.5); });
  o += circ(K.H, 3.2, BG, GOLD, 1.4) + circ(K.S, 3.2, BG, GOLD, 1.4);
  // hand cap
  o += circ(K.hand, 4.6, SK, GOLD, 1.3);
  return o;
}
// cycle: pose parameter over time
function phase(time, spec){
  var T = spec.tempo || [1.1, 0.25, 1.1, 0.25], tot = T[0]+T[1]+T[2]+T[3], x = time % tot;
  function sm(v){ v = Math.max(0,Math.min(1,v)); return v*v*(3-2*v); }
  if (x < T[0]) return sm(x/T[0]);
  x -= T[0]; if (x < T[1]) return 1;
  x -= T[1]; if (x < T[2]) return 1-sm(x/T[2]);
  return 0;
}
var live = [];
var io = (typeof IntersectionObserver !== 'undefined') ? new IntersectionObserver(function(es){ es.forEach(function(e){ var it = e.target.__rd; if (it) it.vis = e.isIntersecting; }); }, {rootMargin:'80px'}) : null;
var running = false;
var lastT = 0;
function tick(now){
  if (now - lastT < 30){ requestAnimationFrame(tick); return; }
  lastT = now; var any = false;
  for (var i = 0; i < live.length; i++){
    var it = live[i]; if (!it.el.isConnected) { live.splice(i--,1); continue; }
    if (it.vis === false || it.paused) continue;
    any = true;
    var t = now/1000, u = it.still != null ? it.still : phase(t, it.spec);
    it.svg.innerHTML = render(it.spec, u, t);
  }
  if (live.length) requestAnimationFrame(tick); else running = false;
}
function fitBox(spec){
  var xs = [], ys = [];
  [spec.A, mix(spec.A, spec.B, 1), mix(spec.A, spec.B, 0.5)].forEach(function(p){
    var K = kin(p);
    [K.H,K.S,K.C,K.knee,K.ank,K.hand,K.elb,K.kneeF,K.ankF].forEach(function(q){ xs.push(q[0]); ys.push(q[1]); });
    if (p.ps) { xs.push(K.S[0]+p.ps[0]); ys.push(K.S[1]+p.ps[1]); }
    if (spec.prop === 'bar' || spec.prop === 'ez') { xs.push(K.hand[0]-20, K.hand[0]+20); ys.push(K.hand[1]-20); }
  });
  if (spec.scene){ var K0 = kin(spec.A); spec.scene(K0, spec.A).forEach(function(s){ if (s.a){ xs.push(s.a[0], s.b[0]); ys.push(s.a[1], s.b[1]); } else if (s.x !== undefined){ xs.push(s.x, s.x+(s.w||0)); ys.push(s.y, s.y+(s.h||0)); } }); }
  ys.push(FL + 6);
  var x0 = Math.min.apply(0,xs)-24, x1 = Math.max.apply(0,xs)+24, y0 = Math.min.apply(0,ys)-22, y1 = Math.max.apply(0,ys);
  var w = Math.max(x1-x0, (y1-y0)*300/262, 170), h = w*262/300, cx = (x0+x1)/2;
  if (w > 300){ w = 300; h = 262; }
  var vx = cx - w/2, vy = y1 - h + 8;
  return vx.toFixed(1)+' '+vy.toFixed(1)+' '+w.toFixed(1)+' '+h.toFixed(1);
}
function mount(el, spec, opts){
  opts = opts || {};
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', fitBox(spec)); svg.setAttribute('width','100%'); svg.style.display = 'block';
  el.innerHTML = ''; el.appendChild(svg);
  var it = { el:el, svg:svg, spec:spec, vis: io ? false : true, still: opts.still != null ? opts.still : null };
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches && it.still == null) it.still = 0;
  el.__rd = it; live.push(it);
  svg.innerHTML = render(spec, it.still != null ? it.still : 0, 0);
  if (io) io.observe(el);
  if (!running){ running = true; requestAnimationFrame(tick); }
  return it;
}
g.Ragdoll = { render:render, mount:mount, kin:kin, mix:mix, phase:phase, fitBox:fitBox, FL:FL, D:D };
})(window);
