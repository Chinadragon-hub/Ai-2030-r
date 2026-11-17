import * as THREE from 'three';
import {
  createHoloGridTexture,
  createCleanTileTexture,
  createLessonScreenTexture,
  createLogisticsScreenTexture,
  createMedicalScreenTexture,
} from './proceduralTextures.js';
import { buildHumanFigure } from './humanBuilder.js';

function addContactShadow(parent, shadowTex, x, z, radius = 2.5) {
  const geo = new THREE.CircleGeometry(radius, 20);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(geo, mat);
  disc.position.set(x, 0.025, z);
  parent.add(disc);
}

/**
 * Helper: adds a recessed architectural ceiling luminaire on the underside of a roof.
 */
function addCeilingLight(parent, x, y, z, w, d, color = 0xe8f1fc) {
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.6,
  });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.16, d + 0.18), frameMat);
  bezel.position.set(x, y + 0.04, z);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.62,
    roughness: 0.25,
  });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), mat);
  strip.position.set(x, y - 0.02, z);
  parent.add(bezel, strip);
}

/**
 * Helper: builds an architectural ceramic planter with layered leafy foliage.
 */
function buildIndoorPlanter(x, y, z, scale = 1.0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);

  const potMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.65, metalness: 0.1 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.9 });
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.58, metalness: 0.05 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x3f8f54, roughness: 0.55, metalness: 0.05 });

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.95, 16), potMat);
  pot.position.y = 0.475;
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.08, 14), soilMat);
  soil.position.y = 0.94;
  g.add(pot, soil);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.1, 8), soilMat);
  trunk.position.y = 1.45;
  g.add(trunk);

  const clusters = [
    [0, 2.25, 0, 0.55, leafMat1],
    [-0.36, 1.9, 0.25, 0.42, leafMat2],
    [0.38, 1.95, -0.22, 0.44, leafMat1],
    [0.12, 1.75, 0.36, 0.38, leafMat2],
    [-0.24, 2.05, -0.3, 0.36, leafMat2],
  ];
  for (const [lx, ly, lz, r, mat] of clusters) {
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
    foliage.position.set(lx, ly, lz);
    g.add(foliage);
  }
  return g;
}

/**
 * Helper: creates a realistic manufactured tech product unit (chamfered alloy housing,
 * copper-amber battery cell, status LED, and shipping barcode plate).
 */
function createTechProductMesh(alloyMat, darkMat, amberMat, ledMat, labelMat) {
  const unit = new THREE.Group();
  const baseBody = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.52, 0.96), alloyMat);
  baseBody.position.y = 0.26;
  const topBezel = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.16, 0.78), darkMat);
  topBezel.position.y = 0.58;
  const cellPack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.18, 0.48), amberMat);
  cellPack.position.set(-0.1, 0.69, 0);
  const labelPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.42), labelMat);
  labelPlate.position.set(0.32, 0.67, 0);
  const statusLed = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.16), ledMat);
  statusLed.position.set(0.58, 0.34, 0.28);
  unit.add(baseBody, topBezel, cellPack, labelPlate, statusLed);
  return unit;
}

/**
 * Zone 2: Realistic Architectural AI Work & Robotics Hub at [68, 0, -18].
 * Features brushed steel trusses, industrial pallet racking, supervisor workstation,
 * wall telemetry monitors, motorized roller conveyor with tech units, robotic arms,
 * AGV cart, and cargo drones that grip finished products and fly out of the bay.
 */
