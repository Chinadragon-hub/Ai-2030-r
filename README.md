# AI in 2030 — 3D Cinematic Presentation

A 5-minute interactive 3D presentation built with **Three.js**, **Vite**, and **Vanilla JS**, designed for live presentation by **Louay Kouki** and **Mahmoud Dammek** with AI guide **Julia**.

## Features

- **Continuous Flying Camera** through one connected 3D world (*The Smart City of 2030*):
  1. Space Orbit Satellites & Smart City 2030 Skyline
  2. AI Work & Robotics Hub
  3. AI Hospital with Patient, Doctor & Hologram Scan
  4. Futuristic School & Holographic Classroom with Students & Teacher
  5. Autonomous Transport Highway & Smart Transit Station
  6. Sunset Skyline with AI Risks Plaza (Surveillance, Deepfakes, Bias, Privacy Leaks & Automation)
- **Live Presenters Mode & Auto Mode**: Camera and teleprompter wait for `Next` / `ArrowRight` by default, or advance automatically across the 300-second timeline in Auto Mode.
- **Audience-Visible Teleprompter**: High-contrast dark glass bottom card with `Orbitron` titles and `Rajdhani` (`32px`) text, speaker tags, cue lines, and `H` to hide/show.
- **Julia AI Voice & Orb**: Free browser Web Speech API female English voice (no paid APIs) paired with a glowing cyan/magenta orb and live sound-wave rings.
- **Procedural Web Audio Cues**: Synthesized button clicks, camera transition whooshes, and Julia chimes (no external audio files, no background music).
- **PDF Rehearsal Script**: Generated directly from `src/data/timeline.js` via `jsPDF`, available both in-browser (`Download PDF Script`) and via `npm run make-pdf` (`/public/AI-2030-script.pdf`).

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge.

### Generate Static PDF Script

```bash
npm run make-pdf
```

This creates `/public/AI-2030-script.pdf`.

## Push to GitHub & Deploy on Vercel (Free Plan)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "AI in 2030 3D presentation"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. Open [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Confirm Framework Preset is **Vite**, Build Command is `npm run build`, and Output Directory is `dist`.
5. Click **Deploy** (zero environment variables or API keys required).

## Editing the Timeline

All scenes, camera waypoints, speaker assignments, lines, and durations live in one file:
`src/data/timeline.js`
