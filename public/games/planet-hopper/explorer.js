import { objectDetails } from './object-details.js';
import { objectImages } from './object-images.js';

let THREE;
try {
  THREE = await import('three');
} catch (error) {
  const message = document.getElementById('error');
  message.textContent = 'Could not load the 3D engine. Reload or ask a parent to check the game deployment.';
  message.classList.remove('hide');
  throw error;
}

const $ = id => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const bodies = [
  {name:'Sun', icon:'☀️', type:'Star', color:'#ffb53d', radius:5, orbit:0, speed:0, diameter:'1.39 million km', gravity:'27.9× Earth', moons:'No moons', distance:'0 km', fact:'The Sun is a star. Nuclear fusion in its core provides the energy that lights and warms the solar system.'},
  {name:'Mercury', icon:'🪨', type:'Rocky planet', color:'#a79788', radius:.72, orbit:10, speed:.055, angle:.7, diameter:'4,879 km', gravity:'0.38× Earth', moons:'0', distance:'57.9 million km', fact:'Mercury is the closest planet to the Sun. One solar day there lasts about 176 Earth days.'},
  {name:'Venus', icon:'🟠', type:'Rocky planet', color:'#e6ab65', radius:1.1, orbit:15, speed:.038, angle:2.5, diameter:'12,104 km', gravity:'0.904× Earth', moons:'0', distance:'108.2 million km', fact:'Venus is the hottest planet. Its thick carbon-dioxide atmosphere traps heat in an extreme greenhouse effect.'},
  {name:'Earth', icon:'🌍', type:'Rocky planet', color:'#337bc0', radius:1.25, orbit:21, speed:.028, angle:.4, diameter:'12,742 km', gravity:'1× Earth', moons:'1', distance:'149.6 million km', fact:'Earth is our home. Liquid water covers about 71% of its surface, and its atmosphere helps support life.'},
  {name:'Mars', icon:'🔴', type:'Rocky planet', color:'#ce704c', radius:.9, orbit:27, speed:.021, angle:3.3, diameter:'6,779 km', gravity:'0.38× Earth', moons:'2', distance:'227.9 million km', fact:'Mars is red because iron-rich dust has rusted. It has two small moons, Phobos and Deimos.'},
  {name:'Jupiter', icon:'🪐', type:'Gas giant', color:'#d4ac89', radius:3, orbit:37, speed:.012, angle:5, diameter:'139,820 km', gravity:'2.53× Earth', moons:'95+ known', distance:'778.6 million km', fact:'Jupiter is the largest planet. Its Great Red Spot is a giant storm, and it has no solid surface to land on.'},
  {name:'Saturn', icon:'🪐', type:'Gas giant', color:'#dfc48a', radius:2.5, orbit:49, speed:.008, angle:2, diameter:'116,460 km', gravity:'1.065× Earth', moons:'145+ known', distance:'1.43 billion km', fact:'Saturn’s rings are made mostly of countless pieces of water ice. Saturn itself is a gas giant.'},
  {name:'Uranus', icon:'🔵', type:'Ice giant', color:'#8ad6dd', radius:1.8, orbit:60, speed:.005, angle:4, diameter:'50,724 km', gravity:'0.886× Earth', moons:'28+ known', distance:'2.87 billion km', fact:'Uranus is an ice giant that spins almost on its side. Methane in its atmosphere helps give it a blue-green color.'},
  {name:'Neptune', icon:'🔷', type:'Ice giant', color:'#4b70df', radius:1.75, orbit:71, speed:.003, angle:5.7, diameter:'49,244 km', gravity:'1.14× Earth', moons:'16+ known', distance:'4.50 billion km', fact:'Neptune is the farthest planet from the Sun. Its atmosphere has some of the fastest winds in the solar system.'},
  {name:'Pluto', icon:'🧊', type:'Dwarf planet', category:'Dwarf planets', color:'#cbb7a5', radius:.55, orbit:81, speed:.002, angle:1.2, diameter:'2,377 km', gravity:'0.063× Earth', moons:'5', distance:'5.91 billion km', fact:'Pluto is a dwarf planet in the Kuiper Belt. Its largest moon, Charon, is surprisingly large compared with Pluto.'},
  {name:'Ceres', icon:'🧊', type:'Dwarf planet', category:'Dwarf planets', color:'#b9b3a5', radius:.5, orbit:32, speed:.014, angle:2.1, diameter:'About 952 km', gravity:'—', moons:'0', distance:'413 million km', fact:'Ceres is the largest object in the main asteroid belt and the only dwarf planet in the inner solar system. NASA’s Dawn spacecraft visited it.'},
  {name:'Haumea', icon:'🧊', type:'Dwarf planet', category:'Dwarf planets', color:'#c9b8a8', radius:.6, orbit:94, speed:.0016, angle:4.7, diameter:'About 1,740 km across', gravity:'—', moons:'2', distance:'About 6.5 billion km', fact:'Haumea spins so quickly that it is stretched into an elongated shape. It lies in the Kuiper Belt.'},
  {name:'Makemake', icon:'🧊', type:'Dwarf planet', category:'Dwarf planets', color:'#c39480', radius:.5, orbit:103, speed:.0014, angle:2.9, diameter:'About 1,430 km', gravity:'—', moons:'1', distance:'About 6.8 billion km', fact:'Makemake is a dwarf planet in the Kuiper Belt. It has a known moon nicknamed MK 2.'},
  {name:'Eris', icon:'🧊', type:'Dwarf planet', category:'Dwarf planets', color:'#d5c7bd', radius:.6, orbit:113, speed:.001, angle:5.4, diameter:'About 2,400 km', gravity:'—', moons:'1', distance:'About 10 billion km', fact:'Eris is nearly the size of Pluto. Its discovery helped prompt the debate that led to Pluto’s reclassification.'},
  {name:'Asteroid Belt', icon:'✨', type:'Region', region:true, color:'#8bc8d8', radius:.45, orbit:32, speed:.01, angle:3.8, fact:'The main asteroid belt is a broad region of rocky objects orbiting between Mars and Jupiter. The marker shows one place in the belt, not a single object.'},
  {name:'Vesta', icon:'🪨', type:'Asteroid', category:'Asteroids', color:'#a59f94', radius:.45, orbit:31, speed:.015, angle:4.4, diameter:'About 530 km across', gravity:'—', moons:'0 known', distance:'Varies along its orbit', fact:'Vesta is one of the largest objects in the main asteroid belt. NASA’s Dawn spacecraft orbited it before visiting Ceres.'},
  {name:'Psyche', icon:'🪨', type:'Asteroid', category:'Asteroids', color:'#a5917e', radius:.42, orbit:33, speed:.013, angle:.7, diameter:'About 280 km at its widest', gravity:'—', moons:'—', distance:'Varies along its orbit', fact:'Psyche is an irregular, metal-rich asteroid in the main belt. NASA’s Psyche spacecraft is on a mission to study it.'},
  {name:'Bennu', icon:'🪨', type:'Near-Earth asteroid', category:'Asteroids', color:'#777d7c', radius:.4, orbit:24, speed:.023, angle:5, diameter:'About 500 m across', gravity:'—', moons:'0 known', distance:'Varies along its orbit', fact:'Bennu is a near-Earth asteroid. NASA’s OSIRIS-REx collected a sample and delivered it to Earth in 2023.'},
  {name:'Halley', icon:'☄️', type:'Comet', category:'Comets', color:'#9da5a2', radius:.48, orbit:78, eccentricity:.72, inclination:.3, speed:-.004, angle:2, diameter:'About 15 × 8 km', gravity:'—', moons:'—', distance:'Varies along its orbit', fact:'Halley’s Comet returns to the inner solar system roughly every 76 years. Its next expected return is in 2061.'},
  {name:'67P', icon:'☄️', type:'Comet', category:'Comets', color:'#9d9891', radius:.46, orbit:25, eccentricity:.48, inclination:.12, speed:.009, angle:1.9, diameter:'About 4 km across', gravity:'—', moons:'—', distance:'Varies along its orbit', fact:'Comet 67P/Churyumov-Gerasimenko was studied by ESA’s Rosetta spacecraft and its Philae lander.'},
  {name:'Hale-Bopp', icon:'☄️', type:'Comet', category:'Comets', color:'#b5b4ab', radius:.48, orbit:108, eccentricity:.74, inclination:.55, speed:.001, angle:2.8, diameter:'About 60 km', gravity:'—', moons:'—', distance:'Varies along its orbit', fact:'Hale-Bopp, the Great Comet of 1997, was visible to the naked eye for around 18 months.'}
];

