#version 330 core

/**
    Date: Monday-31-March-2025

    After discovering the wobbly square noise implementation

    The 1D noise function here does not give as good as effect
    as the 2D noise formula used inn the `quest_shaders` wobbly_square implementation.
*/

#define PI 3.1415926535
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;



float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

/**
    1D Random Hash Function
*/
float rand(float x)
{
    return fract(sin(x) * 100000.0);
}

float rand2(float x)
{
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(vec2(x), vec2(k1, k2))) * k3);
}

float rand2B(float x)
{
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(vec2(x), vec2(k1, k2))) * k3);
}

float rand2C(float x)
{
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    float v = dot(vec2(x), vec2(k1, k2));
    return fract(sin(v) * k3);
}

/**
    1D Noise
*/
float DNC(float x, float dx)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand(i), rand(i + dx), u);
}

float DNC2(float x, float dx)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand2(i), rand2(i + dx), u);
}
float DNC3(float x, float dx)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand2B(i), rand2B(i + dx), u);
}
float DNC4(float x, float dx)
{
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand2C(i), rand2C(i + dx), u);
}

//------------------------------------------------


float organic_box_plain(in vec2 _st, in vec2 _size)
{

    float halfSize = _size.x * 0.5;

    float n1 = DNC(_st.x * 1.0 + u_time, 1.0);
    float n2 = DNC(_st.y * 1.0 + u_time, 1.0);

    //  Generates cool looking fractal-like
    // halfSize = halfSize + n1 * n2;

    //  This is it!
    halfSize += halfSize * n1 * n2;
    
    _size = vec2(0.5) - halfSize;

    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}

float organic_box_plain_v2(in vec2 _st, in vec2 _size)
{

    float halfSize = _size.x * 0.5;

    float n1 = DNC2(_st.x * 1.0 + u_time, 1.0);
    float n2 = DNC2(_st.y * 1.0 + u_time, 1.0);

    //  Generates something different.
    halfSize = halfSize + n1 * n2;

    //  This is it!
    // halfSize += halfSize * n1 * n2;
    
    _size = vec2(0.5) - halfSize;

    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}
float organic_box_plain_v3(in vec2 _st, in vec2 _size)
{

    float halfSize = _size.x * 0.5;

    float n1 = DNC3(_st.x * 1.0 + u_time, 1.0);
    float n2 = DNC3(_st.y * 1.0 + u_time, 1.0);

    //  Generates something different.
    // halfSize = halfSize + n1 * n2;

    //  This is it!
    halfSize += halfSize * n1 * n2;
    
    _size = vec2(0.5) - halfSize;

    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}

float organic_box_plain_v4(in vec2 _st, in vec2 _size)
{

    float halfSize = _size.x * 0.5;

    float n1 = DNC4(_st.x * 1.0 + u_time, 1.0);
    float n2 = DNC4(_st.y * 1.0 + u_time, 1.0);

    //  Generates something differnet.
    // halfSize = halfSize + n1 * n2;

    //  This is it!
    halfSize += halfSize * n1 * n2;
    
    _size = vec2(0.5) - halfSize;

    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}


void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;
    //  Preserve Aspect Ratio
    uv.x *= u_resolution.x / u_resolution.y;

    // vec3 col = vec3(organic_box_plain(uv, vec2(0.5)));
    // vec3 col = vec3(organic_box_plain_v2(uv, vec2(0.5)));
    // vec3 col = vec3(organic_box_plain_v3(uv, vec2(0.5)));
    vec3 col = vec3(organic_box_plain_v4(uv, vec2(0.5)));

    
    gl_FragColor = vec4(col, 1.0);
}