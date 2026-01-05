#version 330 core

//  Ep000 - Ray Marching Operators --- Complete
//  From: https://www.shadertoy.com/view/3ssGWj

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 1e-3;

mat2 Rot(float a)
{
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float smin(float a, float b, float k)
{
    float h = clamp( 0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    t = clamp(t, 0.0, 1.0);

    vec3 c = a + t * ab;

    return length(p - c) - r;
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap ) / dot(ab, ab);
    // t = clamp(t, 0.0, 1.0);  //  no clamping of t

    vec3 c = a + t * ab;

    float x = length(p - c) - r;
    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0.0));
    float i = min(max(x, y), 0);    //  for inside distance correction

    return e + i;
}

float sdTorus(vec3 p, vec2 r)
{
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

float dBox(vec3 p, vec3 s)
{
    p = abs(p) - s;
    return length(max(p, 0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

float GetDist(vec3 p)
{
    float t = u_time;

    //  ground plane
    float pd = p.y; //  plane dist

    //  rotating box
    vec3 bp = p;    //  box position
    bp -= vec3(0.0, 0.75, 3.0);
    bp.xz *= Rot(t);    //  rotation
    float bd_rotate = dBox(bp, vec3(.75));  //  box distance

    //  jumping torus
    float y = -fract(t) * (fract(t) - 1.0);     //  repeating parabola
    vec3 tp = p;    //  torus pisition
    tp -= vec3(-2.0, 0.8 + 3.0 * y, -4.0);  //  translate
    float squash = 1.0 + smoothstep(0.15, 0.0, y) * 0.5;    //  scale
    tp.y *= squash;
    tp = tp.xzy;    //  flip torus on its side
    float td_scale = sdTorus(tp, vec2(1.0, 0.25)) / squash; //  torus distance

    float box_sphere_morph = mix(
        length(p - vec3(4.0, 1.0, 2.0)) - 1.0,
        dBox(p - vec3(4.0, 1.0, 2.0), vec3(1.0, 1.0, 1.0)),
        sin(t) * 0.5 + 0.5
    );

    float box_sphere_subtract = max(
        -dBox(p - vec3(1.0 + sin(t) * 0.5, 1.0, 0.0), vec3(1.0, 0.5, 2.0)),
        length(p - vec3(0.0, 1.0, 0.0)) - 1.0
    );

    float box_sphere_intersect = max(
        dBox(p - vec3(sin(u_time) * 0.5, -3.0, 1.0), vec3(1.0, 0.5, 2.0)),
        length(p - vec3(-4.0, 1.0, 0.0)) - 1.0
    );

    float spheres_blend = smin(
        length(p - vec3(3.0, 1.0, -3.0)) - 0.75,
        length(p - vec3(3.0 + sin(t), 1.5, -3.0)) - 0.5,
        0.2
    );

    float d = min(box_sphere_morph, pd);
    d = min(d, box_sphere_subtract);
    d = min(d, box_sphere_intersect);
    d = min(d, bd_rotate);
    d = min(d, td_scale);
    d = min(d, spheres_blend);

    return d;
}

float RayMarch(vec3 ro, vec3 rd)
{
    float dO = 0;
    for (int i=0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + rd * dO;
        float dS = abs(GetDist(p));
        dO += dS;
        if (dO > MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    return dO;
}

vec3 GetNormal(vec3 p)
{
    float d = GetDist(p);
    vec2 e = vec2(1e-3, 0.0);
    return normalize(
        d - vec3(
            GetDist(p - e.xyy),
            GetDist(p - e.yxy),
            GetDist(p - e.yyx)
        )
    );
}

float GetLight(vec3 p)
{
    vec3 lightPos = vec3(3.0, 5.0, 4.0);
    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);
    //  diffuse lighting values moved to be
    //  between range 0.0 -> 1.0
    float dif = clamp(dot(n, l) * 0.5 + 0.5, 0.0, 1.0);
    float d = RayMarch(p + n * SURF_DIST * 2.0, l);
    if (p.y < 0.01 && d < length(lightPos - p)) dif *= 0.5;
    return dif;
}

/**
    uv - current screen pixel coordinates
    p - ray origin
    l - look at
    z - zoom
*/
vec3 CamViewRays(vec2 uv, vec3 p, vec3 l, float z)
{
    vec3 f = normalize(l - p),  //  get normalized look at vector from origin
        r = normalize(cross(vec3(0.0, 1.0, 0.0), f)),   //  get right vector of camera using global up (0.0, 1.0, 0.0)
        u = cross(f, r),    //  get camera up vector using look at and right vector
        c = p + f * z,      //  move certain zoom value along look at vector
        i = c + uv.x * r + uv.y * u,    //  map screen coordinates to now zoomed in virtual camera coordinates
        d = normalize(i - p);   //  normalize new screen-as-camera coordinates as unit vector directions
    return d;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y; //  flip mouse y coordinates due to pygame's coord system
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0.0);

    vec3 ro = vec3(0.0, 4.0, -5.0);
    ro.yz *= Rot(-nm.y + 0.4);
    ro.xz *= Rot(u_time * 0.2 - nm.x * 6.2831);

    vec3 rd = CamViewRays(uv, ro, vec3(0.0, 0.0, 0.0), .7);

    float d = RayMarch(ro, rd);

    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        // vec3 n = GetNormal(p);
        // float dif = dot(n, normalize(vec3(1.0, 2.0, 3.0))) * 0.5 + 0.5;
        // col += dif * dif;   //  or col = vec3(dif * dif)

        float dif = GetLight(p);
        // col = vec3(dif);
    }

    col = pow(col, vec3(0.4545));   //  gamma correction

    gl_FragColor = vec4(col, 1.0);
}