# ARES-X NOMAD Mk III — Realistic 3D Showcase

A cinematic browser-based concept showcase for the fictional ARES-X NOMAD Mk III hybrid survival vehicle.

## Improvements in v2

- PBR-style metal, glass, rubber, solar-panel and ground materials
- Sloped layered armor and detailed 6×6 wheels
- Procedural dirt texture, rocks, trees and mountain environment
- Cinematic sky, fog, soft shadows, ACES tone mapping and bloom
- Animated doors, solar wings and reconnaissance drone
- Diesel Hybrid, Silent EV, Amphibious and Night Operations modes
- Responsive military HUD interface

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## VPS

```bash
NO_OPEN=1 HOST=0.0.0.0 PORT=3000 npm start
```

Allow TCP port 3000 in your firewall, then open `http://YOUR_SERVER_IP:3000`.

## Important

This version uses a detailed procedural Three.js model, so it is significantly more realistic than the first prototype without requiring a separate `.glb` asset. A professionally sculpted and textured GLB model can later replace the procedural vehicle for true film/game-quality geometry.
