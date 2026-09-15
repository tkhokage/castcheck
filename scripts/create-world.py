import bpy, math
from mathutils import Vector

def material(name, color, roughness=.68, metallic=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=roughness; p.inputs['Metallic'].default_value=metallic
    return m
green=material('Sage enamel',(.29,.46,.33)); land=material('Pistachio islands',(.64,.73,.45)); cream=material('Warm limestone',(.91,.83,.65)); orange=material('Terracotta',(.78,.25,.105)); dark=material('Deep forest',(.045,.13,.1)); gold=material('Marigold',(.98,.62,.13)); skin=material('Warm skin',(.57,.29,.16)); white=material('Ivory',(.98,.96,.87)); blue=material('Ocean mist',(.37,.62,.59))
def empty(name,parent=None):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o); o.parent=parent; return o
world=empty('World'); runner=empty('Runner')
def sphere(name,loc,scale,mat,parent=None,segments=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=16,location=loc); o=bpy.context.object; o.name=name; o.scale=scale; o.data.materials.append(mat); o.parent=parent
    for p in o.data.polygons:p.use_smooth=True
    return o
def cube(name,loc,scale,mat,parent=None,bevel=.07):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.scale=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(mat); o.parent=parent
    if bevel: mod=o.modifiers.new('Soft crafted edges','BEVEL'); mod.width=bevel; mod.segments=3; o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def tube(name,points,radius,mat,parent=None):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=radius; c.bevel_resolution=3; s=c.splines.new('POLY'); s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o); o.data.materials.append(mat); o.parent=parent; return o
sphere('Little planet',(0,0,0),(3,3,3),blue,world,64)
# Rounded landmasses follow the sphere surface; each is a cluster of shallow caps.
for j,(theta,phi,size) in enumerate([(.4,.5,.8),(.1,-.4,.7),(-.6,.8,.6),(.8,-1,.6),(-.8,-1.4,.8),(1.5,.1,.8),(2.3,.6,.7),(-2,.5,.7)]):
    n=Vector((math.sin(theta)*math.cos(phi),math.sin(phi),math.cos(theta)*math.cos(phi)))
    o=sphere('Island_%02d'%j,n*2.91,(size,size*.72,.16),land,world); o.rotation_euler=n.to_track_quat('Z','Y').to_euler()
# A cream path follows a great circle around the world.
pts=[(3.015*math.sin(a),-.33,3.015*math.cos(a)) for a in [i*2*math.pi/180 for i in range(181)]]
tube('Audition trail',pts,.085,cream,world)
for i,a in enumerate([-.9,-.5,.45,.85,1.25,2.3,-1.6]):
    root=empty('Tree_%02d'%i,world); root.location=(3.01*math.sin(a),.5,3.01*math.cos(a)); root.rotation_euler[1]=a
    cube('Tree trunk',(0,0,.16),(.07,.07,.4),orange,root,.025)
    sphere('Topiary',(0,0,.45),(.23,.22,.36),green,root)
# Theater is placed ahead on the route and arrives at the runner as the world turns.
theater=empty('Theater',world); a=1.8; theater.location=(3.02*math.sin(a),-.32,3.02*math.cos(a)); theater.rotation_euler[1]=a
cube('Theater limestone facade',(0,.13,.56),(1.26,.72,1.12),cream,theater)
cube('Theater cornice',(0,.1,1.12),(1.42,.89,.14),orange,theater)
cube('Theater stage portal',(0,-.245,.36),(.53,.04,.65),dark,theater)
cube('Left velvet curtain',(-.2,-.28,.38),(.12,.06,.65),orange,theater)
cube('Right velvet curtain',(.2,-.28,.38),(.12,.06,.65),orange,theater)
for x in [-.51,.51]:cube('Theater pilaster',(x,-.28,.5),(.13,.11,.95),white,theater)
cube('Welcome step',(0,-.49,.045),(.89,.43,.09),cream,theater)
for i,x in enumerate([-.17,.17]):
    mask=sphere('Comedy mask' if i==0 else 'Tragedy mask',(x,-.32,.93),(.16,.045,.2),gold if i==0 else white,theater)
    for dx in [-.057,.057]:sphere('Mask eye',(x+dx,-.367,.97),(.021,.012,.028),dark,theater,16)
    points=[]
    for k in range(13):
        t=-1+k/6; points.append((x+t*.078,-.37,.88+(t*t*.037 if i==0 else -t*t*.037)))
    tube('Mask smile' if i==0 else 'Mask frown',points,.013,dark,theater)
# Original runner: separate limb pivots for scroll-driven stride in the browser.
runner.location=(0,-.38,3.1)
sphere('Runner jacket',(0,0,.66),(.18,.125,.25),orange,runner)
sphere('Runner head',(.025,0,1.0),(.145,.13,.16),skin,runner)
sphere('Runner hair',(.0,.015,1.09),(.15,.14,.095),dark,runner)
sphere('Runner nose',(.158,-.01,1.0),(.043,.045,.04),skin,runner,16)
for side,y in [('Left',-.09),('Right',.09)]:
    leg=empty(side+'Leg',runner); leg.location=(0,y,.48)
    cube(side+' trouser',(0,0,-.17),(.12,.13,.34),dark,leg,.055)
    cube(side+' sneaker',(.07,0,-.38),(.25,.15,.13),white,leg,.05)
    arm=empty(side+'Arm',runner); arm.location=(0,y*1.65,.77)
    cube(side+' sleeve',(.02,0,-.11),(.12,.12,.26),orange,arm,.055)
    sphere(side+' hand',(.09,0,-.26),(.075,.065,.08),skin,arm,16)
    leg.rotation_euler[1]=.55 if side=='Left' else -.55
    arm.rotation_euler[1]=-.65 if side=='Left' else .65
# Small floating clouds sit beyond the path.
for i,(x,y,z) in enumerate([(-3.6,.7,1.6),(3.1,1,2.3),(-1.6,1,3.4)]):
    for j in range(3):sphere('Cloud_%s_%s'%(i,j),(x+(j-1)*.23,y,z+(.09 if j==1 else 0)),(.34,.19,.19),white,None)
bpy.ops.object.camera_add(location=(7,-12,7)); cam=bpy.context.object; cam.name='Delivery camera'; cam.rotation_euler=(Vector((0,0,.5))-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.type='ORTHO'; cam.data.ortho_scale=9.5; bpy.context.scene.camera=cam
for name,loc,energy,size in [('Key',(-3,-5,8),1400,5),('Fill',(5,-2,4),650,4)]:
    bpy.ops.object.light_add(type='AREA',location=loc); o=bpy.context.object; o.name=name; o.data.energy=energy; o.data.shape='DISK'; o.data.size=size; o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
bpy.context.scene.world=bpy.data.worlds.new('Studio ambient')
bpy.context.scene.world.color=(.45,.45,.45)
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.render.resolution_x=960; scene.render.resolution_y=960; scene.render.resolution_percentage=100; scene.render.film_transparent=True; scene.render.image_settings.file_format='PNG'
target=artifacts.file(name='castcheck-world-preview.png',media_type='image/png'); scene.render.filepath=target.path; bpy.ops.render.render(write_still=True); target.publish()
result={'objects':len(bpy.data.objects),'semanticRoots':['World','Runner'],'theaterArrivalRadians':1.8}
