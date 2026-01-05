#version 330 core

//  Ep6 - Playing with Gyroids - Part 2

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 1e-3;

/**
    Demonstrating Creating Gyroids!
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

float sdGyroid(vec3 p, float scale, float thickoffset, float bias, vec2 freqratio)
{
    p *= scale;
    //  By multiplying the scale by the largest of freqratio X vs Y
    //  remove artefacts!
    return abs(dot(sin(p * freqratio.x), cos(p.zxy * freqratio.y)) - bias) / (scale * max(freqratio.x, freqratio.y)) - thickoffset;
}

float GetDist_Starter_To_Before_Moving_Animation(vec3 p)
{
    float box = sdBox(p - vec3(0, 0, 0), vec3(1));

    //  Further Bump Mapping
    float g1 = sdGyroid(p, 5.23, .03, 1.4, vec2(1.0, 1.0));
    float g2 = sdGyroid(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
    float g3 = sdGyroid(p, 20.76, .03, 0.3, vec2(1.0, 1.0));
    float g4 = sdGyroid(p, 35.76, .03, 0.3, vec2(1.0, 1.0));
    float g5 = sdGyroid(p, 60.76, .03, 0.3, vec2(1.0, 1.0));
    float g6 = sdGyroid(p, 110.76, .03, 0.3, vec2(1.0, 1.0));
    //  using g2 as the bumpmap for g1
    g1 -= g2 * .4;
    g1 -= g3 * .3;
    g1 += g4 * .2;
    g1 += g5 * .2;
    g1 += g6 * .3;

    //  View inside the Gyroid box!
    // float d = max(box, g1 * .8); //  Intersection

    //  View inside the Infinite Gyroid Tunnel!
    float d = g1 * .8;    //  see the gyroid without box!

    return d;
}

vec3 Transform_og(vec3 p)
{
    p.z -= u_time * 0.1;
    p.y -= .3;  //  moves vertically
    return p;
}

vec3 Transform(vec3 p)
{
    //  Added Twist
    p.xy *= Rot(p.z * 0.15);
    p.z -= u_time * 0.1;
    p.y -= .3;  //  moves vertically
    return p;
}

//  Demonstrating moving through tunnel by changing the surface point
float GetDist(vec3 p)
{
    //  This is an issue because it also moves the cracks
    // p.z -= u_time * 0.1; //  -= to move forward

    //  Better
    p = Transform(p);
    
    float box = sdBox(p - vec3(0, 0, 0), vec3(1));

    //  Further Bump Mapping
    float g1 = sdGyroid(p, 5.23, .03, 1.4, vec2(1.0, 1.0));
    float g2 = sdGyroid(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
    float g3 = sdGyroid(p, 20.76, .03, 0.3, vec2(1.0, 1.0));
    float g4 = sdGyroid(p, 35.76, .03, 0.3, vec2(1.0, 1.0));
    float g5 = sdGyroid(p, 60.76, .03, 0.3, vec2(1.0, 1.0));
    //  using g2 as the bumpmap for g1
    g1 -= g2 * .3;
    g1 -= g3 * .2;
    g1 += g4 * .1;
    g1 += g5 * .1;

    //  View inside the Gyroid box!
    // float d = max(box, g1 * .8); //  Intersection

    //  View inside the Infinite Gyroid Tunnel!
    float d = g1 * .8;    //  see the gyroid without box!

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
    //  modying the value e.x makes the result
    //  of the gyroid tunnel body smoother, more organic and natural
    //  whem it's increased e.g. from 1e-3 to 2e-2
    vec2 e = vec2(2e-2, 0);

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

void StarterGyroid()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    //  third argument is the lookat (now looking at origin)
    vec3 rd = GetRayDir(uv, ro, vec3(0, 0, 0), 2.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        
        // float dif = GetLight(p);
        // float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        // n.y makes light shine from straight above --- y component of normal `n` 
        float dif = n.y * 0.5 + 0.5;    //  * 0.5  + 0.5 to  map from 0 - 1
        col += dif * dif; //  difussed

        float g2 = sdGyroid(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.1;
        col *= smoothstep(-1.0, creasethickness, g2);
    }
    
    //  Rendering in 2D
    // col *= 0;
    d = sdGyroid(vec3(uv.x, uv.y, u_time * .1), 20., .01, 0.0, vec2(1.0, 1.0));
    // col += d * 10.0; //  No need for abs here anymore!

    col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}


void GyroidArts_GlowingCrevices()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    float t = u_time;
    
    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0, 0, 0), 1.5); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        
        // float dif = GetLight(p);
        // float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        // n.y makes light shine from straight above --- y component of normal `n` 
        float dif = n.y * 0.5 + 0.5;    //  * 0.5  + 0.5 to  map from 0 - 1
        col += dif * dif; //  difussed

        float g2 = sdGyroid(p, 10.76, 0.03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.1;
        //  darkens the crevices, adding more contrast
        col *= smoothstep(-0.1, creasethickness, g2);

        //  Highlighting cracks (white)
        //  smoothtep(a, b, g2)
        //  modify cracks'thickness (making it thinner) by moving value of a closer to b
        // float cracks = smoothstep(-0.01, -0.03, g2);
        // col += cracks;

        //  Highlighting cracks (colored)
        // float crackwidth = -0.015;
        // float cracks = smoothstep(crackwidth, -0.03, g2);
        // //  Rule: when multiplying by a color, don't let any of the components be zero
        // float brightness = 1.5;
        // col += cracks * vec3(1.0, 0.5, 0.1) * brightness;

        //  Make crackwidth Larger at the bottom facing parts (toward ligjt)
        //  than at the bottom facning parts 
        //  Uses smoothstep depending on normal's y value, and scaled by 0.02
        // float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.02;
        // float cracks = smoothstep(crackwidth, -0.03, g2);
        // //  Rule: when multiplying by a color, don't let any of the components be zero
        // float brightness = 1.5;
        // col += cracks * vec3(1.0, 0.5, 0.1) * brightness;

        //  Adding Animations 1
        // float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.04;
        // float cracks = smoothstep(crackwidth, -0.03, g2);
        // //  Rule: when multiplying by a color, don't let any of the components be zero
        // //  Note the time value modifying the position
        // float g3 = sdGyroid(p + t, 5.76, 0.03, 0.0, vec2(1.0, 1.0));
        // cracks *= g3 * 5.0; //  scale by 5.0 to make result bigger and effect of g3 less dark 

        // float brightness = 1.5;
        // col += cracks * vec3(1.0, 0.5, 0.1) * brightness;

        //  Adding Animations 2
        float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.04;
        float cracks = smoothstep(crackwidth, -0.03, g2);
        //  Rule: when multiplying by a color, don't let any of the components be zero
        //  Note the time value modifying the position
        float g3 = sdGyroid(p + t * 0.1, 5.76, 0.03, 0.0, vec2(1.0, 1.0));
        float g4 = sdGyroid(p + t * 0.05, 4.89, 0.03, 0.0, vec2(1.0, 1.0));

        //  The g3 and g4 modulate the light on and off to look smoother and less binary
        //  the * 20.0 makes the result brighter, and + 0.2 makes it that 
        //  the light doesn't go completely black (0) 
        // cracks *= g3 * g4 * 20.0 + 0.2;
        //  This smoothstep modification makes it that above .2, so 
        //  when the normal is pointing closer toward the light, it goes completely dark
        //  by at the bottom it doesn't!
        cracks *= g3 * g4 * 20.0 + 0.2 * smoothstep(0.2, 0.0, n.y);
        float brightness = 1.5;
        col += cracks * vec3(1.0, 0.5, 0.1) * brightness;
    }
    
    //  Rendering in 2D
    // col *= 0;
    d = sdGyroid(vec3(uv.x, uv.y, u_time * .1), 20., .01, 0.0, vec2(1.0, 1.0));
    // col += d * 10.0; //  No need for abs here anymore!

    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

vec3 Background_Fog_V1(vec3 rd)
{
    vec3 col = vec3(0);

    // Use ray direction to color the background
    // use the up-down components of the ray direction

    //  ray direction will be +1 when looking straight up
    //  -1 looking straight down, and 0 when looking at the horizon
    //  which is the centere of the screen!
    //  now, remap y from -1.0 to 1.0 to 0.0 - 1.0
    float y = rd.y * 0.5 + 0.5;

    //  simulating as though scene is a fire
    //  so it's brighter from below, hence (1.0 - y)
    col += (1.0 - y) * vec3(1.0, 0.4, 0.1) * 2.0;

    return col;
}

vec3 BackgroundOg_V2(vec3 rd)
{
    vec3 col = vec3(0);
    float t = u_time;

    float y = rd.y * 0.5 + 0.5;

    col += (1.0 - y) * vec3(1.0, 0.4, 0.1) * 2.0;

    //  Now, to get the compas directions
    //  to know N, S, E, W
    //  takes atan of X-Z plane
    //  giving an angle that goes from -PI (at front) to 0 (behind camera)
    //  back to PI (again at the front)
    float a = atan(rd.x, rd.z);
    // col = vec3(a);   //  visualize the 360 view

    //  use sine waves for rotating stripes!
    // col = vec3(sin(a * 10.0));  //  can visualize this! 

    //  Animate to Move
    // col = vec3(sin(a * 10.0 + t));

    //  Make more complex for illusion of random on and off
    //  Notice how the frequencies are made smaller!
    //  And note the time in different direction at `a * 7.0 - t`
    //  and that the last isn't moving at all
    // col = vec3(sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0));

    //  Make Flames
    // float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);
    // col += flames;
    // return col;

    //  Use smoothstep to make flames not extend to the top pole of the screen
    // float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);
    // flames *= smoothstep(0.8, 0.5, y);
    // col += flames;
    // //  To remove  bottom pole
    // // col = max(col, 0.0);    //  make the color never go negative
    // col += smoothstep(0.5, 0.0, y);
    // return col;

    float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);

    flames *= smoothstep(0.8, 0.5, y);  //  make top pole dark
    col += flames;
    //  make bottom poles light
    //  note the += smoothstep(..)
    col = max(col, 0.0);    
    col += smoothstep(0.05, 0.8, y);
    return col;
}

vec3 BackgroundMyBlueFlamePoles(vec3 rd)
{
    vec3 col = vec3(0);
    float t = u_time;

    float y = rd.y * 0.5 + 0.5;

    col += (1.0 - y) * vec3(1.0, 0.4, 0.1) * 2.0;
    
    float a = atan(rd.x, rd.z);

    float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);
    flames *= smoothstep(0.8, 0.5, y);
    col += flames;
    //  Make flames blue!!

    // col = 1.0 - max(col, 0.0);  //  makes flames blue!
    //  return col;

    col = max(col, 0.0);
    col += smoothstep(0.5, 0.0, y);
    return 1.0 - col;    //  Blue flames, dark poles
}

vec3 BackgroundMyDarkFlamePoles(vec3 rd)
{
    vec3 col = vec3(0);
    float t = u_time;

    float y = rd.y * 0.5 + 0.5;

    col += (1.0 - y) * vec3(1.0, 0.4, 0.1) * 2.0;

    float a = atan(rd.x, rd.z);

    float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);
    //  Make pole flames dark!
    flames *= smoothstep(0.9, 0.5, y);  //  makes top pole dark
    col += flames;
    //  note the *= smoothstep(0.05, 0.8, y);
    //  meaning multiply by the value such that when y is lower
    //  than or equal to 0.05 (bottom pole), let the result be 0.0 (dark)
    //  but greater than 0.8, let it be 1.0
    col = max(col, 0.0);
    col *= smoothstep(0.05, 0.8, y);
    return col;
}

//  With Flames
vec3 Background(vec3 rd)
{
    vec3 col = vec3(0);
    float t = u_time;

    float y = rd.y * 0.5 + 0.5;

    // col += (1.0 - y) * vec3(1.0, 0.4, 0.1) * 2.0;   //  Red
    col += (1.0 - y) * vec3(.1, .4, 1.0) * 2.0; //  Blue

    float a = atan(rd.x, rd.z);
    // col = vec3(a);   //  visualize the 360 view\

    float flames = sin(a * 10.0 + t) * sin(a * 7.0 - t) * sin(a * 6.0);
    //  Make pole flames dark!
    flames *= smoothstep(0.9, 0.5, y);
    col += flames;
    col = max(col, 0.0);
    col += smoothstep(0.3, 0.0, y);
    return col;
}

void GyroidArts_BeforeDistory()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    float t = u_time;
    
    vec3 col = vec3(0);
    
    //  setting up camera

    //  Viewing inside the gyroid.
    //  Consider the changes to `ro` and `lookat`
    vec3 ro = vec3(0, 0, -0.03);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);
    
    vec3 lookat = vec3(0, 0, 0);
    vec3 rd = GetRayDir(uv, ro, lookat, 0.8); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);

        float  height = p.y;

        //  Transform the Position
        p = Transform(p);

        float dif = n.y * 0.5 + 0.5;    //  * 0.5  + 0.5 to  map from 0 - 1
        col += dif * dif; //  difussed

        float g2 = sdGyroid(p, 10.76, 0.03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.1;
        //  darkens the crevices, adding more contrast
        col *= smoothstep(-0.1, creasethickness, g2);

        //  Adding Animations 2
        float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.04;
        float cracks = smoothstep(crackwidth, -0.03, g2);
        //  Rule: when multiplying by a color, don't let any of the components be zero
        //  Note the time value modifying the position
        float g3 = sdGyroid(p + t * 0.1, 5.76, 0.03, 0.0, vec2(1.0, 1.0));
        float g4 = sdGyroid(p + t * 0.05, 4.89, 0.03, 0.0, vec2(1.0, 1.0));

        cracks *= g3 * g4 * 20.0 + 0.2 * smoothstep(0.2, 0.0, n.y);
        float brightness = 1.5;
        vec3 orange = vec3(1.0, 0.4, 0.1);
        col += cracks * orange * brightness;

        //  Add Flickering Lights
        //  Make them move straight up
        float g5 = sdGyroid(p - vec3(0.0, t, 0.0), 3.76, 0.03, 0.0, vec2(1.0));

        col += g5 * orange;

        //  Add Glow as movmeent goes downwards
        col += smoothstep(0.0, -2.0, height) * orange;
    }

    //  Add Fog in Background
    // col = Background(rd);    //  View fog background

    //  Now, blend background based on distance from the camera
    col = mix(col, Background(rd), smoothstep(0.0, 7.0, d));

    // col = Background(rd);
    
    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);   
}

void GyroidHeatDistoryHighRes()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    float t = u_time;
    
    vec3 col = vec3(0);

    //  heat distortion
    uv += sin(uv * 20.0);
    
    //  setting up camera

    //  Viewing inside the gyroid.
    //  Consider the changes to `ro` and `lookat`
    vec3 ro = vec3(0, 0, -0.03);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);
    
    vec3 lookat = vec3(0, 0, 0);
    vec3 rd = GetRayDir(uv, ro, lookat, 0.8); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);

        float  height = p.y;

        //  Transform the Position
        p = Transform(p);

        float dif = n.y * 0.5 + 0.5;    //  * 0.5  + 0.5 to  map from 0 - 1
        col += dif * dif; //  difussed

        float g2 = sdGyroid(p, 10.76, 0.03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.1;
        //  darkens the crevices, adding more contrast
        col *= smoothstep(-0.1, creasethickness, g2);

        //  Adding Animations 2
        float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.04;
        float cracks = smoothstep(crackwidth, -0.03, g2);
        //  Rule: when multiplying by a color, don't let any of the components be zero
        //  Note the time value modifying the position
        float g3 = sdGyroid(p + t * 0.1, 5.76, 0.03, 0.0, vec2(1.0, 1.0));
        float g4 = sdGyroid(p + t * 0.05, 4.89, 0.03, 0.0, vec2(1.0, 1.0));

        cracks *= g3 * g4 * 20.0 + 0.2 * smoothstep(0.2, 0.0, n.y);
        float brightness = 1.5;
        vec3 orange = vec3(1.0, 0.4, 0.1);
        col += cracks * orange * brightness;

        //  Add Flickering Lights
        //  Make them move straight up
        float g5 = sdGyroid(p - vec3(0.0, t, 0.0), 3.76, 0.03, 0.0, vec2(1.0));

        col += g5 * orange;

        //  Add Glow as movmeent goes downwards
        col += smoothstep(0.0, -2.0, height) * orange;
    }

    //  Add Fog in Background
    // col = Background(rd);    //  View fog background

    //  Now, blend background based on distance from the camera
    col = mix(col, Background(rd), smoothstep(0.0, 7.0, d));

    // col = Background(rd);
    
    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

//  Gyroid display with material
void main()
{
    
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    float t = u_time;
    
    vec3 col = vec3(0);

    //  heat distortion, reduced res with * 1e-2
    //  and added motion with 20.0 + t
    uv += sin(uv * 20.0 + t) * 1e-2;
    
    //  setting up camera

    //  Viewing inside the gyroid.
    //  Consider the changes to `ro` and `lookat`
    vec3 ro = vec3(0, 0, -0.03);
    ro.yz *= Rot(-nm.y * 3.14 + 1.0);
    ro.xz *= Rot(-nm.x * 6.2831);
    
    vec3 lookat = vec3(0, 0, 0);
    vec3 rd = GetRayDir(uv, ro, lookat, 0.8); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);

        float  height = p.y;

        //  Transform the Position
        p = Transform(p);

        float dif = n.y * 0.5 + 0.5;    //  * 0.5  + 0.5 to  map from 0 - 1
        col += dif * dif; //  difussed

        float g2 = sdGyroid(p, 10.76, 0.03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.1;
        //  darkens the crevices, adding more contrast
        col *= smoothstep(-0.1, creasethickness, g2);

        //  Adding Animations 2
        float crackwidth = -0.02 + smoothstep(0.0, -0.5, n.y) * 0.04;
        float cracks = smoothstep(crackwidth, -0.03, g2);
        //  Rule: when multiplying by a color, don't let any of the components be zero
        //  Note the time value modifying the position
        float g3 = sdGyroid(p + t * 0.1, 5.76, 0.03, 0.0, vec2(1.0, 1.0));
        float g4 = sdGyroid(p + t * 0.05, 4.89, 0.03, 0.0, vec2(1.0, 1.0));

        cracks *= g3 * g4 * 20.0 + 0.2 * smoothstep(0.2, 0.0, n.y);
        float brightness = 1.5;
        // vec3 color = vec3(1.0, 0.4, 0.1);    //  red
        vec3 color = vec3(0.1, 0.4, 1.0);   //  blue
        col += cracks * color * brightness;

        //  Add Flickering Lights
        //  Make them move straight up
        float g5 = sdGyroid(p - vec3(0.0, t, 0.0), 3.76, 0.03, 0.0, vec2(1.0));

        col += g5 * color;

        //  Add Glow as movmeent goes downwards
        col += smoothstep(0.0, -2.0, height) * color;
    }

    //  Add Fog in Background

    //  Now, blend background based on distance from the camera
    col = mix(col, Background(rd), smoothstep(0.0, 7.0, d));
    
    //  Add Vignette: Gives more focus on screen center!
    //  or length(uv) is the distance
    //  dot(uv, uv) is the squared distance
    col *= 1.0 - dot(uv, uv);
    
    // col = Background(rd);    //  View fog background

    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}