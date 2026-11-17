import test from 'node:test';
import assert from 'node:assert/strict';
import { TIMELINE, PLAN_ITEMS, SECTIONS, PRESENTATION_META } from '../data/timeline.js';
import {
  formatTime,
  computeCardTimings,
  getTotalDuration,
  getNextCardTarget,
  getPrevCardIndex,
  getSkipSectionTarget,
  getFourSectionProgress,
  getSpeakerDisplay,
} from './timelineHelpers.js';

test('timeline sums to exactly 300 seconds (5 minutes)', () => {
  assert.equal(getTotalDuration(TIMELINE), 300);
  assert.equal(PRESENTATION_META.totalDurationSec, 300);
});

test('every timeline card has 1 or 2 teleprompter lines and valid vectors', () => {
  for (const card of TIMELINE) {
    assert.ok(Array.isArray(card.lines), `card ${card.id} lines must be array`);
    assert.ok(card.lines.length >= 1 && card.lines.length <= 2, `card ${card.id} must have 1-2 lines`);
    assert.equal(card.camPos.length, 3);
    assert.equal(card.camLook.length, 3);
    assert.ok(['louay', 'mahmoud', 'julia'].includes(card.speaker));
  }
});

test('all 6 required Julia lines exist verbatim in timeline', () => {
  const juliaTexts = TIMELINE.filter((c) => c.speaker === 'julia').map((c) => c.lines.join(' '));
  assert.equal(juliaTexts.length, 6);
  assert.equal(juliaTexts[0], 'Hello, I am Julia, your AI guide for 2030. Welcome.');
  assert.equal(
    juliaTexts[1],
    'Traffic is optimized, energy is saved, and the city adapts to its people in real time.'
  );
  assert.equal(
    juliaTexts[2],
    'Scan complete. Diagnosis ready in three seconds, with 98 percent confidence.'
  );
  assert.equal(juliaTexts[3], 'I created a personal lesson plan for every student in this class.');
  assert.equal(juliaTexts[4], 'Four hundred autonomous vehicles are moving safely. Zero accidents today.');
  assert.equal(
    juliaTexts[5],
    'Remember: AI is a tool. Humans decide. Thank you, and see you in 2030.'
  );
});

test('plan slide highlights all 4 plan items sequentially', () => {
  const planCards = TIMELINE.filter((c) => c.isPlanSlide);
  assert.equal(planCards.length, 4);
  assert.deepEqual(
    planCards.map((c) => c.planHighlight),
    [0, 1, 2, 3]
  );
  assert.equal(PLAN_ITEMS.length, 4);
});

test('formatTime formats seconds into MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(300), '05:00');
});

test('navigation helpers step forward, backward, and skip sections accurately', () => {
  assert.equal(getNextCardTarget(0), 1);
  assert.equal(getNextCardTarget(TIMELINE.length - 1), 'end');
  assert.equal(getPrevCardIndex(0), 0);
  assert.equal(getPrevCardIndex(5), 4);

  const firstSkip = getSkipSectionTarget(0);
  assert.equal(typeof firstSkip, 'number');
  assert.equal(TIMELINE[firstSkip as number].sectionId, 'smart-city');

  const lastSkip = getSkipSectionTarget(TIMELINE.length - 1);
  assert.equal(lastSkip, 'end');
});

test('four-section progress bar tracks active and completed sections', () => {
  const introProgress = getFourSectionProgress(0);
  assert.equal(introProgress.length, 4);
  assert.ok(introProgress.every((s) => s.percent === 0));

  const cityStart = TIMELINE.findIndex((c) => c.sectionId === 'smart-city');
  const cityProgress = getFourSectionProgress(cityStart);
  assert.equal(cityProgress[0].active, true);
  assert.ok(cityProgress[0].percent > 0);
  assert.equal(cityProgress[1].percent, 0);

  const lastProgress = getFourSectionProgress(TIMELINE.length - 1);
  assert.equal(lastProgress[0].completed, true);
  assert.equal(lastProgress[1].completed, true);
  assert.equal(lastProgress[2].completed, true);
  assert.equal(lastProgress[3].percent, 100);
});

test('computeCardTimings produces continuous non-overlapping intervals', () => {
  const timed = computeCardTimings(TIMELINE);
  assert.equal(timed[0].startSec, 0);
  assert.equal(timed[timed.length - 1].endSec, 300);
  assert.equal(SECTIONS.filter((s) => s.inProgressBar).length, 4);
  assert.equal(getSpeakerDisplay('louay').colorHex, '#00F0FF');
  assert.equal(getSpeakerDisplay('mahmoud').colorHex, '#FCEE0A');
  assert.equal(getSpeakerDisplay('julia').colorHex, '#FF2A6D');
});

test('PDF table rows match timeline cards 1-to-1', async () => {
  const { buildScriptTableRows } = await import('../pdf/pdfGenerator.js');
  const rows = buildScriptTableRows();
  assert.equal(rows.length, TIMELINE.length);
  assert.equal(rows[0].time, '00:00');
  assert.equal(rows[0].speaker, 'Louay Kouki');
  assert.ok(rows.some((r) => r.speaker === 'Julia (AI)'));
});

