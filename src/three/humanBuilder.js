import * as THREE from 'three';

/**
 * Shared realistic articulated stylized human figure builder.
 * Supports 'standing' (with optional gentle walking animation limbs),
 * 'seated' (bent knees & forearms resting naturally on desk), and 'lying'.
 */
export function buildHumanFigure({
  pose = 'standing',
  role = 'pedestrian', // 'student' | 'teacher' | 'doctor' | 'engineer' | 'patient' | 'pedestrian'
  hairStyle = 'short', // 'short' | 'parted' | 'bob' | 'ponytail'
  shirtHex = 0x3b82f6,
  pantsHex = 0x1e293b,
  skinHex = 0xdba988,
  hairHex = 0x1f1a17,
  hasTablet = false,
} = {}) {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.62 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.78 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtHex, roughness: 0.56 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsHex, roughness: 0.68 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.72 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35 });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.3 });

  // --- 1. Sculpted Head with facial features & varied hair ---
  const headGroup = new THREE.Group();
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.068, 0.14, 12), skinMat);
  neck.position.y = -0.15;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), skinMat);
  head.scale.set(0.88, 1.04, 0.94);

  // Subtle nose bridge & expressive dark eyes facing +Z
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.048, 0.036), skinMat);
  nose.position.set(0, -0.015, 0.15);
  const eyeGeo = new THREE.SphereGeometry(0.017, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.048, 0.022, 0.136);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.048, 0.022, 0.136);
  const earGeo = new THREE.SphereGeometry(0.026, 8, 8);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.142, 0.0, 0.0);
  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.position.set(0.142, 0.0, 0.0);
  headGroup.add(neck, head, nose, eyeL, eyeR, earL, earR);

  // Hair variants
  const crownHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  crownHair.scale.set(0.91, 1.03, 0.97);
  crownHair.position.set(0, 0.016, -0.014);
  headGroup.add(crownHair);

  if (hairStyle === 'parted') {
    const swoop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), hairMat);
    swoop.position.set(-0.03, 0.115, 0.07);
    swoop.rotation.z = 0.22;
    headGroup.add(swoop);
  } else if (hairStyle === 'bob') {
    const backCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.162, 0.172, 0.2, 14, 1, false, Math.PI * 0.58, Math.PI * 1.84),
      hairMat
    );
    backCurtain.position.set(0, -0.055, -0.02);
    headGroup.add(backCurtain);
  } else if (hairStyle === 'ponytail') {
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.15, 6, 10), hairMat);
    tail.position.set(0, -0.04, -0.19);
    tail.rotation.x = 0.42;
    headGroup.add(tail);
  } else {
    // 'short' tapered nape
    const nape = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.125, 0.09, 12, 1, false, Math.PI * 0.65, Math.PI * 0.7),
      hairMat
    );
    nape.position.set(0, -0.04, -0.03);
    headGroup.add(nape);
  }

  // Helper to add sculpted upper+lower arm with elbow & hand
  function createArm(side, { upperLen = 0.26, lowerLen = 0.24 } = {}) {
    const shoulder = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), shirtMat);
    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.052, upperLen - 0.08, 6, 10),
      shirtMat
    );
    upper.position.y = -upperLen / 2;

    const elbow = new THREE.Group();
    elbow.position.y = -upperLen;
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), shirtMat);
    const sleeveMat = role === 'doctor' || role === 'teacher' ? shirtMat : skinMat;
    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.044, lowerLen - 0.08, 6, 10),
      role === 'pedestrian' || role === 'student' ? shirtMat : sleeveMat
    );
    forearm.position.y = -lowerLen / 2;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), skinMat);
    hand.scale.set(0.85, 1.15, 0.65);
    hand.position.y = -lowerLen - 0.025;

    elbow.add(elbowJoint, forearm, hand);
    shoulder.add(cap, upper, elbow);
    return { shoulder, elbow, hand };
  }

  // Helper to build tailored upper torso + role details (collar, lab coat, vest)
  function createTorsoGroup() {
    const tg = new THREE.Group();
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.148, 0.5, 14), shirtMat);
    chest.scale.set(1.06, 1.0, 0.66);
    tg.add(chest);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 16), collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.245;
    tg.add(collar);

    const waistBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.154, 0.055, 14), beltMat);
    waistBelt.scale.set(1.06, 1.0, 0.68);
    waistBelt.position.y = -0.22;
    tg.add(waistBelt);

    if (role === 'doctor') {
      // Open scrub V-neck inside white lab coat + stethoscope arc
      const scrub = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.42, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.6 })
      );
      scrub.position.set(0, 0.02, 0.095);
      const steth = new THREE.Mesh(
        new THREE.TorusGeometry(0.105, 0.012, 6, 18, Math.PI * 1.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 })
      );
      steth.rotation.x = 0.35;
      steth.rotation.z = -Math.PI * 0.1;
      steth.position.set(0, 0.18, 0.05);
      tg.add(scrub, steth);
    } else if (role === 'engineer') {
      // High-visibility safety vest panels & reflective bands
      const vestMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        emissive: 0x475569,
        emissiveIntensity: 0.35,
      });
      const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.194, 0.158, 0.4, 14), vestMat);
      vest.scale.set(1.07, 1.0, 0.68);
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.196, 0.165, 0.05, 14), stripeMat);
      stripe.scale.set(1.08, 1.0, 0.7);
      stripe.position.y = -0.06;
      tg.add(vest, stripe);
    } else if (role === 'teacher') {
      // Tie / smart lanyard accent
      const tie = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.28, 0.025),
        new THREE.MeshStandardMaterial({ color: 0x00c8d9, roughness: 0.4 })
      );
      tie.position.set(0, 0.06, 0.108);
      tg.add(tie);
    }
    return tg;
  }

  // --- 2. Pose Assembly ---
  if (pose === 'lying') {
    const torsoGroup = createTorsoGroup();
    torsoGroup.rotation.x = Math.PI / 2;
    torsoGroup.position.set(0, 0.17, -0.34);
    root.add(torsoGroup);

    headGroup.position.set(0, 0.24, -0.82);
    headGroup.rotation.x = -0.18;
    root.add(headGroup);

    const legGeo = new THREE.CapsuleGeometry(0.082, 0.62, 6, 12);
    legGeo.rotateX(Math.PI / 2);
    for (const sx of [-0.11, 0.11]) {
      const leg = new THREE.Mesh(legGeo, pantsMat);
      leg.position.set(sx, 0.12, 0.36);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.1), shoeMat);
      foot.position.set(sx, 0.16, 0.8);
      root.add(leg, foot);
    }

    // Crisp hospital sheet drape over legs/hips
    const blanket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.26, 0.88, 14, 1, false, -Math.PI * 0.5, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xcbe3fa, roughness: 0.78 })
    );
    blanket.rotation.z = Math.PI / 2;
    blanket.rotation.y = Math.PI / 2;
    blanket.scale.set(1.0, 1.0, 0.75);
    blanket.position.set(0, 0.08, 0.26);
    root.add(blanket);

    for (const side of [-1, 1]) {
      const arm = createArm(side);
      arm.shoulder.position.set(side * 0.22, 0.18, -0.52);
      arm.shoulder.rotation.x = -Math.PI / 2 + 0.08;
      arm.elbow.rotation.x = -0.28;
      root.add(arm.shoulder);
    }

    return { root, headGroup };
  }

  if (pose === 'seated') {
    const thighGeo = new THREE.CapsuleGeometry(0.084, 0.32, 6, 12);
    thighGeo.rotateX(Math.PI / 2);
    const shinGeo = new THREE.CapsuleGeometry(0.072, 0.34, 6, 12);
    for (const sx of [-0.115, 0.115]) {
      const thigh = new THREE.Mesh(thighGeo, pantsMat);
      thigh.position.set(sx, 0.52, 0.21);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 8), pantsMat);
      knee.position.set(sx, 0.51, 0.42);
      const shin = new THREE.Mesh(shinGeo, pantsMat);
      shin.position.set(sx, 0.27, 0.43);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.075, 0.22), shoeMat);
      shoe.position.set(sx, 0.045, 0.48);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.022, 0.23), soleMat);
      sole.position.set(sx, 0.011, 0.48);
      root.add(thigh, knee, shin, shoe, sole);
    }

    const torsoGroup = createTorsoGroup();
    torsoGroup.position.set(0, 0.86, 0.04);
    torsoGroup.rotation.x = 0.14;
    root.add(torsoGroup);

    headGroup.position.set(0, 1.32, 0.12);
    headGroup.rotation.x = 0.16;
    root.add(headGroup);

    // Bent elbows & forearms resting neatly toward the desk surface
    const arms = [];
    for (const side of [-1, 1]) {
      const arm = createArm(side, { upperLen: 0.25, lowerLen: 0.23 });
      arm.shoulder.position.set(side * 0.225, 1.07, 0.08);
      arm.shoulder.rotation.x = -0.28;
      arm.shoulder.rotation.z = side * -0.06;
      arm.elbow.rotation.x = -1.18;
      root.add(arm.shoulder);
      arms.push(arm);
    }

    return { root, headGroup, arms };
  }

  // --- Standing / Walking pose facing +Z ---
  const legs = [];
  for (const sx of [-0.11, 0.11]) {
    const legPivot = new THREE.Group();
    legPivot.position.set(sx, 0.86, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.28, 6, 12), pantsMat);
    thigh.position.y = -0.19;
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.076, 8, 8), pantsMat);
    knee.position.y = -0.39;
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 6, 12), pantsMat);
    shin.position.y = -0.61;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.075, 0.23), shoeMat);
    shoe.position.set(0, -0.815, 0.045);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.022, 0.24), soleMat);
    sole.position.set(0, -0.849, 0.045);

    legPivot.add(thigh, knee, shin, shoe, sole);
    root.add(legPivot);
    legs.push(legPivot);
  }

  const torsoGroup = createTorsoGroup();
  torsoGroup.position.set(0, 1.15, 0);
  root.add(torsoGroup);

  headGroup.position.set(0, 1.63, 0);
  root.add(headGroup);

  const armL = createArm(-1);
  armL.shoulder.position.set(-0.23, 1.36, 0);
  armL.shoulder.rotation.z = -0.08;
  armL.elbow.rotation.x = -0.22;

  const armR = createArm(1);
  armR.shoulder.position.set(0.23, 1.36, 0);
  armR.shoulder.rotation.z = 0.08;

  if (hasTablet) {
    armR.shoulder.rotation.x = -0.45;
    armR.elbow.rotation.x = -0.95;
    const tablet = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.028, 0.36),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x00c8d9,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      })
    );
    tablet.position.set(0.18, 1.13, 0.36);
    tablet.rotation.x = -0.38;
    root.add(tablet);
  } else {
    armR.elbow.rotation.x = -0.22;
  }

  root.add(armL.shoulder, armR.shoulder);

  return { root, headGroup, legs, arms: [armL, armR] };
}
