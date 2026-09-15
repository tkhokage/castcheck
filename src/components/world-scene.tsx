"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MathUtils, type Group } from "three";

function World({ paused, onReady }: { paused: boolean; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, "/world/castcheck-world.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const root = useRef<Group>(null);
  const target = useRef(0);
  const current = useRef(0);
  const invalidate = useThree(s => s.invalidate);
  const size = useThree(s => s.size);
  const get = useThree(s => s.get);
  useEffect(() => { const { camera } = get(); camera.zoom = Math.min(size.width / 8.3, size.height / 8.5); camera.updateProjectionMatrix(); invalidate(); }, [get, size, invalidate]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => {
    const update = () => {
      const container = document.getElementById("actor-journey");
      if (!container || paused) return;
      const rect = container.getBoundingClientRect();
      target.current = MathUtils.clamp(-rect.top / Math.max(1, rect.height - innerHeight), 0, 1);
      invalidate();
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [paused, invalidate]);
  useFrame((_, delta) => {
    if (paused || !root.current) return;
    const objects = { world: root.current.getObjectByName("World"), runner: root.current.getObjectByName("Runner"), limbs: ["LeftLeg", "RightLeg", "LeftArm", "RightArm"].map(n => root.current?.getObjectByName(n)) };
    current.current = MathUtils.damp(current.current, target.current, 10, Math.min(delta, .05));
    const progress = current.current;
    if (objects.world) objects.world.rotation.z = progress * 1.8;
    if (objects.runner) {
      objects.runner.position.z = .8 - Math.max(0, (progress - .9) / .1) * .45;
      objects.runner.position.y = 3.1 + Math.abs(Math.sin(progress * 100)) * .045 * (1 - progress);
      objects.runner.visible = progress < .994;
    }
    objects.limbs.forEach((limb, i) => { if (limb) limb.rotation.z = Math.sin(progress * 100 + (i % 2 ? Math.PI : 0)) * .55 * (i > 1 ? -1 : 1) * (1 - Math.max(0, (progress - .94) / .06)); });
    if (Math.abs(progress - target.current) > .0001) invalidate();
  });
  return <primitive ref={root} object={scene} />;
}

export default function WorldScene({ paused, onReady }: { paused: boolean; onReady: () => void }) {
  return <Canvas className="world-canvas" orthographic camera={{ position: [5, 4.8, 11], zoom: 58 }} dpr={[1, 1.5]} frameloop="demand" gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => { camera.lookAt(0, .5, 0); }}>
    <ambientLight intensity={1.7} /><directionalLight position={[-4, 7, 8]} intensity={3} /><directionalLight position={[5, 2, -3]} intensity={1.4} />
    <Suspense fallback={null}><World paused={paused} onReady={onReady} /></Suspense>
  </Canvas>;
}