const moonData = [
  {name:'Moon', parent:'Earth', color:'#c4bfb3', diameter:'3,475 km', fact:'Earth’s Moon has gravity about one-sixth as strong as Earth’s, and its surface is covered in impact craters.'},
  {name:'Phobos', parent:'Mars', color:'#a99b8c', diameter:'22 km', fact:'Phobos is the larger of Mars’s two small moons. It orbits so close to Mars that it rises and sets more than once a Martian day.'},
  {name:'Deimos', parent:'Mars', color:'#b6a99b', diameter:'12 km', fact:'Deimos is the smaller and more distant of Mars’s two moons. Both Martian moons are irregularly shaped.'},
  {name:'Io', parent:'Jupiter', color:'#e4c66e', diameter:'3,643 km', fact:'Io is the most volcanically active world in the solar system. Jupiter’s gravity helps heat its interior.'},
  {name:'Europa', parent:'Jupiter', color:'#d6c6a9', diameter:'3,122 km', fact:'Europa has an icy surface and strong evidence for an ocean beneath its ice.'},
  {name:'Ganymede', parent:'Jupiter', color:'#a99883', diameter:'5,268 km', fact:'Ganymede is the largest moon in the solar system and has its own magnetic field.'},
  {name:'Callisto', parent:'Jupiter', color:'#82766f', diameter:'4,821 km', fact:'Callisto is heavily cratered, preserving a record of impacts over billions of years.'},
  {name:'Mimas', parent:'Saturn', color:'#c9c4bd', diameter:'396 km', fact:'Mimas has a giant impact crater named Herschel, which is large compared with the moon itself.'},
  {name:'Enceladus', parent:'Saturn', color:'#e0eced', diameter:'504 km', fact:'Enceladus sprays plumes of water vapor and icy particles from a subsurface ocean into space.'},
  {name:'Tethys', parent:'Saturn', color:'#d0ceca', diameter:'1,062 km', fact:'Tethys is an icy moon marked by a huge canyon and a large impact crater named Odysseus.'},
  {name:'Dione', parent:'Saturn', color:'#c0bdb4', diameter:'1,123 km', fact:'Dione has bright, wispy fractures across parts of its icy surface.'},
  {name:'Rhea', parent:'Saturn', color:'#bfbab1', diameter:'1,527 km', fact:'Rhea is Saturn’s second-largest moon and is covered in heavily cratered water ice.'},
  {name:'Titan', parent:'Saturn', color:'#e0a75c', diameter:'5,150 km', fact:'Titan has a thick atmosphere and lakes and seas of liquid methane and ethane.'},
  {name:'Iapetus', parent:'Saturn', color:'#a99f91', diameter:'1,469 km', fact:'Iapetus has one dark hemisphere and one much brighter hemisphere, plus a ridge along its equator.'},
  {name:'Miranda', parent:'Uranus', color:'#bbb5aa', diameter:'472 km', fact:'Miranda has an unusually varied surface, including cliffs, grooves and large scar-like features called coronae.'},
  {name:'Ariel', parent:'Uranus', color:'#c3c4c0', diameter:'1,158 km', fact:'Ariel is an icy moon whose surface is crossed by valleys and fault scarps.'},
  {name:'Umbriel', parent:'Uranus', color:'#858580', diameter:'1,169 km', fact:'Umbriel is a dark, heavily cratered moon of Uranus.'},
  {name:'Titania', parent:'Uranus', color:'#b3aba4', diameter:'1,578 km', fact:'Titania is Uranus’s largest moon and has an extensive system of canyons.'},
  {name:'Oberon', parent:'Uranus', color:'#a69a92', diameter:'1,523 km', fact:'Oberon is a large Uranian moon with an old, cratered surface.'},
  {name:'Triton', parent:'Neptune', color:'#c8c0b8', diameter:'2,707 km', fact:'Triton is Neptune’s largest moon. It orbits in the opposite direction to Neptune’s rotation.'},
  {name:'Nereid', parent:'Neptune', color:'#a9aaa9', diameter:'340 km', fact:'Nereid follows a highly elongated orbit around Neptune.'},
  {name:'Proteus', parent:'Neptune', color:'#858889', diameter:'420 km', fact:'Proteus is a dark, irregularly shaped moon of Neptune.'},
  {name:'Charon', parent:'Pluto', color:'#aea39b', diameter:'1,212 km', fact:'Charon is over half Pluto’s diameter. Pluto and Charon orbit a point between them.'},
  {name:'Styx', parent:'Pluto', color:'#b7afa7', diameter:'About 16 km', fact:'Styx is one of Pluto’s small moons, discovered by the Hubble Space Telescope.'},
  {name:'Nix', parent:'Pluto', color:'#bdb5ab', diameter:'About 50 km', fact:'Nix is a small, irregularly shaped moon of Pluto.'},
  {name:'Kerberos', parent:'Pluto', color:'#aba9a4', diameter:'About 19 km', fact:'Kerberos is one of Pluto’s small, irregular moons.'},
  {name:'Hydra', parent:'Pluto', color:'#c9c2ba', diameter:'About 50 km', fact:'Hydra is Pluto’s outermost known moon and has a reflective, icy surface.'}
];
const AU_KM=149597870.7, UNITS_PER_AU=84;
const SIZE_UNITS_PER_KM=24/1390000;
const PLANET_SIZE_MULTIPLIER=3;
const diametersKm={
  Sun:1390000, Mercury:4879, Venus:12104, Earth:12742, Mars:6779,
  Jupiter:139820, Saturn:116460, Uranus:50724, Neptune:49244,
  Pluto:2377, Ceres:952, Haumea:1740, Makemake:1430, Eris:2400,
  Moon:3475, Phobos:22, Deimos:12, Io:3643, Europa:3122,
  Ganymede:5268, Callisto:4821, Mimas:396, Enceladus:504,
  Tethys:1062, Dione:1123, Rhea:1527, Titan:5150, Iapetus:1469,
  Miranda:472, Ariel:1158, Umbriel:1169, Titania:1578, Oberon:1523,
  Triton:2707, Nereid:340, Proteus:420, Charon:1212, Styx:16,
  Nix:50, Kerberos:19, Hydra:50
};
// JPL J2000 planet elements and SBDB osculating small-body elements:
// semi-major axis (AU), eccentricity, inclination, node, argument of perihelion (degrees).
const orbitalElements={
  Mercury:[.38709927,.20563593,7.00497902,48.33076593,29.12703035],
  Venus:[.72333566,.00677672,3.39467605,76.67984255,54.92262463],
  Earth:[1.00000261,.01671123,0,0,102.93768193],
  Mars:[1.52371034,.09339410,1.84969142,49.55953891,-73.50316850],
  Jupiter:[5.202887,.04838624,1.30439695,100.47390909,-85.74542926],
  Saturn:[9.53667594,.05386179,2.48599187,113.66242448,-21.06354617],
  Uranus:[19.18916464,.04725744,.77263783,74.01692503,96.93735127],
  Neptune:[30.06992276,.00859048,1.77004347,131.78422574,-86.81946347],
  Pluto:[39.58862939,.25183788,17.14771141,110.29238405,113.70900152],
  Ceres:[2.76555260,.07969230,10.58802780,80.24862682,73.29421453],
  Haumea:[43.06029024,.19444301,28.20847393,121.78605613,240.69054725],
  Makemake:[45.57093317,.15888900,29.02785604,79.29483382,297.09227334],
  Eris:[67.93394688,.43823853,43.92582795,36.00477044,150.79492358],
  Vesta:[2.36136597,.09020374,7.14392555,103.70129327,151.46864782],
  Psyche:[2.92572047,.13493247,3.09874912,149.97538593,230.03267827],
  Bennu:[1.12639103,.20374508,6.03494377,2.06086620,66.22306084],
  Halley:[17.92863505,.96793600,162.19053004,59.09894721,112.24143146],
  '67P':[3.46224949,.64090813,7.04029494,50.13557377,12.79824970],
  'Hale-Bopp':[177.43338391,.99498100,89.28759425,282.73342140,130.41466707]
};
// JPL satellite mean elements: a (km), e, i, node, periapsis (degrees), period (days).
// Optional RA/Dec specify the local Laplace pole; otherwise use the parent's equator.
const satelliteElements={
  Moon:[384400,.0554,5.16,125.08,318.15,27.322],
  Phobos:[9375,.015,1.1,169.2,216.3,.3187,317.7,52.9],
  Deimos:[23457,0,1.8,54.3,0,1.2625,316.6,53.5],
  Io:[421800,.004,0,0,49.1,1.762732,268.1,64.5],
  Europa:[671100,.009,.5,184,45,3.525463,268.1,64.5],
  Ganymede:[1070400,.001,.2,58.5,198.3,7.155588,268.2,64.6],
  Callisto:[1882700,.007,.3,309.1,43.8,16.690440,268.7,64.8],
  Mimas:[186000,.020,1.6,66.2,160.4,.942422,40.6,83.5],
  Enceladus:[238400,.005,0,0,119.5,1.370218,40.6,83.5],
  Tethys:[295000,.001,1.1,273,335.3,1.887802,40.6,83.5],
  Dione:[377700,.002,0,0,116,2.736916,40.6,83.5],
  Rhea:[527200,.001,.3,133.7,44.3,4.517503,40.6,83.5],
  Titan:[1221900,.029,.3,78.6,78.3,15.945448,36.4,84],
  Iapetus:[3561700,.028,7.6,86.5,254.5,79.331002,288.7,78.9],
  Miranda:[129846,.001,4.4,100.9,154.8,1.413479],
  Ariel:[190929,.001,0,0,9.6,2.520379],
  Umbriel:[265986,.004,.1,174.8,183.4,4.144177],
  Titania:[436298,.002,.1,29.5,184,8.705869],
  Oberon:[583511,.002,.1,76.8,132.2,13.463237],
  Triton:[354800,0,157.3,177.7,0,5.8792],
  Nereid:[5513900,.751,5.1,319.5,296.8,360.133039],
  Proteus:[117700,.001,.6,355.5,357.2,1.1229],
  Charon:[19600,0,0,0,0,6.387222],
  Styx:[43200,.025,0,0,322.5,20.16],
  Nix:[49300,.015,0,0,31.4,24.85],
  Kerberos:[58300,.010,.4,314.3,32.1,32.17],
  Hydra:[65200,.009,.3,114.3,139.3,38.20]
};
// IAU J2000 pole orientations from NAIF pck00011, in equatorial RA/Dec.
const planetPoles={Jupiter:[268.056595,64.495303],Saturn:[40.589,83.537],
  Uranus:[257.311,-15.175],Neptune:[299.36,43.46],Pluto:[132.993,-6.163]};
