import * as THREE from 'three';

/**
 * The built-in placeholder model for the 3D preview (docs/4-architecture.md
 * §5.0): a stylised dress form wearing a saree, pallu and jacket, built from
 * code so the preview works before a real model exists. Its garment parts
 * use the same names a real .glb must use, so the viewer treats both alike:
 *
 *   Saree          pleated body of the saree
 *   Pallu_saree    pallu over the left shoulder, falling at the back
 *   Pallu_osariya  Kandyan Osariya: pallu over the left shoulder, falling in front
 *   Frill_osariya  Kandyan Osariya waist frill
 *   Jacket         the jacket (shown made up; it ships as unstitched material)
 *
 * Units are metres, y up, the figure faces +z.
 */

const Z_SCALE = 0.72; // bodies are wider than they are deep

/** Torso radius (before Z_SCALE) at height y: the garments keep clear of it. */
const TORSO: [number, number][] = [
  [0.13, 0.98],
  [0.135, 1.08],
  [0.15, 1.2],
  [0.156, 1.26],
  [0.15, 1.33],
  [0.158, 1.38],
  [0.12, 1.43],
  [0.05, 1.46],
];

function torsoRadius(y: number): number {
  if (y <= TORSO[0]![1]) return 0.14;
  for (let i = 1; i < TORSO.length; i += 1) {
    const [r1, y1] = TORSO[i]!;
    const [r0, y0] = TORSO[i - 1]!;
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0.05;
}

function lathe(profile: [number, number][], segments: number, scale = 1): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r * scale, y)),
    segments,
  );
}

/** A ring-built surface: radius(t, theta) for t in 0..1 from top to bottom. */
function flaredSurface(
  top: number,
  bottom: number,
  radius: (t: number, theta: number) => number,
  { rings = 48, segments = 128, zScale = Z_SCALE, uRepeat = 1 } = {},
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i += 1) {
    const t = i / rings;
    const y = top + (bottom - top) * t;
    for (let j = 0; j <= segments; j += 1) {
      const u = j / segments;
      const theta = u * Math.PI * 2;
      const r = radius(t, theta);
      positions.push(Math.sin(theta) * r, y, Math.cos(theta) * r * zScale);
      // v = 0 at the hem (bottom), 1 at the top: the fabric texture's border sits at v = 0.
      uvs.push(u * uRepeat, 1 - t);
    }
  }
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A flat strip of cloth along a path, kept clear of the body. */
function ribbon(points: THREE.Vector3[], width: number, steps = 120): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= steps; i += 1) {
    const v = i / steps;
    const p = curve.getPointAt(v);
    const tangent = curve.getTangentAt(v);
    const outward = new THREE.Vector3(p.x, 0, p.z / Z_SCALE).normalize();
    let side = new THREE.Vector3().crossVectors(tangent, outward).normalize();
    if (side.lengthSq() < 1e-6) side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    for (const s of [-0.5, 0.5]) {
      const q = p.clone().addScaledVector(side, s * width);
      // Push outwards until clear of the torso (in the body's own, un-squashed space).
      const flat = Math.hypot(q.x, q.z / Z_SCALE);
      const clear = torsoRadius(q.y) + 0.022;
      if (flat < clear && flat > 1e-6) {
        const k = clear / flat;
        q.x *= k;
        q.z *= k;
      }
      positions.push(q.x, q.y, q.z);
      uvs.push(s + 0.5, v);
    }
  }
  for (let i = 0; i < steps; i += 1) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function limb(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material): THREE.Mesh {
  const length = from.distanceTo(to);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 6, 16), material);
  mesh.position.copy(from).lerp(to, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return mesh;
}

function sleeve(from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material): THREE.Mesh {
  const dir = to.clone().sub(from).normalize();
  const length = 0.15;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, length, 24, 1, true), material);
  mesh.position.copy(from).addScaledVector(dir, length / 2 + 0.01);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return mesh;
}

export interface Mannequin {
  root: THREE.Group;
}

/**
 * Builds the placeholder figure. `bodyMaterial` dresses the form; garment
 * parts get a neutral material the viewer replaces with the selection.
 */
