import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BIN_DEFINITIONS, BIN_ORDER, WASTE_ITEMS } from '../data/recyclingData';
import {
  BinRig,
  ConveyorRig,
  KuroRig,
  MagicPedestalRig,
  createBlackKittenMascot,
  createContactShadow,
  createEnvironment,
  createRecyclingBin,
  createTransformedTreasureModel,
  createWardrobeSpace,
  createWasteItemModel,
} from '../three/models';
import {
  GameMode,
  KuroMood,
  KuroWardrobeConfig,
  Language,
  ParkBackgroundId,
  TimeOfDayId,
  WasteCategory,
  WasteItemDefinition,
} from '../types/game';
import { soundFx } from '../utils/sound';

// Pre-allocated math helpers outside render loop (Zero GC)
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();
const _vec3 = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.35);
const _kuroDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.65);
const _planeHit = new THREE.Vector3();

interface ActiveSceneItem {
  uid: string;
  def: WasteItemDefinition;
  group: THREE.Group;
  shadow: THREE.Mesh;
  homePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  state: 'idle' | 'dragging' | 'diving' | 'returning' | 'conveyor';
  diveProgress: number;
  diveStart: THREE.Vector3;
  diveEnd: THREE.Vector3;
  diveCategory?: WasteCategory;
  wobbleTime: number;
  basePhase: number;
}

interface Particle3D {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  kind: 'confetti' | 'heart';
}

export interface InspectSelection {
  type: 'bin' | 'item';
  category: WasteCategory;
  item?: WasteItemDefinition;
}

export interface EcoWorld3DProps {
  mode: GameMode;
  lang: Language;
  waveItems: WasteItemDefinition[];
  waveKey: number;
  conveyorRunning: boolean;
  conveyorSpeed: number;
  magicItem: WasteItemDefinition;
  magicTransformed: boolean;
  kuroMood: KuroMood;
  kuroReactionNonce: number;
  kuroPatNonce: number;
  kuroTreatSignal: { colorHex: string; nonce: number } | null;
  wardrobeOpen: boolean;
  wardrobeConfig: KuroWardrobeConfig;
  timeOfDay: TimeOfDayId;
  parkBackground: ParkBackgroundId;
  zoomSignal: { delta: number; nonce: number } | null;
  resetCamNonce: number;
  onSortResult: (item: WasteItemDefinition, correct: boolean, targetBin: WasteCategory) => void;
  onConveyorMiss: (item: WasteItemDefinition) => void;
  onKuroClick: () => void;
  onKuroPat: () => void;
  onInspectSelect: (selection: InspectSelection) => void;
  onSelectedItemChange: (item: WasteItemDefinition | null) => void;
}

const DEFAULT_CAM_POS = new THREE.Vector3(0, 5.6, 10.6);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0.9, 0.3);

const BIN_POSITIONS: Record<WasteCategory, THREE.Vector3> = {
  organic: new THREE.Vector3(-3.3, 0, -1.55),
  paper: new THREE.Vector3(-1.1, 0, -1.95),
  plastic: new THREE.Vector3(1.1, 0, -1.95),
  metal_glass: new THREE.Vector3(3.3, 0, -1.55),
};

