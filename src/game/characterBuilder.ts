import * as THREE from 'three';

export interface DriverCharacter {
  root: THREE.Group;
  updateWalk: (isMoving: boolean, dt: number) => void;
  dispose: () => void;
}

export function buildDriverCharacter(): DriverCharacter {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x181c24,
    roughness: 0.72,
    metalness: 0.1,
  });
  const accentStripeMat = new THREE.MeshStandardMaterial({
    color: 0xc92a2a,
    roughness: 0.45,
    metalness: 0.2,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.85,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd6a485,
    roughness: 0.65,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.5,
  });
  materials.push(jacketMat, accentStripeMat, pantsMat, skinMat, shoeMat);

  // Torso (Racing Bomber Jacket)
  const torsoGeo = new THREE.BoxGeometry(0.46, 0.56, 0.24);
  geometries.push(torsoGeo);
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.position.y = 1.12;
  torso.castShadow = true;
  root.add(torso);

  const stripeGeo = new THREE.BoxGeometry(0.48, 0.08, 0.25);
  geometries.push(stripeGeo);
  const stripe = new THREE.Mesh(stripeGeo, accentStripeMat);
  stripe.position.y = 1.18;
  root.add(stripe);

  // Head + Cap
  const headGeo = new THREE.SphereGeometry(0.145, 14, 12);
  geometries.push(headGeo);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.56;
  head.castShadow = true;
  root.add(head);

  const capGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.09, 14);
  geometries.push(capGeo);
  const cap = new THREE.Mesh(capGeo, accentStripeMat);
  cap.position.y = 1.65;
  root.add(cap);

  const brimGeo = new THREE.BoxGeometry(0.18, 0.025, 0.14);
  geometries.push(brimGeo);
  const brim = new THREE.Mesh(brimGeo, jacketMat);
  brim.position.set(0, 1.62, -0.15);
  root.add(brim);

  // Articulated Limbs (pivoted at shoulders & hips)
  const armGeo = new THREE.BoxGeometry(0.12, 0.48, 0.12);
  armGeo.translate(0, -0.22, 0);
  const legGeo = new THREE.BoxGeometry(0.16, 0.68, 0.16);
  legGeo.translate(0, -0.34, 0);
  const shoeGeo = new THREE.BoxGeometry(0.17, 0.1, 0.24);
  geometries.push(armGeo, legGeo, shoeGeo);

  const leftArm = new THREE.Mesh(armGeo, jacketMat);
  leftArm.position.set(-0.31, 1.36, 0);
  leftArm.castShadow = true;

  const rightArm = new THREE.Mesh(armGeo, jacketMat);
  rightArm.position.set(0.31, 1.36, 0);
  rightArm.castShadow = true;

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.82, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.castShadow = true;
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.72, -0.04);
  leftLeg.add(leftLegMesh, leftShoe);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.82, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.castShadow = true;
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.72, -0.04);
  rightLeg.add(rightLegMesh, rightShoe);

  root.add(leftArm, rightArm, leftLeg, rightLeg);

  let walkPhase = 0;

  return {
    root,
    updateWalk: (isMoving: boolean, dt: number) => {
      if (isMoving) {
        walkPhase += dt * 10.5;
        const swing = Math.sin(walkPhase) * 0.55;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.8;
        rightArm.rotation.x = swing * 0.8;
        torso.position.y = 1.12 + Math.abs(Math.cos(walkPhase)) * 0.03;
      } else {
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.18);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.18);
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.18);
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.18);
        torso.position.y = THREE.MathUtils.lerp(torso.position.y, 1.12, 0.18);
      }
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
