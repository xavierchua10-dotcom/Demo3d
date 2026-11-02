/* name -> motion spec. Equipment decides the prop (barbell / dumbbell / cable / machine). */
(function(g){
var M = g.RDM;
function pr(e, cableOk){ e = (e||'').toLowerCase(); return e === 'dumbbell' ? 'db' : e === 'cable' ? 'cable' : e === 'machine' ? 'lever' : e === 'ez-bar' ? 'ez' : e === 'barbell' ? 'bar' : 'none'; }
var TABLE = [
  [/^Treadmill$/, function(){ return M.treadmill(); }],
  [/^Stationary Bike$/, function(){ return M.bike(); }],
  [/^Rowing Machine$/, function(){ return M.rower(); }],
  [/^Elliptical$/, function(){ return M.elliptical(); }],
  [/^Stair Climber$/, function(){ return M.stairs(); }],
  [/^Running \(Outdoor\)$/, function(){ return M.run(); }],
  [/^Walking$/, function(){ return M.walk(); }],
  [/^Jump Rope$/, function(){ return M.rope(); }],
  [/^Close-Grip Bench/, function(){ return M.bench(0,'bar','triceps',true); }],
  [/^Barbell Bench Press/, function(n,e){ return M.bench(0,'bar'); }],
  [/^Dumbbell Bench Press/, function(){ return M.bench(0,'db'); }],
  [/^Machine Bench Press/, function(){ return M.machineBench(); }],
  [/Incline Bench Press/, function(n,e){ return M.bench(40, e==='Dumbbell'?'db':'bar'); }],
  [/Decline Bench Press/, function(n,e){ return M.bench(-15, e==='Dumbbell'?'db':'bar'); }],
  [/^Dumbbell Chest Fly/, function(){ return M.fly(); }],
  [/^Cable Chest Fly \((\w+)\)/, function(n){ return M.cableFly(/\((\w+)\)/.exec(n)[1]); }],
  [/^Machine Chest Fly/, function(){ return M.pecDeck(); }],
  [/^Push-ups/, function(){ return M.pushup(); }],
  [/^Dips/, function(n,e,m){ return M.dips(m === 'Chest' ? 'chest' : 'triceps'); }],
  [/^Cable Chest Press/, function(){ return M.cablePress(); }],
  [/^Pull-ups/, function(){ return M.pullup(); }],
  [/^Lat Pulldown|^Undergrip Lat Pulldown|^Machine Lat Pulldown/, function(){ return M.pulldown(); }],
  [/^Machine Row/, function(){ return M.rowSeated(true); }],
  [/^Seated Cable Row|^Single-Arm Cable Row/, function(){ return M.rowSeated(false); }],
  [/Dumbbell Row/, function(){ return M.rowOne(); }],
  [/^T-Bar Row/, function(){ var s = M.rowBent('lever'); s.pivot = [22,201]; return s; }],
  [/Barbell Row/, function(){ return M.rowBent('bar'); }],
  [/^Cable Pullover/, function(){ return M.pullover(); }],
  [/^Deadlift/, function(){ return M.deadlift(false); }],
  [/^Sumo Deadlift/, function(){ return M.deadlift(true); }],
  [/Arnold Press/, function(){ return M.ohp('db', true, true); }],
  [/Shoulder Press/, function(n,e){ return M.ohp(pr(e), true); }],
  [/Lateral Raise/, function(n,e){ return M.latRaise(pr(e)); }],
  [/Front Raise/, function(n,e){ return M.frontRaise(pr(e)); }],
  [/Rear Delt Fly/, function(n,e){ return M.rearFly(pr(e)); }],
  [/^Face Pull/, function(){ return M.facePull(); }],
  [/Shrug/, function(n,e){ return M.shrug(pr(e)); }],
  [/Upright Row/, function(n,e){ return M.upright(pr(e)); }],
  [/Preacher Curl/, function(n,e){ return M.curl(pr(e),'preacher'); }],
  [/Concentration Curl/, function(){ return M.curl('db','conc'); }],
  [/Tricep Pushdown|Tricep Rope Pushdown/, function(){ return M.pushdown(); }],
  [/Skull Crushers/, function(n,e){ return M.skull(pr(e)); }],
  [/Overhead Extension/, function(n,e){ return M.overheadExt(pr(e)); }],
  [/Tricep Kickback/, function(n,e){ return M.kickback(pr(e)); }],
  [/Wrist Curl/, function(n,e){ return M.wrist(pr(e)); }],
  [/^Dead Hang/, function(){ return M.hang(); }],
  [/^Crunches/, function(){ return M.crunch(); }],
  [/^Plank/, function(){ return M.plank(); }],
  [/^Hanging Leg Raise/, function(){ return M.legRaise(); }],
  [/^Cable Crunch/, function(){ return M.cableCrunch(); }],
  [/^Pallof/, function(){ return M.pallof(); }],
  [/^Russian Twist/, function(){ return M.twist(); }],
  [/^Ab Wheel/, function(){ return M.abWheel(); }],
  [/^Back Squat/, function(){ return M.squat('back'); }],
  [/^Front Squat/, function(){ return M.squat('front'); }],
  [/Goblet Squat/, function(){ return M.squat('goblet'); }],
  [/^Leg Press/, function(){ return M.legPress(false); }],
  [/^Calf Press/, function(){ return M.calfPress(); }],
  [/Bulgarian/, function(n,e,m){ return M.bulgarian(e==='Dumbbell'?'db':'none', m==='Glutes'?'glutes':'quads'); }],
  [/Lunges/, function(n,e){ return M.lunge(e==='Barbell'?'bar':e==='Dumbbell'?'db':'none'); }],
  [/^Leg Extension/, function(){ return M.legExt(); }],
  [/^Seated Leg Curl/, function(){ return M.legCurlSeated(); }],
  [/^Lying Leg Curl/, function(){ return M.legCurlLying(); }],
  [/^Nordic Curl/, function(){ return M.nordic(); }],
  [/Good Morning/, function(){ return M.rdl('bar','gm'); }],
  [/Romanian Deadlift|Stiff-Leg Deadlift/, function(n,e){ return M.rdl(e==='Dumbbell'?'db':'bar'); }],
  [/Cable Pull-Through/, function(){ return M.rdl('cable'); }],
  [/Hip Thrust/, function(n,e){ return M.hipThrust(pr(e)); }],
  [/^Glute Bridge/, function(){ return M.bridge(); }],
  [/Glute Kickback/, function(){ return M.glutKick(); }],
  [/Seated Calf Raise/, function(){ return M.calfSeated(); }],
  [/Standing Calf Raise/, function(n,e){ return M.calf(e==='Barbell'?'bar':e==='Dumbbell'?'db':'lever'); }],
  [/Curl$/, function(n,e){ return M.curl(pr(e)); }]
];

var FORMS = [];
function F(re, p, m){ FORMS.push({re:re, p:p, m:m}); }
// ---- 3D form (grip width z, elbow flare ez, stance lz, dumbbell axis, cables, bars) ----
F(/^Machine Bench Press/, {A:{hz:.12,ez:.18,lz:.12}, B:{hz:.12,ez:.1}});
F(/^Push-ups/, {A:{hz:.1,ez:.1,lz:.03}, B:{ez:.22}});
F(/^Dips/, {A:{hz:.12,ez:.12}, B:{ez:.24}, S:{dipBars:true}}, 'Chest');
F(/^Dips/, {A:{hz:.1,ez:.02}, B:{ez:.03}, S:{dipBars:true}}, 'Triceps');
F(/^Cable Chest Press/, {A:{hz:.1,ez:.08}, B:{ez:.12}});
F(/^Pull-ups/, {A:{hz:.26,ez:.24}, B:{ez:.3}});
F(/^(Lat Pulldown|Machine Lat Pulldown)/, {A:{hz:.26,ez:.2,lz:.05}, B:{ez:.14}, S:{gw:.95}});
F(/^Undergrip Lat Pulldown/, {A:{hz:.05,ez:.02,lz:.05}, B:{ez:0}, S:{gw:.5}});
F(/^(Barbell Row|Overgrip Barbell Row)/, {A:{hz:.1,ez:.05,lz:.06}, B:{ez:.16}});
F(/^Undergrip Barbell Row/, {A:{hz:.03,ez:0,lz:.06}, B:{ez:0}});
F(/^Close Grip Barbell Row/, {A:{hz:-.06,ez:-.03,lz:.06}, B:{ez:-.02}});
F(/^T-Bar Row/, {A:{hz:-.1,ez:-.05,lz:.12}, B:{ez:-.04}, S:{solo:true}});
F(/Dumbbell Row/, {A:{lz:.06}, S:{single:true,dbAxis:'x'}});
F(/^Machine Row/, {A:{hz:.08,ez:.04}, B:{ez:.1}});
F(/^Seated Cable Row/, {A:{hz:-.1,ez:-.05,lz:.12}, B:{ez:-.03}, S:{gw:.16}});
F(/^Single-Arm Cable Row/, {A:{hz:0,ez:-.02,lz:.12,hd2:[176,150]}, S:{gw:.12}});
F(/^Cable Pullover/, {A:{hz:.06,ez:.04,lz:.05}, S:{gw:.42}});
F(/^Deadlift/, {A:{lz:.06,hz:.1,ez:.1}});
F(/^Sumo Deadlift/, {A:{lz:.24,hz:-.08,ez:-.1}});
F(/Shoulder Press/, {A:{hz:.12,ez:.12,lz:.04}, B:{ez:.08}});
F(/^Arnold Press/, {A:{hz:-.04,ez:.02}, B:{hz:.1,ez:.1}});
F(/Lateral Raise/, {A:{fl:0,fb:'lat'}, B:{fl:88}, S:{wide:true,dbAxis:'x'}});
F(/^Cable Lateral Raise/, {S:{twin:true,cross:true,anchor:[150,204]}});
F(/Lateral Raise/, {A:{fq:-1}, B:{fq:-1}});
F(/^Machine Lateral Raise/, {A:{fm:1,fe:0}, B:{fm:1,fe:0}, S:{prop:'none'}});
F(/^Dumbbell Rear Delt Fly/, {A:{fl:0,fb:'lat',fq:-1}, B:{fl:84,fb:'lat',fq:-1}, S:{wide:true,dbAxis:'x'}});
F(/^Cable Rear Delt Fly/, {A:{fl:6}, B:{fl:96}, S:{twin:true,cross:true,colTop:22,wide:true}});
F(/^Face Pull/, {A:{hz:.06,ez:.03,eo:[30,6]}, B:{hz:.16,ez:.34,eo:[-6,3]}, S:{gw:.2}});
F(/^Barbell Shrug/, {A:{hz:.16,ez:.1,lz:.04}});
F(/^(Dumbbell|Cable) Shrug/, {A:{hz:.06,ez:.04,lz:.04}, S:{dbAxis:'x'}});
F(/Upright Row/, {A:{hz:0,ez:.02,lz:.04}, B:{hz:0,ez:.22,eo:[6,-10]}});
F(/^Dumbbell Hammer Curl/, {S:{dbAxis:'x'}});
F(/^Cable Hammer Curl/, {S:{gw:.2}});
F(/^Cable Curl/, {S:{gw:.45}});
F(/Concentration Curl/, {A:{lz:.26,hz:-.06,ez:-.04}, B:{hz:-.06,ez:-.04}, S:{single:true}});
F(/^Tricep Pushdown/, {S:{gw:.45}});
F(/^Tricep Rope Pushdown/, {A:{hz:-.08}, B:{hz:.12}, S:{gw:.2}});
F(/Skull Crushers/, {B:{ez:-.03}, S:{dbAxis:'x'}});
F(/Overhead Extension/, {A:{hz:-.15,ez:-.1}, S:{dbMode:'center',dbAxis:'y',gw:.2}});
F(/Tricep Kickback/, {S:{single:true,dbAxis:'x'}});
F(/Wrist Curl/, {A:{hz:.04,ez:0,lz:.1}});
F(/^Dead Hang/, {A:{hz:.26,ez:.24}});
F(/^Crunches/, {A:{hz:-.1,ez:.2,lz:.06}});
F(/^Hanging Leg Raise/, {A:{hz:.15,ez:.1}});
F(/^Cable Crunch/, {A:{hz:-.12,ez:.2}, S:{gw:.2}});
F(/^Pallof/, {A:{hz:-.17,ez:-.1,lz:.1}, S:{anchorZ:.95,gw:.1}});
F(/^Russian Twist/, {A:{hz:-.15,ez:-.08,hoz:-.3,lz:.06}, B:{hoz:.3}, S:{dbMode:'center',dbAxis:'z'}});
F(/^Back Squat/, {A:{lz:.14,hz:.22,ez:.14}});
F(/^Front Squat/, {A:{lz:.14,hz:.04}});
F(/Goblet Squat/, {A:{lz:.12,hz:-.14,ez:-.08}, S:{dbMode:'center',dbAxis:'y'}});
F(/^Leg Press/, {A:{lz:.12}});
F(/Lunges/, {A:{lz:.06}, S:{dbAxis:'x'}});
F(/Bulgarian/, {A:{lz:.06}, S:{dbAxis:'x'}});
F(/Romanian|Stiff-Leg/, {A:{lz:.05,hz:.1,ez:.1}, S:{dbAxis:'x'}});
F(/Good Morning/, {A:{lz:.1,hz:.2,ez:.16}});
F(/Hip Thrust/, {A:{lz:.06,hz:.1}});
F(/^(Machine|Cable) Hip Thrust/, {A:{hz:-.08}});
F(/^Glute Bridge/, {A:{lz:.06}});
F(/Pull-Through/, {A:{lz:.14}, S:{gw:.2}});
F(/Standing Calf Raise/, {A:{lz:.06}, S:{dbAxis:'x'}});
F(/Seated Calf Raise/, {A:{lz:.08}});
F(/Leg Extension|Leg Curl/, {A:{lz:.04}});
g.RDMap = function(name, equip, muscle){
  for (var i = 0; i < TABLE.length; i++) if (TABLE[i][0].test(name)){
    var s = TABLE[i][1](name, equip, muscle); s.id = name;
    FORMS.forEach(function(f){ if (f.re.test(name) && (!f.m || f.m === muscle)){ Object.assign(s.A, f.p.A || {}); s.B = s.B || {}; Object.assign(s.B, f.p.B || {}); Object.assign(s, f.p.S || {}); } });
    return s;
  }
  return null;
};
})(window);
