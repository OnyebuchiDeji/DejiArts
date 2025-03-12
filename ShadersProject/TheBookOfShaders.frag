#version 330 core

/**
    Date: Fri-27-Dec-2024

    Chapter 6: Generative Designs; The use of Random

    Next Chapter: Noise
    This is better than ordinary use of random, adding correlation and thus natural aesthetics
    to the random values generated, as Noise stores memory of the previous state.

    Hence noise is a smooth and natural-looking way of creating computational chaos.
*/


// #define PI 3.14159265358979323846
#define PI 3.1415926535
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;


//  -------------------------------------------------------------------------
//          THE UTIL FUNCTIONS
//  -------------------------------------------------------------------------
float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

float plot_line(vec2 st, float pct, float w)
{
    //  w is the width/thickness of the line -- choose 0.01 or 0.02
    return smoothstep(pct - w, pct, st.y) - smoothstep(pct, pct + w, st.y);
}

vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

//  ---------------------------------------------------------------

/**
    EG2: Applying Matrices on Patterns
        Author @patriciogv - 2015 (patriciogonzalezvivo.com) - 2015
    
    Shows how to transform the shapes rendered in each cell of the grid
    to make a unique pattern
*/

//---------------TRANSFORM FUNCTIONS-----------------/

vec2 rotate2D(in vec2 _st, float _angle)
{
    _st -= 0.5;
    _st = mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 translate2D(in vec2 _st, vec2 translate_v)
{
    _st += translate_v;
    return _st;
}

/**
    Date: Monday-27-jan-2024
    
    Scaling actually works in a weirder way according to how
    the coordinate space works.
    If you multiply by a larger number, the screen space is divided
    so the shape becomes smaller.
    So if I'm to properly implement the scales, I have to multiply
    by the inverse.
*/
vec2 scale2D(vec2 _st, vec2 _scale)
{
    _st -= vec2(0.5);
    mat2 scale_mat = mat2(1 / _scale.x, 0.0, 0.0, 1 / _scale.y);
    _st = scale_mat * _st;
    _st += vec2(0.5);
    return _st;
}

//---------------------------------------------------

//----------------SHAPE FUNCTIONS----------------------/

float polygon(in vec2 _st, vec2 _pos, int _n)
{
    float d = 0.0;

    //  Remap space according to x and y offset
    float x_diff = (_pos.x - 0.5) + 1.0;
    float y_diff = (_pos.y - 0.5) + 1.0;
    _st.x = _st.x * 2.0 - x_diff;
    _st.y = _st.y * 2.0 - y_diff;

    //  Number of Sides of Shape
    int N = _n;

    //  Angle and radius from the current pixel
    float a = atan(_st.x, _st.y) +  PI;
    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(_st);

    float p_out = 1.0 - smoothstep(.4, .41, d);
    
    return p_out;
}

float box(in vec2 _st, in vec2 _size)
{
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}

float cross(in vec2 _st, float _size)
{
    //  Two boxes aginst each other. Same center, different widths.
    return box(_st, vec2(_size, _size/4.)) + box(_st, vec2(_size/4., _size));
}


float curve_corner_square(in vec2 _st, in vec2 _size, float _smoothEdges, float cornerLength)
{
    vec2 size1 = vec2(0.5) - _size*0.5;
    vec2 aa = vec2(_smoothEdges * 0.5);
    vec2 uv1 = smoothstep(size1, size1 + aa, _st);
    uv1 *= smoothstep(size1, size1 + aa, vec2(1.0) - _st);
    
    //  normalize to between 0 and 1
    cornerLength = smoothstep(0.0, 1.0, cornerLength);

    vec2 size2 = vec2(0.5) - (_size + vec2(cornerLength))*0.5;
    _st = rotate2D(_st, PI * 0.25);
    
    vec2 uv2 = smoothstep(size2, size2 + aa, _st);
    uv2 *= smoothstep(size2, size2 + aa, vec2(1.0) - _st);
    // uv2 = vec2(1.0) - uv2;

    vec2 fuv = uv1 * uv2;

    return fuv.x * fuv.y;
}

//------------------------------------------------------

//----------------RANDOM FUNCTIONS--------------------/

float random(vec2 st)
{
    //  These values can be changed:
    float k1 = 12.9898;
    float k2 = 78.233;
    float k3 = 43758.5453123;
    return fract(sin(dot(st.xy, vec2(k1, k2))) * k3);
}

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
//---------------------------------------------------/

/**
    Date: Thursday-23-January-2025 --- Monday-27-Jan-2025
    
    Noise

    The concept of noise is around blending or interpolating through random values between
    one random point and another bery close random point.
*/

void tests()
{
    vec2 st = ((gl_FragCoord.xy / u_resolution) * 0.5) - u_resolution.y;
    float y = rand(st.x);
    //y = sqrt(rand(st.x));
    //y = pow(rand(st.x), 5.0);

    gl_FragColor = vec4(vec3(y), 1.0);
}

/**
*   The below is a mimic of perlin noise:
*/

void noise_mimic()
{
    vec2 st = gl_FragCoord.xy / u_resolution;

    vec3 color = vec3(0.0);
    
    //  Change in Point P
    float pD = 1.0;
    
    float i = floor(st.x);
    float f = fract(st.x);
    float y = rand(i);


    //  This interpolates each random value linearly
    //  It interpolates between the current interger point and the next one.
    //  This is linear because it uses the linearly increasing float values of the screen space.
    //y = mix(rand(i), rand(i + pD), f);

    //  Smoothstep creates smooth interpolation between these random points.
    //  This is the basis of Noise.
    
    //  This interpolates through each one subically using smoothstep.
    //y = mix(rand(i), rand(i + pD), smoothstep(0.0, 1.0, f));

    //  Here is a custom cubic curve like smoothstep
    float u = f * f * (3.0 - 2.0 * f);
    y = mix(rand(i), rand(i + pD), u);

    color = vec3(y);

    gl_FragColor = vec4(color, 1.0);
}

//----------------------------------------------------/
/**
    Quests:
        1.  Use own noise function that takes in and returns a single float.
        2.  Use the noise function to animate a shape by moving it, rotating it and or scaling it.
        3.  Make an animated composition of several shapes dancing together using noise.
        4.  Create organic-looking shapes using noise functions.
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
void noise_bara_v1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    float i = floor(st.x);
    float f = fract(st.x);

    //  Noise Rotation
    //  This proves that the smaller dx is, the better
    //  However 1.0 is the best.
    // st = vec2(DNC(st.x, 1.0), DNC(st.y, 1.0));
    st = rotate2D(st, DNC(u_time, 1.0));
    // st = rotate2D(st, DNC(u_time, 2.0));
    // st = rotate2D(st, DNC(u_time, 0.5));

    
    vec2 translate = vec2(DNC(u_time, 1.0), DNC(u_time, 1.0));
    // float val = DNC(u_time, 1.0);
    // vec2 translate = vec2(val, val);
    st += translate * DNC(sin(u_time), 1.0);

    st = scale2D(st, vec2(DNC(u_time, 1.0)));

    color = vec3(cross(st, 0.5));
    

    gl_FragColor = vec4(color, 1.0);
}

/**
    Animated Shape Composition
*/
void noise_bara_v2_animation_composition()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);
    float rows = 5;
    float cols = 5;
    st *= vec2(rows, cols);

    float index = 0.0;
    index += step(1.0, mod(st.x, 2.0));
    index += step(1.0, mod(st.y, 2.0)) * 2.0;

    st = fract(st);

    vec2 translate = vec2(DNC(u_time, 1.0), DNC(u_time, 1.0));
    st += translate * DNC(sin(u_time), 1.0);
    st += translate * sin(u_time);

    st = rotate2D(st, DNC(u_time, 1.0));

    st = scale2D(st, vec2(1.5));
    st = scale2D(st, vec2(DNC(u_time, 1.0)));

    if (index == 0.0){
        //  Draw a square
        color = vec3(box(st, vec2(0.7)));
    }
    else if(index == 1.0){
        color = vec3(cross(st, 0.5));
    }
    else if (index == 2.0){
        color = vec3(polygon(st, vec2(0.5), 3));
    }
    else if (index == 3.0){
        color = vec3(polygon(st, vec2(0.5), 5));
    }
    else if(index == 4.0)
    {
        color = vec3(polygon(st, vec2(0.5), 6));
    }

    float col_t1 = sin(u_time * PI);
    float col_t2 = sin(u_time) * cos(u_time);
    float col_t3 = pow(sin(u_time), 2);
    color = (1 - color.x) * vec3(col_t1 * 0.02, col_t3 * 0.3, col_t2 * 0.01) + (color.x) * vec3(col_t1 * 0.5, col_t1 * 0.6, col_t3 * 0.2);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Organic Shapes