function buildWorkHub(shadowTex) {
  const hub = new THREE.Group();
  hub.position.set(68, 0, -18);

  const floorTex = createCleanTileTexture('#242d3d', '#334155', 4);
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorTex,
    roughness: 0.58,
    metalness: 0.2,
  });
  const extWallMat = new THREE.MeshStandardMaterial({
    color: 0x263142,
    roughness: 0.52,
    metalness: 0.42,
  });
  const claddingAccentMat = new THREE.MeshStandardMaterial({
    color: 0x3b485e,
    roughness: 0.44,
    metalness: 0.52,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x8596ad,
    roughness: 0.34,
    metalness: 0.72,
  });
  const darkHousingMat = new THREE.MeshStandardMaterial({
    color: 0x161d2b,
    roughness: 0.48,
    metalness: 0.62,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xb8c5d6,
    roughness: 0.28,
    metalness: 0.68,
  });
  const safetyAmberMat = new THREE.MeshStandardMaterial({
    color: 0xd98a16,
    roughness: 0.38,
    metalness: 0.35,
  });
  const oakBenchMat = new THREE.MeshStandardMaterial({
    color: 0x785538,
    roughness: 0.62,
    metalness: 0.08,
  });
  const ledGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 0.75,
  });
  const labelWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.5,
  });
  const subtleCyanMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.58,
  });

  // 1. Concrete architectural plinth, tiled factory floor, and safety yellow zone striping
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 26), extWallMat);
  plinth.position.y = 0.25;
  plinth.receiveShadow = true;
  hub.add(plinth);

  const interiorFloor = new THREE.Mesh(new THREE.BoxGeometry(28, 0.12, 24), deckMat);
  interiorFloor.position.y = 0.52;
  interiorFloor.receiveShadow = true;
  hub.add(interiorFloor);

  // Subtle floor safety border lines around automation bay
  for (const [lx, lz, lw, ld] of [
    [0, -5.6, 20.4, 0.14],
    [0, 3.6, 20.4, 0.14],
    [-10.2, -1.0, 0.14, 9.3],
    [10.2, -1.0, 0.14, 9.3],
  ]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(lw, 0.02, ld), safetyAmberMat);
    stripe.position.set(lx, 0.59, lz);
    hub.add(stripe);
  }

  // 2. Real Building Walls & Steel Framing (East back wall, North clerestory wall, South-East wing)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 11.4, 24.4), extWallMat);
  eastWall.position.set(14.0, 6.2, 0);
  eastWall.castShadow = true;
  eastWall.receiveShadow = true;
  hub.add(eastWall);

  // Vertical exterior/interior architectural wall ribs on East wall
  for (const rz of [-9.5, -3.2, 3.2, 9.5]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.35, 11.2, 0.45), claddingAccentMat);
    rib.position.set(13.55, 6.2, rz);
    hub.add(rib);
  }

  // 3 High-detail Logistics Telemetry Monitors on East back wall (facing West -X)
  for (let i = 0; i < 3; i++) {
    const sz = -6.4 + i * 6.4;
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.7, 4.5), darkHousingMat);
    bezel.position.set(13.45, 5.4, sz);
    const screenTex = createLogisticsScreenTexture(i);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.15, 2.3),
      new THREE.MeshBasicMaterial({ map: screenTex })
    );
    screen.rotation.y = -Math.PI / 2;
    screen.position.set(13.32, 5.4, sz);
    hub.add(bezel, screen);
  }

  // North wall with mullioned clerestory window band
  const northLower = new THREE.Mesh(new THREE.BoxGeometry(28.4, 5.4, 0.8), extWallMat);
  northLower.position.set(0, 3.2, -12.0);
  const northUpper = new THREE.Mesh(new THREE.BoxGeometry(28.4, 2.4, 0.8), extWallMat);
  northUpper.position.set(0, 10.6, -12.0);
  const northGlass = new THREE.Mesh(
    new THREE.BoxGeometry(27.6, 4.0, 0.24),
    new THREE.MeshStandardMaterial({
      color: 0x1a3854,
      roughness: 0.14,
      metalness: 0.72,
      transparent: true,
      opacity: 0.52,
    })
  );
  northGlass.position.set(0, 7.5, -12.0);
  hub.add(northLower, northUpper, northGlass);

  for (let mx = -10; mx <= 10; mx += 5) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.38, 11.4, 0.95), claddingAccentMat);
    mullion.position.set(mx, 6.2, -12.0);
    hub.add(mullion);
  }

  // South-East wall wing (keeps West & South-West completely open for camera & drone fly-out!)
  const southWing = new THREE.Mesh(new THREE.BoxGeometry(15.0, 11.4, 0.8), extWallMat);
  southWing.position.set(6.8, 6.2, 12.0);
  hub.add(southWing);

  // Structural steel columns placed ONLY outside camera sightline & flight exit
  for (const [cx, cz] of [
    [-14, -12],
    [14, -12],
    [14, 12],
  ]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.95, 11.6, 0.95), steelMat);
    col.position.set(cx, 6.3, cz);
    col.castShadow = true;
    hub.add(col);
  }

  // 3. Cantilevered Architectural Roof, Exposed Interior Steel Trusses, Solar Arrays & HVAC
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(31.2, 0.95, 27.2), extWallMat);
  roofSlab.position.set(0, 12.2, 0);
  roofSlab.castShadow = true;
  hub.add(roofSlab);

  // Dark anodized metallic perimeter fascia (clean architectural edge, no glowing cyan strip)
  const westFasciaTrim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 27.4), claddingAccentMat);
  westFasciaTrim.position.set(-15.55, 12.05, 0);
  const southFasciaTrim = new THREE.Mesh(new THREE.BoxGeometry(31.4, 0.55, 0.32), claddingAccentMat);
  southFasciaTrim.position.set(0, 12.05, 13.6);
  hub.add(westFasciaTrim, southFasciaTrim);

  // Structural steel roof trusses + recessed industrial LED luminaires
  for (const tz of [-6, 0, 6]) {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(27.2, 0.38, 0.34), steelMat);
    truss.position.set(0, 11.55, tz);
    hub.add(truss);
    addCeilingLight(hub, 0, 11.62, tz + 2.8, 20, 0.45);
  }

  // Rooftop solar panel arrays + industrial HVAC chiller
  for (let i = -2; i <= 2; i++) {
    const solar = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.16, 17.5),
      new THREE.MeshStandardMaterial({ color: 0x162a4d, roughness: 0.22, metalness: 0.8 })
    );
    solar.position.set(i * 5.2, 13.0, -1.5);
    solar.rotation.z = 0.16;
    hub.add(solar);
  }
  const hvac = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.35, 3.4), steelMat);
  hvac.position.set(9.2, 13.3, 8.2);
  hub.add(hvac);

  // 4. Industrial Pallet Racking along North wall (x = -9 & x = -1.5, z = -10.5)
  for (const rx of [-9.2, -2.0]) {
    const rack = new THREE.Group();
    rack.position.set(rx, 0.58, -10.4);
    for (const px of [-2.4, 2.4]) {
      for (const pz of [-0.65, 0.65]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 5.2, 0.14), steelMat);
        post.position.set(px, 2.6, pz);
        rack.add(post);
      }
    }
    for (const sy of [1.6, 3.4, 5.0]) {
      const beamF = new THREE.Mesh(new THREE.BoxGeometry(4.95, 0.14, 0.12), safetyAmberMat);
      beamF.position.set(0, sy, 0.65);
      const beamB = new THREE.Mesh(new THREE.BoxGeometry(4.95, 0.14, 0.12), safetyAmberMat);
      beamB.position.set(0, sy, -0.65);
      const shelfDeck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 1.35), darkHousingMat);
      shelfDeck.position.set(0, sy - 0.02, 0);
      rack.add(beamF, beamB, shelfDeck);

      if (sy < 4.5) {
        for (const bx of [-1.4, 0, 1.4]) {
          const boxUnit = createTechProductMesh(alloyMat, darkHousingMat, safetyAmberMat, ledGreenMat, labelWhiteMat);
          boxUnit.position.set(bx, sy + 0.02, 0);
          rack.add(boxUnit);
        }
      }
    }
    hub.add(rack);
  }

  // 5. Robotics Supervisor Workbench (near engineer at [9.8, 0.58, -8.0])
  const bench = new THREE.Group();
  bench.position.set(9.8, 0.58, -8.0);
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 1.8), oakBenchMat);
  benchTop.position.y = 1.2;
  bench.add(benchTop);
  for (const [lx, lz] of [
    [-1.9, -0.75],
    [1.9, -0.75],
    [-1.9, 0.75],
    [1.9, 0.75],
  ]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.18, 0.14), darkHousingMat);
    leg.position.set(lx, 0.59, lz);
    bench.add(leg);
  }
  const benchMonTex = createLogisticsScreenTexture(1);
  const benchMonitor = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.98, 0.08), darkHousingMat);
  benchMonitor.position.set(-0.6, 1.85, -0.45);
  const benchScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.62, 0.85),
    new THREE.MeshBasicMaterial({ map: benchMonTex })
  );
  benchScreen.position.set(-0.6, 1.85, -0.4);
  const scopeBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.55), alloyMat);
  scopeBox.position.set(1.1, 1.54, -0.35);
  bench.add(benchMonitor, benchScreen, scopeBox);
  hub.add(bench);

  // 6. Brushed-Steel Motorized Roller Conveyor + Laser QC Scanner Arch + Pickup Pad
  const convGroup = new THREE.Group();
  convGroup.position.set(-1.0, 0.58, 0.5);

  const convSideF = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.42, 0.16), darkHousingMat);
  convSideF.position.set(0, 0.72, 1.15);
  const convSideB = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.42, 0.16), darkHousingMat);
  convSideB.position.set(0, 0.72, -1.15);
  const convBed = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.18, 2.15), darkHousingMat);
  convBed.position.set(0, 0.62, 0);
  convGroup.add(convSideF, convSideB, convBed);

  for (const lx of [-7.8, -2.6, 2.6, 7.8]) {
    for (const lz of [-0.95, 0.95]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.22), steelMat);
      leg.position.set(lx, 0.32, lz);
      convGroup.add(leg);
    }
  }

  // Brushed aluminum rollers
  const rollerGeo = new THREE.CylinderGeometry(0.11, 0.11, 2.05, 10);
  rollerGeo.rotateX(Math.PI / 2);
  for (let rx = -8.2; rx <= 8.2; rx += 0.86) {
    const roller = new THREE.Mesh(rollerGeo, alloyMat);
    roller.position.set(rx, 0.82, 0);
    convGroup.add(roller);
  }

  // Laser QC Inspection Scanner Arch over the middle of the conveyor
  const archL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.35, 0.32), steelMat);
  archL.position.set(-1.5, 1.8, -1.25);
  const archR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.35, 0.32), steelMat);
  archR.position.set(-1.5, 1.8, 1.25);
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 2.85), darkHousingMat);
  archBeam.position.set(-1.5, 2.95, 0);
  const laserCurtain = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 1.85),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  laserCurtain.rotation.y = Math.PI / 2;
  laserCurtain.position.set(-1.5, 1.88, 0);
  convGroup.add(archL, archR, archBeam, laserCurtain);

  // Drone Pickup Pad highlight at the right end of conveyor (x = +6.8 in convGroup -> x = +5.8 in hub)
  const padFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 2.1), safetyAmberMat);
  padFrame.position.set(6.8, 0.92, 0);
  convGroup.add(padFrame);
  hub.add(convGroup);

  // Conveyor manufactured product units flowing steadily toward the Drone Pickup Pad
  const products = [];
  for (let i = 0; i < 4; i++) {
    const unit = createTechProductMesh(alloyMat, darkHousingMat, safetyAmberMat, ledGreenMat, labelWhiteMat);
    unit.position.set(-8.5, 1.52, 0.5);
    hub.add(unit);
    products.push({ mesh: unit, offset: i * 0.25 });
  }

  // 7. Two 6-axis articulated industrial robotic arms
  const arms = [];
  for (const side of [-4.8, 3.6]) {
    const armRoot = new THREE.Group();
    armRoot.position.set(side, 0.58, -4.0);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 1.05, 16), darkHousingMat);
    pedestal.position.y = 0.52;
    armRoot.add(pedestal);

    const turret = new THREE.Group();
    turret.position.y = 1.05;
    armRoot.add(turret);

    const joint1 = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.86, 12), steelMat);
    joint1.rotation.z = Math.PI / 2;
    turret.add(joint1);

    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 3.2, 0.54), safetyAmberMat);
    lowerArm.position.y = 1.6;
    turret.add(lowerArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, 3.15, 0);
    turret.add(elbow);

    const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), darkHousingMat);
    elbow.add(joint2);

    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 2.6), steelMat);
    upperArm.position.set(0, 0, 1.3);
    elbow.add(upperArm);

    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.3, 0.42), darkHousingMat);
    gripper.position.set(0, 0, 2.68);
    const tipLed = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.12), subtleCyanMat);
    tipLed.position.set(0, 0, 2.9);
    elbow.add(gripper, tipLed);

    hub.add(armRoot);
    addContactShadow(hub, shadowTex, side, -4.0, 1.85);
    arms.push({ turret, elbow, phase: side });
  }

  // 8. Autonomous Ground Vehicle (AGV) cart patrolling the South-Front aisle
  const agv = new THREE.Group();
  agv.position.set(-4, 0.58, 6.2);
  const agvChassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 1.5), safetyAmberMat);
  agvChassis.position.y = 0.38;
  const agvTrim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 1.6), darkHousingMat);
  agvTrim.position.y = 0.24;
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.18, 12);
  wheelGeo.rotateX(Math.PI / 2);
  for (const [wx, wz] of [
    [-0.85, -0.78],
    [0.85, -0.78],
    [-0.85, 0.78],
    [0.85, 0.78],
  ]) {
    const w = new THREE.Mesh(wheelGeo, darkHousingMat);
    w.position.set(wx, 0.18, wz);
    agv.add(w);
  }
  const agvLidar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 12), darkHousingMat);
  agvLidar.position.set(0.95, 0.68, 0);
  const agvCargo = createTechProductMesh(alloyMat, darkHousingMat, safetyAmberMat, ledGreenMat, labelWhiteMat);
  agvCargo.position.set(-0.2, 0.58, 0);
  agv.add(agvChassis, agvTrim, agvLidar, agvCargo);
  hub.add(agv);

  // 9. Three Articulated Cargo Drones that pick up finished products & fly away out of the bay!
  const drones = [];
  for (let i = 0; i < 3; i++) {
    const drone = new THREE.Group();

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.32, 0.95), darkHousingMat);
    const battery = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.55), alloyMat);
    battery.position.y = 0.22;
    const navLight = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.24), subtleCyanMat);
    navLight.position.set(-0.6, 0, 0);
    drone.add(fuselage, battery, navLight);

    // 4 cantilevered arms + rotor shrouds + spinning blades
    const blades = [];
    for (const [rx, rz] of [
      [-0.78, -0.72],
      [0.78, -0.72],
      [-0.78, 0.72],
      [0.78, 0.72],
    ]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.1), steelMat);
      arm.position.set(rx * 0.55, 0.04, rz * 0.55);
      arm.rotation.y = Math.atan2(-rz, rx);
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10), darkHousingMat);
      motor.position.set(rx, 0.12, rz);
      const shroud = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 18), steelMat);
      shroud.rotation.x = Math.PI / 2;
      shroud.position.set(rx, 0.18, rz);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.07), subtleCyanMat);
      blade.position.set(rx, 0.2, rz);
      drone.add(arm, motor, shroud, blade);
      blades.push(blade);
    }

    // Articulated under-slung gripping claws
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.58, 0.22), steelMat);
    clawL.position.set(-0.56, -0.34, 0);
    const clawR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.58, 0.22), steelMat);
    clawR.position.set(0.56, -0.34, 0);
    drone.add(clawL, clawR);

    // Carried product unit gripped beneath the drone
    const carriedCargo = createTechProductMesh(alloyMat, darkHousingMat, safetyAmberMat, ledGreenMat, labelWhiteMat);
    carriedCargo.position.set(0, -0.78, 0);
    carriedCargo.scale.setScalar(0.88);
    drone.add(carriedCargo);

    hub.add(drone);
    drones.push({ mesh: drone, clawL, clawR, carriedCargo, blades, idx: i });
  }

  // 10. Human robotics engineer supervising the assembly bay
  const engineer = buildHumanFigure({
    pose: 'standing',
    role: 'engineer',
    hairStyle: 'short',
    shirtHex: 0x334155,
    pantsHex: 0x1e293b,
    skinHex: 0xd7a07d,
    hairHex: 0x1c1917,
    hasTablet: true,
  });
  engineer.root.position.set(8.5, 0.58, -5.2);
  engineer.root.rotation.y = -0.9;
  hub.add(engineer.root);
  addContactShadow(hub, shadowTex, 8.5, -5.2, 0.9);

  return {
    group: hub,
    update(elapsed) {
      // Products roll from conveyor entry (-9.2) to the Drone Pickup Pad (+5.8) and cycle smoothly
      for (const p of products) {
        const t = (elapsed * 0.14 + p.offset) % 1;
        p.mesh.position.x = -9.2 + t * 14.8;
        p.mesh.visible = t < 0.94;
      }

      // Robotic arms articulate smoothly over the belt
      for (const a of arms) {
        a.turret.rotation.y = Math.sin(elapsed * 0.9 + a.phase) * 0.45;
        a.elbow.rotation.x = 0.24 + Math.sin(elapsed * 1.4 + a.phase) * 0.2;
      }

      // AGV cart smoothly shuttles back and forth along front aisle
      agv.position.x = -1.5 + Math.sin(elapsed * 0.28) * 7.5;

      // 3 Staggered Cargo Drones: Approach Pickup -> Clamp Product & Lift -> Fly Away Out of Building -> Return Empty
      for (const d of drones) {
        const t = (elapsed * 0.12 + d.idx * 0.333) % 1;
        let x = 5.8;
        let y = 5.5;
        let z = 0.5;
        let tiltZ = 0;
        let tiltX = 0;
        let carrying = false;
        let clawSpread = 0.26;

        if (t < 0.2) {
          // Phase 1: Hover in & descend to conveyor pickup pad
          const k = t / 0.2;
          const ease = k * k * (3 - 2 * k);
          x = 5.8;
          y = 6.2 - ease * 3.55; // 6.2 -> 2.65
          z = 0.5;
          clawSpread = 0.34;
          carrying = false;
        } else if (t < 0.35) {
          // Phase 2: Clamp product and climb up to dispatch altitude
          const k = (t - 0.2) / 0.15;
          const ease = k * k * (3 - 2 * k);
          x = 5.8;
          y = 2.65 + ease * 3.85; // 2.65 -> 6.5
          z = 0.5;
          clawSpread = 0.04;
          carrying = true;
          tiltZ = 0.08 * ease;
        } else if (t < 0.78) {
          // Phase 3: Carry finished product away out through the open South-West cargo bay toward city!
          const k = (t - 0.35) / 0.43;
          const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          x = 5.8 - ease * 31.0; // 5.8 -> -25.2 (flies clearly out of building)
          y = 6.4 + ease * 3.4; // 6.4 -> 9.8 (always safely below 11.7m roof overhang)
          z = 0.5 + ease * 21.5; // 0.5 -> +22.0
          clawSpread = 0.04;
          carrying = true;
          tiltZ = 0.16;
          tiltX = 0.1;
        } else {
          // Phase 4: Release cargo out in logistics skyway and return safely below roof height
          const k = (t - 0.78) / 0.22;
          const ease = k * k * (3 - 2 * k);
          x = -25.2 + ease * 31.0;
          y = 9.8 - ease * 3.6; // 9.8 -> 6.2
          z = 22.0 - ease * 21.5;
          clawSpread = 0.34;
          carrying = false;
          tiltZ = -0.14;
          tiltX = -0.08;
        }

        d.mesh.position.set(x, y, z);
        d.mesh.rotation.set(tiltX, 0, tiltZ);
        d.carriedCargo.visible = carrying;
        d.clawL.rotation.z = -clawSpread;
        d.clawL.position.x = -0.52 - clawSpread * 0.35;
        d.clawR.rotation.z = clawSpread;
        d.clawR.position.x = 0.52 + clawSpread * 0.35;

        for (const blade of d.blades) {
          blade.rotation.y = elapsed * 24 + d.idx;
        }
      }

      engineer.headGroup.rotation.y = Math.sin(elapsed * 0.7) * 0.25;
    },
  };
}

