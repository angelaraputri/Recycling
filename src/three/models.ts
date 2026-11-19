import * as THREE from 'three';
import { BIN_DEFINITIONS } from '../data/recyclingData';
import {
  KuroAccessoryId,
  KuroHatId,
  KuroOutfitId,
  KuroWardrobeConfig,
  Language,
  ParkBackgroundId,
  TimeOfDayId,
  WasteCategory,
} from '../types/game';
import {
  createBinLabelTexture,
  createContactShadowTexture,
  createConveyorTexture,
  createGrassTexture,
  createMilkCartonTexture,
  createNewspaperTexture,
  createPlazaStoneTexture,
  createSignpostTexture,
  createSodaCanTexture,
} from './textures';

export interface BinRig {
  group: THREE.Group;
  category: WasteCategory;
  lidGroup: THREE.Group;
  rimMesh: THREE.Mesh;
  labelMesh: THREE.Mesh;
  openAmount: number;
  bounceVelocity: number;
  baseScale: number;
  updateLabel: (lang: Language) => void;
}

export interface KuroRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  tailGroup: THREE.Group;
  earLeft: THREE.Group;
  earRight: THREE.Group;
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  browLeft: THREE.Mesh;
  browRight: THREE.Mesh;
  mouthNeutral: THREE.Group;
  mouthHappy: THREE.Group;
  mouthSad: THREE.Group;
  tearLeft: THREE.Mesh;
  tearRight: THREE.Mesh;
  blushLeft: THREE.Mesh;
  blushRight: THREE.Mesh;
  pawLeft: THREE.Mesh;
  pawRight: THREE.Mesh;
  bellMesh: THREE.Mesh;
  applyWardrobe: (config: KuroWardrobeConfig) => void;
}

export interface ConveyorRig {
  group: THREE.Group;
  beltTexture: THREE.CanvasTexture;
  rollers: THREE.Mesh[];
}

export interface MagicPedestalRig {
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  itemAnchor: THREE.Group;
}

let sharedShadowTex: THREE.CanvasTexture | null = null;
export function getSharedShadowTexture(): THREE.CanvasTexture {
  if (!sharedShadowTex) {
    sharedShadowTex = createContactShadowTexture();
  }
  return sharedShadowTex;
}

export function createContactShadow(radius = 0.85, opacity = 0.42): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({
    map: getSharedShadowTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.025;
  return mesh;
}

export function createRecyclingBin(
  category: WasteCategory,
  lang: Language,
  maxAnisotropy: number
): BinRig {
  const def = BIN_DEFINITIONS[category];
  const group = new THREE.Group();
  group.name = `bin_${category}`;

  const binColor = new THREE.Color(def.colorHex);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: binColor,
    roughness: 0.48,
    metalness: 0.08,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: binColor.clone().offsetHSL(0, 0.04, 0.06),
    roughness: 0.25,
    metalness: 0.12,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.82,
    metalness: 0.1,
  });

  // 1. Rubberized base plinth (y=0 bottom)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.1, 28), darkMat);
  base.position.y = 0.05;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // 2. Tapered main bin body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.58, 1.48, 28), bodyMat);
  body.position.y = 0.82;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Dark inner trash opening disk
  const innerDisk = new THREE.Mesh(
    new THREE.CircleGeometry(0.64, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  innerDisk.rotation.x = -Math.PI / 2;
  innerDisk.position.y = 1.565;
  group.add(innerDisk);

  // 4. Molded collar rim
  const rimMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.71, 0.065, 14, 32),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
    })
  );
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 1.56;
  rimMesh.castShadow = true;
  group.add(rimMesh);

  // 5. Twin side handles
  [-1, 1].forEach((side) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.22), darkMat);
    handle.position.set(side * 0.72, 1.15, 0);
    handle.castShadow = true;
    group.add(handle);
  });

  // 6. Front plaque with category emblem & label
  const initialTex = createBinLabelTexture(category, lang, maxAnisotropy);
  const labelMat = new THREE.MeshStandardMaterial({
    map: initialTex,
    roughness: 0.38,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), labelMat);
  labelMesh.position.set(0, 0.86, 0.665);
  labelMesh.rotation.x = -0.09; // Matches taper of bin front
  group.add(labelMesh);

  // Plaque backing plate
  const plaqueBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.78, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  plaqueBack.position.set(0, 0.86, 0.64);
  plaqueBack.rotation.x = -0.09;
  group.add(plaqueBack);

  // 7. Hinged flip-top lid group (pivoted at back z = -0.68)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 1.59, -0.68);

  const lidBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.76, 0.12, 28), lidMat);
  lidBase.position.set(0, 0.06, 0.68);
  lidBase.castShadow = true;
  lidGroup.add(lidBase);

  const lidDome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.72, 0.16, 28),
    lidMat
  );
  lidDome.position.set(0, 0.19, 0.68);
  lidDome.castShadow = true;
  lidGroup.add(lidDome);

  const lidHandle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.1), darkMat);
  lidHandle.position.set(0, 0.29, 0.68);
  lidHandle.castShadow = true;
  lidGroup.add(lidHandle);

  // Hinge knuckle
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 12), darkMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0, 0);
  lidGroup.add(hinge);

  group.add(lidGroup);

  // Contact shadow
  const shadow = createContactShadow(0.95, 0.35);
  group.add(shadow);

  // Invisible generous hit-box for easy dragging & clicking
  const hitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.82, 2.1, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.position.y = 1.05;
  hitMesh.userData = { binCategory: category };
  group.add(hitMesh);

  group.userData = { binCategory: category };

  return {
    group,
    category,
    lidGroup,
    rimMesh,
    labelMesh,
    openAmount: 0,
    bounceVelocity: 0,
    baseScale: 1,
    updateLabel: (newLang: Language) => {
      const nextTex = createBinLabelTexture(category, newLang, maxAnisotropy);
      const oldTex = labelMat.map;
      labelMat.map = nextTex;
      labelMat.needsUpdate = true;
      oldTex?.dispose();
    },
  };
}

