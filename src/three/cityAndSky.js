import * as THREE from 'three';
import {
  createWetRoadTextures,
  createFacadeTexture,
  createContactShadowTexture,
  createCloudTexture,
  createWaterNormalTexture,
} from './proceduralTextures.js';
import { buildHumanFigure } from './humanBuilder.js';

/**
 * Builds a realistic multi-tier futuristic skyscraper with mullioned dark-glass lobby podium,
 * curtain-wall shaft, vertical structural fins, setback terrace, and rooftop spire.
 */
function buildSmartTower({ x, z, width, depth, height, facadeTex, accentHex, matDarkMetal, matLobbyGlass }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // 1. Realistic architectural podium with recessed warm interior + dark mullioned glass curtain wall
  const baseH = Math.min(4.8, height * 0.16);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e273a,
    roughness: 0.62,
    metalness: 0.38,
  });
  const warmLobbyMat = new THREE.MeshStandardMaterial({
    color: 0xffdfad,
    emissive: 0xd99b43,
    emissiveIntensity: 0.32,
    roughness: 0.7,
  });

  // Low granite ground base + top podium cornice slab
  const lowerSlab = new THREE.Mesh(
    new THREE.BoxGeometry(width + 2.3, 0.55, depth + 2.3),
    plinthMat
  );
  lowerSlab.position.y = 0.275;
  lowerSlab.receiveShadow = true;
  const upperCornice = new THREE.Mesh(
    new THREE.BoxGeometry(width + 2.4, 0.5, depth + 2.4),
    matDarkMetal
  );
  upperCornice.position.y = baseH - 0.25;
  upperCornice.castShadow = true;

  // Warm interior lobby core visible behind dark transparent glass
  const lobbyCore = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.9, baseH - 0.9, depth + 0.9),
    warmLobbyMat
  );
  lobbyCore.position.y = baseH * 0.5;

  // Tinted glass lobby curtain wall
  const lobbyGlass = new THREE.Mesh(
    new THREE.BoxGeometry(width + 2.05, baseH - 0.8, depth + 2.05),
    matLobbyGlass
  );
  lobbyGlass.position.y = baseH * 0.5;
  group.add(lowerSlab, upperCornice, lobbyCore, lobbyGlass);

  // Slim vertical dark-metal lobby mullions + entrance canopy facing the boulevard (toward x = 0)
  const mGeo = new THREE.BoxGeometry(0.11, baseH - 0.7, 0.11);
  for (let i = -2; i <= 2; i++) {
    for (const sz of [-1, 1]) {
      const m = new THREE.Mesh(mGeo, matDarkMetal);
      m.position.set(i * (width * 0.22), baseH * 0.5, sz * (depth / 2 + 1.06));
      group.add(m);
    }
    for (const sx of [-1, 1]) {
      const m = new THREE.Mesh(mGeo, matDarkMetal);
      m.position.set(sx * (width / 2 + 1.06), baseH * 0.5, i * (depth * 0.22));
      group.add(m);
    }
  }
  const sideSign = x >= 0 ? -1 : 1;
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.22, depth * 0.48),
    matDarkMetal
  );
  canopy.position.set(sideSign * (width / 2 + 1.7), baseH * 0.72, 0);
  const soffit = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.06, depth * 0.38),
    warmLobbyMat
  );
  soffit.position.set(sideSign * (width / 2 + 1.6), baseH * 0.69, 0);
  group.add(canopy, soffit);

  // 2. Main curtain-wall shaft (toned down emissive for natural realism)
  const shaftH = height * 0.68;
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: facadeTex,
    emissive: new THREE.Color(accentHex),
    emissiveMap: facadeTex,
    emissiveIntensity: 0.34,
    roughness: 0.24,
    metalness: 0.62,
  });
  const shaftMesh = new THREE.Mesh(new THREE.BoxGeometry(width, shaftH, depth), shaftMat);
  shaftMesh.position.y = baseH + shaftH / 2;
  shaftMesh.castShadow = true;
  shaftMesh.receiveShadow = true;
  group.add(shaftMesh);

  // Vertical corner architectural ribs & intermediate mullions for realistic facade depth
  const ribGeo = new THREE.BoxGeometry(0.45, shaftH + 0.5, 0.45);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const rib = new THREE.Mesh(ribGeo, matDarkMetal);
      rib.position.set(sx * (width / 2), baseH + shaftH / 2, sz * (depth / 2));
      group.add(rib);
    }
  }
  const mullionZGeo = new THREE.BoxGeometry(0.22, shaftH, 0.16);
  const mullionXGeo = new THREE.BoxGeometry(0.16, shaftH, 0.22);
  for (const off of [-0.28, 0.28]) {
    for (const sz of [-1, 1]) {
      const m = new THREE.Mesh(mullionZGeo, matDarkMetal);
      m.position.set(off * width, baseH + shaftH / 2, sz * (depth / 2 + 0.04));
      group.add(m);
    }
    for (const sx of [-1, 1]) {
      const m = new THREE.Mesh(mullionXGeo, matDarkMetal);
      m.position.set(sx * (width / 2 + 0.04), baseH + shaftH / 2, off * depth);
      group.add(m);
    }
  }

  // Lobby colonnade piers
  const colGeo = new THREE.CylinderGeometry(0.18, 0.22, baseH, 8);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pier = new THREE.Mesh(colGeo, matDarkMetal);
      pier.position.set(sx * (width / 2 + 1.15), baseH / 2, sz * (depth / 2 + 1.15));
      group.add(pier);
    }
  }

  // 3. Upper setback mechanical crown + parapet rim
  const parapetH = 0.7;
  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.35, parapetH, depth + 0.35),
    matDarkMetal
  );
  parapet.position.y = baseH + shaftH + parapetH / 2;
  group.add(parapet);

  const crownH = height * 0.16;
  const crownMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.72, crownH, depth * 0.72),
    matDarkMetal
  );
  crownMesh.position.y = baseH + shaftH + crownH / 2;
  crownMesh.castShadow = true;
  group.add(crownMesh);

  // 4. Subtle cornice trim band
  const trimMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.72,
    roughness: 0.3,
    metalness: 0.4,
  });
  const trimMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.76, 0.22, depth * 0.76),
    trimMat
  );
  trimMesh.position.y = baseH + shaftH + 0.14;
  group.add(trimMesh);

  // 5. Rooftop antenna spire & aviation beacon
  const spireH = 4 + (height % 5);
  const spireMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.18, spireH, 8),
    matDarkMetal
  );
  spireMesh.position.y = baseH + shaftH + crownH + spireH / 2;
  group.add(spireMesh);

  const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), trimMat);
  beaconMesh.position.y = baseH + shaftH + crownH + spireH;
  group.add(beaconMesh);

  return group;
}