*/
float organic_box_plain(in vec2 _st, in vec2 _size)
{

    //  Consider this warp - 1
    //  Consider this with the _size norm before
    _size = vec2(0.5) - _size*0.5;
    // _size.x += DNC(_size.x * pow(sin(_st.x + _st.y), 1.5), 2.0);
    // _size.y += DNC(_size.y * pow(sin(_st.x + _st.y), 1.5), 2.0);

    //  Conside with _size norm after
    // _size.x += DNC(_size.x * pow(sin(_st.x + _st.y), 1.5), 2.0);
    // _size.y += DNC(_size.y * pow(sin(_st.x + _st.y), 1.5), 2.0);
    _size = vec2(0.5) - _size*0.5;
    
    _size = vec2(0.5) - _size*0.5;
    // _size.x += DNC(_size.y * pow(sin(_st.x + _st.y), 100.), 1.0);
    // _size.y += DNC(_size.y * pow(sin(_st.x + _st.y), 100.), 1.0);

    // _size.x += DNC(_size.y * pow(sin(_st.x + _st.y), 100.), 1.0);
    // _size.y += DNC(_size.y * pow(sin(_st.x + _st.y), 100.), 1.0);
    // _size = vec2(0.5) - _size*0.5;


    // _size = vec2(0.5) - _size*0.5;
    // _size.x += DNC(sin(pow(_st.x * _st.y, 2)), 1.0); 
    // _size.y += DNC(sin(pow(_st.x * _st.y, 2)),1.0); 

    // _size.x += DNC(sin(pow(_st.x * _st.y, 2)), 1.0); 
    // _size.y += DNC(sin(pow(_st.x * _st.y, 2)),1.0); 
    // _size = vec2(0.5) - _size*0.5;


    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}

