import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createCityAndSky } from './cityAndSky.js';
import { createAllZones } from './zonesBuilder.js';
import { createCameraRig } from './cameraRig.js';

/**
 * Detects software WebGL (SwiftShader, llvmpipe, WARP) via GPU renderer string.
 */
function detectSoftwareGl() {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Initializes and runs the unified 3D Three.js stage for AI in 2030.
 */
export function createStage(containerEl, initialCard) {
  const isSoftwareGl = detectSoftwareGl();

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.84;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(containerEl.clientWidth || window.innerWidth, containerEl.clientHeight || window.innerHeight);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  containerEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const nightFogColor = new THREE.Color('#0B0C1A');
  const sunsetFogColor = new THREE.Color('#2a1333');
  scene.fog = new THREE.FogExp2(nightFogColor.getHex(), 0.0052);

  // Mandatory studio reflection environment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmremGenerator.dispose();

  const width = containerEl.clientWidth || window.innerWidth;
  const height = containerEl.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(56, width / height, 0.5, 1200);

  // Balanced, comfortable lighting rig (never harsh or blown out)
  const hemiLight = new THREE.HemisphereLight(0x4b74cc, 0x0b0c1a, 0.42);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffeedd, 0.85);
  keyLight.position.set(45, 75, 55);
  keyLight.castShadow = !isSoftwareGl;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 10;
  keyLight.shadow.camera.far = 220;
  const d = 85;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x00c8d9, 0.42);
  rimLight.position.set(-60, 40, -70);
  scene.add(rimLight);

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const cityAndSky = createCityAndSky(scene, maxAnisotropy);
  const zones = createAllZones(scene, cityAndSky.shadowTex);
  const cameraRig = createCameraRig(camera, [-10, 174, 154], [0, 152, 95]);

  // Post-processing bloom (only on hardware GPUs; subtle, controlled threshold)
  let composer = null;
  let bloomPass = null;
  let usePostProcessing = !isSoftwareGl;

  if (usePostProcessing) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.28,
      0.35,
      0.88
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  // Pre-warm shaders on hardware GPU
  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  // WebGL context loss guard
  const onContextLost = (e) => {
    e.preventDefault();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  let activeCard = initialCard;
  let targetSunsetMix = initialCard.sunsetMix || 0;
  let currentSunsetMix = targetSunsetMix;
  let paused = false;
  let qualityMode = isSoftwareGl ? 'software-safe' : 'high';
  let frameId = 0;
  let disposed = false;

  // Rolling FPS monitor to auto-lower quality if frame rate drops
  const fpsSamples = [];
  let lastLowCheck = performance.now();
  let lastFrameMs = performance.now();
  let simElapsed = 0;

  const _nightKeyColor = new THREE.Color(0xffeedd);
  const _sunsetKeyColor = new THREE.Color(0xff8e53);

  function afterDraw(cb) {
    const gl = renderer.getContext();
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function tick() {
    if (disposed) return;
    const nowMs = performance.now();
    const rawDelta = Math.max(0.001, (nowMs - lastFrameMs) / 1000);
    lastFrameMs = nowMs;
    const delta = Math.min(rawDelta, 0.25);

    if (!paused) {
      simElapsed += delta;
      cityAndSky.update(simElapsed);
      zones.update(simElapsed, activeCard);
    }

    // Smoothly interpolate sunset atmosphere & altitude-aware fog
    currentSunsetMix = THREE.MathUtils.damp(currentSunsetMix, targetSunsetMix, 1.4, delta);
    cityAndSky.skyUniforms.uSunset.value = currentSunsetMix;
    scene.fog.color.copy(nightFogColor).lerp(sunsetFogColor, currentSunsetMix);
    const altFactor = THREE.MathUtils.clamp((camera.position.y - 50) / 95, 0, 1);
    scene.fog.density = THREE.MathUtils.lerp(0.0052, 0.0011, altFactor);
    keyLight.color.copy(_nightKeyColor).lerp(_sunsetKeyColor, currentSunsetMix);
    keyLight.intensity = THREE.MathUtils.lerp(0.85, 1.08, currentSunsetMix);

    cameraRig.update(delta, simElapsed);

    // Auto-lower quality if hardware GPU drops below 26 FPS consistently
    if (!isSoftwareGl && rawDelta > 0) {
      fpsSamples.push(1 / rawDelta);
      if (fpsSamples.length > 45) fpsSamples.shift();
      const now = performance.now();
      if (now - lastLowCheck > 2000 && fpsSamples.length >= 30) {
        lastLowCheck = now;
        const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
        if (avgFps < 26 && qualityMode === 'high') {
          qualityMode = 'balanced';
          usePostProcessing = false;
          renderer.setPixelRatio(1);
          renderer.shadowMap.enabled = false;
          keyLight.castShadow = false;
        }
      }
    }

    if (usePostProcessing && composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  tick();

  function onResize() {
    if (disposed) return;
    const w = containerEl.clientWidth || window.innerWidth;
    const h = containerEl.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) {
      composer.setSize(w, h);
    }
    if (bloomPass) {
      bloomPass.resolution.set(w, h);
    }
  }

  window.addEventListener('resize', onResize);

  return {
    setCard(card, instant = false) {
      activeCard = card;
      targetSunsetMix = card.sunsetMix || 0;
      cameraRig.flyTo(card.camPos, card.camLook, instant);
    },
    playIntroDrop(card) {
      activeCard = card;
      targetSunsetMix = card.sunsetMix || 0;
      cameraRig.flyPath(
        [
          [-10, 174, 154],
          [-9, 155, 140],
          [-8, 94, 118],
          card.camPos,
        ],
        [
          [0, 152, 95],
          [0, 118, 62],
          [0, 48, 12],
          card.camLook,
        ],
        3.4
      );
    },
    setPaused(isPaused) {
      paused = isPaused;
    },
    getQualityMode() {
      return qualityMode;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      composer?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === containerEl) {
        containerEl.removeChild(renderer.domElement);
      }
    },
  };
}