/**
 * Builds the signature Main Central Landmark Building ("2030 AI NEXUS TOWER")
 * at the focal end of the grand boulevard [0, 0, -48].
 * Multi-stepped architectural silhouette with porte-cochère entrance plaza,
 * 3D structural fins, sky-garden setback terrace, tapered glass crown, and twin masts.
 */
function buildMainLandmarkTower({ x, z, facadeTex, matDarkMetal, matLobbyGlass }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x1e273a,
    roughness: 0.58,
    metalness: 0.35,
  });
  const steelFinMat = new THREE.MeshStandardMaterial({
    color: 0x2c3b57,
    roughness: 0.34,
    metalness: 0.85,
  });
  const warmAtriumMat = new THREE.MeshStandardMaterial({
    color: 0xffe4b8,
    emissive: 0xd99b48,
    emissiveIntensity: 0.42,
    roughness: 0.6,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x00d9eb,
    emissive: 0x0099aa,
    emissiveIntensity: 0.85,
    roughness: 0.25,
  });
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: facadeTex,
    emissive: new THREE.Color(0x00a8ba),
    emissiveMap: facadeTex,
    emissiveIntensity: 0.32,
    roughness: 0.2,
    metalness: 0.68,
  });

  // 1. Stepped Granite Plaza & Grand 6m Double-Height Atrium Podium
  const plazaStep = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.45, 13.8), stoneMat);
  plazaStep.position.y = 0.225;
  plazaStep.receiveShadow = true;

  const lobbyCore = new THREE.Mesh(new THREE.BoxGeometry(11.4, 5.2, 9.4), warmAtriumMat);
  lobbyCore.position.y = 3.0;

  const lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(13.6, 5.4, 11.4), matLobbyGlass);
  lobbyGlass.position.y = 3.1;

  const podiumCornice = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.65, 12.2), matDarkMetal);
  podiumCornice.position.y = 6.1;
  podiumCornice.castShadow = true;
  group.add(plazaStep, lobbyCore, lobbyGlass, podiumCornice);

  // Grand Atrium vertical mullions & boulevard-facing porte-cochère entrance canopy (+Z)
  for (let mx = -5.6; mx <= 5.6; mx += 1.4) {
    for (const sz of [-5.75, 5.75]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 5.5, 0.16), steelFinMat);
      m.position.set(mx, 3.1, sz);
      group.add(m);
    }
  }
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.36, 2.8), steelFinMat);
  canopy.position.set(0, 4.5, 6.8);
  const canopySoffit = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.08, 2.2), warmAtriumMat);
  canopySoffit.position.set(0, 4.3, 6.7);
  const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.14, 0.16), accentMat);
  canopyTrim.position.set(0, 4.5, 8.22);
  group.add(canopy, canopySoffit, canopyTrim);

  // Twin entrance canopy columns + central glass portal frame
  for (const cx of [-3.8, 3.8]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.4, 12), steelFinMat);
    col.position.set(cx, 2.2, 7.6);
    group.add(col);
  }

  // 2. Lower Curtain-Wall Shaft (y = 6.4..28.4, 12.8m x 10.6m) with 3D Exoskeleton Fins
  const tier2H = 22.0;
  const tier2Mesh = new THREE.Mesh(new THREE.BoxGeometry(12.8, tier2H, 10.6), shaftMat);
  tier2Mesh.position.y = 6.4 + tier2H / 2;
  tier2Mesh.castShadow = true;
  tier2Mesh.receiveShadow = true;
  group.add(tier2Mesh);

  for (const fx of [-6.45, -3.2, 0, 3.2, 6.45]) {
    for (const fz of [-5.4, 5.4]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.28, tier2H + 0.4, 0.38), steelFinMat);
      fin.position.set(fx, 6.4 + tier2H / 2, fz);
      group.add(fin);
    }
  }
  for (const fz of [-5.35, -1.8, 1.8, 5.35]) {
    for (const fx of [-6.5, 6.5]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.38, tier2H + 0.4, 0.28), steelFinMat);
      fin.position.set(fx, 6.4 + tier2H / 2, fz);
      group.add(fin);
    }
  }

  // 3. Mid-Tower Sky-Garden Observation Terrace (y = 28.4..29.8)
  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.75, 11.0), matDarkMetal);
  terraceSlab.position.y = 28.7;
  const terraceGlass = new THREE.Mesh(
    new THREE.BoxGeometry(12.9, 0.9, 10.7),
    new THREE.MeshStandardMaterial({
      color: 0x16405e,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.55,
    })
  );
  terraceGlass.position.y = 29.45;
  const terraceStrip = new THREE.Mesh(new THREE.BoxGeometry(13.3, 0.16, 11.1), accentMat);
  terraceStrip.position.y = 28.4;
  group.add(terraceSlab, terraceGlass, terraceStrip);

  // Sky-garden foliage planters along south terrace
  const gardenMat = new THREE.MeshStandardMaterial({ color: 0x1f6b4b, roughness: 0.75 });
  for (const gx of [-4.2, 0, 4.2]) {
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 0.85), gardenMat);
    hedge.position.set(gx, 29.35, 4.7);
    group.add(hedge);
  }

  // 4. Recessed Executive Upper Tower (y = 29.1..46.6, 9.6m x 8.2m)
  const tier3H = 17.5;
  const tier3Mesh = new THREE.Mesh(new THREE.BoxGeometry(9.6, tier3H, 8.2), shaftMat);
  tier3Mesh.position.y = 29.1 + tier3H / 2;
  tier3Mesh.castShadow = true;
  group.add(tier3Mesh);

  for (const sx of [-4.85, 4.85]) {
    for (const sz of [-4.15, 4.15]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.55, tier3H + 1.2, 0.55), steelFinMat);
      pier.position.set(sx, 29.1 + tier3H / 2, sz);
      group.add(pier);
    }
  }

  // 5. Sculpted Crown Penthouse & Twin Architectural Masts (y = 46.6..57.0)
  const crownDeck = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.7, 8.6), matDarkMetal);
  crownDeck.position.y = 46.9;
  const crownCore = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 5.4), steelFinMat);
  crownCore.position.y = 49.0;
  const crownLantern = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.35, 5.6), accentMat);
  crownLantern.position.y = 50.8;
  group.add(crownDeck, crownCore, crownLantern);

  // Diagonal architectural wing fins framing the crown
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 6.2), steelFinMat);
    wing.position.set(side * 4.2, 48.8, 0);
    wing.rotation.z = side * 0.14;
    group.add(wing);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 6.4, 8), steelFinMat);
    mast.position.set(side * 1.9, 53.8, 0);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), accentMat);
    beacon.position.set(side * 1.9, 57.0, 0);
    group.add(mast, beacon);
  }

  return group;
}