function poleRotation(ra,dec) {
  const r=THREE.MathUtils.degToRad(ra), d=THREE.MathUtils.degToRad(dec);
  const obliquity=THREE.MathUtils.degToRad(23.43928);
  const x=Math.cos(d)*Math.cos(r), y=Math.cos(d)*Math.sin(r), z=Math.sin(d);
  const pole=new THREE.Vector3(x,-y*Math.sin(obliquity)+z*Math.cos(obliquity),
    -(y*Math.cos(obliquity)+z*Math.sin(obliquity))).normalize();
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),pole);
}
function assignOrbit(body,elements,scale) {
  const [a,e,i,node,periapsis]=elements;
  Object.assign(body,{orbit:a*scale,eccentricity:e,inclination:THREE.MathUtils.degToRad(i),
    node:THREE.MathUtils.degToRad(node),periapsis:THREE.MathUtils.degToRad(periapsis)});
}
for (const body of bodies) {
  if (diametersKm[body.name]) body.radius=diametersKm[body.name]*SIZE_UNITS_PER_KM/2*(body.name==='Sun'?1:PLANET_SIZE_MULTIPLIER);
  if (orbitalElements[body.name]) {
    assignOrbit(body,orbitalElements[body.name],UNITS_PER_AU);
    body.speed=.028/Math.pow(orbitalElements[body.name][0],1.5);
  } else if (body.region) {
    assignOrbit(body,[2.8,0,0,0,0],UNITS_PER_AU);
    body.speed=.028/Math.pow(2.8,1.5);
  }
}
for (const parent of bodies) {
  const moons=moonData.filter(moon=>moon.parent===parent.name);
  moons.forEach((moon,index)=>{
    const elements=satelliteElements[moon.name];
    Object.assign(moon, {
      icon:'🌑', type:parent.name+"'s moon", radius:diametersKm[moon.name]*SIZE_UNITS_PER_KM/2*PLANET_SIZE_MULTIPLIER,
      angle:index*2.4+1.3, speed:.01*27.322/elements[5],
      gravity:moon.name==='Moon'?'0.165× Earth':'—', moons:'—',
      distance:parent.name==='Earth'?'About 150 million km':parent.distance
    });
    assignOrbit(moon,elements,SIZE_UNITS_PER_KM*PLANET_SIZE_MULTIPLIER);
    const pole=elements.length===8?elements.slice(6):planetPoles[parent.name];
    if (pole && moon.name!=='Nereid') {
      // Uranian moons follow the retrograde spin, opposite the IAU north pole.
      moon.orbitRotation=parent.name==='Uranus'?poleRotation(pole[0]+180,-pole[1]):poleRotation(...pole);
    }
    bodies.push(moon);
  });
}