export function createBlackKittenMascot(): KuroRig {
  const group = new THREE.Group();
  group.name = 'kuro_mascot';

  // Rich charcoal-black fur with gentle sheen so silhouette & form read cleanly
  const blackFurMat = new THREE.MeshStandardMaterial({
    color: 0x1b1c20,
    roughness: 0.62,
    metalness: 0.06,
  });
  const softCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x2b2d34,
    roughness: 0.72,
    metalness: 0.04,
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.45,
  });
  const eyeAmberMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.18,
    emissive: 0x451a03,
    emissiveIntensity: 0.25,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.1,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.38,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.2,
    metalness: 0.85,
  });

  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  // 1. Seated plump kitten torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 20), blackFurMat);
  torso.scale.set(0.95, 1.15, 0.92);
  torso.position.set(0, 0.52, 0);
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Soft chest tuft
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 16), softCharcoalMat);
  chest.scale.set(0.9, 1.05, 0.65);
  chest.position.set(0, 0.54, 0.28);
  bodyGroup.add(chest);

  // 2. Haunches (left & right)
  [-1, 1].forEach((side) => {
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), blackFurMat);
    haunch.scale.set(0.85, 1.0, 1.15);
    haunch.position.set(side * 0.28, 0.24, -0.06);
    haunch.castShadow = true;
    bodyGroup.add(haunch);

    const backFoot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), blackFurMat);
    backFoot.scale.set(0.9, 0.6, 1.3);
    backFoot.position.set(side * 0.31, 0.08, 0.18);
    backFoot.castShadow = true;
    bodyGroup.add(backFoot);
  });

  // 3. Front paws
  const pawLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 8, 14), blackFurMat);
  pawLeft.position.set(-0.19, 0.24, 0.34);
  pawLeft.rotation.x = 0.18;
  pawLeft.castShadow = true;
  bodyGroup.add(pawLeft);

  const pawRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 8, 14), blackFurMat);
  pawRight.position.set(0.19, 0.24, 0.34);
  pawRight.rotation.x = 0.18;
  pawRight.castShadow = true;
  bodyGroup.add(pawRight);

  // 4. Eco-green collar & gold bell (default accessory)
  const collarBellGroup = new THREE.Group();
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 12, 24), collarMat);
  collar.rotation.x = Math.PI / 2 + 0.12;
  collar.position.set(0, 0.94, 0.04);
  collarBellGroup.add(collar);

  const bellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 14), goldMat);
  bellMesh.position.set(0, 0.87, 0.36);
  bellMesh.castShadow = true;
  collarBellGroup.add(bellMesh);
  bodyGroup.add(collarBellGroup);

  // 4b. Customizable 3D Outfits attached to bodyGroup
  const outfitGroups: Record<KuroOutfitId, THREE.Group> = {
    none: new THREE.Group(),
    eco_vest: new THREE.Group(),
    hoodie: new THREE.Group(),
    cape: new THREE.Group(),
    overalls: new THREE.Group(),
  };

  // Eco Vest (emerald green ranger vest + gold badge)
  {
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.48, 0.56, 22, 1, false, 0.45, Math.PI * 2 - 0.9),
      vestMat
    );
    wrap.position.set(0, 0.54, 0);
    wrap.castShadow = true;
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), trimMat);
    badge.position.set(0.18, 0.66, 0.37);
    badge.rotation.y = 0.42;
    outfitGroups.eco_vest.add(wrap, badge);
  }

  // Sky Hoodie (cozy sweater + collar hood + pocket)
  {
    const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 });
    const pocketMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 });
    const sweater = new THREE.Mesh(new THREE.SphereGeometry(0.47, 22, 18), hoodieMat);
    sweater.scale.set(0.98, 1.0, 0.95);
    sweater.position.set(0, 0.52, 0);
    sweater.castShadow = true;
    const hoodRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.085, 12, 24), hoodieMat);
    hoodRing.rotation.x = Math.PI / 2 + 0.25;
    hoodRing.position.set(0, 0.92, -0.04);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.08), pocketMat);
    pocket.position.set(0, 0.42, 0.41);
    outfitGroups.hoodie.add(sweater, hoodRing, pocket);
  }

  // Hero Cape (crimson cape draped behind Kuro + gold clasp)
  {
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const capeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.68, 0.88, 22, 1, true, Math.PI * 0.58, Math.PI * 0.84),
      capeMat
    );
    capeMesh.position.set(0, 0.5, -0.06);
    capeMesh.rotation.x = 0.14;
    capeMesh.castShadow = true;
    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), goldMat);
    clasp.position.set(0, 0.9, 0.34);
    outfitGroups.cape.add(capeMesh, clasp);
  }

  // Sunny Overalls (golden yellow overalls + straps + front bib)
  {
    const overallMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.58 });
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.46, 22), overallMat);
    lower.position.set(0, 0.42, 0);
    lower.castShadow = true;
    const bib = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.12), overallMat);
    bib.position.set(0, 0.68, 0.36);
    [-1, 1].forEach((side) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.36), overallMat);
      strap.position.set(side * 0.14, 0.78, 0.14);
      strap.rotation.x = -0.3;
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), buttonMat);
      btn.position.set(side * 0.12, 0.75, 0.41);
      outfitGroups.overalls.add(strap, btn);
    });
    outfitGroups.overalls.add(lower, bib);
  }

  Object.values(outfitGroups).forEach((og) => {
    og.visible = false;
    bodyGroup.add(og);
  });

  // 5. Head group (y = 1.24)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.24, 0.06);
  bodyGroup.add(headGroup);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 22), blackFurMat);
  cranium.scale.set(1.08, 0.96, 0.98);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Soft cheeks/muzzle so nose & smile read clearly
  [-1, 1].forEach((side) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), softCharcoalMat);
    cheek.scale.set(1.1, 0.85, 0.8);
    cheek.position.set(side * 0.11, -0.09, 0.37);
    headGroup.add(cheek);
  });

  // Pointed ears with pink inner triangles
  const buildEar = (side: number) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.3, 0.33, 0);
    ear.rotation.z = -side * 0.28;
    ear.rotation.x = 0.08;

    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 16), blackFurMat);
    outer.position.y = 0.16;
    outer.castShadow = true;
    ear.add(outer);

    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 12), pinkMat);
    inner.position.set(0, 0.13, 0.065);
    inner.scale.set(1, 1, 0.5);
    ear.add(inner);

    return ear;
  };

  const earLeft = buildEar(-1);
  const earRight = buildEar(1);
  headGroup.add(earLeft, earRight);

  // Big expressive eyes
  const buildEye = (side: number) => {
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 14), eyeAmberMat);
    iris.scale.set(0.95, 1.15, 0.55);
    iris.position.set(side * 0.18, 0.04, 0.39);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), pupilMat);
    pupil.scale.set(0.85, 1.15, 0.6);
    pupil.position.set(0, 0, 0.055);
    iris.add(pupil);

    const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), whiteMat);
    catchlight.position.set(0.032, 0.038, 0.09);
    iris.add(catchlight);

    return iris;
  };

  const eyeLeft = buildEye(-1);
  const eyeRight = buildEye(1);
  headGroup.add(eyeLeft, eyeRight);

  // Cute pink nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.05, 3), pinkMat);
  nose.rotation.x = Math.PI;
  nose.rotation.z = Math.PI;
  nose.position.set(0, -0.055, 0.44);
  headGroup.add(nose);

  // Expressive eyebrows (used for sad, curious, playful expressions)
  const browMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55 });
  const browGeo = new THREE.BoxGeometry(0.135, 0.028, 0.032);
  const browLeft = new THREE.Mesh(browGeo, browMat);
  browLeft.position.set(-0.18, 0.18, 0.415);
  browLeft.visible = false;
  const browRight = new THREE.Mesh(browGeo, browMat);
  browRight.position.set(0.18, 0.18, 0.415);
  browRight.visible = false;
  headGroup.add(browLeft, browRight);

  // Rosy cheek blushes (shown during happy / playful / wink)
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    roughness: 0.6,
    transparent: true,
    opacity: 0.52,
  });
  const blushGeo = new THREE.SphereGeometry(0.058, 12, 10);
  const blushLeft = new THREE.Mesh(blushGeo, blushMat);
  blushLeft.scale.set(1.25, 0.65, 0.35);
  blushLeft.position.set(-0.24, -0.08, 0.375);
  blushLeft.visible = false;
  const blushRight = new THREE.Mesh(blushGeo, blushMat);
  blushRight.scale.set(1.25, 0.65, 0.35);
  blushRight.position.set(0.24, -0.08, 0.375);
  blushRight.visible = false;
  headGroup.add(blushLeft, blushRight);

  // Glistening sky-blue teardrops (shown when sad)
  const tearMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    roughness: 0.15,
    transparent: true,
    opacity: 0.9,
  });
  const tearGeo = new THREE.SphereGeometry(0.032, 10, 10);
  const tearLeft = new THREE.Mesh(tearGeo, tearMat);
  tearLeft.scale.set(0.75, 1.35, 0.65);
  tearLeft.position.set(-0.22, -0.065, 0.42);
  tearLeft.visible = false;
  const tearRight = new THREE.Mesh(tearGeo, tearMat);
  tearRight.scale.set(0.75, 1.35, 0.65);
  tearRight.position.set(0.22, -0.065, 0.42);
  tearRight.visible = false;
  headGroup.add(tearLeft, tearRight);

  // Mouth expressions (neutral :3, happy smile, sad frown)
  const mouthLineMat = new THREE.MeshStandardMaterial({
    color: 0xfda4af,
    roughness: 0.4,
    emissive: 0x881337,
    emissiveIntensity: 0.15,
  });
  const mouthNeutral = new THREE.Group();
  [-1, 1].forEach((side) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.009, 6, 12, Math.PI),
      mouthLineMat
    );
    arc.rotation.z = Math.PI; // Downward curve -> U
    arc.position.set(side * 0.031, -0.105, 0.425);
    mouthNeutral.add(arc);
  });
  headGroup.add(mouthNeutral);

  const mouthHappy = new THREE.Group();
  {
    const smileArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.012, 8, 16, Math.PI),
      mouthLineMat
    );
    smileArc.rotation.z = Math.PI;
    smileArc.position.set(0, -0.095, 0.428);
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), pinkMat);
    tongue.scale.set(1.1, 0.85, 0.55);
    tongue.position.set(0, -0.135, 0.422);
    mouthHappy.add(smileArc, tongue);
    mouthHappy.visible = false;
    headGroup.add(mouthHappy);
  }

  const mouthSad = new THREE.Group();
  {
    const frownArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.012, 8, 16, Math.PI),
      mouthLineMat
    );
    // Default torus half-arc forms an upward arch -> sad frown!
    frownArc.position.set(0, -0.145, 0.428);
    mouthSad.add(frownArc);
    mouthSad.visible = false;
    headGroup.add(mouthSad);
  }

  // Delicate whiskers (3 per side)
  const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  [-1, 1].forEach((side) => {
    [-0.14, 0, 0.14].forEach((angle, idx) => {
      const whisker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.004, 0.36, 6),
        whiskerMat
      );
      whisker.rotation.z = Math.PI / 2 + side * angle;
      whisker.position.set(side * 0.32, -0.08 + (idx - 1) * 0.025, 0.34);
      headGroup.add(whisker);
    });
  });

  // 6. Curled animated tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.24, -0.34);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.15, -0.28),
    new THREE.Vector3(0.12, 0.44, -0.4),
    new THREE.Vector3(0.04, 0.72, -0.32),
  ]);
  const tailMesh = new THREE.Mesh(
    new THREE.TubeGeometry(tailCurve, 20, 0.068, 12, false),
    blackFurMat
  );
  tailMesh.castShadow = true;
  tailGroup.add(tailMesh);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), blackFurMat);
  tailTip.position.set(0.04, 0.72, -0.32);
  tailGroup.add(tailTip);
  bodyGroup.add(tailGroup);

  // 5b. Customizable 3D Hats attached to headGroup
  const hatGroups: Record<KuroHatId, THREE.Group> = {
    none: new THREE.Group(),
    leaf_beret: new THREE.Group(),
    sun_hat: new THREE.Group(),
    crown: new THREE.Group(),
    cap: new THREE.Group(),
  };

  // Leaf Beret
  {
    const beretMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), beretMat);
    puff.scale.set(1.12, 0.36, 1.06);
    puff.position.set(0.04, 0.44, 0);
    puff.rotation.z = -0.14;
    puff.castShadow = true;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.14, 8), stemMat);
    stem.position.set(0.05, 0.58, 0);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), beretMat);
    leaf.scale.set(1.5, 0.35, 0.8);
    leaf.position.set(0.14, 0.62, 0);
    leaf.rotation.z = 0.4;
    hatGroups.leaf_beret.add(puff, stem, leaf);
  }

  // Garden Sun Hat
  {
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.78 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.68, 0.05, 26), strawMat);
    brim.position.y = 0.4;
    brim.castShadow = true;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 0.24, 22), strawMat);
    crown.position.y = 0.52;
    crown.castShadow = true;
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.375, 0.065, 22), ribbonMat);
    ribbon.position.y = 0.45;
    hatGroups.sun_hat.add(brim, crown, ribbon);
  }

  // Eco Crown
  {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.18, 16), goldMat);
    band.position.y = 0.48;
    hatGroups.crown.add(band);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const point = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 8), goldMat);
      point.position.set(Math.sin(ang) * 0.24, 0.62, Math.cos(ang) * 0.24);
      hatGroups.crown.add(point);
    }
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.15, emissive: 0x16a34a, emissiveIntensity: 0.3 })
    );
    gem.position.set(0, 0.5, 0.26);
    hatGroups.crown.add(gem);
  }

  // Sporty Cap
  {
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const brimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      capMat
    );
    dome.position.set(0, 0.24, 0);
    dome.castShadow = true;
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.045, 18, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
      brimMat
    );
    visor.position.set(0, 0.26, 0.22);
    visor.rotation.x = 0.12;
    hatGroups.cap.add(dome, visor);
  }

  Object.values(hatGroups).forEach((hg) => {
    hg.visible = false;
    headGroup.add(hg);
  });

  // 5c. Customizable 3D Accessories
  const glassesGroup = new THREE.Group();
  {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.55 });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      transparent: true,
      opacity: 0.35,
    });
    [-1, 1].forEach((side) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 10, 22), frameMat);
      rim.position.set(side * 0.18, 0.04, 0.45);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 18), lensMat);
      lens.position.set(side * 0.18, 0.04, 0.45);
      glassesGroup.add(rim, lens);
    });
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 8), frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.06, 0.45);
    glassesGroup.add(bridge);
    glassesGroup.visible = false;
    headGroup.add(glassesGroup);
  }

  const bowtieGroup = new THREE.Group();
  {
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.42 });
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), bowMat);
    knot.position.set(0, 0.89, 0.38);
    [-1, 1].forEach((side) => {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.16, 12), bowMat);
      wing.rotation.z = side * (Math.PI / 2);
      wing.scale.set(1, 1, 0.45);
      wing.position.set(side * 0.1, 0.89, 0.38);
      bowtieGroup.add(wing);
    });
    bowtieGroup.add(knot);
    bowtieGroup.visible = false;
    bodyGroup.add(bowtieGroup);
  }

  const scarfGroup = new THREE.Group();
  {
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.72 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.72 });
    const neckWrap = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.085, 12, 24), scarfMat);
    neckWrap.rotation.x = Math.PI / 2 + 0.12;
    neckWrap.position.set(0, 0.94, 0.04);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 0.07), scarfMat);
    tail.position.set(0.14, 0.72, 0.36);
    tail.rotation.z = -0.15;
    tail.rotation.x = -0.18;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.08, 0.075), stripeMat);
    stripe.position.set(0.16, 0.62, 0.38);
    stripe.rotation.z = -0.15;
    stripe.rotation.x = -0.18;
    scarfGroup.add(neckWrap, tail, stripe);
    scarfGroup.visible = false;
    bodyGroup.add(scarfGroup);
  }

  const accessoryGroups: Record<KuroAccessoryId, THREE.Group> = {
    collar_bell: collarBellGroup,
    glasses: glassesGroup,
    bowtie: bowtieGroup,
    scarf: scarfGroup,
  };

  const applyWardrobe = (config: KuroWardrobeConfig) => {
    (Object.keys(outfitGroups) as KuroOutfitId[]).forEach((k) => {
      outfitGroups[k].visible = k === config.outfit;
    });
    (Object.keys(hatGroups) as KuroHatId[]).forEach((k) => {
      hatGroups[k].visible = k === config.hat;
    });
    (Object.keys(accessoryGroups) as KuroAccessoryId[]).forEach((k) => {
      // Keep collar_bell visible as subtle neckband when glasses are selected so Kuro still has his collar!
      if (k === 'collar_bell') {
        accessoryGroups[k].visible = config.accessory === 'collar_bell' || config.accessory === 'glasses';
      } else {
        accessoryGroups[k].visible = k === config.accessory;
      }
    });
  };

  // Contact shadow & clickable proxy
  group.add(createContactShadow(0.65, 0.4));
  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 12, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitSphere.position.y = 0.85;
  hitSphere.userData = { isKuro: true };
  group.add(hitSphere);

  group.userData = { isKuro: true };

  return {
    group,
    bodyGroup,
    headGroup,
    tailGroup,
    earLeft,
    earRight,
    eyeLeft,
    eyeRight,
    browLeft,
    browRight,
    mouthNeutral,
    mouthHappy,
    mouthSad,
    tearLeft,
    tearRight,
    blushLeft,
    blushRight,
    pawLeft,
    pawRight,
    bellMesh,
    applyWardrobe,
  };
}