export function buildMannequin(bodyMaterial: THREE.Material): Mannequin {
  const root = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide });

  const add = (mesh: THREE.Mesh, name: string) => {
    mesh.name = name;
    root.add(mesh);
    return mesh;
  };

  // ── Form ──
  const torso = add(new THREE.Mesh(lathe(TORSO, 64), bodyMaterial), 'Body_torso');
  torso.scale.z = Z_SCALE;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.1, 24), bodyMaterial), 'Body_neck').position.set(0, 1.49, 0);
  const head = add(new THREE.Mesh(new THREE.SphereGeometry(0.092, 40, 32), bodyMaterial), 'Body_head');
  head.position.set(0, 1.6, 0.005);
  head.scale.set(0.95, 1.18, 1);
  const shoulders = { left: new THREE.Vector3(-0.185, 1.395, 0), right: new THREE.Vector3(0.185, 1.395, 0) };
  const hands = { left: new THREE.Vector3(-0.235, 0.92, 0.04), right: new THREE.Vector3(0.235, 0.92, 0.04) };
  add(limb(shoulders.left, hands.left, 0.036, bodyMaterial), 'Body_arm_left');
  add(limb(shoulders.right, hands.right, 0.036, bodyMaterial), 'Body_arm_right');

  // ── Saree body: a flared, pleated skirt from waist to floor ──
  add(
    new THREE.Mesh(
      flaredSurface(
        1.0,
        0.015,
        (t, theta) => {
          const front = Math.max(0, Math.cos(theta)) ** 2;
          const pleats = (0.004 + 0.016 * t) * front * Math.sin(theta * 44);
          return 0.142 + 0.16 * t ** 1.35 + pleats;
        },
        { uRepeat: 3 },
      ),
      cloth,
    ),
    'Saree',
  );

  // ── Pallu, standard drape: across the front, over the left shoulder, falling behind ──
  add(
    new THREE.Mesh(
      ribbon(
        [
          new THREE.Vector3(0.14, 1.0, 0.1),
          new THREE.Vector3(0.07, 1.16, 0.12),
          new THREE.Vector3(-0.05, 1.3, 0.11),
          new THREE.Vector3(-0.15, 1.42, 0.02),
          new THREE.Vector3(-0.16, 1.32, -0.1),
          new THREE.Vector3(-0.13, 1.05, -0.15),
          new THREE.Vector3(-0.12, 0.62, -0.19),
        ],
        0.26,
      ),
      cloth,
    ),
    'Pallu_saree',
  );

  // ── Kandyan Osariya: waist frill, and a pallu over the left shoulder falling in front ──
  add(
    new THREE.Mesh(
      flaredSurface(1.01, 0.84, (t, theta) => 0.152 + 0.1 * t + 0.016 * t * Math.sin(theta * 22), { rings: 16, uRepeat: 4 }),
      cloth,
    ),
    'Frill_osariya',
  );
  add(
    new THREE.Mesh(
      ribbon(
        [
          new THREE.Vector3(0.13, 1.02, -0.09),
          new THREE.Vector3(0.02, 1.2, -0.12),
          new THREE.Vector3(-0.12, 1.36, -0.06),
          new THREE.Vector3(-0.16, 1.42, 0.03),
          new THREE.Vector3(-0.13, 1.28, 0.12),
          new THREE.Vector3(-0.11, 1.05, 0.15),
          new THREE.Vector3(-0.1, 0.8, 0.17),
        ],
        0.24,
      ),
      cloth,
    ),
    'Pallu_osariya',
  );

  // ── Jacket: a short fitted jacket with short sleeves ──
  const jacket = add(
    new THREE.Mesh(
      lathe(
        [
          [0.152, 1.13],
          [0.162, 1.2],
          [0.166, 1.26],
          [0.16, 1.33],
          [0.168, 1.38],
          [0.132, 1.43],
          [0.07, 1.455],
        ],
        64,
      ),
      cloth,
    ),
    'Jacket',
  );
  jacket.scale.z = Z_SCALE;
  const jacketSleeves = new THREE.Group();
  jacketSleeves.name = 'Jacket_sleeves';
  jacketSleeves.add(sleeve(shoulders.left, hands.left, cloth), sleeve(shoulders.right, hands.right, cloth));
  root.add(jacketSleeves);

  return { root };
}