float organic_box_plain_v2(in vec2 _st, in vec2 _size)
{
    // _size = vec2(0.5) - _size*0.5;

    // _size.x += _size.x + DNC(_size.x * pow(sin(_st.x + _st.y), 1.5), 2.0);
    // _size.y += _size.y + DNC(_size.y * pow(sin(_st.x + _st.y), 1.5), 2.0);

    // _size.x += _size.x + DNC(_size.x * pow(sin(_st.x + _st.y), cos(u_time)), 2.0);
    // _size.y += _size.y + DNC(_size.y * pow(sin(_st.x + _st.y), cos(u_time)), 2.0);

    //  Pree this flashing effect because of the 1/pow(sin)
    // _size.x += DNC(1 / pow(sin(u_time), 2), 1.0) + DNC(_size.x * pow(sin(_st.x + _st.y), 1.5), 2.0);
    // _size.y += DNC(1 / pow(sin(u_time), 2), 1.0) + DNC(_size.y * pow(sin(_st.x + _st.y), 1.5), 2.0);

    //  Pree this completely new thing!
    // _size = vec2(0.5) - _size*0.5;   //  Before
    // _size.x = DNC(pow(sin(_st.x + _st.y), 2.), 0.1) + DNC(_size.x * pow(sin(_st.x + _st.y), 1.5), .1);
    // _size.y = DNC(pow(sin(_st.x + _st.y), 2.), 0.1) + DNC(_size.y * pow(sin(_st.x + _st.y), 1.5), .1);
    // _size = vec2(0.5) - _size*0.5;   //  After


    //  Pree this fractal-like repeating pattern
    _size.x = DNC(DNC(_st.x, 2.0) * DNC(u_time, 1.0), 1.0);
    _size.y = DNC(DNC(_st.y, 2.0) * DNC(u_time, 1.0), 1.0);
    _size = vec2(0.5) - _size*0.5;
    
    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;
}

float organic_box_plain_v3(in vec2 _st, in vec2 _size)
{
    _size.x = _size.x + DNC(floor(_st.x), 1.0) * DNC(u_time , 1.0);
    _size.y = _size.y + DNC(floor(_st.y), 1.0) * DNC(u_time * 0.03, 1.0);

    _size = vec2(0.5) - _size*0.5;
    
    vec2 uv = step(_size, _st);
    uv *= step(_size, vec2(1.0) - _st);

    return uv.x * uv.y;

    // return DNC(DNC(_st.x, 1.0), 1.0);
}


float organic_box_smooth(in vec2 _st, in vec2 _size)
{
    _size = vec2(0.5) - _size*0.5;

    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}