export function createWasteItemModel(itemId: string, maxAnisotropy: number): THREE.Group {
  const g = new THREE.Group();
  g.name = `item_${itemId}`;

  if (itemId === 'plastic_bottle') {
    const plasticMat = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      roughness: 0.14,
      metalness: 0.05,
      transparent: true,
      opacity: 0.84,
      clearcoat: 0.9,
    });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.56, 20), plasticMat);
    body.position.y = 0.28;
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 0.16, 20), plasticMat);
    shoulder.position.y = 0.64;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.09, 16), plasticMat);
    neck.position.y = 0.75;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), capMat);
    cap.position.y = 0.83;
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.22, 20), labelMat);
    label.position.y = 0.3;

    g.add(body, shoulder, neck, cap, label);
  } else if (itemId === 'plastic_cup') {
    const cupMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.18,
      transparent: true,
      opacity: 0.82,
    });
    const drinkMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 });
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.54, 20), cupMat);
    cup.position.y = 0.27;
    const drink = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.42, 18), drinkMat);
    drink.position.y = 0.23;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      cupMat
    );
    dome.position.y = 0.54;
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 10), strawMat);
    straw.position.set(0.04, 0.72, 0);
    straw.rotation.z = -0.18;

    g.add(cup, drink, dome, straw);
  } else if (itemId === 'plastic_bag') {
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.42,
      metalness: 0.05,
    });
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), bagMat);
    pouch.scale.set(1.05, 0.95, 0.65);
    pouch.position.y = 0.28;
    const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.16, 12), bagMat);
    knot.position.y = 0.52;
    [-1, 1].forEach((side) => {
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.028, 8, 16, Math.PI),
        bagMat
      );
      handle.position.set(side * 0.11, 0.58, 0);
      handle.rotation.z = -side * 0.15;
      g.add(handle);
    });
    g.add(pouch, knot);
  } else if (itemId === 'cardboard_box') {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xc28e5c, roughness: 0.85 });
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 });

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.48), boxMat);
    box.position.y = 0.21;
    const flapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.48), boxMat);
    flapLeft.position.set(-0.26, 0.49, 0);
    flapLeft.rotation.z = 0.55;
    const flapRight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.48), boxMat);
    flapRight.position.set(0.26, 0.49, 0);
    flapRight.rotation.z = -0.55;
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.43, 0.49), tapeMat);
    tape.position.y = 0.215;

    g.add(box, flapLeft, flapRight, tape);
  } else if (itemId === 'newspaper') {
    const paperTex = createNewspaperTexture(maxAnisotropy);
    const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.78 });
    const twineMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });

    const roll1 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 18), paperMat);
    roll1.rotation.z = Math.PI / 2;
    roll1.rotation.y = 0.3;
    roll1.position.set(0, 0.14, 0.08);

    const roll2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.58, 18), paperMat);
    roll2.rotation.z = Math.PI / 2;
    roll2.rotation.y = -0.25;
    roll2.position.set(0.02, 0.28, -0.05);

    const band = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.02, 8, 18), twineMat);
    band.rotation.y = Math.PI / 2 + 0.3;
    band.position.set(0, 0.14, 0.08);

    g.add(roll1, roll2, band);
  } else if (itemId === 'milk_carton') {
    const cartonTex = createMilkCartonTexture(maxAnisotropy);
    const cartonMat = new THREE.MeshStandardMaterial({ map: cartonTex, roughness: 0.45 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.36), cartonMat);
    base.position.y = 0.24;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.25, 0.2, 4), whiteMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 0.58;
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 14), capMat);
    spout.position.set(0.07, 0.6, 0.07);
    spout.rotation.x = 0.45;

    g.add(base, roof, spout);
  } else if (itemId === 'banana_peel') {
    const peelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.75 });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.16, 10), tipMat);
    stem.position.y = 0.42;

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.36, 0),
        new THREE.Vector3(Math.cos(angle) * 0.18, 0.24, Math.sin(angle) * 0.18),
        new THREE.Vector3(Math.cos(angle) * 0.34, 0.06, Math.sin(angle) * 0.34),
      ]);
      const petal = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.06, 8, false), peelMat);
      g.add(petal);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), tipMat);
      tip.position.set(Math.cos(angle) * 0.34, 0.06, Math.sin(angle) * 0.34);
      g.add(tip);
    }
    g.add(stem);
  } else if (itemId === 'apple_core') {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.38 });
    const fleshMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.68 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45 });

    const bottomCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
      skinMat
    );
    bottomCap.position.y = 0.2;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 14), fleshMat);
    core.position.y = 0.26;
    const topCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45),
      skinMat
    );
    topCap.position.y = 0.32;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.14, 8), stemMat);
    stem.position.y = 0.56;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), leafMat);
    leaf.scale.set(1.4, 0.35, 0.7);
    leaf.position.set(0.09, 0.58, 0);
    leaf.rotation.z = 0.4;

    g.add(bottomCap, core, topCap, stem, leaf);
  } else if (itemId === 'dry_leaf') {
    const colors = [0xd97706, 0xb45309, 0x65a30d];
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });

    colors.forEach((col, i) => {
      const leafGroup = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.65 });
      const blade = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat);
      blade.scale.set(1.45, 0.16, 0.85);
      blade.position.y = 0.08 + i * 0.05;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 8), stemMat);
      stem.rotation.z = Math.PI / 2;
      stem.position.set(-0.26, 0.08 + i * 0.05, 0);
      leafGroup.add(blade, stem);
      leafGroup.rotation.y = i * 1.15;
      leafGroup.rotation.z = (i - 1) * 0.12;
      g.add(leafGroup);
    });
  } else if (itemId === 'soda_can') {
    const canTex = createSodaCanTexture(maxAnisotropy);
    const wrapMat = new THREE.MeshStandardMaterial({
      map: canTex,
      roughness: 0.28,
      metalness: 0.45,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.88,
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.54, 24), wrapMat);
    body.position.y = 0.31;
    const bottomRim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.05, 24), metalMat);
    bottomRim.position.y = 0.025;
    const topRim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.05, 24), metalMat);
    topRim.position.y = 0.6;
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.14), metalMat);
    tab.position.set(0, 0.635, 0.02);

    g.add(body, bottomRim, topRim, tab);
  } else if (itemId === 'glass_bottle') {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.8,
    });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.46, 22), glassMat);
    body.position.y = 0.23;
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.18, 22), glassMat);
    shoulder.position.y = 0.55;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.18, 18), glassMat);
    neck.position.y = 0.72;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 16), capMat);
    cap.position.y = 0.83;
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.2, 22), labelMat);
    label.position.y = 0.25;

    g.add(body, shoulder, neck, cap, label);
  } else {
    // tin_jar
    const tinMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.25,
      metalness: 0.82,
    });
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.4,
    });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.6 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.44, 24), tinMat);
    body.position.y = 0.22;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.14, 24), bandMat);
    band.position.y = 0.22;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 24), lidMat);
    lid.position.y = 0.47;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), bandMat);
    knob.position.y = 0.54;

    g.add(body, band, lid, knob);
  }

  // Enable shadows on all child meshes
  g.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return g;
}

