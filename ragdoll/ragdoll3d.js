/* 3D mannequin driven by the same motion templates (A -> B poses, IK) as the 2D figures.
   One shared renderer; call R3.show(spec) to switch exercise. Needs THREE r128 + OrbitControls. */
(function(g){
var FL = 212, U = 0.01;                       // 1 px of the 2D layout = 0.01 world units
function P(x,y,z){ return new THREE.Vector3((x-150)*U, (FL-y)*U, z||0); }
var BODY = new THREE.MeshStandardMaterial({color:0xb9bfc7, roughness:0.6, metalness:0.0});
var BODYF = new THREE.MeshStandardMaterial({color:0x8c929b, roughness:0.65});
var DARK = new THREE.MeshStandardMaterial({color:0x3c4049, roughness:0.7});
var METAL = new THREE.MeshStandardMaterial({color:0x6b717c, roughness:0.4, metalness:0.6});
var PLATE = new THREE.MeshStandardMaterial({color:0x1d1f24, roughness:0.5, metalness:0.3});
var GOLDM = new THREE.MeshStandardMaterial({color:0xf2b134, roughness:0.35, metalness:0.2, emissive:0x3a2600});
var HI = new THREE.MeshBasicMaterial({color:0xf2b134, transparent:true, opacity:0.55, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2});
var CYL = new THREE.CylinderGeometry(1,1,1,18,1,true), SPH = new THREE.SphereGeometry(1,18,14);
var UP = new THREE.Vector3(0,1,0);

// capsule between two points; rx = radius in the figure plane, rz = radius across the body
function Cap(mat){
  var grp = new THREE.Group(), cyl = new THREE.Mesh(CYL, mat), s0 = new THREE.Mesh(SPH, mat), s1 = new THREE.Mesh(SPH, mat);
  grp.add(cyl, s0, s1); grp.userData = {cyl:cyl, s0:s0, s1:s1}; return grp;
}
var _d = new THREE.Vector3(), _m = new THREE.Vector3();
function setCap(c, a, b, rx, rz){
  rz = rz === undefined ? rx : rz;
  _d.subVectors(b, a); var len = _d.length() || 0.0001; _d.divideScalar(len);
  _m.addVectors(a, b).multiplyScalar(0.5); c.position.copy(_m); c.quaternion.setFromUnitVectors(UP, _d);
  var u = c.userData; u.cyl.scale.set(rx, len, rz); u.s0.position.set(0,-len/2,0); u.s1.position.set(0,len/2,0);
  u.s0.scale.set(rx,rx,rz); u.s1.scale.set(rx,rx,rz); c.visible = true;
}
function Ball(mat, r){ var m = new THREE.Mesh(SPH, mat); m.scale.setScalar(r); return m; }

var V = null;       // viewer state
function init(canvasHost, opts){
  opts = opts || {};
  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.5)); renderer.outputEncoding = THREE.sRGBEncoding;
  canvasHost.appendChild(renderer.domElement); renderer.domElement.style.display = 'block'; renderer.domElement.style.touchAction = 'none';
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0x14161a);
  var cam = new THREE.PerspectiveCamera(36, 1, 0.05, 50);
  var ctl = new THREE.OrbitControls(cam, renderer.domElement); ctl.enablePan = false; ctl.enableDamping = true; ctl.dampingFactor = 0.08; ctl.rotateSpeed = 0.8; ctl.minPolarAngle = 0.3; ctl.maxPolarAngle = 1.62;
  var key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(2,3,2.5);
  var fill = new THREE.DirectionalLight(0xaeb8c2, 0.7); fill.position.set(-3,1.2,-2);
  scene.add(key, fill, new THREE.HemisphereLight(0x8a8f99, 0x2a2c31, 0.9));
  var floor = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({color:new THREE.Color(0x1a1c21).convertSRGBToLinear()}));
  floor.rotation.x = -Math.PI/2; floor.position.y = -0.002; scene.add(floor);
  var ring = new THREE.Mesh(new THREE.RingGeometry(1.5,1.512,64), new THREE.MeshBasicMaterial({color:0xf2b134, transparent:true, opacity:0.35, side:THREE.DoubleSide}));
  ring.rotation.x = -Math.PI/2; ring.position.y = 0.001; scene.add(ring);
  var rig = new THREE.Group(); scene.add(rig);              // body parts
  var props = new THREE.Group(); scene.add(props);          // exercise props (rebuilt per exercise)
  var mk = function(mat){ var c = Cap(mat); rig.add(c); return c; };
  var B = { torso:mk(BODY), neck:mk(BODY), thighN:mk(BODY), shinN:mk(BODY), thighF:mk(BODYF), shinF:mk(BODYF), uaN:mk(BODY), faN:mk(BODY), uaF:mk(BODYF), faF:mk(BODYF),
            pelvis:mk(BODY), shN:mk(BODY), shF:mk(BODYF), footN:mk(BODY), footF:mk(BODYF) };
  B.head = Ball(BODY, 0.115); rig.add(B.head);
  B.joints = []; for (var i = 0; i < 8; i++){ var j = Ball(GOLDM, 0.032); rig.add(j); B.joints.push(j); }
  B.handN = Ball(BODY, 0.042); B.handF = Ball(BODYF, 0.042); rig.add(B.handN, B.handF);
  var hi = []; for (i = 0; i < 6; i++){ var h = Cap(HI); h.visible = false; rig.add(h); hi.push(h); }
  V = { renderer:renderer, scene:scene, cam:cam, ctl:ctl, rig:rig, props:props, B:B, hi:hi, spec:null, t0:0, host:canvasHost, swing:true, last:0, raf:0 };
  ctl.addEventListener('start', function(){ V.swing = false; });
  function resize(){ var w = canvasHost.clientWidth, h = canvasHost.clientHeight; if (!w || !h) return; renderer.setSize(w, h); cam.aspect = w/h; cam.updateProjectionMatrix(); frame(V.spec); }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(canvasHost); else window.addEventListener('resize', resize);
  V.resize = resize; resize();
  V.raf = requestAnimationFrame(loop);
  return V;
}

