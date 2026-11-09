'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type * as THREE_NS from 'three';
import { RotationControl } from '@/components/configurator/RotationControl';
import type { Material } from '@/lib/configurator/patterns';

export interface ViewerSelection {
  designId: string;
  /** Uploaded tintable pattern; null draws the design's built-in pattern. */
  patternUrl: string | null;
  sareeHex: string;
  material: Material;
  jacketHex: string;
  /** Jacket swatch photograph to tile; null uses the plain colour. */
  jacketTextureUrl: string | null;
  drape: 'saree' | 'osariya';
}

export interface ConfiguratorViewerProps {
  selection: ViewerSelection;
  /** A real .glb model once one exists (docs/4-architecture.md §5.0); null uses the built-in figure. */
  modelUrl: string | null;
  /** Describes the current selection as a rendered approximation (screen readers). */
  label: string;
  loadingLabel: string;
  rotateLeftLabel: string;
  rotateRightLabel: string;
  /** No WebGL, or the renderer failed: the page swaps to the static fallback (§5.4). */
  onFailure: () => void;
}

// Interaction feel, not design tokens: radians of turn per pixel dragged and per key or button press.
const TURN_PER_PIXEL = 0.012;
const TURN_PER_STEP = Math.PI / 8;
const MODEL_HEIGHT = 1.7;

type Part = 'saree' | 'skirt' | 'pallu' | 'jacket' | 'frill';

interface Engine {
  three: typeof THREE_NS;
  renderer: THREE_NS.WebGLRenderer;
  scene: THREE_NS.Scene;
  camera: THREE_NS.PerspectiveCamera;
  model: THREE_NS.Object3D;
  materials: Record<Part, THREE_NS.MeshPhysicalMaterial>;
  /** Meshes shown only for one drape. */
  drapeOnly: { mesh: THREE_NS.Object3D; drape: 'saree' | 'osariya' }[];
  textures: THREE_NS.Texture[];
  render: () => void;
  dispose: () => void;
}

/** Which garment part a mesh is, from its name or its parents' names (the .glb naming rule). */
function classify(object: THREE_NS.Object3D): { part: Part | null; drape: 'saree' | 'osariya' | null } {
  const names: string[] = [];
  for (let o: THREE_NS.Object3D | null = object; o; o = o.parent) names.push(o.name.toLowerCase());
  const name = names.join(' ');
  const part: Part | null = /pallu/.test(name)
    ? 'pallu'
    : /frill/.test(name)
      ? 'frill'
      : /jacket|blouse/.test(name)
        ? 'jacket'
        : /skirt/.test(name)
          ? 'skirt'
          : /saree/.test(name)
            ? 'saree'
            : null;
  const drape = /_osariya\b|osariya/.test(name) ? 'osariya' : /_saree\b/.test(name) ? 'saree' : null;
  return { part, drape };
}

const imageCache = new Map<string, Promise<ImageBitmap | null>>();
/** Loads an image for painting; null if it can't be read (e.g. no CORS), so the built-in look is used. */
function loadImage(url: string | null): Promise<ImageBitmap | null> {
  if (!url) return Promise.resolve(null);
  let pending = imageCache.get(url);
  if (!pending) {
    pending = fetch(url, { mode: 'cors' })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => createImageBitmap(blob))
      .catch(() => null);
    imageCache.set(url, pending);
  }
  return pending;
}

/**
 * The 3D preview (docs/4-architecture.md §5.0; docs/3-components.md §4.1).
 * Draws only when something changes. Rotation is by hand only, one-to-one
 * with input, never auto-played (UX-C8).
 */