// Shared sculpted aerodynamic air-taxi hull & canopy geometries
let cachedTaxiBodyGeo = null;
let cachedTaxiCanopyGeo = null;

function getAirTaxiGeometries() {
  if (!cachedTaxiBodyGeo) {
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.55, -0.14);
    bodyShape.lineTo(1.35, -0.18);
    bodyShape.quadraticCurveTo(1.75, -0.05, 1.55, 0.14);
    bodyShape.lineTo(0.85, 0.26);
    bodyShape.lineTo(-0.95, 0.26);
    bodyShape.quadraticCurveTo(-1.55, 0.18, -1.55, -0.14);

    cachedTaxiBodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 1.24,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    cachedTaxiBodyGeo.translate(0, 0, -0.62);
    cachedTaxiBodyGeo.rotateY(-Math.PI / 2);

    const canopyShape = new THREE.Shape();
    canopyShape.moveTo(-0.82, 0.24);
    canopyShape.quadraticCurveTo(-0.25, 0.62, 0.55, 0.52);
    canopyShape.quadraticCurveTo(0.95, 0.36, 0.92, 0.24);
    canopyShape.closePath();

    cachedTaxiCanopyGeo = new THREE.ExtrudeGeometry(canopyShape, {
      depth: 0.94,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    cachedTaxiCanopyGeo.translate(0, 0, -0.47);
    cachedTaxiCanopyGeo.rotateY(-Math.PI / 2);
  }
  return { bodyGeo: cachedTaxiBodyGeo, canopyGeo: cachedTaxiCanopyGeo };
}

/**
 * Builds an aerodynamic sculpted Flying Air Taxi with curved fuselage, panoramic canopy, and ducted turbine pods.
 */
function buildFlyingCar(accentHex) {
  const car = new THREE.Group();
  const { bodyGeo, canopyGeo } = getAirTaxiGeometries();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x26324d,
    roughness: 0.26,
    metalness: 0.84,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  car.add(body);

  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x0a162b,
    roughness: 0.08,
    metalness: 0.92,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  car.add(canopy);

  const podMat = new THREE.MeshStandardMaterial({
    color: 0x1a2338,
    roughness: 0.35,
    metalness: 0.8,
  });
  const rotorRingGeo = new THREE.TorusGeometry(0.28, 0.045, 8, 16);
  rotorRingGeo.rotateX(Math.PI / 2);
  const nacelleGeo = new THREE.BoxGeometry(0.45, 0.09, 0.32);

  for (const [rx, rz] of [
    [-0.95, 0.85],
    [0.95, 0.85],
    [-0.95, -0.85],
    [0.95, -0.85],
  ]) {
    const arm = new THREE.Mesh(nacelleGeo, podMat);
    arm.position.set(rx * 0.72, 0.04, rz);
    const shroud = new THREE.Mesh(rotorRingGeo, podMat);
    shroud.position.set(rx, 0.05, rz);
    car.add(arm, shroud);
  }

  const frontMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00d9eb,
    emissiveIntensity: 1.0,
  });
  const frontLight = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.1), frontMat);
  frontLight.position.set(0, -0.02, 1.62);
  car.add(frontLight);

  const rearMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 1.1,
  });
  const rearLight = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.08, 0.1), rearMat);
  rearLight.position.set(0, 0.02, -1.58);
  car.add(rearLight);

  return car;
}

