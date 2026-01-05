#version 330 core

//  Ep5 - Playing with Gyroids - Part 1

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

float GyroidOriginalVisualization(vec3 p)
{
    //  Gyroid Formula
    float gyroid = dot(sin(p), cos(p.zxy));
    return gyroid;
}

float BoxCarvedGyroid(vec3 p)
{
    float box = sdBox(p - vec3(0, 1, 0), vec3(1));
    //  Gyroid Formula
    //  View Gyroid Inside The Box
    //  By using the Gyroid to Carve The Box
    float gyroid = dot(sin(p), cos(p.zxy));

    float d = max(box, gyroid); //  Intersection
    return d;
}

/**
 *  Gyroid Formula
 *  View Gyroid Inside The Box
 *  by using the Gyroid to Carve The Box
 *  and then scale the Gyroid using p
*/
float sdGyroid_v1(vec3 p, float scale)
{
    p *= scale;
    return dot(sin(p), cos(p.zxy)) / scale;
}

/**
    Produces a surface of 0 thickness, and produces
    errors which we visualize
*/
float sdGyroidNeg(vec3 p, float scale)
{
    p *= scale;
    return abs(dot(sin(p), cos(p.zxy))) / scale;
}

/**
    Bias affects the render leasing to a kind of Lattice structure
*/
float sdGyroid(vec3 p, float scale, float thickoffset, float bias)
{
    p *= scale;
    return abs(dot(sin(p), cos(p.zxy)) - bias) / scale - thickoffset;
}

float sdGyroidPattern(vec3 p, float scale, float thickoffset, float bias, vec2 freqratio)
{
    p *= scale;
    //  By multiplying the scale by the largest of freqratio X vs Y
    //  remove artefacts!
    return abs(dot(sin(p * freqratio.x), cos(p.zxy * freqratio.y)) - bias) / (scale * max(freqratio.x, freqratio.y)) - thickoffset;
}

