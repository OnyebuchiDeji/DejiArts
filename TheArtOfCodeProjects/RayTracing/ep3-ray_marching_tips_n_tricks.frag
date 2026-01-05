#version 330 core

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 0.001;

/**
    Demonstrating RayMarching More Raymarching Techniques!
*/

mat2 Rot(float a)
{
    float s = sin(a); float c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k)
{
    float h = clamp(0.5 + 0.5 * (b-a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    //  ensure projected value doesn't fall outside the line segment AB
    t = clamp(t, 0.0, 1.0);

    //  get point c
    vec3 c = a + t * ab;
     
    //  return distance!
    return length(p - c) - r;
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    t = clamp(t, 0.0, 1.0);
    
    //  get point c
    vec3 c = a + t * ab;
     
    // x is d for the capsul

    float x = length(p - c) - r;
    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0.0));

    //  without interior distance, there'll be artefacts!
    float i = min(max(x, y), 0.0);

    return e + i;
}

float sdTorus(vec3 p, vec2 r)
{
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

float sdBox(vec3 p, vec3 s)
{
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

float MakeBoxShell(vec3 p)
{
    //  First, an arbitrarily rotated plane
    //  calculated as the dot product between the rat
    //  and the normal to the  plane --- which is a straight-up
    //  -pointing normal vec3(0, 1, 0)
    //  Also, the normal must be a length of 1
    //  move plane by subtracting from the distance
    float planeHeight = 1.0;
    float plane = dot(p, normalize(vec3(1, 1, 1))) - planeHeight;
    //  making shells with a box / cube
    //  note the box returns a positive no. for
    //  positions outside the box.
    //  ON the box surface, it returns 0
    //  and inside negative
    float box = sdBox(p - vec3(0, 1, 0), vec3(1));
    //  so by doing this. It makes both outuside and inside
    //  positive, with only when ON the box surface being 0
    //  so it treats inside the box as outside, resulting in a thing
    //  shell. 
    //  By subtracting a small number, the thickness can be modified!
    box = abs(box) - .2;
    float d = max(plane, box);
    return d;
}

//  THese wavy plane examples use displacement mapping
float WavyPlane1(vec3 p)
{
    //  Demonstrating applying a wave function on the plane
    //  Marching for a plane is quite expensive
    //  It takes a lot of steps to get to the end
    //  so an expensive function for the ground plane
    //  can make it quite slow!
    float planeHeight = sin(p.x);
    float plane = dot(p, normalize(vec3(0, 1, 0))) - planeHeight;
    float box = sdBox(p - vec3(0., 1., 0.), vec3(1.0));
    float d = min(plane, box);
    return d;
}

//  Demonstrating and explaining fix for more steeper wabes
//  note the sin(p.x * 1.5) --- the higher frequency makes it steeper 
float WavyPlane2(vec3 p)
{
    //  Demonstrating applying a wave function on the plane
    //  By making the waves more frequent, artefacts start appearing
    //  because of stepping inside the plane's surface.
    //  Fix this by going to the RayMarch loop and changing
    //  `dS < SURF_DIST` to `abs(dS) < SURF_DIST` in the post condition 
    //  this makes the RayMarch step back when it's entered through the plane
    //  surface so much that it becomes negative when it gets underneath the surface
    //  (since it's only meant to get very close to the surface but still positive)
    //  , to make it positive again. Thereby removing the artefacts!
    float planeHeight = sin(p.x * 1.5);
    float plane = dot(p, normalize(vec3(0, 1, 0))) - planeHeight;
    float box = sdBox(p - vec3(0., 1., 0.), vec3(1.0));
    float d = min(plane, box);
    return d;
}

float WavyPlane3(vec3 p)
{
    
    //  Demonstrating applying a wave function on the plane
    //  By making the waves so much more frequent, more
    //  needs to be done to fix the appearing artefacts!
    //  In this case, because of how steep it is, the RayMarch 
    //  steps step right through!
    //  solution: make the Ray March steps small enough so that it is
    //  at least inside the surface to make the `abs` solution fix it
    //  with the step backs
    //  it's fixed by doing `d = min(plane * .5, box)`
    //  But this makes the process more expensive so you should avoid this
    //  because now at each step, one's only marching half as it was before,
    //  making marching twice as expensive
    //  Always multiply the step scale on the item that needs it!
    //  rather than doing `return d * 0.5` which causes it to require more
    //  steps for both the plane and box.

    //  Lastly, always choose the largest scale value that works!
    //  e.g. 0.6 in place of 0.5 
    float planeHeight = sin(p.x * 2.5);
    float plane = dot(p, normalize(vec3(0, 1, 0))) - planeHeight;
    float box = sdBox(p - vec3(0., 1., 0.), vec3(1.0));
    float d = min(plane * 0.6, box);
    return d;
}

float DistortedBoxStatic(vec3 p)
{
    //  Note the distortion change from * 2.5 to 6.5
    //  it makes the distortion more, hence more artefacts
    //  so accommodate for it by doing
    //  `float d = min(plane, box * 0.6);`
    float displacement = sin(p.x * 6.5) * .2;
    float plane = dot(p, normalize(vec3(0, 1, 0))); // - displacement;

    
    float box = sdBox(p - vec3(0., 1., 0.), vec3(1.0)) - displacement;

    float d = min(plane, box * 0.6);

    return d;
}

float DistortedBoxDynamic(vec3 p)
{
    float distortion_wave_amp = 0.02;
    float displacement = sin(p.x * 7.5 + u_time * 3.0) * distortion_wave_amp;
    float plane = dot(p, normalize(vec3(0, 1, 0))); // - displacement;

    
    float box = sdBox(p - vec3(0., 1., 0.), vec3(1.0)) - displacement;

    float d = min(plane, box * 0.6);

    return d;
}

//  Not a proper flag effect but has the idea
float FlagEffectPseudo(vec3 p)
{
    //  Flag Effect!
    float distortion_wave_amp = 0.05;
    //  uses displacement mapping
    float displacement = sin(p.x * 7.5 + u_time * 3.0) * distortion_wave_amp;
    float plane = dot(p, normalize(vec3(0, 1, 0))); // - displacement;
    //  Make Box Thinner and Longer in Width!
    float box = sdBox(p - vec3(0., 1., 0.), vec3(2.0, 1.0, 0.1)) - displacement;
    float d = min(plane, box * 0.6);
    return d;
}

float FlagEffectProper(vec3 p)
{
    //  Proper Flag Effect!
    //  Requires change of the input position!
    //  Uses position offset for flag effect!
    //  as for every X the flag is drawn at a new Z value!
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    bp.z += sin(bp.x * 5.0 + u_time * 3.0) * 0.1;
    float box = sdBox(bp, vec3(2.0, 1.0, 0.1));
    float plane = dot(p, normalize(vec3(0, 1, 0)));
    float d = min(plane, box);
    return d;
}

float BoxScaleShaping(vec3 p)
{    
    float plane = dot(p, normalize(vec3(0, 1, 0)));
    //  shaping the box along the length using scale
    //  note! as scale increases, box size decreases
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    //  use the mix such that the bottom of the box is 
    //  bigger and as it goes up, it decreases in size
    //  since small scale 1.0 doesn't reduce the size,
    //  and smoothstep's bp.y starts from -1.0 to 1.0, maling mix
    //  go from 1. to 3. in scale
    //  mix(a, b, fn(c, d, y)): a = smallest scale/biggest size
    //  , b = biggest scale/smallest size.
    //  fn smoothstep function that goes from -1 to 1 based on
    //  bp.y, which translates the mix's lerp from 1.0 to 3.0
    //  consider the first: mix(a, b, fn(-1. ,1., bp.y))
    //  this 
    //  consider the second: mix(a, b,  fn(0.0., 1.0, bp.y))
    float scale = mix(1.0, 3.0, smoothstep(0.0, 1.0, bp.y));
    bp.xz *= scale;
    //  dividing by scale to make distance much smaller for smaller
    //  steps to prevent artefacts!
    float box = sdBox(bp, vec3(1.0, 1.0, 1.0)) / scale;
    float d = min(plane, box);
    return d;
}

float BoxTwist1(vec3 p)
{
    float plane = dot(p, normalize(vec3(0, 1, 0)));
    //  Box Twisting
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    float scale = mix(1.0, 3.0, smoothstep(-1.0, 1.0, bp.y));
    bp.xz *= scale;
    // bp.xz *= Rot(1.);   //  rotates around axis
    //  then make rotation dependent on height to cause the twist
    float twistMag = 2.5;
    bp.xz *= Rot(bp.y * twistMag);
    float box = sdBox(bp, vec3(1.0, 1.0, 1.0)) / scale;
    float d = min(plane, box * (1/twistMag));
    return d;
}

float BoxTwistModulated(vec3 p)
{
    float plane = dot(p, normalize(vec3(0, 1, 0)));
    
    //  Box Twisting
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    float scale = mix(1.0, 3.0, smoothstep(-1.0, 1.0, bp.y));
    bp.xz *= scale;

    // bp.xz *= Rot(1.);   //  rotates around axis

    //  then make rotation dependent on height to cause the twist
    // float twistMag = 0.5;
    // bp.xz *= Rot(bp.y * twistMag);

    //  A modulation to cause twist to happen after a certain
    //  height up the box!
    bp.xz *= Rot(smoothstep(0.0, 1.0, bp.y));
    float box = sdBox(bp, vec3(1.0, 1.0, 1.0)) / scale;
    // float d = min(plane, box * (1 / twistMag));
    float d = min(plane, box);
    return d;
}

float BoxMirroring(vec3 p)
{
    float plane = dot(p, normalize(vec3(0, 1, 0)));
    //  Box/Object Mirroring
    //  Getting Second object for free
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    //  Once there is a shape on the negatuve side,
    //  it can be mirrored on the positive location
    // bp.x = abs(bp.x);
    // bp.x -= 1.0 ;
    //  Mirroring can also happen in all directions
    bp = abs(bp);
    bp -= 1.0;
    float scale = mix(1.0, 3.0, smoothstep(-1.0, 1.0, bp.y));
    bp.xz *= scale;
    bp.xz *= Rot(smoothstep(0.0, 1.0, bp.y));
    float box = sdBox(bp, vec3(1.0, 1.0, 1.0)) / scale;
    float d = min(plane, box);
    return d;
}

float GetDist(vec3 p)
{
    // float d = MakeBoxShell(p); //  distance result for shell
    //  Waves were caused by the displacement functions!
    //  float d = WavyPlane1(p);
    //  float d = WavyPlane2(p);
    //  float d = WavyPlane3(p);
    //  float d = DistortedBoxStatic(p);
    //  float d = DistortedBoxDynamic(p);
    //  float d = FlagEffectPseudo(p);
    //  float d = FlagEffectProper(p);
    //  float d = BoxScaleShaping(p);
    //  float d = BoxTwist1(p);
    //  float d = BoxTwistModulated(p);

    // float plane = dot(p, normalize(vec3(0, 1, 0)));
    float plane = p.y;

    //  Box/Object Mirroring/Folding around arbitrary axis!
    vec3 bp = p - vec3(0.0, 1.0, 0.0);
    
    //  arbitrarily rotating plane normal around which
    //  space will be folded
    // vec3 n = normalize(vec3(0.0, 1.0, 0.0)); // reflects top-bottom
    // vec3 n = normalize(vec3(1.0, 1.0, 0.0));    //  reflects along diagonal plane
    vec3 n = normalize(vec3(1.0, 1.0, 1.0));    //  reflects along diagonal plane
    bp -= 2.0 * n * min(0.0, dot(p, n));
    
    //  Can reflect on multiple acis to produce fractal-like shapes!
    n = -normalize(vec3(1.0, 0.0, 1.0));    //  reflects along diagonal plane
    bp -= 2.0 * n * min(0.0, dot(p, n));

    float scale = mix(1.0, 3.0, smoothstep(-1.0, 1.0, bp.y));
    bp.xz *= scale;

    bp.xz *= Rot(smoothstep(0.0, 1.0, bp.y));
    
    float box = sdBox(bp, vec3(1.0, 1.0, 1.0)) / scale;

    float d = box;
    // float d = min(plane, box);

    return d;
}


float RayMarch(vec3 ro, vec3 rd)
{
    float dO = 0.;
    for (int i=0; i < MAX_STEPS; i++)
    {
        //  start at origin and march certain distance dO in ray direction rd
        vec3 p = ro + rd * dO;
        //  get the distance of the point from scene along the ray direction
        float dS = GetDist(p);
        dO += dS;
        if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }
    return dO;
}

vec3 GetNormal(vec3 p)
{
    float d = GetDist(p);
    //  e.x is the small distance value
    vec2 e = vec2(.001, 0);

    vec3 n = d - vec3(
        GetDist(p - e.xyy),
        GetDist(p - e.yxy),
        GetDist(p - e.yyx)
    );

    return normalize(n);
}

float GetLight(vec3 p)
{
    vec3 lightPos = vec3(3.0, 5.0, 4.0);

    //  vector from p to light position
    vec3 l = normalize(lightPos - p);
    //  hence, the normal to p considers
    //  the points very close to p on that surface
    vec3 n = GetNormal(p);

    //  since the rsult is between -1 to 1, clamp it
    // float dif = dot(n, l);
    float dif = clamp(dot(n, l) * 0.5 + 0.5, 0.0, 1.0);

    //  Obtain soft shadow
    float d = RayMarch(p + n * SURF_DIST * 2.0, l);

    //  check if the distance is less than the distance from the point
    //  and the light source, verifying being in the shadow!
    // if (p.y < 0.01 && d < length(lightPos - p)) dif *= 0.5;

    return dif;
}

vec3 R(vec2 uv, vec3 p, vec3 l, float z)
{
    vec3 f = normalize(l - p),
        r = normalize(cross(vec3(0, 1, 0), f)),
        u = cross(f, r),
        c = p + f * z,
        i = c + uv.x * r + uv.y * u,
        d = normalize(i - p);
    return d;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    // float mouse_y =  u_mouse.y;
    // vec2 nm = vec2(mix(-1.0, 1.0, u_mouse.x / u_resolution.x), smoothstep(-1.0, 1.0, mouse_y / u_resolution.y));

    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = R(uv, ro, vec3(0, 0, 0), .7); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        float dif = GetLight(p);
        col = vec3(dif);
    }

    col = pow(col, vec3(0.4545));   //  gamma correction

    gl_FragColor = vec4(col, 1.0);
}