export const EcoWorld3D: React.FC<EcoWorld3DProps> = ({
  mode,
  lang,
  waveItems,
  waveKey,
  conveyorRunning,
  conveyorSpeed,
  magicItem,
  magicTransformed,
  kuroMood,
  kuroReactionNonce,
  kuroPatNonce,
  kuroTreatSignal,
  wardrobeOpen,
  wardrobeConfig,
  timeOfDay,
  parkBackground,
  zoomSignal,
  resetCamNonce,
  onSortResult,
  onConveyorMiss,
  onKuroClick,
  onKuroPat,
  onInspectSelect,
  onSelectedItemChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<{ text: string; x: number; y: number } | null>(null);

  // Latest props stored in refs so WebGL mount runs once without resetting camera/scene
  const callbacksRef = useRef({
    onSortResult,
    onConveyorMiss,
    onKuroClick,
    onKuroPat,
    onInspectSelect,
    onSelectedItemChange,
  });
  callbacksRef.current = {
    onSortResult,
    onConveyorMiss,
    onKuroClick,
    onKuroPat,
    onInspectSelect,
    onSelectedItemChange,
  };

  const stateRef = useRef({
    mode,
    lang,
    conveyorRunning,
    conveyorSpeed,
    kuroMood,
    kuroReactionNonce,
    magicTransformed,
    wardrobeOpen,
    timeOfDay,
    parkBackground,
  });
  stateRef.current = {
    mode,
    lang,
    conveyorRunning,
    conveyorSpeed,
    kuroMood,
    kuroReactionNonce,
    magicTransformed,
    wardrobeOpen,
    timeOfDay,
    parkBackground,
  };

  // Scene bridge methods updated during mount
  const bridgeRef = useRef<{
    rebuildSortItems: (items: WasteItemDefinition[]) => void;
    setupConveyorMode: () => void;
    setupExploreMode: () => void;
    setupMagicItem: (item: WasteItemDefinition, transformed: boolean) => void;
    updateLanguage: (newLang: Language) => void;
    applyZoom: (delta: number) => void;
    resetCamera: () => void;
    triggerKuroHappy: () => void;
    triggerKuroSad: () => void;
    triggerKuroPat: () => void;
    triggerKuroTreat: (accentHex: string) => void;
    applySceneTheme: (bg: ParkBackgroundId, tod: TimeOfDayId) => void;
    syncModeProps: (nextMode: GameMode) => void;
    setWardrobeView: (open: boolean, currentMode: GameMode) => void;
    applyKuroWardrobe: (cfg: KuroWardrobeConfig, bounce: boolean) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => setContextLost(false);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // 2. Scene, Camera, Environment Map
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe8ff);
    scene.fog = new THREE.Fog(0xbfe8ff, 26, 68);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 140);
    camera.position.copy(DEFAULT_CAM_POS);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_CAM_TARGET);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.6;
    controls.maxDistance = 21.0;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.rotateSpeed = 0.9;
    controls.enablePan = true;

    // Smooth camera preset / zoom target tracking
    let camAnimActive = false;
    const desiredCamPos = DEFAULT_CAM_POS.clone();
    const desiredCamTarget = DEFAULT_CAM_TARGET.clone();

    controls.addEventListener('start', () => {
      camAnimActive = false;
    });

    // 3. Three-Point Warm/Cool Lighting Rig (<= 3 shadow casters)
    const hemiLight = new THREE.HemisphereLight(0xcbeeff, 0x4ade80, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.15);
    keyLight.position.set(7.5, 13.5, 8.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 36;
    const d = 10.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.75);
    rimLight.position.set(-8, 6, -9);
    scene.add(rimLight);

    // 4. Environment, Bins, Kuro Mascot
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const env = createEnvironment(stateRef.current.lang, maxAnisotropy);
    scene.add(env.envGroup);
    const conveyorRig: ConveyorRig = env.conveyor;
    const pedestalRig: MagicPedestalRig = env.pedestal;

    const bins: Record<WasteCategory, BinRig> = {} as Record<WasteCategory, BinRig>;
    BIN_ORDER.forEach((cat) => {
      const rig = createRecyclingBin(cat, stateRef.current.lang, maxAnisotropy);
      rig.group.position.copy(BIN_POSITIONS[cat]);
      rig.group.lookAt(0, 0, 4.5);
      scene.add(rig.group);
      bins[cat] = rig;
    });

    const kuro: KuroRig = createBlackKittenMascot();
    kuro.group.position.set(-4.35, 0, 0.65);
    kuro.group.rotation.y = 0.55;
    kuro.applyWardrobe(wardrobeConfig);
    scene.add(kuro.group);

    const wardrobeSpace = createWardrobeSpace();
    wardrobeSpace.position.set(0, 0, 0.2);
    scene.add(wardrobeSpace);

    const savedKuroParkPos = new THREE.Vector3(-4.35, 0, 0.65);
    const desiredKuroPos = savedKuroParkPos.clone();
    let desiredKuroRotY = 0.55;

    // Dynamic Item & Particle Containers
    const itemsLayer = new THREE.Group();
    scene.add(itemsLayer);
    const particlesLayer = new THREE.Group();
    scene.add(particlesLayer);

    let activeItems: ActiveSceneItem[] = [];
    const particles: Particle3D[] = [];
    const sharedParticleGeo = new THREE.OctahedronGeometry(0.11, 0);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.03);
    heartShape.bezierCurveTo(0, 0.06, -0.05, 0.08, -0.08, 0.05);
    heartShape.bezierCurveTo(-0.11, 0.02, -0.09, -0.04, 0, -0.09);
    heartShape.bezierCurveTo(0.09, -0.04, 0.11, 0.02, 0.08, 0.05);
    heartShape.bezierCurveTo(0.05, 0.08, 0, 0.06, 0, 0.03);
    const sharedHeartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    sharedHeartGeo.center();

    let draggingItem: ActiveSceneItem | null = null;
    let draggingKuro = false;
    let kuroDragDownPos = { x: 0, y: 0 };
    let kuroDragMoved = false;
    let selectedUid: string | null = null;
    let hoveredBin: WasteCategory | null = null;
    let hoveredUid: string | null = null;
    let dragPointerDownPos = { x: 0, y: 0 };
    let dragMoved = false;

    let kuroJumpTimer = 0;
    let kuroSadShakeTimer = 0;
    let kuroPurrTimer = 0;
    let kuroBlinkTimer = 2.4;
    const IDLE_SUBMOODS = ['curious', 'playful', 'wink', 'alert', 'sleepy'] as const;
    let kuroIdleIndex = 0;
    let kuroIdleCycleTimer = 3.6;
    let conveyorSpawnTimer = 0.4;
    let conveyorSeq = 0;

    function spawnParticles(origin: THREE.Vector3, hexColor: string, count = 20) {
      const baseColor = new THREE.Color(hexColor);
      for (let i = 0; i < count; i++) {
        const c = baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.18, 0.1, 0.12);
        const mat = new THREE.MeshStandardMaterial({
          color: c,
          emissive: c,
          emissiveIntensity: 0.35,
          roughness: 0.3,
        });
        const mesh = new THREE.Mesh(sharedParticleGeo, mat);
        mesh.position.copy(origin);
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 2.8;
        const vel = new THREE.Vector3(
          Math.cos(angle) * speed,
          3.2 + Math.random() * 3.0,
          Math.sin(angle) * speed
        );
        particlesLayer.add(mesh);
        particles.push({ mesh, vel, life: 0, maxLife: 0.75 + Math.random() * 0.35, kind: 'confetti' });
      }
    }

    function spawnHearts(origin: THREE.Vector3, count = 7, tintHex = '#fb7185') {
      const baseColor = new THREE.Color(tintHex);
      for (let i = 0; i < count; i++) {
        const c = baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.05, 0.05, (Math.random() - 0.5) * 0.1);
        const mat = new THREE.MeshStandardMaterial({
          color: c,
          emissive: c,
          emissiveIntensity: 0.45,
          roughness: 0.25,
        });
        const mesh = new THREE.Mesh(sharedHeartGeo, mat);
        mesh.position.set(
          origin.x + (Math.random() - 0.5) * 0.65,
          origin.y + Math.random() * 0.25,
          origin.z + (Math.random() - 0.5) * 0.5
        );
        mesh.scale.setScalar(1.3 + Math.random() * 0.5);
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 0.75,
          1.25 + Math.random() * 0.85,
          (Math.random() - 0.5) * 0.55
        );
        particlesLayer.add(mesh);
        particles.push({ mesh, vel, life: 0, maxLife: 1.05 + Math.random() * 0.35, kind: 'heart' });
      }
    }

    function applySceneTheme(bg: ParkBackgroundId, tod: TimeOfDayId) {
      env.applyTheme(bg, tod);
      if (tod === 'afternoon') {
        scene.background = new THREE.Color(0x93d5ff);
        (scene.fog as THREE.Fog).color.setHex(0x93d5ff);
        hemiLight.color.setHex(0xe0f2fe);
        hemiLight.groundColor.setHex(0x4ade80);
        hemiLight.intensity = 1.05;
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 2.35;
        keyLight.position.set(4.5, 16, 6.5);
        rimLight.color.setHex(0xe0f2fe);
        rimLight.intensity = 0.8;
      } else if (tod === 'sunset') {
        scene.background = new THREE.Color(0xfdba74);
        (scene.fog as THREE.Fog).color.setHex(0xfdba74);
        hemiLight.color.setHex(0xfde68a);
        hemiLight.groundColor.setHex(0x9a3412);
        hemiLight.intensity = 0.92;
        keyLight.color.setHex(0xff9e5e);
        keyLight.intensity = 1.95;
        keyLight.position.set(-10.5, 7.2, 6.5);
        rimLight.color.setHex(0xf9a8d4);
        rimLight.intensity = 0.85;
      } else if (tod === 'night') {
        scene.background = new THREE.Color(0x0f172a);
        (scene.fog as THREE.Fog).color.setHex(0x0f172a);
        hemiLight.color.setHex(0x64748b);
        hemiLight.groundColor.setHex(0x1e293b);
        hemiLight.intensity = 0.82;
        keyLight.color.setHex(0xbae6fd);
        keyLight.intensity = 1.15;
        keyLight.position.set(6.5, 13, 8.0);
        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 0.95;
      } else {
        // morning default
        scene.background = new THREE.Color(0xbfe8ff);
        (scene.fog as THREE.Fog).color.setHex(0xbfe8ff);
        hemiLight.color.setHex(0xcbeeff);
        hemiLight.groundColor.setHex(0x4ade80);
        hemiLight.intensity = 0.95;
        keyLight.color.setHex(0xfff5e4);
        keyLight.intensity = 2.15;
        keyLight.position.set(7.5, 13.5, 8.5);
        rimLight.color.setHex(0xe0f2fe);
        rimLight.intensity = 0.75;
      }
    }

    applySceneTheme(stateRef.current.parkBackground, stateRef.current.timeOfDay);

    function clearActiveItems() {
      activeItems.forEach((entry) => {
        itemsLayer.remove(entry.group);
        itemsLayer.remove(entry.shadow);
        entry.group.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else m.material.dispose();
          }
        });
        entry.shadow.geometry.dispose();
        (entry.shadow.material as THREE.Material).dispose();
      });
      activeItems = [];
      draggingItem = null;
      selectedUid = null;
      callbacksRef.current.onSelectedItemChange(null);
    }

    function createSceneItem(
      def: WasteItemDefinition,
      pos: THREE.Vector3,
      uid: string,
      state: ActiveSceneItem['state']
    ): ActiveSceneItem {
      const model = createWasteItemModel(def.id, maxAnisotropy);
      model.scale.setScalar(1.18);
      model.position.copy(pos);

      // Add invisible generous hit sphere so young kids can grab items effortlessly
      const hitBox = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 10, 10),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitBox.position.y = 0.36;
      hitBox.userData = { itemUid: uid };
      model.add(hitBox);
      model.traverse((child) => {
        child.userData = { ...child.userData, itemUid: uid };
      });

      const shadow = createContactShadow(0.56, 0.36);
      shadow.position.set(pos.x, 0.025, pos.z);

      itemsLayer.add(model);
      itemsLayer.add(shadow);

      return {
        uid,
        def,
        group: model,
        shadow,
        homePos: pos.clone(),
        targetPos: pos.clone(),
        state,
        diveProgress: 0,
        diveStart: new THREE.Vector3(),
        diveEnd: new THREE.Vector3(),
        wobbleTime: 0,
        basePhase: Math.random() * Math.PI * 2,
      };
    }

    function rebuildSortItems(items: WasteItemDefinition[]) {
      clearActiveItems();
      const count = items.length;
      const span = Math.min(6.4, Math.max(2.6, (count - 1) * 1.45));
      items.forEach((def, idx) => {
        const t = count <= 1 ? 0.5 : idx / (count - 1);
        const x = (t - 0.5) * span;
        const z = 2.05 + (idx % 2 === 0 ? 0.25 : -0.2);
        const entry = createSceneItem(def, new THREE.Vector3(x, 0, z), `sort_${idx}_${def.id}`, 'idle');
        activeItems.push(entry);
      });
    }

    function setupExploreMode() {
      clearActiveItems();
      const sample = WASTE_ITEMS.slice(0, 8);
      sample.forEach((def, idx) => {
        const angle = ((idx / (sample.length - 1)) - 0.5) * 1.95;
        const radius = 3.8;
        const x = Math.sin(angle) * radius * 1.25;
        const z = Math.cos(angle) * radius - 0.7;
        const entry = createSceneItem(def, new THREE.Vector3(x, 0, z), `explore_${def.id}`, 'idle');
        activeItems.push(entry);
      });
    }

    function setupMagicItem(item: WasteItemDefinition, transformed: boolean) {
      while (pedestalRig.itemAnchor.children.length > 0) {
        const child = pedestalRig.itemAnchor.children[0];
        pedestalRig.itemAnchor.remove(child);
      }
      const model = transformed
        ? createTransformedTreasureModel(item.category, item.treasureColorHex)
        : createWasteItemModel(item.id, maxAnisotropy);
      model.scale.setScalar(1.45);
      pedestalRig.itemAnchor.add(model);
      if (transformed) {
        spawnParticles(new THREE.Vector3(0, 1.35, 1.85), item.treasureColorHex, 28);
        kuroJumpTimer = 1.0;
      }
    }

    function syncModeProps(nextMode: GameMode) {
      if (stateRef.current.wardrobeOpen) return;
      wardrobeSpace.visible = false;
      itemsLayer.visible = true;
      conveyorRig.group.visible = nextMode === 'conveyor';
      pedestalRig.group.visible = nextMode === 'magic';
      BIN_ORDER.forEach((cat) => {
        bins[cat].group.visible = nextMode !== 'magic';
      });
      if (nextMode === 'magic') {
        clearActiveItems();
        desiredCamPos.set(0, 4.2, 7.6);
        desiredCamTarget.set(0, 1.05, 1.3);
        camAnimActive = true;
      } else if (nextMode === 'conveyor') {
        clearActiveItems();
        conveyorSpawnTimer = 0.25;
        desiredCamPos.set(0, 5.8, 10.6);
        desiredCamTarget.set(0, 0.9, 0.5);
        camAnimActive = true;
      } else {
        desiredCamPos.copy(DEFAULT_CAM_POS);
        desiredCamTarget.copy(DEFAULT_CAM_TARGET);
        camAnimActive = true;
      }
    }

    function setWardrobeView(open: boolean, currentMode: GameMode) {
      if (open) {
        wardrobeSpace.visible = true;
        itemsLayer.visible = false;
        conveyorRig.group.visible = false;
        pedestalRig.group.visible = false;
        BIN_ORDER.forEach((cat) => {
          bins[cat].group.visible = false;
        });
        desiredKuroPos.set(0, 0.05, 1.15);
        desiredKuroRotY = 0.1;
        desiredCamTarget.set(0.75, 1.25, 0.8);
        desiredCamPos.set(0.95, 2.05, 5.45);
        camAnimActive = true;
        kuroJumpTimer = 0.65;
      } else {
        desiredKuroPos.copy(savedKuroParkPos);
        desiredKuroRotY = 0.55;
        wardrobeSpace.visible = false;
        itemsLayer.visible = true;
        conveyorRig.group.visible = currentMode === 'conveyor';
        pedestalRig.group.visible = currentMode === 'magic';
        BIN_ORDER.forEach((cat) => {
          bins[cat].group.visible = currentMode !== 'magic';
        });
        if (currentMode === 'magic') {
          desiredCamPos.set(0, 4.2, 7.6);
          desiredCamTarget.set(0, 1.05, 1.3);
        } else if (currentMode === 'conveyor') {
          desiredCamPos.set(0, 5.8, 10.6);
          desiredCamTarget.set(0, 0.9, 0.5);
        } else {
          desiredCamPos.copy(DEFAULT_CAM_POS);
          desiredCamTarget.copy(DEFAULT_CAM_TARGET);
        }
        camAnimActive = true;
      }
    }

    // 5. Viewport Resize & Browser Zoom Synchronization (Zero Empty Space!)
    const syncViewport = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const nextAspect = w / h;

      camera.aspect = nextAspect;
      // Dynamically adjust FOV when screen narrows on high browser zoom so 3D bins never clip
      camera.fov = nextAspect < 1.18 ? Math.min(64, 44 + (1.18 - nextAspect) * 26) : 44;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    };

    syncViewport();
    const resizeObserver = new ResizeObserver(syncViewport);
    resizeObserver.observe(container);
    window.addEventListener('resize', syncViewport);
    window.visualViewport?.addEventListener('resize', syncViewport);

    // 6. Raycasting & 3D Drag-and-Drop Handlers
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findNearestBin = (pos: THREE.Vector3): WasteCategory | null => {
      let best: WasteCategory | null = null;
      let bestDist = 1.65;
      BIN_ORDER.forEach((cat) => {
        const bp = BIN_POSITIONS[cat];
        const dx = pos.x - bp.x;
        const dz = pos.z - bp.z;
        const dist = Math.hypot(dx, dz);
        if (dist < bestDist) {
          bestDist = dist;
          best = cat;
        }
      });
      return best;
    };

    const launchItemDive = (entry: ActiveSceneItem, binCat: WasteCategory) => {
      const isMatch = entry.def.category === binCat;
      const binPos = BIN_POSITIONS[binCat];

      if (isMatch) {
        entry.state = 'diving';
        entry.diveProgress = 0;
        entry.diveStart.copy(entry.group.position);
        entry.diveEnd.set(binPos.x, 1.55, binPos.z);
        entry.diveCategory = binCat;
        bins[binCat].bounceVelocity = 0.24;
        spawnParticles(new THREE.Vector3(binPos.x, 1.9, binPos.z), BIN_DEFINITIONS[binCat].colorHex, 24);
        kuroJumpTimer = 0.95;
        kuroSadShakeTimer = 0;
        soundFx.playSuccess();
      } else {
        entry.state = 'returning';
        entry.wobbleTime = 0.45;
        kuroJumpTimer = 0;
        kuroSadShakeTimer = 1.25;
        soundFx.playWrong();
      }
      selectedUid = null;
      callbacksRef.current.onSelectedItemChange(null);
      callbacksRef.current.onSortResult(entry.def, isMatch, binCat);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      updatePointer(e.clientX, e.clientY);
      _raycaster.setFromCamera(_pointer, camera);

      const curMode = stateRef.current.mode;

      // Check Kuro pick-up & move in park (disabled inside wardrobe so orbit rotation stays unobstructed)
      if (!stateRef.current.wardrobeOpen) {
        const kuroHits = _raycaster.intersectObject(kuro.group, true);
        if (kuroHits.length > 0) {
          draggingKuro = true;
          kuroDragMoved = false;
          kuroDragDownPos = { x: e.clientX, y: e.clientY };
          controls.enabled = false;
          soundFx.playPickup();
          setHoverLabel(null);
          renderer.domElement.style.cursor = 'grabbing';
          try {
            renderer.domElement.setPointerCapture(e.pointerId);
          } catch {
            // ignore if synthetic pointer
          }
          return;
        }
      }

      if (stateRef.current.wardrobeOpen) return;

      // Check active draggable items (in sort or conveyor mode)
      if (curMode === 'sort' || curMode === 'conveyor') {
        const itemGroups = activeItems
          .filter((i) => i.state === 'idle' || i.state === 'conveyor')
          .map((i) => i.group);
        const itemHits = _raycaster.intersectObjects(itemGroups, true);
        if (itemHits.length > 0) {
          const uid = itemHits[0].object.userData.itemUid as string | undefined;
          const found = activeItems.find((i) => i.uid === uid);
          if (found) {
            draggingItem = found;
            found.state = 'dragging';
            controls.enabled = false;
            dragPointerDownPos = { x: e.clientX, y: e.clientY };
            dragMoved = false;
            soundFx.playPickup();
            setHoverLabel(null);
            try {
              renderer.domElement.setPointerCapture(e.pointerId);
            } catch {
              // ignore if synthetic pointer
            }
            return;
          }
        }
      }

      // If an item was already tap-selected, clicking a bin tosses it in!
      if (selectedUid && (curMode === 'sort' || curMode === 'conveyor')) {
        const binGroups = BIN_ORDER.map((c) => bins[c].group);
        const binHits = _raycaster.intersectObjects(binGroups, true);
        if (binHits.length > 0) {
          const cat = binHits[0].object.userData.binCategory as WasteCategory | undefined;
          const found = activeItems.find((i) => i.uid === selectedUid);
          if (cat && found) {
            launchItemDive(found, cat);
            return;
          }
        }
      }

      // In Explore mode, click items or bins to inspect
      if (curMode === 'explore') {
        const itemGroups = activeItems.map((i) => i.group);
        const itemHits = _raycaster.intersectObjects(itemGroups, true);
        if (itemHits.length > 0) {
          const uid = itemHits[0].object.userData.itemUid as string | undefined;
          const found = activeItems.find((i) => i.uid === uid);
          if (found) {
            soundFx.playPickup();
            desiredCamTarget.set(found.group.position.x * 0.6, 0.7, found.group.position.z * 0.6);
            desiredCamPos.set(found.group.position.x * 0.85, 3.3, found.group.position.z + 4.4);
            camAnimActive = true;
            callbacksRef.current.onInspectSelect({
              type: 'item',
              category: found.def.category,
              item: found.def,
            });
            return;
          }
        }
        const binGroups = BIN_ORDER.map((c) => bins[c].group);
        const binHits = _raycaster.intersectObjects(binGroups, true);
        if (binHits.length > 0) {
          const cat = binHits[0].object.userData.binCategory as WasteCategory | undefined;
          if (cat) {
            soundFx.playPickup();
            bins[cat].bounceVelocity = 0.16;
            const bp = BIN_POSITIONS[cat];
            desiredCamTarget.set(bp.x * 0.7, 1.0, bp.z * 0.5);
            desiredCamPos.set(bp.x * 0.9, 3.8, bp.z + 5.8);
            camAnimActive = true;
            callbacksRef.current.onInspectSelect({ type: 'bin', category: cat });
          }
        }
      }
    };

    let lastHoverTime = 0;
    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);

      if (draggingKuro) {
        if (
          Math.hypot(e.clientX - kuroDragDownPos.x, e.clientY - kuroDragDownPos.y) > 8
        ) {
          kuroDragMoved = true;
        }
        _raycaster.setFromCamera(_pointer, camera);
        if (_raycaster.ray.intersectPlane(_kuroDragPlane, _planeHit)) {
          _planeHit.x = THREE.MathUtils.clamp(_planeHit.x, -5.6, 5.6);
          _planeHit.z = THREE.MathUtils.clamp(_planeHit.z, -1.4, 4.2);
          desiredKuroPos.set(_planeHit.x, 0, _planeHit.z);
          // Turn Kuro gently toward the center of the park depending on side
          desiredKuroRotY = THREE.MathUtils.clamp(-_planeHit.x * 0.14, -0.75, 0.75);
        }
        return;
      }

      if (draggingItem) {
        if (
          Math.hypot(e.clientX - dragPointerDownPos.x, e.clientY - dragPointerDownPos.y) > 8
        ) {
          dragMoved = true;
        }
        _raycaster.setFromCamera(_pointer, camera);
        if (_raycaster.ray.intersectPlane(_dragPlane, _planeHit)) {
          _planeHit.x = THREE.MathUtils.clamp(_planeHit.x, -5.6, 5.6);
          _planeHit.z = THREE.MathUtils.clamp(_planeHit.z, -3.5, 4.4);
          draggingItem.targetPos.set(_planeHit.x, 1.35, _planeHit.z);
          hoveredBin = findNearestBin(_planeHit);
        }
        return;
      }

      // Throttle hover raycasting to ~20fps
      const now = performance.now();
      if (now - lastHoverTime < 45) return;
      lastHoverTime = now;

      _raycaster.setFromCamera(_pointer, camera);

      if (!stateRef.current.wardrobeOpen) {
        const itemGroups = activeItems
          .filter((i) => i.state === 'idle' || i.state === 'conveyor')
          .map((i) => i.group);
        const hits = _raycaster.intersectObjects(itemGroups, true);

        if (hits.length > 0) {
          const uid = hits[0].object.userData.itemUid as string | undefined;
          const found = activeItems.find((i) => i.uid === uid);
          if (found) {
            hoveredUid = found.uid;
            renderer.domElement.style.cursor = 'grab';
            setHoverLabel({
              text: found.def.name[stateRef.current.lang],
              x: e.clientX,
              y: e.clientY - 18,
            });
            return;
          }
        }
      }

      // Check Kuro or bins hover
      if (!stateRef.current.wardrobeOpen) {
        const kuroHit = _raycaster.intersectObject(kuro.group, true);
        if (kuroHit.length > 0) {
          hoveredUid = null;
          renderer.domElement.style.cursor = 'grab';
          setHoverLabel({
            text:
              stateRef.current.lang === 'id'
                ? 'Kuro (Seret untuk pindahkan · Klik untuk tip)'
                : 'Kuro (Drag to move · Click for tip)',
            x: e.clientX,
            y: e.clientY - 18,
          });
          return;
        }
      }

      if (selectedUid || stateRef.current.mode === 'explore') {
        const binHits = _raycaster.intersectObjects(
          BIN_ORDER.map((c) => bins[c].group),
          true
        );
        if (binHits.length > 0) {
          const cat = binHits[0].object.userData.binCategory as WasteCategory | undefined;
          if (cat) {
            hoveredBin = cat;
            hoveredUid = null;
            renderer.domElement.style.cursor = 'pointer';
            setHoverLabel({
              text: BIN_DEFINITIONS[cat].name[stateRef.current.lang],
              x: e.clientX,
              y: e.clientY - 18,
            });
            return;
          }
        }
      }

      hoveredBin = null;
      hoveredUid = null;
      renderer.domElement.style.cursor = 'default';
      setHoverLabel(null);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (draggingKuro) {
        draggingKuro = false;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'default';
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        if (kuroDragMoved) {
          savedKuroParkPos.copy(desiredKuroPos);
          soundFx.playDrop();
          kuroPurrTimer = 1.1;
          _vec3.copy(desiredKuroPos).add(new THREE.Vector3(0, 1.75, 0.2));
          spawnHearts(_vec3, 4);
        } else {
          soundFx.playMeow();
          kuroJumpTimer = 0.65;
          kuroPurrTimer = 1.2;
          _vec3.copy(kuro.group.position).add(new THREE.Vector3(0, 1.75, 0.2));
          spawnHearts(_vec3, 4);
          callbacksRef.current.onKuroClick();
        }
        return;
      }

      if (!draggingItem) return;
      const item = draggingItem;
      draggingItem = null;
      controls.enabled = true;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const curMode = stateRef.current.mode;
      const dropBin = findNearestBin(item.group.position);

      if (dropBin) {
        hoveredBin = null;
        launchItemDive(item, dropBin);
      } else if (!dragMoved) {
        // Tap-to-select accessibility fallback!
        selectedUid = selectedUid === item.uid ? null : item.uid;
        item.state = curMode === 'conveyor' ? 'conveyor' : 'idle';
        callbacksRef.current.onSelectedItemChange(selectedUid ? item.def : null);
      } else {
        soundFx.playDrop();
        item.state = curMode === 'conveyor' ? 'conveyor' : 'returning';
      }
      hoveredBin = null;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Expose imperative bridge
    bridgeRef.current = {
      rebuildSortItems,
      setupConveyorMode: () => {
        clearActiveItems();
        conveyorSpawnTimer = 0.25;
      },
      setupExploreMode,
      setupMagicItem,
      updateLanguage: (newLang: Language) => {
        BIN_ORDER.forEach((cat) => bins[cat].updateLabel(newLang));
        env.updateSignLanguage(newLang);
      },
      applyZoom: (delta: number) => {
        // Move desired camera smoothly along vector toward controls.target
        _vec3.copy(camera.position).sub(controls.target);
        const dist = _vec3.length();
        const nextDist = THREE.MathUtils.clamp(dist + delta, controls.minDistance, controls.maxDistance);
        _vec3.normalize().multiplyScalar(nextDist).add(controls.target);
        desiredCamPos.copy(_vec3);
        desiredCamTarget.copy(controls.target);
        camAnimActive = true;
      },
      resetCamera: () => {
        if (stateRef.current.wardrobeOpen) {
          desiredCamTarget.set(0.75, 1.25, 0.8);
          desiredCamPos.set(0.95, 2.05, 5.45);
        } else {
          desiredCamPos.copy(DEFAULT_CAM_POS);
          desiredCamTarget.copy(DEFAULT_CAM_TARGET);
        }
        camAnimActive = true;
      },
      triggerKuroHappy: () => {
        kuroJumpTimer = 0.9;
        kuroSadShakeTimer = 0;
      },
      triggerKuroSad: () => {
        kuroSadShakeTimer = 1.25;
        kuroJumpTimer = 0;
        kuroPurrTimer = 0;
      },
      triggerKuroPat: () => {
        kuroPurrTimer = 1.6;
        kuroSadShakeTimer = 0;
        _vec3.copy(kuro.group.position).add(new THREE.Vector3(0, 1.75, 0.2));
        spawnHearts(_vec3, 7);
      },
      triggerKuroTreat: (accentHex: string) => {
        kuroJumpTimer = 1.05;
        kuroPurrTimer = 1.8;
        kuroSadShakeTimer = 0;
        _vec3.copy(kuro.group.position).add(new THREE.Vector3(0, 1.65, 0.25));
        spawnHearts(_vec3, 8, '#fb7185');
        spawnParticles(_vec3, accentHex, 18);
      },
      applySceneTheme,
      syncModeProps,
      setWardrobeView,
      applyKuroWardrobe: (cfg: KuroWardrobeConfig, bounce: boolean) => {
        kuro.applyWardrobe(cfg);
        if (bounce) {
          kuroJumpTimer = 0.55;
        }
      },
    };

    // Initial render compile & scene populate
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. Continuous Animation Loop (Clock delta + Software WebGL afterDraw pacing)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.elapsedTime;
      const curState = stateRef.current;

      // Smooth camera preset / zoom damping
      if (camAnimActive) {
        const dampAlpha = 1 - Math.exp(-7 * delta);
        camera.position.lerp(desiredCamPos, dampAlpha);
        controls.target.lerp(desiredCamTarget, dampAlpha);
        if (
          camera.position.distanceToSquared(desiredCamPos) < 0.002 &&
          controls.target.distanceToSquared(desiredCamTarget) < 0.002
        ) {
          camAnimActive = false;
        }
      }
      controls.update();

      // Clouds gentle drift + fireflies shimmer
      env.clouds.forEach((cloud) => {
        cloud.position.x += delta * (cloud.userData.speed as number);
        if (cloud.position.x > 28) cloud.position.x = -28;
      });
      if (curState.timeOfDay === 'night') {
        env.fireflies.forEach((fly) => {
          const baseY = fly.userData.baseY as number;
          const phase = fly.userData.phase as number;
          fly.position.y = baseY + Math.sin(elapsed * 2.2 + phase) * 0.28;
        });
      }

      // Conveyor belt animation & spawning (Mode 2)
      if (curState.mode === 'conveyor' && curState.conveyorRunning) {
        conveyorRig.beltTexture.offset.x -= delta * (curState.conveyorSpeed * 0.38);
        conveyorRig.rollers.forEach((r) => {
          r.rotation.y -= delta * curState.conveyorSpeed * 2.5;
        });

        conveyorSpawnTimer -= delta;
        const conveyorActiveCount = activeItems.filter((i) => i.state === 'conveyor').length;
        if (conveyorSpawnTimer <= 0 && conveyorActiveCount < 4) {
          const def = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
          const uid = `conv_${++conveyorSeq}_${def.id}`;
          const spawnPos = new THREE.Vector3(-4.0, 0.62, 2.25);
          const item = createSceneItem(def, spawnPos, uid, 'conveyor');
          activeItems.push(item);
          conveyorSpawnTimer = Math.max(1.8, 3.2 - curState.conveyorSpeed * 0.45);
        }
      }

      // Magic pedestal spin (Mode 3)
      if (curState.mode === 'magic') {
        pedestalRig.itemAnchor.rotation.y += delta * (curState.magicTransformed ? 1.4 : 0.75);
        pedestalRig.itemAnchor.position.y = 0.52 + Math.sin(elapsed * 2.6) * 0.06;
        pedestalRig.ringMesh.rotation.z += delta * 0.8;
      }

      // Update Bins (hinged lid flip + celebratory bounce)
      BIN_ORDER.forEach((cat) => {
        const bin = bins[cat];
        const shouldOpen = hoveredBin === cat ? 1 : 0;
        bin.openAmount = THREE.MathUtils.damp(bin.openAmount, shouldOpen, 12, delta);
        bin.lidGroup.rotation.x = -bin.openAmount * 1.05;

        if (bin.bounceVelocity !== 0 || Math.abs(bin.baseScale - 1) > 0.002) {
          bin.baseScale += bin.bounceVelocity;
          bin.bounceVelocity = (bin.bounceVelocity + (1 - bin.baseScale) * 0.35) * 0.75;
          if (Math.abs(bin.bounceVelocity) < 0.001 && Math.abs(bin.baseScale - 1) < 0.002) {
            bin.baseScale = 1;
            bin.bounceVelocity = 0;
          }
          bin.group.scale.set(
            1 + (1 - bin.baseScale) * 0.4,
            bin.baseScale,
            1 + (1 - bin.baseScale) * 0.4
          );
        }
      });

      // Update Active Waste Items
      for (let i = activeItems.length - 1; i >= 0; i--) {
        const item = activeItems[i];
        const isSelected = selectedUid === item.uid;
        const isHovered = hoveredUid === item.uid;

        if (item.state === 'dragging') {
          item.group.position.x = THREE.MathUtils.damp(item.group.position.x, item.targetPos.x, 18, delta);
          item.group.position.y = THREE.MathUtils.damp(item.group.position.y, item.targetPos.y, 18, delta);
          item.group.position.z = THREE.MathUtils.damp(item.group.position.z, item.targetPos.z, 18, delta);
          item.group.scale.setScalar(THREE.MathUtils.damp(item.group.scale.x, 1.32, 14, delta));
          item.shadow.position.set(item.group.position.x, 0.025, item.group.position.z);
          item.shadow.scale.setScalar(0.8);
        } else if (item.state === 'diving') {
          item.diveProgress += delta * 2.8;
          const t = Math.min(1, item.diveProgress);
          _vec3.lerpVectors(item.diveStart, item.diveEnd, t);
          _vec3.y += Math.sin(t * Math.PI) * 1.15;
          item.group.position.copy(_vec3);
          item.group.scale.setScalar(THREE.MathUtils.lerp(1.25, 0.25, t));
          item.group.rotation.y += delta * 8;
          item.shadow.scale.setScalar(Math.max(0.01, 1 - t));
          if (t >= 1) {
            itemsLayer.remove(item.group);
            itemsLayer.remove(item.shadow);
            activeItems.splice(i, 1);
          }
        } else if (item.state === 'returning') {
          if (item.wobbleTime > 0) {
            item.wobbleTime -= delta;
            item.group.rotation.z = Math.sin(item.wobbleTime * 36) * 0.22;
          } else {
            item.group.rotation.z = THREE.MathUtils.damp(item.group.rotation.z, 0, 12, delta);
          }
          item.group.position.lerp(item.homePos, 1 - Math.exp(-10 * delta));
          item.shadow.position.set(item.group.position.x, 0.025, item.group.position.z);
          item.shadow.scale.setScalar(1);
          if (item.group.position.distanceTo(item.homePos) < 0.03 && item.wobbleTime <= 0) {
            item.group.position.copy(item.homePos);
            item.group.rotation.z = 0;
            item.state = 'idle';
          }
        } else if (item.state === 'conveyor') {
          if (curState.conveyorRunning) {
            item.group.position.x += delta * curState.conveyorSpeed;
          }
          item.group.position.y = isSelected ? 1.05 : 0.62;
          item.group.position.z = 2.25;
          item.homePos.copy(item.group.position);
          item.shadow.position.set(item.group.position.x, 0.625, item.group.position.z);
          item.shadow.scale.setScalar(0.75);
          if (item.group.position.x > 4.15) {
            const missedDef = item.def;
            itemsLayer.remove(item.group);
            itemsLayer.remove(item.shadow);
            activeItems.splice(i, 1);
            callbacksRef.current.onConveyorMiss(missedDef);
          }
        } else {
          // Idle float / selection lift
          const lift = isSelected ? 0.55 + Math.sin(elapsed * 5) * 0.08 : isHovered ? 0.22 : Math.sin(elapsed * 2.2 + item.basePhase) * 0.04;
          item.group.position.y = THREE.MathUtils.damp(item.group.position.y, item.homePos.y + lift, 12, delta);
          const targetScale = isSelected ? 1.36 : isHovered ? 1.28 : 1.18;
          item.group.scale.setScalar(THREE.MathUtils.damp(item.group.scale.x, targetScale, 12, delta));
          if (isSelected) {
            item.group.rotation.y += delta * 1.8;
          }
          item.shadow.position.set(item.group.position.x, 0.025, item.group.position.z);
        }
      }

      // Update 3D Particle Bursts (Confetti & Floating Hearts)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += delta;
        if (p.kind === 'heart') {
          p.vel.y += 0.25 * delta;
          p.mesh.position.addScaledVector(p.vel, delta);
          p.mesh.position.x += Math.sin(p.life * 6 + i) * 0.008;
          p.mesh.rotation.y += delta * 2.2;
          const ratio = Math.max(0, 1 - p.life / p.maxLife);
          p.mesh.scale.setScalar((0.85 + Math.sin(p.life * 4) * 0.15) * (0.4 + ratio * 0.9));
        } else {
          p.vel.y -= 9.5 * delta;
          p.mesh.position.addScaledVector(p.vel, delta);
          p.mesh.rotation.x += delta * 6;
          p.mesh.rotation.y += delta * 5;
          const ratio = Math.max(0, 1 - p.life / p.maxLife);
          p.mesh.scale.setScalar(ratio);
        }
        if (p.life >= p.maxLife) {
          particlesLayer.remove(p.mesh);
          (p.mesh.material as THREE.Material).dispose();
          particles.splice(i, 1);
        }
      }

      // Smoothly position Kuro (EcoPark vs Wardrobe Space)
      const kuroLerp = 1 - Math.exp(-9 * delta);
      kuro.group.position.lerp(desiredKuroPos, kuroLerp);
      kuro.group.rotation.y = THREE.MathUtils.damp(kuro.group.rotation.y, desiredKuroRotY, 9, delta);

      // Animate Kuro the Black Kitten Mascot (Idle multi-emotions + Happy + Purring + Sad reactions)
      if (kuroPurrTimer > 0) {
        kuroPurrTimer = Math.max(0, kuroPurrTimer - delta);
      }
      const activeMood = curState.kuroMood;
      const isSad = activeMood === 'sad';
      const isPurring = !isSad && (activeMood === 'purring' || kuroPurrTimer > 0);
      const isHappy = !isSad && (activeMood === 'happy' || isPurring);
      const isTalking = activeMood === 'talking';
      const isHint = activeMood === 'hint';
      const isIdle = activeMood === 'idle' && kuroPurrTimer <= 0;

      if (isIdle) {
        kuroIdleCycleTimer -= delta;
        if (kuroIdleCycleTimer <= 0) {
          kuroIdleIndex = (kuroIdleIndex + 1) % IDLE_SUBMOODS.length;
          kuroIdleCycleTimer = IDLE_SUBMOODS[kuroIdleIndex] === 'wink' ? 2.6 : 4.2;
        }
      }
      const idleSub = IDLE_SUBMOODS[kuroIdleIndex];

      // 1. Facial features (mouths, blushes, tears, eyebrows)
      const playfulIdle = isIdle && (idleSub === 'playful' || idleSub === 'wink');
      kuro.mouthHappy.visible = isHappy || playfulIdle;
      kuro.mouthSad.visible = isSad;
      kuro.mouthNeutral.visible = !kuro.mouthHappy.visible && !kuro.mouthSad.visible;

      const showBlush = isHappy || playfulIdle || (isIdle && idleSub === 'sleepy');
      kuro.blushLeft.visible = showBlush;
      kuro.blushRight.visible = showBlush;

      kuro.tearLeft.visible = isSad;
      kuro.tearRight.visible = isSad;
      if (isSad) {
        const tearShimmer = Math.abs(Math.sin(elapsed * 5.2)) * 0.014;
        kuro.tearLeft.position.y = -0.065 - tearShimmer;
        kuro.tearRight.position.y = -0.065 - tearShimmer;
      }

      if (isSad) {
        kuro.browLeft.visible = true;
        kuro.browRight.visible = true;
        kuro.browLeft.rotation.z = THREE.MathUtils.damp(kuro.browLeft.rotation.z, 0.38, 12, delta);
        kuro.browRight.rotation.z = THREE.MathUtils.damp(kuro.browRight.rotation.z, -0.38, 12, delta);
        kuro.browLeft.position.y = THREE.MathUtils.damp(kuro.browLeft.position.y, 0.145, 12, delta);
        kuro.browRight.position.y = THREE.MathUtils.damp(kuro.browRight.position.y, 0.145, 12, delta);
      } else if (isHint || (isIdle && idleSub === 'curious')) {
        kuro.browLeft.visible = true;
        kuro.browRight.visible = true;
        kuro.browLeft.rotation.z = THREE.MathUtils.damp(kuro.browLeft.rotation.z, 0.14, 12, delta);
        kuro.browRight.rotation.z = THREE.MathUtils.damp(kuro.browRight.rotation.z, 0.04, 12, delta);
        kuro.browLeft.position.y = THREE.MathUtils.damp(kuro.browLeft.position.y, 0.21, 12, delta);
        kuro.browRight.position.y = THREE.MathUtils.damp(kuro.browRight.position.y, 0.175, 12, delta);
      } else {
        kuro.browLeft.visible = false;
        kuro.browRight.visible = false;
      }

      // 2. Body pickup lift / hop / sad slouch / breathing
      if (draggingKuro) {
        kuro.bodyGroup.position.y = THREE.MathUtils.damp(
          kuro.bodyGroup.position.y,
          0.68 + Math.sin(elapsed * 6) * 0.04,
          16,
          delta
        );
        kuro.bodyGroup.rotation.z = THREE.MathUtils.damp(
          kuro.bodyGroup.rotation.z,
          Math.sin(elapsed * 7) * 0.08,
          12,
          delta
        );
        kuro.bodyGroup.scale.y = THREE.MathUtils.damp(kuro.bodyGroup.scale.y, 1.05, 12, delta);
      } else if (kuroJumpTimer > 0) {
        kuroJumpTimer = Math.max(0, kuroJumpTimer - delta);
        const hop = Math.abs(Math.sin(kuroJumpTimer * Math.PI * 3)) * 0.55;
        kuro.bodyGroup.position.y = hop;
        kuro.bodyGroup.rotation.y = Math.sin(kuroJumpTimer * Math.PI * 2) * 0.35;
        kuro.bodyGroup.rotation.z = THREE.MathUtils.damp(kuro.bodyGroup.rotation.z, 0, 12, delta);
        kuro.bodyGroup.scale.y = THREE.MathUtils.damp(kuro.bodyGroup.scale.y, 1.02, 10, delta);
      } else if (isSad) {
        kuro.bodyGroup.position.y = THREE.MathUtils.damp(kuro.bodyGroup.position.y, -0.04, 8, delta);
        kuro.bodyGroup.rotation.y = THREE.MathUtils.damp(kuro.bodyGroup.rotation.y, 0, 8, delta);
        kuro.bodyGroup.rotation.z = THREE.MathUtils.damp(kuro.bodyGroup.rotation.z, 0, 10, delta);
        kuro.bodyGroup.scale.y = THREE.MathUtils.damp(
          kuro.bodyGroup.scale.y,
          0.91 + Math.sin(elapsed * 2.0) * 0.015,
          8,
          delta
        );
      } else {
        kuro.bodyGroup.position.y = THREE.MathUtils.damp(kuro.bodyGroup.position.y, 0, 10, delta);
        kuro.bodyGroup.rotation.y = THREE.MathUtils.damp(kuro.bodyGroup.rotation.y, 0, 10, delta);
        kuro.bodyGroup.rotation.z = THREE.MathUtils.damp(kuro.bodyGroup.rotation.z, 0, 10, delta);
        const breathAmp = isIdle && idleSub === 'sleepy' ? 0.036 : 0.025;
        const breathSpeed = isIdle && idleSub === 'sleepy' ? 1.8 : 2.6;
        kuro.bodyGroup.scale.y = THREE.MathUtils.damp(
          kuro.bodyGroup.scale.y,
          1 + Math.sin(elapsed * breathSpeed) * breathAmp,
          10,
          delta
        );
      }

      // 3. Head tilts, nods & sad head-shake
      let targetHeadX = 0;
      let targetHeadY = 0;
      let targetHeadZ = 0;
      if (isSad) {
        if (kuroSadShakeTimer > 0) {
          kuroSadShakeTimer = Math.max(0, kuroSadShakeTimer - delta);
        }
        targetHeadX = 0.25;
        targetHeadZ = Math.sin(elapsed * 1.6) * 0.06;
        targetHeadY =
          kuroSadShakeTimer > 0
            ? Math.sin(kuroSadShakeTimer * 20) * 0.24 * (kuroSadShakeTimer / 1.25)
            : Math.sin(elapsed * 1.4) * 0.06;
      } else if (isHint) {
        targetHeadZ = 0.24;
        targetHeadX = -0.05;
        targetHeadY = 0.1;
      } else if (isTalking) {
        targetHeadZ = Math.sin(elapsed * 4.5) * 0.08;
        targetHeadX = Math.sin(elapsed * 6) * 0.06;
        targetHeadY = Math.sin(elapsed * 2.5) * 0.08;
      } else if (isPurring) {
        targetHeadZ = Math.sin(elapsed * 6.5) * 0.16;
        targetHeadX = -0.04;
        targetHeadY = Math.sin(elapsed * 4.5) * 0.14;
      } else if (isHappy) {
        targetHeadZ = Math.sin(elapsed * 5.0) * 0.1;
        targetHeadX = -0.06;
        targetHeadY = Math.sin(elapsed * 3.0) * 0.1;
      } else {
        // Rich idle emotions
        if (idleSub === 'curious') {
          targetHeadZ = 0.24;
          targetHeadX = -0.06;
          targetHeadY = 0.22;
        } else if (idleSub === 'playful') {
          targetHeadZ = Math.sin(elapsed * 4.2) * 0.14;
          targetHeadX = -0.06;
          targetHeadY = Math.sin(elapsed * 2.4) * 0.12;
        } else if (idleSub === 'sleepy') {
          targetHeadZ = 0.1;
          targetHeadX = 0.16 + Math.sin(elapsed * 1.5) * 0.04;
          targetHeadY = 0;
        } else if (idleSub === 'alert') {
          targetHeadZ = 0;
          targetHeadX = -0.05;
          targetHeadY = Math.sin(elapsed * 2.1) * 0.34;
        } else {
          // wink
          targetHeadZ = -0.18;
          targetHeadX = -0.04;
          targetHeadY = 0.12;
        }
      }
      kuro.headGroup.rotation.x = THREE.MathUtils.damp(kuro.headGroup.rotation.x, targetHeadX, 9, delta);
      kuro.headGroup.rotation.y = THREE.MathUtils.damp(kuro.headGroup.rotation.y, targetHeadY, 9, delta);
      kuro.headGroup.rotation.z = THREE.MathUtils.damp(kuro.headGroup.rotation.z, targetHeadZ, 9, delta);

      // 4. Ears & Tail expressiveness
      let targetEarLZ = 0.28 + Math.sin(elapsed * 2.3) * 0.04;
      let targetEarRZ = -0.28 - Math.sin(elapsed * 2.3 + 1.2) * 0.04;
      let targetEarX = 0.08;
      if (isSad) {
        targetEarLZ = 0.72 + Math.sin(elapsed * 2.0) * 0.03;
        targetEarRZ = -0.72 - Math.sin(elapsed * 2.0) * 0.03;
        targetEarX = 0.28;
      } else if (isIdle && idleSub === 'curious') {
        targetEarLZ = 0.16;
        targetEarRZ = -0.38;
      } else if (isIdle && idleSub === 'alert') {
        targetEarLZ = 0.16 + Math.sin(elapsed * 5.0) * 0.04;
        targetEarRZ = -0.16 - Math.sin(elapsed * 5.0) * 0.04;
      } else if (isIdle && idleSub === 'sleepy') {
        targetEarLZ = 0.42;
        targetEarRZ = -0.42;
      }
      kuro.earLeft.rotation.z = THREE.MathUtils.damp(kuro.earLeft.rotation.z, targetEarLZ, 9, delta);
      kuro.earRight.rotation.z = THREE.MathUtils.damp(kuro.earRight.rotation.z, targetEarRZ, 9, delta);
      kuro.earLeft.rotation.x = THREE.MathUtils.damp(kuro.earLeft.rotation.x, targetEarX, 9, delta);
      kuro.earRight.rotation.x = THREE.MathUtils.damp(kuro.earRight.rotation.x, targetEarX, 9, delta);

      if (isSad) {
        kuro.tailGroup.rotation.x = THREE.MathUtils.damp(kuro.tailGroup.rotation.x, 0.48, 8, delta);
        kuro.tailGroup.rotation.y = Math.sin(elapsed * 1.4) * 0.12;
      } else if (kuroJumpTimer > 0 || isHappy || (isIdle && idleSub === 'playful')) {
        kuro.tailGroup.rotation.x = THREE.MathUtils.damp(kuro.tailGroup.rotation.x, -0.06, 8, delta);
        kuro.tailGroup.rotation.y = Math.sin(elapsed * (kuroJumpTimer > 0 ? 11 : 8.2)) * 0.52;
      } else {
        kuro.tailGroup.rotation.x = THREE.MathUtils.damp(kuro.tailGroup.rotation.x, 0, 8, delta);
        kuro.tailGroup.rotation.y = Math.sin(elapsed * 3.4) * 0.42;
      }

      // 5. Front paws (playful wave vs sad slump vs resting)
      const wavingPaw = isHappy || (isIdle && idleSub === 'playful');
      const targetPawRightY = wavingPaw ? 0.48 : isSad ? 0.2 : 0.24;
      const targetPawRightX = wavingPaw ? -0.55 : isSad ? 0.08 : 0.18;
      const targetPawRightZ = wavingPaw ? -0.35 + Math.sin(elapsed * 8.0) * 0.28 : isSad ? -0.1 : 0;
      const targetPawLeftY = isSad ? 0.2 : 0.24;
      const targetPawLeftX = isSad ? 0.08 : 0.18;
      const targetPawLeftZ = isSad ? 0.1 : 0;

      kuro.pawRight.position.y = THREE.MathUtils.damp(kuro.pawRight.position.y, targetPawRightY, 10, delta);
      kuro.pawRight.rotation.x = THREE.MathUtils.damp(kuro.pawRight.rotation.x, targetPawRightX, 10, delta);
      kuro.pawRight.rotation.z = THREE.MathUtils.damp(kuro.pawRight.rotation.z, targetPawRightZ, 12, delta);
      kuro.pawLeft.position.y = THREE.MathUtils.damp(kuro.pawLeft.position.y, targetPawLeftY, 10, delta);
      kuro.pawLeft.rotation.x = THREE.MathUtils.damp(kuro.pawLeft.rotation.x, targetPawLeftX, 10, delta);
      kuro.pawLeft.rotation.z = THREE.MathUtils.damp(kuro.pawLeft.rotation.z, targetPawLeftZ, 10, delta);

      // 6. Natural Kitten Blink + Emotion Eyes (happy squint, sad watery, sleepy, wink, alert)
      kuroBlinkTimer -= delta;
      const isBlinking = kuroBlinkTimer <= 0 && kuroBlinkTimer > -0.14;
      if (kuroBlinkTimer <= -0.14) {
        kuroBlinkTimer = 2.4 + Math.random() * 2.5;
      }

      let targetEyeLY = 1.15;
      let targetEyeRY = 1.15;
      let targetEyeX = 0.95;
      if (isBlinking) {
        targetEyeLY = 0.12;
        targetEyeRY = 0.12;
      } else if (isHappy) {
        targetEyeLY = 0.56;
        targetEyeRY = 0.56;
        targetEyeX = 1.06;
      } else if (isSad) {
        targetEyeLY = 0.78;
        targetEyeRY = 0.78;
      } else if (isIdle && idleSub === 'sleepy') {
        targetEyeLY = 0.42;
        targetEyeRY = 0.42;
      } else if (isIdle && idleSub === 'wink') {
        targetEyeLY = 0.16;
        targetEyeRY = 1.18;
      } else if (isIdle && idleSub === 'alert') {
        targetEyeLY = 1.24;
        targetEyeRY = 1.24;
      }

      const eyeSpeed = isBlinking ? 26 : 12;
      kuro.eyeLeft.scale.y = THREE.MathUtils.damp(kuro.eyeLeft.scale.y, targetEyeLY, eyeSpeed, delta);
      kuro.eyeRight.scale.y = THREE.MathUtils.damp(kuro.eyeRight.scale.y, targetEyeRY, eyeSpeed, delta);
      kuro.eyeLeft.scale.x = THREE.MathUtils.damp(kuro.eyeLeft.scale.x, targetEyeX, 12, delta);
      kuro.eyeRight.scale.x = THREE.MathUtils.damp(kuro.eyeRight.scale.x, targetEyeX, 12, delta);

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncViewport);
      window.visualViewport?.removeEventListener('resize', syncViewport);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      clearActiveItems();
      sharedParticleGeo.dispose();
      sharedHeartGeo.dispose();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Synchronize React prop changes cleanly to the live Three.js scene
  useEffect(() => {
    bridgeRef.current?.syncModeProps(mode);
    if (mode === 'sort') {
      bridgeRef.current?.rebuildSortItems(waveItems);
    } else if (mode === 'conveyor') {
      bridgeRef.current?.setupConveyorMode();
    } else if (mode === 'explore') {
      bridgeRef.current?.setupExploreMode();
    }
  }, [mode, waveKey]);

  useEffect(() => {
    if (mode === 'sort') {
      bridgeRef.current?.rebuildSortItems(waveItems);
    }
  }, [waveItems]);

  useEffect(() => {
    if (mode === 'magic') {
      bridgeRef.current?.setupMagicItem(magicItem, magicTransformed);
    }
  }, [mode, magicItem, magicTransformed]);

  useEffect(() => {
    bridgeRef.current?.updateLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (kuroReactionNonce > 0) {
      if (kuroMood === 'happy') {
        bridgeRef.current?.triggerKuroHappy();
      } else if (kuroMood === 'sad') {
        bridgeRef.current?.triggerKuroSad();
      }
    }
  }, [kuroReactionNonce, kuroMood]);

  useEffect(() => {
    if (kuroPatNonce > 0) {
      bridgeRef.current?.triggerKuroPat();
    }
  }, [kuroPatNonce]);

  useEffect(() => {
    if (kuroTreatSignal && kuroTreatSignal.nonce > 0) {
      bridgeRef.current?.triggerKuroTreat(kuroTreatSignal.colorHex);
    }
  }, [kuroTreatSignal]);

  useEffect(() => {
    bridgeRef.current?.applySceneTheme(parkBackground, timeOfDay);
  }, [parkBackground, timeOfDay]);

  useEffect(() => {
    if (zoomSignal) {
      bridgeRef.current?.applyZoom(zoomSignal.delta);
    }
  }, [zoomSignal]);

  useEffect(() => {
    if (resetCamNonce > 0) {
      bridgeRef.current?.resetCamera();
    }
  }, [resetCamNonce]);

  useEffect(() => {
    bridgeRef.current?.setWardrobeView(wardrobeOpen, mode);
  }, [wardrobeOpen, mode]);

  useEffect(() => {
    bridgeRef.current?.applyKuroWardrobe(wardrobeConfig, wardrobeOpen);
  }, [wardrobeConfig, wardrobeOpen]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#BFE8FF]">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Hover Name Label */}
      {hoverLabel && (
        <div
          className="pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-full px-3 py-1 rounded-lg bg-slate-900/90 text-white text-xs font-semibold shadow-md whitespace-nowrap"
          style={{ left: hoverLabel.x, top: hoverLabel.y }}
        >
          {hoverLabel.text}
        </div>
      )}

      {/* WebGL Context Lost Graceful Fallback */}
      {contextLost && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#E0F2FE] p-6 text-center">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg border border-sky-200">
            <h2 className="font-display text-xl font-bold text-slate-900">
              {lang === 'id' ? 'Taman 3D Sedang Dimuat Ulang' : 'Reloading 3D EcoPark'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {lang === 'id'
                ? 'Perangkat memerlukan penyegaran grafis 3D. Silakan muat ulang halaman jika belum muncul.'
                : 'Your browser paused 3D graphics. Please refresh the page if the scene does not resume.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