export function ConfiguratorViewer({
  selection,
  modelUrl,
  label,
  loadingLabel,
  rotateLeftLabel,
  rotateRightLabel,
  onFailure,
}: ConfiguratorViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const selectionRef = useRef(selection);
  const failRef = useRef(onFailure);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selectionRef.current = selection;
    failRef.current = onFailure;
  });

  // ── Set up once ──
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      try {
        const THREE = await import('three');
        const { buildMannequin } = await import('@/lib/configurator/mannequin');
        const { cssVar } = await import('@/lib/configurator/patterns');
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        // Neutral tone mapping keeps fabric colours closest to their catalogue values.
        renderer.toneMapping = THREE.NeutralToneMapping;
        const canvas = renderer.domElement;
        canvas.className = 'configurator-viewer-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.insertBefore(canvas, container.firstChild);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 4 / 5, 0.1, 20);
        camera.position.set(0, 0.95, 4.1);
        camera.lookAt(0, 0.86, 0);

        // Soft daylight from the tokens' neutrals: no colour cast on the cloth.
        const light = cssVar('--lun-surface');
        scene.add(new THREE.HemisphereLight(light, cssVar('--lun-line'), 1.5));
        const key = new THREE.DirectionalLight(light, 2.1);
        key.position.set(1.6, 2.6, 2.6);
        const fill = new THREE.DirectionalLight(light, 0.7);
        fill.position.set(-2.2, 1.4, 1.2);
        const rim = new THREE.DirectionalLight(light, 0.6);
        rim.position.set(0, 2.2, -3);
        scene.add(key, fill, rim);

        const cloth = (): THREE_NS.MeshPhysicalMaterial =>
          new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, roughness: 0.9 });
        const materials: Record<Part, THREE_NS.MeshPhysicalMaterial> = {
          saree: cloth(),
          skirt: cloth(),
          pallu: cloth(),
          frill: cloth(),
          jacket: cloth(),
        };

        // A real model if one is configured, else the built-in figure.
        let model: THREE_NS.Object3D | null = null;
        if (modelUrl) {
          try {
            const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
            const gltf = await new GLTFLoader().loadAsync(modelUrl);
            model = gltf.scene;
            // Fit any model to the same height, standing on the floor, centred.
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const scale = size.y > 0 ? MODEL_HEIGHT / size.y : 1;
            model.scale.setScalar(scale);
            const fitted = new THREE.Box3().setFromObject(model);
            const centre = fitted.getCenter(new THREE.Vector3());
            model.position.set(-centre.x, -fitted.min.y, -centre.z);
            const holder = new THREE.Group();
            holder.add(model);
            model = holder;
          } catch {
            model = null; // fall back to the built-in figure rather than fail
          }
        }
        if (!model) {
          const body = new THREE.MeshStandardMaterial({ color: new THREE.Color(cssVar('--lun-line')), roughness: 0.75 });
          model = buildMannequin(body).root;
        }
        if (cancelled) {
          renderer.dispose();
          return;
        }

        const drapeOnly: Engine['drapeOnly'] = [];
        model.traverse((object) => {
          if (!(object as THREE_NS.Mesh).isMesh) return;
          const { part, drape } = classify(object);
          if (part) (object as THREE_NS.Mesh).material = materials[part];
          if (drape) drapeOnly.push({ mesh: object, drape });
        });
        scene.add(model);

        let frame = 0;
        const render = () => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            renderer.render(scene, camera);
          });
        };

        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          if (width === 0 || height === 0) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          render();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);

        const lost = (event: Event) => {
          event.preventDefault();
          failRef.current();
        };
        canvas.addEventListener('webglcontextlost', lost);

        const engine: Engine = {
          three: THREE,
          renderer,
          scene,
          camera,
          model,
          materials,
          drapeOnly,
          textures: [],
          render,
          dispose: () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            canvas.removeEventListener('webglcontextlost', lost);
            engine.textures.forEach((t) => t.dispose());
            Object.values(materials).forEach((m) => m.dispose());
            scene.traverse((o) => (o as THREE_NS.Mesh).geometry?.dispose());
            renderer.dispose();
            canvas.remove();
          },
        };
        engineRef.current = engine;
        resize();
        await paint(engine, selectionRef.current);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) failRef.current();
      }
    })();

    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [modelUrl]);

  // ── Repaint on every selection change ──
  const { designId, patternUrl, sareeHex, material, jacketHex, jacketTextureUrl, drape } = selection;
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !ready) return;
    void paint(engine, { designId, patternUrl, sareeHex, material, jacketHex, jacketTextureUrl, drape }).catch(() => failRef.current());
  }, [ready, designId, patternUrl, sareeHex, material, jacketHex, jacketTextureUrl, drape]);

  function turn(by: number) {
    const engine = engineRef.current;
    if (!engine) return;
    engine.model.rotation.y += by;
    engine.render();
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const engine = engineRef.current;
    if (!engine || (event.target as HTMLElement).closest('button')) return;
    drag.current = { x: event.clientX, start: engine.model.rotation.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const engine = engineRef.current;
    if (!engine || !drag.current) return;
    engine.model.rotation.y = drag.current.start + (event.clientX - drag.current.x) * TURN_PER_PIXEL;
    engine.render();
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      turn(-TURN_PER_STEP);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      turn(TURN_PER_STEP);
    }
  }

  return (
    <div
      ref={containerRef}
      className="preview-canvas configurator-viewer"
      role="img"
      aria-label={label}
      tabIndex={0}
      aria-busy={!ready}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {!ready && (
        <p className="configurator-viewer-loading" role="status">
          {loadingLabel}
        </p>
      )}
      <RotationControl
        onRotateLeft={() => turn(-TURN_PER_STEP)}
        onRotateRight={() => turn(TURN_PER_STEP)}
        rotateLeftLabel={rotateLeftLabel}
        rotateRightLabel={rotateRightLabel}
      />
    </div>
  );
}