function frame(spec){
  if (!spec || !V) return;
  var vb = Ragdoll.fitBox(spec).split(' ').map(Number), w = Math.max(vb[2]/100, spec.wide ? 1.9 : 1.2), h = Math.max(vb[3]/100, 1.0);
  var cx = (vb[0]+vb[2]/2-150)/100, cy = (FL-(vb[1]+vb[3]*0.55))/100 ;
  var fv = V.cam.fov*Math.PI/360, asp = V.cam.aspect || 1;
  var dist = Math.max(h/(2*Math.tan(fv)), w/(2*Math.tan(fv)*asp))*1.05 + 0.5;
  V.dist = dist; V.tgt = new THREE.Vector3(cx, Math.max(cy, 0.45), 0); V.ctl.target.copy(V.tgt);
  V.baseAz = 0.75; setAz(V.baseAz); V.ctl.update();
}
function setAz(a){ var d = V.dist, el = 0.2; V.cam.position.set(V.tgt.x + Math.sin(a)*Math.cos(el)*d, V.tgt.y + Math.sin(el)*d, V.tgt.z + Math.cos(a)*Math.cos(el)*d); V.cam.lookAt(V.tgt); }

function clearProps(){ while (V.props.children.length){ var c = V.props.children.pop(); V.props.remove(c); } V.props.children.length = 0; }
function addRod(a, b, r, mat){ var c = Cap(mat); setCap(c, a, b, r); V.props.add(c); return c; }
function addBox(mid, sx, sy, sz, mat, rotZ){ var m = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), mat || DARK); m.position.copy(mid); if (rotZ) m.rotation.z = rotZ; V.props.add(m); return m; }
function buildScene(spec){
  clearProps();
  if (!spec.scene) return;
  if (spec.dipBars){ [-1,1].forEach(function(sg){ addRod(P(112,130,sg*0.32), P(196,130,sg*0.32), 0.022, METAL); [116,192].forEach(function(px){ addRod(P(px,130,sg*0.32), P(px,FL,sg*0.32), 0.02, DARK); }); }); return; }
  var K0 = Ragdoll.kin(spec.A), shapes = spec.scene(K0, spec.A), frameBar = null;
  shapes.forEach(function(s){ if (s.k === 'l' && s.w <= 6 && Math.abs(s.a[1]-s.b[1]) < 4 && Math.abs(s.a[0]-s.b[0]) > 60 && s.a[1] < FL-60) frameBar = s; });
  var seenPost = {};
  if (spec.twin){ [-1,1].forEach(function(sg){ var tx = spec.anchor[0]; addBox(P(tx-6, (spec.anchor[1]+FL)/2 - 0, sg*0.9), 0.1, (FL-spec.anchor[1]+14)*U, 0.18, DARK); }); return; }
  shapes.forEach(function(s){
    if (s.k === 'l'){
      var vertical = Math.abs(s.a[0]-s.b[0]) < 6, thin = s.w <= 6.5;
      if (frameBar && thin){
        var mx = (frameBar.a[0]+frameBar.b[0])/2;
        if (s === frameBar){ addRod(P(mx,s.a[1],-0.5), P(mx,s.a[1],0.5), 0.022, METAL); }
        else if (vertical && !seenPost[Math.round(s.a[1])]){ seenPost[Math.round(s.a[1])] = 1; [-0.52,0.52].forEach(function(z){ addRod(P(mx,s.a[1],z), P(mx,FL,z), 0.022, DARK); }); }
        return;
      }
      if (thin){ [-0.16,0.16].forEach(function(z){ addRod(P(s.a[0],s.a[1],z), P(s.b[0],s.b[1],z), s.w/200, DARK); }); return; }
      var depth = s.w >= 9 ? 0.36 : 0.2;
      var a = P(s.a[0],s.a[1],0), b = P(s.b[0],s.b[1],0), c = Cap(DARK); setCap(c, a, b, s.w/200, depth/2); V.props.add(c);
    } else if (s.k === 'r'){
      addBox(P(s.x+s.w/2, s.y+s.h/2, 0), s.w*U, s.h*U, 0.38, DARK);
    } else if (s.k === 'c'){
      var bl = Ball(DARK, s.r*U); bl.position.copy(P(s.x,s.y,0)); V.props.add(bl);
    }
  });
}
function buildProps(spec, K, p, t){
  // dynamic props (follow the hands): rebuilt cheaply each frame from a small pool
  var pool = V.dyn || (V.dyn = new THREE.Group()); if (!pool.parent) V.scene.add(pool);
  while (pool.children.length) pool.remove(pool.children[0]);
  var kind = spec.prop; if (!kind || kind === 'none') return;
  if (p.fd && V.h3){      // pec deck: vertical pads on the forearms, lever arms back to a pivot
    var pv0 = P(K.S[0]-22, K.S[1]+12, 0); var pb0 = Ball(DARK, 0.05); pb0.position.copy(pv0); pool.add(pb0);
    V.h3.forEach(function(hh){ var E = hh[0], H = hh[1]; var mid = E.clone().add(H).multiplyScalar(0.5); var pd = new THREE.Mesh(CYL, GOLDM); pd.scale.set(0.05, E.distanceTo(H)*1.05, 0.05); pd.position.copy(mid); pool.add(pd);
      var c = Cap(DARK); setCap(c, pv0, E, 0.02); pool.add(c); });
    return;
  }
  if (spec.twin && V.h3){  // cable crossover: one cable from each side tower to each hand
    V.h3.forEach(function(hh, i){ var sg = (i === 0 ? 1 : -1) * (spec.cross ? -1 : 1), an3 = P(spec.anchor[0], spec.anchor[1], sg*0.9); rod(an3, hh[1], 0.007, METAL); var hb = Ball(GOLDM, 0.034); hb.position.copy(hh[1]); pool.add(hb); var pu = Ball(GOLDM, 0.03); pu.position.copy(an3); pool.add(pu); });
    return;
  }
  var pr = null; if (p.ph) pr = [K.H[0]+p.ph[0], K.H[1]+p.ph[1]]; if (p.ps) pr = [K.S[0]+p.ps[0], K.S[1]+p.ps[1]];
  var at = pr || K.hand; if (spec.attach && K[spec.attach]) at = K[spec.attach];
  var A3 = P(at[0],at[1],0), r = (spec.pr || (kind === 'db' ? 8.5 : 17))*U*1.15;
  function cyl(pos, rad, len, mat){ var m = new THREE.Mesh(CYL, mat); m.scale.set(rad,len,rad); m.rotation.x = Math.PI/2; m.position.copy(pos); pool.add(m); return m; }
  function rod(a,b,rad,mat){ var c = Cap(mat); setCap(c,a,b,rad); pool.add(c); }
  if (kind === 'bar' || kind === 'ez'){
    cyl(A3, 0.018, 1.6, METAL);
    [-1,1].forEach(function(sd){ [0.58,0.65].forEach(function(zz){ var pl = cyl(new THREE.Vector3(A3.x,A3.y,sd*zz), r, 0.055, PLATE); });
      cyl(new THREE.Vector3(A3.x,A3.y,sd*0.71), 0.035, 0.03, GOLDM); });
  } else if (kind === 'db'){
    var ax = spec.dbAxis || 'z', hzo2 = p.hz !== undefined ? p.hz : (p.zs||0), hoz2 = p.hoz || 0;
    var orient = function(m){ if (ax === 'x') m.rotation.set(0,0,Math.PI/2); else if (ax === 'y') m.rotation.set(0,0,0); else m.rotation.set(Math.PI/2,0,0); };
    var oneDb = function(c){ orient(cyl(c, 0.02, 0.2, METAL)); [-0.085,0.085].forEach(function(dd){ var pc = c.clone(); if (ax === 'x') pc.x += dd; else if (ax === 'y') pc.y += dd; else pc.z += dd; orient(cyl(pc, r*0.95, 0.045, PLATE)); }); };
    var hands = V.h3 ? V.h3.map(function(hh){ return hh[1]; }) : [P(K.hand[0],K.hand[1],0.2+hzo2+hoz2), P(K.handF[0],K.handF[1],-0.2-hzo2+hoz2)];
    if (spec.dbMode === 'center') oneDb(hands[0].clone().add(hands[1]).multiplyScalar(0.5));
    else if (spec.single) oneDb(hands[0]);
    else hands.forEach(oneDb);
  } else if (kind === 'cable'){
    var an = P(spec.anchor[0],spec.anchor[1],spec.anchorZ||0); rod(an, A3, 0.007, METAL); cyl(A3, 0.014, spec.gw||0.42, GOLDM);
    var pb = Ball(GOLDM, 0.03); pb.position.copy(an); pool.add(pb);
  } else if (kind === 'lever'){
    var pv = P(spec.pivot[0],spec.pivot[1],0); rod(pv, A3, 0.022, DARK); cyl(A3, 0.016, 0.46, GOLDM); var pb2 = Ball(DARK, 0.045); pb2.position.copy(pv); pool.add(pb2);
  } else if (kind === 'wheel'){
    var w = cyl(A3, 0.09, 0.12, PLATE); 
  } else if (kind === 'pad'){
    cyl(A3, 0.065, 0.34, DARK);
  } else if (kind === 'sled'){
    var dx = K.ank[0]-K.H[0], dy = K.ank[1]-K.H[1], l = Math.sqrt(dx*dx+dy*dy)||1, q = P(K.ank[0]+dx/l*5, K.ank[1]+dy/l*5, 0);
    var box = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.5,0.62), DARK); box.position.copy(q); box.rotation.z = Math.atan2(-dy, dx) - 0 ; box.rotation.z = Math.atan2(dx, -dy) * -1 + Math.PI; pool.add(box);
  }
}
var _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
function pose(spec, u, t){
  var p = Ragdoll.mix(spec.A, spec.B, u), K = Ragdoll.kin(p), B = V.B;
  var ZS = 0.2, ZH = 0.1;       // shoulder / hip half width
  var Hn = P(K.H[0],K.H[1],0), Sn = P(K.S[0],K.S[1],0);
  setCap(B.torso, P(K.H[0]+(K.S[0]-K.H[0])*0.06, K.H[1]+(K.S[1]-K.H[1])*0.06, 0), P(K.H[0]+(K.S[0]-K.H[0])*0.98, K.H[1]+(K.S[1]-K.H[1])*0.98,0), 0.125, 0.185);
  setCap(B.pelvis, P(K.H[0],K.H[1],-0.1), P(K.H[0],K.H[1],0.1), 0.115, 0.115); B.pelvis.visible = true;
  // pelvis capsule along z: reorient manually
  B.pelvis.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0,0,1)); B.pelvis.position.copy(P(K.H[0],K.H[1],0)); B.pelvis.userData.cyl.scale.set(0.115,0.2,0.115); B.pelvis.userData.s0.position.set(0,-0.1,0); B.pelvis.userData.s1.position.set(0,0.1,0); B.pelvis.userData.s0.scale.setScalar(0.115); B.pelvis.userData.s1.scale.setScalar(0.115);
  var nk = P(K.S[0]+K.hv[0]*3, K.S[1]+K.hv[1]*3,0), hd = P(K.C[0],K.C[1],0);
  setCap(B.neck, nk, hd, 0.05); B.head.position.copy(hd);
  // shoulders (across the body)
  [[B.shN, ZS],[B.shF,-ZS]].forEach(function(s){ setCap(s[0], P(K.S[0],K.S[1],s[1]*0.0-0.0), P(K.S[0],K.S[1],s[1]), 0.0001, 0.0001); s[0].visible = false; });
  // legs
  var lz = p.lz || 0;
  function leg(th, sh, ft, hipz, knee, ank, fa, mat){
    var sg = hipz > 0 ? 1 : -1, kz = hipz + sg*lz*0.5, az = hipz + sg*lz;
    var Hh = P(K.H[0],K.H[1],hipz), Kn = P(knee[0],knee[1],kz), An = P(ank[0],ank[1],az);
    setCap(th, Hh, Kn, 0.075, 0.075); setCap(sh, Kn, An, 0.058, 0.058);
    var toe = P(ank[0]+Math.cos(fa)*15, ank[1]+Math.sin(fa)*15, az); setCap(ft, P(ank[0]-3,ank[1]+1,az), toe, 0.036, 0.05);
  }
  leg(B.thighN,B.shinN,B.footN, ZH, K.knee, K.ank, K.fa);
  leg(B.thighF,B.shinF,B.footF, -ZH, K.kneeF, K.ankF, K.fa2);
  // arms (near = +z shoulder, far = -z shoulder)
  var zs = p.zs || 0, hzo = p.hz !== undefined ? p.hz : zs, ezo = p.ez !== undefined ? p.ez : zs*0.5, hoz = p.hoz || 0;
  function arm(ua, fa, z, elb, hand){ if (p.eo) elb = [K.S[0]+p.eo[0], K.S[1]+p.eo[1]]; var sg = z > 0 ? 1 : -1, Sh = P(K.S[0],K.S[1],z), El = P(elb[0],elb[1],z+sg*ezo+hoz*0.5), Hd = P(hand[0],hand[1],z+sg*hzo+hoz); setCap(ua, Sh, El, 0.052, 0.052); setCap(fa, El, Hd, 0.044, 0.044); return [Sh,El,Hd]; }
  var an = arm(B.uaN,B.faN,ZS,K.elb,K.hand), af = arm(B.uaF,B.faF,-ZS,K.elbF,K.handF);
  B.handN.position.copy(an[2]); B.handF.position.copy(af[2]);
  V.h3 = null;
  if (p.fl !== undefined){     // chest fly family: arms swing in the side-to-side plane around the torso's front direction
    var th = p.fl*Math.PI/180, fe = (p.fe||0)*Math.PI/180, deck = !!p.fd, R = 0.64, l1 = 0.34, l2 = 0.32, hs = [];
    var n3 = new THREE.Vector3(K.n[0], -K.n[1], 0).normalize(), lat = (p.fb === 'lat'), b0 = lat ? new THREE.Vector3(0,-1,0) : n3;
    [1,-1].forEach(function(sg, idx){
      var S3 = P(K.S[0],K.S[1],sg*ZS), Y = new THREE.Vector3(0,1,0);
      var dir = b0.clone().multiplyScalar(Math.cos(th)).add(new THREE.Vector3(0,0,sg*Math.sin(th))).normalize().multiplyScalar(Math.cos(fe)).add(Y.clone().multiplyScalar(Math.sin(fe))).normalize();
      var E3, H3;
      if (deck){ E3 = S3.clone().add(dir.clone().multiplyScalar(l1)); H3 = E3.clone().add(new THREE.Vector3(0,l2,0)); }
      else {
        H3 = S3.clone().add(dir.clone().multiplyScalar(R));
        var d = H3.clone().sub(S3), dl = d.length(), u = d.clone().divideScalar(dl), x = (l1*l1-l2*l2+dl*dl)/(2*dl), h = Math.sqrt(Math.max(l1*l1-x*x,0));
        var pole = b0.clone().multiplyScalar(lat ? Math.sin(th) : -Math.sin(th)).add(new THREE.Vector3(0,0,sg*Math.cos(th))); pole.sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
        E3 = S3.clone().add(u.clone().multiplyScalar(x)).add(pole.multiplyScalar(h));
      }
      var ua = idx ? B.uaF : B.uaN, fa = idx ? B.faF : B.faN; setCap(ua, S3, E3, 0.052, 0.052); setCap(fa, E3, H3, 0.044, 0.044);
      (idx ? B.handF : B.handN).position.copy(H3); hs.push([E3, H3]);
    });
    V.h3 = hs; an[1] = hs[0][0]; af[1] = hs[1][0]; an[2] = hs[0][1]; af[2] = hs[1][1];
  }
  var js = [P(K.knee[0],K.knee[1],ZH+lz*0.5), P(K.kneeF[0],K.kneeF[1],-ZH-lz*0.5), an[1], af[1], an[0], af[0], P(K.H[0],K.H[1],ZH), P(K.H[0],K.H[1],-ZH)];
  B.joints.forEach(function(j,i){ j.position.copy(js[i]); });
  buildProps(spec, K, p, t);
  // gold muscle highlight
  var hi = V.hi; hi.forEach(function(h){ h.visible = false; });
  var m = spec.muscle, pulse = 0.5 + 0.2*Math.sin(t*5); HI.opacity = pulse;
  function limb(i, a, b, z, u0, u1, r){ var A = P(a[0]+(b[0]-a[0])*u0, a[1]+(b[1]-a[1])*u0, z), Bp = P(a[0]+(b[0]-a[0])*u1, a[1]+(b[1]-a[1])*u1, z); setCap(hi[i], A, Bp, r, r); }
  var tv = K.t, nv = K.n;
  function onT(u, off, z){ return P(K.H[0]+tv[0]*60*u+nv[0]*off, K.H[1]+tv[1]*60*u+nv[1]*off-(p.sh||0)*u, z||0); }
  function limb3(i, a, b, u0, u1, rr){ setCap(hi[i], a.clone().lerp(b,u0), a.clone().lerp(b,u1), rr, rr); }
  if (m === 'biceps' || m === 'triceps'){ limb3(0,an[0],an[1],.16,.84,0.066); limb3(1,af[0],af[1],.16,.84,0.066); }
  else if (m === 'forearms'){ limb3(0,an[1],an[2],.12,.9,0.056); limb3(1,af[1],af[2],.12,.9,0.056); }
  else if (m === 'quads' || m === 'hamstrings'){ limb(0,K.H,K.knee,ZH,.12,.9,0.088); limb(1,K.H,K.kneeF,-ZH,.12,.9,0.088); }
  else if (m === 'calves'){ limb(0,K.knee,K.ank,ZH,.1,.85,0.07); limb(1,K.kneeF,K.ankF,-ZH,.1,.85,0.07); }
  else if (m === 'shoulders'){ setCap(hi[0], P(K.S[0],K.S[1],ZS), P(K.S[0],K.S[1]+0.001*100,ZS), 0.085, 0.085); setCap(hi[1], P(K.S[0],K.S[1],-ZS), P(K.S[0],K.S[1]+0.1,-ZS), 0.085, 0.085); }
  else if (m === 'glutes'){ setCap(hi[0], P(K.H[0]-nv[0]*5,K.H[1]-nv[1]*5,0.09), P(K.H[0]-nv[0]*5,K.H[1]-nv[1]*5+0.1,0.09), 0.1, 0.1); setCap(hi[1], P(K.H[0]-nv[0]*5,K.H[1]-nv[1]*5,-0.09), P(K.H[0]-nv[0]*5,K.H[1]-nv[1]*5+0.1,-0.09), 0.1, 0.1); }
  else if (m === 'chest'){ setCap(hi[0], onT(.74,8,0.09), onT(.84,8,0.09), 0.062, 0.1); setCap(hi[1], onT(.74,8,-0.09), onT(.84,8,-0.09), 0.062, 0.1); }
  else if (m === 'abs'){ setCap(hi[0], onT(.14,9,0), onT(.5,9,0), 0.055, 0.12); }
  else if (m === 'back'){ setCap(hi[0], onT(.45,-9,0), onT(.8,-9,0), 0.058, 0.16); }
  else if (m === 'traps'){ setCap(hi[0], onT(.8,-8,0), onT(1.0,-5,0), 0.06, 0.13); }
}
function loop(now){
  V.raf = requestAnimationFrame(loop);
  if (!V.spec || (V.vis === false)) return;
  var t = now/1000, u = Ragdoll.phase(t, V.spec);
  pose(V.spec, u, t);
  if (V.swing && V.baseAz !== undefined){ setAz(V.baseAz + 0.6*Math.sin(t*0.35)); }
  V.ctl.update();
  V.renderer.render(V.scene, V.cam);
}
function show(spec){ V.spec = spec; buildScene(spec); V.swing = true; frame(spec); }
function snap(spec,u,az){ V.spec = spec; buildScene(spec); frame(spec); V.swing=false; setAz(az === undefined ? V.baseAz : az); pose(spec,u,0.6); V.ctl.update(); V.renderer.render(V.scene,V.cam); return V.renderer.domElement.toDataURL('image/jpeg',0.8); }
g.R3 = { init:init, show:show, snap:snap, get V(){ return V; } };
})(window);
