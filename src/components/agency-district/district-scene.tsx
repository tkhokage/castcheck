"use client";
import { Vector3 } from "three";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { districtPosition, type DistrictAgency } from "@/lib/agency-district";
export default function DistrictScene({ agencies, selectedId, onSelect }: {
  agencies: DistrictAgency[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const [markers, setMarkers] = useState<{x:number; y:number}[]>([]);
  const [available] = useState(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      const supported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return supported;
    } catch { return false; }
  });
  if (!available) return <p role="status">Your browser cannot display 3D. Use the agency buttons or complete list.</p>;
  return <div className="relative h-80 overflow-hidden rounded-xl bg-slate-950 sm:h-96">
    <div aria-hidden="true" className="h-full" style={{ touchAction: "pan-y" }}>
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [17, 22, 23], fov: 35 }}
        onCreated={({ camera, gl }) => { camera.lookAt(0, 0, 0); gl.domElement.style.touchAction = "pan-y"; }}
        fallback={<p className="p-6 text-white">3D is unavailable. Use the agency buttons below.</p>}>
        <BuildingLabels count={agencies.length} onProject={setMarkers} />
        <color attach="background" args={["#0b1224"]} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 12, 6]} color="#ffcf96" intensity={3} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
          <planeGeometry args={[22, 18]} /><meshStandardMaterial color="#243248" />
        </mesh>
        {agencies.map((agency, i) => <group key={agency.id} position={districtPosition(i, agencies.length)}
          onClick={e => { e.stopPropagation(); onSelect(agency.id); }}>
          <mesh position={[0, 1, 0]}><boxGeometry args={[1.9, 2, 2]} /><meshStandardMaterial color={selectedId === agency.id ? "#2dd4bf" : "#d1bda3"} /></mesh>
          <mesh position={[0, 2.1, 0]}><boxGeometry args={[2.15, 0.2, 2.2]} /><meshStandardMaterial color="#456072" /></mesh>
          {[-0.5, 0.5].map(x => <mesh key={x} position={[x, 1.3, 1.01]}>
            <boxGeometry args={[0.45, 0.65, 0.04]} /><meshStandardMaterial color="#ffd48a" emissive="#ffba55" emissiveIntensity={0.6} />
          </mesh>)}
          <mesh position={[0, 0.4, 1.02]}><boxGeometry args={[0.4, 0.8, 0.05]} /><meshStandardMaterial color="#243248" /></mesh>
        </group>)}
      </Canvas>
    </div>
    {markers.map((p, i) => <button key={agencies[i]?.id ?? i} aria-label={"Select " + agencies[i]?.name} title={agencies[i]?.name} onClick={() => { if (agencies[i]) onSelect(agencies[i].id); }} className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-teal-300 bg-slate-950 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" style={{left:p.x + "%", top:p.y + "%"}}>{i + 1}</button>)}
    <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-slate-950 px-2 py-1 text-xs text-white">Tap a building. Agency names and keyboard controls are below.</p>
  </div>;
}

function BuildingLabels({ count, onProject }: {count: number; onProject: (points: {x:number; y:number}[]) => void}) {
  const {camera, size} = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    onProject(Array.from({length:count}, (_, i) => {
      const [x,,z] = districtPosition(i, count);
      const p = new Vector3(x, 3, z).project(camera);
      return {x: (p.x + 1) * 50, y: (1 - p.y) * 50};
    }));
  }, [camera, size.width, size.height, count, onProject]);
  return null;
}