const world = $('world');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias:true, logarithmicDepthBuffer:true, powerPreference:'high-performance'});
} catch (error) {
  $('error').textContent = 'This browser could not start 3D graphics. Please try a browser with WebGL enabled.';
  $('error').classList.remove('hide');
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
world.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d20);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 100000);
scene.add(new THREE.AmbientLight(0x9caecc, 1.1));
const sunlight = new THREE.PointLight(0xffe6bc, 6000, 0, 2);
scene.add(sunlight);

function stars() {
  const positions = [];
  for (let i=0; i<1800; i++) {
    const direction = new THREE.Vector3(Math.random()-.5, Math.random()-.5, Math.random()-.5).normalize();
    direction.multiplyScalar(40000 + Math.random()*10000);
    positions.push(direction.x, direction.y, direction.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({color:0xcddfff, size:1.6, sizeAttenuation:true})));
}
stars();

function makeAsteroidBelt() {
  const geometry=new THREE.IcosahedronGeometry(1,0);
  const material=new THREE.MeshStandardMaterial({color:0xb1a89b,roughness:1,flatShading:true});
  const belt=new THREE.InstancedMesh(geometry,material,1400);
  const rock=new THREE.Object3D();
  for (let i=0;i<belt.count;i++) {
    const angle=Math.random()*Math.PI*2, radius=(2.2+Math.random()*1.1)*UNITS_PER_AU;
    rock.position.copy(orbitPoint({orbit:radius,inclination:Math.random()*THREE.MathUtils.degToRad(20),
      node:Math.random()*Math.PI*2},angle));
    rock.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    const size=.12+Math.random()*.32;
    rock.scale.set(size,size*(.6+Math.random()*.5),size*(.6+Math.random()*.5));
    rock.updateMatrix();
    belt.setMatrixAt(i,rock.matrix);
    belt.setColorAt(i,new THREE.Color().setHSL(.07,.1,.35+Math.random()*.3));
  }
  belt.instanceMatrix.needsUpdate=true;
  scene.add(belt);
}
makeAsteroidBelt();

