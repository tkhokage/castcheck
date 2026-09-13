# CASTCHECK scroll world

The public landing page follows an original actor around a miniature world to a theater with comedy and tragedy masks. Signed-in actors retain the direct workspace home. Four chapters provide immediate access to discovery, import, verification guidance, account creation and agency matching.

The editable Blender scene was authored through Higgsfield 3D Jutsu. Project: https://higgsfield.ai/3d-jutsu/8fb4bcc8-e0ba-4919-911b-972e1a82aa65, committed revision 1. `scripts/create-world.py` is the reproducible scene source for that environment's `bpy` and `artifacts` API. `public/world/castcheck-world.glb` is the 1.09 MB exported scene; `preview.png` is the rendered fallback. All geometry is original procedural geometry; no third-party character assets were copied.

`World` rotates 1.8 radians with page progress. `Runner` and its limb pivots remain independent for a scroll-driven stride and the final entrance. React Three Fiber renders on demand with DPR capped at 1.5. The scene has no autonomous continuous loop. A separate client bundle loads the 3D runtime. Reduced-motion preferences default to the static image, and readers can pause the animation. Content, links and forms remain HTML and work without WebGL.

Validation: inspected the Blender render and browser desktop/arrival/mobile screenshots. `node scripts/landing-browser.mjs` verifies the canvas, arrival view, pause control, reduced motion, mobile overflow and discovery navigation. These are local browser checks, not real-device performance measurements.

Mobbin reference search was attempted and rejected because the account requires a paid plan. The implementation is an original design; no Mobbin references or Lovable output were used.