float GetDist(vec3 p)
{
    float box = sdBox(p - vec3(0, 1, 0), vec3(1));

    // float d = GyroidOriginalVisualization(p);
    // float d = BoxCarvedGyroid(p);

    // float gyroid = sdGyroid(p, 8.);
    // float gyroid = sdGyroidNeg(p, 8.);
    // float gyroid = sdGyroid(p, 8., .05, 1.0);
    // float gyroid = sdGyroidPattern(p, 8., .05, 1.0, vec2(2.0, 1.5));


    //  Interlocking 1
    // float g1 = sdGyroidPattern(p, 5., .03, 1.3, vec2(1.0, 1.0));
    // float g2 = sdGyroidPattern(p + vec3(3.0, 0.0, 0.0), 5., .03, 1.3, vec2(1.0, 1.0));
    // float g = min(g1, g2);  //  union
    // float d = max(box, g * .8); //  Intersection
    
    //  Interlocking 2: 1 normal + 1 dilated
    // float g1 = sdGyroidPattern(p, 5., .03, 0.3, vec2(1.0, 1.0));
    // float g2 = sdGyroidPattern(p, 10., .03, 1.3, vec2(1.0, 1.0));
    // float g = min(g1, g2);  //  union
    // float d = max(box, g * .8); //  Intersection

    //  Subtraction 1 and 2
    // float g1 = sdGyroidPattern(p, 5., .03, 0.3, vec2(1.0, 1.0));
    // float g2 = sdGyroidPattern(p, 10., .03, 1.3, vec2(1.0, 1.0));
    // float g = max(-g1, g2);     //  subtraction: first from second
    // float g = max(g1, -g2);     //  subtraction: second from first
    // float d = max(box, g * .8); //  Intersection

    //  Bump mapping
    //  To make more organic-looking bumpmaps, ensure the 3rd parameter
    //  for the following gyroids being used have numbers that are not easy
    //  multiples of one another
    // float g1 = sdGyroidPattern(p, 5.23, .03, 1.4, vec2(1.0, 1.0));
    // float g2 = sdGyroidPattern(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
    // //  using g2 as the bumpmap for g1
    // g1 += g2 * .3;

    //  Further Bump Mapping
    float g1 = sdGyroidPattern(p, 5.23, .03, 1.4, vec2(1.0, 1.0));
    float g2 = sdGyroidPattern(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
    float g3 = sdGyroidPattern(p, 20.76, .03, 0.3, vec2(1.0, 1.0));
    float g4 = sdGyroidPattern(p, 35.76, .03, 0.3, vec2(1.0, 1.0));
    float g5 = sdGyroidPattern(p, 60.76, .03, 0.3, vec2(1.0, 1.0));
    //  using g2 as the bumpmap for g1
    g1 -= g2 * .3;
    g1 -= g3 * .2;
    g1 += g4 * .1;
    g1 += g5 * .1;

    //  The gyroid * .7 is to modify the stepsize to accomodate the
    //  gyroid_neg_thickness effect. The thinner the gyroid thickness,
    //  the smaller the factor (e.g. .7) below should be
    float d = max(box, g1 * .8); //  Intersection

    d = g1 * .8;    //  see the gyroid without box!


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

/**
    The dark lines are called the Zero Isolines

    Here, because some negative values are also black
    it's not accurate
*/
void ViewGyroid2D_Norm(vec2 uv, inout vec3 col)
{
    col *= 0.; //   clear screen
    //  Viewing the Gyroid Swirls
    float d = sdGyroid_v1(vec3(uv.x, uv.y, 0.0), 10.0);
    col += d * 7.0;
}

/**
    Here, the Zero Isolines are made thicker
    and the abs is used to make the non-zero values positive
    effectively properly showing the Zero Isolines
    and affecting the thickness with `thickOffset`
*/
void ViewGyroid2D_NormThicker(vec2 uv, inout vec3 col, float thickoffset)
{
    col *= 0.; //   clear screen
    //  Viewing the Gyroid Swirls
    float d = sdGyroid_v1(vec3(uv.x, uv.y, 0.0), 10.0);
    col += abs(d) * 7.0 - thickoffset;
}

/**
    Viewing Different Slicies at Different Time Periods
    Shows Rotation of Point Color Spaces
*/
void ViewGyroid2D_DynamicNorm(vec2 uv, inout vec3 col)
{
    col *= 0.; //   clear screen
    float d = sdGyroid_v1(vec3(uv.x, uv.y, u_time * .1), 10.0);
    col += d * 7.0;
}
/**
    Viewing Different Slicies at Different Time Periods
    Shows Rotation of Point Color Spaces
    But Extenuates the Black Stripe patterns by removing negative values
    "negating" the render 
*/
void ViewGyroid2D_DynamicNeg(vec2 uv, inout vec3 col)
{
    col *= 0.; //   clear screen
    float d = sdGyroid_v1(vec3(uv.x, uv.y, u_time * .1), 10.0);
    col += abs(d * 7.0);
}

void ViewGyroid2D_WithBias(vec2 uv, inout vec3 col)
{
    col *= 0;
    //  This also contributes to the final 3d render 
    float d = sdGyroid(vec3(uv.x, uv.y, u_time * .1), 10., .01, .0);
    col += d * 10.0; //  No need for abs here anymore!
}

void GyroidCreationComplete1()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;
    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0, 1, 0), 2.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        float dif = GetLight(p);
        //  OR
        // float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        col = vec3(dif);
    }

    // ViewGyroid2D_Norm(uv, col);
    // ViewGyroid2D_NormThicker(uv, col, 0.2);
    // ViewGyroid2D_DynamicNorm(uv, col);
    // ViewGyroid2D_DynamicNeg(uv, col);
    // ViewGyroid2D_WithBias(uv, col);

    //  Rendering in 2D
    // col *= 0;
    //  Rendering using sin-cos size/frequency ratios to change patterns!
    //  Scale increases the size of render space and size_ratio (or frequency) affects frequency of change!
    d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 10., .01, 1.0, vec2(2.0, 2.5));
    // col += d * 10.0; //  No need for abs here anymore!

    //  The gamma correction affects the output image quality alot
    //  positively!
    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void GyroidCreation_Normal_Colored()
{
    //  Gyroid display with material
    
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0, 1, 0), 2.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        // col += vec3(dif);
        //  Basic Coloring
        col += n;
        //  Or Better:
        col += n * 0.5  + 0.5;
    }
    //  Rendering in 2D
    // col *= 0;
    //  Rendering using sin-cos size/frequency ratios to change patterns!
    //  Scale increases the size of render space and size_ratio (or frequency) affects frequency of change!
    d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 10., .01, 1.0, vec2(2.0, 2.5));
    // col += d * 10.0; //  No need for abs here anymore!

    //  The gamma correction affects the output image quality alot
    //  positively!
    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void GyroidCreation_Better_Colored()
{

    //  Gyroid display with material
    
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 4, -5);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0, 1, 0), 2.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        // col += vec3(dif);
        //  Basic Coloring
        col += n * 0.5  + 0.5;
        float g2 = sdGyroidPattern(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
        
        // col *= g2 * 10.0;   //  Next Cool Method
        
        //  Working toward ambient occlusion
        //  If g2 is smaller than 0, output 0
        //  If between 0 and .1 then it goes from 0 -> 1.0
        //  Past .1, it stays at 1.0
        //  Creases still show --- ambient occlusion doesn't show
        //  increasing `creasethickness` makes dark creases more apparent
        // float creasethickness = 0.1;
        // col *= smoothstep(0, creasethickness, g2);

        //  Proper ambient occlusion
        float creasethickness = 0.06;
        col *= smoothstep(-1.0, creasethickness, g2);
    }
    //  Rendering in 2D
    // col *= 0;
    //  Rendering using sin-cos size/frequency ratios to change patterns!
    //  Scale increases the size of render space and size_ratio (or frequency) affects frequency of change!
    // d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 10., .01, 1.0, vec2(2.0, 2.5));
    d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 20., .01, 0.0, vec2(1.0, 1.0));
    // col += d * 10.0; //  No need for abs here anymore!

    //  The gamma correction affects the output image quality alot
    //  positively!
    // col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void GyroidCreationFinal()
{
//  Gyroid display with material
    
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float mouse_y = u_resolution.y - u_mouse.y;
    vec2 nm = vec2(u_mouse.x, mouse_y) / u_resolution;

    vec3 col = vec3(0);
    
    //  setting up camera

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-nm.y + .4);
    ro.xz *= Rot(u_time * .2 - nm.x * 6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0, 1, 0), 2.0); 
    
    //  find if ray intersection occurs for that pixel and color to draw
    float d = RayMarch(ro, rd);

    //  for visualization
    if (d < MAX_DIST)
    {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        // float dif = GetLight(p);
        float dif = dot(n, normalize(vec3(1, 2, 3))) * 0.5 + 0.5;
        // col += vec3(dif);
        //  Basic Coloring
        col += n * 0.5  + 0.5;
        float g2 = sdGyroidPattern(p, 10.76, .03, 0.3, vec2(1.0, 1.0));
        
        //  Proper ambient occlusion
        float creasethickness = 0.06;
        col *= smoothstep(-0.1, creasethickness, g2);
    }
    //  Rendering in 2D
    // col *= 0;
    //  Rendering using sin-cos size/frequency ratios to change patterns!
    //  Scale increases the size of render space and size_ratio (or frequency) affects frequency of change!
    // d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 10., .01, 1.0, vec2(2.0, 2.5));
    d = sdGyroidPattern(vec3(uv.x, uv.y, u_time * .1), 20., .01, 0.0, vec2(1.0, 1.0));
    // col += d * 10.0; //  No need for abs here anymore!

    //  The gamma correction affects the output image quality alot
    //  positively!
    col = pow(col, vec3(0.4545));   //  gamma correction
    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    //  The normal gyroid display --- no textures
    // GyroidCreationComplete1();
    // GyroidCreation_Better_Colored();
    GyroidCreationFinal();
}