function planetTexture(body) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = body.color;
  ctx.fillRect(0, 0, 512, 256);
  if (body.name === 'Earth') {
    for (let i=0; i<45; i++) {
      ctx.fillStyle = i%3 ? '#5b9c68' : '#c9be83';
      ctx.beginPath(); ctx.ellipse(Math.random()*512, Math.random()*220+18, 12+Math.random()*38, 4+Math.random()*15, Math.random(), 0, Math.PI*2); ctx.fill();
    }
    for (let i=0; i<80; i++) {
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.ellipse(Math.random()*512, Math.random()*256, 8+Math.random()*25, 2+Math.random()*4, 0, 0, Math.PI*2); ctx.fill();
    }
  } else if (['Jupiter','Saturn','Uranus','Neptune'].includes(body.name)) {
    for (let i=0; i<80; i++) {
      ctx.fillStyle = i%2 ? 'rgba(255,241,207,.12)' : 'rgba(96,58,68,.10)';
      ctx.fillRect(0, Math.random()*256, 512, 2+Math.random()*12);
    }
    if (body.name === 'Jupiter') {
      ctx.fillStyle = '#b76a58'; ctx.beginPath(); ctx.ellipse(340, 170, 25, 10, 0, 0, Math.PI*2); ctx.fill();
    }
  } else if (body.parent || body.category==='Asteroids' || body.category==='Comets' || ['Mercury','Pluto','Ceres'].includes(body.name)) {
    for (let i=0; i<150; i++) {
      const x=Math.random()*512, y=Math.random()*256, r=1+Math.random()*8;
      ctx.fillStyle='rgba(45,34,32,.18)'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(x-1,y-1,r,.2,3.8); ctx.stroke();
    }
  } else {
    for (let i=0; i<200; i++) {
      ctx.fillStyle=i%2?'rgba(130,52,36,.12)':'rgba(255,222,140,.12)';
      ctx.beginPath(); ctx.ellipse(Math.random()*512,Math.random()*256,2+Math.random()*20,1+Math.random()*6,0,0,Math.PI*2); ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const surfaceMaps={
  Earth:'earth.jpg', Mercury:'mercury.jpg', Mars:'mars.jpg',
  Jupiter:'jupiter.jpg', Moon:'moon.jpg'
};
const textureLoader=new THREE.TextureLoader();
const failedSurfaceMaps=new Set();
function loadSurfaceMap(body, material) {
  const file=surfaceMaps[body.name];
  if (!file) return;
  textureLoader.load(new URL('./textures/'+file,import.meta.url).href, texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const previous=material.map;
    material.map=texture;
    material.needsUpdate=true;
    previous.dispose();
  }, undefined, error=>{
    failedSurfaceMaps.add(body.name);
    $('textureStatus').textContent='Surface map unavailable for '+[...failedSurfaceMaps].join(', ')+'. Using illustrative textures instead.';
    $('textureStatus').hidden=false;
    console.error('Could not load surface map for '+body.name, error);
  });
}

function orbitPoint(body, angle) {
  const e=body.eccentricity || 0, i=body.inclination || 0;
  const node=body.node || 0, w=body.periapsis || 0;
  const x=body.orbit*(Math.cos(angle)-e);
  const y=body.orbit*Math.sqrt(1-e*e)*Math.sin(angle);
  const u=x*Math.cos(w)-y*Math.sin(w), v=x*Math.sin(w)+y*Math.cos(w);
  const point=new THREE.Vector3(u*Math.cos(node)-v*Math.sin(node)*Math.cos(i),
    v*Math.sin(i),-(u*Math.sin(node)+v*Math.cos(node)*Math.cos(i)));
  if (body.orbitRotation) point.applyQuaternion(body.orbitRotation);
  return point;
}
function eccentricAnomaly(mean,e) {
  const m=THREE.MathUtils.euclideanModulo(mean+Math.PI,Math.PI*2)-Math.PI;
  let angle=e<.8?m:(m<0?-Math.PI:Math.PI);
  for (let n=0;n<20;n++) {
    const delta=(angle-e*Math.sin(angle)-m)/(1-e*Math.cos(angle));
    angle-=delta;
    if (Math.abs(delta)<1e-10) return angle;
  }
  throw new Error('Orbital solver did not converge');
}
function defaultOrbitVisible(body) {
  return !body.parent && !body.category && !body.region;
}
function orbitLine(body) {
  const points = [];
  const segments=body.eccentricity>.9?1440:360;
  for(let i=0; i<=segments; i++) {
    const angle=i/segments*Math.PI*2;
    points.push(orbitPoint(body,angle));
  }
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color:body.parent?0x92beda:body.category==='Comets'?0x84d8e6:0x6888ba, transparent:true, opacity:body.parent?.16:.22}));
  line.visible=defaultOrbitVisible(body);
  scene.add(line);
  return line;
}

const pickable=[];
for (const body of bodies) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    map:planetTexture(body), roughness:1,
    emissive:body.name==='Sun' ? 0xff9a18 : 0x000000,
    emissiveIntensity:body.name==='Sun' ? 1.2 : 0
  });
  loadSurfaceMap(body,material);
  const geometry=body.region ? new THREE.OctahedronGeometry(body.radius) : body.category==='Asteroids'||body.category==='Comets' ? new THREE.IcosahedronGeometry(body.radius,2) : new THREE.SphereGeometry(body.radius,36,24);
  body.mesh = new THREE.Mesh(geometry, material);
  if (planetPoles[body.name]) body.mesh.quaternion.copy(poleRotation(...planetPoles[body.name]));
  if (body.name==='Haumea') body.mesh.scale.set(1,.55,.55);
  if (body.category==='Asteroids'||body.category==='Comets') body.mesh.scale.set(1,.75,.85);
  if (body.region) {
    material.emissive.set(0x489eaa);
    material.emissiveIntensity=.9;
  }
  body.mesh.userData.body=body;
  pickable.push(body.mesh);
  group.add(body.mesh);
  if (body.name === 'Saturn') {
    const ring = new THREE.Mesh(new THREE.RingGeometry(body.radius*1.35, body.radius*2.15, 80), new THREE.MeshBasicMaterial({color:0xe5cf9f, side:THREE.DoubleSide, transparent:true, opacity:.8}));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),
      new THREE.Vector3(0,1,0).applyQuaternion(poleRotation(...planetPoles.Saturn)));
    ring.userData.body=body;
    pickable.push(ring);
    group.add(ring);
  }
  if (['Earth','Venus','Mars','Uranus','Neptune'].includes(body.name)) {
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(body.radius*1.07,36,24),new THREE.MeshBasicMaterial({color:body.name==='Earth'?0x85d7ff:body.color,transparent:true,opacity:.14,side:THREE.BackSide,depthWrite:false}));
    group.add(atmosphere);
  }
  if (body.name === 'Sun') {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d'), gradient=ctx.createRadialGradient(64,64,5,64,64,64);
    gradient.addColorStop(0,'rgba(255,230,150,.7)');
    gradient.addColorStop(.4,'rgba(255,153,44,.3)');
    gradient.addColorStop(1,'rgba(255,120,20,0)');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,128,128);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    glow.scale.set(body.radius*4,body.radius*4,1);
    group.add(glow);
  }
  if (body.category==='Comets') {
    const tail=new THREE.Group();
    const plume=new THREE.Mesh(new THREE.ConeGeometry(.9,5,16,1,true),new THREE.MeshBasicMaterial({color:0x9be8f2,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    plume.rotation.z=Math.PI; plume.position.y=2.5;
    tail.add(plume);
    group.add(tail);
    body.tail=tail;
  }
  body.group = group;
  scene.add(group);
  if (body.orbit && !body.region) body.orbitLine=orbitLine(body);
  const label = document.createElement('span');
  label.className = 'world-label';
  label.textContent = body.name;
  $('labels').appendChild(label);
  body.label = label;
}

function updateBodies(time, dt=0) {
  for (const body of bodies) {
    if (body.orbit && !body.parent) {
      const angle=eccentricAnomaly(body.angle+time*body.speed,body.eccentricity);
      body.group.position.copy(orbitPoint(body,angle));
      if (body.tail) body.tail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),body.group.position.clone().normalize());
    }
    body.mesh.rotateY(dt*.12*(body.name==='Uranus'?-1:1));
  }
  for (const body of bodies) {
    if (!body.parent) continue;
    const parent=bodies.find(candidate=>candidate.name===body.parent);
    const angle=eccentricAnomaly(body.angle+time*body.speed,body.eccentricity);
    body.group.position.copy(parent.group.position).add(orbitPoint(body,angle));
    body.orbitLine.position.copy(parent.group.position);
  }
}
updateBodies(0);