/**
 * Builds realistic smart streetlamps and urban trees along the central boulevard.
 */
function buildStreetFurniture(group) {
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x263147,
    roughness: 0.4,
    metalness: 0.8,
  });
  const lampGlow = new THREE.MeshStandardMaterial({
    color: 0x99f6ff,
    emissive: 0x00d9eb,
    emissiveIntensity: 0.9,
  });
  const planterMat = new THREE.MeshStandardMaterial({
    color: 0x242c3c,
    roughness: 0.75,
  });
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525,
    roughness: 0.85,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x1e5c45,
    roughness: 0.7,
  });

  // Raised sidewalks & granite curbs along X = +-9.5
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x1c2436,
    roughness: 0.65,
    metalness: 0.2,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x2c374f,
    roughness: 0.55,
    metalness: 0.25,
  });
  for (const sx of [-9.5, 9.5]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 88), sidewalkMat);
    walk.position.set(sx, 0.09, -4);
    walk.receiveShadow = true;
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 88), curbMat);
    curb.position.set(sx > 0 ? 7.35 : -7.35, 0.11, -4);
    group.add(walk, curb);
  }

  // Pedestrian crosswalk zebra stripes across the central avenue
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
  for (const cz of [22, -2, -24]) {
    for (let sx = -5.4; sx <= 5.4; sx += 1.35) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 2.2), stripeMat);
      stripe.position.set(sx, 0.025, cz);
      group.add(stripe);
    }
  }

  for (let z = -34; z <= 32; z += 11) {
    for (const side of [-1, 1]) {
      const lx = side * 8.2;
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0.18, z);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.6, 8), poleMat);
      post.position.y = 2.3;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.12), poleMat);
      arm.position.set(-side * 0.45, 4.55, 0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.22), lampGlow);
      head.position.set(-side * 0.85, 4.48, 0);
      lamp.add(post, arm, head);
      group.add(lamp);

      // Urban planter + realistic multi-canopy tree between lamps
      if (z % 22 === 0) {
        const tree = new THREE.Group();
        tree.position.set(side * 10.2, 0.18, z + 5);
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.55, 12), planterMat);
        pot.position.y = 0.27;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 1.9, 8), trunkMat);
        trunk.position.y = 1.35;
        const crown1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), leafMat);
        crown1.position.y = 2.55;
        const crown2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.76, 1), leafMat);
        crown2.position.set(0.38, 3.08, 0.22);
        const crown3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.66, 1), leafMat);
        crown3.position.set(-0.36, 2.9, -0.2);
        tree.add(pot, trunk, crown1, crown2, crown3);
        group.add(tree);
      }
    }
  }
}

/**
 * Builds an orbital AI communications & Earth-observation satellite.
 */