float polygon_organic(in vec2 _st, vec2 _pos, int _n)
{
    float d = 0.0;

    //  Remap space according to x and y offset
    float x_diff = (_pos.x - 0.5) + 1.0;
    float y_diff = (_pos.y - 0.5) + 1.0;
    _st.x = _st.x * 2.0 - x_diff;
    _st.y = _st.y * 2.0 - y_diff;
    // _st *= DNC(_st.x * _st.y, 1.0);
    // _st *= 3.0;

    //  Number of Sides of Shape
    int N = _n;

    //  Angle and radius from the current pixel
    // float a = atan(_st.x, _st.y) + DNC(_st.x , 1.0) +  PI ;
    // float a = atan(_st.x, _st.y) * DNC(_st.x , 1.0) +  PI ;
    // float a = atan(_st.x, _st.y) +  PI + DNC(_st.x , 1.0) ;
    // float a = atan(_st.x, _st.y) +  PI * DNC(_st.x , 1.0) ;

    //  Just This -- pree cool badge effect.
    // float a = atan(_st.x * DNC(_st.y, 1.0), _st.y * DNC(_st.x, 1.0)) +  PI;
    // float a = atan(_st.x + DNC(_st.y, 1.0), _st.y + DNC(_st.x, 1.0)) +  PI;

    //  This is close to the target
    // float a = atan(_st.x, _st.y ) +  PI + DNC(TWO_PI * _st.y * _st.x, 1.0) * 0.5;
    //  This is close but not as close as the recent/prior
    // float a = atan(_st.x, _st.y ) +  PI * DNC(TWO_PI * _st.y * _st.x, 1.0);

    // float a = atan(_st.x, _st.y ) + PI + DNC(TWO_PI * _st.y * _st.x, 1.0) * 0.5;

    //  An eye?
    // float a = DNC(TWO_PI + _st.x * _st.y, 1.0) * atan(_st.x, _st.y ) + PI;
    //  What is dat?
    // float a = DNC(TWO_PI * _st.x * _st.y, 1.0) * atan(_st.x, _st.y ) + PI;

    //  Another Pattern
    // float a = DNC(pow(_st.x * _st.y, 0.5), 1.0) * 0.5 + atan(_st.x, _st.y ) + PI;

    // float a = DNC(pow(_st.x * _st.y, 10), 1.0) * 0.5 + atan(_st.x, _st.y ) + PI;
    float a = atan(_st.x, _st.y ) + PI;


    //  These are where the effects start to be seen clearly.
    // float r = (TWO_PI / float(N)) * DNC(_st.x, 1.0);
    // float r = (TWO_PI / float(N)) DNC(_st.x, 1.0);
    // float r = (TWO_PI / float(N)) * sin(DNC(TWO_PI *_st.x * u_time, 1.0));
    // float r = (TWO_PI / float(N)) + DNC(TWO_PI *_st.x, 1.0);
    // float r = (TWO_PI / float(N)) + DNC(TWO_PI *_st.x + u_time, 1.0);
    // float r = (TWO_PI / float(N)) + DNC(TWO_PI *_st.x * u_time, 1.0);

    // float r = (TWO_PI / float(N)) * DNC(TWO_PI *_st.y * _st.x, 1.0);

    // float r = (TWO_PI * DNC(TWO_PI *_st.y * _st.x, 1.0)/ float(N)) ;

    float r = TWO_PI / float(N);

    //  Shaping Function that modulates the distance
    d = cos(floor(0.5 + a/r) * r - a) * length(_st * DNC(_st.x, 1.0)) ;

    // float dr = DNC(_st.x * _st.y, 1.0);
    // float p_out = 1.0 - smoothstep(.4 + dr, .41 + dr, d);
    // float dr = DNC(_st.x, 1.0);
    // float p_out = 1.0 - smoothstep(.4, .41, d + dr);
    // float dr = DNC(_st.x, 1.0);
    float p_out = 1.0 - smoothstep(.4, .41, d);
    
    return p_out;
}

void bara_organic_shapes_test()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    // color = vec3(organic_box_plain(st, vec2(0.7)));
    // color = vec3(organic_box_plain_v3(st, vec2(0.7)));
    // color = vec3(organic_box_smooth(st, vec2(0.7)));
    color = vec3(polygon_organic(st, vec2(0.5), 4));

    gl_FragColor = vec4(color, 1.0);
}

void main()
{
    // noise_mimic();
    // noise_bara_v1();
    // noise_bara_v2_animation_composition();
    bara_organic_shapes_test();
}