export function createTransformedTreasureModel(category: WasteCategory, accentHex: string): THREE.Group {
  const g = new THREE.Group();
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    roughness: 0.35,
    metalness: 0.1,
  });

  if (category === 'organic') {
    // Blooming Flower Pot!
    const potMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.72 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.24, 0.42, 20), potMat);
    pot.position.y = 0.21;
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 20), soilMat);
    soil.position.y = 0.41;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.52, 10), stemMat);
    stem.position.y = 0.66;
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), centerMat);
    center.position.y = 0.96;

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), accentMat);
      petal.scale.set(1.1, 0.6, 1.1);
      petal.position.set(Math.cos(angle) * 0.19, 0.96, Math.sin(angle) * 0.19);
      g.add(petal);
    }
    g.add(pot, soil, stem, center);
  } else if (category === 'paper') {
    // Stack of colorful sketchbooks + pencil!
    const cover1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.52), accentMat);
    cover1.position.y = 0.06;
    const cover2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.12, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.45 })
    );
    cover2.position.y = 0.18;
    cover2.rotation.y = 0.15;
    const pencilBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    pencilBody.rotation.z = Math.PI / 2;
    pencilBody.rotation.y = -0.35;
    pencilBody.position.set(0, 0.29, 0);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 })
    );
    tip.rotation.z = -Math.PI / 2;
    tip.rotation.y = -0.35;
    tip.position.set(0.36, 0.29, 0.13);

    g.add(cover1, cover2, pencilBody, tip);
  } else if (category === 'plastic') {
    // Sturdy Eco-Backpack!
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.34), accentMat);
    pack.position.y = 0.34;
    const pocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.32, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 })
    );
    pocket.position.set(0, 0.22, 0.2);
    const topLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.03, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    topLoop.position.set(0, 0.68, 0);
    g.add(pack, pocket, topLoop);
  } else {
    // Mini Recycled Eco-Bicycle / Toy Vehicle!
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.7,
    });
    const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 10, 20), wheelMat);
    w1.position.set(-0.28, 0.23, 0);
    const w2 = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 10, 20), wheelMat);
    w2.position.set(0.28, 0.23, 0);
    const bar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.58, 10), frameMat);
    bar1.rotation.z = Math.PI / 2;
    bar1.position.set(0, 0.38, 0);
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 10), frameMat);
    fork.position.set(0.25, 0.42, 0);
    fork.rotation.z = 0.25;
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32, 10), wheelMat);
    handleBar.rotation.x = Math.PI / 2;
    handleBar.position.set(0.2, 0.58, 0);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), wheelMat);
    seat.position.set(-0.22, 0.48, 0);

    g.add(w1, w2, bar1, fork, handleBar, seat);
  }

  g.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return g;
}