function buildSatellite(scale = 1.0) {
  const sat = new THREE.Group();
  sat.scale.setScalar(scale);

  const goldFoil = new THREE.MeshStandardMaterial({
    color: 0xd9a834,
    roughness: 0.26,
    metalness: 0.86,
  });
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x103870,
    emissive: 0x09244d,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.78,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x8ea4c4,
    roughness: 0.35,
    metalness: 0.8,
  });
  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00b8d4,
    emissiveIntensity: 1.0,
  });

  // Main satellite bus
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.6, 8), goldFoil);
  bus.rotation.z = Math.PI / 2;
  sat.add(bus);

  // Dual solar array wings
  for (const side of [-1, 1]) {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8), frameMat);
    boom.position.set(0, 0, side * 1.9);
    boom.rotation.x = Math.PI / 2;

    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 5.4), solarMat);
    wing.position.set(0, 0, side * 5.2);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.11, 0.14), cyanMat);
    trim.position.set(0, 0, side * 7.85);

    sat.add(boom, wing, trim);
  }

  // Earth-facing parabolic dish & data beam
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.2, 0.55, 14), frameMat);
  dish.position.set(0, -1.25, 0);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), cyanMat);
  beacon.position.set(0, 1.3, 0);
  const dataBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 1.4, 24, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    })
  );
  dataBeam.position.set(0, -13.4, 0);

  sat.add(dish, beacon, dataBeam);
  return sat;
}

/**
 * Builds the orbital space starfield, satellites, and atmospheric cloud deck (y = 84..106).
 */
function buildSpaceAndClouds(scene) {
  const spaceGroup = new THREE.Group();

  // 1. Crisp orbital starfield high above
  const starCount = 420;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = ((i * 137.5) % 360) * (Math.PI / 180);
    const phi = 0.08 + ((i * 29) % 100) * 0.0078; // upper hemisphere
    const r = 380 + (i % 7) * 28;
    starPos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
    starPos[i * 3 + 1] = 110 + Math.cos(phi) * r * 0.72;
    starPos[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xdbeafe,
    size: 2.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    fog: false,
  });
  spaceGroup.add(new THREE.Points(starGeo, starMat));

  // 2. Three AI Satellites positioned along the orbital opening trajectory
  const satSpecs = [
    { x: -12, y: 162, z: 120, scale: 1.35, rotY: 0.45, rotZ: -0.18, speed: 0.25 },
    { x: 18, y: 170, z: 102, scale: 1.25, rotY: -0.55, rotZ: 0.14, speed: -0.22 },
    { x: -34, y: 175, z: 88, scale: 1.1, rotY: 0.8, rotZ: 0.1, speed: 0.18 },
  ];
  const satellites = satSpecs.map((spec) => {
    const mesh = buildSatellite(spec.scale);
    mesh.position.set(spec.x, spec.y, spec.z);
    mesh.rotation.set(0.15, spec.rotY, spec.rotZ);
    spaceGroup.add(mesh);
    return { mesh, spec };
  });

  // 3. Atmospheric Cloud Deck around y = 84..106 using soft layered cloud sprites
  const cloudTex = createCloudTexture();
  const cloudMat = new THREE.SpriteMaterial({
    map: cloudTex,
    color: 0xd8e8ff,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
    fog: false,
  });

  const clouds = [];
  const cloudCenters = [
    // Flanking the descent corridor around z = 95..145 so camera dives right through clouds
    [-26, 94, 126, 1.3],
    [14, 96, 122, 1.4],
    [-4, 98, 114, 1.05],
    [-38, 91, 96, 1.5],
    [32, 92, 94, 1.5],
    [-64, 95, 62, 1.7],
    [58, 95, 58, 1.6],
    [-82, 93, 18, 1.8],
    [76, 96, 12, 1.7],
    [-70, 97, -38, 1.8],
    [72, 94, -44, 1.7],
    [-42, 98, -82, 1.6],
    [40, 96, -86, 1.6],
    [0, 102, -98, 1.7],
    [-98, 92, -88, 1.9],
    [98, 95, -95, 1.9],
    [-18, 88, 148, 1.3],
    [24, 90, 145, 1.35],
  ];

  cloudCenters.forEach(([cx, cy, cz, sc], idx) => {
    const cluster = new THREE.Group();
    cluster.position.set(cx, cy, cz);
    for (let p = 0; p < 4; p++) {
      const puff = new THREE.Sprite(cloudMat);
      const px = ((p - 1.5) * 7.0 + Math.sin(idx + p) * 2.5) * sc;
      const py = Math.cos(idx * 2 + p) * 1.4 * sc;
      const pz = Math.sin(idx * 3 + p) * 4.2 * sc;
      const sx = (22 + (p % 3) * 6) * sc;
      const sy = (10 + (p % 2) * 3) * sc;
      puff.position.set(px, py, pz);
      puff.scale.set(sx, sy, 1);
      cluster.add(puff);
    }
    spaceGroup.add(cluster);
    clouds.push({ mesh: cluster, baseX: cx, phase: idx * 0.7 });
  });

  scene.add(spaceGroup);

  return {
    update(elapsed) {
      for (const s of satellites) {
        s.mesh.position.x = s.spec.x + Math.sin(elapsed * s.spec.speed) * 4.5;
        s.mesh.position.y = s.spec.y + Math.cos(elapsed * 0.6 + s.spec.x) * 0.8;
        s.mesh.rotation.y = s.spec.rotY + Math.sin(elapsed * 0.2) * 0.12;
      }
      for (const c of clouds) {
        c.mesh.position.x = c.baseX + Math.sin(elapsed * 0.08 + c.phase) * 3.2;
      }
    },
  };
}

