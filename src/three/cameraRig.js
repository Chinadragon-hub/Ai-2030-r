import * as THREE from 'three';

/**
 * Continuous flying camera rig.
 * Aims directly toward the target landmark during transitions so the camera
 * never drifts into empty void, while supporting multi-point orbital descents.
 */
export function createCameraRig(camera, initialPos, initialLook) {
  const currentPos = new THREE.Vector3(...initialPos);
  const currentLook = new THREE.Vector3(...initialLook);
  const startPos = new THREE.Vector3(...initialPos);
  const startLook = new THREE.Vector3(...initialLook);
  const targetPos = new THREE.Vector3(...initialPos);
  const targetLook = new THREE.Vector3(...initialLook);

  // Pre-allocated scratch vectors (zero GC in render loop)
  const _desiredPos = new THREE.Vector3();
  const _desiredLook = new THREE.Vector3();
  const _mid = new THREE.Vector3();

  let activeCurve = null;
  let activeLookCurve = null;
  let flightStartMs = 0;
  let flightDurationMs = 1700;

  camera.position.copy(currentPos);
  camera.lookAt(currentLook);

  return {
    /**
     * Smoothly flies the camera from its current pose to a new landmark waypoint.
     * @param {[number, number, number]} pos
     * @param {[number, number, number]} look
     * @param {boolean} instant
     */
    flyTo(pos, look, instant = false) {
      targetPos.set(pos[0], pos[1], pos[2]);
      targetLook.set(look[0], look[1], look[2]);
      activeLookCurve = null;

      if (instant) {
        currentPos.copy(targetPos);
        currentLook.copy(targetLook);
        startPos.copy(targetPos);
        startLook.copy(targetLook);
        activeCurve = null;
        camera.position.copy(currentPos);
        camera.lookAt(currentLook);
        return;
      }

      startPos.copy(currentPos);
      startLook.copy(currentLook);

      const dist = currentPos.distanceTo(targetPos);
      if (dist > 14) {
        _mid.copy(currentPos).lerp(targetPos, 0.5);
        // Gentle clearance arc only over long flights, never swinging wide into void
        _mid.y = Math.max(currentPos.y, targetPos.y) + Math.min(8, dist * 0.08);

        activeCurve = new THREE.CatmullRomCurve3([
          currentPos.clone(),
          _mid.clone(),
          targetPos.clone(),
        ]);

        const durationSec = THREE.MathUtils.clamp(dist * 0.022, 1.1, 1.9);
        flightDurationMs = durationSec * 1000;
        flightStartMs = performance.now();
      } else {
        activeCurve = null;
        flightDurationMs = 1100;
        flightStartMs = performance.now();
      }
    },

    /**
     * Executes a multi-waypoint cinematic spline flight (used for Space -> Clouds -> City drop).
     * @param {Array<[number, number, number]>} posPoints
     * @param {Array<[number, number, number]>} lookPoints
     * @param {number} durationSec
     */
    flyPath(posPoints, lookPoints, durationSec = 3.4) {
      const pVecs = posPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const lVecs = lookPoints.map((l) => new THREE.Vector3(l[0], l[1], l[2]));

      currentPos.copy(pVecs[0]);
      currentLook.copy(lVecs[0]);
      startPos.copy(pVecs[0]);
      startLook.copy(lVecs[0]);
      targetPos.copy(pVecs[pVecs.length - 1]);
      targetLook.copy(lVecs[lVecs.length - 1]);

      camera.position.copy(currentPos);
      camera.lookAt(currentLook);

      activeCurve = new THREE.CatmullRomCurve3(pVecs);
      activeLookCurve = new THREE.CatmullRomCurve3(lVecs);
      flightDurationMs = durationSec * 1000;
      flightStartMs = performance.now();
    },

    /**
     * Updates camera position and focus-locked lookAt smoothly every frame.
     * @param {number} delta
     * @param {number} elapsed
     */
    update(delta, elapsed) {
      const safeDelta = Math.min(delta, 0.25);

      if (activeCurve) {
        const rawT = (performance.now() - flightStartMs) / flightDurationMs;
        const clampedT = Math.min(1, Math.max(0, rawT));
        const t = clampedT * clampedT * (3 - 2 * clampedT);
        activeCurve.getPoint(t, _desiredPos);

        if (activeLookCurve) {
          activeLookCurve.getPoint(t, _desiredLook);
          currentLook.lerp(_desiredLook, 1 - Math.exp(-10 * safeDelta));
        } else {
          // Lock aim quickly onto the destination subject (reaches targetLook by ~68% of flight)
          const lookT = Math.min(1, clampedT * 1.45);
          const smoothLookT = lookT * lookT * (3 - 2 * lookT);
          currentLook.lerpVectors(startLook, targetLook, smoothLookT);
        }

        if (clampedT >= 1) {
          currentPos.copy(targetPos);
          currentLook.copy(targetLook);
          activeCurve = null;
          activeLookCurve = null;
        } else {
          const dampFactor = 1 - Math.exp(-11 * safeDelta);
          currentPos.lerp(_desiredPos, dampFactor);
        }
      } else {
        const dampFactor = 1 - Math.exp(-4.5 * safeDelta);
        currentPos.lerp(targetPos, dampFactor);
        currentLook.lerp(targetLook, dampFactor);
      }

      // Very subtle steady breathing hover (never swings off target)
      const swayX = Math.sin(elapsed * 0.4) * 0.22;
      const swayY = Math.cos(elapsed * 0.5) * 0.12;

      camera.position.set(currentPos.x + swayX, currentPos.y + swayY, currentPos.z);
      camera.lookAt(currentLook);
    },
  };
}