export function createEnvironment(lang: Language, maxAnisotropy: number) {
  const envGroup = new THREE.Group();

  // 1. Expansive sunlit meadow extending to horizon fog
  const grassTex = createGrassTexture(maxAnisotropy);
  const meadowMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 0.92,
    metalness: 0.0,
  });
  const meadow = new THREE.Mesh(new THREE.CircleGeometry(90, 64), meadowMat);
  meadow.rotation.x = -Math.PI / 2;
  meadow.position.y = -0.02;
  meadow.receiveShadow = true;
  envGroup.add(meadow);

  // Rolling gentle hills around the horizon
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x67c947, roughness: 0.95 });
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 34 + (i % 3) * 8;
    const hill = new THREE.Mesh(new THREE.SphereGeometry(12 + (i % 3) * 4, 24, 16), hillMat);
    hill.scale.set(1.6, 0.35, 1.3);
    hill.position.set(Math.cos(angle) * dist, -1.6, Math.sin(angle) * dist);
    hill.receiveShadow = true;
    envGroup.add(hill);
  }

  // Optional coastal ocean ring for Sunny Beach background
  const oceanRing = new THREE.Mesh(
    new THREE.RingGeometry(21, 88, 56),
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.22,
      metalness: 0.14,
      emissive: 0x0369a1,
      emissiveIntensity: 0.12,
    })
  );
  oceanRing.rotation.x = -Math.PI / 2;
  oceanRing.position.y = 0.005;
  oceanRing.visible = false;
  envGroup.add(oceanRing);

  // 2. Central circular stone Eco-Plaza
  const plazaTex = createPlazaStoneTexture(maxAnisotropy);
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(8.2, 8.5, 0.14, 48),
    new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.78 })
  );
  plaza.position.y = -0.06;
  plaza.receiveShadow = true;
  envGroup.add(plaza);

  // Stone border curb
  const curb = new THREE.Mesh(
    new THREE.TorusGeometry(8.35, 0.16, 10, 48),
    new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
  );
  curb.rotation.x = Math.PI / 2;
  curb.position.y = 0.01;
  curb.receiveShadow = true;
  envGroup.add(curb);

  // 3. Wooden Park Welcome Signpost
  const signGroup = new THREE.Group();
  signGroup.position.set(-5.6, 0, -4.4);
  signGroup.rotation.y = 0.42;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
  [-1, 1].forEach((side) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.2, 10), woodMat);
    post.position.set(side * 1.15, 1.1, 0);
    post.castShadow = true;
    signGroup.add(post);
  });
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.05, 0.12), woodMat);
  boardFrame.position.set(0, 1.85, 0);
  boardFrame.castShadow = true;
  signGroup.add(boardFrame);

  let signTex = createSignpostTexture(lang, maxAnisotropy);
  const signFaceMat = new THREE.MeshStandardMaterial({
    map: signTex,
    roughness: 0.48,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 0.88), signFaceMat);
  signFace.position.set(0, 1.85, 0.065);
  signGroup.add(signFace);
  envGroup.add(signGroup);

  // 4. Composite 4-part Eco Trees around the park perimeter
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.88 });
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.72 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.68 });

  const treeCoords = [
    [-11.5, -9],
    [-7.5, -13],
    [0, -14.5],
    [8.2, -12.5],
    [12, -8.5],
    [-13, 3.5],
    [13, 4],
    [10.5, 11],
    [-10.5, 11],
  ];
  treeCoords.forEach(([tx, tz], idx) => {
    const tree = new THREE.Group();
    const scale = 0.9 + (idx % 3) * 0.22;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.2, 10), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 14), leafMat1);
    c1.position.set(0, 2.6, 0);
    c1.castShadow = true;
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 12), leafMat2);
    c2.position.set(0.6, 3.2, 0.3);
    c2.castShadow = true;
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 12), leafMat1);
    c3.position.set(-0.55, 3.1, -0.25);
    c3.castShadow = true;
    tree.add(trunk, c1, c2, c3);
    tree.position.set(tx, 0, tz);
    tree.scale.setScalar(scale);
    envGroup.add(tree);
  });

  // 5. InstancedMesh meadow flowers (60 flowers with tint variation)
  const flowerCount = 60;
  const flowerGeo = new THREE.CylinderGeometry(0.22, 0.08, 0.14, 6);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  const dummy = new THREE.Object3D();
  const palette = [0xf472b6, 0xfacc15, 0x38bdf8, 0xfb923c, 0xc084fc];
  const colorObj = new THREE.Color();

  for (let i = 0; i < flowerCount; i++) {
    const angle = (i / flowerCount) * Math.PI * 2 + (i % 5) * 0.18;
    const r = 9.4 + (i % 7) * 1.45;
    dummy.position.set(Math.cos(angle) * r, 0.07, Math.sin(angle) * r);
    dummy.rotation.y = angle;
    const s = 0.8 + (i % 4) * 0.18;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix);
    colorObj.setHex(palette[i % palette.length]);
    flowers.setColorAt(i, colorObj);
  }
  flowers.instanceMatrix.needsUpdate = true;
  if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  flowers.computeBoundingSphere();
  envGroup.add(flowers);

  // 6. Fluffy 3D Clouds
  const clouds: THREE.Group[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    emissive: 0xe0f2fe,
    emissiveIntensity: 0.15,
  });
  [
    [-14, 11, -18],
    [12, 13, -22],
    [0, 14, -26],
    [20, 10, -14],
  ].forEach(([cx, cy, cz], idx) => {
    const cloud = new THREE.Group();
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 14, 12), cloudMat);
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 12), cloudMat);
    p2.position.set(1.2, -0.2, 0.1);
    const p3 = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 12), cloudMat);
    p3.position.set(-1.1, -0.25, -0.1);
    cloud.add(p1, p2, p3);
    cloud.position.set(cx, cy, cz);
    cloud.userData = { speed: 0.22 + idx * 0.06, baseX: cx };
    clouds.push(cloud);
    envGroup.add(cloud);
  });

  // 7. Conveyor Belt Rig (for Mode 2)
  const conveyorGroup = new THREE.Group();
  conveyorGroup.position.set(0, 0, 2.25);
  conveyorGroup.visible = false;

  const beltTexture = createConveyorTexture(maxAnisotropy);
  const beltSurface = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.12, 1.35),
    new THREE.MeshStandardMaterial({ map: beltTexture, roughness: 0.65 })
  );
  beltSurface.position.y = 0.56;
  beltSurface.receiveShadow = true;
  beltSurface.castShadow = true;
  conveyorGroup.add(beltSurface);

  const railMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.35,
    metalness: 0.25,
  });
  [-0.72, 0.72].forEach((zOff) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.18, 0.1), railMat);
    rail.position.set(0, 0.62, zOff);
    rail.castShadow = true;
    conveyorGroup.add(rail);
  });

  const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
  [-3.6, 0, 3.6].forEach((xOff) => {
    [-0.55, 0.55].forEach((zOff) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.54, 10), legMat);
      leg.position.set(xOff, 0.27, zOff);
      leg.castShadow = true;
      conveyorGroup.add(leg);
    });
  });

  const rollers: THREE.Mesh[] = [];
  const rollerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.5 });
  for (let x = -4.2; x <= 4.2; x += 1.4) {
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.44, 14), rollerMat);
    roller.rotation.x = Math.PI / 2;
    roller.position.set(x, 0.54, 0);
    conveyorGroup.add(roller);
    rollers.push(roller);
  }
  envGroup.add(conveyorGroup);

  // 8. Magic Transformation Pedestal (for Mode 3)
  const pedestalGroup = new THREE.Group();
  pedestalGroup.position.set(0, 0, 1.85);
  pedestalGroup.visible = false;

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.35, 0.44, 32),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
  );
  plinth.position.y = 0.22;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  pedestalGroup.add(plinth);

  const ringMesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.06, 12, 36),
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.25,
      emissive: 0x16a34a,
      emissiveIntensity: 0.4,
    })
  );
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.45;
  pedestalGroup.add(ringMesh);

  const itemAnchor = new THREE.Group();
  itemAnchor.position.set(0, 0.46, 0);
  pedestalGroup.add(itemAnchor);

  envGroup.add(pedestalGroup);

  // 9. Starry Night Sky Dome & Park Fireflies (visible during night)
  const starCount = 180;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.42;
    const rad = 42 + Math.random() * 18;
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * rad;
    starPositions[i * 3 + 1] = Math.cos(phi) * rad + 4;
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const nightStars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xfef9c3,
      size: 0.65,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
    })
  );
  nightStars.visible = false;
  envGroup.add(nightStars);

  const firefliesGroup = new THREE.Group();
  const fireflyMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const fireflyGeo = new THREE.SphereGeometry(0.085, 8, 8);
  const fireflies: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const r = 8.8 + (i % 4) * 2.1;
    const fly = new THREE.Mesh(fireflyGeo, fireflyMat);
    fly.position.set(Math.cos(angle) * r, 0.9 + (i % 3) * 0.65, Math.sin(angle) * r);
    fly.userData = {
      baseY: fly.position.y,
      phase: i * 0.85,
    };
    firefliesGroup.add(fly);
    fireflies.push(fly);
  }
  firefliesGroup.visible = false;
  envGroup.add(firefliesGroup);

  const applyTheme = (bg: ParkBackgroundId, tod: TimeOfDayId) => {
    // Background terrain, hills, tree canopies & flower palettes
    let nextFlowerPalette = [0xf472b6, 0xfacc15, 0x38bdf8, 0xfb923c, 0xc084fc];
    if (bg === 'beach') {
      meadowMat.map = null;
      meadowMat.color.setHex(0xfde68a);
      meadowMat.needsUpdate = true;
      hillMat.color.setHex(0x38bdf8);
      leafMat1.color.setHex(0x10b981);
      leafMat2.color.setHex(0x34d399);
      oceanRing.visible = true;
      nextFlowerPalette = [0xfef08a, 0xfb7185, 0x38bdf8, 0xf8fafc, 0xfdba74];
    } else if (bg === 'autumn') {
      meadowMat.map = grassTex;
      meadowMat.color.setHex(0xeab308);
      meadowMat.needsUpdate = true;
      hillMat.color.setHex(0xd97706);
      leafMat1.color.setHex(0xf97316);
      leafMat2.color.setHex(0xef4444);
      oceanRing.visible = false;
      nextFlowerPalette = [0xf59e0b, 0xef4444, 0xfacc15, 0xfb923c, 0xfef3c7];
    } else if (bg === 'cherry') {
      meadowMat.map = grassTex;
      meadowMat.color.setHex(0xbbf7d0);
      meadowMat.needsUpdate = true;
      hillMat.color.setHex(0xf9a8d4);
      leafMat1.color.setHex(0xf472b6);
      leafMat2.color.setHex(0xfbcfe8);
      oceanRing.visible = false;
      nextFlowerPalette = [0xf472b6, 0xfbcfe8, 0xffffff, 0xfda4af, 0xe879f9];
    } else {
      // meadow default
      meadowMat.map = grassTex;
      meadowMat.color.setHex(0xffffff);
      meadowMat.needsUpdate = true;
      hillMat.color.setHex(0x67c947);
      leafMat1.color.setHex(0x22c55e);
      leafMat2.color.setHex(0x4ade80);
      oceanRing.visible = false;
    }

    for (let i = 0; i < flowerCount; i++) {
      colorObj.setHex(nextFlowerPalette[i % nextFlowerPalette.length]);
      flowers.setColorAt(i, colorObj);
    }
    if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;

    // Time of Day atmospheric effects on clouds, stars & fireflies
    nightStars.visible = tod === 'night';
    firefliesGroup.visible = tod === 'night';
    if (tod === 'sunset') {
      cloudMat.color.setHex(0xfed7aa);
      cloudMat.emissive.setHex(0xfb923c);
      cloudMat.emissiveIntensity = 0.28;
    } else if (tod === 'night') {
      cloudMat.color.setHex(0x475569);
      cloudMat.emissive.setHex(0x1e293b);
      cloudMat.emissiveIntensity = 0.35;
    } else {
      cloudMat.color.setHex(0xffffff);
      cloudMat.emissive.setHex(0xe0f2fe);
      cloudMat.emissiveIntensity = 0.15;
    }
  };

  return {
    envGroup,
    clouds,
    fireflies,
    nightStars,
    conveyor: { group: conveyorGroup, beltTexture, rollers } as ConveyorRig,
    pedestal: { group: pedestalGroup, ringMesh, itemAnchor } as MagicPedestalRig,
    applyTheme,
    updateSignLanguage: (newLang: Language) => {
      const nextTex = createSignpostTexture(newLang, maxAnisotropy);
      signFaceMat.map = nextTex;
      signFaceMat.needsUpdate = true;
      signTex.dispose();
      signTex = nextTex;
    },
  };
}