function makeRocket() {
  const rocket = new THREE.Group();
  const hull=new THREE.MeshStandardMaterial({color:0xdce0e3,metalness:.7,roughness:.32});
  const dark=new THREE.MeshStandardMaterial({color:0x303842,metalness:.8,roughness:.4});
  const foil=new THREE.MeshStandardMaterial({color:0xcba456,metalness:.8,roughness:.48});
  const glass=new THREE.MeshStandardMaterial({color:0x294f68,metalness:.65,roughness:.12});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.23,.26,.78,32),hull);
  body.position.y=-.12; rocket.add(body);
  const capsule=new THREE.Mesh(new THREE.SphereGeometry(.25,32,20),hull);
  capsule.scale.set(1,1.35,1); capsule.position.y=.4; rocket.add(capsule);
  for (const y of [-.5,-.27,.12]) {
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.255,.018,8,32),dark);
    collar.rotation.x=Math.PI/2; collar.position.y=y; rocket.add(collar);
  }
  const serviceModule=new THREE.Mesh(new THREE.CylinderGeometry(.255,.255,.22,16),foil);
  serviceModule.position.y=-.38; rocket.add(serviceModule);
  for (const side of [-1,1]) {
    const window=new THREE.Mesh(new THREE.BoxGeometry(.12,.13,.025),glass);
    window.position.set(side*.12,.46,.214); window.rotation.y=side*.35; rocket.add(window);
    const boom=new THREE.Mesh(new THREE.BoxGeometry(.5,.035,.035),dark);
    boom.position.set(side*.48,-.22,0); rocket.add(boom);
    const panel=new THREE.Group();
    const frame=new THREE.Mesh(new THREE.BoxGeometry(.54,.72,.035),hull);
    panel.add(frame);
    const cells=new THREE.MeshStandardMaterial({color:0x173555,metalness:.55,roughness:.28});
    for (let row=0;row<6;row++) for (let column=0;column<4;column++) {
      const cell=new THREE.Mesh(new THREE.BoxGeometry(.116,.101,.008),cells);
      cell.position.set((column-1.5)*.128,(row-2.5)*.115,.023);
      panel.add(cell);
    }
    panel.position.set(side*.9,-.22,0); panel.rotation.y=side*.18; rocket.add(panel);
    const thruster=new THREE.Mesh(new THREE.CylinderGeometry(.035,.06,.1,12),dark);
    thruster.rotation.z=side*Math.PI/2; thruster.position.set(side*.27,-.05,0); rocket.add(thruster);
  }
  const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,.24,24,1,true),new THREE.MeshStandardMaterial({color:0x424852,metalness:.9,roughness:.3,side:THREE.DoubleSide}));
  nozzle.position.y=-.62; rocket.add(nozzle);
  const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.35,8),hull);
  antenna.position.set(.16,.72,-.08); rocket.add(antenna);
  const flame=new THREE.Group();
  for (const [radius,length,color,opacity] of [[.13,.65,0x548fff,.35],[.07,.4,0xcceeff,.8]]) {
    const plume=new THREE.Mesh(new THREE.ConeGeometry(radius,length,20),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));
    plume.rotation.z=Math.PI; plume.position.y=-length/2; flame.add(plume);
  }
  flame.position.y=-.74; rocket.add(flame);
  rocket.userData.flame=flame;
  return rocket;
}
const ship = new THREE.Group();
const rocket = makeRocket();
rocket.rotation.x = -Math.PI/2;
ship.add(rocket);
scene.add(ship);
const earth = bodies.find(body=>body.name==='Earth');
ship.position.copy(earth.group.position).add(new THREE.Vector3(0,3,7));
let yaw=0, pitch=-.12, selected=earth, autopilot=false, holding=null, elapsed=0, running=false, snapCamera=false;
const controls = new Set();
const forward = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const projected = new THREE.Vector3();
const heldBodyPosition = new THREE.Vector3();

