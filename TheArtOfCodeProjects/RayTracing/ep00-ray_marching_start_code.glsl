#version 330 core

//  From: https://www.shadertoy.com/view/wdGGz3

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 1e-3;

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

/**
    New box sdf function

    Probably updated to reflect inside distance consideration
    just like the `i` value used in the cylinder!
*/
float sdBox(vec3 p, vec3 s)
{
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

float GetDist(vec3 p)
{
    float plane = p.y;
    float box = sdBox(p - vec3(0, 0, 0), vec3(1));
    float d = min(box, plane);

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

//  The last parameter is the zoom factor -- higher it is, more it zooms in
vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z)
{
    vec3 f = normalize(l - p),
        r = normalize(cross(vec3(0, 1, 0), f)),
        u = cross(f, r),
        c = p + f * z,
        i = c + uv.x * r + uv.y * u,
        d = normalize(i - p);
    return d;
}

//  Can also Be:
//  notice the change int the `c` and `d` values
vec3 GetRayDir2(vec2 uv, vec3 p, vec3 l, float z)
{
    vec3 f = normalize(l - p),
        r = normalize(cross(vec3(0, 1, 0), f)),
        u = cross(f, r),
        c = f * z,
        i = c + uv.x * r + uv.y * u,
        d = normalize(i);
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

    // vec3 ro = vec3(0, 4, -5);
    // ro.yz *= Rot(-nm.y + .4);
    // ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);

    vec3 ro = vec3(0.0, 3.0, -3.0);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);
    
    //  The last parameter is the zoom factor -- higher it is, more it zooms in
    vec3 rd = GetRayDir(uv, ro, vec3(0, 0, 0), 1.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        // vec3 n = GetNormal(p);
        // float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        // col += dif * dif;   //  or col = vec3(dif * dif)
        
        float dif = GetLight(p);
        col = vec3(dif);
    }

    col = pow(col, vec3(0.4545));   //  gamma correction

    gl_FragColor = vec4(col, 1.0);
}