export function createWardrobeSpace(): THREE.Group {
  const closet = new THREE.Group();
  closet.name = 'kuro_wardrobe_space';
  closet.visible = false;

  const oakMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
  const trimOakMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.72 });
  const creamInteriorMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.85 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.85 });

  // 1. Bright warm-cream interior back & floor so black kitten Kuro contrasts crisply
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.2, 0.14), creamInteriorMat);
  backPanel.position.set(0, 1.85, -0.82);
  backPanel.receiveShadow = true;
  closet.add(backPanel);

  const outerBack = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.4, 0.12), oakMat);
  outerBack.position.set(0, 1.85, -0.92);
  outerBack.castShadow = true;
  closet.add(outerBack);

  // Side cabinet walls
  [-1, 1].forEach((side) => {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.4, 1.6), oakMat);
    sideWall.position.set(side * 1.92, 1.85, -0.1);
    sideWall.castShadow = true;
    sideWall.receiveShadow = true;
    closet.add(sideWall);
  });

  // Top crown cornice & interior shelf
  const topRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.24, 1.8), trimOakMat);
  topRoof.position.set(0, 3.58, -0.1);
  topRoof.castShadow = true;
  closet.add(topRoof);

  const upperShelf = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.1, 1.4), oakMat);
  upperShelf.position.set(0, 2.9, -0.15);
  closet.add(upperShelf);

  // Storage drawer plinth base
  const drawerBase = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.36, 1.65), trimOakMat);
  drawerBase.position.set(0, 0.18, -0.1);
  drawerBase.receiveShadow = true;
  drawerBase.castShadow = true;
  closet.add(drawerBase);

  // Cozy floor deck inside closet
  const closetFloor = new THREE.Mesh(new THREE.BoxGeometry(3.72, 0.08, 1.52), creamInteriorMat);
  closetFloor.position.set(0, 0.35, -0.08);
  closetFloor.receiveShadow = true;
  closet.add(closetFloor);

  // 2. Wide-open Double Wardrobe Doors angled outward
  [-1, 1].forEach((side) => {
    const doorPivot = new THREE.Group();
    doorPivot.position.set(side * 1.92, 1.85, 0.68);
    doorPivot.rotation.y = side * 0.92;

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.75, 3.05, 0.1), oakMat);
    doorPanel.position.set(-side * 0.88, 0, 0);
    doorPanel.castShadow = true;
    doorPivot.add(doorPanel);

    const doorInset = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.55, 0.04), creamInteriorMat);
    doorInset.position.set(-side * 0.88, 0, -0.05);
    doorPivot.add(doorInset);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), brassMat);
    knob.position.set(-side * 1.56, 0, 0.08);
    doorPivot.add(knob);

    closet.add(doorPivot);
  });

  // 3. Wooden Hanging Rod & Colorful Miniature Garments on Hangers
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.65, 12), brassMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, 2.58, -0.2);
  closet.add(rod);

  [
    { x: -1.35, col: 0x0284c7 },
    { x: -0.98, col: 0xeab308 },
    { x: 1.32, col: 0xdc2626 },
  ].forEach(({ x, col }) => {
    const garment = new THREE.Group();
    garment.position.set(x, 2.24, -0.2);
    const shirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.44, 0.14),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
    );
    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI),
      brassMat
    );
    hook.position.y = 0.28;
    garment.add(shirt, hook);
    closet.add(garment);
  });

  // 4. Cozy Circular Woven Rug right in front/inside the wardrobe where Kuro stands
  const rugOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.4, 0.045, 32),
    new THREE.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.9 })
  );
  rugOuter.position.set(0, 0.025, 0.95);
  rugOuter.receiveShadow = true;
  closet.add(rugOuter);

  const rugInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 })
  );
  rugInner.position.set(0, 0.03, 0.95);
  rugInner.receiveShadow = true;
  closet.add(rugInner);

  // Warm dressing-room interior light so Kuro's dark fur & outfits gleam cleanly
  const closetLight = new THREE.PointLight(0xfffbeb, 3.2, 7.5);
  closetLight.position.set(0, 2.65, 1.25);
  closet.add(closetLight);

  return closet;
}