function direction() {
  return forward.set(-Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw)*Math.cos(pitch)).normalize();
}
function flightScale() {
  const clearance=holding
    ? Math.max(0,ship.position.distanceTo(holding.group.position)-holding.radius)
    : Math.min(...bodies.filter(body=>!body.region).map(body=>Math.max(0,ship.position.distanceTo(body.group.position)-body.radius)));
  return {clearance, scale:clamp(clearance/7,.00001,1)};
}
function showObjectDetails(body) {
  const details=objectDetails[body.name];
  if (!details) throw new Error('Missing educational details for '+body.name);
  const [title,description,composition]=details;
  $('bodyDescription').textContent=body.fact+' '+description;
  $('bodyComposition').textContent=composition;
  $('bodyWikipedia').href='https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_'));
  $('bodyWikipedia').textContent='Read about '+body.name+' on Wikipedia';
  const image=objectImages[body.name];
  const container=$('bodyImageContainer');
  container.replaceChildren();
  if (!image) {
    const message=document.createElement('p');
    message.textContent='No freely licensed image is available for this object.';
    container.appendChild(message);
    return;
  }
  const picture=document.createElement('img');
  picture.alt='Reference image of '+body.name+' (may be an illustration)';
  picture.loading='eager';
  picture.decoding='async';
  picture.referrerPolicy='no-referrer';
  picture.hidden=true;
  const status=document.createElement('p');
  status.className='image-status';
  status.textContent='Reference photos connect to Wikimedia Commons only when you choose to load one.';
  picture.addEventListener('load',()=>{status.hidden=true});
  picture.addEventListener('error',()=>{
    picture.hidden=true;
    status.hidden=false;
    status.textContent='Image could not load. Check your connection or open the image source below.';
  });
  const caption=document.createElement('figcaption');
  const source=document.createElement('a');
  source.href=image.source; source.target='_blank'; source.rel='noopener';
  source.textContent='Image source';
  const license=document.createElement('a');
  license.href=image.licenseUrl; license.target='_blank'; license.rel='noopener';
  license.textContent=image.license;
  caption.append('Reference image; may be an illustration. ',source,' · '+image.artist+' · ',license);
  const load=document.createElement('button');
  load.type='button';
  load.className='primary';
  load.textContent='Load reference image';
  load.onclick=()=>{
    status.textContent='Loading reference image…';
    picture.hidden=false;
    picture.src=image.url;
    load.remove();
  };
  container.append(picture,status,load,caption);
}
function setSelection(body) {
  if (holding && holding!==body) holding=null;
  selected=body;
  document.querySelectorAll('.destination').forEach(button=>button.classList.toggle('active',button.dataset.name===body.name));
  const system=body.parent?bodies.find(candidate=>candidate.name===body.parent):body;
  if (system.category) document.querySelector(`[data-category="${system.category}"]`).open=true;
  if (body.parent) document.querySelector(`[data-system="${body.parent}"] details`).open=true;
  for (const candidate of bodies) {
    if (candidate.orbitLine) candidate.orbitLine.visible=defaultOrbitVisible(candidate)||candidate===body;
  }
  if (innerWidth<=700) {
    document.querySelector('.destinations').classList.add('collapsed');
    $('destinationsToggle').setAttribute('aria-expanded','false');
  }
  $('bodyName').textContent=body.icon+' '+body.name;
  $('bodyType').textContent=body.type.toUpperCase();
  showObjectDetails(body);
  $('bodyFacts').innerHTML=body.region
    ? '<div><dt>Location</dt><dd>Between Mars and Jupiter</dd></div><div><dt>Contains</dt><dd>Rocky bodies</dd></div><div><dt>Largest object</dt><dd>Ceres</dd></div><div><dt>In this model</dt><dd>Marker in belt</dd></div>'
    : body.parent
    ? `<div><dt>Orbits</dt><dd>${body.parent}</dd></div><div><dt>Diameter</dt><dd>${body.diameter}</dd></div><div><dt>Gravity</dt><dd>${body.gravity}</dd></div><div><dt>From Sun</dt><dd>About ${body.distance.replace(/^About /,'')}</dd></div>`
    : `<div><dt>Diameter</dt><dd>${body.diameter}</dd></div><div><dt>Gravity</dt><dd>${body.gravity}</dd></div><div><dt>Moons</dt><dd>${body.moons}</dd></div><div><dt>From Sun</dt><dd>${body.distance}</dd></div>`;
  if (body.orbit && !body.region) {
    const semimajor=body.parent?satelliteElements[body.name][0].toLocaleString('en-US')+' km':orbitalElements[body.name][0].toFixed(3)+' AU';
    const normal=orbitPoint(body,0).cross(orbitPoint(body,Math.PI/2)).normalize();
    const tilt=THREE.MathUtils.radToDeg(Math.acos(clamp(normal.y,-1,1)));
    $('bodyFacts').innerHTML+=`<div><dt>Orbit semi-major axis</dt><dd>${semimajor}</dd></div><div><dt>Eccentricity</dt><dd>${body.eccentricity.toFixed(4)}</dd></div><div><dt>Orbit tilt to ecliptic</dt><dd>${body.orbitRotation?'≈ ':''}${tilt.toFixed(2)}°</dd></div>`;
  }
  updateStatus();
}
function destinationButton(body) {
  const button=document.createElement('button');
  button.className='destination'; button.dataset.name=body.name;
  const icon=document.createElement('span'); icon.className='destination-icon'; icon.textContent=body.icon;
  const name=document.createElement('span'); name.textContent=body.name;
  button.append(icon,name);
  button.addEventListener('click',()=>{window.portalSound?.play('select');setSelection(body)});
  return button;
}
function addDestination(body, container) {
  const children=bodies.filter(moon=>moon.parent===body.name);
  if (!children.length) {
    container.appendChild(destinationButton(body));
    return;
  }
  const system=document.createElement('div');
  system.className='system'; system.dataset.system=body.name;
  const details=document.createElement('details');
  const summary=document.createElement('summary');
  summary.setAttribute('aria-label',`${body.name} moons`);
  summary.innerHTML='<span aria-hidden="true">▸</span>';
  const moons=document.createElement('div'); moons.className='moon-list';
  for (const moon of children) moons.appendChild(destinationButton(moon));
  details.append(summary,moons);
  system.append(destinationButton(body),details);
  container.appendChild(system);
}
for (const body of bodies.filter(body=>!body.parent&&!body.category)) {
  addDestination(body,$('destinationList'));
}
for (const category of ['Dwarf planets','Asteroids','Comets']) {
  const section=document.createElement('details');
  section.className='category';
  section.dataset.category=category;
  const summary=document.createElement('summary');
  summary.textContent=category;
  const entries=document.createElement('div');
  entries.className='category-list';
  for (const body of bodies.filter(body=>body.category===category)) addDestination(body,entries);
  section.append(summary,entries);
  $('destinationList').appendChild(section);
}
$('destinationsToggle').addEventListener('click',()=>{
  const collapsed=document.querySelector('.destinations').classList.toggle('collapsed');
  $('destinationsToggle').setAttribute('aria-expanded',String(!collapsed));
});
function updateStatus() {
  $('flightStatus').textContent=autopilot?'AUTOPILOT · '+selected.name.toUpperCase():holding?'HOLDING NEAR '+holding.name.toUpperCase():'FREE FLIGHT';
  $('autopilotBtn').textContent=autopilot?'Cancel autopilot':'Fly to destination →';
}
function cancelAutopilot() {
  if (autopilot || holding) { autopilot=false; holding=null; updateStatus(); }
}
function holdAtDestination() {
  autopilot=false; holding=selected;
  heldBodyPosition.copy(selected.group.position);
  snapCamera=true;
  updateStatus();
}
$('autopilotBtn').addEventListener('click',()=>{
  window.portalSound?.play('select');
  autopilot=!autopilot; holding=null;
  controls.clear();
  document.querySelectorAll('[data-control]').forEach(button=>button.classList.remove('active'));
  updateStatus();
});
setSelection(earth);
updateStatus();