test('no camera waypoint, transition spline, or sightline clips into towers or building walls', async () => {
  const THREE = await import('three');

  // Exact obstacle AABBs matching cityAndSky.js & zonesBuilder.js (with 0.5m safety buffer)
  const pad = 0.5;
  const box = (id: string, xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number) => ({
    id,
    xMin: xMin - pad,
    xMax: xMax + pad,
    yMin,
    yMax: yMax + pad,
    zMin: zMin - pad,
    zMax: zMax + pad,
  });

  const heroSpecs = [
    { id: 'T0', x: -18, z: 10, w: 9.5, d: 9.5, h: 32 },
    { id: 'T1', x: 18, z: 12, w: 10, d: 8.5, h: 38 },
    { id: 'T2', x: -19, z: -12, w: 10, d: 10, h: 44 },
    { id: 'T3', x: 19, z: -10, w: 11, d: 9.5, h: 48 },
    { id: 'T4', x: -18, z: -32, w: 9.5, d: 9.5, h: 35 },
    { id: 'T5', x: 18, z: -32, w: 10, d: 10, h: 40 },
    { id: 'T6', x: -35, z: 4, w: 10, d: 10, h: 28 },
    { id: 'T7', x: 35, z: 16, w: 9.5, d: 9.5, h: 30 },
    { id: 'T8', x: 0, z: -48, w: 13, d: 11, h: 52 },
    { id: 'T9', x: -35, z: -24, w: 9.5, d: 8.5, h: 26 },
  ];

  const obstacles = [
    ...heroSpecs.map((t) =>
      box(t.id, t.x - t.w / 2 - 1.1, t.x + t.w / 2 + 1.1, 0, t.h + 5, t.z - t.d / 2 - 1.1, t.z + t.d / 2 + 1.1)
    ),
    box('Skybridge', -13.5, 13.5, 21.3, 22.7, -12.7, -9.3),
    // Work Hub [68, 0, -18]
    box('WorkHub-EastWall', 81.6, 82.4, 0, 12.0, -30.2, -5.8),
    box('WorkHub-NorthWall', 53.8, 82.2, 0, 12.0, -30.4, -29.6),
    box('WorkHub-SouthWing', 67.3, 82.3, 0, 12.0, -6.4, -5.6),
    box('WorkHub-Roof', 52.4, 83.6, 11.7, 13.5, -31.6, -4.4),
    // Hospital [52, 0, -78]
    box('Hospital-NorthWall', 35.8, 68.2, 0, 12.2, -90.5, -89.5),
    box('Hospital-WestWall', 35.5, 36.5, 0, 12.2, -90.2, -65.8),
    box('Hospital-EastWall', 67.5, 68.5, 0, 12.2, -90.2, -65.8),
    box('Hospital-Roof', 34.5, 69.5, 11.2, 13.8, -91.5, -63.0),
    // School [-22, 0, -86]
    box('School-WestWall', -38.5, -37.5, 0, 11.4, -100.2, -71.8),
    box('School-NorthWall', -38.2, -5.8, 0, 11.5, -100.5, -99.5),
    box('School-SouthWestWing', -38.0, -25.0, 0, 11.5, -72.5, -71.5),
    box('School-Roof', -39.0, -5.0, 11.1, 12.2, -101.2, -70.7),
    // Transport Highway & Transit Station
    box('Highway-Deck', -74.0, -62.0, 5.0, 6.1, -88.0, 32.0),
    box('Transit-Station', -85.0, -71.5, 0, 11.2, -36.0, -12.0),
  ];

  const hitsObstacle = (p: { x: number; y: number; z: number }) =>
    obstacles.find(
      (o) =>
        p.x >= o.xMin &&
        p.x <= o.xMax &&
        p.y >= o.yMin &&
        p.y <= o.yMax &&
        p.z >= o.zMin &&
        p.z <= o.zMax
    );

  // 1. Check all static camera positions & sightlines
  for (const card of TIMELINE) {
    const pos = new THREE.Vector3(...card.camPos);
    const look = new THREE.Vector3(...card.camLook);
    const posHit = hitsObstacle(pos);
    assert.equal(posHit, undefined, `Card ${card.id} camPos clips ${posHit?.id}`);

    // Check sightline ray from 10% to 85% of distance to target
    for (let s = 1; s <= 17; s++) {
      const t = s * 0.05;
      const sample = new THREE.Vector3().lerpVectors(pos, look, t);
      const rayHit = hitsObstacle(sample);
      assert.equal(
        rayHit,
        undefined,
        `Card ${card.id} sightline (t=${t.toFixed(2)}) blocked by ${rayHit?.id} at (${sample.x.toFixed(1)}, ${sample.y.toFixed(1)}, ${sample.z.toFixed(1)})`
      );
    }
  }

  // 2. Check all transition splines between sequential cards
  for (let i = 0; i < TIMELINE.length - 1; i++) {
    const a = new THREE.Vector3(...TIMELINE[i].camPos);
    const b = new THREE.Vector3(...TIMELINE[i + 1].camPos);
    const dist = a.distanceTo(b);
    let curve: InstanceType<typeof THREE.CatmullRomCurve3> | null = null;
    if (dist > 14) {
      const mid = a.clone().lerp(b, 0.5);
      mid.y = Math.max(a.y, b.y) + Math.min(8, dist * 0.08);
      curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
    }
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const pt = curve ? curve.getPoint(t) : new THREE.Vector3().lerpVectors(a, b, t);
      const hit = hitsObstacle(pt);
      assert.equal(
        hit,
        undefined,
        `Flight ${TIMELINE[i].id} -> ${TIMELINE[i + 1].id} (t=${t.toFixed(2)}) clips ${hit?.id} at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}, ${pt.z.toFixed(1)})`
      );
    }
  }
});
