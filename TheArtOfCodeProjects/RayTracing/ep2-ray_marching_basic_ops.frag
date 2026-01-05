#version 330 core

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;



int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 0.001;

/**
    Demonstrating RayMarching Operators
*/

mat2 Rot(float a)
{
    float s = sin(a); float c = cos(a);
    return mat2(c, -s, s, c);
}


float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    //  get point c
    vec3 c = a + t * ab;
     
    // x is d for the capsul
    float x = length(p - c) - r;

    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0));

    //  without interior distance, there'll be artefacts!
    float i = min(max(x, y), 0);

    return e + i;
}

float sdBox(vec3 p, vec3 s)
{
    return length(max(abs(p) - s, 0));
}


float sdTorus(vec3 p, vec2 r)
{
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
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

//  Translationm,rotation, scale
float GetDist_EG1(vec3 p)
{
    float pd = p.y;

    //  moving objects
    vec3 bp = vec3(0., 1., 0.);
    float bd = sdBox(p, vec3(.75));
    
    //  also, order of operation has different effects

    //  so doing the translation before 
    //  rotation makes the shape rotate around its axis
    bp -= vec3(2, 1, 0); //  translation

    //  can also rotate around both axes
    bp.xz *= Rot(u_time);   //  rotate around y-axis
    // bp.yz *= Rot(u_time);   //  rotate around x-axis

    //  so doing the translation affter 
    //  rotation makes the shape rotate around the origin bp
    // bp -= vec3(2, 1, 0); //  translation
    
    //  moving sphere
    vec3 sp = p;
    sp -= vec3(0, 1, 0);    //  translation
    sp *= vec3(2, 2, 1);    //  scaling 
    float sd = length(sp) - 1.0;

    //  scaling makes the distance field in some directions
    //  to be stretched affecting the marching, causing artefacts
    //  to fix this, divide the final distance by the largest amount used
    //  to scale any of the directions by --- in this case, for the box, 4
    float d = min(sd / 2, pd);

    return d;
}

/**
    Boolean Operations

    Boolean Subtraction:
        `d = max(-dA, dB)`
    Boolean Intersection:
        `d = max(dA, dB)`
    Boolean Union or Addition:
        `d = min(dA, dB)`
        minimum of either is taken so we never
        step into either object
    Boolean Smooth Min:
        uses smoothestep or mix functions
    
*/

float smin(float a, float b, float k)
{
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float GetDist(vec3 p)
{
    float pd = p.y;

    //  moving objects
    vec3 bp = p;
    bp -= vec3(0, 1, 0); //  translation
    bp.xz *= Rot(u_time);

    float bd = sdBox(bp, vec3(1));

    //  moving sphere
    
    float sdA = length(p - vec3(0, 1, 0)) - 1.;
    float sdB = length(p - vec3(1, 1, 0)) - 1.;

    // float sd = min(sdA, sdB); //  addition or union
    // float sd = max(-sdA, sdB);  //  subtraction
    // float sd = max(sdA, sdB);  //  intersection
    // float sd = smin(sdA, sdB, .2);  //  makes the intersection edge smooth

    // float sd = smin(sdA, bd, .4);

    //  live shape blending
    //  sphere-to-cube-to-sphere
    float sd = mix(sdA, bd, sin(u_time) * 0.5 + 0.5);

    //  scaling makes the distance field in some directions
    //  to be stretched affecting the marching, causing artefacts
    //  to fix this, divide the final distance by the largest amount used
    //  to scale any of the directions by --- in this case, for the box, 4
    float d = min(sd, pd);
    
    // float td = sdTorus(p - vec3(0, .5, 6), vec2(1.5, .2));
    // float cd = sdCapsule(p, vec3(-1, 1, 6), vec3(1, 2, 6), .2);
    // float cyld = sdCylinder(p, vec3(0.0, 0.35, 3), vec3(2, 0.35, 5), .3);
    
    // d = min(d, cd);
    // d = min(d, td);
    // d = min(d, sd);
    // d = min(d, cyld);


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
        if (dO > MAX_DIST || dS < SURF_DIST) break;
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
    if (p.y < 0.01 && d < length(lightPos - p)) dif *= 0.5;

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