const keyMap={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right',q:'up',e:'down'};
window.addEventListener('keydown',event=>{
  if (!running) return;
  const control=keyMap[event.key] || keyMap[event.key.toLowerCase()];
  if (!control) return;
  if (event.repeat && !controls.has(control)) { event.preventDefault(); return; }
  event.preventDefault(); cancelAutopilot(); controls.add(control);
});
window.addEventListener('keyup',event=>{
  const control=keyMap[event.key] || keyMap[event.key.toLowerCase()];
  if (control) controls.delete(control);
});
window.addEventListener('blur',()=>controls.clear());
document.querySelectorAll('[data-control]').forEach(button=>{
  const control=button.dataset.control;
  button.addEventListener('pointerdown',event=>{
    event.preventDefault(); button.setPointerCapture(event.pointerId);
    cancelAutopilot(); controls.add(control); button.classList.add('active');
  });
  const release=()=>{controls.delete(control); button.classList.remove('active')};
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('lostpointercapture',release);
});
let drag=null;
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
world.addEventListener('pointerdown',event=>{
  if (!running || (event.pointerType==='mouse' && event.button!==0)) return;
  drag={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
  world.setPointerCapture(event.pointerId);
});
world.addEventListener('pointermove',event=>{
  if (!drag) return;
  if (Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>6) drag.moved=true;
  const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
  if (drag.moved && (dx || dy)) {
    if (autopilot) cancelAutopilot();
    yaw-=dx*.006; pitch=clamp(pitch-dy*.006,-1.15,1.15);
  }
  drag.x=event.clientX; drag.y=event.clientY;
});
world.addEventListener('pointerup',event=>{
  if (drag && !drag.moved) {
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(pickable)[0];
    if (hit) { window.portalSound?.play('select'); setSelection(hit.object.userData.body); }
  }
  drag=null;
});
world.addEventListener('pointercancel',()=>{drag=null});
world.addEventListener('lostpointercapture',()=>{drag=null});

function showHelp() { running=false; controls.clear(); drag=null; $('help').classList.remove('hide'); }
function hideHelp() { $('help').classList.add('hide'); running=true; world.focus(); }
$('helpBtn').addEventListener('click',showHelp);
$('startBtn').addEventListener('click',hideHelp);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight)});

function tick(dt) {
  if (!running) return;
  elapsed+=dt;
  updateBodies(elapsed,dt);
  let moving=false;
  if (holding) {
    const movement=new THREE.Vector3().subVectors(holding.group.position,heldBodyPosition);
    ship.position.add(movement);
    camera.position.add(movement);
    heldBodyPosition.copy(holding.group.position);
  }
  if (autopilot) {
    const offset=new THREE.Vector3().subVectors(selected.group.position,ship.position);
    const distance=offset.length();
    const stopDistance=diametersKm[selected.name]?selected.radius*2.5:selected.radius+2.5;
    if (distance<=stopDistance+Math.min(.05,stopDistance*.01)) {
      if (distance<stopDistance) {
        if (distance===0) offset.copy(direction());
        else offset.normalize();
        ship.position.copy(selected.group.position).addScaledVector(offset,-stopDistance);
      }
      holdAtDestination();
    } else {
      offset.normalize();
      yaw=Math.atan2(-offset.x,-offset.z);
      pitch=Math.asin(clamp(offset.y,-1,1));
      const step=Math.min(distance-stopDistance,Math.max(5,Math.min(2000,distance*.8))*dt);
      ship.position.addScaledVector(offset,step);
      if (step===distance-stopDistance) holdAtDestination();
      moving=true;
    }
  } else if (!holding) {
    yaw+=((controls.has('left')?1:0)-(controls.has('right')?1:0))*1.6*dt;
    const motion=(controls.has('forward')?1:0)-(controls.has('back')?1:0);
    const vertical=(controls.has('up')?1:0)-(controls.has('down')?1:0);
    const {clearance,scale}=flightScale();
    const travelSpeed=clamp(clearance*.5,16*scale,800);
    ship.position.addScaledVector(direction(),motion*travelSpeed*dt);
    ship.position.y+=vertical*travelSpeed*.625*dt;
    moving=!!(motion||vertical);
  }
  rocket.userData.flame.visible=moving;
  rocket.userData.flame.scale.y=1+Math.sin(elapsed*18)*.15;
  const {scale}=flightScale();
  rocket.scale.setScalar(scale);
  ship.rotation.set(pitch,yaw,0,'YXZ');
  const view=direction().clone();
  cameraTarget.copy(ship.position).addScaledVector(view,4*scale);
  const cameraDistance=Math.max(7*scale,holding?holding.radius*1.5:0)*Math.max(1,1/camera.aspect);
  const desired=ship.position.clone().addScaledVector(view,-cameraDistance).add(new THREE.Vector3(0,2.4*scale,0));
  const near=.1*scale;
  if (camera.near!==near) { camera.near=near; camera.updateProjectionMatrix(); }
  if (snapCamera) { camera.position.copy(desired); snapCamera=false; }
  else camera.position.lerp(desired,1-Math.exp(-7*dt));
  camera.lookAt(cameraTarget);
  const distance=Math.max(0,ship.position.distanceTo(selected.group.position)-selected.radius);
  $('distance').textContent=selected.parent
    ? 'Distance: '+(distance<.1?distance.toPrecision(3):distance.toFixed(1))+' model units'
    : 'Center distance: '+(ship.position.distanceTo(selected.group.position)/UNITS_PER_AU).toFixed(3)+' AU ('+(ship.position.distanceTo(selected.group.position)/UNITS_PER_AU*AU_KM/1e6).toFixed(1)+' million km)';
  $('speedStatus').textContent=moving?'● IN MOTION':'● HOLDING POSITION';
  for (const body of bodies) {
    projected.copy(body.group.position).add(new THREE.Vector3(0,body.radius+scale,0)).project(camera);
    const visible=projected.z<1 && projected.z>-1 && Math.abs(projected.x)<.95 && Math.abs(projected.y)<.95 && (!body.parent || ship.position.distanceTo(body.group.position)<40 || selected===body);
    body.label.style.display=visible?'':'none';
    if (visible) { body.label.style.left=(projected.x*.5+.5)*100+'%'; body.label.style.top=(-projected.y*.5+.5)*100+'%'; }
  }
}
camera.position.copy(ship.position).add(new THREE.Vector3(0,3,7));
camera.lookAt(ship.position);
let last=performance.now();
function loop(now) {
  const dt=Math.min(.05,(now-last)/1000);
  last=now; tick(dt); renderer.render(scene,camera); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.__explorer={get state(){return {running,selected:selected.name,autopilot,position:ship.position.toArray(),distance:ship.position.distanceTo(selected.group.position),bodies:bodies.map(body=>body.name),orbits:bodies.filter(body=>!body.parent).map(body=>({name:body.name,radius:body.orbit,position:body.group.position.toArray()}))} }};