/** Paints the selection onto the garment materials and shows the selected drape. */
async function paint(engine: Engine, selection: ViewerSelection): Promise<void> {
  const { three: THREE, materials, renderer } = engine;
  const { drawFabric, drawJacket, sheenOf } = await import('@/lib/configurator/patterns');
  const [pattern, jacketPhoto] = await Promise.all([loadImage(selection.patternUrl), loadImage(selection.jacketTextureUrl)]);

  const texture = (canvas: HTMLCanvasElement, repeat = 1) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(repeat, 1);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const common = { designId: selection.designId, colourHex: selection.sareeHex, material: selection.material, pattern };
  const body = texture(drawFabric({ ...common, part: 'body' }));
  const pallu = texture(drawFabric({ ...common, part: 'pallu' }));
  const column = texture(drawFabric({ ...common, part: 'column' }));
  const jacketTexture = texture(drawJacket(selection.jacketHex, jacketPhoto), 3);
  jacketTexture.wrapT = THREE.RepeatWrapping;
  jacketTexture.repeat.set(3, 3);

  // Plain: matte, open weave. Super: finer weave with a soft sheen (PRD: the upgrade must be visible).
  const isSuper = selection.material === 'super';
  const sheen = new THREE.Color(sheenOf(selection.sareeHex));
  for (const [material, map] of [
    [materials.saree, body],
    [materials.skirt, column],
    [materials.frill, body],
    [materials.pallu, pallu],
  ] as const) {
    material.map = map;
    material.roughness = isSuper ? 0.74 : 0.93;
    material.sheen = isSuper ? 0.85 : 0.25;
    material.sheenRoughness = isSuper ? 0.42 : 0.8;
    material.sheenColor = sheen;
    material.needsUpdate = true;
  }
  materials.jacket.map = jacketTexture;
  materials.jacket.roughness = 0.8;
  materials.jacket.sheen = 0.4;
  materials.jacket.sheenColor = new THREE.Color(sheenOf(selection.jacketHex));
  materials.jacket.needsUpdate = true;

  for (const { mesh, drape } of engine.drapeOnly) mesh.visible = drape === selection.drape;

  engine.textures.forEach((t) => t.dispose());
  engine.textures = [body, pallu, column, jacketTexture];
  engine.render();
}