/**
 * Zone 3: Realistic Modernist AI Hospital Building at [52, 0, -78].
 * Features warm acoustic walnut wall paneling, coffered ceiling lighting, framed medical cross plaque,
 * glass privacy wings, triage/nurse counter, visitor consultation lounge, indoor plants,
 * flared MRI diagnostic bay, and rolling medical telemetry carts.
 */
function buildHospital(shadowTex, holoTex) {
  const hosp = new THREE.Group();
  hosp.position.set(52, 0, -78);

  const floorTex = createCleanTileTexture('#39485c', '#50647d', 4);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorTex,
    roughness: 0.44,
    metalness: 0.16,
  });
  const extCladMat = new THREE.MeshStandardMaterial({
    color: 0x3b495e,
    roughness: 0.48,
    metalness: 0.32,
  });
  const warmPlasterMat = new THREE.MeshStandardMaterial({
    color: 0x8ea0b5,
    roughness: 0.72,
    metalness: 0.06,
  });
  const slateWallMat = new THREE.MeshStandardMaterial({
    color: 0x263447,
    roughness: 0.5,
    metalness: 0.25,
  });
  const walnutMat = new THREE.MeshStandardMaterial({
    color: 0x6b4b32,
    roughness: 0.64,
    metalness: 0.08,
  });
  const quartzWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.12,
  });
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.32,
    metalness: 0.58,
  });
  const clinicalTealMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.55,
    metalness: 0.1,
  });
  const glassBay = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.12,
    metalness: 0.45,
    transparent: true,
    opacity: 0.34,
  });
  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x0891b2,
    emissiveIntensity: 0.72,
  });
  const magentaMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0xbe123c,
    emissiveIntensity: 0.75,
  });

  // 1. Hospital plinth & clean porcelain tiled interior floor (32m wide x 24m deep)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(34, 0.5, 26), slateWallMat);
  plinth.position.y = 0.25;
  plinth.receiveShadow = true;
  hosp.add(plinth);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(31.5, 0.12, 23.5), floorMat);
  floor.position.y = 0.54;
  floor.receiveShadow = true;
  hosp.add(floor);

  // Subtle recessed architectural inlay carpet/rubber zone beneath central MRI bay
  const mriMatZone = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.04, 11.5), slateWallMat);
  mriMatZone.position.set(0, 0.61, 0);
  hosp.add(mriMatZone);

  // 2. Real Architectural Building Shell + Interior Warm Walnut Acoustic Wall + Privacy Glass Wings
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(32.4, 11.6, 0.9), extCladMat);
  backWall.position.set(0, 6.3, -12.0);
  backWall.castShadow = true;
  hosp.add(backWall);

  // Interior architectural wall paneling along back wall + framed wall clinical boards
  const backPlasterL = new THREE.Mesh(new THREE.BoxGeometry(8.8, 9.8, 0.2), warmPlasterMat);
  backPlasterL.position.set(-10.8, 5.5, -11.48);
  const backPlasterR = new THREE.Mesh(new THREE.BoxGeometry(8.8, 9.8, 0.2), warmPlasterMat);
  backPlasterR.position.set(10.8, 5.5, -11.48);
  const centerFeature = new THREE.Mesh(new THREE.BoxGeometry(11.6, 9.8, 0.24), slateWallMat);
  centerFeature.position.set(0, 5.5, -11.46);
  hosp.add(backPlasterL, backPlasterR, centerFeature);

  for (let i = 0; i < 2; i++) {
    const bx = i === 0 ? -10.8 : 10.8;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.5, 0.14), slateWallMat);
    frame.position.set(bx, 6.4, -11.34);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(4.1, 2.2),
      new THREE.MeshBasicMaterial({ map: createMedicalScreenTexture(i) })
    );
    board.position.set(bx, 6.4, -11.24);
    hosp.add(frame, board);
  }

  // Walnut vertical acoustic slats flanking the center MRI feature wall
  for (const wx of [-5.2, -4.4, -3.6, 3.6, 4.4, 5.2]) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 9.2, 0.18), walnutMat);
    slat.position.set(wx, 5.4, -11.28);
    hosp.add(slat);
  }

  // Side walls with mullioned window bays
  for (const sx of [-16.0, 16.0]) {
    const lowerSide = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 24.4), extCladMat);
    lowerSide.position.set(sx, 2.6, 0);
    const upperSide = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.8, 24.4), extCladMat);
    upperSide.position.set(sx, 10.7, 0);
    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.6, 22.8), glassBay);
    windowStrip.position.set(sx, 7.0, 0);
    hosp.add(lowerSide, upperSide, windowStrip);

    for (let z = -8; z <= 8; z += 8) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(1.05, 11.6, 0.52), slateWallMat);
      mullion.position.set(sx, 6.3, z);
      hosp.add(mullion);
    }
  }

  // Interior glass clinical partition screens separating left Triage & right Lounge from MRI bay
  for (const px of [-7.8, 7.8]) {
    const postF = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.2, 0.14), titaniumMat);
    postF.position.set(px, 2.7, 2.5);
    const postB = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.2, 0.14), titaniumMat);
    postB.position.set(px, 2.7, -6.5);
    const glassPane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.6, 8.8), glassBay);
    glassPane.position.set(px, 2.6, -2.0);
    hosp.add(postF, postB, glassPane);
  }

  // Front South corner piers (wide open panoramic atrium between x = -14.5..+14.5)
  for (const sx of [-15.8, 15.8]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(1.4, 11.8, 1.4), extCladMat);
    pier.position.set(sx, 6.4, 12.0);
    hosp.add(pier);
  }

  // 3. Roof Slab, Clean Entrance Portico, Framed Medical Cross Plaque & Coffered Ceiling Lighting
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(35.0, 0.95, 27.0), extCladMat);
  roofSlab.position.set(0, 12.4, 0);
  roofSlab.castShadow = true;
  hosp.add(roofSlab);

  const portico = new THREE.Mesh(new THREE.BoxGeometry(34.6, 1.25, 3.4), slateWallMat);
  portico.position.set(0, 11.85, 13.0);
  const porticoFascia = new THREE.Mesh(new THREE.BoxGeometry(34.6, 0.24, 0.22), titaniumMat);
  porticoFascia.position.set(0, 11.3, 14.7);
  hosp.add(portico, porticoFascia);

  // Exterior Roof Medical Cross Monument inside clean steel backing plaque
  const extPlaque = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 0.4), slateWallMat);
  extPlaque.position.set(0, 13.8, 13.0);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.5, 0.22), cyanMat);
  crossV.position.set(0, 13.8, 13.26);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 0.22), cyanMat);
  crossH.position.set(0, 13.8, 13.26);
  hosp.add(extPlaque, crossV, crossH);

  // Interior Brushed-Steel Framed Medical Cross Plaque on North Feature Wall
  const plaqueBack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 0.16), titaniumMat);
  plaqueBack.position.set(0, 7.8, -11.3);
  const intCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.05, 0.14), cyanMat);
  intCrossV.position.set(0, 7.8, -11.18);
  const intCrossH = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.55, 0.14), cyanMat);
  intCrossH.position.set(0, 7.8, -11.18);
  hosp.add(plaqueBack, intCrossV, intCrossH);

  // Coffered acoustic ceiling beams & linear lighting
  for (const bx of [-7.8, 0, 7.8]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 23.0), walnutMat);
    beam.position.set(bx, 11.72, 0);
    hosp.add(beam);
  }
  addCeilingLight(hosp, -11.5, 11.82, 0, 1.1, 17, 0xf1f5f9);
  addCeilingLight(hosp, 0, 11.82, -2, 1.3, 14, 0xf8fafc);
  addCeilingLight(hosp, 11.5, 11.82, 0, 1.1, 17, 0xf1f5f9);

  // Rooftop Helipad
  const helipad = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 0.14, 28), slateWallMat);
  helipad.position.set(0, 12.95, -2);
  const heliRing = new THREE.Mesh(new THREE.TorusGeometry(4.7, 0.14, 8, 36), cyanMat);
  heliRing.rotation.x = Math.PI / 2;
  heliRing.position.set(0, 13.05, -2);
  hosp.add(helipad, heliRing);

  // 4. Hero Flared MRI Diagnostic Chamber + Patient + Doctor + Overhead Boom
  const bayGroup = new THREE.Group();
  bayGroup.position.set(0, 0.6, 0);

  const bedPedestal = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.65, 3.8), slateWallMat);
  bedPedestal.position.y = 0.32;
  const bedTop = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 5.0), quartzWhiteMat);
  bedTop.position.y = 0.76;
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.1, 4.4), clinicalTealMat);
  mattress.position.y = 0.9;
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.16, 0.68), quartzWhiteMat);
  pillow.position.set(0, 1.0, -1.65);
  bayGroup.add(bedPedestal, bedTop, mattress, pillow);

  // Sculpted MRI Gantry Housing (solid thick white-and-titanium medical cylinder bore + housing base)
  const gantryFoot = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.15, 2.3), slateWallMat);
  gantryFoot.position.set(0, 0.58, -0.4);
  const gantryOuter = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.52, 18, 40), quartzWhiteMat);
  gantryOuter.position.set(0, 2.15, -0.4);
  const gantryTrimRing = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.12, 10, 40), titaniumMat);
  gantryTrimRing.position.set(0, 2.15, 0.08);
  const gantryInnerGlow = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.045, 8, 40), cyanMat);
  gantryInnerGlow.position.set(0, 2.15, -0.2);
  bayGroup.add(gantryFoot, gantryOuter, gantryTrimRing, gantryInnerGlow);

  // Overhead articulated diagnostic boom mounted to ceiling/floor pillar
  const boomArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.4), titaniumMat);
  boomArm.position.set(2.4, 4.4, -0.8);
  const boomDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 10), titaniumMat);
  boomDrop.position.set(2.4, 3.65, 0.25);
  bayGroup.add(boomArm, boomDrop);

  // Patient lying on the MRI bed
  const patientPerson = buildHumanFigure({
    pose: 'lying',
    role: 'patient',
    hairStyle: 'parted',
    shirtHex: 0x60a5fa,
    pantsHex: 0x93c5fd,
    skinHex: 0xdba988,
    hairHex: 0x2c221e,
  });
  patientPerson.root.position.set(0, 0.96, -0.35);
  bayGroup.add(patientPerson.root);

  const holoMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    map: holoTex,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const patientHolo = new THREE.Group();
  patientHolo.position.set(0, 1.68, 0);
  const hTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.38, 1.55, 14), holoMat);
  hTorso.rotation.x = Math.PI / 2;
  const hHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), holoMat);
  hHead.position.set(0, 0.05, -1.1);
  const hLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.19, 1.55, 12), holoMat);
  hLegs.rotation.x = Math.PI / 2;
  hLegs.position.set(0, -0.05, 1.5);
  patientHolo.add(hTorso, hHead, hLegs);
  bayGroup.add(patientHolo);

  const scanRing = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.04, 10, 32), magentaMat);
  scanRing.position.set(0, 1.45, 0);
  bayGroup.add(scanRing);

  const diagRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.035, 8, 40), cyanMat);
  diagRing1.rotation.x = Math.PI / 2;
  diagRing1.position.set(0, 4.4, 0);
  const diagRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.035, 8, 36), magentaMat);
  diagRing2.rotation.x = Math.PI / 2;
  diagRing2.position.set(0, 4.8, 0);
  bayGroup.add(diagRing1, diagRing2);

  // Two Rolling Stainless-Steel Medical Telemetry Carts with real ECG & MRI scan screens
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? -4.7 : 4.7;
    const cart = new THREE.Group();
    cart.position.set(sx, 0, 1.8);
    cart.rotation.y = i === 0 ? 0.35 : -0.35;

    const cartBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.14, 14), titaniumMat);
    cartBase.position.y = 0.14;
    const cartPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.85, 12), titaniumMat);
    cartPost.position.y = 1.05;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.75), quartzWhiteMat);
    tray.position.set(0, 1.25, 0.18);

    const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.38, 0.12), slateWallMat);
    monitorFrame.position.set(0, 2.32, 0);
    const medTex = createMedicalScreenTexture(i);
    const monitorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 1.18),
      new THREE.MeshBasicMaterial({ map: medTex })
    );
    monitorScreen.position.set(0, 2.32, 0.08);
    cart.add(cartBase, cartPost, tray, monitorFrame, monitorScreen);
    bayGroup.add(cart);
  }
  hosp.add(bayGroup);

  // 5. Left Clinical Bay: Nurse & AI Triage Counter + Glass Medical Supply Cabinet + Medical Robot
  const triageDesk = new THREE.Group();
  triageDesk.position.set(-11.6, 0.6, -4.5);
  const deskBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.35, 1.45), walnutMat);
  deskBody.position.y = 0.68;
  const deskCounter = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.16, 1.7), quartzWhiteMat);
  deskCounter.position.y = 1.42;
  const monL = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.08), slateWallMat);
  monL.position.set(-0.85, 1.9, -0.2);
  const monR = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.08), slateWallMat);
  monR.position.set(0.85, 1.9, -0.2);
  triageDesk.add(deskBody, deskCounter, monL, monR);
  hosp.add(triageDesk);

  // Medical glass supply cabinet against West wall
  const supplyCab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.2, 3.6), quartzWhiteMat);
  supplyCab.position.set(-14.6, 2.7, -1.5);
  const supplyGlass = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 3.1), glassBay);
  supplyGlass.position.set(-13.95, 2.7, -1.5);
  hosp.add(supplyCab, supplyGlass);

  // 6. Right Consultation Bay: Ergonomic Armchairs + Walnut Side Table + Indoor Greenery Planters
  for (const cz of [-4.5, -0.8]) {
    const chair = new THREE.Group();
    chair.position.set(11.8, 0.6, cz);
    chair.rotation.y = -Math.PI / 2;
    const basePed = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.42, 0.45, 10), titaniumMat);
    basePed.position.y = 0.22;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 1.05), clinicalTealMat);
    seat.position.y = 0.56;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.05, 0.24), clinicalTealMat);
    back.position.set(0, 1.08, -0.42);
    chair.add(basePed, seat, back);
    hosp.add(chair);
  }
  const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.72, 16), walnutMat);
  sideTable.position.set(11.8, 0.96, -2.65);
  hosp.add(sideTable);

  hosp.add(buildIndoorPlanter(-13.8, 0.6, -8.8, 1.15));
  hosp.add(buildIndoorPlanter(13.8, 0.6, -8.8, 1.15));

  // Human doctor standing beside the diagnostic console reviewing the scan with the patient
  const doctor = buildHumanFigure({
    pose: 'standing',
    role: 'doctor',
    hairStyle: 'ponytail',
    shirtHex: 0xf1f5f9,
    pantsHex: 0x0f766e,
    skinHex: 0xc68b67,
    hairHex: 0x171717,
    hasTablet: true,
  });
  doctor.root.position.set(2.7, 0.6, 1.8);
  doctor.root.rotation.y = -1.25;
  hosp.add(doctor.root);
  addContactShadow(hosp, shadowTex, 2.7, 1.8, 0.9);

  // Medical Assistant Robot
  const medBot = new THREE.Group();
  medBot.position.set(-9.4, 0.6, 1.2);
  const botBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.84, 0.62, 16), slateWallMat);
  botBase.position.y = 0.31;
  const botTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.42, 14), quartzWhiteMat);
  botTorso.position.y = 1.38;
  const botScreen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.12), cyanMat);
  botScreen.position.set(0, 1.48, 0.52);
  const botHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), quartzWhiteMat);
  botHead.position.y = 2.44;
  const botVisor = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.18, 0.32), cyanMat);
  botVisor.position.set(0, 2.46, 0.28);
  medBot.add(botBase, botTorso, botScreen, botHead, botVisor);
  hosp.add(medBot);
  addContactShadow(hosp, shadowTex, -9.4, 1.2, 1.3);

  return {
    group: hosp,
    update(elapsed, activeScan) {
      const scanSpeed = activeScan ? 2.4 : 1.1;
      scanRing.position.z = Math.sin(elapsed * scanSpeed) * 1.85;
      diagRing1.rotation.z = elapsed * 0.5;
      diagRing2.rotation.z = -elapsed * 0.75;
      doctor.headGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.24;
      doctor.arms[0].shoulder.rotation.x = -0.25 + Math.sin(elapsed * 1.3) * 0.14;
      medBot.position.y = 0.6 + Math.sin(elapsed * 2.0) * 0.06;
      medBot.rotation.y = Math.sin(elapsed * 0.6) * 0.35 + 0.5;
    },
  };
}

