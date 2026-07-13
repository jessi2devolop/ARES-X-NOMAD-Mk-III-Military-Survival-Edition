# ARES-X NOMAD 3D Website

Interactive 3D vehicle showcase made with Node.js, Express and Three.js.

## Run

```bash
npm install
npm start
```

The browser opens automatically at:

```text
http://localhost:3000
```

For a VPS or server where a browser should not open:

```bash
NO_OPEN=1 HOST=0.0.0.0 PORT=3000 npm start
```

Then allow port 3000 in your firewall and open:

```text
http://YOUR_SERVER_IP:3000
```

## Included controls

- 360-degree rotate, zoom and pan
- Diesel, silent EV, amphibious and night modes
- Open side doors
- Deploy solar panels
- Launch reconnaissance drone
- Automatic cinematic rotation
- Responsive HUD-style interface

## Note

The vehicle is a procedural Three.js concept model. Replace it later with a detailed `.glb` model for a production-quality mesh.