/**
 * Builds the ground plane, Smart City 2030 skyline, waterfront seawall, sky dome, space/clouds, and air taxis.
 */
export function createCityAndSky(scene, maxAnisotropy) {
  const group = new THREE.Group();
  const shadowTex = createContactShadowTexture();

  // Gradient sky dome (calm night twilight -> warm sunset)
  const skyUniforms = {
    uSunset: { value: 0.0 },
    uTopNight: { value: new THREE.Color('#070a18') },
    uHorizonNight: { value: new THREE.Color('#131d3b') },
    uTopSunset: { value: new THREE.Color('#1c1133') },
    uHorizonSunset: { value: new THREE.Color('#e05b38') },
    uGlowSunset: { value: new THREE.Color('#c92d65') },
  };
  const skyGeo = new THREE.SphereGeometry(820, 32, 20);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uSunset;
      uniform vec3 uTopNight;
      uniform vec3 uHorizonNight;
      uniform vec3 uTopSunset;
      uniform vec3 uHorizonSunset;
      uniform vec3 uGlowSunset;
      varying vec3 vWorldPos;
      void main() {
        vec3 dir = normalize(vWorldPos);
        float h = clamp(dir.y * 1.4, 0.0, 1.0);
        vec3 nightCol = mix(uHorizonNight, uTopNight, pow(h, 0.7));
        vec3 sunsetBand = mix(uHorizonSunset, uGlowSunset, smoothstep(0.0, 0.28, h));
        vec3 sunsetCol = mix(sunsetBand, uTopSunset, smoothstep(0.18, 0.85, h));
        vec3 col = mix(nightCol, sunsetCol, uSunset);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // Wet asphalt ground
  const { map: roadMap, roughnessMap: roadRough } = createWetRoadTextures(maxAnisotropy);
  const groundGeo = new THREE.PlaneGeometry(540, 540);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: roadMap,
    roughnessMap: roadRough,
    roughness: 0.95,
    metalness: 0.08,
    envMapIntensity: 0.25,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = 0;
  ground.receiveShadow = true;
  group.add(ground);

  // Waterfront bay water & architectural seawall along Z = 54 with animated wave normals
  const waterNormalTex = createWaterNormalTexture(maxAnisotropy);
  const waterGeo = new THREE.PlaneGeometry(520, 170);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x09162d,
    normalMap: waterNormalTex,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.22,
    metalness: 0.76,
    envMapIntensity: 0.32,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(0, 0.03, 138);
  group.add(water);

  const seawall = new THREE.Mesh(
    new THREE.BoxGeometry(280, 0.65, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1d263b, roughness: 0.6 })
  );
  seawall.position.set(0, 0.32, 53);
  group.add(seawall);

  // Subtle dashed avenue lane markings (realistic, not overly bright)
  const laneMatCyan = new THREE.MeshStandardMaterial({
    color: 0x00d9e8,
    emissive: 0x0099aa,
    emissiveIntensity: 0.7,
    roughness: 0.3,
  });
  const laneMatYellow = new THREE.MeshStandardMaterial({
    color: 0xe6d635,
    emissive: 0x998c18,
    emissiveIntensity: 0.65,
    roughness: 0.3,
  });

  const aveLine1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 88), laneMatCyan);
  aveLine1.position.set(-5.8, 0.04, -2);
  const aveLine2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 88), laneMatCyan);
  aveLine2.position.set(5.8, 0.04, -2);
  for (let z = -36; z <= 36; z += 7) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 3.2), laneMatYellow);
    dash.position.set(0, 0.04, z);
    group.add(dash);
  }
  const crossLine = new THREE.Mesh(new THREE.BoxGeometry(92, 0.04, 0.22), laneMatYellow);
  crossLine.position.set(0, 0.04, -10);
  group.add(aveLine1, aveLine2, crossLine);

  buildStreetFurniture(group);

  // Smart City hero towers
  const facadeCyan = createFacadeTexture(maxAnisotropy, 'cyan');
  const facadeYellow = createFacadeTexture(maxAnisotropy, 'yellow');
  const facadeMagenta = createFacadeTexture(maxAnisotropy, 'magenta');

  const matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x1b233a,
    roughness: 0.38,
    metalness: 0.82,
  });
  const matLobbyGlass = new THREE.MeshStandardMaterial({
    color: 0x0b1628,
    emissive: 0x091628,
    emissiveIntensity: 0.25,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.72,
  });

  const heroSpecs = [
    { x: -18, z: 10, w: 9.5, d: 9.5, h: 32, f: facadeCyan, a: 0x00c8d9 },
    { x: 18, z: 12, w: 10, d: 8.5, h: 38, f: facadeYellow, a: 0xd9c734 },
    { x: -19, z: -12, w: 10, d: 10, h: 44, f: facadeCyan, a: 0x00c8d9 },
    { x: 19, z: -10, w: 11, d: 9.5, h: 48, f: facadeMagenta, a: 0xd43b6f },
    { x: -18, z: -32, w: 9.5, d: 9.5, h: 35, f: facadeYellow, a: 0xd9c734 },
    { x: 18, z: -32, w: 10, d: 10, h: 40, f: facadeCyan, a: 0x00c8d9 },
    { x: -35, z: 4, w: 10, d: 10, h: 28, f: facadeMagenta, a: 0xd43b6f },
    { x: 35, z: 16, w: 9.5, d: 9.5, h: 30, f: facadeCyan, a: 0x00c8d9 },
    { x: 0, z: -48, w: 13, d: 11, h: 52, f: facadeCyan, a: 0x00c8d9, isLandmark: true },
    { x: -35, z: -24, w: 9.5, d: 8.5, h: 26, f: facadeCyan, a: 0x00c8d9 },
  ];

  for (const spec of heroSpecs) {
    if (spec.isLandmark) {
      group.add(
        buildMainLandmarkTower({
          x: spec.x,
          z: spec.z,
          facadeTex: spec.f,
          matDarkMetal,
          matLobbyGlass,
        })
      );
    } else {
      group.add(
        buildSmartTower({
          x: spec.x,
          z: spec.z,
          width: spec.w,
          depth: spec.d,
          height: spec.h,
          facadeTex: spec.f,
          accentHex: spec.a,
          matDarkMetal,
          matLobbyGlass,
        })
      );
    }
  }

  // Elevated skybridge connecting towers across the avenue at y = 22
  const bridgeDeck = new THREE.Mesh(
    new THREE.BoxGeometry(27, 1.35, 3.2),
    matDarkMetal
  );
  bridgeDeck.position.set(0, 22, -11);
  const bridgeGlass = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.9, 3.35),
    matLobbyGlass
  );
  bridgeGlass.position.set(0, 22.1, -11);
  const bridgeTrim = new THREE.Mesh(
    new THREE.BoxGeometry(26.8, 0.14, 3.42),
    laneMatCyan
  );
  bridgeTrim.position.set(0, 21.4, -11);
  group.add(bridgeDeck, bridgeGlass, bridgeTrim);

  // Realistic pedestrians walking along the central boulevard sidewalks & landmark plaza
  const pedestrianSpecs = [
    { x: -9.2, zStart: -26, zEnd: 24, speed: 1.5, dir: 1, hair: 'short', shirt: 0x2563eb, pants: 0x1e293b, skin: 0xdba988 },
    { x: -9.8, zStart: -22, zEnd: 26, speed: 1.35, dir: -1, hair: 'ponytail', shirt: 0x0d9488, pants: 0x0f172a, skin: 0xc68b67 },
    { x: 9.2, zStart: -24, zEnd: 24, speed: 1.45, dir: 1, hair: 'bob', shirt: 0xd97706, pants: 0x1e293b, skin: 0xe3b896 },
    { x: 9.8, zStart: -20, zEnd: 28, speed: 1.25, dir: -1, hair: 'parted', shirt: 0x6366f1, pants: 0x334155, skin: 0x9b6849 },
    { x: -9.4, zStart: -36, zEnd: -10, speed: 1.3, dir: 1, hair: 'parted', shirt: 0xe11d48, pants: 0x1e293b, skin: 0xd6a07e },
    { x: 9.4, zStart: -36, zEnd: -10, speed: 1.4, dir: -1, hair: 'short', shirt: 0x0284c7, pants: 0x0f172a, skin: 0xe7bfa0 },
    // Two stationary citizens conversing outside the Main Landmark Tower entrance plaza
    { x: -2.4, zStart: -39.5, zEnd: -39.5, speed: 0, dir: 1, rotY: 1.1, hair: 'bob', shirt: 0x475569, pants: 0x0f172a, skin: 0xdba988 },
    { x: -1.1, zStart: -39.2, zEnd: -39.2, speed: 0, dir: 1, rotY: -1.9, hair: 'short', shirt: 0x0369a1, pants: 0x1e293b, skin: 0xc68b67 },
  ];

  const pedestrians = pedestrianSpecs.map((spec, idx) => {
    const fig = buildHumanFigure({
      pose: 'standing',
      role: 'pedestrian',
      hairStyle: spec.hair,
      shirtHex: spec.shirt,
      pantsHex: spec.pants,
      skinHex: spec.skin,
    });
    fig.root.position.set(spec.x, 0.18, spec.zStart);
    if (spec.rotY !== undefined) {
      fig.root.rotation.y = spec.rotY;
    } else {
      fig.root.rotation.y = spec.dir > 0 ? 0 : Math.PI;
    }
    group.add(fig.root);
    return { fig, spec, phase: idx * 1.4 };
  });

  // Instanced background skyline silhouette ring
  const bgCount = 68;
  const bgGeo = new THREE.BoxGeometry(1, 1, 1);
  const bgMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: facadeCyan,
    emissive: 0x0c243b,
    emissiveMap: facadeCyan,
    emissiveIntensity: 0.3,
    roughness: 0.55,
    metalness: 0.5,
  });
  const bgInstanced = new THREE.InstancedMesh(bgGeo, bgMat, bgCount);
  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();

  for (let i = 0; i < bgCount; i++) {
    const angle = (i / bgCount) * Math.PI * 2;
    const radius = 114 + (i % 5) * 14;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius - 22;
    const bw = 7.5 + (i % 4) * 2.5;
    const bd = 7.5 + ((i + 2) % 4) * 2.2;
    const bh = 18 + ((i * 7) % 34);

    dummy.position.set(px, bh / 2, pz);
    dummy.scale.set(bw, bh, bd);
    dummy.rotation.y = angle;
    dummy.updateMatrix();
    bgInstanced.setMatrixAt(i, dummy.matrix);

    tintColor.setHSL(0.57 + (i % 3) * 0.03, 0.3, 0.4 + (i % 4) * 0.07);
    bgInstanced.setColorAt(i, tintColor);
  }
  bgInstanced.computeBoundingSphere();
  group.add(bgInstanced);

  // Flying Air Taxis cruising smoothly along sky corridors
  const airTaxis = [];
  const laneConfigs = [
    { axis: 'z', fixedX: -4.5, y: 14, speed: 9.5, dir: 1, accent: 0xd43b6f, offset: 0 },
    { axis: 'z', fixedX: 4.5, y: 17, speed: 11, dir: -1, accent: 0xd9c734, offset: 32 },
    { axis: 'z', fixedX: -5, y: 26, speed: 8.5, dir: 1, accent: 0x00c8d9, offset: 58 },
    { axis: 'x', fixedZ: -20, y: 15, speed: 10, dir: 1, accent: 0xd43b6f, offset: 15 },
    { axis: 'x', fixedZ: -26, y: 19, speed: 12, dir: -1, accent: 0xd9c734, offset: 48 },
    { axis: 'x', fixedZ: 4, y: 13, speed: 9, dir: 1, accent: 0x00c8d9, offset: 22 },
  ];

  for (const cfg of laneConfigs) {
    const mesh = buildFlyingCar(cfg.accent);
    group.add(mesh);
    airTaxis.push({ mesh, ...cfg });
  }

  scene.add(group);
  const spaceAndClouds = buildSpaceAndClouds(scene);

  return {
    group,
    skyUniforms,
    shadowTex,
    update(elapsed) {
      spaceAndClouds.update(elapsed);
      waterNormalTex.offset.x = (elapsed * 0.022) % 1;
      waterNormalTex.offset.y = (elapsed * 0.014) % 1;
      for (const taxi of airTaxis) {
        const span = 140;
        const raw = ((elapsed * taxi.speed + taxi.offset) % span) - span / 2;
        const pos = raw * taxi.dir;
        const bob = Math.sin(elapsed * 2.2 + taxi.offset) * 0.32;
        if (taxi.axis === 'z') {
          taxi.mesh.position.set(taxi.fixedX, taxi.y + bob, pos);
          taxi.mesh.rotation.y = taxi.dir > 0 ? 0 : Math.PI;
        } else {
          taxi.mesh.position.set(pos, taxi.y + bob, taxi.fixedZ);
          taxi.mesh.rotation.y = taxi.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      }

      // Animate sidewalk pedestrians walking along the boulevard & chatting at the main plaza
      for (const p of pedestrians) {
        if (p.spec.speed > 0) {
          const span = p.spec.zEnd - p.spec.zStart;
          const raw = (elapsed * p.spec.speed + p.phase * 7) % (span * 2);
          const pingpong = raw <= span ? raw : span * 2 - raw;
          const goingForward = raw <= span;
          p.fig.root.position.z = p.spec.zStart + pingpong;
          p.fig.root.rotation.y = goingForward ? 0 : Math.PI;

          const stride = Math.sin(elapsed * 5.2 + p.phase) * 0.42;
          p.fig.legs[0].rotation.x = stride;
          p.fig.legs[1].rotation.x = -stride;
          p.fig.arms[0].shoulder.rotation.x = -stride * 0.65;
          p.fig.arms[1].shoulder.rotation.x = stride * 0.65;
        } else {
          p.fig.headGroup.rotation.y = Math.sin(elapsed * 0.9 + p.phase) * 0.22;
        }
      }
    },
  };
}