/**
 * Zone 4: Realistic Modernist Futuristic School / Academy at [-22, 0, -86].
 * Cantilevered roof with wood acoustic ceiling baffles and NO obstructing SE foreground column,
 * open oak bookshelves stocked with multi-colored books, STEM maker bench, potted indoor plants,
 * sleek waist-high Holographic Planetary Table, clearly visible Teacher & Smartboard, and 6 seated students.
 */
function buildSchool(shadowTex) {
  const school = new THREE.Group();
  school.position.set(-22, 0, -86);

  const floorTex = createCleanTileTexture('#283347', '#3b4a66', 4);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorTex,
    roughness: 0.48,
    metalness: 0.18,
  });
  const extCladMat = new THREE.MeshStandardMaterial({
    color: 0x2b374d,
    roughness: 0.48,
    metalness: 0.38,
  });
  const warmSlate = new THREE.MeshStandardMaterial({
    color: 0x1e283b,
    roughness: 0.5,
    metalness: 0.32,
  });
  const oakWoodMat = new THREE.MeshStandardMaterial({
    color: 0x855e3c,
    roughness: 0.64,
    metalness: 0.06,
  });
  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.38,
    metalness: 0.55,
  });
  const glassWallMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.14,
    metalness: 0.48,
    transparent: true,
    opacity: 0.32,
  });
  const subtleCyanMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x0891b2,
    emissiveIntensity: 0.65,
  });
  const subtleAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.6,
  });

  // 1. Building plinth & interior tiled classroom floor (32m x 28m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(34, 0.5, 30), warmSlate);
  plinth.position.y = 0.25;
  plinth.receiveShadow = true;
  school.add(plinth);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(31.5, 0.12, 27.5), floorMat);
  floor.position.y = 0.54;
  floor.receiveShadow = true;
  school.add(floor);

  // 2. Real L-shaped Architectural Building Walls (West wall & North wall enclosing the room)
  const westWallLower = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.4, 28.4), extCladMat);
  westWallLower.position.set(-16.0, 2.7, 0);
  const westWallUpper = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 28.4), extCladMat);
  westWallUpper.position.set(-16.0, 10.1, 0);
  const westGlass = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.5, 26.8), glassWallMat);
  westGlass.position.set(-16.0, 6.7, 0);
  school.add(westWallLower, westWallUpper, westGlass);

  for (let mz = -10; mz <= 10; mz += 5) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(1.02, 11.0, 0.38), warmSlate);
    mullion.position.set(-16.0, 6.0, mz);
    school.add(mullion);
  }

  // North back wall + warm oak acoustic slats
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(32.4, 11.0, 0.9), extCladMat);
  northWall.position.set(0, 6.0, -14.0);
  northWall.castShadow = true;
  school.add(northWall);

  for (let x = -13; x <= 13; x += 2.2) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 9.6, 0.22), oakWoodMat);
    slat.position.set(x, 5.5, -13.45);
    school.add(slat);
  }

  // Structural corner columns — SE [16, 14] pier REMOVED so camera sightlines are 100% clear!
  for (const [cx, cz] of [
    [-16, -14],
    [-16, 14],
    [16, -14],
  ]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 11.2, 1.1), extCladMat);
    col.position.set(cx, 6.1, cz);
    col.castShadow = true;
    school.add(col);
  }

  // South-West wing wall
  const southWing = new THREE.Mesh(new THREE.BoxGeometry(13.0, 11.0, 0.9), extCladMat);
  southWing.position.set(-9.5, 6.0, 14.0);
  school.add(southWing);

  // 3. Architectural Roof Slab with Central Skylight, Dark Anodized Fascia & Wood Ceiling Baffles
  const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.9, 30.5), extCladMat);
  roofLeft.position.set(-11.5, 11.6, 0);
  const roofRight = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.9, 30.5), extCladMat);
  roofRight.position.set(11.5, 11.6, 0);
  const roofNorth = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.9, 10.0), extCladMat);
  roofNorth.position.set(0, 11.6, -10.2);
  const roofSouth = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.9, 10.0), extCladMat);
  roofSouth.position.set(0, 11.6, 10.2);
  const skylightGlass = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.2, 10.6), glassWallMat);
  skylightGlass.position.set(0, 11.75, 0);
  school.add(roofLeft, roofRight, roofNorth, roofSouth, skylightGlass);

  // Clean dark brushed-metal architectural roof fascia trim (replaces loud yellow/cyan strips)
  const roofTrimE = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 30.6), darkTrimMat);
  roofTrimE.position.set(17.0, 11.5, 0);
  const roofTrimS = new THREE.Mesh(new THREE.BoxGeometry(34.0, 0.42, 0.28), darkTrimMat);
  roofTrimS.position.set(0, 11.5, 15.25);
  school.add(roofTrimE, roofTrimS);

  // Interior architectural wood ceiling beams + recessed warm-white ceiling lights
  for (const bz of [-8, 0, 8]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(30.4, 0.36, 0.42), oakWoodMat);
    beam.position.set(0, 11.05, bz);
    school.add(beam);
  }
  addCeilingLight(school, -9.5, 11.1, 0, 0.95, 22, 0xfef3c7);
  addCeilingLight(school, 9.5, 11.1, 0, 0.95, 22, 0xfef3c7);

  // 4. Panoramic AI Adaptive Lab Smartboard mounted on North wall
  const lessonTex = createLessonScreenTexture();
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(10.8, 5.0, 0.35), warmSlate);
  boardFrame.position.set(-2.0, 4.5, -13.1);
  const lessonBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(10.2, 4.4),
    new THREE.MeshBasicMaterial({ map: lessonTex })
  );
  lessonBoard.position.set(-2.0, 4.5, -12.9);
  school.add(boardFrame, lessonBoard);

  // 5. Realistic Open Oak Bookshelves stocked with multi-colored books along West wall (replaces 3 brown blocks!)
  const bookColors = [0x1d4ed8, 0xb91c1c, 0x0f766e, 0xd97706, 0xe2e8f0, 0x4338ca];
  const bookMats = bookColors.map((hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.72 }));

  for (const sz of [-7.5, -1.8, 3.9]) {
    const shelf = new THREE.Group();
    shelf.position.set(-14.65, 0.6, sz);

    const backBoard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.9, 3.6), oakWoodMat);
    backBoard.position.set(-0.55, 1.95, 0);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.9, 0.14), oakWoodMat);
    sideL.position.set(0, 1.95, -1.75);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.9, 0.14), oakWoodMat);
    sideR.position.set(0, 1.95, 1.75);
    shelf.add(backBoard, sideL, sideR);

    for (const sy of [0.18, 1.15, 2.15, 3.15, 3.85]) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.12, 3.6), oakWoodMat);
      plank.position.set(0, sy, 0);
      shelf.add(plank);
    }

    // Books stacked in neat groups across the 3 main shelves
    for (let sIdx = 0; sIdx < 3; sIdx++) {
      const baseY = 0.24 + sIdx * 0.98;
      for (let b = 0; b < 9; b++) {
        const bh = 0.52 + ((b * 7 + sIdx * 3) % 4) * 0.08;
        const bz = -1.42 + b * 0.34;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, bh, 0.22),
          bookMats[(b + sIdx * 2) % bookMats.length]
        );
        book.position.set(-0.08, baseY + bh / 2, bz);
        shelf.add(book);
      }
    }
    school.add(shelf);
  }

  // STEM Robotics Maker Bench near SW corner + 2 indoor leafy potted plants
  const makerBench = new THREE.Group();
  makerBench.position.set(-13.8, 0.6, 9.4);
  const mbTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 3.2), oakWoodMat);
  mbTop.position.y = 1.15;
  const mbLegL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.12, 0.18), darkTrimMat);
  mbLegL.position.set(0, 0.56, -1.4);
  const mbLegR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.12, 0.18), darkTrimMat);
  mbLegR.position.set(0, 0.56, 1.4);
  const printerBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.85), darkTrimMat);
  printerBase.position.set(0, 1.29, 0);
  const printerArch = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 16, Math.PI), darkTrimMat);
  printerArch.rotation.y = Math.PI / 2;
  printerArch.position.set(0, 1.36, 0);
  const printHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), subtleCyanMat);
  printHead.position.set(0, 1.58, 0);
  makerBench.add(mbTop, mbLegL, mbLegR, printerBase, printerArch, printHead);
  school.add(makerBench);

  school.add(buildIndoorPlanter(-13.8, 0.6, -11.5, 1.1));
  school.add(buildIndoorPlanter(12.8, 0.6, -11.4, 1.1));

  // 6. Sleek Waist-High Interactive Holographic Globe Table (compact so Teacher & Smartboard stay 100% unobstructed!)
  const holoTable = new THREE.Group();
  holoTable.position.set(1.5, 0.6, 1.2);
  const tablePedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.75, 0.86, 24), warmSlate);
  tablePedestal.position.y = 0.43;
  const tableCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.55, 0.14, 24), darkTrimMat);
  tableCollar.position.y = 0.92;
  const emitterRing = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.04, 8, 32), subtleCyanMat);
  emitterRing.rotation.x = Math.PI / 2;
  emitterRing.position.y = 1.02;
  holoTable.add(tablePedestal, tableCollar, emitterRing);

  const holoCoreGroup = new THREE.Group();
  holoCoreGroup.position.set(0, 2.02, 0);
  const holoGlobe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 1),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      wireframe: true,
    })
  );
  const holoInner = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), subtleAmberMat);
  const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.03, 8, 36), subtleCyanMat);
  orbit1.rotation.x = Math.PI / 3;
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.03, 8, 36), subtleAmberMat);
  orbit2.rotation.y = Math.PI / 3;
  holoCoreGroup.add(holoGlobe, holoInner, orbit1, orbit2);
  holoTable.add(holoCoreGroup);
  school.add(holoTable);

  // 7. Six detailed oak student holo-desks + upholstered two-piece chairs + students studying!
  const studentOutfits = [
    { shirt: 0x38bdf8, pants: 0x1e293b, skin: 0xdba988, hair: 0x1f1a17, hairStyle: 'short' },
    { shirt: 0xf472b6, pants: 0x334155, skin: 0xc68b67, hair: 0x2b1d14, hairStyle: 'ponytail' },
    { shirt: 0xfacc15, pants: 0x1e293b, skin: 0xe7bfa0, hair: 0x3b2718, hairStyle: 'parted' },
    { shirt: 0x34d399, pants: 0x0f172a, skin: 0x9b6849, hair: 0x111111, hairStyle: 'short' },
    { shirt: 0xa78bfa, pants: 0x1e293b, skin: 0xd6a07e, hair: 0x452b1c, hairStyle: 'bob' },
    { shirt: 0xfb7185, pants: 0x334155, skin: 0xe3b896, hair: 0x1a1512, hairStyle: 'ponytail' },
  ];
  const students = [];

  for (let i = 0; i < 6; i++) {
    const a = -0.82 + (i / 5) * 1.95;
    const r = 8.6;
    const dx = Math.cos(a) * r;
    const dz = Math.sin(a) * r;

    const desk = new THREE.Group();
    desk.position.set(dx, 0.6, dz);
    desk.lookAt(1.5, 0.6, 1.2);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 0.84, 10), darkTrimMat);
    leg.position.y = 0.42;
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.05), oakWoodMat);
    tableTop.position.y = 0.88;
    const tabletBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.35), warmSlate);
    tabletBase.position.set(0, 0.96, 0.12);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.45, 0.78),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xf59e0b,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
      })
    );
    screen.position.set(0, 1.4, 0.12);

    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.8), warmSlate);
    chairSeat.position.set(0, 0.52, -1.05);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.78, 0.12), warmSlate);
    chairBack.position.set(0, 0.92, -1.42);
    const chairPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 0.5, 8), darkTrimMat);
    chairPost.position.set(0, 0.25, -1.05);

    const outfit = studentOutfits[i % studentOutfits.length];
    const student = buildHumanFigure({
      pose: 'seated',
      role: 'student',
      hairStyle: outfit.hairStyle,
      shirtHex: outfit.shirt,
      pantsHex: outfit.pants,
      skinHex: outfit.skin,
      hairHex: outfit.hair,
    });
    student.root.position.set(0, 0.16, -0.96);

    desk.add(leg, tableTop, tabletBase, screen, chairSeat, chairBack, chairPost, student.root);
    school.add(desk);
    addContactShadow(school, shadowTex, dx, dz, 1.45);
    students.push({ headGroup: student.headGroup, arms: student.arms, phase: i * 1.1 });
  }

  // Teacher / mentor standing clearly visible beside the AI Lesson Smartboard
  const teacher = buildHumanFigure({
    pose: 'standing',
    role: 'teacher',
    hairStyle: 'parted',
    shirtHex: 0x0284c7,
    pantsHex: 0x1e293b,
    skinHex: 0xdba988,
    hairHex: 0x2a1c14,
    hasTablet: true,
  });
  teacher.root.position.set(-6.4, 0.6, -7.2);
  teacher.root.rotation.y = 0.45;
  school.add(teacher.root);
  addContactShadow(school, shadowTex, -6.4, -7.2, 0.9);

  return {
    group: school,
    update(elapsed) {
      holoCoreGroup.rotation.y = elapsed * 0.45;
      orbit1.rotation.z = elapsed * 0.75;
      orbit2.rotation.x = elapsed * 0.55;
      teacher.headGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.3;
      teacher.arms[0].shoulder.rotation.x = -0.32 + Math.sin(elapsed * 1.6) * 0.22;
      for (const st of students) {
        st.headGroup.rotation.x = 0.16 + Math.sin(elapsed * 1.1 + st.phase) * 0.08;
        st.headGroup.rotation.y = Math.sin(elapsed * 0.7 + st.phase) * 0.18;
        if (st.arms?.length) {
          st.arms[0].elbow.rotation.x = -1.18 + Math.sin(elapsed * 2.1 + st.phase) * 0.08;
          st.arms[1].elbow.rotation.x = -1.18 + Math.cos(elapsed * 2.1 + st.phase) * 0.08;
        }
      }
    },
  };
}

/**
 * Zone 5: Autonomous Transport Expressway + Smart Transit Station Building at [-68, 0, -32].
 */
function buildTransportHighway() {
  const hw = new THREE.Group();

  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x1e2638,
    roughness: 0.52,
    metalness: 0.45,
  });
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x33415c,
    roughness: 0.45,
    metalness: 0.6,
  });
  const cyanStrip = new THREE.MeshStandardMaterial({
    color: 0x00c8d9,
    emissive: 0x0099aa,
    emissiveIntensity: 0.85,
  });
  const yellowStrip = new THREE.MeshStandardMaterial({
    color: 0xd9c226,
    emissive: 0x998718,
    emissiveIntensity: 0.8,
  });

  const viaduct = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 120), deckMat);
  viaduct.position.set(-68, 5.5, -28);
  viaduct.receiveShadow = true;
  hw.add(viaduct);

  for (const bx of [-73.8, -62.2]) {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 120), barrierMat);
    barrier.position.set(bx, 6.35, -28);
    hw.add(barrier);
  }

  for (const offset of [-3.0, 0, 3.0]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.06, 118),
      offset === 0 ? yellowStrip : cyanStrip
    );
    rail.position.set(-68 + offset, 5.98, -28);
    hw.add(rail);
  }

  for (let z = -76; z <= 20; z += 24) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.05, 5.5, 12), barrierMat);
    pillar.position.set(-68, 2.75, z);
    hw.add(pillar);

    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 4.2, 0.38), barrierMat);
    archL.position.set(-73.7, 8.0, z);
    const archR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 4.2, 0.38), barrierMat);
    archR.position.set(-62.3, 8.0, z);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.42, 0.45), barrierMat);
    archTop.position.set(-68, 10.1, z);
    const signalBar = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.18, 0.16), cyanStrip);
    signalBar.position.set(-68, 9.75, z);
    hw.add(archL, archR, archTop, signalBar);
  }

  // Real Smart Transit Station Building flanking the West side of the expressway
  const station = new THREE.Group();
  station.position.set(-80, 0, -24);
  const stBody = new THREE.Mesh(new THREE.BoxGeometry(10, 9.5, 22), deckMat);
  stBody.position.y = 4.75;
  const stGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 5.5, 18),
    new THREE.MeshStandardMaterial({
      color: 0x163854,
      roughness: 0.14,
      metalness: 0.75,
      transparent: true,
      opacity: 0.65,
    })
  );
  stGlass.position.set(5.1, 6.2, 0);
  // Facade mullions & boarding platform columns
  for (let mz = -8; mz <= 8; mz += 4) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.55, 6.0, 0.38), barrierMat);
    mullion.position.set(5.15, 6.2, mz);
    station.add(mullion);
  }
  for (const cz of [-10, 0, 10]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 9.5, 0.65), barrierMat);
    col.position.set(7.6, 4.75, cz);
    station.add(col);
  }
  const stCanopy = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.7, 24), barrierMat);
  stCanopy.position.set(1.5, 9.8, 0);
  const stTrim = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 24), cyanStrip);
  stTrim.position.set(8.2, 9.6, 0);
  const stRoofUnit = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 8.0), barrierMat);
  stRoofUnit.position.set(-1.5, 10.65, -3);
  station.add(stBody, stGlass, stCanopy, stTrim, stRoofUnit);
  hw.add(station);

  // 8 Aerodynamic Autonomous Electric Shuttle Pods (sculpted teardrop chassis + panoramic glass)
  const shuttleBodyShape = new THREE.Shape();
  shuttleBodyShape.moveTo(-1.85, 0.26);
  shuttleBodyShape.lineTo(1.75, 0.26);
  shuttleBodyShape.quadraticCurveTo(2.1, 0.46, 1.92, 0.86);
  shuttleBodyShape.lineTo(1.15, 1.04);
  shuttleBodyShape.lineTo(-1.25, 1.04);
  shuttleBodyShape.quadraticCurveTo(-2.05, 0.92, -1.85, 0.26);

  const shuttleHullGeo = new THREE.ExtrudeGeometry(shuttleBodyShape, {
    depth: 1.72,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.09,
    bevelThickness: 0.09,
  });
  shuttleHullGeo.translate(0, 0, -0.86);
  shuttleHullGeo.rotateY(-Math.PI / 2);

  const shuttleGlassShape = new THREE.Shape();
  shuttleGlassShape.moveTo(-1.2, 1.02);
  shuttleGlassShape.quadraticCurveTo(-0.55, 1.66, 0.45, 1.66);
  shuttleGlassShape.quadraticCurveTo(1.28, 1.56, 1.48, 1.02);
  shuttleGlassShape.closePath();

  const shuttleGlassGeo = new THREE.ExtrudeGeometry(shuttleGlassShape, {
    depth: 1.44,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  });
  shuttleGlassGeo.translate(0, 0, -0.72);
  shuttleGlassGeo.rotateY(-Math.PI / 2);

  const pods = [];
  const podBodyMat = new THREE.MeshStandardMaterial({
    color: 0xd5dfec,
    roughness: 0.22,
    metalness: 0.62,
  });
  const podGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0a162c,
    roughness: 0.08,
    metalness: 0.92,
  });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x11151f, roughness: 0.85 });

  for (let i = 0; i < 8; i++) {
    const pod = new THREE.Group();
    const hull = new THREE.Mesh(shuttleHullGeo, podBodyMat);
    const cabin = new THREE.Mesh(shuttleGlassGeo, podGlassMat);
    const lidarPuck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.14, 14), barrierMat);
    lidarPuck.position.set(0, 1.76, 0.2);

    const headLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.1, 0.12),
      i % 2 === 0 ? cyanStrip : yellowStrip
    );
    headLight.position.set(0, 0.62, 1.98);

    const tailLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xff2a6d, emissive: 0xd91c54, emissiveIntensity: 0.9 })
    );
    tailLight.position.set(0, 0.72, -1.94);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const [wx, wz] of [
      [-0.92, 1.22],
      [0.92, 1.22],
      [-0.92, -1.22],
      [0.92, -1.22],
    ]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, 0.32, wz);
      pod.add(wheel);
    }

    pod.add(hull, cabin, lidarPuck, headLight, tailLight);

    const laneX = i % 2 === 0 ? -70.6 : -65.4;
    const dir = i % 2 === 0 ? 1 : -1;
    pod.rotation.y = dir > 0 ? 0 : Math.PI;
    hw.add(pod);
    pods.push({ mesh: pod, laneX, dir, offset: Math.floor(i / 2) * 27 });
  }

  return {
    group: hw,
    update(elapsed) {
      const span = 108;
      for (const p of pods) {
        const raw = ((elapsed * 13 + p.offset) % span) - span / 2;
        const zPos = -28 + raw * p.dir;
        p.mesh.position.set(p.laneX, 5.95, zPos);
      }
    },
  };
}

/**
 * Zone 6: Sunset AI Risks & Dangers Plaza at [-36, 0, 42].
 * Depicts the bad outcomes that can happen with AI: mass surveillance,
 * split deepfake identity clones, biased decision scales, privacy leaks, and job displacement.
 */
function buildAiRisksZone(holoTex) {
  const plaza = new THREE.Group();
  plaza.position.set(-36, 0, 42);

  const basaltMat = new THREE.MeshStandardMaterial({
    color: 0x161b2b,
    roughness: 0.58,
    metalness: 0.45,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x263147,
    roughness: 0.4,
    metalness: 0.75,
  });
  const crimsonMat = new THREE.MeshStandardMaterial({
    color: 0xff2a6d,
    emissive: 0xd91c54,
    emissiveIntensity: 0.95,
    roughness: 0.25,
  });
  const amberMat = new THREE.MeshStandardMaterial({
    color: 0xff6b2b,
    emissive: 0xd9480f,
    emissiveIntensity: 0.9,
    roughness: 0.28,
  });
  const cyanDimMat = new THREE.MeshStandardMaterial({
    color: 0x00a8ba,
    emissive: 0x006678,
    emissiveIntensity: 0.6,
  });

  // 1. Dark stepped warning platform with hazard trim rings
  const step1 = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 14.5, 0.7, 36), basaltMat);
  step1.position.y = 0.35;
  const step2 = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.2, 0.65, 36), basaltMat);
  step2.position.y = 1.02;
  const hazardRing1 = new THREE.Mesh(new THREE.TorusGeometry(13.6, 0.1, 8, 48), crimsonMat);
  hazardRing1.rotation.x = Math.PI / 2;
  hazardRing1.position.y = 0.72;
  const hazardRing2 = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.08, 8, 48), amberMat);
  hazardRing2.rotation.x = Math.PI / 2;
  hazardRing2.position.y = 1.36;
  plaza.add(step1, step2, hazardRing1, hazardRing2);

  // 2. Centerpiece: Mass Surveillance Eye & Glitched Split Deepfake Hologram Head
  const survGroup = new THREE.Group();
  survGroup.position.set(0, 1.35, -1.5);

  const archL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 10.8, 0.9), darkSteelMat);
  archL.position.set(-3.2, 5.4, 0);
  const archR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 10.8, 0.9), darkSteelMat);
  archR.position.set(3.2, 5.4, 0);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.1, 1.4), darkSteelMat);
  archTop.position.set(0, 11.0, 0);
  survGroup.add(archL, archR, archTop);

  // Rotating crimson Surveillance Optical Dome & Scanning Cone
  const eyePivot = new THREE.Group();
  eyePivot.position.set(0, 9.2, 0.7);
  const turretMount = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.1, 14), darkSteelMat);
  turretMount.position.y = 0.9;
  const eyeDome = new THREE.Mesh(new THREE.SphereGeometry(1.25, 18, 14), basaltMat);
  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.8, 0.95, 16), darkSteelMat);
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.z = 0.9;
  const eyeIris = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 10, 28), crimsonMat);
  eyeIris.position.z = 1.38;
  const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), crimsonMat);
  eyePupil.position.z = 1.24;
  const scanCone = new THREE.Mesh(
    new THREE.ConeGeometry(3.4, 9.2, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xff2a6d,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  scanCone.position.set(0, -4.6, 2.5);
  scanCone.rotation.x = -0.42;
  eyePivot.add(turretMount, eyeDome, lensBarrel, eyeIris, eyePupil, scanCone);
  survGroup.add(eyePivot);

  // Split Glitched Deepfake Holographic Bust (sculpted neck/shoulders + offset cranium/jaw halves)
  const deepfakeGroup = new THREE.Group();
  deepfakeGroup.position.set(0, 4.3, 3.0);

  const deepLeftMat = new THREE.MeshBasicMaterial({
    color: 0xff2a6d,
    map: holoTex,
    wireframe: true,
    transparent: true,
    opacity: 0.82,
  });
  const deepRightMat = new THREE.MeshBasicMaterial({
    color: 0x00d9eb,
    map: holoTex,
    wireframe: true,
    transparent: true,
    opacity: 0.78,
  });

  const headLeft = new THREE.Group();
  const craniumL = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 12, 0, Math.PI), deepLeftMat);
  craniumL.rotation.y = Math.PI / 2;
  craniumL.scale.set(0.92, 1.15, 0.95);
  const jawL = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.85, 10, 1, false, 0, Math.PI), deepLeftMat);
  jawL.position.set(0, -0.85, 0);
  jawL.rotation.y = Math.PI / 2;
  const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.9), deepLeftMat);
  shoulderL.position.set(-0.65, -1.65, 0);
  headLeft.add(craniumL, jawL, shoulderL);
  headLeft.position.set(-0.38, 0.12, 0);

  const headRight = new THREE.Group();
  const craniumR = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 12, 0, Math.PI), deepRightMat);
  craniumR.rotation.y = -Math.PI / 2;
  craniumR.scale.set(0.92, 1.15, 0.95);
  const jawR = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 0.85, 10, 1, false, 0, Math.PI), deepRightMat);
  jawR.position.set(0, -0.85, 0);
  jawR.rotation.y = -Math.PI / 2;
  const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.9), deepRightMat);
  shoulderR.position.set(0.65, -1.65, 0);
  headRight.add(craniumR, jawR, shoulderR);
  headRight.position.set(0.38, -0.12, 0.2);

  const glitchRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.05, 8, 36), crimsonMat);
  glitchRing.rotation.x = Math.PI / 2.6;
  deepfakeGroup.add(headLeft, headRight, glitchRing);
  survGroup.add(deepfakeGroup);
  plaza.add(survGroup);

  // 3. Algorithmic Bias: Tilted Unfair Decision Scales (right flank)
  const scalesGroup = new THREE.Group();
  scalesGroup.position.set(8.2, 0.7, 0.5);
  const scaleBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 0.6, 16), darkSteelMat);
  scaleBase.position.y = 0.3;
  const scalePost = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 6.2, 12), darkSteelMat);
  scalePost.position.y = 3.4;

  const scaleBeam = new THREE.Group();
  scaleBeam.position.y = 6.3;
  scaleBeam.rotation.z = -0.34;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.24, 0.24), darkSteelMat);
  scaleBeam.add(bar);

  const panHeavy = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.2, 16), crimsonMat);
  panHeavy.position.set(-2.5, -1.5, 0);
  const rodHeavy = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), darkSteelMat);
  rodHeavy.position.set(-2.5, -0.75, 0);
  const weight1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), crimsonMat);
  weight1.position.set(-2.5, -0.95, 0);
  const weight2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.75), amberMat);
  weight2.position.set(-2.5, -0.15, 0);

  const panLight = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.8, 0.18, 16), cyanDimMat);
  panLight.position.set(2.5, -1.2, 0);
  const rodLight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), darkSteelMat);
  rodLight.position.set(2.5, -0.6, 0);

  scaleBeam.add(panHeavy, rodHeavy, weight1, weight2, panLight, rodLight);
  scalesGroup.add(scaleBase, scalePost, scaleBeam);
  plaza.add(scalesGroup);

  // 4. Privacy Breach Server Monolith (vented cabinet + server blades + escaping data packets)
  const serverGroup = new THREE.Group();
  serverGroup.position.set(4.8, 0.7, -5.8);
  const rack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 6.8, 2.0), basaltMat);
  rack.position.y = 3.4;
  serverGroup.add(rack);
  for (const sx of [-1.25, 1.25]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.85, 2.15), darkSteelMat);
    rail.position.set(sx, 3.4, 0);
    serverGroup.add(rail);
  }
  for (let sy = 1.0; sy <= 5.9; sy += 0.85) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.48, 2.08), darkSteelMat);
    blade.position.y = sy;
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.1, 2.14),
      sy % 1.7 < 0.85 ? crimsonMat : amberMat
    );
    led.position.y = sy;
    serverGroup.add(blade, led);
  }
  const leakPackets = [];
  for (let p = 0; p < 5; p++) {
    const pkt = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), crimsonMat);
    pkt.position.set((p - 2) * 0.55, 7.2 + p * 0.5, 0.4);
    serverGroup.add(pkt);
    leakPackets.push({ mesh: pkt, idx: p });
  }
  plaza.add(serverGroup);

  // 5. Job Displacement: Darkened Locked Workstations + Articulated Automation Claw (left flank)
  const jobsGroup = new THREE.Group();
  jobsGroup.position.set(-8.2, 0.7, 3.2);
  jobsGroup.rotation.y = 0.45;
  for (let i = -1; i <= 1; i++) {
    const dx = i * 2.4;
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 1.0), darkSteelMat);
    desk.position.set(dx, 1.05, 0);
    const deskLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 0.6), basaltMat);
    deskLeg.position.set(dx, 0.52, 0);
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.82, 0.08), basaltMat);
    monitor.position.set(dx, 1.65, -0.25);
    const errorBar = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.22, 0.1), crimsonMat);
    errorBar.position.set(dx, 1.68, -0.22);
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.24), darkSteelMat);
    keyboard.position.set(dx, 1.14, 0.16);
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.7), basaltMat);
    chairSeat.position.set(dx, 0.48, 0.95);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.12), basaltMat);
    chairBack.position.set(dx, 0.85, 1.28);
    jobsGroup.add(desk, deskLeg, monitor, errorBar, keyboard, chairSeat, chairBack);
  }
  const clawPole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 5.4, 10), darkSteelMat);
  clawPole.position.set(0, 2.7, -1.3);
  const clawJoint = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), amberMat);
  clawJoint.position.set(0, 5.3, -1.3);
  const clawArm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 2.3), darkSteelMat);
  clawArm.position.set(0, 5.2, -0.2);
  const clawHead = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.9, 6), amberMat);
  clawHead.rotation.x = Math.PI;
  clawHead.position.set(0, 4.45, 0.75);
  jobsGroup.add(clawPole, clawJoint, clawArm, clawHead);
  plaza.add(jobsGroup);

  // 6. Floating crimson hazard diamonds on outer pylons
  const beacons = [];
  for (const [bx, bz] of [
    [-11.2, 6.2],
    [11.2, 6.2],
    [-6.5, -8.5],
  ]) {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 3.8, 10), darkSteelMat);
    pylon.position.set(bx, 1.9, bz);
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), crimsonMat);
    diamond.position.set(bx, 4.7, bz);
    plaza.add(pylon, diamond);
    beacons.push(diamond);
  }

  return {
    group: plaza,
    update(elapsed) {
      eyePivot.rotation.y = Math.sin(elapsed * 0.95) * 0.55;
      headLeft.position.x = -0.38 - Math.abs(Math.sin(elapsed * 2.2)) * 0.16;
      headRight.position.x = 0.38 + Math.abs(Math.cos(elapsed * 2.2)) * 0.16;
      deepfakeGroup.position.y = 4.6 + Math.sin(elapsed * 1.6) * 0.25;
      glitchRing.rotation.z = elapsed * 1.1;
      scaleBeam.rotation.z = -0.34 + Math.sin(elapsed * 1.2) * 0.04;
      for (const lp of leakPackets) {
        lp.mesh.position.y = 7.0 + ((elapsed * 1.8 + lp.idx * 0.7) % 3.2);
      }
      for (const b of beacons) {
        b.rotation.y = elapsed * 1.4;
        b.position.y = 4.7 + Math.sin(elapsed * 2.4) * 0.22;
      }
    },
  };
}

export function createAllZones(scene, shadowTex) {
  const holoTex = createHoloGridTexture('#00D9EB');

  const workHub = buildWorkHub(shadowTex);
  const hospital = buildHospital(shadowTex, holoTex);
  const school = buildSchool(shadowTex);
  const highway = buildTransportHighway();
  const risksZone = buildAiRisksZone(holoTex);

  scene.add(workHub.group, hospital.group, school.group, highway.group, risksZone.group);

  return {
    update(elapsed, activeCard) {
      workHub.update(elapsed);
      hospital.update(elapsed, Boolean(activeCard?.showPatientScan));
      school.update(elapsed);
      highway.update(elapsed);
      risksZone.update(elapsed);
    },
  };
}
